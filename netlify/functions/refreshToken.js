// netlify/functions/refreshToken.js
const axios = require('axios');

exports.handler = async (event, context) => {
  const clientId = '603047614175354'; // Reemplaza con tu clientId real
  const clientSecret = 'rLgPG6ZtPFn4D4aOUkkjWWPkiAsghp5F'; // Reemplaza con tu clientSecret real
  const refreshToken = event.body.refreshToken;

  const url = 'https://api.mercadolibre.com/oauth/token';
  
  const params = new URLSearchParams();
  params.append('grant_type', 'refresh_token');
  params.append('client_id', clientId);
  params.append('client_secret', clientSecret);
  params.append('refresh_token', refreshToken);

  try {
    const response = await axios.post(url, params, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    return {
      statusCode: error.response.status || 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};