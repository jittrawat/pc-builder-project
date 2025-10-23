// client/src/pages/AdminPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import api from "../lib/api";
import PresetBuilderPage from "./PresetBuilderPage";
import "./AdminPage.css";

/** -------------------- CONFIG ของแต่ละอุปกรณ์ -------------------- */
const CATS = {
  device: {
    title: "Device",
    endpoint: "/api/device",
    idKey: "Device_ID",
    opIdKey: "Device_ID",
    columns: [
      { key: "Device_ID",   label: "Device_ID", width: 100, readOnly: true },
      { key: "Device_Name", label: "Device_Name" },
      { key: "price",       label: "Price", width: 120 },
      { key: "image_url",   label: "Image" },
    ],
    fields: [
      { key: "Device_Name", label: "Device_Name", type: "text", required: true },
      { key: "price",       label: "Price", type: "number", required: true },
      { key: "image_url",   label: "Image", type: "file-or-url" },
    ],
  },

  cpu: {
    title: "CPU",
    endpoint: "/api/cpu",
    idKey: "CPU_ID",
    opIdKey: "Device_ID",
    columns: [
      { key: "CPU_ID",     label: "ID", width: 80, readOnly: true },
      { key: "Device_ID",  label: "Device_ID" },
      { key: "Device_Name",label: "Device_Name" },
      { key: "image_url",  label: "Image", width: 100 },
      { key: "socket",     label: "Socket" },
      { key: "power_usage",label: "W" },
      { key: "details",    label: "Details" },
    ],
    fields: [
      { key: "device_name", label: "Device Name", type: "text", required: true },
      { key: "price",       label: "Price", type: "number", required: true },
      { key: "image_url",   label: "Image", type: "file-or-url" },
      { key: "socket",      label: "Socket ที่รองรับ", type: "multiselect", options: [
        "LGA1700", "LGA1200", "LGA1151", "LGA1150", "LGA1155",
        "AM5", "AM4", "AM3+", "TR4", "sTRX4"
      ]},
      { key: "power_usage", label: "Power (W)", type: "number" },
      { key: "details",     label: "Details", type: "text" },
    ],
  },

  mainboard: {
    title: "Mainboard",
    endpoint: "/api/mainboard",
    idKey: "mainboard_ID",
    opIdKey: "Device_ID",
    columns: [
      { key: "mainboard_ID", label: "ID", width: 80, readOnly: true },
      { key: "Device_ID",    label: "Device_ID" },
      { key: "Device_Name",  label: "Device_Name" },
      { key: "image_url",    label: "Image", width: 100 },
      { key: "Socket_Sup",   label: "Socket_Sup" },
      { key: "RAM_Sup",      label: "RAM_Sup" },
      { key: "Case_Sup",     label: "Case_Sup" },
      { key: "PCIe_Sup",     label: "PCIe_Sup" },
      { key: "SSD_Sup",      label: "SSD_Sup" },
      { key: "power_usage",  label: "Power (W)" },
      { key: "details",      label: "Details" },
    ],
    fields: [
      { key: "device_name", label: "Device Name", type: "text", required: true },
      { key: "price",       label: "Price", type: "number", required: true },
      { key: "image_url",   label: "Image", type: "file-or-url" },
      { key: "Socket_Sup",  label: "Socket_Sup", type: "multiselect", options: [
        "LGA1700", "LGA1200", "LGA1151", "LGA1150", "LGA1155",
        "AM5", "AM4", "AM3+", "TR4", "sTRX4"
      ]},
      { key: "RAM_Sup",     label: "RAM_Sup", type: "multiselect", options: [
        "DDR5", "DDR4", "DDR3"
      ]},
      { key: "Case_Sup",    label: "Case_Sup", type: "multiselect", options: [
        "ATX", "Micro-ATX", "Mini-ITX", "E-ATX"
      ]},
      { key: "PCIe_Sup",    label: "PCIe_Sup", type: "multiselect", options: [
        "PCIe 5.0 x16", "PCIe 4.0 x16", "PCIe 3.0 x16", "PCIe 2.0 x16"
      ]},
      { key: "SSD_Sup",     label: "SSD_Sup", type: "multiselect", options: [
        "M.2 NVMe", "M.2 SATA", "SATA 2.5\"", "PCIe NVMe"
      ]},
      { key: "power_usage", label: "Power Usage (W)", type: "number" },
      { key: "details",     label: "Details", type: "text" },
    ],
  },

  gpu: {
    title: "GPU",
    endpoint: "/api/gpu",
    idKey: "GPU_ID",
    opIdKey: "Device_ID",
    columns: [
      { key: "GPU_ID",      label: "ID", width: 80, readOnly: true },
      { key: "Device_ID",   label: "Device_ID" },
      { key: "Device_Name", label: "Device_Name" },
      { key: "image_url",   label: "Image", width: 100 },
      { key: "PCIe_Type",   label: "PCIe_Type" },
      { key: "Power_Req",   label: "Power (W)" },
      { key: "details",     label: "Details" },
    ],
    fields: [
      { key: "device_name", label: "Device Name", type: "text", required: true },
      { key: "price",       label: "Price", type: "number", required: true },
      { key: "image_url",   label: "Image", type: "file-or-url" },
      { key: "PCIe_Type",   label: "PCIe_Type", type: "multiselect", options: [
        "PCIe 5.0 x16", "PCIe 4.0 x16", "PCIe 3.0 x16", "PCIe 2.0 x16"
      ]},
      { key: "Power_Req",   label: "Power Requirement (W)", type: "number" },
      { key: "details",     label: "Details", type: "text" },
    ],
  },

  ram: {
    title: "RAM",
    endpoint: "/api/ram",
    idKey: "RAM_ID",
    opIdKey: "Device_ID",
    columns: [
      { key: "RAM_ID",      label: "ID", width: 80, readOnly: true },
      { key: "Device_ID",   label: "Device_ID" },
      { key: "Device_Name", label: "Device_Name" },
      { key: "image_url",   label: "Image", width: 100 },
      { key: "Type_RAM",    label: "Type_RAM" },
      { key: "details",     label: "Details" },
    ],
    fields: [
      { key: "device_name", label: "Device Name", type: "text", required: true },
      { key: "price",       label: "Price", type: "number", required: true },
      { key: "image_url",   label: "Image", type: "file-or-url" },
      { key: "Type_RAM",    label: "Type_RAM", type: "multiselect", options: [
        "DDR5", "DDR4", "DDR3"
      ]},
      { key: "details",     label: "Details", type: "text" },
    ],
  },

  ssd: {
    title: "SSD",
    endpoint: "/api/ssd",
    idKey: "SSD_ID",
    opIdKey: "Device_ID",
    columns: [
      { key: "SSD_ID",      label: "ID", width: 80, readOnly: true },
      { key: "Device_ID",   label: "Device_ID" },
      { key: "Device_Name", label: "Device_Name" },
      { key: "image_url",   label: "Image", width: 100 },
      { key: "SSD_Type",    label: "SSD_Type" },
      { key: "details",     label: "Details" },
    ],
    fields: [
      { key: "device_name", label: "Device Name", type: "text", required: true },
      { key: "price",       label: "Price", type: "number", required: true },
      { key: "image_url",   label: "Image", type: "file-or-url" },
      { key: "SSD_Type",    label: "SSD_Type", type: "multiselect", options: [
        "M.2 NVMe", "M.2 SATA", "SATA 2.5\"", "PCIe NVMe"
      ]},
      { key: "details",     label: "Details", type: "text" },
    ],
  },

  harddisk: {
    title: "Harddisk",
    endpoint: "/api/harddisk",
    idKey: "Harddisk_ID",
    opIdKey: "Device_ID",
    columns: [
      { key: "Harddisk_ID", label: "ID", width: 80, readOnly: true },
      { key: "Device_ID",   label: "Device_ID" },
      { key: "Device_Name", label: "Device_Name" },
      { key: "image_url",   label: "Image", width: 100 },
      { key: "details",     label: "Details" },
    ],
    fields: [
      { key: "device_name", label: "Device Name", type: "text", required: true },
      { key: "price",       label: "Price", type: "number", required: true },
      { key: "image_url",   label: "Image", type: "file-or-url" },
      { key: "details",     label: "Details", type: "text" },
    ],
  },

  power: {
    title: "Power Supply",
    endpoint: "/api/power",
    idKey: "Power_ID",
    opIdKey: "Device_ID",
    columns: [
      { key: "Power_ID",    label: "ID", width: 80, readOnly: true },
      { key: "Device_ID",   label: "Device_ID" },
      { key: "image_url",   label: "Image", width: 100 },
      { key: "Device_Name", label: "Device_Name" },
      { key: "Power_sup",   label: "Power_Sup (W)" },
      { key: "details",     label: "Details" },
    ],
    fields: [
      { key: "device_name", label: "Device Name", type: "text", required: true },
      { key: "price",       label: "Price", type: "number", required: true },
      { key: "image_url",   label: "Image", type: "file-or-url" },
      { key: "power_sup",   label: "Power_Sup (W)", type: "number" },
      { key: "details",     label: "Details", type: "text" },
    ],
  },

  cooler: {
    title: "Cooler",
    endpoint: "/api/cooler",
    idKey: "Cooler_ID",
    opIdKey: "Device_ID",
    columns: [
      { key: "Cooler_ID",   label: "ID", width: 60, readOnly: true },
      { key: "Device_ID",   label: "Device_ID", width: 80 },
      { key: "image_url",   label: "Image", width: 80 },
      { key: "Device_Name", label: "Device_Name" },
      { key: "Socket_Sup",  label: "Socket_Sup", width: 200 },
      { key: "details",     label: "Details", width: 250 },
    ],
    fields: [
      { key: "device_name", label: "Device Name", type: "text", required: true },
      { key: "price",       label: "Price", type: "number", required: true },
      { key: "image_url",   label: "Image", type: "file-or-url" },
      { key: "Socket_Sup",  label: "Socket_Sup", type: "multiselect", options: [
        "LGA1700", "LGA1200", "LGA1151", "LGA1150", "LGA1155",
        "AM5", "AM4", "AM3+", "TR4", "sTRX4", "Universal"
      ]},
      { key: "details",     label: "Details", type: "textarea" },
    ],
  },

  case: {
    title: "PC Case",
    endpoint: "/api/case",
    idKey: "case_ID",
    opIdKey: "Device_ID",
    columns: [
      { key: "case_ID",     label: "ID", width: 80, readOnly: true },
      { key: "Device_ID",   label: "Device_ID" },
      { key: "image_url",   label: "Image", width: 100 },
      { key: "Device_Name", label: "Device_Name" },
      { key: "Size_Case",   label: "Size_Case" },
      { key: "details",     label: "Details" },
    ],
    fields: [
      { key: "device_name", label: "Device Name", type: "text", required: true },
      { key: "price",       label: "Price", type: "number", required: true },
      { key: "image_url",   label: "Image", type: "file-or-url" },
      { key: "Size_Case",   label: "Size_Case", type: "multiselect", options: [
        "ATX",
        "Micro-ATX",
        "Mini-ITX",
        "E-ATX",
        "Full Tower",
        "Mid Tower",
        "Mini Tower"
      ]},
      { key: "details",     label: "Details", type: "text" },
    ],
  },

  presets: {
    title: "Preset Builds",
    endpoint: "/api/presets",
    loadEndpoint: "/api/presets/admin/all", // ใช้ endpoint พิเศษสำหรับโหลด
    idKey: "preset_id",
    opIdKey: "preset_id",
    isPreset: true, // Flag พิเศษ
    columns: [
      { key: "preset_id",    label: "ID", width: 80, readOnly: true },
      { key: "thumbnail_url", label: "Thumbnail", width: 100 },
      { key: "title",        label: "Title", width: 200 },
      { key: "category",     label: "Category", width: 120 },
      { key: "total_price",  label: "Price", width: 120 },
      { key: "item_count",   label: "Items", width: 80 },
      { key: "is_active",    label: "Active", width: 80 },
      { key: "created_at",   label: "วันที่", width: 150 },
    ],
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "description", label: "Description", type: "textarea" },
      { key: "category", label: "Category", type: "select", options: [
        { value: "office", label: "ทำงานออฟฟิศ" },
        { value: "gaming", label: "เล่นเกม" },
        { value: "video-editing", label: "ตัดต่อวิดีโอ" },
        { value: "streaming", label: "Streaming" },
        { value: "workstation", label: "Workstation" },
      ]},
      { key: "thumbnail_url", label: "Thumbnail (อัปโหลดไฟล์หรือ URL)", type: "file-or-url" },
      { key: "is_active", label: "Active", type: "checkbox" },
    ],
  },
};

