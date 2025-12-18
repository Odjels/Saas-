import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const reference = searchParams.get("reference");

  if (!reference) {
    return NextResponse.redirect(new URL("/dashboard?error=no-reference", req.url));
  }

  try {
    // 1. Double-Check Local Database First
    // Prevent unnecessary API calls if the transaction is already processed
    const existingTransaction = await prisma.transaction.findUnique({
      where: { reference },
    });

    if (existingTransaction?.status === "success") {
      return NextResponse.redirect(new URL("/dashboard?payment=success", req.url));
    }

    // 2. Verify payment with Paystack (Server-to-Server)
    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Cache-Control": "no-cache", // Ensure we get fresh data
        },
      }
    );

    const paystackData = await paystackRes.json();

    // 3. Robust Validation
    // We check: status is true AND gateway status is 'success' AND amount matches
    if (
      paystackData.status && 
      paystackData.data.status === "success" &&
      paystackData.data.amount >= 500000 // Ensure they paid at least 5000 (5000 * 100)
    ) {
      
      // 4. Use a Database Transaction
      // This ensures both the User and Transaction update together, or not at all.
      await prisma.$transaction(async (tx) => {
        const transaction = await tx.transaction.findUnique({
          where: { reference },
        });

        if (!transaction || transaction.status === "success") return;

        // Grant Premium Access
        await tx.user.update({
          where: { id: transaction.userId! },
          data: { isPremium: true },
        });

        // Mark Transaction Finished
        await tx.transaction.update({
          where: { id: transaction.id },
          data: { status: "success" },
        });
      });

      return NextResponse.redirect(new URL("/dashboard?success=true", req.url));
    }

    // If we reach here, payment was not successful
    return NextResponse.redirect(new URL("/dashboard?error=verification-failed", req.url));

  } catch (error) {
    console.error("Payment verification error:", error);
    // Log the error locally but don't show details to the user
    return NextResponse.redirect(new URL("/dashboard?error=server-error", req.url));
  }
}