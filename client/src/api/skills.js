import client from "./client";

export const getSkills = async () => {
  const { data } = await client.get("/skills");
  return data;
};

export const getSkill = async (id) => {
  const { data } = await client.get(`/skills/${id}`);
  return data;
};

export const startSkill = async (id) => {
  const { data } = await client.post(`/skills/${id}/start`);
  return data;
};

export const getCurrentMilestone = async (id) => {
  const { data } = await client.get(`/skills/${id}/current-milestone`);
  return data;
};

export const getActiveSkills = async () => {
  try {
    const { data } = await client.get("/skills/active");
    return data;
  } catch (error) {
    if (error.response?.status === 404) return null;
    throw error;
  }
};
