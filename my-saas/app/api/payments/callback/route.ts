// app/api/payments/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const reference = searchParams.get("reference");

  if (!reference) {
    return NextResponse.redirect(new URL("/dashboard?error=missing_ref", req.url));
  }

  try {
    // Verify with Paystack
    const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });
    const data = await res.json();

    if (data.status && data.data.status === "success") {
      const email = data.data.customer.email;
      const amount = data.data.amount; // comes in kobo

      // Find user
      const user = await prisma.user.findUnique({ where: { email } });

      if (user) {
        // Save transaction
        await prisma.transaction.create({
          data: {
            amount,
            status: "success",
            reference,
            userId: user.id,
          },
        });

        // Update subscription
        await prisma.user.update({
          where: { id: user.id },
          data: { isPremium: true },
        });
      }

      // ✅ Redirect with success
      return NextResponse.redirect(new URL("/dashboard?payment=success", req.url));
    } else {
      // Save failed transaction if possible
      const email = data.data?.customer?.email;

      if (email) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (user) {
          await prisma.transaction.create({
            data: {
              amount: data.data?.amount || 0,
              status: "failed",
              reference,
              userId: user.id,
            },
          });
        }
      }

      return NextResponse.redirect(new URL("/dashboard?payment=failed", req.url));
    }
  } catch (error) {
    console.error("Paystack verify error:", error);
    return NextResponse.redirect(new URL("/dashboard?error=verification_failed", req.url));
  }
}
