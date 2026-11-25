const fs = require('fs');
const path = require('path');
const { jsPDF } = require('jspdf');
const autoTable = require('jspdf-autotable').default || require('jspdf-autotable');

class ProfessionalPDFBuilder {
  constructor(title, docRef, classification = 'Confidential / Regulatory Submission') {
    this.title = title;
    this.docRef = docRef;
    this.classification = classification;
    this.doc = new jsPDF({ unit: 'pt', format: 'a4' });
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.marginLeft = 48;
    this.marginRight = 48;
    this.marginTop = 50;
    this.marginBottom = 50;
    this.contentWidth = this.pageWidth - this.marginLeft - this.marginRight;
    this.y = this.marginTop;

    this.primaryColor = [15, 23, 42];  // Slate 900
    this.accentColor = [2, 132, 199];  // Sky 600
    this.textColor = [51, 65, 85];     // Slate 700
    this.mutedColor = [100, 116, 139]; // Slate 500
    this.lineColor = [226, 232, 240];  // Slate 200
  }

  checkPageBreak(neededHeight) {
    if (this.y + neededHeight > this.pageHeight - this.marginBottom) {
      this.doc.addPage();
      this.y = 56;
      return true;
    }
    return false;
  }

  newPage() {
    this.doc.addPage();
    this.y = 56;
  }

  addHeaderBlock(companyName, docTitle, meta = []) {
    // Top banner
    this.doc.setFillColor(...this.primaryColor);
    this.doc.rect(this.marginLeft, this.y, this.contentWidth, 54, 'F');

    this.doc.setTextColor(255, 255, 255);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(15);
    this.doc.text(companyName.toUpperCase(), this.marginLeft + 16, this.y + 23);

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9.5);
    this.doc.setTextColor(224, 242, 254);
    this.doc.text(docTitle.toUpperCase(), this.marginLeft + 16, this.y + 42);

    this.y += 64;

    // Metadata grid (2 rows x 2 cols, well padded)
    const cardHeight = 52;
    this.doc.setFillColor(248, 250, 252);
    this.doc.setDrawColor(...this.lineColor);
    this.doc.setLineWidth(1);
    this.doc.roundedRect(this.marginLeft, this.y, this.contentWidth, cardHeight, 4, 4, 'FD');

    this.doc.setFontSize(8.2);
    meta.forEach((item, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const xPos = col === 0 ? this.marginLeft + 14 : this.marginLeft + 230;
      const yPos = this.y + 19 + (row * 20);

      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(...this.mutedColor);
      this.doc.text(item.label + ':', xPos, yPos);

      const labelW = this.doc.getTextWidth(item.label + ': ');
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(...this.primaryColor);
      this.doc.text(item.value, xPos + labelW, yPos);
    });

