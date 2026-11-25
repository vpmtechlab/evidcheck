const fs = require('fs');
const path = require('path');
const { jsPDF } = require('jspdf');

class PDFDocumentBuilder {
  constructor(title, docRef, classification = 'Confidential / Regulatory Submission') {
    this.title = title;
    this.docRef = docRef;
    this.classification = classification;
    this.doc = new jsPDF({ unit: 'pt', format: 'a4' });
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.marginLeft = 50;
    this.marginRight = 50;
    this.marginTop = 60;
    this.marginBottom = 60;
    this.contentWidth = this.pageWidth - this.marginLeft - this.marginRight;
    this.y = this.marginTop;
    this.primaryColor = [15, 23, 42]; // Slate 900
    this.accentColor = [2, 132, 199]; // Sky 600
    this.textColor = [51, 65, 85];    // Slate 700
    this.mutedColor = [100, 116, 139]; // Slate 500
    this.lineColor = [226, 232, 240]; // Slate 200
  }

  checkPageBreak(neededHeight) {
    if (this.y + neededHeight > this.pageHeight - this.marginBottom) {
      this.doc.addPage();
      this.y = this.marginTop;
      return true;
    }
    return false;
  }

  addHeaderBlock(companyName, docTitle, meta = {}) {
    // Header bar
    this.doc.setFillColor(...this.primaryColor);
    this.doc.rect(this.marginLeft, this.y, this.contentWidth, 60, 'F');

    this.doc.setTextColor(255, 255, 255);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(16);
    this.doc.text(companyName.toUpperCase(), this.marginLeft + 16, this.y + 24);

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    this.doc.setTextColor(224, 242, 254);
    this.doc.text(docTitle.toUpperCase(), this.marginLeft + 16, this.y + 44);

    this.y += 75;

    // Metadata card
    this.doc.setFillColor(248, 250, 252);
    this.doc.setDrawColor(...this.lineColor);
    this.doc.roundedRect(this.marginLeft, this.y, this.contentWidth, 60, 4, 4, 'FD');

    const metaKeys = Object.keys(meta);
    const colWidth = this.contentWidth / 2;

    this.doc.setFontSize(9);
    metaKeys.forEach((key, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const xPos = this.marginLeft + 16 + (col * colWidth);
      const yPos = this.y + 20 + (row * 20);

      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(...this.mutedColor);
      this.doc.text(key + ':', xPos, yPos);

      const labelWidth = this.doc.getTextWidth(key + ': ');
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(...this.primaryColor);
      this.doc.text(String(meta[key]), xPos + labelWidth, yPos);
    });

    this.y += 75;
  }

  addSectionHeading(number, title) {
    this.checkPageBreak(45);
    this.y += 8;

    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(12);
    this.doc.setTextColor(...this.primaryColor);
    const headingText = `${number}. ${title.toUpperCase()}`;
    this.doc.text(headingText, this.marginLeft, this.y);

    this.y += 4;
    this.doc.setDrawColor(...this.accentColor);
    this.doc.setLineWidth(1.5);
    this.doc.line(this.marginLeft, this.y, this.marginLeft + this.contentWidth, this.y);
    this.y += 14;
  }

  addSubheading(title) {
    this.checkPageBreak(30);
    this.y += 4;
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(10.5);
    this.doc.setTextColor(...this.primaryColor);
    this.doc.text(title, this.marginLeft, this.y);
    this.y += 12;
  }

  addParagraph(text) {
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9.5);
    this.doc.setTextColor(...this.textColor);

    const lines = this.doc.splitTextToSize(text, this.contentWidth);
    const neededHeight = lines.length * 13;
    this.checkPageBreak(neededHeight + 6);

    lines.forEach((line) => {
      this.checkPageBreak(14);
      this.doc.text(line, this.marginLeft, this.y);
      this.y += 13;
    });

