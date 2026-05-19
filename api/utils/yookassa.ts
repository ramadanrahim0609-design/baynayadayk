import { createClient } from '@supabase/supabase-js';

const YOOKASSA_SHOP_ID = process.env.YOOKASSA_SHOP_ID;
const YOOKASSA_SECRET_KEY = process.env.YOOKASSA_SECRET_KEY;
const YOOKASSA_API_URL = 'https://api.yookassa.ru/v3/payments';

interface CreatePaymentParams {
  telegramId: number;
  amount: number;
  currency: string;
}

interface PaymentResult {
  id: string;
  confirmation: {
    type: string;
    confirmation_url: string;
  };
}

export async function createPayment({ telegramId, amount, currency }: CreatePaymentParams): Promise<PaymentResult> {
  const auth = Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`).toString('base64');

  const idempotenceKey = `${telegramId}-${Date.now()}`;

  const response = await fetch(YOOKASSA_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotence-Key': idempotenceKey,
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({
      amount: {
        value: amount.toFixed(2),
        currency,
      },
      confirmation: {
        type: 'redirect',
        return_url: process.env.APP_URL || 'https://t.me/your_bot',
      },
      capture: true,
      description: `Premium подписка для пользователя ${telegramId}`,
      metadata: {
        telegramId: telegramId.toString(),
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.description || 'Failed to create payment');
  }

  return response.json();
}

interface HandlePaymentParams {
  telegramId: number;
  paymentId: string;
  amount: string;
  currency: string;
}

export async function handlePaymentSucceeded({ telegramId, paymentId, amount, currency }: HandlePaymentParams) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration missing');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  const { error } = await supabase
    .from('subscriptions')
    .upsert({
      telegram_id: telegramId,
      payment_id: paymentId,
      amount,
      currency,
      status: 'active',
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'telegram_id',
    });

  if (error) {
    throw new Error(`Failed to save subscription: ${error.message}`);
  }

  console.log(`Premium activated for telegramId: ${telegramId}, expires: ${expiresAt.toISOString()}`);
}
