#! /bin/sh

git config user.email "sidharthv96@gmail.com"
git config user.name "benchmarkbot"

git add .
git status
git commit -m "[skip ci]Update Benchmarks"
git push --set-upstream origin benchmarks
