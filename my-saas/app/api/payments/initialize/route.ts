// import prisma from '@/lib/prisma';
// import { NextResponse } from 'next/server';
// import { getServerSession } from "next-auth";
// import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// export async function POST(req: Request) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session?.user?.id || !session.user.email) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const { amount } = await req.json();
//     if (!amount || typeof amount !== 'number') {
//       return NextResponse.json({ error: 'amount required' }, { status: 400 });
//     }

//     const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
//       method: 'POST',
//       headers: {
//         Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         email: session.user.email,
//         amount: amount * 100,
//         callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/callback`,
//       }),
//     });

//     const data = await paystackRes.json();
//     if (!paystackRes.ok) {
//       return NextResponse.json({ error: data.message || 'Paystack init error' }, { status: 400 });
//     }

//     await prisma.transaction.create({
//       data: {
//         userId: session.user.id,
//         reference: data.data.reference,
//         amount: amount * 100,
//         status: 'PENDING',
//         meta: data.data,
//       },
//     });

//     return NextResponse.json({
//       authorization_url: data.data.authorization_url,
//       reference: data.data.reference,
//     });
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json({ error: 'Server error' }, { status: 500 });
//   }
// }

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
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { amount } = await req.json();
  const reference = `TXN-${Date.now()}-${user.id}`;

  try {
    // Initialize payment with Paystack
    const paystackRes = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          amount: amount * 100, // Convert to kobo
          reference,
          callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/callback`,
        }),
      }
    );

    const paystackData = await paystackRes.json();

    if (paystackData.status) {
      // Save transaction to database
      await prisma.transaction.create({
        data: {
          userId: user.id,
          reference,
          amount: amount * 100,
          status: "pending",
          meta: paystackData.data,
        },
      });

      return NextResponse.json({
        authorizationUrl: paystackData.data.authorization_url,
        reference,
      });
    }

    return NextResponse.json(
      { error: "Payment initialization failed" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Payment initialization error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}