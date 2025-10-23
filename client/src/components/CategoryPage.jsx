import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useBuild } from "../context/BuildContext";
import { resolveImageUrl } from "../utils/compat";
import { useToast } from "../toast/ToastContext";
import ProductDetailModal from "./ProductDetailModal";

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

export default function CategoryPage({ title, category, endpoint, predicateFactory, onAdded }) {
  const { selected, setPart, removePart } = useBuild();
  const { pushToast } = useToast();

  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("price-asc");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get(endpoint || `/api/${category}`);
        if (!alive) return;
        
        // รองรับทั้ง format เก่า (array) และ format ใหม่ (object with pagination)
        let data = res.data;
        if (data?.data && Array.isArray(data.data)) {
          // Format ใหม่ที่มี pagination
          setRows(data.data);
        } else if (Array.isArray(data)) {
          // Format เก่าที่เป็น array โดยตรง
          setRows(data);
        } else {
          setRows([]);
        }
        
        setErr("");
      } catch (e) {
        setErr(e?.message || "load error");
        setRows([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [endpoint, category]);

  const isSelected = (it) =>
    selected[category]?.item?.Device_ID === it.Device_ID;

  const pred = useMemo(
    () => (predicateFactory ? predicateFactory(selected) : () => true),
    [predicateFactory, selected]
  );

  const filtered = useMemo(() => {
    let r = rows.filter(pred);
    if (q.trim()) {
      const qq = q.trim().toLowerCase();
      r = r.filter((it) => (it.Device_Name || "").toLowerCase().includes(qq));
    }
    r.sort((a, b) => (sort === "price-asc" ? (a.price ?? 0) - (b.price ?? 0) : (b.price ?? 0) - (a.price ?? 0)));
    return r;
  }, [rows, pred, q, sort]);

  const handleToggle = (it) => {
    if (isSelected(it)) {
      removePart(category);
      pushToast(`นำอุปกรณ์ออกในหมวด "${LABEL[category] || category}" แล้ว`, "danger");
    } else {
      setPart(category, it, { keepQty: true });
      pushToast(`เพิ่มอุปกรณ์ในหมวด "${LABEL[category] || category}" เรียบร้อยแล้ว`, "success");
      onAdded?.();
    }
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setDetailModalOpen(true);
  };

  return (
    <div className="col-12 col-md-9 col-lg-10">
      <div className="top-card p-3 mb-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="fw-bold m-0">{title}</h5>
          <div style={{ width: 240 }}>
            <select className="form-select" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="price-asc">ราคาต่ำ-สูง</option>
              <option value="price-desc">ราคาสูง-ต่ำ</option>
            </select>
          </div>
        </div>
        <div className="d-flex gap-2">
          <input className="form-control" placeholder="ค้นหาอุปกรณ์" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      {loading && <div className="text-center text-muted py-4">กำลังโหลด...</div>}
      {err && !loading && <div className="alert alert-danger py-2">โหลดข้อมูลไม่สำเร็จ: {err}</div>}

      {!loading && !err && (
        <>
          <div className="row g-3">
            {filtered.map((it) => {
              const selectedNow = isSelected(it);
              return (
                <div key={it.Device_ID} className="col-12 col-sm-6 col-md-4 col-lg-3">
                  <div className="pc-card h-100 position-relative">
                    <div 
                      className="pc-card__img-wrap"
                      onClick={() => handleProductClick(it)}
                      style={{ cursor: "pointer" }}
                      title="คลิกเพื่อดูรายละเอียด"
                    >
                      <img
                        src={resolveImageUrl(it.image_url)}
                        alt={it.Device_Name}
                        className="pc-card__img"
                        onError={(e) => (e.currentTarget.style.visibility = "hidden")}
                      />
                    </div>

                    <div 
                      className="pc-card__body"
                      onClick={() => handleProductClick(it)}
                      style={{ cursor: "pointer" }}
                      title="คลิกเพื่อดูรายละเอียด"
                    >
                      <div className="pc-card__name clamp-3">{it.Device_Name}</div>
                      <div className="pc-card__price">฿{(it.price || 0).toLocaleString("th-TH")}</div>
                    </div>

                    <button
                      className={`pc-card__add ${selectedNow ? "is-remove" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggle(it);
                      }}
                      title={selectedNow ? "นำออก" : "เพิ่มลงสเปก"}
                      aria-label={selectedNow ? "Remove" : "Add"}
                    >
                      {selectedNow ? "−" : "+"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && <div className="text-center text-muted py-5">ไม่พบอุปกรณ์ที่เข้ากันได้</div>}
        </>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        open={detailModalOpen}
        product={selectedProduct}
        category={category}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedProduct(null);
        }}
      />
    </div>
  );
}
