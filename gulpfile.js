"use strict";

// Load plugins
const autoprefixer = require("autoprefixer");
const browsersync = require("browser-sync").create();
const path = require("path");
const cssnano = require("cssnano");
const del = require("del");
const gulp = require("gulp");
const rename = require("gulp-rename");
const imagemin = require("gulp-imagemin");
const plumber = require("gulp-plumber");
const postcss = require("gulp-postcss");
const postcssScss = require("postcss-scss");

const svgstore = require("gulp-svgstore");
const webpack = require("webpack");
const webpackstream = require("webpack-stream");
const htmlmin = require("gulp-htmlmin");
const rev = require("gulp-rev");
const revRewrite = require("gulp-rev-rewrite");
const gulpif = require("gulp-if");

let posthtml = require("gulp-posthtml");
// let posthtmlInclude = require("posthtml-include");
let posthtmlModules = require("posthtml-modules");
let posthtmlEach = require("posthtml-each");

let env = process.env.NODE_ENV;

const srcPath = "assets";
const distPath = "public";
const paths = {
   src: {
      tailwind: "tailwind.config.js",
      html: [`${srcPath}/*.html`, `${srcPath}/include/**/*.html`],
      css: srcPath + "/css/style.css",
      svg: `${srcPath}/svg/*.svg`,
      js: `${srcPath}/js/**/*.js`,
      img: `${srcPath}/img/**/*`,
   },
   dest: {
      html: `${distPath}`,
      css: `${distPath}/css/`,
      svg: `${distPath}/svg/`,
      js: `${distPath}/js`,
      img: `${distPath}/img`,
   },
};

// BrowserSync
function browserSync(done) {
   browsersync.init({
      server: {
         baseDir: distPath,
      },
      port: 3000,
      open: false,
      notify: false,
   });
   done();
}

// BrowserSync Reload
function browserSyncReload(done) {
   browsersync.reload();
   done();
}

// Clean assets
function clean() {
   return del([`${distPath}/css/`, `${distPath}/svg/`, `${distPath}/js/`, `${distPath}/img/`]);
}

// Optimize Images
function images() {
   return gulp
      .src(paths.src.img)
      .pipe(gulpif(env === "production", imagemin()))
      .pipe(gulp.dest(paths.dest.img));
}

// CSS task

function css() {
   var tailwindcss = require("tailwindcss");
   let plugins = [require("postcss-import"), require("tailwindcss/nesting")(require("postcss-nested")), tailwindcss("tailwind.config.js"), require("postcss-hexrgba"), autoprefixer()];
   if (env === "production") {
      plugins.push(cssnano({ zindex: false }));
   }
   return gulp
      .src(paths.src.css)
      .pipe(
         postcss(plugins, {
            parser: postcssScss,
         })
      )
      .pipe(rename({ extname: ".css" }))
      .pipe(gulp.dest(paths.dest.css))
      .pipe(gulpif(env === "development", browsersync.stream()));
}

function scripts() {
   return gulp
      .src(paths.src.js)
      .pipe(plumber())
      .pipe(
         webpackstream(
            {
               mode: process.env.NODE_ENV,
               entry: {
                  main: [path.join(__dirname, `${srcPath}/js`, "index.js")],
               },
               output: {
                  path: path.join(__dirname, "/js/"),
                  filename: "[name].js",
                  //publicPath: '/js/'
                  publicPath: "/" + distPath + "/js/",
               },
               plugins: [
                  new webpack.ProvidePlugin({
                     $: "jquery",
                     jQuery: "jquery",
                  }),
               ],
               module: {
                  rules: [
                     {
                        test: /\.(js)$/,
                        exclude: /(node_modules)/,
                        loader: "babel-loader",
                        options: {
                           //presets: ['env']
                           presets: ["@babel/preset-env"],
                           // plugins: [
                           //    [
                           //       "@babel/plugin-proposal-class-properties",
                           //       {
                           //          loose: true,
                           //       },
                           //    ],
                           // ],
                        },
                     },
                     {
                        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                        use: [
                           {
                              loader: "file-loader",
                              options: {
                                 name: "[name].[ext]",
                                 outputPath: "fonts/",
                              },
                           },
                        ],
                     },
                     {
                        test: /\.(glsl|vs|fs|vert|frag)$/,
                        exclude: /node_modules/,
                        use: ["raw-loader", "glslify-loader"],
                     },
                  ],
               },

               resolve: {
                  extensions: [".js", ".jsx", ".css"], //add '.css' "root": __dirname
                  modules: ["node_modules", "src/js"],
               },
            },
            webpack
         )
      )
      .pipe(gulp.dest(paths.dest.js))
      .pipe(gulpif(env === "development", browsersync.stream()));
}

