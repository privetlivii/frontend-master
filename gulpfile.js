const {src, dest, watch, series, parallel} = require('gulp');
const sass = require('gulp-dart-sass');
const autoprefixer = require('gulp-autoprefixer');
const csso = require('gulp-csso');
const rename = require('gulp-rename');
const fileinclude = require('gulp-ex-file-include');
const mode = require('gulp-mode')();
const htmlbeautify = require('gulp-html-beautify');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const basePath = require('path');
const svgmin = require('gulp-svgmin');
const svgstore = require('gulp-svgstore');
const uglify = require('gulp-uglify-es').default;
const imagemin = require("gulp-imagemin");
const imageminPngquant = require("imagemin-pngquant");
const imageminZopfli = require("imagemin-zopfli");
const imageminMozjpeg = require("imagemin-mozjpeg");
const webp = require("gulp-webp");
const imageminWebp = require("imagemin-webp");


// css task
const css = () => {
    return src('./src/styles/styles.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(rename('styles.min.css'))
        .pipe(csso())
        .pipe(dest('build/css'))
        .pipe(mode.development(browserSync.stream()));
}

// js task
const js = () => {
    return src('./src/js/script.js')
        .pipe(dest('./build/js'))
        .pipe(mode.development(browserSync.stream()));
}

// copy tasks
const copyImages = () => {
    return src('./src/img/**/*.{jpg,jpeg,png,svg}')
        .pipe(imagemin([
            imageminPngquant({
                speed: 5,
                quality: [0.6, 0.8]
            }),
            imageminZopfli({
                more: true
            }),
            imageminMozjpeg({
                progressive: true,
                quality: 90
            }),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: false},
                    {removeUnusedNS: false},
                    {removeUselessStrokeAndFill: false},
                    {cleanupIDs: false},
                    {removeComments: true},
                    {removeEmptyAttrs: true},
                    {removeEmptyText: true},
                    {collapseGroups: true}
                ]
            })
        ]))
        .pipe(dest('./build/img'));
}


const webpTask = () => {
    return src('./src/img/**/*.{jpg,jpeg,png}')
        .pipe(webp(imageminWebp({
            lossless: true,
            quality: 6,
            alphaQuality: 85
        })))
        .pipe(dest('./build/img'));
}

const copyFonts = () => {
    return src('./src/fonts/**/*.{woff,woff2}')
        .pipe(dest('build/fonts'));
}

const copyFavicon = () => {
    return src('./src/favicon/*.*')
        .pipe(dest('build/favicon'));
}

const html = () => {
    return src('./src/pages/*.html')
        .pipe(fileinclude())
        .pipe(mode.production(htmlbeautify()))
        .pipe(dest('build'))
        .pipe(mode.development(browserSync.stream()));
}

