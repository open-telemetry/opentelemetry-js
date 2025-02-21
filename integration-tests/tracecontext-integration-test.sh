
#!/bin/sh
set -e
# hard-coding the git tag to ensure stable builds.
TRACECONTEXT_GIT_TAG="98f210efd89c63593dce90e2bae0a1bdcb986f51"
# clone w3c tracecontext tests
mkdir -p target
rm -rf ./target/trace-context
git clone https://github.com/w3c/trace-context ./target/trace-context
cd ./target/trace-context && git checkout $TRACECONTEXT_GIT_TAG && cd -
python3 -m venv ./.venv
source ./.venv/bin/activate
pip3 install setuptools;
pip3 install aiohttp; 
node ./integration-tests/propagation-validation-server/validation-server.js 1>&2 &
EXAMPLE_SERVER_PID=$!
# give the app server a little time to start up. Not adding some sort
# of delay would cause many of the tracecontext tests to fail being
# unable to connect.
sleep 1
onshutdown() 
{
    kill $EXAMPLE_SERVER_PID
}
trap onshutdown EXIT
export STRICT_LEVEL=1
cd ./target/trace-context/test
python3 test.py http://127.0.0.1:5000/verify-tracecontext
