import {
  init_cf_utils,
  uuidv4
} from "./chunk-JUFAPXHB.js";
import {
  __esm,
  __export,
  __publicField,
  define_process_default,
  init_define_process
} from "./chunk-XDBWEWVZ.js";

// node_modules/nanostores/task/index.js
function startTask() {
  tasks += 1;
  return () => {
    tasks -= 1;
    if (tasks === 0) {
      let prevResolves = resolves;
      resolves = [];
      for (let i of prevResolves) i();
    }
  };
}
function task(cb) {
  let endTask = startTask();
  return cb().finally(endTask);
}
function allTasks() {
  if (tasks === 0) {
    return Promise.resolve();
  } else {
    return new Promise((resolve) => {
      resolves.push(resolve);
    });
  }
}
function cleanTasks() {
  tasks = 0;
}
var tasks, resolves;
var init_task = __esm({
  "node_modules/nanostores/task/index.js"() {
    init_define_process();
    tasks = 0;
    resolves = [];
  }
});

// node_modules/nanostores/clean-stores/index.js
var clean, cleanStores;
var init_clean_stores = __esm({
  "node_modules/nanostores/clean-stores/index.js"() {
    init_define_process();
    init_task();
    clean = Symbol("clean");
    cleanStores = (...stores) => {
      if (define_process_default.env.NODE_ENV === "production") {
        throw new Error(
          "cleanStores() can be used only during development or tests"
        );
      }
      cleanTasks();
      for (let $store of stores) {
        if ($store) {
          if ($store.mocked) delete $store.mocked;
          if ($store[clean]) $store[clean]();
        }
      }
    };
  }
});

// node_modules/nanostores/atom/index.js
var listenerQueue, atom;
var init_atom = __esm({
  "node_modules/nanostores/atom/index.js"() {
    init_define_process();
    init_clean_stores();
    listenerQueue = [];
    atom = (initialValue, level) => {
      let listeners = [];
      let $atom = {
        get() {
          if (!$atom.lc) {
            $atom.listen(() => {
            })();
          }
          return $atom.value;
        },
        l: level || 0,
        lc: 0,
        listen(listener, listenerLevel) {
          $atom.lc = listeners.push(listener, listenerLevel || $atom.l) / 2;
          return () => {
            let index = listeners.indexOf(listener);
            if (~index) {
              listeners.splice(index, 2);
              if (!--$atom.lc) $atom.off();
            }
          };
        },
        notify(changedKey) {
          let runListenerQueue = !listenerQueue.length;
          for (let i = 0; i < listeners.length; i += 2) {
            listenerQueue.push(
              listeners[i],
              listeners[i + 1],
              $atom.value,
              changedKey
            );
          }
          if (runListenerQueue) {
            for (let i = 0; i < listenerQueue.length; i += 4) {
              let skip;
              for (let j = i + 1; !skip && (j += 4) < listenerQueue.length; ) {
                if (listenerQueue[j] < listenerQueue[i + 1]) {
                  skip = listenerQueue.push(
                    listenerQueue[i],
                    listenerQueue[i + 1],
                    listenerQueue[i + 2],
                    listenerQueue[i + 3]
                  );
                }
              }
              if (!skip) {
                listenerQueue[i](listenerQueue[i + 2], listenerQueue[i + 3]);
              }
            }
            listenerQueue.length = 0;
          }
        },
        off() {
        },
        /* It will be called on last listener unsubscribing.
           We will redefine it in onMount and onStop. */
        set(data) {
          if ($atom.value !== data) {
            $atom.value = data;
            $atom.notify();
          }
        },
        subscribe(listener, listenerLevel) {
          let unbind = $atom.listen(listener, listenerLevel);
          listener($atom.value);
          return unbind;
        },
        value: initialValue
      };
      if (define_process_default.env.NODE_ENV !== "production") {
        $atom[clean] = () => {
          listeners = [];
          $atom.lc = 0;
          $atom.off();
        };
      }
      return $atom;
    };
  }
});

