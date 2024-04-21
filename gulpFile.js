const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const webpack = require('webpack-stream');
const nodemon = require('gulp-nodemon');
const eslint = require('gulp-eslint-new');
const webpackConfig = require('./webpack.config.js');

const { exec } = require('child_process');

// adds, commits and pushes our code to github
const gitTask = (done) => {
    exec('git add . && git commit -m "auto commit" && git push', (err, stdout, stderr) =>{
        console.log(stdout);
        console.log(stderr);
        if (err) {
            //node couldn't execute the command
            return;
        }
        exec('git push', (err, stdout, stderr) => {
            if (err) {
                console.log('Error in git push:', stderr);
                return;
            }
            console.log('Successfully pushed to git');
            console.log(`stdout: ${stdout}`)
        });
        // the *entire* stdout and stderr (buffered)
        console.log(`stdout: ${stdout}`);
        console.log(`stderr ${stderr}`);

    });
    done();
};

// compile our css
const sassTask = (done) => {
    gulp.src('./scss/main.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./hosted'));

    done();
};

// run webpack with our configurations in webpack.config.js
const jsTask = (done) => {
    webpack(webpackConfig)
        .pipe(gulp.dest('./hosted'));
    
    done();
};

// lint our tasks as according to our .eslintrc file
const lintTask = (done) => {
    gulp.src('./server/**/*.js')
        .pipe(eslint({fix: true}))
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
    
    done();
}

const build = gulp.parallel(sassTask, jsTask, lintTask);
const herokuBuild = gulp.parallel(sassTask, jsTask);

const watch = (done) => {
    gulp.watch('./scss', sassTask);
    gulp.watch(['./client/*.js', './client/*.jsx'], jsTask);
    nodemon({ 
        script: './server/app.js',
        tasks: ['lintTask'],
        watch: ['./server'],
        done: done
    });
}

module.exports = {
    gitTask,

	sassTask,
    build,
    jsTask,
    lintTask,
    watch,
    herokuBuild,
};