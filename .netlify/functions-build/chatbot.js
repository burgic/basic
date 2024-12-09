
"use strict";
// netlify/functions/chatbot.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const openai_1 = __importDefault(require("openai"));
const supabase_js_1 = require("@supabase/supabase-js");
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY
});
const supabase = (0, supabase_js_1.createClient)(process.env.REACT_APP_SUPABASE_DATABASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY);
const handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
    try {
        const { userId, message } = JSON.parse(event.body || '{}');
        if (!userId || !message) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing userId or message' })
            };
        }
        // Fetch user's profile and financial data
        const [profileResult, goalsResult, incomesResult, expendituresResult, assetsResult, liabilitiesResult] = await Promise.all([
            supabase.from('profiles').select('*').eq('id', userId).single(),
            supabase.from('goals').select('*').eq('client_id', userId),
            supabase.from('incomes').select('*').eq('client_id', userId),
            supabase.from('expenditures').select('*').eq('client_id', userId),
            supabase.from('assets').select('*').eq('client_id', userId),
            supabase.from('liabilities').select('*').eq('client_id', userId)
        ]);
        if (profileResult.error) {
            throw new Error(`Error fetching profile: ${profileResult.error.message}`);
        }
        const userProfile = profileResult.data;
        // Convert null to empty arrays
        const financialData = {
            goals: goalsResult.data || [],
            incomes: incomesResult.data || [],
            expenditures: expendituresResult.data || [],
            assets: assetsResult.data || [],
            liabilities: liabilitiesResult.data || []
        };
        // Calculate financial metrics
        const totalIncome = financialData.incomes.reduce((sum, income) => sum + Number(income.amount), 0);
        const totalExpenses = financialData.expenditures.reduce((sum, exp) => sum + Number(exp.amount), 0);
        const totalAssets = financialData.assets.reduce((sum, asset) => sum + Number(asset.value), 0);
        const totalLiabilities = financialData.liabilities.reduce((sum, liability) => sum + Number(liability.amount), 0);
        const netWorth = totalAssets - totalLiabilities;
        // Create context for the AI based on user's financial data
        const userContext = `
      User Profile: ${JSON.stringify(userProfile)}
      Financial Overview:
      - Goals: ${financialData.goals.length} financial goals set
      - Total Monthly Income: £${totalIncome}
      - Total Monthly Expenses: £${totalExpenses}
      - Net Worth: £${netWorth}
      - Total Assets: £${totalAssets}
      - Total Liabilities: £${totalLiabilities}

      Detailed Goals:
      ${financialData.goals.map(goal => `- ${goal.goal}: £${goal.target_amount} in ${goal.time_horizon} years`).join('\n')}
    `;
        // Generate chat response
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: `You are a financial advisor assistant. Your role is to provide helpful financial guidance based on the user's current financial situation. Here's the context about the user:\n${userContext}`
                },
                { role: 'user', content: message }
            ]
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
                response: completion.choices[0].message.content,
                userProfile,
                financialData,
                metrics: {
                    totalIncome,
                    totalExpenses,
                    totalAssets,
                    totalLiabilities,
                    netWorth
                }
            })
        };
    }
    catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error'
            })
        };
    }
};
exports.handler = handler;


