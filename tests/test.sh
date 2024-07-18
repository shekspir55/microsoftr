#!/bin/bash
TEST_PATH=./tests
ENV_FILE="$TEST_PATH/.env"

set -a
source $ENV_FILE
set +a

DOTENV_CONFIG_PATH=$ENV_FILE jest --coverage --detectOpenHandles
