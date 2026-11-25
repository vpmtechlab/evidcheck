const fs = require('fs');
const path = require('path');
const { jsPDF } = require('jspdf');
const autoTable = require('jspdf-autotable').default || require('jspdf-autotable');

class LegalDocBuilder {
  constructor(title, docRef, classification = 'Legally Binding Agreement') {
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
      this.y = this.marginTop;
      return true;
    }
    return false;
  }

  addHeaderBlock(companyName, docTitle, meta = []) {
    this.doc.setFillColor(...this.primaryColor);
    this.doc.rect(this.marginLeft, this.y, this.contentWidth, 54, 'F');

    this.doc.setTextColor(255, 255, 255);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(14);
    this.doc.text(companyName.toUpperCase(), this.marginLeft + 16, this.y + 23);

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);
    this.doc.setTextColor(224, 242, 254);
    this.doc.text(docTitle.toUpperCase(), this.marginLeft + 16, this.y + 42);

    this.y += 64;

    const cardHeight = 46;
    this.doc.setFillColor(248, 250, 252);
    this.doc.setDrawColor(...this.lineColor);
    this.doc.setLineWidth(1);
    this.doc.roundedRect(this.marginLeft, this.y, this.contentWidth, cardHeight, 4, 4, 'FD');

    this.doc.setFontSize(8);
    meta.forEach((item, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = this.marginLeft + 16 + col * (this.contentWidth / 2);
      const itemY = this.y + 16 + row * 16;

      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(...this.mutedColor);
      this.doc.text(`${item.label}:`, x, itemY);

      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(...this.textColor);
      this.doc.text(` ${item.value}`, x + 75, itemY);
    });

    this.y += cardHeight + 16;
  }

  addSectionHeading(num, title) {
    this.checkPageBreak(38);
    this.doc.setFillColor(241, 245, 249);
    this.doc.rect(this.marginLeft, this.y, this.contentWidth, 20, 'F');

    this.doc.setFillColor(...this.accentColor);
    this.doc.rect(this.marginLeft, this.y, 4, 20, 'F');

    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(9.5);
    this.doc.setTextColor(...this.primaryColor);
    this.doc.text(`${num}.  ${title.toUpperCase()}`, this.marginLeft + 12, this.y + 14);

    this.y += 28;
  }

  addParagraph(text, extraSpacing = 4) {
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(8.5);
    this.doc.setTextColor(...this.textColor);

    const lines = this.doc.splitTextToSize(text, this.contentWidth);
    const neededHeight = lines.length * 11.5 + extraSpacing;
    this.checkPageBreak(neededHeight);

    lines.forEach(line => {
      this.doc.text(line, this.marginLeft, this.y);
      this.y += 11.5;
    });

    this.y += extraSpacing;
  }

  addBullet(title, text) {
    this.doc.setFontSize(8.5);
    const bulletPrefix = '• ';
    const indent = 14;
    const fullPrefix = `${bulletPrefix}${title}: `;

    this.doc.setFont('helvetica', 'bold');
    const prefixWidth = this.doc.getTextWidth(fullPrefix);
    const remainingWidth = this.contentWidth - indent;

    this.doc.setFont('helvetica', 'normal');
    const textLines = this.doc.splitTextToSize(text, remainingWidth);
    const neededHeight = (textLines.length + 1) * 11.5;
    this.checkPageBreak(neededHeight);

    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...this.primaryColor);
    this.doc.text(bulletPrefix, this.marginLeft + 4, this.y);
    this.doc.text(`${title}:`, this.marginLeft + indent, this.y);

    const titleWidth = this.doc.getTextWidth(`${title}:`);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...this.textColor);

    if (textLines.length > 0) {
      this.doc.text(` ${textLines[0]}`, this.marginLeft + indent + titleWidth, this.y);
      this.y += 11.5;
      for (let i = 1; i < textLines.length; i++) {
        this.doc.text(textLines[i], this.marginLeft + indent, this.y);
        this.y += 11.5;
      }
    } else {
      this.y += 11.5;
    }
    this.y += 2;
  }

  addCallout(title, text, type = 'info') {
    this.doc.setFontSize(8);
    const lines = this.doc.splitTextToSize(text, this.contentWidth - 28);
    const boxHeight = lines.length * 11 + 24;

    this.checkPageBreak(boxHeight + 8);

    const bgColors = {
      info: [240, 249, 255],
      warning: [254, 252, 232],
      highlight: [248, 250, 252]
    };
    const borderColors = {
      info: [2, 132, 199],
      warning: [202, 138, 4],
      highlight: [71, 85, 105]
    };

    const bg = bgColors[type] || bgColors.info;
    const border = borderColors[type] || borderColors.info;

    this.doc.setFillColor(...bg);
    this.doc.setDrawColor(...border);
    this.doc.setLineWidth(1);
    this.doc.roundedRect(this.marginLeft, this.y, this.contentWidth, boxHeight, 3, 3, 'FD');

    this.doc.setFillColor(...border);
    this.doc.rect(this.marginLeft, this.y, 4, boxHeight, 'F');

    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(8.5);
    this.doc.setTextColor(...border);
    this.doc.text(title.toUpperCase(), this.marginLeft + 14, this.y + 14);

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(8);
    this.doc.setTextColor(...this.textColor);

    let textY = this.y + 26;
    lines.forEach(l => {
      this.doc.text(l, this.marginLeft + 14, textY);
      textY += 11;
    });

    this.y += boxHeight + 10;
  }

  finalizeAndSave(filePath) {
    const totalPages = this.doc.internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      this.doc.setPage(p);
      this.doc.setDrawColor(...this.lineColor);
      this.doc.setLineWidth(0.5);
      this.doc.line(this.marginLeft, this.pageHeight - 34, this.pageWidth - this.marginRight, this.pageHeight - 34);

      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(7.5);
      this.doc.setTextColor(...this.mutedColor);

      this.doc.text(`EVIDCHECK LIMITED | ${this.docRef} | ${this.classification}`, this.marginLeft, this.pageHeight - 22);
      this.doc.text(`Page ${p} of ${totalPages}`, this.pageWidth - this.marginRight - 55, this.pageHeight - 22);
    }

    const data = this.doc.output('arraybuffer');
    fs.writeFileSync(filePath, Buffer.from(data));
    console.log(`Saved: ${filePath} (${totalPages} pages)`);
  }
}

