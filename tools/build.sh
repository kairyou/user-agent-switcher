#!/bin/bash

src_dir='../src'
build_dir='../build'
js_cmd='java -jar compiler.jar --js'
css_cmd='java -jar yuicompressor-2.4.7.jar --type css'

cp $src_dir/manifest.json $build_dir
cp $src_dir/popup.html $build_dir

[[ ! -d $build_dir/assets ]] && mkdir -p $build_dir/assets
cp -r $src_dir/assets/fonts $build_dir/assets/fonts
cp -r $src_dir/assets/img $build_dir/assets

cp $src_dir/assets/jquery.min.js $build_dir/assets
$js_cmd $src_dir/assets/background.js > $build_dir/assets/background.js
$js_cmd $src_dir/assets/popup.js  > $build_dir/assets/popup.js
$js_cmd $src_dir/assets/doT.min.js > $build_dir/assets/doT.min.js
$js_cmd $src_dir/assets/FileSaver.js > $build_dir/assets/FileSaver.js
$js_cmd $src_dir/assets/jquery.confirm.js > $build_dir/assets/jquery.confirm.js
$js_cmd $src_dir/assets/utils.js > $build_dir/assets/utils.js
$css_cmd $src_dir/assets/style.css > $build_dir/assets/style.css