// node_modules/nanostores/lifecycle/index.js
var START, STOP, SET, NOTIFY, MOUNT, UNMOUNT, ACTION, REVERT_MUTATION, on, onStart, onStop, onSet, onNotify, STORE_UNMOUNT_DELAY, onMount, onAction;
var init_lifecycle = __esm({
  "node_modules/nanostores/lifecycle/index.js"() {
    init_define_process();
    init_clean_stores();
    START = 0;
    STOP = 1;
    SET = 2;
    NOTIFY = 3;
    MOUNT = 5;
    UNMOUNT = 6;
    ACTION = 7;
    REVERT_MUTATION = 10;
    on = (object, listener, eventKey, mutateStore) => {
      object.events = object.events || {};
      if (!object.events[eventKey + REVERT_MUTATION]) {
        object.events[eventKey + REVERT_MUTATION] = mutateStore((eventProps) => {
          object.events[eventKey].reduceRight((event, l) => (l(event), event), {
            shared: {},
            ...eventProps
          });
        });
      }
      object.events[eventKey] = object.events[eventKey] || [];
      object.events[eventKey].push(listener);
      return () => {
        let currentListeners = object.events[eventKey];
        let index = currentListeners.indexOf(listener);
        currentListeners.splice(index, 1);
        if (!currentListeners.length) {
          delete object.events[eventKey];
          object.events[eventKey + REVERT_MUTATION]();
          delete object.events[eventKey + REVERT_MUTATION];
        }
      };
    };
    onStart = ($store, listener) => on($store, listener, START, (runListeners) => {
      let originListen = $store.listen;
      $store.listen = (arg) => {
        if (!$store.lc && !$store.starting) {
          $store.starting = true;
          runListeners();
          delete $store.starting;
        }
        return originListen(arg);
      };
      return () => {
        $store.listen = originListen;
      };
    });
    onStop = ($store, listener) => on($store, listener, STOP, (runListeners) => {
      let originOff = $store.off;
      $store.off = () => {
        runListeners();
        originOff();
      };
      return () => {
        $store.off = originOff;
      };
    });
    onSet = ($store, listener) => on($store, listener, SET, (runListeners) => {
      let originSet = $store.set;
      let originSetKey = $store.setKey;
      if ($store.setKey) {
        $store.setKey = (changed, changedValue) => {
          let isAborted;
          let abort = () => {
            isAborted = true;
          };
          runListeners({
            abort,
            changed,
            newValue: { ...$store.value, [changed]: changedValue }
          });
          if (!isAborted) return originSetKey(changed, changedValue);
        };
      }
      $store.set = (newValue) => {
        let isAborted;
        let abort = () => {
          isAborted = true;
        };
        runListeners({ abort, newValue });
        if (!isAborted) return originSet(newValue);
      };
      return () => {
        $store.set = originSet;
        $store.setKey = originSetKey;
      };
    });
    onNotify = ($store, listener) => on($store, listener, NOTIFY, (runListeners) => {
      let originNotify = $store.notify;
      $store.notify = (changed) => {
        let isAborted;
        let abort = () => {
          isAborted = true;
        };
        runListeners({ abort, changed });
        if (!isAborted) return originNotify(changed);
      };
      return () => {
        $store.notify = originNotify;
      };
    });
    STORE_UNMOUNT_DELAY = 1e3;
    onMount = ($store, initialize) => {
      let listener = (payload) => {
        let destroy = initialize(payload);
        if (destroy) $store.events[UNMOUNT].push(destroy);
      };
      return on($store, listener, MOUNT, (runListeners) => {
        let originListen = $store.listen;
        $store.listen = (...args) => {
          if (!$store.lc && !$store.active) {
            $store.active = true;
            runListeners();
          }
          return originListen(...args);
        };
        let originOff = $store.off;
        $store.events[UNMOUNT] = [];
        $store.off = () => {
          originOff();
          setTimeout(() => {
            if ($store.active && !$store.lc) {
              $store.active = false;
              for (let destroy of $store.events[UNMOUNT]) destroy();
              $store.events[UNMOUNT] = [];
            }
          }, STORE_UNMOUNT_DELAY);
        };
        if (define_process_default.env.NODE_ENV !== "production") {
          let originClean = $store[clean];
          $store[clean] = () => {
            for (let destroy of $store.events[UNMOUNT]) destroy();
            $store.events[UNMOUNT] = [];
            $store.active = false;
            originClean();
          };
        }
        return () => {
          $store.listen = originListen;
          $store.off = originOff;
        };
      });
    };
    onAction = ($store, listener) => on($store, listener, ACTION, (runListeners) => {
      let errorListeners = {};
      let endListeners = {};
      let originAction = $store.action;
      $store.action = (id, actionName, args) => {
        runListeners({
          actionName,
          args,
          id,
          onEnd: (l) => {
            (endListeners[id] || (endListeners[id] = [])).push(l);
          },
          onError: (l) => {
            (errorListeners[id] || (errorListeners[id] = [])).push(l);
          }
        });
        return [
          (error) => {
            if (errorListeners[id]) {
              for (let l of errorListeners[id]) l({ error });
            }
          },
          () => {
            if (endListeners[id]) {
              for (let l of endListeners[id]) l();
              delete errorListeners[id];
              delete endListeners[id];
            }
          }
        ];
      };
      return () => {
        $store.action = originAction;
      };
    });
  }
});

