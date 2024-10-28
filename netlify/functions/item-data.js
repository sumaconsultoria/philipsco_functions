const express = require('express');
const axios = require('axios');
const serverless = require('serverless-http');

const app = express();

app.use(express.json());

app.post('/.netlify/functions/item-data', async (req, res) => {
  const { accessToken, itemId } = req.body;

  // Agregar encabezados CORS
  res.setHeader('Access-Control-Allow-Origin', 'https://www.tienda.philips.com.co');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const response = await axios.get(`https://api.mercadolibre.com/items/${itemId}?include_attributes=all`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching item data' });
  }
});

module.exports.handler = serverless(app);