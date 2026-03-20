#!/bin/bash
# Auto-lint TypeScript/JavaScript files after Edit/Write

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [[ -z "$FILE_PATH" ]]; then
  exit 0
fi

case "$FILE_PATH" in
  *.ts|*.tsx|*.js|*.jsx)
    CWD=$(echo "$INPUT" | jq -r '.cwd // empty')
    if [[ -n "$CWD" ]]; then
      cd "$CWD" && npx next lint --file "$FILE_PATH" 2>/dev/null || true
    fi
    ;;
esac

exit 0
