import React, { useEffect, useState } from "react";

import { BuildProvider } from "./context/BuildContext";
import Sidebar from "./components/Sidebar";
import CategoryPage from "./components/CategoryPage";

import { AuthProvider, useAuth } from "./context/AuthContext";
import AccountButton from "./components/AccountButton";

import { ToastProvider } from "./toast/ToastContext";
import Toaster from "./components/Toaster";

import AuthModal from "./components/AuthModal";

import {
  makeCpuPredicate,
  makeMainboardPredicate,
  makeRamPredicate,
  makeGpuPredicate,
  makeSsdPredicate,
  makeCasePredicate,
  makeCoolerPredicate,
  makePowerPredicate,
  makeHddPredicate,
} from "./utils/compat";

// ✅ ใช้หน้าแอดมินแบบ CRUD จากไฟล์ pages
import AdminPage from "./pages/AdminPage";
import PresetsPage from "./pages/PresetsPage";
import PresetDetailPage from "./pages/PresetDetailPage";

function AppInner() {
  const [active, setActive] = useState("cpu");
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // 'login' | 'register'
  const [view, setView] = useState("catalog"); // 'catalog' | 'admin' | 'presets' | 'preset-detail'
  const [selectedPresetId, setSelectedPresetId] = useState(null);

  const { user } = useAuth();

  // Auto-switch เข้า Admin ครั้งแรกเมื่อ user มี role=admin
  useEffect(() => {
    if (user?.role === "admin") setView("admin");
    else setView("catalog");
  }, [user]);

  const PAGES = {
    cpu:       { title: "ซีพียู",           endpoint: "http://localhost:5000/api/cpu",       predicateFactory: makeCpuPredicate },
    mainboard: { title: "เมนบอร์ด",         endpoint: "http://localhost:5000/api/mainboard", predicateFactory: makeMainboardPredicate },
    ram:       { title: "แรม",              endpoint: "http://localhost:5000/api/ram",       predicateFactory: makeRamPredicate },
    gpu:       { title: "การ์ดจอ",          endpoint: "http://localhost:5000/api/gpu",       predicateFactory: makeGpuPredicate },
    ssd:       { title: "SSD",              endpoint: "http://localhost:5000/api/ssd",       predicateFactory: makeSsdPredicate },
    case:      { title: "เคส",              endpoint: "http://localhost:5000/api/case",      predicateFactory: makeCasePredicate },
    cooler:    { title: "ชุดระบายความร้อน", endpoint: "http://localhost:5000/api/cooler",   predicateFactory: makeCoolerPredicate },
    power:     { title: "พาวเวอร์ซัพพลาย", endpoint: "http://localhost:5000/api/power",    predicateFactory: makePowerPredicate },
    hdd:       { title: "ฮาร์ดดิสก์",       endpoint: "http://localhost:5000/api/harddisk",  predicateFactory: makeHddPredicate },
  };
  const current = PAGES[active];

  // ----- Navbar (ปุ่มสลับอยู่บนนี้เท่านั้น) -----
  const Navbar = (
    <nav className="navbar navbar-light bg-white border-bottom px-3 sticky-top">
      <a className="navbar-brand fw-bold" href="#">
        <span className="text-danger">COMPUTER ASSEMBLY SYSTEM</span>
      </a>

      <div className="d-flex align-items-center gap-3">
        {/* แสดงอีเมล + role */}
        {user && (
          <small className="text-muted">
            {user.email} · role: <strong>{user.role}</strong>
          </small>
        )}

        {/* ปุ่มชุดสเปคแนะนำ */}
        {(view === "catalog" || view === "presets" || view === "preset-detail") && (
          <button 
            className={`btn ${view === "presets" || view === "preset-detail" ? "btn-danger" : "btn-outline-danger"}`}
            onClick={() => setView(view === "presets" || view === "preset-detail" ? "catalog" : "presets")}
          >
            {view === "presets" || view === "preset-detail" ? "กลับจัดสเปค" : "ชุดสเปคแนะนำ"}
          </button>
        )}

        {/* สลับไปมาเฉพาะ Admin */}
        {user?.role === "admin" && (
          view === "admin" ? (
            <button className="btn btn-outline-secondary" onClick={() => setView("catalog")}>
              กลับหน้าหลัก
            </button>
          ) : (
            <button className="btn btn-outline-primary" onClick={() => setView("admin")}>
              ไปหน้าแอดมิน
            </button>
          )
        )}

        {/* avatar / login / logout */}
        <AccountButton onOpenLogin={() => { setAuthMode("login"); setAuthOpen(true); }} />
      </div>
    </nav>
  );

  // ----- หน้า Admin -----
  if (view === "admin") {
    return (
      <>
        {Navbar}
        <Toaster />
        <AuthModal
          open={authOpen}
          mode={authMode}
          onClose={() => setAuthOpen(false)}
          onSwitchMode={(m) => setAuthMode(m)}
        />
        <AdminPage />
      </>
    );
  }

  // ----- หน้า Presets -----
  if (view === "presets") {
    return (
      <>
        {Navbar}
        <Toaster />
        <AuthModal
          open={authOpen}
          mode={authMode}
          onClose={() => setAuthOpen(false)}
          onSwitchMode={(m) => setAuthMode(m)}
        />
        <PresetsPage 
          onSelectPreset={(id) => {
            setSelectedPresetId(id);
            setView("preset-detail");
          }}
        />
      </>
    );
  }

  // ----- หน้า Preset Detail -----
  if (view === "preset-detail" && selectedPresetId) {
    return (
      <>
        {Navbar}
        <Toaster />
        <AuthModal
          open={authOpen}
          mode={authMode}
          onClose={() => setAuthOpen(false)}
          onSwitchMode={(m) => setAuthMode(m)}
        />
        <PresetDetailPage 
          presetId={selectedPresetId}
          onBack={() => setView("presets")}
          onGoToCatalog={() => setView("catalog")}
        />
      </>
    );
  }

  // ----- หน้า Catalog -----
  return (
    <>
      {Navbar}
      <Toaster />
      <AuthModal
        open={authOpen}
        mode={authMode}
        onClose={() => setAuthOpen(false)}
        onSwitchMode={(m) => setAuthMode(m)}
      />
      <div className="container-fluid mt-3">
        <div className="row">
          <Sidebar active={active} onChange={setActive} />
          <CategoryPage
            key={active}
            title={current.title}
            endpoint={current.endpoint}
            category={active}
            predicateFactory={current.predicateFactory}
          />
        </div>
      </div>
    </>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BuildProvider>
          <AppInner />
        </BuildProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
