import client from "./client";

export const getSkills = async () => {
  const { data } = await client.get("/skills");
  return data;
};

export const getSkill = async (skillId) => {
  const { data } = await client.get(`/skills/${skillId}`);
  return data;
};

export const startSkill = async (skillId) => {
  const { data } = await client.post(`/skills/${skillId}/start`);
  return data;
};

export const getCurrentMilestone = async (skillId) => {
  const { data } = await client.get(`/skills/${skillId}/current-milestone`);
  return data;
};

export const completeMilestone = async (skillId, milestoneId) => {
  const { data } = await client.post(
    `/skills/${skillId}/milestones/${milestoneId}/complete`,
  );
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
