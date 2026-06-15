import {
  ArrowDownToLine,
  BadgeCheck,
  Building2,
  Check,
  ChevronRight,
  Clipboard,
  Copy,
  CreditCard,
  Download,
  ExternalLink,
  FileJson,
  Gauge,
  Layers3,
  Lock,
  LogOut,
  MapPin,
  Moon,
  Plus,
  Rocket,
  SearchCheck,
  Settings2,
  ShieldCheck,
  Sun,
  Wand2,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import './App.css'

type Plan = 'free' | 'pro' | 'agency'

type AppView = 'marketing' | 'studio'

type StudioTab = 'dashboard' | 'profile' | 'generator' | 'validation' | 'exports' | 'pricing'

type SchemaKind =
  | 'LocalBusiness'
  | 'Service'
  | 'FAQPage'
  | 'Review'
  | 'Product'
  | 'BreadcrumbList'

type Severity = 'pass' | 'warning' | 'error'

type UserProfile = {
  id: string
  email: string
  plan: Plan
  agencyName: string
  createdAt: string
}

type Address = {
  street: string
  locality: string
  region: string
  postalCode: string
  country: string
}

type Geo = {
  latitude: string
  longitude: string
}

type OpeningHour = {
  day: string
  opens: string
  closes: string
  closed: boolean
}

type ServiceItem = {
  id: string
  name: string
  description: string
  areaServed: string
  priceRange: string
}

type FaqItem = {
  id: string
  question: string
  answer: string
}

type ReviewItem = {
  id: string
  author: string
  rating: number
  body: string
  datePublished: string
}

type ProductItem = {
  id: string
  name: string
  description: string
  price: string
  currency: string
  availability: string
}

type BusinessProfile = {
  id: string
  name: string
  url: string
  phone: string
  email: string
  description: string
  category: string
  priceRange: string
  image: string
  address: Address
  geo: Geo
  openingHours: OpeningHour[]
  sameAs: string[]
  services: ServiceItem[]
  faqs: FaqItem[]
  reviews: ReviewItem[]
  products: ProductItem[]
}

type ValidationItem = {
  id: string
  label: string
  detail: string
  severity: Severity
  required: boolean
}

type SchemaExport = {
  id: string
  businessId: string
  schemaTypes: SchemaKind[]
  score: number
  createdAt: string
  jsonld: string
}

type JsonLdNode = Record<string, unknown>

type GeneratedBundle = {
  '@context': 'https://schema.org'
  '@graph': JsonLdNode[]
}

const storageKeys = {
  user: 'schemasprint:user',
  business: 'schemasprint:business',
  exports: 'schemasprint:exports',
  selectedSchemas: 'schemasprint:selectedSchemas',
  theme: 'schemasprint:theme',
}

const schemaKinds: SchemaKind[] = [
  'LocalBusiness',
  'Service',
  'FAQPage',
  'Review',
  'Product',
  'BreadcrumbList',
]

const schemaCopy: Record<SchemaKind, { label: string; description: string }> = {
  LocalBusiness: {
    label: 'LocalBusiness',
    description: 'NAP, geo, hours, sameAs links, services, and aggregate rating.',
  },
  Service: {
    label: 'Service',
    description: 'Local service pages with area served and offer details.',
  },
  FAQPage: {
    label: 'FAQPage',
    description: 'Question-and-answer markup for high-intent local searches.',
  },
  Review: {
    label: 'Review',
    description: 'First-party review snippets attached to the local entity.',
  },
  Product: {
    label: 'Product',
    description: 'Retail, package, or membership offers with price and stock state.',
  },
  BreadcrumbList: {
    label: 'BreadcrumbList',
    description: 'A crawl-friendly path back to home, services, and the active page.',
  },
}

const planAccess: Record<Plan, SchemaKind[]> = {
  free: ['LocalBusiness', 'FAQPage'],
  pro: ['LocalBusiness', 'Service', 'FAQPage', 'Review', 'Product', 'BreadcrumbList'],
  agency: ['LocalBusiness', 'Service', 'FAQPage', 'Review', 'Product', 'BreadcrumbList'],
}

const planDetails: Record<
  Plan,
  { name: string; price: string; short: string; limit: string; features: string[] }
> = {
  free: {
    name: 'Free',
    price: '$0',
    short: 'For one schema check before publishing.',
    limit: '1 location, 2 schema types',
    features: ['LocalBusiness + FAQPage', 'Basic validation checklist', 'Copy JSON-LD exports'],
  },
  pro: {
    name: 'Pro',
    price: '$12',
    short: 'For owners who manage their own local SEO.',
    limit: '1 location, full schema pack',
    features: ['All schema generators', 'Downloadable JSON exports', 'Implementation handoff note'],
  },
  agency: {
    name: 'Agency',
    price: '$39',
    short: 'For teams shipping schema packs for clients.',
    limit: 'Multi-location workspace',
    features: ['Client handoff templates', 'Multi-location placeholders', 'Priority export history'],
  },
}

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const seedBusiness: BusinessProfile = {
  id: 'biz_sunrise_dental',
  name: 'Sunrise Dental Studio',
  url: 'https://www.sunrisedentalstudio.com/services/cosmetic-dentistry',
  phone: '+1-415-555-0198',
  email: 'hello@sunrisedentalstudio.com',
  description:
    'A neighborhood dental studio in San Francisco focused on family care, cosmetic dentistry, and calm same-day emergency appointments.',
  category: 'Dentist',
  priceRange: '$$',
  image: 'https://www.sunrisedentalstudio.com/clinic-front.jpg',
  address: {
    street: '2188 Market Street',
    locality: 'San Francisco',
    region: 'CA',
    postalCode: '94114',
    country: 'US',
  },
  geo: {
    latitude: '37.7665',
    longitude: '-122.4294',
  },
  openingHours: [
    { day: 'Monday', opens: '08:00', closes: '17:30', closed: false },
    { day: 'Tuesday', opens: '08:00', closes: '17:30', closed: false },
    { day: 'Wednesday', opens: '08:00', closes: '17:30', closed: false },
    { day: 'Thursday', opens: '09:00', closes: '18:00', closed: false },
    { day: 'Friday', opens: '08:00', closes: '15:00', closed: false },
    { day: 'Saturday', opens: '09:00', closes: '13:00', closed: false },
    { day: 'Sunday', opens: '00:00', closes: '00:00', closed: true },
  ],
  sameAs: [
    'https://www.google.com/maps?cid=178221899891',
    'https://www.instagram.com/sunrisedentalstudio',
    'https://www.facebook.com/sunrisedentalstudio',
  ],
  services: [
    {
      id: 'srv_cosmetic',
      name: 'Cosmetic dentistry',
      description: 'Smile design, whitening, bonding, veneers, and natural-looking restorative work.',
      areaServed: 'San Francisco, Castro, Mission Dolores',
      priceRange: '$$',
    },
    {
      id: 'srv_emergency',
      name: 'Same-day emergency dental care',
      description: 'Urgent appointments for tooth pain, cracked teeth, lost crowns, and swelling.',
      areaServed: 'San Francisco',
      priceRange: '$$$',
    },
  ],
  faqs: [
    {
      id: 'faq_insurance',
      question: 'Do you accept PPO dental insurance?',
      answer:
        'Yes. Sunrise Dental Studio works with most PPO plans and provides a benefits estimate before treatment starts.',
    },
    {
      id: 'faq_emergency',
      question: 'Can I book a same-day emergency appointment?',
      answer:
        'Same-day emergency appointments are reserved each weekday for pain, chipped teeth, swelling, and lost restorations.',
    },
    {
      id: 'faq_parking',
      question: 'Is parking available near the studio?',
      answer:
        'Street parking and public garages are available nearby, and the clinic is two blocks from Muni stops.',
    },
  ],
  reviews: [
    {
      id: 'rev_maya',
      author: 'Maya L.',
      rating: 5,
      body:
        'The team explained every step and made a chipped-tooth repair feel easy. The result looks completely natural.',
      datePublished: '2026-03-12',
    },
    {
      id: 'rev_jonathan',
      author: 'Jonathan P.',
      rating: 5,
      body:
        'I found them through Maps during a dental emergency. They fit me in the same morning and fixed the issue.',
      datePublished: '2026-04-21',
    },
  ],
  products: [
    {
      id: 'prd_whitening',
      name: 'Professional whitening kit',
      description: 'Custom whitening trays and supervised refill gel for at-home brightening.',
      price: '249',
      currency: 'USD',
      availability: 'https://schema.org/InStock',
    },
  ],
}

function getBusinessId(profile: BusinessProfile) {
  return `${profile.url.replace(/\/$/, '')}#localbusiness`
}

function getServiceId(profile: BusinessProfile, service: ServiceItem) {
  return `${profile.url.replace(/\/$/, '')}#service-${service.id}`
}

function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeStored<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

function averageRating(reviews: ReviewItem[]) {
  if (!reviews.length) {
    return 0
  }
  return Number((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1))
}

function hasValue(value: string) {
  return value.trim().length > 0
}

function isHttpsUrl(value: string) {
  return /^https:\/\/[^\s]+$/i.test(value.trim())
}

function normalizePathLabel(part: string) {
  return part
    .split('-')
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(' ')
}

function buildOpeningHours(hours: OpeningHour[]) {
  return hours
    .filter((hour) => !hour.closed)
    .map((hour) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: `https://schema.org/${hour.day}`,
      opens: hour.opens,
      closes: hour.closes,
    }))
}

