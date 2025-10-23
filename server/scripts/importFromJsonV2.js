const fs = require('fs');
const path = require('path');
const db = require('../db');

// ฟังก์ชันแปลงราคาเป็นบาท (คูณ 35)
const convertToTHB = (usdPrice) => {
  if (!usdPrice || usdPrice === null) return 0;
  return Math.round(usdPrice * 35);
};

// ฟังก์ชันแปลง Socket จาก microarchitecture เป็น socket จริง
const mapCPUSocket = (microarch, name) => {
  const nameLower = (name || '').toLowerCase();
  const archLower = (microarch || '').toLowerCase();
  
  // Intel Sockets
  if (archLower.includes('alder lake') || archLower.includes('raptor lake')) return 'LGA1700';
  if (archLower.includes('rocket lake') || archLower.includes('comet lake')) return 'LGA1200';
  if (archLower.includes('coffee lake') || archLower.includes('kaby lake')) return 'LGA1151';
  if (archLower.includes('skylake')) return 'LGA1151';
  if (archLower.includes('haswell') || archLower.includes('broadwell')) return 'LGA1150';
  if (archLower.includes('ivy bridge')) return 'LGA1155';
  if (archLower.includes('sandy bridge')) return 'LGA1155';
  
  // AMD Sockets
  if (archLower.includes('zen 4')) return 'AM5';
  if (archLower.includes('zen 3') || archLower.includes('zen 2') || archLower.includes('zen+') || archLower.includes('zen')) return 'AM4';
  if (archLower.includes('excavator') || archLower.includes('steamroller') || archLower.includes('piledriver')) return 'AM3+';
  if (archLower.includes('bulldozer')) return 'AM3+';
  
  // Fallback
  if (nameLower.includes('intel')) return 'LGA1151';
  if (nameLower.includes('amd') || nameLower.includes('ryzen')) return 'AM4';
  
  return 'Unknown';
};

// ฟังก์ชันแปลง Form Factor เป็น Case Size
const mapCaseSize = (formFactor) => {
  const ff = (formFactor || '').toUpperCase();
  if (ff.includes('ATX') && !ff.includes('MICRO') && !ff.includes('MINI')) return 'ATX';
  if (ff.includes('MICRO') || ff.includes('MATX') || ff.includes('M-ATX')) return 'Micro-ATX';
  if (ff.includes('MINI') || ff.includes('ITX')) return 'Mini-ITX';
  if (ff.includes('EATX') || ff.includes('E-ATX')) return 'E-ATX';
  return 'ATX'; // default
};

// ฟังก์ชันแปลง SSD Type
const mapSSDType = (type, interface_str) => {
  const typeStr = (type || '').toUpperCase();
  const intStr = (interface_str || '').toUpperCase();
  
  if (intStr.includes('NVME') || intStr.includes('PCIE')) {
    if (intStr.includes('M.2')) return 'M.2 NVMe';
    return 'PCIe NVMe';
  }
  
  if (intStr.includes('SATA')) {
    if (intStr.includes('M.2')) return 'M.2 SATA';
    return 'SATA';
  }
  
  return 'SATA'; // default
};

// ฟังก์ชันสร้าง details string ที่อ่านง่าย
const createCPUDetails = (cpu) => {
  const parts = [];
  const socket = mapCPUSocket(cpu.microarchitecture, cpu.name);
  parts.push(`${socket} Socket`);
  
  if (cpu.core_count) parts.push(`${cpu.core_count}C/${cpu.core_count * 2}T`);
  if (cpu.core_clock) parts.push(`Base ${cpu.core_clock}GHz`);
  if (cpu.boost_clock) parts.push(`Boost ${cpu.boost_clock}GHz`);
  if (cpu.tdp) parts.push(`${cpu.tdp}W`);
  if (cpu.graphics && cpu.graphics !== 'null') parts.push(`iGPU: ${cpu.graphics}`);
  
  return parts.join(', ');
};

const createGPUDetails = (gpu) => {
  const parts = [];
  if (gpu.chipset) parts.push(gpu.chipset);
  if (gpu.memory) parts.push(`${gpu.memory}GB VRAM`);
  if (gpu.core_clock) parts.push(`${gpu.core_clock}MHz Core`);
  if (gpu.boost_clock) parts.push(`${gpu.boost_clock}MHz Boost`);
  if (gpu.length) parts.push(`${gpu.length}mm Length`);
  if (gpu.color) parts.push(gpu.color);
  
  return parts.join(', ');
};

const createMotherboardDetails = (mb) => {
  const parts = [];
  if (mb.socket) parts.push(`Socket ${mb.socket}`);
  if (mb.form_factor) parts.push(mb.form_factor);
  if (mb.memory_type) parts.push(mb.memory_type);
  if (mb.memory_max) parts.push(`Max ${mb.memory_max}GB RAM`);
  if (mb.memory_slots) parts.push(`${mb.memory_slots} Slots`);
  if (mb.color) parts.push(mb.color);
  
  return parts.join(', ');
};

