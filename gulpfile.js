'use strict';

var gulp = require('gulp'),
    util = require('gulp-util'),
    browserify = require('gulp-browserify');

gulp.task('default', function() {
    return gulp.src('./src/grid.js')
        .pipe(
            browserify({ debug: true })
                .on('error', util.log)
        )
        .pipe(gulp.dest('./build'));
});