function buildLocalBusiness(profile: BusinessProfile): JsonLdNode {
  const rating = averageRating(profile.reviews)

  return {
    '@type': profile.category || 'LocalBusiness',
    '@id': getBusinessId(profile),
    name: profile.name,
    url: profile.url,
    telephone: profile.phone,
    email: profile.email,
    image: profile.image,
    description: profile.description,
    priceRange: profile.priceRange,
    address: {
      '@type': 'PostalAddress',
      streetAddress: profile.address.street,
      addressLocality: profile.address.locality,
      addressRegion: profile.address.region,
      postalCode: profile.address.postalCode,
      addressCountry: profile.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: profile.geo.latitude,
      longitude: profile.geo.longitude,
    },
    openingHoursSpecification: buildOpeningHours(profile.openingHours),
    sameAs: profile.sameAs.filter(Boolean),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `${profile.name} services`,
      itemListElement: profile.services.map((service) => ({
        '@type': 'Offer',
        itemOffered: { '@id': getServiceId(profile, service) },
      })),
    },
    ...(rating
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: rating,
            reviewCount: profile.reviews.length,
          },
        }
      : {}),
  }
}

function buildServices(profile: BusinessProfile): JsonLdNode[] {
  return profile.services.map((service) => ({
    '@type': 'Service',
    '@id': getServiceId(profile, service),
    name: service.name,
    description: service.description,
    areaServed: service.areaServed,
    provider: { '@id': getBusinessId(profile) },
    offers: {
      '@type': 'Offer',
      priceSpecification: {
        '@type': 'PriceSpecification',
        priceCurrency: 'USD',
        price: service.priceRange,
      },
    },
  }))
}

function buildFaq(profile: BusinessProfile): JsonLdNode {
  return {
    '@type': 'FAQPage',
    '@id': `${profile.url.replace(/\/$/, '')}#faq`,
    mainEntity: profile.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

function buildReviews(profile: BusinessProfile): JsonLdNode[] {
  return profile.reviews.map((review) => ({
    '@type': 'Review',
    '@id': `${profile.url.replace(/\/$/, '')}#review-${review.id}`,
    itemReviewed: { '@id': getBusinessId(profile) },
    author: {
      '@type': 'Person',
      name: review.author,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating,
      bestRating: 5,
    },
    reviewBody: review.body,
    datePublished: review.datePublished,
  }))
}

function buildProducts(profile: BusinessProfile): JsonLdNode[] {
  return profile.products.map((product) => ({
    '@type': 'Product',
    '@id': `${profile.url.replace(/\/$/, '')}#product-${product.id}`,
    name: product.name,
    description: product.description,
    brand: {
      '@type': 'Brand',
      name: profile.name,
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency,
      availability: product.availability,
      url: profile.url,
    },
  }))
}

function buildBreadcrumb(profile: BusinessProfile): JsonLdNode {
  const url = new URL(profile.url)
  const parts = url.pathname.split('/').filter(Boolean)
  const items = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: `${url.origin}/`,
    },
    ...parts.map((part, index) => ({
      '@type': 'ListItem',
      position: index + 2,
      name: normalizePathLabel(part),
      item: `${url.origin}/${parts.slice(0, index + 1).join('/')}`,
    })),
  ]

  return {
    '@type': 'BreadcrumbList',
    '@id': `${profile.url.replace(/\/$/, '')}#breadcrumb`,
    itemListElement: items,
  }
}

function generateSchemaBundle(profile: BusinessProfile, kinds: SchemaKind[]): GeneratedBundle {
  const graph = kinds.flatMap((kind) => {
    if (kind === 'LocalBusiness') return [buildLocalBusiness(profile)]
    if (kind === 'Service') return buildServices(profile)
    if (kind === 'FAQPage') return [buildFaq(profile)]
    if (kind === 'Review') return buildReviews(profile)
    if (kind === 'Product') return buildProducts(profile)
    if (kind === 'BreadcrumbList') return [buildBreadcrumb(profile)]
    return []
  })

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  }
}