/** -------------------- HELPERS -------------------- */
function pickWithFallback(item, primaryKey, alts = []) {
  if (!item) return "";
  if (item[primaryKey] !== undefined && item[primaryKey] !== null) return item[primaryKey];
  for (const k of alts) if (item[k] !== undefined && item[k] !== null) return item[k];
  return "";
}

/** ทำความสะอาด URL รูป + ต่อ baseURL อัตโนมัติ + รองรับหลายคีย์ */
function getImageSrcFromRow(row) {
  let raw =
    row?.image_url ?? row?.Image_URL ?? row?.thumbnail_url ?? row?.image ?? row?.Image ?? row?.url ?? row?.URL ?? "";
  if (!raw) return "";

  if (typeof raw === "string") {
    raw = raw.trim().replace(/\\+/g, "/"); // backslash -> /
    if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
      raw = raw.slice(1, -1).trim();
    }
  }

  if (/^data:/i.test(raw)) return raw;
  if (/^(https?:)?\/\//i.test(raw)) return raw;

  const base = (api?.defaults?.baseURL || "").replace(/\/$/, "");
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  return base ? `${base}${path}` : path;
}

/** คอมโพเนนต์รูปแบบมี state — fail แล้วโชว์ URL ให้ดีบั๊ก */
function ImageCell({ row }) {
  const src = getImageSrcFromRow(row);
  const [failed, setFailed] = React.useState(false);

  if (!src) {
    return (
      <div
        style={{
          width: 82,
          height: 62,
          backgroundImage: `
            linear-gradient(45deg, #ccc 25%, transparent 25%),
            linear-gradient(-45deg, #ccc 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #ccc 75%),
            linear-gradient(-45deg, transparent 75%, #ccc 75%)
          `,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
          borderRadius: 6,
        }}
      />
    );
  }

  if (failed) {
    return (
      <div style={{ maxWidth: 220 }}>
        <span className="badge text-bg-danger">โหลดรูปไม่ได้</span>
        <div className="small text-muted mt-1" style={{ wordBreak: "break-all" }}>{src}</div>
        <a className="small" href={src} target="_blank" rel="noreferrer">เปิดรูปในแท็บใหม่</a>
      </div>
    );
  }

  return (
    <div
      style={{
        width: 82, height: 62, display: "flex", alignItems: "center", justifyContent: "center",
        borderRadius: 6,
        background: "#f8f9fa", // เปลี่ยนเป็นพื้นหลังสีขาวแทน pattern
        border: "1px solid #e7e7e7", overflow: "hidden",
      }}
      title={src}
    >
      <img
        src={src}
        alt={row.Device_Name || "image"}
        crossOrigin="anonymous"
        loading="lazy"
        style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
        onLoad={(e) => {
          const w = e.currentTarget.naturalWidth || 0;
          const h = e.currentTarget.naturalHeight || 0;
          // กันเคสภาพ placeholder 1x1 หรือ 0x0
          if (w === 0 || h === 0 || (w === 1 && h === 1)) setFailed(true);
        }}
        onError={() => setFailed(true)}
      />
    </div>
  );
}

