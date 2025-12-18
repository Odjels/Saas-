// app/api/invoice/status/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma  from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      invoices: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    isPremium: user.isPremium,
    invoiceCount: user.invoices.length,
    invoices: user.invoices,
  });
}