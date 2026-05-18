export default async function handler(req, res) {
  const { telegramId } = req.body;

  const botToken = process.env.BOT_TOKEN;

  const url = `https://api.telegram.org/bot${botToken}/sendInvoice`;

  const payload = JSON.stringify({
    userId: telegramId,
    type: "premium"
  });

  const body = {
    chat_id: telegramId,
    title: "Полный доступ к Bayna Yadayk",
    description: "Все уроки + грамматика + тесты",
    payload: payload,
    currency: "XTR",
    prices: [
      { label: "Premium Access", amount: 50 }
    ]
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const data = await response.json();

  res.status(200).json(data);
}