    this.y += cardHeight + 16;
  }

  addSectionHeading(number, title) {
    this.checkPageBreak(32);
    this.y += 3;

    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(10);
    this.doc.setTextColor(...this.primaryColor);
    const headingText = `${number}. ${title.toUpperCase()}`;
    this.doc.text(headingText, this.marginLeft, this.y);

    this.y += 3;
    this.doc.setDrawColor(...this.accentColor);
    this.doc.setLineWidth(1.2);
    this.doc.line(this.marginLeft, this.y, this.marginLeft + this.contentWidth, this.y);
    this.y += 8;
  }

  addSubheading(title) {
    this.checkPageBreak(20);
    this.y += 2;
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(9);
    this.doc.setTextColor(...this.primaryColor);
    this.doc.text(title, this.marginLeft, this.y);
    this.y += 8;
  }

  addParagraph(text) {
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(8.6);
    this.doc.setTextColor(...this.textColor);

    const lines = this.doc.splitTextToSize(text, this.contentWidth);
    const neededHeight = lines.length * 11.5 + 3;
    this.checkPageBreak(neededHeight);

    lines.forEach((line) => {
      this.doc.text(line, this.marginLeft, this.y);
      this.y += 11.5;
    });

    this.y += 3;
  }

  addBulletItem(label, description) {
    this.doc.setFontSize(8.6);
    const indent = 12;
    const bodyWidth = this.contentWidth - indent;
    const descLines = this.doc.splitTextToSize(description, bodyWidth);
    const neededHeight = 12 + (descLines.length * 11) + 2;
    this.checkPageBreak(neededHeight);

    // Bullet & Title Line
    this.doc.setTextColor(...this.accentColor);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('•', this.marginLeft, this.y);

    this.doc.setTextColor(...this.primaryColor);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(label, this.marginLeft + indent, this.y);
    this.y += 11;

    // Indented Description Lines
    this.doc.setTextColor(...this.textColor);
    this.doc.setFont('helvetica', 'normal');
    descLines.forEach((line) => {
      this.doc.text(line, this.marginLeft + indent, this.y);
      this.y += 11;
    });

    this.y += 2;
  }

  addCallout(title, body) {
    this.doc.setFontSize(8.8);
    const bodyLines = this.doc.splitTextToSize(body, this.contentWidth - 28);
    const boxHeight = 22 + (bodyLines.length * 11.5);
    this.checkPageBreak(boxHeight + 8);

    this.doc.setFillColor(240, 249, 255); // Sky 50
    this.doc.setDrawColor(...this.accentColor);
    this.doc.setLineWidth(1);
    this.doc.roundedRect(this.marginLeft, this.y, this.contentWidth, boxHeight, 3, 3, 'FD');

    // Accent left stripe
    this.doc.setFillColor(...this.accentColor);
    this.doc.rect(this.marginLeft, this.y, 3.5, boxHeight, 'F');

    let innerY = this.y + 13;
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(8.8);
    this.doc.setTextColor(...this.primaryColor);
    this.doc.text(title.toUpperCase(), this.marginLeft + 14, innerY);

    innerY += 11;
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...this.textColor);
    bodyLines.forEach((line) => {
      this.doc.text(line, this.marginLeft + 14, innerY);
      innerY += 11.5;
    });

    this.y += boxHeight + 8;
  }

  addAutoTable(head, body, colStyles = {}) {
    this.checkPageBreak(80);

    autoTable(this.doc, {
      startY: this.y,
      head: head,
      body: body,
      margin: { left: this.marginLeft, right: this.marginRight },
      tableWidth: this.contentWidth,
      theme: 'grid',
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
        cellPadding: 5,
        valign: 'middle'
      },
      styles: {
        fontSize: 7.6,
        cellPadding: 4.5,
        textColor: [51, 65, 85],
        lineColor: [226, 232, 240],
        lineWidth: 0.5,
        valign: 'middle',
        overflow: 'linebreak'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: colStyles
    });

    this.y = this.doc.lastAutoTable.finalY + 10;
  }

  addSignatures(sig1, sig2) {
    const boxHeight = 60;
    this.checkPageBreak(boxHeight + 10);

    this.y += 6;
    this.doc.setDrawColor(...this.lineColor);
    this.doc.setLineWidth(0.8);
    this.doc.line(this.marginLeft, this.y, this.marginLeft + this.contentWidth, this.y);
    this.y += 12;

    const colWidth = (this.contentWidth - 30) / 2;

    [sig1, sig2].forEach((sig, idx) => {
      const colX = this.marginLeft + (idx * (colWidth + 30));
      let currentY = this.y;

      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(7.8);
      this.doc.setTextColor(...this.mutedColor);
      this.doc.text(sig.prefix || 'Prepared & Reviewed by:', colX, currentY);

      currentY += 18;
      this.doc.setDrawColor(...this.mutedColor);
      this.doc.line(colX, currentY, colX + colWidth - 15, currentY);

      currentY += 10;
      this.doc.setFont('helvetica', 'bold');
      this.doc.setFontSize(8.8);
      this.doc.setTextColor(...this.primaryColor);
      this.doc.text(sig.name, colX, currentY);

      currentY += 10;
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(7.8);
      this.doc.setTextColor(...this.mutedColor);
      this.doc.text(sig.role + ', ' + sig.org, colX, currentY);

      currentY += 10;
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
        this.doc.setFontSize(7.5);
        this.doc.setTextColor(...this.mutedColor);
        this.doc.text(
          `EVIDCHECK LIMITED  |  ${this.title.toUpperCase()}  |  REF: ${this.docRef}`,
          this.marginLeft,
          32
        );
        this.doc.setDrawColor(...this.lineColor);
        this.doc.setLineWidth(0.5);
        this.doc.line(this.marginLeft, 37, this.marginLeft + this.contentWidth, 37);
      }

      // Running Footer
      this.doc.setDrawColor(...this.lineColor);
      this.doc.setLineWidth(0.5);
      this.doc.line(
        this.marginLeft,
        this.pageHeight - 32,
        this.marginLeft + this.contentWidth,
        this.pageHeight - 32
      );

      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(7.5);
      this.doc.setTextColor(...this.mutedColor);
      this.doc.text(
        `Classification: ${this.classification}  |  Statutory Compliance: Kenya DPA (2019)`,
        this.marginLeft,
        this.pageHeight - 20
      );

      const pageText = `Page ${p} of ${totalPages}`;
      const pageTextWidth = this.doc.getTextWidth(pageText);
      this.doc.text(pageText, this.marginLeft + this.contentWidth - pageTextWidth, this.pageHeight - 20);
    }

    const buffer = Buffer.from(this.doc.output('arraybuffer'));
    fs.writeFileSync(filePath, buffer);
    console.log(`Generated: ${path.basename(filePath)} -> ${totalPages} pages (${(buffer.length / 1024).toFixed(1)} KB)`);
    return totalPages;
  }
}

