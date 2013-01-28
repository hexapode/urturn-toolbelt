var program = require('commander');

var term = {
  write: function (){
    console.log.apply(console, arguments);
  },

  title: function(){
    Array.prototype.unshift.call(arguments, ('-->'));
    term.write.apply(term, arguments);
  },

  prompt: function(message, type, callback){
    program.prompt(message, type, callback);
  }
}

module.exports = term;