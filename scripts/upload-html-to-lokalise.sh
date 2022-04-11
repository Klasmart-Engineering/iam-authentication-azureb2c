#!/usr/bin/env bash

set -eou pipefail

# Upload all HTML files to Lokalise iam-authentication-azureb2c (HTML) project
# https://app.lokalise.com/project/7931918561df16e85482d1.17678014

# Requires:
#   Programs:
#       - curl
#       - jq
#   Environment variables:
#       - LOKALISE_API_TOKEN (must have write access to Lokalise project)

PROJECT_ID=7931918561df16e85482d1.17678014
PAGES=("change-password" "forgot-password" "local-account-sign-up" "unified-sign-up-or-sign-in")
LANGUAGES=("en" "es" "id" "ko" "th" "vi" "zh-Hans")

if ! [ -x "$(command -v curl)" ]; then
    echo 'Error: curl is not installed.' >&2
    exit 1
fi

if ! [ -x "$(command -v jq)" ]; then
    echo 'Error: jq is not installed.' >&2
    exit 1
fi

if [[ -z "$LOKALISE_API_TOKEN" ]]; then
    echo "Must provide LOKALISE_API_TOKEN in environment" 1>&2
    exit 1
fi

for PAGE in "${PAGES[@]}"; do
    for LANGUAGE in "${LANGUAGES[@]}"; do
        if [ "$LANGUAGE" = "zh-Hans" ]; then
            locale="zh_CN"
        else
            locale="$LANGUAGE"
        fi
        jq --null-input \
            --arg page "$PAGE" \
            --arg language "$LANGUAGE" \
            --arg locale "$locale" \
            --arg data "$(base64 ./src/pages/$PAGE/$LANGUAGE/index.html -w 0)" \
            '{
            "filename": "\( $page ).html",
            "data": $data,
            "lang_iso": $locale,
            "replace_modified": true,
            "skip_detect_lang_iso": true,
        }' | curl --request POST \
            --url https://api.lokalise.com/api2/projects/$PROJECT_ID/files/upload \
            --header "content-type: application/json" \
            --header "x-api-token: $LOKALISE_API_TOKEN" \
            -d@- | jq
        echo "\n"
        # 6 req/s rate limit
        sleep 0.17s
    done
done