const createRAMDetails = (ram) => {
  const parts = [];
  if (ram.speed) parts.push(`${ram.speed}MHz`);
  if (ram.modules) parts.push(ram.modules);
  if (ram.cas_latency) parts.push(`CL${ram.cas_latency}`);
  if (ram.color) parts.push(ram.color);
  
  return parts.join(', ');
};

const createStorageDetails = (storage) => {
  const parts = [];
  if (storage.capacity) parts.push(`${storage.capacity}GB`);
  if (storage.type && storage.type !== 'SSD') parts.push(`${storage.type} RPM`);
  if (storage.interface) parts.push(storage.interface);
  if (storage.form_factor) parts.push(`Form: ${storage.form_factor}`);
  if (storage.cache) parts.push(`${storage.cache}MB Cache`);
  
  return parts.join(', ');
};

const createPowerDetails = (psu) => {
  const parts = [];
  if (psu.wattage) parts.push(`${psu.wattage}W`);
  if (psu.efficiency) parts.push(psu.efficiency);
  if (psu.modular) parts.push(psu.modular);
  if (psu.color) parts.push(psu.color);
  
  return parts.join(', ');
};

const createCaseDetails = (pcCase) => {
  const parts = [];
  if (pcCase.type) parts.push(pcCase.type);
  if (pcCase.color) parts.push(pcCase.color);
  if (pcCase.side_panel) parts.push(`Panel: ${pcCase.side_panel}`);
  if (pcCase.external_volume) parts.push(`${pcCase.external_volume}L`);
  
  return parts.join(', ');
};

const createCoolerDetails = (cooler) => {
  const parts = [];
  if (cooler.rpm) parts.push(`${cooler.rpm} RPM`);
  if (cooler.noise_level) parts.push(`${cooler.noise_level} dB`);
  if (cooler.size) parts.push(cooler.size);
  if (cooler.color) parts.push(cooler.color);
  
  return parts.join(', ');
};

// ฟังก์ชันสำหรับ import CPU
async function importCPU() {
  console.log('Importing CPU data...');
  const cpuData = JSON.parse(fs.readFileSync(path.join(__dirname, '../json/cpu.json'), 'utf8'));
  
  let imported = 0;
  let skipped = 0;
  
  for (const cpu of cpuData) {
    try {
      const [existing] = await db.query(
        'SELECT Device_ID FROM device WHERE Device_Name = ?',
        [cpu.name]
      );
      
      if (existing.length > 0) {
        skipped++;
        continue;
      }
      
      const priceThb = convertToTHB(cpu.price);
      const socket = mapCPUSocket(cpu.microarchitecture, cpu.name);
      const details = createCPUDetails(cpu);
      
      const [deviceResult] = await db.query(
        'INSERT INTO device (Device_Name, price, image_url) VALUES (?, ?, ?)',
        [cpu.name, priceThb, '']
      );
      
      const deviceId = deviceResult.insertId;
      
      await db.query(
        `INSERT INTO cpu (Device_ID, socket, power_usage, details) 
         VALUES (?, ?, ?, ?)`,
        [deviceId, socket, cpu.tdp || 0, details]
      );
      
      imported++;
    } catch (error) {
      console.error(`Error importing CPU ${cpu.name}:`, error.message);
    }
  }
  
  console.log(`CPU: Imported ${imported}, Skipped ${skipped}`);
}

// ฟังก์ชันสำหรับ import GPU
async function importGPU() {
  console.log('Importing GPU data...');
  const gpuData = JSON.parse(fs.readFileSync(path.join(__dirname, '../json/gpu.json'), 'utf8'));
  
  let imported = 0;
  let skipped = 0;
  
  for (const gpu of gpuData) {
    try {
      const [existing] = await db.query(
        'SELECT Device_ID FROM device WHERE Device_Name = ?',
        [gpu.name]
      );
      
      if (existing.length > 0) {
        skipped++;
        continue;
      }
      
      const priceThb = convertToTHB(gpu.price);
      const details = createGPUDetails(gpu);
      
      const [deviceResult] = await db.query(
        'INSERT INTO device (Device_Name, price, image_url) VALUES (?, ?, ?)',
        [gpu.name, priceThb, '']
      );
      
      const deviceId = deviceResult.insertId;
      
      await db.query(
        `INSERT INTO gpu (Device_ID, PCIe_Type, Power_Req, details) 
         VALUES (?, ?, ?, ?)`,
        [deviceId, 'PCIe 4.0', gpu.tdp || 150, details]
      );
      
      imported++;
    } catch (error) {
      console.error(`Error importing GPU ${gpu.name}:`, error.message);
    }
  }
  
  console.log(`GPU: Imported ${imported}, Skipped ${skipped}`);
}

