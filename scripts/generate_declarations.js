const fs = require('fs');
const path = require('path');
const { jsPDF } = require('jspdf');

function makeDeclaration(title, docRef, bodyText) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const w = doc.internal.pageSize.getWidth();
  const marginLeft = 48;
  const contentWidth = w - 96;

  // Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(marginLeft, 50, contentWidth, 54, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('EVIDCHECK LIMITED', marginLeft + 16, 73);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(224, 242, 254);
  doc.text('OFFICIAL STATUTORY DECLARATION', marginLeft + 16, 91);

  // Metadata Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(1);
  doc.roundedRect(marginLeft, 114, contentWidth, 44, 4, 4, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('Document Ref:', marginLeft + 14, 131);
  doc.text('Addressee:', marginLeft + 230, 131);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(docRef, marginLeft + 85, 131);
  doc.text('Office of the Data Protection Commissioner (ODPC)', marginLeft + 288, 131);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('Date:', marginLeft + 14, 146);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text('24th November 2026', marginLeft + 45, 146);

  // Subject Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(title.toUpperCase(), marginLeft, 184);

  doc.setDrawColor(2, 132, 199);
  doc.setLineWidth(1.2);
  doc.line(marginLeft, 189, marginLeft + contentWidth, 189);

  // Paragraphs
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);
  let y = 212;

  bodyText.forEach(paragraph => {
    const lines = doc.splitTextToSize(paragraph, contentWidth);
    lines.forEach(l => {
      doc.text(l, marginLeft, y);
      y += 14.5;
    });
    y += 9;
  });

  // Sign-off Block
  y += 18;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.8);
  doc.line(marginLeft, y, marginLeft + contentWidth, y);
  y += 24;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Declared, confirmed, and executed by:', marginLeft, y);
  y += 34;

  // Signature underline
  doc.setDrawColor(100, 116, 139);
  doc.setLineWidth(0.8);
  doc.line(marginLeft, y, marginLeft + 220, y);
  y += 14;

  // Name & Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Viola Masanja', marginLeft, y);
  y += 13;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Director / Co-Founder', marginLeft, y);
  y += 12;
  doc.text('EvidCheck Limited', marginLeft, y);
  y += 12;
  doc.text('Date: 24th November 2026', marginLeft, y);

  // Running Footer
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(marginLeft, 790, marginLeft + contentWidth, 790);

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('EvidCheck Limited  |  Statutory Compliance Declaration for ODPC Registration', marginLeft, 804);
  doc.text('Page 1 of 1', marginLeft + contentWidth - 48, 804);

  return doc;
}

// 1. TURNOVER DECLARATION
const turnoverDoc = makeDeclaration(
  'Statutory Declaration of Annual Turnover / Gross Revenue',
  'EVC-DEC-TURNOVER-2026-01',
  [
    'TO: THE OFFICE OF THE DATA PROTECTION COMMISSIONER (ODPC)',
    'I, the undersigned, VIOLA MASANJA, being a Director and Co-Founder of EvidCheck Limited (Incorporated under the Companies Act of Kenya), do hereby make this solemn declaration as follows:',
    '1. That EvidCheck Limited is an incorporated Kenyan technology company operating a digital background screening, Know Your Customer (KYC), and credential verification platform.',
    '2. That for the preceding accounting period / inception financial period, the total annual turnover and gross revenue of EvidCheck Limited was below Kenya Shillings Five Million (KES < 5,000,000).',
    '3. That pursuant to the Second Schedule of the Data Protection (Registration of Data Controllers and Data Processors) Regulations, 2021, EvidCheck Limited qualifies under the statutory fee threshold for micro/small enterprise data handlers with annual turnover under KES 5,000,000.',
    '4. That this declaration is made in good faith and in official support of our application for registration as a Data Controller / Data Processor under the Data Protection Act (2019).',
    '5. That the information provided herein is true, accurate, and complete to the best of my knowledge, information, and belief.'
  ]
);

fs.writeFileSync('EvidCheck_Declaration_of_Turnover.pdf', Buffer.from(turnoverDoc.output('arraybuffer')));
console.log('Regenerated: EvidCheck_Declaration_of_Turnover.pdf');

// 2. EMPLOYEE DECLARATION
const empDoc = makeDeclaration(
  'Statutory Declaration of Total Number of Employees',
  'EVC-DEC-EMP-2026-01',
  [
    'TO: THE OFFICE OF THE DATA PROTECTION COMMISSIONER (ODPC)',
    'I, the undersigned, VIOLA MASANJA, being a Director and Co-Founder of EvidCheck Limited (Incorporated under the Companies Act of Kenya), do hereby make this solemn declaration as follows:',
    '1. That EvidCheck Limited maintains an organizational staff establishment of fewer than ten (10) active personnel (comprising executive directors/founders and core technical staff).',
    '2. That the current staff establishment of EvidCheck Limited stands at four (4) full-time personnel and directors.',
    '3. That all personnel with administrative or operational access to candidate and customer data have executed legally binding confidentiality agreements and are bound by the company Information Security Policy and Data Privacy Policy.',
    '4. That pursuant to the Second Schedule of the Data Protection (Registration of Data Controllers and Data Processors) Regulations, 2021, EvidCheck Limited qualifies under the fee schedule for organizations with fewer than ten (10) employees.',
    '5. That this declaration is executed in official support of our statutory registration application with the Office of the Data Protection Commissioner.'
  ]
);

fs.writeFileSync('EvidCheck_Declaration_of_Employees.pdf', Buffer.from(empDoc.output('arraybuffer')));
console.log('Regenerated: EvidCheck_Declaration_of_Employees.pdf');
