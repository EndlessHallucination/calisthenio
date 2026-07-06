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
