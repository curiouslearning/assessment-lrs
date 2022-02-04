export IS_CI=${1}

docker-compose down --remove-orphans
docker-compose build main
docker-compose --env-file .env.test run main
