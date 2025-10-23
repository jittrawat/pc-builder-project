import React, { useEffect, useState } from "react";
import axios from "axios";
import { resolveImageUrl } from "../utils/compat";
import { useBuild } from "../context/BuildContext";
import { useToast } from "../toast/ToastContext";

export default function PresetDetailPage({ presetId, onBack, onGoToCatalog }) {
  const [preset, setPreset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { setPart, reset } = useBuild();
  const { pushToast } = useToast();

  useEffect(() => {
    if (presetId) {
      loadPresetDetail();
    }
  }, [presetId]);

  const loadPresetDetail = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/presets/${presetId}`);
      setPreset(res.data);
      setError("");
    } catch (err) {
      setError(err.message || "ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAllToSpec = async () => {
    if (!preset || !preset.items) return;

    // Reset current build first
    if (window.confirm("ต้องการเคลียร์สเปคปัจจุบันและใช้ชุดนี้หรือไม่?")) {
      reset();
      
      try {
        // โหลดข้อมูลเต็มของแต่ละอุปกรณ์
        const loadPromises = preset.items.map(async (item) => {
          try {
            // แปลง component_type ให้ตรงกับ API endpoint
            let apiEndpoint = item.component_type;
            if (apiEndpoint === 'hdd') apiEndpoint = 'harddisk';
            
            const endpoint = `http://localhost:5000/api/${apiEndpoint}`;
            const res = await axios.get(endpoint);
            const devices = res.data?.data || res.data || [];
            const fullDevice = devices.find(d => d.Device_ID === item.device_id);
            
            if (fullDevice) {
              setPart(item.component_type, fullDevice, { 
                qty: item.quantity,
                keepQty: true 
              });
            } else {
              // ถ้าหาไม่เจอใช้ข้อมูลจาก preset
              const deviceData = {
                Device_ID: item.device_id,
                Device_Name: item.Device_Name,
                price: item.current_price,
                image_url: item.image_url,
              };
              setPart(item.component_type, deviceData, { 
                qty: item.quantity,
                keepQty: true 
              });
            }
          } catch (err) {
            console.error(`Error loading ${item.component_type}:`, err);
            // ถ้า error ใช้ข้อมูลจาก preset
            const deviceData = {
              Device_ID: item.device_id,
              Device_Name: item.Device_Name,
              price: item.current_price,
              image_url: item.image_url,
            };
            setPart(item.component_type, deviceData, { 
              qty: item.quantity,
              keepQty: true 
            });
          }
        });

        await Promise.all(loadPromises);
        
        pushToast(`เพิ่มชุด "${preset.title}" ลงในสเปกเรียบร้อยแล้ว`, "success");
        
        // ไปหน้าจัดสเปค (Catalog) แทนการกลับหน้า Presets
        if (onGoToCatalog) {
          onGoToCatalog();
        } else {
          onBack();
        }
      } catch (err) {
        console.error('Error applying preset:', err);
        pushToast('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'danger');
      }
    }
  };

  const getCategoryLabel = (category) => {
    const labels = {
      office: "ทำงานออฟฟิศ",
      gaming: "เล่นเกม",
      "video-editing": "ตัดต่อวิดีโอ",
      streaming: "Streaming",
      workstation: "Workstation",
    };
    return labels[category] || category;
  };

  const getComponentLabel = (type) => {
    const labels = {
      cpu: "CPU",
      mainboard: "Motherboard",
      gpu: "GPU",
      ram: "RAM",
      ssd: "SSD",
      hdd: "HDD",
      power: "Power Supply",
      case: "Case",
      cooler: "Cooler",
    };
    return labels[type] || type;
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

  if (error || !preset) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error || "ไม่พบข้อมูล"}</div>
        <button className="btn btn-secondary" onClick={onBack}>
          กลับ
        </button>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="mb-4">
        <button className="btn btn-link text-decoration-none ps-0" onClick={onBack}>
          ← กลับ
        </button>
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h2 className="fw-bold mb-2">{preset.title}</h2>
            <span className="badge bg-primary me-2">
              {getCategoryLabel(preset.category)}
            </span>
            {preset.description && (
              <p className="text-muted mt-2">{preset.description}</p>
            )}
          </div>
          <div className="text-end">
            <small className="text-muted d-block">ราคารวม</small>
            <h3 className="fw-bold text-danger mb-0">
              ฿{Number(preset.total_price || 0).toLocaleString('en-US')}
            </h3>
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="card shadow-sm">
        <div className="card-header bg-white">
          <h5 className="mb-0">รายการอุปกรณ์</h5>
        </div>
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: "80px" }}>รูป</th>
                <th>ประเภท</th>
                <th>อุปกรณ์</th>
                <th style={{ width: "100px" }} className="text-center">จำนวน</th>
                <th style={{ width: "150px" }} className="text-end">ราคา</th>
              </tr>
            </thead>
            <tbody>
              {preset.items && preset.items.length > 0 ? (
                preset.items.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <div
                        style={{
                          width: "60px",
                          height: "60px",
                          background: "#f8f9fa",
                          borderRadius: "8px",
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
                          <span className="text-muted">—</span>
                        )}
                      </div>
                    </td>
                    <td className="align-middle">
                      <span className="badge bg-secondary">
                        {getComponentLabel(item.component_type)}
                      </span>
                    </td>
                    <td className="align-middle">
                      <div className="fw-medium">{item.Device_Name}</div>
                    </td>
                    <td className="align-middle text-center">
                      <span className="badge bg-light text-dark">
                        {item.quantity}
                      </span>
                    </td>
                    <td className="align-middle text-end">
                      <div className="fw-bold text-danger">
                        ฿{Number((item.current_price || 0) * item.quantity).toLocaleString('en-US')}
                      </div>
                      {item.quantity > 1 && (
                        <small className="text-muted">
                          (฿{Number(item.current_price || 0).toLocaleString('en-US')} × {item.quantity})
                        </small>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-4">
                    ไม่มีรายการอุปกรณ์
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="table-light">
              <tr>
                <td colSpan="4" className="text-end fw-bold">ราคารวมทั้งหมด:</td>
                <td className="text-end">
                  <h5 className="fw-bold text-danger mb-0">
                    ฿{Number(preset.total_price || 0).toLocaleString('en-US')}
                  </h5>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 d-flex gap-3 justify-content-end">
        <button className="btn btn-outline-secondary" onClick={onBack}>
          กลับ
        </button>
        <button 
          className="btn btn-danger btn-lg"
          onClick={handleAddAllToSpec}
          disabled={!preset.items || preset.items.length === 0}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
            <path d="M2 17l10 5 10-5"></path>
            <path d="M2 12l10 5 10-5"></path>
          </svg>
          ใช้ชุดสเปคนี้
        </button>
      </div>
    </div>
  );
}
