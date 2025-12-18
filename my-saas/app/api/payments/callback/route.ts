import { NextResponse } from "next/server";
import prisma  from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const reference = searchParams.get("reference");

  if (!reference) {
    return NextResponse.redirect(new URL("/dashboard?error=no-reference", req.url));
  }

  try {
    // Verify payment with Paystack
    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const paystackData = await paystackRes.json();

    if (paystackData.status && paystackData.data.status === "success") {
      // Find the transaction in our database
      const transaction = await prisma.transaction.findUnique({
        where: { reference },
        include: { user: true },
      });

      if (transaction && transaction.user) {
        // Update user to premium
        await prisma.user.update({
          where: { id: transaction.userId! },
          data: { isPremium: true },
        });

        // Update transaction status
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: { status: "success" },
        });

        return NextResponse.redirect(
          new URL("/dashboard?payment=success", req.url)
        );
      }
    }

    return NextResponse.redirect(
      new URL("/dashboard?payment=failed", req.url)
    );
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.redirect(
      new URL("/dashboard?payment=error", req.url)
    );
  }
}