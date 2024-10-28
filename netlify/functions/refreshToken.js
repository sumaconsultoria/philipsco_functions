// functions/refreshToken.js

const axios = require('axios');

exports.handler = async (event) => {
  // Check if the method is POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405, // Method Not Allowed
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  // Try to parse the incoming request body
  let refreshToken;
  try {
    const body = JSON.parse(event.body);
    refreshToken = body.refreshToken; // Obtener el refreshToken del cuerpo de la solicitud
  } catch (error) {
    return {
      statusCode: 400, // Bad Request
      body: JSON.stringify({ error: 'Invalid JSON input' }),
    };
  }

  const clientId = '603047614175354'; // Reemplaza con tu clientId real
  const clientSecret = 'rLgPG6ZtPFn4D4aOUkkjWWPkiAsghp5F'; // Reemplaza con tu clientSecret real

  const url = 'https://api.mercadolibre.com/oauth/token';
  const params = new URLSearchParams();

  params.append('grant_type', 'refresh_token');
  params.append('client_id', clientId);
  params.append('client_secret', clientSecret);
  params.append('refresh_token', refreshToken);

  try {
    const response = await axios.post(url, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    return {
      statusCode: error.response ? error.response.status : 500,
      body: JSON.stringify({ error: error.response ? error.response.data : 'Internal Server Error' }),
    };
  }
};