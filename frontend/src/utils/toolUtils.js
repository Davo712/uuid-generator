export function deepSort(value) {
  if (Array.isArray(value)) return value.map(deepSort)
  if (value && typeof value === 'object') {
    return Object.keys(value).sort().reduce((acc, key) => {
      acc[key] = deepSort(value[key])
      return acc
    }, {})
  }
  return value
}

export function base64UrlEncode(value) {
  const base = btoa(unescape(encodeURIComponent(value)))
  return base.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

export function base64UrlDecode(input) {
  if (!input) return ''
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
  return decodeURIComponent(escape(atob(padded)))
}

export function decodeJwtParts(token) {
  const parts = token.split('.')
  if (parts.length < 2) throw new Error('JWT must contain at least two parts')
  const [header, payload] = parts
  return {
    header: JSON.parse(base64UrlDecode(header || '')),
    payload: JSON.parse(base64UrlDecode(payload || ''))
  }
}

export function diffLines(a, b) {
  const left = a.split(/\r?\n/)
  const right = b.split(/\r?\n/)
  const max = Math.max(left.length, right.length)
  const out = []
  for (let i = 0; i < max; i++) {
    const l = left[i] ?? ''
    const r = right[i] ?? ''
    if (l === r) out.push(`  ${l}`)
    else {
      if (l) out.push(`- ${l}`)
      if (r) out.push(`+ ${r}`)
    }
  }
  return out.join('\n')
}

export function parseCsvLine(line, delimiter = ',') {
  const out = []
  let cur = ''
  let quote = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') {
      if (quote && line[i + 1] === '"') { cur += '"'; i++ } else quote = !quote
    } else if (c === delimiter && !quote) { out.push(cur); cur = '' }
    else cur += c
  }
  out.push(cur)
  return out
}

export function markdownToHtml(md) {
  let safe = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/^### (.*)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*)$/gm, '<h1>$1</h1>')
    .replace(/^\s*[-*] (.*)$/gm, '<li>$1</li>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
  safe = safe.replace(/(?:<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`)
  safe = safe.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br />')
  return `<p>${safe}</p>`.replace(/<p><(h[1-3]|ul)>/g, '<$1>').replace(/<\/(h[1-3]|ul)><\/p>/g, '</$1>')
}

export function simpleYamlToObj(text) {
  const obj = {}
  text.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    const idx = trimmed.indexOf(':')
    if (idx === -1) return
    const key = trimmed.slice(0, idx).trim()
    let value = trimmed.slice(idx + 1).trim()
    if (/^-?\d+(\.\d+)?$/.test(value)) value = Number(value)
    else if (value === 'true') value = true
    else if (value === 'false') value = false
    obj[key] = value
  })
  return obj
}

export function xmlToObj(node) {
  const obj = {}
  if (node.attributes?.length) {
    Array.from(node.attributes).forEach((attr) => {
      obj[`@${attr.name}`] = attr.value
    })
  }

  const children = Array.from(node.children || [])
  const text = (node.textContent || '').trim()

  if (!children.length) {
    if (Object.keys(obj).length === 0) return text
    if (text) obj['#text'] = text
    return obj
  }

  children.forEach((child) => {
    const key = child.nodeName
    const value = xmlToObj(child)
    if (obj[key] === undefined) obj[key] = value
    else if (Array.isArray(obj[key])) obj[key].push(value)
    else obj[key] = [obj[key], value]
  })

  return { [node.nodeName]: obj }
}

function isValidCronPart(part, min, max) {
  if (part === '*') return true
  if (/^\*\/\d+$/.test(part)) {
    const step = Number(part.slice(2))
    return step >= 1 && step <= max
  }
  if (/^\d+$/.test(part)) {
    const n = Number(part)
    return n >= min && n <= max
  }
  if (/^\d+-\d+$/.test(part)) {
    const [start, end] = part.split('-').map(Number)
    return start >= min && end <= max && start <= end
  }
  if (/^\d+-\d+\/\d+$/.test(part)) {
    const [range, stepRaw] = part.split('/')
    const [start, end] = range.split('-').map(Number)
    const step = Number(stepRaw)
    return start >= min && end <= max && start <= end && step >= 1 && step <= max
  }
  if (part.includes(',')) return part.split(',').every((token) => isValidCronPart(token.trim(), min, max))
  return false
}

export function validateCronExpression(expr, includeSeconds = false) {
  const parts = expr.trim().split(/\s+/)
  const expected = includeSeconds ? 6 : 5
  if (parts.length !== expected) return { ok: false, error: `Expected ${expected} fields` }

  const ranges = includeSeconds
    ? [[0, 59], [0, 59], [0, 23], [1, 31], [1, 12], [0, 7]]
    : [[0, 59], [0, 23], [1, 31], [1, 12], [0, 7]]

  const labels = includeSeconds
    ? ['Second', 'Minute', 'Hour', 'Day', 'Month', 'Weekday']
    : ['Minute', 'Hour', 'Day', 'Month', 'Weekday']

  for (let i = 0; i < parts.length; i++) {
    const [min, max] = ranges[i]
    if (!isValidCronPart(parts[i], min, max)) {
      return { ok: false, error: `Invalid ${labels[i]} field: "${parts[i]}"` }
    }
  }

  return { ok: true, error: '' }
}

export function generatePassword(length, pools) {
  const chars = []
  if (pools.lower) chars.push('abcdefghijklmnopqrstuvwxyz')
  if (pools.upper) chars.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ')
  if (pools.numbers) chars.push('0123456789')
  if (pools.symbols) chars.push('!@#$%^&*()_+-=[]{}')
  if (!chars.length || length < chars.length) return ''

  const out = []
  chars.forEach((set) => out.push(set[Math.floor(Math.random() * set.length)]))
  while (out.length < length) {
    const set = chars[Math.floor(Math.random() * chars.length)]
    out.push(set[Math.floor(Math.random() * set.length)])
  }

  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = out[i]
    out[i] = out[j]
    out[j] = tmp
  }
  return out.join('')
}
