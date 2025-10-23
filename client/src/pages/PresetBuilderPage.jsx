import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { resolveImageUrl } from "../utils/compat";
import { useAuth } from "../context/AuthContext";
import ProductDetailModal from "../components/ProductDetailModal";

export default function PresetBuilderPage({ presetId, onBack }) {
  const { user } = useAuth();
  const [preset, setPreset] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("cpu");
  const [selectedDevice, setSelectedDevice] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [deviceSearch, setDeviceSearch] = useState("");
  
  // สำหรับแก้ไขข้อมูล Preset
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editThumbnail, setEditThumbnail] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);
  
  // สำหรับอัปโหลดรูป
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  
  // สำหรับ Product Detail Modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState("");

  const categories = [
    { value: "cpu", label: "CPU" },
    { value: "mainboard", label: "Motherboard" },
    { value: "gpu", label: "GPU" },
    { value: "ram", label: "RAM" },
    { value: "ssd", label: "SSD" },
    { value: "hdd", label: "HDD" },
    { value: "power", label: "Power Supply" },
    { value: "case", label: "Case" },
    { value: "cooler", label: "Cooler" },
  ];

  useEffect(() => {
    if (presetId) {
      loadPresetDetail();
    }
  }, [presetId]);

  useEffect(() => {
    if (selectedCategory) {
      loadDevices(selectedCategory);
      setDeviceSearch(""); // รีเซ็ตการค้นหาเมื่อเปลี่ยนหมวดหมู่
    }
  }, [selectedCategory]);

  // กรองอุปกรณ์ตามคำค้นหา
  const filteredDevices = useMemo(() => {
    if (!deviceSearch.trim()) return devices;
    const search = deviceSearch.toLowerCase();
    return devices.filter(device => 
      device.Device_Name?.toLowerCase().includes(search)
    );
  }, [devices, deviceSearch]);

  const loadPresetDetail = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/presets/${presetId}`);
      setPreset(res.data);
      setItems(res.data.items || []);
      
      // ตั้งค่าเริ่มต้นสำหรับฟอร์มแก้ไข
      setEditTitle(res.data.title || "");
      setEditDescription(res.data.description || "");
      setEditCategory(res.data.category || "office");
      setEditThumbnail(res.data.thumbnail_url || "");
      setEditIsActive(res.data.is_active !== 0);
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  const loadDevices = async (category) => {
    try {
      const endpoints = {
        cpu: "/api/cpu",
        mainboard: "/api/mainboard",
        gpu: "/api/gpu",
        ram: "/api/ram",
        ssd: "/api/ssd",
        hdd: "/api/harddisk",
        power: "/api/power",
        case: "/api/case",
        cooler: "/api/cooler",
      };

      // ขอข้อมูลทั้งหมดโดยใส่ limit ที่ใหญ่
      const res = await axios.get(`http://localhost:5000${endpoints[category]}?page=1&limit=10000`);
      
      // รองรับทั้ง format เก่าและใหม่
      let data = res.data;
      if (data?.data && Array.isArray(data.data)) {
        setDevices(data.data);
      } else if (Array.isArray(data)) {
        setDevices(data);
      } else {
        setDevices([]);
      }
    } catch (err) {
      console.error(err);
      setDevices([]);
    }
  };

  const handleAddItem = async () => {
    if (!selectedDevice) {
      alert("กรุณาเลือกอุปกรณ์");
      return;
    }

    try {
      const device = devices.find(d => d.Device_ID === parseInt(selectedDevice));
      if (!device) return;

      // เช็คว่ามีอยู่แล้วหรือไม่
      const existing = items.find(
        item => item.device_id === device.Device_ID && item.component_type === selectedCategory
      );

      if (existing) {
        alert("อุปกรณ์นี้มีในชุดแล้ว");
        return;
      }

      const newItem = {
        device_id: device.Device_ID,
        component_type: selectedCategory,
        quantity: quantity,
      };

      // เพิ่มในรายการชั่วคราว
      const newItems = [
        ...items,
        {
          ...newItem,
          Device_Name: device.Device_Name,
          current_price: device.price,
          image_url: device.image_url,
        },
      ];

      setItems(newItems);
      setSelectedDevice("");
      setQuantity(1);
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาด");
    }
  };

  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleOpenProductDetail = (item) => {
    setSelectedProduct({
      Device_ID: item.device_id,
      Device_Name: item.Device_Name,
      price: item.current_price,
      image_url: item.image_url,
      ...item
    });
    setModalCategory(item.component_type);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!user) {
      alert("กรุณา Login ก่อน");
      return;
    }

    try {
      const itemsToSave = items.map(item => ({
        device_id: item.device_id,
        component_type: item.component_type,
        quantity: item.quantity,
      }));

      // ดึง token จาก localStorage (key "auth")
      const authData = localStorage.getItem("auth");
      let token = null;
      
      if (authData) {
        try {
          const parsed = JSON.parse(authData);
          token = parsed.token;
        } catch (e) {
          console.error("Parse auth error:", e);
        }
      }
      
      if (!token) {
        alert("ไม่พบ token กรุณา Login ใหม่");
        return;
      }

      await axios.put(
        `http://localhost:5000/api/presets/${presetId}`,
        { items: itemsToSave },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("บันทึกสำเร็จ!");
      onBack();
    } catch (err) {
      console.error("Save error:", err);
      console.error("Response:", err.response?.data);
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert("Session หมดอายุ กรุณา Login ใหม่");
      } else {
        alert("บันทึกไม่สำเร็จ: " + (err.response?.data?.error || err.message));
      }
    }
  };

  const calculateTotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.current_price || 0) * item.quantity, 0);
  }, [items]);

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
    const res = await axios.post("http://localhost:5000/api/upload", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res?.data?.url;
  };

  const handleUpdatePresetInfo = async () => {
    if (!editTitle.trim()) {
      alert("กรุณากรอกชื่อชุดสเปค");
      return;
    }

    try {
      const authData = localStorage.getItem("auth");
      let token = null;
      
      if (authData) {
        try {
          const parsed = JSON.parse(authData);
          token = parsed.token;
        } catch (e) {
          console.error("Parse auth error:", e);
        }
      }
      
      if (!token) {
        alert("ไม่พบ token กรุณา Login ใหม่");
        return;
      }

      // อัปโหลดรูปถ้ามีการเลือกไฟล์
      let thumbnailUrl = editThumbnail;
      if (thumbnailFile) {
        try {
          thumbnailUrl = await uploadImage(thumbnailFile);
          if (!thumbnailUrl) {
            thumbnailUrl = await fileToDataUrl(thumbnailFile);
          }
        } catch {
          thumbnailUrl = await fileToDataUrl(thumbnailFile);
        }
      }

      await axios.put(
        `http://localhost:5000/api/presets/${presetId}/info`,
        {
          title: editTitle,
          description: editDescription,
          category: editCategory,
          thumbnail_url: thumbnailUrl,
          is_active: editIsActive ? 1 : 0,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("บันทึกข้อมูลสำเร็จ!");
      setEditMode(false);
      setThumbnailFile(null);
      setThumbnailPreview("");
      loadPresetDetail();
    } catch (err) {
      console.error("Update preset info error:", err);
      alert("บันทึกไม่สำเร็จ: " + (err.response?.data?.error || err.message));
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!preset) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">ไม่พบข้อมูล</div>
        <button className="btn btn-secondary" onClick={onBack}>
          กลับ
        </button>
      </div>
    );
  }

  const presetCategories = [
    { value: "office", label: "ทำงานออฟฟิศ" },
    { value: "gaming", label: "เล่นเกม" },
    { value: "video-editing", label: "ตัดต่อวิดีโอ" },
    { value: "streaming", label: "Streaming" },
    { value: "workstation", label: "Workstation" },
  ];

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="mb-4">
        <button className="btn btn-link text-decoration-none ps-0" onClick={onBack}>
          ← กลับ
        </button>
        <h2 className="fw-bold mb-2">จัดการชุดสเปค: {preset.title}</h2>
        <p className="text-muted">แก้ไขข้อมูลและจัดการอุปกรณ์ในชุดสเปคนี้</p>
      </div>

      {/* Preset Info Edit Form */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">ข้อมูลชุดสเปค</h5>
          {!editMode ? (
            <button className="btn btn-sm btn-outline-primary" onClick={() => {
              setEditMode(true);
              setThumbnailFile(null);
              setThumbnailPreview("");
            }}>
              ✏️ แก้ไข
            </button>
          ) : (
            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-outline-secondary" onClick={() => {
                setEditMode(false);
                // Reset to original values
                setEditTitle(preset.title || "");
                setEditDescription(preset.description || "");
                setEditCategory(preset.category || "office");
                setEditThumbnail(preset.thumbnail_url || "");
                setEditIsActive(preset.is_active !== 0);
                setThumbnailFile(null);
                setThumbnailPreview("");
              }}>
                ยกเลิก
              </button>
              <button className="btn btn-sm btn-primary" onClick={handleUpdatePresetInfo}>
                💾 บันทึก
              </button>
            </div>
          )}
        </div>
        <div className="card-body">
          {!editMode ? (
            // View Mode
            <div className="row">
              <div className="col-md-8">
                <div className="mb-3">
                  <strong>ชื่อชุดสเปค:</strong> {preset.title}
                </div>
                <div className="mb-3">
                  <strong>คำอธิบาย:</strong> {preset.description || "-"}
                </div>
                <div className="mb-3">
                  <strong>หมวดหมู่:</strong>{" "}
                  <span className="badge bg-info">
                    {presetCategories.find(c => c.value === preset.category)?.label || preset.category}
                  </span>
                </div>
                <div className="mb-3">
                  <strong>สถานะ:</strong>{" "}
                  <span className={`badge ${preset.is_active ? "bg-success" : "bg-secondary"}`}>
                    {preset.is_active ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                  </span>
                </div>
              </div>
              <div className="col-md-4 text-center">
                {preset.thumbnail_url && (
                  <div>
                    <strong className="d-block mb-2">รูปภาพ:</strong>
                    <img
                      src={resolveImageUrl(preset.thumbnail_url)}
                      alt={preset.title}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "200px",
                        objectFit: "contain",
                        borderRadius: "8px",
                        border: "1px solid #dee2e6",
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Edit Mode
            <div className="row">
              <div className="col-md-8">
                <div className="mb-3">
                  <label className="form-label">ชื่อชุดสเปค *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">คำอธิบาย</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">หมวดหมู่</label>
                  <select
                    className="form-select"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                  >
                    {presetCategories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">รูปภาพ (อัปโหลดไฟล์หรือ URL)</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="form-control mb-2"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      setThumbnailFile(file || null);
                      if (file) {
                        const preview = await fileToDataUrl(file);
                        setThumbnailPreview(preview);
                        setEditThumbnail("");
                      } else {
                        setThumbnailPreview("");
                      }
                    }}
                  />
                  <input
                    type="text"
                    className="form-control"
                    value={editThumbnail}
                    onChange={(e) => {
                      setEditThumbnail(e.target.value);
                      setThumbnailFile(null);
                      setThumbnailPreview(e.target.value.trim());
                    }}
                    placeholder="หรือวาง URL รูปภาพ (ถ้าไม่อัปไฟล์)"
                  />
                </div>
                <div className="mb-3 form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="editIsActive"
                    checked={editIsActive}
                    onChange={(e) => setEditIsActive(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="editIsActive">
                    เปิดใช้งาน
                  </label>
                </div>
              </div>
              <div className="col-md-4 text-center">
                {(thumbnailPreview || editThumbnail) && (
                  <div>
                    <strong className="d-block mb-2">ตัวอย่างรูปภาพ:</strong>
                    <img
                      src={thumbnailPreview || resolveImageUrl(editThumbnail)}
                      alt="Preview"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "200px",
                        objectFit: "contain",
                        borderRadius: "8px",
                        border: "1px solid #dee2e6",
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="row">
        {/* Left: Add Device Form */}
        <div className="col-md-4">
          <div className="card shadow-sm sticky-top" style={{ top: "20px" }}>
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">เพิ่มอุปกรณ์</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">ประเภทอุปกรณ์</label>
                <select
                  className="form-select"
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedDevice("");
                  }}
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">อุปกรณ์</label>
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="ค้นหาอุปกรณ์..."
                  value={deviceSearch}
                  onChange={(e) => setDeviceSearch(e.target.value)}
                />
                <select
                  className="form-select"
                  value={selectedDevice}
                  onChange={(e) => setSelectedDevice(e.target.value)}
                  size="8"
                  style={{ height: '250px', fontSize: '0.9rem' }}
                >
                  <option value="">-- เลือกอุปกรณ์ --</option>
                  {filteredDevices.map(device => {
                    const displayText = `${device.Device_Name} (฿${(device.price || 0).toLocaleString()})`;
                    return (
                      <option 
                        key={device.Device_ID} 
                        value={device.Device_ID}
                        title={displayText}
                      >
                        {displayText}
                      </option>
                    );
                  })}
                </select>
                {deviceSearch && filteredDevices.length === 0 && (
                  <small className="text-muted d-block mt-1">ไม่พบอุปกรณ์ที่ค้นหา</small>
                )}
                {deviceSearch && filteredDevices.length > 0 && (
                  <small className="text-muted d-block mt-1">พบ {filteredDevices.length} รายการ</small>
                )}
                {selectedDevice && (
                  <div className="mt-2 p-2 bg-light rounded">
                    <small className="text-muted d-block mb-1">อุปกรณ์ที่เลือก:</small>
                    <small className="d-block text-break">
                      {devices.find(d => d.Device_ID == selectedDevice)?.Device_Name}
                      <span className="text-success fw-bold ms-2">
                        ฿{(devices.find(d => d.Device_ID == selectedDevice)?.price || 0).toLocaleString()}
                      </span>
                    </small>
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">จำนวน</label>
                <input
                  type="number"
                  className="form-control"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
              </div>

              <button
                className="btn btn-primary w-100"
                onClick={handleAddItem}
                disabled={!selectedDevice}
              >
                + เพิ่มอุปกรณ์
              </button>
            </div>
          </div>
        </div>

        {/* Right: Items List */}
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">รายการอุปกรณ์ ({items.length} ชิ้น)</h5>
              <h5 className="mb-0 text-danger" key={`total-${items.length}-${calculateTotal}`}>
                ฿{calculateTotal.toLocaleString()}
              </h5>
            </div>
            <div className="card-body p-0">
              {items.length === 0 ? (
                <div className="text-center text-muted py-5">
                  ยังไม่มีอุปกรณ์ในชุดนี้
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: "60px" }}>รูป</th>
                        <th>ประเภท</th>
                        <th>อุปกรณ์</th>
                        <th style={{ width: "80px" }} className="text-center">จำนวน</th>
                        <th style={{ width: "120px" }} className="text-end">ราคา</th>
                        <th style={{ width: "80px" }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <div
                              style={{
                                width: "50px",
                                height: "50px",
                                background: "#f8f9fa",
                                borderRadius: "6px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                overflow: "hidden",
                              }}
                            >
                              {item.image_url ? (
                                <img
                                  src={resolveImageUrl(item.image_url)}
                                  alt={item.Device_Name}
                                  style={{
                                    maxWidth: "100%",
                                    maxHeight: "100%",
                                    objectFit: "contain",
                                  }}
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              ) : (
                                <span className="text-muted small">—</span>
                              )}
                            </div>
                          </td>
                          <td className="align-middle">
                            <span className="badge bg-secondary">
                              {categories.find(c => c.value === item.component_type)?.label}
                            </span>
                          </td>
                          <td className="align-middle">
                            <div 
                              className="fw-medium"
                              onClick={() => handleOpenProductDetail(item)}
                              style={{ 
                                cursor: "pointer", 
                                color: "#0d6efd",
                                textDecoration: "none"
                              }}
                              onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
                              onMouseLeave={(e) => e.target.style.textDecoration = "none"}
                            >
                              {item.Device_Name}
                            </div>
                          </td>
                          <td className="align-middle text-center">
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => {
                                const newItems = [...items];
                                newItems[index].quantity = parseInt(e.target.value) || 1;
                                setItems(newItems);
                              }}
                              style={{ width: "60px" }}
                            />
                          </td>
                          <td className="align-middle text-end">
                            <div className="fw-bold text-danger">
                              ฿{((item.current_price || 0) * item.quantity).toLocaleString()}
                            </div>
                          </td>
                          <td className="align-middle text-center">
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleRemoveItem(index)}
                            >
                              ลบ
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="table-light">
                      <tr>
                        <td colSpan="4" className="text-end fw-bold">ราคารวม:</td>
                        <td className="text-end">
                          <h5 className="fw-bold text-danger mb-0" key={`footer-total-${calculateTotal}`}>
                            ฿{calculateTotal.toLocaleString()}
                          </h5>
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 d-flex gap-3 justify-content-end">
            <button className="btn btn-outline-secondary" onClick={onBack}>
              ยกเลิก
            </button>
            <button
              className="btn btn-success btn-lg"
              onClick={handleSave}
              disabled={items.length === 0}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              บันทึกชุดสเปค
            </button>
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        open={modalOpen}
        product={selectedProduct}
        category={modalCategory}
        onClose={() => {
          setModalOpen(false);
          setSelectedProduct(null);
          setModalCategory("");
        }}
      />
    </div>
  );
}
