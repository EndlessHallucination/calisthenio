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

const generateWeekPlan = async (prompt, retries = 1) => {
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
  console.log("Ollama week plan response:", data.response);

  try {
    return JSON.parse(data.response);
  } catch {
    if (retries > 0) {
      console.warn("Retrying week plan generation...");
      return generateWeekPlan(prompt, retries - 1);
    }
    throw new Error("Ollama returned invalid JSON for week plan");
  }
};

module.exports = { generateRoutine, generateWeekPlan };
