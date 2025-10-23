const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static files - ให้เข้าถึงรูปภาพได้
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const deviceRouter     = require('./routers/device');
const authRoutes       = require('./routers/auth');
const uploadRoutes     = require('./routers/upload');
const cpuRoutes        = require('./routers/cpu');
const mainboardRoutes  = require('./routers/mainboard');
const gpuRoutes        = require('./routers/gpu');
const ramRoutes        = require('./routers/ram');
const ssdRoutes        = require('./routers/ssd');
const harddiskRoutes   = require('./routers/harddisk');
const powerRoutes      = require('./routers/power');
const coolerRoutes     = require('./routers/cooler');
const caseRoutes       = require('./routers/case');
const compatibilityRoutes = require('./routers/compatibility');
const presetRoutes = require('./routers/preset');

app.use('/api/device', deviceRouter);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/cpu', cpuRoutes);
app.use('/api/mainboard', mainboardRoutes);
app.use('/api/gpu', gpuRoutes);
app.use('/api/ram', ramRoutes);
app.use('/api/ssd', ssdRoutes);
app.use('/api/harddisk', harddiskRoutes);
app.use('/api/power', powerRoutes);
app.use('/api/cooler', coolerRoutes);
app.use('/api/case', caseRoutes);
app.use('/api/compatibility', compatibilityRoutes);
app.use('/api/presets', presetRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('PC Builder API is running!');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