    this.y += 6;
  }

  addBullet(label, text, indent = 12) {
    this.doc.setFontSize(9.5);
    const bulletPrefix = '• ';
    const bulletWidth = this.doc.getTextWidth(bulletPrefix);

    const fullText = label ? `${label}: ${text}` : text;
    const lines = this.doc.splitTextToSize(fullText, this.contentWidth - indent - bulletWidth);
    const neededHeight = lines.length * 13;
    this.checkPageBreak(neededHeight + 4);

    this.doc.setTextColor(...this.accentColor);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(bulletPrefix, this.marginLeft + indent, this.y);

    lines.forEach((line, index) => {
      this.checkPageBreak(14);
      const textX = this.marginLeft + indent + bulletWidth;

      if (index === 0 && label) {
        this.doc.setTextColor(...this.primaryColor);
        this.doc.setFont('helvetica', 'bold');
        const lWidth = this.doc.getTextWidth(label + ': ');
        this.doc.text(label + ': ', textX, this.y);

        this.doc.setTextColor(...this.textColor);
        this.doc.setFont('helvetica', 'normal');
        this.doc.text(line.replace(label + ': ', ''), textX + lWidth, this.y);
      } else {
        this.doc.setTextColor(...this.textColor);
        this.doc.setFont('helvetica', 'normal');
        this.doc.text(line, textX, this.y);
      }
      this.y += 13;
    });

    this.y += 4;
  }

  addCallout(title, body) {
    this.doc.setFontSize(9.5);
    const bodyLines = this.doc.splitTextToSize(body, this.contentWidth - 28);
    const boxHeight = 28 + (bodyLines.length * 13);
    this.checkPageBreak(boxHeight + 10);

    this.doc.setFillColor(240, 249, 255); // Sky 50
    this.doc.setDrawColor(...this.accentColor);
    this.doc.setLineWidth(1);
    this.doc.roundedRect(this.marginLeft, this.y, this.contentWidth, boxHeight, 4, 4, 'FD');

    // Accent left stripe
    this.doc.setFillColor(...this.accentColor);
    this.doc.rect(this.marginLeft, this.y, 4, boxHeight, 'F');

    let innerY = this.y + 16;
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...this.primaryColor);
    this.doc.text(title.toUpperCase(), this.marginLeft + 16, innerY);

    innerY += 13;
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...this.textColor);
    bodyLines.forEach((line) => {
      this.doc.text(line, this.marginLeft + 16, innerY);
      innerY += 13;
    });

    this.y += boxHeight + 10;
  }

  addSignatures(sig1, sig2) {
    const boxHeight = 85;
    this.checkPageBreak(boxHeight + 20);

    this.y += 10;
    this.doc.setDrawColor(...this.lineColor);
    this.doc.setLineWidth(1);
    this.doc.line(this.marginLeft, this.y, this.marginLeft + this.contentWidth, this.y);
    this.y += 20;

    const colWidth = (this.contentWidth - 40) / 2;

    [sig1, sig2].forEach((sig, idx) => {
      const colX = this.marginLeft + (idx * (colWidth + 40));
      let currentY = this.y;

      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(8.5);
      this.doc.setTextColor(...this.mutedColor);
      this.doc.text(sig.prefix || 'Prepared & Reviewed by:', colX, currentY);

      currentY += 28;
      this.doc.setDrawColor(...this.mutedColor);
      this.doc.line(colX, currentY, colX + colWidth - 20, currentY);

      currentY += 14;
      this.doc.setFont('helvetica', 'bold');
      this.doc.setFontSize(9.5);
      this.doc.setTextColor(...this.primaryColor);
      this.doc.text(sig.name, colX, currentY);

      currentY += 12;
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(8.5);
      this.doc.setTextColor(...this.mutedColor);
      this.doc.text(sig.role + ', ' + sig.org, colX, currentY);

      currentY += 12;
      this.doc.text('Date: ' + sig.date, colX, currentY);
    });

    this.y += boxHeight;
  }

  finalizeAndSave(filePath) {
    const totalPages = this.doc.internal.getNumberOfPages();

    for (let p = 1; p <= totalPages; p++) {
      this.doc.setPage(p);

      // Running Header (Pages > 1)
      if (p > 1) {
        this.doc.setFont('helvetica', 'normal');
        this.doc.setFontSize(8);
        this.doc.setTextColor(...this.mutedColor);
        this.doc.text(
          `EVIDCHECK LIMITED  |  ${this.title.toUpperCase()}  |  REF: ${this.docRef}`,
          this.marginLeft,
          36
        );
        this.doc.setDrawColor(...this.lineColor);
        this.doc.setLineWidth(0.5);
        this.doc.line(this.marginLeft, 42, this.marginLeft + this.contentWidth, 42);
      }

      // Running Footer
      this.doc.setDrawColor(...this.lineColor);
      this.doc.setLineWidth(0.5);
      this.doc.line(
        this.marginLeft,
        this.pageHeight - 38,
        this.marginLeft + this.contentWidth,
        this.pageHeight - 38
      );

      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(8);
      this.doc.setTextColor(...this.mutedColor);
      this.doc.text(
        `Classification: ${this.classification}`,
        this.marginLeft,
        this.pageHeight - 26
      );

      const pageText = `Page ${p} of ${totalPages}`;
      const pageTextWidth = this.doc.getTextWidth(pageText);
      this.doc.text(pageText, this.marginLeft + this.contentWidth - pageTextWidth, this.pageHeight - 26);
    }

    const buffer = Buffer.from(this.doc.output('arraybuffer'));
    fs.writeFileSync(filePath, buffer);
    console.log(`Generated: ${path.basename(filePath)} (${(buffer.length / 1024).toFixed(1)} KB)`);
  }
}

