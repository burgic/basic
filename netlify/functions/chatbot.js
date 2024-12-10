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

  const calculateMonthlyExpenditure = (expenditures) => {
    return expenditures.reduce((sum, exp) => {
        const amount = parseFloat(exp.amount) || 0;
        return sum + (exp.frequency.toLowerCase() === 'annual'? amount / 12 : amount);
    })
  }

  const calculateAnnualExpenditure = (expenditures) => {
    return expenditures.reduce((sum, exp) => {
        const amount = parseFloat(exp.amount) || 0;
        return sum + (exp.frequency.toLowerCase() === 'annual'? amount / 12 : amount);
    })
  }

  /*
  
const createFinancialSummary = (data) => {
    const monthlyIncome = calculateMonthlyIncome(data.incomes);
    const annualIncome = calculateAnnualIncome(data.incomes);
    const monthlyExpenditure = calculateMonthlyExpenditure(data.incomes);
    const annualExpenditure = calculateAnnualExpenditure(data.incomes);
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
    Monthly Income: £${monthlyIncome.toFixed(2)}
    Annual Income: £${annualIncome.toFixed(2)}
    Monthly Expenses: £${monthlyExpenditure.toFixed(2)}
    Annual Expenses: £${annualExpenditure.toFixed(2)}
    Monthly Cash Flow: £${(annualIncome - totalExpenditure).toFixed(2)}
    Total Assets: £${totalAssets.toFixed(2)}
    Total Liabilities: £${totalLiabilities.toFixed(2)}
    Net Worth: £${netWorth.toFixed(2)}
  
    DETAILED BREAKDOWN
    =================
    Income Sources:
    ${data.incomes.map((inc) => `- ${inc.type}: £${inc.amount} (${inc.frequency})`).join('\n') || 'No income data available'}
  
    Expense Sources:
    ${data.expenditures.map((exp) => `- ${exp.category}: £${exp.amount}`).join('\n') || 'No expense data available'}
  
    Assets:
    ${data.assets.map((asset) => `- ${asset.type}: £${asset.value} - ${asset.description}`).join('\n') || 'No asset data available'}
  
    Liabilities:
    ${data.liabilities.map((liability) => `- ${liability.type}: £${liability.amount} at ${liability.interest_rate}% interest`).join('\n') || 'No liability data available'}
  
    Financial Goals:
    ${data.goals.map((goal) => `- ${goal.goal}: Target £${goal.target_amount} in ${goal.time_horizon} years`).join('\n') || 'No goals set'}
    `;

  };

  */

 


  const systemMessage = (financialData) => { 

        const monthlyIncome = calculateMonthlyIncome(financialData.incomes);
        const annualIncome = calculateAnnualIncome(financialData.incomes);
        const monthlyExpenditure = calculateMonthlyExpenditure(financialData.incomes);
        const annualExpenditure = calculateAnnualExpenditure(financialData.incomes);
        const totalExpenditure = data.expenditures.reduce((sum, exp) => sum + exp.amount, 0);
        const totalAssets = data.assets.reduce((sum, asset) => sum + asset.value, 0);
        const totalLiabilities = data.liabilities.reduce((sum, liability) => sum + liability.amount, 0);
        const netWorth = totalAssets - totalLiabilities;
    
        `You are a financial advisor assistant in the UK with access to the user's current financial data. 
        Base your advice on their actual financial situation as shown below:

        FINANCIAL OVERVIEW
        =================
        Monthly Income: £${monthlyIncome.toFixed(2)}
        Annual Income: £${annualIncome.toFixed(2)}
        Monthly Expenses: £${monthlyExpenditure.toFixed(2)}
        Annual Expenses: £${annualExpenditure.toFixed(2)}
        Monthly Cash Flow: £${(annualIncome - totalExpenditure).toFixed(2)}
        Total Assets: £${totalAssets.toFixed(2)}
        Total Liabilities: £${totalLiabilities.toFixed(2)}
        Net Worth: £${netWorth.toFixed(2)}

        DETAILED BREAKDOWN
        =================
        Income Sources:
        ${financialData.incomes.map((inc) => `- ${inc.type}: £${inc.amount} (${inc.frequency})`).join('\n') || 'No income data available'}

        Expense Sources:
        ${financialData.expenditures.map((exp) => `- ${exp.category}: £${exp.amount}`).join('\n') || 'No expense data available'}

        Assets:
        ${financialData.assets.map((asset) => `- ${asset.type}: £${asset.value} - ${asset.description}`).join('\n') || 'No asset data available'}

        Liabilities:
        ${financialData.liabilities.map((liability) => `- ${liability.type}: £${liability.amount} at ${liability.interest_rate}% interest`).join('\n') || 'No liability data available'}

        Financial Goals:
        ${financialData.goals.map((goal) => `- ${goal.goal}: Target £${goal.target_amount} in ${goal.time_horizon} years`).join('\n') || 'No goals set'}
       
        Provide specific, actionable advice based on their actual numbers and circumstances.`;

  }

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
    const { message, messageHistory = [], financialData } = JSON.parse(event.body || '{}');

    const systemPrompt = systemMessage(financialData);

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
            { role: "system", content: systemPrompt },
            ...messageHistory,
            { role: "user", content: message }
          ],
          temperature: 0.7,
          max_tokens: 1000
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