const fetch = require('node-fetch'); // Use fetch for API calls if needed
const generateBotResponse = require('../../src/components/Chat/Bot'); // Update path as needed

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method not allowed. Use POST.' }),
      };
    }

    const { userId, query } = JSON.parse(event.body);

    if (!userId || !query) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields: userId or query.' }),
      };
    }

    // Simulate a bot response (replace this with your actual logic)
    const botResponse = `Hello, User ${userId}. You asked: "${query}"`;

    return {
      statusCode: 200,
      body: JSON.stringify({ response: botResponse }),
    };
  } catch (error) {
    console.error('Error in chatbot function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error.' }),
    };
  }
};