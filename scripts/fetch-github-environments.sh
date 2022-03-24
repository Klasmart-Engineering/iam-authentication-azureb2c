#!/bin/sh

curl \
    -H "Accept: application/vnd.github.v3+json" \
    -H "Authorization: Bearer $1" \
    --fail \
    https://api.github.com/repos/KL-Engineering/iam-authentication-azureb2c/environments | jq '.environments | map(.name)'