// node_modules/nanostores/computed/index.js
var computed;
var init_computed = __esm({
  "node_modules/nanostores/computed/index.js"() {
    init_define_process();
    init_atom();
    init_lifecycle();
    computed = (stores, cb) => {
      if (!Array.isArray(stores)) stores = [stores];
      let diamondArgs;
      let run = () => {
        let args = stores.map(($store) => $store.get());
        if (diamondArgs === void 0 || args.some((arg, i) => arg !== diamondArgs[i])) {
          diamondArgs = args;
          $computed.set(cb(...args));
        }
      };
      let $computed = atom(void 0, Math.max(...stores.map((s) => s.l)) + 1);
      onMount($computed, () => {
        let unbinds = stores.map(($store) => $store.listen(run, $computed.l));
        run();
        return () => {
          for (let unbind of unbinds) unbind();
        };
      });
      return $computed;
    };
  }
});

// node_modules/nanostores/map/index.js
var map;
var init_map = __esm({
  "node_modules/nanostores/map/index.js"() {
    init_define_process();
    init_atom();
    map = (value = {}) => {
      let $map = atom(value);
      $map.setKey = function(key, newValue) {
        if (typeof newValue === "undefined") {
          if (key in $map.value) {
            $map.value = { ...$map.value };
            delete $map.value[key];
            $map.notify(key);
          }
        } else if ($map.value[key] !== newValue) {
          $map.value = {
            ...$map.value,
            [key]: newValue
          };
          $map.notify(key);
        }
      };
      return $map;
    };
  }
});

// node_modules/nanostores/action/index.js
var lastAction, actionId, uid, doAction, action;
var init_action = __esm({
  "node_modules/nanostores/action/index.js"() {
    init_define_process();
    init_task();
    lastAction = Symbol();
    actionId = Symbol();
    uid = 0;
    doAction = ($store, actionName, cb, args) => {
      let id = ++uid;
      let tracker = { ...$store };
      tracker.set = (...setArgs) => {
        $store[lastAction] = actionName;
        $store[actionId] = id;
        $store.set(...setArgs);
        delete $store[lastAction];
        delete $store[actionId];
      };
      if ($store.setKey) {
        tracker.setKey = (...setArgs) => {
          $store[lastAction] = actionName;
          $store[actionId] = id;
          $store.setKey(...setArgs);
          delete $store[lastAction];
          delete $store[actionId];
        };
      }
      let onError, onEnd;
      if ($store.action) {
        ;
        [onError, onEnd] = $store.action(id, actionName, args);
      }
      let result = cb(tracker, ...args);
      if (result instanceof Promise) {
        let endTask = startTask();
        return result.catch((error) => {
          if (onError) onError(error);
          throw error;
        }).finally(() => {
          endTask();
          if (onEnd) onEnd();
        });
      }
      if (onEnd) onEnd();
      return result;
    };
    action = ($store, actionName, cb) => (...args) => doAction($store, actionName, cb, args);
  }
});

