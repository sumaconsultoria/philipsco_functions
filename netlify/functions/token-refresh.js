const express = require('express');
const axios = require('axios');
const serverless = require('serverless-http');

const app = express();

app.use(express.json());

app.post('/.netlify/functions/token-refresh', async (req, res) => {
  const { clientId, clientSecret, refreshToken } = req.body;

  // Agregar encabezados CORS
  res.setHeader('Access-Control-Allow-Origin', 'https://www.tienda.philips.com.co');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const response = await axios.post('https://api.mercadolibre.com/oauth/token', new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    }).toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    // Enviar la respuesta con el nuevo access token
    res.json(response.data);
  } catch (error) {
    console.error('Error al refrescar el token:', error);
    res.status(500).json({ error: 'Error al refrescar el token' });
  }
});

module.exports.handler = serverless(app);