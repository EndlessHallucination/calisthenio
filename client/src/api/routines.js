import client from "./client";

export const getActiveRoutine = async (skillId) => {
  try {
    const { data } = await client.get(`/routines/active?skill_id=${skillId}`); // ← correct
    return data;
  } catch (error) {
    if (error.response?.status === 404) return null;
    throw error;
  }
};

export const generateRoutine = async (skillId) => {
  const { data } = await client.post("/routines/generate", {
    skill_id: skillId,
  });
  return data;
};
