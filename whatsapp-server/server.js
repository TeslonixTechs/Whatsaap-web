// =========================================================
// ✅ WhatsApp Server - Versión con Logging Avanzado
// =========================================================

const express = require('express');
const { Client, LegacySessionAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const util = require('util');

const app = express();
app.use(cors());
app.use(express.json());

// =========================================================
// 🔹 CONFIGURACIÓN DE LOGGING
// =========================================================
const LOG_DIR = path.join(__dirname, 'logs');
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}
const logFile = fs.createWriteStream(path.join(LOG_DIR, 'server.log'), { flags: 'a' });

// Función de logging mejorada
const log = (level, message, ...args) => {
  const timestamp = new Date().toISOString();
  const formattedMessage = util.format(message, ...args);
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${formattedMessage}\n`;

  // Escribir en el archivo de log
  logFile.write(logMessage);
  // Escribir en la consola (con colores para legibilidad)
  if (level === 'error') {
    console.error(logMessage.trim());
  } else if (level === 'warn') {
    console.warn(logMessage.trim());
  } else {
    console.log(logMessage.trim());
  }
};

log('info', '================================================');
log('info', '🚀 INICIANDO WHATSAPP SERVER...');
log('info', '================================================');


// Directorio para sesiones
const SESSIONS_DIR = path.join(__dirname, 'sessions');

// Asegurar que existe el directorio
if (!fs.existsSync(SESSIONS_DIR)) {
  fs.mkdirSync(SESSIONS_DIR, { recursive: true });
  log('info', `Directorio de sesiones creado en: ${SESSIONS_DIR}`);
}

// === MAPAS PARA GESTIÓN DE SESIONES ===
const clients = new Map();
const qrCodes = new Map();
const connectionStatus = new Map();

// =========================================================
// 🔹 FUNCIÓN: Generar y guardar QR
// =========================================================
async function generateAndStoreQR(assistantId, qrData) {
  try {
    log('info', `[${assistantId}] Generando QR Data URL...`);
    const qrImage = await qrcode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      type: 'image/webp',
      rendererOpts: { quality: 0.9 },
      margin: 1,
    });
    log('info', `[${assistantId}] QR generado exitosamente. Longitud: ${qrImage.length}`);
    qrCodes.set(assistantId, qrImage);
    connectionStatus.set(assistantId, 'qr_ready');
    return true;
  } catch (error) {
    log('error', `[${assistantId}] Error crítico generando QR:`, error);
    connectionStatus.set(assistantId, 'qr_error');
    return false;
  }
}

// =========================================================
// 🔹 ENDPOINT: Inicializar conexión (NON-BLOCKING)
// =========================================================
app.post('/api/whatsapp/init', async (req, res, next) => {
  const { assistantId } = req.body;
  if (!assistantId) {
    log('warn', 'Intento de inicialización sin assistantId');
    return res.status(400).json({ error: 'assistantId requerido' });
  }

  log('info', `\n=== [${assistantId}] SOLICITUD DE INICIO DE CONEXIÓN ===`);

  try {
    if (clients.has(assistantId)) {
      log('info', `[${assistantId}] Cliente existente encontrado, destruyendo sesión anterior...`);
      const oldClient = clients.get(assistantId);
      await oldClient.destroy().catch(err => log('error', `[${assistantId}] Error destruyendo cliente antiguo:`, err));
      clients.delete(assistantId);
      qrCodes.delete(assistantId);
      log('info', `[${assistantId}] Sesión anterior limpiada.`);
    }

    const sessionFile = path.join(SESSIONS_DIR, `${assistantId}.json`);
    let sessionData = null;
    if (fs.existsSync(sessionFile)) {
      try {
        sessionData = JSON.parse(fs.readFileSync(sessionFile, 'utf-8'));
        log('info', `[${assistantId}] Sesión anterior encontrada y cargada desde ${sessionFile}`);
      } catch (e) {
        log('warn', `[${assistantId}] Sesión corrupta encontrada. Eliminando y creando una nueva. Error:`, e.message);
        fs.unlinkSync(sessionFile);
      }
    } else {
        log('info', `[${assistantId}] No se encontró sesión previa. Se creará una nueva.`);
    }

    const client = new Client({
      authStrategy: new LegacySessionAuth({ session: sessionData }),
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
        ],
      },
      webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
      }
    });

    let qrGenerated = false;
    client.on('qr', async (qr) => {
      if (qrGenerated) {
        log('info', `[${assistantId}] QR regenerado (ignorando duplicado)`);
        return;
      }
      qrGenerated = true;
      log('info', `[${assistantId}] QR recibido de whatsapp-web.js.`);
      await generateAndStoreQR(assistantId, qr);
    });

    client.on('authenticated', (session) => {
      log('info', `[${assistantId}] ✅ Autenticado correctamente.`);
      connectionStatus.set(assistantId, 'authenticated');
      if (session) {
          try {
            fs.writeFileSync(sessionFile, JSON.stringify(session, null, 2));
            log('info', `[${assistantId}] Sesión guardada en: ${sessionFile}`);
          } catch (e) {
            log('error', `[${assistantId}] Error crítico guardando sesión:`, e);
          }
      }
    });

    client.on('ready', () => {
      log('info', `[${assistantId}] ✅ Cliente listo y conectado.`);
      connectionStatus.set(assistantId, 'ready');
      qrCodes.delete(assistantId);
      qrGenerated = false;
    });

    client.on('auth_failure', (msg) => {
      log('error', `[${assistantId}] ❌ Error de autenticación:`, msg);
      connectionStatus.set(assistantId, 'auth_failure');
      qrCodes.delete(assistantId);
      qrGenerated = false;
      // No se borra el archivo de sesión para intentar re-autenticar
    });

    client.on('disconnected', (reason) => {
      log('warn', `[${assistantId}] 🔌 Cliente desconectado. Razón:`, reason);
      connectionStatus.set(assistantId, 'disconnected');
      clients.delete(assistantId);
      qrCodes.delete(assistantId);
      qrGenerated = false;
      // No se borra el archivo de sesión para permitir reconexión rápida
    });

    clients.set(assistantId, client);
    connectionStatus.set(assistantId, 'initializing');
    log('info', `[${assistantId}] Cliente creado y eventos configurados. Iniciando...`);

    client.initialize().catch(error => {
        log('error', `[${assistantId}] ❌ Error fatal durante la inicialización del cliente:`, error);
        connectionStatus.set(assistantId, 'init_error');
    });

    log('info', `[${assistantId}] Respondiendo al frontend que la inicialización está en curso.`);
    res.json({
      status: 'initializing',
      message: 'Cliente WhatsApp inicializando. Espera el QR o la conexión.',
      assistantId: assistantId
    });

  } catch (error) {
    log('error', `[${req.body.assistantId || 'unknown'}] Error en el endpoint /init:`, error);
    next(error);
  }
});


// =========================================================
// 🔹 ENDPOINT: Estado y QR actual
// =========================================================
app.get('/api/whatsapp/status/:assistantId', (req, res, next) => {
  const { assistantId } = req.params;
  if (!assistantId) {
    return res.status(400).json({ error: 'assistantId requerido' });
  }

  try {
    const status = connectionStatus.get(assistantId) || 'disconnected';
    const qr = qrCodes.get(assistantId);

    const response = {
      status: status,
      qrCode: qr || null,
      hasClient: clients.has(assistantId),
      timestamp: new Date().toISOString(),
    };
    
    // Log reducido para no llenar los logs en exceso con polling
    // log('info', `[${assistantId}] Consulta de estado: ${status}, QR: ${!!qr}`);

    res.json(response);

  } catch (error) {
    log('error', `[${assistantId}] Error en /status:`, error);
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
  
  log('info',`\n[${assistantId}] 🔍 DEBUG QR SOLICITADO:`);
  
  if (qr) {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Debug - ${assistantId}</title>
      </head>
      <body>
        <h1>🔍 QR Debug - ${assistantId}</h1>
        <p><strong>Estado:</strong> ${status}</p>
        <img src="${qr}" alt="QR Code">
      </body>
      </html>
    `);
  } else {
    res.json({ 
      error: 'No QR disponible', 
      status, 
    });
  }
});

