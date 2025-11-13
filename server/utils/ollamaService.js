/**
 * Validates request body for code explanation
 * @throws {Error} if code or language is missing
 */
export function validateCodeRequest(code, language) {
  if (!code || !language) {
    throw new Error("Code and language are required");
  }
}

/**
 * Builds the prompt message for Ollama
 * @returns {Array} Message array formatted for Ollama API
 */
export function buildPromptMessage(code, language) {
  return [
    {
      role: "user",
      content: `You are a senior ${language} developer and mentor.
                Explain the following ${language} code to a junior developer.
                Be accurate and concise, use Markdown formatting when useful.
                Question or request:
                Code: 
                \`\`\`${language}
                ${code}
                \`\`\``,
    },
  ];
}

/**
 * Creates Ollama API request payload
 * @returns {Object} Request payload for Ollama
 */
export function createOllamaPayload(messages, model = "llama3") {
  return {
    model,
    messages,
    stream: true,
    temperature: 0.3,
    max_tokens: 800,
  };
}

/**
 * Fetches stream from Ollama API
 * @returns {Promise<Response>} Ollama response stream
 * @throws {Error} if Ollama API returns error
 */
export async function fetchOllamaStream(ollamaUrl, payload) {
  const response = await fetch(ollamaUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.statusText}`);
  }

  return response;
}

/**
 * Processes streaming response from Ollama
 * @param {Response} ollamaResponse - Response from Ollama
 * @param {Function} onToken - Callback function for each token received
 * @returns {Promise<string>} Full accumulated text
 */
export async function processOllamaStream(ollamaResponse, onToken) {
  const decoder = new TextDecoder();
  let buffer = "";
  let fullText = "";

  for await (const chunk of ollamaResponse.body) {
    buffer += decoder.decode(chunk, { stream: true });
    const parts = buffer.split(/\r?\n/);

    buffer = parts.pop();

    for (const line of parts) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      try {
        const data = JSON.parse(trimmed);

        if (data.message?.content) {
          fullText += data.message.content;
          onToken(data.message.content);
        }

        if (data.done) {
          return fullText;
        }
      } catch (err) {
        console.warn("⚠️ Skipping malformed JSON:", trimmed);
      }
    }
  }

  return fullText;
}
