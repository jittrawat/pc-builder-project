import axios from "axios";

const API_BASE = "http://localhost:5000"; // แก้ให้ตรงเซิร์ฟเวอร์คุณ
const api = axios.create({ baseURL: API_BASE });

// แนบ token จาก localStorage (auth: { token, user })
api.interceptors.request.use((config) => {
  const raw = localStorage.getItem("auth");
  if (raw) {
    try {
      const { token } = JSON.parse(raw);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {}
  }
  return config;
});

export default api;
export { API_BASE };

