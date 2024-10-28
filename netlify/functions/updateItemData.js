// netlify/functions/updateItemData.js
const axios = require('axios');

exports.handler = async function (event, context) {
  const clientId = '603047614175354';
  const clientSecret = 'rLgPG6ZtPFn4D4aOUkkjWWPkiAsghp5F';
  let accessKey = process.env.ACCESS_TOKEN || 'APP_USR-603047614175354-102811-3d7a22c703a1de4ff108f3955a381c08-244943571';
  let refreshToken = process.env.REFRESH_TOKEN || 'TG-671fb08470db690001dc8caa-244943571';

  // Función para refrescar el token si es necesario
  async function refreshTokenIfNeeded() {
    try {
      const url = 'https://api.mercadolibre.com/oauth/token';
      const params = new URLSearchParams();
      params.append('grant_type', 'refresh_token');
      params.append('client_id', clientId);
      params.append('client_secret', clientSecret);
      params.append('refresh_token', refreshToken);

      const response = await axios.post(url, params);
      accessKey = response.data.access_token;
      refreshToken = response.data.refresh_token;

      // Guardar nuevos tokens en variables de entorno si es posible
      process.env.ACCESS_TOKEN = accessKey;
      process.env.REFRESH_TOKEN = refreshToken;
    } catch (error) {
      console.error('Error al refrescar el token:', error);
      throw error;
    }
  }

  // Extraer itemId de la URL y realizar solicitud
  async function fetchItemData(itemId) {
    try {
      await refreshTokenIfNeeded(); // Refresca token si es necesario
      const productApiUrl = `https://api.mercadolibre.com/items/${itemId}?include_attributes=all`;
      const response = await axios.get(productApiUrl, {
        headers: { Authorization: `Bearer ${accessKey}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener datos del producto:', error);
      throw error;
    }
  }

  // Procesar la solicitud del cliente
  const { itemId } = JSON.parse(event.body);
  try {
    const itemData = await fetchItemData(itemId);
    return {
      statusCode: 200,
      body: JSON.stringify(itemData),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' // Para manejar CORS
      }
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error al obtener los datos del producto' }),
      headers: { 'Access-Control-Allow-Origin': '*' }
    };
  }
};