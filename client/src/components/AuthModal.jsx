import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../toast/ToastContext";

export default function AuthModal({
  open,
  mode = "login",            // 'login' | 'register'
  onClose,
  onSwitchMode,
}) {
  const { user, login, register: signup, logout } = useAuth();
  const { pushToast } = useToast();

  const nameRef  = useRef(null);   // 👈 เพิ่ม
  const emailRef = useRef(null);
  const passRef  = useRef(null);
  const pass2Ref = useRef(null);

  const [showPw, setShowPw]   = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const isLogin = mode === "login";

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    setTimeout(() => (isLogin ? emailRef.current : nameRef.current)?.focus(), 0);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, mode, isLogin, onClose]);

  if (!open) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = emailRef.current?.value?.trim();
    const pass  = passRef.current?.value ?? "";
    if (!email || !pass) return;
    try {
      await login(email, pass);
      pushToast("เข้าสู่ระบบสำเร็จ", "success");
      onClose?.();
    } catch (err) {
      pushToast(err.message || "เข้าสู่ระบบไม่สำเร็จ", "danger");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const name  = nameRef.current?.value?.trim();   // 👈 ใช้ค่า name
    const email = emailRef.current?.value?.trim();
    const pass  = passRef.current?.value ?? "";
    const pass2 = pass2Ref.current?.value ?? "";

    if (!name) { 
      pushToast("กรุณากรอกชื่อ", "warning"); 
      return; 
    }
    if (!email || !pass) return;
    if (pass !== pass2) { 
      pushToast("รหัสผ่านไม่ตรงกัน", "warning"); 
      return; 
    }

    try {
      // 👇 ส่ง name ไปที่ register()
      await signup(name, email, pass);
      pushToast("สมัครสมาชิกและเข้าสู่ระบบสำเร็จ", "success");
      onClose?.();
    } catch (err) {
      pushToast(err.message || "สมัครสมาชิกไม่สำเร็จ", "danger");
    }
  };

  const handleLogout = async () => {
    if (window.confirm("ต้องการออกจากระบบหรือไม่?")) {
      await logout();
      pushToast("ออกจากระบบเรียบร้อยแล้ว", "info");
      onClose?.();
    }
  };

  return (
    <div className="auth-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="m-0">
            {user ? "บัญชีของฉัน" : isLogin ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
          </h5>
          <button className="btn btn-sm btn-light" onClick={onClose} aria-label="ปิด">✕</button>
        </div>

        {user ? (
          <>
            <div className="small text-muted mb-2">ลงชื่อเข้าใช้แล้ว</div>
            <div className="fw-semibold mb-3">{user.name || user.email}</div>
            <button className="btn btn-outline-danger w-100" onClick={handleLogout}>
              ออกจากระบบ
            </button>
          </>
        ) : isLogin ? (
          <form onSubmit={handleLogin}>
            <div className="mb-2">
              <input ref={emailRef} type="email" className="form-control" placeholder="อีเมล" />
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
              >
                {showPw ? "ซ่อน" : "ดู"}
              </button>
            </div>
            <button type="submit" className="btn btn-primary w-100">เข้าสู่ระบบ</button>
            <div className="text-center mt-3">
              <button type="button" className="btn btn-link p-0" onClick={() => onSwitchMode?.("register")}>
                ยังไม่มีบัญชี? สมัครสมาชิก
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            {/* 👇 ช่องชื่อ */}
            <div className="mb-2">
              <input ref={nameRef} type="text" className="form-control" placeholder="ชื่อ" />
            </div>
            <div className="mb-2">
              <input ref={emailRef} type="email" className="form-control" placeholder="อีเมล" />
            </div>
            <div className="mb-2 input-group">
              <input
                ref={passRef}
                type={showPw ? "text" : "password"}
                className="form-control"
                placeholder="รหัสผ่าน"
              />
              <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPw((s) => !s)}>
                {showPw ? "ซ่อน" : "ดู"}
              </button>
            </div>
            <div className="mb-3 input-group">
              <input
                ref={pass2Ref}
                type={showPw2 ? "text" : "password"}
                className="form-control"
                placeholder="ยืนยันรหัสผ่าน"
              />
              <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPw2((s) => !s)}>
                {showPw2 ? "ซ่อน" : "ดู"}
              </button>
            </div>
            <button type="submit" className="btn btn-primary w-100">สมัครสมาชิก</button>
            <div className="text-center mt-3">
              <button type="button" className="btn btn-link p-0" onClick={() => onSwitchMode?.("login")}>
                มีบัญชีอยู่แล้ว? เข้าสู่ระบบ
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