function validateBusiness(profile: BusinessProfile): ValidationItem[] {
  const serviceAreaMatches = profile.services.every((service) =>
    service.areaServed.toLowerCase().includes(profile.address.locality.toLowerCase()),
  )
  const visibleHours = profile.openingHours.filter((hour) => !hour.closed)
  const reviewDatesValid = profile.reviews.every((review) => /^\d{4}-\d{2}-\d{2}$/.test(review.datePublished))

  const checks: Array<{
    id: string
    label: string
    detail: string
    ok: boolean
    required: boolean
    warning?: boolean
  }> = [
    {
      id: 'business-name',
      label: 'Business name',
      detail: 'Legal or public-facing business name is present.',
      ok: hasValue(profile.name),
      required: true,
    },
    {
      id: 'url',
      label: 'Canonical HTTPS URL',
      detail: 'Homepage or service URL uses HTTPS and can anchor @id values.',
      ok: isHttpsUrl(profile.url),
      required: true,
    },
    {
      id: 'phone',
      label: 'NAP phone',
      detail: 'Phone number is populated for local entity reconciliation.',
      ok: hasValue(profile.phone),
      required: true,
    },
    {
      id: 'address',
      label: 'Postal address',
      detail: 'Street, city, region, postal code, and country are complete.',
      ok:
        hasValue(profile.address.street) &&
        hasValue(profile.address.locality) &&
        hasValue(profile.address.region) &&
        hasValue(profile.address.postalCode) &&
        hasValue(profile.address.country),
      required: true,
    },
    {
      id: 'geo',
      label: 'Geo coordinates',
      detail: 'Latitude and longitude are included for local discovery surfaces.',
      ok: hasValue(profile.geo.latitude) && hasValue(profile.geo.longitude),
      required: false,
    },
    {
      id: 'hours',
      label: 'Opening hours',
      detail: 'At least five visible opening-hour rows are ready for JSON-LD.',
      ok: visibleHours.length >= 5,
      required: false,
    },
    {
      id: 'services',
      label: 'Service catalog',
      detail: 'One or more services include descriptions and areas served.',
      ok:
        profile.services.length > 0 &&
        profile.services.every(
          (service) => hasValue(service.name) && hasValue(service.description) && hasValue(service.areaServed),
        ),
      required: true,
    },
    {
      id: 'sameas',
      label: 'sameAs entity links',
      detail: 'Two or more profile links support local entity matching.',
      ok: profile.sameAs.filter(hasValue).length >= 2,
      required: false,
    },
    {
      id: 'faqs',
      label: 'FAQ coverage',
      detail: 'Two or more FAQ entries are ready for FAQPage markup.',
      ok: profile.faqs.length >= 2 && profile.faqs.every((faq) => hasValue(faq.question) && hasValue(faq.answer)),
      required: false,
    },
    {
      id: 'reviews',
      label: 'Review formatting',
      detail: 'Reviews include author, rating, body, and ISO publication dates.',
      ok:
        profile.reviews.length > 0 &&
        profile.reviews.every(
          (review) =>
            hasValue(review.author) &&
            hasValue(review.body) &&
            review.rating >= 1 &&
            review.rating <= 5 &&
            hasValue(review.datePublished),
        ) &&
        reviewDatesValid,
      required: false,
    },
    {
      id: 'area-consistency',
      label: 'Area consistency',
      detail: 'Every service area references the business city or nearby market.',
      ok: serviceAreaMatches,
      required: false,
      warning: true,
    },
    {
      id: 'image',
      label: 'Business image',
      detail: 'A public image URL helps rich-result and AI-search previews.',
      ok: isHttpsUrl(profile.image),
      required: false,
      warning: true,
    },
  ]

  return checks.map((check) => ({
    id: check.id,
    label: check.label,
    detail: check.detail,
    required: check.required,
    severity: check.ok ? 'pass' : check.required || !check.warning ? 'error' : 'warning',
  }))
}

function calculateScore(items: ValidationItem[]) {
  const possible = items.reduce((sum, item) => sum + (item.required ? 12 : 8), 0)
  const earned = items.reduce((sum, item) => {
    if (item.severity === 'pass') return sum + (item.required ? 12 : 8)
    if (item.severity === 'warning') return sum + 3
    return sum
  }, 0)

  return Math.round((earned / possible) * 100)
}

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))
}

