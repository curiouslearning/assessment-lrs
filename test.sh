export IS_CI=${1}

function cleanup {
	docker-compose down --remove-orphans
}

trap cleanup EXIT
cleanup

docker-compose build main
docker-compose run main
