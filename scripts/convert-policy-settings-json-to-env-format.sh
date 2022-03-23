#!/usr/bin/env bash
set -eou pipefail
jq -r --arg environment $1 '.Environments[] | select(.Name==$environment) | .PolicySettings' src/policies/custom_policies/appsettings.json | jq -f -r scripts/json-to-env-format.jq
