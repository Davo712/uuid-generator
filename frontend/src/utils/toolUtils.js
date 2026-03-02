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

export function base64UrlDecode(input) {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
  return decodeURIComponent(escape(atob(padded)))
}

export function decodeJwtParts(token) {
  const [header, payload] = token.split('.')
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

export function parseCsvLine(line) {
  const out = []
  let cur = ''
  let quote = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') {
      if (quote && line[i + 1] === '"') { cur += '"'; i++ } else quote = !quote
    } else if (c === ',' && !quote) { out.push(cur); cur = '' }
    else cur += c
  }
  out.push(cur)
  return out
}

export function markdownToHtml(md) {
  let safe = md.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  safe = safe
    .replace(/^### (.*)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br />')
  return `<p>${safe}</p>`
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
  const children = Array.from(node.children)
  if (!children.length) return node.textContent
  const obj = {}
  children.forEach((child) => { obj[child.nodeName] = xmlToObj(child) })
  return { [node.nodeName]: obj }
}