// -------------------------------------------------------------
// 1. GENERATE INFORMATION SECURITY POLICY
// -------------------------------------------------------------
function generateISP() {
  const builder = new PDFDocumentBuilder(
    'Information Security Policy',
    'EVC-POL-ISP-2026-V1.0',
    'Confidential / Regulatory Submission'
  );

  builder.addHeaderBlock('EvidCheck Limited', 'Information Security Policy (ISP)', {
    'Document Ref': 'EVC-POL-ISP-2026-V1.0',
    'Statutory Framework': 'Kenya Data Protection Act, 2019 / ISO 27001',
    'Effective Date': '24th November 2026',
    'Review Cycle': 'Annual / Continuous Oversight'
  });

  builder.addSectionHeading('1', 'Policy Statement & Objective');
  builder.addParagraph(
    'EvidCheck Limited ("EvidCheck", "the Company") is fully committed to upholding the highest levels of confidentiality, integrity, and availability across all information assets, client screening workflows, and national identity validation interfaces. This Information Security Policy establishes binding administrative safeguards, technical standards, and operational controls to defend the platform against unauthorized access, disclosure, compromise, disruption, or destruction.'
  );

  builder.addSectionHeading('2', 'Purpose & Scope');
  builder.addParagraph(
    'This policy governs all digital systems, cloud clusters, backend servers, database storage, source repositories, and telecommunication links operated by EvidCheck Limited. It applies without exception to all directors, employees, contracted engineers, and external integrations, with specific mandatory compliance required for integrations with the Integrated Population Registration Services (IPRS) Directorate.'
  );

  builder.addSectionHeading('3', 'Security Governance & Operational Roles');
  builder.addBullet('Chief Technology Officer (CTO)', 'Holds primary technical responsibility for infrastructure hardening, mutual cryptographic authentication, network isolation, and technical vulnerability mitigation.');
  builder.addBullet('Data Protection Officer (DPO)', 'Maintains independent statutory oversight, orchestrates Data Protection Impact Assessments (DPIA), and liaises directly with the Office of the Data Protection Commissioner (ODPC).');
  builder.addBullet('Internal Staff & Operators', 'Obligated to uphold credential hygiene, adhere to strict role separation, and operate under clean desk and clean screen regulations.');

  builder.addSectionHeading('4', 'Access Control & Authentication Architecture');
  builder.addBullet('Role-Based Access Control (RBAC)', 'Access to verification administration, candidate files, and transactional audit trails is granted strictly under the principle of least privilege.');
  builder.addBullet('Mandatory Multi-Factor Authentication (MFA)', 'Time-Based One-Time Password (TOTP) Multi-Factor Authentication is enforced across all internal administrative, developer, and operations accounts. Password-only authentication is strictly blocked.');
  builder.addBullet('Credential Security at Rest', 'All user authentication secrets and passwords are encrypted using modern adaptive salted hashing algorithms (bcrypt/Argon2). Cleartext credentials are never stored or logged.');
  builder.addBullet('API Key Hashing', 'Enterprise client API keys are cryptographically hashed using SHA-256 at rest. Plaintext keys are presented once during initialization and cannot be extracted from database storage.');

  builder.addSectionHeading('5', 'Network Security & Dedicated IPRS Linkage');
  builder.addParagraph(
    'All communications between EvidCheck production servers and the IPRS Gateway are conducted over dedicated, encrypted Site-to-Site IPsec VPN tunnels or Mutual TLS (mTLS) channels anchored to fixed, statically whitelisted IP addresses. Direct public internet routing of national population registry API endpoints is strictly prohibited. Production infrastructure is shielded behind enterprise Web Application Firewalls (WAF) featuring real-time DDoS mitigation, rate limiting, and intrusion detection.'
  );

  builder.addCallout(
    'Mandatory Zero-Caching Policy for National Registry Data',
    'In strict accordance with national security directives and IPRS integration guidelines, EvidCheck maintains a ZERO LOCAL PERSISTENCE architecture for raw national population registry records. Lookups to IPRS are point-in-time comparisons returning binary match indicators (MATCH / MISMATCH / NOT_FOUND). Raw demographic files and biometric registry records are never cached, replicated, or stored on local servers.'
  );

  builder.addSectionHeading('6', 'Data Cryptography Standards');
  builder.addBullet('Data in Transit', 'Enforced TLS 1.3 cryptographic transport across all external HTTPS APIs, internal microservices, and management sessions.');
  builder.addBullet('Data at Rest', 'All persistent database tables, identity metadata, and secure indexes are encrypted using AES-256 cryptographic standards.');
  builder.addBullet('Key Management', 'Cryptographic keys are rotated on regular schedules, separated from application code, and held in secure dedicated secret vaults.');

  builder.addSectionHeading('7', 'Immutable Audit Trails & Forensic Logging');
  builder.addParagraph(
    'EvidCheck records every query transaction in a tamper-evident audit log. Each logged transaction captures: synchronized NTP timestamp, requesting organization ID, authenticated operator ID, declared verification purpose, cryptographic user consent hash, and response status code. Audit logs are preserved for seven (7) years to guarantee forensic traceability and non-repudiation.'
  );

  builder.addSectionHeading('8', 'Incident Response & Statutory Breach Notification');
  builder.addParagraph(
    'EvidCheck operates an active Incident Response Protocol to isolate, investigate, and remediate anomalous security events. Pursuant to Section 43 of the Kenya Data Protection Act (2019), EvidCheck guarantees that the Office of the Data Protection Commissioner (ODPC) and affected data subjects will be formally notified within seventy-two (72) hours of confirming any security incident involving unauthorized access or compromise of personal data.'
  );

  builder.addSignatures(
    { name: 'Chief Technology Officer (CTO)', role: 'Chief Technology Officer', org: 'EvidCheck Limited', date: '24th November 2026', prefix: 'Prepared & Endorsed by:' },
    { name: 'Managing Director / CEO', role: 'Managing Director', org: 'EvidCheck Limited', date: '24th November 2026', prefix: 'Approved on Behalf of Board:' }
  );

  const dest = path.join(process.cwd(), 'EvidCheck_Information_Security_Policy.pdf');
  builder.finalizeAndSave(dest);
}

