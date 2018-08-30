var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

// TODO: completely purge unnecessary routes
// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');

var projectRouter = require('./routes/project');
var projectListRouter = require('./routes/projectList');
var userRouter = require('./routes/user');


var app = express();


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//app.use('/', indexRouter);
//app.use('/users', usersRouter);

/*
 * ROUTES:
 *
 * /project/get
 * /project/add
 * /project/update
 * /projectlist
 * /user/ghprojects
 * /user/ghproject/get
 *
*/

app.use("/project", projectRouter);
app.use("/projectlist", projectListRouter);
app.use("/user", userRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});



// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
