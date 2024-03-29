// Generated by CoffeeScript 1.6.3
(function() {
  var TEXT_SHADOW, THRESHOLD, UNVISITED_URL, create_link, create_text_shadow, find_visited, getData, populate_links, quantize_to_frames, rand_int, setThreshold, setup, stop_timer_and_clear, teardown, timer, update_and_start_timer, update_links;

  TEXT_SHADOW = '';

  THRESHOLD = Infinity;

  UNVISITED_URL = 'https://unvisited.xyz';

  rand_int = function(limit) {
    return Math.floor(Math.random() * limit);
  };

  create_text_shadow = function() {
    var i, r, vals, x, y, _i, _ref;
    vals = [];
    for (i = _i = 0; _i < 100; i = ++_i) {
      _ref = [20, 20, 50].map(rand_int), x = _ref[0], y = _ref[1], r = _ref[2];
      vals.push("" + x + "px " + y + "px " + r + "px white");
    }
    return vals.join(', ');
  };

  TEXT_SHADOW = create_text_shadow();

  create_link = function(url) {
    var a;
    a = document.createElement('a');
    a.href = url;
    a.innerText = 'innerText';
    a.style.color = 'white';
    a.style.textShadow = TEXT_SHADOW;
    return a;
  };

  populate_links = function(n) {
    var i, _i, _results;
    _results = [];
    for (i = _i = 0; 0 <= n ? _i < n : _i > n; i = 0 <= n ? ++_i : --_i) {
      _results.push(document.getElementById('linkContainer').appendChild(create_link(UNVISITED_URL)));
    }
    return _results;
  };

  update_links = function(url) {
    var a, _i, _len, _ref, _results;
    _ref = document.getElementById('linkContainer').children;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      a = _ref[_i];
      a.href = "http://www." + url;
      a.style.color = 'red';
      _results.push(a.style.color = 'white');
    }
    return _results;
  };

  timer = function() {
    var end, start;
    start = null;
    end = null;
    return function() {
      if (start == null) {
        start = Date.now();
        return start;
      } else if (end == null) {
        end = Date.now();
        return end - start;
      } else {
        start = Date.now();
        end = null;
        return start;
      }
    };
  };

  quantize_to_frames = function(fns) {
    if (fns.length === 1) {
      return (function() {
        return requestAnimationFrame(fns[0]);
      });
    }
    return function() {
      return requestAnimationFrame(function() {
        fns[0]();
        return quantize_to_frames(fns.slice(1, fns.length))();
      });
    };
  };

  setup = function() {
    var div;
    div = document.createElement('div');
    div.id = 'linkContainer';
    return document.body.appendChild(div);
  };

  update_and_start_timer = function(url, t) {
    return function() {
      update_links(url);
      return t();
    };
  };

  stop_timer_and_clear = function(stopFn, url, t) {
    return function() {
      stopFn(t(), url);
      return update_links(UNVISITED_URL);
    };
  };

  teardown = function() {
    return document.getElementById('linkContainer').remove();
  };

  setThreshold = function(unvisited_time) {
    THRESHOLD = 1.75 * unvisited_time;
    return console.log("Threshold: " + THRESHOLD);
  };

  find_visited = function(urls) {
    var benchmark, go, t, tasks, testStopFn, tests, url, _i, _len;
    t = timer();
    benchmark = [update_and_start_timer(url, t), stop_timer_and_clear(setThreshold, url, t)];
    testStopFn = function(time, url) {
      var a, p, result_container;
      result_container = document.getElementById('resultContainer');
      if (time > THRESHOLD) {
        a = document.createElement('a');
        a.href = "http://www." + url;
        a.innerText = url;
        p = document.createElement('p');
        p.appendChild(a);
        return document.getElementById('results').appendChild(p);
      }
    };
    tests = [];
    for (_i = 0, _len = urls.length; _i < _len; _i++) {
      url = urls[_i];
      tests.push(update_and_start_timer(url, t));
      tests.push(stop_timer_and_clear(testStopFn, url, t));
    }
    tasks = [
      setup, (function() {
        return populate_links(100);
      })
    ].concat(benchmark, tests, [teardown]);
    go = quantize_to_frames(tasks);
    return go();
  };

  getData = function() {
    var request;
    if (window.chrome == null) {
      document.write('Sorry, the script only works in Google Chrome for the moment.');
      return;
    }
    request = new XMLHttpRequest();
    request.overrideMimeType('application/json');
    request.open('GET', 'data.json', true);
    request.onreadystatechange = function() {
      var json;
      if (request.readyState === 4) {
        json = JSON.parse(request.responseText);
        return find_visited(json.urls);
      }
    };
    return request.send(null);
  };

  getData();

}).call(this);
