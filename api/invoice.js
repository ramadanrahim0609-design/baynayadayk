export default async function handler(req, res) {
  const { telegramId } = req.body;

  const botToken = process.env.BOT_TOKEN;

  const payload = JSON.stringify({
    type: "premium_access",
    userId: telegramId
  });

  const response = await fetch(
    `https://api.telegram.org/bot${botToken}/sendInvoice`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: telegramId,
        title: "Полный доступ",
        description: "Все уроки + грамматика + практика",
        payload,
        currency: "XTR",
        prices: [
          {
            label: "Premium",
            amount: 50
          }
        ]
      })
    }
  );

  const data = await response.json();

  return res.status(200).json(data);
}