const svgStore = () => {
    return src('./src/img/sprite/*.svg')
        .pipe(svgmin(function (file) {
            let prefix = basePath.basename(file.relative, basePath.extname(file.relative));
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
        .pipe(dest('./build/img'));
}

// watch task
const watchForChanges = () => {
    browserSync.init({
        server: {
            baseDir: './build/'
        },
        notify: false,
        port: 7384
    });

    watch('./src/styles/**/*.scss', css);
    watch('./src/js/**/*.js', js);
    watch('./src/pages/*.html', html);
    watch('./src/img/**/*.{png,jpg,jpeg,svg}', series(copyImages));
    watch('./src/fonts/**/*.{woff,woff2}', series(copyFonts));
    watch('./src/favicon/*.*', series(copyFavicon));
}

// public tasks
exports.default = series(parallel(css, js, copyImages, copyFonts, html, copyFavicon), watchForChanges);
exports.build = series(parallel(css, js, copyImages, copyFonts, html, copyFavicon));
exports.sprite = series(svgStore);
exports.webpTask = series(webpTask);


/*var gulp = require('gulp'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync'),
    rigger = require('gulp-rigger'),
    uglify = require('gulp-uglify-es').default,
    fileinclude = require('gulp-ex-file-include'),
    cleancss = require('gulp-clean-css'),
    rename = require('gulp-rename'),
    autoprefixer = require('autoprefixer'),
    postcss = require('gulp-postcss'),
    notify = require('gulp-notify'),
    basePath = require('path'),
    svgmin = require('gulp-svgmin'),
    svgstore = require('gulp-svgstore'),
    imagemin = require('gulp-imagemin'),
    ftp = require('vinyl-ftp');*/


/*
const paths = {
    html: {
        src: './src/pages/!*.html',
        build: './build/',
        watch: './src/pages/!**!/!*.html'
    },
    styles: {
        src: './src/styles/!*.scss',
        build: './build/css',
        watch: './src/styles/!**!/!*.scss'
    },
    js: {
        src: './src/js/!*.js',
        build: './build/js',
        watch: './src/js/!**!/!*.js'
    },
    img: {
        src: './src/img/!**!/!*.*',
        build: './build/img',
        watch: './src/img/!**!/!*.*'
    },
    favicon: {
        src: './src/favicon/!**!/!*.*',
        build: './build/favicon',
        watch: './src/favicon/!**!/!*.*'
    },
    fonts: {
        src: './src/fonts/!*.*',
        build: './build/fonts',
        watch: './src/fonts/!*.*'
    }
};

// Local Server
gulp.task('browser-sync', function () {
    browserSync({
        server: {
            baseDir: './build/'
        },
        notify: false
    })
});

// SCSS Styles
gulp.task('styles', function () {
    return gulp.src(paths.styles.src)
        .pipe(sass({outputStyle: 'compressed'}).on("error", notify.onError()))
        .pipe(rename({suffix: '.min', prefix: ''}))
        .pipe(postcss([autoprefixer()]))
        .pipe(cleancss({level: {1: {specialComments: 0}}})) // Opt., comment out when debugging
        .pipe(gulp.dest(paths.styles.build))
        .pipe(browserSync.stream())
});

// JS
gulp.task('scripts', function () {
    return gulp.src(paths.js.src)
        .pipe(rigger())
        .pipe(gulp.dest(paths.js.build))
        .pipe(uglify())
        .pipe(rename({suffix: '.min', prefix: ''}))
        .pipe(gulp.dest(paths.js.build))
        .pipe(browserSync.reload({stream: true}))
});

// HTML Live Reload
gulp.task('code', function () {
    return gulp.src(paths.html.src)
        .pipe(fileinclude())
        .pipe(gulp.dest(paths.html.build))
        .pipe(browserSync.reload({stream: true}))
});

// img task
gulp.task('img', function () {
    return gulp.src(paths.img.src)
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.mozjpeg({quality: 80, progressive: true}),
            imagemin.optipng({optimizationLevel: 6}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ]))
        .pipe(gulp.dest(paths.img.build))
        .pipe(browserSync.reload({stream: true}))
});

// favicon task
gulp.task('favicon', function () {
    return gulp.src(paths.favicon.src)
        .pipe(gulp.dest(paths.favicon.build))
        .pipe(browserSync.reload({stream: true}))
});


// fonts task
gulp.task('fonts', function () {
    return gulp.src(paths.fonts.src)
        .pipe(gulp.dest(paths.fonts.build))
        .pipe(browserSync.reload({stream: true}))
});


gulp.task('img', gulp.parallel('img'));

gulp.task('favicon', gulp.parallel('favicon'));

gulp.task('fonts', gulp.parallel('fonts'));

gulp.task('watch', function () {
    gulp.watch(paths.styles.watch, gulp.parallel('styles'));
    gulp.watch(paths.js.watch, gulp.parallel('scripts'));
    gulp.watch(paths.html.watch, gulp.parallel('code'));
    gulp.watch(paths.img.watch, gulp.parallel('img'));
    gulp.watch(paths.favicon.watch, gulp.parallel('favicon'));
    gulp.watch(paths.fonts.watch, gulp.parallel('fonts'));
});

gulp.task('default', gulp.parallel('img', 'favicon', 'fonts', 'styles', 'scripts', 'code', 'browser-sync', 'watch'));*/
