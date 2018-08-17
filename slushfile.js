'use strict';

var gulp = require('gulp'),
  install = require('gulp-install'),
  conflict = require('gulp-conflict'),
  template = require('gulp-template'),
  rename = require('gulp-rename'),
  gulpif = require('gulp-if'),
  _ = require('underscore.string'),
  inquirer = require('inquirer'),
  runSequence = require('run-sequence'),
  path = require('path');


function format(string) {
  var username = string.toLowerCase();
  return username.replace(/\s/g, '');
}

var defaults = (function () {
  var workingDirName = path.basename(process.cwd()); 
  var homeDir; 
  var osUserName; 
  var configFile;
  var user = {};

  if (process.platform === 'win32') {
    homeDir = process.env.USERPROFILE;
    osUserName = process.env.USERNAME || path.basename(homeDir).toLowerCase();
  }
  else {
    homeDir = process.env.HOME || process.env.HOMEPATH;
    osUserName = homeDir && homeDir.split('/').pop() || 'root';
  }

  configFile = path.join(homeDir, '.gitconfig');

  if (require('fs').existsSync(configFile)) {
    user = require('iniparser').parseSync(configFile).user;
  }

  return {
    appName: workingDirName,
    userName: osUserName || format((user && user.name) || ''),
    authorName: (user && user.name) || '',
    authorEmail: (user && user.email) || ''
  };
})();

var slushAnswers = {}

gulp.task('slush', function (done) {
  var nameFromArg = gulp.args.join(' ')
  var prompts = [{
    name: 'appName',
    message: 'What is the name of your slush generator?',
    default: nameFromArg || defaults.appName
  }, {
    name: 'appDescription',
    message: 'What is the description?'
  }, {
    name: 'appVersion',
    message: 'What is the version of your slush generator?',
    default: '0.1.0'
  }, {
    name: 'authorName',
    message: 'What is the author name?',
    default: defaults.authorName
  }, {
    name: 'authorEmail',
    message: 'What is the author email?',
    default: defaults.authorEmail
  }, {
    name: 'userName',
    message: 'What is the github username?',
    default: defaults.userName
  }, {
    type: 'list',
    name: 'license',
    message: 'Choose your license type',
    choices: ['MIT', 'BSD'],
    default: 'MIT'
  }, {
    type: 'confirm',
    name: 'install',
    message: 'Install?'
  }, {
    type: 'confirm',
    name: 'moveon',
    message: 'Continue?'
  }];
  //Ask
  return inquirer
    .prompt(prompts)
    .then(function (answers) {
      slushAnswers = answers
      if (!answers.moveon) {
        return done();
      }
      answers.appNameSlug = _.slugify('Slush ' + answers.appName);
      answers.appNameOnly = _.capitalize(answers.appNameSlug.replace('slush-', ''));
      var d = new Date();
      answers.year = d.getFullYear();
      answers.date = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
      var files = [__dirname + '/templates/**', '!' + __dirname + '/templates/templates/**'];
      if (answers.license === 'MIT') {
        files.push('!' + __dirname + '/templates/LICENSE_BSD');
      } else {
        files.push('!' + __dirname + '/templates/LICENSE_MIT');
      }
      answers.appPath = path.resolve('.', nameFromArg ? answers.appNameSlug : '')
      gulp.src(files)
        .pipe(template(answers))
        .pipe(rename(function (file) {
          if (answers.license === 'MIT') {
            var mit = file.basename.replace('LICENSE_MIT', 'LICENSE');
            file.basename = mit;
          } else {
            var bsd = file.basename.replace('LICENSE_BSD', 'LICENSE');
            file.basename = bsd;
          }
          if (file.basename[0] === '_') {
            file.basename = '.' + file.basename.slice(1);
          }
        }))
        .pipe(conflict(answers.appPath))
        .pipe(gulp.dest(answers.appPath))
        .pipe(gulpif(answers.install, install()))
        .on('end', function () {
          done();
        });
    });
});

gulp.task('copy', ['slush'], function (done) {
  gulp.src(__dirname + '/templates/templates/**')
    .pipe(conflict(slushAnswers.appPath + '/templates'))
    .pipe(gulp.dest(slushAnswers.appPath + '/templates'))
    .on('end', function () {
      done();
    })
})

gulp.task('default', ['copy'])