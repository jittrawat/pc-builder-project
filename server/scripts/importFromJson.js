const fs = require('fs');
const path = require('path');
const db = require('../db');

// ฟังก์ชันสำหรับ import CPU
async function importCPU() {
  console.log('Importing CPU data...');
  const cpuData = JSON.parse(fs.readFileSync(path.join(__dirname, '../json/cpu.json'), 'utf8'));
  
  let imported = 0;
  let skipped = 0;
  
  for (const cpu of cpuData) {
    try {
      // ตรวจสอบว่ามีข้อมูลนี้อยู่แล้วหรือไม่
      const [existing] = await db.query(
        'SELECT Device_ID FROM device WHERE Device_Name = ?',
        [cpu.name]
      );
      
      if (existing.length > 0) {
        skipped++;
        continue;
      }
      
      // Insert ลง device table
      const [deviceResult] = await db.query(
        'INSERT INTO device (Device_Name, price, image_url) VALUES (?, ?, ?)',
        [cpu.name, cpu.price || 0, '']
      );
      
      const deviceId = deviceResult.insertId;
      
      // Insert ลง cpu table
      await db.query(
        `INSERT INTO cpu (Device_ID, socket, chipset, power_usage, details) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          deviceId,
          cpu.microarchitecture || 'Unknown',
          cpu.microarchitecture || 'Unknown',
          cpu.tdp || 0,
          JSON.stringify({
            name: cpu.name,
            price: cpu.price,
            core_count: cpu.core_count,
            core_clock: cpu.core_clock,
            boost_clock: cpu.boost_clock,
            microarchitecture: cpu.microarchitecture,
            tdp: cpu.tdp,
            graphics: cpu.graphics
          })
        ]
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
      
      const [deviceResult] = await db.query(
        'INSERT INTO device (Device_Name, price, image_url) VALUES (?, ?, ?)',
        [gpu.name, gpu.price || 0, '']
      );
      
      const deviceId = deviceResult.insertId;
      
      await db.query(
        `INSERT INTO gpu (Device_ID, PCIe_Type, power_usage, details) 
         VALUES (?, ?, ?, ?)`,
        [
          deviceId,
          'PCIe 4.0',
          gpu.tdp || 0,
          JSON.stringify({
            name: gpu.name,
            price: gpu.price,
            chipset: gpu.chipset,
            memory: gpu.memory,
            core_clock: gpu.core_clock,
            boost_clock: gpu.boost_clock,
            color: gpu.color,
            length: gpu.length,
            tdp: gpu.tdp
          })
        ]
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
      
      const [deviceResult] = await db.query(
        'INSERT INTO device (Device_Name, price, image_url) VALUES (?, ?, ?)',
        [mb.name, mb.price || 0, '']
      );
      
      const deviceId = deviceResult.insertId;
      
      await db.query(
        `INSERT INTO mainboard (Device_ID, Socket_Sup, Chipset_Sup, RAM_Sup, Case_Sup, PCIe_Sup, SSD_Sup, power_usage, details) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          deviceId,
          mb.socket || 'Unknown',
          mb.chipset || 'Unknown',
          mb.memory_type || 'DDR4',
          mb.form_factor || 'ATX',
          'PCIe 4.0',
          'M.2 NVMe',
          50,
          JSON.stringify({
            name: mb.name,
            price: mb.price,
            socket: mb.socket,
            chipset: mb.chipset,
            form_factor: mb.form_factor,
            memory_max: mb.memory_max,
            memory_slots: mb.memory_slots,
            memory_type: mb.memory_type,
            color: mb.color
          })
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
      
      const [deviceResult] = await db.query(
        'INSERT INTO device (Device_Name, price, image_url) VALUES (?, ?, ?)',
        [mem.name, mem.price || 0, '']
      );
      
      const deviceId = deviceResult.insertId;
      
      await db.query(
        `INSERT INTO ram (Device_ID, Type_RAM, details) 
         VALUES (?, ?, ?)`,
        [
          deviceId,
          mem.type || 'DDR4',
          JSON.stringify({
            name: mem.name,
            price: mem.price,
            speed: mem.speed,
            modules: mem.modules,
            price_per_gb: mem.price_per_gb,
            color: mem.color,
            first_word_latency: mem.first_word_latency,
            cas_latency: mem.cas_latency
          })
        ]
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
      
      const [deviceResult] = await db.query(
        'INSERT INTO device (Device_Name, price, image_url) VALUES (?, ?, ?)',
        [storage.name, storage.price || 0, '']
      );
      
      const deviceId = deviceResult.insertId;
      
      // ตรวจสอบว่าเป็น SSD หรือ HDD
      const isSSD = storage.type && (storage.type.includes('SSD') || storage.type.includes('M.2') || storage.type.includes('NVMe'));
      
      if (isSSD) {
        await db.query(
          `INSERT INTO ssd (Device_ID, SSD_Type, details) 
           VALUES (?, ?, ?)`,
          [
            deviceId,
            storage.type || 'SATA',
            JSON.stringify({
              name: storage.name,
              price: storage.price,
              capacity: storage.capacity,
              price_per_gb: storage.price_per_gb,
              type: storage.type,
              cache: storage.cache,
              form_factor: storage.form_factor,
              interface: storage.interface
            })
          ]
        );
      } else {
        await db.query(
          `INSERT INTO harddisk (Device_ID, details) 
           VALUES (?, ?)`,
          [
            deviceId,
            JSON.stringify({
              name: storage.name,
              price: storage.price,
              capacity: storage.capacity,
              price_per_gb: storage.price_per_gb,
              type: storage.type,
              cache: storage.cache,
              form_factor: storage.form_factor,
              interface: storage.interface,
              rpm: storage.rpm
            })
          ]
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
      
      const [deviceResult] = await db.query(
        'INSERT INTO device (Device_Name, price, image_url) VALUES (?, ?, ?)',
        [psu.name, psu.price || 0, '']
      );
      
      const deviceId = deviceResult.insertId;
      
      await db.query(
        `INSERT INTO power (Device_ID, Power_sup, details) 
         VALUES (?, ?, ?)`,
        [
          deviceId,
          psu.wattage || 0,
          JSON.stringify({
            name: psu.name,
            price: psu.price,
            type: psu.type,
            efficiency: psu.efficiency,
            wattage: psu.wattage,
            modular: psu.modular,
            color: psu.color
          })
        ]
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
      
      const [deviceResult] = await db.query(
        'INSERT INTO device (Device_Name, price, image_url) VALUES (?, ?, ?)',
        [pcCase.name, pcCase.price || 0, '']
      );
      
      const deviceId = deviceResult.insertId;
      
      await db.query(
        `INSERT INTO pc_case (Device_ID, Size_Case, details) 
         VALUES (?, ?, ?)`,
        [
          deviceId,
          pcCase.type || 'ATX',
          JSON.stringify({
            name: pcCase.name,
            price: pcCase.price,
            type: pcCase.type,
            color: pcCase.color,
            side_panel: pcCase.side_panel,
            external_volume: pcCase.external_volume,
            internal_35_bays: pcCase.internal_35_bays
          })
        ]
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
      
      const [deviceResult] = await db.query(
        'INSERT INTO device (Device_Name, price, image_url) VALUES (?, ?, ?)',
        [cooler.name, cooler.price || 0, '']
      );
      
      const deviceId = deviceResult.insertId;
      
      await db.query(
        `INSERT INTO cooler (Device_ID, Power_CPU, Socket_Sup, details) 
         VALUES (?, ?, ?, ?)`,
        [
          deviceId,
          cooler.tdp || 150,
          cooler.socket || 'Universal',
          JSON.stringify({
            name: cooler.name,
            price: cooler.price,
            rpm: cooler.rpm,
            noise_level: cooler.noise_level,
            color: cooler.color,
            size: cooler.size
          })
        ]
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
  console.log('Starting import process...\n');
  
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