// -------------------------------------------------------------
// 2. GENERATE DATA PRIVACY & PROTECTION POLICY
// -------------------------------------------------------------
function generateDPP() {
  const builder = new PDFDocumentBuilder(
    'Data Privacy & Protection Policy',
    'EVC-POL-DPP-2026-V1.0',
    'Confidential / Regulatory Submission'
  );

  builder.addHeaderBlock('EvidCheck Limited', 'Data Privacy & Protection Policy', {
    'Document Ref': 'EVC-POL-DPP-2026-V1.0',
    'Statutory Basis': 'Kenya Data Protection Act, 2019',
    'Effective Date': '24th November 2026',
    'Supervisory Authority': 'Office of the Data Protection Commissioner (ODPC)'
  });

  builder.addSectionHeading('1', 'Introduction & Statutory Commitment');
  builder.addParagraph(
    'EvidCheck Limited ("EvidCheck", "we", "us") operates an automated background verification and Know Your Customer (KYC) screening platform. As a registered Data Controller and Data Processor under the Office of the Data Protection Commissioner (ODPC), EvidCheck is committed to safeguarding the constitutional right to privacy of every individual under Article 31(c) and (d) of the Constitution of Kenya and the Data Protection Act (2019).'
  );

  builder.addSectionHeading('2', 'Foundational Principles of Data Protection');
  builder.addParagraph(
    'In strict accordance with Section 3 and Part IV of the Kenya Data Protection Act, EvidCheck embeds the following fundamental principles into its core operations:'
  );
  builder.addBullet('Lawfulness, Fairness & Transparency', 'Personal data is processed strictly on legitimate legal grounds with clear communication to the individual.');
  builder.addBullet('Purpose Limitation', 'Data is collected exclusively for explicit, specified due diligence screening and is never repurposed without separate authorization.');
  builder.addBullet('Data Minimization', 'EvidCheck limits data processing to what is strictly adequate, relevant, and necessary to execute identity corroboration.');
  builder.addBullet('Accuracy & Quality', 'Identity checks rely directly on authoritative sources of truth (such as IPRS) to ensure candidate records are reliable and current.');
  builder.addBullet('Storage Limitation', 'Personal records are retained only as long as strictly required by contract and statutory regulations.');

  builder.addSectionHeading('3', 'Mandatory Prior Consent Framework');
  builder.addCallout(
    'Strict Prior Consent Requirement',
    'EvidCheck strictly enforces a prior-consent prerequisite. No national identity query, criminal record check, or educational verification will ever be dispatched through the IPRS system or external registries without explicit, voluntary, and unambiguous consent obtained directly from the data subject.'
  );
  builder.addParagraph(
    'Consent is captured via cryptographically signed digital consent agreements (through our Candidate Verification Portal) or physical consent documents uploaded by accredited clients. Every consent event records the candidate’s name, national ID, timestamp, IP address, and stated verification scope.'
  );

  builder.addSectionHeading('4', 'Purpose Specification & Strict Non-Commercialization');
  builder.addParagraph(
    'Identity data queried from IPRS is utilized solely for identity verification—corroborating that the applicant is the legitimate holder of the credentials presented. EvidCheck strictly prohibits the sale, lease, distribution, commercial aggregation, or external monetization of any citizen identity information obtained through IPRS integrations.'
  );

  builder.addSectionHeading('5', 'Data Subject Rights & Operational Procedures');
  builder.addParagraph(
    'In accordance with Part IV of the Act, EvidCheck guarantees and facilitates the full exercise of data subject rights:'
  );
  builder.addBullet('Right to be Informed', 'Candidates are fully notified of the nature and intent of the screening prior to commencement.');
  builder.addBullet('Right of Access', 'Individuals may request a complete copy of their completed verification dossier.');
  builder.addBullet('Right to Rectification', 'Mechanisms are established to allow individuals to dispute and correct inaccurate or outdated information.');
  builder.addBullet('Right to Erasure (Right to be Forgotten)', 'Data subjects may request the deletion of non-statutory records once the verification requirement lapses.');
  builder.addBullet('Right to Object', 'Individuals retain the right to decline automated profiling without human review.');

  builder.addSectionHeading('6', 'Data Retention, Disposal & Cross-Border Governance');
  builder.addBullet('Retention Schedule', 'Completed screening reports are retained for the duration of the hiring or onboarding cycle, or a standard maximum of twenty-four (24) months, after which digital records are cryptographically shredded unless labor statutes require longer archiving.');
  builder.addBullet('Cross-Border Data Processing', 'All national identity data is maintained within secure, certified cloud hosting infrastructure compliant with Section 48 of the Act, ensuring citizen data remains protected under Kenyan jurisdiction.');

  builder.addSectionHeading('7', 'Data Protection Officer (DPO) Contact Details');
  builder.addParagraph(
    'Any inquiry, data subject access request, or privacy concern can be lodged directly with our Data Protection Office via: Email: privacy@evidcheck.com / dpo@evidcheck.com | Physical Address: P.O. Box 48200-00100, Nairobi, Kenya.'
  );

  builder.addSignatures(
    { name: 'Data Protection Officer (DPO)', role: 'Data Protection Officer', org: 'EvidCheck Limited', date: '24th November 2026', prefix: 'Prepared & Supervised by:' },
    { name: 'Board Director / Legal Counsel', role: 'Director', org: 'EvidCheck Limited', date: '24th November 2026', prefix: 'Approved on Behalf of Board:' }
  );

  const dest = path.join(process.cwd(), 'EvidCheck_Data_Privacy_Policy.pdf');
  builder.finalizeAndSave(dest);
}

