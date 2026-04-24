const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// ===== CONFIG =====
const WEBHOOK_OUT = "https://openapi.seatalk.io/webhook/group/jrPZBrvfQ9G0o2nfIApc6g";

// ===== HÀM GỬI TIN NHẮN =====
async function sendMessage(content) {
  try {
    await axios.post(WEBHOOK_OUT, {
      tag: "text",
      text: {
        format: 1,
        content: content
      }
    });
  } catch (err) {
    console.log("Send error:", err.message);
  }
}

// ===== WEBHOOK NHẬN EVENT TỪ SEATALK =====
app.post("/seatalk-webhook", async (req, res) => {
  const body = req.body;

  console.log("Incoming:", JSON.stringify(body));

  try {
    // ⚠️ tùy format thực tế của Seatalk
    const message = body?.event?.message?.text || "";
    const email = body?.event?.sender?.email || "unknown";

    // ===== XỬ LÝ LỆNH =====
    if (message.toLowerCase() === "rr") {
      const now = new Date();
      const deadline = new Date(now.getTime() + 1 * 60000);

      const timeStr = deadline.toLocaleTimeString("vi-VN");

      const reply =
        "✅ XÁC NHẬN ĐI RR\n" +
        `👤 <mention-tag target="seatalk://user?email=${email}"/>\n` +
        `🕒 Deadline: ${timeStr}`;

      await sendMessage(reply);
    }

    if (message.toLowerCase() === "online") {
      const reply =
        "🟢 ĐÃ ONLINE\n" +
        `👤 <mention-tag target="seatalk://user?email=${email}"/>`;

      await sendMessage(reply);
    }

  } catch (err) {
    console.log(err);
  }

  res.sendStatus(200);
});

// ===== START SERVER =====
app.listen(3000, () => {
  console.log("Bot running on port 3000");
});