function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text)
  }

  const textArea = document.createElement('textarea')
  textArea.value = text
  textArea.style.position = 'fixed'
  textArea.style.opacity = '0'
  document.body.appendChild(textArea)
  textArea.select()
  document.execCommand('copy')
  document.body.removeChild(textArea)
  return Promise.resolve()
}

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: 'application/ld+json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => readStored(storageKeys.theme, 'light'))
  const [view, setView] = useState<AppView>('marketing')
  const [activeTab, setActiveTab] = useState<StudioTab>('dashboard')
  const [user, setUser] = useState<UserProfile | null>(() => readStored<UserProfile | null>(storageKeys.user, null))
  const [business, setBusiness] = useState<BusinessProfile>(() => readStored(storageKeys.business, seedBusiness))
  const [exports, setExports] = useState<SchemaExport[]>(() => readStored<SchemaExport[]>(storageKeys.exports, []))
  const [selectedSchemas, setSelectedSchemas] = useState<SchemaKind[]>(() =>
    readStored<SchemaKind[]>(storageKeys.selectedSchemas, ['LocalBusiness', 'Service', 'FAQPage']),
  )
  const [authEmail, setAuthEmail] = useState('owner@sunrisedentalstudio.com')
  const [copyState, setCopyState] = useState('')

  const plan = user?.plan ?? 'free'
  const validationItems = useMemo(() => validateBusiness(business), [business])
  const score = useMemo(() => calculateScore(validationItems), [validationItems])
  const warnings = validationItems.filter((item) => item.severity !== 'pass')
  const allowedSchemas = planAccess[plan]
  const activeSchemas = selectedSchemas.filter((schema) => allowedSchemas.includes(schema))
  const generatedBundle = useMemo(
    () => generateSchemaBundle(business, activeSchemas.length ? activeSchemas : ['LocalBusiness']),
    [business, activeSchemas],
  )
  const jsonOutput = useMemo(() => JSON.stringify(generatedBundle, null, 2), [generatedBundle])
  const clientNote = useMemo(
    () =>
      [
        `SchemaSprint handoff for ${business.name}`,
        '',
        `Completeness score: ${score}/100`,
        `Generated schema types: ${activeSchemas.join(', ') || 'LocalBusiness'}`,
        '',
        'Install instructions:',
        '1. Paste the JSON-LD block into the <head> of the matching page or inject it with your tag manager.',
        '2. Keep the business profile synchronized with Google Business Profile, website footer, and citation listings.',
        '3. Re-run validation after publishing and whenever services, hours, address, or reviews change.',
        '',
        warnings.length
          ? `Open items: ${warnings.map((item) => item.label).join(', ')}.`
          : 'No open validation items in the current profile.',
      ].join('\n'),
    [activeSchemas, business.name, score, warnings],
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    writeStored(storageKeys.theme, theme)
  }, [theme])

  useEffect(() => {
    if (user) {
      writeStored(storageKeys.user, user)
    } else {
      localStorage.removeItem(storageKeys.user)
    }
  }, [user])

  useEffect(() => writeStored(storageKeys.business, business), [business])
  useEffect(() => writeStored(storageKeys.exports, exports), [exports])
  useEffect(() => writeStored(storageKeys.selectedSchemas, selectedSchemas), [selectedSchemas])

  function authenticate(email = authEmail) {
    const cleanEmail = email.trim() || 'owner@sunrisedentalstudio.com'
    setUser({
      id: 'usr_demo_schema',
      email: cleanEmail,
      plan: user?.plan ?? 'free',
      agencyName: cleanEmail.includes('agency') ? 'Northstar Local SEO' : 'Sunrise Growth Desk',
      createdAt: new Date().toISOString(),
    })
    setView('studio')
    setActiveTab('dashboard')
  }

  function logout() {
    setUser(null)
    setView('marketing')
  }

  function updatePlan(nextPlan: Plan) {
    if (!user) {
      authenticate()
      setUser((current) => (current ? { ...current, plan: nextPlan } : current))
      return
    }
    setUser({ ...user, plan: nextPlan })
    setActiveTab('generator')
    setView('studio')
  }

  function updateBusinessField<K extends keyof BusinessProfile>(key: K, value: BusinessProfile[K]) {
    setBusiness((current) => ({ ...current, [key]: value }))
  }

  function updateAddressField<K extends keyof Address>(key: K, value: Address[K]) {
    setBusiness((current) => ({ ...current, address: { ...current.address, [key]: value } }))
  }

  function updateGeoField<K extends keyof Geo>(key: K, value: Geo[K]) {
    setBusiness((current) => ({ ...current, geo: { ...current.geo, [key]: value } }))
  }

  function updateHour(index: number, patch: Partial<OpeningHour>) {
    setBusiness((current) => ({
      ...current,
      openingHours: current.openingHours.map((hour, hourIndex) =>
        hourIndex === index ? { ...hour, ...patch } : hour,
      ),
    }))
  }

  function addService() {
    setBusiness((current) => ({
      ...current,
      services: [
        ...current.services,
        {
          id: makeId('srv'),
          name: 'New local service',
          description: 'Describe the service in plain language for search and assistants.',
          areaServed: current.address.locality,
          priceRange: '$$',
        },
      ],
    }))
  }

  function updateService(id: string, patch: Partial<ServiceItem>) {
    setBusiness((current) => ({
      ...current,
      services: current.services.map((service) => (service.id === id ? { ...service, ...patch } : service)),
    }))
  }

  function removeService(id: string) {
    setBusiness((current) => ({ ...current, services: current.services.filter((service) => service.id !== id) }))
  }

  function addFaq() {
    setBusiness((current) => ({
      ...current,
      faqs: [
        ...current.faqs,
        {
          id: makeId('faq'),
          question: 'What should customers know before booking?',
          answer: 'Add a concise answer that matches the page copy and customer intent.',
        },
      ],
    }))
  }

  function updateFaq(id: string, patch: Partial<FaqItem>) {
    setBusiness((current) => ({
      ...current,
      faqs: current.faqs.map((faq) => (faq.id === id ? { ...faq, ...patch } : faq)),
    }))
  }

  function removeFaq(id: string) {
    setBusiness((current) => ({ ...current, faqs: current.faqs.filter((faq) => faq.id !== id) }))
  }

  function addReview() {
    setBusiness((current) => ({
      ...current,
      reviews: [
        ...current.reviews,
        {
          id: makeId('rev'),
          author: 'New customer',
          rating: 5,
          body: 'Add a short first-party review excerpt that is visible on the page.',
          datePublished: new Date().toISOString().slice(0, 10),
        },
      ],
    }))
  }

  function updateReview(id: string, patch: Partial<ReviewItem>) {
    setBusiness((current) => ({
      ...current,
      reviews: current.reviews.map((review) => (review.id === id ? { ...review, ...patch } : review)),
    }))
  }

  function removeReview(id: string) {
    setBusiness((current) => ({ ...current, reviews: current.reviews.filter((review) => review.id !== id) }))
  }

  function updateSameAs(index: number, value: string) {
    setBusiness((current) => ({
      ...current,
      sameAs: current.sameAs.map((link, linkIndex) => (linkIndex === index ? value : link)),
    }))
  }

  function addSameAs() {
    setBusiness((current) => ({ ...current, sameAs: [...current.sameAs, 'https://'] }))
  }

  function removeSameAs(index: number) {
    setBusiness((current) => ({
      ...current,
      sameAs: current.sameAs.filter((_, linkIndex) => linkIndex !== index),
    }))
  }

  function toggleSchema(kind: SchemaKind) {
    setSelectedSchemas((current) => {
      if (current.includes(kind)) {
        return current.filter((schema) => schema !== kind)
      }
      return [...current, kind]
    })
  }

  async function handleCopy(text: string, label: string) {
    await copyText(text)
    setCopyState(label)
    window.setTimeout(() => setCopyState(''), 1800)
  }

  function saveExport() {
    const exportRecord: SchemaExport = {
      id: makeId('export'),
      businessId: business.id,
      schemaTypes: activeSchemas.length ? activeSchemas : ['LocalBusiness'],
      score,
      createdAt: new Date().toISOString(),
      jsonld: jsonOutput,
    }
    setExports((current) => [exportRecord, ...current].slice(0, 12))
    setCopyState('Export saved')
    window.setTimeout(() => setCopyState(''), 1800)
  }

  const navItems: Array<{ id: StudioTab; label: string; icon: typeof Gauge }> = [
    { id: 'dashboard', label: 'Dashboard', icon: Gauge },
    { id: 'profile', label: 'Profile', icon: Building2 },
    { id: 'generator', label: 'Generator', icon: FileJson },
    { id: 'validation', label: 'Validation', icon: SearchCheck },
    { id: 'exports', label: 'Exports', icon: ArrowDownToLine },
    { id: 'pricing', label: 'Pricing', icon: CreditCard },
  ]

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" type="button" onClick={() => setView('marketing')} aria-label="SchemaSprint home">
          <span className="brand-mark">
            <Layers3 size={20} />
          </span>
          <span>
            SchemaSprint
            <small>Local schema studio</small>
          </span>
        </button>

        <nav className="topnav" aria-label="Main navigation">
          <button className={view === 'marketing' ? 'active' : ''} type="button" onClick={() => setView('marketing')}>
            Marketing
          </button>
          <button className={view === 'studio' ? 'active' : ''} type="button" onClick={() => setView('studio')}>
            Studio
          </button>
          <button
            type="button"
            onClick={() => {
              setView('studio')
              setActiveTab('pricing')
            }}
          >
            Pricing
          </button>
        </nav>

        <div className="top-actions">
          <button className="icon-button" type="button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            <span className="sr-only">Toggle theme</span>
          </button>
          {user ? (
            <div className="user-chip">
              <span>{user.email}</span>
              <strong>{planDetails[user.plan].name}</strong>
              <button className="icon-button subtle" type="button" onClick={logout}>
                <LogOut size={16} />
                <span className="sr-only">Log out</span>
              </button>
            </div>
          ) : (
            <button className="button primary compact" type="button" onClick={() => authenticate()}>
              <ShieldCheck size={16} />
              Demo login
            </button>
          )}
        </div>
      </header>

      {view === 'marketing' ? (
        <MarketingPage
          score={score}
          warnings={warnings.length}
          onStart={() => authenticate()}
          onOpenStudio={() => {
            setView('studio')
            setActiveTab('dashboard')
          }}
          onPlan={updatePlan}
        />
      ) : (
        <main className="studio-layout">
          <aside className="sidebar">
            <div className="sidebar-head">
              <span>Studio</span>
              <strong>{business.name}</strong>
            </div>
            <div className="plan-meter">
              <span>{planDetails[plan].name} plan</span>
              <strong>{planDetails[plan].limit}</strong>
            </div>
            <nav className="side-nav" aria-label="Schema studio">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    className={activeTab === item.id ? 'active' : ''}
                    type="button"
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                  >
                    <Icon size={18} />
                    {item.label}
                  </button>
                )
              })}
            </nav>
            <div className="locked-callout">
              <Lock size={17} />
              <span>Multi-location workspaces unlock on Agency.</span>
              <button type="button" onClick={() => updatePlan('agency')}>
                Preview
              </button>
            </div>
          </aside>

          <section className="studio-main">
            {!user ? (
              <AuthGate authEmail={authEmail} setAuthEmail={setAuthEmail} authenticate={authenticate} />
            ) : (
              <>
                <div className="studio-header">
                  <div>
                    <span className="eyebrow">Schema studio</span>
                    <h1>{tabTitle(activeTab)}</h1>
                  </div>
                  <div className="studio-actions">
                    <button className="button secondary" type="button" onClick={() => setActiveTab('validation')}>
                      <SearchCheck size={17} />
                      Audit
                    </button>
                    <button className="button primary" type="button" onClick={saveExport}>
                      <ArrowDownToLine size={17} />
                      Save export
                    </button>
                  </div>
                </div>

                {copyState ? <div className="toast">{copyState}</div> : null}

                {activeTab === 'dashboard' && (
                  <Dashboard
                    score={score}
                    warnings={warnings}
                    generatedCount={generatedBundle['@graph'].length}
                    exportCount={exports.length}
                    business={business}
                    selectedSchemas={activeSchemas}
                    setActiveTab={setActiveTab}
                  />
                )}

                {activeTab === 'profile' && (
                  <ProfileForm
                    business={business}
                    updateBusinessField={updateBusinessField}
                    updateAddressField={updateAddressField}
                    updateGeoField={updateGeoField}
                    updateHour={updateHour}
                    addService={addService}
                    updateService={updateService}
                    removeService={removeService}
                    addFaq={addFaq}
                    updateFaq={updateFaq}
                    removeFaq={removeFaq}
                    addReview={addReview}
                    updateReview={updateReview}
                    removeReview={removeReview}
                    updateSameAs={updateSameAs}
                    addSameAs={addSameAs}
                    removeSameAs={removeSameAs}
                  />
                )}

                {activeTab === 'generator' && (
                  <GeneratorPanel
                    plan={plan}
                    selectedSchemas={selectedSchemas}
                    allowedSchemas={allowedSchemas}
                    toggleSchema={toggleSchema}
                    jsonOutput={jsonOutput}
                    graphCount={generatedBundle['@graph'].length}
                    updatePlan={updatePlan}
                    onCopy={() => handleCopy(jsonOutput, 'JSON-LD copied')}
                    onDownload={() => downloadText(`${business.name.toLowerCase().replaceAll(' ', '-')}-schema.json`, jsonOutput)}
                  />
                )}

                {activeTab === 'validation' && (
                  <ValidationPanel items={validationItems} score={score} setActiveTab={setActiveTab} />
                )}

                {activeTab === 'exports' && (
                  <ExportCenter
                  business={business}
                  exports={exports}
                  clientNote={clientNote}
                  activeSchemas={activeSchemas}
                    onCopyJson={() => handleCopy(jsonOutput, 'JSON-LD copied')}
                    onCopyNote={() => handleCopy(clientNote, 'Handoff note copied')}
                    onDownload={() => downloadText(`${business.name.toLowerCase().replaceAll(' ', '-')}-schema.json`, jsonOutput)}
                    onSave={saveExport}
                  />
                )}

                {activeTab === 'pricing' && <PricingPanel currentPlan={plan} updatePlan={updatePlan} />}
              </>
            )}
          </section>
        </main>
      )}
    </div>
  )
}

