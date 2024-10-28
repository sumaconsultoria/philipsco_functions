const express = require('express');
const axios = require('axios');
const serverless = require('serverless-http');

const app = express();
app.use(express.json());

const clientId = '603047614175354';
const clientSecret = 'rLgPG6ZtPFn4D4aOUkkjWWPkiAsghp5F';
let accessKey = 'APP_USR-603047614175354-102811-3d7a22c703a1de4ff108f3955a381c08-244943571';
let tokenLastUpdated = 0;
let refreshToken = 'TG-671fb08470db690001dc8caa-244943571';

// Configuración de CORS para todas las respuestas
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Permitir todos los orígenes; usa '*' o el origen específico
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Función para refrescar el token
async function refreshTokenFunction() {
  const url = 'https://api.mercadolibre.com/oauth/token';
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
  });

  const response = await axios.post(url, params);
  const data = response.data;

  accessKey = data.access_token;
  tokenLastUpdated = Math.floor(Date.now() / 1000);

  if (data.refresh_token) {
    refreshToken = data.refresh_token;
  }

  return accessKey;
}

// Función para verificar y refrescar el token si es necesario
async function refreshTokenIfNeeded() {
  const currentTime = Math.floor(Date.now() / 1000);
  const sixHoursInSeconds = 6 * 60 * 60;

  if (!accessKey || currentTime - tokenLastUpdated >= sixHoursInSeconds) {
    accessKey = await refreshTokenFunction();
  }

  return accessKey;
}

// Ruta principal para manejar las solicitudes del frontend
app.get('https://philipscofunctions.netlify.app/.netlify/functions/mercadoLibre', async (req, res) => {
  try {
    const productUrl = req.query.url;
    const itemIdMatch = productUrl.match(/MCO-\d+/) || productUrl.match(/\/MCO\d+/) || productUrl.match(/#.*?MCO(\d+)/) || productUrl.match(/\/p\/MCO(\d+)/);

    if (itemIdMatch) {
      let itemId = itemIdMatch[0].replace(/[-\/]/g, '');
      await refreshTokenIfNeeded();

      if (productUrl.includes('/p/')) {
        const productApiUrl = `https://api.mercadolibre.com/products/${itemId}`;
        const productResponse = await axios.get(productApiUrl, {
          headers: { Authorization: `Bearer ${accessKey}` }
        });

        const item_id = productResponse.data.buy_box_winner.item_id;

        const itemApiUrl = `https://api.mercadolibre.com/items/${item_id}?include_attributes=all`;
        const itemResponse = await axios.get(itemApiUrl, {
          headers: { Authorization: `Bearer ${accessKey}` }
        });

        const valueName = itemResponse.data.attributes.find(attr => attr.id === 'MODEL').value_name;
        res.json({ valueName });
      } else {
        const apiUrl = `https://api.mercadolibre.com/items/${itemId}?include_attributes=all`;
        const itemResponse = await axios.get(apiUrl, {
          headers: { Authorization: `Bearer ${accessKey}` }
        });

        const valueName = itemResponse.data.attributes.find(attr => attr.id === 'MODEL').value_name;
        res.json({ valueName });
      }
    } else {
      res.status(400).json({ error: 'No se pudo extraer el ID del artículo de la URL' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en la solicitud de producto' });
  }
});

module.exports.handler = serverless(app);