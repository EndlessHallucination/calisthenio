import client from "./client";

export const generateWeekPlan = async () => {
  const { data } = await client.post("/week-plans/generate");
  return data;
};

export const getActiveWeekPlan = async () => {
  const { data } = await client.get("/week-plans/active");
  return data;
};
