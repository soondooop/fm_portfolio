#!/usr/bin/env node
/**
 * beforeSubmitPrompt: block prompts that look like they contain secrets.
 * Output fields: continue, user_message only.
 */
const fs = require('fs')

function readInput() {
  try {
    return JSON.parse(fs.readFileSync(0, 'utf8') || '{}')
  } catch {
    return null
  }
}

const input = readInput()
if (!input) {
  process.stdout.write(JSON.stringify({ continue: true }))
  process.exit(0)
}

const prompt = String(input.prompt ?? '')

const PATTERNS = [
  /-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----/,
  /\b(api[_-]?key|secret[_-]?key|access[_-]?token)\s*[:=]\s*['"][^'"]{12,}/i,
  /\bsk-[a-zA-Z0-9]{20,}\b/,
  /\bghp_[a-zA-Z0-9]{20,}\b/,
  /\bxox[baprs]-[a-zA-Z0-9-]{10,}\b/,
  /\bAIza[0-9A-Za-z_-]{20,}\b/,
]

if (PATTERNS.some((re) => re.test(prompt))) {
  process.stdout.write(
    JSON.stringify({
      continue: false,
      user_message:
        '프롬프트에 API 키·토큰·프라이빗 키처럼 보이는 문자열이 있어 전송을 막았습니다. 해당 값을 지운 뒤 다시 보내주세요.',
    }),
  )
} else {
  process.stdout.write(JSON.stringify({ continue: true }))
}

process.exit(0)
