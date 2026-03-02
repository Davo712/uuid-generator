import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import SparkMD5 from 'spark-md5'
import { load as parseYaml } from 'js-yaml'
import {
  decodeJwtParts,
  deepSort,
  diffLines,
  generatePassword,
  markdownToHtml,
  parseCsvLine,
  simpleYamlToObj,
  validateCronExpression,
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
            <Route path="/tools/qr-generator" element={<QrPage onCopy={copy} />} />
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
  const [status, setStatus] = useState('Ready')

  const run = (type) => {
    try {
      const parsed = JSON.parse(input)
      if (type === 'pretty') {
        setOutput(JSON.stringify(parsed, null, 2))
        setStatus('Formatted')
      }
      if (type === 'minify') {
        setOutput(JSON.stringify(parsed))
        setStatus('Minified')
      }
      if (type === 'sort') {
        setOutput(JSON.stringify(deepSort(parsed), null, 2))
        setStatus('Sorted')
      }
      if (type === 'validate') {
        setOutput(JSON.stringify(parsed, null, 2))
        setStatus('Valid JSON')
      }
      setError('')
    } catch (e) {
      setError(e.message)
      setOutput('')
      setStatus('Invalid JSON')
    }
  }

  const download = () => {
    if (!output) return
    downloadFile('json-output.json', output, 'application/json;charset=utf-8')
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
        <button onClick={() => { setInput('{"name":"Example","active":true,"list":[3,1,2]}'); setOutput(''); setError(''); setStatus('Example loaded') }}>Load Example</button>
        <button onClick={() => { setInput(''); setOutput(''); setError(''); setStatus('Cleared') }}>Clear</button>
      </div>
      {error && <p className="error">{error}</p>}
      <textarea className="editor" value={output} readOnly placeholder="Output..." />
      <div className="tool-row">
        <button onClick={() => onCopy(output)} disabled={!output}>Copy</button>
        <button onClick={download} disabled={!output}>Download</button>
      </div>
      <p><strong>Status:</strong> {status}</p>
    </section>
  )
}

function Base64Page({ onCopy }) {
  const [value, setValue] = useState('')
  const [out, setOut] = useState('')
  const [urlSafe, setUrlSafe] = useState(false)
  const [error, setError] = useState('')
  const encode = () => {
    try {
      let base = btoa(unescape(encodeURIComponent(value)))
      if (urlSafe) base = base.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
      setOut(base)
      setError('')
    } catch {
      setOut('')
      setError('Unable to encode the input.')
    }
  }
  const decode = () => {
    try {
      let source = value
      if (urlSafe) source = source.replace(/-/g, '+').replace(/_/g, '/')
      source = source.padEnd(Math.ceil(source.length / 4) * 4, '=')
      setOut(decodeURIComponent(escape(atob(source))))
      setError('')
    } catch {
      setOut('')
      setError('Invalid Base64 input')
    }
  }
  const swap = () => {
    setValue(out)
    setOut(value)
    setError('')
  }
  return (
    <section className="card">
      <h1>Base64 Encoder / Decoder</h1>
      <textarea className="editor" value={value} onChange={(e) => setValue(e.target.value)} />
      <div className="tool-row">
        <label><input type="checkbox" checked={urlSafe} onChange={(e) => setUrlSafe(e.target.checked)} /> URL-safe mode</label>
        <button onClick={encode}>Encode</button>
        <button onClick={decode}>Decode</button>
        <button onClick={swap} disabled={!value && !out}>Swap</button>
        <button onClick={() => onCopy(out)} disabled={!out}>Copy</button>
        <button onClick={() => { setValue(''); setOut('') }}>Clear</button>
      </div>
      {error && <p className="error">{error}</p>}
      <textarea className="editor" value={out} readOnly />
    </section>
  )
}

