import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { z } from "zod"; 

// 2. Define a strict schema for the request body
const paymentSchema = z.object({
  // Ensure amount is exactly what you expect (e.g., 5000)
  // This prevents users from sending 1.00 via Postman to get Premium
  amount: z.number().min(5000, "Minimum upgrade amount is 5000"), 
});

export async function POST(req: Request) {
  try {
    // 3. Authenticate the user
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 4. Validate the input body
    const body = await req.json();
    const validation = paymentSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message }, 
        { status: 400 }
      );
    }

    const { amount } = validation.data;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 5. Check if user is already Premium (Don't let them pay twice)
    if (user.isPremium) {
       return NextResponse.json({ error: "User is already premium" }, { status: 400 });
    }

    const reference = `TXN-${Date.now()}-${user.id}`;

    if (!process.env.PAYSTACK_SECRET_KEY) {
       console.error("Critical: Missing PAYSTACK_SECRET_KEY");
       return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

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
          amount: amount * 100, // Paystack works in Kobo/Cents
          reference,
          // 6. Use a safe environment variable for callback
          callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/callback`,
        }),
      }
    );

    const paystackData = await paystackRes.json();

    if (paystackData.status) {
      // 7. Save transaction with strict typing
      await prisma.transaction.create({
        data: {
          userId: user.id,
          reference,
          amount: amount * 100,
          status: "pending",
          // meta: paystackData.data, // Be careful saving raw API responses
        },
      });

      return NextResponse.json({
        authorizationUrl: paystackData.data.authorization_url,
        reference,
      });
    }

    return NextResponse.json(
      { error: "Payment provider error. Please try again later." },
      { status: 400 }
    );
  } catch (error) {
    // 8. Sanitize error logging (Don't send the full 'error' object to the client)
    console.error("Payment initialization error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}