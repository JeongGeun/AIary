import { SimplePushManager } from '../_utils/PushManager';

export const POST = async (request: Request) => {
  // Fetch data from Redis
  const subscriptionData = await request.json();
  const result = await SimplePushManager.addSubscription(subscriptionData);
  console.log('Received body:', subscriptionData);

  // Return the result in the response
  return Response.json(
    { result },
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
};
