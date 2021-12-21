docker run -it --rm \
    --name drag_and_drop_test_node_container \
    -v $PWD:/code \
    -w /code \
    -p 3015:3000 \
    --env-file .env \
    node:16.5.0-alpine3.11 \
    /bin/sh
