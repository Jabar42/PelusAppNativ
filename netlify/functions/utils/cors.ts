import { HandlerResponse } from '@netlify/functions';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

export const handleOptions = (): HandlerResponse => ({
  statusCode: 204,
  headers: corsHeaders,
  body: '',
});

export const withCors = (response: HandlerResponse): HandlerResponse => ({
  ...response,
  headers: {
    ...corsHeaders,
    ...response.headers,
  },
});