// ============================================================================
// 1. DATA PRIVACY POLICY (WITH PERFECT TABLE FORMATTING)
// ============================================================================
function generatePerfectDPP() {
  const b = new ProfessionalPDFBuilder(
    'Data Privacy & Protection Policy',
    'EVC-POL-DPP-2026-V2.1',
    'Confidential / Regulatory Submission'
  );

  b.addHeaderBlock('EvidCheck Limited', 'Data Privacy & Protection Policy', [
    { label: 'Document Ref', value: 'EVC-POL-DPP-2026-V2.1' },
    { label: 'Statutory Authority', value: 'Kenya Data Protection Act, 2019' },
    { label: 'Effective Date', value: '24th November 2026' },
    { label: 'Supervisory Agency', value: 'ODPC (Office of Data Protection Commissioner)' }
  ]);

  b.addSectionHeading('1', 'Preamble & Constitutional Foundation');
  b.addParagraph(
    'EvidCheck Limited ("EvidCheck", "the Company") recognizes privacy as a fundamental human right anchored under Article 31(c) and (d) of the Constitution of Kenya. EvidCheck operates as both a Data Controller and Data Processor under the Data Protection Act (2019), delivering lawful identity corroboration and background due diligence.'
  );
  b.addParagraph(
    'This Data Privacy & Protection Policy establishes mandatory operational rules governing how personal data is collected, validated, transferred, and protected. It assures data subjects, commercial clients, the Office of the Data Protection Commissioner (ODPC), and the IPRS Directorate that identity processing is conducted ethically, transparently, and securely.'
  );

  b.addSectionHeading('2', 'Principles of Data Protection (Section 3 Alignment)');
  b.addParagraph(
    'All personal data handling across EvidCheck strictly adheres to the eight statutory data protection principles:'
  );
  b.addBulletItem('Lawfulness, Fairness & Transparency', 'Personal data is processed only with a recognized lawful basis, ensuring complete clarity to candidates regarding how their data is evaluated.');
  b.addBulletItem('Explicit Purpose Limitation', 'Data is collected exclusively for specific, declared due diligence vetting and KYC checks. Repurposing or secondary processing is strictly prohibited.');
  b.addBulletItem('Data Minimization', 'EvidCheck limits data collection strictly to identity attributes necessary to confirm authenticity. Unnecessary citizen data is never requested or retained.');
  b.addBulletItem('Data Accuracy & Up-to-Date Records', 'By integrating directly with authoritative national registries (such as IPRS), EvidCheck ensures validation decisions are based on pristine source records.');
  b.addBulletItem('Storage Limitation', 'Candidate records are retained only for the contracted duration of the screening lifecycle and purged according to defined retention schedules.');
  b.addBulletItem('Integrity, Confidentiality & Security', 'Data is safeguarded by AES-256 encryption, TLS 1.3 transport, and strict role-based access controls.');

  b.addSectionHeading('3', 'Classification of Personal Data Handled (ODPC Step 3 & 4)');
  b.addParagraph(
    'EvidCheck processes specific categories of personal data to deliver background screening services:'
  );

  // BEAUTIFULLY FORMATTED TABLE USING AUTOTABLE
  b.addAutoTable(
    [['Data Category', 'Classes of Information Processed', 'Category of Data Subjects', 'Lawful Processing Purpose']],
    [
      ['Identification Data', 'Full Name, National ID / Alien ID, Date of Birth, Gender', 'Job Candidates / Vetting Subjects', 'Identity corroboration via IPRS; fraud prevention.'],
      ['Contact Details', 'Email address, phone number, postal address', 'Candidates & Client Reps', 'Verification status notices & communication.'],
      ['Professional History', 'Academic credentials, professional licenses, past employment records', 'Job Applicants / Employees', 'Pre-employment vetting & qualification review.'],
      ['Corporate Due Diligence', 'CR12 directorship, tax compliance status, business permits', 'Company Directors & Vendors', 'Corporate KYC & procurement due diligence.'],
      ['Audit & Telemetry Data', 'IP address, consent timestamp, query hashes, session tokens', 'Authenticated Platform Users', 'Immutable forensic logging & legal non-repudiation.']
    ],
    {
      0: { cellWidth: 84, fontStyle: 'bold' },
      1: { cellWidth: 150 },
      2: { cellWidth: 110 },
      3: { cellWidth: 154 }
    }
  );

  b.addParagraph(
    'Special Category Data Exclusion: EvidCheck does not harvest, process, or commoditize sensitive personal data concerning political opinions, religious beliefs, genetic data, sexual orientation, or physical health records.'
  );

  b.addSectionHeading('4', 'Mandatory Prior Consent Framework (Core Safeguard)');
  b.addCallout(
    'Unconditional Prior Consent Prerequisite',
    'EvidCheck enforces an architectural lock: No verification request, National ID query, or external registry search can be executed without prior, informed, voluntary, and unambiguous consent from the data subject. Requests lacking verifiable consent are automatically aborted by the platform engine.'
  );
  b.addParagraph('Consent is captured through two verified mechanisms:');
  b.addBulletItem('Digital Candidate Consent Portal', 'The candidate receives a secure, tokenized invitation link where they review the exact scope of the check, inspect privacy disclosures, and provide digital acceptance (click-to-sign with phone OTP verification).');
  b.addBulletItem('Enterprise Physical Consent Uploads', 'Client organizations uploading candidates must attach an executed physical consent declaration signed by the candidate. EvidCheck validates and archives the consent document before initiating processing.');
  b.addBulletItem('Revocation of Consent', 'Data subjects retain the absolute right to revoke consent at any stage prior to verification completion. Revocation immediately terminates processing and triggers data deletion.');

  b.addSectionHeading('5', 'IPRS Integration Governance & Strict Non-Commercialization');
  b.addParagraph('EvidCheck’s integration with the IPRS Directorate is governed by rigorous compliance boundaries:');
  b.addBulletItem('Sole Purpose of Corroboration', 'IPRS access is utilized exclusively to compare applicant-provided identity claims against national records to detect identity theft and credential falsification.');
  b.addBulletItem('Zero-Caching Guarantee', 'EvidCheck does not maintain local copies, shadow databases, or offline caches of national identity files. All queries are stateless and point-in-time.');
  b.addBulletItem('Absolute Prohibition on Commercialization', 'EvidCheck strictly prohibits the sale, rental, leasing, monetization, public distribution, or bulk data mining of any personal data or registry responses.');

  b.addSectionHeading('6', 'Data Subject Rights & Operational Enforcement');
  b.addParagraph('Pursuant to Part IV of the Kenya Data Protection Act, EvidCheck guarantees data subjects the full exercise of their statutory rights:');
  b.addBulletItem('Right to be Informed (Section 29)', 'Candidates are notified in plain language of the exact data being verified, the source registries queried, and the prospective employer requesting the check.');
  b.addBulletItem('Right of Access (Section 30)', 'Individuals may request a full copy of their completed verification report free of charge through our Data Subject Portal.');
  b.addBulletItem('Right to Rectification (Section 31)', 'Candidates may dispute any discrepancy. EvidCheck provides an administrative dispute mechanism to re-evaluate records against original source registries.');
  b.addBulletItem('Right to Erasure / Right to be Forgotten (Section 32)', 'Upon completion of the hiring decision or expiry of statutory retention periods, candidates may request the permanent destruction of their verification records.');
  b.addBulletItem('Right to Object & Human Oversight (Section 35)', 'EvidCheck guarantees that no adverse screening decision is rendered solely through automated algorithms. Human review is mandated for any discrepant result.');

  b.addSectionHeading('7', 'Data Retention, Archival & Cryptographic Disposal');
  b.addParagraph('In compliance with data minimization principles, EvidCheck applies strict storage schedules:');
  b.addBulletItem('Verification Dossiers', 'Retained for twenty-four (24) months following completion of the screening job, after which records are automatically queued for deletion, unless applicable labor or financial laws mandate longer archiving.');
  b.addBulletItem('Raw Registry Payloads', 'Retained for zero seconds. Discarded immediately after computing validation hashes.');
  b.addBulletItem('Cryptographic Disposal', 'Digital files reaching the end of their retention lifecycle are sanitized using DoD 5220.22-M compliant cryptographic wiping routines, ensuring permanent, unrecoverable destruction.');

  b.addSectionHeading('8', 'Cross-Border Data Transfers (Section 48 Alignment)');
  b.addParagraph(
    'EvidCheck maintains sovereignty over Kenyan personal data. Primary application data stores are hosted in secure, certified cloud infrastructure. In accordance with Section 48 of the Act, cross-border transfers occur only where:'
  );
  b.addBulletItem('Adequate Legal Protections Exist', 'The recipient jurisdiction maintains comparable data protection legislation certified by the ODPC.');
  b.addBulletItem('Contractual Privacy Clauses', 'Standard Contractual Clauses (SCCs) are executed binding the overseas host to Kenyan data protection standards.');
  b.addBulletItem('End-to-End Encryption', 'All cross-border data replication is encrypted with AES-256 keys managed exclusively by EvidCheck personnel.');

  b.addSectionHeading('9', 'Privacy by Design & Data Protection Impact Assessments (DPIA)');
  b.addParagraph(
    'Privacy controls are embedded into every sprint and release cycle: automated credential masking, role segregation between platform operators and payload inspectors, and annual comprehensive DPIAs submitted to the ODPC.'
  );

  b.addSectionHeading('10', 'Data Processing Agreements & Third-Party Audits');
  b.addParagraph(
    'All enterprise clients using EvidCheck must execute a legally binding Data Processing Agreement (DPA) incorporating statutory controller-processor clauses under the Kenya Data Protection Regulations. EvidCheck reserves the right to conduct annual compliance reviews of client consent collection mechanisms.'
  );

  b.addSectionHeading('11', 'Office of the Data Protection Officer & Redress');
  b.addParagraph('Data subjects or regulatory authorities may submit privacy inquiries, access requests, or complaints to:');
  b.addBulletItem('Data Protection Officer (DPO)', 'EvidCheck Limited, P.O. Box 48200 - 00100, Nairobi, Kenya.');
  b.addBulletItem('Direct Privacy Inquiries', 'Email: privacy@evidcheck.com / moses.karani@evidcheck.com | Tel: +254 795 968 681');
  b.addBulletItem('Regulatory Redress', 'Data subjects retain the right to lodge formal complaints directly with the Office of the Data Protection Commissioner (ODPC) at Britam Tower, Upper Hill, Nairobi.');

  b.addSignatures(
    { name: 'Moses Karani', role: 'Director / Co-Founder', org: 'EvidCheck Limited', date: '25th November 2026', prefix: 'Drafted & Overseen by:' },
    { name: 'Viola Masanja', role: 'Director / Co-Founder', org: 'EvidCheck Limited', date: '25th November 2026', prefix: 'Approved on Behalf of Board of Directors:' }
  );

  const dest = path.join(process.cwd(), 'EvidCheck_Data_Privacy_Policy.pdf');
  const pages = b.finalizeAndSave(dest);

  const publicDest = path.join(process.cwd(), 'public', 'EvidCheck_Data_Privacy_Policy.pdf');
  fs.copyFileSync(dest, publicDest);
  console.log(`Copied DPP to ${publicDest}`);

  return pages;
}

