import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import SparkMD5 from 'spark-md5'
import {
  decodeJwtParts,
  deepSort,
  diffLines,
  markdownToHtml,
  parseCsvLine,
  simpleYamlToObj,
  xmlToObj
} from './utils/toolUtils'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'
const SITE_URL = 'https://uuid-generator-1-hse5.onrender.com'

const NAV_SECTIONS = [
  { key: 'uuid', label: 'UUID', to: '/uuid-generator' },
  { key: 'developer', label: 'Developer Tools', to: '/developer-tools' },
  { key: 'converters', label: 'Converters', to: '/converters' },
  { key: 'generators', label: 'Generators', to: '/generators' },
  { key: 'api', label: 'API Docs', to: '/api-docs' }
]

const TOOLS = [
  { key: 'uuid-generator', label: 'UUID Generator', path: '/uuid-generator', section: 'uuid' },
  { key: 'version1', label: 'Version 1', path: '/version1', section: 'uuid' },
  { key: 'version4', label: 'Version 4', path: '/version4', section: 'uuid' },
  { key: 'version7', label: 'Version 7', path: '/version7', section: 'uuid' },
  { key: 'nil', label: 'Nil UUID', path: '/nil', section: 'uuid' },
  { key: 'guid', label: 'GUID', path: '/guid', section: 'uuid' },
  { key: 'dev-corner', label: 'Dev Corner', path: '/dev-corner', section: 'uuid' },

  { key: 'json-formatter', label: 'JSON Formatter', path: '/tools/json-formatter', section: 'developer' },
  { key: 'base64', label: 'Base64 Encoder/Decoder', path: '/tools/base64', section: 'developer' },
  { key: 'regex', label: 'Regex Tester', path: '/tools/regex-tester', section: 'developer' },
  { key: 'cron', label: 'Cron Generator', path: '/tools/cron-generator', section: 'developer' },
  { key: 'sql', label: 'SQL Formatter', path: '/tools/sql-formatter', section: 'developer' },
  { key: 'jwt', label: 'JWT Decoder', path: '/tools/jwt-decoder', section: 'developer' },
  { key: 'hash', label: 'Hash Generator', path: '/tools/hash-generator', section: 'developer' },
  { key: 'diff', label: 'Diff Checker', path: '/tools/diff-checker', section: 'developer' },

  { key: 'xml-to-json', label: 'XML to JSON', path: '/tools/xml-to-json', section: 'converters' },
  { key: 'csv-to-json', label: 'CSV to JSON', path: '/tools/csv-to-json', section: 'converters' },
  { key: 'markdown-to-html', label: 'Markdown to HTML', path: '/tools/markdown-to-html', section: 'converters' },
  { key: 'yaml-to-json', label: 'YAML to JSON', path: '/tools/yaml-to-json', section: 'converters' },

  { key: 'password', label: 'Password Generator', path: '/tools/password-generator', section: 'generators' },
  { key: 'lorem', label: 'Lorem Ipsum', path: '/tools/lorem-ipsum', section: 'generators' },
  { key: 'qr', label: 'QR Code Generator', path: '/tools/qr-generator', section: 'generators' },
  { key: 'random-data', label: 'Random Test Data', path: '/tools/random-data', section: 'generators' },
  { key: 'api-docs', label: 'API Docs', path: '/api-docs', section: 'api' }
]

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

function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  )
}

