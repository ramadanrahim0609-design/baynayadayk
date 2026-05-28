import { createPayment } from './utils/yookassa';

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const { telegramId, amount = 299, currency = 'RUB' } = body;

    if (!telegramId) {
      return new Response(JSON.stringify({ error: 'telegramId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const payment = await createPayment({
      telegramId,
      amount,
      currency,
    });

    return new Response(JSON.stringify({
      paymentId: payment.id,
      confirmationUrl: payment.confirmation.confirmation_url,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Create payment error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