// -------------------------------------------------------------
// 1. Generate Master Services Agreement (MSA)
// -------------------------------------------------------------
function generateMSA() {
  const b = new LegalDocBuilder(
    'Master Services Agreement (MSA)',
    'DOC-REF: EVID/LEGAL/MSA-2026/V1',
    'Binding Enterprise Agreement'
  );

  b.addHeaderBlock('EVIDCHECK LIMITED', 'MASTER SERVICES AGREEMENT (MSA)', [
    { label: 'Agreement Ref', value: 'EVID/LEGAL/MSA-2026/V1' },
    { label: 'Effective Date', value: 'November 2026' },
    { label: 'Governing Law', value: 'Republic of Kenya (DPA 2019)' },
    { label: 'Regulatory Authority', value: 'ODPC & Central Bank Regs' },
  ]);

  b.addCallout(
    'STATUTORY COMPLIANCE & PRIOR CONSENT MANDATE',
    'This Master Services Agreement ("Agreement") governs the provision of automated background screening, identity corroboration, and KYC/KYB services by EvidCheck Limited to enterprise corporate clients. Customer warrants that every verification request initiated on the platform is supported by prior, documented, and freely given consent from the data subject in strict compliance with the Data Protection Act (2019) of Kenya.',
    'info'
  );

  b.addSectionHeading('1', 'Definitions and Interpretation');
  b.addParagraph('In this Agreement, the following terms shall have the meanings assigned below:');
  b.addBullet('Authorized User', 'An employee or designated representative of the Customer who has been provisioned with role-based access credentials to the EvidCheck platform.');
  b.addBullet('Candidate / Data Subject', 'Any identified or identifiable natural person whose credentials, identity, or records are submitted by the Customer for verification.');
  b.addBullet('Statutory Registry', 'Authorized sovereign or statutory data repositories including IPRS (Integrated Population Registration Services), CRB (Metropol Credit Reference Bureau), KRA, NTSA, and recognized academic accreditation bodies.');
  b.addBullet('Zero-Caching Architecture', 'The operational policy whereby EvidCheck executes ephemeral point-in-time corroboration against authoritative registries, retaining zero persistent citizen records.');

  b.addSectionHeading('2', 'Scope of Services & License Grant');
  b.addParagraph('EvidCheck grants to the Customer a non-exclusive, non-transferable, revocable license to access the EvidCheck Web Console and REST APIs solely for lawful, internal business verification purposes during the term of this Agreement.');
  b.addBullet('Multi-Tenant Cloud Verification', 'Access to automated modules including National ID corroboration, Business Registration verification (BRS), Tax Compliance (KRA), Credit Risk Profiling (CRB Metropol), and Academic Credential screening.');
  b.addBullet('SLA & System Availability', 'EvidCheck commits to a 99.5% service uptime commitment for core platform services, excluding scheduled maintenance announced 48 hours in advance or force majeure events affecting sovereign registry gateways.');

  b.addSectionHeading('3', 'Customer Warranties, Prior Consent & Anti-Brokerage');
  b.addParagraph('The Customer expressly represents, warrants, and covenants to EvidCheck that:');
  b.addBullet('Mandatory Written Consent', 'Prior to submitting any candidate query, Customer has obtained verifiable, freely given, specific, and informed written consent from the candidate authorizing the specific verification check.');
  b.addBullet('Strict Prohibition on Data Brokerage', 'Customer shall NOT resell, sublicense, rent, publish, broker, or commercially exploit verification outputs, nor operate any public lookup portal derived from EvidCheck services.');
  b.addBullet('Legitimate Business Purpose', 'Verification queries shall be restricted exclusively to bona fide employment pre-screening, know-your-customer (KYC) onboarding, creditworthiness assessment, or contractor vetting.');

  b.addCallout(
    'INDEMNITY FOR CONSENT BREACH',
    'Customer agrees to defend, indemnify, and hold harmless EvidCheck Limited, its directors, and its affiliates against any administrative fines, regulatory sanctions, penalties, or civil damages levied by the Office of the Data Protection Commissioner (ODPC) or any court of law arising from Customer failure to secure lawful candidate consent.',
    'warning'
  );

  b.addSectionHeading('4', 'Data Protection, Security & Audit Rights');
  b.addBullet('Data Controller vs Data Processor', 'For candidate background screening, Customer acts as the Data Controller determining the purpose of verification, and EvidCheck acts as the authorized Data Processor executing automated corroboration under Customer instruction.');
  b.addBullet('Zero-Caching Enforcement', 'EvidCheck enforces immediate memory purging of sovereign population records post-corroboration. Only cryptographic transaction hashes, timestamps, and match results are retained.');
  b.addBullet('Regulatory Audit Trail', 'All transactions generate immutable audit logs recorded in accordance with Section 42 of the Data Protection Act (2019), retrievable by Customer for compliance audits for up to 7 years.');

  b.addSectionHeading('5', 'Fees, Payment Terms & Wallet Billing');
  b.addParagraph('Services are billed on a per-transaction consumption basis or via committed enterprise subscription tiers.');
  b.addBullet('Billing Currency & Taxes', 'All fees are denominated in Kenya Shillings (KES) and subject to applicable statutory Value Added Tax (VAT 16%) where legally required.');
  b.addBullet('Prepaid Wallet & Invoicing', 'Prepaid balances deduct in real-time upon verification execution. Invoiced enterprise tiers require settlement within 30 days of invoice date.');
  b.addBullet('Non-Refundable Executions', 'Because authoritative registries charge per query execution regardless of outcome (e.g. valid match vs no record found), queries submitted are non-refundable once initiated.');

  b.addSectionHeading('6', 'Term, Suspension & Termination');
  b.addParagraph('This Agreement enters into force upon execution or first platform access and remains active until terminated by either party with 30 days written notice.');
  b.addBullet('Immediate Suspension for Cause', 'EvidCheck reserves the right to immediately suspend API keys or platform access if unusual query spikes, unauthorized surveillance, or fraudulent credential checks are detected.');
  b.addBullet('Effect of Termination', 'Upon termination, access is revoked, and all cryptographic transaction logs remain archived in compliance with Kenyan statutory limitation laws.');

  b.addSectionHeading('7', 'Governing Law and Dispute Resolution');
  b.addParagraph('This Agreement shall be governed, construed, and enforced in accordance with the laws of the Republic of Kenya. Any dispute arising out of or in connection with this Agreement that cannot be amicably resolved within thirty (30) days shall be referred to arbitration under the Nairobi Centre for International Arbitration (NCIA) Rules.');

  b.finalizeAndSave(path.join(__dirname, '..', 'EvidCheck_Master_Services_Agreement.pdf'));
}

