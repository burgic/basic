// netlify/functions/chat.ts

import { Handler } from '@netlify/functions';
import OpenAI from 'openai';
import { createClient, supabase } from '@supabase/supabase-js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_DATABASE_URL!,
  process.env.REACT_APP_SUPABASE_ANON_KEY!
);

// Ensure the handler function is correctly exported and contains all your logic
export const handler: Handler = async (event) => {
  console.log('Function triggered', {
    method: event.httpMethod,
    body: event.body,
    headers: event.headers,
  });

  try {
    const { message } = JSON.parse(event.body || '{}');

    if (!message) {
        console.error('No message provided in the request body.');
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Message is required' }),
      };
    }

    const { data: userData, error: userError } = await supabase
       .from('users')
       .select('*')
       .eq('id', userId)
       .single();

     if (userError) {
       console.error('Error fetching user data from Supabase:', userError);
       return {
         statusCode: 500,
         body: JSON.stringify({ error: 'Error fetching user data' }),
      };
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
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
        response: completion.choices[0].message.content,
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