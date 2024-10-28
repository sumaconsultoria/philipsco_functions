const express = require('express');
const axios = require('axios');
const serverless = require('serverless-http');
const app = express();

app.use(express.json());

app.post('/refresh-token', async (req, res) => {
  const { refreshToken, clientId, clientSecret } = req.body;

  const url = 'https://api.mercadolibre.com/oauth/token';
  try {
    const response = await axios.post(url, new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    }), {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    res.json({
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
    });
  } catch (error) {
    console.error('Error al refrescar el token:', error);
    res.status(500).json({ error: 'Error al refrescar el token' });
  }
});

module.exports.handler = serverless(app);