// -------------------------------------------------------------
// 3. GENERATE TECHNICAL ARCHITECTURE & IPRS INTEGRATION BRIEF
// -------------------------------------------------------------
function generateTechBrief() {
  const builder = new PDFDocumentBuilder(
    'Technical Architecture & IPRS Integration Brief',
    'EVC-BRIEF-IPRS-2026-V1.0',
    'Confidential / Technical Directorate Submission'
  );

  builder.addHeaderBlock('EvidCheck Limited', 'Technical Architecture & IPRS Brief', {
    'Document Ref': 'EVC-BRIEF-IPRS-2026-V1.0',
    'Target Directorate': 'IPRS Technical Directorate (Nyayo House)',
    'Date of Presentation': '25th November 2026',
    'Classification': 'Official Regulatory Presentation'
  });

  builder.addSectionHeading('1', 'Executive Summary & Operational Mandate');
  builder.addParagraph(
    'EvidCheck Limited is a Kenyan enterprise software platform engineered to streamline Know Your Customer (KYC) onboarding, employment vetting, and corporate due diligence. The direct integration with the Integrated Population Registration Services (IPRS) National Population Database (NPDM) provides an authoritative, tamper-proof national benchmark to eliminate identity theft, counterfeit IDs, and credential fraud.'
  );

  builder.addSectionHeading('2', 'Architectural Topology & Secure Tunneling');
  builder.addParagraph(
    'The EvidCheck system connects to the IPRS Gateway via a dedicated, closed-loop network topology designed around zero trust and data minimization:'
  );
  builder.addBullet('Perimeter Security', 'Static IP addresses whitelisted at the Nyayo House boundary router with IPsec Site-to-Site VPN encapsulation (AES-256-GCM / SHA-384).');
  builder.addBullet('Transport Cryptography', 'Mutual TLS (mTLS) with custom digital certificate pairs preventing man-in-the-middle (MITM) vulnerabilities.');
  builder.addBullet('Application Guardrails', 'Enforced Web Application Firewall (WAF) rules with aggressive rate-limiting, IP throttling, and automated anomaly detection.');

  builder.addSectionHeading('3', 'End-to-End Verification Flow');
  builder.addBullet('Stage 1 - Candidate Onboarding & Consent', 'The candidate or enterprise client registers the verification request. The candidate signs the statutory digital consent declaration. The platform verifies and stamps the consent token.');
  builder.addBullet('Stage 2 - Verification Orchestration', 'EvidCheck validates candidate checksums (National ID, Date of Birth). The request is tokenized and dispatched over the encrypted VPN tunnel to IPRS.');
  builder.addBullet('Stage 3 - IPRS Source-of-Truth Matching', 'The IPRS Gateway queries the National Population Database and responds with an authoritative validation payload.');
  builder.addBullet('Stage 4 - Deterministic Evaluation & Zero-Caching', 'EvidCheck computes the match status (MATCH / MISMATCH), generates a tamper-proof verification report, and immediately purges raw identity payloads from memory.');
  builder.addBullet('Stage 5 - Immutable Audit Stamping', 'The query metadata (timestamp, operator, entity, purpose hash) is recorded into an append-only audit registry.');

  builder.addCallout(
    'Zero-Caching Technical Guarantee',
    'EvidCheck guarantees that no national population identity databases, biometric signatures, or unredacted citizen registries are stored on persistent disks. All transactions execute as point-in-time stateless evaluations.'
  );

  builder.addSectionHeading('4', 'Internal Security Controls & Multi-Factor Guardrails');
  builder.addBullet('Operator Authentication', 'All personnel and enterprise admins must authenticate using Time-Based One-Time Password (TOTP) Multi-Factor Authentication.');
  builder.addBullet('API Key Governance', 'Programmatic API calls from enterprise clients are authenticated via SHA-256 hashed API secrets.');
  builder.addBullet('Audit Integrity', 'Audit logs are immutable, synchronized against Kenyan National Time Protocol servers, and retained for 7 years.');

  builder.addSignatures(
    { name: 'Chief Technology Officer (CTO)', role: 'Chief Technology Officer', org: 'EvidCheck Limited', date: '24th November 2026', prefix: 'Presented by:' },
    { name: 'Managing Director / CEO', role: 'Managing Director', org: 'EvidCheck Limited', date: '24th November 2026', prefix: 'Approved by:' }
  );

  const dest = path.join(process.cwd(), 'EvidCheck_Technical_Architecture_and_IPRS_Integration_Brief.pdf');
  builder.finalizeAndSave(dest);
}

