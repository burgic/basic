const fetch = require('node-fetch'); // Use fetch for API calls if needed
const generateBotResponse = require('../../components/Chat/Bot'); // Update path as needed

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed. Use POST.' }),
    };
  }

  try {
    const { userId, query } = JSON.parse(event.body);

    if (!userId || !query) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields: userId or query.' }),
      };
    }

    const response = await generateBotResponse(userId, query, 'financial advisor');
    return {
      statusCode: 200,
      body: JSON.stringify({ response }),
    };
  } catch (error) {
    console.error('Error in chatbot function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error.' }),
    };
  }
};