// =========================================================
// 🔹 ENDPOINT: Desconectar sesión
// =========================================================
app.post('/api/whatsapp/disconnect', async (req, res, next) => {
  const { assistantId } = req.body;
   if (!assistantId) {
    log('warn', 'Intento de desconexión sin assistantId');
    return res.status(400).json({ error: 'assistantId requerido' });
  }

  log('info', `[${assistantId}] 🔌 Solicitando desconexión...`);

  try {
    const client = clients.get(assistantId);
    if (client) {
      await client.destroy();
      log('info', `[${assistantId}] ✅ Cliente destruido`);
    }
    clients.delete(assistantId);
    qrCodes.delete(assistantId);
    connectionStatus.delete(assistantId);
    
    const sessionFile = path.join(SESSIONS_DIR, `${assistantId}.json`);
    if (fs.existsSync(sessionFile)) {
      fs.unlinkSync(sessionFile);
      log('info', `[${assistantId}] ✅ Archivo de sesión eliminado.`);
    }

    res.json({ 
      success: true,
      message: 'WhatsApp desconectado correctamente'
    });
  } catch (error) {
    log('error', `[${assistantId}] Error en /disconnect:`, error);
    next(error);
  }
});

// =========================================================
// 🔹 HEALTH CHECK
// =========================================================
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    activeSessions: clients.size,
    qrCodesInMemory: qrCodes.size
  });
});

// =========================================================
// 🔹 GLOBAL ERROR HANDLER
// =========================================================
app.use((err, req, res, next) => {
  const assistantId = req.body.assistantId || req.params.assistantId || 'global';
  log('error', `[${assistantId}] ❌ GLOBAL ERROR HANDLER:`, err);
  
  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    error: 'Error inesperado en el servidor',
    message: err.message,
    // No enviar el stack en producción por seguridad
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});


// =========================================================
// 🔹 INICIAR SERVIDOR
// =========================================================
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  log('info', `🚀 WhatsApp Server escuchando en puerto ${PORT}`);
  log('info', `📁 Sesiones guardadas en: ${SESSIONS_DIR}`);
  log('info', `📝 Logs guardados en: ${LOG_DIR}/server.log`);
  log('info', `❤️  Health check: http://localhost:${PORT}/health`);
});

// Manejo de cierre del proceso
process.on('SIGINT', () => {
  log('info', 'Cerrando servidor...');
  logFile.end(() => {
    process.exit(0);
  });
});
