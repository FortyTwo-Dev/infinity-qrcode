#!/usr/bin/env bash
# Run the Playwright end-to-end suite against the built app.
#
# With arguments, forward them unchanged to a single Playwright run, so a spec
# or a project can be targeted on the three configured projects.
#
# Without arguments, run Chromium and Firefox together, then run each top-level
# spec in a fresh WebKit process with one worker. WebKit stays stable when no
# two specs share a worker.
set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd -- "${script_dir}/.." && pwd)"

playwright="${repo_root}/node_modules/.bin/playwright"

cd -- "${repo_root}"

if [[ $# -gt 0 ]]; then
  "${playwright}" test "$@"
  exit 0
fi

"${playwright}" test --project=chromium --project=firefox

# Byte-order sorting keeps the spec order stable across hosts and locales.
LC_ALL=C
shopt -s nullglob
specs=(e2e/*.spec.ts)
shopt -u nullglob

if [[ ${#specs[@]} -eq 0 ]]; then
  echo "No specs found under e2e/*.spec.ts" >&2
  exit 1
fi

for spec in "${specs[@]}"; do
  "${playwright}" test "${spec}" --project=webkit --workers=1
done
