function debounce(fn, wait) {
  var timer;
  return function () {
    clearTimeout(timer);
    var args = arguments;
    var self = this;
    timer = setTimeout(function () { fn.apply(self, args); }, wait || 300);
  };
}

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

export { debounce, clamp };
