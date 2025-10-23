import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";   // ⬅️ เพิ่มบรรทัดนี้

export default function LoginModal({ open, onClose }) {
  const { user, login, logout } = useAuth();
  const [showPw, setShowPw] = useState(false);
  const emailRef = useRef(null);
  const passRef = useRef(null);
  const navigate = useNavigate();                 // ⬅️ เพิ่มบรรทัดนี้

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = emailRef.current?.value?.trim();
    const pass  = passRef.current?.value ?? "";
    if (!email || !pass) return;
    await login(email, pass);
    onClose?.();
  };

  const handleLogout = async () => {
    await logout();
    onClose?.();
  };

  const goRegister = () => {                     // ⬅️ ฟังก์ชันไปหน้า Register
    onClose?.();
    navigate("/register");
  };

  return (
    <div className="auth-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        {!user ? (
          <>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="m-0">เข้าสู่ระบบ</h5>
              <button className="btn btn-sm btn-light" onClick={onClose} aria-label="ปิด">✕</button>
            </div>

            <form onSubmit={handleLogin}>
              <div className="mb-2">
                <input ref={emailRef} type="email" className="form-control" placeholder="อีเมล" autoFocus />
              </div>

              <div className="mb-3 input-group">
                <input
                  ref={passRef}
                  type={showPw ? "text" : "password"}
                  className="form-control"
                  placeholder="รหัสผ่าน"
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPw((s) => !s)}
                  title={showPw ? "ซ่อนรหัส" : "ดูรหัส"}
                >
                  {showPw ? "ซ่อน" : "ดู"}
                </button>
              </div>

              <button type="submit" className="btn btn-primary w-100">เข้าสู่ระบบ</button>
            </form>

            <div className="text-center mt-3">
              {/* ⬅️ ใช้ปุ่มเรียก navigate แทน <a href> */}
              <button type="button" className="btn btn-link p-0 small" onClick={goRegister}>
                ยังไม่มีบัญชี? สมัครสมาชิก
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="m-0">บัญชีของฉัน</h6>
              <button className="btn btn-sm btn-light" onClick={onClose} aria-label="ปิด">✕</button>
            </div>

            <div className="small text-muted mb-2">ลงชื่อเข้าใช้แล้ว</div>
            <div className="fw-semibold mb-3">{user.email}</div>

            <button className="btn btn-outline-danger w-100" onClick={handleLogout}>
              ออกจากระบบ
            </button>
          </>
        )}
      </div>
    </div>
  );
}
