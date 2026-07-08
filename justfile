export COMPOSE_IGNORE_ORPHANS := "true"

# Use bash shell in docker container
[group('docker')]
sh +args='':
    @- docker compose run --rm node \
        {{ if args == "" { "bash" } else { "bash -ic '" + args + "'" } }} \
        2>/dev/null

npm-install +args='':
    @ just sh npm install --ignore-scripts {{ args }}
