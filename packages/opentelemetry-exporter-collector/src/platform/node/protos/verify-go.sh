#!/usr/bin/env bash

set -e


# Calculating checksum of the 'gen' subdirectory.
# This is more portable than git status which doesn't work with detached HEAD in Travis CI.
gen_checksum()
{
    find ./gen -type f -exec md5sum {} \; | sort -k 2 | md5sum
}

# Print checksum for each file in the 'gen' subdirectory.
# Useful to see which specific files need updating when the directory is out of sync.
print_checksum_details()
{
    find ./gen -type f -exec md5sum {} \; | sort -k 2
}

print_checksum_details
CHECKSUM_BEFORE=$(gen_checksum)
echo "checksum before: ${CHECKSUM_BEFORE}"
make gen-go
CHECKSUM_AFTER=$(gen_checksum)
echo "checksum after: ${CHECKSUM_AFTER}"

if [ "${CHECKSUM_BEFORE}" != "${CHECKSUM_AFTER}" ]
then
    print_checksum_details
    echo "'gen' directory is out of sync with protos. Please run 'gen-go.sh' and commit changes."
    exit 1
fi