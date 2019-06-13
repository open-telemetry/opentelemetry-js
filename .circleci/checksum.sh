#! /bin/sh
#
# Usage: checksum.sh filename
#
# checksum.sh is a script that computes the checksum of the repos top level
# `package.json` and package `package.json`s, outputting them into a file
# in alphabetical order. Must be run at the top level of the repository.


if [ -z $1 ]; then
    echo "Usage: checksum.sh filename"
    exit 1
fi

FILE=$1

# remove existing file
if [ -f $FILE ]; then
    rm $FILE
fi

openssl md5 package.json >> $FILE

find packages/*/package.json | xargs -I{} openssl md5 {} >> $FILE

sort -o $FILE $FILE