// ฟังก์ชันสำหรับ import Motherboard
async function importMotherboard() {
  console.log('Importing Motherboard data...');
  const mbData = JSON.parse(fs.readFileSync(path.join(__dirname, '../json/motherboard.json'), 'utf8'));
  
  let imported = 0;
  let skipped = 0;
  
  for (const mb of mbData) {
    try {
      const [existing] = await db.query(
        'SELECT Device_ID FROM device WHERE Device_Name = ?',
        [mb.name]
      );
      
      if (existing.length > 0) {
        skipped++;
        continue;
      }
      
      const priceThb = convertToTHB(mb.price);
      const caseSize = mapCaseSize(mb.form_factor);
      const details = createMotherboardDetails(mb);
      
      const [deviceResult] = await db.query(
        'INSERT INTO device (Device_Name, price, image_url) VALUES (?, ?, ?)',
        [mb.name, priceThb, '']
      );
      
      const deviceId = deviceResult.insertId;
      
      await db.query(
        `INSERT INTO mainboard (Device_ID, Socket_Sup, RAM_Sup, Case_Sup, PCIe_Sup, SSD_Sup, power_usage, details) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          deviceId,
          mb.socket || 'Unknown',
          mb.memory_type || 'DDR4',
          caseSize,
          'PCIe 4.0',
          'M.2 NVMe',
          50, // Motherboard มักใช้พลังงานประมาณ 50W
          details
        ]
      );
      
      imported++;
    } catch (error) {
      console.error(`Error importing Motherboard ${mb.name}:`, error.message);
    }
  }
  
  console.log(`Motherboard: Imported ${imported}, Skipped ${skipped}`);
}

// ฟังก์ชันสำหรับ import Memory (RAM)
async function importMemory() {
  console.log('Importing Memory data...');
  const memData = JSON.parse(fs.readFileSync(path.join(__dirname, '../json/memory.json'), 'utf8'));
  
  let imported = 0;
  let skipped = 0;
  
  for (const mem of memData) {
    try {
      const [existing] = await db.query(
        'SELECT Device_ID FROM device WHERE Device_Name = ?',
        [mem.name]
      );
      
      if (existing.length > 0) {
        skipped++;
        continue;
      }
      
      const priceThb = convertToTHB(mem.price);
      const details = createRAMDetails(mem);
      
      const [deviceResult] = await db.query(
        'INSERT INTO device (Device_Name, price, image_url) VALUES (?, ?, ?)',
        [mem.name, priceThb, '']
      );
      
      const deviceId = deviceResult.insertId;
      
      await db.query(
        `INSERT INTO ram (Device_ID, Type_RAM, details) 
         VALUES (?, ?, ?)`,
        [deviceId, mem.type || 'DDR4', details]
      );
      
      imported++;
    } catch (error) {
      console.error(`Error importing Memory ${mem.name}:`, error.message);
    }
  }
  
  console.log(`Memory: Imported ${imported}, Skipped ${skipped}`);
}

// ฟังก์ชันสำหรับ import Storage (SSD/HDD)
async function importStorage() {
  console.log('Importing Storage data...');
  const storageData = JSON.parse(fs.readFileSync(path.join(__dirname, '../json/hard-drive-ssd.json'), 'utf8'));
  
  let imported = 0;
  let skipped = 0;
  
  for (const storage of storageData) {
    try {
      const [existing] = await db.query(
        'SELECT Device_ID FROM device WHERE Device_Name = ?',
        [storage.name]
      );
      
      if (existing.length > 0) {
        skipped++;
        continue;
      }
      
      const priceThb = convertToTHB(storage.price);
      const details = createStorageDetails(storage);
      
      const [deviceResult] = await db.query(
        'INSERT INTO device (Device_Name, price, image_url) VALUES (?, ?, ?)',
        [storage.name, priceThb, '']
      );
      
      const deviceId = deviceResult.insertId;
      
      // ตรวจสอบว่าเป็น SSD หรือ HDD
      const typeStr = String(storage.type || '').toUpperCase();
      const isSSD = typeStr === 'SSD' || (storage.interface && String(storage.interface).toUpperCase().includes('NVME'));
      
      if (isSSD) {
        const ssdType = mapSSDType(storage.type, storage.interface);
        await db.query(
          `INSERT INTO ssd (Device_ID, SSD_Type, details) 
           VALUES (?, ?, ?)`,
          [deviceId, ssdType, details]
        );
      } else {
        await db.query(
          `INSERT INTO harddisk (Device_ID, details) 
           VALUES (?, ?)`,
          [deviceId, details]
        );
      }
      
      imported++;
    } catch (error) {
      console.error(`Error importing Storage ${storage.name}:`, error.message);
    }
  }
  
  console.log(`Storage: Imported ${imported}, Skipped ${skipped}`);
}

// ฟังก์ชันสำหรับ import Power Supply
async function importPowerSupply() {
  console.log('Importing Power Supply data...');
  const psuData = JSON.parse(fs.readFileSync(path.join(__dirname, '../json/power-supply.json'), 'utf8'));
  
  let imported = 0;
  let skipped = 0;
  
  for (const psu of psuData) {
    try {
      const [existing] = await db.query(
        'SELECT Device_ID FROM device WHERE Device_Name = ?',
        [psu.name]
      );
      
      if (existing.length > 0) {
        skipped++;
        continue;
      }
      
      const priceThb = convertToTHB(psu.price);
      const details = createPowerDetails(psu);
      
      const [deviceResult] = await db.query(
        'INSERT INTO device (Device_Name, price, image_url) VALUES (?, ?, ?)',
        [psu.name, priceThb, '']
      );
      
      const deviceId = deviceResult.insertId;
      
      await db.query(
        `INSERT INTO power (Device_ID, Power_sup, details) 
         VALUES (?, ?, ?)`,
        [deviceId, psu.wattage || 0, details]
      );
      
      imported++;
    } catch (error) {
      console.error(`Error importing Power Supply ${psu.name}:`, error.message);
    }
  }
  
  console.log(`Power Supply: Imported ${imported}, Skipped ${skipped}`);
}

// ฟังก์ชันสำหรับ import Case
async function importCase() {
  console.log('Importing Case data...');
  const caseData = JSON.parse(fs.readFileSync(path.join(__dirname, '../json/case.json'), 'utf8'));
  
  let imported = 0;
  let skipped = 0;
  
  for (const pcCase of caseData) {
    try {
      const [existing] = await db.query(
        'SELECT Device_ID FROM device WHERE Device_Name = ?',
        [pcCase.name]
      );
      
      if (existing.length > 0) {
        skipped++;
        continue;
      }
      
      const priceThb = convertToTHB(pcCase.price);
      const caseSize = mapCaseSize(pcCase.type);
      const details = createCaseDetails(pcCase);
      
      const [deviceResult] = await db.query(
        'INSERT INTO device (Device_Name, price, image_url) VALUES (?, ?, ?)',
        [pcCase.name, priceThb, '']
      );
      
      const deviceId = deviceResult.insertId;
      
      await db.query(
        `INSERT INTO pc_case (Device_ID, Size_Case, details) 
         VALUES (?, ?, ?)`,
        [deviceId, caseSize, details]
      );
      
      imported++;
    } catch (error) {
      console.error(`Error importing Case ${pcCase.name}:`, error.message);
    }
  }
  
  console.log(`Case: Imported ${imported}, Skipped ${skipped}`);
}

// ฟังก์ชันสำหรับ import Cooler
async function importCooler() {
  console.log('Importing Cooler data...');
  const coolerData = JSON.parse(fs.readFileSync(path.join(__dirname, '../json/cpu-cooler.json'), 'utf8'));
  
  let imported = 0;
  let skipped = 0;
  
  for (const cooler of coolerData) {
    try {
      const [existing] = await db.query(
        'SELECT Device_ID FROM device WHERE Device_Name = ?',
        [cooler.name]
      );
      
      if (existing.length > 0) {
        skipped++;
        continue;
      }
      
      const priceThb = convertToTHB(cooler.price);
      const details = createCoolerDetails(cooler);
      
      const [deviceResult] = await db.query(
        'INSERT INTO device (Device_Name, price, image_url) VALUES (?, ?, ?)',
        [cooler.name, priceThb, '']
      );
      
      const deviceId = deviceResult.insertId;
      
      await db.query(
        `INSERT INTO cooler (Device_ID, Power_CPU, Socket_Sup, details) 
         VALUES (?, ?, ?, ?)`,
        [deviceId, cooler.tdp || 150, cooler.socket || 'Universal', details]
      );
      
      imported++;
    } catch (error) {
      console.error(`Error importing Cooler ${cooler.name}:`, error.message);
    }
  }
  
  console.log(`Cooler: Imported ${imported}, Skipped ${skipped}`);
}

// ฟังก์ชันหลักสำหรับรัน import ทั้งหมด
async function runImport() {
  console.log('Starting import process (Version 2)...\n');
  
  try {
    await importCPU();
    await importMotherboard();
    await importGPU();
    await importMemory();
    await importStorage();
    await importPowerSupply();
    await importCase();
    await importCooler();
    
    console.log('\n✅ Import completed successfully!');
  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    process.exit();
  }
}

// รัน import
runImport();