// ============================================================================
// 2. INFORMATION SECURITY POLICY (MATCHING PERFECT FORMATTING)
// ============================================================================
function generatePerfectISP() {
  const b = new ProfessionalPDFBuilder(
    'Information Security Policy',
    'EVC-POL-ISP-2026-V2.1',
    'Confidential / Regulatory Submission'
  );

  b.addHeaderBlock('EvidCheck Limited', 'Information Security Policy (ISP)', [
    { label: 'Document Ref', value: 'EVC-POL-ISP-2026-V2.1' },
    { label: 'Statutory Alignment', value: 'Kenya DPA 2019 / ISO/IEC 27001' },
    { label: 'Effective Date', value: '24th November 2026' },
    { label: 'Target Directorate', value: 'IPRS Directorate & ODPC Review' }
  ]);

  b.addSectionHeading('1', 'Executive Mandate & Policy Objective');
  b.addParagraph(
    'EvidCheck Limited ("EvidCheck", "the Company") operates a mission-critical digital background check, Know Your Customer (KYC), and credential verification platform. This Information Security Policy (ISP) establishes binding administrative, technical, and physical safeguards designed to uphold the Confidentiality, Integrity, and Availability (CIA Triad) of all corporate assets, client data pipelines, and national identity validation interfaces.'
  );
  b.addParagraph(
    'The Company acknowledges that citizen identity verification involves high-sensitivity personal identifiers protected under the Constitution of Kenya (Article 31) and the Data Protection Act (2019). Compliance with this policy is mandatory across all business functions, development lifecycles, and network topologies.'
  );

  b.addSectionHeading('2', 'Regulatory & Compliance Framework');
  b.addParagraph('This policy is benchmarked against statutory laws and international information security standards, specifically:');
  b.addBulletItem('Kenya Data Protection Act, 2019', 'Sections 3, 41, 42 & 43 governing data integrity, organizational safeguards, and mandatory 72-hour breach notification.');
  b.addBulletItem('Data Protection (General) Regulations, 2021', 'Standards on data minimization, processing conditions, and Data Protection Officer obligations.');
  b.addBulletItem('Computer Misuse & Cybercrimes Act, 2018', 'Legal protections against unauthorized system access, data tampering, and cyber compromise.');
  b.addBulletItem('ISO/IEC 27001:2022 Controls', 'Information security management framework, asset classification, and continuous risk treatment.');

  b.addSectionHeading('3', 'Scope & Asset Applicability');
  b.addParagraph('This policy governs all digital assets owned, operated, or accessed by EvidCheck Limited, including but not limited to:');
  b.addBulletItem('Core Production Applications', 'EvidCheck Verification Engine, Candidate Self-Service Portal, and Enterprise Client Dashboard.');
  b.addBulletItem('Database & Persistence Layers', 'Application databases, encrypted session stores, and cryptographic key vaults.');
  b.addBulletItem('Integration Channels', 'Application Programming Interfaces (APIs), webhooks, and the dedicated IPRS Gateway connector.');
  b.addBulletItem('Personnel & Stakeholders', 'Board members, executive management, software engineers, DevOps personnel, support agents, and third-party contractors.');

  b.addSectionHeading('4', 'Information Security Governance & Oversight');
  b.addParagraph('EvidCheck enforces clear separation of duties and dedicated governance responsibilities:');
  b.addBulletItem('Chief Technology Officer (CTO)', 'Holds direct technical accountability for platform hardening, cryptographic integrity, secure VPN/mTLS infrastructure, vulnerability remediation, and continuous threat monitoring.');
  b.addBulletItem('Data Protection Officer (DPO)', 'Maintains independent oversight of privacy compliance, directs Data Protection Impact Assessments (DPIA), and acts as the liaison with the Office of the Data Protection Commissioner (ODPC).');
  b.addBulletItem('DevOps & Security Engineers', 'Manage firewall rules, patch management, access provisioning, and automated continuous-integration vulnerability pipelines.');
  b.addBulletItem('All Authorized Users', 'Strictly required to adhere to workstation security, credential hygiene, and clean desk/screen protocols.');

  // Page 2 clean break: Access Control, IPRS Architecture & Threat Mitigation Table
  b.newPage();

  b.addSectionHeading('5', 'Identification, Authentication & Access Control');
  b.addParagraph(
    'Access to EvidCheck verification engines, administrative portals, and audit trails is governed by the Principle of Least Privilege and Role-Based Access Control (RBAC):'
  );
  b.addBulletItem('Mandatory Multi-Factor Authentication (MFA)', 'Time-Based One-Time Password (TOTP) Multi-Factor Authentication is non-negotiable for all staff, engineering, and superadmin accounts. Single-factor (password-only) logins are strictly blocked at the gateway.');
  b.addBulletItem('Password Standards & Cryptographic Hashing', 'Passwords require a minimum of 12 alphanumeric and special characters. Passwords are stored exclusively using adaptive salted hashing algorithms (bcrypt / Argon2 with high work factors). Plaintext storage is impossible.');
  b.addBulletItem('Client API Key Security', 'Enterprise API keys are generated using cryptographically secure random bytes and stored as one-way SHA-256 hashes. Plaintext keys are displayed once upon issuance and cannot be retrieved from database records.');
  b.addBulletItem('Session Lifecycle & Termination', 'Administrative web sessions expire automatically after 15 minutes of inactivity. Concurrent administrative sessions from disparate IP addresses are automatically blocked.');

  b.addSectionHeading('6', 'Dedicated IPRS Integration & Stateless Processing');
  b.addParagraph('Integration with the Integrated Population Registration Services (IPRS) Directorate at Nyayo House operates under sovereign security standards:');
  b.addBulletItem('Dedicated Site-to-Site IPsec VPN', 'All communications route across closed-loop, encrypted IPsec VPN tunnels with AES-256-GCM encryption and SHA-384 integrity authentication.');
  b.addBulletItem('Static IP Whitelisting', 'Only pre-registered, static production server IP addresses are permitted to interface with the IPRS endpoint.');
  b.addBulletItem('Mutual TLS (mTLS) Transport', 'Transactions enforce mutual cryptographic certificate verification, eliminating man-in-the-middle (MITM) vulnerabilities.');

  b.addCallout(
    'Strict Zero-Caching & Ephemeral Runtime Guarantee',
    'EvidCheck strictly guarantees ZERO PERSISTENT LOCAL STORAGE of raw national population registry records. Queries to IPRS are point-in-time comparisons returning binary match indicators (MATCH / MISMATCH / NOT_FOUND). Raw demographic attributes, photographs, or biometric signatures are processed in volatile memory only during evaluation and are instantly purged with cryptographic zero-fill routines.'
  );

  b.addSectionHeading('7', 'Threat Mitigation & Risk Treatment (ODPC Step 6 Alignment)');
  b.addParagraph('EvidCheck has implemented active defense mechanisms to mitigate common cyber threats:');

  // AUTOTABLE FOR THREAT TREATMENT
  b.addAutoTable(
    [['Threat Category', 'Identified Risk', 'Implemented Technical & Operational Safeguard']],
    [
      ['Malware & Ransomware', 'Server compromise & data destruction', 'Automated EDR scanning, container sandboxing, immutable system snapshots.'],
      ['Phishing & Social Eng.', 'Staff credential harvesting & impersonation', 'Hardware-backed TOTP 2FA, DMARC/DKIM/SPF email signing, quarterly staff drills.'],
      ['Unauthorized Access', 'Data exfiltration by rogue actors', 'Strict RBAC, IP restriction, JWT signed tokens, automated intrusion blocking.'],
      ['Man-in-the-Middle', 'Interception of data in transit', 'Mandatory TLS 1.3 encryption on all public endpoints; IPsec VPN for IPRS.'],
      ['Data Tampering', 'Unauthorized alteration of KYC results', 'Cryptographic verification report hashing, write-once audit log storage.']
    ],
    {
      0: { cellWidth: 120, fontStyle: 'bold' },
      1: { cellWidth: 160 },
      2: { cellWidth: 218 }
    }
  );

  // Page 3 clean break: Operational Security, Audit Logging & Compliance Signatures
  b.newPage();

  b.addSectionHeading('8', 'Physical, Environmental & Personnel Security');
  b.addParagraph('In addition to digital controls, EvidCheck maintains rigorous operational and workplace safeguards:');
  b.addBulletItem('Workstation & Device Controls', 'All corporate laptops feature full-disk BitLocker encryption, automatic 5-minute screen lockouts, and centralized mobile device management (MDM).');
  b.addBulletItem('Clean Desk & Clean Screen Policy', 'No physical documents containing candidate identification records may be left unattended. Printed reports must be shredded immediately after authorized use.');
  b.addBulletItem('Personnel Background Vetting', 'All newly recruited engineers, managers, and support personnel undergo rigorous pre-employment criminal history and credential vetting.');
  b.addBulletItem('Employee Onboarding & Offboarding', 'Strict exit procedures ensure all credentials, VPN keys, and OAuth sessions are revoked within 60 minutes of employee departure.');

  b.addSectionHeading('9', 'Immutable Audit Logging & Forensic Traceability');
  b.addParagraph(
    'EvidCheck maintains an append-only, tamper-evident audit logging architecture. Every query dispatched across internal services or external registry APIs records:'
  );
  b.addBulletItem('Synchronized UTC/EAT Timestamp', 'Calibrated via Network Time Protocol (NTP) against national standard time servers.');
  b.addBulletItem('Requesting Organization & Operator ID', 'Identifies the exact corporate client account and authenticated individual executing the query.');
  b.addBulletItem('Data Subject Consent Token', 'Cryptographic hash binding the query to candidate consent, including IP, timestamp, and signed declaration.');
  b.addBulletItem('Target Query Reference & Result Hash', 'Deterministic verification status and result hash for non-repudiation, with zero storage of raw registry payload.');
  b.addParagraph(
    'Audit logs are write-protected, isolated from standard database operations, and archived for seven (7) years to support statutory audits and forensic reviews.'
  );

  b.addSectionHeading('10', 'Incident Management & 72-Hour Breach Notification');
  b.addParagraph('EvidCheck operates an active 24/7 Computer Security Incident Response Plan (CSIRP):');
  b.addBulletItem('Triage & Containment', 'Any anomalous traffic or unauthorized access triggers automated alerts to the CTO and on-call DevOps engineers within 5 minutes, initiating sandbox isolation.');
  b.addBulletItem('Statutory ODPC Notification (Section 43)', 'In the event of a verified breach involving personal data, EvidCheck commits to formally notifying the Office of the Data Protection Commissioner (ODPC) in writing within seventy-two (72) hours of discovery.');
  b.addBulletItem('Data Subject Communication', 'Impacted individuals are informed without undue delay with clear guidance on mitigation steps and support contacts.');

  b.addSectionHeading('11', 'Disaster Recovery, Business Continuity & Backups');
  b.addParagraph('To guarantee operational resilience, all core application state and encrypted audit logs are backed up automatically:');
  b.addBulletItem('Snapshot Frequency', 'Automated incremental snapshots every hour; full encrypted system snapshots captured every 24 hours.');
  b.addBulletItem('Geographic Redundancy', 'Backups are replicated to geographically isolated, ISO 27001-certified data center regions.');
  b.addBulletItem('Recovery Metrics', 'Recovery Time Objective (RTO) < 4 hours; Recovery Point Objective (RPO) < 1 hour. Backup restoration drills are executed quarterly.');

  b.addSectionHeading('12', 'Policy Review, Enforcement & Sanctions');
  b.addParagraph(
    'This policy is reviewed annually by the CTO and DPO, or immediately upon major architectural upgrades or statutory amendments. Willful violations of this policy constitute gross misconduct, resulting in summary termination of employment, revocation of access privileges, and criminal referral under the Computer Misuse and Cybercrimes Act (2018).'
  );

  b.addSignatures(
    { name: 'Moses Karani', role: 'Director / Co-Founder', org: 'EvidCheck Limited', date: '25th November 2026', prefix: 'Prepared & Technically Certified by:' },
    { name: 'Viola Masanja', role: 'Director / Co-Founder', org: 'EvidCheck Limited', date: '25th November 2026', prefix: 'Approved on Behalf of Board of Directors:' }
  );

  const dest = path.join(process.cwd(), 'EvidCheck_Information_Security_Policy.pdf');
  const pages = b.finalizeAndSave(dest);

  // Also copy to public directory for direct web downloads
  const publicDest = path.join(process.cwd(), 'public', 'EvidCheck_Information_Security_Policy.pdf');
  fs.copyFileSync(dest, publicDest);
  console.log(`Copied ISP to ${publicDest}`);

  return pages;
}

// EXECUTE
console.log('Regenerating perfectly styled policies...');
generatePerfectDPP();
generatePerfectISP();
console.log('Done!');