function tabTitle(tab: StudioTab) {
  const titles: Record<StudioTab, string> = {
    dashboard: 'Schema cockpit',
    profile: 'Business profile',
    generator: 'JSON-LD generator',
    validation: 'Validation checklist',
    exports: 'Export center',
    pricing: 'Pricing and gates',
  }
  return titles[tab]
}

function MarketingPage({
  score,
  warnings,
  onStart,
  onOpenStudio,
  onPlan,
}: {
  score: number
  warnings: number
  onStart: () => void
  onOpenStudio: () => void
  onPlan: (plan: Plan) => void
}) {
  const features = [
    {
      icon: Building2,
      title: 'Business profile',
      text: 'One structured workspace for NAP, geo, hours, services, sameAs links, FAQs, and reviews.',
    },
    {
      icon: Wand2,
      title: 'Schema pack generator',
      text: 'Generate LocalBusiness, Service, FAQPage, Review, Product, and BreadcrumbList JSON-LD.',
    },
    {
      icon: SearchCheck,
      title: 'Validation checklist',
      text: 'Catch missing fields, thin content, and local entity inconsistencies before handoff.',
    },
    {
      icon: ArrowDownToLine,
      title: 'Client exports',
      text: 'Copy, download, save, and hand off implementation notes from one calm export center.',
    },
  ]

  return (
    <main>
      <section className="hero-section">
        <div className="hero-visual" aria-hidden="true">
          <div className="schema-lines">
            <span>{`"@type": "Dentist"`}</span>
            <span>{`"geo": { "latitude": "37.7665" }`}</span>
            <span>{`"sameAs": ["Google", "Instagram"]`}</span>
            <span>{`"FAQPage": 3 questions`}</span>
          </div>
          <div className="schema-radar">
            <div>
              <strong>{score}</strong>
              <span>score</span>
            </div>
            <div>
              <strong>{warnings}</strong>
              <span>open items</span>
            </div>
            <div>
              <strong>6</strong>
              <span>schema types</span>
            </div>
          </div>
        </div>

        <div className="hero-content">
          <span className="eyebrow">Local SEO schema studio</span>
          <h1>Ship validated JSON-LD packs for local businesses in one sprint.</h1>
          <p>
            SchemaSprint turns business profiles into structured data, validation notes, and implementation-ready
            exports for owners and micro-agencies.
          </p>
          <div className="hero-actions">
            <button className="button primary" type="button" onClick={onStart}>
              <Rocket size={18} />
              Open demo studio
            </button>
            <button className="button secondary" type="button" onClick={onOpenStudio}>
              <Gauge size={18} />
              View dashboard
            </button>
          </div>
        </div>
      </section>

      <section className="trust-strip">
        <span>Built for local businesses</span>
        <span>AI-search ready</span>
        <span>Copy-safe exports</span>
        <span>Supabase + Stripe placeholders</span>
      </section>

      <section className="section-grid">
        <div className="section-heading">
          <span className="eyebrow">What ships</span>
          <h2>Everything needed for a first schema audit product.</h2>
        </div>
        <div className="feature-grid">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <article className="feature-card" key={feature.title}>
                <Icon size={22} />
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="workflow-band">
        <div>
          <span className="eyebrow">Studio flow</span>
          <h2>Profile, generate, validate, export.</h2>
        </div>
        <div className="workflow">
          {['Capture business facts', 'Generate schema graph', 'Resolve warnings', 'Handoff implementation'].map(
            (step, index) => (
              <div className="workflow-step" key={step}>
                <strong>{index + 1}</strong>
                <span>{step}</span>
              </div>
            ),
          )}
        </div>
      </section>

      <PricingPanel currentPlan="free" updatePlan={onPlan} marketing />

      <section className="faq-section">
        <div className="section-heading">
          <span className="eyebrow">FAQ</span>
          <h2>Designed for quick local SEO delivery.</h2>
        </div>
        <div className="faq-list">
          {[
            [
              'Does the demo need a backend?',
              'No. The MVP stores the demo profile, auth state, plan, and exports in localStorage while documenting Supabase tables and serverless endpoints.',
            ],
            [
              'Can this support agencies?',
              'The Agency plan gate and multi-location placeholder are included so production work can add client/location tables without changing the product model.',
            ],
            [
              'Is Stripe wired to real checkout?',
              'The app includes pricing state and serverless webhook placeholders. Real Stripe keys are documented in the environment file.',
            ],
          ].map(([question, answer]) => (
            <article className="faq-card" key={question}>
              <h3>{question}</h3>
              <p>{answer}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

function AuthGate({
  authEmail,
  setAuthEmail,
  authenticate,
}: {
  authEmail: string
  setAuthEmail: (value: string) => void
  authenticate: (email?: string) => void
}) {
  return (
    <div className="auth-gate">
      <div>
        <span className="eyebrow">Demo auth</span>
        <h1>Enter the local schema studio.</h1>
        <p>
          The MVP uses a magic-link style local profile. Supabase Auth wiring is documented for production.
        </p>
      </div>
      <form
        className="auth-card"
        onSubmit={(event) => {
          event.preventDefault()
          authenticate(authEmail)
        }}
      >
        <label>
          Work email
          <input value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} type="email" />
        </label>
        <button className="button primary" type="submit">
          <ShieldCheck size={17} />
          Send demo link
        </button>
      </form>
    </div>
  )
}

function Dashboard({
  score,
  warnings,
  generatedCount,
  exportCount,
  business,
  selectedSchemas,
  setActiveTab,
}: {
  score: number
  warnings: ValidationItem[]
  generatedCount: number
  exportCount: number
  business: BusinessProfile
  selectedSchemas: SchemaKind[]
  setActiveTab: (tab: StudioTab) => void
}) {
  const stats = [
    { label: 'Completeness', value: `${score}%`, detail: 'Schema readiness score', icon: Gauge },
    { label: 'Warnings', value: warnings.length.toString(), detail: 'Open validation items', icon: SearchCheck },
    { label: 'Schema nodes', value: generatedCount.toString(), detail: 'Generated JSON-LD graph nodes', icon: FileJson },
    { label: 'Exports', value: exportCount.toString(), detail: 'Saved local handoffs', icon: ArrowDownToLine },
  ]

  return (
    <div className="dashboard-grid">
      <section className="score-panel">
        <div className="score-ring" style={{ '--score': `${score * 3.6}deg` } as React.CSSProperties}>
          <span>{score}</span>
          <small>/100</small>
        </div>
        <div>
          <span className="eyebrow">Current client</span>
          <h2>{business.name}</h2>
          <p>{business.description}</p>
          <div className="inline-meta">
            <span>
              <MapPin size={15} />
              {business.address.locality}, {business.address.region}
            </span>
            <span>
              <BadgeCheck size={15} />
              {selectedSchemas.length} schema types selected
            </span>
          </div>
        </div>
      </section>

      <div className="stat-grid">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <article className="stat-card" key={stat.label}>
              <Icon size={20} />
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
              <small>{stat.detail}</small>
            </article>
          )
        })}
      </div>

      <section className="wide-panel">
        <div className="panel-title">
          <div>
            <span className="eyebrow">Warnings</span>
            <h2>Validation queue</h2>
          </div>
          <button className="button secondary compact" type="button" onClick={() => setActiveTab('validation')}>
            Open checklist
          </button>
        </div>
        <div className="warning-list">
          {(warnings.length ? warnings : [{ id: 'clean', label: 'No open warnings', detail: 'The current profile passes the checklist.', severity: 'pass' as Severity, required: false }]).map(
            (item) => (
              <div className={`warning-row ${item.severity}`} key={item.id}>
                {item.severity === 'pass' ? <Check size={17} /> : <X size={17} />}
                <div>
                  <strong>{item.label}</strong>
                  <span>{item.detail}</span>
                </div>
              </div>
            ),
          )}
        </div>
      </section>

      <section className="wide-panel schema-summary">
        <div>
          <span className="eyebrow">Generated pack</span>
          <h2>Active schema types</h2>
        </div>
        <div className="schema-pills">
          {selectedSchemas.map((schema) => (
            <span key={schema}>{schemaCopy[schema].label}</span>
          ))}
        </div>
      </section>
    </div>
  )
}

