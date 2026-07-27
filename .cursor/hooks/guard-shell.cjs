#!/usr/bin/env node
/**
 * beforeShellExecution: block clearly destructive / force-push style commands.
 * Fail open on parse errors so normal agent work is not interrupted.
 */
const fs = require('fs')

function readInput() {
  try {
    return JSON.parse(fs.readFileSync(0, 'utf8') || '{}')
  } catch {
    return null
  }
}

function deny(userMessage, agentMessage) {
  process.stdout.write(
    JSON.stringify({
      permission: 'deny',
      user_message: userMessage,
      agent_message: agentMessage,
    }),
  )
}

function allow() {
  process.stdout.write(JSON.stringify({ permission: 'allow' }))
}

const input = readInput()
if (!input) {
  allow()
  process.exit(0)
}

const command = String(input.command || '')
const normalized = command.replace(/\s+/g, ' ').trim()

const DENY_PATTERNS = [
  { re: /\bgit\s+push\s+.*--force\b/i, why: 'force push는 훅에서 차단합니다.' },
  { re: /\bgit\s+push\s+-f\b/i, why: 'force push(-f)는 훅에서 차단합니다.' },
  { re: /\bgit\s+reset\s+--hard\b/i, why: 'git reset --hard는 훅에서 차단합니다.' },
  { re: /\bgit\s+clean\s+-.*[fd]/i, why: 'git clean -fd는 훅에서 차단합니다.' },
  {
    re: /\brm\s+(-[a-zA-Z]*r[a-zA-Z]*f|-rf|-fr)\b/i,
    why: 'rm -rf 계열 삭제는 훅에서 차단합니다.',
  },
  {
    re: /\bRemove-Item\b.*-Recurse\b.*-Force\b/i,
    why: 'Remove-Item -Recurse -Force는 훅에서 차단합니다.',
  },
  {
    re: /\b(del|rd|rmdir)\s+\/s\b/i,
    why: '재귀 삭제 명령은 훅에서 차단합니다.',
  },
]

for (const { re, why } of DENY_PATTERNS) {
  if (re.test(normalized)) {
    deny(why, `Blocked by project hook (guard-shell): ${why}`)
    process.exit(0)
  }
}

allow()
process.exit(0)
