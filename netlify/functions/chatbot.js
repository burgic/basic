// netlify/functions/chatbot.js

const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const calculateMonthlyIncome = (incomes) => {
    return incomes.reduce((sum, inc) => {
      const amount = parseFloat(inc.amount) || 0;
      // Convert annual income to monthly
      return sum + (inc.frequency.toLowerCase() === 'annual' ? amount / 12 : amount);
    }, 0);
  };
  
  const calculateAnnualIncome = (incomes) => {
    return incomes.reduce((sum, inc) => {
      const amount = parseFloat(inc.amount) || 0;
      // Convert monthly income to annual
      return sum + (inc.frequency.toLowerCase() === 'monthly' ? amount * 12 : amount);
    }, 0);
  };

const createFinancialSummary = (data) => {
    const monthlyIncome = calculateMonthlyIncome(data.incomes);
    const annualIncome = calculateAnnualIncome(data.incomes);
    const totalExpenditure = data.expenditures.reduce((sum, exp) => sum + exp.amount, 0);
    const totalAssets = data.assets.reduce((sum, asset) => sum + asset.value, 0);
    const totalLiabilities = data.liabilities.reduce((sum, liability) => sum + liability.amount, 0);
    const netWorth = totalAssets - totalLiabilities;
  
    if (!data.incomes || !data.incomes.length) {
      console.log('No income data available');
      return 'No income data available';
    }
  
    return `
    FINANCIAL OVERVIEW
    =================
    Monthly Income: £${totalIncome.toFixed(2)}
    Monthly Expenses: £${totalExpenditure.toFixed(2)}
    Monthly Cash Flow: £${(totalIncome - totalExpenditure).toFixed(2)}
    Total Assets: £${totalAssets.toFixed(2)}
    Total Liabilities: £${totalLiabilities.toFixed(2)}
    Net Worth: £${netWorth.toFixed(2)}
  
    DETAILED BREAKDOWN
    =================
    Income Sources:
    ${data.incomes.map((inc) => `- ${inc.type}: £${inc.amount} (${inc.frequency})`).join('\n') || 'No income data available'}
  
    Monthly Expenses:
    ${data.expenditures.map((exp) => `- ${exp.category}: £${exp.amount}`).join('\n') || 'No expense data available'}
  
    Assets:
    ${data.assets.map((asset) => `- ${asset.type}: £${asset.value} - ${asset.description}`).join('\n') || 'No asset data available'}
  
    Liabilities:
    ${data.liabilities.map((liability) => `- ${liability.type}: £${liability.amount} at ${liability.interest_rate}% interest`).join('\n') || 'No liability data available'}
  
    Financial Goals:
    ${data.goals.map((goal) => `- ${goal.goal}: Target £${goal.target_amount} in ${goal.time_horizon} years`).join('\n') || 'No goals set'}
    `;

  };

  console.log(createFinancialSummary)


  const systemMessage = `You are a financial advisor assistant in the UK with access to the user's current financial data. 
        Base your advice on their actual financial situation as shown below:

        Monthly Income: £${totalIncome ? totalIncome.toFixed(2) : 'Not provided'}
        Monthly Expenses: £${totalExpenditure.toFixed(2)}
        Monthly Cash Flow: £${(totalIncome - totalExpenditure).toFixed(2)}
        Total Assets: £${totalAssets.toFixed(2)}
        Total Liabilities: £${totalLiabilities.toFixed(2)}
        Net Worth: £${netWorth.toFixed(2)}

        DETAILED BREAKDOWN
        =================
        Income Sources:
        ${financialData.incomes.map((inc) => `- ${inc.type}: £${inc.amount} (${inc.frequency})`).join('\n') || 'No income data available'}

        Monthly Expenses:
        ${financialData.expenditures.map((exp) => `- ${exp.category}: £${exp.amount}`).join('\n') || 'No expense data available'}

        Assets:
        ${financialData.assets.map((asset) => `- ${asset.type}: £${asset.value} - ${asset.description}`).join('\n') || 'No asset data available'}

        Liabilities:
        ${financialData.liabilities.map((liability) => `- ${liability.type}: £${liability.amount} at ${liability.interest_rate}% interest`).join('\n') || 'No liability data available'}

        Financial Goals:
        ${financialData.goals.map((goal) => `- ${goal.goal}: Target £${goal.target_amount} in ${goal.time_horizon} years`).join('\n') || 'No goals set'}

        Please use this data to answer the user's question in detail, considering their:
        1. Income
        2. Expenses
        3. Assets
        4. Liabilities
        5. Financial Goals

        When responding:
        1. Always reference specific numbers from their data
        2. Make recommendations based on their actual income, expenses, and goals
        3. Provide specific, actionable advice
        4. Explain how their current finances align with their goals
        5. Consider their income, expenses, assets, and liabilities in your analysis

        Provide actionable and personalized advice based on the provided data.

        `;


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
    
    const summary = createFinancialSummary(financialData)
    /*
    `
      Annual Income: £${financialData.incomes[0].amount}
      Monthly Expenses: £${financialData.expenditures.reduce((sum, e) => sum + e.amount, 0)}
      Total Assets: £${financialData.assets[0].value}
      Total Liabilities: £${financialData.liabilities[0].amount}
    `;
*/

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
            { role: "system", content: systemMessage },
            ...messageHistory,
            { role: "user", content: message }
          ],
          temperature: 0.7,
          max_tokens: 1500
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ response: completion.choices[0].message.content })
    };
  } catch (error) {
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