function ProfileForm({
  business,
  updateBusinessField,
  updateAddressField,
  updateGeoField,
  updateHour,
  addService,
  updateService,
  removeService,
  addFaq,
  updateFaq,
  removeFaq,
  addReview,
  updateReview,
  removeReview,
  updateSameAs,
  addSameAs,
  removeSameAs,
}: {
  business: BusinessProfile
  updateBusinessField: <K extends keyof BusinessProfile>(key: K, value: BusinessProfile[K]) => void
  updateAddressField: <K extends keyof Address>(key: K, value: Address[K]) => void
  updateGeoField: <K extends keyof Geo>(key: K, value: Geo[K]) => void
  updateHour: (index: number, patch: Partial<OpeningHour>) => void
  addService: () => void
  updateService: (id: string, patch: Partial<ServiceItem>) => void
  removeService: (id: string) => void
  addFaq: () => void
  updateFaq: (id: string, patch: Partial<FaqItem>) => void
  removeFaq: (id: string) => void
  addReview: () => void
  updateReview: (id: string, patch: Partial<ReviewItem>) => void
  removeReview: (id: string) => void
  updateSameAs: (index: number, value: string) => void
  addSameAs: () => void
  removeSameAs: (index: number) => void
}) {
  return (
    <div className="form-stack">
      <section className="form-panel">
        <div className="panel-title">
          <div>
            <span className="eyebrow">NAP</span>
            <h2>Business identity</h2>
          </div>
        </div>
        <div className="form-grid">
          <TextField label="Business name" value={business.name} onChange={(value) => updateBusinessField('name', value)} />
          <TextField label="Website URL" value={business.url} onChange={(value) => updateBusinessField('url', value)} />
          <TextField label="Phone" value={business.phone} onChange={(value) => updateBusinessField('phone', value)} />
          <TextField label="Email" value={business.email} onChange={(value) => updateBusinessField('email', value)} />
          <TextField label="Category" value={business.category} onChange={(value) => updateBusinessField('category', value)} />
          <TextField label="Price range" value={business.priceRange} onChange={(value) => updateBusinessField('priceRange', value)} />
          <label className="span-2">
            Description
            <textarea value={business.description} onChange={(event) => updateBusinessField('description', event.target.value)} />
          </label>
          <TextField label="Image URL" value={business.image} onChange={(value) => updateBusinessField('image', value)} wide />
        </div>
      </section>

      <section className="form-panel">
        <div className="panel-title">
          <div>
            <span className="eyebrow">Location</span>
            <h2>Address and geo</h2>
          </div>
        </div>
        <div className="form-grid">
          <TextField label="Street" value={business.address.street} onChange={(value) => updateAddressField('street', value)} />
          <TextField label="City" value={business.address.locality} onChange={(value) => updateAddressField('locality', value)} />
          <TextField label="Region" value={business.address.region} onChange={(value) => updateAddressField('region', value)} />
          <TextField label="Postal code" value={business.address.postalCode} onChange={(value) => updateAddressField('postalCode', value)} />
          <TextField label="Country" value={business.address.country} onChange={(value) => updateAddressField('country', value)} />
          <TextField label="Latitude" value={business.geo.latitude} onChange={(value) => updateGeoField('latitude', value)} />
          <TextField label="Longitude" value={business.geo.longitude} onChange={(value) => updateGeoField('longitude', value)} />
        </div>
      </section>

      <section className="form-panel">
        <div className="panel-title">
          <div>
            <span className="eyebrow">Hours</span>
            <h2>Opening hours</h2>
          </div>
        </div>
        <div className="hours-grid">
          {business.openingHours.map((hour, index) => (
            <div className="hours-row" key={hour.day}>
              <strong>{days.includes(hour.day) ? hour.day.slice(0, 3) : hour.day}</strong>
              <input value={hour.opens} type="time" disabled={hour.closed} onChange={(event) => updateHour(index, { opens: event.target.value })} />
              <input value={hour.closes} type="time" disabled={hour.closed} onChange={(event) => updateHour(index, { closes: event.target.value })} />
              <label className="check-label">
                <input checked={hour.closed} type="checkbox" onChange={(event) => updateHour(index, { closed: event.target.checked })} />
                Closed
              </label>
            </div>
          ))}
        </div>
      </section>

      <ArrayPanel title="sameAs links" eyebrow="Entity links" onAdd={addSameAs}>
        {business.sameAs.map((link, index) => (
          <div className="list-editor-row" key={`${link}-${index}`}>
            <input value={link} onChange={(event) => updateSameAs(index, event.target.value)} />
            <button className="icon-button danger" type="button" onClick={() => removeSameAs(index)}>
              <X size={16} />
              <span className="sr-only">Remove link</span>
            </button>
          </div>
        ))}
      </ArrayPanel>

      <ArrayPanel title="Services" eyebrow="Offer catalog" onAdd={addService}>
        {business.services.map((service) => (
          <article className="nested-card" key={service.id}>
            <div className="form-grid">
              <TextField label="Service name" value={service.name} onChange={(value) => updateService(service.id, { name: value })} />
              <TextField label="Area served" value={service.areaServed} onChange={(value) => updateService(service.id, { areaServed: value })} />
              <TextField label="Price range" value={service.priceRange} onChange={(value) => updateService(service.id, { priceRange: value })} />
              <label className="span-2">
                Description
                <textarea value={service.description} onChange={(event) => updateService(service.id, { description: event.target.value })} />
              </label>
            </div>
            <button className="button ghost danger-text" type="button" onClick={() => removeService(service.id)}>
              <X size={16} />
              Remove service
            </button>
          </article>
        ))}
      </ArrayPanel>

      <ArrayPanel title="FAQs" eyebrow="Question set" onAdd={addFaq}>
        {business.faqs.map((faq) => (
          <article className="nested-card" key={faq.id}>
            <TextField label="Question" value={faq.question} onChange={(value) => updateFaq(faq.id, { question: value })} wide />
            <label>
              Answer
              <textarea value={faq.answer} onChange={(event) => updateFaq(faq.id, { answer: event.target.value })} />
            </label>
            <button className="button ghost danger-text" type="button" onClick={() => removeFaq(faq.id)}>
              <X size={16} />
              Remove FAQ
            </button>
          </article>
        ))}
      </ArrayPanel>

      <ArrayPanel title="Reviews" eyebrow="Proof" onAdd={addReview}>
        {business.reviews.map((review) => (
          <article className="nested-card" key={review.id}>
            <div className="form-grid">
              <TextField label="Author" value={review.author} onChange={(value) => updateReview(review.id, { author: value })} />
              <label>
                Rating
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={review.rating}
                  onChange={(event) => updateReview(review.id, { rating: Number(event.target.value) })}
                />
              </label>
              <TextField
                label="Date published"
                type="date"
                value={review.datePublished}
                onChange={(value) => updateReview(review.id, { datePublished: value })}
              />
              <label className="span-2">
                Review body
                <textarea value={review.body} onChange={(event) => updateReview(review.id, { body: event.target.value })} />
              </label>
            </div>
            <button className="button ghost danger-text" type="button" onClick={() => removeReview(review.id)}>
              <X size={16} />
              Remove review
            </button>
          </article>
        ))}
      </ArrayPanel>
    </div>
  )
}

