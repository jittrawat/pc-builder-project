import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../toast/ToastContext";

export default function RegisterPage({ onDone, onGoLogin }) {
  const { register, loading } = useAuth();
  const { push } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!email || !pw) {
      setErr("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }
    if (pw.length < 6) {
      setErr("รหัสผ่านต้องยาวอย่างน้อย 6 ตัวอักษร");
      return;
    }
    if (pw !== pw2) {
      setErr("รหัสผ่านยืนยันไม่ตรงกัน");
      return;
    }

    try {
      // ✅ AuthContext ปัจจุบันของคุณใช้ register(email, password, name)
      await register(email, pw, name);
      push("สมัครสมาชิกสำเร็จ! โปรดเข้าสู่ระบบ", "success");
      onDone?.();       // กลับไปหน้า shop
      onGoLogin?.();    // ถ้าต้องการสลับไปหน้า login (ตอนนี้เรากลับ shop)
    } catch (e2) {
      setErr(e2?.message || "สมัครสมาชิกไม่สำเร็จ");
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: 520 }}>
      <div className="card shadow-sm">
        <div className="card-body p-4">
          <h4 className="mb-3">สมัครสมาชิก</h4>

          {err && <div className="alert alert-danger py-2">{err}</div>}

          <form onSubmit={submit}>
            <div className="mb-3">
              <label className="form-label">ชื่อ</label>
              <input
                className="form-control"
                placeholder="เช่น สมชาย"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">อีเมล</label>
              <input
                type="email"
                className="form-control"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">รหัสผ่าน</label>
              <input
                type="password"
                className="form-control"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                autoComplete="new-password"
                required
              />
              <div className="form-text">อย่างน้อย 6 ตัวอักษร</div>
            </div>

            <div className="mb-4">
              <label className="form-label">ยืนยันรหัสผ่าน</label>
              <input
                type="password"
                className="form-control"
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            <div className="d-flex justify-content-between">
              <button type="button" className="btn btn-light" onClick={() => onDone?.()}>
                กลับ
              </button>
              <button className="btn btn-danger" disabled={loading}>
                {loading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
              </button>
            </div>
          </form>

          <hr className="my-4" />
          <div className="text-center">
            มีบัญชีอยู่แล้ว?{" "}
            <button
              type="button"
              className="btn btn-link p-0 align-baseline"
              onClick={() => onGoLogin?.()}
            >
              เข้าสู่ระบบ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