/*

"use strict";
// netlify/functions/chatbot.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const openai_1 = __importDefault(require("openai"));
const supabase_js_1 = require("@supabase/supabase-js");
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY
});
const supabase = (0, supabase_js_1.createClient)(process.env.REACT_APP_SUPABASE_DATABASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY);
const createFinancialSummary = (data) => {
    const totalIncome = data.incomes.reduce((sum, inc) => sum + inc.amount, 0);
    const totalExpenditure = data.expenditures.reduce((sum, exp) => sum + exp.amount, 0);
    const totalAssets = data.assets.reduce((sum, asset) => sum + asset.value, 0);
    const totalLiabilities = data.liabilities.reduce((sum, liability) => sum + liability.amount, 0);
    const netWorth = totalAssets - totalLiabilities;
    /*
    // Calculate totals
    const totalIncome = data.incomes?.reduce((sum: number, inc: any) =>
      sum + (Number(inc.amount) * (inc.frequency === 'Monthly' ? 1 : 1/12)), 0) || 0;
    
    const totalExpenditure = data.expenditures?.reduce((sum: number, exp: any) =>
      sum + (Number(exp.amount) * (exp.frequency === 'Monthly' ? 1 : 1/12)), 0) || 0;
    
    const totalAssets = data.assets?.reduce((sum: number, asset: any) =>
      sum + Number(asset.value), 0) || 0;
    
    const totalLiabilities = data.liabilities?.reduce((sum: number, liability: any) =>
      sum + Number(liability.amount), 0) || 0;
    
    console.log('Inputs for financial summary:', JSON.stringify(data, null, 2));
    const summary = `
      ... (existing summary logic)
    `;
    console.log('Generated Financial Summary:', summary);
    
    return 
FINANCIAL OVERVIEW
=================
Monthly Income: £${totalIncome.toFixed(2)}
Monthly Expenses: £${totalExpenditure.toFixed(2)}
Monthly Cash Flow: £${((totalIncome || 0) - (totalExpenditure || 0)).toFixed(2)}
Total Assets: £${(totalAssets || 0).toFixed(2)}
Total Liabilities: £${(totalLiabilities || 0).toFixed(2)}
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
;
};
const handler = async (event) => {
    console.log('Function invoked');
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }
    try {
        const { message, userId, messageHistory = [] } = JSON.parse(event.body || '{}');
        console.log('Received request for userId:', userId);
        if (!message || !userId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Message and userId are required' })
            };
        }
        // Test Supabase connection
        console.log('Testing Supabase connection...');
        try {
            const { data: testData, error: testError } = await supabase
                .from('profiles')
                .select('count')
                .single();
            console.log('Supabase connection test:', { success: !testError, error: testError });
        }
        catch (dbError) {
            console.error('Supabase connection test failed:', dbError);
        }
        // Fetch user's financial data
        console.log('Fetching user data from Supabase for userId:', userId);
        // Fetch and log profile first
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        console.log('Profile fetch result:', {
            success: !profileError,
            hasProfile: !!profile,
            profileError
        });
        // Fetch financial data
        console.log('Fetching financial data...');
        const [{ data: incomes, error: incomesError }, { data: expenditures, error: expendituresError }, { data: assets, error: assetsError }, { data: liabilities, error: liabilitiesError }, { data: goals, error: goalsError }] = await Promise.all([
            supabase.from('incomes').select('type, amount, frequency').eq('client_id', userId),
            supabase.from('expenditures').select('category, amount, frequency').eq('client_id', userId),
            supabase.from('assets').select('type, description, value').eq('client_id', userId),
            supabase.from('liabilities').select('type, amount, interest_rate').eq('client_id', userId),
            supabase.from('goals').select('*').eq('client_id', userId),
        ]);
        // Log data retrieval results
        console.log('Retrieved data:', {
            incomesCount: incomes?.length || 0,
            expendituresCount: expenditures?.length || 0,
            assetsCount: assets?.length || 0,
            liabilitiesCount: liabilities?.length || 0,
            goalsCount: goals?.length || 0
        });
        // Check for errors
        if (incomesError || expendituresError || assetsError || liabilitiesError || goalsError) {
            console.error('Database errors:', {
                incomesError,
                expendituresError,
                assetsError,
                liabilitiesError,
                goalsError
            });
            throw new Error('Error fetching financial data');
        }
        const financialData = {
            incomes: incomes || [],
            expenditures: expenditures || [],
            assets: assets || [],
            liabilities: liabilities || [],
            goals: goals || [] // Use an empty array if goals is null
        };
        totalIncome: incomes.reduce((sum, income) =>
          sum + (income.amount * (income.frequency === 'Monthly' ? 1 : 1 / 12)), 0),
        totalExpenditure: expenditures.reduce((sum, expenditure) => sum + expenditure.amount, 0),
        totalAssets: assets.reduce((sum, asset) => sum + asset.value, 0),
        totalLiabilities: liabilities.reduce((sum, liability) => sum + liability.amount, 0)
        
        const financialSummary = createFinancialSummary(financialData);
        console.log('Generated financial summary:', financialSummary);
        const systemMessage = `You are a financial advisor assistant with access to the user's current financial data. 
Base your advice on their actual financial situation as shown below:

${financialSummary}

Please use this data to answer the user's question in detail, considering their:
1. Income - 70000 per annum
2. Expenses - 2000 per month
3. Assets - 
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
        // Create completion
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-16k",
            messages: [
                { role: "system", content: systemMessage },
                ...messageHistory,
                { role: "user", content: message }
            ],
            temperature: 0.7,
            max_tokens: 1500
        });
        console.log('Prompt to OpenAI:', [
            { role: 'system', content: systemMessage },
            ...messageHistory,
            { role: 'user', content: message }
        ]);
        console.log('OpenAI Prompt:', {
            systemMessage,
            messageHistory,
            userMessage: message
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
                        incomes: !!incomes?.length,
                        expenditures: !!expenditures?.length,
                        assets: !!assets?.length,
                        liabilities: !!liabilities?.length,
                        goals: !!goals?.length
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
exports.handler = handler;



// netlify/functions/chatbot.ts

import { Handler } from '@netlify/functions';
import OpenAI from 'openai';



const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const systemPrompt = `You are a helpful financial advisor assistant. Your role is to:
- Provide clear, practical financial guidance
- Explain financial concepts in simple terms
- Help users make informed decisions about their finances
- Give complete, well-structured responses
- Use bullet points and numbering for clarity
- Always finish your thoughts and never leave sentences incomplete

Remember to be professional, clear, and thorough in your responses.`;

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { message, messageHistory = [] } = JSON.parse(event.body || '{}');
    
    if (!message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Message is required' })
      };
    }

    // Construct messages array with history
    const messages = [
      { role: "system", content: systemPrompt },
      ...messageHistory,
      { role: "user", content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000, // Increased token limit
      presence_penalty: 0.6, // Encourages covering new ground
      frequency_penalty: 0.4 // Reduces repetition
    });

    const response = completion.choices[0].message.content;

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
        response
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


// netlify/functions/chatbot.ts

import { Handler } from '@netlify/functions';
import OpenAI from 'openai';

const handler: Handler = async (event) => {
  try {
    // Log environment variable presence (not the actual value)
    console.log('OpenAI API Key exists:', !!process.env.OPENAI_API_KEY);
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // Simple test request
    try {
      const test = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: "test" }],
      });
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: true,
          message: 'OpenAI API connection successful',
          response: test.choices[0].message.content
        })
      };
    } catch (apiError) {
      console.error('OpenAI API Error:', apiError);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'OpenAI API Error',
          details: apiError instanceof Error ? apiError.message : 'Unknown API error'
        })
      };
    }
  } catch (error) {
    console.error('Function Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Function Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

export { handler };



// netlify/functions/chatbot.ts

import { Handler } from '@netlify/functions';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

interface ChatRequestBody {
  userId: string;
  message: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  adviser_id?: string;
}

interface FinancialData {
  goals: any[];
  incomes: any[];
  expenditures: any[];
  assets: any[];
  liabilities: any[];
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_DATABASE_URL!,
  process.env.REACT_APP_SUPABASE_ANON_KEY!
);

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { userId, message } = JSON.parse(event.body || '{}') as ChatRequestBody;

    if (!userId || !message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing userId or message' })
      };
    }

    // Fetch user's profile and financial data
    const [
      profileResult,
      goalsResult,
      incomesResult,
      expendituresResult,
      assetsResult,
      liabilitiesResult
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('goals').select('*').eq('client_id', userId),
      supabase.from('incomes').select('*').eq('client_id', userId),
      supabase.from('expenditures').select('*').eq('client_id', userId),
      supabase.from('assets').select('*').eq('client_id', userId),
      supabase.from('liabilities').select('*').eq('client_id', userId)
    ]);

    if (profileResult.error) {
      throw new Error(`Error fetching profile: ${profileResult.error.message}`);
    }

    const userProfile = profileResult.data as UserProfile;
    
    // Convert null to empty arrays
    const financialData: FinancialData = {
      goals: goalsResult.data || [],
      incomes: incomesResult.data || [],
      expenditures: expendituresResult.data || [],
      assets: assetsResult.data || [],
      liabilities: liabilitiesResult.data || []
    };

    // Calculate financial metrics
    const totalIncome = financialData.incomes.reduce((sum, income) => sum + Number(income.amount), 0);
    const totalExpenses = financialData.expenditures.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const totalAssets = financialData.assets.reduce((sum, asset) => sum + Number(asset.value), 0);
    const totalLiabilities = financialData.liabilities.reduce((sum, liability) => sum + Number(liability.amount), 0);
    const netWorth = totalAssets - totalLiabilities;

    // Create context for the AI based on user's financial data
    const userContext = `
      User Profile: ${JSON.stringify(userProfile)}
      Financial Overview:
      - Goals: ${financialData.goals.length} financial goals set
      - Total Monthly Income: £${totalIncome}
      - Total Monthly Expenses: £${totalExpenses}
      - Net Worth: £${netWorth}
      - Total Assets: £${totalAssets}
      - Total Liabilities: £${totalLiabilities}

      Detailed Goals:
      ${financialData.goals.map(goal => `- ${goal.goal}: £${goal.target_amount} in ${goal.time_horizon} years`).join('\n')}
    `;

    // Generate chat response
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a financial advisor assistant. Your role is to provide helpful financial guidance based on the user's current financial situation. Here's the context about the user:\n${userContext}`
        },
        { role: 'user', content: message }
      ]
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
        response: completion.choices[0].message.content,
        userProfile,
        financialData,
        metrics: {
          totalIncome,
          totalExpenses,
          totalAssets,
          totalLiabilities,
          netWorth
        }
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

export { handler };


// netlify/functions/chat.ts

import { Handler } from '@netlify/functions';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.SUPABASE_DATABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Ensure the handler function is correctly exported and contains all your logic
export const handler: Handler = async (event) => {
  console.log('Function triggered', {
    method: event.httpMethod,
    body: event.body,
    headers: event.headers,
  });

  let message: string | undefined;
  let userId: string | undefined;

  try {
    const body = JSON.parse(event.body || '{}');
    message = body.message;
    userId = body.userId;

    if (!message) {
        console.error('No message provided in the request body.');
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Message is required' }),
      };
    }
    if (!userId) {
        console.error('No userId provided in the request body.');
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'User ID is required' }),
        };
      }

    const { data: profileData, error: profileError } = await supabase
       .from('profiles')
       .select('*')
       .eq('id', userId)
       .single();


       if (profileError || !profileData) {
        console.error('Error fetching user data from Supabase:', profileError);
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'User not found in profiles table' }),
        };
      }
  
      // Fetch additional data if needed, e.g., goals, incomes
      // Example:
      const { data: goals, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .eq('client_id', userId);
  
      if (goalsError) {
        console.error('Error fetching goals data from Supabase:', goalsError);
        // Optional: Return partial data or handle gracefully
      }
  

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful financial advisor assistant.' },
        { role: 'user', content: message },
      ],
    });

    console.log('OpenAI API response:', completion);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Consider setting this to your domain for security
      },
      body: JSON.stringify({
        response: completion.choices[0].message?.content,
        userProfile: profileData, // Include fetched profile data if needed
        userGoals: goals || [],
      }),
    };
  } catch (error: any) {
    console.error('Detailed error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error', details: error.message }),
    };
  }

};

*/ 