function TextField({
  label,
  value,
  onChange,
  wide,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  wide?: boolean
  type?: string
}) {
  return (
    <label className={wide ? 'span-2' : undefined}>
      {label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}

function ArrayPanel({
  title,
  eyebrow,
  onAdd,
  children,
}: {
  title: string
  eyebrow: string
  onAdd: () => void
  children: React.ReactNode
}) {
  return (
    <section className="form-panel">
      <div className="panel-title">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h2>{title}</h2>
        </div>
        <button className="button secondary compact" type="button" onClick={onAdd}>
          <Plus size={16} />
          Add
        </button>
      </div>
      <div className="array-stack">{children}</div>
    </section>
  )
}

function GeneratorPanel({
  plan,
  selectedSchemas,
  allowedSchemas,
  toggleSchema,
  jsonOutput,
  graphCount,
  updatePlan,
  onCopy,
  onDownload,
}: {
  plan: Plan
  selectedSchemas: SchemaKind[]
  allowedSchemas: SchemaKind[]
  toggleSchema: (kind: SchemaKind) => void
  jsonOutput: string
  graphCount: number
  updatePlan: (plan: Plan) => void
  onCopy: () => void
  onDownload: () => void
}) {
  return (
    <div className="generator-grid">
      <section className="form-panel">
        <div className="panel-title">
          <div>
            <span className="eyebrow">Schema types</span>
            <h2>Pack builder</h2>
          </div>
          <span className="plan-pill">{planDetails[plan].name}</span>
        </div>
        <div className="schema-selector">
          {schemaKinds.map((kind) => {
            const locked = !allowedSchemas.includes(kind)
            const checked = selectedSchemas.includes(kind)
            return (
              <button className={`schema-option ${checked ? 'selected' : ''}`} type="button" key={kind} onClick={() => (locked ? updatePlan('pro') : toggleSchema(kind))}>
                <span>
                  {locked ? <Lock size={18} /> : checked ? <Check size={18} /> : <FileJson size={18} />}
                  <strong>{schemaCopy[kind].label}</strong>
                </span>
                <small>{schemaCopy[kind].description}</small>
                {locked ? <em>Upgrade</em> : null}
              </button>
            )
          })}
        </div>
      </section>

      <section className="code-panel">
        <div className="panel-title">
          <div>
            <span className="eyebrow">JSON-LD</span>
            <h2>{graphCount} graph nodes</h2>
          </div>
          <div className="button-row">
            <button className="button secondary compact" type="button" onClick={onCopy}>
              <Copy size={16} />
              Copy
            </button>
            <button className="button primary compact" type="button" onClick={onDownload}>
              <Download size={16} />
              Download
            </button>
          </div>
        </div>
        <pre>
          <code>{jsonOutput}</code>
        </pre>
      </section>
    </div>
  )
}

function ValidationPanel({
  items,
  score,
  setActiveTab,
}: {
  items: ValidationItem[]
  score: number
  setActiveTab: (tab: StudioTab) => void
}) {
  const requiredErrors = items.filter((item) => item.required && item.severity !== 'pass').length
  const recommendedOpen = items.filter((item) => !item.required && item.severity !== 'pass').length

  return (
    <div className="validation-layout">
      <section className="score-panel compact-panel">
        <div className="score-ring" style={{ '--score': `${score * 3.6}deg` } as React.CSSProperties}>
          <span>{score}</span>
          <small>/100</small>
        </div>
        <div>
          <span className="eyebrow">Validation</span>
          <h2>{requiredErrors ? 'Required fields need attention' : 'Ready for implementation review'}</h2>
          <p>{requiredErrors} required issues and {recommendedOpen} recommended improvements are open.</p>
        </div>
      </section>

      <section className="wide-panel">
        <div className="checklist">
          {items.map((item) => (
            <article className={`check-item ${item.severity}`} key={item.id}>
              <span className="check-icon">
                {item.severity === 'pass' ? <Check size={17} /> : item.severity === 'warning' ? <Settings2 size={17} /> : <X size={17} />}
              </span>
              <div>
                <strong>{item.label}</strong>
                <p>{item.detail}</p>
              </div>
              <em>{item.required ? 'Required' : 'Recommended'}</em>
            </article>
          ))}
        </div>
      </section>

      <section className="wide-panel split-panel">
        <div>
          <span className="eyebrow">Next action</span>
          <h2>{items.some((item) => item.severity === 'error') ? 'Patch the profile first' : 'Export the schema pack'}</h2>
          <p>SchemaSprint keeps validation tied to the generated graph so the handoff stays synchronized.</p>
        </div>
        <div className="button-row">
          <button className="button secondary" type="button" onClick={() => setActiveTab('profile')}>
            Edit profile
          </button>
          <button className="button primary" type="button" onClick={() => setActiveTab('exports')}>
            Export pack
          </button>
        </div>
      </section>
    </div>
  )
}

function ExportCenter({
  business,
  exports,
  clientNote,
  activeSchemas,
  onCopyJson,
  onCopyNote,
  onDownload,
  onSave,
}: {
  business: BusinessProfile
  exports: SchemaExport[]
  clientNote: string
  activeSchemas: SchemaKind[]
  onCopyJson: () => void
  onCopyNote: () => void
  onDownload: () => void
  onSave: () => void
}) {
  return (
    <div className="export-grid">
      <section className="form-panel">
        <div className="panel-title">
          <div>
            <span className="eyebrow">Current export</span>
            <h2>{business.name}</h2>
          </div>
          <span className="plan-pill">{activeSchemas.length || 1} types</span>
        </div>
        <div className="export-actions">
          <button className="button primary" type="button" onClick={onCopyJson}>
            <Copy size={17} />
            Copy JSON-LD
          </button>
          <button className="button secondary" type="button" onClick={onDownload}>
            <Download size={17} />
            Download JSON
          </button>
          <button className="button secondary" type="button" onClick={onSave}>
            <Clipboard size={17} />
            Save export
          </button>
          <button className="button secondary" type="button" onClick={onCopyNote}>
            <FileJson size={17} />
            Copy handoff note
          </button>
        </div>

        <div className="instruction-box">
          <h3>Implementation instructions</h3>
          <ol>
            <li>Paste the JSON-LD block on the matching canonical page.</li>
            <li>Keep NAP values identical across the website, Google Business Profile, and citation sources.</li>
            <li>Re-export after changing services, hours, location data, reviews, or FAQ copy.</li>
          </ol>
        </div>
      </section>

      <section className="code-panel">
        <div className="panel-title">
          <div>
            <span className="eyebrow">Handoff note</span>
            <h2>Client-ready summary</h2>
          </div>
        </div>
        <pre>
          <code>{clientNote}</code>
        </pre>
      </section>

      <section className="wide-panel span-all">
        <div className="panel-title">
          <div>
            <span className="eyebrow">History</span>
            <h2>Saved exports</h2>
          </div>
        </div>
        <div className="export-history">
          {(exports.length ? exports : []).map((item) => (
            <article className="export-row" key={item.id}>
              <div>
                <strong>{item.schemaTypes.join(', ')}</strong>
                <span>{formatDate(item.createdAt)} · Score {item.score}</span>
              </div>
              <button className="button ghost compact" type="button" onClick={() => copyText(item.jsonld)}>
                <Copy size={15} />
                Copy
              </button>
            </article>
          ))}
          {!exports.length ? (
            <div className="empty-state">
              <ArrowDownToLine size={22} />
              <strong>No saved exports yet</strong>
              <span>Save the current pack to create a local export history.</span>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}

function PricingPanel({
  currentPlan,
  updatePlan,
  marketing,
}: {
  currentPlan: Plan
  updatePlan: (plan: Plan) => void
  marketing?: boolean
}) {
  return (
    <section className={marketing ? 'pricing-section' : 'pricing-section in-app'}>
      <div className="section-heading">
        <span className="eyebrow">Pricing</span>
        <h2>Feature gates that match the local SEO workflow.</h2>
      </div>
      <div className="pricing-grid">
        {(Object.keys(planDetails) as Plan[]).map((plan) => {
          const details = planDetails[plan]
          const active = currentPlan === plan
          return (
            <article className={`pricing-card ${active ? 'active' : ''}`} key={plan}>
              <div>
                <span>{details.name}</span>
                <strong>{details.price}<small>/mo</small></strong>
                <p>{details.short}</p>
              </div>
              <ul>
                {details.features.map((feature) => (
                  <li key={feature}>
                    <Check size={16} />
                    {feature}
                  </li>
                ))}
              </ul>
              <button className={active ? 'button secondary' : 'button primary'} type="button" onClick={() => updatePlan(plan)}>
                {active ? 'Current plan' : `Switch to ${details.name}`}
                <ChevronRight size={16} />
              </button>
            </article>
          )
        })}
      </div>

      <div className="agency-placeholder">
        <div>
          <span className="eyebrow">Agency placeholder</span>
          <h3>Multi-location client table</h3>
          <p>Production wiring will map users, businesses, schema_exports, and subscriptions in Supabase.</p>
        </div>
        <button className="button secondary" type="button" onClick={() => updatePlan('agency')}>
          <ExternalLink size={16} />
          Preview Agency
        </button>
      </div>
    </section>
  )
}

export default App
