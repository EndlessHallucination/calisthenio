const OLLAMA_BASE_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "mistral";

module.exports = { OLLAMA_BASE_URL, OLLAMA_MODEL };