function RegexPage() {
  const [pattern, setPattern] = useState('\\w+')
  const [flags, setFlags] = useState('g')
  const [text, setText] = useState('test 123')
  const [mode, setMode] = useState('match')
  const [replacement, setReplacement] = useState('_')
  const [out, setOut] = useState('')
  const [stats, setStats] = useState('')
  const test = () => {
    try {
      const re = new RegExp(pattern, flags)
      if (mode === 'match') {
        const matches = [...text.matchAll(re)].map((m) => ({ match: m[0], index: m.index, groups: m.groups || null }))
        setOut(JSON.stringify(matches, null, 2))
        setStats(`Matches: ${matches.length}`)
      } else if (mode === 'replace') {
        setOut(text.replace(re, replacement))
        const count = [...text.matchAll(new RegExp(pattern, flags.includes('g') ? flags : `${flags}g`))].length
        setStats(`Replacements: ${count}`)
      } else {
        const parts = text.split(re)
        setOut(JSON.stringify(parts, null, 2))
        setStats(`Parts: ${parts.length}`)
      }
    }
    catch (e) {
      setOut(`Invalid regex: ${e.message}`)
      setStats('')
    }
  }
  return (
    <section className="card">
      <h1>Regex Tester</h1>
      <div className="tool-row">
        <select value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="match">Match</option>
          <option value="replace">Replace</option>
          <option value="split">Split</option>
        </select>
        <input value={pattern} onChange={(e) => setPattern(e.target.value)} />
        <input value={flags} onChange={(e) => setFlags(e.target.value)} />
        {mode === 'replace' && <input value={replacement} onChange={(e) => setReplacement(e.target.value)} placeholder="Replacement" />}
        <button onClick={test}>Run</button>
        <button onClick={() => { setPattern('\\w+'); setFlags('g'); setText('test 123'); setReplacement('_'); setMode('match'); setOut(''); setStats('') }}>Reset</button>
      </div>
      <textarea className="editor" value={text} onChange={(e) => setText(e.target.value)} />
      {stats && <p><strong>{stats}</strong></p>}
      <pre>{out}</pre>
    </section>
  )
}

function CronPage({ onCopy }) {
  const [mode, setMode] = useState('preset')
  const [type, setType] = useState('daily')
  const [withSeconds, setWithSeconds] = useState(false)
  const [second, setSecond] = useState('0')
  const [minute, setMinute] = useState('0')
  const [hour, setHour] = useState('*')
  const [day, setDay] = useState('*')
  const [month, setMonth] = useState('*')
  const [weekday, setWeekday] = useState('*')
  const preset = {
    minute: '* * * * *',
    every5: '*/5 * * * *',
    hourly: '0 * * * *',
    daily: '0 0 * * *',
    weekdays9: '0 9 * * 1-5',
    weekly: '0 0 * * 0',
    monthly: '0 0 1 * *'
  }[type]

  const custom = withSeconds
    ? `${second} ${minute} ${hour} ${day} ${month} ${weekday}`
    : `${minute} ${hour} ${day} ${month} ${weekday}`
  const value = mode === 'preset' ? preset : custom
  const validation = validateCronExpression(value, mode === 'custom' && withSeconds)
  const human = cronHumanText(type, mode, withSeconds)
  return (
    <section className="card">
      <h1>Cron Expression Generator</h1>
      <div className="tool-row">
        <select value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="preset">Preset mode</option>
          <option value="custom">Custom mode</option>
        </select>
        {mode === 'preset' ? (
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="minute">Every minute</option>
            <option value="every5">Every 5 minutes</option>
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="weekdays9">Weekdays 09:00</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        ) : (
          <>
            <label><input type="checkbox" checked={withSeconds} onChange={(e) => setWithSeconds(e.target.checked)} /> Include seconds</label>
            {withSeconds && <input value={second} onChange={(e) => setSecond(e.target.value)} placeholder="Second (0-59)" />}
            <input value={minute} onChange={(e) => setMinute(e.target.value)} placeholder="Minute" />
            <input value={hour} onChange={(e) => setHour(e.target.value)} placeholder="Hour" />
            <input value={day} onChange={(e) => setDay(e.target.value)} placeholder="Day" />
            <input value={month} onChange={(e) => setMonth(e.target.value)} placeholder="Month" />
            <input value={weekday} onChange={(e) => setWeekday(e.target.value)} placeholder="Weekday" />
          </>
        )}
        <button onClick={() => onCopy(value)}>Copy</button>
        <button onClick={() => {
          setMode('preset')
          setType('daily')
          setWithSeconds(false)
          setSecond('0')
          setMinute('0')
          setHour('*')
          setDay('*')
          setMonth('*')
          setWeekday('*')
        }}>Reset</button>
      </div>
      <pre>{value}</pre>
      <p><strong>Description:</strong> {human}</p>
      {!validation.ok && <p className="error">{validation.error}</p>}
    </section>
  )
}

