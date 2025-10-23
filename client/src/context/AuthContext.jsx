// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";

const AuthCtx = createContext(null);
const API_BASE = "http://localhost:5000";

function setAxiosAuth(token) {
  if (token) {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common.Authorization;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null);
  const [token, setToken] = useState(null);

  // โหลดสถานะเดิมจาก localStorage
  useEffect(() => {
    const raw = localStorage.getItem("auth");
    if (!raw) return;
    try {
      const obj = JSON.parse(raw);
      if (obj?.token) {
        setToken(obj.token);
        setUser(obj.user || null);
        setAxiosAuth(obj.token);
      }
    } catch {
      localStorage.removeItem("auth");
    }
  }, []);

  const saveAuth = (t, u) => {
    setToken(t);
    setUser(u);
    setAxiosAuth(t);
    localStorage.setItem("auth", JSON.stringify({ token: t, user: u }));
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_BASE}/api/auth/login`, { email, password });
      if (!res.data?.token || !res.data?.user) throw new Error("ข้อมูลล็อกอินไม่ครบ");
      saveAuth(res.data.token, res.data.user);
      return res.data.user;
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || "เข้าสู่ระบบไม่สำเร็จ";
      throw new Error(msg);
    }
  };

  // ✅ register รองรับ name และ fallback: ถ้า backend ไม่คืน token ให้ auto-login ต่อ
  const register = async (name, email, password) => {
    try {
      const res = await axios.post(`${API_BASE}/api/auth/register`, { name, email, password });
      if (res.data?.token && res.data?.user) {
        // กรณี backend คืน token+user ทันที
        saveAuth(res.data.token, res.data.user);
        return res.data.user;
      }
      // กรณี backend สร้างแอคเคานต์แล้ว แต่ไม่ส่ง token กลับ → login ต่อ
      await login(email, password);
      return { email, name };
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || "สมัครสมาชิกไม่สำเร็จ";
      throw new Error(msg);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setAxiosAuth(null);
    localStorage.removeItem("auth");
  };

  const value = useMemo(() => ({ user, token, login, register, logout }), [user, token]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider />");
  return ctx;
}
