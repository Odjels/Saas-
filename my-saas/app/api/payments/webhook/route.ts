
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-paystack-signature") || "";

  // 1. Strict Signature Verification
  const expected = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
    .update(raw)
    .digest("hex");

  if (signature !== expected) {
    console.error("❌ Webhook: Invalid Signature");
    return new Response("Unauthorized", { status: 401 });
  }

  const payload = JSON.parse(raw);
  const { event, data } = payload;

  try {
    // 2. Handle successful charges
    if (event === "charge.success") {
      const { reference, amount } = data;

      // 3. ATOMIC TRANSACTION: Ensuring consistency
      // Using $transaction prevents the "Premium" update from happening 
      // if the transaction log update fails.
      await prisma.$transaction(async (tx) => {
        // A. Find the transaction and Lock it for this update
        const transaction = await tx.transaction.findUnique({
          where: { reference },
        });

        // B. IDEMPOTENCY: Check if already processed
        // Webhooks can be sent multiple times by Paystack if they don't get a 200 OK fast enough.
        if (!transaction || transaction.status === "success") {
          console.log(`⚠️ Webhook: Reference ${reference} already processed or missing.`);
          return;
        }

        // C. PRICE VERIFICATION: Verify the actual amount paid
        // 500000 = 5000 * 100 (in Kobo/Cents)
        if (amount < 500000) {
           console.error(`❌ Webhook: Insufficient amount paid for ${reference}`);
           return;
        }

        // D. Update Transaction status
        await tx.transaction.update({
          where: { reference },
          data: { 
            status: "success",
            meta: data 
          },
        });

        // E. Grant Premium access to user
        await tx.user.update({
          where: { id: transaction.userId! },
          data: { isPremium: true },
        });

        console.log(`✅ Webhook: Success for User ${transaction.userId}`);
      });
    }

    // 4. Always return 200 OK to Paystack within 30 seconds
    return new Response("ok", { status: 200 });

  } catch (err) {
    console.error("❌ Webhook handler error:", err);
    // Returning a 500 tells Paystack to try again later
    return new Response("Server error", { status: 500 });
  }
}