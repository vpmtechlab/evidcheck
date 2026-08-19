import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Utility to trigger a browser download of a CSV file.
 */
export function downloadCSV(data: Record<string, string | number | boolean | null | undefined>[], filename: string) {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header] ?? "";
          return typeof value === "string" && value.includes(",")
            ? `"${value.replace(/"/g, '""')}"`
            : value;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Professional PDF download using jsPDF and autoTable.
 */
export function downloadPDF(
  headers: string[], 
  rows: (string | number)[][], 
  filename: string,
  title: string = "Compliance Report"
) {
  const doc = new jsPDF();
  
  // 1. Add Header
  doc.setFontSize(20);
  doc.setTextColor(2, 62, 74); // Brand Color: #023e4a
  doc.text("EVIDCHECK", 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("SECURE COMPLIANCE INFRASTRUCTURE", 14, 28);
  
  doc.setDrawColor(200);
  doc.line(14, 32, 196, 32);
  
  // 2. Add Report Title & Metadata
  doc.setFontSize(16);
  doc.setTextColor(40);
  doc.text(title, 14, 45);
  
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 52);
  doc.text(`Format: PDF Document`, 14, 57);
  
  // 3. Add Table
  autoTable(doc, {
    startY: 65,
    head: [headers],
    body: rows,
    theme: 'striped',
    headStyles: { fillColor: [2, 62, 74], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { top: 65 },
    styles: { fontSize: 8, cellPadding: 3 },
  });
  
  // 4. Add Footer (on each page)
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount} - Private & Confidential - EvidCheck.com`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  doc.save(`${filename}.pdf`);
}
