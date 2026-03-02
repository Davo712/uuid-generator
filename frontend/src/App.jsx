import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Link, NavLink, Route, Routes, useLocation, useParams } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'
const SITE_URL = 'https://uuid-generator-1-hse5.onrender.com'

const DEV_SNIPPETS = {
  java: 'UUID.randomUUID().toString();',
  javascript: 'crypto.randomUUID();',
  python: 'import uuid\nuuid.uuid4()',
  go: 'id := uuid.NewString()',
  csharp: 'Guid.NewGuid().ToString();',
  php: '$uuid = Ramsey\\Uuid\\Uuid::uuid4()->toString();',
  ruby: 'SecureRandom.uuid',
  kotlin: 'UUID.randomUUID().toString()'
}

const SEO_BY_PATH = {
  '/': {
    title: 'UUID Generator Online - v1, v4, v7, Nil, GUID',
    description: 'Generate UUID and GUID values online. Create version 1, version 4, version 7 and Nil UUID instantly.'
  },
  '/version1': {
    title: 'UUID Version 1 Generator',
    description: 'Generate UUID Version 1 values and copy or download in bulk.'
  },
  '/version4': {
    title: 'UUID Version 4 Generator',
    description: 'Generate random UUID Version 4 values for apps and databases.'
  },
  '/version7': {
    title: 'UUID Version 7 Generator',
    description: 'Generate sortable UUID Version 7 values for modern systems.'
  },
  '/nil': {
    title: 'Nil UUID Generator',
    description: 'Generate Nil UUID and work with empty UUID placeholders.'
  },
  '/guid': {
    title: 'GUID Generator',
    description: 'Generate GUID format identifiers with uppercase brace output.'
  },
  '/dev-corner': {
    title: 'Dev Corner - UUID Code Examples',
    description: 'UUID code snippets for Java, JavaScript, Python, Go, C#, PHP, Ruby and Kotlin.'
  },
  '/api-docs': {
    title: 'UUID API Documentation',
    description: 'Public API endpoints for generating UUID and GUID values.'
  }
}

function App() {
  return (
    <BrowserRouter>
      <SiteShell />
    </BrowserRouter>
  )
}

function SiteShell() {
  const location = useLocation()
  useSeo(location.pathname)

  return (
    <div className="app">
      <header className="top">
        <div className="brand">
          <Link to="/">UUID Generator</Link>
          <small>Developer Utility</small>
        </div>
        <nav className="main-nav">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/version1">Version 1</NavLink>
          <NavLink to="/version4">Version 4</NavLink>
          <NavLink to="/version7">Version 7</NavLink>
          <NavLink to="/nil">Nil</NavLink>
          <NavLink to="/guid">GUID</NavLink>
          <NavLink to="/dev-corner">Dev Corner</NavLink>
          <NavLink to="/api-docs">API</NavLink>
        </nav>
      </header>

      <main className="layout">
        <article className="main-col">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/version1" element={<VersionPage version="v1" title="UUID Version 1 Generator" />} />
            <Route path="/version4" element={<VersionPage version="v4" title="UUID Version 4 Generator" />} />
            <Route path="/version7" element={<VersionPage version="v7" title="UUID Version 7 Generator" />} />
            <Route path="/nil" element={<VersionPage version="nil" title="Nil UUID Generator" />} />
            <Route path="/guid" element={<VersionPage version="v4" title="GUID Generator" guid />} />
            <Route path="/dev-corner" element={<DevCorner />} />
            <Route path="/api-docs" element={<ApiDocs />} />
            <Route path="/dev/:lang" element={<DevLanguage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </article>
        <aside className="side-col">
          <section className="card ad-slot"><p>Advertisement</p><small>Responsive Slot A</small></section>
          <section className="card">
            <h3>UUID Versions</h3>
            <ul className="mini-list">
              <li><Link to="/version1">Version 1</Link></li>
              <li><Link to="/version4">Version 4</Link></li>
              <li><Link to="/version7">Version 7</Link></li>
              <li><Link to="/nil">Nil UUID</Link></li>
              <li><Link to="/guid">GUID</Link></li>
            </ul>
          </section>
        </aside>
      </main>

      <section className="page-end-ad card ad-slot"><p>Advertisement</p><small>In-content Slot B</small></section>
      <footer className="foot">
        <Link to="/">UUID Generator</Link>
        <a href="/privacy.html">Privacy Policy</a>
        <a href="/terms.html">Terms of Service</a>
      </footer>
    </div>
  )
}

function useSeo(pathname) {
  useEffect(() => {
    const key = pathname.startsWith('/dev/') ? '/dev-corner' : pathname
    const pageSeo = SEO_BY_PATH[key] || SEO_BY_PATH['/']
    const canonical = `${SITE_URL}${pathname}`
    document.title = pageSeo.title
    setMeta('description', pageSeo.description)
    setMetaProperty('og:title', pageSeo.title)
    setMetaProperty('og:description', pageSeo.description)
    setMetaProperty('og:url', canonical)
    setMeta('twitter:title', pageSeo.title)
    setMeta('twitter:description', pageSeo.description)
    setCanonical(canonical)
    setJsonLd(pathname, pageSeo)
  }, [pathname])
}

function setMeta(name, content) {
  const el = document.querySelector(`meta[name="${name}"]`)
  if (el) el.setAttribute('content', content)
}

function setMetaProperty(property, content) {
  const el = document.querySelector(`meta[property="${property}"]`)
  if (el) el.setAttribute('content', content)
}

function setCanonical(url) {
  const el = document.querySelector('link[rel="canonical"]')
  if (el) el.setAttribute('href', url)
}

function setJsonLd(pathname, pageSeo) {
  const existing = document.getElementById('dynamic-jsonld')
  if (existing) existing.remove()
  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.id = 'dynamic-jsonld'
  script.text = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': pathname.startsWith('/dev') ? 'TechArticle' : 'WebPage',
    name: pageSeo.title,
    description: pageSeo.description,
    url: `${SITE_URL}${pathname}`
  })
  document.head.appendChild(script)
}

