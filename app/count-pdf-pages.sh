#!/bin/bash

if [ $# -ne 1 ]; then
  echo "Usage: $0 <pdf_file>"
  exit 1
fi

pdf_file="$1"

# pages=$(pdftotext "$pdf_file" - | grep -c '\f')
pages=$(pdfinfo "$pdf_file" | awk '/^Pages:/ {print $2}')

echo "$pages"