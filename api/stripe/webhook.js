export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed' })
  }

  const event = request.body ?? {}

  return response.status(200).json({
    received: true,
    event_type: event.type ?? 'stripe.event.stub',
    message:
      'Stub received. Verify the Stripe signature, map customers to users, and update subscriptions in production.',
  })
}
