#!/bin/bash
# pkexec pkill electron
cd "$(dirname "$0")"

tmp_file="/tmp/zotero.sqlite"
source_file="/data/zotero.sqlite"

if [ ! -f "$tmp_file" ]; then
  if [ -f "$source_file" ]; then
    cp -f "$source_file" "$tmp_file"
    echo "File copied successfully!"
  fi
else
    echo "File already exists."
fi

npm run start-electron

# ls -a $source_file
# ls -a $tmp_file
