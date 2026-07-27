import client from "./client";

export const getActiveRoutine = async (skillId) => {
  const { data } = await client.get(`/routines/active?skill_id=${skillId}`);
  return data;
};

export const generateRoutine = async (skillId) => {
  const { data } = await client.post("/routines/generate", {
    skill_id: skillId,
  });
  return data;
};
