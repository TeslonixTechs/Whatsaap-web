
const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

// Basic logging setup
const logStream = fs.createWriteStream(path.join(__dirname, 'logs', 'server.log'), { flags: 'a' });
const log = (level, message, ...args) => {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message} ${args.map(arg => JSON.stringify(arg)).join(' ')}`;
  console.log(formattedMessage);
  logStream.write(formattedMessage + '\n');
};

log('info', '================================================');
log('info', '🚀 INICIANDO WHATSAPP SERVER...');
log('info', '================================================');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- STATE MANAGEMENT ---
const clients = new Map();
const connectionStatus = new Map();
const qrCodes = new Map();

const SESSIONS_DIR = path.join(__dirname, 'sessions');
if (!fs.existsSync(SESSIONS_DIR)) {
  fs.mkdirSync(SESSIONS_DIR, { recursive: true });
}
const LOGS_DIR = path.join(__dirname, 'logs');
if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
}

// =========================================================
// 🔹 FUNCIÓN: Inicializar un nuevo cliente de WhatsApp
// =========================================================
function initializeWhatsAppClient(assistantId) {
  log('info', `[${assistantId}] 🚀 Inicializando cliente de WhatsApp...`);
  connectionStatus.set(assistantId, 'initializing');

  const sessionPath = path.join(SESSIONS_DIR, assistantId);
  log('info', `[${assistantId}] Usando ruta de sesión: ${sessionPath}`);

  const client = new Client({
    authStrategy: new LocalAuth({ clientId: assistantId, dataPath: SESSIONS_DIR }),
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process', // <- this one doesn't works in Windows
        '--disable-gpu'
      ],
    },
    webVersionCache: {
      type: 'none'
    }
  });

  clients.set(assistantId, client);

  client.on('qr', async (qr) => {
    log('info', `[${assistantId}] 📲 QR recibido. Generando para API...`);
    connectionStatus.set(assistantId, 'qr_received');
    await generateAndStoreQR(assistantId, qr);
  });

  client.on('ready', () => {
    log('info', `[${assistantId}] ✅ Cliente de WhatsApp está listo!`);
    connectionStatus.set(assistantId, 'ready');
    qrCodes.delete(assistantId);
  });

  client.on('authenticated', () => {
    log('info', `[${assistantId}] 🔒 Cliente autenticado exitosamente.`);
    connectionStatus.set(assistantId, 'authenticated');
  });

  client.on('auth_failure', (msg) => {
    log('error', `[${assistantId}] ❌ Fallo de autenticación:`, msg);
    connectionStatus.set(assistantId, 'auth_failure');
    clients.delete(assistantId); // Clean up failed client
  });

  client.on('disconnected', (reason) => {
    log('warn', `[${assistantId}] 🔌 Cliente desconectado:`, reason);
    connectionStatus.set(assistantId, 'disconnected');
    clients.delete(assistantId); // Clean up disconnected client
    fs.rm(sessionPath, { recursive: true, force: true }, (err) => {
        if(err) log('error', `[${assistantId}] Error eliminando la carpeta de sesión:`, err);
        else log('info', `[${assistantId}] Carpeta de sesión eliminada con éxito.`);
    });
  });

  client.initialize().catch(err => {
    log('error', `[${assistantId}] 🚨 Error durante la inicialización del cliente:`, err);
    connectionStatus.set(assistantId, 'initialization_error');
  });

  return client;
}

// =========================================================
// 🔹 FUNCIÓN: Generar y guardar QR
// =========================================================
async function generateAndStoreQR(assistantId, qrData) {
  try {
    log('info', `[${assistantId}] Generando QR Data URL...`);
    const qrImage = await qrcode.toDataURL(qrData, {
      errorCorrectionLevel: 'L', // Lower correction for faster generation
      type: 'image/png',      // Generate PNG directly
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
// 🔹 ENDPOINT: Iniciar conexión de WhatsApp
// =========================================================
app.post('/api/whatsapp/init', (req, res) => {
  const { assistantId } = req.body;
  if (!assistantId) {
    log('warn', 'Se intentó iniciar sin assistantId');
    return res.status(400).json({ error: 'assistantId is required' });
  }

  if (clients.has(assistantId)) {
    log('info', `[${assistantId}] Ya existe una sesión. Reutilizándola.`);
     // Optional: You might want to return the current status instead of re-initializing
     const status = connectionStatus.get(assistantId) || 'unknown';
     if (status === 'ready' || status === 'authenticated') {
         return res.status(200).json({ message: 'Client already initialized and connected.', status });
     }
  }

  initializeWhatsAppClient(assistantId);
  res.status(202).json({ message: 'Initialization process started. Please poll for status and QR code.' });
});


// =========================================================
// 🔹 ENDPOINT: Obtener estado de la conexión y QR
// =========================================================
app.get('/api/whatsapp/status/:assistantId', (req, res) => {
  const { assistantId } = req.params;
  if (!assistantId) {
    return res.status(400).json({ error: 'assistantId is required' });
  }

  const status = connectionStatus.get(assistantId) || 'not_initialized';
  const qrCode = qrCodes.get(assistantId) || null;

  res.json({ 
    status: status,
    qrCode: qrCode
  });
});

// =========================================================
// 🔹 ENDPOINT: Desconectar WhatsApp
// =========================================================
app.post('/api/whatsapp/disconnect', async (req, res) => {
    const { assistantId } = req.body;
    if (!assistantId) {
        return res.status(400).json({ error: 'assistantId is required' });
    }

    const client = clients.get(assistantId);
    if (client) {
        try {
            log('info', `[${assistantId}] Solicitud de desconexión recibida.`);
            await client.logout(); // Use logout for a graceful disconnection
            log('info', `[${assistantId}] Desconexión completada exitosamente.`);
            res.status(200).json({ message: 'Disconnected successfully.' });
        } catch (error) {
            log('error', `[${assistantId}] Error durante la desconexión:`, error);
            res.status(500).json({ error: 'Failed to disconnect.', details: error.message });
        }
    } else {
        log('warn', `[${assistantId}] Se intentó desconectar un cliente no existente.`);
        // Even if no client is found, ensure the state reflects disconnection
        connectionStatus.set(assistantId, 'disconnected');
        qrCodes.delete(assistantId);
        clients.delete(assistantId);
        const sessionPath = path.join(SESSIONS_DIR, assistantId);
        fs.rm(sessionPath, { recursive: true, force: true }, (err) => {
            if(err) log('error', `[${assistantId}] Error eliminando la carpeta de sesión (sin cliente):`, err);
        });
        res.status(404).json({ error: 'Client not found, but state has been cleared.' });
    }
});


// =========================================================
// 🔹 ENDPOINT: Enviar mensaje
// =========================================================
app.post('/api/whatsapp/send', async (req, res) => {
  const { assistantId, number, message } = req.body;

  if (!assistantId || !number || !message) {
    return res.status(400).json({ error: 'assistantId, number, and message are required' });
  }

  const client = clients.get(assistantId);

  if (!client || connectionStatus.get(assistantId) !== 'ready') {
    return res.status(409).json({ error: 'WhatsApp client is not ready.' });
  }

  try {
    const chatId = `${number}@c.us`;
    await client.sendMessage(chatId, message);
    res.json({ success: true, message: 'Message sent successfully.' });
  } catch (error) {
    log('error', `[${assistantId}] Error enviando mensaje:`, error);
    res.status(500).json({ success: false, error: 'Failed to send message.' });
  }
});

// Health Check Endpoint
app.get('/health', (req, res) => res.status(200).send('OK'));

// Start the server only if this file is run directly
if (require.main === module) {
  app.listen(port, () => {
    log('info', `🚀 WhatsApp Server escuchando en puerto ${port}`);
    log('info', `📁 Sesiones guardadas en: ${SESSIONS_DIR}`);
    log('info', `📝 Logs guardados en: ${LOGS_DIR}/server.log`);
    log('info', `❤️  Health check: http://localhost:${port}/health`);
  });
}

module.exports = app; // Export for testing or other purposes
