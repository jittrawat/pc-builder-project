import React, { useEffect, useState } from "react";
import axios from "axios";
import { resolveImageUrl } from "../utils/compat";

export default function PresetsPage({ onSelectPreset }) {
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/presets");
      setPresets(res.data || []);
      setError("");
    } catch (err) {
      setError(err.message || "ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="fw-bold">ชุดสเปคแนะนำ</h2>
        <p className="text-muted">เลือกชุดสเปคที่เหมาะกับการใช้งานของคุณ</p>
      </div>

      {presets.length === 0 ? (
        <div className="alert alert-info">
          ยังไม่มีชุดสเปคแนะนำในขณะนี้
        </div>
      ) : (
        <div className="row g-4">
          {presets.map((preset) => (
            <div key={preset.preset_id} className="col-12 col-md-6 col-lg-4">
              <div 
                className="card h-100 shadow-sm preset-card"
                onClick={() => onSelectPreset(preset.preset_id)}
                style={{ cursor: "pointer" }}
              >
                {/* Thumbnail */}
                <div className="preset-thumbnail">
                  {preset.thumbnail_url ? (
                    <img
                      src={resolveImageUrl(preset.thumbnail_url)}
                      alt={preset.title}
                      className="card-img-top"
                      style={{ height: "200px", objectFit: "cover" }}
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/400x200?text=No+Image";
                      }}
                    />
                  ) : (
                    <div
                      className="card-img-top"
                      style={{
                        height: "200px",
                        backgroundImage: `
                          linear-gradient(45deg, #d0d0d0 25%, transparent 25%),
                          linear-gradient(-45deg, #d0d0d0 25%, transparent 25%),
                          linear-gradient(45deg, transparent 75%, #d0d0d0 75%),
                          linear-gradient(-45deg, transparent 75%, #d0d0d0 75%)
                        `,
                        backgroundSize: '30px 30px',
                        backgroundPosition: '0 0, 0 15px, 15px -15px, -15px 0px',
                      }}
                    />
                  )}
                  
                  {/* Category Badge */}
                  <div className="position-absolute top-0 end-0 m-2">
                    <span className="badge bg-primary">
                      {getCategoryLabel(preset.category)}
                    </span>
                  </div>
                </div>

                <div className="card-body">
                  <h5 className="card-title fw-bold">{preset.title}</h5>
                  <p className="card-text text-muted small">
                    {preset.description || "ไม่มีคำอธิบาย"}
                  </p>
                  
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <div>
                      <small className="text-muted">ราคาเริ่มต้น</small>
                      <div className="fw-bold text-danger fs-5">
                        ฿{Number(preset.total_price || 0).toLocaleString('en-US')}
                      </div>
                    </div>
                    <div className="text-end">
                      <small className="text-muted">
                        {preset.item_count || 0} ชิ้น
                      </small>
                    </div>
                  </div>
                </div>

                <div className="card-footer bg-transparent border-0">
                  <button className="btn btn-outline-primary w-100">
                    ดูรายละเอียด
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .preset-card {
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .preset-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15) !important;
        }
        
        .preset-thumbnail {
          position: relative;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

