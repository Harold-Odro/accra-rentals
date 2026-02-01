#!/bin/bash
# approve-safe-commands.sh
# Auto-approve safe commands for accra-rentals development

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# If no command found, let it through
if [ -z "$COMMAND" ]; then
  exit 0
fi

# Safe command patterns to auto-approve
SAFE_PATTERNS=(
  "^npm run dev"
  "^npm run build"
  "^npm run lint"
  "^npm run start"
  "^npm test"
  "^npx tsc"
  "^npx eslint"
  "^npx prettier"
  "^ls "
  "^cat "
  "^pwd$"
  "^git status"
  "^git log"
  "^git diff"
  "^git branch"
  "^git show"
  "^git remote -v"
)

for pattern in "${SAFE_PATTERNS[@]}"; do
  if [[ "$COMMAND" =~ $pattern ]]; then
    echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow","permissionDecisionReason":"Auto-approved: safe development command"}}'
    exit 0
  fi
done

# Dangerous patterns to block
DANGEROUS_PATTERNS=(
  "rm -rf /"
  "rm -rf ~"
  "rm -rf \*"
  ":(){:|:&};"
  "mkfs"
  "dd if="
  "> /dev/sda"
)

for pattern in "${DANGEROUS_PATTERNS[@]}"; do
  if [[ "$COMMAND" == *"$pattern"* ]]; then
    echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Blocked: dangerous command pattern detected"}}' >&2
    exit 2
  fi
done

# All other commands go through normal permission flow
exit 0
