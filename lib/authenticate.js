/**
 * Authenticate
 */

var program = require('commander'),
    clc     = require('cli-color'),
    rest    = require('restler'),
    fs      = require('fs');

var Authenticate = function() {
  this.login = function(callback, host, l, p) {
    loginCallback = callback;
    loginHost = host;
    serverLogin = l;
    serverPassword = p;
    // Todo Check if user is already logged!
    logUser();
  };

  this.logout = function() {

  };

  this.uploadExpression = function(path) {
    var local = fs.readdirSync(path);
    var expressions = [];
    var i = 0;
    while (i < local.length) {
      if (local[i].indexOf('.expression') !== -1) {
        expressions.push(local[i]);
      }
      ++i;
    }
    var bundleExpPath = path + '/' + expressions.pop();
    fs.stat(bundleExpPath, function (err, stats) {
      var options = {
        multipart : true,
        headers : {
          Cookie : sessionId,
          'Content-Length' : stats.size + 60
         },
        data : {
          //(path, filename, fileSize, encoding, contentType
          'bundle' : rest.file(bundleExpPath, null, stats.size, null, null)
        }
      };
      if (serverLogin && serverPassword){
        options.username = serverLogin;
        options.password = serverPassword;
      }
      rest.post('http://' + loginHost + '/expressions.json', options
      ).on(
        'complete', 
        function(data){
          if (data.errors) {
            var i = 0;
            while (i < data.errors.length){
              console.log(clc.redBright(data.errors[i]));
              ++i;
            }
            console.log(clc.redBright("UPLOAD OF EXPRESSION FAIL"));
          }
          else {
            console.log(clc.green("Expression Deployed"));
            console.log('See in on : http://' + loginHost + '/' + data.expression.full_system_name);
          }
        });
    });
  };

  // Private stuff;
  var loginHost = null;
  var loginCallback = null;
  var userLogin = null;
  var userPassword = null;
  var sessionId = null;

  var logUser = function() {
    console.log('Login to ' + clc.redBright(loginHost) + clc.white(' : '));
    askLogin();
  };

  var askLogin = function() {  
    program.prompt('email: ', askPassword);
  };

  var askPassword = function(login) {
    userLogin = login;
    program.password('password: ', logNow);
  };

  var logNow = function(passwd) {
    userPassword = passwd;
    var options = {
      multipart : false,
      data : {
        'user[email]' : userLogin,
        'user[password]' : userPassword
      }
    };

    if (serverLogin && serverPassword){
      options.username = serverLogin;
      options.password = serverPassword;
    }

    rest.post('https://' + loginHost + '/login.json', 
        options).on(
        'complete', 
        logOver);

  };

  var logOver = function(obj, response){
    if (obj.error) {
      console.log(clc.red(obj.error.options.message));
      askRetry();
    }
    else {
      var cookies = response.headers['set-cookie'];
      var urturnSessionId ='';
      var i = 0;
      while (i < cookies.length)
      {
        if (cookies[i].indexOf('_webdoc_session') === 0) {
          urturnSessionId = cookies[i];
        }
        ++i;
      }
      if (urturnSessionId) {
        console.log(clc.green('Login Success'));
        sessionId = urturnSessionId.substring(0, urturnSessionId.indexOf(' '));
        loginCallback();
      }
      else {
        console.log(clc.green('Login Fail for unknown reason!'));
        askRetry();
      }
    }
  };

  var askRetry = function() {
     program.confirm('Retry? [y/n] ', function(ok){
      if (ok) {
        askLogin();
      }
      else {
        // kill the program :D
        process.stdin.destroy();
      }
     });
  };

};


module.exports = Authenticate;