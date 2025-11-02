# Servidor WhatsApp Web.js

Este servidor gestiona las conexiones de WhatsApp para los asistentes.

## Instalación

```bash
cd whatsapp-server
npm install
```

## Ejecución

### Desarrollo (localhost)
```bash
npm run dev
```

### Producción
```bash
npm start
```

El servidor se ejecutará en `http://localhost:3001` por defecto.

## Variables de entorno (opcional)

Crea un archivo `.env` en esta carpeta:

```env
PORT=3001
```

## Endpoints

### POST /api/whatsapp/init
Inicia una sesión de WhatsApp para un asistente.

**Body:**
```json
{
  "assistantId": "uuid-del-asistente"
}
```

**Respuesta:**
```json
{
  "status": "initializing",
  "message": "Cliente WhatsApp inicializando. Espera el QR."
}
```

### GET /api/whatsapp/status/:assistantId
Obtiene el estado actual y el QR si está disponible.

**Respuesta:**
```json
{
  "status": "qr_ready|authenticated|ready|disconnected",
  "qrCode": "data:image/png;base64,...",
  "hasClient": true
}
```

### POST /api/whatsapp/disconnect
Desconecta una sesión de WhatsApp.

**Body:**
```json
{
  "assistantId": "uuid-del-asistente"
}
```

### POST /api/whatsapp/send
Envía un mensaje de WhatsApp.

**Body:**
```json
{
  "assistantId": "uuid-del-asistente",
  "to": "+34612345678",
  "message": "Hola desde el asistente"
}
```

## Estados

- `initializing`: Cliente inicializándose
- `qr_ready`: QR generado y listo para escanear
- `authenticated`: Autenticado pero no completamente listo
- `ready`: Completamente conectado y listo para enviar/recibir
- `disconnected`: Sin conexión

## Notas de producción

Para producción necesitarás:
1. Configurar HTTPS
2. Usar PM2 o similar para mantener el proceso activo
3. Configurar un dominio y certificado SSL
4. Ajustar el CORS para permitir solo tu dominio
