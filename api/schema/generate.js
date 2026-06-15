export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed' })
  }

  const { business = {}, schemaTypes = ['LocalBusiness'] } = request.body ?? {}
  const baseUrl = String(business.url ?? 'https://example.com').replace(/\/$/, '')

  return response.status(200).json({
    schemaTypes,
    jsonld: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': business.category ?? 'LocalBusiness',
          '@id': `${baseUrl}#localbusiness`,
          name: business.name ?? 'Example Local Business',
          url: baseUrl,
          telephone: business.phone ?? '',
          address: business.address ?? {},
        },
      ],
    },
    message: 'Stub response. Replace with shared schema builder and save to schema_exports.',
  })
}
