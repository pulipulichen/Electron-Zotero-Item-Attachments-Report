#!/bin/bash
pkexec pkill electron
cd "$(dirname "$0")"
cd ..
npm run up
