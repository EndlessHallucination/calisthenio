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

export const getWorkouts = async (skillId) => {
  const { data } = await client.get(`/workouts?skill_id=${skillId}`);
  return data;
};

export const getWorkoutExercises = async (workoutId) => {
  const { data } = await client.get(`/workouts/${workoutId}/exercises`);
  return data;
};

export const deleteWorkout = async (workoutId) => {
  const { data } = await client.delete(`/workouts/${workoutId}`);
  return data;
};
