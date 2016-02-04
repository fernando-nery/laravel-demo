var Gulp   = require('gulp');
var Elixir = require('laravel-elixir');

var MainBower = require('main-bower-files');
var Filter    = require('gulp-filter');
var Flatten   = require('gulp-flatten');

var Less = require('gulp-less');
var Path = require('path');
var Sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');

var Task = Elixir.Task;

Elixir.config.bowerDir = './bower_components';
Elixir.config.sourcemaps = true;

/*
 |
 | Less data
 |
 */

var ProjectLess = {
    root: "./",
    aplicacao: {
        destinationPath: {
            build: "./resources/assets/build/css",
            public: "./public/assets/css"
        },
        sourcePath:{
            root: "./resources/assets/less/start.less",
            filter: "./resources/assets/less/**/*.less",
            paths: [
                Elixir.config.bowerDir + "/bootstrap/less",
                Elixir.config.bowerDir + "/font-awesome/less/",
                "./resources/assets/less/"
            ],
            styles: [
                Elixir.config.bowerDir + "/select2/select2.css",
                Elixir.config.bowerDir + "/datatables/media/css/jquery.dataTables.css"
            ]
        }
    }
};

/*
 |
 | Vendors data
 |
 */
var ProjectVendors = {
    aplicacao: [
        "jquery",
        "select2",
        "jquery.inputmask",
        "jquery-validation",
        "datatables"
    ]
};

/*
 |
 | Javascript data
 |
 */
var ProjectJavascript = {
    outputName: "app.js",
    aplicacao: {
        destinationPath: "./public/assets/js/app.js",
        sourcePath:  "./resources/assets/js",
        requiredFiles: ProjectVendors.aplicacao
    }
};

/*
 |
 |  Less task
 |
 */
var lessTask = function(taskName, projectLess) {
    var thisTaskName = taskName+'-dev';
    new Task(thisTaskName, function() {
        return Gulp.src(projectLess.sourcePath.root)
            .pipe(Sourcemaps.init())
            .pipe(Less({
                paths: projectLess.sourcePath.paths
            }))
            .pipe(Sourcemaps.write())
            .pipe(Gulp.dest(projectLess.destinationPath.build))
            .on('end', function() {
                Gulp.src(projectLess.sourcePath.styles)
                    .pipe(concat("all.css"))
                    .pipe(Gulp.dest(projectLess.destinationPath.public));
            });
    });
};

/*
 |
 |  Javascript task
 |
 */
var javascriptTask = function(mix, projectJavascript) {
    mix.browserify("app.js", projectJavascript.destinationPath, projectJavascript.sourcePath, {
        debug: false,
        insertGlobals: true,
        fullPaths: false,
        require: projectJavascript.requiredFiles
    });
};

var callGulp = function(taskName, mixins) {
    var projectLess = eval('ProjectLess.' + taskName);
    var projectJavascript = eval('ProjectJavascript.' + taskName);

    mixins.appless(taskName, projectLess);
    mixins.appjavascript(mixins, projectJavascript);
};

/*
 |
 |  Elixir tasks
 |
 */
Elixir.extend('appless', function(taskName, projectLess) {
    lessTask(taskName, projectLess);
});

Elixir.extend('appjavascript', function(mix, projectJavascript) {
    javascriptTask(mix, projectJavascript);
});

Elixir.extend('appversion', function(mixin) {
    mixin.version([
        "assets/css/all.css",
        "assets/js/app.js"
    ]);
});


/*
 |
 | Application Elixir Task
 |
 */

Elixir.extend('aplicacao', function() {
    var name = 'aplicacao';
    var mixins = this.mixins;
    callGulp(name, mixins);
});

Elixir(function(mix) {
    mix.aplicacao();
    mix.appversion(mix);
});