function SqlFormatterPage({ onCopy }) {
  const [sql, setSql] = useState('select * from users where id = 1')
  const [out, setOut] = useState('')
  const [upper, setUpper] = useState(true)
  const format = () => {
    const kws = ['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'LIMIT', 'INSERT', 'UPDATE', 'DELETE', 'VALUES', 'SET', 'JOIN']
    let text = sql
    kws.forEach((k) => {
      const keyword = upper ? k : k.toLowerCase()
      text = text.replace(new RegExp(`\\b${k}\\b`, 'ig'), `\n${keyword}`)
    })
    setOut(text.trim())
  }
  return (
    <section className="card">
      <h1>SQL Formatter</h1>
      <textarea className="editor" value={sql} onChange={(e) => setSql(e.target.value)} />
      <div className="tool-row">
        <label><input type="checkbox" checked={upper} onChange={(e) => setUpper(e.target.checked)} /> Uppercase keywords</label>
        <button onClick={format}>Format</button>
        <button onClick={() => onCopy(out)} disabled={!out}>Copy</button>
        <button onClick={() => downloadFile('formatted.sql', out, 'text/sql;charset=utf-8')} disabled={!out}>Download</button>
        <button onClick={() => { setSql('select * from users where id = 1'); setOut('') }}>Reset</button>
      </div>
      <textarea className="editor" value={out} readOnly />
    </section>
  )
}

function JwtDecoderPage({ onCopy }) {
  const [token, setToken] = useState('')
  const [secret, setSecret] = useState('')
  const [head, setHead] = useState('')
  const [payload, setPayload] = useState('')
  const [meta, setMeta] = useState('')
  const [verification, setVerification] = useState('')
  const sample = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiRGV2IFRvb2xzIEh1YiIsInJvbGUiOiJkZXYiLCJpYXQiOjE3MDkzMDAwMDB9.signature'
  const decode = async () => {
    try {
      const decoded = decodeJwtParts(token)
      setHead(JSON.stringify(decoded.header, null, 2))
      setPayload(JSON.stringify(decoded.payload, null, 2))
      const exp = decoded.payload.exp ? new Date(decoded.payload.exp * 1000).toISOString() : 'n/a'
      const iat = decoded.payload.iat ? new Date(decoded.payload.iat * 1000).toISOString() : 'n/a'
      setMeta(`Issued at: ${iat}\nExpires at: ${exp}`)
      if (decoded.header.alg === 'HS256' && secret && token.split('.').length === 3) {
        const [h, p, s] = token.split('.')
        const expected = await signHs256(`${h}.${p}`, secret)
        setVerification(expected === s ? 'Signature verified (HS256)' : 'Signature mismatch (HS256)')
      } else {
        setVerification('Verification unavailable (provide HS256 secret)')
      }
    } catch {
      setHead('Invalid JWT')
      setPayload('')
      setMeta('')
      setVerification('')
    }
  }
  return (
    <section className="card">
      <h1>JWT Decoder</h1>
      <textarea className="editor" value={token} onChange={(e) => setToken(e.target.value)} />
      <input value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="Secret for HS256 verification (optional)" />
      <div className="tool-row">
        <button onClick={decode}>Decode</button>
        <button onClick={() => { setToken(sample); setSecret(''); setHead(''); setPayload(''); setMeta(''); setVerification('') }}>Load Example</button>
        <button onClick={() => onCopy(payload)} disabled={!payload}>Copy Payload</button>
        <button onClick={() => { setToken(''); setSecret(''); setHead(''); setPayload(''); setMeta(''); setVerification('') }}>Clear</button>
      </div>
      <h3>Header</h3>
      <pre>{head}</pre>
      <h3>Payload</h3>
      <pre>{payload}</pre>
      {meta && <>
        <h3>Token Meta</h3>
        <pre>{meta}</pre>
      </>}
      {verification && <>
        <h3>Signature Check</h3>
        <pre>{verification}</pre>
      </>}
    </section>
  )
}

function HashPage({ onCopy }) {
  const [input, setInput] = useState('')
  const [algo, setAlgo] = useState('SHA-256')
  const [secret, setSecret] = useState('')
  const [useHmac, setUseHmac] = useState(false)
  const [encoding, setEncoding] = useState('hex')
  const [compare, setCompare] = useState('')
  const [md5, setMd5] = useState('')
  const [digest, setDigest] = useState('')
  const [error, setError] = useState('')
  const generate = async () => {
    try {
      if (useHmac && !secret) {
        setError('HMAC mode requires a secret key.')
        setDigest('')
        setMd5('')
        return
      }
      setMd5(SparkMD5.hash(input))
      const bytes = new TextEncoder().encode(input)
      if (useHmac) {
        const key = await crypto.subtle.importKey(
          'raw',
          new TextEncoder().encode(secret),
          { name: 'HMAC', hash: { name: algo } },
          false,
          ['sign']
        )
        const sig = await crypto.subtle.sign('HMAC', key, bytes)
        setDigest(formatBytes(new Uint8Array(sig), encoding))
      } else {
        const hash = await crypto.subtle.digest(algo, bytes)
        setDigest(formatBytes(new Uint8Array(hash), encoding))
      }
      setError('')
    } catch (e) {
      setError(`Hash generation failed: ${e.message}`)
    }
  }
  const compareStatus = compare && digest
    ? (normalizeHash(compare) === normalizeHash(digest) ? 'Hash matches' : 'Hash does not match')
    : ''
  return (
    <section className="card">
      <h1>Hash Generator</h1>
      <textarea className="editor" value={input} onChange={(e) => setInput(e.target.value)} />
      <div className="tool-row">
        <select value={algo} onChange={(e) => setAlgo(e.target.value)}>
          <option value="SHA-1">SHA-1</option>
          <option value="SHA-256">SHA-256</option>
          <option value="SHA-384">SHA-384</option>
          <option value="SHA-512">SHA-512</option>
        </select>
        <select value={encoding} onChange={(e) => setEncoding(e.target.value)}>
          <option value="hex">Hex output</option>
          <option value="base64">Base64 output</option>
        </select>
        <label><input type="checkbox" checked={useHmac} onChange={(e) => setUseHmac(e.target.checked)} /> HMAC (with secret)</label>
        {useHmac && <input value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="Secret key" />}
        <button onClick={generate}>Generate</button>
        <button onClick={() => onCopy(`${md5}\n${digest}`)} disabled={!md5 && !digest}>Copy</button>
        <button onClick={() => { setInput(''); setSecret(''); setCompare(''); setMd5(''); setDigest(''); setError('') }}>Clear</button>
      </div>
      {error && <p className="error">{error}</p>}
      <p><strong>MD5:</strong> <code>{md5}</code></p>
      <p><strong>{useHmac ? `HMAC ${algo}` : algo}:</strong> <code>{digest}</code></p>
      <input value={compare} onChange={(e) => setCompare(e.target.value)} placeholder="Paste hash to compare" />
      {compareStatus && <p><strong>{compareStatus}</strong></p>}
    </section>
  )
}

function DiffPage() {
  const [a, setA] = useState('name: john\nage: 24')
  const [b, setB] = useState('name: john\nage: 25')
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false)
  const left = ignoreWhitespace ? a.replace(/[ \t]+$/gm, '') : a
  const right = ignoreWhitespace ? b.replace(/[ \t]+$/gm, '') : b
  const diff = diffLines(left, right)
  const added = (diff.match(/^\+/gm) || []).length
  const removed = (diff.match(/^\-/gm) || []).length
  return (
    <section className="card">
      <h1>Diff Checker</h1>
      <div className="tool-row">
        <button onClick={() => { setA('name: john\nage: 24'); setB('name: john\nage: 25') }}>Load Example</button>
        <button onClick={() => { setA(''); setB('') }}>Clear</button>
        <label><input type="checkbox" checked={ignoreWhitespace} onChange={(e) => setIgnoreWhitespace(e.target.checked)} /> Ignore trailing spaces</label>
      </div>
      <div className="split">
        <textarea className="editor" value={a} onChange={(e) => setA(e.target.value)} placeholder="Left text" />
        <textarea className="editor" value={b} onChange={(e) => setB(e.target.value)} placeholder="Right text" />
      </div>
      <p><strong>Added:</strong> {added} | <strong>Removed:</strong> {removed}</p>
      <pre>{diff}</pre>
    </section>
  )
}

