import React, { useState } from "react";
import { useBuild, CATEGORIES } from "../context/BuildContext";
import { resolveImageUrl } from "../utils/compat";
import { useToast } from "../toast/ToastContext";
import SpecModal from "./SpecModal";
import CompatibilityChecker from "./CompatibilityChecker";
import ProductDetailModal from "./ProductDetailModal";


/* ==== ไอคอนจาก react-icons/lu (lucide) ==== */
import {
  LuCpu,
  LuCircuitBoard,   // motherboard
  LuMonitor,        // gpu
  LuMemoryStick,    // ram
  LuHardDrive,      // hdd/ssd
  LuBox,            // case
  LuFan,            // cooler
  LuPlug,           // power
} from "react-icons/lu";

/* ชื่อหมวด (EN ตามโค้ดที่ให้มา) */
const LABEL = {
  cpu: "CPU",
  mainboard: "Motherboard",
  gpu: "GPU",
  ram: "RAM",
  hdd: "HDD",
  ssd: "SSD",
  case: "Case",
  cooler: "Cooler",
  power: "Power Supply",
};

/* map หมวด -> ไอคอน */
const ICON = {
  cpu: LuCpu,
  mainboard: LuCircuitBoard,
  gpu: LuMonitor,
  ram: LuMemoryStick,
  hdd: LuHardDrive,
  ssd: LuHardDrive,
  case: LuBox,
  cooler: LuFan,
  power: LuPlug,
};

const formatTHB = (n) => `฿${(n || 0).toLocaleString("th-TH")}`;

export default function Sidebar({ active, onChange }) {
  const { selected, removePart, total, reset } = useBuild();
  const { pushToast } = useToast();
  const [specModalOpen, setSpecModalOpen] = useState(false);
  const [productDetailOpen, setProductDetailOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleKey = (e, cat) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onChange(cat);
    }
  };

  return (
    <aside className="col-12 col-md-3 col-lg-2">
      <div className="card shadow-sm sticky-sidebar">
        <div className="card-body p-3">
          {/* ยอดรวม */}
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-semibold">ยอดรวมทั้งสิ้น</span>
            <span className="text-danger fw-bold">{formatTHB(total)}</span>
          </div>

          <hr className="my-3" />

          {/* กล่องเดียวต่อหมวด */}
          <ul className="list-unstyled m-0">
            {CATEGORIES.map((cat) => {
              const chosen = selected[cat];
              const name = chosen?.item?.Device_Name || "";
              const qty = chosen?.qty || 1;
              const price = chosen?.item?.price || 0;
              const sum = price * qty;

              const Icon = ICON[cat] || LuBox;
              const title = name ? `${LABEL[cat] || cat} • ${name}` : (LABEL[cat] || cat);

              return (
                <li key={cat} className="mb-2">
                  <div
                    className={`combo-card ${active === cat ? "is-active" : ""} ${chosen ? "has-item" : ""}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => onChange(cat)}
                    onKeyDown={(e) => handleKey(e, cat)}
                    title={title}
                  >
                    {/* หัวกล่อง: ไอคอน + ชื่อหมวด / ราคา */}
                    <div className="d-flex justify-content-between align-items-center combo-head">
                      <div className="d-flex align-items-center gap-2">
                        <div className="cat-icon">
                          <Icon size={18} />
                        </div>
                        <div className="combo-title">{LABEL[cat] || cat}</div>
                      </div>

                      {chosen ? (
                        <div className="combo-price text-danger fw-semibold">
                          {formatTHB(sum)}
                        </div>
                      ) : (
                        <div className="combo-hint text-muted">ยังไม่เลือก</div>
                      )}
                    </div>

                    {/* เนื้อหา */}
                    <div className="combo-body">
                      {chosen ? (
                        <div className="d-flex align-items-start gap-2">
                          {chosen.item?.image_url && (
                            <img
                              className="combo-thumb"
                              src={resolveImageUrl(chosen.item.image_url)}
                              alt=""
                            />
                          )}

                          <div className="combo-name text-truncate-2">{name}</div>

                          <button
                          className="btn btn-light btn-sm text-danger border-0 combo-trash"
                          title="ลบออก"
                          onClick={(e) => {
                            e.stopPropagation();
                            const removedCat = LABEL[cat] || cat;               // ชื่อหมวด (CPU, GPU, ...)
                            const name = chosen?.item?.Device_Name || "";       // ชื่ออุปกรณ์ (มีอยู่แล้วด้านบน)
                            removePart(cat);
                            pushToast(`นำอุปกรณ์ออกในหมวด “${removedCat}” แล้ว`, "danger");

                          }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 3h6l1 2h4v2H4V5h4l1-2zM6 9h12l-1 11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 9z"/>
                          </svg>
                        </button>

                        </div>
                      ) : (
                        <div className="text-muted small">คลิกเพื่อเลือก {LABEL[cat] || cat}</div>
                      )}
                    </div>

                    {/* ท้ายกล่อง */}
                    {chosen && (
                      <div className="d-flex justify-content-between align-items-center combo-foot">
                        <span 
                          className="badge bg-light text-danger border border-danger-subtle"
                          role="button"
                          style={{ cursor: "pointer" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProduct(chosen.item);
                            setSelectedCategory(cat);
                            setProductDetailOpen(true);
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = "#f8d7da"}
                          onMouseLeave={(e) => e.target.style.backgroundColor = ""}
                        >
                          รายละเอียด
                        </span>
                        <span className="small text-muted">x {qty}</span>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Compatibility Checker */}
          <CompatibilityChecker />

          {/* ปุ่มสร้างชุดสเปกคอมและรีเซ็ต */}
          <div className="mt-4 pt-3 border-top">
            <div className="d-grid gap-2">
              <button 
                className="btn btn-danger btn-sm"
                onClick={() => setSpecModalOpen(true)}
                disabled={Object.keys(selected).length === 0}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-1">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  <path d="M2 17l10 5 10-5"></path>
                  <path d="M2 12l10 5 10-5"></path>
                </svg>
                สร้างชุดจัดสเปกคอม
              </button>
              
              <button 
                className="btn btn-outline-secondary btn-sm"
                onClick={() => {
                  if (window.confirm("ต้องการรีเซ็ตสเปกคอมทั้งหมดหรือไม่?")) {
                    reset();
                    pushToast("รีเซ็ตสเปกคอมเรียบร้อยแล้ว", "info");
                  }
                }}
                disabled={Object.keys(selected).length === 0}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-1">
                  <polyline points="1,4 1,10 7,10"></polyline>
                  <path d="M3.51,15a9,9 0 1,0 2.13,-9.36L1,10"></path>
                </svg>
                รีเซ็ต
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Spec Modal */}
      <SpecModal 
        open={specModalOpen} 
        onClose={() => setSpecModalOpen(false)} 
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        open={productDetailOpen}
        product={selectedProduct}
        category={selectedCategory}
        onClose={() => {
          setProductDetailOpen(false);
          setSelectedProduct(null);
          setSelectedCategory("");
        }}
      />
    </aside>
  );
}
