import assert from 'node:assert/strict'
import {
  decodeJwtParts,
  deepSort,
  diffLines,
  generatePassword,
  markdownToHtml,
  parseCsvLine,
  simpleYamlToObj,
  validateCronExpression
} from '../src/utils/toolUtils.js'

function run(name, fn) {
  try {
    fn()
    console.log(`PASS: ${name}`)
  } catch (error) {
    console.error(`FAIL: ${name}`)
    console.error(error.message)
    process.exitCode = 1
  }
}

run('decodeJwtParts should parse header and payload', () => {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiRGF2aXQiLCJhZG1pbiI6dHJ1ZX0.signature'
  const result = decodeJwtParts(token)
  assert.equal(result.header.alg, 'HS256')
  assert.equal(result.payload.name, 'Davit')
  assert.equal(result.payload.admin, true)
})

run('deepSort should sort nested object keys', () => {
  const sorted = deepSort({ z: 1, a: { c: 3, b: 2 } })
  assert.deepEqual(Object.keys(sorted), ['a', 'z'])
  assert.deepEqual(Object.keys(sorted.a), ['b', 'c'])
})

run('parseCsvLine should handle quoted commas', () => {
  assert.deepEqual(parseCsvLine('name,"last, first",age'), ['name', 'last, first', 'age'])
})

run('markdownToHtml should render heading and strong text', () => {
  const html = markdownToHtml('# Title\n\n**Bold**')
  assert.ok(html.includes('<h1>Title</h1>'))
  assert.ok(html.includes('<strong>Bold</strong>'))
})

run('simpleYamlToObj should parse scalar values', () => {
  const data = simpleYamlToObj('name: John\nage: 30\nactive: true')
  assert.deepEqual(data, { name: 'John', age: 30, active: true })
})

run('diffLines should mark removed and added lines', () => {
  const out = diffLines('a\nb', 'a\nc')
  assert.ok(out.includes('- b'))
  assert.ok(out.includes('+ c'))
})

run('validateCronExpression should validate standard cron', () => {
  const ok = validateCronExpression('*/5 * * * *', false)
  assert.equal(ok.ok, true)
  const invalid = validateCronExpression('99 * * * *', false)
  assert.equal(invalid.ok, false)
})

run('generatePassword should include selected classes', () => {
  const password = generatePassword(16, { lower: true, upper: true, numbers: true, symbols: true })
  assert.equal(password.length, 16)
  assert.ok(/[a-z]/.test(password))
  assert.ok(/[A-Z]/.test(password))
  assert.ok(/[0-9]/.test(password))
  assert.ok(/[^A-Za-z0-9]/.test(password))
})

if (process.exitCode === 1) {
  process.exit(1)
}

console.log('All tool tests passed.')
