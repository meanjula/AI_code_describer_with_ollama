import express from "express";
import cors from "cors";
import {
  buildPromptMessage,
  createOllamaPayload,
  fetchOllamaStream,
  validateCodeRequest,
  processOllamaStream,
} from "./utils/ollamaService.js";

const app = express();
const corsOptions = {
  origin: "http://localhost:5173", // Allow requests from this origin
  credentials: true, // Allow cookies and credentials
};
app.use(cors(corsOptions));

app.use(express.json());
// Health check route
app.get("/", (req, res) => {
  res.send("Server is running! Use POST /api/chat to interact.");
});

//
app.post("/api/explain-code", async (req, res) => {
  try {
    const { code, language } = req.body;
    validateCodeRequest(code, language);
    // Set up headers for NDJSON streaming
    res.setHeader("Content-Type", "application/x-ndjson; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    res.flushHeaders?.();

    //Build Ollama prompt message
    const messages = buildPromptMessage(code, language);
    const payload = createOllamaPayload(messages, "llama3");

    //Connect to Ollama API stream
    const ollamaResponse = await fetchOllamaStream(
      "http://localhost:11434/api/chat",
      payload
    );
    console.log("✅ Connected to Ollama stream");

    let fullText = await processOllamaStream(ollamaResponse, (token) => {
      //Stream each token to client as NDJSON
      res.write(JSON.stringify({ type: "token", content: token }) + "\n");
    });
    res.write(JSON.stringify({ type: "done", content: fullText }) + "\n");
    res.end();
  } catch (error) {
    console.error("API error", error);
    res.write(
      JSON.stringify({
        type: "error",
        message: "Server error or Ollama not running.",
      }) + "\n"
    );
    res.end();
  }
});

//Start server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
