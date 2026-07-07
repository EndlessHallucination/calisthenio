import client from "./client";

export const getProfile = async () => {
  try {
    const { data } = await client.get("/profile");
    return data;
  } catch (error) {
    if (error.response?.status === 404) return null;
    throw error;
  }
};

export const createProfile = async (profileData) => {
  const { data } = await client.post("/profile", profileData);
  return data;
};
