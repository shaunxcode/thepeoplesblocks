/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(p, parent, orig){
  var path = require.resolve(p)
    , mod = require.modules[path];

  // lookup failed
  if (null == path) {
    orig = orig || p;
    parent = parent || 'root';
    throw new Error('failed to require "' + orig + '" from "' + parent + '"');
  }

  // perform real require()
  // by invoking the module's
  // registered function
  if (!mod.exports) {
    mod.exports = {};
    mod.client = mod.component = true;
    mod.call(this, mod, mod.exports, require.relative(path));
  }

  return mod.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path){
  var orig = path
    , reg = path + '.js'
    , regJSON = path + '.json'
    , index = path + '/index.js'
    , indexJSON = path + '/index.json';

  return require.modules[reg] && reg
    || require.modules[regJSON] && regJSON
    || require.modules[index] && index
    || require.modules[indexJSON] && indexJSON
    || require.modules[orig] && orig
    || require.aliases[index];
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `fn`.
 *
 * @param {String} path
 * @param {Function} fn
 * @api private
 */

require.register = function(path, fn){
  require.modules[path] = fn;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to){
  var fn = require.modules[from];
  if (!fn) throw new Error('failed to alias "' + from + '", it does not exist');
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj){
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function fn(path){
    var orig = path;
    path = fn.resolve(path);
    return require(path, parent, orig);
  }

  /**
   * Resolve relative to the parent.
   */

  fn.resolve = function(path){
    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    if ('.' != path.charAt(0)) {
      var segs = parent.split('/');
      var i = lastIndexOf(segs, 'deps') + 1;
      if (!i) i = 0;
      path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
      return path;
    }
    return require.normalize(p, path);
  };

  /**
   * Check if module is defined at `path`.
   */

  fn.exists = function(path){
    return !! require.modules[fn.resolve(path)];
  };

  return fn;
};require.register("component-underscore/index.js", function(module, exports, require){
//     Underscore.js 1.3.3
//     (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore is freely distributable under the MIT license.
//     Portions of Underscore are inspired or borrowed from Prototype,
//     Oliver Steele's Functional, and John Resig's Micro-Templating.
//     For all details and documentation:
//     http://documentcloud.github.com/underscore

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var push             = ArrayProto.push,
      slice            = ArrayProto.slice,
      unshift          = ArrayProto.unshift,
      toString         = ObjProto.toString,
      hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) { return new wrapper(obj); };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root['_'] = _;
  }

  // Current version.
  _.VERSION = '1.3.3';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (_.has(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    return results;
  };

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError('Reduce of empty array with no initial value');
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var reversed = _.toArray(obj).reverse();
    if (context && !initial) iterator = _.bind(iterator, context);
    return initial ? _.reduce(reversed, iterator, memo, context) : _.reduce(reversed, iterator);
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    each(obj, function(value, index, list) {
      if (!iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if a given value is included in the array or object using `===`.
  // Aliased as `contains`.
  _.include = _.contains = function(obj, target) {
    var found = false;
    if (obj == null) return found;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    found = any(obj, function(value) {
      return value === target;
    });
    return found;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    return _.map(obj, function(value) {
      return (_.isFunction(method) ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See: https://bugs.webkit.org/show_bug.cgi?id=80797
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array.
  _.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function(value) {
      rand = Math.floor(Math.random() * ++index);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, val, context) {
    var iterator = lookupIterator(obj, val);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      if (a === void 0) return 1;
      if (b === void 0) return -1;
      return a < b ? -1 : a > b ? 1 : 0;
    }), 'value');
  };

  // An internal function to generate lookup iterators.
  var lookupIterator = function(obj, val) {
    return _.isFunction(val) ? val : function(obj) { return obj[val]; };
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(obj, val, behavior) {
    var result = {};
    var iterator = lookupIterator(obj, val);
    each(obj, function(value, index) {
      var key = iterator(value, index);
      behavior(result, key, value);
    });
    return result;
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = function(obj, val) {
    return group(obj, val, function(result, key, value) {
      (result[key] || (result[key] = [])).push(value);
    });
  };

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = function(obj, val) {
    return group(obj, val, function(result, key, value) {
      result[key] || (result[key] = 0);
      result[key]++;
    });
  };

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator) {
    iterator || (iterator = _.identity);
    var value = iterator(obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >> 1;
      iterator(array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely convert anything iterable into a real, live array.
  _.toArray = function(obj) {
    if (!obj)                                     return [];
    if (_.isArray(obj))                           return slice.call(obj);
    if (_.isArguments(obj))                       return slice.call(obj);
    if (obj.toArray && _.isFunction(obj.toArray)) return obj.toArray();
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    return _.isArray(obj) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if ((n != null) && !guard) {
      return slice.call(array, Math.max(array.length - n, 0));
    } else {
      return array[array.length - 1];
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail`.
  // Especially useful on the arguments object. Passing an **index** will return
  // the rest of the values in the array from that index onward. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = function(array, index, guard) {
    return slice.call(array, (index == null) || guard ? 1 : index);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, function(value){ return !!value; });
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, output) {
    each(input, function(value) {
      if (_.isArray(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };

  // Return a completely flattened version of an array.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator) {
    var initial = iterator ? _.map(array, iterator) : array;
    var results = [];
    _.reduce(initial, function(memo, value, index) {
      if (isSorted ? (_.last(memo) !== value || !memo.length) : !_.include(memo, value)) {
        memo.push(value);
        results.push(array[index]);
      }
      return memo;
    }, []);
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, []));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(slice.call(arguments, 1), true, []);
    return _.filter(array, function(value){ return !_.include(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var args = slice.call(arguments);
    var length = _.max(_.pluck(args, 'length'));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(args, "" + i);
    }
    return results;
  };

  // Zip together two arrays -- an array of keys and an array of values -- into
  // a single object.
  _.zipObject = function(keys, values) {
    var result = {};
    for (var i = 0, l = keys.length; i < l; i++) {
      result[keys[i]] = values[i];
    }
    return result;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i, l;
    if (isSorted) {
      i = _.sortedIndex(array, item);
      return array[i] === item ? i : -1;
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item);
    for (i = 0, l = array.length; i < l; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item) {
    if (array == null) return -1;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) return array.lastIndexOf(item);
    var i = array.length;
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);

    while(idx < len) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Binding with arguments is also known as `curry`.
  // Delegates to **ECMAScript 5**'s native `Function.bind` if available.
  // We check for `func.bind` first, to fail fast when `func` is undefined.
  _.bind = function bind(func, context) {
    var bound, args;
    if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length == 0) funcs = _.functions(obj);
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time.
  _.throttle = function(func, wait) {
    var context, args, timeout, throttling, more, result;
    var whenDone = _.debounce(function(){ more = throttling = false; }, wait);
    return function() {
      context = this; args = arguments;
      var later = function() {
        timeout = null;
        if (more) func.apply(context, args);
        whenDone();
      };
      if (!timeout) timeout = setTimeout(later, wait);
      if (throttling) {
        more = true;
      } else {
        throttling = true;
        result = func.apply(context, args);
      }
      whenDone();
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      return memo = func.apply(this, arguments);
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func].concat(slice.call(arguments, 0));
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    if (times <= 0) return func();
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys[keys.length] = key;
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    return _.map(obj, _.identity);
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var result = {};
    each(flatten(slice.call(arguments, 1), true, []), function(key) {
      if (key in obj) result[key] = obj[key];
    });
    return result;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        if (obj[prop] == null) obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, stack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a._chain) a = a._wrapped;
    if (b._chain) b = b._wrapped;
    // Invoke a custom `isEqual` method if one is provided.
    if (a.isEqual && _.isFunction(a.isEqual)) return a.isEqual(b);
    if (b.isEqual && _.isFunction(b.isEqual)) return b.isEqual(a);
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = stack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (stack[length] == a) return true;
    }
    // Add the first object to the stack of traversed objects.
    stack.push(a);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          // Ensure commutative equality for sparse arrays.
          if (!(result = size in a == size in b && eq(a[size], b[size], stack))) break;
        }
      }
    } else {
      // Objects with different constructors are not equivalent.
      if ('constructor' in a != 'constructor' in b || a.constructor != b.constructor) return false;
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], stack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    stack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType == 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return _.isNumber(obj) && isFinite(obj);
  };

  // Is the given value `NaN`?
  _.isNaN = function(obj) {
    // `NaN` is the only value for which `===` is not reflexive.
    return obj !== obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    for (var i = 0; i < n; i++) iterator.call(context, i);
  };

  // List of HTML entities for escaping.
  var htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };

  // Regex containing the keys listed immediately above.
  var htmlEscaper = /[&<>"'\/]/g;

  // Escape a string for HTML interpolation.
  _.escape = function(string) {
    return ('' + string).replace(htmlEscaper, function(match) {
      return htmlEscapes[match];
    });
  };

  // If the value of the named property is a function then invoke it;
  // otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return null;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object, ensuring that
  // they're correctly added to the OOP wrapper as well.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      addToWrapper(name, _[name] = obj[name]);
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = idCounter++;
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /.^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    '\\':   '\\',
    "'":    "'",
    r:      '\r',
    n:      '\n',
    t:      '\t',
    u2028:  '\u2028',
    u2029:  '\u2029'
  };

  for (var key in escapes) escapes[escapes[key]] = key;
  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
  var unescaper = /\\(\\|'|r|n|t|u2028|u2029)/g;

  // Within an interpolation, evaluation, or escaping, remove HTML escaping
  // that had been previously added.
  var unescape = function(code) {
    return code.replace(unescaper, function(match, escape) {
      return escapes[escape];
    });
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    settings = _.defaults(settings || {}, _.templateSettings);

    // Compile the template source, taking care to escape characters that
    // cannot be included in a string literal and then unescape them in code
    // blocks.
    var source = "__p+='" + text
      .replace(escaper, function(match) {
        return '\\' + escapes[match];
      })
      .replace(settings.escape || noMatch, function(match, code) {
        return "'+\n((__t=(" + unescape(code) + "))==null?'':_.escape(__t))+\n'";
      })
      .replace(settings.interpolate || noMatch, function(match, code) {
        return "'+\n((__t=(" + unescape(code) + "))==null?'':__t)+\n'";
      })
      .replace(settings.evaluate || noMatch, function(match, code) {
        return "';\n" + unescape(code) + "\n__p+='";
      }) + "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'')};\n" +
      source + "return __p;\n";

    var render = new Function(settings.variable || 'obj', '_', source);
    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // The OOP Wrapper
  // ---------------

  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.
  var wrapper = function(obj) { this._wrapped = obj; };

  // Expose `wrapper.prototype` as `_.prototype`
  _.prototype = wrapper.prototype;

  // Helper function to continue chaining intermediate results.
  var result = function(obj, chain) {
    return chain ? _(obj).chain() : obj;
  };

  // A method to easily add functions to the OOP wrapper.
  var addToWrapper = function(name, func) {
    wrapper.prototype[name] = function() {
      var args = slice.call(arguments);
      unshift.call(args, this._wrapped);
      return result(func.apply(_, args), this._chain);
    };
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result(obj, this._chain);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      return result(method.apply(this._wrapped, arguments), this._chain);
    };
  });

  // Start chaining a wrapped Underscore object.
  wrapper.prototype.chain = function() {
    this._chain = true;
    return this;
  };

  // Extracts the result from a wrapped and chained object.
  wrapper.prototype.value = function() {
    return this._wrapped;
  };

}).call(this);

});
require.register("ForbesLindesay-utf8-encode/index.js", function(module, exports, require){
module.exports = encode;

function encode(string) {
    string = string.replace(/\r\n/g, "\n");
    var utftext = "";

    for (var n = 0; n < string.length; n++) {

        var c = string.charCodeAt(n);

        if (c < 128) {
            utftext += String.fromCharCode(c);
        }
        else if ((c > 127) && (c < 2048)) {
            utftext += String.fromCharCode((c >> 6) | 192);
            utftext += String.fromCharCode((c & 63) | 128);
        }
        else {
            utftext += String.fromCharCode((c >> 12) | 224);
            utftext += String.fromCharCode(((c >> 6) & 63) | 128);
            utftext += String.fromCharCode((c & 63) | 128);
        }

    }

    return utftext;
}
});
require.register("ForbesLindesay-base64-encode/index.js", function(module, exports, require){
var utf8Encode = require('utf8-encode');
var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

module.exports = encode;
function encode(input) {
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;

    input = utf8Encode(input);

    while (i < input.length) {

        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
            enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
            enc4 = 64;
        }

        output = output +
            keyStr.charAt(enc1) + keyStr.charAt(enc2) +
            keyStr.charAt(enc3) + keyStr.charAt(enc4);

    }

    return output;
}
});
require.register("ForbesLindesay-utf8-decode/index.js", function(module, exports, require){
module.exports = decode;

function decode(utftext) {
    var string = "";
    var i = 0;
    var c, c1, c2, c3;
    c = c1 = c2 = 0;

    while (i < utftext.length) {

        c = utftext.charCodeAt(i);

        if (c < 128) {
            string += String.fromCharCode(c);
            i++;
        }
        else if ((c > 191) && (c < 224)) {
            c2 = utftext.charCodeAt(i + 1);
            string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
            i += 2;
        }
        else {
            c2 = utftext.charCodeAt(i + 1);
            c3 = utftext.charCodeAt(i + 2);
            string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
            i += 3;
        }

    }

    return string;
}
});
require.register("ForbesLindesay-base64-decode/index.js", function(module, exports, require){
var utf8Decode = require('utf8-decode');
var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

module.exports = decode;
function decode(input) {
    var output = '';
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;

    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');

    while (i < input.length) {

        enc1 = keyStr.indexOf(input.charAt(i++));
        enc2 = keyStr.indexOf(input.charAt(i++));
        enc3 = keyStr.indexOf(input.charAt(i++));
        enc4 = keyStr.indexOf(input.charAt(i++));

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;

        output = output + String.fromCharCode(chr1);

        if (enc3 != 64) {
            output = output + String.fromCharCode(chr2);
        }
        if (enc4 != 64) {
            output = output + String.fromCharCode(chr3);
        }

    }

    output = utf8Decode(output);

    return output;

}
});
require.register("ForbesLindesay-base64/index.js", function(module, exports, require){
exports.encode = require('base64-encode');
exports.decode = require('base64-decode');
});
require.register("the-peoples-blocks/lib/index.js", function(module, exports, require){
// Generated by CoffeeScript 1.3.3
(function() {
  var AnimationPath, CycNum, EAST, NORTH, SOUTH, WEST, activePath, addTile, calculateRoutes, cars, carsLayer, checkDir, checkTrackPos, corner0, corner180, corner270, corner90, count, currentPower, dial, dialImage, displayHeight, displayWidth, dragCancel, drawGrid, fullTrack, gridLayer, gridPos, guiLayer, halfTrack, height, i, intersection0, light, loadFromHash, moveTrackStart, offset, p, pathLayer, piece, pieceCodes, powerLevel, powerLevels, r, rad45deg, rad90deg, rotations, setPowerLevel, setSpeed, sliver, speed, stage, startButton, startPoint, startTrain, steps, stopTrain, straight0, straight90, t, tileImages, tilePieces, tileSize, tilesLayer, trackAcceptsFromDir, trackPath, trackPathSegs, trackStart, train, width, x, y, _checkTrack, _fn, _i, _j, _len, _ref, _ref1;

  window.base64 = require("base64");

  tileSize = 50;

  width = 8;

  height = 8;

  displayHeight = tileSize * width;

  displayWidth = tileSize * height;

  trackStart = {
    x: 0,
    y: 0
  };

  tileImages = {};

  tilePieces = {};

  window.track = (function() {
    var _i, _results;
    _results = [];
    for (y = _i = 0; 0 <= height ? _i <= height : _i >= height; y = 0 <= height ? ++_i : --_i) {
      _results.push((function() {
        var _j, _results1;
        _results1 = [];
        for (x = _j = 0; 0 <= width ? _j <= width : _j >= width; x = 0 <= width ? ++_j : --_j) {
          _results1.push(false);
        }
        return _results1;
      })());
    }
    return _results;
  })();

  stage = new Kinetic.Stage({
    container: 'world',
    width: displayWidth + 180,
    height: displayHeight + 80
  });

  tilesLayer = new Kinetic.Layer;

  gridLayer = new Kinetic.Layer;

  pathLayer = new Kinetic.Layer;

  gridPos = function(evt) {
    return {
      x: Math.floor(evt.pageX / tileSize),
      y: Math.floor(evt.pageY / tileSize)
    };
  };

  drawGrid = function() {
    var _i, _j, _results;
    for (x = _i = 0; 0 <= displayWidth ? _i <= displayWidth : _i >= displayWidth; x = _i += tileSize) {
      gridLayer.add(new Kinetic.Line({
        points: [x - 0.5, 0, x - 0.5, displayHeight],
        stroke: "black",
        strokeWidth: 1
      }));
    }
    _results = [];
    for (y = _j = 0; 0 <= displayHeight ? _j <= displayHeight : _j >= displayHeight; y = _j += tileSize) {
      _results.push(gridLayer.add(new Kinetic.Line({
        points: [0, y - 0.5, displayWidth, y - 0.5],
        stroke: "black",
        strokeWidth: 1
      })));
    }
    return _results;
  };

  addTile = function(piece, pos) {
    var tile;
    track[pos.y][pos.x] = piece;
    tilesLayer.add(tile = new Kinetic.Image({
      image: tileImages[piece],
      x: pos.x * tileSize,
      y: pos.y * tileSize,
      width: 50,
      height: 50,
      draggable: true,
      dragBoundFunc: function(pos) {
        return {
          x: (pos.x < 0 ? 0 : pos.x),
          y: (pos.y < 0 ? 0 : pos.y)
        };
      }
    }));
    tilesLayer.draw();
    calculateRoutes();
    tile.on("dragend", function(evt) {
      var newPos;
      track[pos.y][pos.x] = false;
      newPos = gridPos(evt);
      track[newPos.y][newPos.x] = piece;
      pos = newPos;
      tile.setX(newPos.x * tileSize);
      tile.setY(newPos.y * tileSize);
      tilesLayer.draw();
      return calculateRoutes();
    });
    tile.on("mouseover", function() {
      return document.body.style.cursor = 'pointer';
    });
    return tile.on("mouseout", function() {
      return document.body.style.cursor = 'default';
    });
  };

  pieceCodes = ["straight-0", "straight-90", "corner-0", "corner-90", "corner-180", "corner-270", "intersection-0"];

  straight0 = pieceCodes[0], straight90 = pieceCodes[1], corner0 = pieceCodes[2], corner90 = pieceCodes[3], corner180 = pieceCodes[4], corner270 = pieceCodes[5], intersection0 = pieceCodes[6];

  _ref = ["north", "east", "south", "west"], NORTH = _ref[0], EAST = _ref[1], SOUTH = _ref[2], WEST = _ref[3];

  trackAcceptsFromDir = function(pos, fromDir) {
    var piece;
    piece = track[pos.y][pos.x];
    switch (fromDir) {
      case NORTH:
        return piece === straight0 || piece === corner0 || piece === corner90 || piece === intersection0;
      case SOUTH:
        return piece === straight0 || piece === corner180 || piece === corner270 || piece === intersection0;
      case EAST:
        return piece === straight90 || piece === corner90 || piece === corner180 || piece === intersection0;
      case WEST:
        return piece === straight90 || piece === corner0 || piece === corner270 || piece === intersection0;
    }
  };

  checkTrackPos = function(x, y) {
    if (track[y][x]) {
      return {
        x: x,
        y: y
      };
    }
  };

  _checkTrack = function(xd, yd, fromDir) {
    return function(pos) {
      var potentialPos;
      if (potentialPos = checkTrackPos(pos.x + xd, pos.y + yd)) {
        if (trackAcceptsFromDir(potentialPos, fromDir)) {
          return potentialPos;
        }
      }
    };
  };

  checkDir = {
    north: _checkTrack(0, -1, NORTH),
    south: _checkTrack(0, 1, SOUTH),
    east: _checkTrack(1, 0, EAST),
    west: _checkTrack(-1, 0, WEST)
  };

  fullTrack = tileSize;

  halfTrack = tileSize / 2;

  trackPath = false;

  trackPathSegs = false;

  calculateRoutes = function() {
    var col, dir, flatPath, next, path, pathPush, pos, pts, row, startDir, _i, _j, _k, _len, _len1, _len2;
    if (track[trackStart.y][trackStart.x]) {
      pos = trackStart;
    } else {
      for (y = _i = 0, _len = track.length; _i < _len; y = ++_i) {
        row = track[y];
        if (pos) {
          break;
        }
        for (x = _j = 0, _len1 = row.length; _j < _len1; x = ++_j) {
          col = row[x];
          if (col) {
            pos = {
              x: x,
              y: y
            };
            break;
          }
        }
      }
    }
    if (!pos) {
      return;
    }
    moveTrackStart(pos);
    path = [];
    pathPush = function(points) {
      var last;
      last = path[path.length - 1];
      if (last && last[0] === points[0][0] && last[1] === points[0][1]) {
        points.shift();
      }
      return path.push.apply(path, points);
    };
    startDir = dir = (function() {
      switch (track[pos.y][pos.x]) {
        case straight0:
          if (checkDir.south(pos)) {
            return SOUTH;
          } else {
            return NORTH;
          }
          break;
        case straight90:
          if (checkDir.east(pos)) {
            return EAST;
          } else {
            return WEST;
          }
          break;
        case corner0:
          if (checkDir.east(pos)) {
            return NORTH;
          } else {
            return EAST;
          }
          break;
        case corner90:
          if (checkDir.west(pos)) {
            return NORTH;
          } else {
            return WEST;
          }
          break;
        case corner180:
          if (checkDir.west(pos)) {
            return SOUTH;
          } else {
            return EAST;
          }
          break;
        case corner270:
          if (checkDir.east(pos)) {
            return SOUTH;
          } else {
            return WEST;
          }
          break;
        case intersection0:
          if (checkDir.east(pos)) {
            return EAST;
          } else if (checkDir.west(pos)) {
            return WEST;
          } else if (checkDir.north(pos)) {
            return NORTH;
          } else {
            return SOUTH;
          }
      }
    })();
    next = false;
    while (true) {
      x = pos.x * fullTrack;
      y = pos.y * fullTrack;
      switch (track[pos.y][pos.x]) {
        case straight0:
        case (dir === NORTH || dir === SOUTH) && intersection0:
          pts = [[x + halfTrack, y + fullTrack], [x + halfTrack, y]];
          if (dir === SOUTH) {
            pts.reverse();
          }
          break;
        case straight90:
        case (dir === EAST || dir === WEST) && intersection0:
          pts = [[x, y + halfTrack], [x + fullTrack, y + halfTrack]];
          if (dir === WEST) {
            pts.reverse();
          }
          break;
        case corner0:
          pts = [[x + halfTrack, y + fullTrack], [x + halfTrack, y + fullTrack - (halfTrack / 2)], [x + fullTrack - (halfTrack / 2), y + halfTrack], [x + fullTrack, y + halfTrack]];
          if (dir === NORTH) {
            dir = EAST;
          } else {
            dir = SOUTH;
            pts.reverse();
          }
          break;
        case corner90:
          pts = [[x + halfTrack, y + fullTrack], [x + halfTrack, y + fullTrack - (halfTrack / 2)], [x + (halfTrack / 2), y + halfTrack], [x, y + halfTrack]];
          if (dir === NORTH) {
            dir = WEST;
          } else {
            dir = SOUTH;
            pts.reverse();
          }
          break;
        case corner180:
          pts = [[x + halfTrack, y], [x + halfTrack, y + (halfTrack / 2)], [x + (halfTrack / 2), y + halfTrack], [x, y + halfTrack]];
          if (dir === SOUTH) {
            dir = WEST;
          } else {
            dir = NORTH;
            pts.reverse();
          }
          break;
        case corner270:
          pts = [[x + halfTrack, y], [x + halfTrack, y + (halfTrack / 2)], [x + fullTrack - (halfTrack / 2), y + halfTrack], [x + fullTrack, y + halfTrack]];
          if (dir === SOUTH) {
            dir = EAST;
          } else {
            dir = NORTH;
            pts.reverse();
          }
      }
      pathPush(pts);
      next = checkDir[dir](pos);
      if (!next) {
        break;
      }
      if (next.x === trackStart.x && next.y === trackStart.y) {
        if (track[next.y][next.x] === intersection0) {
          if (dir === startDir) {
            break;
          }
        } else {
          break;
        }
      }
      pos = next;
      next = false;
    }
    if (trackPath) {
      trackPath.remove();
    }
    if (path.length) {
      flatPath = [];
      for (_k = 0, _len2 = path.length; _k < _len2; _k++) {
        x = path[_k];
        flatPath.push(x[0], x[1]);
      }
      pathLayer.add(trackPath = new Kinetic.Line({
        points: flatPath,
        stroke: "green",
        strokeWidth: 20,
        opacity: 0.5
      }));
      pathLayer.draw();
      return trackPathSegs = path;
    }
  };

  drawGrid();

  stage.add(pathLayer);

  stage.add(gridLayer);

  stage.add(tilesLayer);

  count = 0;

  _ref1 = {
    straight: [0, 90],
    corner: [270, 0, 90, 180],
    intersection: [0]
  };
  for (p in _ref1) {
    rotations = _ref1[p];
    _fn = function(piece, ogx, ogy) {
      var placeHolder;
      tileImages[piece] = new Image;
      tilesLayer.add(placeHolder = new Kinetic.Image({
        x: ogx,
        y: ogy,
        width: tileSize,
        height: tileSize
      }));
      tileImages[piece].onload = function() {
        placeHolder.setImage(tileImages[piece]);
        tilesLayer.add(tilePieces[piece] = placeHolder.clone());
        placeHolder.applyFilter(Kinetic.Filters.Grayscale, null, function() {
          return tilesLayer.draw();
        });
        tilePieces[piece].setDraggable(true);
        tilePieces[piece].on("dragend", function(evt) {
          tilePieces[piece].setX(ogx);
          tilePieces[piece].setY(ogy);
          return addTile(piece, gridPos(evt));
        });
        tilePieces[piece].on("mouseover", function() {
          return document.body.style.cursor = 'pointer';
        });
        return tilePieces[piece].on("mouseout", function() {
          return document.body.style.cursor = 'default';
        });
      };
      tileImages[piece].src = "images/" + piece + ".png";
      return count++;
    };
    for (_i = 0, _len = rotations.length; _i < _len; _i++) {
      r = rotations[_i];
      piece = piece = "" + p + "-" + r;
      _fn(piece, count * tileSize, height * tileSize);
    }
  }

  CycNum = {
    add: function(num, amt, min, max) {
      if (min == null) {
        min = 0;
      }
      if (max == null) {
        max = 1;
      }
      if ((num + amt) > max) {
        return min + ((num + amt) - max);
      } else {
        return num + amt;
      }
    },
    sub: function(num, amt, min, max) {
      if (min == null) {
        min = 0;
      }
      if (max == null) {
        max = 1;
      }
      if ((num - amt) < min) {
        return max - (amt - num);
      } else {
        return num - amt;
      }
    }
  };

  AnimationPath = function(pathSegs) {
    var i, pathString, seg, _j, _len1;
    this.path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    pathString = ["M" + (pathSegs[0].join(" "))];
    for (i = _j = 0, _len1 = pathSegs.length; _j < _len1; i = ++_j) {
      seg = pathSegs[i];
      if (i) {
        pathString.push("L" + (seg.join(" ")));
      }
    }
    this.path.setAttribute("d", pathString.join(" ") + "Z");
    return this.updatePath();
  };

  AnimationPath.prototype.updatePath = function() {
    return this.len = this.path.getTotalLength();
  };

  AnimationPath.prototype.pointAt = function(percent) {
    return this.path.getPointAtLength(this.len * percent);
  };

  AnimationPath.prototype.rotationAt = function(percent) {
    var p1, p2;
    p1 = this.pointAt(CycNum.sub(percent, 0.01));
    p2 = this.pointAt(CycNum.add(percent, 0.01));
    return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
  };

  carsLayer = new Kinetic.Layer;

  stage.add(carsLayer);

  carsLayer.add(train = new Kinetic.Rect({
    height: 30,
    offset: [15 / 2, 30 / 2],
    width: 15,
    stroke: "black",
    fill: "grey"
  }));

  carsLayer.add(light = new Kinetic.Polygon({
    points: [50, 25, 60, 25, 135, 100, -25, 100, 50, 25],
    fill: "yellow",
    stroke: "orange",
    opacity: 0.5,
    offset: [110 / 2, 10]
  }));

  cars = [train];

  for (i = _j = 0; _j <= 2; i = ++_j) {
    carsLayer.add(t = train.clone());
    cars.push(t);
  }

  speed = 0;

  activePath = false;

  setSpeed = function() {
    if (powerLevel === 0) {
      return speed = 0;
    } else {
      return speed = activePath.len / ((200 * 10000) / powerLevel);
    }
  };

  startTrain = function() {
    var anim, percent, relPer, row, url, _k, _l, _len1, _len2;
    if (!trackPathSegs) {
      return;
    }
    url = [];
    for (y = _k = 0, _len1 = track.length; _k < _len1; y = ++_k) {
      row = track[y];
      for (x = _l = 0, _len2 = row.length; _l < _len2; x = ++_l) {
        p = row[x];
        if (p) {
          url.push("" + y + "." + x + "." + (_.indexOf(pieceCodes, p)));
        }
      }
    }
    window.location.hash = url.join("/");
    activePath = new AnimationPath(trackPathSegs);
    setSpeed();
    relPer = (train.getHeight() + 5.7) / activePath.len;
    percent = 0;
    anim = new Kinetic.Animation((function(frame) {
      var car, np, _len3, _m, _results;
      percent = CycNum.add(percent, speed);
      _results = [];
      for (i = _m = 0, _len3 = cars.length; _m < _len3; i = ++_m) {
        car = cars[i];
        np = CycNum.sub(percent, relPer * i);
        p = activePath.pointAt(np);
        r = activePath.rotationAt(np);
        car.setX(p.x);
        car.setY(p.y);
        car.setRotationDeg(r - 90);
        if (i === 0) {
          light.setX(p.x);
          light.setY(p.y);
          _results.push(light.setRotationDeg(r - 90));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    }), carsLayer);
    carsLayer.show();
    return anim.start();
  };

  stopTrain = function() {
    return carsLayer.hide();
  };

  stage.add(guiLayer = new Kinetic.Layer);

  guiLayer.add(startPoint = new Kinetic.Circle({
    radius: 10,
    fill: "green",
    stroke: "black",
    opacity: 0.9,
    draggable: true
  }));

  guiLayer.add(startButton = new Kinetic.Rect({
    x: width * tileSize + 10,
    y: 10,
    fill: "green",
    width: 25,
    height: 15
  }));

  startButton.on("click", function() {
    return startTrain();
  });

  offset = [60 / 2, 100 - 20];

  rad90deg = 1.57079633;

  rad45deg = rad90deg / 2;

  sliver = rad90deg / 6;

  dragCancel = false;

  t = (function() {
    var _k, _results;
    _results = [];
    for (x = _k = 0; _k <= 6; x = ++_k) {
      _results.push(-rad45deg + (x * sliver));
    }
    return _results;
  })();

  steps = (function() {
    var _k, _ref2, _results;
    _results = [];
    for (x = _k = 0, _ref2 = t.length - 2; 0 <= _ref2 ? _k <= _ref2 : _k >= _ref2; x = 0 <= _ref2 ? ++_k : --_k) {
      _results.push({
        min: t[x],
        max: t[x + 1],
        value: x
      });
    }
    return _results;
  })();

  guiLayer.add(dial = new Kinetic.Image({
    x: (width + 1.5) * tileSize,
    y: (height - 2) * tileSize,
    width: 60,
    height: 100,
    offset: offset,
    draggable: true,
    dragBoundFunc: function(pos, evt) {
      /*
      		centerPoint.setX evt.x
      		centerPoint.setY evt.y 
      		
      		centerLine.setPoints [dial.getX(), dial.getY(), evt.x, evt.y]
      		guiLayer.draw()
      */

      var remainder, rotateTo, rotation, step, _k, _len1;
      rotateTo = (Math.atan2(evt.y - dial.getY(), evt.x - dial.getX())) + rad90deg;
      if (rotateTo > rad90deg || rotateTo < -rad90deg) {
        dragCancel = true;
      }
      if (!dragCancel && rotateTo < rad90deg && rotateTo > -rad90deg) {
        if (rotateTo < -rad45deg) {
          rotateTo = -rad45deg;
        }
        if (rotateTo > rad45deg) {
          rotateTo = rad45deg;
        }
        dial.setRotation(rotateTo);
      }
      rotation = dial.getRotation();
      for (_k = 0, _len1 = steps.length; _k < _len1; _k++) {
        step = steps[_k];
        if (!((step.max > rotation && rotation > step.min))) {
          continue;
        }
        remainder = rotation - step.max;
        setPowerLevel(step.value + remainder);
        break;
      }
      return {
        x: dial.getX(),
        y: dial.getY()
      };
    }
  }));

  dial.on("dragend", function() {
    return dragCancel = false;
  });

  dialImage = new Image;

  dialImage.onload = function() {
    dial.setImage(dialImage);
    return guiLayer.draw();
  };

  dialImage.src = "./images/dial.png";

  guiLayer.add(currentPower = new Kinetic.Text({
    x: dial.getX() - 12,
    y: (height - 1.25) * tileSize,
    text: "2",
    fill: "green",
    fontSize: 40
  }));

  powerLevel = 2;

  setPowerLevel = function(level) {
    powerLevel = level;
    currentPower.setText(level.toFixed(2));
    setSpeed();
    return guiLayer.draw();
  };

  guiLayer.add(powerLevels = new Kinetic.TextPath({
    x: (width + 0.44) * tileSize,
    y: (height - 3.25) * tileSize,
    data: "m0 0 C0 -40 110 -40 110 0",
    text: "0  1  2  3  4  5",
    fill: "black",
    fontFamily: "Calibri",
    fontSize: 20
  }));

  guiLayer.draw();

  /*
  guiLayer.add centerLine = new Kinetic.Line
  	points: [dial.getX(), dial.getY()]
  	stroke: "green"
  	strokeWidth: 1
  
  
  guiLayer.add centerPoint = new Kinetic.Circle
  	x: dial.getX() 
  	y: dial.getY() 
  	radius: 3
  	fill: "black"
  */


  startPoint.on("dragend", function(evt) {
    return moveTrackStart(gridPos(evt));
  });

  moveTrackStart = function(pos) {
    startPoint.setX((pos.x * tileSize) + (tileSize / 2));
    startPoint.setY((pos.y * tileSize) + (tileSize / 2));
    trackStart = pos;
    return guiLayer.draw();
  };

  moveTrackStart({
    x: 0,
    y: 0
  });

  loadFromHash = function() {
    var hash, part, _k, _len1, _ref2, _ref3, _results;
    if (hash = window.location.hash) {
      _ref2 = hash.slice(1).split("/");
      _results = [];
      for (_k = 0, _len1 = _ref2.length; _k < _len1; _k++) {
        part = _ref2[_k];
        _ref3 = part.split("."), y = _ref3[0], x = _ref3[1], p = _ref3[2];
        if ((y != null) && (x != null) && (p != null)) {
          _results.push(addTile(pieceCodes[p], {
            x: x,
            y: y
          }));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    }
  };

  loadFromHash();

}).call(this);

});
require.register("the-peoples-blocks/index.js", function(module, exports, require){
module.exports = require("./lib/index");


});
require.alias("component-underscore/index.js", "the-peoples-blocks/deps/underscore/index.js");

require.alias("ForbesLindesay-base64/index.js", "the-peoples-blocks/deps/base64/index.js");
require.alias("ForbesLindesay-base64-encode/index.js", "ForbesLindesay-base64/deps/base64-encode/index.js");
require.alias("ForbesLindesay-utf8-encode/index.js", "ForbesLindesay-base64-encode/deps/utf8-encode/index.js");

require.alias("ForbesLindesay-base64-decode/index.js", "ForbesLindesay-base64/deps/base64-decode/index.js");
require.alias("ForbesLindesay-utf8-decode/index.js", "ForbesLindesay-base64-decode/deps/utf8-decode/index.js");
