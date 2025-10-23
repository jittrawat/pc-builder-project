/**
 * ระบบตรวจสอบความเข้ากันได้ของอุปกรณ์คอมพิวเตอร์
 */

// ฟังก์ชันช่วยสำหรับการเปรียบเทียบ string (case-insensitive)
const normalize = (str) => (str || '').toString().trim().toUpperCase();
const includes = (big, small) => normalize(big).includes(normalize(small));

/**
 * ตรวจสอบความเข้ากันได้ของ CPU กับ Motherboard
 */
function checkCPUCompatibility(cpu, motherboard) {
  if (!cpu || !motherboard) return true;
  
  const errors = [];
  
  // ตรวจสอบ Socket
  if (cpu.socket && motherboard.Socket_Sup) {
    if (normalize(cpu.socket) !== normalize(motherboard.Socket_Sup)) {
      errors.push(`CPU Socket (${cpu.socket}) ไม่ตรงกับ Motherboard Socket (${motherboard.Socket_Sup})`);
    }
  }
  
  // ตรวจสอบ Chipset
  if (cpu.chipset && motherboard.Chipset_Sup) {
    if (!includes(motherboard.Chipset_Sup, cpu.chipset)) {
      errors.push(`CPU Chipset (${cpu.chipset}) อาจไม่เข้ากับ Motherboard Chipset (${motherboard.Chipset_Sup})`);
    }
  }
  
  return {
    compatible: errors.length === 0,
    errors
  };
}

/**
 * ตรวจสอบความเข้ากันได้ของ RAM กับ Motherboard
 */
function checkRAMCompatibility(ram, motherboard) {
  if (!ram || !motherboard) return true;
  
  const errors = [];
  
  // ตรวจสอบ RAM Type
  if (ram.Type_RAM && motherboard.RAM_Sup) {
    if (!includes(motherboard.RAM_Sup, ram.Type_RAM)) {
      errors.push(`RAM Type (${ram.Type_RAM}) ไม่รองรับโดย Motherboard (${motherboard.RAM_Sup})`);
    }
  }
  
  return {
    compatible: errors.length === 0,
    errors
  };
}

/**
 * ตรวจสอบความเข้ากันได้ของ GPU กับ Motherboard
 */
function checkGPUCompatibility(gpu, motherboard) {
  // PCIe มี backward และ forward compatibility
  // GPU ทุกรุ่นสามารถใช้กับ motherboard ทุกรุ่นได้
  // (PCIe 3.0 GPU ใช้กับ PCIe 4.0 slot ได้, PCIe 5.0 GPU ใช้กับ PCIe 3.0 slot ได้)
  return {
    compatible: true,
    errors: []
  };
}

/**
 * ตรวจสอบความเข้ากันได้ของ SSD กับ Motherboard
 */
function checkSSDCompatibility(ssd, motherboard) {
  if (!ssd || !motherboard) return true;
  
  const errors = [];
  
  // ตรวจสอบ SSD Type
  if (ssd.SSD_Type && motherboard.SSD_Sup) {
    if (!includes(motherboard.SSD_Sup, ssd.SSD_Type)) {
      errors.push(`SSD Type (${ssd.SSD_Type}) อาจไม่รองรับโดย Motherboard (${motherboard.SSD_Sup})`);
    }
  }
  
  return {
    compatible: errors.length === 0,
    errors
  };
}

/**
 * ตรวจสอบความเข้ากันได้ของ Case กับ Motherboard
 */
function checkCaseCompatibility(pcCase, motherboard) {
  if (!pcCase || !motherboard) return true;
  
  const errors = [];
  
  // ตรวจสอบ Case Size
  if (pcCase.Size_Case && motherboard.Case_Sup) {
    if (!includes(pcCase.Size_Case, motherboard.Case_Sup)) {
      errors.push(`Case Size (${pcCase.Size_Case}) อาจไม่รองรับ Motherboard (${motherboard.Case_Sup})`);
    }
  }
  
  return {
    compatible: errors.length === 0,
    errors
  };
}

/**
 * ตรวจสอบความเข้ากันได้ของ Cooler กับ CPU
 */
function checkCoolerCompatibility(cooler, cpu) {
  if (!cooler || !cpu) return true;
  
  const errors = [];
  
  // ตรวจสอบ Socket Support
  if (cooler.Socket_Sup && cpu.socket) {
    if (!includes(cooler.Socket_Sup, cpu.socket)) {
      errors.push(`Cooler Socket (${cooler.Socket_Sup}) ไม่รองรับ CPU Socket (${cpu.socket})`);
    }
  }
  
  return {
    compatible: errors.length === 0,
    errors
  };
}

/**
 * ตรวจสอบความเข้ากันได้ของ Power Supply
 */
