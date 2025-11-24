const express = require("express");
const multer = require("multer");
const cors = require("cors");
const dotenv = require("dotenv");
const OpenAI = require("openai");
const pdfParse = require("pdf-parse-fixed"); // 👍 Works in Node 22

dotenv.config();

const app = express();
const upload = multer();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  })
);

// -------- PDF TEXT EXTRACTION --------
async function extractPdfText(buffer) {
  const data = await pdfParse(buffer);
  return data.text;
}

// -------- SAFE JSON EXTRACTOR --------
function extractJSON(text) {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]") + 1;

  if (start === -1 || end === -1) {
    console.log("LLM RAW OUTPUT:\n", text);
    throw new Error("Model did not return valid JSON array");
  }

  const jsonString = text.slice(start, end);
  return JSON.parse(jsonString);
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

// -------- API ROUTE --------
app.post("/api/check", upload.single("pdf"), async (req, res) => {
  console.log("🚀 /api/check HIT");

  try {
    if (!req.file) {
      return res.status(400).json({ error: "PDF not received" });
    }

    const rules = JSON.parse(req.body.rules);
    const pdfBuffer = req.file.buffer;

    const pdfText = await extractPdfText(pdfBuffer);

    const prompt = `
Return ONLY valid JSON array like this:
[
  { "rule": "", "status": "pass/fail", "evidence": "", "reasoning": "", "confidence": 0-100 }
]

Do NOT add any explanation outside the JSON.

PDF TEXT:
${pdfText}

RULES:
${rules.join("\n")}
`;

    const response = await client.chat.completions.create({
      model: "google/gemma-2-9b-it",
      messages: [{ role: "user", content: prompt }],
    });

    const msg = response.choices[0].message.content;

    const result = extractJSON(msg);

    res.json(result);
  } catch (err) {
    console.error("🔥 SERVER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// -------- START SERVER --------
app.listen(3000, () => console.log("🚀 Server running on 3000"));
