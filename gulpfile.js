/**
 * gulpfile.js
 * @author Vivian
 * @version 1.0.0
 * copyright 2014-2017, gandxiaowei@gmail.com all rights reserved.
 */
var gulp = require('gulp');

var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var livereload = require('gulp-livereload');

gulp.task('build', function () {
    // app.js is your main JS file with all your module inclusions
    return browserify({entries: './src/relationship.js', debug: true})
        .transform("babelify", {presets: ["es2015"]})
        .bundle()
        .pipe(source('relationship.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init())
        // .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./dist/relationship.js'))
        .pipe(livereload());
});