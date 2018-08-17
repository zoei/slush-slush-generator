;(function(undefined) {
  "use strict"
  var _global;
  var plugin = {
      add: function(n1,n2){ return n1 + n2; },//加
      sub: function(n1,n2){ return n1 - n2; },//减
      mul: function(n1,n2){ return n1 * n2; },//乘
      div: function(n1,n2){ return n1 / n2; },//除
      sur: function(n1,n2){ return n1 % n2; } //余
  }
  // 最后将插件对象暴露给全局对象
  _global = (function(){ return this || (0, eval)('this'); }());
  if (typeof module !== "undefined" && module.exports) {
      module.exports = plugin;
  } else if (typeof define === "function" && define.amd) {
      define(function(){return plugin;});
  } else {
      !('<%= appName %>' in _global) && (_global['<%= appName %>'] = plugin);
  }
}());