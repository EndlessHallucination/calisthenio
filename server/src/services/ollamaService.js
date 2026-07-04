const { OLLAMA_BASE_URL, OLLAMA_MODEL } = require("../config/ollama");

const generateRoutine = async (prompt) => {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama request failed: ${response.statusText}`);
  }

  const data = await response.json();

  try {
    return JSON.parse(data.response);
  } catch {
    throw new Error("Ollama returned invalid JSON");
  }
};

module.exports = { generateRoutine };