// -------------------------------------------------------------
// 2. Generate Platform Terms of Service
// -------------------------------------------------------------
function generateTermsOfService() {
  const b = new LegalDocBuilder(
    'Platform Terms of Service',
    'DOC-REF: EVID/LEGAL/TOS-2026/V1',
    'Public Platform Terms'
  );

  b.addHeaderBlock('EVIDCHECK LIMITED', 'PLATFORM TERMS OF SERVICE', [
    { label: 'Document Ref', value: 'EVID/LEGAL/TOS-2026/V1' },
    { label: 'Last Updated', value: 'November 2026' },
    { label: 'Applicability', value: 'All Users, APIs & Portals' },
    { label: 'Jurisdiction', value: 'Nairobi, Kenya' },
  ]);

  b.addCallout(
    'SUMMARY NOTICE FOR REGISTERED ENTITIES',
    'By accessing, registering an account on, or utilizing the APIs of EvidCheck ("Platform"), your organization agrees to be legally bound by these Terms of Service. If you do not agree, do not access or use the Platform. EvidCheck is a regulated B2B background screening software platform registered under the Data Protection Act (2019).',
    'info'
  );

  b.addSectionHeading('1', 'Eligibility and Account Verification');
  b.addParagraph('Access to the EvidCheck verification engine is restricted exclusively to verified corporate entities, registered business names, and accredited institutions:');
  b.addBullet('KYB Verification Requirement', 'Every entity must complete Know Your Business (KYB) onboarding, providing a valid Certificate of Incorporation or Business Registration Certificate, KRA PIN, and CR12.');
  b.addBullet('Work Email Enforcement', 'Registration using free, unverified public email providers (e.g., Gmail, Yahoo) is strictly prohibited to prevent unauthorized access.');
  b.addBullet('Credential Safeguarding', 'Account administrators are responsible for managing authorized user seats, rotating API keys regularly, and maintaining multi-factor authentication (2FA).');

  b.addSectionHeading('2', 'Permissible Use and Ethical Verification');
  b.addParagraph('The Platform may only be utilized for lawful, pre-authorized verification workflows:');
  b.addBullet('Permitted Workflows', 'Pre-employment screening, tenant background verification, customer due diligence (KYC/KYB), vendor risk vetting, and professional credential corroboration.');
  b.addBullet('Candidate Transparency', 'Users must provide candidates with a Fair Processing Notice informing them of the nature, scope, and statutory registries queried in the verification process.');

  b.addSectionHeading('3', 'Strictly Prohibited Activities');
  b.addParagraph('Users shall NOT under any circumstances engage in the following activities on or through the Platform:');
  b.addBullet('Unauthorized Surveillance', 'Conducting checks on individuals without their explicit written consent or for personal stalking, political opposition research, or curiosity.');
  b.addBullet('Automated Scraping & Reverse Engineering', 'Attempting to decompile, reverse engineer, scrape, or extract authoritative registry data through automated crawlers or unauthorized bots.');
  b.addBullet('Data Resale & Public Directory Operations', 'Creating any secondary searchable directory, re-selling raw API outputs, or acting as an unlicensed data broker.');

  b.addSectionHeading('4', 'Zero-Caching and Intellectual Property');
  b.addParagraph('EvidCheck Limited retains all right, title, and intellectual property interest in the Platform software, algorithms, risk scoring models, and UI designs.');
  b.addBullet('Statutory Sovereign Records', 'EvidCheck does not claim ownership over sovereign records returned by official government or statutory bureaus (IPRS, KRA, Metropol CRB). All such records are handled ephemerally under strict Zero-Caching principles.');
  b.addBullet('Customer Audit Data', 'Customers retain full ownership of their own verification request logs, candidate consent tokens, and corroborated analytical reports.');

  b.addSectionHeading('5', 'Service Disclaimers & Limitations of Liability');
  b.addBullet('Authoritative Registry Dependence', 'EvidCheck facilitates automated point-in-time queries to official registries. We are not liable for transient network disruptions, maintenance downtime, or inaccuracies present in upstream sovereign records.');
  b.addBullet('No Autonomous Employment Decisions', 'Verification reports and risk scores generated by the Platform constitute analytical reference data only. The final decision to hire, onboard, or extend credit remains solely with the Customer.');
  b.addBullet('Liability Cap', 'To the maximum extent permitted by Kenyan law, EvidCheck total aggregate liability for any claim arising out of these Terms shall not exceed the total fees paid by the Customer in the three (3) months preceding the claim.');

  b.addSectionHeading('6', 'Termination and Account Suspension');
  b.addParagraph('EvidCheck reserves the right to immediately suspend or permanently terminate any user account that violates candidate consent mandates, exhibits suspicious query volume anomalies, or fails security compliance reviews.');

  b.addSectionHeading('7', 'Contact and Legal Notices');
  b.addParagraph('For inquiries regarding these Terms, enterprise MSA contracting, or Data Protection compliance, please contact:');
  b.addBullet('Legal & Compliance Directorate', 'Email: legal@evidcheck.com / compliance@evidcheck.com');
  b.addBullet('Data Protection Officer (DPO)', 'EvidCheck Limited, P.O. Box 4892 - 00100, Nairobi, Kenya | Phone: +254 795 968 681');

  b.finalizeAndSave(path.join(__dirname, '..', 'EvidCheck_Platform_Terms_of_Service.pdf'));
}

generateMSA();
generateTermsOfService();
