const express = require("express");
const axios = require("axios");

const app = express();

// ===== CONFIG =====
const WEBHOOK = "https://openapi.seatalk.io/webhook/group/jrPZBrvfQ9G0o2nfIApc6g";
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxApLdZ8LzMZEUiWFQvzmWaGtKgNpZO6VOtO7ubU95EtLLPJpZszz9Z9OENp6fBhNdr/exec";

// ===== SEND MESSAGE =====
async function sendMessage(content) {
  await axios.post(WEBHOOK, {
    tag: "text",
    text: { format: 1, content }
  });
}

// ===== RR =====
app.get("/rr", async (req, res) => {
  const email = req.query.email;

  if (!email) return res.send("Missing email");

  await sendMessage(
    "🚻 RR REQUEST\n" +
    `👤 <mention-tag target="seatalk://user?email=${email}"/>\n` +
    "⏳ Status: Đang nghỉ"
  );

  // log Google Sheet
  await axios.get(GOOGLE_SCRIPT_URL + "?action=rr&email=" + email);

  res.send("OK");
});

// ===== ONLINE =====
app.get("/online", async (req, res) => {
  const email = req.query.email;

  await sendMessage(
    "🟢 BACK ONLINE\n" +
    `👤 <mention-tag target="seatalk://user?email=${email}"/>`
  );

  await axios.get(GOOGLE_SCRIPT_URL + "?action=online&email=" + email);

  res.send("OK");
});

// ===== ROOT TEST =====
app.get("/", (req, res) => {
  res.send("Bot is running");
});

// ===== START =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Running on " + PORT));
