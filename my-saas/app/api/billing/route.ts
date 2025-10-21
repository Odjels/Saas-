// app/api/billing/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
//import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";

// Fetch billing info
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 1, // last payment only
      },
    },
  });

  return NextResponse.json({
    subscription: user?.isPremium ? "Premium" : "Free",
    lastPayment: user?.transactions[0] || null,
  });
}

// Cancel subscription
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.user.update({
    where: { email: session.user.email },
    data: { isPremium: false },
  });

  return NextResponse.json({ success: true });
}
