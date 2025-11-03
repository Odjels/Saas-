import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { invoices: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Check limits for free users
  if (!user.isPremium && user.invoices.length >= 5) {
    return NextResponse.json(
      { error: "Free tier limit reached. Upgrade to Premium for unlimited invoices." },
      { status: 403 }
    );
  }

  const body = await req.json();
  const { clientName, clientEmail, date, dueDate, items, notes } = body;

  // Generate invoice number
  const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const invoice = await prisma.invoice.create({
    data: {
      userId: user.id,
      invoiceNumber,
      clientName,
      clientEmail,
      date: new Date(date),
      dueDate: new Date(dueDate),
      items: JSON.stringify(items),
      notes: notes || "",
    },
  });

  return NextResponse.json(invoice);
}