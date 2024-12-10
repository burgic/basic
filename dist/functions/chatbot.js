"use strict";
// netlify/functions/chatbot.js
const OpenAI = require('openai');
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});
const handler = async (event) => {
    console.log('Function triggered', {
        method: event.httpMethod,
        body: event.body,
        headers: event.headers,
    });
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }
    try {
        const { message, financialData } = JSON.parse(event.body || '{}');
        const summary = `
      Annual Income: £${financialData.incomes[0].amount}
      Monthly Expenses: £${financialData.expenditures.reduce((sum, e) => sum + e.amount, 0)}
      Total Assets: £${financialData.assets[0].value}
      Total Liabilities: £${financialData.liabilities[0].amount}
    `;
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: `You are a financial advisor. Client data:\n${summary}` },
                { role: "user", content: message }
            ]
        });
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ response: completion.choices[0].message.content })
        };
    }
    catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: String(error) })
        };
    }
};
// Export both ways to ensure compatibility
console.log('Handler is being invoked');
exports.handler = async (event) => {
    console.log('Event:', event);
};
exports.handler = handler;
module.exports = { handler };
