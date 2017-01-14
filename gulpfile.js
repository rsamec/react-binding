var gulp = require('gulp');

//utils
var uglify = require('gulp-uglify');
var rename = require("gulp-rename");
//var typedoc = require("gulp-typedoc");
//var replace = require('gulp-regex-replace');

//typescript
var ts = require('gulp-typescript');
var merge = require('merge2');

//browserify
var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var tsify = require('tsify');

gulp.task('scripts', function() {
    var tsResult = gulp.src('src/*.ts')
        .pipe(ts({
            declaration: true,
            target: 'ES5',
            module: 'commonjs'
        }));

    return merge([
        tsResult.dts.pipe(gulp.dest('dist/definitions')),
        tsResult.js.pipe(gulp.dest('dist/lib'))
    ]);
});
gulp.task('bower', function () {
    return browserify({
        insertGlobals: true,
        standalone: 'Binder',
        debug: false
    })
        .add('src/Binder.ts')
        .plugin(tsify)
        .bundle()
        .on('error', function (error) { console.error(error.toString()); })
        .pipe(source('react-binding.js'))
        .pipe(buffer())
        .pipe(gulp.dest('dist'));
});


gulp.task('compress', ['bower'], function () {
    gulp.src('dist/react-binding.js')
        .pipe(uglify())
        .pipe(rename('react-binding.min.js'))
        .pipe(gulp.dest('dist'))
});

// gulp.task("typedoc", function () {
//     return gulp
//         .src(["src/*.ts"])
//         .pipe(typedoc({
//             module: "commonjs",
//             out: "./out",
//             name: "react-binding",
//             target: "es5"
//         }))
//         ;
// });

// Just running the tasks
gulp.task('default', ['scripts', 'compress']);
