import client from "./client";

export const getActiveRoutine = async (id) => {
  try {
    const { data } = await client.get(`/routines/active?skill_id=${id}`); // ← correct
    return data;
  } catch (error) {
    if (error.response?.status === 404) return null;
    throw error;
  }
};