function checkPowerSupplyCompatibility(powerSupply, components) {
  if (!powerSupply) return true;
  
  const errors = [];
  const warnings = [];
  const psuPower = parseInt(powerSupply.Power_sup) || 0;
  
  // ถ้ามี GPU ที่มี Power_Req ให้ใช้ค่านั้นเป็นหลัก
  // (Power_Req = PSU ขั้นต่ำที่แนะนำสำหรับระบบทั้งหมดที่มี GPU นี้)
  if (components.gpu && components.gpu.Power_Req) {
    const gpuPowerReq = parseInt(components.gpu.Power_Req) || 0;
    
    if (psuPower < gpuPowerReq) {
      errors.push(`Power Supply (${psuPower}W) ไม่เพียงพอ GPU แนะนำอย่างน้อย ${gpuPowerReq}W สำหรับระบบทั้งหมด`);
    }
    
    return {
      compatible: errors.length === 0,
      errors,
      warnings,
      powerUsage: {
        total: gpuPowerReq,
        recommended: gpuPowerReq,
        available: psuPower,
        note: 'ใช้ค่า Power Requirement จาก GPU (ค่าแนะนำสำหรับระบบทั้งหมด)'
      }
    };
  }
  
  // ถ้าไม่มี GPU คำนวณจาก CPU + Motherboard + headroom 30%
  let totalPower = 0;
  
  if (components.cpu && components.cpu.power_usage) {
    totalPower += parseInt(components.cpu.power_usage) || 0;
  }
  
  if (components.motherboard && components.motherboard.power_usage) {
    totalPower += parseInt(components.motherboard.power_usage) || 0;
  }
  
  // เพิ่ม headroom 30%
  const recommendedPower = Math.ceil(totalPower * 1.3);
  
  if (psuPower < totalPower) {
    errors.push(`Power Supply (${psuPower}W) ไม่เพียงพอสำหรับระบบ (ต้องการอย่างน้อย ${totalPower}W)`);
  } else if (psuPower < recommendedPower) {
    warnings.push(`แนะนำให้ใช้ Power Supply อย่างน้อย ${recommendedPower}W สำหรับความปลอดภัย (ปัจจุบัน ${psuPower}W)`);
  }
  
  return {
    compatible: errors.length === 0,
    errors,
    warnings,
    powerUsage: {
      total: totalPower,
      recommended: recommendedPower,
      available: psuPower
    }
  };
}

/**
 * ตรวจสอบความเข้ากันได้ทั้งหมด
 */
function checkAllCompatibility(components) {
  const results = {
    compatible: true,
    errors: [],
    warnings: [],
    details: {}
  };
  
  // ตรวจสอบ CPU + Motherboard
  if (components.cpu && components.motherboard) {
    const cpuCheck = checkCPUCompatibility(components.cpu, components.motherboard);
    results.details.cpu = cpuCheck;
    if (!cpuCheck.compatible) {
      results.compatible = false;
      results.errors.push(...cpuCheck.errors);
    }
  }
  
  // ตรวจสอบ RAM + Motherboard
  if (components.ram && components.motherboard) {
    const ramCheck = checkRAMCompatibility(components.ram, components.motherboard);
    results.details.ram = ramCheck;
    if (!ramCheck.compatible) {
      results.compatible = false;
      results.errors.push(...ramCheck.errors);
    }
  }
  
  // ตรวจสอบ GPU + Motherboard
  if (components.gpu && components.motherboard) {
    const gpuCheck = checkGPUCompatibility(components.gpu, components.motherboard);
    results.details.gpu = gpuCheck;
    if (!gpuCheck.compatible) {
      results.compatible = false;
      results.errors.push(...gpuCheck.errors);
    }
  }
  
  // ตรวจสอบ SSD + Motherboard
  if (components.ssd && components.motherboard) {
    const ssdCheck = checkSSDCompatibility(components.ssd, components.motherboard);
    results.details.ssd = ssdCheck;
    if (!ssdCheck.compatible) {
      results.compatible = false;
      results.errors.push(...ssdCheck.errors);
    }
  }
  
  // ตรวจสอบ Case + Motherboard
  if (components.case && components.motherboard) {
    const caseCheck = checkCaseCompatibility(components.case, components.motherboard);
    results.details.case = caseCheck;
    if (!caseCheck.compatible) {
      results.compatible = false;
      results.errors.push(...caseCheck.errors);
    }
  }
  
  // ตรวจสอบ Cooler + CPU
  if (components.cooler && components.cpu) {
    const coolerCheck = checkCoolerCompatibility(components.cooler, components.cpu);
    results.details.cooler = coolerCheck;
    if (!coolerCheck.compatible) {
      results.compatible = false;
      results.errors.push(...coolerCheck.errors);
    }
  }
  
  // ตรวจสอบ Power Supply
  if (components.power) {
    const powerCheck = checkPowerSupplyCompatibility(components.power, components);
    results.details.power = powerCheck;
    if (!powerCheck.compatible) {
      results.compatible = false;
      results.errors.push(...powerCheck.errors);
    }
    if (powerCheck.warnings) {
      results.warnings.push(...powerCheck.warnings);
    }
  }
  
  return results;
}

module.exports = {
  checkCPUCompatibility,
  checkRAMCompatibility,
  checkGPUCompatibility,
  checkSSDCompatibility,
  checkCaseCompatibility,
  checkCoolerCompatibility,
  checkPowerSupplyCompatibility,
  checkAllCompatibility
};
