import { Handler } from '@netlify/functions';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_DATABASE_URL!,
  process.env.REACT_APP_SUPABASE_ANON_KEY!
);

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { userId, message } = JSON.parse(event.body || '{}');

    // Validate input
    if (!userId || !message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing userId or message' })
      };
    }

    // Get user data from Supabase
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) {
      throw new Error(`Error fetching user data: ${userError.message}`);
    }

    // Generate chat completion
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a helpful financial advisor assistant. Focus on providing guidance about financial planning and wealth management."
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 500
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
        response: completion.choices[0].message.content
      })
    };

  } catch (error: any) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};