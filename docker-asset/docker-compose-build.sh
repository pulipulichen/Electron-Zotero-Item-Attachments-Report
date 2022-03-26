#docker-compose build

export MY_UID="1000"
export MY_GID="1000"
export TZ=${TZ}
export DISPLAY=$DISPLAY 
export XMODIFIERS=$XMODIFIERS 
export QT_IM_MODULE=$QT_IM_MODULE 
export GTK_IM_MODULE=$GTK_IM_MODULE 
export AUDIO_ID=`getent group audio | cut -d: -f3`
export VIDEO_GID=`getent group video | cut -d: -f3`

#docker-compose run app bash
#docker-compose up
docker-compose build

