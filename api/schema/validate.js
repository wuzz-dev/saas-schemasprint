export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed' })
  }

  const { business = {} } = request.body ?? {}
  const checks = [
    {
      id: 'business-name',
      label: 'Business name',
      severity: business.name ? 'pass' : 'error',
      required: true,
    },
    {
      id: 'url',
      label: 'Canonical HTTPS URL',
      severity: /^https:\/\//.test(String(business.url ?? '')) ? 'pass' : 'error',
      required: true,
    },
    {
      id: 'sameas',
      label: 'sameAs entity links',
      severity: Array.isArray(business.sameAs) && business.sameAs.length >= 2 ? 'pass' : 'warning',
      required: false,
    },
  ]

  const score = Math.round((checks.filter((check) => check.severity === 'pass').length / checks.length) * 100)

  return response.status(200).json({
    score,
    checks,
    message: 'Stub response. Replace with the production validator shared by app and API.',
  })
}
