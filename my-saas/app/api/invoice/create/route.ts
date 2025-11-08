// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "../../auth/[...nextauth]/route";
// import prisma from "@/lib/prisma";

// export async function POST(req: Request) {
//   const session = await getServerSession(authOptions);
//   if (!session?.user?.email) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const user = await prisma.user.findUnique({
//     where: { email: session.user.email },
//     include: { invoices: true },
//   });

//   if (!user) {
//     return NextResponse.json({ error: "User not found" }, { status: 404 });
//   }

//   // Check limits for free users
//   if (!user.isPremium && user.invoices.length >= 5) {
//     return NextResponse.json(
//       { error: "Free tier limit reached. Upgrade to Premium for unlimited invoices." },
//       { status: 403 }
//     );
//   }

//   const body = await req.json();
//   const { clientName, clientEmail, date, dueDate, items, notes } = body;

//   // Generate invoice number
//   const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

//   const invoice = await prisma.invoice.create({
//     data: {
//       userId: user.id,
//       invoiceNumber,
//       clientName,
//       clientEmail,
//       date: new Date(date),
//       dueDate: new Date(dueDate),
//       items: JSON.stringify(items),
//       notes: notes || "",
//     },
//   });

//   return NextResponse.json(invoice);
// }

// app/api/invoice/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
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

    // Check invoice limit for free users
    if (!user.isPremium) {
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);

      const invoiceCount = await prisma.invoice.count({
        where: {
          userId: user.id,
          createdAt: { gte: currentMonth },
        },
      });

      if (invoiceCount >= 5) {
        return NextResponse.json(
          { error: "Free users are limited to 5 invoices per month" },
          { status: 403 }
        );
      }
    }

    const body = await req.json();
    const { clientName, clientEmail, date, dueDate, items, notes } = body;

    // Calculate total from items
    const total = items.reduce(
      (sum: number, item: { quantity: number; price: number }) =>
        sum + item.quantity * item.price,
      0
    );

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber();

    // Try to find existing client
    let clientId = null;
    const existingClient = await prisma.client.findFirst({
      where: {
        userId: user.id,
        email: clientEmail,
      },
    });

    if (existingClient) {
      clientId = existingClient.id;
    }

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        userId: user.id,
        clientId: clientId,
        invoiceNumber,
        clientName,
        clientEmail,
        date: new Date(date),
        dueDate: new Date(dueDate),
        items: JSON.stringify(items),
        notes: notes || "",
        status: "PENDING",
        total: total,
      },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Create invoice error:", error);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}

// Helper function to generate unique invoice number
async function generateInvoiceNumber(): Promise<string> {
  const prefix = "INV";
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  
  // Get count of invoices this month for sequential numbering
  const monthStart = new Date(year, date.getMonth(), 1);
  const count = await prisma.invoice.count({
    where: {
      createdAt: {
        gte: monthStart,
      },
    },
  });
  
  const sequence = String(count + 1).padStart(4, "0");
  return `${prefix}-${year}${month}-${sequence}`;
}