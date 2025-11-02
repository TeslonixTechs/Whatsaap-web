// =========================================================
// ✅ WhatsApp Server - Versión Mejorada con QR Debug
// =========================================================

const express = require('express');
const { Client, LegacySessionAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Directorio para sesiones
const SESSIONS_DIR = path.join(__dirname, 'sessions');

// Asegurar que existe el directorio
if (!fs.existsSync(SESSIONS_DIR)) {
  fs.mkdirSync(SESSIONS_DIR, { recursive: true });
}

// === MAPAS PARA GESTIÓN DE SESIONES ===
const clients = new Map();
const qrCodes = new Map();
const connectionStatus = new Map();

// =========================================================
// 🔹 FUNCIÓN MEJORADA: Generar y guardar QR
// =========================================================
async function generateAndStoreQR(assistantId, qrData) {
  try {
    console.log(`[${assistantId}] Generando QR Data URL...`);
    
    // Generar QR como data URL
    const qrImage = await qrcode.toDataURL(qrData);
    
    console.log(`[${assistantId}] QR generado exitosamente`);
    console.log(`[${assistantId}] Longitud del QR: ${qrImage.length} caracteres`);
    console.log(`[${assistantId}] Prefijo QR: ${qrImage.substring(0, 50)}...`);
    
    // Guardar en el mapa
    qrCodes.set(assistantId, qrImage);
    connectionStatus.set(assistantId, 'qr_ready');
    
    console.log(`[${assistantId}] QR almacenado en memoria`);
    return true;
    
  } catch (error) {
    console.error(`[${assistantId}] Error generando QR:`, error);
    
    // Fallback: crear QR simple
    const fallbackQR = `data:image/svg+xml;base64,${Buffer.from(`
      <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">
        <rect width="100%" height="100%" fill="white"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em">QR Error</text>
      </svg>
    `).toString('base64')}`;
    
    qrCodes.set(assistantId, fallbackQR);
    connectionStatus.set(assistantId, 'qr_ready');
    return false;
  }
}

// =========================================================
// 🔹 ENDPOINT: Inicializar conexión y obtener QR (NON-BLOCKING)
// =========================================================
app.post('/api/whatsapp/init', async (req, res, next) => {
  try {
    const { assistantId } = req.body;
    if (!assistantId) {
      return res.status(400).json({ error: 'assistantId requerido' });
    }

    console.log(`
=== [${assistantId}] INICIANDO CONEXIÓN WHATSAPP ===`);

    if (clients.has(assistantId)) {
      console.log(`[${assistantId}] Cliente existente encontrado, destruyendo...`);
      const oldClient = clients.get(assistantId);
      await oldClient.destroy().catch((err) => console.error(`[${assistantId}] Error destroying old client:`, err));
      clients.delete(assistantId);
      qrCodes.delete(assistantId);
    }

    const sessionFile = path.join(SESSIONS_DIR, `${assistantId}.json`);
    let sessionData = null;
    if (fs.existsSync(sessionFile)) {
      try {
        sessionData = require(sessionFile);
        console.log(`[${assistantId}] Sesión anterior encontrada`);
      } catch (e) {
        console.log(`[${assistantId}] Sesión corrupta, creando nueva`);
        fs.unlinkSync(sessionFile);
      }
    }

    const client = new Client({
      authStrategy: new LegacySessionAuth({
        session: sessionData,
        restartOnAuthFail: true
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-first-run',
          '--no-zygote',
          '--single-process'
        ]
      }
    });

    let qrGenerated = false;
    client.on('qr', async (qr) => {
      if (qrGenerated) {
        console.log(`[${assistantId}] QR regenerado (ignorando duplicado)`);
        return;
      }
      qrGenerated = true;
      console.log(`[${assistantId}] QR recibido: ${qr.substring(0, 30)}...`);
      await generateAndStoreQR(assistantId, qr);
    });

    client.on('authenticated', (session) => {
      console.log(`[${assistantId}] ✅ Autenticado`);
      try {
        fs.writeFileSync(sessionFile, JSON.stringify(session, null, 2));
        console.log(`[${assistantId}] Sesión guardada en: ${sessionFile}`);
      } catch (e) {
        console.error(`[${assistantId}] Error guardando sesión:`, e);
      }
      connectionStatus.set(assistantId, 'authenticated');
    });

    client.on('ready', () => {
      console.log(`[${assistantId}] ✅ Cliente listo`);
      connectionStatus.set(assistantId, 'ready');
      qrCodes.delete(assistantId);
      qrGenerated = false;
    });

    client.on('auth_failure', (msg) => {
      console.error(`[${assistantId}] ❌ Error de autenticación:`, msg);
      if (fs.existsSync(sessionFile)) fs.unlinkSync(sessionFile);
      connectionStatus.set(assistantId, 'auth_failure');
      qrCodes.delete(assistantId);
      qrGenerated = false;
    });

    client.on('disconnected', (reason) => {
      console.log(`[${assistantId}] 🔌 Desconectado:`, reason);
      if (fs.existsSync(sessionFile)) fs.unlinkSync(sessionFile);
      connectionStatus.set(assistantId, 'disconnected');
      clients.delete(assistantId);
      qrCodes.delete(assistantId);
      qrGenerated = false;
    });

    clients.set(assistantId, client);
    connectionStatus.set(assistantId, 'initializing');

    // KEY CHANGE: Initialize in the background (fire-and-forget)
    client.initialize().catch(error => {
        console.error(`[${assistantId}] ❌ Error inicializando en background:`, error);
        connectionStatus.set(assistantId, 'init_error');
    });

    // KEY CHANGE: Respond to the frontend immediately
    res.json({
      status: 'initializing',
      message: 'Cliente WhatsApp inicializando. Espera el QR.',
      assistantId: assistantId
    });

  } catch (error) {
    next(error);
  }
});

// =========================================================
// 🔹 ENDPOINT: Estado y QR actual (MEJORADO)
// =========================================================
app.get('/api/whatsapp/status/:assistantId', (req, res, next) => {
  try {
    const { assistantId } = req.params;
    const status = connectionStatus.get(assistantId) || 'disconnected';
    const qr = qrCodes.get(assistantId);
    
    console.log(`
[${assistantId}] 📊 CONSULTANDO ESTADO:`);
    console.log(`[${assistantId}] Estado: ${status}`);
    console.log(`[${assistantId}] Tiene QR: ${!!qr}`);
    console.log(`[${assistantId}] Tiene cliente: ${clients.has(assistantId)}`);
    
    if (qr) {
      console.log(`[${assistantId}] Longitud QR: ${qr.length}`);
      console.log(`[${assistantId}] Tipo QR: ${qr.substring(0, 25)}`);
    }
    
    const response = {
      status: status,
      qrCode: qr || null,
      hasClient: clients.has(assistantId),
      timestamp: new Date().toISOString(),
      debug: {
        qrExists: !!qr,
        qrLength: qr ? qr.length : 0,
        status: status
      }
    };
    
    console.log(`[${assistantId}] 📤 Enviando respuesta al frontend:`, JSON.stringify(response, null, 2));
    
    res.json(response);
    
  } catch (error) {
    next(error);
  }
});

// =========================================================
// 🔹 ENDPOINT DEBUG: Ver QR directamente
// =========================================================
app.get('/api/whatsapp/debug-qr/:assistantId', (req, res) => {
  const { assistantId } = req.params;
  const qr = qrCodes.get(assistantId);
  const status = connectionStatus.get(assistantId);
  
  console.log(`
[${assistantId}] 🔍 DEBUG QR SOLICITADO:`);
  console.log(`[${assistantId}] Estado: ${status}`);
  console.log(`[${assistantId}] QR en memoria: ${!!qr}`);
  console.log(`[${assistantId}] Cliente activo: ${clients.has(assistantId)}`);
  
  if (qr) {
    console.log(`[${assistantId}] QR length: ${qr.length}`);
    
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Debug - ${assistantId}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .info { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .qr-container { text-align: center; margin: 20px 0; }
          img { border: 2px solid #333; border-radius: 8px; }
        </style>
      </head>
      <body>
        <h1>🔍 QR Debug - ${assistantId}</h1>
        
        <div class="info">
          <h3>Información de sesión:</h3>
          <p><strong>Estado:</strong> ${status}</p>
          <p><strong>Cliente activo:</strong> ${clients.has(assistantId)}</p>
          <p><strong>Longitud QR:</strong> ${qr.length} caracteres</p>
          <p><strong>Prefijo QR:</strong> ${qr.substring(0, 50)}...</p>
        </div>
        
        <div class="qr-container">
          <h3>QR Code:</h3>
          <img src="${qr}" alt="QR Code" style="width: 300px; height: 300px;">
        </div>
        
        <div>
          <h3>Acciones:</h3>
          <button onclick="location.reload()">Actualizar</button>
          <button onclick="history.back()">Volver</button>
        </div>
      </body>
      </html>
    `);
  } else {
    res.json({ 
      error: 'No QR disponible', 
      status, 
      hasQr: false,
      hasClient: clients.has(assistantId),
      allStatuses: Array.from(connectionStatus.entries())
    });
  }
});

// =========================================================
// 🔹 ENDPOINT: Desconectar sesión
// =========================================================
app.post('/api/whatsapp/disconnect', async (req, res, next) => {
  try {
    const { assistantId } = req.body;
    if (!assistantId) {
      return res.status(400).json({ error: 'assistantId requerido' });
    }

    console.log(`[${assistantId}] 🔌 Solicitando desconexión`);

    const client = clients.get(assistantId);
    if (client) {
      await client.destroy().catch(() => {});
      clients.delete(assistantId);
      qrCodes.delete(assistantId);
      connectionStatus.delete(assistantId);
      
      const sessionFile = path.join(SESSIONS_DIR, `${assistantId}.json`);
      if (fs.existsSync(sessionFile)) {
        fs.unlinkSync(sessionFile);
      }
      
      console.log(`[${assistantId}] ✅ Cliente destruido`);
    }

    res.json({ 
      success: true,
      message: 'WhatsApp desconectado correctamente'
    });
  } catch (error) {
    next(error);
  }
});

// =========================================================
// 🔹 HEALTH CHECK
// =========================================================
app.get('/health', (req, res) => {
  const activeSessions = Array.from(connectionStatus.entries()).filter(([id, status]) => 
    status === 'ready' || status === 'authenticated'
  ).length;
  
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    activeSessions: activeSessions,
    totalClients: clients.size,
    totalQRs: qrCodes.size
  });
});

// =========================================================
// 🔹 ENDPOINT: Listar sesiones activas (para debug)
// =========================================================
app.get('/api/whatsapp/sessions', (req, res) => {
  const sessions = Array.from(connectionStatus.entries()).map(([assistantId, status]) => ({
    assistantId,
    status,
    hasQr: qrCodes.has(assistantId),
    hasClient: clients.has(assistantId),
    qrLength: qrCodes.get(assistantId) ? qrCodes.get(assistantId).length : 0
  }));
  
  console.log('📋 Listando sesiones activas:', sessions.length);
  
  res.json({ 
    sessions,
    summary: {
      total: sessions.length,
      ready: sessions.filter(s => s.status === 'ready').length,
      withQR: sessions.filter(s => s.hasQr).length
    }
  });
});

// =========================================================
// 🔹 GLOBAL ERROR HANDLER
// =========================================================
app.use((err, req, res, next) => {
  console.error('❌ GLOBAL ERROR HANDLER:', err);
  res.status(500).json({
    error: 'Error en el servidor',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});


// =========================================================
// 🔹 INICIAR SERVIDOR
// =========================================================
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
🚀 WhatsApp Server escuchando en puerto ${PORT}`);
  console.log(`📁 Sesiones guardadas en: ${SESSIONS_DIR}`);
  console.log(`🔍 Debug QR disponible en: http://localhost:${PORT}/api/whatsapp/debug-qr/:assistantId`);
  console.log(`📊 Sesiones activas: http://localhost:${PORT}/api/whatsapp/sessions`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health
`);
});
