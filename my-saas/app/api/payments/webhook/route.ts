// app/api/payments/webhook/route.ts
import prisma from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: Request) {
  const raw = await req.text();
  const signature = (req.headers.get('x-paystack-signature') || '') as string;
  const expected = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!).update(raw).digest('hex');

  if (signature !== expected) {
    return new Response('invalid signature', { status: 403 });
  }

  const payload = JSON.parse(raw);
  const event = payload.event; // e.g., "charge.success"
  const data = payload.data;

  try {
    if (event === 'charge.success') {
      const reference = data.reference;
      const status = data.status;

      // update transaction
      await prisma.transaction.updateMany({
        where: { reference },
        data: { status, meta: data },
      });

      // if success, mark user premium
      if (status === 'success') {
        // find transaction and user
        const tx = await prisma.transaction.findUnique({ where: { reference } });
        if (tx?.userId) {
          await prisma.user.update({ where: { id: tx.userId }, data: { isPremium: true } });
        }
      }
    }

    return new Response('ok', { status: 200 });
  } catch (err) {
    console.error('webhook handler error', err);
    return new Response('server error', { status: 500 });
  }
}
