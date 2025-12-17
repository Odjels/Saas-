
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { generateInvoicePDF } from "@/lib/invoice-templates";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // unwrap the promise

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
        id, // use id here
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
      items,
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