function Shell() {
  const location = useLocation()
  const [toast, setToast] = useState('')

  useSeo(location.pathname)

  const section = useMemo(() => detectSection(location.pathname), [location.pathname])
  const quickLinks = useMemo(() => TOOLS.filter((t) => t.section === section), [section])

  const copy = async (text) => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setToast('Copied to clipboard')
    } catch {
      setToast('Clipboard permission denied')
    }
    setTimeout(() => setToast(''), 1600)
  }

  return (
    <div className="app">
      <header className="top">
        <div className="brand">
          <Link to="/">Dev Tools Hub</Link>
          <small>Simple tools for everyday dev tasks</small>
        </div>
        <nav className="main-nav">
          {NAV_SECTIONS.map((s) => (
            <NavLink
              key={s.key}
              to={s.to}
              className={({ isActive }) => (isActive || section === s.key ? 'active' : '')}
            >
              {s.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <AdSlot label="Top Ad Slot" />

      <main className="layout">
        <article className="main-col">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/uuid-generator" element={<UuidGeneratorPage onCopy={copy} />} />
            <Route path="/version1" element={<UuidVersionPage title="UUID Version 1 Generator" version="v1" onCopy={copy} />} />
            <Route path="/version4" element={<UuidVersionPage title="UUID Version 4 Generator" version="v4" onCopy={copy} />} />
            <Route path="/version7" element={<UuidVersionPage title="UUID Version 7 Generator" version="v7" onCopy={copy} />} />
            <Route path="/nil" element={<UuidVersionPage title="Nil UUID Generator" version="nil" onCopy={copy} />} />
            <Route path="/guid" element={<UuidVersionPage title="GUID Generator" version="v4" guid onCopy={copy} />} />
            <Route path="/dev-corner" element={<DevCorner />} />

            <Route path="/developer-tools" element={<SectionLanding title="Developer Tools" section="developer" />} />
            <Route path="/tools/json-formatter" element={<JsonFormatterPage onCopy={copy} />} />
            <Route path="/tools/base64" element={<Base64Page onCopy={copy} />} />
            <Route path="/tools/regex-tester" element={<RegexPage />} />
            <Route path="/tools/cron-generator" element={<CronPage onCopy={copy} />} />
            <Route path="/tools/sql-formatter" element={<SqlFormatterPage onCopy={copy} />} />
            <Route path="/tools/jwt-decoder" element={<JwtDecoderPage onCopy={copy} />} />
            <Route path="/tools/hash-generator" element={<HashPage onCopy={copy} />} />
            <Route path="/tools/diff-checker" element={<DiffPage />} />

            <Route path="/converters" element={<SectionLanding title="Converters" section="converters" />} />
            <Route path="/tools/xml-to-json" element={<XmlToJsonPage onCopy={copy} />} />
            <Route path="/tools/csv-to-json" element={<CsvToJsonPage onCopy={copy} />} />
            <Route path="/tools/markdown-to-html" element={<MarkdownPage onCopy={copy} />} />
            <Route path="/tools/yaml-to-json" element={<YamlPage onCopy={copy} />} />

            <Route path="/generators" element={<SectionLanding title="Generators" section="generators" />} />
            <Route path="/tools/password-generator" element={<PasswordPage onCopy={copy} />} />
            <Route path="/tools/lorem-ipsum" element={<LoremPage onCopy={copy} />} />
            <Route path="/tools/qr-generator" element={<QrPage />} />
            <Route path="/tools/random-data" element={<RandomDataPage onCopy={copy} />} />

            <Route path="/api-docs" element={<ApiDocs />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </article>
        <aside className="side-col">
          <section className="card">
            <h3>Quick Links</h3>
            <ul className="mini-list">
              {quickLinks.map((item) => (
                <li key={item.key}><Link to={item.path}>{item.label}</Link></li>
              ))}
            </ul>
          </section>
        </aside>
      </main>

      <AdSlot label="Bottom Ad Slot" />

      <footer className="foot">
        <Link to="/">Dev Tools Hub</Link>
        <a href="/privacy.html">Privacy Policy</a>
        <a href="/terms.html">Terms of Service</a>
      </footer>

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

function detectSection(pathname) {
  if (pathname === '/api-docs') return 'api'
  const match = TOOLS.find((t) => t.path === pathname)
  if (match) return match.section
  if (pathname === '/developer-tools') return 'developer'
  if (pathname === '/converters') return 'converters'
  if (pathname === '/generators') return 'generators'
  return 'uuid'
}

function useSeo(pathname) {
  useEffect(() => {
    const meta = {
      title: 'Dev Tools Hub - Developer Utilities',
      description: 'UUID, formatters, converters and generators in one clear toolkit.'
    }
    document.title = meta.title
    setMeta('description', meta.description)
    setMeta('twitter:title', meta.title)
    setMeta('twitter:description', meta.description)
    setMetaProperty('og:title', meta.title)
    setMetaProperty('og:description', meta.description)
    setMetaProperty('og:url', `${SITE_URL}${pathname}`)
    const canonical = document.querySelector('link[rel="canonical"]')
    if (canonical) canonical.setAttribute('href', `${SITE_URL}${pathname}`)
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

function HomePage() {
  return (
    <section className="card prose">
      <h1>Dev Tools Hub</h1>
      <p>Clear tools for developers. Choose a section from the top menu.</p>
      <div className="tool-row">
        <Link to="/uuid-generator">Open UUID Generator</Link>
        <Link to="/tools/json-formatter">Open JSON Formatter</Link>
      </div>
    </section>
  )
}

function SectionLanding({ title, section }) {
  const items = TOOLS.filter((t) => t.section === section)
  return (
    <section className="card prose">
      <h1>{title}</h1>
      <ul className="mini-list">
        {items.map((it) => (
          <li key={it.key}><Link to={it.path}>{it.label}</Link></li>
        ))}
      </ul>
    </section>
  )
}

function AdSlot({ label }) {
  return (
    <section className="card ad-slot" aria-label="advertisement placeholder">
      <p>Advertisement</p>
      <strong>{label}</strong>
    </section>
  )
}

function UuidGeneratorPage({ onCopy }) {
  return (
    <>
      <section className="hero card">
        <h1>UUID Generator</h1>
        <p>Generate, copy and download UUID values quickly.</p>
      </section>
      <QuickUuidBox onCopy={onCopy} />
      <UuidPanel version="v4" onCopy={onCopy} />
    </>
  )
}

function QuickUuidBox({ onCopy }) {
  const [uuid, setUuid] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_BASE}/uuid`)
      const data = await response.json()
      setUuid(data.uuid || '')
    } catch {
      setError('Unable to generate UUID.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <section className="card">
      <h2>Quick UUID</h2>
      <div className="tool-row">
        <button onClick={load} disabled={loading}>Generate</button>
        <button onClick={() => onCopy(uuid)} disabled={!uuid}>Copy</button>
      </div>
      {error && <p className="error">{error}</p>}
      <p><code>{uuid || 'Loading...'}</code></p>
    </section>
  )
}

function UuidVersionPage({ title, version, guid = false, onCopy }) {
  return (
    <>
      <section className="hero card">
        <h1>{title}</h1>
      </section>
      <UuidPanel version={version} guid={guid} onCopy={onCopy} />
    </>
  )
}

function UuidPanel({ version, guid = false, onCopy }) {
  const [count, setCount] = useState(10)
  const [items, setItems] = useState([])
  const validCount = useMemo(() => Math.max(1, Math.min(1000, Number(count) || 1)), [count])

  const loadValues = async () => {
    const endpoint = `${API_BASE}/generate?version=${version}&count=${validCount}&guidFormat=${guid}`
    const response = await fetch(endpoint)
    const data = await response.json()
    setItems(data.uuids || [])
  }

  const download = () => {
    if (!items.length) return
    downloadTextFile(`${version}-uuids.txt`, items.join('\n'))
  }

  return (
    <section className="card">
      <h2>Generate Values</h2>
      <div className="tool-row">
        <input type="number" min="1" max="1000" value={count} onChange={(e) => setCount(e.target.value)} />
        <button onClick={loadValues}>Generate</button>
        <button onClick={() => onCopy(items.join('\n'))} disabled={!items.length}>Copy All</button>
        <button onClick={download} disabled={!items.length}>Download</button>
      </div>
      <ol className="uuid-list">
        {items.map((uuid) => (
          <li key={uuid}><code>{uuid}</code></li>
        ))}
      </ol>
    </section>
  )
}

function JsonFormatterPage({ onCopy }) {
  const [input, setInput] = useState('{"name":"Dev Tools Hub","active":true}')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const run = (type) => {
    try {
      const parsed = JSON.parse(input)
      if (type === 'pretty') setOutput(JSON.stringify(parsed, null, 2))
      if (type === 'minify') setOutput(JSON.stringify(parsed))
      if (type === 'sort') setOutput(JSON.stringify(deepSort(parsed), null, 2))
      if (type === 'validate') setOutput('Valid JSON')
      setError('')
    } catch (e) {
      setError(e.message)
      setOutput('')
    }
  }

  return (
    <section className="card">
      <h1>JSON Formatter</h1>
      <textarea className="editor" value={input} onChange={(e) => setInput(e.target.value)} />
      <div className="tool-row">
        <button onClick={() => run('validate')}>Validate</button>
        <button onClick={() => run('pretty')}>Prettify</button>
        <button onClick={() => run('minify')}>Minify</button>
        <button onClick={() => run('sort')}>Sort Keys</button>
      </div>
      {error && <p className="error">{error}</p>}
      <textarea className="editor" value={output} readOnly placeholder="Output..." />
      <div className="tool-row">
        <button onClick={() => onCopy(output)} disabled={!output}>Copy</button>
      </div>
    </section>
  )
}

function Base64Page({ onCopy }) {
  const [value, setValue] = useState('')
  const [out, setOut] = useState('')
  return (
    <section className="card">
      <h1>Base64 Encoder / Decoder</h1>
      <textarea className="editor" value={value} onChange={(e) => setValue(e.target.value)} />
      <div className="tool-row">
        <button onClick={() => setOut(btoa(unescape(encodeURIComponent(value))))}>Encode</button>
        <button onClick={() => {
          try { setOut(decodeURIComponent(escape(atob(value)))) } catch { setOut('Invalid Base64') }
        }}>Decode</button>
        <button onClick={() => onCopy(out)} disabled={!out}>Copy</button>
        <button onClick={() => { setValue(''); setOut('') }}>Clear</button>
      </div>
      <textarea className="editor" value={out} readOnly />
    </section>
  )
}

function RegexPage() {
  const [pattern, setPattern] = useState('\\w+')
  const [flags, setFlags] = useState('g')
  const [text, setText] = useState('test 123')
  const [out, setOut] = useState('')
  const test = () => {
    try { setOut(JSON.stringify(text.match(new RegExp(pattern, flags)), null, 2)) }
    catch (e) { setOut(`Invalid regex: ${e.message}`) }
  }
  return (
    <section className="card">
      <h1>Regex Tester</h1>
      <div className="tool-row">
        <input value={pattern} onChange={(e) => setPattern(e.target.value)} />
        <input value={flags} onChange={(e) => setFlags(e.target.value)} />
        <button onClick={test}>Run</button>
        <button onClick={() => { setPattern('\\w+'); setFlags('g'); setText('test 123'); setOut('') }}>Reset</button>
      </div>
      <textarea className="editor" value={text} onChange={(e) => setText(e.target.value)} />
      <pre>{out}</pre>
    </section>
  )
}

function CronPage({ onCopy }) {
  const [type, setType] = useState('daily')
  const map = { minute: '* * * * *', hourly: '0 * * * *', daily: '0 0 * * *', weekly: '0 0 * * 0', monthly: '0 0 1 * *' }
  const value = map[type]
  return (
    <section className="card">
      <h1>Cron Expression Generator</h1>
      <div className="tool-row">
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="minute">Every minute</option>
          <option value="hourly">Hourly</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
        <button onClick={() => onCopy(value)}>Copy</button>
      </div>
      <pre>{value}</pre>
    </section>
  )
}

function SqlFormatterPage({ onCopy }) {
  const [sql, setSql] = useState('select * from users where id = 1')
  const [out, setOut] = useState('')
  const format = () => {
    const kws = ['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'LIMIT', 'INSERT', 'UPDATE', 'DELETE', 'VALUES', 'SET', 'JOIN']
    let text = sql
    kws.forEach((k) => { text = text.replace(new RegExp(`\\b${k}\\b`, 'ig'), `\n${k}`) })
    setOut(text.trim())
  }
  return (
    <section className="card">
      <h1>SQL Formatter</h1>
      <textarea className="editor" value={sql} onChange={(e) => setSql(e.target.value)} />
      <div className="tool-row">
        <button onClick={format}>Format</button>
        <button onClick={() => onCopy(out)} disabled={!out}>Copy</button>
        <button onClick={() => { setSql('select * from users where id = 1'); setOut('') }}>Reset</button>
      </div>
      <textarea className="editor" value={out} readOnly />
    </section>
  )
}

function JwtDecoderPage({ onCopy }) {
  const [token, setToken] = useState('')
  const [head, setHead] = useState('')
  const [payload, setPayload] = useState('')
  const sample = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiRGV2IFRvb2xzIEh1YiIsInJvbGUiOiJkZXYiLCJpYXQiOjE3MDkzMDAwMDB9.signature'
  const decode = () => {
    try {
      const decoded = decodeJwtParts(token)
      setHead(JSON.stringify(decoded.header, null, 2))
      setPayload(JSON.stringify(decoded.payload, null, 2))
    } catch {
      setHead('Invalid JWT')
      setPayload('')
    }
  }
  return (
    <section className="card">
      <h1>JWT Decoder</h1>
      <textarea className="editor" value={token} onChange={(e) => setToken(e.target.value)} />
      <div className="tool-row">
        <button onClick={decode}>Decode</button>
        <button onClick={() => { setToken(sample); setHead(''); setPayload('') }}>Load Example</button>
        <button onClick={() => onCopy(payload)} disabled={!payload}>Copy Payload</button>
        <button onClick={() => { setToken(''); setHead(''); setPayload('') }}>Clear</button>
      </div>
      <h3>Header</h3>
      <pre>{head}</pre>
      <h3>Payload</h3>
      <pre>{payload}</pre>
    </section>
  )
}

function HashPage({ onCopy }) {
  const [input, setInput] = useState('')
  const [md5, setMd5] = useState('')
  const [sha, setSha] = useState('')
  const generate = async () => {
    setMd5(SparkMD5.hash(input))
    const bytes = new TextEncoder().encode(input)
    const hash = await crypto.subtle.digest('SHA-256', bytes)
    setSha(Array.from(new Uint8Array(hash)).map((x) => x.toString(16).padStart(2, '0')).join(''))
  }
  return (
    <section className="card">
      <h1>Hash Generator</h1>
      <textarea className="editor" value={input} onChange={(e) => setInput(e.target.value)} />
      <div className="tool-row">
        <button onClick={generate}>Generate</button>
        <button onClick={() => onCopy(`${md5}\n${sha}`)} disabled={!md5 && !sha}>Copy</button>
      </div>
      <p><strong>MD5:</strong> <code>{md5}</code></p>
      <p><strong>SHA-256:</strong> <code>{sha}</code></p>
    </section>
  )
}

function DiffPage() {
  const [a, setA] = useState('name: john\nage: 24')
  const [b, setB] = useState('name: john\nage: 25')
  return (
    <section className="card">
      <h1>Diff Checker</h1>
      <div className="tool-row">
        <button onClick={() => { setA('name: john\nage: 24'); setB('name: john\nage: 25') }}>Load Example</button>
        <button onClick={() => { setA(''); setB('') }}>Clear</button>
      </div>
      <div className="split">
        <textarea className="editor" value={a} onChange={(e) => setA(e.target.value)} placeholder="Left text" />
        <textarea className="editor" value={b} onChange={(e) => setB(e.target.value)} placeholder="Right text" />
      </div>
      <pre>{diffLines(a, b)}</pre>
    </section>
  )
}

function XmlToJsonPage({ onCopy }) {
  const [xml, setXml] = useState('<root><name>John</name></root>')
  const [json, setJson] = useState('')
  const convert = () => {
    try {
      const doc = new DOMParser().parseFromString(xml, 'text/xml')
      if (doc.querySelector('parsererror')) throw new Error('Invalid XML')
      setJson(JSON.stringify(xmlToObj(doc.documentElement), null, 2))
    } catch (e) {
      setJson(`Error: ${e.message}`)
    }
  }
  return (
    <section className="card">
      <h1>XML to JSON</h1>
      <textarea className="editor" value={xml} onChange={(e) => setXml(e.target.value)} />
      <div className="tool-row">
        <button onClick={convert}>Convert</button>
        <button onClick={() => onCopy(json)} disabled={!json}>Copy</button>
      </div>
      <textarea className="editor" value={json} readOnly />
    </section>
  )
}

function CsvToJsonPage({ onCopy }) {
  const [csv, setCsv] = useState('name,email\nJohn,john@test.com')
  const [json, setJson] = useState('')
  const convert = () => {
    try {
      const rows = csv.trim().split(/\r?\n/)
      const headers = parseCsvLine(rows[0] || '')
      const out = rows.slice(1).map((line) => {
        const cols = parseCsvLine(line)
        const row = {}
        headers.forEach((h, i) => { row[h] = cols[i] ?? '' })
        return row
      })
      setJson(JSON.stringify(out, null, 2))
    } catch (e) {
      setJson(`Error: ${e.message}`)
    }
  }
  return (
    <section className="card">
      <h1>CSV to JSON</h1>
      <textarea className="editor" value={csv} onChange={(e) => setCsv(e.target.value)} />
      <div className="tool-row">
        <button onClick={convert}>Convert</button>
        <button onClick={() => onCopy(json)} disabled={!json}>Copy</button>
        <button onClick={() => { setCsv('name,email\nJohn,john@test.com'); setJson('') }}>Reset</button>
      </div>
      <textarea className="editor" value={json} readOnly />
    </section>
  )
}

function MarkdownPage({ onCopy }) {
  const [md, setMd] = useState('# Hello\n\n**Bold** and *italic*')
  const html = useMemo(() => markdownToHtml(md), [md])
  return (
    <section className="card">
      <h1>Markdown to HTML</h1>
      <textarea className="editor" value={md} onChange={(e) => setMd(e.target.value)} />
      <div className="tool-row">
        <button onClick={() => onCopy(html)}>Copy HTML</button>
      </div>
      <textarea className="editor" value={html} readOnly />
      <div className="preview" dangerouslySetInnerHTML={{ __html: html }} />
    </section>
  )
}

function YamlPage({ onCopy }) {
  const [yaml, setYaml] = useState('name: John\nage: 30')
  const [json, setJson] = useState('')
  const convert = () => {
    try {
      setJson(JSON.stringify(simpleYamlToObj(yaml), null, 2))
    } catch (e) {
      setJson(`Error: ${e.message}`)
    }
  }
  return (
    <section className="card">
      <h1>YAML to JSON</h1>
      <textarea className="editor" value={yaml} onChange={(e) => setYaml(e.target.value)} />
      <div className="tool-row">
        <button onClick={convert}>Convert</button>
        <button onClick={() => onCopy(json)} disabled={!json}>Copy</button>
        <button onClick={() => { setYaml('name: John\nage: 30'); setJson('') }}>Reset</button>
      </div>
      <textarea className="editor" value={json} readOnly />
    </section>
  )
}

function PasswordPage({ onCopy }) {
  const [length, setLength] = useState(16)
  const [value, setValue] = useState('')
  const [symbols, setSymbols] = useState(true)
  const generate = () => {
    const chars = `abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789${symbols ? '!@#$%^&*()_+-=' : ''}`
    let out = ''
    for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)]
    setValue(out)
  }
  useEffect(() => { generate() }, [])
  return (
    <section className="card">
      <h1>Password Generator</h1>
      <div className="tool-row">
        <input type="number" min="6" max="128" value={length} onChange={(e) => setLength(Number(e.target.value))} />
        <label><input type="checkbox" checked={symbols} onChange={(e) => setSymbols(e.target.checked)} /> Symbols</label>
        <button onClick={generate}>Generate</button>
        <button onClick={() => onCopy(value)} disabled={!value}>Copy</button>
      </div>
      <pre>{value}</pre>
    </section>
  )
}

function LoremPage({ onCopy }) {
  const [count, setCount] = useState(3)
  const text = useMemo(() => {
    const p = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt.'
    return Array.from({ length: count }).map(() => p).join('\n\n')
  }, [count])
  return (
    <section className="card">
      <h1>Lorem Ipsum Generator</h1>
      <div className="tool-row">
        <input type="number" min="1" max="50" value={count} onChange={(e) => setCount(Number(e.target.value))} />
        <button onClick={() => onCopy(text)}>Copy</button>
      </div>
      <pre>{text}</pre>
    </section>
  )
}

function QrPage() {
  const [value, setValue] = useState('https://example.com')
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(value)}`
  return (
    <section className="card">
      <h1>QR Code Generator</h1>
      <input value={value} onChange={(e) => setValue(e.target.value)} />
      <div className="qr-wrap"><img src={url} alt="QR preview" /></div>
      <a href={url} download="qr-code.png">Download QR</a>
    </section>
  )
}

function RandomDataPage({ onCopy }) {
  const [rows, setRows] = useState(10)
  const [json, setJson] = useState('[]')
  const generate = () => {
    const names = ['John', 'Emma', 'Noah', 'Olivia', 'Liam', 'Ava', 'Mason', 'Sophia']
    const out = Array.from({ length: rows }).map((_, i) => {
      const name = names[Math.floor(Math.random() * names.length)]
      return {
        id: i + 1,
        name,
        email: `${name.toLowerCase()}${Math.floor(Math.random() * 999)}@mail.test`,
        phone: `+1-${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`
      }
    })
    setJson(JSON.stringify(out, null, 2))
  }
  useEffect(() => { generate() }, [])
  return (
    <section className="card">
      <h1>Random Test Data Generator</h1>
      <div className="tool-row">
        <input type="number" min="1" max="200" value={rows} onChange={(e) => setRows(Number(e.target.value))} />
        <button onClick={generate}>Generate</button>
        <button onClick={() => onCopy(json)}>Copy JSON</button>
      </div>
      <textarea className="editor" value={json} readOnly />
    </section>
  )
}

function DevCorner() {
  return (
    <section className="card prose">
      <h1>Dev Corner</h1>
      <ul className="mini-list">
        {Object.entries(DEV_SNIPPETS).map(([lang, code]) => (
          <li key={lang}><strong>{lang.toUpperCase()}</strong>: <code>{code}</code></li>
        ))}
      </ul>
    </section>
  )
}

function ApiDocs() {
  return (
    <section className="card prose">
      <h1>API Docs</h1>
      <ul>
        <li><code>GET /api/uuid</code></li>
        <li><code>GET /api/uuids?count=10</code></li>
        <li><code>GET /api/generate?version=v7&amp;count=20</code></li>
        <li><code>GET /api/guid?count=5</code></li>
      </ul>
    </section>
  )
}

function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

export default App
