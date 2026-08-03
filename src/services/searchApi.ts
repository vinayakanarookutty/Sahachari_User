import axios from "axios";

const API = process.env.EXPO_PUBLIC_API_URL;

export const searchItems = async (query: string) => {
  const res = await axios.get(`${API}/search`, {
    params: {
      q: query,
    },
  });

  return res.data;
};