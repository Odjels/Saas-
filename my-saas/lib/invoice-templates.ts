import { jsPDF } from "jspdf";

export type InvoiceData = {
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  date: string;
  dueDate: string;
  items: Array<{
    description: string;
    quantity: number;
    price: number;
  }>;
  notes?: string;
  companyName?: string;
  companyEmail?: string;
  isPremium: boolean;
};

// MODERN TEMPLATE
export function generateModernTemplate(data: InvoiceData): jsPDF {
  const doc = new jsPDF();
  const total = data.items.reduce((sum, item) => sum + item.quantity * item.price, 0);

  if (!data.isPremium) {
    doc.setFontSize(60);
    doc.setTextColor(230, 230, 230);
    doc.text("FREE VERSION", 105, 150, { align: "center", angle: 45 });
    doc.setTextColor(0, 0, 0);
  }

  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, 210, 40, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('', "bold");
  doc.text("INVOICE", 20, 25);
  doc.setFontSize(10);
  doc.setFont('', "normal");
  doc.text(data.companyName || "Your Company", 20, 33);

  doc.setTextColor(0, 0, 0);
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(130, 50, 60, 35, 3, 3, "F");
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.text("Invoice Number", 135, 58);
  doc.text("Date", 135, 68);
  doc.text("Due Date", 135, 78);
  doc.setTextColor(0, 0, 0);
  doc.setFont('', "bold");
  doc.text(data.invoiceNumber, 135, 63);
  doc.text(new Date(data.date).toLocaleDateString(), 135, 73);
  doc.text(new Date(data.dueDate).toLocaleDateString(), 135, 83);
  doc.setFont('', "normal");

  doc.setFontSize(11);
  doc.setFont('', "bold");
  doc.setTextColor(99, 102, 241);
  doc.text("BILL TO", 20, 58);
  doc.setFont('', "normal");
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text(data.clientName, 20, 66);
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.text(data.clientEmail, 20, 72);

  let yPos = 100;
  doc.setFillColor(99, 102, 241);
  doc.rect(20, yPos - 6, 170, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('', "bold");
  doc.text("DESCRIPTION", 25, yPos);
  doc.text("QTY", 130, yPos);
  doc.text("PRICE", 150, yPos);
  doc.text("TOTAL", 175, yPos);

  yPos += 10;
  doc.setTextColor(0, 0, 0);
  doc.setFont('', "normal");
  data.items.forEach((item, index) => {
    if (index % 2 === 0) {
      doc.setFillColor(249, 250, 251);
      doc.rect(20, yPos - 5, 170, 8, "F");
    }
    doc.text(item.description, 25, yPos);
    doc.text(item.quantity.toString(), 135, yPos, { align: "center" });
    doc.text(`₦${item.price.toLocaleString()}`, 155, yPos);
    doc.text(`₦${(item.quantity * item.price).toLocaleString()}`, 185, yPos, { align: "right" });
    yPos += 10;
  });

  yPos += 5;
  doc.setFillColor(99, 102, 241);
  doc.rect(20, yPos - 3, 170, 12, "F");
  doc.setFontSize(12);
  doc.setFont('', "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("TOTAL", 130, yPos + 4);
  doc.text(`₦${total.toLocaleString()}`, 185, yPos + 4, { align: "right" });

  if (data.notes) {
    yPos += 20;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('', "bold");
    doc.text("Notes:", 20, yPos);
    doc.setFont('', "normal");
    doc.setTextColor(107, 114, 128);
    doc.text(data.notes, 20, yPos + 5, { maxWidth: 170 });
  }

  return doc;
}

// CLASSIC TEMPLATE
export function generateClassicTemplate(data: InvoiceData): jsPDF {
  const doc = new jsPDF();
  const total = data.items.reduce((sum, item) => sum + item.quantity * item.price, 0);

  if (!data.isPremium) {
    doc.setFontSize(60);
    doc.setTextColor(230, 230, 230);
    doc.text("FREE VERSION", 105, 150, { align: "center", angle: 45 });
    doc.setTextColor(0, 0, 0);
  }

  doc.setLineWidth(0.5);
  doc.line(20, 20, 190, 20);
  doc.line(20, 45, 190, 45);
  doc.setFontSize(32);
  doc.setFont('', "bold");
  doc.text("INVOICE", 105, 35, { align: "center" });

  doc.setFontSize(10);
  doc.setFont('', "normal");
  doc.text(data.companyName || "Your Company", 20, 55);
  doc.text(data.companyEmail || "info@yourcompany.com", 20, 61);

  doc.setFont('', "bold");
  doc.text("Invoice #:", 140, 55);
  doc.text("Date:", 140, 61);
  doc.text("Due Date:", 140, 67);
  doc.setFont('', "normal");
  doc.text(data.invoiceNumber, 165, 55);
  doc.text(new Date(data.date).toLocaleDateString(), 165, 61);
  doc.text(new Date(data.dueDate).toLocaleDateString(), 165, 67);

  doc.setFont('', "bold");
  doc.text("BILL TO:", 20, 80);
  doc.setFont('', "normal");
  doc.text(data.clientName, 20, 87);
  doc.text(data.clientEmail, 20, 93);

  let yPos = 110;
  doc.line(20, yPos, 190, yPos);
  doc.setFont('', "bold");
  doc.text("Description", 25, yPos + 6);
  doc.text("Qty", 120, yPos + 6);
  doc.text("Price", 145, yPos + 6);
  doc.text("Amount", 170, yPos + 6);
  yPos += 10;
  doc.line(20, yPos, 190, yPos);

  doc.setFont('', "normal");
  yPos += 7;
  data.items.forEach((item) => {
    doc.text(item.description, 25, yPos);
    doc.text(item.quantity.toString(), 125, yPos, { align: "center" });
    doc.text(`₦${item.price.toLocaleString()}`, 150, yPos);
    doc.text(`₦${(item.quantity * item.price).toLocaleString()}`, 185, yPos, { align: "right" });
    yPos += 8;
  });

  doc.line(20, yPos, 190, yPos);
  yPos += 10;
  doc.setLineWidth(1);
  doc.line(140, yPos - 3, 190, yPos - 3);
  doc.line(140, yPos, 190, yPos);
  doc.setFont('', "bold");
  doc.setFontSize(12);
  doc.text("TOTAL:", 145, yPos + 6);
  doc.text(`₦${total.toLocaleString()}`, 185, yPos + 6, { align: "right" });

  if (data.notes) {
    yPos += 20;
    doc.setFontSize(9);
    doc.setFont('', "bold");
    doc.text("Notes:", 20, yPos);
    doc.setFont('', "normal");
    doc.text(data.notes, 20, yPos + 5, { maxWidth: 170 });
  }

  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text("Thank you for your business!", 105, 280, { align: "center" });

  return doc;
}

// MINIMAL TEMPLATE
export function generateMinimalTemplate(data: InvoiceData): jsPDF {
  const doc = new jsPDF();
  const total = data.items.reduce((sum, item) => sum + item.quantity * item.price, 0);

  if (!data.isPremium) {
    doc.setFontSize(60);
    doc.setTextColor(230, 230, 230);
    doc.text("FREE VERSION", 105, 150, { align: "center", angle: 45 });
    doc.setTextColor(0, 0, 0);
  }

  doc.setFontSize(36);
  doc.setFont('', "bold");
  doc.setTextColor(50, 50, 50);
  doc.text("Invoice", 20, 30);
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(20, 35, 190, 35);

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont('', "normal");
  doc.text("From", 20, 50);
  doc.setTextColor(0, 0, 0);
  doc.text(data.companyName || "Your Company", 20, 56);
  doc.setTextColor(100, 100, 100);
  doc.text(data.companyEmail || "info@company.com", 20, 61);

  doc.text("Invoice Number", 130, 50);
  doc.setTextColor(0, 0, 0);
  doc.text(data.invoiceNumber, 130, 56);
  doc.setTextColor(100, 100, 100);
  doc.text("Issued", 130, 63);
  doc.setTextColor(0, 0, 0);
  doc.text(new Date(data.date).toLocaleDateString(), 130, 68);
  doc.setTextColor(100, 100, 100);
  doc.text("Due", 160, 63);
  doc.setTextColor(0, 0, 0);
  doc.text(new Date(data.dueDate).toLocaleDateString(), 160, 68);

  doc.setTextColor(100, 100, 100);
  doc.text("To", 20, 80);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text(data.clientName, 20, 86);
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(data.clientEmail, 20, 91);

  let yPos = 110;
  doc.setFontSize(8);
  doc.text("DESCRIPTION", 20, yPos);
  doc.text("QTY", 130, yPos);
  doc.text("RATE", 150, yPos);
  doc.text("AMOUNT", 175, yPos);
  doc.line(20, yPos + 2, 190, yPos + 2);

  yPos += 8;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  data.items.forEach((item) => {
    doc.text(item.description, 20, yPos);
    doc.text(item.quantity.toString(), 135, yPos, { align: "center" });
    doc.text(`₦${item.price.toLocaleString()}`, 155, yPos);
    doc.text(`₦${(item.quantity * item.price).toLocaleString()}`, 188, yPos, { align: "right" });
    yPos += 8;
  });

  yPos += 5;
  doc.line(150, yPos, 190, yPos);
  yPos += 8;
  doc.setFont('', "bold");
  doc.setFontSize(11);
  doc.text("Total", 150, yPos);
  doc.text(`₦${total.toLocaleString()}`, 188, yPos, { align: "right" });

  if (data.notes) {
    yPos += 15;
    doc.setFont('', "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("Notes", 20, yPos);
    doc.setTextColor(0, 0, 0);
    doc.text(data.notes, 20, yPos + 5, { maxWidth: 170 });
  }

  return doc;
}

export function generateInvoicePDF(
  data: InvoiceData,
  template: "modern" | "classic" | "minimal" = "modern"
): jsPDF {
  switch (template) {
    case "classic":
      return generateClassicTemplate(data);
    case "minimal":
      return generateMinimalTemplate(data);
    case "modern":
    default:
      return generateModernTemplate(data);
  }
}