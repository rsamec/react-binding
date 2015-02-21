var gulp = require('gulp');
var uglify = require('gulp-uglify');
var typedoc = require("gulp-typedoc");
var replace = require('gulp-regex-replace');
var ts = require('gulp-typescript');
var merge = require('merge2');
var rename = require("gulp-rename");

gulp.task('npm', function() {
    var tsResult = gulp.src('src/BindToMixin.ts')
        .pipe(ts({
            declarationFiles: true,
            noExternalResolve: true,
            target:'ES5',
            module:'commonjs'
        }));

    return tsResult.js
        .pipe(replace({regex:'module.exports = DataBinding;', replace:'module.exports = BindToMixin;'}))
        .pipe(gulp.dest('dist'));
});
gulp.task('bower', function() {
    var tsResult = gulp.src('src/BindToMixin.ts')
        .pipe(ts({
            declarationFiles: true,
            noExternalResolve: true,
            target:'ES5',
            module:'commonjs'
        }));

    return tsResult.js
        .pipe(replace({regex:'module.exports = DataBinding;', replace:''}))
        .pipe(rename('react-binding.js'))
        .pipe(gulp.dest('dist'));
});


gulp.task('compress',['bower'], function() {
    gulp.src('dist/react-binding.js')
        .pipe(uglify())
        .pipe(rename('react-binding.min.js'))
        .pipe(gulp.dest('dist'))
});

gulp.task("typedoc", function() {
    return gulp
        .src(["src/*.ts"])
        .pipe(typedoc({
            module: "commonjs",
            out: "./out",
            name: "react-binding",
            target: "es5"
        }))
        ;
});

// Just running the tasks
gulp.task('default', ['npm', 'compress']);
