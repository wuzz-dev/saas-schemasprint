export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed' })
  }

  const business = request.body ?? {}

  return response.status(202).json({
    status: 'accepted',
    message: 'Stub accepted. Persist this payload to the businesses table with the authenticated user_id.',
    business: {
      id: business.id ?? 'biz_pending',
      name: business.name ?? 'Untitled business',
      updated_at: new Date().toISOString(),
    },
  })
}
