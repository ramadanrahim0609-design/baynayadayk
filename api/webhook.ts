import { handlePaymentSucceeded } from './utils/yookassa';

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const event = body.event;

    console.log('Webhook received:', event);

    if (event === 'payment.succeeded') {
      const payment = body.object;
      const paymentId = payment.id;
      const metadata = payment.metadata || {};
      const telegramId = metadata.telegramId;

      if (!telegramId) {
        console.error('No telegramId in payment metadata');
        return new Response(JSON.stringify({ error: 'No telegramId' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      await handlePaymentSucceeded({
        telegramId: parseInt(telegramId),
        paymentId,
        amount: payment.amount.value,
        currency: payment.amount.currency,
      });

      return new Response(JSON.stringify({ status: 'ok' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ status: 'ignored' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export const config = {
  runtime: 'edge',
};
