/* YXNGJU V60.4 performance helpers — static-host safe */
(function () {
  'use strict';
  var pending = new Map();
  window.YXNGJUPerf = {
    /* Deduplicate identical in-flight GET requests when called by future modules. */
    fetchOnce: function (url, options) {
      options = options || {};
      var method = (options.method || 'GET').toUpperCase();
      if (method !== 'GET') return fetch(url, options);
      var key = method + ':' + url + ':' + (options.credentials || 'same-origin');
      if (pending.has(key)) return pending.get(key).then(function (r) { return r.clone(); });
      var request = fetch(url, options).finally(function () { pending.delete(key); });
      pending.set(key, request);
      return request.then(function (r) { return r.clone(); });
    },
    /* Debounce helper for search/autocomplete modules. */
    debounce: function (fn, delay) {
      var timer;
      return function () {
        var ctx = this, args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () { fn.apply(ctx, args); }, delay || 300);
      };
    },
    /* Abort slow external requests rather than leaving them hanging. */
    fetchWithTimeout: function (url, options, timeout) {
      var controller = new AbortController();
      var timer = setTimeout(function () { controller.abort(); }, timeout || 8000);
      options = Object.assign({}, options || {}, { signal: controller.signal });
      return fetch(url, options).finally(function () { clearTimeout(timer); });
    }
  };
  function ready() {
    document.documentElement.classList.add('yxngju-ready');
    document.documentElement.classList.remove('yxngju-loading');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready, { once: true });
  else ready();
})();
