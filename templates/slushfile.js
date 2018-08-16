var gulp = require('gulp'),
    install = require('gulp-install'),
    conflict = require('gulp-conflict'),
    template = require('gulp-template'),
    gulpif = require('gulp-if'),
    inquirer = require('inquirer');

gulp.task('default', function (done) {
  inquirer.prompt([
    {
    	type: 'input',
    	name: 'name', 
    	message: 'Give your app a name', 
    	default: gulp.args.join(' ')                          // 从运行参数中获取值作为 name 的默认值。
    },
    {
    	type: 'confirm',
    	name: 'install',
      message: 'Install now?'
    }
  ]).then(function (answers) {
    gulp.src(['**'], { base: __dirname + '/templates' })      // 使用脚本所在的目录作为相对路径。
      .pipe(template(answers))                              // Lodash 模板支持，可以方便的在模板中进行插值。
      .pipe(conflict('./'))                                 // 当文件冲突时，询问是否覆盖。
      .pipe(gulp.dest('./'))                                // 输出到执行命令的当前文件夹中。
      .pipe(gulpif(answers.install, install()))
      .on('end', function () {
        done();                                               // 告知完成。
      });
  });
});