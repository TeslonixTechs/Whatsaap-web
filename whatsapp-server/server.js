
      // =========================================================
      // 🔹 FUNCIÓN: Generar y guardar QR
      // =========================================================
      async function generateAndStoreQR(assistantId, qrData) {
        try {
          log('info', `[${assistantId}] Generando QR Data URL...`);
          const qrImage = await qrcode.toDataURL(qrData, {
            errorCorrectionLevel: 'M',
            type: 'image/png',
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
