#!/usr/bin/env bash
#
# Usage: ./build.sh <path/to/vidyut>

set -e

CRATE=$1

mkdir -p static/data
mkdir -p static/wasm

pushd ${CRATE}/vidyut-prakriya && wasm-pack build --target web --release
popd

mkdir -p vidyullekha
cp ${CRATE}/vidyut-prakriya/www/*.html vidyullekha
cp ${CRATE}/vidyut-prakriya/www/static/vidyut-prakriya-app.js static
cp ${CRATE}/vidyut-prakriya/pkg/*.wasm static/wasm
cp ${CRATE}/vidyut-prakriya/pkg/*.js static/wasm
cp ${CRATE}/vidyut-prakriya/data/*.tsv static/data

pushd ${CRATE}/vidyut-lipi && wasm-pack build --target web --release
popd

mkdir -p vidyut-chandas
cp ${CRATE}/vidyut-chandas/www/*.html vidyut-chandas
cp ${CRATE}/vidyut-chandas/www/static/vidyut-chandas-app.js static
cp ${CRATE}/vidyut-chandas/pkg/*.wasm static/wasm
cp ${CRATE}/vidyut-chandas/pkg/*.js static/wasm
cp ${CRATE}/vidyut-chandas/data/*.tsv static/data

mkdir -p vidyut-lipi
cp ${CRATE}/vidyut-lipi/www/*.html vidyut-lipi
cp ${CRATE}/vidyut-lipi/www/static/vidyut-lipi-app.js static
cp ${CRATE}/vidyut-lipi/pkg/*.wasm static/wasm
cp ${CRATE}/vidyut-lipi/pkg/*.js static/wasm

echo ""
echo "✅ Complete. Please test, commit, and deploy."
