import React from "react";
import ReactDOM from "react-dom";
import { useBuild } from "../context/BuildContext";
import { resolveImageUrl } from "../utils/compat";
import "./SpecModal.css";

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

export default function SpecModal({ open, onClose }) {
  const { selected, removePart, incQty, decQty } = useBuild();

  if (!open) return null;

  // คำนวณยอดรวม
  const totalPrice = Object.values(selected).reduce((sum, item) => {
    return sum + ((item.item?.price || 0) * (item.qty || 1));
  }, 0);

  // แปลง selected เป็น array สำหรับแสดงในตาราง
  const specItems = Object.entries(selected)
    .filter(([_, item]) => item?.item)
    .map(([category, item]) => ({
      category,
      ...item,
      label: LABEL[category] || category
    }));

  const handleRemoveItem = (category) => {
    removePart(category);
  };


  const handleShareSpec = () => {
    const specText = specItems.map(item => 
      `${item.label}: ${item.item.Device_Name} - ฿${(item.item.price * item.qty).toLocaleString()}`
    ).join('\n');
    
    const shareText = `สเปกคอมของฉัน:\n${specText}\n\nยอดรวม: ฿${totalPrice.toLocaleString()}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'สเปกคอมของฉัน',
        text: shareText
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert("คัดลอกสเปกคอมไปยังคลิปบอร์ดแล้ว!");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!open) return null;

  const modalContent = (
    <div className="spec-modal-backdrop" onClick={onClose}>
      <div className="spec-modal" onClick={(e) => e.stopPropagation()}>
        <div className="spec-modal-header">
          <h4 className="spec-modal-title">รายการ</h4>
          <button className="spec-modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="spec-modal-body">
          {specItems.length === 0 ? (
            <div className="spec-empty">
              <p>ยังไม่มีอุปกรณ์ในรายการ</p>
            </div>
          ) : (
            <div className="spec-table-container">
              <table className="spec-table">
                <thead>
                  <tr>
                    <th>รูป</th>
                    <th>อุปกรณ์</th>
                    <th>จำนวน</th>
                    <th>ราคา</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {specItems.map((item) => (
                    <tr key={item.category}>
                      <td className="spec-image-cell">
                        <img
                          src={resolveImageUrl(item.item.image_url)}
                          alt={item.item.Device_Name}
                          className="spec-image"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </td>
                      <td className="spec-product-cell">
                        <div className="spec-product-info">
                          <div className="spec-category">{item.label}</div>
                          <div className="spec-name">{item.item.Device_Name}</div>
                        </div>
                      </td>
                      <td className="spec-quantity-cell">
                        <div className="spec-quantity">
                          <button 
                            className="spec-qty-btn"
                            onClick={() => decQty(item.category)}
                            disabled={item.qty <= 1}
                          >-</button>
                          <span className="spec-qty-value">{item.qty || 1}</span>
                          <button 
                            className="spec-qty-btn"
                            onClick={() => incQty(item.category)}
                          >+</button>
                        </div>
                      </td>
                      <td className="spec-price-cell">
                        ฿{((item.item.price || 0) * (item.qty || 1)).toLocaleString()}
                      </td>
                      <td className="spec-actions-cell">
                        <button 
                          className="spec-remove-btn"
                          onClick={() => handleRemoveItem(item.category)}
                          title="ลบออกจากรายการ"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3,6 5,6 21,6"></polyline>
                            <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {specItems.length > 0 && (
          <div className="spec-modal-footer">
            <div className="spec-total">
              <span className="spec-total-label">ยอดรวมทั้งสิ้น:</span>
              <span className="spec-total-price">฿{totalPrice.toLocaleString()}</span>
            </div>
            
            <div className="spec-actions">
              
              <button className="spec-btn spec-btn-secondary" onClick={handlePrint}>
                พิมพ์
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}