// -------------------------------------------------------------
// 4. GENERATE ODPC LETTER OF INTRODUCTION REQUEST
// -------------------------------------------------------------
function generateODPCLetter() {
  const builder = new PDFDocumentBuilder(
    'ODPC Letter of Introduction Request',
    'EVC-CORR-ODPC-2026-01',
    'Official Regulatory Correspondence'
  );

  builder.addHeaderBlock('EvidCheck Limited', 'Official Regulatory Correspondence', {
    'Reference': 'EVC-CORR-ODPC-2026-01',
    'Date': '24th November 2026',
    'Addressee': 'The Data Commissioner, ODPC',
    'Subject': 'Request for Regulatory Letter of Introduction for IPRS'
  });

  builder.addParagraph('Date: 24th November 2026');
  builder.addParagraph(
    'The Data Commissioner,\nOffice of the Data Protection Commissioner,\nBritam Tower, 13th Floor, Hospital Road, Upper Hill,\nP.O. Box 30920 - 00100,\nNAIROBI, KENYA.'
  );

  builder.addSubheading('RE: REQUEST FOR REGULATORY LETTER OF INTRODUCTION FOR IPRS SYSTEM INTEGRATION (REF: IPRS/ADM/32/907 (2))');

  builder.addParagraph(
    'We write to your esteemed office on behalf of EvidCheck Limited, an incorporated Kenyan technology company registered as a Data Controller and Data Processor under the Data Protection Act (2019).'
  );

  builder.addParagraph(
    'EvidCheck Limited operates an enterprise background screening and Know Your Customer (KYC) verification platform. To protect Kenyan employers, financial institutions, and citizens from identity theft, impersonation fraud, and credential falsification, we formally applied to the Ministry of Interior and National Administration for API integration with the Integrated Population Registration Services (IPRS).'
  );

  builder.addParagraph(
    'The IPRS Directorate has formally invited our executive and technical delegation for an onboarding and evaluation meeting on Wednesday, 25th November 2026 at Nyayo House (Ref: IPRS/ADM/32/907 (2)). As a mandatory prerequisite for integration approval, IPRS requires an official letter of introduction from our primary data regulatory authority.'
  );

  builder.addParagraph('We affirm that EvidCheck Limited operates in strict fidelity to the Data Protection Act (2019):');
  builder.addBullet('Mandatory User Consent', 'Every identity verification lookup is executed solely upon verifiable, prior explicit consent from the data subject.');
  builder.addBullet('Zero-Caching Architecture', 'EvidCheck enforces zero persistent local storage of raw national population registry records, conducting only point-in-time validations.');
  builder.addBullet('Immutable Audit Trails', 'All lookup activities are logged with full non-repudiation timestamps and operator identification.');

  builder.addParagraph(
    'We therefore humbly request your office to issue an official Letter of Introduction / Regulatory Clearance addressed to the Director, IPRS Directorate, confirming EvidCheck Limited’s regularized compliance standing.'
  );

  builder.addParagraph(
    'Attached for your reference:\n1. EvidCheck Limited Certificate of Incorporation & CR12.\n2. Copy of ODPC Registration Certificate (Data Controller & Processor).\n3. Copy of IPRS Directorate Invitation Letter (Ref: IPRS/ADM/32/907 (2)).'
  );

  builder.addParagraph('Thank you for your tireless dedication to protecting citizen data and fostering a compliant digital economy in Kenya.');

  builder.addSignatures(
    { name: 'Managing Director / CEO', role: 'Managing Director', org: 'EvidCheck Limited', date: '24th November 2026', prefix: 'Yours Faithfully,' },
    { name: 'Chief Technology Officer (CTO)', role: 'Chief Technology Officer', org: 'EvidCheck Limited', date: '24th November 2026', prefix: 'Co-signed by:' }
  );

  const dest = path.join(process.cwd(), 'EvidCheck_ODPC_Letter_of_Introduction_Request.pdf');
  builder.finalizeAndSave(dest);
}

// RUN ALL
console.log('Generating Regulatory Dossier PDFs in root...');
generateISP();
generateDPP();
generateTechBrief();
generateODPCLetter();
console.log('All 4 regulatory PDFs generated successfully!');
