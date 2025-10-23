import React from "react";
import { resolveImageUrl } from "../utils/compat";
import { useBuild } from "../context/BuildContext";
import { useToast } from "../toast/ToastContext";
import "./ProductDetailModal.css";

// ฟังก์ชันแสดง Specifications เฉพาะของแต่ละประเภท
function renderSpecifications(product, category) {
  const specs = [];

  switch (category) {
    case 'cpu':
      if (product.socket) specs.push({ label: 'Socket', value: product.socket });
      if (product.power_usage) specs.push({ label: 'การใช้ไฟ', value: `${product.power_usage} W` });
      break;

    case 'mainboard':
      if (product.Socket_Sup) specs.push({ label: 'Socket รองรับ', value: product.Socket_Sup });
      if (product.RAM_Sup) specs.push({ label: 'RAM รองรับ', value: product.RAM_Sup });
      if (product.Case_Sup) specs.push({ label: 'รองรับ Case', value: product.Case_Sup });
      if (product.PCIe_Sup) specs.push({ label: 'PCIe รองรับ', value: product.PCIe_Sup });
      if (product.SSD_Sup) specs.push({ label: 'SSD รองรับ', value: product.SSD_Sup });
      if (product.power_usage) specs.push({ label: 'การใช้ไฟ', value: `${product.power_usage} W` });
      break;

    case 'ram':
      if (product.Type_RAM) specs.push({ label: 'ประเภท', value: product.Type_RAM });
      break;

    case 'gpu':
      if (product.PCIe_Type) specs.push({ label: 'PCIe Type', value: product.PCIe_Type });
      if (product.Power_Req || product.power_usage) {
        specs.push({ label: 'Power Requirement', value: `${product.Power_Req || product.power_usage} W` });
      }
      break;

    case 'ssd':
      if (product.SSD_Type) specs.push({ label: 'ประเภท', value: product.SSD_Type });
      break;

    case 'hdd':
      break;

    case 'case':
      if (product.Size_Case) specs.push({ label: 'รองรับขนาด', value: product.Size_Case });
      break;

    case 'cooler':
      if (product.Socket_Sup) specs.push({ label: 'Socket รองรับ', value: product.Socket_Sup });
      break;

    case 'power':
      if (product.power_sup) specs.push({ label: 'กำลังไฟ', value: `${product.power_sup} W` });
      break;

    default:
      break;
  }

  if (specs.length === 0) return null;

  return (
    <div className="product-info-section">
      <h5 className="product-info-title">รายละเอียดเฉพาะ</h5>
      <div className="product-info-content">
        {specs.map((spec, index) => (
          <div key={index} className="product-info-item">
            <span className="product-info-label">{spec.label}:</span>
            <span className="product-info-value">{spec.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProductDetailModal({ open, product, onClose, category }) {
  const { setPart } = useBuild();
  const { pushToast } = useToast();

  if (!open || !product) return null;

  const handleAddToSpec = () => {
    if (category) {
      setPart(category, product, { keepQty: true });
      pushToast(`เพิ่ม ${product.Device_Name} ลงในสเปกเรียบร้อยแล้ว`, "success");
      onClose();
    } else {
      alert("เพิ่มลงในสเปกเรียบร้อย!");
    }
  };

  return (
    <div className="product-detail-backdrop" onClick={onClose}>
      <div className="product-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="product-detail-header">
          <h4 className="product-detail-title">{product.Device_Name}</h4>
          <button className="product-detail-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="product-detail-body">
          <div className="product-detail-image">
            <img
              src={resolveImageUrl(product.image_url)}
              alt={product.Device_Name}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>

          <div className="product-detail-info">
            <div className="product-info-section">
              <h5 className="product-info-title">ข้อมูลอุปกรณ์</h5>
              <div className="product-info-content">
                <div className="product-info-item">
                  <span className="product-info-label">อุปกรณ์:</span>
                  <span className="product-info-value">{product.Device_Name}</span>
                </div>
                <div className="product-info-item">
                  <span className="product-info-label">ราคา:</span>
                  <span className="product-info-price">฿{(product.price || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* แสดง Specifications เฉพาะของแต่ละประเภท */}
            {renderSpecifications(product, category)}

            {/* แสดงรายละเอียดเพิ่มเติมจาก details field */}
            {(() => {
              const details = product.details;
              // ไม่แสดงถ้าไม่มีข้อมูล หรือเป็นข้อความ "ไม่มีรายละเอียด"
              if (!details || details.trim() === '' || details === 'ไม่มีรายละเอียด') {
                return null;
              }
              return (
                <div className="product-info-section">
                  <h5 className="product-info-title">รายละเอียดเพิ่มเติม</h5>
                  <div className="product-info-content">
                    <div className="product-details-text">
                      {details}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        <div className="product-detail-footer">
          <div className="product-detail-actions">
            <button className="product-btn product-btn-primary" onClick={handleAddToSpec}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
              เลือกเพื่อจัดสเปค
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}