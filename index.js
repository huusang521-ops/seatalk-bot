const express = require("express");
const axios = require("axios");

const app = express();

// ===== CONFIG =====
const WEBHOOK = "https://openapi.seatalk.io/webhook/group/jrPZBrvfQ9G0o2nfIApc6g";
const LIMIT_MINUTES = 5; // 👉 chỉnh thời gian RR tại đây

// ===== MEMORY LƯU TRẠNG THÁI =====
const rrList = {};

// ===== HÀM GỬI MESSAGE =====
async function sendMessage(content) {
  try {
    await axios.post(WEBHOOK, {
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

// ===== API RR =====
app.get("/rr", async (req, res) => {
  const email = req.query.email;

  if (!email) return res.send("Missing email");

  const now = new Date();
  const deadline = new Date(now.getTime() + LIMIT_MINUTES * 60000);

  rrList[email] = {
    start: now,
    deadline: deadline,
    warned: false
  };

  await sendMessage(
    "🚻 RR REQUEST\n" +
    `👤 <mention-tag target="seatalk://user?email=${email}"/>\n` +
    `⏳ Deadline: ${deadline.toLocaleTimeString("vi-VN")}`
  );

  res.send("RR OK");
});

// ===== API ONLINE =====
app.get("/online", async (req, res) => {
  const email = req.query.email;

  delete rrList[email];

  await sendMessage(
    "🟢 BACK ONLINE\n" +
    `👤 <mention-tag target="seatalk://user?email=${email}"/>`
  );

  res.send("ONLINE OK");
});

// ===== AUTO CHECK QUÁ GIỜ =====
setInterval(async () => {
  const now = new Date();

  for (const email in rrList) {
    const data = rrList[email];

    if (now > data.deadline && !data.warned) {
      await sendMessage(
        "🚨 QUÁ GIỜ RR\n" +
        `👤 <mention-tag target="seatalk://user?email=${email}"/>\n` +
        "👉 Vui lòng quay lại làm việc!"
      );

      rrList[email].warned = true;
    }
  }
}, 60000); // chạy mỗi 1 phút

// ===== TEST SERVER =====
app.get("/", (req, res) => {
  res.send("Bot is running");
});

// ===== START SERVER =====
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Bot running on port " + PORT);
});
