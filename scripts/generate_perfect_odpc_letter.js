const fs = require('fs');
const path = require('path');
const { jsPDF } = require('jspdf');

function generatePerfectLetter() {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginLeft = 48;
  const marginRight = 48;
  const contentWidth = pageWidth - marginLeft - marginRight;

  let y = 36;

  // 1. Corporate Letterhead Banner
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(marginLeft, y, contentWidth, 48, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('EVIDCHECK LIMITED', marginLeft + 14, y + 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(224, 242, 254);
  doc.text('Reg No: PVT-OD16ZV23  |  NAIROBI, KENYA  |  Email: moses.karani@evidcheck.com  |  Tel: +254 795 968 681', marginLeft + 14, y + 36);

  y += 60;

  // 2. Date & Reference Line (clean 2-column)
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Ref: EVC/CORR/ODPC/2026/01', marginLeft, y);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  const dateText = 'Date: 24th November 2026';
  const dateWidth = doc.getTextWidth(dateText);
  doc.text(dateText, marginLeft + contentWidth - dateWidth, y);

  y += 18;

  // 3. Addressee Block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.8);
  doc.setTextColor(15, 23, 42);
  doc.text('The Data Commissioner,', marginLeft, y);
  y += 12;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text('Office of the Data Protection Commissioner (ODPC),', marginLeft, y);
  y += 12;
  doc.text('Britam Tower, 13th Floor, Hospital Road, Upper Hill,', marginLeft, y);
  y += 12;
  doc.text('P.O. Box 30920 - 00100,', marginLeft, y);
  y += 12;
  doc.text('NAIROBI, KENYA.', marginLeft, y);

  y += 16;

  // 4. Subject Box (clean highlighted callout box)
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(2, 132, 199);
  doc.setLineWidth(1);
  doc.roundedRect(marginLeft, y, contentWidth, 36, 3, 3, 'FD');

  // Accent left border
  doc.setFillColor(2, 132, 199);
  doc.rect(marginLeft, y, 3.5, 36, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('RE: REQUEST FOR REGULATORY LETTER OF INTRODUCTION FOR IPRS SYSTEM INTEGRATION', marginLeft + 12, y + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Statutory Reference: IPRS Directorate Invitation Letter Ref: IPRS/ADM/32/907 (2)', marginLeft + 12, y + 27);

  y += 48;

  // 5. Salutation & Body Paragraphs
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.6);
  doc.setTextColor(51, 65, 85);

  const para1 = 'We write to your esteemed office on behalf of EvidCheck Limited (Company Registration No: PVT-OD16ZV23), an incorporated Kenyan technology company registered as a Data Controller and Data Processor under the Data Protection Act (2019).';
  const lines1 = doc.splitTextToSize(para1, contentWidth);
  lines1.forEach(l => { doc.text(l, marginLeft, y); y += 11.5; });
  y += 5;

  const para2 = 'EvidCheck Limited operates an enterprise background screening and Know Your Customer (KYC) verification platform. To protect Kenyan employers, financial institutions, and citizens from identity theft, impersonation fraud, and credential falsification, we formally applied to the Ministry of Interior and National Administration for API integration with the Integrated Population Registration Services (IPRS).';
  const lines2 = doc.splitTextToSize(para2, contentWidth);
  lines2.forEach(l => { doc.text(l, marginLeft, y); y += 11.5; });
  y += 5;

  const para3 = 'The IPRS Directorate has formally invited our executive and technical delegation for an onboarding and evaluation meeting on Wednesday, 25th November 2026 at Nyayo House (Ref: IPRS/ADM/32/907 (2)). As a mandatory prerequisite for integration approval, IPRS requires an official letter of introduction from our primary data regulatory authority.';
  const lines3 = doc.splitTextToSize(para3, contentWidth);
  lines3.forEach(l => { doc.text(l, marginLeft, y); y += 11.5; });
  y += 5;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('We affirm that EvidCheck Limited operates in strict fidelity to the Data Protection Act (2019):', marginLeft, y);
  y += 13;

  // Bullets with clean indentation & guaranteed spacing
  const bullets = [
    { title: 'Mandatory User Consent:', desc: 'Every identity verification lookup is executed solely upon verifiable, prior explicit consent from the data subject.' },
    { title: 'Zero-Caching Architecture:', desc: 'EvidCheck enforces zero persistent local storage of raw national population registry records, conducting strictly point-in-time stateless validations.' },
    { title: 'Immutable Audit Trails:', desc: 'All verification activities maintain cryptographic audit logs for non-repudiation and statutory 7-year regulatory compliance.' }
  ];

  bullets.forEach(b => {
    doc.setTextColor(2, 132, 199);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.6);
    doc.text('•', marginLeft + 6, y);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(b.title, marginLeft + 16, y);

    const titleW = doc.getTextWidth(b.title) + 5; // Explicit 5pt gap
    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'normal');

    const restLines = doc.splitTextToSize(b.desc, contentWidth - 16 - titleW);
    doc.text(restLines[0], marginLeft + 16 + titleW, y);
    y += 11.5;

    if (restLines.length > 1) {
      for (let i = 1; i < restLines.length; i++) {
        doc.text(restLines[i], marginLeft + 16, y);
        y += 11.5;
      }
    }
    y += 2.5;
  });

  y += 4;

  const para4 = 'We therefore humbly request your office to issue an official Letter of Introduction / Regulatory Clearance addressed to the Director, IPRS Directorate, confirming EvidCheck Limited’s regularized compliance standing.';
  const lines4 = doc.splitTextToSize(para4, contentWidth);
  lines4.forEach(l => { doc.text(l, marginLeft, y); y += 11.5; });
  y += 6;

  // Enclosures Box (Clean 3 rows, no multi-column overlap)
  const encBoxHeight = 48;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(marginLeft, y, contentWidth, encBoxHeight, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.setTextColor(100, 116, 139);
  doc.text('ATTACHED DOCUMENTS FOR REFERENCE:', marginLeft + 10, y + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(51, 65, 85);
  doc.text('1. EvidCheck Limited Certificate of Incorporation (PVT-OD16ZV23) and CR12 Form.', marginLeft + 10, y + 22);
  doc.text('2. Proof of ODPC Data Handler Registration Application & Payment Receipt (Ksh 4,000).', marginLeft + 10, y + 33);
  doc.text('3. Copy of IPRS Directorate Invitation Letter (Ref: IPRS/ADM/32/907 (2)).', marginLeft + 10, y + 44);

  y += encBoxHeight + 12;

  // Signatures Side by Side
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.2);
  doc.setTextColor(100, 116, 139);
  doc.text('Yours faithfully, for and on behalf of EvidCheck Limited:', marginLeft, y);

  y += 26;

  const sigColW = (contentWidth - 40) / 2;

  // Signer 1: Viola Masanja
  doc.setDrawColor(100, 116, 139);
  doc.setLineWidth(0.8);
  doc.line(marginLeft, y, marginLeft + sigColW - 20, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Viola Masanja', marginLeft, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Director / Co-Founder', marginLeft, y + 22);
  doc.text('EvidCheck Limited', marginLeft, y + 32);

  // Signer 2: CTO
  const col2X = marginLeft + sigColW + 40;
  doc.line(col2X, y, col2X + sigColW - 20, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Chief Technology Officer (CTO)', col2X, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Director / Co-Founder', col2X, y + 22);
  doc.text('EvidCheck Limited', col2X, y + 32);

  // Running Footer
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(marginLeft, pageHeight - 30, marginLeft + contentWidth, pageHeight - 30);

  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('EvidCheck Limited  |  Official Regulatory Correspondence to the ODPC', marginLeft, pageHeight - 18);
  doc.text('Page 1 of 1', marginLeft + contentWidth - 46, pageHeight - 18);

  const totalPages = doc.internal.getNumberOfPages();
  const dest = path.join(process.cwd(), 'EvidCheck_ODPC_Letter_of_Introduction_Request.pdf');
  const buffer = Buffer.from(doc.output('arraybuffer'));
  fs.writeFileSync(dest, buffer);
  console.log(`Generated perfect letter: ${totalPages} page(s) (${(buffer.length / 1024).toFixed(1)} KB)`);
  return totalPages;
}

generatePerfectLetter();