// node_modules/nanostores/deep-map/path.js
function getPath(obj, path) {
  let allKeys = getAllKeysFromPath(path);
  let res = obj;
  for (let key of allKeys) {
    if (res === void 0) {
      break;
    }
    res = res[key];
  }
  return res;
}
function setPath(obj, path, value) {
  return setByKey(obj != null ? obj : {}, getAllKeysFromPath(path), value);
}
function setByKey(obj, splittedKeys, value) {
  let key = splittedKeys[0];
  ensureKey(obj, key, splittedKeys[1]);
  let copy = Array.isArray(obj) ? [...obj] : { ...obj };
  if (splittedKeys.length === 1) {
    if (value === void 0) {
      if (Array.isArray(obj)) {
        copy.splice(key, 1);
      } else {
        delete copy[key];
      }
    } else {
      copy[key] = value;
    }
    return copy;
  }
  let newVal = setByKey(obj[key], splittedKeys.slice(1), value);
  obj[key] = newVal;
  return obj;
}
function getAllKeysFromPath(path) {
  return path.split(".").flatMap((key) => getKeyAndIndicesFromKey(key));
}
function getKeyAndIndicesFromKey(key) {
  if (ARRAY_INDEX.test(key)) {
    let [, keyPart, index] = key.match(ARRAY_INDEX);
    return [...getKeyAndIndicesFromKey(keyPart), index];
  }
  return [key];
}
function ensureKey(obj, key, nextKey) {
  if (key in obj) {
    return;
  }
  let nextKeyAsInt = parseInt(
    nextKey !== null && nextKey !== void 0 ? nextKey : ""
  );
  if (Number.isNaN(nextKeyAsInt)) {
    obj[key] = {};
  } else {
    obj[key] = Array(nextKeyAsInt + 1).fill(void 0);
  }
}
var ARRAY_INDEX;
var init_path = __esm({
  "node_modules/nanostores/deep-map/path.js"() {
    init_define_process();
    ARRAY_INDEX = /(.*)\[(\d+)\]/;
  }
});

// node_modules/nanostores/deep-map/index.js
function deepMap(initial = {}) {
  let $deepMap = atom(initial);
  $deepMap.setKey = (key, value) => {
    if (getPath($deepMap.value, key) !== value) {
      $deepMap.value = { ...setPath($deepMap.value, key, value) };
      $deepMap.notify(key);
    }
  };
  return $deepMap;
}
var init_deep_map = __esm({
  "node_modules/nanostores/deep-map/index.js"() {
    init_define_process();
    init_atom();
    init_path();
    init_path();
  }
});

// node_modules/nanostores/keep-mount/index.js
var keepMount;
var init_keep_mount = __esm({
  "node_modules/nanostores/keep-mount/index.js"() {
    init_define_process();
    keepMount = ($store) => {
      $store.listen(() => {
      });
    };
  }
});

// node_modules/nanostores/listen-keys/index.js
function listenKeys($store, keys, listener) {
  let keysSet = /* @__PURE__ */ new Set([...keys, void 0]);
  return $store.listen((value, changed) => {
    if (keysSet.has(changed)) {
      listener(value, changed);
    }
  });
}
var init_listen_keys = __esm({
  "node_modules/nanostores/listen-keys/index.js"() {
    init_define_process();
  }
});

// node_modules/nanostores/index.js
var nanostores_exports = {};
__export(nanostores_exports, {
  STORE_UNMOUNT_DELAY: () => STORE_UNMOUNT_DELAY,
  action: () => action,
  actionId: () => actionId,
  allTasks: () => allTasks,
  atom: () => atom,
  clean: () => clean,
  cleanStores: () => cleanStores,
  cleanTasks: () => cleanTasks,
  computed: () => computed,
  deepMap: () => deepMap,
  getPath: () => getPath,
  keepMount: () => keepMount,
  lastAction: () => lastAction,
  listenKeys: () => listenKeys,
  map: () => map,
  onAction: () => onAction,
  onMount: () => onMount,
  onNotify: () => onNotify,
  onSet: () => onSet,
  onStart: () => onStart,
  onStop: () => onStop,
  setPath: () => setPath,
  startTask: () => startTask,
  task: () => task
});
var init_nanostores = __esm({
  "node_modules/nanostores/index.js"() {
    init_define_process();
    init_action();
    init_atom();
    init_clean_stores();
    init_computed();
    init_deep_map();
    init_keep_mount();
    init_lifecycle();
    init_listen_keys();
    init_map();
    init_task();
  }
});

