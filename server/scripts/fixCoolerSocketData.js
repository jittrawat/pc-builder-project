const db = require('../db');

async function fixCoolerSocketData() {
  try {
    console.log('🔄 เริ่มต้นแก้ไขข้อมูล Socket_Sup ของ Cooler\n');

    // ดึงข้อมูล Cooler ทั้งหมด
    const [coolers] = await db.query(`
      SELECT cooler_ID, Device_ID, Socket_Sup, details 
      FROM cooler
    `);

    console.log(`พบ Cooler ทั้งหมด: ${coolers.length} รายการ\n`);

    let updated = 0;
    let skipped = 0;

    for (const cooler of coolers) {
      const detailsText = cooler.details || '';
      
      // ดึง socket จาก details โดยหา pattern ของ socket
      const socketPatterns = [
        /LGA[- ]?\d+/gi,  // Intel sockets: LGA1700, LGA-1700, LGA 1700
        /AM\d+/gi,        // AMD sockets: AM4, AM5
        /TR4/gi,          // AMD Threadripper
        /sTRX4/gi         // AMD Threadripper
      ];

      const foundSockets = new Set();

      // ค้นหา socket patterns ใน details
      socketPatterns.forEach(pattern => {
        const matches = detailsText.match(pattern);
        if (matches) {
          matches.forEach(match => {
            // Normalize socket names
            const normalized = match.replace(/[- ]/g, '').toUpperCase();
            foundSockets.add(normalized);
          });
        }
      });

      if (foundSockets.size > 0) {
        // สร้าง Socket_Sup string จาก sockets ที่พบ
        const newSocketSup = Array.from(foundSockets).join(',');
        
        // อัพเดตถ้าแตกต่างจากเดิม
        if (newSocketSup !== cooler.Socket_Sup) {
          await db.query(
            'UPDATE cooler SET Socket_Sup = ? WHERE cooler_ID = ?',
            [newSocketSup, cooler.cooler_ID]
          );
          
          console.log(`✅ Updated Cooler ID ${cooler.cooler_ID}:`);
          console.log(`   เดิม: "${cooler.Socket_Sup || 'NULL'}"`);
          console.log(`   ใหม่: "${newSocketSup}"\n`);
          updated++;
        } else {
          skipped++;
        }
      } else {
        // ถ้าไม่เจอ socket ใน details ให้ใช้ socket รวมทั่วไป
        const defaultSocket = 'LGA1700,LGA1200,LGA1151,LGA1150,LGA1155,LGA1156,LGA1851,AM4,AM5';
        
        await db.query(
          'UPDATE cooler SET Socket_Sup = ? WHERE cooler_ID = ?',
          [defaultSocket, cooler.cooler_ID]
        );
        
        console.log(`⚠️  Cooler ID ${cooler.cooler_ID} - ไม่เจอ socket ใน details, ใช้ค่า default`);
        console.log(`   ใหม่: "${defaultSocket}"\n`);
        updated++;
      }
    }

    console.log('='.repeat(60));
    console.log(`✅ แก้ไขเสร็จสิ้น!`);
    console.log(`   - อัพเดต: ${updated} รายการ`);
    console.log(`   - ข้าม: ${skipped} รายการ (ข้อมูลถูกต้องอยู่แล้ว)`);
    console.log('='.repeat(60));

    await db.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ เกิดข้อผิดพลาด:', err);
    await db.end();
    process.exit(1);
  }
}

fixCoolerSocketData();





