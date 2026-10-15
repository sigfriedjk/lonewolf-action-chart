#!/usr/bin/env bash
# Download development reference material; never commit the extracted books.
set -euo pipefail

repo_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
destination="$repo_root/all-books-simple"
url='https://www.projectaon.org/en/pub/all-books-simple.zip'

for tool in curl unzip; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    echo "Required tool not found: $tool" >&2
    exit 1
  fi
done

temp_dir="$(mktemp -d)"
trap 'rm -rf -- "$temp_dir"' EXIT

echo "Downloading $url"
curl --fail --location --retry 3 --connect-timeout 30 \
  --output "$temp_dir/all-books-simple.zip" "$url"
unzip -tq "$temp_dir/all-books-simple.zip"
mkdir -p -- "$destination"
unzip -q -o "$temp_dir/all-books-simple.zip" -d "$destination"
echo "Books extracted to $destination"
