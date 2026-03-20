#!/bin/bash
# Block Claude from editing .env files — they contain production secrets
# (Stripe keys, InsForge credentials, Claude API key)

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [[ -z "$FILE_PATH" ]]; then
  exit 0
fi

if [[ "$FILE_PATH" == *.env* ]]; then
  echo "BLOCKED: Cannot modify .env files. They contain production credentials (Stripe keys, InsForge secrets, Claude API key). Edit environment variables manually." >&2
  exit 2
fi

exit 0
