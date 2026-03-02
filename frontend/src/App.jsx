import { useMemo, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

function App() {
  const [singleUuid, setSingleUuid] = useState('')
  const [count, setCount] = useState(5)
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const validCount = useMemo(() => {
    if (!Number.isFinite(Number(count))) return 5
    return Math.max(1, Math.min(100, Number(count)))
  }, [count])

  const fetchSingle = async () => {
    setError('')
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/uuid`)
      if (!response.ok) throw new Error('Failed to generate UUID')
      const data = await response.json()
      setSingleUuid(data.uuid)
    } catch {
      setError('Unable to generate UUID. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchList = async () => {
    setError('')
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/uuids?count=${validCount}`)
      if (!response.ok) throw new Error('Failed to generate UUIDs')
      const data = await response.json()
      setList(data.uuids || [])
    } catch {
      setError('Unable to generate UUID list. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      setError('Clipboard access is blocked in this browser.')
    }
  }

  return (
    <div className="page">
      <header className="hero">
        <p className="eyebrow">Free Online Developer Tool</p>
        <h1>UUID Generator (v4)</h1>
        <p>
          Generate random UUIDs instantly for databases, distributed services, events, sessions, and API identifiers.
        </p>
      </header>

      <nav className="jump-links" aria-label="Page sections">
        <a href="#generate">Generator</a>
        <a href="#about">About UUID</a>
        <a href="#use-cases">Use Cases</a>
        <a href="#faq">FAQ</a>
      </nav>

      <section id="generate" className="card" aria-label="single uuid generator">
        <h2>Generate One UUID</h2>
        <div className="actions">
          <button onClick={fetchSingle} disabled={loading}>Generate UUID</button>
          <button onClick={() => copyText(singleUuid)} disabled={!singleUuid}>Copy</button>
        </div>
        <code className="result">{singleUuid || 'Click "Generate UUID" to create one value.'}</code>
      </section>

      <section className="ad-slot" aria-label="advertisement placeholder">
        <p>Advertisement</p>
        <small>AdSense Slot 1 - responsive banner</small>
      </section>

      <section className="card" aria-label="multiple uuid generator">
        <h2>Generate Multiple UUIDs</h2>
        <div className="actions">
          <label htmlFor="count">Count (1-100)</label>
          <input
            id="count"
            type="number"
            min="1"
            max="100"
            value={count}
            onChange={(e) => setCount(e.target.value)}
          />
          <button onClick={fetchList} disabled={loading}>Generate List</button>
          <button onClick={() => copyText(list.join('\n'))} disabled={!list.length}>Copy All</button>
        </div>
        <ul className="uuid-list">
          {list.map((uuid) => (
            <li key={uuid}>
              <code>{uuid}</code>
              <button onClick={() => copyText(uuid)}>Copy</button>
            </li>
          ))}
        </ul>
      </section>

      <section className="ad-slot" aria-label="advertisement placeholder">
        <p>Advertisement</p>
        <small>AdSense Slot 2 - in-content responsive</small>
      </section>

      {error && <p className="error">{error}</p>}

      <section id="about" className="content" aria-label="about uuid generator">
        <h2>What Is a UUID?</h2>
        <p>
          UUID means Universally Unique Identifier. It is a 128-bit value represented as 32 hexadecimal digits in five
          groups, such as <code>123e4567-e89b-12d3-a456-426614174000</code>. UUIDs are commonly used when systems need
          identifiers that are globally unique without centralized coordination.
        </p>
        <p>
          UUID v4 is randomly generated. It is widely used in modern software projects because it is simple and scales well.
        </p>
      </section>

      <section id="use-cases" className="content">
        <h2>Common UUID Use Cases</h2>
        <ul className="plain-list">
          <li>Primary keys for distributed databases.</li>
          <li>Public IDs in REST APIs where predictable IDs are risky.</li>
          <li>Correlation IDs for logs and tracing.</li>
          <li>Session, token, and event identifiers in backend services.</li>
          <li>Test data generation for QA and automation.</li>
        </ul>
      </section>

      <section id="faq" className="content">
        <h2>FAQ</h2>
        <h3>Is this UUID generator free?</h3>
        <p>Yes. The tool is free to use.</p>
        <h3>What UUID version is generated?</h3>
        <p>This tool generates version 4 UUIDs.</p>
        <h3>Can I generate many UUIDs at once?</h3>
        <p>Yes, you can generate up to 100 UUIDs in one request.</p>
        <h3>Can I use generated UUIDs in production?</h3>
        <p>For most application scenarios, UUID v4 is appropriate and commonly used in production systems.</p>
      </section>

      <footer>
        <a href="/privacy.html">Privacy Policy</a>
        <a href="/terms.html">Terms of Service</a>
      </footer>
    </div>
  )
}

export default App
