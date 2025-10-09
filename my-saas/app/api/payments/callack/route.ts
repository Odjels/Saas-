// app/api/payments/callback/route.ts
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const reference = url.searchParams.get('reference');
    if (!reference) {
      return NextResponse.redirect(new URL('/dashboard?payment=missing', process.env.NEXT_PUBLIC_APP_URL));
    }

    // Verify transaction with Paystack (server-to-server)
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    });
    const payload = await verifyRes.json();
    if (!verifyRes.ok) {
      console.error('paystack verify error', payload);
      return NextResponse.redirect(new URL(`/dashboard?payment=failed`, process.env.NEXT_PUBLIC_APP_URL));
    }

    const status = payload?.data?.status; // e.g., "success"
    // Update our transaction record
    await prisma.transaction.update({
      where: { reference },
      data: { status, meta: payload.data },
    });

    // If successful, mark user premium (simple subscription simulation)
    if (status === 'success') {
      const tx = await prisma.transaction.findUnique({ where: { reference } });
      if (tx?.userId) {
        await prisma.user.update({ where: { id: tx.userId }, data: { isPremium: true } });
      }
    }

    return NextResponse.redirect(new URL(`/dashboard?payment=${status}`, process.env.NEXT_PUBLIC_APP_URL));
  } catch (err) {
    console.error(err);
    return NextResponse.redirect(new URL(`/dashboard?payment=error`, process.env.NEXT_PUBLIC_APP_URL));
  }
}
