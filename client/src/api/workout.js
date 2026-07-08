import client from "./client";

export const createWorkout = async (skillId) => {
  const { data } = await client.post("/workouts", { skill_id: skillId });
  return data;
};

export const logExercises = async (workoutId, exercises) => {
  const { data } = await client.post(`/workouts/${workoutId}/exercises`, {
    exercises,
  });
  return data;
};
