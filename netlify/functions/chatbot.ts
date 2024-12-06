
// netlify/functions/chatbot.ts

import { Handler } from '@netlify/functions';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

interface FinancialData {
  incomes: any[];
  expenditures: any[];
  assets: any[];
  liabilities: any[];
  goals: any[];
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_DATABASE_URL!,
  process.env.REACT_APP_SUPABASE_ANON_KEY!
);

const createFinancialSummary = (data: FinancialData) => {
  const totalIncome = data.incomes.reduce((sum, inc) => sum + Number(inc.amount), 0);
  const totalExpenditure = data.expenditures.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const totalAssets = data.assets.reduce((sum, asset) => sum + Number(asset.value), 0);
  const totalLiabilities = data.liabilities.reduce((sum, liability) => sum + Number(liability.amount), 0);
  const netWorth = totalAssets - totalLiabilities;
  const monthlySavings = totalIncome - totalExpenditure;
  
  return `
Financial Summary:
- Monthly Income: £${totalIncome.toFixed(2)}
- Monthly Expenses: £${totalExpenditure.toFixed(2)}
- Monthly Savings Potential: £${monthlySavings.toFixed(2)}
- Total Assets: £${totalAssets.toFixed(2)}
- Total Liabilities: £${totalLiabilities.toFixed(2)}
- Net Worth: £${netWorth.toFixed(2)}

Goals:
${data.goals.map(goal => `- ${goal.goal}: £${goal.target_amount} in ${goal.time_horizon} years`).join('\n')}

Income Sources:
${data.incomes.map(income => `- ${income.type}: £${income.amount} ${income.frequency}`).join('\n')}

Major Expenses:
${data.expenditures.map(exp => `- ${exp.category}: £${exp.amount} ${exp.frequency}`).join('\n')}

Assets:
${data.assets.map(asset => `- ${asset.type}: £${asset.value} (${asset.description})`).join('\n')}

Liabilities:
${data.liabilities.map(liability => `- ${liability.type}: £${liability.amount} at ${liability.interest_rate}% interest`).join('\n')}
`;
};

const systemPrompt = `You are a helpful financial advisor assistant. You have access to the user's financial data and should use this information to provide personalized advice. When providing advice:
- Reference specific numbers from their financial data
- Make personalized recommendations based on their current situation
- Consider their goals when providing advice
- Be specific and actionable
- Use their actual income, expenses, and goals in examples
- Explain how their current financial position relates to their goals
- Provide practical steps they can take based on their specific situation`;

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { message, userId, messageHistory = [] } = JSON.parse(event.body || '{}');
    
    if (!message || !userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Message and userId are required' })
      };
    }

    // Fetch user's financial data
    const [
      { data: incomes, error: incomesError },
      { data: expenditures, error: expendituresError },
      { data: assets, error: assetsError },
      { data: liabilities, error: liabilitiesError },
      { data: goals, error: goalsError }
    ] = await Promise.all([
      supabase.from('incomes').select('*').eq('client_id', userId),
      supabase.from('expenditures').select('*').eq('client_id', userId),
      supabase.from('assets').select('*').eq('client_id', userId),
      supabase.from('liabilities').select('*').eq('client_id', userId),
      supabase.from('goals').select('*').eq('client_id', userId)
    ]);

    if (incomesError || expendituresError || assetsError || liabilitiesError || goalsError) {
      throw new Error('Error fetching financial data');
    }

    const financialData: FinancialData = {
      incomes: incomes || [],
      expenditures: expenditures || [],
      assets: assets || [],
      liabilities: liabilities || [],
      goals: goals || []
    };

    const financialSummary = createFinancialSummary(financialData);

    // Construct messages array with history and financial context
    const messages = [
      { 
        role: "system", 
        content: `${systemPrompt}\n\nCurrent Financial Information:\n${financialSummary}` 
      },
      ...messageHistory,
      { role: "user", content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-16k",
      messages: messages,
      temperature: 0.7,
      max_tokens: 1500,
      presence_penalty: 0.6,
      frequency_penalty: 0.4
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
        response: completion.choices[0].message.content
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

/*
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