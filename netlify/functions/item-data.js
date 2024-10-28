const express = require('express');
const axios = require('axios');
const serverless = require('serverless-http');
const app = express();

app.use(express.json());

app.post('/get-item-data', async (req, res) => {
  const { itemId, accessToken } = req.body;

  const itemUrl = `https://api.mercadolibre.com/items/${itemId}?include_attributes=all`;
  try {
    const response = await axios.get(itemUrl, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": 'application/json'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error al obtener los datos del artículo:', error);
    res.status(500).json({ error: 'Error al obtener los datos del artículo' });
  }
});

module.exports.handler = serverless(app);