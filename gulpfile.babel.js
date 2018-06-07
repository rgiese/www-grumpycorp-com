import gulp from "gulp";

import {spawn} from "child_process";
import del from "del";

import hugoBin from "hugo-bin";

import autoprefixer from "gulp-autoprefixer";
import gutil from "gulp-util";
import flatten from "gulp-flatten";
import hash from "gulp-hash";
import sass from "gulp-sass";

import webpack from "webpack";
import webpackConfig from "./webpack.conf";

import BrowserSync from "browser-sync";

const browserSync = BrowserSync.create();

// Hugo arguments
const hugoArgsDefault = ["-d", "../dist", "-s", "site", "-v"];
const hugoArgsPreview = ["--buildDrafts", "--buildFuture"];

const hugoDependencies = ["css", "js", "fonts"];

// Build tasks
gulp.task("build-prod", hugoDependencies, (cb) => buildSite(cb, [], "production"));
gulp.task("build-prod-preview", hugoDependencies, (cb) => buildSite(cb, hugoArgsPreview, "production"));

gulp.task("build-dev", hugoDependencies, (cb) => buildSite(cb));
gulp.task("build-dev-preview", hugoDependencies, (cb) => buildSite(cb, hugoArgsPreview));

// Run server tasks
gulp.task("server", ["build-dev"], (cb) => runServer(cb));
gulp.task("server-preview", ["build-dev-preview"], (cb) => runServer(cb));


// Compile CSS with SASS
gulp.task("css", () => {
  del("./dist/assets/css/**/*");

  return gulp.src("./src/sass/**/*.scss")
    .pipe(sass({ outputStyle : "compressed" }))
    .pipe(autoprefixer({ browsers : ["last 20 versions"] }))
    .pipe(hash())
    .pipe(gulp.dest("./dist/assets/css"))
    .pipe(hash.manifest("hash.json"))
    .pipe(gulp.dest("./site/data/generated"))
    .pipe(browserSync.stream());
});

// Compile Javascript
gulp.task("js", (cb) => {
  const myConfig = Object.assign({}, webpackConfig);

  return webpack(myConfig, (err, stats) => {
    if (err) throw new gutil.PluginError("webpack", err);
    gutil.log("[webpack]", stats.toString({
      colors: true,
      progress: true
    }));
    browserSync.reload();
    cb();
  });
});

// Move all fonts in a flattened directory
gulp.task('fonts', () => {
  return gulp.src("./src/fonts/**/*")
    .pipe(flatten())
    .pipe(gulp.dest("./dist/fonts"))
    .pipe(browserSync.stream());
});

// Development server with browsersync
function runServer() {
  browserSync.init({
    server: {
      baseDir: "./dist"
    }
  });
  gulp.watch("./src/js/**/*.js", ["js"]);
  gulp.watch("./src/sass/**/*.scss", ["css"]);
  gulp.watch("./src/fonts/**/*", ["fonts"]);
  gulp.watch("./site/**/*", ["build-dev"]);
};

/**
 * Run hugo and build the site
 */
function buildSite(cb, options, environment = "development") {
  const args = options ? hugoArgsDefault.concat(options) : hugoArgsDefault;

  process.env.NODE_ENV = environment;

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
