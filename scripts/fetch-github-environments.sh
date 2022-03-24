#!/bin/sh

# NB: Must ensure jq output is on a single line (-c) as Github workflow `set-output` doesn't support
# multiline strings

curl \
    -H "Accept: application/vnd.github.v3+json" \
    -H "Authorization: Bearer $1" \
    --fail \
    https://api.github.com/repos/KL-Engineering/iam-authentication-azureb2c/environments | jq -c '.environments | map(.name)'
