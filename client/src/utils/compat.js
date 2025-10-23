const norm = (s) => (s || "").toString().trim().toUpperCase();
const includesWord = (big, small) => norm(big).includes(norm(small));

export const resolveImageUrl = (url) => {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  if (/^data:/i.test(url)) return url; // รองรับ data URLs
  
  // ถ้าเป็น path ที่ขึ้นต้นด้วย /uploads ให้เพิ่ม base URL
  if (url.startsWith("/uploads/")) {
    return `http://localhost:5000${url}`;
  }
  
  if (url.startsWith("/")) return url;
  return `/${url}`;
};

export function makeCpuPredicate(sel) {
  return (cpu) => {
    const mb = sel.mainboard?.item;
    // ถ้าไม่มี motherboard ให้แสดง CPU ทั้งหมด
    if (!mb) return true;
    // เช็ค socket ว่าตรงกันหรือไม่
    return norm(cpu.socket) === norm(mb.Socket_Sup);
  };
}

export function makeMainboardPredicate(sel) {
  return (mb) => {
    const cpu = sel.cpu?.item;
    const okCpu = !cpu || (norm(mb.Socket_Sup) === norm(cpu.socket) && (!cpu.chipset || norm(mb.Chipset_Sup) === norm(cpu.chipset)));
    const pcCase = sel.case?.item;
    const okCase = !pcCase || includesWord(pcCase.Size_Case, mb.Case_Sup);
    const ram = sel.ram?.item;
    const okRam = !ram || includesWord(mb.RAM_Sup, ram.Type_RAM);
    return okCpu && okCase && okRam;
  };
}
export function makeRamPredicate(sel) { 
  return (ram) => { 
    const mb = sel.mainboard?.item; 
    // ถ้าไม่มี motherboard หรือ motherboard รองรับ RAM type นี้
    return !mb || includesWord(mb.RAM_Sup, ram.Type_RAM); 
  }; 
}

export function makeGpuPredicate(sel) {
  return (gpu) => {
    const psu = sel.power?.item;
    
    // ถ้าไม่มี PSU แสดง GPU ทั้งหมด
    if (!psu) return true;
    
    // ถ้ามี PSU และ GPU มี Power_Req ต้องเช็คว่า PSU พอหรือไม่
    if (gpu.Power_Req) {
      return (psu.Power_sup || psu.power_sup || 0) >= gpu.Power_Req;
    }
    
    // ถ้า GPU ไม่มี Power_Req ให้แสดง (PCIe มี backward/forward compatibility)
    return true;
  };
}

export function makeSsdPredicate(sel) { 
  return (ssd) => { 
    const mb = sel.mainboard?.item; 
    // ถ้าไม่มี motherboard หรือ motherboard รองรับ SSD type นี้
    return !mb || includesWord(mb.SSD_Sup, ssd.SSD_Type); 
  }; 
}

export function makeCasePredicate(sel) { 
  return (pcCase) => { 
    const mb = sel.mainboard?.item; 
    // ถ้าไม่มี motherboard หรือ case รองรับขนาด motherboard นี้
    // เช่น: Motherboard (ATX) ใช้กับ Case ที่รองรับ "ATX, Micro-ATX, Mini-ITX" ได้
    return !mb || includesWord(pcCase.Size_Case, mb.Case_Sup); 
  }; 
}

export function makeCoolerPredicate(sel) { 
  return (cooler) => { 
    const cpu = sel.cpu?.item; 
    // ถ้าไม่มี CPU หรือ cooler รองรับ socket ของ CPU
    if (!cpu) return true; 
    return includesWord(cooler.Socket_Sup, cpu.socket);
  }; 
}
export function makePowerPredicate(sel) {
  return (psu) => {
    const gpu = sel.gpu?.item;
    
    // ถ้ามี GPU ที่มี Power_Req ใช้ค่านั้นเป็นขั้นต่ำ (Power_Req = PSU ที่แนะนำสำหรับระบบทั้งหมด)
    if (gpu && gpu.Power_Req) {
      return (psu.Power_sup || psu.power_sup || 0) >= gpu.Power_Req;
    }
    
    // ถ้าไม่มี GPU หรือไม่มี Power_Req คำนวณจาก CPU + MB + headroom 30%
    const need = (sel.cpu?.item?.power_usage || 0) * (sel.cpu?.qty || 1)
               + (sel.mainboard?.item?.power_usage || 0) * (sel.mainboard?.qty || 1);
    const withHeadroom = Math.ceil(need * 1.3);
    return (psu.Power_sup || psu.power_sup || 0) >= withHeadroom;
  };
}
export function makeHddPredicate(sel) { return () => true; }
