#! /bin/sh
#
# Usage: checksum.sh filename
#
# checksum.sh computes the checksum of the repo's top level `package.json`
# and `package.json` files in package/, putting the hashes into a file in
# alphabetical order. Must be run at the top level of the repository.


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
find metapackages/*/package.json | xargs -I{} openssl md5 {} >> $FILE

sort -o $FILE $FILE
