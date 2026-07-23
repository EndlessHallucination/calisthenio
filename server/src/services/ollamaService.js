const { OLLAMA_BASE_URL, OLLAMA_MODEL } = require("../config/ollama");

const generateRoutine = async (prompt, retries = 1) => {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
    }),
  });

  const data = await response.json();
  // console.log("Ollama raw response:", data.response);
  try {
    return JSON.parse(data.response);
  } catch {
    if (retries > 0) {
      console.warn("Ollama returned invalid JSON, retrying...");
      return generateRoutine(prompt, retries - 1);
    }
    throw new Error("Ollama returned invalid JSON");
  }
};

module.exports = { generateRoutine };
