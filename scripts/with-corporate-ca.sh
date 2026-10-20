#!/bin/sh
# Runs a Next.js command with the corporate TLS CA trusted, if one is installed.
#
# Why: machines behind a MITM secure web gateway (here: Check Point Harmony SASE /
# Perimeter81) get HTTPS re-signed with a private CA. macOS trusts it via the System
# keychain, so curl and Chrome work — but Node ships its own CA bundle and ignores the
# keychain, so every server-side fetch() to Shopify or Google Fonts dies with
# UNABLE_TO_GET_ISSUER_CERT_LOCALLY and the app looks broken.
#
# Setting this in ~/.zshrc is not enough: terminals opened earlier, VS Code tasks, and
# IDE run buttons don't re-source the profile, so the dev server silently starts without
# it. Doing it here means it works from any shell, IDE, or task runner.
#
# No CA file, no effect — CI and machines without interception run untouched, and TLS
# verification stays fully on either way.
#
# Re-export the bundle if the gateway rotates its cert:
#   mkdir -p ~/.config/certs && {
#     security find-certificate -a -c "Check Point"  -p /Library/Keychains/System.keychain
#     security find-certificate -a -c "Perimeter81" -p /Library/Keychains/System.keychain
#   } > ~/.config/certs/corporate-ca.pem

CA_BUNDLE="${NODE_EXTRA_CA_CERTS:-$HOME/.config/certs/corporate-ca.pem}"

if [ -f "$CA_BUNDLE" ]; then
  export NODE_EXTRA_CA_CERTS="$CA_BUNDLE"
fi

# `next` resolves from node_modules/.bin, which npm/pnpm put on PATH for run-scripts.
# Deliberately not `npx`, which could try the registry if local resolution ever failed.
exec next "$@"
