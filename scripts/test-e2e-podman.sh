#!/usr/bin/env bash
# Run the Playwright end-to-end suite in an isolated rootless Podman container.
# Any argument is forwarded to Playwright, so a single spec can be targeted.
set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd -- "${script_dir}/.." && pwd)"

image="localhost/infinity-qrcode-e2e:local"
containerfile="${repo_root}/container/Containerfile.e2e"

# The image copies nothing from the build context, so the container directory
# is enough: the repository's node_modules and .cache never reach the builder.
podman build \
  --file "${containerfile}" \
  --tag "${image}" \
  "${repo_root}/container"

# Browsers and the preview server share the container loopback, and no external
# network is available. The project stays writable so the build, the reports and
# the test results land on the host.
#
# Every capability is dropped, then SYS_CHROOT is added back: Firefox needs it
# to create its own content sandbox, which stays enabled.
podman run \
  --rm \
  --userns=keep-id \
  --user "$(id -u):$(id -g)" \
  --volume "${repo_root}:/work:rw,Z" \
  --workdir /work \
  --cap-drop=all \
  --cap-add=SYS_CHROOT \
  --security-opt=no-new-privileges \
  --read-only \
  --tmpfs /tmp:rw,mode=1777 \
  --env HOME=/tmp \
  --network none \
  --shm-size=1g \
  "${image}" \
  bun run test:e2e "$@"