function HomePage() {
  return (
    <>
      <section className="hero card">
        <h1>UUID Generator</h1>
        <p>Generate random UUID, Version 1, Version 4, Version 7, Nil UUID, and GUID values. Copy or download instantly.</p>
      </section>
      <QuickUuidBox />
      <UuidPanel version="v4" />
      <VersionComparison />
      <UuidInspector />
      <section className="card prose">
        <h2>What Is UUID</h2>
        <p>UUID is a 128-bit identifier used to uniquely tag records in distributed software systems.</p>
      </section>
    </>
  )
}

function QuickUuidBox() {
  const [uuid, setUuid] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_BASE}/uuid`)
      if (!response.ok) throw new Error('Failed')
      const data = await response.json()
      setUuid(data.uuid || '')
    } catch {
      setError('Unable to generate UUID.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const copyOne = async () => {
    if (!uuid) return
    await navigator.clipboard.writeText(uuid)
  }

  return (
    <section className="card">
      <h2>Quick UUID</h2>
      <p>New UUID is generated automatically on page refresh.</p>
      <div className="tool-row">
        <button onClick={load} disabled={loading}>{loading ? 'Generating...' : 'Generate New'}</button>
        <button onClick={copyOne} disabled={!uuid}>Copy UUID</button>
      </div>
      {error && <p className="error">{error}</p>}
      <p><code>{uuid || 'Loading...'}</code></p>
    </section>
  )
}

function VersionPage({ version, title, guid = false }) {
  return (
    <>
      <section className="card hero">
        <h1>{title}</h1>
        <p>
          {guid
            ? 'Generate GUID values compatible with common Microsoft-style formatting.'
            : `Generate ${version.toUpperCase()} values for development, testing, and production workflows.`}
        </p>
      </section>
      <UuidPanel version={version} guid={guid} />
      <section className="card prose">
        <h2>When to use {guid ? 'GUID' : version.toUpperCase()}</h2>
        <p>
          {version === 'v1' && 'Use v1-style IDs when time ordering helps.'}
          {version === 'v4' && 'Use v4 for random identifiers with broad compatibility.'}
          {version === 'v7' && 'Use v7 for sortable IDs with modern timestamp layout.'}
          {version === 'nil' && 'Use Nil UUID as an empty placeholder.'}
          {guid && 'Use GUID formatting for systems requiring uppercase and braces.'}
        </p>
      </section>
    </>
  )
}

function UuidPanel({ version, guid = false }) {
  const [count, setCount] = useState(10)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const validCount = useMemo(() => Math.max(1, Math.min(1000, Number(count) || 1)), [count])

  const loadValues = async () => {
    setError('')
    setLoading(true)
    try {
      const endpoint = `${API_BASE}/generate?version=${version}&count=${validCount}&guidFormat=${guid}`
      const response = await fetch(endpoint)
      if (!response.ok) throw new Error('Failed')
      const data = await response.json()
      setItems(data.uuids || [])
    } catch {
      setError('Generation failed. Please retry.')
    } finally {
      setLoading(false)
    }
  }

  const copyAll = async () => {
    if (!items.length) return
    await navigator.clipboard.writeText(items.join('\n'))
  }

  const download = () => {
    const blob = new Blob([items.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${version}-uuids.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section className="card">
      <h2>Generate Values</h2>
      <div className="tool-row">
        <label htmlFor={`count-${version}`}>Count</label>
        <input id={`count-${version}`} type="number" min="1" max="1000" value={count} onChange={(e) => setCount(e.target.value)} />
        <button onClick={loadValues} disabled={loading}>Generate</button>
        <button onClick={copyAll} disabled={!items.length}>Copy all</button>
        <button onClick={download} disabled={!items.length}>Download</button>
      </div>
      {error && <p className="error">{error}</p>}
      <ol className="uuid-list">
        {items.map((uuid) => (
          <li key={uuid}><code>{uuid}</code></li>
        ))}
      </ol>
    </section>
  )
}

function VersionComparison() {
  return (
    <section className="card prose">
      <h2>UUID Version Comparison</h2>
      <table className="compare-table">
        <thead>
          <tr><th>Version</th><th>How It Works</th><th>Best For</th></tr>
        </thead>
        <tbody>
          <tr><td>v1</td><td>Timestamp + node style structure</td><td>Ordered identifiers</td></tr>
          <tr><td>v4</td><td>Random</td><td>General purpose IDs</td></tr>
          <tr><td>v7</td><td>Unix time + random</td><td>Sortable modern IDs</td></tr>
          <tr><td>Nil</td><td>All zeros</td><td>Empty placeholder</td></tr>
          <tr><td>GUID</td><td>UUID v4 formatted with braces</td><td>MS ecosystem compatibility</td></tr>
        </tbody>
      </table>
    </section>
  )
}

function UuidInspector() {
  const [value, setValue] = useState('')
  const parsed = parseUuid(value)

  return (
    <section className="card prose">
      <h2>UUID Validator and Parser</h2>
      <input
        type="text"
        placeholder="Paste UUID here..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <p><strong>Valid:</strong> {parsed.valid ? 'Yes' : 'No'}</p>
      <p><strong>Detected version:</strong> {parsed.version || '-'}</p>
      <p><strong>Variant:</strong> {parsed.variant || '-'}</p>
    </section>
  )
}

function parseUuid(raw) {
  const cleaned = raw.trim().replace(/[{}]/g, '').toLowerCase()
  const match = cleaned.match(/^[0-9a-f]{8}-[0-9a-f]{4}-([0-9a-f])[0-9a-f]{3}-([0-9a-f])[0-9a-f]{3}-[0-9a-f]{12}$/)
  if (!match) return { valid: false, version: '', variant: '' }
  const versionNibble = match[1]
  const variantNibble = parseInt(match[2], 16)
  const variant = variantNibble >= 8 && variantNibble <= 11 ? 'RFC 4122' : 'Other'
  return { valid: true, version: `v${versionNibble}`, variant }
}

function DevCorner() {
  return (
    <section className="card prose">
      <h1>Dev Corner</h1>
      <p>UUID snippets for popular languages and frameworks.</p>
      <ul>
        <li><Link to="/dev/java">Java UUID Example</Link></li>
        <li><Link to="/dev/javascript">JavaScript UUID Example</Link></li>
        <li><Link to="/dev/python">Python UUID Example</Link></li>
        <li><Link to="/dev/go">Go UUID Example</Link></li>
        <li><Link to="/dev/csharp">C# GUID Example</Link></li>
        <li><Link to="/dev/php">PHP UUID Example</Link></li>
        <li><Link to="/dev/ruby">Ruby UUID Example</Link></li>
        <li><Link to="/dev/kotlin">Kotlin UUID Example</Link></li>
      </ul>
    </section>
  )
}

function DevLanguage() {
  const { lang } = useParams()
  const code = DEV_SNIPPETS[lang] || 'UUID.randomUUID().toString();'
  const title = lang ? `${lang.toUpperCase()} UUID Example` : 'UUID Example'
  return (
    <section className="card prose">
      <h1>{title}</h1>
      <p>Simple UUID generation sample for {lang}.</p>
      <pre><code>{code}</code></pre>
      <p><Link to="/dev-corner">Back to Dev Corner</Link></p>
    </section>
  )
}

function ApiDocs() {
  return (
    <section className="card prose">
      <h1>UUID API</h1>
      <p>Public endpoints for server-side UUID generation.</p>
      <ul>
        <li><code>GET /api/uuid</code></li>
        <li><code>GET /api/uuids?count=10</code></li>
        <li><code>GET /api/generate?version=v7&amp;count=20</code></li>
        <li><code>GET /api/guid?count=5</code></li>
      </ul>
    </section>
  )
}

export default App
