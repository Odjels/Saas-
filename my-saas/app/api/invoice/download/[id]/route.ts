import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  // For now, return a simple text response
  // In production, you'd use a library like jsPDF or puppeteer
  type InvoiceItem = {
    description: string;
    quantity: number;
    price: number;
  };

  const items: InvoiceItem[] = JSON.parse(invoice.items) as InvoiceItem[];
  const total = items.reduce(
    (sum: number, item: InvoiceItem) => sum + item.quantity * item.price,
    0
  );

  const pdfContent = `
INVOICE ${invoice.invoiceNumber}
${user.isPremium ? "" : "⚠️ GENERATED WITH FREE ACCOUNT - UPGRADE TO REMOVE WATERMARK"}

From: ${user.name}
To: ${invoice.clientName} (${invoice.clientEmail})

Date: ${new Date(invoice.date).toLocaleDateString()}
Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}

ITEMS:
${items.map((item: InvoiceItem) => `${item.description} - Qty: ${item.quantity} x ₦${item.price} = ₦${item.quantity * item.price}`).join("\n")}

TOTAL: ₦${total}

Notes: ${invoice.notes}
  `;

  return new NextResponse(pdfContent, {
    headers: {
      "Content-Type": "text/plain",
      "Content-Disposition": `attachment; filename="invoice-${invoice.invoiceNumber}.txt"`,
    },
  });
}