/** โมดอลแบบง่าย */
function SimpleModal({ open, title, children, onClose, footer }) {
  if (!open) return null;
  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100"
      style={{ background: "rgba(0,0,0,.35)", zIndex: 1050 }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded shadow"
        style={{
          width: 720, maxWidth: "95%", maxHeight: "85vh",
          margin: "6vh auto", display: "flex", flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
          <h5 className="mb-0" style={{ overflow: "visible", textOverflow: "clip", whiteSpace: "normal", wordBreak: "break-word", flex: 1, marginRight: "1rem" }}>{title}</h5>
          <button className="btn btn-sm btn-light" onClick={onClose}>×</button>
        </div>
        <div className="px-3 py-3" style={{ overflowY: "auto" }}>
          {children}
        </div>
        <div className="px-3 py-2 border-top bg-white">{footer}</div>
      </div>
    </div>
  );
}

/** -------------------- MAIN PAGE -------------------- */
export default function AdminPage() {
  const [active, setActive] = useState("device");
  const [view, setView] = useState("table"); // 'table' | 'preset-builder'
  const [selectedPresetId, setSelectedPresetId] = useState(null);
  const cfg = CATS[active];

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(50);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [sortDir, setSortDir] = useState("asc");
  const [search, setSearch] = useState("");
  
  // Modal รายละเอียดอุปกรณ์
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState(null);

  // อัปโหลดรูปในฟอร์ม
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const reqIdRef = useRef(0);

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(file);
    });

  const uploadImage = async (file) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await api.post("/api/upload", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res?.data?.url;
  };

  const load = async (page = 1) => {
    const myId = ++reqIdRef.current;
    setLoading(true);
    try {
      // ใช้ loadEndpoint ถ้ามี ไม่งั้นใช้ endpoint ปกติ
      const endpoint = cfg.loadEndpoint || cfg.endpoint;
      const res = await api.get(endpoint, {
        params: { page, limit: itemsPerPage }
      });
      if (reqIdRef.current !== myId) return;
      
      // รองรับทั้ง format เก่า (array) และ format ใหม่ (object with pagination)
      if (res.data?.data && res.data?.pagination) {
        setRows(res.data.data);
        setCurrentPage(res.data.pagination.page);
        setTotalPages(res.data.pagination.totalPages);
        setTotalItems(res.data.pagination.total);
      } else {
        // Fallback for old format
        let list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setRows(Array.isArray(list) ? list : []);
        setTotalPages(1);
        setTotalItems(list.length);
      }
    } catch (err) {
      console.error(err);
      alert("โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setRows([]); setEditing(null); setEditorOpen(false); setSearch("");
    setImageFile(null); setImagePreview("");
    setCurrentPage(1);
    // สำหรับ presets ให้เริ่มต้นเรียงจากวันที่ใหม่ไปเก่า (desc)
    setSortDir(cfg.isPreset ? "desc" : "asc");
    load(1);
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    load(newPage);
  };

  const onAdd = () => {
    setEditing(null);
    const base = {};
    cfg.fields.forEach((f) => (base[f.key] = ""));
    setForm(base);
    setImageFile(null);
    setImagePreview("");
    setEditorOpen(true);
  };

  const onEdit = (item) => {
    setEditing(item);
    const init = {};
    let imgPreviewKey = "";
    cfg.fields.forEach((f) => {
      if (f.type === "file-or-url") {
        const img = getImageSrcFromRow(item);
        init[f.key] = img || item[f.key] || "";
        imgPreviewKey = f.key;
      } else if (f.key === "device_name") {
        init[f.key] = pickWithFallback(item, "device_name", ["Device_Name"]);
      } else if (f.key === "details") {
        init[f.key] = pickWithFallback(item, "details", ["Details"]);
      } else if (f.key === "power_sup") {
        init[f.key] = pickWithFallback(item, "power_sup", ["Power_sup"]);
      } else {
        init[f.key] = item[f.key] ?? "";
      }
    });
    setForm(init);
    setImageFile(null);
    setImagePreview(imgPreviewKey ? init[imgPreviewKey] || "" : "");
    setEditorOpen(true);
  };

  const onDelete = async (item) => {
    const idVal = item[cfg.opIdKey || cfg.idKey];
    if (!window.confirm(`ลบ Device_ID #${idVal}?`)) return;
    await api.delete(`${cfg.endpoint}/${idVal}`);
    await load(currentPage);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const body = { ...form };

      // จัดการอัปโหลดรูปภาพ (รองรับทั้ง image_url และ thumbnail_url)
      if (imageFile) {
        try {
          const uploadedUrl = await uploadImage(imageFile);
          // หา field ที่เป็น file-or-url
          const imageField = cfg.fields.find(f => f.type === "file-or-url");
          const fieldKey = imageField?.key || "image_url";
          body[fieldKey] = uploadedUrl || (await fileToDataUrl(imageFile));
        } catch {
          const imageField = cfg.fields.find(f => f.type === "file-or-url");
          const fieldKey = imageField?.key || "image_url";
          body[fieldKey] = await fileToDataUrl(imageFile);
        }
      }

      cfg.fields.forEach((f) => {
        if (f.type === "number" && body[f.key] !== "") body[f.key] = Number(body[f.key]);
        if (f.type === "checkbox") body[f.key] = body[f.key] ? 1 : 0;
      });

      if (editing) {
        const idVal = editing[cfg.opIdKey || cfg.idKey];
        await api.put(`${cfg.endpoint}/${idVal}`, body);
        await load(currentPage);
      } else {
        await api.post(cfg.endpoint, body);
        await load(1); // เพิ่มใหม่ไปหน้าแรก
        setCurrentPage(1);
      }
      setEditorOpen(false);
    } catch (err) {
      console.error("Submit error:", err);
      alert("เกิดข้อผิดพลาด: " + (err.response?.data?.error || err.message));
    }
  };

  // filter + sort
  const filteredRows = useMemo(() => {
    const kw = search.trim().toLowerCase();
    if (!kw) return rows;
    return rows.filter((r) =>
      Object.values(r).some((v) => String(v ?? "").toLowerCase().includes(kw))
    );
  }, [rows, search]);

  const sortedRows = useMemo(() => {
    const list = [...filteredRows];
    
    // สำหรับ presets เรียงตามวันที่ (created_at) แทน ID
    if (cfg.isPreset) {
      list.sort((a, b) => {
        const dateA = new Date(a?.created_at || 0);
        const dateB = new Date(b?.created_at || 0);
        return sortDir === "asc" ? dateA - dateB : dateB - dateA;
      });
    } else {
      // สำหรับอุปกรณ์อื่นๆ เรียงตาม ID
      const k = cfg.idKey;
      list.sort((a, b) => {
        const ida = Number(a?.[k] ?? 0);
        const idb = Number(b?.[k] ?? 0);
        return sortDir === "asc" ? ida - idb : idb - ida;
      });
    }
    return list;
  }, [filteredRows, cfg, sortDir]);

  // เรนเดอร์เซลล์ (รูปใช้ ImageCell)
  const renderCell = (row, col) => {
    if (col.key === "image_url" || col.key === "thumbnail_url") return <ImageCell row={row} />;

    if (col.key === "price" || col.key === "total_price") {
      try { return new Intl.NumberFormat().format(Number(row.price || row.total_price || 0)); }
      catch { return row.price ?? row.total_price ?? ""; }
    }

    // แสดงวันที่ในรูปแบบที่อ่านง่าย
    if (col.key === "created_at") {
      const dateValue = row.created_at;
      if (!dateValue) return "-";
      try {
        const date = new Date(dateValue);
        return new Intl.DateTimeFormat('th-TH', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(date);
      } catch {
        return dateValue;
      }
    }

    // Device_Name สามารถคลิกดูรายละเอียดได้
    if (col.key === "Device_Name") {
      const deviceName = row.Device_Name || row.device_name || "";
      return (
        <span
          onClick={() => {
            setViewingItem(row);
            setDetailsOpen(true);
          }}
          style={{ 
            cursor: "pointer", 
            color: "#0d6efd", 
            textDecoration: "underline",
            textDecorationStyle: "dotted",
            whiteSpace: "normal",
            wordBreak: "break-word",
            overflow: "visible",
            textOverflow: "clip",
            display: "inline",
            maxWidth: "none"
          }}
          title="คลิกเพื่อดูรายละเอียด"
        >
          {deviceName}
        </span>
      );
    }

    // ตัดข้อความยาวสำหรับคอลัมน์ details และ Socket_Sup
    if (col.key === "details" || col.key === "Details" || col.key === "Socket_Sup") {
      const text = row[col.key] ?? row[col.key?.charAt(0).toUpperCase() + col.key?.slice(1)] ?? "";
      const maxLength = col.key === "Socket_Sup" ? 30 : 50;
      if (text.length > maxLength) {
        return (
          <div style={{ maxWidth: col.width || 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={text}>
            {text}
          </div>
        );
      }
      return text;
    }

    return (
      row[col.key] ??
      row[col.key?.charAt(0).toUpperCase() + col.key?.slice(1)] ??
      ""
    );
  };

  // แสดงหน้า PresetBuilder ถ้ากำลังจัดการอุปกรณ์
  if (view === "preset-builder" && selectedPresetId) {
    return (
      <PresetBuilderPage
        presetId={selectedPresetId}
        onBack={() => {
          setView("table");
          setSelectedPresetId(null);
          load(currentPage);
        }}
      />
    );
  }

  return (
    <div className="container py-4">
      {/* Tabs */}
      <ul className="nav nav-tabs mb-3">
        {Object.keys(CATS).map((k) => (
          <li key={k} className="nav-item">
            <button
              className={`nav-link ${active === k ? "active" : ""}`}
              onClick={() => setActive(k)}
            >
              {CATS[k].title}
            </button>
          </li>
        ))}
      </ul>

      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 admin-toolbar">
        <h1 className="h5 mb-0">{cfg.title} — รายการ</h1>

        <div className="d-flex gap-2">
          <input
            type="text"
            className="form-control"
            placeholder="ค้นหา..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ minWidth: 240 }}
          />

          <button
            className="btn btn-outline-secondary"
            onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
            title={cfg.isPreset ? "สลับเรียงตามวันที่" : `สลับเรียง ${cfg.idKey}`}
          >
            {cfg.isPreset ? "วันที่" : "ID"} {sortDir === "asc" ? "↑" : "↓"}
          </button>

          <button className="btn btn-primary" onClick={onAdd}>
            + เพิ่ม{cfg.title}
          </button>
        </div>
      </div>

      <div className="table-responsive mt-3">
        <table className="table table-sm align-middle">
          <thead>
            <tr>
              {cfg.columns.map((c) => (
                <th key={c.key} style={c.width && c.key !== "Device_Name" ? { width: c.width, minWidth: c.width } : undefined}>
                  {c.label}
                </th>
              ))}
              <th style={{ width: 140, minWidth: 140 }}>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={cfg.columns.length + 1}>กำลังโหลด…</td></tr>
            ) : sortedRows.length === 0 ? (
              <tr><td colSpan={cfg.columns.length + 1}>ไม่พบข้อมูล</td></tr>
            ) : (
              sortedRows.map((r, idx) => (
                <tr key={r[cfg.idKey] ?? idx}>
                  {cfg.columns.map((c) => (
                    <td key={c.key} style={c.width && c.key !== "Device_Name" ? { maxWidth: c.width } : undefined}>{renderCell(r, c)}</td>
                  ))}
                  <td style={{ width: 140, minWidth: 140 }}>
                    <div className="btn-group btn-group-sm" style={{ whiteSpace: 'nowrap' }}>
                      {active === "presets" && (
                        <button 
                          className="btn btn-outline-primary" 
                          onClick={() => {
                            setSelectedPresetId(r.preset_id);
                            setView("preset-builder");
                          }}
                          title="จัดการอุปกรณ์ในชุดนี้"
                        >
                          อุปกรณ์
                        </button>
                      )}
                      <button className="btn btn-outline-secondary" onClick={() => onEdit(r)}>แก้ไข</button>
                      <button className="btn btn-outline-danger" onClick={() => onDelete(r)}>ลบ</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3 px-3">
          <div className="text-muted">
            แสดง {rows.length} รายการ จากทั้งหมด {totalItems.toLocaleString()} รายการ
          </div>
          <div className="d-flex gap-2 align-items-center">
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
            >
              ← ก่อนหน้า
            </button>
            
            <div className="d-flex gap-1">
              {/* First page */}
              {currentPage > 3 && (
                <>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => handlePageChange(1)}
                  >
                    1
                  </button>
                  {currentPage > 4 && <span className="px-2">...</span>}
                </>
              )}
              
              {/* Pages around current */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => 
                  page === currentPage || 
                  page === currentPage - 1 || 
                  page === currentPage + 1 ||
                  page === currentPage - 2 ||
                  page === currentPage + 2
                )
                .map(page => (
                  <button
                    key={page}
                    className={`btn btn-sm ${page === currentPage ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => handlePageChange(page)}
                    disabled={loading}
                  >
                    {page}
                  </button>
                ))}
              
              {/* Last page */}
              {currentPage < totalPages - 2 && (
                <>
                  {currentPage < totalPages - 3 && <span className="px-2">...</span>}
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => handlePageChange(totalPages)}
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>

            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
            >
              ถัดไป →
            </button>
          </div>
        </div>
      )}

      {/* Modal รายละเอียดอุปกรณ์ */}
      <SimpleModal
        open={detailsOpen}
        title={pickWithFallback(viewingItem, "Device_Name", ["device_name", "title"]) || "รายละเอียดอุปกรณ์"}
        onClose={() => {
          setDetailsOpen(false);
          setViewingItem(null);
        }}
        footer={
          <div className="d-flex justify-content-end">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => {
                setDetailsOpen(false);
                setViewingItem(null);
              }}
            >
              ปิด
            </button>
          </div>
        }
      >
        {viewingItem && (
          <div className="row g-4">
            {/* คอลัมน์ซ้าย - รูปภาพ */}
            <div className="col-md-5">
              <div className="d-flex align-items-center justify-content-center p-3" style={{ minHeight: 300, background: "#f8f9fa", borderRadius: 8 }}>
                {(() => {
                  const imgSrc = getImageSrcFromRow(viewingItem);
                  if (!imgSrc) {
                    return (
                      <div
                        style={{
                          width: "100%",
                          height: 280,
                          backgroundImage: `
                            linear-gradient(45deg, #ccc 25%, transparent 25%),
                            linear-gradient(-45deg, #ccc 25%, transparent 25%),
                            linear-gradient(45deg, transparent 75%, #ccc 75%),
                            linear-gradient(-45deg, transparent 75%, #ccc 75%)
                          `,
                          backgroundSize: '20px 20px',
                          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                          borderRadius: 8,
                        }}
                      />
                    );
                  }
                  return (
                    <img
                      src={imgSrc}
                      alt={pickWithFallback(viewingItem, "Device_Name", ["device_name"])}
                      style={{ maxWidth: "100%", maxHeight: 280, objectFit: "contain" }}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  );
                })()}
              </div>
            </div>

            {/* คอลัมน์ขวา - ข้อมูล */}
            <div className="col-md-7">
              <div className="mb-4">
                <h6 className="text-muted mb-3">ข้อมูลพื้นฐาน</h6>
                <div className="mb-2">
                  <strong>อุปกรณ์:</strong>{" "}
                  <span>{pickWithFallback(viewingItem, "Device_Name", ["device_name", "title"])}</span>
                </div>
                <div className="mb-2">
                  <strong>ราคา:</strong>{" "}
                  <span className="text-danger fs-5">
                    ฿{new Intl.NumberFormat().format(Number(viewingItem.price || viewingItem.total_price || 0))}
                  </span>
                </div>
              </div>

              <div>
                <h6 className="text-muted mb-3">รายละเอียดเพิ่มเติม</h6>
                <div 
                  style={{ 
                    background: "#f8f9fa", 
                    padding: "1rem", 
                    borderRadius: 8,
                    lineHeight: 1.8,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word"
                  }}
                >
                  {pickWithFallback(viewingItem, "details", ["Details", "description"]) || "ไม่มีรายละเอียด"}
                </div>
              </div>
            </div>
          </div>
        )}
      </SimpleModal>

      <SimpleModal
        open={editorOpen}
        title={editing ? `แก้ไข ${cfg.title}` : `เพิ่ม ${cfg.title}`}
        onClose={() => setEditorOpen(false)}
        footer={
          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-light" onClick={() => setEditorOpen(false)}>ยกเลิก</button>
            <button type="submit" form="edit-form" className="btn btn-primary">บันทึก</button>
          </div>
        }
      >
        <form id="edit-form" onSubmit={onSubmit}>
          <div className="row g-3">
            {cfg.fields.map((f) => {
              if (f.type === "file-or-url") {
                const fieldKey = f.key;
                return (
                  <div key={f.key} className="col-12">
                    <label className="form-label">{f.label}</label>
                    <div className="d-flex flex-column gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        className="form-control"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          setImageFile(file || null);
                          if (file) {
                            const preview = await fileToDataUrl(file);
                            setImagePreview(preview);
                            setForm(s => ({ ...s, [fieldKey]: "" }));
                          } else {
                            setImagePreview("");
                          }
                        }}
                      />
                      <input
                        type="text"
                        className="form-control"
                        placeholder="หรือวาง Image URL (ถ้าไม่อัปไฟล์)"
                        value={form[fieldKey] || ""}
                        onChange={(e) => {
                          setForm(s => ({ ...s, [fieldKey]: e.target.value }));
                          setImageFile(null);
                          setImagePreview(e.target.value.trim());
                        }}
                      />
                      {imagePreview ? (
                        <div className="mt-1">
                          <div className="text-muted mb-1">พรีวิว:</div>
                          <img
                            src={imagePreview}
                            alt="preview"
                            style={{ maxWidth: "100%", maxHeight: 180, objectFit: "contain", borderRadius: 8, border: "1px solid #eee" }}
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              const wrap = document.createElement("div");
                              wrap.innerHTML = `<span class="badge text-bg-danger">พรีวิวโหลดไม่ได้</span>`;
                              e.currentTarget.parentNode?.appendChild(wrap);
                            }}
                          />
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              }

              // Textarea
              if (f.type === "textarea") {
                return (
                  <div key={f.key} className="col-12">
                    <label className="form-label">
                      {f.label}{f.required ? " *" : ""}
                    </label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={form[f.key] ?? ""}
                      onChange={(e) => setForm(s => ({ ...s, [f.key]: e.target.value }))}
                      required={!!f.required}
                    />
                  </div>
                );
              }

              // Select
              if (f.type === "select" && f.options) {
                return (
                  <div key={f.key} className="col-12 col-md-6">
                    <label className="form-label">
                      {f.label}{f.required ? " *" : ""}
                    </label>
                    <select
                      className="form-select"
                      value={form[f.key] ?? ""}
                      onChange={(e) => setForm(s => ({ ...s, [f.key]: e.target.value }))}
                      required={!!f.required}
                    >
                      <option value="">-- เลือก --</option>
                      {f.options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                );
              }

              // Multi-select (checkboxes)
              if (f.type === "multiselect" && f.options) {
                const currentValues = form[f.key] ? String(form[f.key]).split(',').map(v => v.trim()) : [];
                
                return (
                  <div key={f.key} className="col-12">
                    <label className="form-label">
                      {f.label}{f.required ? " *" : ""}
                    </label>
                    <div className="border rounded p-3" style={{ background: "#f8f9fa" }}>
                      {f.options.map((opt) => {
                        const optValue = typeof opt === 'string' ? opt : opt.value;
                        const optLabel = typeof opt === 'string' ? opt : opt.label;
                        const isChecked = currentValues.includes(optValue);
                        
                        return (
                          <div key={optValue} className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id={`${f.key}-${optValue}`}
                              checked={isChecked}
                              onChange={(e) => {
                                let newValues;
                                if (e.target.checked) {
                                  newValues = [...currentValues, optValue];
                                } else {
                                  newValues = currentValues.filter(v => v !== optValue);
                                }
                                setForm(s => ({ ...s, [f.key]: newValues.join(',') }));
                              }}
                            />
                            <label className="form-check-label" htmlFor={`${f.key}-${optValue}`}>
                              {optLabel}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                    <small className="text-muted">จะบันทึกเป็น: {form[f.key] || "ไม่มี"}</small>
                  </div>
                );
              }

              // Checkbox
              if (f.type === "checkbox") {
                return (
                  <div key={f.key} className="col-12 col-md-6">
                    <div className="form-check mt-4">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id={`check-${f.key}`}
                        checked={!!form[f.key]}
                        onChange={(e) => setForm(s => ({ ...s, [f.key]: e.target.checked ? 1 : 0 }))}
                      />
                      <label className="form-check-label" htmlFor={`check-${f.key}`}>
                        {f.label}
                      </label>
                    </div>
                  </div>
                );
              }

              // Default: text/number input
              return (
                <div key={f.key} className="col-12 col-md-6">
                  <label className="form-label">
                    {f.label}{f.required ? " *" : ""}
                  </label>
                  <input
                    className="form-control"
                    type={f.type || "text"}
                    value={form[f.key] ?? ""}
                    onChange={(e) => setForm(s => ({ ...s, [f.key]: e.target.value }))}
                    required={!!f.required}
                  />
                </div>
              );
            })}
          </div>
        </form>
      </SimpleModal>
    </div>
  );
}
