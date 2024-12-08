// netlify/functions/chatbot.ts
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});
const supabase = createClient(process.env.REACT_APP_SUPABASE_DATABASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY);
const createFinancialSummary = (data) => {
    const totalIncome = data.incomes.reduce((sum, inc) => sum + inc.amount, 0);
    const totalExpenditure = data.expenditures.reduce((sum, exp) => sum + exp.amount, 0);
    const totalAssets = data.assets.reduce((sum, asset) => sum + asset.value, 0);
    const totalLiabilities = data.liabilities.reduce((sum, liability) => sum + liability.amount, 0);
    const netWorth = totalAssets - totalLiabilities;
    const monthlyIncome = totalIncome / 12;
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
      3. Provide practical, actionable advice
      4. Explain how their current finances align with their goals
      5. Consider their complete financial picture in your analysis
      
      Keep responses clear, practical, and data-driven.`;
};
export const handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }
    try {
        const { message, userId, messageHistory = [] } = JSON.parse(event.body || '{}');
        if (!message || !userId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Message and userId are required' })
            };
        }
        // Fetch financial data
        const financialData = await fetchFinancialData(userId);
        const financialSummary = createFinancialSummary(financialData);
        const systemPrompt = createSystemPrompt(financialSummary);
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
                        incomes: financialData.incomes.length > 0,
                        expenditures: financialData.expenditures.length > 0,
                        assets: financialData.assets.length > 0,
                        liabilities: financialData.liabilities.length > 0,
                        goals: financialData.goals.length > 0
                    }
                }
            })
        };
    }
    catch (error) {
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
