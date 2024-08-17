FROM pudding/docker-app:electron-ubuntu-20.04-20230617

RUN apt-get update
RUN apt-get install -y poppler-utils

COPY ./app/count-pdf-pages.sh /count-pdf-pages.sh