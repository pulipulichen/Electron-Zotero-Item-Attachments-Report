# Electron-Zotero-Item-Attachments-Report
Generate a report of a Zotero item's attachments.

GitHub Repo: https://github.com/pulipulichen/Electron-Zotero-Item-Attachments-Report
Private configuration: https://docs.google.com/spreadsheets/d/1TNaU8EFZPHUdp5WycfWUXgUIVUtyuEvueIreI89xSWA/edit#gid=0

# Setup

1. Copy `docker-compose.example.yml` to `docker-compose.yml` .
2. Setup Zotero path: `#- /PATH-TO-ZOTERO/Zotero/:/data` .
3. `npm run build`
4. `npm run up`
5. Add `"/PATH-TO/Electron-Zotero-Item-Attachments-Report/bin/Zotero Item Attachments.sh"` to Application Menu.
