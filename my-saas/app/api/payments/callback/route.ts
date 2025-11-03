// // app/api/payments/callback/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import prisma from "@/lib/prisma";

// export async function GET(req: NextRequest) {
//   const { searchParams } = new URL(req.url);
//   const reference = searchParams.get("reference");

//   if (!reference) {
//     return NextResponse.redirect(new URL("/dashboard?error=missing_ref", req.url));
//   }

//   try {
//     // Verify with Paystack
//     const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
//       headers: {
//         Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//       },
//     });
//     const data = await res.json();

//     if (data.status && data.data.status === "success") {
//       const email = data.data.customer.email;
//       const amount = data.data.amount; // comes in kobo

//       // Find user
//       const user = await prisma.user.findUnique({ where: { email } });

//       if (user) {
//         // Save transaction
//         await prisma.transaction.create({
//           data: {
//             amount,
//             status: "success",
//             reference,
//             userId: user.id,
//           },
//         });

//         // Update subscription
//         await prisma.user.update({
//           where: { id: user.id },
//           data: { isPremium: true },
//         });
//       }

//       // ✅ Redirect with success
//       return NextResponse.redirect(new URL("/dashboard?payment=success", req.url));
//     } else {
//       // Save failed transaction if possible
//       const email = data.data?.customer?.email;

//       if (email) {
//         const user = await prisma.user.findUnique({ where: { email } });
//         if (user) {
//           await prisma.transaction.create({
//             data: {
//               amount: data.data?.amount || 0,
//               status: "failed",
//               reference,
//               userId: user.id,
//             },
//           });
//         }
//       }

//       return NextResponse.redirect(new URL("/dashboard?payment=failed", req.url));
//     }
//   } catch (error) {
//     console.error("Paystack verify error:", error);
//     return NextResponse.redirect(new URL("/dashboard?error=verification_failed", req.url));
//   }
// }

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