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
cp ${CRATE}/vidyut-prakriya/www/index.html vidyullekha/index.html
cp ${CRATE}/vidyut-prakriya/www/static/vidyut-prakriya-app.js static
cp ${CRATE}/vidyut-prakriya/pkg/vidyut_prakriya_bg.wasm static/wasm
cp ${CRATE}/vidyut-prakriya/pkg/vidyut_prakriya.js static/wasm
cp ${CRATE}/vidyut-prakriya/data/dhatupatha.tsv static/data
cp ${CRATE}/vidyut-prakriya/data/sutrapatha.tsv static/data

pushd ${CRATE}/vidyut-lipi && wasm-pack build --target web --release
popd

mkdir -p vidyut-lipi
cp ${CRATE}/vidyut-lipi/www/index.html vidyut-lipi/index.html
cp ${CRATE}/vidyut-lipi/www/static/vidyut-lipi-app.js static
cp ${CRATE}/vidyut-lipi/pkg/*.wasm static/wasm
cp ${CRATE}/vidyut-lipi/pkg/*.js static/wasm

echo ""
echo "✅ Complete. Please commit and deploy."