// projects/lib/packages/yggdrasil-blueprints/src/Elements/Utils/general.ts
async function sleepMs(timeMs) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeMs);
  });
}
var cleanEmptyObjectKeys, deepEqual, formatNumberToCurrency, numberToCurrency, isElementVisibleOnViewport, debounce, setCookie, getCookie, clearCookie;
var init_general = __esm({
  "projects/lib/packages/yggdrasil-blueprints/src/Elements/Utils/general.ts"() {
    init_define_process();
    cleanEmptyObjectKeys = (obj) => {
      for (const propName in obj) {
        const value = obj[propName];
        if ([null, void 0, ""].includes(value)) {
          delete obj[propName];
        }
      }
      return obj;
    };
    deepEqual = (x, y) => {
      const ok = Object.keys, tx = typeof x, ty = typeof y;
      return x && y && tx === "object" && tx === ty ? ok(x).length === ok(y).length && ok(x).every((key) => deepEqual(x[key], y[key])) : x === y;
    };
    formatNumberToCurrency = (currency, n) => {
      if (currency && currency === "$" && n > 0) {
        return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n);
      }
      return currency + n?.toFixed(2);
    };
    numberToCurrency = (number, currency) => {
      if (currency && currency === "$" && Number.isFinite(number)) {
        return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(number).replace("$", "");
      } else if (currency && currency === "\u20AC" && Number.isFinite(number)) {
        return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(number).replace("\u20AC", "");
      }
      return number && number.toFixed(2);
    };
    isElementVisibleOnViewport = (element, percentage) => {
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      return !(Math.floor(100 - (rect.top >= 0 ? 0 : rect.top) / +-rect.height * 100) < percentage || Math.floor(100 - (rect.bottom - windowHeight) / rect.height * 100) < percentage);
    };
    debounce = (callback, wait) => {
      let debounceTimeout;
      return (...props) => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
          callback([...props]);
        }, wait);
      };
    };
    setCookie = (name, value, ttl, domain) => {
      let expires = "";
      let cookieDomain = "";
      if (ttl) {
        const date = /* @__PURE__ */ new Date();
        date.setTime(date.getTime() + ttl * 60 * 1e3);
        expires = "; expires=" + date.toUTCString();
      }
      if (domain) {
        cookieDomain = "; domain=" + domain;
      }
      document.cookie = name + "=" + escape(value) + expires + cookieDomain + "; path=/; samesite=lax";
    };
    getCookie = (name) => {
      let i, c;
      const nameEQ = name + "=";
      const ca = document.cookie.split(";");
      for (i = 0; i < ca.length; i++) {
        c = ca[i];
        while (c.charAt(0) === " ") {
          c = c.substring(1, c.length);
        }
        if (c.indexOf(nameEQ) === 0) {
          return unescape(c.substring(nameEQ.length, c.length));
        }
      }
      return null;
    };
    clearCookie = (name) => {
      setCookie(name, "", 0);
    };
  }
});

