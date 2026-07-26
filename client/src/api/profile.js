import client from "./client";

export const getProfile = async () => {
  const { data } = await client.get("/profile");
  return data;
};

export const createProfile = async (profileData) => {
  const { data } = await client.post("/profile", profileData);
  return data;
};