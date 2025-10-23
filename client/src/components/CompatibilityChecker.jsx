import React, { useState, useEffect } from "react";
import { useBuild } from "../context/BuildContext";
import axios from "axios";
import "./CompatibilityChecker.css";

export default function CompatibilityChecker() {
  const { selected } = useBuild();
  const [compatibility, setCompatibility] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    checkCompatibility();
  }, [selected]);

  const checkCompatibility = async () => {
    // ตรวจสอบว่ามีอุปกรณ์อย่างน้อย 2 ชิ้น
    const selectedCount = Object.keys(selected).length;
    if (selectedCount < 2) {
      setCompatibility(null);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        cpu_id: selected.cpu?.item?.Device_ID,
        motherboard_id: selected.mainboard?.item?.Device_ID,
        gpu_id: selected.gpu?.item?.Device_ID,
        ram_id: selected.ram?.item?.Device_ID,
        ssd_id: selected.ssd?.item?.Device_ID,
        hdd_id: selected.hdd?.item?.Device_ID,
        case_id: selected.case?.item?.Device_ID,
        cooler_id: selected.cooler?.item?.Device_ID,
        power_id: selected.power?.item?.Device_ID,
      };

      const response = await axios.post("http://localhost:5000/api/compatibility/check", payload);
      setCompatibility(response.data);
    } catch (error) {
      console.error("Error checking compatibility:", error);
      setCompatibility({
        success: false,
        compatible: false,
        errors: ["ไม่สามารถตรวจสอบความเข้ากันได้ได้ในขณะนี้"],
      });
    } finally {
      setLoading(false);
    }
  };

  if (!compatibility || Object.keys(selected).length < 2) {
    return null;
  }

  return (
    <div className="compatibility-checker">
      <div className="compatibility-header" onClick={() => setShowDetails(!showDetails)}>
        <div className="compatibility-status">
          {loading ? (
            <>
              <div className="spinner-border spinner-border-sm me-2" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <span>กำลังตรวจสอบ...</span>
            </>
          ) : compatibility.compatible ? (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success me-2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span className="text-success">อุปกรณ์เข้ากันได้</span>
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-danger me-2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
              <span className="text-danger">พบปัญหาความเข้ากันได้</span>
            </>
          )}
        </div>
        <button className="btn btn-link btn-sm p-0" type="button">
          {showDetails ? "ซ่อน" : "แสดง"}รายละเอียด
        </button>
      </div>

      {showDetails && (
        <div className="compatibility-details">
          {compatibility.errors && compatibility.errors.length > 0 && (
            <div className="alert alert-danger mb-2">
              <strong>ข้อผิดพลาด:</strong>
              <ul className="mb-0 mt-1">
                {compatibility.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {compatibility.warnings && compatibility.warnings.length > 0 && (
            <div className="alert alert-warning mb-2">
              <strong>คำเตือน:</strong>
              <ul className="mb-0 mt-1">
                {compatibility.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          {compatibility.details?.power?.powerUsage && (
            <div className="alert alert-info mb-0">
              <strong>การใช้พลังงาน:</strong>
              <div className="mt-1">
                <small>
                  ใช้งาน: {compatibility.details.power.powerUsage.total}W<br />
                  แนะนำ: {compatibility.details.power.powerUsage.recommended}W<br />
                  Power Supply: {compatibility.details.power.powerUsage.available}W
                </small>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
