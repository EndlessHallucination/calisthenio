import axios from "axios";

const client = axios.create({
  baseURL: "http://localhost:3000/api",
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 404) {
      return Promise.resolve({ data: null });
    }
    if (error.response?.status === 500) {
      console.error("Server error:", error.response.data);
    }
    return Promise.reject(error);
  },
);

export default client;