// projects/lib/packages/yggdrasil/src/cfLodash.ts
function isObject(value) {
  const type = typeof value;
  return value !== null && (type === "object" || type === "function");
}
function throttle(func, wait, options) {
  let leading = true;
  let trailing = true;
  if (typeof func !== "function") {
    throw new TypeError("Expected a function");
  }
  if (isObject(options)) {
    leading = "leading" in options ? !!options.leading : leading;
    trailing = "trailing" in options ? !!options.trailing : trailing;
  }
  return debounce2(func, wait, {
    leading,
    trailing,
    maxWait: wait
  });
}
function debounce2(func, wait, options) {
  let lastArgs;
  let lastThis;
  let maxWait;
  let result;
  let timerId;
  let lastCallTime;
  let lastInvokeTime = 0;
  let leading = false;
  let maxing = false;
  let trailing = true;
  if (typeof func !== "function") {
    throw new TypeError("Expected a function");
  }
  wait = +wait || 0;
  if (isObject(options)) {
    leading = !!options.leading;
    maxing = "maxWait" in options;
    maxWait = maxing ? Math.max(+options.maxWait || 0, wait) : maxWait;
    trailing = "trailing" in options ? !!options.trailing : trailing;
  }
  function invokeFunc(time) {
    const args = lastArgs;
    const thisArg = lastThis;
    lastArgs = lastThis = void 0;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }
  function startTimer(pendingFunc, milliseconds) {
    return setTimeout(pendingFunc, milliseconds);
  }
  function cancelTimer(id) {
    clearTimeout(id);
  }
  function leadingEdge(time) {
    lastInvokeTime = time;
    timerId = startTimer(timerExpired, wait);
    return leading ? invokeFunc(time) : result;
  }
  function remainingWait(time) {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = wait - timeSinceLastCall;
    return maxing ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting;
  }
  function shouldInvoke(time) {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;
    return lastCallTime === void 0 || timeSinceLastCall >= wait || timeSinceLastCall < 0 || maxing && timeSinceLastInvoke >= maxWait;
  }
  function timerExpired() {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    timerId = startTimer(timerExpired, remainingWait(time));
    return void 0;
  }
  function trailingEdge(time) {
    timerId = void 0;
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = void 0;
    return result;
  }
  function cancel() {
    if (timerId !== void 0) {
      cancelTimer(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = void 0;
  }
  function flush() {
    return timerId === void 0 ? result : trailingEdge(Date.now());
  }
  function pending() {
    return timerId !== void 0;
  }
  function debounced(...args) {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);
    lastArgs = args;
    lastThis = this;
    lastCallTime = time;
    if (isInvoking) {
      if (timerId === void 0) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        timerId = startTimer(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === void 0) {
      timerId = startTimer(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  debounced.pending = pending;
  return debounced;
}
var reEscapedHtml, reHasEscapedHtml, reRegExpChar, reHasRegExpChar;
var init_cfLodash = __esm({
  "projects/lib/packages/yggdrasil/src/cfLodash.ts"() {
    init_define_process();
    reEscapedHtml = /&(?:amp|lt|gt|quot|#(0+)?(39|34));/g;
    reHasEscapedHtml = RegExp(reEscapedHtml.source);
    reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
    reHasRegExpChar = RegExp(reRegExpChar.source);
  }
});

// projects/lib/packages/yggdrasil-blueprints/src/Elements/Cart/index.ts
function hasPendingOperations() {
  return syncingCart.get() || unsynchronizedEvents.length > 0;
}
function closeCart() {
  const cartElement = document.querySelector('[data-page-element="CartReviewModal"]');
  const cartElementModal = cartElement.cf2_instance.getComponent("ModalSidebar/V1");
  cartElementModal.hide();
}
function openCart() {
  const cartElement = document.querySelector('[data-page-element="CartReviewModal"]');
  const cartElementModal = cartElement.cf2_instance.getComponent("ModalSidebar/V1");
  cartElementModal.show();
}
async function syncCartWithServer() {
  let response;
  if (syncingCart.get()) {
    return syncCartWithServerThrottled();
  }
  syncingCart.set(true);
  const operations = unsynchronizedEvents;
  unsynchronizedEvents = [];
  const max_retries = 3;
  for (let i = 0; i < max_retries; i++) {
    try {
      const loaded_product_ids = Object.keys(globalThis.globalResourceData?.productsById ?? {}).map(Number);
      response = await fetch("/user_pages/api/v1/carts/operations", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operations, loaded_product_ids })
      });
      if (response.ok) break;
    } catch (error) {
      console.warn("[Cart] Error syncing cart with server", error);
    }
    const status = response?.status ?? 0;
    if (status === 409) {
      const retryAfter = Number(response.headers.get("Retry-After") ?? 1e3);
      await sleepMs(retryAfter);
    } else if (status >= 400 && status < 500) {
      break;
    } else {
      await sleepMs(1e3 * (i + 1));
    }
    console.log(`[Cart] ${response?.status ?? 0} - Retrying sync operations`);
  }
  if (!response || !response.ok) {
    console.warn("[Cart] Error syncing cart with server", response);
    if (lastCartBeforeSync) {
      globalThis.globalResourceData.cart = { ...lastCartBeforeSync };
      Cart.stores.cartData.set(lastCartBeforeSync);
    }
    lastCartBeforeSync = null;
    const flashErrorElement = document.createElement("div");
    flashErrorElement.className = "alert alert-error";
    flashErrorElement.innerText = "We were unable to update your cart.";
    document.body.append(flashErrorElement);
    flashErrorElement.onanimationend = () => {
      document.body.removeChild(flashErrorElement);
    };
  } else {
    let newCartData;
    try {
      newCartData = await response.json();
    } catch (e) {
      console.error("[Cart] Error parsing response as json", e, response);
    }
    if (unsynchronizedEvents.length == 0) {
      globalThis.registerProductsIndexes(newCartData?.products_diff ?? []);
      globalThis.globalResourceData.cart = { ...newCartData };
      Cart.stores.cartData.set({ ...newCartData });
    }
  }
  syncingCart.set(false);
}
var unsynchronizedEvents, syncingCart, lastCartBeforeSync, syncCartWithServerThrottled, _Cart, Cart;
var init_Cart = __esm({
  "projects/lib/packages/yggdrasil-blueprints/src/Elements/Cart/index.ts"() {
    init_define_process();
    init_cfLodash();
    init_nanostores();
    init_general();
    init_cf_utils();
    unsynchronizedEvents = [];
    syncingCart = atom(false);
    lastCartBeforeSync = null;
    window.addEventListener("beforeunload", async (evt) => {
      if (hasPendingOperations()) {
        const ok = confirm();
        if (!ok) {
          evt.preventDefault();
        }
      }
    });
    syncCartWithServerThrottled = throttle(syncCartWithServer, 500, { leading: false });
    _Cart = class _Cart {
      static initialize() {
        const initialCart = this.getInitialCartData();
        this.stores.cartData = atom(initialCart);
        this.subscribers = [];
        this.operations = [];
        this.scheduledUpdate = false;
      }
      static listenToEvents(eventHandler) {
        this.subscribers.push(eventHandler);
      }
      static getInitialCartData() {
        return globalThis.globalResourceData.cart ?? { items: [], summary: { display_sub_total: "", total_quantity: 0 } };
      }
      static lineItemUniqueId(item) {
        return `${item.product_id}-${item.variant_id}-${item.price_id}`;
      }
      static findItemByUniqueId(uniqueId) {
        return this.stores.cartData.get().items.find((item) => this.lineItemUniqueId(item) === uniqueId);
      }
      static compareItems(item1, item2) {
        return item1.price_id == item2.price_id && item1.product_id == item2.product_id && item1.variant_id == item2.variant_id;
      }
      static removeItem(cartData, eventItem, updatePerformed) {
        const cartItems = cartData.items;
        const index = cartItems.findIndex((item) => this.compareItems(item, eventItem));
        if (index > -1) {
          updatePerformed = true;
          cartData.items.splice(index, 1);
        }
        return updatePerformed;
      }
      static queueOperation(operation) {
        this.operations.push(operation);
        if (this.scheduledUpdate) return;
        this.scheduledUpdate = true;
        queueMicrotask(() => {
          this.dispatchEvents();
          this.scheduledUpdate = false;
        });
      }
      static setOperation(items) {
        items = Array.isArray(items) ? items : [items];
        const operation = {
          type: "set",
          items
        };
        this.queueOperation(operation);
        return operation;
      }
      static upsertOperation(item, quantity = 1) {
        if (quantity == 0) {
          if (!window.confirm("Are you sure you want to remove this item from your cart?")) return;
        }
        const operation = {
          type: "upsert",
          item,
          quantity
        };
        this.queueOperation(operation);
        return operation;
      }
      static incrementOperation(item) {
        const operation = {
          type: "increment",
          item
        };
        this.queueOperation(operation);
        return operation;
      }
      static decrementOperation(item) {
        const cartItems = this.stores.cartData.get().items;
        const cartItem = cartItems.find((i) => this.compareItems(i, item));
        if (cartItem.quantity == 1) {
          if (!window.confirm("Are you sure you want to remove this item from your cart?")) {
            return;
          }
        }
        const operation = {
          type: "decrement",
          item
        };
        this.queueOperation(operation);
        return operation;
      }
      static removeOperation(item) {
        if (!window.confirm("Are you sure you want to remove this item from your cart?")) {
          return;
        }
        const operation = {
          type: "remove",
          item
        };
        this.queueOperation(operation);
        return operation;
      }
      static replaceOperation(item, newItem) {
        const operation = {
          type: "replace",
          item,
          newItem
        };
        this.queueOperation(operation);
        return operation;
      }
      static changeOrderIdOperation(orderId) {
        const operation = {
          type: "changeOrderId",
          orderId
        };
        this.queueOperation(operation);
        return operation;
      }
      static dispatchEvents() {
        const cartData = this.stores.cartData.get();
        if (!lastCartBeforeSync) {
          lastCartBeforeSync = structuredClone(cartData);
        }
        let updatePerformed = false;
        this.operations.forEach((event) => {
          switch (event.type) {
            case "changeOrderId": {
              if (cartData.order_id != event.orderId) {
                updatePerformed = true;
                cartData.order_id = event.orderId;
              }
              break;
            }
            case "set": {
              updatePerformed = true;
              cartData.items = event.items;
              break;
            }
            case "increment": {
              const cartItems = cartData.items;
              const index = cartItems.findIndex((item2) => this.compareItems(item2, event.item));
              const { item } = event;
              if (index == -1) {
                updatePerformed = true;
                cartItems.push({
                  ...item,
                  quantity: 1
                });
              } else {
                updatePerformed = true;
                cartItems[index].quantity += 1;
              }
              break;
            }
            case "decrement": {
              const cartItems = cartData.items;
              const index = cartItems.findIndex((item) => this.compareItems(item, event.item));
              if (cartItems[index].quantity == 1) {
                updatePerformed = this.removeItem(cartData, event.item, updatePerformed);
              } else {
                if (index != -1) {
                  updatePerformed = true;
                  cartItems[index].quantity -= 1;
                  if (cartItems[index].quantity <= 0) {
                    cartData.items.splice(index, 1);
                  }
                }
              }
              break;
            }
            case "upsert": {
              const cartItems = cartData.items;
              const index = cartItems.findIndex((item2) => this.compareItems(item2, event.item));
              const { item, quantity } = event;
              if (index == -1) {
                updatePerformed = true;
                cartItems.push({
                  ...item,
                  quantity
                });
              } else if (cartItems[index].quantity != quantity) {
                if (quantity == 0) {
                  updatePerformed = this.removeItem(cartData, event.item, updatePerformed);
                } else {
                  updatePerformed = true;
                  cartItems[index].quantity = quantity;
                }
              }
              break;
            }
            case "remove": {
              updatePerformed = this.removeItem(cartData, event.item, updatePerformed);
              break;
            }
            case "replace": {
              const cartItems = cartData.items;
              const index = cartItems.findIndex((item) => this.compareItems(item, event.item));
              const newItemIndex = cartItems.findIndex((item) => this.compareItems(item, event.newItem));
              if (index > -1) {
                const currentCartItem = cartItems[index];
                updatePerformed = true;
                if (newItemIndex > -1 && index != newItemIndex) {
                  const currentItemQuantity = currentCartItem.quantity;
                  cartItems[newItemIndex].quantity += currentItemQuantity;
                  cartItems.splice(index, 1);
                } else {
                  cartItems[index] = {
                    ...currentCartItem,
                    ...event.newItem
                  };
                }
              }
              break;
            }
          }
        });
        if (updatePerformed) {
          unsynchronizedEvents.push(
            ...this.operations.map((op) => {
              op.id = uuidv4();
              return op;
            })
          );
          syncCartWithServerThrottled();
          this.subscribers.forEach((sub) => {
            sub(this.operations);
          });
          globalThis.globalResourceData.cart = { ...cartData };
          _Cart.stores.cartData.set({ ...cartData });
        }
        this.operations = [];
      }
    };
    __publicField(_Cart, "stores", {});
    __publicField(_Cart, "subscribers");
    __publicField(_Cart, "operations", []);
    __publicField(_Cart, "scheduledUpdate");
    Cart = _Cart;
    Cart.initialize();
  }
});

export {
  atom,
  onMount,
  computed,
  listenKeys,
  map,
  nanostores_exports,
  init_nanostores,
  cleanEmptyObjectKeys,
  sleepMs,
  deepEqual,
  formatNumberToCurrency,
  numberToCurrency,
  isElementVisibleOnViewport,
  debounce,
  setCookie,
  getCookie,
  clearCookie,
  init_general,
  syncingCart,
  hasPendingOperations,
  closeCart,
  openCart,
  Cart,
  init_Cart
};
//# sourceMappingURL=chunk-BJEG6XD3.js.map
