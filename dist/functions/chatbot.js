// netlify/functions/chatbot.ts
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});
const supabase = createClient(process.env.REACT_APP_SUPABASE_DATABASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY);
const createFinancialSummary = (data) => {
    console.log('Incoming financial data:', JSON.stringify(data, null, 2));
    if (!data || typeof data !== 'object') {
        console.error('Invalid financial data received:', data);
        return 'Error: Invalid financial data format';
    }
    // Ensure arrays exist
    const incomes = Array.isArray(data.incomes) ? data.incomes : [];
    const expenditures = Array.isArray(data.expenditures) ? data.expenditures : [];
    const assets = Array.isArray(data.assets) ? data.assets : [];
    const liabilities = Array.isArray(data.liabilities) ? data.liabilities : [];
    const goals = Array.isArray(data.goals) ? data.goals : [];
    const arrays = {
        incomes: Array.isArray(data.incomes),
        expenditures: Array.isArray(data.expenditures),
        assets: Array.isArray(data.assets),
        liabilities: Array.isArray(data.liabilities),
        goals: Array.isArray(data.goals)
    };
    console.log('Array validation:', arrays);
    const processed = {
        incomes: arrays.incomes ? data.incomes : [],
        expenditures: arrays.expenditures ? data.expenditures : [],
        assets: arrays.assets ? data.assets : [],
        liabilities: arrays.liabilities ? data.liabilities : [],
        goals: arrays.goals ? data.goals : []
    };
    console.log('Processed arrays:', {
        incomesCount: processed.incomes.length,
        expendituresCount: processed.expenditures.length,
        assetsCount: processed.assets.length,
        liabilitiesCount: processed.liabilities.length,
        goalsCount: processed.goals.length
    });
    // Safely calculate totals
    const totalAnnualIncome = data.incomes.reduce((sum, inc) => sum + (Number(inc.amount) || 0), 0);
    const monthlyIncome = totalAnnualIncome / 12;
    const totalMonthlyExpenses = data.expenditures.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
    const totalAssets = data.assets.reduce((sum, asset) => sum + (Number(asset.value) || 0), 0);
    const totalLiabilities = data.liabilities.reduce((sum, liability) => sum + (Number(liability.amount) || 0), 0);
    const netWorth = totalAssets - totalLiabilities;
    /*
    const totalIncome = data.incomes.reduce((sum, inc) => sum + inc.amount, 0);
    const totalExpenditure = data.expenditures.reduce((sum, exp) => sum + exp.amount, 0);
    const totalAssets = data.assets.reduce((sum, asset) => sum + asset.value, 0);
    const totalLiabilities = data.liabilities.reduce((sum, liability) => sum + liability.amount, 0);
    const netWorth = totalAssets - totalLiabilities;
    const monthlyIncome = totalIncome / 12;
  */
    // Log the calculated values
    console.log('Calculated values:', {
        totalAnnualIncome,
        monthlyIncome,
        totalMonthlyExpenses,
        totalAssets,
        totalLiabilities,
        netWorth
    });
    if (!data.incomes || !data.incomes.length) {
        console.log('No income data available');
        return 'No income data available';
    }
    return `
FINANCIAL OVERVIEW
=================

Annual Income: £${totalAnnualIncome.toLocaleString()}
Monthly Income: £${monthlyIncome.toLocaleString()}
Monthly Expenses: £${totalMonthlyExpenses.toLocaleString()}
Total Assets: £${totalAssets.toLocaleString()}
Total Liabilities: £${totalLiabilities.toLocaleString()}
Net Worth: £${netWorth.toLocaleString()}

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

Note: All monetary values are in GBP.`;
};
const staticFinancialData = {
    incomes: [
        {
            id: "income-1",
            client_id: "f8ea9d9e-a6b6-43b7-baef-e8a13fff8fa9",
            type: "Total Income",
            amount: 78000,
            frequency: "Annual"
        }
    ],
    expenditures: [
        {
            id: "expenditure-1",
            client_id: "f8ea9d9e-a6b6-43b7-baef-e8a13fff8fa9",
            category: "Rent/Mortgage",
            amount: 700,
            frequency: "Monthly"
        },
        {
            id: "expenditure-2",
            client_id: "f8ea9d9e-a6b6-43b7-baef-e8a13fff8fa9",
            category: "Utilities",
            amount: 150,
            frequency: "Monthly"
        },
        {
            id: "expenditure-3",
            client_id: "f8ea9d9e-a6b6-43b7-baef-e8a13fff8fa9",
            category: "Groceries",
            amount: 300,
            frequency: "Monthly"
        },
        {
            id: "expenditure-4",
            client_id: "f8ea9d9e-a6b6-43b7-baef-e8a13fff8fa9",
            category: "Entertainment",
            amount: 300,
            frequency: "Monthly"
        }
    ],
    assets: [
        {
            id: "asset-1",
            client_id: "f8ea9d9e-a6b6-43b7-baef-e8a13fff8fa9",
            type: "Total Assets",
            value: 730000,
            description: "Combined assets"
        }
    ],
    liabilities: [
        {
            id: "liability-1",
            client_id: "f8ea9d9e-a6b6-43b7-baef-e8a13fff8fa9",
            type: "Total Liabilities",
            amount: 140000,
            interest_rate: 0,
            description: "liability"
        }
    ],
    goals: [
        {
            id: "goal-1",
            client_id: "f8ea9d9e-a6b6-43b7-baef-e8a13fff8fa9",
            goal: "Retire",
            target_amount: 100000,
            time_horizon: 30
        },
        {
            id: "goal-2",
            client_id: "f8ea9d9e-a6b6-43b7-baef-e8a13fff8fa9",
            goal: "Pay off mortgage",
            target_amount: 200000,
            time_horizon: 15
        }
    ]
};
const fetchFinancialData = async (userId) => {
    const [{ data: incomes, error: incomesError }, { data: expenditures, error: expendituresError }, { data: assets, error: assetsError }, { data: liabilities, error: liabilitiesError }, { data: goals, error: goalsError }] = await Promise.all([
        supabase.from('incomes').select('id, client_id, type, amount, frequency').eq('client_id', userId),
        supabase.from('expenditures').select('id, client_id, category, amount, frequency').eq('client_id', userId),
        supabase.from('assets').select('id, client_id, type, description, value').eq('client_id', userId),
        supabase.from('liabilities').select('id, client_id, type, amount, description, interest_rate').eq('client_id', userId),
        supabase.from('goals').select('id, client_id, goal, target_amount, time_horizon').eq('client_id', userId),
    ]);
    if (incomesError || expendituresError || assetsError || liabilitiesError || goalsError) {
        throw new Error('Error fetching financial data');
    }
    return {
        incomes: incomes || [],
        expenditures: expenditures || [],
        assets: assets || [],
        liabilities: liabilities || [],
        goals: goals || []
    };
};
const createSystemPrompt = (financialSummary) => {
    return `You are a financial advisor assistant with access to the user's current financial data. 
      Please use this data to provide specific, actionable advice:
      
      ${financialSummary}
      
      When responding:
      1. Reference specific numbers from their financial data
      2. Make recommendations based on their actual situation
      3. Consider their income, expenses, assets, liabilities, and stated goals
      4. Provide practical, actionable advice
      5. Keep responses clear and data-driven

      Please provide specific, actionable advice based on these exact numbers and circumstances.`;
};
export const handler = async (event) => {
    // Ensure the method is POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }
    let clientFinancialData;
    let message;
    let messageHistory = [];
    try {
        console.log('Raw event body:', event.body);
        const parsedBody = JSON.parse(event.body || '{}');
        console.log('Parsed body:', JSON.stringify(parsedBody, null, 2));
        // Parse and validate request body
        const { message: parsedMessage, userId, financialData, messageHistory: parsedMessageHistory = [] } = JSON.parse(event.body || '{}');
        if (!parsedMessage || !userId || !financialData) {
            throw new Error('Missing required fields in request body');
        }
        message = parsedMessage; // Assign parsed message
        messageHistory = parsedMessageHistory; // Assign parsed message history
        clientFinancialData = financialData;
        // Log each piece of data separately
        console.log('Financial Data Received:', {
            hasMessage: Boolean(message),
            hasUserId: Boolean(userId),
            financialDataExists: Boolean(financialData),
            financialDataStructure: financialData ? {
                hasIncomes: Array.isArray(financialData.incomes),
                incomesLength: financialData.incomes?.length,
                firstIncome: financialData.incomes?.[0],
                hasExpenditures: Array.isArray(financialData.expenditures),
                expendituresLength: financialData.expenditures?.length,
                firstExpenditure: financialData.expenditures?.[0],
            } : null
        });
        console.log('Received financial data:', JSON.stringify(clientFinancialData, null, 2));
    }
    catch (error) {
        console.error('Error parsing event.body:', error);
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: 'Failed to parse request body',
                details: error instanceof Error ? error.message : 'Unknown error',
            }),
        };
    }
    // Validate the financial data structure
    const dataValidation = {
        hasIncomes: Array.isArray(clientFinancialData?.incomes) && clientFinancialData.incomes.length > 0,
        hasExpenditures: Array.isArray(clientFinancialData?.expenditures) && clientFinancialData.expenditures.length > 0,
        hasAssets: Array.isArray(clientFinancialData?.assets) && clientFinancialData.assets.length > 0,
        hasLiabilities: Array.isArray(clientFinancialData?.liabilities) && clientFinancialData.liabilities.length > 0,
        hasGoals: Array.isArray(clientFinancialData?.goals) && clientFinancialData.goals.length > 0,
    };
    console.log('Data validation results:', dataValidation);
    if (!dataValidation.hasIncomes && !dataValidation.hasExpenditures && !dataValidation.hasAssets && !dataValidation.hasLiabilities && !dataValidation.hasGoals) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: 'No financial data provided',
                debug: dataValidation,
            }),
        };
    }
    try {
        // Generate financial summary and system prompt
        const financialSummary = createFinancialSummary(staticFinancialData);
        console.log('Generated financial summary:', financialSummary);
        // const systemPrompt = createSystemPrompt(financialSummary);
        console.log('Financial Summary being sent to OpenAI:', financialSummary);
        console.log('Message history:', messageHistory);
        console.log('User message:', message);
        // Interact with OpenAI
        let completion;
        try {
            completion = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo-16k',
                messages: [
                    { role: 'system', content: createSystemPrompt(financialSummary) },
                    ...messageHistory,
                    { role: 'user', content: message },
                ],
                temperature: 0.7,
                max_tokens: 1000,
            });
            console.log('OpenAI API response:', completion);
        }
        catch (error) {
            console.error('Error calling OpenAI API:', error);
            // Handle the error appropriately, e.g., set a default response or return an error message
            return {
                statusCode: 500,
                body: JSON.stringify({
                    error: 'Failed to get a response from OpenAI',
                    details: error instanceof Error ? error.message : 'Unknown error',
                }),
            };
        }
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST',
            },
            body: JSON.stringify({
                success: true,
                response: completion.choices[0].message.content,
                debug: { hasIncomes: clientFinancialData.incomes?.length > 0,
                    incomesCount: clientFinancialData.incomes?.length,
                    expendituresCount: clientFinancialData.expenditures?.length,
                    assetsCount: clientFinancialData.assets?.length,
                    liabilitiesCount: clientFinancialData.liabilities?.length,
                    goalsCount: clientFinancialData.goals?.length },
            }),
        };
    }
    catch (error) {
        console.error('Handler error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Server error',
                details: error instanceof Error ? error.message : 'Unknown error',
            }),
        };
    }
};
/*

export const handler: Handler = async (event) => {
if (event.httpMethod !== 'POST') {
  return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
}

try {
  console.log('Raw event body:', event.body);
  

  const { message, userId, financialData: clientFinancialData, messageHistory = [] } = JSON.parse(event.body || '{}') as RequestBody;
  
  console.log('Parsed financial data:', JSON.stringify(clientFinancialData, null, 2));

  if (!message || !userId || !clientFinancialData) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Message and userId are required' })
    };
  }

  // Fetch financial data

  const financialSummary = createFinancialSummary(clientFinancialData);
  console.log('Generated financial summary:', financialSummary);

  const systemPrompt = createSystemPrompt(financialSummary);
  console.log('System prompt:', systemPrompt);

  // Create completion
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-16k",
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
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST'
    },
    body: JSON.stringify({
      success: true,
      response: completion.choices[0].message.content,
      debug: {
        hasData: {
          incomes: clientFinancialData.incomes.length > 0,
          expenditures: clientFinancialData.expenditures.length > 0,
          assets: clientFinancialData.assets.length > 0,
          liabilities: clientFinancialData.liabilities.length > 0,
          goals: clientFinancialData.goals.length > 0
        }
      }
    })
  };

} catch (error) {
  console.error('Error:', error);
  return {
    statusCode: 500,
    body: JSON.stringify({
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  };
}
};

*/ 
