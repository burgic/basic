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