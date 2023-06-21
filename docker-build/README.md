# Dockerhub

- https://docs.docker.com/get-started/04_sharing_app/
- 建立新的儲存庫 https://hub.docker.com/ 
- `docker image ls` 找出合適的名稱，例如「html-webpage-dashboard_app」，通常是最上面那個
- `docker tag electron-zotero-item-attachments-report_app pudding/docker-app:electron-ubuntu-20.04-20230617`
- `docker push pudding/docker-app:electron-ubuntu-20.04-20230617`
- 修改Dockerfile `FROM pudding/docker-app:electron-ubuntu-20.04-20230617`