import gulp from "gulp";

import {spawn} from "child_process";

import hugoBin from "hugo-bin";

import newer from "gulp-newer";
import responsive from "gulp-responsive";
import imagemin from "gulp-imagemin";

import webpack from "webpack-stream";
import webpackConfig from "./webpack.conf";

import BrowserSync from "browser-sync";
import { doesNotReject } from "assert";
const browserSync = BrowserSync.create();

var log = require('fancy-log');

//
// Tasks
//

// Compile Javascript
function compileJS() {
  return gulp.src("./src/js/app.js")
    .pipe(webpack(webpackConfig))
    .pipe(gulp.dest("dist/"));
}

// Compile SVG
function compileSVG() {
  return gulp.src("./src/svg/**/*.svg")
    .pipe(imagemin([imagemin.svgo()]))
    .pipe(gulp.dest("./dist/assets/svg"));
}

// Resize images to responsive sizes
function resizeImages() {
  return gulp.src("./src/img/**/*")
    .pipe(newer("./dist/img-original"))
    .pipe(gulp.dest("./dist/img-original"))
    .pipe(responsive({
      "**/*": [{
        width: 480,
        rename: {suffix: "-sm"},
      }, {
        width: 480 * 2,
        rename: {suffix: "-sm@2x"},
      }, {
        width: 752,
      }, {
        width: 752 * 2,
        withoutEnlargement: false,
        rename: {suffix: "@2x"},
      }],
    }, {
      silent: false,
      errorOnUnusedConfig: false // Accept empty input set for incremental builds
    }))
    .pipe(imagemin([
      imagemin.gifsicle(),
      imagemin.jpegtran(),
      imagemin.optipng(),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("./dist/img"));
}

// Development server
function runServer() {
  browserSync.init({
    server: {
      baseDir: "./dist"
    }
  });

  gulp.watch([
    "./src/js/**/*.js",
    "./src/svg/**/*.svg",
    "./site/**/*",
    "!./site/resources/_gen/**" // Don't watch Hugo-generated files
  ], exports.build);
};

// Build site with Hugo
const hugoArgsDefault = ["-d", "../dist", "-s", "site", "-v"];
const hugoArgsPreview = ["--buildDrafts", "--buildFuture"];

function buildSite(cb, options) {
  const args = options ? hugoArgsDefault.concat(options) : hugoArgsDefault;

  process.env.NODE_ENV = "production";

  log("Hugo binary: " + hugoBin);

  const ldLibPath = process.env.HOME + "/stdc++6/usr/lib/x86_64-linux-gnu ./hugo";
  log("LD_LIBRARY_PATH hack: " + ldLibPath);

  process.env.LD_LIBRARY_PATH = ldLibPath;

  return spawn(
    hugoBin, args, 
    {
      stdio: "inherit",
    })
    .on("close", (code) => {
      if (code === 0) {
        browserSync.reload();
        cb();
      } else {
        browserSync.notify("Hugo build failed :(");
        cb("Hugo build failed");
      }
    }
  );
}

function buildSite_Production(cb) {
  return buildSite(cb, []);
}

function buildSite_ProductionPreview(cb) {
  return buildSite(cb, hugoArgsPreview);
}


//
// Assembling it all
//

// Build tasks
const hugoDependencies = gulp.parallel(compileJS, compileSVG, resizeImages);

exports.build = gulp.series(hugoDependencies, buildSite_Production);
exports.build_preview = gulp.series(hugoDependencies, buildSite_ProductionPreview);

// Run server tasks
exports.server = gulp.series(exports.build, runServer);
exports.server_preview = gulp.series(exports.build_preview, runServer);