function XmlToJsonPage({ onCopy }) {
  const [xml, setXml] = useState('<root><name>John</name></root>')
  const [json, setJson] = useState('')
  const [error, setError] = useState('')
  const convert = () => {
    try {
      const doc = new DOMParser().parseFromString(xml, 'text/xml')
      if (doc.querySelector('parsererror')) throw new Error('Invalid XML')
      setJson(JSON.stringify(xmlToObj(doc.documentElement), null, 2))
      setError('')
    } catch (e) {
      setJson('')
      setError(e.message)
    }
  }
  return (
    <section className="card">
      <h1>XML to JSON</h1>
      <textarea className="editor" value={xml} onChange={(e) => setXml(e.target.value)} />
      <div className="tool-row">
        <button onClick={convert}>Convert</button>
        <button onClick={() => onCopy(json)} disabled={!json}>Copy</button>
        <button onClick={() => downloadFile('xml-converted.json', json, 'application/json;charset=utf-8')} disabled={!json}>Download</button>
        <button onClick={() => { setXml('<root><name>John</name></root>'); setJson(''); setError('') }}>Reset</button>
      </div>
      {error && <p className="error">{error}</p>}
      <textarea className="editor" value={json} readOnly />
    </section>
  )
}

function CsvToJsonPage({ onCopy }) {
  const [csv, setCsv] = useState('name,email\nJohn,john@test.com')
  const [delimiter, setDelimiter] = useState(',')
  const [hasHeader, setHasHeader] = useState(true)
  const [trimValues, setTrimValues] = useState(true)
  const [json, setJson] = useState('')
  const convert = () => {
    try {
      const rows = csv.trim().split(/\r?\n/).filter(Boolean)
      if (!rows.length) {
        setJson('[]')
        return
      }
      const first = parseCsvLine(rows[0], delimiter)
      const headers = hasHeader ? first : first.map((_, idx) => `column_${idx + 1}`)
      const dataRows = hasHeader ? rows.slice(1) : rows
      const out = dataRows.map((line) => {
        const cols = parseCsvLine(line, delimiter).map((v) => trimValues ? v.trim() : v)
        const row = {}
        headers.forEach((h, i) => { row[h] = cols[i] ?? '' })
        return row
      }).filter((row) => Object.values(row).some((v) => v !== ''))
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
        <input value={delimiter} onChange={(e) => setDelimiter(e.target.value)} maxLength={1} placeholder="Delimiter" />
        <label><input type="checkbox" checked={hasHeader} onChange={(e) => setHasHeader(e.target.checked)} /> First row is header</label>
        <label><input type="checkbox" checked={trimValues} onChange={(e) => setTrimValues(e.target.checked)} /> Trim values</label>
        <button onClick={convert}>Convert</button>
        <button onClick={() => onCopy(json)} disabled={!json}>Copy</button>
        <button onClick={() => downloadFile('csv-converted.json', json, 'application/json;charset=utf-8')} disabled={!json}>Download</button>
        <button onClick={() => { setCsv('name,email\nJohn,john@test.com'); setDelimiter(','); setHasHeader(true); setTrimValues(true); setJson('') }}>Reset</button>
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
        <button onClick={() => downloadFile('markdown-output.html', html, 'text/html;charset=utf-8')}>Download HTML</button>
        <button onClick={() => setMd('# Hello\n\n**Bold** and *italic*')}>Reset</button>
      </div>
      <textarea className="editor" value={html} readOnly />
      <div className="preview" dangerouslySetInnerHTML={{ __html: html }} />
    </section>
  )
}

function YamlPage({ onCopy }) {
  const [yamlText, setYamlText] = useState('name: John\nage: 30')
  const [json, setJson] = useState('')
  const convert = () => {
    try {
      const parsed = parseYaml(yamlText)
      setJson(JSON.stringify(parsed, null, 2))
    } catch (e) {
      try {
        setJson(JSON.stringify(simpleYamlToObj(yamlText), null, 2))
      } catch {
        setJson(`Error: ${e.message}`)
      }
    }
  }
  return (
    <section className="card">
      <h1>YAML to JSON</h1>
      <textarea className="editor" value={yamlText} onChange={(e) => setYamlText(e.target.value)} />
      <div className="tool-row">
        <button onClick={convert}>Convert</button>
        <button onClick={() => onCopy(json)} disabled={!json}>Copy</button>
        <button onClick={() => downloadFile('yaml-converted.json', json, 'application/json;charset=utf-8')} disabled={!json}>Download</button>
        <button onClick={() => { setYamlText('name: John\nage: 30'); setJson('') }}>Reset</button>
      </div>
      <textarea className="editor" value={json} readOnly />
    </section>
  )
}

function PasswordPage({ onCopy }) {
  const [length, setLength] = useState(16)
  const [value, setValue] = useState('')
  const [lower, setLower] = useState(true)
  const [upper, setUpper] = useState(true)
  const [numbers, setNumbers] = useState(true)
  const [symbols, setSymbols] = useState(true)
  const [excludeSimilar, setExcludeSimilar] = useState(false)
  const generate = () => {
    let out = generatePassword(Number(length) || 0, { lower, upper, numbers, symbols })
    if (excludeSimilar) out = out.replace(/[O0Il1]/g, 'x')
    setValue(out)
  }
  useEffect(() => { generate() }, [])
  const score = passwordScore(value)
  return (
    <section className="card">
      <h1>Password Generator</h1>
      <div className="tool-row">
        <input type="number" min="6" max="128" value={length} onChange={(e) => setLength(Number(e.target.value))} />
        <label><input type="checkbox" checked={lower} onChange={(e) => setLower(e.target.checked)} /> a-z</label>
        <label><input type="checkbox" checked={upper} onChange={(e) => setUpper(e.target.checked)} /> A-Z</label>
        <label><input type="checkbox" checked={numbers} onChange={(e) => setNumbers(e.target.checked)} /> 0-9</label>
        <label><input type="checkbox" checked={symbols} onChange={(e) => setSymbols(e.target.checked)} /> Symbols</label>
        <label><input type="checkbox" checked={excludeSimilar} onChange={(e) => setExcludeSimilar(e.target.checked)} /> Exclude similar chars</label>
        <button onClick={generate}>Generate</button>
        <button onClick={() => onCopy(value)} disabled={!value}>Copy</button>
      </div>
      <pre>{value}</pre>
      <p><strong>Strength:</strong> {score}</p>
    </section>
  )
}

function LoremPage({ onCopy }) {
  const [count, setCount] = useState(3)
  const [mode, setMode] = useState('paragraphs')
  const words = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt'.split(' ')
  const text = useMemo(() => {
    if (mode === 'words') return Array.from({ length: count }).map((_, i) => words[i % words.length]).join(' ')
    if (mode === 'sentences') {
      return Array.from({ length: count }).map((_, i) => {
        const chunk = Array.from({ length: 8 }, (_, j) => words[(i * 8 + j) % words.length]).join(' ')
        return `${chunk.charAt(0).toUpperCase()}${chunk.slice(1)}.`
      }).join(' ')
    }
    const p = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt.'
    return Array.from({ length: count }).map(() => p).join('\n\n')
  }, [count, mode])
  return (
    <section className="card">
      <h1>Lorem Ipsum Generator</h1>
      <div className="tool-row">
        <input type="number" min="1" max="50" value={count} onChange={(e) => setCount(Number(e.target.value))} />
        <select value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="paragraphs">Paragraphs</option>
          <option value="sentences">Sentences</option>
          <option value="words">Words</option>
        </select>
        <button onClick={() => onCopy(text)}>Copy</button>
      </div>
      <pre>{text}</pre>
    </section>
  )
}

function QrPage({ onCopy }) {
  const [value, setValue] = useState('https://example.com')
  const [size, setSize] = useState(220)
  const [margin, setMargin] = useState(2)
  const [format, setFormat] = useState('png')
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=${margin}&format=${format}&data=${encodeURIComponent(value)}`
  return (
    <section className="card">
      <h1>QR Code Generator</h1>
      <div className="tool-row">
        <input value={value} onChange={(e) => setValue(e.target.value)} />
        <input type="number" min="120" max="1024" value={size} onChange={(e) => setSize(Number(e.target.value) || 220)} />
        <input type="number" min="0" max="20" value={margin} onChange={(e) => setMargin(Number(e.target.value) || 0)} />
        <select value={format} onChange={(e) => setFormat(e.target.value)}>
          <option value="png">PNG</option>
          <option value="svg">SVG</option>
        </select>
        <button onClick={() => onCopy(url)}>Copy Image URL</button>
      </div>
      <div className="qr-wrap"><img src={url} alt="QR preview" /></div>
      <a href={url} download={`qr-code.${format}`}>Download QR</a>
    </section>
  )
}

function RandomDataPage({ onCopy }) {
  const [rows, setRows] = useState(10)
  const [includePhone, setIncludePhone] = useState(true)
  const [includeEmail, setIncludeEmail] = useState(true)
  const [includeCompany, setIncludeCompany] = useState(true)
  const [locale, setLocale] = useState('us')
  const [json, setJson] = useState('[]')
  const generate = () => {
    const presets = {
      us: {
        names: ['John', 'Emma', 'Noah', 'Olivia', 'Liam', 'Ava', 'Mason', 'Sophia'],
        companies: ['Acme Labs', 'North Peak', 'ByteWorks', 'Rapid Cloud']
      },
      eu: {
        names: ['Luca', 'Sofia', 'Mateo', 'Anna', 'Noah', 'Eva', 'Leo', 'Mila'],
        companies: ['EuroTech', 'Baltic Data', 'Alpine Systems', 'Nordic Dev']
      }
    }[locale]
    const out = Array.from({ length: rows }).map((_, i) => {
      const name = presets.names[Math.floor(Math.random() * presets.names.length)]
      const row = {
        id: i + 1,
        name
      }
      if (includeEmail) row.email = `${name.toLowerCase()}${Math.floor(Math.random() * 999)}@mail.test`
      if (includePhone) row.phone = `+1-${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`
      if (includeCompany) row.company = presets.companies[Math.floor(Math.random() * presets.companies.length)]
      return row
    })
    setJson(JSON.stringify(out, null, 2))
  }
  useEffect(() => { generate() }, [])
  return (
    <section className="card">
      <h1>Random Test Data Generator</h1>
      <div className="tool-row">
        <input type="number" min="1" max="200" value={rows} onChange={(e) => setRows(Number(e.target.value))} />
        <select value={locale} onChange={(e) => setLocale(e.target.value)}>
          <option value="us">US sample</option>
          <option value="eu">EU sample</option>
        </select>
        <label><input type="checkbox" checked={includeEmail} onChange={(e) => setIncludeEmail(e.target.checked)} /> Email</label>
        <label><input type="checkbox" checked={includePhone} onChange={(e) => setIncludePhone(e.target.checked)} /> Phone</label>
        <label><input type="checkbox" checked={includeCompany} onChange={(e) => setIncludeCompany(e.target.checked)} /> Company</label>
        <button onClick={generate}>Generate</button>
        <button onClick={() => onCopy(json)}>Copy JSON</button>
        <button onClick={() => downloadFile('random-test-data.json', json, 'application/json;charset=utf-8')}>Download JSON</button>
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

function cronHumanText(type, mode, withSeconds) {
  if (mode === 'custom') {
    return withSeconds
      ? 'Custom cron with seconds: second minute hour day month weekday'
      : 'Custom cron: minute hour day month weekday'
  }
  const map = {
    minute: 'Runs every minute',
    every5: 'Runs every 5 minutes',
    hourly: 'Runs every hour',
    daily: 'Runs daily at 00:00',
    weekdays9: 'Runs at 09:00 on weekdays',
    weekly: 'Runs weekly on Sunday at 00:00',
    monthly: 'Runs on day 1 of every month at 00:00'
  }
  return map[type] || 'Cron preset'
}

async function signHs256(data, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: { name: 'SHA-256' } },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))
  let binary = ''
  Array.from(new Uint8Array(signature)).forEach((byte) => { binary += String.fromCharCode(byte) })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function formatBytes(bytes, encoding) {
  if (encoding === 'base64') {
    let binary = ''
    bytes.forEach((byte) => { binary += String.fromCharCode(byte) })
    return btoa(binary)
  }
  return Array.from(bytes).map((x) => x.toString(16).padStart(2, '0')).join('')
}

function normalizeHash(value) {
  return value.trim().replace(/\s+/g, '').toLowerCase()
}

function downloadTextFile(filename, text) {
  downloadFile(filename, text, 'text/plain;charset=utf-8')
}

function downloadFile(filename, text, type) {
  const blob = new Blob([text], { type })
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

function passwordScore(password) {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  if (score <= 2) return 'Weak'
  if (score <= 4) return 'Medium'
  return 'Strong'
}

export default App