function versioning() {
   return gulp
      .src([`${distPath}/**/*.js`, `${distPath}/**/*.css`])
      .pipe(rev())
      .pipe(gulp.dest(distPath))
      .pipe(rev.manifest())
      .pipe(gulp.dest(distPath));
}

function rewrite() {
   const manifest = gulp.src(`${distPath}/rev-manifest.json`);

   return gulp.src(`${distPath}/*.html`).pipe(revRewrite({ manifest })).pipe(gulp.dest(distPath));
}

function html() {
   return gulp
      .src(paths.src.html, { base: srcPath })
      .pipe(plumber())
      .pipe(
         posthtml(
            [
               posthtmlModules({
                  root: "./assets",
                  tag: "include",
                  attribute: "src",
               }),
               posthtmlEach(),
            ],
            {}
         )
      )
      .pipe(gulpif(env === "production", htmlmin({ collapseWhitespace: true })))
      .pipe(gulp.dest(paths.dest.html))
      .pipe(gulpif(env === "development", browsersync.stream()));
}

function files() {
   gulp.src(`${srcPath}/widget/**/*.*`).pipe(gulp.dest(`${distPath}/widget`));
   gulp.src(`${srcPath}/fonts/*.*`).pipe(gulp.dest(`${distPath}/fonts/`));
   gulp.src(`${srcPath}/video/*.*`).pipe(gulp.dest(`${distPath}/video/`));
   gulp.src(`${srcPath}/sound/*.*`).pipe(gulp.dest(`${distPath}/sound/`));
   gulp.src(`${srcPath}/lottie/*.*`).pipe(gulp.dest(`${distPath}/lottie/`));
   gulp.src(`${srcPath}/json/*.*`).pipe(gulp.dest(`${distPath}/json/`));
   return gulp.src(`${srcPath}/favicons/*.*`).pipe(gulp.dest(`${distPath}/favicons/`));
}

function svg() {
   return gulp
      .src(paths.src.svg)
      .pipe(plumber())
      .pipe(svgstore())
      .pipe(gulp.dest(paths.dest.svg))
      .pipe(gulpif(env === "development", browsersync.stream()));
}

// Watch files
function watchFiles() {
   gulp.watch([`${srcPath}/css/**/*`, paths.src.tailwind], css);
   gulp.watch(`${srcPath}/svg/**/*`, svg);
   gulp.watch(`${srcPath}/js/**/*`, gulp.series(scripts, browserSyncReload));
   gulp.watch(`${srcPath}/**/*.html`, gulp.series(html, css, browserSyncReload));
   gulp.watch(`${srcPath}/img/**/*`, images);
}

// define complex tasks
const build = gulp.series(clean, gulp.parallel(html, css, images, svg, scripts, files));
const watch = gulp.parallel(gulp.parallel(html, css, images, svg, scripts, files), browserSync, watchFiles);

// export tasks
exports.images = images;
exports.css = css;
exports.svg = svg;
//exports.js = js;
//exports.html = html
exports.clean = clean;
exports.build = build;
//exports.watch = watch;
exports.default = watch;
