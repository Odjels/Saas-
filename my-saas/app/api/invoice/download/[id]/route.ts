
// // app/api/invoice/download/[id]/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// import prisma from "@/lib/prisma";
// import { jsPDF } from "jspdf";
// import { generateInvoicePDF } from "@/lib/invoice-templates";
   
//    // Get template from query
//    const template = searchParam.get("template") || "modern";
   
//    // Generate PDF
//    const doc = generateInvoicePDF(invoiceData, template as any);

// export async function GET(
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.email) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     // Get user and invoice
//     const user = await prisma.user.findUnique({
//       where: { email: session.user.email },
//     });

//     if (!user) {
//       return NextResponse.json({ error: "User not found" }, { status: 404 });
//     }

//     const invoice = await prisma.invoice.findFirst({
//       where: {
//         id: params.id,
//         userId: user.id,
//       },
//     });

//     if (!invoice) {
//       return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
//     }

//      type InvoiceItem = {
//     description: string;
//     quantity: number;
//     price: number;
//   };

//   const items: InvoiceItem[] = JSON.parse(invoice.items) as InvoiceItem[];
//   const total = items.reduce(
//     (sum: number, item: InvoiceItem) => sum + item.quantity * item.price,
//     0
//   );
//     // Parse items
//     // const items = JSON.parse(invoice.items as string);
//     // const total = items.reduce(
//     //   (sum: number, item: any) => sum + item.quantity * item.price,
//     //   0
//     // );

//     // Generate PDF
//     const doc = new jsPDF();
    
//     // Add watermark for free users
//     if (!user.isPremium) {
//       doc.setFontSize(50);
//       doc.setTextColor(200, 200, 200);
//       doc.text("FREE VERSION", 105, 150, {
//         align: "center",
//         angle: 45,
//       });
//     }

//     // Header
//     doc.setFontSize(24);
//     doc.setTextColor(0, 0, 0);
//     doc.text("INVOICE", 20, 20);

//     // Invoice details
//     doc.setFontSize(10);
//     doc.text(`Invoice Number: ${invoice.invoiceNumber}`, 20, 35);
//     doc.text(`Date: ${new Date(invoice.date).toLocaleDateString()}`, 20, 42);
//     doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 20, 49);

//     // Client details
//     doc.setFontSize(12);
//     doc.text("Bill To:", 20, 65);
//     doc.setFontSize(10);
//     doc.text(invoice.clientName, 20, 72);
//     doc.text(invoice.clientEmail, 20, 79);

//     // Items table header
//     doc.setFontSize(10);
//     doc.setFont('', "bold");
//     doc.text("Description", 20, 100);
//     doc.text("Qty", 120, 100);
//     doc.text("Price", 145, 100);
//     doc.text("Total", 170, 100);
    
//     // Draw line
//     doc.line(20, 102, 190, 102);

//     // Items
//     doc.setFont('', "normal");
//     let yPos = 110;
//     items.forEach((item: InvoiceItem) => {
//       doc.text(item.description, 20, yPos);
//       doc.text(item.quantity.toString(), 120, yPos);
//       doc.text(`₦${item.price.toLocaleString()}`, 145, yPos);
//       doc.text(`₦${(item.quantity * item.price).toLocaleString()}`, 170, yPos);
//       yPos += 7;
//     });

//     // Total
//     doc.line(20, yPos, 190, yPos);
//     yPos += 7;
//     doc.setFont('', "bold");
//     doc.setFontSize(12);
//     doc.text(`Total: ₦${total.toLocaleString()}`, 170, yPos, { align: "right" });

//     // Notes
//     if (invoice.notes) {
//       yPos += 15;
//       doc.setFont('', "normal");
//       doc.setFontSize(10);
//       doc.text("Notes:", 20, yPos);
//       doc.text(invoice.notes, 20, yPos + 7, { maxWidth: 170 });
//     }

//     // Convert to buffer
//     const pdfBuffer = doc.output("arraybuffer");

//     return new NextResponse(pdfBuffer, {
//       headers: {
//         "Content-Type": "application/pdf",
//         "Content-Disposition": `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
//       },
//     });
//   } catch (error) {
//     console.error("PDF generation error:", error);
//     return NextResponse.json(
//       { error: "Failed to generate PDF" },
//       { status: 500 }
//     );
//   }
// }

// app/api/invoice/download/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { generateInvoicePDF } from "@/lib/invoice-templates";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get template from query params (default: modern)
    const { searchParams } = new URL(req.url);
    const template = (searchParams.get("template") || "modern") as "modern" | "classic" | "minimal";

    // Get user and invoice
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Parse items with proper typing
    type InvoiceItem = {
      description: string;
      quantity: number;
      price: number;
    };

    const items: InvoiceItem[] = JSON.parse(invoice.items) as InvoiceItem[];

    // Prepare invoice data
    const invoiceData = {
      invoiceNumber: invoice.invoiceNumber,
      clientName: invoice.clientName,
      clientEmail: invoice.clientEmail,
      date: invoice.date.toISOString(),
      dueDate: invoice.dueDate.toISOString(),
      items: items,
      notes: invoice.notes || undefined,
      companyName: user.name || "Your Company",
      companyEmail: user.email,
      isPremium: user.isPremium,
    };

    // Generate PDF with selected template
    const doc = generateInvoicePDF(invoiceData, template);

    // Convert to buffer
    const pdfBuffer = doc.output("arraybuffer");

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${invoice.invoiceNumber}-${template}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}