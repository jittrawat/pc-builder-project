import React from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../toast/ToastContext";
// ⬇️ เปลี่ยนมาใช้ Font Awesome (มีแน่นอน)
import { FaUserCircle } from "react-icons/fa";

export default function AccountButton({ onOpenLogin }) {
  const { user, logout } = useAuth();
  const { pushToast } = useToast();

  const handleLogout = () => {
    if (window.confirm("ต้องการออกจากระบบหรือไม่?")) {
      logout();
      pushToast("ออกจากระบบเรียบร้อยแล้ว", "info");
    }
  };

  if (user) {
    return (
      <div className="d-flex align-items-center gap-2 ms-auto">
        <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
          ออกจากระบบ
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      className="btn btn-light rounded-circle d-flex align-items-center justify-content-center ms-auto"
      style={{ width: 40, height: 40 }}
      onClick={() => onOpenLogin?.()}
      aria-label="เข้าสู่ระบบ"
      title="เข้าสู่ระบบ"
    >
      {/* ⬇️ ใช้ FaUserCircle แทน */}
      <FaUserCircle size={20} />
    </button>
  );
}
