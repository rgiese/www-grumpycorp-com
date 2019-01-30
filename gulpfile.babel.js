import gulp from "gulp";

import {spawn} from "child_process";
import del from "del";
import path from "path";

import hugoBin from "hugo-bin";

import autoprefixer from "gulp-autoprefixer";
import hash from "gulp-hash";
import sass from "gulp-sass";
import newer from "gulp-newer";
import responsive from "gulp-responsive";
import imagemin from "gulp-imagemin";

import svgstore from "gulp-svgstore";
import svgmin from "gulp-svgmin";

import webpack from "webpack-stream";
import webpackConfig from "./webpack.conf";

import BrowserSync from "browser-sync";
import { doesNotReject } from "assert";
const browserSync = BrowserSync.create();

//
// Tasks
//

// Compile CSS with SASS
function compileCSS() {
  del("./dist/assets/css/**/*");

  return gulp.src("./src/sass/**/*.scss")
    .pipe(sass({ outputStyle : "compressed" }))
    .pipe(autoprefixer({ browsers : ["last 20 versions"] }))
    .pipe(hash())
    .pipe(gulp.dest("./dist/assets/css"))
    .pipe(hash.manifest("hash.json"))
    .pipe(gulp.dest("./site/data/generated"));
}

// Compile Javascript
function compileJS() {
  return gulp.src("./src/js/app.js")
    .pipe(webpack(webpackConfig))
    .pipe(gulp.dest("dist/"));
}

// Compile SVG
function compileSVG() {
  return gulp.src("./src/svg/icons/*.svg")
    .pipe(svgmin(function (file) {
      var prefix = path.basename(file.relative, path.extname(file.relative));
      return {
          plugins: [{
              cleanupIDs: {
                  prefix: prefix + '-',
                  minify: true
              }
          }]
      }
    }))
    .pipe(svgstore())
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

  // Allow top-level build task to regenerate CSS etc. (required due to the CSS hash trick (c.f. hash.json))
  gulp.watch([
    "./src/js/**/*.js",
    "./src/sass/**/*.scss",
    "./src/svg/**/*.svg",
    "./site/**/*",
    "!./site/data/generated/*" // ignore hash.json updates so we don't get into an infinite loop
  ], exports.build);
};

// Build site with Hugo
const hugoArgsDefault = ["-d", "../dist", "-s", "site", "-v"];
const hugoArgsPreview = ["--buildDrafts", "--buildFuture"];

function buildSite(cb, options) {
  const args = options ? hugoArgsDefault.concat(options) : hugoArgsDefault;

  process.env.NODE_ENV = "production";

  return spawn(hugoBin, args, {stdio: "inherit"}).on("close", (code) => {
    if (code === 0) {
      browserSync.reload();
      cb();
    } else {
      browserSync.notify("Hugo build failed :(");
      cb("Hugo build failed");
    }
  });
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
const hugoDependencies = gulp.parallel(compileCSS, compileJS, compileSVG, resizeImages);

exports.build = gulp.series(hugoDependencies, buildSite_Production);
exports.build_preview = gulp.series(hugoDependencies, buildSite_ProductionPreview);

// Run server tasks
exports.server = gulp.series(exports.build, runServer);
exports.server_preview = gulp.series(exports.build_preview, runServer);
