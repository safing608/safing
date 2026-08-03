#!/bin/sh

/docker-entrypoint.sh nginx -g "daemon off;" &

sleep 5

while :; do
  sleep 12h &
  wait $!
  nginx -s reload
done