export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(200).json({
        ok: false,
        message: "Use POST request"
      });
    }

    const { telegramId } = req.body || {};

    if (!telegramId) {
      return res.status(400).json({
        ok: false,
        error: "telegramId missing"
      });
    }

    const botToken = process.env.BOT_TOKEN;

    if (!botToken) {
      return res.status(500).json({
        ok: false,
        error: "BOT_TOKEN missing"
      });
    }

    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendInvoice`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: telegramId,
          title: "Premium Access",
          description: "Full course unlock",
          payload: JSON.stringify({
            userId: telegramId
          }),
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

    return res.status(200).json({
      ok: true,
      data
    });

  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err.message
    });
  }
}
