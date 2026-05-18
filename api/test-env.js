export default function handler(req, res) {
  const token = process.env.BOT_TOKEN;

  if (!token) {
    return res.status(500).json({
      ok: false,
      message: "BOT_TOKEN НЕ НАЙДЕН"
    });
  }

  return res.status(200).json({
    ok: true,
    message: "BOT_TOKEN РАБОТАЕТ",
    preview: token.slice(0, 5) + "..."
  });
}
