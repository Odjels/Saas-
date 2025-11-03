// // app/api/payments/history/route.ts
// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// //import { authOptions } from "@/lib/auth";
// import prisma from "@/lib/prisma";
// import { authOptions } from "../../auth/[...nextauth]/route";

// export async function GET() {
//   const session = await getServerSession(authOptions);
//   if (!session?.user?.email) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const user = await prisma.user.findUnique({
//     where: { email: session.user.email },
//   });

//   if (!user) {
//     return NextResponse.json({ error: "User not found" }, { status: 404 });
//   }

//   const transactions = await prisma.transaction.findMany({
//     where: { userId: user.id },
//     orderBy: { createdAt: "desc" },
//   });

//   return NextResponse.json(transactions);
// }

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

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
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user.transactions);
}