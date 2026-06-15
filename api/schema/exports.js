export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    return response.status(405).json({ error: 'Method not allowed' })
  }

  return response.status(200).json({
    exports: [
      {
        id: 'export_demo',
        business_id: 'biz_demo',
        schema_type: 'LocalBusiness',
        score: 92,
        created_at: new Date().toISOString(),
      },
    ],
    message: 'Stub response. Query schema_exports for the authenticated user in production.',
  })
}
