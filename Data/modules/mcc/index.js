var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
function localize(stringId, data) {
  const result = typeof data !== "object" ? game.i18n.localize(stringId) : game.i18n.format(stringId, data);
  return result !== void 0 ? result : "";
}
__name(localize, "localize");
const statusData = {
  X: {
    hsl: [0, 100, 60],
    get explanation() {
      return localize("mcc.statuses.x");
    }
  },
  O: {
    hsl: [45, 90, 60],
    get explanation() {
      return localize("mcc.statuses.o");
    }
  },
  B: {
    hsl: [30, 90, 40],
    get explanation() {
      return localize("mcc.statuses.b");
    }
  },
  G: {
    hsl: [120, 40, 50],
    get explanation() {
      return localize("mcc.statuses.g");
    }
  },
  N: {
    hsl: [200, 60, 50],
    get explanation() {
      return localize("mcc.statuses.n");
    }
  },
  A: {
    hsl: [0, 0, 50],
    get explanation() {
      return localize("mcc.statuses.a");
    }
  },
  U: {
    hsl: [0, 0, 100],
    get explanation() {
      return localize("mcc.statuses.u");
    }
  },
  C: {
    hsl: [175, 75, 50],
    get explanation() {
      return localize("mcc.statuses.c");
    }
  }
};
const WORKER_URL = "https://mcc2.arcanist.workers.dev";
class SpreadsheetController {
  static spreadsheetStatus;
  static spreadsheetID;
  static async getVersions() {
    return await fetchJsonWithTimeout(`${WORKER_URL}/api/versions`);
  }
  static async getRows(version2) {
    const spreadsheet = await this.getSpreadsheet(version2);
    this.spreadsheetStatus = spreadsheet.status.trim();
    const modules = this.getModuleList();
    const rows = modules.map((module) => this.lookupCompatibility(spreadsheet, module, version2));
    return rows;
  }
  static async getSpreadsheet(version2) {
    const response = await fetchWithTimeout(`${WORKER_URL}/?version=${version2}`);
    this.spreadsheetID = response.headers.get("X-Spreadsheet-ID");
    return await response.json();
  }
  static getModuleList() {
    return [game.system, ...game.modules.values()];
  }
  static lookupCompatibility(spreadsheet, module, version2) {
    const {
      title,
      type = "module",
      authors: [{ name: authorName = null } = {}],
      compatibleCoreVersion,
      compatibility: { verified = null } = {}
    } = module.data;
    const installed = {
      title: title ?? localize("mcc.untitled"),
      type,
      id: module.id,
      author: authorName ?? module.data.author ?? localize("mcc.unknownAuthor"),
      version: verified ?? compatibleCoreVersion ?? "?",
      status: "U",
      notes: "",
      official: false
    };
    const data = spreadsheet.data.find((m) => m.id === (module.id ?? module.name)) ?? installed;
    for (const property of ["title", "type", "id", "author", "version", "status", "notes"]) {
      if (property === "version") {
        data.version = isNewerVersion(data.version, installed.version) ? data.version : installed.version;
      }
      if (["title", "author"].includes(property) || data[property] === void 0) {
        data[property] = installed[property];
      }
    }
    if (typeof data.status === "string") {
      data.status = data.status.toUpperCase();
    }
    if (data.status === void 0 || data.status === "") {
      data.status = "U";
    }
    if (data.status === "U" && this.isCompatibleVersion(data.version, version2)) {
      data.status = "C";
    }
    if (!statusData[data.status]) {
      const message = `Error in spreadsheet: ${data.title} (${data.id}) has an invalid status "${data.status}". Please contact Anathema#3668 on Discord.`;
      console.warn(message);
      data.notes = message;
      data.status = "X";
    }
    return data;
  }
  static isCompatibleVersion(v1, v0 = game.release.version) {
    const v1Major = String(v1).split(".")[0];
    const v0Major = String(v0).split(".")[0];
    return v1Major === v0Major || isNewerVersion(v1Major, v0Major);
  }
}
__name(SpreadsheetController, "SpreadsheetController");
function noop$1() {
}
__name(noop$1, "noop$1");
const identity = /* @__PURE__ */ __name((x) => x, "identity");
function assign(tar, src) {
  for (const k in src)
    tar[k] = src[k];
  return tar;
}
__name(assign, "assign");
function is_promise(value) {
  return value && typeof value === "object" && typeof value.then === "function";
}
__name(is_promise, "is_promise");
function run(fn) {
  return fn();
}
__name(run, "run");
function blank_object() {
  return /* @__PURE__ */ Object.create(null);
}
__name(blank_object, "blank_object");
function run_all(fns) {
  fns.forEach(run);
}
__name(run_all, "run_all");
function is_function(thing) {
  return typeof thing === "function";
}
__name(is_function, "is_function");
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
__name(safe_not_equal, "safe_not_equal");
function is_empty(obj) {
  return Object.keys(obj).length === 0;
}
__name(is_empty, "is_empty");
function subscribe(store, ...callbacks) {
  if (store == null) {
    return noop$1;
  }
  const unsub = store.subscribe(...callbacks);
  return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
__name(subscribe, "subscribe");
function get_store_value(store) {
  let value;
  subscribe(store, (_) => value = _)();
  return value;
}
__name(get_store_value, "get_store_value");
function component_subscribe(component, store, callback2) {
  component.$$.on_destroy.push(subscribe(store, callback2));
}
__name(component_subscribe, "component_subscribe");
function create_slot(definition, ctx, $$scope, fn) {
  if (definition) {
    const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
    return definition[0](slot_ctx);
  }
}
__name(create_slot, "create_slot");
function get_slot_context(definition, ctx, $$scope, fn) {
  return definition[1] && fn ? assign($$scope.ctx.slice(), definition[1](fn(ctx))) : $$scope.ctx;
}
__name(get_slot_context, "get_slot_context");
function get_slot_changes(definition, $$scope, dirty, fn) {
  if (definition[2] && fn) {
    const lets = definition[2](fn(dirty));
    if ($$scope.dirty === void 0) {
      return lets;
    }
    if (typeof lets === "object") {
      const merged = [];
      const len = Math.max($$scope.dirty.length, lets.length);
      for (let i = 0; i < len; i += 1) {
        merged[i] = $$scope.dirty[i] | lets[i];
      }
      return merged;
    }
    return $$scope.dirty | lets;
  }
  return $$scope.dirty;
}
__name(get_slot_changes, "get_slot_changes");
function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
  if (slot_changes) {
    const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
    slot.p(slot_context, slot_changes);
  }
}
__name(update_slot_base, "update_slot_base");
function get_all_dirty_from_scope($$scope) {
  if ($$scope.ctx.length > 32) {
    const dirty = [];
    const length = $$scope.ctx.length / 32;
    for (let i = 0; i < length; i++) {
      dirty[i] = -1;
    }
    return dirty;
  }
  return -1;
}
__name(get_all_dirty_from_scope, "get_all_dirty_from_scope");
function null_to_empty(value) {
  return value == null ? "" : value;
}
__name(null_to_empty, "null_to_empty");
function set_store_value(store, ret, value) {
  store.set(value);
  return ret;
}
__name(set_store_value, "set_store_value");
function action_destroyer(action_result) {
  return action_result && is_function(action_result.destroy) ? action_result.destroy : noop$1;
}
__name(action_destroyer, "action_destroyer");
const is_client = typeof window !== "undefined";
let now = is_client ? () => window.performance.now() : () => Date.now();
let raf = is_client ? (cb) => requestAnimationFrame(cb) : noop$1;
const tasks = /* @__PURE__ */ new Set();
function run_tasks(now2) {
  tasks.forEach((task) => {
    if (!task.c(now2)) {
      tasks.delete(task);
      task.f();
    }
  });
  if (tasks.size !== 0)
    raf(run_tasks);
}
__name(run_tasks, "run_tasks");
function loop(callback2) {
  let task;
  if (tasks.size === 0)
    raf(run_tasks);
  return {
    promise: new Promise((fulfill) => {
      tasks.add(task = { c: callback2, f: fulfill });
    }),
    abort() {
      tasks.delete(task);
    }
  };
}
__name(loop, "loop");
function append(target, node) {
  target.appendChild(node);
}
__name(append, "append");
function get_root_for_style(node) {
  if (!node)
    return document;
  const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
  if (root && root.host) {
    return root;
  }
  return node.ownerDocument;
}
__name(get_root_for_style, "get_root_for_style");
function append_empty_stylesheet(node) {
  const style_element = element("style");
  append_stylesheet(get_root_for_style(node), style_element);
  return style_element.sheet;
}
__name(append_empty_stylesheet, "append_empty_stylesheet");
function append_stylesheet(node, style) {
  append(node.head || node, style);
  return style.sheet;
}
__name(append_stylesheet, "append_stylesheet");
function insert(target, node, anchor) {
  target.insertBefore(node, anchor || null);
}
__name(insert, "insert");
function detach(node) {
  node.parentNode.removeChild(node);
}
__name(detach, "detach");
function destroy_each(iterations, detaching) {
  for (let i = 0; i < iterations.length; i += 1) {
    if (iterations[i])
      iterations[i].d(detaching);
  }
}
__name(destroy_each, "destroy_each");
function element(name) {
  return document.createElement(name);
}
__name(element, "element");
function svg_element(name) {
  return document.createElementNS("http://www.w3.org/2000/svg", name);
}
__name(svg_element, "svg_element");
function text(data) {
  return document.createTextNode(data);
}
__name(text, "text");
function space() {
  return text(" ");
}
__name(space, "space");
function empty() {
  return text("");
}
__name(empty, "empty");
function listen(node, event, handler, options) {
  node.addEventListener(event, handler, options);
  return () => node.removeEventListener(event, handler, options);
}
__name(listen, "listen");
function prevent_default(fn) {
  return function(event) {
    event.preventDefault();
    return fn.call(this, event);
  };
}
__name(prevent_default, "prevent_default");
function stop_propagation(fn) {
  return function(event) {
    event.stopPropagation();
    return fn.call(this, event);
  };
}
__name(stop_propagation, "stop_propagation");
function attr(node, attribute, value) {
  if (value == null)
    node.removeAttribute(attribute);
  else if (node.getAttribute(attribute) !== value)
    node.setAttribute(attribute, value);
}
__name(attr, "attr");
function set_attributes(node, attributes) {
  const descriptors2 = Object.getOwnPropertyDescriptors(node.__proto__);
  for (const key in attributes) {
    if (attributes[key] == null) {
      node.removeAttribute(key);
    } else if (key === "style") {
      node.style.cssText = attributes[key];
    } else if (key === "__value") {
      node.value = node[key] = attributes[key];
    } else if (descriptors2[key] && descriptors2[key].set) {
      node[key] = attributes[key];
    } else {
      attr(node, key, attributes[key]);
    }
  }
}
__name(set_attributes, "set_attributes");
function children(element2) {
  return Array.from(element2.childNodes);
}
__name(children, "children");
function set_data(text2, data) {
  data = "" + data;
  if (text2.wholeText !== data)
    text2.data = data;
}
__name(set_data, "set_data");
function set_input_value(input, value) {
  input.value = value == null ? "" : value;
}
__name(set_input_value, "set_input_value");
function set_style(node, key, value, important) {
  if (value === null) {
    node.style.removeProperty(key);
  } else {
    node.style.setProperty(key, value, important ? "important" : "");
  }
}
__name(set_style, "set_style");
function select_option(select, value) {
  for (let i = 0; i < select.options.length; i += 1) {
    const option = select.options[i];
    if (option.__value === value) {
      option.selected = true;
      return;
    }
  }
  select.selectedIndex = -1;
}
__name(select_option, "select_option");
function select_value(select) {
  const selected_option = select.querySelector(":checked") || select.options[0];
  return selected_option && selected_option.__value;
}
__name(select_value, "select_value");
function toggle_class(element2, name, toggle) {
  element2.classList[toggle ? "add" : "remove"](name);
}
__name(toggle_class, "toggle_class");
function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
  const e = document.createEvent("CustomEvent");
  e.initCustomEvent(type, bubbles, cancelable, detail);
  return e;
}
__name(custom_event, "custom_event");
class HtmlTag {
  constructor(is_svg = false) {
    this.is_svg = false;
    this.is_svg = is_svg;
    this.e = this.n = null;
  }
  c(html) {
    this.h(html);
  }
  m(html, target, anchor = null) {
    if (!this.e) {
      if (this.is_svg)
        this.e = svg_element(target.nodeName);
      else
        this.e = element(target.nodeName);
      this.t = target;
      this.c(html);
    }
    this.i(anchor);
  }
  h(html) {
    this.e.innerHTML = html;
    this.n = Array.from(this.e.childNodes);
  }
  i(anchor) {
    for (let i = 0; i < this.n.length; i += 1) {
      insert(this.t, this.n[i], anchor);
    }
  }
  p(html) {
    this.d();
    this.h(html);
    this.i(this.a);
  }
  d() {
    this.n.forEach(detach);
  }
}
__name(HtmlTag, "HtmlTag");
function construct_svelte_component(component, props) {
  return new component(props);
}
__name(construct_svelte_component, "construct_svelte_component");
const managed_styles = /* @__PURE__ */ new Map();
let active$1 = 0;
function hash(str) {
  let hash2 = 5381;
  let i = str.length;
  while (i--)
    hash2 = (hash2 << 5) - hash2 ^ str.charCodeAt(i);
  return hash2 >>> 0;
}
__name(hash, "hash");
function create_style_information(doc, node) {
  const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
  managed_styles.set(doc, info);
  return info;
}
__name(create_style_information, "create_style_information");
function create_rule(node, a, b, duration, delay, ease, fn, uid2 = 0) {
  const step = 16.666 / duration;
  let keyframes = "{\n";
  for (let p = 0; p <= 1; p += step) {
    const t = a + (b - a) * ease(p);
    keyframes += p * 100 + `%{${fn(t, 1 - t)}}
`;
  }
  const rule = keyframes + `100% {${fn(b, 1 - b)}}
}`;
  const name = `__svelte_${hash(rule)}_${uid2}`;
  const doc = get_root_for_style(node);
  const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
  if (!rules[name]) {
    rules[name] = true;
    stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
  }
  const animation = node.style.animation || "";
  node.style.animation = `${animation ? `${animation}, ` : ""}${name} ${duration}ms linear ${delay}ms 1 both`;
  active$1 += 1;
  return name;
}
__name(create_rule, "create_rule");
function delete_rule(node, name) {
  const previous = (node.style.animation || "").split(", ");
  const next = previous.filter(
    name ? (anim) => anim.indexOf(name) < 0 : (anim) => anim.indexOf("__svelte") === -1
  );
  const deleted = previous.length - next.length;
  if (deleted) {
    node.style.animation = next.join(", ");
    active$1 -= deleted;
    if (!active$1)
      clear_rules();
  }
}
__name(delete_rule, "delete_rule");
function clear_rules() {
  raf(() => {
    if (active$1)
      return;
    managed_styles.forEach((info) => {
      const { ownerNode } = info.stylesheet;
      if (ownerNode)
        detach(ownerNode);
    });
    managed_styles.clear();
  });
}
__name(clear_rules, "clear_rules");
function create_animation(node, from2, fn, params) {
  if (!from2)
    return noop$1;
  const to2 = node.getBoundingClientRect();
  if (from2.left === to2.left && from2.right === to2.right && from2.top === to2.top && from2.bottom === to2.bottom)
    return noop$1;
  const {
    delay = 0,
    duration = 300,
    easing = identity,
    start: start_time = now() + delay,
    end = start_time + duration,
    tick = noop$1,
    css
  } = fn(node, { from: from2, to: to2 }, params);
  let running = true;
  let started = false;
  let name;
  function start() {
    if (css) {
      name = create_rule(node, 0, 1, duration, delay, easing, css);
    }
    if (!delay) {
      started = true;
    }
  }
  __name(start, "start");
  function stop() {
    if (css)
      delete_rule(node, name);
    running = false;
  }
  __name(stop, "stop");
  loop((now2) => {
    if (!started && now2 >= start_time) {
      started = true;
    }
    if (started && now2 >= end) {
      tick(1, 0);
      stop();
    }
    if (!running) {
      return false;
    }
    if (started) {
      const p = now2 - start_time;
      const t = 0 + 1 * easing(p / duration);
      tick(t, 1 - t);
    }
    return true;
  });
  start();
  tick(0, 1);
  return stop;
}
__name(create_animation, "create_animation");
function fix_position(node) {
  const style = getComputedStyle(node);
  if (style.position !== "absolute" && style.position !== "fixed") {
    const { width, height } = style;
    const a = node.getBoundingClientRect();
    node.style.position = "absolute";
    node.style.width = width;
    node.style.height = height;
    add_transform(node, a);
  }
}
__name(fix_position, "fix_position");
function add_transform(node, a) {
  const b = node.getBoundingClientRect();
  if (a.left !== b.left || a.top !== b.top) {
    const style = getComputedStyle(node);
    const transform = style.transform === "none" ? "" : style.transform;
    node.style.transform = `${transform} translate(${a.left - b.left}px, ${a.top - b.top}px)`;
  }
}
__name(add_transform, "add_transform");
let current_component;
function set_current_component(component) {
  current_component = component;
}
__name(set_current_component, "set_current_component");
function get_current_component() {
  if (!current_component)
    throw new Error("Function called outside component initialization");
  return current_component;
}
__name(get_current_component, "get_current_component");
function onMount(fn) {
  get_current_component().$$.on_mount.push(fn);
}
__name(onMount, "onMount");
function onDestroy(fn) {
  get_current_component().$$.on_destroy.push(fn);
}
__name(onDestroy, "onDestroy");
function createEventDispatcher() {
  const component = get_current_component();
  return (type, detail, { cancelable = false } = {}) => {
    const callbacks = component.$$.callbacks[type];
    if (callbacks) {
      const event = custom_event(type, detail, { cancelable });
      callbacks.slice().forEach((fn) => {
        fn.call(component, event);
      });
      return !event.defaultPrevented;
    }
    return true;
  };
}
__name(createEventDispatcher, "createEventDispatcher");
function setContext(key, context) {
  get_current_component().$$.context.set(key, context);
  return context;
}
__name(setContext, "setContext");
function getContext(key) {
  return get_current_component().$$.context.get(key);
}
__name(getContext, "getContext");
function bubble(component, event) {
  const callbacks = component.$$.callbacks[event.type];
  if (callbacks) {
    callbacks.slice().forEach((fn) => fn.call(this, event));
  }
}
__name(bubble, "bubble");
const dirty_components = [];
const binding_callbacks = [];
const render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = Promise.resolve();
let update_scheduled = false;
function schedule_update() {
  if (!update_scheduled) {
    update_scheduled = true;
    resolved_promise.then(flush);
  }
}
__name(schedule_update, "schedule_update");
function add_render_callback(fn) {
  render_callbacks.push(fn);
}
__name(add_render_callback, "add_render_callback");
function add_flush_callback(fn) {
  flush_callbacks.push(fn);
}
__name(add_flush_callback, "add_flush_callback");
const seen_callbacks = /* @__PURE__ */ new Set();
let flushidx = 0;
function flush() {
  const saved_component = current_component;
  do {
    while (flushidx < dirty_components.length) {
      const component = dirty_components[flushidx];
      flushidx++;
      set_current_component(component);
      update(component.$$);
    }
    set_current_component(null);
    dirty_components.length = 0;
    flushidx = 0;
    while (binding_callbacks.length)
      binding_callbacks.pop()();
    for (let i = 0; i < render_callbacks.length; i += 1) {
      const callback2 = render_callbacks[i];
      if (!seen_callbacks.has(callback2)) {
        seen_callbacks.add(callback2);
        callback2();
      }
    }
    render_callbacks.length = 0;
  } while (dirty_components.length);
  while (flush_callbacks.length) {
    flush_callbacks.pop()();
  }
  update_scheduled = false;
  seen_callbacks.clear();
  set_current_component(saved_component);
}
__name(flush, "flush");
function update($$) {
  if ($$.fragment !== null) {
    $$.update();
    run_all($$.before_update);
    const dirty = $$.dirty;
    $$.dirty = [-1];
    $$.fragment && $$.fragment.p($$.ctx, dirty);
    $$.after_update.forEach(add_render_callback);
  }
}
__name(update, "update");
let promise;
function wait() {
  if (!promise) {
    promise = Promise.resolve();
    promise.then(() => {
      promise = null;
    });
  }
  return promise;
}
__name(wait, "wait");
function dispatch(node, direction, kind) {
  node.dispatchEvent(custom_event(`${direction ? "intro" : "outro"}${kind}`));
}
__name(dispatch, "dispatch");
const outroing = /* @__PURE__ */ new Set();
let outros;
function group_outros() {
  outros = {
    r: 0,
    c: [],
    p: outros
  };
}
__name(group_outros, "group_outros");
function check_outros() {
  if (!outros.r) {
    run_all(outros.c);
  }
  outros = outros.p;
}
__name(check_outros, "check_outros");
function transition_in(block, local) {
  if (block && block.i) {
    outroing.delete(block);
    block.i(local);
  }
}
__name(transition_in, "transition_in");
function transition_out(block, local, detach2, callback2) {
  if (block && block.o) {
    if (outroing.has(block))
      return;
    outroing.add(block);
    outros.c.push(() => {
      outroing.delete(block);
      if (callback2) {
        if (detach2)
          block.d(1);
        callback2();
      }
    });
    block.o(local);
  } else if (callback2) {
    callback2();
  }
}
__name(transition_out, "transition_out");
const null_transition = { duration: 0 };
function create_in_transition(node, fn, params) {
  let config = fn(node, params);
  let running = false;
  let animation_name;
  let task;
  let uid2 = 0;
  function cleanup() {
    if (animation_name)
      delete_rule(node, animation_name);
  }
  __name(cleanup, "cleanup");
  function go() {
    const { delay = 0, duration = 300, easing = identity, tick = noop$1, css } = config || null_transition;
    if (css)
      animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid2++);
    tick(0, 1);
    const start_time = now() + delay;
    const end_time = start_time + duration;
    if (task)
      task.abort();
    running = true;
    add_render_callback(() => dispatch(node, true, "start"));
    task = loop((now2) => {
      if (running) {
        if (now2 >= end_time) {
          tick(1, 0);
          dispatch(node, true, "end");
          cleanup();
          return running = false;
        }
        if (now2 >= start_time) {
          const t = easing((now2 - start_time) / duration);
          tick(t, 1 - t);
        }
      }
      return running;
    });
  }
  __name(go, "go");
  let started = false;
  return {
    start() {
      if (started)
        return;
      started = true;
      delete_rule(node);
      if (is_function(config)) {
        config = config();
        wait().then(go);
      } else {
        go();
      }
    },
    invalidate() {
      started = false;
    },
    end() {
      if (running) {
        cleanup();
        running = false;
      }
    }
  };
}
__name(create_in_transition, "create_in_transition");
function create_out_transition(node, fn, params) {
  let config = fn(node, params);
  let running = true;
  let animation_name;
  const group = outros;
  group.r += 1;
  function go() {
    const { delay = 0, duration = 300, easing = identity, tick = noop$1, css } = config || null_transition;
    if (css)
      animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
    const start_time = now() + delay;
    const end_time = start_time + duration;
    add_render_callback(() => dispatch(node, false, "start"));
    loop((now2) => {
      if (running) {
        if (now2 >= end_time) {
          tick(0, 1);
          dispatch(node, false, "end");
          if (!--group.r) {
            run_all(group.c);
          }
          return false;
        }
        if (now2 >= start_time) {
          const t = easing((now2 - start_time) / duration);
          tick(1 - t, t);
        }
      }
      return running;
    });
  }
  __name(go, "go");
  if (is_function(config)) {
    wait().then(() => {
      config = config();
      go();
    });
  } else {
    go();
  }
  return {
    end(reset) {
      if (reset && config.tick) {
        config.tick(1, 0);
      }
      if (running) {
        if (animation_name)
          delete_rule(node, animation_name);
        running = false;
      }
    }
  };
}
__name(create_out_transition, "create_out_transition");
function create_bidirectional_transition(node, fn, params, intro) {
  let config = fn(node, params);
  let t = intro ? 0 : 1;
  let running_program = null;
  let pending_program = null;
  let animation_name = null;
  function clear_animation() {
    if (animation_name)
      delete_rule(node, animation_name);
  }
  __name(clear_animation, "clear_animation");
  function init2(program, duration) {
    const d = program.b - t;
    duration *= Math.abs(d);
    return {
      a: t,
      b: program.b,
      d,
      duration,
      start: program.start,
      end: program.start + duration,
      group: program.group
    };
  }
  __name(init2, "init");
  function go(b) {
    const { delay = 0, duration = 300, easing = identity, tick = noop$1, css } = config || null_transition;
    const program = {
      start: now() + delay,
      b
    };
    if (!b) {
      program.group = outros;
      outros.r += 1;
    }
    if (running_program || pending_program) {
      pending_program = program;
    } else {
      if (css) {
        clear_animation();
        animation_name = create_rule(node, t, b, duration, delay, easing, css);
      }
      if (b)
        tick(0, 1);
      running_program = init2(program, duration);
      add_render_callback(() => dispatch(node, b, "start"));
      loop((now2) => {
        if (pending_program && now2 > pending_program.start) {
          running_program = init2(pending_program, duration);
          pending_program = null;
          dispatch(node, running_program.b, "start");
          if (css) {
            clear_animation();
            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
          }
        }
        if (running_program) {
          if (now2 >= running_program.end) {
            tick(t = running_program.b, 1 - t);
            dispatch(node, running_program.b, "end");
            if (!pending_program) {
              if (running_program.b) {
                clear_animation();
              } else {
                if (!--running_program.group.r)
                  run_all(running_program.group.c);
              }
            }
            running_program = null;
          } else if (now2 >= running_program.start) {
            const p = now2 - running_program.start;
            t = running_program.a + running_program.d * easing(p / running_program.duration);
            tick(t, 1 - t);
          }
        }
        return !!(running_program || pending_program);
      });
    }
  }
  __name(go, "go");
  return {
    run(b) {
      if (is_function(config)) {
        wait().then(() => {
          config = config();
          go(b);
        });
      } else {
        go(b);
      }
    },
    end() {
      clear_animation();
      running_program = pending_program = null;
    }
  };
}
__name(create_bidirectional_transition, "create_bidirectional_transition");
function handle_promise(promise2, info) {
  const token = info.token = {};
  function update2(type, index2, key, value) {
    if (info.token !== token)
      return;
    info.resolved = value;
    let child_ctx = info.ctx;
    if (key !== void 0) {
      child_ctx = child_ctx.slice();
      child_ctx[key] = value;
    }
    const block = type && (info.current = type)(child_ctx);
    let needs_flush = false;
    if (info.block) {
      if (info.blocks) {
        info.blocks.forEach((block2, i) => {
          if (i !== index2 && block2) {
            group_outros();
            transition_out(block2, 1, 1, () => {
              if (info.blocks[i] === block2) {
                info.blocks[i] = null;
              }
            });
            check_outros();
          }
        });
      } else {
        info.block.d(1);
      }
      block.c();
      transition_in(block, 1);
      block.m(info.mount(), info.anchor);
      needs_flush = true;
    }
    info.block = block;
    if (info.blocks)
      info.blocks[index2] = block;
    if (needs_flush) {
      flush();
    }
  }
  __name(update2, "update");
  if (is_promise(promise2)) {
    const current_component2 = get_current_component();
    promise2.then((value) => {
      set_current_component(current_component2);
      update2(info.then, 1, info.value, value);
      set_current_component(null);
    }, (error) => {
      set_current_component(current_component2);
      update2(info.catch, 2, info.error, error);
      set_current_component(null);
      if (!info.hasCatch) {
        throw error;
      }
    });
    if (info.current !== info.pending) {
      update2(info.pending, 0);
      return true;
    }
  } else {
    if (info.current !== info.then) {
      update2(info.then, 1, info.value, promise2);
      return true;
    }
    info.resolved = promise2;
  }
}
__name(handle_promise, "handle_promise");
function update_await_block_branch(info, ctx, dirty) {
  const child_ctx = ctx.slice();
  const { resolved } = info;
  if (info.current === info.then) {
    child_ctx[info.value] = resolved;
  }
  if (info.current === info.catch) {
    child_ctx[info.error] = resolved;
  }
  info.block.p(child_ctx, dirty);
}
__name(update_await_block_branch, "update_await_block_branch");
const globals = typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : global;
function destroy_block(block, lookup) {
  block.d(1);
  lookup.delete(block.key);
}
__name(destroy_block, "destroy_block");
function fix_and_destroy_block(block, lookup) {
  block.f();
  destroy_block(block, lookup);
}
__name(fix_and_destroy_block, "fix_and_destroy_block");
function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block2, next, get_context) {
  let o = old_blocks.length;
  let n = list.length;
  let i = o;
  const old_indexes = {};
  while (i--)
    old_indexes[old_blocks[i].key] = i;
  const new_blocks = [];
  const new_lookup = /* @__PURE__ */ new Map();
  const deltas = /* @__PURE__ */ new Map();
  i = n;
  while (i--) {
    const child_ctx = get_context(ctx, list, i);
    const key = get_key(child_ctx);
    let block = lookup.get(key);
    if (!block) {
      block = create_each_block2(key, child_ctx);
      block.c();
    } else if (dynamic) {
      block.p(child_ctx, dirty);
    }
    new_lookup.set(key, new_blocks[i] = block);
    if (key in old_indexes)
      deltas.set(key, Math.abs(i - old_indexes[key]));
  }
  const will_move = /* @__PURE__ */ new Set();
  const did_move = /* @__PURE__ */ new Set();
  function insert2(block) {
    transition_in(block, 1);
    block.m(node, next);
    lookup.set(block.key, block);
    next = block.first;
    n--;
  }
  __name(insert2, "insert");
  while (o && n) {
    const new_block = new_blocks[n - 1];
    const old_block = old_blocks[o - 1];
    const new_key = new_block.key;
    const old_key = old_block.key;
    if (new_block === old_block) {
      next = new_block.first;
      o--;
      n--;
    } else if (!new_lookup.has(old_key)) {
      destroy(old_block, lookup);
      o--;
    } else if (!lookup.has(new_key) || will_move.has(new_key)) {
      insert2(new_block);
    } else if (did_move.has(old_key)) {
      o--;
    } else if (deltas.get(new_key) > deltas.get(old_key)) {
      did_move.add(new_key);
      insert2(new_block);
    } else {
      will_move.add(old_key);
      o--;
    }
  }
  while (o--) {
    const old_block = old_blocks[o];
    if (!new_lookup.has(old_block.key))
      destroy(old_block, lookup);
  }
  while (n)
    insert2(new_blocks[n - 1]);
  return new_blocks;
}
__name(update_keyed_each, "update_keyed_each");
function get_spread_update(levels, updates) {
  const update2 = {};
  const to_null_out = {};
  const accounted_for = { $$scope: 1 };
  let i = levels.length;
  while (i--) {
    const o = levels[i];
    const n = updates[i];
    if (n) {
      for (const key in o) {
        if (!(key in n))
          to_null_out[key] = 1;
      }
      for (const key in n) {
        if (!accounted_for[key]) {
          update2[key] = n[key];
          accounted_for[key] = 1;
        }
      }
      levels[i] = n;
    } else {
      for (const key in o) {
        accounted_for[key] = 1;
      }
    }
  }
  for (const key in to_null_out) {
    if (!(key in update2))
      update2[key] = void 0;
  }
  return update2;
}
__name(get_spread_update, "get_spread_update");
function get_spread_object(spread_props) {
  return typeof spread_props === "object" && spread_props !== null ? spread_props : {};
}
__name(get_spread_object, "get_spread_object");
function bind$1(component, name, callback2) {
  const index2 = component.$$.props[name];
  if (index2 !== void 0) {
    component.$$.bound[index2] = callback2;
    callback2(component.$$.ctx[index2]);
  }
}
__name(bind$1, "bind$1");
function create_component(block) {
  block && block.c();
}
__name(create_component, "create_component");
function mount_component(component, target, anchor, customElement) {
  const { fragment, after_update } = component.$$;
  fragment && fragment.m(target, anchor);
  if (!customElement) {
    add_render_callback(() => {
      const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
      if (component.$$.on_destroy) {
        component.$$.on_destroy.push(...new_on_destroy);
      } else {
        run_all(new_on_destroy);
      }
      component.$$.on_mount = [];
    });
  }
  after_update.forEach(add_render_callback);
}
__name(mount_component, "mount_component");
function destroy_component(component, detaching) {
  const $$ = component.$$;
  if ($$.fragment !== null) {
    run_all($$.on_destroy);
    $$.fragment && $$.fragment.d(detaching);
    $$.on_destroy = $$.fragment = null;
    $$.ctx = [];
  }
}
__name(destroy_component, "destroy_component");
function make_dirty(component, i) {
  if (component.$$.dirty[0] === -1) {
    dirty_components.push(component);
    schedule_update();
    component.$$.dirty.fill(0);
  }
  component.$$.dirty[i / 31 | 0] |= 1 << i % 31;
}
__name(make_dirty, "make_dirty");
function init$1(component, options, instance2, create_fragment2, not_equal, props, append_styles, dirty = [-1]) {
  const parent_component = current_component;
  set_current_component(component);
  const $$ = component.$$ = {
    fragment: null,
    ctx: [],
    props,
    update: noop$1,
    not_equal,
    bound: blank_object(),
    on_mount: [],
    on_destroy: [],
    on_disconnect: [],
    before_update: [],
    after_update: [],
    context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
    callbacks: blank_object(),
    dirty,
    skip_bound: false,
    root: options.target || parent_component.$$.root
  };
  append_styles && append_styles($$.root);
  let ready = false;
  $$.ctx = instance2 ? instance2(component, options.props || {}, (i, ret, ...rest) => {
    const value = rest.length ? rest[0] : ret;
    if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
      if (!$$.skip_bound && $$.bound[i])
        $$.bound[i](value);
      if (ready)
        make_dirty(component, i);
    }
    return ret;
  }) : [];
  $$.update();
  ready = true;
  run_all($$.before_update);
  $$.fragment = create_fragment2 ? create_fragment2($$.ctx) : false;
  if (options.target) {
    if (options.hydrate) {
      const nodes = children(options.target);
      $$.fragment && $$.fragment.l(nodes);
      nodes.forEach(detach);
    } else {
      $$.fragment && $$.fragment.c();
    }
    if (options.intro)
      transition_in(component.$$.fragment);
    mount_component(component, options.target, options.anchor, options.customElement);
    flush();
  }
  set_current_component(parent_component);
}
__name(init$1, "init$1");
class SvelteComponent {
  $destroy() {
    destroy_component(this, 1);
    this.$destroy = noop$1;
  }
  $on(type, callback2) {
    if (!is_function(callback2)) {
      return noop$1;
    }
    const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
    callbacks.push(callback2);
    return () => {
      const index2 = callbacks.indexOf(callback2);
      if (index2 !== -1)
        callbacks.splice(index2, 1);
    };
  }
  $set($$props) {
    if (this.$$set && !is_empty($$props)) {
      this.$$.skip_bound = true;
      this.$$set($$props);
      this.$$.skip_bound = false;
    }
  }
}
__name(SvelteComponent, "SvelteComponent");
const subscriber_queue = [];
function readable(value, start) {
  return {
    subscribe: writable$1(value, start).subscribe
  };
}
__name(readable, "readable");
function writable$1(value, start = noop$1) {
  let stop;
  const subscribers = /* @__PURE__ */ new Set();
  function set2(new_value) {
    if (safe_not_equal(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue.length;
        for (const subscriber of subscribers) {
          subscriber[1]();
          subscriber_queue.push(subscriber, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue.length; i += 2) {
            subscriber_queue[i][0](subscriber_queue[i + 1]);
          }
          subscriber_queue.length = 0;
        }
      }
    }
  }
  __name(set2, "set");
  function update2(fn) {
    set2(fn(value));
  }
  __name(update2, "update");
  function subscribe2(run2, invalidate = noop$1) {
    const subscriber = [run2, invalidate];
    subscribers.add(subscriber);
    if (subscribers.size === 1) {
      stop = start(set2) || noop$1;
    }
    run2(value);
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0) {
        stop();
        stop = null;
      }
    };
  }
  __name(subscribe2, "subscribe");
  return { set: set2, update: update2, subscribe: subscribe2 };
}
__name(writable$1, "writable$1");
function derived(stores, fn, initial_value) {
  const single = !Array.isArray(stores);
  const stores_array = single ? [stores] : stores;
  const auto = fn.length < 2;
  return readable(initial_value, (set2) => {
    let inited = false;
    const values = [];
    let pending = 0;
    let cleanup = noop$1;
    const sync = /* @__PURE__ */ __name(() => {
      if (pending) {
        return;
      }
      cleanup();
      const result = fn(single ? values[0] : values, set2);
      if (auto) {
        set2(result);
      } else {
        cleanup = is_function(result) ? result : noop$1;
      }
    }, "sync");
    const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
      values[i] = value;
      pending &= ~(1 << i);
      if (inited) {
        sync();
      }
    }, () => {
      pending |= 1 << i;
    }));
    inited = true;
    sync();
    return /* @__PURE__ */ __name(function stop() {
      run_all(unsubscribers);
      cleanup();
    }, "stop");
  });
}
__name(derived, "derived");
function normalizeString(query) {
  return query.trim().normalize("NFD").replace(/[\x00-\x1F]/gm, "");
}
__name(normalizeString, "normalizeString");
const s_TAG_OBJECT = "[object Object]";
function deepMerge(target = {}, ...sourceObj) {
  if (Object.prototype.toString.call(target) !== s_TAG_OBJECT) {
    throw new TypeError(`deepMerge error: 'target' is not an 'object'.`);
  }
  for (let cntr = 0; cntr < sourceObj.length; cntr++) {
    if (Object.prototype.toString.call(sourceObj[cntr]) !== s_TAG_OBJECT) {
      throw new TypeError(`deepMerge error: 'sourceObj[${cntr}]' is not an 'object'.`);
    }
  }
  return _deepMerge(target, ...sourceObj);
}
__name(deepMerge, "deepMerge");
function isIterable(value) {
  if (value === null || value === void 0 || typeof value !== "object") {
    return false;
  }
  return typeof value[Symbol.iterator] === "function";
}
__name(isIterable, "isIterable");
function isObject$1(value) {
  return value !== null && typeof value === "object";
}
__name(isObject$1, "isObject$1");
function isPlainObject(value) {
  if (Object.prototype.toString.call(value) !== s_TAG_OBJECT) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === null || prototype === Object.prototype;
}
__name(isPlainObject, "isPlainObject");
function safeAccess(data, accessor, defaultValue = void 0) {
  if (typeof data !== "object") {
    return defaultValue;
  }
  if (typeof accessor !== "string") {
    return defaultValue;
  }
  const access = accessor.split(".");
  for (let cntr = 0; cntr < access.length; cntr++) {
    if (typeof data[access[cntr]] === "undefined" || data[access[cntr]] === null) {
      return defaultValue;
    }
    data = data[access[cntr]];
  }
  return data;
}
__name(safeAccess, "safeAccess");
function safeSet(data, accessor, value, operation = "set", createMissing = true) {
  if (typeof data !== "object") {
    throw new TypeError(`safeSet Error: 'data' is not an 'object'.`);
  }
  if (typeof accessor !== "string") {
    throw new TypeError(`safeSet Error: 'accessor' is not a 'string'.`);
  }
  const access = accessor.split(".");
  for (let cntr = 0; cntr < access.length; cntr++) {
    if (Array.isArray(data)) {
      const number = +access[cntr];
      if (!Number.isInteger(number) || number < 0) {
        return false;
      }
    }
    if (cntr === access.length - 1) {
      switch (operation) {
        case "add":
          data[access[cntr]] += value;
          break;
        case "div":
          data[access[cntr]] /= value;
          break;
        case "mult":
          data[access[cntr]] *= value;
          break;
        case "set":
          data[access[cntr]] = value;
          break;
        case "set-undefined":
          if (typeof data[access[cntr]] === "undefined") {
            data[access[cntr]] = value;
          }
          break;
        case "sub":
          data[access[cntr]] -= value;
          break;
      }
    } else {
      if (createMissing && typeof data[access[cntr]] === "undefined") {
        data[access[cntr]] = {};
      }
      if (data[access[cntr]] === null || typeof data[access[cntr]] !== "object") {
        return false;
      }
      data = data[access[cntr]];
    }
  }
  return true;
}
__name(safeSet, "safeSet");
function _deepMerge(target = {}, ...sourceObj) {
  for (let cntr = 0; cntr < sourceObj.length; cntr++) {
    const obj = sourceObj[cntr];
    for (const prop in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, prop)) {
        if (prop.startsWith("-=")) {
          delete target[prop.slice(2)];
          continue;
        }
        target[prop] = Object.prototype.hasOwnProperty.call(target, prop) && target[prop]?.constructor === Object && obj[prop]?.constructor === Object ? _deepMerge({}, target[prop], obj[prop]) : obj[prop];
      }
    }
  }
  return target;
}
__name(_deepMerge, "_deepMerge");
class StyleManager {
  #docKey;
  #selector;
  #styleElement;
  #cssRule;
  constructor({ docKey, selector = ":root", document: document2 = globalThis.document } = {}) {
    if (typeof selector !== "string") {
      throw new TypeError(`StyleManager error: 'selector' is not a string.`);
    }
    if (typeof docKey !== "string") {
      throw new TypeError(`StyleManager error: 'docKey' is not a string.`);
    }
    this.#selector = selector;
    this.#docKey = docKey;
    if (document2[this.#docKey] === void 0) {
      this.#styleElement = document2.createElement("style");
      document2.head.append(this.#styleElement);
      this.#styleElement.sheet.insertRule(`${selector} {}`, 0);
      this.#cssRule = this.#styleElement.sheet.cssRules[0];
      document2[docKey] = this.#styleElement;
    } else {
      this.#styleElement = document2[docKey];
      this.#cssRule = this.#styleElement.sheet.cssRules[0];
    }
  }
  get cssText() {
    return this.#cssRule.style.cssText;
  }
  clone(document2 = globalThis.document) {
    const newStyleManager = new StyleManager({ selector: this.#selector, docKey: this.#docKey, document: document2 });
    newStyleManager.#cssRule.style.cssText = this.#cssRule.style.cssText;
    return newStyleManager;
  }
  get() {
    const cssText = this.#cssRule.style.cssText;
    const result = {};
    if (cssText !== "") {
      for (const entry of cssText.split(";")) {
        if (entry !== "") {
          const values = entry.split(":");
          result[values[0].trim()] = values[1];
        }
      }
    }
    return result;
  }
  getProperty(key) {
    return this.#cssRule.style.getPropertyValue(key);
  }
  setProperties(rules, overwrite = true) {
    if (overwrite) {
      for (const [key, value] of Object.entries(rules)) {
        this.#cssRule.style.setProperty(key, value);
      }
    } else {
      for (const [key, value] of Object.entries(rules)) {
        if (this.#cssRule.style.getPropertyValue(key) === "") {
          this.#cssRule.style.setProperty(key, value);
        }
      }
    }
  }
  setProperty(key, value, overwrite = true) {
    if (overwrite) {
      this.#cssRule.style.setProperty(key, value);
    } else {
      if (this.#cssRule.style.getPropertyValue(key) === "") {
        this.#cssRule.style.setProperty(key, value);
      }
    }
  }
  removeProperties(keys) {
    if (isIterable(keys)) {
      for (const key of keys) {
        if (typeof key === "string") {
          this.#cssRule.style.removeProperty(key);
        }
      }
    }
  }
  removeProperty(key) {
    return this.#cssRule.style.removeProperty(key);
  }
}
__name(StyleManager, "StyleManager");
const s_REGEX = /(\d+)\s*px/;
function styleParsePixels(value) {
  if (typeof value !== "string") {
    return void 0;
  }
  const isPixels = s_REGEX.test(value);
  const number = parseInt(value);
  return isPixels && Number.isFinite(number) ? number : void 0;
}
__name(styleParsePixels, "styleParsePixels");
const applicationShellContract = ["elementRoot"];
Object.freeze(applicationShellContract);
function isApplicationShell(component) {
  if (component === null || component === void 0) {
    return false;
  }
  let compHasContract = true;
  let protoHasContract = true;
  for (const accessor of applicationShellContract) {
    const descriptor = Object.getOwnPropertyDescriptor(component, accessor);
    if (descriptor === void 0 || descriptor.get === void 0 || descriptor.set === void 0) {
      compHasContract = false;
    }
  }
  const prototype = Object.getPrototypeOf(component);
  for (const accessor of applicationShellContract) {
    const descriptor = Object.getOwnPropertyDescriptor(prototype, accessor);
    if (descriptor === void 0 || descriptor.get === void 0 || descriptor.set === void 0) {
      protoHasContract = false;
    }
  }
  return compHasContract || protoHasContract;
}
__name(isApplicationShell, "isApplicationShell");
function isHMRProxy(comp) {
  const instanceName = comp?.constructor?.name;
  if (typeof instanceName === "string" && (instanceName.startsWith("Proxy<") || instanceName === "ProxyComponent")) {
    return true;
  }
  const prototypeName = comp?.prototype?.constructor?.name;
  return typeof prototypeName === "string" && (prototypeName.startsWith("Proxy<") || prototypeName === "ProxyComponent");
}
__name(isHMRProxy, "isHMRProxy");
function isSvelteComponent(comp) {
  if (comp === null || comp === void 0 || typeof comp !== "function") {
    return false;
  }
  const prototypeName = comp?.prototype?.constructor?.name;
  if (typeof prototypeName === "string" && (prototypeName.startsWith("Proxy<") || prototypeName === "ProxyComponent")) {
    return true;
  }
  return typeof window !== void 0 ? typeof comp.prototype.$destroy === "function" && typeof comp.prototype.$on === "function" : typeof comp.render === "function";
}
__name(isSvelteComponent, "isSvelteComponent");
async function outroAndDestroy(instance2) {
  return new Promise((resolve2) => {
    if (instance2.$$.fragment && instance2.$$.fragment.o) {
      group_outros();
      transition_out(instance2.$$.fragment, 0, 0, () => {
        instance2.$destroy();
        resolve2();
      });
      check_outros();
    } else {
      instance2.$destroy();
      resolve2();
    }
  });
}
__name(outroAndDestroy, "outroAndDestroy");
function parseSvelteConfig(config, thisArg = void 0) {
  if (typeof config !== "object") {
    throw new TypeError(`parseSvelteConfig - 'config' is not an object:
${JSON.stringify(config)}.`);
  }
  if (!isSvelteComponent(config.class)) {
    throw new TypeError(
      `parseSvelteConfig - 'class' is not a Svelte component constructor for config:
${JSON.stringify(config)}.`
    );
  }
  if (config.hydrate !== void 0 && typeof config.hydrate !== "boolean") {
    throw new TypeError(
      `parseSvelteConfig - 'hydrate' is not a boolean for config:
${JSON.stringify(config)}.`
    );
  }
  if (config.intro !== void 0 && typeof config.intro !== "boolean") {
    throw new TypeError(
      `parseSvelteConfig - 'intro' is not a boolean for config:
${JSON.stringify(config)}.`
    );
  }
  if (config.target !== void 0 && typeof config.target !== "string" && !(config.target instanceof HTMLElement) && !(config.target instanceof ShadowRoot) && !(config.target instanceof DocumentFragment)) {
    throw new TypeError(
      `parseSvelteConfig - 'target' is not a string, HTMLElement, ShadowRoot, or DocumentFragment for config:
${JSON.stringify(config)}.`
    );
  }
  if (config.anchor !== void 0 && typeof config.anchor !== "string" && !(config.anchor instanceof HTMLElement) && !(config.anchor instanceof ShadowRoot) && !(config.anchor instanceof DocumentFragment)) {
    throw new TypeError(
      `parseSvelteConfig - 'anchor' is not a string, HTMLElement, ShadowRoot, or DocumentFragment for config:
${JSON.stringify(config)}.`
    );
  }
  if (config.context !== void 0 && typeof config.context !== "function" && !(config.context instanceof Map) && typeof config.context !== "object") {
    throw new TypeError(
      `parseSvelteConfig - 'context' is not a Map, function or object for config:
${JSON.stringify(config)}.`
    );
  }
  if (config.selectorTarget !== void 0 && typeof config.selectorTarget !== "string") {
    throw new TypeError(
      `parseSvelteConfig - 'selectorTarget' is not a string for config:
${JSON.stringify(config)}.`
    );
  }
  if (config.options !== void 0 && typeof config.options !== "object") {
    throw new TypeError(
      `parseSvelteConfig - 'options' is not an object for config:
${JSON.stringify(config)}.`
    );
  }
  if (config.options !== void 0) {
    if (config.options.injectApp !== void 0 && typeof config.options.injectApp !== "boolean") {
      throw new TypeError(
        `parseSvelteConfig - 'options.injectApp' is not a boolean for config:
${JSON.stringify(config)}.`
      );
    }
    if (config.options.injectEventbus !== void 0 && typeof config.options.injectEventbus !== "boolean") {
      throw new TypeError(
        `parseSvelteConfig - 'options.injectEventbus' is not a boolean for config:
${JSON.stringify(config)}.`
      );
    }
    if (config.options.selectorElement !== void 0 && typeof config.options.selectorElement !== "string") {
      throw new TypeError(
        `parseSvelteConfig - 'selectorElement' is not a string for config:
${JSON.stringify(config)}.`
      );
    }
  }
  const svelteConfig = { ...config };
  delete svelteConfig.options;
  let externalContext = {};
  if (typeof svelteConfig.context === "function") {
    const contextFunc = svelteConfig.context;
    delete svelteConfig.context;
    const result = contextFunc.call(thisArg);
    if (typeof result === "object") {
      externalContext = { ...result };
    } else {
      throw new Error(`parseSvelteConfig - 'context' is a function that did not return an object for config:
${JSON.stringify(config)}`);
    }
  } else if (svelteConfig.context instanceof Map) {
    externalContext = Object.fromEntries(svelteConfig.context);
    delete svelteConfig.context;
  } else if (typeof svelteConfig.context === "object") {
    externalContext = svelteConfig.context;
    delete svelteConfig.context;
  }
  svelteConfig.props = s_PROCESS_PROPS(svelteConfig.props, thisArg, config);
  if (Array.isArray(svelteConfig.children)) {
    const children2 = [];
    for (let cntr = 0; cntr < svelteConfig.children.length; cntr++) {
      const child = svelteConfig.children[cntr];
      if (!isSvelteComponent(child.class)) {
        throw new Error(`parseSvelteConfig - 'class' is not a Svelte component for child[${cntr}] for config:
${JSON.stringify(config)}`);
      }
      child.props = s_PROCESS_PROPS(child.props, thisArg, config);
      children2.push(child);
    }
    if (children2.length > 0) {
      externalContext.children = children2;
    }
    delete svelteConfig.children;
  } else if (typeof svelteConfig.children === "object") {
    if (!isSvelteComponent(svelteConfig.children.class)) {
      throw new Error(`parseSvelteConfig - 'class' is not a Svelte component for children object for config:
${JSON.stringify(config)}`);
    }
    svelteConfig.children.props = s_PROCESS_PROPS(svelteConfig.children.props, thisArg, config);
    externalContext.children = [svelteConfig.children];
    delete svelteConfig.children;
  }
  if (!(svelteConfig.context instanceof Map)) {
    svelteConfig.context = /* @__PURE__ */ new Map();
  }
  svelteConfig.context.set("external", externalContext);
  return svelteConfig;
}
__name(parseSvelteConfig, "parseSvelteConfig");
function s_PROCESS_PROPS(props, thisArg, config) {
  if (typeof props === "function") {
    const result = props.call(thisArg);
    if (typeof result === "object") {
      return result;
    } else {
      throw new Error(`parseSvelteConfig - 'props' is a function that did not return an object for config:
${JSON.stringify(config)}`);
    }
  } else if (typeof props === "object") {
    return props;
  } else if (props !== void 0) {
    throw new Error(
      `parseSvelteConfig - 'props' is not a function or an object for config:
${JSON.stringify(config)}`
    );
  }
  return {};
}
__name(s_PROCESS_PROPS, "s_PROCESS_PROPS");
function debounce$1(callback2, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      callback2.apply(this, args);
    }, delay);
  };
}
__name(debounce$1, "debounce$1");
function hasGetter(object, accessor) {
  if (object === null || object === void 0) {
    return false;
  }
  const iDescriptor = Object.getOwnPropertyDescriptor(object, accessor);
  if (iDescriptor !== void 0 && iDescriptor.get !== void 0) {
    return true;
  }
  for (let o = Object.getPrototypeOf(object); o; o = Object.getPrototypeOf(o)) {
    const descriptor = Object.getOwnPropertyDescriptor(o, accessor);
    if (descriptor !== void 0 && descriptor.get !== void 0) {
      return true;
    }
  }
  return false;
}
__name(hasGetter, "hasGetter");
function hasSetter(object, accessor) {
  if (object === null || object === void 0) {
    return false;
  }
  const iDescriptor = Object.getOwnPropertyDescriptor(object, accessor);
  if (iDescriptor !== void 0 && iDescriptor.set !== void 0) {
    return true;
  }
  for (let o = Object.getPrototypeOf(object); o; o = Object.getPrototypeOf(o)) {
    const descriptor = Object.getOwnPropertyDescriptor(o, accessor);
    if (descriptor !== void 0 && descriptor.set !== void 0) {
      return true;
    }
  }
  return false;
}
__name(hasSetter, "hasSetter");
class DynReducerUtils {
  static arrayEquals(a, b) {
    if (a === b) {
      return true;
    }
    if (a === null || b === null) {
      return false;
    }
    if (a.length !== b.length) {
      return false;
    }
    for (let cntr = a.length; --cntr >= 0; ) {
      if (a[cntr] !== b[cntr]) {
        return false;
      }
    }
    return true;
  }
  static hashString(str, seed = 0) {
    let h12 = 3735928559 ^ seed, h22 = 1103547991 ^ seed;
    for (let ch, i = 0; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h12 = Math.imul(h12 ^ ch, 2654435761);
      h22 = Math.imul(h22 ^ ch, 1597334677);
    }
    h12 = Math.imul(h12 ^ h12 >>> 16, 2246822507) ^ Math.imul(h22 ^ h22 >>> 13, 3266489909);
    h22 = Math.imul(h22 ^ h22 >>> 16, 2246822507) ^ Math.imul(h12 ^ h12 >>> 13, 3266489909);
    return 4294967296 * (2097151 & h22) + (h12 >>> 0);
  }
  static hashUnknown(value) {
    if (value === null || value === void 0) {
      return 0;
    }
    let result = 0;
    switch (typeof value) {
      case "boolean":
        result = value ? 1 : 0;
        break;
      case "bigint":
        result = Number(BigInt.asIntN(64, value));
        break;
      case "function":
        result = this.hashString(value.name);
        break;
      case "number":
        result = Number.isFinite(value) ? value : 0;
        break;
      case "object":
        break;
      case "string":
        result = this.hashString(value);
        break;
      case "symbol":
        result = this.hashString(Symbol.keyFor(value));
        break;
    }
    return result;
  }
  static hasPrototype(target, Prototype) {
    if (typeof target !== "function") {
      return false;
    }
    if (target === Prototype) {
      return true;
    }
    for (let proto = Object.getPrototypeOf(target); proto; proto = Object.getPrototypeOf(proto)) {
      if (proto === Prototype) {
        return true;
      }
    }
    return false;
  }
  static isIterable(data) {
    return data !== null && data !== void 0 && typeof data === "object" && typeof data[Symbol.iterator] === "function";
  }
}
__name(DynReducerUtils, "DynReducerUtils");
class AdapterDerived {
  #hostData;
  #DerivedReducerCtor;
  #parentIndex;
  #derived = /* @__PURE__ */ new Map();
  #destroyed = false;
  constructor(hostData, parentIndex, DerivedReducerCtor) {
    this.#hostData = hostData;
    this.#parentIndex = parentIndex;
    this.#DerivedReducerCtor = DerivedReducerCtor;
    Object.freeze(this);
  }
  create(options) {
    if (this.#destroyed) {
      throw Error(`AdapterDerived.create error: this instance has been destroyed.`);
    }
    let name;
    let rest = {};
    let ctor;
    const DerivedReducerCtor = this.#DerivedReducerCtor;
    if (typeof options === "string") {
      name = options;
      ctor = DerivedReducerCtor;
    } else if (typeof options === "function" && DynReducerUtils.hasPrototype(options, DerivedReducerCtor)) {
      ctor = options;
    } else if (typeof options === "object" && options !== null) {
      ({ name, ctor = DerivedReducerCtor, ...rest } = options);
    } else {
      throw new TypeError(`AdapterDerived.create error: 'options' does not conform to allowed parameters.`);
    }
    if (!DynReducerUtils.hasPrototype(ctor, DerivedReducerCtor)) {
      throw new TypeError(`AdapterDerived.create error: 'ctor' is not a '${DerivedReducerCtor?.name}'.`);
    }
    name = name ?? ctor?.name;
    if (typeof name !== "string") {
      throw new TypeError(`AdapterDerived.create error: 'name' is not a string.`);
    }
    const derivedReducer = new ctor(this.#hostData, this.#parentIndex, rest);
    this.#derived.set(name, derivedReducer);
    return derivedReducer;
  }
  clear() {
    if (this.#destroyed) {
      return;
    }
    for (const reducer of this.#derived.values()) {
      reducer.destroy();
    }
    this.#derived.clear();
  }
  delete(name) {
    if (this.#destroyed) {
      throw Error(`AdapterDerived.delete error: this instance has been destroyed.`);
    }
    const reducer = this.#derived.get(name);
    if (reducer) {
      reducer.destroy();
    }
    return this.#derived.delete(name);
  }
  destroy() {
    if (this.#destroyed) {
      return;
    }
    this.clear();
    this.#hostData = [null];
    this.#parentIndex = null;
    this.#destroyed = true;
  }
  get(name) {
    if (this.#destroyed) {
      throw Error(`AdapterDerived.get error: this instance has been destroyed.`);
    }
    return this.#derived.get(name);
  }
  update(force = false) {
    if (this.#destroyed) {
      return;
    }
    for (const reducer of this.#derived.values()) {
      reducer.index.update(force);
    }
  }
}
__name(AdapterDerived, "AdapterDerived");
class AdapterFilters {
  #filtersData;
  #indexUpdate;
  #mapUnsubscribe = /* @__PURE__ */ new Map();
  constructor(indexUpdate, filtersAdapter) {
    this.#indexUpdate = indexUpdate;
    this.#filtersData = filtersAdapter;
    Object.freeze(this);
  }
  get length() {
    return this.#filtersData.filters.length;
  }
  *[Symbol.iterator]() {
    if (this.#filtersData.filters.length === 0) {
      return;
    }
    for (const entry of this.#filtersData.filters) {
      yield { ...entry };
    }
  }
  add(...filters) {
    let subscribeCount = 0;
    for (const filter of filters) {
      const filterType = typeof filter;
      if (filterType !== "function" && (filterType !== "object" || filter === null)) {
        throw new TypeError(`AdapterFilters error: 'filter' is not a function or object.`);
      }
      let data = void 0;
      let subscribeFn = void 0;
      if (filterType === "function") {
        data = {
          id: void 0,
          filter,
          weight: 1
        };
        subscribeFn = filter.subscribe;
      } else if (filterType === "object") {
        if ("filter" in filter) {
          if (typeof filter.filter !== "function") {
            throw new TypeError(`AdapterFilters error: 'filter' attribute is not a function.`);
          }
          if (filter.weight !== void 0 && typeof filter.weight !== "number" || (filter.weight < 0 || filter.weight > 1)) {
            throw new TypeError(`AdapterFilters error: 'weight' attribute is not a number between '0 - 1' inclusive.`);
          }
          data = {
            id: filter.id !== void 0 ? filter.id : void 0,
            filter: filter.filter,
            weight: filter.weight || 1
          };
          subscribeFn = filter.filter.subscribe ?? filter.subscribe;
        } else {
          throw new TypeError(`AdapterFilters error: 'filter' attribute is not a function.`);
        }
      }
      const index2 = this.#filtersData.filters.findIndex((value) => {
        return data.weight < value.weight;
      });
      if (index2 >= 0) {
        this.#filtersData.filters.splice(index2, 0, data);
      } else {
        this.#filtersData.filters.push(data);
      }
      if (typeof subscribeFn === "function") {
        const unsubscribe = subscribeFn(this.#indexUpdate);
        if (typeof unsubscribe !== "function") {
          throw new TypeError("AdapterFilters error: Filter has subscribe function, but no unsubscribe function is returned.");
        }
        if (this.#mapUnsubscribe.has(data.filter)) {
          throw new Error("AdapterFilters error: Filter added already has an unsubscribe function registered.");
        }
        this.#mapUnsubscribe.set(data.filter, unsubscribe);
        subscribeCount++;
      }
    }
    if (subscribeCount < filters.length) {
      this.#indexUpdate();
    }
  }
  clear() {
    this.#filtersData.filters.length = 0;
    for (const unsubscribe of this.#mapUnsubscribe.values()) {
      unsubscribe();
    }
    this.#mapUnsubscribe.clear();
    this.#indexUpdate();
  }
  remove(...filters) {
    const length = this.#filtersData.filters.length;
    if (length === 0) {
      return;
    }
    for (const data of filters) {
      const actualFilter = typeof data === "function" ? data : data !== null && typeof data === "object" ? data.filter : void 0;
      if (!actualFilter) {
        continue;
      }
      for (let cntr = this.#filtersData.filters.length; --cntr >= 0; ) {
        if (this.#filtersData.filters[cntr].filter === actualFilter) {
          this.#filtersData.filters.splice(cntr, 1);
          let unsubscribe = void 0;
          if (typeof (unsubscribe = this.#mapUnsubscribe.get(actualFilter)) === "function") {
            unsubscribe();
            this.#mapUnsubscribe.delete(actualFilter);
          }
        }
      }
    }
    if (length !== this.#filtersData.filters.length) {
      this.#indexUpdate();
    }
  }
  removeBy(callback2) {
    const length = this.#filtersData.filters.length;
    if (length === 0) {
      return;
    }
    if (typeof callback2 !== "function") {
      throw new TypeError(`AdapterFilters error: 'callback' is not a function.`);
    }
    this.#filtersData.filters = this.#filtersData.filters.filter((data) => {
      const remove = callback2.call(callback2, { ...data });
      if (remove) {
        let unsubscribe;
        if (typeof (unsubscribe = this.#mapUnsubscribe.get(data.filter)) === "function") {
          unsubscribe();
          this.#mapUnsubscribe.delete(data.filter);
        }
      }
      return !remove;
    });
    if (length !== this.#filtersData.filters.length) {
      this.#indexUpdate();
    }
  }
  removeById(...ids) {
    const length = this.#filtersData.filters.length;
    if (length === 0) {
      return;
    }
    this.#filtersData.filters = this.#filtersData.filters.filter((data) => {
      let remove = 0;
      for (const id of ids) {
        remove |= data.id === id ? 1 : 0;
      }
      if (!!remove) {
        let unsubscribe;
        if (typeof (unsubscribe = this.#mapUnsubscribe.get(data.filter)) === "function") {
          unsubscribe();
          this.#mapUnsubscribe.delete(data.filter);
        }
      }
      return !remove;
    });
    if (length !== this.#filtersData.filters.length) {
      this.#indexUpdate();
    }
  }
}
__name(AdapterFilters, "AdapterFilters");
class AdapterIndexer {
  derivedAdapter;
  filtersData;
  hostData;
  hostUpdate;
  indexData;
  sortData;
  sortFn;
  destroyed = false;
  constructor(hostData, hostUpdate, parentIndexer) {
    this.hostData = hostData;
    this.hostUpdate = hostUpdate;
    this.indexData = { index: null, hash: null, reversed: false, parent: parentIndexer };
  }
  get active() {
    return this.filtersData.filters.length > 0 || this.sortData.compareFn !== null || this.indexData.parent?.active === true;
  }
  get length() {
    return this.indexData.index ? this.indexData.index.length : 0;
  }
  get reversed() {
    return this.indexData.reversed;
  }
  set reversed(reversed) {
    this.indexData.reversed = reversed;
  }
  calcHashUpdate(oldIndex, oldHash, force = false) {
    const actualForce = typeof force === "boolean" ? force : false;
    let newHash = null;
    const newIndex = this.indexData.index;
    if (newIndex) {
      for (let cntr = newIndex.length; --cntr >= 0; ) {
        newHash ^= DynReducerUtils.hashUnknown(newIndex[cntr]) + 2654435769 + (newHash << 6) + (newHash >> 2);
      }
    }
    this.indexData.hash = newHash;
    if (actualForce || (oldHash === newHash ? !DynReducerUtils.arrayEquals(oldIndex, newIndex) : true)) {
      this.hostUpdate();
    }
  }
  destroy() {
    if (this.destroyed) {
      return;
    }
    this.indexData.index = null;
    this.indexData.hash = null;
    this.indexData.reversed = null;
    this.indexData.parent = null;
    this.destroyed = true;
  }
  initAdapters(filtersData, sortData, derivedAdapter) {
    this.filtersData = filtersData;
    this.sortData = sortData;
    this.derivedAdapter = derivedAdapter;
    this.sortFn = this.createSortFn();
  }
}
__name(AdapterIndexer, "AdapterIndexer");
class AdapterSort {
  #sortData;
  #indexUpdate;
  #unsubscribe;
  constructor(indexUpdate, sortData) {
    this.#indexUpdate = indexUpdate;
    this.#sortData = sortData;
    Object.freeze(this);
  }
  clear() {
    const oldCompareFn = this.#sortData.compareFn;
    this.#sortData.compareFn = null;
    if (typeof this.#unsubscribe === "function") {
      this.#unsubscribe();
      this.#unsubscribe = void 0;
    }
    if (typeof oldCompareFn === "function") {
      this.#indexUpdate();
    }
  }
  set(data) {
    if (typeof this.#unsubscribe === "function") {
      this.#unsubscribe();
      this.#unsubscribe = void 0;
    }
    let compareFn = void 0;
    let subscribeFn = void 0;
    switch (typeof data) {
      case "function":
        compareFn = data;
        subscribeFn = data.subscribe;
        break;
      case "object":
        if (data === null) {
          break;
        }
        if (typeof data.compare !== "function") {
          throw new TypeError(`AdapterSort error: 'compare' attribute is not a function.`);
        }
        compareFn = data.compare;
        subscribeFn = data.compare.subscribe ?? data.subscribe;
        break;
    }
    if (typeof compareFn === "function") {
      this.#sortData.compareFn = compareFn;
    } else {
      const oldCompareFn = this.#sortData.compareFn;
      this.#sortData.compareFn = null;
      if (typeof oldCompareFn === "function") {
        this.#indexUpdate();
      }
      return;
    }
    if (typeof subscribeFn === "function") {
      this.#unsubscribe = subscribeFn(this.#indexUpdate);
      if (typeof this.#unsubscribe !== "function") {
        throw new Error(`AdapterSort error: sort has 'subscribe' function, but no 'unsubscribe' function is returned.`);
      }
    } else {
      this.#indexUpdate();
    }
  }
}
__name(AdapterSort, "AdapterSort");
class IndexerAPI {
  #indexData;
  active;
  length;
  update;
  constructor(adapterIndexer) {
    this.#indexData = adapterIndexer.indexData;
    this.update = adapterIndexer.update.bind(adapterIndexer);
    Object.defineProperties(this, {
      active: { get: () => adapterIndexer.active },
      length: { get: () => adapterIndexer.length }
    });
    Object.freeze(this);
  }
  get hash() {
    return this.#indexData.hash;
  }
  *[Symbol.iterator]() {
    const indexData = this.#indexData;
    if (!indexData.index) {
      return;
    }
    const reversed = indexData.reversed;
    const length = indexData.index.length;
    if (reversed) {
      for (let cntr = length; --cntr >= 0; ) {
        yield indexData.index[cntr];
      }
    } else {
      for (let cntr = 0; cntr < length; cntr++) {
        yield indexData.index[cntr];
      }
    }
  }
}
__name(IndexerAPI, "IndexerAPI");
class DerivedAPI {
  clear;
  create;
  delete;
  destroy;
  get;
  constructor(adapterDerived) {
    this.clear = adapterDerived.clear.bind(adapterDerived);
    this.create = adapterDerived.create.bind(adapterDerived);
    this.delete = adapterDerived.delete.bind(adapterDerived);
    this.destroy = adapterDerived.destroy.bind(adapterDerived);
    this.get = adapterDerived.get.bind(adapterDerived);
    Object.freeze(this);
  }
}
__name(DerivedAPI, "DerivedAPI");
class Indexer$1 extends AdapterIndexer {
  createSortFn() {
    return (a, b) => this.sortData.compareFn(this.hostData[0][a], this.hostData[0][b]);
  }
  reduceImpl() {
    const data = [];
    const array = this.hostData[0];
    if (!array) {
      return data;
    }
    const filters = this.filtersData.filters;
    let include = true;
    const parentIndex = this.indexData.parent;
    if (DynReducerUtils.isIterable(parentIndex) && parentIndex.active) {
      for (const adjustedIndex of parentIndex) {
        const value = array[adjustedIndex];
        include = true;
        for (let filCntr = 0, filLength = filters.length; filCntr < filLength; filCntr++) {
          if (!filters[filCntr].filter(value)) {
            include = false;
            break;
          }
        }
        if (include) {
          data.push(adjustedIndex);
        }
      }
    } else {
      for (let cntr = 0, length = array.length; cntr < length; cntr++) {
        include = true;
        for (let filCntr = 0, filLength = filters.length; filCntr < filLength; filCntr++) {
          if (!filters[filCntr].filter(array[cntr])) {
            include = false;
            break;
          }
        }
        if (include) {
          data.push(cntr);
        }
      }
    }
    return data;
  }
  update(force = false) {
    if (this.destroyed) {
      return;
    }
    const oldIndex = this.indexData.index;
    const oldHash = this.indexData.hash;
    const array = this.hostData[0];
    const parentIndex = this.indexData.parent;
    if (this.filtersData.filters.length === 0 && !this.sortData.compareFn || this.indexData.index && array?.length !== this.indexData.index.length) {
      this.indexData.index = null;
    }
    if (this.filtersData.filters.length > 0) {
      this.indexData.index = this.reduceImpl();
    }
    if (!this.indexData.index && parentIndex?.active) {
      this.indexData.index = [...parentIndex];
    }
    if (this.sortData.compareFn && Array.isArray(array)) {
      if (!this.indexData.index) {
        this.indexData.index = [...Array(array.length).keys()];
      }
      this.indexData.index.sort(this.sortFn);
    }
    this.calcHashUpdate(oldIndex, oldHash, force);
    this.derivedAdapter?.update(force);
  }
}
__name(Indexer$1, "Indexer$1");
class DerivedArrayReducer {
  #array;
  #derived;
  #derivedPublicAPI;
  #filters;
  #filtersData = { filters: [] };
  #index;
  #indexPublicAPI;
  #reversed = false;
  #sort;
  #sortData = { compareFn: null };
  #subscriptions = [];
  #destroyed = false;
  constructor(array, parentIndex, options) {
    this.#array = array;
    this.#index = new Indexer$1(this.#array, this.#updateSubscribers.bind(this), parentIndex);
    this.#indexPublicAPI = new IndexerAPI(this.#index);
    this.#filters = new AdapterFilters(this.#indexPublicAPI.update, this.#filtersData);
    this.#sort = new AdapterSort(this.#indexPublicAPI.update, this.#sortData);
    this.#derived = new AdapterDerived(this.#array, this.#indexPublicAPI, DerivedArrayReducer);
    this.#derivedPublicAPI = new DerivedAPI(this.#derived);
    this.#index.initAdapters(this.#filtersData, this.#sortData, this.#derived);
    let filters = void 0;
    let sort = void 0;
    if (options !== void 0 && ("filters" in options || "sort" in options)) {
      if (options.filters !== void 0) {
        if (DynReducerUtils.isIterable(options.filters)) {
          filters = options.filters;
        } else {
          throw new TypeError(`DerivedArrayReducer error (DataDerivedOptions): 'filters' attribute is not iterable.`);
        }
      }
      if (options.sort !== void 0) {
        if (typeof options.sort === "function") {
          sort = options.sort;
        } else if (typeof options.sort === "object" && options.sort !== null) {
          sort = options.sort;
        } else {
          throw new TypeError(`DerivedArrayReducer error (DataDerivedOptions): 'sort' attribute is not a function or object.`);
        }
      }
    }
    if (filters) {
      this.filters.add(...filters);
    }
    if (sort) {
      this.sort.set(sort);
    }
    this.initialize();
  }
  get data() {
    return this.#array[0];
  }
  get derived() {
    return this.#derivedPublicAPI;
  }
  get filters() {
    return this.#filters;
  }
  get index() {
    return this.#indexPublicAPI;
  }
  get destroyed() {
    return this.#destroyed;
  }
  get length() {
    const array = this.#array[0];
    return this.#index.active ? this.index.length : array ? array.length : 0;
  }
  get reversed() {
    return this.#reversed;
  }
  get sort() {
    return this.#sort;
  }
  set reversed(reversed) {
    if (typeof reversed !== "boolean") {
      throw new TypeError(`DerivedArrayReducer.reversed error: 'reversed' is not a boolean.`);
    }
    this.#reversed = reversed;
    this.#index.reversed = reversed;
    this.index.update(true);
  }
  destroy() {
    this.#destroyed = true;
    this.#array = [null];
    this.#index.update(true);
    this.#subscriptions.length = 0;
    this.#derived.destroy();
    this.#index.destroy();
    this.#filters.clear();
    this.#sort.clear();
  }
  initialize() {
  }
  *[Symbol.iterator]() {
    const array = this.#array[0];
    if (this.#destroyed || array === null || array?.length === 0) {
      return;
    }
    if (this.#index.active) {
      for (const entry of this.index) {
        yield array[entry];
      }
    } else {
      if (this.reversed) {
        for (let cntr = array.length; --cntr >= 0; ) {
          yield array[cntr];
        }
      } else {
        for (let cntr = 0; cntr < array.length; cntr++) {
          yield array[cntr];
        }
      }
    }
  }
  subscribe(handler) {
    this.#subscriptions.push(handler);
    handler(this);
    return () => {
      const index2 = this.#subscriptions.findIndex((sub) => sub === handler);
      if (index2 >= 0) {
        this.#subscriptions.splice(index2, 1);
      }
    };
  }
  #updateSubscribers() {
    for (let cntr = 0; cntr < this.#subscriptions.length; cntr++) {
      this.#subscriptions[cntr](this);
    }
  }
}
__name(DerivedArrayReducer, "DerivedArrayReducer");
class DynArrayReducer {
  #array = [null];
  #derived;
  #derivedPublicAPI;
  #filters;
  #filtersData = { filters: [] };
  #index;
  #indexPublicAPI;
  #reversed = false;
  #sort;
  #sortData = { compareFn: null };
  #subscriptions = [];
  #destroyed = false;
  constructor(data) {
    let dataIterable = void 0;
    let filters = void 0;
    let sort = void 0;
    if (data === null) {
      throw new TypeError(`DynArrayReducer error: 'data' is not iterable.`);
    }
    if (data !== void 0 && typeof data !== "object" && !DynReducerUtils.isIterable(data)) {
      throw new TypeError(`DynArrayReducer error: 'data' is not iterable.`);
    }
    if (data !== void 0 && Symbol.iterator in data) {
      dataIterable = data;
    } else if (data !== void 0 && ("data" in data || "filters" in data || "sort" in data)) {
      if (data.data !== void 0 && !DynReducerUtils.isIterable(data.data)) {
        throw new TypeError(`DynArrayReducer error (DataDynArray): 'data' attribute is not iterable.`);
      }
      dataIterable = data.data;
      if (data.filters !== void 0) {
        if (DynReducerUtils.isIterable(data.filters)) {
          filters = data.filters;
        } else {
          throw new TypeError(`DynArrayReducer error (DataDynArray): 'filters' attribute is not iterable.`);
        }
      }
      if (data.sort !== void 0) {
        if (typeof data.sort === "function") {
          sort = data.sort;
        } else if (typeof data.sort === "object" && data.sort !== null) {
          sort = data.sort;
        } else {
          throw new TypeError(`DynArrayReducer error (DataDynArray): 'sort' attribute is not a function or object.`);
        }
      }
    }
    if (dataIterable) {
      this.#array[0] = Array.isArray(dataIterable) ? dataIterable : [...dataIterable];
    }
    this.#index = new Indexer$1(this.#array, this.#updateSubscribers.bind(this));
    this.#indexPublicAPI = new IndexerAPI(this.#index);
    this.#filters = new AdapterFilters(this.#indexPublicAPI.update, this.#filtersData);
    this.#sort = new AdapterSort(this.#indexPublicAPI.update, this.#sortData);
    this.#derived = new AdapterDerived(this.#array, this.#indexPublicAPI, DerivedArrayReducer);
    this.#derivedPublicAPI = new DerivedAPI(this.#derived);
    this.#index.initAdapters(this.#filtersData, this.#sortData, this.#derived);
    if (filters) {
      this.filters.add(...filters);
    }
    if (sort) {
      this.sort.set(sort);
    }
    this.initialize();
  }
  get data() {
    return this.#array[0];
  }
  get derived() {
    return this.#derivedPublicAPI;
  }
  get filters() {
    return this.#filters;
  }
  get index() {
    return this.#indexPublicAPI;
  }
  get destroyed() {
    return this.#destroyed;
  }
  get length() {
    const array = this.#array[0];
    return this.#index.active ? this.#indexPublicAPI.length : array ? array.length : 0;
  }
  get reversed() {
    return this.#reversed;
  }
  get sort() {
    return this.#sort;
  }
  set reversed(reversed) {
    if (typeof reversed !== "boolean") {
      throw new TypeError(`DynArrayReducer.reversed error: 'reversed' is not a boolean.`);
    }
    this.#reversed = reversed;
    this.#index.reversed = reversed;
    this.index.update(true);
  }
  destroy() {
    if (this.#destroyed) {
      return;
    }
    this.#destroyed = true;
    this.#derived.destroy();
    this.#array = [null];
    this.index.update(true);
    this.#subscriptions.length = 0;
    this.#index.destroy();
    this.#filters.clear();
    this.#sort.clear();
  }
  initialize() {
  }
  setData(data, replace = false) {
    if (data !== null && !DynReducerUtils.isIterable(data)) {
      throw new TypeError(`DynArrayReducer.setData error: 'data' is not iterable.`);
    }
    if (typeof replace !== "boolean") {
      throw new TypeError(`DynArrayReducer.setData error: 'replace' is not a boolean.`);
    }
    const array = this.#array[0];
    if (!Array.isArray(array) || replace) {
      if (data) {
        this.#array[0] = Array.isArray(data) ? data : [...data];
      }
    } else {
      if (data) {
        array.length = 0;
        array.push(...data);
      } else {
        this.#array[0] = null;
      }
    }
    this.index.update(true);
  }
  subscribe(handler) {
    this.#subscriptions.push(handler);
    handler(this);
    return () => {
      const index2 = this.#subscriptions.findIndex((sub) => sub === handler);
      if (index2 >= 0) {
        this.#subscriptions.splice(index2, 1);
      }
    };
  }
  #updateSubscribers() {
    for (let cntr = 0; cntr < this.#subscriptions.length; cntr++) {
      this.#subscriptions[cntr](this);
    }
  }
  *[Symbol.iterator]() {
    const array = this.#array[0];
    if (this.#destroyed || array === null || array?.length === 0) {
      return;
    }
    if (this.#index.active) {
      for (const entry of this.index) {
        yield array[entry];
      }
    } else {
      if (this.reversed) {
        for (let cntr = array.length; --cntr >= 0; ) {
          yield array[cntr];
        }
      } else {
        for (let cntr = 0; cntr < array.length; cntr++) {
          yield array[cntr];
        }
      }
    }
  }
}
__name(DynArrayReducer, "DynArrayReducer");
function isUpdatableStore(store) {
  if (store === null || store === void 0) {
    return false;
  }
  switch (typeof store) {
    case "function":
    case "object":
      return typeof store.subscribe === "function" && typeof store.update === "function";
  }
  return false;
}
__name(isUpdatableStore, "isUpdatableStore");
function isWritableStore(store) {
  if (store === null || store === void 0) {
    return false;
  }
  switch (typeof store) {
    case "function":
    case "object":
      return typeof store.subscribe === "function" && typeof store.set === "function";
  }
  return false;
}
__name(isWritableStore, "isWritableStore");
function subscribeIgnoreFirst(store, update2) {
  let firedFirst = false;
  return store.subscribe((value) => {
    if (!firedFirst) {
      firedFirst = true;
    } else {
      update2(value);
    }
  });
}
__name(subscribeIgnoreFirst, "subscribeIgnoreFirst");
function isSimpleDeriver(deriver) {
  return deriver.length < 2;
}
__name(isSimpleDeriver, "isSimpleDeriver");
function generator(storage2) {
  function readable2(key, value, start) {
    return {
      subscribe: writable2(key, value, start).subscribe
    };
  }
  __name(readable2, "readable");
  function writable2(key, value, start = noop$1) {
    function wrap_start(ogSet) {
      return start(/* @__PURE__ */ __name(function wrap_set(new_value) {
        if (storage2) {
          storage2.setItem(key, JSON.stringify(new_value));
        }
        return ogSet(new_value);
      }, "wrap_set"));
    }
    __name(wrap_start, "wrap_start");
    if (storage2) {
      const storageValue = storage2.getItem(key);
      try {
        if (storageValue) {
          value = JSON.parse(storageValue);
        }
      } catch (err) {
      }
      storage2.setItem(key, JSON.stringify(value));
    }
    const ogStore = writable$1(value, start ? wrap_start : void 0);
    function set2(new_value) {
      if (storage2) {
        storage2.setItem(key, JSON.stringify(new_value));
      }
      ogStore.set(new_value);
    }
    __name(set2, "set");
    function update2(fn) {
      set2(fn(get_store_value(ogStore)));
    }
    __name(update2, "update");
    function subscribe2(run2, invalidate = noop$1) {
      return ogStore.subscribe(run2, invalidate);
    }
    __name(subscribe2, "subscribe");
    return { set: set2, update: update2, subscribe: subscribe2 };
  }
  __name(writable2, "writable");
  function derived2(key, stores, fn, initial_value) {
    const single = !Array.isArray(stores);
    const stores_array = single ? [stores] : stores;
    if (storage2 && storage2.getItem(key)) {
      try {
        initial_value = JSON.parse(storage2.getItem(key));
      } catch (err) {
      }
    }
    return readable2(key, initial_value, (set2) => {
      let inited = false;
      const values = [];
      let pending = 0;
      let cleanup = noop$1;
      const sync = /* @__PURE__ */ __name(() => {
        if (pending) {
          return;
        }
        cleanup();
        const input = single ? values[0] : values;
        if (isSimpleDeriver(fn)) {
          set2(fn(input));
        } else {
          const result = fn(input, set2);
          cleanup = is_function(result) ? result : noop$1;
        }
      }, "sync");
      const unsubscribers = stores_array.map((store, i) => store.subscribe((value) => {
        values[i] = value;
        pending &= ~(1 << i);
        if (inited) {
          sync();
        }
      }, () => {
        pending |= 1 << i;
      }));
      inited = true;
      sync();
      return /* @__PURE__ */ __name(function stop() {
        run_all(unsubscribers);
        cleanup();
      }, "stop");
    });
  }
  __name(derived2, "derived");
  return {
    readable: readable2,
    writable: writable2,
    derived: derived2,
    get: get_store_value
  };
}
__name(generator, "generator");
var storage = typeof window !== "undefined" ? window.sessionStorage : void 0;
var g = generator(storage);
var writable = g.writable;
class SessionStorage {
  #stores = /* @__PURE__ */ new Map();
  static #createStore(key, defaultValue = void 0) {
    try {
      const value = sessionStorage.getItem(key);
      if (value !== null) {
        defaultValue = value === "undefined" ? void 0 : JSON.parse(value);
      }
    } catch (err) {
    }
    return writable(key, defaultValue);
  }
  #getStore(key, defaultValue = void 0) {
    let store = this.#stores.get(key);
    if (store === void 0) {
      store = SessionStorage.#createStore(key, defaultValue);
      this.#stores.set(key, store);
    }
    return store;
  }
  getItem(key, defaultValue) {
    let value = defaultValue;
    const storageValue = sessionStorage.getItem(key);
    if (storageValue !== null) {
      try {
        value = storageValue === "undefined" ? void 0 : JSON.parse(storageValue);
      } catch (err) {
        value = defaultValue;
      }
    } else if (defaultValue !== void 0) {
      try {
        const newValue = JSON.stringify(defaultValue);
        sessionStorage.setItem(key, newValue === "undefined" ? void 0 : newValue);
      } catch (err) {
      }
    }
    return value;
  }
  getStore(key, defaultValue) {
    return this.#getStore(key, defaultValue);
  }
  setItem(key, value) {
    const store = this.#getStore(key);
    store.set(value);
  }
  swapItemBoolean(key, defaultValue) {
    const store = this.#getStore(key, defaultValue);
    let currentValue = false;
    try {
      currentValue = !!JSON.parse(sessionStorage.getItem(key));
    } catch (err) {
    }
    const newValue = typeof currentValue === "boolean" ? !currentValue : false;
    store.set(newValue);
    return newValue;
  }
}
__name(SessionStorage, "SessionStorage");
function writableDerived(origins, derive, reflect, initial) {
  var childDerivedSetter, originValues, blockNextDerive = false;
  var reflectOldValues = "withOld" in reflect;
  var wrappedDerive = /* @__PURE__ */ __name((got, set2) => {
    childDerivedSetter = set2;
    if (reflectOldValues) {
      originValues = got;
    }
    if (!blockNextDerive) {
      let returned = derive(got, set2);
      if (derive.length < 2) {
        set2(returned);
      } else {
        return returned;
      }
    }
    blockNextDerive = false;
  }, "wrappedDerive");
  var childDerived = derived(origins, wrappedDerive, initial);
  var singleOrigin = !Array.isArray(origins);
  var sendUpstream = /* @__PURE__ */ __name((setWith) => {
    if (singleOrigin) {
      blockNextDerive = true;
      origins.set(setWith);
    } else {
      setWith.forEach((value, i) => {
        blockNextDerive = true;
        origins[i].set(value);
      });
    }
    blockNextDerive = false;
  }, "sendUpstream");
  if (reflectOldValues) {
    reflect = reflect.withOld;
  }
  var reflectIsAsync = reflect.length >= (reflectOldValues ? 3 : 2);
  var cleanup = null;
  function doReflect(reflecting) {
    if (cleanup) {
      cleanup();
      cleanup = null;
    }
    if (reflectOldValues) {
      var returned = reflect(reflecting, originValues, sendUpstream);
    } else {
      var returned = reflect(reflecting, sendUpstream);
    }
    if (reflectIsAsync) {
      if (typeof returned == "function") {
        cleanup = returned;
      }
    } else {
      sendUpstream(returned);
    }
  }
  __name(doReflect, "doReflect");
  var tryingSet = false;
  function update2(fn) {
    var isUpdated, mutatedBySubscriptions, oldValue, newValue;
    if (tryingSet) {
      newValue = fn(get_store_value(childDerived));
      childDerivedSetter(newValue);
      return;
    }
    var unsubscribe = childDerived.subscribe((value) => {
      if (!tryingSet) {
        oldValue = value;
      } else if (!isUpdated) {
        isUpdated = true;
      } else {
        mutatedBySubscriptions = true;
      }
    });
    newValue = fn(oldValue);
    tryingSet = true;
    childDerivedSetter(newValue);
    unsubscribe();
    tryingSet = false;
    if (mutatedBySubscriptions) {
      newValue = get_store_value(childDerived);
    }
    if (isUpdated) {
      doReflect(newValue);
    }
  }
  __name(update2, "update");
  return {
    subscribe: childDerived.subscribe,
    set(value) {
      update2(() => value);
    },
    update: update2
  };
}
__name(writableDerived, "writableDerived");
function propertyStore(origin, propName) {
  if (!Array.isArray(propName)) {
    return writableDerived(
      origin,
      (object) => object[propName],
      { withOld(reflecting, object) {
        object[propName] = reflecting;
        return object;
      } }
    );
  } else {
    let props = propName.concat();
    return writableDerived(
      origin,
      (value) => {
        for (let i = 0; i < props.length; ++i) {
          value = value[props[i]];
        }
        return value;
      },
      { withOld(reflecting, object) {
        let target = object;
        for (let i = 0; i < props.length - 1; ++i) {
          target = target[props[i]];
        }
        target[props[props.length - 1]] = reflecting;
        return object;
      } }
    );
  }
}
__name(propertyStore, "propertyStore");
const storeState = writable$1(void 0);
const gameState = {
  subscribe: storeState.subscribe,
  get: () => game
};
Object.freeze(gameState);
Hooks.once("ready", () => storeState.set(game));
function cubicOut(t) {
  const f = t - 1;
  return f * f * f + 1;
}
__name(cubicOut, "cubicOut");
function lerp$5(start, end, amount) {
  return (1 - amount) * start + amount * end;
}
__name(lerp$5, "lerp$5");
function degToRad(deg) {
  return deg * (Math.PI / 180);
}
__name(degToRad, "degToRad");
var EPSILON$1 = 1e-6;
var ARRAY_TYPE = typeof Float32Array !== "undefined" ? Float32Array : Array;
var RANDOM = Math.random;
if (!Math.hypot)
  Math.hypot = function() {
    var y = 0, i = arguments.length;
    while (i--) {
      y += arguments[i] * arguments[i];
    }
    return Math.sqrt(y);
  };
function create$6() {
  var out = new ARRAY_TYPE(9);
  if (ARRAY_TYPE != Float32Array) {
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
  }
  out[0] = 1;
  out[4] = 1;
  out[8] = 1;
  return out;
}
__name(create$6, "create$6");
function create$5() {
  var out = new ARRAY_TYPE(16);
  if (ARRAY_TYPE != Float32Array) {
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
  }
  out[0] = 1;
  out[5] = 1;
  out[10] = 1;
  out[15] = 1;
  return out;
}
__name(create$5, "create$5");
function clone$5(a) {
  var out = new ARRAY_TYPE(16);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  out[9] = a[9];
  out[10] = a[10];
  out[11] = a[11];
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}
__name(clone$5, "clone$5");
function copy$5(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  out[9] = a[9];
  out[10] = a[10];
  out[11] = a[11];
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}
__name(copy$5, "copy$5");
function fromValues$5(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
  var out = new ARRAY_TYPE(16);
  out[0] = m00;
  out[1] = m01;
  out[2] = m02;
  out[3] = m03;
  out[4] = m10;
  out[5] = m11;
  out[6] = m12;
  out[7] = m13;
  out[8] = m20;
  out[9] = m21;
  out[10] = m22;
  out[11] = m23;
  out[12] = m30;
  out[13] = m31;
  out[14] = m32;
  out[15] = m33;
  return out;
}
__name(fromValues$5, "fromValues$5");
function set$5(out, m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
  out[0] = m00;
  out[1] = m01;
  out[2] = m02;
  out[3] = m03;
  out[4] = m10;
  out[5] = m11;
  out[6] = m12;
  out[7] = m13;
  out[8] = m20;
  out[9] = m21;
  out[10] = m22;
  out[11] = m23;
  out[12] = m30;
  out[13] = m31;
  out[14] = m32;
  out[15] = m33;
  return out;
}
__name(set$5, "set$5");
function identity$2(out) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
__name(identity$2, "identity$2");
function transpose(out, a) {
  if (out === a) {
    var a01 = a[1], a02 = a[2], a03 = a[3];
    var a12 = a[6], a13 = a[7];
    var a23 = a[11];
    out[1] = a[4];
    out[2] = a[8];
    out[3] = a[12];
    out[4] = a01;
    out[6] = a[9];
    out[7] = a[13];
    out[8] = a02;
    out[9] = a12;
    out[11] = a[14];
    out[12] = a03;
    out[13] = a13;
    out[14] = a23;
  } else {
    out[0] = a[0];
    out[1] = a[4];
    out[2] = a[8];
    out[3] = a[12];
    out[4] = a[1];
    out[5] = a[5];
    out[6] = a[9];
    out[7] = a[13];
    out[8] = a[2];
    out[9] = a[6];
    out[10] = a[10];
    out[11] = a[14];
    out[12] = a[3];
    out[13] = a[7];
    out[14] = a[11];
    out[15] = a[15];
  }
  return out;
}
__name(transpose, "transpose");
function invert$2(out, a) {
  var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
  var b00 = a00 * a11 - a01 * a10;
  var b01 = a00 * a12 - a02 * a10;
  var b02 = a00 * a13 - a03 * a10;
  var b03 = a01 * a12 - a02 * a11;
  var b04 = a01 * a13 - a03 * a11;
  var b05 = a02 * a13 - a03 * a12;
  var b06 = a20 * a31 - a21 * a30;
  var b07 = a20 * a32 - a22 * a30;
  var b08 = a20 * a33 - a23 * a30;
  var b09 = a21 * a32 - a22 * a31;
  var b10 = a21 * a33 - a23 * a31;
  var b11 = a22 * a33 - a23 * a32;
  var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
  if (!det) {
    return null;
  }
  det = 1 / det;
  out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
  out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
  out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
  out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
  out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
  out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
  out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
  out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
  out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
  out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
  out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
  out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
  out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
  out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
  out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
  out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
  return out;
}
__name(invert$2, "invert$2");
function adjoint(out, a) {
  var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
  out[0] = a11 * (a22 * a33 - a23 * a32) - a21 * (a12 * a33 - a13 * a32) + a31 * (a12 * a23 - a13 * a22);
  out[1] = -(a01 * (a22 * a33 - a23 * a32) - a21 * (a02 * a33 - a03 * a32) + a31 * (a02 * a23 - a03 * a22));
  out[2] = a01 * (a12 * a33 - a13 * a32) - a11 * (a02 * a33 - a03 * a32) + a31 * (a02 * a13 - a03 * a12);
  out[3] = -(a01 * (a12 * a23 - a13 * a22) - a11 * (a02 * a23 - a03 * a22) + a21 * (a02 * a13 - a03 * a12));
  out[4] = -(a10 * (a22 * a33 - a23 * a32) - a20 * (a12 * a33 - a13 * a32) + a30 * (a12 * a23 - a13 * a22));
  out[5] = a00 * (a22 * a33 - a23 * a32) - a20 * (a02 * a33 - a03 * a32) + a30 * (a02 * a23 - a03 * a22);
  out[6] = -(a00 * (a12 * a33 - a13 * a32) - a10 * (a02 * a33 - a03 * a32) + a30 * (a02 * a13 - a03 * a12));
  out[7] = a00 * (a12 * a23 - a13 * a22) - a10 * (a02 * a23 - a03 * a22) + a20 * (a02 * a13 - a03 * a12);
  out[8] = a10 * (a21 * a33 - a23 * a31) - a20 * (a11 * a33 - a13 * a31) + a30 * (a11 * a23 - a13 * a21);
  out[9] = -(a00 * (a21 * a33 - a23 * a31) - a20 * (a01 * a33 - a03 * a31) + a30 * (a01 * a23 - a03 * a21));
  out[10] = a00 * (a11 * a33 - a13 * a31) - a10 * (a01 * a33 - a03 * a31) + a30 * (a01 * a13 - a03 * a11);
  out[11] = -(a00 * (a11 * a23 - a13 * a21) - a10 * (a01 * a23 - a03 * a21) + a20 * (a01 * a13 - a03 * a11));
  out[12] = -(a10 * (a21 * a32 - a22 * a31) - a20 * (a11 * a32 - a12 * a31) + a30 * (a11 * a22 - a12 * a21));
  out[13] = a00 * (a21 * a32 - a22 * a31) - a20 * (a01 * a32 - a02 * a31) + a30 * (a01 * a22 - a02 * a21);
  out[14] = -(a00 * (a11 * a32 - a12 * a31) - a10 * (a01 * a32 - a02 * a31) + a30 * (a01 * a12 - a02 * a11));
  out[15] = a00 * (a11 * a22 - a12 * a21) - a10 * (a01 * a22 - a02 * a21) + a20 * (a01 * a12 - a02 * a11);
  return out;
}
__name(adjoint, "adjoint");
function determinant(a) {
  var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
  var b00 = a00 * a11 - a01 * a10;
  var b01 = a00 * a12 - a02 * a10;
  var b02 = a00 * a13 - a03 * a10;
  var b03 = a01 * a12 - a02 * a11;
  var b04 = a01 * a13 - a03 * a11;
  var b05 = a02 * a13 - a03 * a12;
  var b06 = a20 * a31 - a21 * a30;
  var b07 = a20 * a32 - a22 * a30;
  var b08 = a20 * a33 - a23 * a30;
  var b09 = a21 * a32 - a22 * a31;
  var b10 = a21 * a33 - a23 * a31;
  var b11 = a22 * a33 - a23 * a32;
  return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
}
__name(determinant, "determinant");
function multiply$5(out, a, b) {
  var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
  var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
  out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[4];
  b1 = b[5];
  b2 = b[6];
  b3 = b[7];
  out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[8];
  b1 = b[9];
  b2 = b[10];
  b3 = b[11];
  out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[12];
  b1 = b[13];
  b2 = b[14];
  b3 = b[15];
  out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  return out;
}
__name(multiply$5, "multiply$5");
function translate$1(out, a, v) {
  var x = v[0], y = v[1], z = v[2];
  var a00, a01, a02, a03;
  var a10, a11, a12, a13;
  var a20, a21, a22, a23;
  if (a === out) {
    out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
    out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
    out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
    out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
  } else {
    a00 = a[0];
    a01 = a[1];
    a02 = a[2];
    a03 = a[3];
    a10 = a[4];
    a11 = a[5];
    a12 = a[6];
    a13 = a[7];
    a20 = a[8];
    a21 = a[9];
    a22 = a[10];
    a23 = a[11];
    out[0] = a00;
    out[1] = a01;
    out[2] = a02;
    out[3] = a03;
    out[4] = a10;
    out[5] = a11;
    out[6] = a12;
    out[7] = a13;
    out[8] = a20;
    out[9] = a21;
    out[10] = a22;
    out[11] = a23;
    out[12] = a00 * x + a10 * y + a20 * z + a[12];
    out[13] = a01 * x + a11 * y + a21 * z + a[13];
    out[14] = a02 * x + a12 * y + a22 * z + a[14];
    out[15] = a03 * x + a13 * y + a23 * z + a[15];
  }
  return out;
}
__name(translate$1, "translate$1");
function scale$5(out, a, v) {
  var x = v[0], y = v[1], z = v[2];
  out[0] = a[0] * x;
  out[1] = a[1] * x;
  out[2] = a[2] * x;
  out[3] = a[3] * x;
  out[4] = a[4] * y;
  out[5] = a[5] * y;
  out[6] = a[6] * y;
  out[7] = a[7] * y;
  out[8] = a[8] * z;
  out[9] = a[9] * z;
  out[10] = a[10] * z;
  out[11] = a[11] * z;
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}
__name(scale$5, "scale$5");
function rotate$1(out, a, rad, axis) {
  var x = axis[0], y = axis[1], z = axis[2];
  var len = Math.hypot(x, y, z);
  var s, c, t;
  var a00, a01, a02, a03;
  var a10, a11, a12, a13;
  var a20, a21, a22, a23;
  var b00, b01, b02;
  var b10, b11, b12;
  var b20, b21, b22;
  if (len < EPSILON$1) {
    return null;
  }
  len = 1 / len;
  x *= len;
  y *= len;
  z *= len;
  s = Math.sin(rad);
  c = Math.cos(rad);
  t = 1 - c;
  a00 = a[0];
  a01 = a[1];
  a02 = a[2];
  a03 = a[3];
  a10 = a[4];
  a11 = a[5];
  a12 = a[6];
  a13 = a[7];
  a20 = a[8];
  a21 = a[9];
  a22 = a[10];
  a23 = a[11];
  b00 = x * x * t + c;
  b01 = y * x * t + z * s;
  b02 = z * x * t - y * s;
  b10 = x * y * t - z * s;
  b11 = y * y * t + c;
  b12 = z * y * t + x * s;
  b20 = x * z * t + y * s;
  b21 = y * z * t - x * s;
  b22 = z * z * t + c;
  out[0] = a00 * b00 + a10 * b01 + a20 * b02;
  out[1] = a01 * b00 + a11 * b01 + a21 * b02;
  out[2] = a02 * b00 + a12 * b01 + a22 * b02;
  out[3] = a03 * b00 + a13 * b01 + a23 * b02;
  out[4] = a00 * b10 + a10 * b11 + a20 * b12;
  out[5] = a01 * b10 + a11 * b11 + a21 * b12;
  out[6] = a02 * b10 + a12 * b11 + a22 * b12;
  out[7] = a03 * b10 + a13 * b11 + a23 * b12;
  out[8] = a00 * b20 + a10 * b21 + a20 * b22;
  out[9] = a01 * b20 + a11 * b21 + a21 * b22;
  out[10] = a02 * b20 + a12 * b21 + a22 * b22;
  out[11] = a03 * b20 + a13 * b21 + a23 * b22;
  if (a !== out) {
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  }
  return out;
}
__name(rotate$1, "rotate$1");
function rotateX$3(out, a, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  var a10 = a[4];
  var a11 = a[5];
  var a12 = a[6];
  var a13 = a[7];
  var a20 = a[8];
  var a21 = a[9];
  var a22 = a[10];
  var a23 = a[11];
  if (a !== out) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  }
  out[4] = a10 * c + a20 * s;
  out[5] = a11 * c + a21 * s;
  out[6] = a12 * c + a22 * s;
  out[7] = a13 * c + a23 * s;
  out[8] = a20 * c - a10 * s;
  out[9] = a21 * c - a11 * s;
  out[10] = a22 * c - a12 * s;
  out[11] = a23 * c - a13 * s;
  return out;
}
__name(rotateX$3, "rotateX$3");
function rotateY$3(out, a, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  var a00 = a[0];
  var a01 = a[1];
  var a02 = a[2];
  var a03 = a[3];
  var a20 = a[8];
  var a21 = a[9];
  var a22 = a[10];
  var a23 = a[11];
  if (a !== out) {
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  }
  out[0] = a00 * c - a20 * s;
  out[1] = a01 * c - a21 * s;
  out[2] = a02 * c - a22 * s;
  out[3] = a03 * c - a23 * s;
  out[8] = a00 * s + a20 * c;
  out[9] = a01 * s + a21 * c;
  out[10] = a02 * s + a22 * c;
  out[11] = a03 * s + a23 * c;
  return out;
}
__name(rotateY$3, "rotateY$3");
function rotateZ$3(out, a, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  var a00 = a[0];
  var a01 = a[1];
  var a02 = a[2];
  var a03 = a[3];
  var a10 = a[4];
  var a11 = a[5];
  var a12 = a[6];
  var a13 = a[7];
  if (a !== out) {
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  }
  out[0] = a00 * c + a10 * s;
  out[1] = a01 * c + a11 * s;
  out[2] = a02 * c + a12 * s;
  out[3] = a03 * c + a13 * s;
  out[4] = a10 * c - a00 * s;
  out[5] = a11 * c - a01 * s;
  out[6] = a12 * c - a02 * s;
  out[7] = a13 * c - a03 * s;
  return out;
}
__name(rotateZ$3, "rotateZ$3");
function fromTranslation$1(out, v) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = v[0];
  out[13] = v[1];
  out[14] = v[2];
  out[15] = 1;
  return out;
}
__name(fromTranslation$1, "fromTranslation$1");
function fromScaling(out, v) {
  out[0] = v[0];
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = v[1];
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = v[2];
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
__name(fromScaling, "fromScaling");
function fromRotation$1(out, rad, axis) {
  var x = axis[0], y = axis[1], z = axis[2];
  var len = Math.hypot(x, y, z);
  var s, c, t;
  if (len < EPSILON$1) {
    return null;
  }
  len = 1 / len;
  x *= len;
  y *= len;
  z *= len;
  s = Math.sin(rad);
  c = Math.cos(rad);
  t = 1 - c;
  out[0] = x * x * t + c;
  out[1] = y * x * t + z * s;
  out[2] = z * x * t - y * s;
  out[3] = 0;
  out[4] = x * y * t - z * s;
  out[5] = y * y * t + c;
  out[6] = z * y * t + x * s;
  out[7] = 0;
  out[8] = x * z * t + y * s;
  out[9] = y * z * t - x * s;
  out[10] = z * z * t + c;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
__name(fromRotation$1, "fromRotation$1");
function fromXRotation(out, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = c;
  out[6] = s;
  out[7] = 0;
  out[8] = 0;
  out[9] = -s;
  out[10] = c;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
__name(fromXRotation, "fromXRotation");
function fromYRotation(out, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  out[0] = c;
  out[1] = 0;
  out[2] = -s;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = s;
  out[9] = 0;
  out[10] = c;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
__name(fromYRotation, "fromYRotation");
function fromZRotation(out, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  out[0] = c;
  out[1] = s;
  out[2] = 0;
  out[3] = 0;
  out[4] = -s;
  out[5] = c;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
__name(fromZRotation, "fromZRotation");
function fromRotationTranslation$1(out, q, v) {
  var x = q[0], y = q[1], z = q[2], w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var xy = x * y2;
  var xz = x * z2;
  var yy = y * y2;
  var yz = y * z2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  out[0] = 1 - (yy + zz);
  out[1] = xy + wz;
  out[2] = xz - wy;
  out[3] = 0;
  out[4] = xy - wz;
  out[5] = 1 - (xx + zz);
  out[6] = yz + wx;
  out[7] = 0;
  out[8] = xz + wy;
  out[9] = yz - wx;
  out[10] = 1 - (xx + yy);
  out[11] = 0;
  out[12] = v[0];
  out[13] = v[1];
  out[14] = v[2];
  out[15] = 1;
  return out;
}
__name(fromRotationTranslation$1, "fromRotationTranslation$1");
function fromQuat2(out, a) {
  var translation = new ARRAY_TYPE(3);
  var bx = -a[0], by = -a[1], bz = -a[2], bw = a[3], ax = a[4], ay = a[5], az = a[6], aw = a[7];
  var magnitude = bx * bx + by * by + bz * bz + bw * bw;
  if (magnitude > 0) {
    translation[0] = (ax * bw + aw * bx + ay * bz - az * by) * 2 / magnitude;
    translation[1] = (ay * bw + aw * by + az * bx - ax * bz) * 2 / magnitude;
    translation[2] = (az * bw + aw * bz + ax * by - ay * bx) * 2 / magnitude;
  } else {
    translation[0] = (ax * bw + aw * bx + ay * bz - az * by) * 2;
    translation[1] = (ay * bw + aw * by + az * bx - ax * bz) * 2;
    translation[2] = (az * bw + aw * bz + ax * by - ay * bx) * 2;
  }
  fromRotationTranslation$1(out, a, translation);
  return out;
}
__name(fromQuat2, "fromQuat2");
function getTranslation$1(out, mat) {
  out[0] = mat[12];
  out[1] = mat[13];
  out[2] = mat[14];
  return out;
}
__name(getTranslation$1, "getTranslation$1");
function getScaling(out, mat) {
  var m11 = mat[0];
  var m12 = mat[1];
  var m13 = mat[2];
  var m21 = mat[4];
  var m22 = mat[5];
  var m23 = mat[6];
  var m31 = mat[8];
  var m32 = mat[9];
  var m33 = mat[10];
  out[0] = Math.hypot(m11, m12, m13);
  out[1] = Math.hypot(m21, m22, m23);
  out[2] = Math.hypot(m31, m32, m33);
  return out;
}
__name(getScaling, "getScaling");
function getRotation(out, mat) {
  var scaling = new ARRAY_TYPE(3);
  getScaling(scaling, mat);
  var is1 = 1 / scaling[0];
  var is2 = 1 / scaling[1];
  var is3 = 1 / scaling[2];
  var sm11 = mat[0] * is1;
  var sm12 = mat[1] * is2;
  var sm13 = mat[2] * is3;
  var sm21 = mat[4] * is1;
  var sm22 = mat[5] * is2;
  var sm23 = mat[6] * is3;
  var sm31 = mat[8] * is1;
  var sm32 = mat[9] * is2;
  var sm33 = mat[10] * is3;
  var trace = sm11 + sm22 + sm33;
  var S = 0;
  if (trace > 0) {
    S = Math.sqrt(trace + 1) * 2;
    out[3] = 0.25 * S;
    out[0] = (sm23 - sm32) / S;
    out[1] = (sm31 - sm13) / S;
    out[2] = (sm12 - sm21) / S;
  } else if (sm11 > sm22 && sm11 > sm33) {
    S = Math.sqrt(1 + sm11 - sm22 - sm33) * 2;
    out[3] = (sm23 - sm32) / S;
    out[0] = 0.25 * S;
    out[1] = (sm12 + sm21) / S;
    out[2] = (sm31 + sm13) / S;
  } else if (sm22 > sm33) {
    S = Math.sqrt(1 + sm22 - sm11 - sm33) * 2;
    out[3] = (sm31 - sm13) / S;
    out[0] = (sm12 + sm21) / S;
    out[1] = 0.25 * S;
    out[2] = (sm23 + sm32) / S;
  } else {
    S = Math.sqrt(1 + sm33 - sm11 - sm22) * 2;
    out[3] = (sm12 - sm21) / S;
    out[0] = (sm31 + sm13) / S;
    out[1] = (sm23 + sm32) / S;
    out[2] = 0.25 * S;
  }
  return out;
}
__name(getRotation, "getRotation");
function fromRotationTranslationScale(out, q, v, s) {
  var x = q[0], y = q[1], z = q[2], w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var xy = x * y2;
  var xz = x * z2;
  var yy = y * y2;
  var yz = y * z2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  var sx = s[0];
  var sy = s[1];
  var sz = s[2];
  out[0] = (1 - (yy + zz)) * sx;
  out[1] = (xy + wz) * sx;
  out[2] = (xz - wy) * sx;
  out[3] = 0;
  out[4] = (xy - wz) * sy;
  out[5] = (1 - (xx + zz)) * sy;
  out[6] = (yz + wx) * sy;
  out[7] = 0;
  out[8] = (xz + wy) * sz;
  out[9] = (yz - wx) * sz;
  out[10] = (1 - (xx + yy)) * sz;
  out[11] = 0;
  out[12] = v[0];
  out[13] = v[1];
  out[14] = v[2];
  out[15] = 1;
  return out;
}
__name(fromRotationTranslationScale, "fromRotationTranslationScale");
function fromRotationTranslationScaleOrigin(out, q, v, s, o) {
  var x = q[0], y = q[1], z = q[2], w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var xy = x * y2;
  var xz = x * z2;
  var yy = y * y2;
  var yz = y * z2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  var sx = s[0];
  var sy = s[1];
  var sz = s[2];
  var ox = o[0];
  var oy = o[1];
  var oz = o[2];
  var out0 = (1 - (yy + zz)) * sx;
  var out1 = (xy + wz) * sx;
  var out2 = (xz - wy) * sx;
  var out4 = (xy - wz) * sy;
  var out5 = (1 - (xx + zz)) * sy;
  var out6 = (yz + wx) * sy;
  var out8 = (xz + wy) * sz;
  var out9 = (yz - wx) * sz;
  var out10 = (1 - (xx + yy)) * sz;
  out[0] = out0;
  out[1] = out1;
  out[2] = out2;
  out[3] = 0;
  out[4] = out4;
  out[5] = out5;
  out[6] = out6;
  out[7] = 0;
  out[8] = out8;
  out[9] = out9;
  out[10] = out10;
  out[11] = 0;
  out[12] = v[0] + ox - (out0 * ox + out4 * oy + out8 * oz);
  out[13] = v[1] + oy - (out1 * ox + out5 * oy + out9 * oz);
  out[14] = v[2] + oz - (out2 * ox + out6 * oy + out10 * oz);
  out[15] = 1;
  return out;
}
__name(fromRotationTranslationScaleOrigin, "fromRotationTranslationScaleOrigin");
function fromQuat(out, q) {
  var x = q[0], y = q[1], z = q[2], w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var yx = y * x2;
  var yy = y * y2;
  var zx = z * x2;
  var zy = z * y2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  out[0] = 1 - yy - zz;
  out[1] = yx + wz;
  out[2] = zx - wy;
  out[3] = 0;
  out[4] = yx - wz;
  out[5] = 1 - xx - zz;
  out[6] = zy + wx;
  out[7] = 0;
  out[8] = zx + wy;
  out[9] = zy - wx;
  out[10] = 1 - xx - yy;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
__name(fromQuat, "fromQuat");
function frustum(out, left, right, bottom, top, near, far) {
  var rl = 1 / (right - left);
  var tb = 1 / (top - bottom);
  var nf = 1 / (near - far);
  out[0] = near * 2 * rl;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = near * 2 * tb;
  out[6] = 0;
  out[7] = 0;
  out[8] = (right + left) * rl;
  out[9] = (top + bottom) * tb;
  out[10] = (far + near) * nf;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[14] = far * near * 2 * nf;
  out[15] = 0;
  return out;
}
__name(frustum, "frustum");
function perspectiveNO(out, fovy, aspect, near, far) {
  var f = 1 / Math.tan(fovy / 2), nf;
  out[0] = f / aspect;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = f;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[15] = 0;
  if (far != null && far !== Infinity) {
    nf = 1 / (near - far);
    out[10] = (far + near) * nf;
    out[14] = 2 * far * near * nf;
  } else {
    out[10] = -1;
    out[14] = -2 * near;
  }
  return out;
}
__name(perspectiveNO, "perspectiveNO");
var perspective = perspectiveNO;
function perspectiveZO(out, fovy, aspect, near, far) {
  var f = 1 / Math.tan(fovy / 2), nf;
  out[0] = f / aspect;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = f;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[15] = 0;
  if (far != null && far !== Infinity) {
    nf = 1 / (near - far);
    out[10] = far * nf;
    out[14] = far * near * nf;
  } else {
    out[10] = -1;
    out[14] = -near;
  }
  return out;
}
__name(perspectiveZO, "perspectiveZO");
function perspectiveFromFieldOfView(out, fov, near, far) {
  var upTan = Math.tan(fov.upDegrees * Math.PI / 180);
  var downTan = Math.tan(fov.downDegrees * Math.PI / 180);
  var leftTan = Math.tan(fov.leftDegrees * Math.PI / 180);
  var rightTan = Math.tan(fov.rightDegrees * Math.PI / 180);
  var xScale = 2 / (leftTan + rightTan);
  var yScale = 2 / (upTan + downTan);
  out[0] = xScale;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = yScale;
  out[6] = 0;
  out[7] = 0;
  out[8] = -((leftTan - rightTan) * xScale * 0.5);
  out[9] = (upTan - downTan) * yScale * 0.5;
  out[10] = far / (near - far);
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[14] = far * near / (near - far);
  out[15] = 0;
  return out;
}
__name(perspectiveFromFieldOfView, "perspectiveFromFieldOfView");
function orthoNO(out, left, right, bottom, top, near, far) {
  var lr = 1 / (left - right);
  var bt = 1 / (bottom - top);
  var nf = 1 / (near - far);
  out[0] = -2 * lr;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = -2 * bt;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 2 * nf;
  out[11] = 0;
  out[12] = (left + right) * lr;
  out[13] = (top + bottom) * bt;
  out[14] = (far + near) * nf;
  out[15] = 1;
  return out;
}
__name(orthoNO, "orthoNO");
var ortho = orthoNO;
function orthoZO(out, left, right, bottom, top, near, far) {
  var lr = 1 / (left - right);
  var bt = 1 / (bottom - top);
  var nf = 1 / (near - far);
  out[0] = -2 * lr;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = -2 * bt;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = nf;
  out[11] = 0;
  out[12] = (left + right) * lr;
  out[13] = (top + bottom) * bt;
  out[14] = near * nf;
  out[15] = 1;
  return out;
}
__name(orthoZO, "orthoZO");
function lookAt(out, eye, center, up) {
  var x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
  var eyex = eye[0];
  var eyey = eye[1];
  var eyez = eye[2];
  var upx = up[0];
  var upy = up[1];
  var upz = up[2];
  var centerx = center[0];
  var centery = center[1];
  var centerz = center[2];
  if (Math.abs(eyex - centerx) < EPSILON$1 && Math.abs(eyey - centery) < EPSILON$1 && Math.abs(eyez - centerz) < EPSILON$1) {
    return identity$2(out);
  }
  z0 = eyex - centerx;
  z1 = eyey - centery;
  z2 = eyez - centerz;
  len = 1 / Math.hypot(z0, z1, z2);
  z0 *= len;
  z1 *= len;
  z2 *= len;
  x0 = upy * z2 - upz * z1;
  x1 = upz * z0 - upx * z2;
  x2 = upx * z1 - upy * z0;
  len = Math.hypot(x0, x1, x2);
  if (!len) {
    x0 = 0;
    x1 = 0;
    x2 = 0;
  } else {
    len = 1 / len;
    x0 *= len;
    x1 *= len;
    x2 *= len;
  }
  y0 = z1 * x2 - z2 * x1;
  y1 = z2 * x0 - z0 * x2;
  y2 = z0 * x1 - z1 * x0;
  len = Math.hypot(y0, y1, y2);
  if (!len) {
    y0 = 0;
    y1 = 0;
    y2 = 0;
  } else {
    len = 1 / len;
    y0 *= len;
    y1 *= len;
    y2 *= len;
  }
  out[0] = x0;
  out[1] = y0;
  out[2] = z0;
  out[3] = 0;
  out[4] = x1;
  out[5] = y1;
  out[6] = z1;
  out[7] = 0;
  out[8] = x2;
  out[9] = y2;
  out[10] = z2;
  out[11] = 0;
  out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
  out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
  out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
  out[15] = 1;
  return out;
}
__name(lookAt, "lookAt");
function targetTo(out, eye, target, up) {
  var eyex = eye[0], eyey = eye[1], eyez = eye[2], upx = up[0], upy = up[1], upz = up[2];
  var z0 = eyex - target[0], z1 = eyey - target[1], z2 = eyez - target[2];
  var len = z0 * z0 + z1 * z1 + z2 * z2;
  if (len > 0) {
    len = 1 / Math.sqrt(len);
    z0 *= len;
    z1 *= len;
    z2 *= len;
  }
  var x0 = upy * z2 - upz * z1, x1 = upz * z0 - upx * z2, x2 = upx * z1 - upy * z0;
  len = x0 * x0 + x1 * x1 + x2 * x2;
  if (len > 0) {
    len = 1 / Math.sqrt(len);
    x0 *= len;
    x1 *= len;
    x2 *= len;
  }
  out[0] = x0;
  out[1] = x1;
  out[2] = x2;
  out[3] = 0;
  out[4] = z1 * x2 - z2 * x1;
  out[5] = z2 * x0 - z0 * x2;
  out[6] = z0 * x1 - z1 * x0;
  out[7] = 0;
  out[8] = z0;
  out[9] = z1;
  out[10] = z2;
  out[11] = 0;
  out[12] = eyex;
  out[13] = eyey;
  out[14] = eyez;
  out[15] = 1;
  return out;
}
__name(targetTo, "targetTo");
function str$5(a) {
  return "mat4(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ", " + a[4] + ", " + a[5] + ", " + a[6] + ", " + a[7] + ", " + a[8] + ", " + a[9] + ", " + a[10] + ", " + a[11] + ", " + a[12] + ", " + a[13] + ", " + a[14] + ", " + a[15] + ")";
}
__name(str$5, "str$5");
function frob(a) {
  return Math.hypot(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8], a[9], a[10], a[11], a[12], a[13], a[14], a[15]);
}
__name(frob, "frob");
function add$5(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  out[4] = a[4] + b[4];
  out[5] = a[5] + b[5];
  out[6] = a[6] + b[6];
  out[7] = a[7] + b[7];
  out[8] = a[8] + b[8];
  out[9] = a[9] + b[9];
  out[10] = a[10] + b[10];
  out[11] = a[11] + b[11];
  out[12] = a[12] + b[12];
  out[13] = a[13] + b[13];
  out[14] = a[14] + b[14];
  out[15] = a[15] + b[15];
  return out;
}
__name(add$5, "add$5");
function subtract$3(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  out[3] = a[3] - b[3];
  out[4] = a[4] - b[4];
  out[5] = a[5] - b[5];
  out[6] = a[6] - b[6];
  out[7] = a[7] - b[7];
  out[8] = a[8] - b[8];
  out[9] = a[9] - b[9];
  out[10] = a[10] - b[10];
  out[11] = a[11] - b[11];
  out[12] = a[12] - b[12];
  out[13] = a[13] - b[13];
  out[14] = a[14] - b[14];
  out[15] = a[15] - b[15];
  return out;
}
__name(subtract$3, "subtract$3");
function multiplyScalar(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  out[4] = a[4] * b;
  out[5] = a[5] * b;
  out[6] = a[6] * b;
  out[7] = a[7] * b;
  out[8] = a[8] * b;
  out[9] = a[9] * b;
  out[10] = a[10] * b;
  out[11] = a[11] * b;
  out[12] = a[12] * b;
  out[13] = a[13] * b;
  out[14] = a[14] * b;
  out[15] = a[15] * b;
  return out;
}
__name(multiplyScalar, "multiplyScalar");
function multiplyScalarAndAdd(out, a, b, scale) {
  out[0] = a[0] + b[0] * scale;
  out[1] = a[1] + b[1] * scale;
  out[2] = a[2] + b[2] * scale;
  out[3] = a[3] + b[3] * scale;
  out[4] = a[4] + b[4] * scale;
  out[5] = a[5] + b[5] * scale;
  out[6] = a[6] + b[6] * scale;
  out[7] = a[7] + b[7] * scale;
  out[8] = a[8] + b[8] * scale;
  out[9] = a[9] + b[9] * scale;
  out[10] = a[10] + b[10] * scale;
  out[11] = a[11] + b[11] * scale;
  out[12] = a[12] + b[12] * scale;
  out[13] = a[13] + b[13] * scale;
  out[14] = a[14] + b[14] * scale;
  out[15] = a[15] + b[15] * scale;
  return out;
}
__name(multiplyScalarAndAdd, "multiplyScalarAndAdd");
function exactEquals$5(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5] && a[6] === b[6] && a[7] === b[7] && a[8] === b[8] && a[9] === b[9] && a[10] === b[10] && a[11] === b[11] && a[12] === b[12] && a[13] === b[13] && a[14] === b[14] && a[15] === b[15];
}
__name(exactEquals$5, "exactEquals$5");
function equals$5(a, b) {
  var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
  var a4 = a[4], a5 = a[5], a6 = a[6], a7 = a[7];
  var a8 = a[8], a9 = a[9], a10 = a[10], a11 = a[11];
  var a12 = a[12], a13 = a[13], a14 = a[14], a15 = a[15];
  var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
  var b4 = b[4], b5 = b[5], b6 = b[6], b7 = b[7];
  var b8 = b[8], b9 = b[9], b10 = b[10], b11 = b[11];
  var b12 = b[12], b13 = b[13], b14 = b[14], b15 = b[15];
  return Math.abs(a0 - b0) <= EPSILON$1 * Math.max(1, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON$1 * Math.max(1, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= EPSILON$1 * Math.max(1, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= EPSILON$1 * Math.max(1, Math.abs(a3), Math.abs(b3)) && Math.abs(a4 - b4) <= EPSILON$1 * Math.max(1, Math.abs(a4), Math.abs(b4)) && Math.abs(a5 - b5) <= EPSILON$1 * Math.max(1, Math.abs(a5), Math.abs(b5)) && Math.abs(a6 - b6) <= EPSILON$1 * Math.max(1, Math.abs(a6), Math.abs(b6)) && Math.abs(a7 - b7) <= EPSILON$1 * Math.max(1, Math.abs(a7), Math.abs(b7)) && Math.abs(a8 - b8) <= EPSILON$1 * Math.max(1, Math.abs(a8), Math.abs(b8)) && Math.abs(a9 - b9) <= EPSILON$1 * Math.max(1, Math.abs(a9), Math.abs(b9)) && Math.abs(a10 - b10) <= EPSILON$1 * Math.max(1, Math.abs(a10), Math.abs(b10)) && Math.abs(a11 - b11) <= EPSILON$1 * Math.max(1, Math.abs(a11), Math.abs(b11)) && Math.abs(a12 - b12) <= EPSILON$1 * Math.max(1, Math.abs(a12), Math.abs(b12)) && Math.abs(a13 - b13) <= EPSILON$1 * Math.max(1, Math.abs(a13), Math.abs(b13)) && Math.abs(a14 - b14) <= EPSILON$1 * Math.max(1, Math.abs(a14), Math.abs(b14)) && Math.abs(a15 - b15) <= EPSILON$1 * Math.max(1, Math.abs(a15), Math.abs(b15));
}
__name(equals$5, "equals$5");
var mul$5 = multiply$5;
var sub$3 = subtract$3;
const mat4 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  create: create$5,
  clone: clone$5,
  copy: copy$5,
  fromValues: fromValues$5,
  set: set$5,
  identity: identity$2,
  transpose,
  invert: invert$2,
  adjoint,
  determinant,
  multiply: multiply$5,
  translate: translate$1,
  scale: scale$5,
  rotate: rotate$1,
  rotateX: rotateX$3,
  rotateY: rotateY$3,
  rotateZ: rotateZ$3,
  fromTranslation: fromTranslation$1,
  fromScaling,
  fromRotation: fromRotation$1,
  fromXRotation,
  fromYRotation,
  fromZRotation,
  fromRotationTranslation: fromRotationTranslation$1,
  fromQuat2,
  getTranslation: getTranslation$1,
  getScaling,
  getRotation,
  fromRotationTranslationScale,
  fromRotationTranslationScaleOrigin,
  fromQuat,
  frustum,
  perspectiveNO,
  perspective,
  perspectiveZO,
  perspectiveFromFieldOfView,
  orthoNO,
  ortho,
  orthoZO,
  lookAt,
  targetTo,
  str: str$5,
  frob,
  add: add$5,
  subtract: subtract$3,
  multiplyScalar,
  multiplyScalarAndAdd,
  exactEquals: exactEquals$5,
  equals: equals$5,
  mul: mul$5,
  sub: sub$3
});
function create$4() {
  var out = new ARRAY_TYPE(3);
  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
  }
  return out;
}
__name(create$4, "create$4");
function clone$4(a) {
  var out = new ARRAY_TYPE(3);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  return out;
}
__name(clone$4, "clone$4");
function length$4(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  return Math.hypot(x, y, z);
}
__name(length$4, "length$4");
function fromValues$4(x, y, z) {
  var out = new ARRAY_TYPE(3);
  out[0] = x;
  out[1] = y;
  out[2] = z;
  return out;
}
__name(fromValues$4, "fromValues$4");
function copy$4(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  return out;
}
__name(copy$4, "copy$4");
function set$4(out, x, y, z) {
  out[0] = x;
  out[1] = y;
  out[2] = z;
  return out;
}
__name(set$4, "set$4");
function add$4(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  return out;
}
__name(add$4, "add$4");
function subtract$2(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  return out;
}
__name(subtract$2, "subtract$2");
function multiply$4(out, a, b) {
  out[0] = a[0] * b[0];
  out[1] = a[1] * b[1];
  out[2] = a[2] * b[2];
  return out;
}
__name(multiply$4, "multiply$4");
function divide$2(out, a, b) {
  out[0] = a[0] / b[0];
  out[1] = a[1] / b[1];
  out[2] = a[2] / b[2];
  return out;
}
__name(divide$2, "divide$2");
function ceil$2(out, a) {
  out[0] = Math.ceil(a[0]);
  out[1] = Math.ceil(a[1]);
  out[2] = Math.ceil(a[2]);
  return out;
}
__name(ceil$2, "ceil$2");
function floor$2(out, a) {
  out[0] = Math.floor(a[0]);
  out[1] = Math.floor(a[1]);
  out[2] = Math.floor(a[2]);
  return out;
}
__name(floor$2, "floor$2");
function min$2(out, a, b) {
  out[0] = Math.min(a[0], b[0]);
  out[1] = Math.min(a[1], b[1]);
  out[2] = Math.min(a[2], b[2]);
  return out;
}
__name(min$2, "min$2");
function max$2(out, a, b) {
  out[0] = Math.max(a[0], b[0]);
  out[1] = Math.max(a[1], b[1]);
  out[2] = Math.max(a[2], b[2]);
  return out;
}
__name(max$2, "max$2");
function round$2(out, a) {
  out[0] = Math.round(a[0]);
  out[1] = Math.round(a[1]);
  out[2] = Math.round(a[2]);
  return out;
}
__name(round$2, "round$2");
function scale$4(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  return out;
}
__name(scale$4, "scale$4");
function scaleAndAdd$2(out, a, b, scale) {
  out[0] = a[0] + b[0] * scale;
  out[1] = a[1] + b[1] * scale;
  out[2] = a[2] + b[2] * scale;
  return out;
}
__name(scaleAndAdd$2, "scaleAndAdd$2");
function distance$2(a, b) {
  var x = b[0] - a[0];
  var y = b[1] - a[1];
  var z = b[2] - a[2];
  return Math.hypot(x, y, z);
}
__name(distance$2, "distance$2");
function squaredDistance$2(a, b) {
  var x = b[0] - a[0];
  var y = b[1] - a[1];
  var z = b[2] - a[2];
  return x * x + y * y + z * z;
}
__name(squaredDistance$2, "squaredDistance$2");
function squaredLength$4(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  return x * x + y * y + z * z;
}
__name(squaredLength$4, "squaredLength$4");
function negate$2(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  out[2] = -a[2];
  return out;
}
__name(negate$2, "negate$2");
function inverse$2(out, a) {
  out[0] = 1 / a[0];
  out[1] = 1 / a[1];
  out[2] = 1 / a[2];
  return out;
}
__name(inverse$2, "inverse$2");
function normalize$4(out, a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var len = x * x + y * y + z * z;
  if (len > 0) {
    len = 1 / Math.sqrt(len);
  }
  out[0] = a[0] * len;
  out[1] = a[1] * len;
  out[2] = a[2] * len;
  return out;
}
__name(normalize$4, "normalize$4");
function dot$4(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
__name(dot$4, "dot$4");
function cross$2(out, a, b) {
  var ax = a[0], ay = a[1], az = a[2];
  var bx = b[0], by = b[1], bz = b[2];
  out[0] = ay * bz - az * by;
  out[1] = az * bx - ax * bz;
  out[2] = ax * by - ay * bx;
  return out;
}
__name(cross$2, "cross$2");
function lerp$4(out, a, b, t) {
  var ax = a[0];
  var ay = a[1];
  var az = a[2];
  out[0] = ax + t * (b[0] - ax);
  out[1] = ay + t * (b[1] - ay);
  out[2] = az + t * (b[2] - az);
  return out;
}
__name(lerp$4, "lerp$4");
function hermite(out, a, b, c, d, t) {
  var factorTimes2 = t * t;
  var factor1 = factorTimes2 * (2 * t - 3) + 1;
  var factor2 = factorTimes2 * (t - 2) + t;
  var factor3 = factorTimes2 * (t - 1);
  var factor4 = factorTimes2 * (3 - 2 * t);
  out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
  out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
  out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;
  return out;
}
__name(hermite, "hermite");
function bezier(out, a, b, c, d, t) {
  var inverseFactor = 1 - t;
  var inverseFactorTimesTwo = inverseFactor * inverseFactor;
  var factorTimes2 = t * t;
  var factor1 = inverseFactorTimesTwo * inverseFactor;
  var factor2 = 3 * t * inverseFactorTimesTwo;
  var factor3 = 3 * factorTimes2 * inverseFactor;
  var factor4 = factorTimes2 * t;
  out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
  out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
  out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;
  return out;
}
__name(bezier, "bezier");
function random$3(out, scale) {
  scale = scale || 1;
  var r = RANDOM() * 2 * Math.PI;
  var z = RANDOM() * 2 - 1;
  var zScale = Math.sqrt(1 - z * z) * scale;
  out[0] = Math.cos(r) * zScale;
  out[1] = Math.sin(r) * zScale;
  out[2] = z * scale;
  return out;
}
__name(random$3, "random$3");
function transformMat4$2(out, a, m) {
  var x = a[0], y = a[1], z = a[2];
  var w = m[3] * x + m[7] * y + m[11] * z + m[15];
  w = w || 1;
  out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
  out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
  out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
  return out;
}
__name(transformMat4$2, "transformMat4$2");
function transformMat3$1(out, a, m) {
  var x = a[0], y = a[1], z = a[2];
  out[0] = x * m[0] + y * m[3] + z * m[6];
  out[1] = x * m[1] + y * m[4] + z * m[7];
  out[2] = x * m[2] + y * m[5] + z * m[8];
  return out;
}
__name(transformMat3$1, "transformMat3$1");
function transformQuat$1(out, a, q) {
  var qx = q[0], qy = q[1], qz = q[2], qw = q[3];
  var x = a[0], y = a[1], z = a[2];
  var uvx = qy * z - qz * y, uvy = qz * x - qx * z, uvz = qx * y - qy * x;
  var uuvx = qy * uvz - qz * uvy, uuvy = qz * uvx - qx * uvz, uuvz = qx * uvy - qy * uvx;
  var w2 = qw * 2;
  uvx *= w2;
  uvy *= w2;
  uvz *= w2;
  uuvx *= 2;
  uuvy *= 2;
  uuvz *= 2;
  out[0] = x + uvx + uuvx;
  out[1] = y + uvy + uuvy;
  out[2] = z + uvz + uuvz;
  return out;
}
__name(transformQuat$1, "transformQuat$1");
function rotateX$2(out, a, b, rad) {
  var p = [], r = [];
  p[0] = a[0] - b[0];
  p[1] = a[1] - b[1];
  p[2] = a[2] - b[2];
  r[0] = p[0];
  r[1] = p[1] * Math.cos(rad) - p[2] * Math.sin(rad);
  r[2] = p[1] * Math.sin(rad) + p[2] * Math.cos(rad);
  out[0] = r[0] + b[0];
  out[1] = r[1] + b[1];
  out[2] = r[2] + b[2];
  return out;
}
__name(rotateX$2, "rotateX$2");
function rotateY$2(out, a, b, rad) {
  var p = [], r = [];
  p[0] = a[0] - b[0];
  p[1] = a[1] - b[1];
  p[2] = a[2] - b[2];
  r[0] = p[2] * Math.sin(rad) + p[0] * Math.cos(rad);
  r[1] = p[1];
  r[2] = p[2] * Math.cos(rad) - p[0] * Math.sin(rad);
  out[0] = r[0] + b[0];
  out[1] = r[1] + b[1];
  out[2] = r[2] + b[2];
  return out;
}
__name(rotateY$2, "rotateY$2");
function rotateZ$2(out, a, b, rad) {
  var p = [], r = [];
  p[0] = a[0] - b[0];
  p[1] = a[1] - b[1];
  p[2] = a[2] - b[2];
  r[0] = p[0] * Math.cos(rad) - p[1] * Math.sin(rad);
  r[1] = p[0] * Math.sin(rad) + p[1] * Math.cos(rad);
  r[2] = p[2];
  out[0] = r[0] + b[0];
  out[1] = r[1] + b[1];
  out[2] = r[2] + b[2];
  return out;
}
__name(rotateZ$2, "rotateZ$2");
function angle$1(a, b) {
  var ax = a[0], ay = a[1], az = a[2], bx = b[0], by = b[1], bz = b[2], mag1 = Math.sqrt(ax * ax + ay * ay + az * az), mag2 = Math.sqrt(bx * bx + by * by + bz * bz), mag = mag1 * mag2, cosine = mag && dot$4(a, b) / mag;
  return Math.acos(Math.min(Math.max(cosine, -1), 1));
}
__name(angle$1, "angle$1");
function zero$2(out) {
  out[0] = 0;
  out[1] = 0;
  out[2] = 0;
  return out;
}
__name(zero$2, "zero$2");
function str$4(a) {
  return "vec3(" + a[0] + ", " + a[1] + ", " + a[2] + ")";
}
__name(str$4, "str$4");
function exactEquals$4(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}
__name(exactEquals$4, "exactEquals$4");
function equals$4(a, b) {
  var a0 = a[0], a1 = a[1], a2 = a[2];
  var b0 = b[0], b1 = b[1], b2 = b[2];
  return Math.abs(a0 - b0) <= EPSILON$1 * Math.max(1, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON$1 * Math.max(1, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= EPSILON$1 * Math.max(1, Math.abs(a2), Math.abs(b2));
}
__name(equals$4, "equals$4");
var sub$2 = subtract$2;
var mul$4 = multiply$4;
var div$2 = divide$2;
var dist$2 = distance$2;
var sqrDist$2 = squaredDistance$2;
var len$4 = length$4;
var sqrLen$4 = squaredLength$4;
var forEach$2 = function() {
  var vec = create$4();
  return function(a, stride, offset, count, fn, arg) {
    var i, l;
    if (!stride) {
      stride = 3;
    }
    if (!offset) {
      offset = 0;
    }
    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }
    for (i = offset; i < l; i += stride) {
      vec[0] = a[i];
      vec[1] = a[i + 1];
      vec[2] = a[i + 2];
      fn(vec, vec, arg);
      a[i] = vec[0];
      a[i + 1] = vec[1];
      a[i + 2] = vec[2];
    }
    return a;
  };
}();
const vec3 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  create: create$4,
  clone: clone$4,
  length: length$4,
  fromValues: fromValues$4,
  copy: copy$4,
  set: set$4,
  add: add$4,
  subtract: subtract$2,
  multiply: multiply$4,
  divide: divide$2,
  ceil: ceil$2,
  floor: floor$2,
  min: min$2,
  max: max$2,
  round: round$2,
  scale: scale$4,
  scaleAndAdd: scaleAndAdd$2,
  distance: distance$2,
  squaredDistance: squaredDistance$2,
  squaredLength: squaredLength$4,
  negate: negate$2,
  inverse: inverse$2,
  normalize: normalize$4,
  dot: dot$4,
  cross: cross$2,
  lerp: lerp$4,
  hermite,
  bezier,
  random: random$3,
  transformMat4: transformMat4$2,
  transformMat3: transformMat3$1,
  transformQuat: transformQuat$1,
  rotateX: rotateX$2,
  rotateY: rotateY$2,
  rotateZ: rotateZ$2,
  angle: angle$1,
  zero: zero$2,
  str: str$4,
  exactEquals: exactEquals$4,
  equals: equals$4,
  sub: sub$2,
  mul: mul$4,
  div: div$2,
  dist: dist$2,
  sqrDist: sqrDist$2,
  len: len$4,
  sqrLen: sqrLen$4,
  forEach: forEach$2
});
function create$3() {
  var out = new ARRAY_TYPE(4);
  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
  }
  return out;
}
__name(create$3, "create$3");
function normalize$3(out, a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var w = a[3];
  var len = x * x + y * y + z * z + w * w;
  if (len > 0) {
    len = 1 / Math.sqrt(len);
  }
  out[0] = x * len;
  out[1] = y * len;
  out[2] = z * len;
  out[3] = w * len;
  return out;
}
__name(normalize$3, "normalize$3");
(function() {
  var vec = create$3();
  return function(a, stride, offset, count, fn, arg) {
    var i, l;
    if (!stride) {
      stride = 4;
    }
    if (!offset) {
      offset = 0;
    }
    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }
    for (i = offset; i < l; i += stride) {
      vec[0] = a[i];
      vec[1] = a[i + 1];
      vec[2] = a[i + 2];
      vec[3] = a[i + 3];
      fn(vec, vec, arg);
      a[i] = vec[0];
      a[i + 1] = vec[1];
      a[i + 2] = vec[2];
      a[i + 3] = vec[3];
    }
    return a;
  };
})();
function create$2() {
  var out = new ARRAY_TYPE(4);
  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
  }
  out[3] = 1;
  return out;
}
__name(create$2, "create$2");
function setAxisAngle(out, axis, rad) {
  rad = rad * 0.5;
  var s = Math.sin(rad);
  out[0] = s * axis[0];
  out[1] = s * axis[1];
  out[2] = s * axis[2];
  out[3] = Math.cos(rad);
  return out;
}
__name(setAxisAngle, "setAxisAngle");
function slerp(out, a, b, t) {
  var ax = a[0], ay = a[1], az = a[2], aw = a[3];
  var bx = b[0], by = b[1], bz = b[2], bw = b[3];
  var omega, cosom, sinom, scale0, scale1;
  cosom = ax * bx + ay * by + az * bz + aw * bw;
  if (cosom < 0) {
    cosom = -cosom;
    bx = -bx;
    by = -by;
    bz = -bz;
    bw = -bw;
  }
  if (1 - cosom > EPSILON$1) {
    omega = Math.acos(cosom);
    sinom = Math.sin(omega);
    scale0 = Math.sin((1 - t) * omega) / sinom;
    scale1 = Math.sin(t * omega) / sinom;
  } else {
    scale0 = 1 - t;
    scale1 = t;
  }
  out[0] = scale0 * ax + scale1 * bx;
  out[1] = scale0 * ay + scale1 * by;
  out[2] = scale0 * az + scale1 * bz;
  out[3] = scale0 * aw + scale1 * bw;
  return out;
}
__name(slerp, "slerp");
function fromMat3(out, m) {
  var fTrace = m[0] + m[4] + m[8];
  var fRoot;
  if (fTrace > 0) {
    fRoot = Math.sqrt(fTrace + 1);
    out[3] = 0.5 * fRoot;
    fRoot = 0.5 / fRoot;
    out[0] = (m[5] - m[7]) * fRoot;
    out[1] = (m[6] - m[2]) * fRoot;
    out[2] = (m[1] - m[3]) * fRoot;
  } else {
    var i = 0;
    if (m[4] > m[0])
      i = 1;
    if (m[8] > m[i * 3 + i])
      i = 2;
    var j = (i + 1) % 3;
    var k = (i + 2) % 3;
    fRoot = Math.sqrt(m[i * 3 + i] - m[j * 3 + j] - m[k * 3 + k] + 1);
    out[i] = 0.5 * fRoot;
    fRoot = 0.5 / fRoot;
    out[3] = (m[j * 3 + k] - m[k * 3 + j]) * fRoot;
    out[j] = (m[j * 3 + i] + m[i * 3 + j]) * fRoot;
    out[k] = (m[k * 3 + i] + m[i * 3 + k]) * fRoot;
  }
  return out;
}
__name(fromMat3, "fromMat3");
var normalize$2 = normalize$3;
(function() {
  var tmpvec3 = create$4();
  var xUnitVec3 = fromValues$4(1, 0, 0);
  var yUnitVec3 = fromValues$4(0, 1, 0);
  return function(out, a, b) {
    var dot = dot$4(a, b);
    if (dot < -0.999999) {
      cross$2(tmpvec3, xUnitVec3, a);
      if (len$4(tmpvec3) < 1e-6)
        cross$2(tmpvec3, yUnitVec3, a);
      normalize$4(tmpvec3, tmpvec3);
      setAxisAngle(out, tmpvec3, Math.PI);
      return out;
    } else if (dot > 0.999999) {
      out[0] = 0;
      out[1] = 0;
      out[2] = 0;
      out[3] = 1;
      return out;
    } else {
      cross$2(tmpvec3, a, b);
      out[0] = tmpvec3[0];
      out[1] = tmpvec3[1];
      out[2] = tmpvec3[2];
      out[3] = 1 + dot;
      return normalize$2(out, out);
    }
  };
})();
(function() {
  var temp1 = create$2();
  var temp2 = create$2();
  return function(out, a, b, c, d, t) {
    slerp(temp1, a, d, t);
    slerp(temp2, b, c, t);
    slerp(out, temp1, temp2, 2 * t * (1 - t));
    return out;
  };
})();
(function() {
  var matr = create$6();
  return function(out, view, right, up) {
    matr[0] = right[0];
    matr[3] = right[1];
    matr[6] = right[2];
    matr[1] = up[0];
    matr[4] = up[1];
    matr[7] = up[2];
    matr[2] = -view[0];
    matr[5] = -view[1];
    matr[8] = -view[2];
    return normalize$2(out, fromMat3(out, matr));
  };
})();
function create() {
  var out = new ARRAY_TYPE(2);
  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
  }
  return out;
}
__name(create, "create");
(function() {
  var vec = create();
  return function(a, stride, offset, count, fn, arg) {
    var i, l;
    if (!stride) {
      stride = 2;
    }
    if (!offset) {
      offset = 0;
    }
    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }
    for (i = offset; i < l; i += stride) {
      vec[0] = a[i];
      vec[1] = a[i + 1];
      fn(vec, vec, arg);
      a[i] = vec[0];
      a[i + 1] = vec[1];
    }
    return a;
  };
})();
class AnimationControl {
  #animationData;
  #finishedPromise;
  #willFinish;
  static #voidControl = new AnimationControl(null);
  static get voidControl() {
    return this.#voidControl;
  }
  constructor(animationData, willFinish = false) {
    this.#animationData = animationData;
    this.#willFinish = willFinish;
    if (animationData !== null && typeof animationData === "object") {
      animationData.control = this;
    }
  }
  get finished() {
    if (!(this.#finishedPromise instanceof Promise)) {
      this.#finishedPromise = this.#willFinish ? new Promise((resolve2) => this.#animationData.resolve = resolve2) : Promise.resolve();
    }
    return this.#finishedPromise;
  }
  get isActive() {
    return this.#animationData.active;
  }
  get isFinished() {
    return this.#animationData.finished;
  }
  cancel() {
    const animationData = this.#animationData;
    if (animationData === null || animationData === void 0) {
      return;
    }
    animationData.cancelled = true;
  }
}
__name(AnimationControl, "AnimationControl");
class AnimationManager {
  static activeList = [];
  static newList = [];
  static current;
  static add(data) {
    const now2 = performance.now();
    data.start = now2 + (AnimationManager.current - now2);
    AnimationManager.newList.push(data);
  }
  static animate() {
    const current = AnimationManager.current = performance.now();
    if (AnimationManager.activeList.length === 0 && AnimationManager.newList.length === 0) {
      globalThis.requestAnimationFrame(AnimationManager.animate);
      return;
    }
    if (AnimationManager.newList.length) {
      for (let cntr = AnimationManager.newList.length; --cntr >= 0; ) {
        const data = AnimationManager.newList[cntr];
        if (data.cancelled) {
          AnimationManager.newList.splice(cntr, 1);
          data.cleanup(data);
        }
        if (data.active) {
          AnimationManager.newList.splice(cntr, 1);
          AnimationManager.activeList.push(data);
        }
      }
    }
    for (let cntr = AnimationManager.activeList.length; --cntr >= 0; ) {
      const data = AnimationManager.activeList[cntr];
      if (data.cancelled || data.el !== void 0 && !data.el.isConnected) {
        AnimationManager.activeList.splice(cntr, 1);
        data.cleanup(data);
        continue;
      }
      data.current = current - data.start;
      if (data.current >= data.duration) {
        for (let dataCntr = data.keys.length; --dataCntr >= 0; ) {
          const key = data.keys[dataCntr];
          data.newData[key] = data.destination[key];
        }
        data.position.set(data.newData);
        AnimationManager.activeList.splice(cntr, 1);
        data.cleanup(data);
        continue;
      }
      const easedTime = data.ease(data.current / data.duration);
      for (let dataCntr = data.keys.length; --dataCntr >= 0; ) {
        const key = data.keys[dataCntr];
        data.newData[key] = data.interpolate(data.initial[key], data.destination[key], easedTime);
      }
      data.position.set(data.newData);
    }
    globalThis.requestAnimationFrame(AnimationManager.animate);
  }
  static cancel(position) {
    for (let cntr = AnimationManager.activeList.length; --cntr >= 0; ) {
      const data = AnimationManager.activeList[cntr];
      if (data.position === position) {
        AnimationManager.activeList.splice(cntr, 1);
        data.cancelled = true;
        data.cleanup(data);
      }
    }
    for (let cntr = AnimationManager.newList.length; --cntr >= 0; ) {
      const data = AnimationManager.newList[cntr];
      if (data.position === position) {
        AnimationManager.newList.splice(cntr, 1);
        data.cancelled = true;
        data.cleanup(data);
      }
    }
  }
  static cancelAll() {
    for (let cntr = AnimationManager.activeList.length; --cntr >= 0; ) {
      const data = AnimationManager.activeList[cntr];
      data.cancelled = true;
      data.cleanup(data);
    }
    for (let cntr = AnimationManager.newList.length; --cntr >= 0; ) {
      const data = AnimationManager.newList[cntr];
      data.cancelled = true;
      data.cleanup(data);
    }
    AnimationManager.activeList.length = 0;
    AnimationManager.newList.length = 0;
  }
  static getScheduled(position) {
    const results = [];
    for (let cntr = AnimationManager.activeList.length; --cntr >= 0; ) {
      const data = AnimationManager.activeList[cntr];
      if (data.position === position) {
        results.push(data.control);
      }
    }
    for (let cntr = AnimationManager.newList.length; --cntr >= 0; ) {
      const data = AnimationManager.newList[cntr];
      if (data.position === position) {
        results.push(data.control);
      }
    }
    return results;
  }
}
__name(AnimationManager, "AnimationManager");
AnimationManager.animate();
const animateKeys = /* @__PURE__ */ new Set([
  "left",
  "top",
  "maxWidth",
  "maxHeight",
  "minWidth",
  "minHeight",
  "width",
  "height",
  "rotateX",
  "rotateY",
  "rotateZ",
  "scale",
  "translateX",
  "translateY",
  "translateZ",
  "zIndex",
  "rotation"
]);
const transformKeys = ["rotateX", "rotateY", "rotateZ", "scale", "translateX", "translateY", "translateZ"];
Object.freeze(transformKeys);
const relativeRegex = /^([-+*])=(-?[\d]*\.?[\d]+)$/;
const numericDefaults = {
  height: 0,
  left: 0,
  maxHeight: null,
  maxWidth: null,
  minHeight: null,
  minWidth: null,
  top: 0,
  transformOrigin: null,
  width: 0,
  zIndex: null,
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
  scale: 1,
  translateX: 0,
  translateY: 0,
  translateZ: 0,
  rotation: 0
};
Object.freeze(numericDefaults);
function setNumericDefaults(data) {
  if (data.rotateX === null) {
    data.rotateX = 0;
  }
  if (data.rotateY === null) {
    data.rotateY = 0;
  }
  if (data.rotateZ === null) {
    data.rotateZ = 0;
  }
  if (data.translateX === null) {
    data.translateX = 0;
  }
  if (data.translateY === null) {
    data.translateY = 0;
  }
  if (data.translateZ === null) {
    data.translateZ = 0;
  }
  if (data.scale === null) {
    data.scale = 1;
  }
  if (data.rotation === null) {
    data.rotation = 0;
  }
}
__name(setNumericDefaults, "setNumericDefaults");
const transformKeysBitwise = {
  rotateX: 1,
  rotateY: 2,
  rotateZ: 4,
  scale: 8,
  translateX: 16,
  translateY: 32,
  translateZ: 64
};
Object.freeze(transformKeysBitwise);
const transformOriginDefault = "top left";
const transformOrigins = [
  "top left",
  "top center",
  "top right",
  "center left",
  "center",
  "center right",
  "bottom left",
  "bottom center",
  "bottom right"
];
Object.freeze(transformOrigins);
function convertRelative(positionData, position) {
  for (const key in positionData) {
    if (animateKeys.has(key)) {
      const value = positionData[key];
      if (typeof value !== "string") {
        continue;
      }
      if (value === "auto" || value === "inherit") {
        continue;
      }
      const regexResults = relativeRegex.exec(value);
      if (!regexResults) {
        throw new Error(
          `convertRelative error: malformed relative key (${key}) with value (${value})`
        );
      }
      const current = position[key];
      switch (regexResults[1]) {
        case "-":
          positionData[key] = current - parseFloat(regexResults[2]);
          break;
        case "+":
          positionData[key] = current + parseFloat(regexResults[2]);
          break;
        case "*":
          positionData[key] = current * parseFloat(regexResults[2]);
          break;
      }
    }
  }
}
__name(convertRelative, "convertRelative");
class AnimationAPI {
  #data;
  #position;
  #instanceCount = 0;
  #cleanup;
  constructor(position, data) {
    this.#position = position;
    this.#data = data;
    this.#cleanup = this.#cleanupInstance.bind(this);
  }
  get isScheduled() {
    return this.#instanceCount > 0;
  }
  #addAnimation(initial, destination, duration, el, delay, ease, interpolate2) {
    setNumericDefaults(initial);
    setNumericDefaults(destination);
    for (const key in initial) {
      if (!Number.isFinite(initial[key])) {
        delete initial[key];
      }
    }
    const keys = Object.keys(initial);
    const newData = Object.assign({ immediateElementUpdate: true }, initial);
    if (keys.length === 0) {
      return AnimationControl.voidControl;
    }
    const animationData = {
      active: true,
      cleanup: this.#cleanup,
      cancelled: false,
      control: void 0,
      current: 0,
      destination,
      duration: duration * 1e3,
      ease,
      el,
      finished: false,
      initial,
      interpolate: interpolate2,
      keys,
      newData,
      position: this.#position,
      resolve: void 0,
      start: void 0
    };
    if (delay > 0) {
      animationData.active = false;
      setTimeout(() => {
        if (!animationData.cancelled) {
          animationData.active = true;
          const now2 = performance.now();
          animationData.start = now2 + (AnimationManager.current - now2);
        }
      }, delay * 1e3);
    }
    this.#instanceCount++;
    AnimationManager.add(animationData);
    return new AnimationControl(animationData, true);
  }
  cancel() {
    AnimationManager.cancel(this.#position);
  }
  #cleanupInstance(data) {
    this.#instanceCount--;
    data.active = false;
    data.finished = true;
    if (typeof data.resolve === "function") {
      data.resolve(data.cancelled);
    }
  }
  getScheduled() {
    return AnimationManager.getScheduled(this.#position);
  }
  from(fromData, { delay = 0, duration = 1, ease = cubicOut, interpolate: interpolate2 = lerp$5 } = {}) {
    if (!isObject$1(fromData)) {
      throw new TypeError(`AnimationAPI.from error: 'fromData' is not an object.`);
    }
    const position = this.#position;
    const parent = position.parent;
    if (parent !== void 0 && typeof parent?.options?.positionable === "boolean" && !parent?.options?.positionable) {
      return AnimationControl.voidControl;
    }
    const targetEl = parent instanceof HTMLElement ? parent : parent?.elementTarget;
    const el = targetEl instanceof HTMLElement && targetEl.isConnected ? targetEl : void 0;
    if (!Number.isFinite(delay) || delay < 0) {
      throw new TypeError(`AnimationAPI.from error: 'delay' is not a positive number.`);
    }
    if (!Number.isFinite(duration) || duration < 0) {
      throw new TypeError(`AnimationAPI.from error: 'duration' is not a positive number.`);
    }
    if (typeof ease !== "function") {
      throw new TypeError(`AnimationAPI.from error: 'ease' is not a function.`);
    }
    if (typeof interpolate2 !== "function") {
      throw new TypeError(`AnimationAPI.from error: 'interpolate' is not a function.`);
    }
    const initial = {};
    const destination = {};
    const data = this.#data;
    for (const key in fromData) {
      if (data[key] !== void 0 && fromData[key] !== data[key]) {
        initial[key] = fromData[key];
        destination[key] = data[key];
      }
    }
    convertRelative(initial, data);
    return this.#addAnimation(initial, destination, duration, el, delay, ease, interpolate2);
  }
  fromTo(fromData, toData, { delay = 0, duration = 1, ease = cubicOut, interpolate: interpolate2 = lerp$5 } = {}) {
    if (!isObject$1(fromData)) {
      throw new TypeError(`AnimationAPI.fromTo error: 'fromData' is not an object.`);
    }
    if (!isObject$1(toData)) {
      throw new TypeError(`AnimationAPI.fromTo error: 'toData' is not an object.`);
    }
    const parent = this.#position.parent;
    if (parent !== void 0 && typeof parent?.options?.positionable === "boolean" && !parent?.options?.positionable) {
      return AnimationControl.voidControl;
    }
    const targetEl = parent instanceof HTMLElement ? parent : parent?.elementTarget;
    const el = targetEl instanceof HTMLElement && targetEl.isConnected ? targetEl : void 0;
    if (!Number.isFinite(delay) || delay < 0) {
      throw new TypeError(`AnimationAPI.fromTo error: 'delay' is not a positive number.`);
    }
    if (!Number.isFinite(duration) || duration < 0) {
      throw new TypeError(`AnimationAPI.fromTo error: 'duration' is not a positive number.`);
    }
    if (typeof ease !== "function") {
      throw new TypeError(`AnimationAPI.fromTo error: 'ease' is not a function.`);
    }
    if (typeof interpolate2 !== "function") {
      throw new TypeError(`AnimationAPI.fromTo error: 'interpolate' is not a function.`);
    }
    const initial = {};
    const destination = {};
    const data = this.#data;
    for (const key in fromData) {
      if (toData[key] === void 0) {
        console.warn(
          `AnimationAPI.fromTo warning: key ('${key}') from 'fromData' missing in 'toData'; skipping this key.`
        );
        continue;
      }
      if (data[key] !== void 0) {
        initial[key] = fromData[key];
        destination[key] = toData[key];
      }
    }
    convertRelative(initial, data);
    convertRelative(destination, data);
    return this.#addAnimation(initial, destination, duration, el, delay, ease, interpolate2);
  }
  to(toData, { delay = 0, duration = 1, ease = cubicOut, interpolate: interpolate2 = lerp$5 } = {}) {
    if (!isObject$1(toData)) {
      throw new TypeError(`AnimationAPI.to error: 'toData' is not an object.`);
    }
    const parent = this.#position.parent;
    if (parent !== void 0 && typeof parent?.options?.positionable === "boolean" && !parent?.options?.positionable) {
      return AnimationControl.voidControl;
    }
    const targetEl = parent instanceof HTMLElement ? parent : parent?.elementTarget;
    const el = targetEl instanceof HTMLElement && targetEl.isConnected ? targetEl : void 0;
    if (!Number.isFinite(delay) || delay < 0) {
      throw new TypeError(`AnimationAPI.to error: 'delay' is not a positive number.`);
    }
    if (!Number.isFinite(duration) || duration < 0) {
      throw new TypeError(`AnimationAPI.to error: 'duration' is not a positive number.`);
    }
    if (typeof ease !== "function") {
      throw new TypeError(`AnimationAPI.to error: 'ease' is not a function.`);
    }
    if (typeof interpolate2 !== "function") {
      throw new TypeError(`AnimationAPI.to error: 'interpolate' is not a function.`);
    }
    const initial = {};
    const destination = {};
    const data = this.#data;
    for (const key in toData) {
      if (data[key] !== void 0 && toData[key] !== data[key]) {
        destination[key] = toData[key];
        initial[key] = data[key];
      }
    }
    convertRelative(destination, data);
    return this.#addAnimation(initial, destination, duration, el, delay, ease, interpolate2);
  }
  quickTo(keys, { duration = 1, ease = cubicOut, interpolate: interpolate2 = lerp$5 } = {}) {
    if (!isIterable(keys)) {
      throw new TypeError(`AnimationAPI.quickTo error: 'keys' is not an iterable list.`);
    }
    const parent = this.#position.parent;
    if (parent !== void 0 && typeof parent?.options?.positionable === "boolean" && !parent?.options?.positionable) {
      throw new Error(`AnimationAPI.quickTo error: 'parent' is not positionable.`);
    }
    if (!Number.isFinite(duration) || duration < 0) {
      throw new TypeError(`AnimationAPI.quickTo error: 'duration' is not a positive number.`);
    }
    if (typeof ease !== "function") {
      throw new TypeError(`AnimationAPI.quickTo error: 'ease' is not a function.`);
    }
    if (typeof interpolate2 !== "function") {
      throw new TypeError(`AnimationAPI.quickTo error: 'interpolate' is not a function.`);
    }
    const initial = {};
    const destination = {};
    const data = this.#data;
    for (const key of keys) {
      if (typeof key !== "string") {
        throw new TypeError(`AnimationAPI.quickTo error: key is not a string.`);
      }
      if (!animateKeys.has(key)) {
        throw new Error(`AnimationAPI.quickTo error: key ('${key}') is not animatable.`);
      }
      if (data[key] !== void 0) {
        destination[key] = data[key];
        initial[key] = data[key];
      }
    }
    const keysArray = [...keys];
    Object.freeze(keysArray);
    const newData = Object.assign({ immediateElementUpdate: true }, initial);
    const animationData = {
      active: true,
      cleanup: this.#cleanup,
      cancelled: false,
      control: void 0,
      current: 0,
      destination,
      duration: duration * 1e3,
      ease,
      el: void 0,
      finished: true,
      initial,
      interpolate: interpolate2,
      keys,
      newData,
      position: this.#position,
      resolve: void 0,
      start: void 0
    };
    const quickToCB = /* @__PURE__ */ __name((...args) => {
      const argsLength = args.length;
      if (argsLength === 0) {
        return;
      }
      for (let cntr = keysArray.length; --cntr >= 0; ) {
        const key = keysArray[cntr];
        if (data[key] !== void 0) {
          initial[key] = data[key];
        }
      }
      if (isObject$1(args[0])) {
        const objData = args[0];
        for (const key in objData) {
          if (destination[key] !== void 0) {
            destination[key] = objData[key];
          }
        }
      } else {
        for (let cntr = 0; cntr < argsLength && cntr < keysArray.length; cntr++) {
          const key = keysArray[cntr];
          if (destination[key] !== void 0) {
            destination[key] = args[cntr];
          }
        }
      }
      convertRelative(destination, data);
      setNumericDefaults(initial);
      setNumericDefaults(destination);
      const targetEl = parent instanceof HTMLElement ? parent : parent?.elementTarget;
      animationData.el = targetEl instanceof HTMLElement && targetEl.isConnected ? targetEl : void 0;
      if (animationData.finished) {
        animationData.finished = false;
        animationData.active = true;
        animationData.current = 0;
        this.#instanceCount++;
        AnimationManager.add(animationData);
      } else {
        const now2 = performance.now();
        animationData.start = now2 + (AnimationManager.current - now2);
        animationData.current = 0;
      }
    }, "quickToCB");
    quickToCB.keys = keysArray;
    quickToCB.options = ({ duration: duration2, ease: ease2, interpolate: interpolate3 } = {}) => {
      if (duration2 !== void 0 && (!Number.isFinite(duration2) || duration2 < 0)) {
        throw new TypeError(`AnimationAPI.quickTo.options error: 'duration' is not a positive number.`);
      }
      if (ease2 !== void 0 && typeof ease2 !== "function") {
        throw new TypeError(`AnimationAPI.quickTo.options error: 'ease' is not a function.`);
      }
      if (interpolate3 !== void 0 && typeof interpolate3 !== "function") {
        throw new TypeError(`AnimationAPI.quickTo.options error: 'interpolate' is not a function.`);
      }
      if (duration2 >= 0) {
        animationData.duration = duration2 * 1e3;
      }
      if (ease2) {
        animationData.ease = ease2;
      }
      if (interpolate3) {
        animationData.interpolate = interpolate3;
      }
      return quickToCB;
    };
    return quickToCB;
  }
}
__name(AnimationAPI, "AnimationAPI");
class AnimationGroupControl {
  #animationControls;
  #finishedPromise;
  static #voidControl = new AnimationGroupControl(null);
  static get voidControl() {
    return this.#voidControl;
  }
  constructor(animationControls) {
    this.#animationControls = animationControls;
  }
  get finished() {
    const animationControls = this.#animationControls;
    if (animationControls === null || animationControls === void 0) {
      return Promise.resolve();
    }
    if (!(this.#finishedPromise instanceof Promise)) {
      const promises = [];
      for (let cntr = animationControls.length; --cntr >= 0; ) {
        promises.push(animationControls[cntr].finished);
      }
      this.#finishedPromise = Promise.all(promises);
    }
    return this.#finishedPromise;
  }
  get isActive() {
    const animationControls = this.#animationControls;
    if (animationControls === null || animationControls === void 0) {
      return false;
    }
    for (let cntr = animationControls.length; --cntr >= 0; ) {
      if (animationControls[cntr].isActive) {
        return true;
      }
    }
    return false;
  }
  get isFinished() {
    const animationControls = this.#animationControls;
    if (animationControls === null || animationControls === void 0) {
      return true;
    }
    for (let cntr = animationControls.length; --cntr >= 0; ) {
      if (!animationControls[cntr].isFinished) {
        return false;
      }
    }
    return false;
  }
  cancel() {
    const animationControls = this.#animationControls;
    if (animationControls === null || animationControls === void 0) {
      return;
    }
    for (let cntr = this.#animationControls.length; --cntr >= 0; ) {
      this.#animationControls[cntr].cancel();
    }
  }
}
__name(AnimationGroupControl, "AnimationGroupControl");
class AnimationGroupAPI {
  static #isPosition(object) {
    return object !== null && typeof object === "object" && object.animate instanceof AnimationAPI;
  }
  static cancel(position) {
    if (isIterable(position)) {
      let index2 = -1;
      for (const entry of position) {
        index2++;
        const actualPosition = this.#isPosition(entry) ? entry : entry.position;
        if (!this.#isPosition(actualPosition)) {
          console.warn(`AnimationGroupAPI.cancel warning: No Position instance found at index: ${index2}.`);
          continue;
        }
        AnimationManager.cancel(actualPosition);
      }
    } else {
      const actualPosition = this.#isPosition(position) ? position : position.position;
      if (!this.#isPosition(actualPosition)) {
        console.warn(`AnimationGroupAPI.cancel warning: No Position instance found.`);
        return;
      }
      AnimationManager.cancel(actualPosition);
    }
  }
  static cancelAll() {
    AnimationManager.cancelAll();
  }
  static getScheduled(position) {
    const results = [];
    if (isIterable(position)) {
      let index2 = -1;
      for (const entry of position) {
        index2++;
        const isPosition = this.#isPosition(entry);
        const actualPosition = isPosition ? entry : entry.position;
        if (!this.#isPosition(actualPosition)) {
          console.warn(`AnimationGroupAPI.getScheduled warning: No Position instance found at index: ${index2}.`);
          continue;
        }
        const controls = AnimationManager.getScheduled(actualPosition);
        results.push({ position: actualPosition, data: isPosition ? void 0 : entry, controls });
      }
    } else {
      const isPosition = this.#isPosition(position);
      const actualPosition = isPosition ? position : position.position;
      if (!this.#isPosition(actualPosition)) {
        console.warn(`AnimationGroupAPI.getScheduled warning: No Position instance found.`);
        return results;
      }
      const controls = AnimationManager.getScheduled(actualPosition);
      results.push({ position: actualPosition, data: isPosition ? void 0 : position, controls });
    }
    return results;
  }
  static from(position, fromData, options) {
    if (!isObject$1(fromData) && typeof fromData !== "function") {
      throw new TypeError(`AnimationGroupAPI.from error: 'fromData' is not an object or function.`);
    }
    if (options !== void 0 && !isObject$1(options) && typeof options !== "function") {
      throw new TypeError(`AnimationGroupAPI.from error: 'options' is not an object or function.`);
    }
    const animationControls = [];
    let index2 = -1;
    let callbackOptions;
    const hasDataCallback = typeof fromData === "function";
    const hasOptionCallback = typeof options === "function";
    const hasCallback = hasDataCallback || hasOptionCallback;
    if (hasCallback) {
      callbackOptions = { index: index2, position: void 0, data: void 0 };
    }
    let actualFromData = fromData;
    let actualOptions = options;
    if (isIterable(position)) {
      for (const entry of position) {
        index2++;
        const isPosition = this.#isPosition(entry);
        const actualPosition = isPosition ? entry : entry.position;
        if (!this.#isPosition(actualPosition)) {
          console.warn(`AnimationGroupAPI.from warning: No Position instance found at index: ${index2}.`);
          continue;
        }
        if (hasCallback) {
          callbackOptions.index = index2;
          callbackOptions.position = position;
          callbackOptions.data = isPosition ? void 0 : entry;
        }
        if (hasDataCallback) {
          actualFromData = fromData(callbackOptions);
          if (actualFromData === null || actualFromData === void 0) {
            continue;
          }
          if (typeof actualFromData !== "object") {
            throw new TypeError(`AnimationGroupAPI.from error: fromData callback function iteration(${index2}) failed to return an object.`);
          }
        }
        if (hasOptionCallback) {
          actualOptions = options(callbackOptions);
          if (actualOptions === null || actualOptions === void 0) {
            continue;
          }
          if (typeof actualOptions !== "object") {
            throw new TypeError(`AnimationGroupAPI.from error: options callback function iteration(${index2}) failed to return an object.`);
          }
        }
        animationControls.push(actualPosition.animate.from(actualFromData, actualOptions));
      }
    } else {
      const isPosition = this.#isPosition(position);
      const actualPosition = isPosition ? position : position.position;
      if (!this.#isPosition(actualPosition)) {
        console.warn(`AnimationGroupAPI.from warning: No Position instance found.`);
        return AnimationGroupControl.voidControl;
      }
      if (hasCallback) {
        callbackOptions.index = 0;
        callbackOptions.position = position;
        callbackOptions.data = isPosition ? void 0 : position;
      }
      if (hasDataCallback) {
        actualFromData = fromData(callbackOptions);
        if (typeof actualFromData !== "object") {
          throw new TypeError(
            `AnimationGroupAPI.from error: fromData callback function failed to return an object.`
          );
        }
      }
      if (hasOptionCallback) {
        actualOptions = options(callbackOptions);
        if (typeof actualOptions !== "object") {
          throw new TypeError(
            `AnimationGroupAPI.from error: options callback function failed to return an object.`
          );
        }
      }
      animationControls.push(actualPosition.animate.from(actualFromData, actualOptions));
    }
    return new AnimationGroupControl(animationControls);
  }
  static fromTo(position, fromData, toData, options) {
    if (!isObject$1(fromData) && typeof fromData !== "function") {
      throw new TypeError(`AnimationGroupAPI.fromTo error: 'fromData' is not an object or function.`);
    }
    if (!isObject$1(toData) && typeof toData !== "function") {
      throw new TypeError(`AnimationGroupAPI.fromTo error: 'toData' is not an object or function.`);
    }
    if (options !== void 0 && !isObject$1(options) && typeof options !== "function") {
      throw new TypeError(`AnimationGroupAPI.fromTo error: 'options' is not an object or function.`);
    }
    const animationControls = [];
    let index2 = -1;
    let callbackOptions;
    const hasFromCallback = typeof fromData === "function";
    const hasToCallback = typeof toData === "function";
    const hasOptionCallback = typeof options === "function";
    const hasCallback = hasFromCallback || hasToCallback || hasOptionCallback;
    if (hasCallback) {
      callbackOptions = { index: index2, position: void 0, data: void 0 };
    }
    let actualFromData = fromData;
    let actualToData = toData;
    let actualOptions = options;
    if (isIterable(position)) {
      for (const entry of position) {
        index2++;
        const isPosition = this.#isPosition(entry);
        const actualPosition = isPosition ? entry : entry.position;
        if (!this.#isPosition(actualPosition)) {
          console.warn(`AnimationGroupAPI.fromTo warning: No Position instance found at index: ${index2}.`);
          continue;
        }
        if (hasCallback) {
          callbackOptions.index = index2;
          callbackOptions.position = position;
          callbackOptions.data = isPosition ? void 0 : entry;
        }
        if (hasFromCallback) {
          actualFromData = fromData(callbackOptions);
          if (actualFromData === null || actualFromData === void 0) {
            continue;
          }
          if (typeof actualFromData !== "object") {
            throw new TypeError(`AnimationGroupAPI.fromTo error: fromData callback function iteration(${index2}) failed to return an object.`);
          }
        }
        if (hasToCallback) {
          actualToData = toData(callbackOptions);
          if (actualToData === null || actualToData === void 0) {
            continue;
          }
          if (typeof actualToData !== "object") {
            throw new TypeError(`AnimationGroupAPI.fromTo error: toData callback function iteration(${index2}) failed to return an object.`);
          }
        }
        if (hasOptionCallback) {
          actualOptions = options(callbackOptions);
          if (actualOptions === null || actualOptions === void 0) {
            continue;
          }
          if (typeof actualOptions !== "object") {
            throw new TypeError(`AnimationGroupAPI.fromTo error: options callback function iteration(${index2}) failed to return an object.`);
          }
        }
        animationControls.push(actualPosition.animate.fromTo(actualFromData, actualToData, actualOptions));
      }
    } else {
      const isPosition = this.#isPosition(position);
      const actualPosition = isPosition ? position : position.position;
      if (!this.#isPosition(actualPosition)) {
        console.warn(`AnimationGroupAPI.fromTo warning: No Position instance found.`);
        return AnimationGroupControl.voidControl;
      }
      if (hasCallback) {
        callbackOptions.index = 0;
        callbackOptions.position = position;
        callbackOptions.data = isPosition ? void 0 : position;
      }
      if (hasFromCallback) {
        actualFromData = fromData(callbackOptions);
        if (typeof actualFromData !== "object") {
          throw new TypeError(
            `AnimationGroupAPI.fromTo error: fromData callback function failed to return an object.`
          );
        }
      }
      if (hasToCallback) {
        actualToData = toData(callbackOptions);
        if (typeof actualToData !== "object") {
          throw new TypeError(
            `AnimationGroupAPI.fromTo error: toData callback function failed to return an object.`
          );
        }
      }
      if (hasOptionCallback) {
        actualOptions = options(callbackOptions);
        if (typeof actualOptions !== "object") {
          throw new TypeError(
            `AnimationGroupAPI.fromTo error: options callback function failed to return an object.`
          );
        }
      }
      animationControls.push(actualPosition.animate.fromTo(actualFromData, actualToData, actualOptions));
    }
    return new AnimationGroupControl(animationControls);
  }
  static to(position, toData, options) {
    if (!isObject$1(toData) && typeof toData !== "function") {
      throw new TypeError(`AnimationGroupAPI.to error: 'toData' is not an object or function.`);
    }
    if (options !== void 0 && !isObject$1(options) && typeof options !== "function") {
      throw new TypeError(`AnimationGroupAPI.to error: 'options' is not an object or function.`);
    }
    const animationControls = [];
    let index2 = -1;
    let callbackOptions;
    const hasDataCallback = typeof toData === "function";
    const hasOptionCallback = typeof options === "function";
    const hasCallback = hasDataCallback || hasOptionCallback;
    if (hasCallback) {
      callbackOptions = { index: index2, position: void 0, data: void 0 };
    }
    let actualToData = toData;
    let actualOptions = options;
    if (isIterable(position)) {
      for (const entry of position) {
        index2++;
        const isPosition = this.#isPosition(entry);
        const actualPosition = isPosition ? entry : entry.position;
        if (!this.#isPosition(actualPosition)) {
          console.warn(`AnimationGroupAPI.to warning: No Position instance found at index: ${index2}.`);
          continue;
        }
        if (hasCallback) {
          callbackOptions.index = index2;
          callbackOptions.position = position;
          callbackOptions.data = isPosition ? void 0 : entry;
        }
        if (hasDataCallback) {
          actualToData = toData(callbackOptions);
          if (actualToData === null || actualToData === void 0) {
            continue;
          }
          if (typeof actualToData !== "object") {
            throw new TypeError(`AnimationGroupAPI.to error: toData callback function iteration(${index2}) failed to return an object.`);
          }
        }
        if (hasOptionCallback) {
          actualOptions = options(callbackOptions);
          if (actualOptions === null || actualOptions === void 0) {
            continue;
          }
          if (typeof actualOptions !== "object") {
            throw new TypeError(`AnimationGroupAPI.to error: options callback function iteration(${index2}) failed to return an object.`);
          }
        }
        animationControls.push(actualPosition.animate.to(actualToData, actualOptions));
      }
    } else {
      const isPosition = this.#isPosition(position);
      const actualPosition = isPosition ? position : position.position;
      if (!this.#isPosition(actualPosition)) {
        console.warn(`AnimationGroupAPI.to warning: No Position instance found.`);
        return AnimationGroupControl.voidControl;
      }
      if (hasCallback) {
        callbackOptions.index = 0;
        callbackOptions.position = position;
        callbackOptions.data = isPosition ? void 0 : position;
      }
      if (hasDataCallback) {
        actualToData = toData(callbackOptions);
        if (typeof actualToData !== "object") {
          throw new TypeError(
            `AnimationGroupAPI.to error: toData callback function failed to return an object.`
          );
        }
      }
      if (hasOptionCallback) {
        actualOptions = options(callbackOptions);
        if (typeof actualOptions !== "object") {
          throw new TypeError(
            `AnimationGroupAPI.to error: options callback function failed to return an object.`
          );
        }
      }
      animationControls.push(actualPosition.animate.to(actualToData, actualOptions));
    }
    return new AnimationGroupControl(animationControls);
  }
  static quickTo(position, keys, options) {
    if (!isIterable(keys)) {
      throw new TypeError(`AnimationGroupAPI.quickTo error: 'keys' is not an iterable list.`);
    }
    if (options !== void 0 && !isObject$1(options) && typeof options !== "function") {
      throw new TypeError(`AnimationGroupAPI.quickTo error: 'options' is not an object or function.`);
    }
    const quickToCallbacks = [];
    let index2 = -1;
    const hasOptionCallback = typeof options === "function";
    const callbackOptions = { index: index2, position: void 0, data: void 0 };
    let actualOptions = options;
    if (isIterable(position)) {
      for (const entry of position) {
        index2++;
        const isPosition = this.#isPosition(entry);
        const actualPosition = isPosition ? entry : entry.position;
        if (!this.#isPosition(actualPosition)) {
          console.warn(`AnimationGroupAPI.quickTo warning: No Position instance found at index: ${index2}.`);
          continue;
        }
        callbackOptions.index = index2;
        callbackOptions.position = position;
        callbackOptions.data = isPosition ? void 0 : entry;
        if (hasOptionCallback) {
          actualOptions = options(callbackOptions);
          if (actualOptions === null || actualOptions === void 0) {
            continue;
          }
          if (typeof actualOptions !== "object") {
            throw new TypeError(`AnimationGroupAPI.quickTo error: options callback function iteration(${index2}) failed to return an object.`);
          }
        }
        quickToCallbacks.push(actualPosition.animate.quickTo(keys, actualOptions));
      }
    } else {
      const isPosition = this.#isPosition(position);
      const actualPosition = isPosition ? position : position.position;
      if (!this.#isPosition(actualPosition)) {
        console.warn(`AnimationGroupAPI.quickTo warning: No Position instance found.`);
        return () => null;
      }
      callbackOptions.index = 0;
      callbackOptions.position = position;
      callbackOptions.data = isPosition ? void 0 : position;
      if (hasOptionCallback) {
        actualOptions = options(callbackOptions);
        if (typeof actualOptions !== "object") {
          throw new TypeError(
            `AnimationGroupAPI.quickTo error: options callback function failed to return an object.`
          );
        }
      }
      quickToCallbacks.push(actualPosition.animate.quickTo(keys, actualOptions));
    }
    const keysArray = [...keys];
    Object.freeze(keysArray);
    const quickToCB = /* @__PURE__ */ __name((...args) => {
      const argsLength = args.length;
      if (argsLength === 0) {
        return;
      }
      if (typeof args[0] === "function") {
        const dataCallback = args[0];
        index2 = -1;
        let cntr = 0;
        if (isIterable(position)) {
          for (const entry of position) {
            index2++;
            const isPosition = this.#isPosition(entry);
            const actualPosition = isPosition ? entry : entry.position;
            if (!this.#isPosition(actualPosition)) {
              continue;
            }
            callbackOptions.index = index2;
            callbackOptions.position = position;
            callbackOptions.data = isPosition ? void 0 : entry;
            const toData = dataCallback(callbackOptions);
            if (toData === null || toData === void 0) {
              continue;
            }
            const toDataIterable = isIterable(toData);
            if (!Number.isFinite(toData) && !toDataIterable && typeof toData !== "object") {
              throw new TypeError(`AnimationGroupAPI.quickTo error: toData callback function iteration(${index2}) failed to return a finite number, iterable list, or object.`);
            }
            if (toDataIterable) {
              quickToCallbacks[cntr++](...toData);
            } else {
              quickToCallbacks[cntr++](toData);
            }
          }
        } else {
          const isPosition = this.#isPosition(position);
          const actualPosition = isPosition ? position : position.position;
          if (!this.#isPosition(actualPosition)) {
            return;
          }
          callbackOptions.index = 0;
          callbackOptions.position = position;
          callbackOptions.data = isPosition ? void 0 : position;
          const toData = dataCallback(callbackOptions);
          if (toData === null || toData === void 0) {
            return;
          }
          const toDataIterable = isIterable(toData);
          if (!Number.isFinite(toData) && !toDataIterable && typeof toData !== "object") {
            throw new TypeError(`AnimationGroupAPI.quickTo error: toData callback function iteration(${index2}) failed to return a finite number, iterable list, or object.`);
          }
          if (toDataIterable) {
            quickToCallbacks[cntr++](...toData);
          } else {
            quickToCallbacks[cntr++](toData);
          }
        }
      } else {
        for (let cntr = quickToCallbacks.length; --cntr >= 0; ) {
          quickToCallbacks[cntr](...args);
        }
      }
    }, "quickToCB");
    quickToCB.keys = keysArray;
    quickToCB.options = (options2) => {
      if (options2 !== void 0 && !isObject$1(options2) && typeof options2 !== "function") {
        throw new TypeError(`AnimationGroupAPI.quickTo error: 'options' is not an object or function.`);
      }
      if (isObject$1(options2)) {
        for (let cntr = quickToCallbacks.length; --cntr >= 0; ) {
          quickToCallbacks[cntr].options(options2);
        }
      } else if (typeof options2 === "function") {
        if (isIterable(position)) {
          index2 = -1;
          let cntr = 0;
          for (const entry of position) {
            index2++;
            const isPosition = this.#isPosition(entry);
            const actualPosition = isPosition ? entry : entry.position;
            if (!this.#isPosition(actualPosition)) {
              console.warn(
                `AnimationGroupAPI.quickTo.options warning: No Position instance found at index: ${index2}.`
              );
              continue;
            }
            callbackOptions.index = index2;
            callbackOptions.position = position;
            callbackOptions.data = isPosition ? void 0 : entry;
            actualOptions = options2(callbackOptions);
            if (actualOptions === null || actualOptions === void 0) {
              continue;
            }
            if (typeof actualOptions !== "object") {
              throw new TypeError(
                `AnimationGroupAPI.quickTo.options error: options callback function iteration(${index2}) failed to return an object.`
              );
            }
            quickToCallbacks[cntr++].options(actualOptions);
          }
        } else {
          const isPosition = this.#isPosition(position);
          const actualPosition = isPosition ? position : position.position;
          if (!this.#isPosition(actualPosition)) {
            console.warn(`AnimationGroupAPI.quickTo.options warning: No Position instance found.`);
            return quickToCB;
          }
          callbackOptions.index = 0;
          callbackOptions.position = position;
          callbackOptions.data = isPosition ? void 0 : position;
          actualOptions = options2(callbackOptions);
          if (typeof actualOptions !== "object") {
            throw new TypeError(
              `AnimationGroupAPI.quickTo error: options callback function failed to return an object.`
            );
          }
          quickToCallbacks[0].options(actualOptions);
        }
      }
      return quickToCB;
    };
    return quickToCB;
  }
}
__name(AnimationGroupAPI, "AnimationGroupAPI");
class Centered {
  #element;
  #height;
  #lock;
  #width;
  constructor({ element: element2, lock = false, width, height } = {}) {
    this.element = element2;
    this.width = width;
    this.height = height;
    this.#lock = typeof lock === "boolean" ? lock : false;
  }
  get element() {
    return this.#element;
  }
  get height() {
    return this.#height;
  }
  get width() {
    return this.#width;
  }
  set element(element2) {
    if (this.#lock) {
      return;
    }
    if (element2 === void 0 || element2 === null || element2 instanceof HTMLElement) {
      this.#element = element2;
    } else {
      throw new TypeError(`'element' is not a HTMLElement, undefined, or null.`);
    }
  }
  set height(height) {
    if (this.#lock) {
      return;
    }
    if (height === void 0 || Number.isFinite(height)) {
      this.#height = height;
    } else {
      throw new TypeError(`'height' is not a finite number or undefined.`);
    }
  }
  set width(width) {
    if (this.#lock) {
      return;
    }
    if (width === void 0 || Number.isFinite(width)) {
      this.#width = width;
    } else {
      throw new TypeError(`'width' is not a finite number or undefined.`);
    }
  }
  setDimension(width, height) {
    if (this.#lock) {
      return;
    }
    if (width === void 0 || Number.isFinite(width)) {
      this.#width = width;
    } else {
      throw new TypeError(`'width' is not a finite number or undefined.`);
    }
    if (height === void 0 || Number.isFinite(height)) {
      this.#height = height;
    } else {
      throw new TypeError(`'height' is not a finite number or undefined.`);
    }
  }
  getLeft(width) {
    const boundsWidth = this.#width ?? this.#element?.offsetWidth ?? globalThis.innerWidth;
    return (boundsWidth - width) / 2;
  }
  getTop(height) {
    const boundsHeight = this.#height ?? this.#element?.offsetHeight ?? globalThis.innerHeight;
    return (boundsHeight - height) / 2;
  }
}
__name(Centered, "Centered");
const browserCentered = new Centered();
const positionInitial = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  browserCentered,
  Centered
}, Symbol.toStringTag, { value: "Module" }));
class PositionChangeSet {
  constructor() {
    this.left = false;
    this.top = false;
    this.width = false;
    this.height = false;
    this.maxHeight = false;
    this.maxWidth = false;
    this.minHeight = false;
    this.minWidth = false;
    this.zIndex = false;
    this.transform = false;
    this.transformOrigin = false;
  }
  hasChange() {
    return this.left || this.top || this.width || this.height || this.maxHeight || this.maxWidth || this.minHeight || this.minWidth || this.zIndex || this.transform || this.transformOrigin;
  }
  set(value) {
    this.left = value;
    this.top = value;
    this.width = value;
    this.height = value;
    this.maxHeight = value;
    this.maxWidth = value;
    this.minHeight = value;
    this.minWidth = value;
    this.zIndex = value;
    this.transform = value;
    this.transformOrigin = value;
  }
}
__name(PositionChangeSet, "PositionChangeSet");
class PositionData {
  constructor({
    height = null,
    left = null,
    maxHeight = null,
    maxWidth = null,
    minHeight = null,
    minWidth = null,
    rotateX = null,
    rotateY = null,
    rotateZ = null,
    scale = null,
    translateX = null,
    translateY = null,
    translateZ = null,
    top = null,
    transformOrigin = null,
    width = null,
    zIndex = null
  } = {}) {
    this.height = height;
    this.left = left;
    this.maxHeight = maxHeight;
    this.maxWidth = maxWidth;
    this.minHeight = minHeight;
    this.minWidth = minWidth;
    this.rotateX = rotateX;
    this.rotateY = rotateY;
    this.rotateZ = rotateZ;
    this.scale = scale;
    this.top = top;
    this.transformOrigin = transformOrigin;
    this.translateX = translateX;
    this.translateY = translateY;
    this.translateZ = translateZ;
    this.width = width;
    this.zIndex = zIndex;
    Object.seal(this);
  }
  copy(data) {
    this.height = data.height;
    this.left = data.left;
    this.maxHeight = data.maxHeight;
    this.maxWidth = data.maxWidth;
    this.minHeight = data.minHeight;
    this.minWidth = data.minWidth;
    this.rotateX = data.rotateX;
    this.rotateY = data.rotateY;
    this.rotateZ = data.rotateZ;
    this.scale = data.scale;
    this.top = data.top;
    this.transformOrigin = data.transformOrigin;
    this.translateX = data.translateX;
    this.translateY = data.translateY;
    this.translateZ = data.translateZ;
    this.width = data.width;
    this.zIndex = data.zIndex;
    return this;
  }
}
__name(PositionData, "PositionData");
class PositionStateAPI {
  #data;
  #dataSaved = /* @__PURE__ */ new Map();
  #position;
  #transforms;
  constructor(position, data, transforms) {
    this.#position = position;
    this.#data = data;
    this.#transforms = transforms;
  }
  get({ name }) {
    if (typeof name !== "string") {
      throw new TypeError(`Position - getSave error: 'name' is not a string.`);
    }
    return this.#dataSaved.get(name);
  }
  getDefault() {
    return this.#dataSaved.get("#defaultData");
  }
  remove({ name }) {
    if (typeof name !== "string") {
      throw new TypeError(`Position - remove: 'name' is not a string.`);
    }
    const data = this.#dataSaved.get(name);
    this.#dataSaved.delete(name);
    return data;
  }
  reset({ keepZIndex = false, invokeSet = true } = {}) {
    const defaultData = this.#dataSaved.get("#defaultData");
    if (typeof defaultData !== "object") {
      return false;
    }
    if (this.#position.animate.isScheduled) {
      this.#position.animate.cancel();
    }
    const zIndex = this.#position.zIndex;
    const data = Object.assign({}, defaultData);
    if (keepZIndex) {
      data.zIndex = zIndex;
    }
    this.#transforms.reset(data);
    if (this.#position.parent?.reactive?.minimized) {
      this.#position.parent?.maximize?.({ animate: false, duration: 0 });
    }
    if (invokeSet) {
      setTimeout(() => this.#position.set(data), 0);
    }
    return true;
  }
  restore({
    name,
    remove = false,
    properties,
    silent = false,
    async = false,
    animateTo = false,
    duration = 0.1,
    ease = identity,
    interpolate: interpolate2 = lerp$5
  }) {
    if (typeof name !== "string") {
      throw new TypeError(`Position - restore error: 'name' is not a string.`);
    }
    const dataSaved = this.#dataSaved.get(name);
    if (dataSaved) {
      if (remove) {
        this.#dataSaved.delete(name);
      }
      let data = dataSaved;
      if (isIterable(properties)) {
        data = {};
        for (const property of properties) {
          data[property] = dataSaved[property];
        }
      }
      if (silent) {
        for (const property in data) {
          this.#data[property] = data[property];
        }
        return dataSaved;
      } else if (animateTo) {
        if (data.transformOrigin !== this.#position.transformOrigin) {
          this.#position.transformOrigin = data.transformOrigin;
        }
        if (async) {
          return this.#position.animate.to(data, { duration, ease, interpolate: interpolate2 }).finished.then(() => dataSaved);
        } else {
          this.#position.animate.to(data, { duration, ease, interpolate: interpolate2 });
        }
      } else {
        this.#position.set(data);
      }
    }
    return dataSaved;
  }
  save({ name, ...extra }) {
    if (typeof name !== "string") {
      throw new TypeError(`Position - save error: 'name' is not a string.`);
    }
    const data = this.#position.get(extra);
    this.#dataSaved.set(name, data);
    return data;
  }
  set({ name, ...data }) {
    if (typeof name !== "string") {
      throw new TypeError(`Position - set error: 'name' is not a string.`);
    }
    this.#dataSaved.set(name, data);
  }
}
__name(PositionStateAPI, "PositionStateAPI");
class StyleCache {
  constructor() {
    this.el = void 0;
    this.computed = void 0;
    this.marginLeft = void 0;
    this.marginTop = void 0;
    this.maxHeight = void 0;
    this.maxWidth = void 0;
    this.minHeight = void 0;
    this.minWidth = void 0;
    this.hasWillChange = false;
    this.resizeObserved = {
      contentHeight: void 0,
      contentWidth: void 0,
      offsetHeight: void 0,
      offsetWidth: void 0
    };
    const storeResizeObserved = writable$1(this.resizeObserved);
    this.stores = {
      element: writable$1(this.el),
      resizeContentHeight: propertyStore(storeResizeObserved, "contentHeight"),
      resizeContentWidth: propertyStore(storeResizeObserved, "contentWidth"),
      resizeObserved: storeResizeObserved,
      resizeOffsetHeight: propertyStore(storeResizeObserved, "offsetHeight"),
      resizeOffsetWidth: propertyStore(storeResizeObserved, "offsetWidth")
    };
  }
  get offsetHeight() {
    if (this.el instanceof HTMLElement) {
      return this.resizeObserved.offsetHeight !== void 0 ? this.resizeObserved.offsetHeight : this.el.offsetHeight;
    }
    throw new Error(`StyleCache - get offsetHeight error: no element assigned.`);
  }
  get offsetWidth() {
    if (this.el instanceof HTMLElement) {
      return this.resizeObserved.offsetWidth !== void 0 ? this.resizeObserved.offsetWidth : this.el.offsetWidth;
    }
    throw new Error(`StyleCache - get offsetWidth error: no element assigned.`);
  }
  hasData(el) {
    return this.el === el;
  }
  reset() {
    if (this.el instanceof HTMLElement && this.el.isConnected && !this.hasWillChange) {
      this.el.style.willChange = null;
    }
    this.el = void 0;
    this.computed = void 0;
    this.marginLeft = void 0;
    this.marginTop = void 0;
    this.maxHeight = void 0;
    this.maxWidth = void 0;
    this.minHeight = void 0;
    this.minWidth = void 0;
    this.hasWillChange = false;
    this.resizeObserved.contentHeight = void 0;
    this.resizeObserved.contentWidth = void 0;
    this.resizeObserved.offsetHeight = void 0;
    this.resizeObserved.offsetWidth = void 0;
    this.stores.element.set(void 0);
  }
  update(el) {
    this.el = el;
    this.computed = globalThis.getComputedStyle(el);
    this.marginLeft = styleParsePixels(el.style.marginLeft) ?? styleParsePixels(this.computed.marginLeft);
    this.marginTop = styleParsePixels(el.style.marginTop) ?? styleParsePixels(this.computed.marginTop);
    this.maxHeight = styleParsePixels(el.style.maxHeight) ?? styleParsePixels(this.computed.maxHeight);
    this.maxWidth = styleParsePixels(el.style.maxWidth) ?? styleParsePixels(this.computed.maxWidth);
    this.minHeight = styleParsePixels(el.style.minHeight) ?? styleParsePixels(this.computed.minHeight);
    this.minWidth = styleParsePixels(el.style.minWidth) ?? styleParsePixels(this.computed.minWidth);
    const willChange = el.style.willChange !== "" ? el.style.willChange : this.computed.willChange;
    this.hasWillChange = willChange !== "" && willChange !== "auto";
    this.stores.element.set(el);
  }
}
__name(StyleCache, "StyleCache");
class TransformData {
  constructor() {
    Object.seal(this);
  }
  #boundingRect = new DOMRect();
  #corners = [vec3.create(), vec3.create(), vec3.create(), vec3.create()];
  #mat4 = mat4.create();
  #originTranslations = [mat4.create(), mat4.create()];
  get boundingRect() {
    return this.#boundingRect;
  }
  get corners() {
    return this.#corners;
  }
  get css() {
    return `matrix3d(${this.mat4.join(",")})`;
  }
  get mat4() {
    return this.#mat4;
  }
  get originTranslations() {
    return this.#originTranslations;
  }
}
__name(TransformData, "TransformData");
class AdapterValidators {
  #validatorData;
  #mapUnsubscribe = /* @__PURE__ */ new Map();
  constructor() {
    this.#validatorData = [];
    Object.seal(this);
    return [this, this.#validatorData];
  }
  get length() {
    return this.#validatorData.length;
  }
  *[Symbol.iterator]() {
    if (this.#validatorData.length === 0) {
      return;
    }
    for (const entry of this.#validatorData) {
      yield { ...entry };
    }
  }
  add(...validators) {
    for (const validator of validators) {
      const validatorType = typeof validator;
      if (validatorType !== "function" && validatorType !== "object" || validator === null) {
        throw new TypeError(`AdapterValidator error: 'validator' is not a function or object.`);
      }
      let data = void 0;
      let subscribeFn = void 0;
      switch (validatorType) {
        case "function":
          data = {
            id: void 0,
            validator,
            weight: 1
          };
          subscribeFn = validator.subscribe;
          break;
        case "object":
          if (typeof validator.validator !== "function") {
            throw new TypeError(`AdapterValidator error: 'validator' attribute is not a function.`);
          }
          if (validator.weight !== void 0 && typeof validator.weight !== "number" || (validator.weight < 0 || validator.weight > 1)) {
            throw new TypeError(
              `AdapterValidator error: 'weight' attribute is not a number between '0 - 1' inclusive.`
            );
          }
          data = {
            id: validator.id !== void 0 ? validator.id : void 0,
            validator: validator.validator.bind(validator),
            weight: validator.weight || 1,
            instance: validator
          };
          subscribeFn = validator.validator.subscribe ?? validator.subscribe;
          break;
      }
      const index2 = this.#validatorData.findIndex((value) => {
        return data.weight < value.weight;
      });
      if (index2 >= 0) {
        this.#validatorData.splice(index2, 0, data);
      } else {
        this.#validatorData.push(data);
      }
      if (typeof subscribeFn === "function") {
        const unsubscribe = subscribeFn();
        if (typeof unsubscribe !== "function") {
          throw new TypeError(
            "AdapterValidator error: Filter has subscribe function, but no unsubscribe function is returned."
          );
        }
        if (this.#mapUnsubscribe.has(data.validator)) {
          throw new Error(
            "AdapterValidator error: Filter added already has an unsubscribe function registered."
          );
        }
        this.#mapUnsubscribe.set(data.validator, unsubscribe);
      }
    }
  }
  clear() {
    this.#validatorData.length = 0;
    for (const unsubscribe of this.#mapUnsubscribe.values()) {
      unsubscribe();
    }
    this.#mapUnsubscribe.clear();
  }
  remove(...validators) {
    const length = this.#validatorData.length;
    if (length === 0) {
      return;
    }
    for (const data of validators) {
      const actualValidator = typeof data === "function" ? data : data !== null && typeof data === "object" ? data.validator : void 0;
      if (!actualValidator) {
        continue;
      }
      for (let cntr = this.#validatorData.length; --cntr >= 0; ) {
        if (this.#validatorData[cntr].validator === actualValidator) {
          this.#validatorData.splice(cntr, 1);
          let unsubscribe = void 0;
          if (typeof (unsubscribe = this.#mapUnsubscribe.get(actualValidator)) === "function") {
            unsubscribe();
            this.#mapUnsubscribe.delete(actualValidator);
          }
        }
      }
    }
  }
  removeBy(callback2) {
    const length = this.#validatorData.length;
    if (length === 0) {
      return;
    }
    if (typeof callback2 !== "function") {
      throw new TypeError(`AdapterValidator error: 'callback' is not a function.`);
    }
    this.#validatorData = this.#validatorData.filter((data) => {
      const remove = callback2.call(callback2, { ...data });
      if (remove) {
        let unsubscribe;
        if (typeof (unsubscribe = this.#mapUnsubscribe.get(data.validator)) === "function") {
          unsubscribe();
          this.#mapUnsubscribe.delete(data.validator);
        }
      }
      return !remove;
    });
  }
  removeById(...ids) {
    const length = this.#validatorData.length;
    if (length === 0) {
      return;
    }
    this.#validatorData = this.#validatorData.filter((data) => {
      let remove = false;
      for (const id of ids) {
        remove |= data.id === id;
      }
      if (remove) {
        let unsubscribe;
        if (typeof (unsubscribe = this.#mapUnsubscribe.get(data.validator)) === "function") {
          unsubscribe();
          this.#mapUnsubscribe.delete(data.validator);
        }
      }
      return !remove;
    });
  }
}
__name(AdapterValidators, "AdapterValidators");
class BasicBounds {
  #constrain;
  #element;
  #enabled;
  #height;
  #lock;
  #width;
  constructor({ constrain = true, element: element2, enabled = true, lock = false, width, height } = {}) {
    this.element = element2;
    this.constrain = constrain;
    this.enabled = enabled;
    this.width = width;
    this.height = height;
    this.#lock = typeof lock === "boolean" ? lock : false;
  }
  get constrain() {
    return this.#constrain;
  }
  get element() {
    return this.#element;
  }
  get enabled() {
    return this.#enabled;
  }
  get height() {
    return this.#height;
  }
  get width() {
    return this.#width;
  }
  set constrain(constrain) {
    if (this.#lock) {
      return;
    }
    if (typeof constrain !== "boolean") {
      throw new TypeError(`'constrain' is not a boolean.`);
    }
    this.#constrain = constrain;
  }
  set element(element2) {
    if (this.#lock) {
      return;
    }
    if (element2 === void 0 || element2 === null || element2 instanceof HTMLElement) {
      this.#element = element2;
    } else {
      throw new TypeError(`'element' is not a HTMLElement, undefined, or null.`);
    }
  }
  set enabled(enabled) {
    if (this.#lock) {
      return;
    }
    if (typeof enabled !== "boolean") {
      throw new TypeError(`'enabled' is not a boolean.`);
    }
    this.#enabled = enabled;
  }
  set height(height) {
    if (this.#lock) {
      return;
    }
    if (height === void 0 || Number.isFinite(height)) {
      this.#height = height;
    } else {
      throw new TypeError(`'height' is not a finite number or undefined.`);
    }
  }
  set width(width) {
    if (this.#lock) {
      return;
    }
    if (width === void 0 || Number.isFinite(width)) {
      this.#width = width;
    } else {
      throw new TypeError(`'width' is not a finite number or undefined.`);
    }
  }
  setDimension(width, height) {
    if (this.#lock) {
      return;
    }
    if (width === void 0 || Number.isFinite(width)) {
      this.#width = width;
    } else {
      throw new TypeError(`'width' is not a finite number or undefined.`);
    }
    if (height === void 0 || Number.isFinite(height)) {
      this.#height = height;
    } else {
      throw new TypeError(`'height' is not a finite number or undefined.`);
    }
  }
  validator(valData) {
    if (!this.#enabled) {
      return valData.position;
    }
    const boundsWidth = this.#width ?? this.#element?.offsetWidth ?? globalThis.innerWidth;
    const boundsHeight = this.#height ?? this.#element?.offsetHeight ?? globalThis.innerHeight;
    if (typeof valData.position.width === "number") {
      const maxW = valData.maxWidth ?? (this.#constrain ? boundsWidth : Number.MAX_SAFE_INTEGER);
      valData.position.width = valData.width = Math.clamped(valData.position.width, valData.minWidth, maxW);
      if (valData.width + valData.position.left + valData.marginLeft > boundsWidth) {
        valData.position.left = boundsWidth - valData.width - valData.marginLeft;
      }
    }
    if (typeof valData.position.height === "number") {
      const maxH = valData.maxHeight ?? (this.#constrain ? boundsHeight : Number.MAX_SAFE_INTEGER);
      valData.position.height = valData.height = Math.clamped(valData.position.height, valData.minHeight, maxH);
      if (valData.height + valData.position.top + valData.marginTop > boundsHeight) {
        valData.position.top = boundsHeight - valData.height - valData.marginTop;
      }
    }
    const maxL = Math.max(boundsWidth - valData.width - valData.marginLeft, 0);
    valData.position.left = Math.round(Math.clamped(valData.position.left, 0, maxL));
    const maxT = Math.max(boundsHeight - valData.height - valData.marginTop, 0);
    valData.position.top = Math.round(Math.clamped(valData.position.top, 0, maxT));
    return valData.position;
  }
}
__name(BasicBounds, "BasicBounds");
const s_TRANSFORM_DATA = new TransformData();
class TransformBounds {
  #constrain;
  #element;
  #enabled;
  #height;
  #lock;
  #width;
  constructor({ constrain = true, element: element2, enabled = true, lock = false, width, height } = {}) {
    this.element = element2;
    this.constrain = constrain;
    this.enabled = enabled;
    this.width = width;
    this.height = height;
    this.#lock = typeof lock === "boolean" ? lock : false;
  }
  get constrain() {
    return this.#constrain;
  }
  get element() {
    return this.#element;
  }
  get enabled() {
    return this.#enabled;
  }
  get height() {
    return this.#height;
  }
  get width() {
    return this.#width;
  }
  set constrain(constrain) {
    if (this.#lock) {
      return;
    }
    if (typeof constrain !== "boolean") {
      throw new TypeError(`'constrain' is not a boolean.`);
    }
    this.#constrain = constrain;
  }
  set element(element2) {
    if (this.#lock) {
      return;
    }
    if (element2 === void 0 || element2 === null || element2 instanceof HTMLElement) {
      this.#element = element2;
    } else {
      throw new TypeError(`'element' is not a HTMLElement, undefined, or null.`);
    }
  }
  set enabled(enabled) {
    if (this.#lock) {
      return;
    }
    if (typeof enabled !== "boolean") {
      throw new TypeError(`'enabled' is not a boolean.`);
    }
    this.#enabled = enabled;
  }
  set height(height) {
    if (this.#lock) {
      return;
    }
    if (height === void 0 || Number.isFinite(height)) {
      this.#height = height;
    } else {
      throw new TypeError(`'height' is not a finite number or undefined.`);
    }
  }
  set width(width) {
    if (this.#lock) {
      return;
    }
    if (width === void 0 || Number.isFinite(width)) {
      this.#width = width;
    } else {
      throw new TypeError(`'width' is not a finite number or undefined.`);
    }
  }
  setDimension(width, height) {
    if (this.#lock) {
      return;
    }
    if (width === void 0 || Number.isFinite(width)) {
      this.#width = width;
    } else {
      throw new TypeError(`'width' is not a finite number or undefined.`);
    }
    if (height === void 0 || Number.isFinite(height)) {
      this.#height = height;
    } else {
      throw new TypeError(`'height' is not a finite number or undefined.`);
    }
  }
  validator(valData) {
    if (!this.#enabled) {
      return valData.position;
    }
    const boundsWidth = this.#width ?? this.#element?.offsetWidth ?? globalThis.innerWidth;
    const boundsHeight = this.#height ?? this.#element?.offsetHeight ?? globalThis.innerHeight;
    if (typeof valData.position.width === "number") {
      const maxW = valData.maxWidth ?? (this.#constrain ? boundsWidth : Number.MAX_SAFE_INTEGER);
      valData.position.width = Math.clamped(valData.width, valData.minWidth, maxW);
    }
    if (typeof valData.position.height === "number") {
      const maxH = valData.maxHeight ?? (this.#constrain ? boundsHeight : Number.MAX_SAFE_INTEGER);
      valData.position.height = Math.clamped(valData.height, valData.minHeight, maxH);
    }
    const data = valData.transforms.getData(valData.position, s_TRANSFORM_DATA, valData);
    const initialX = data.boundingRect.x;
    const initialY = data.boundingRect.y;
    if (data.boundingRect.bottom + valData.marginTop > boundsHeight) {
      data.boundingRect.y += boundsHeight - data.boundingRect.bottom - valData.marginTop;
    }
    if (data.boundingRect.right + valData.marginLeft > boundsWidth) {
      data.boundingRect.x += boundsWidth - data.boundingRect.right - valData.marginLeft;
    }
    if (data.boundingRect.top - valData.marginTop < 0) {
      data.boundingRect.y += Math.abs(data.boundingRect.top - valData.marginTop);
    }
    if (data.boundingRect.left - valData.marginLeft < 0) {
      data.boundingRect.x += Math.abs(data.boundingRect.left - valData.marginLeft);
    }
    valData.position.left -= initialX - data.boundingRect.x;
    valData.position.top -= initialY - data.boundingRect.y;
    return valData.position;
  }
}
__name(TransformBounds, "TransformBounds");
const basicWindow = new BasicBounds({ lock: true });
const transformWindow = new TransformBounds({ lock: true });
const positionValidators = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  basicWindow,
  BasicBounds,
  transformWindow,
  TransformBounds
}, Symbol.toStringTag, { value: "Module" }));
const s_SCALE_VECTOR = [1, 1, 1];
const s_TRANSLATE_VECTOR = [0, 0, 0];
const s_MAT4_RESULT = mat4.create();
const s_MAT4_TEMP = mat4.create();
const s_VEC3_TEMP = vec3.create();
class Transforms {
  #orderList = [];
  constructor() {
    this._data = {};
  }
  get isActive() {
    return this.#orderList.length > 0;
  }
  get rotateX() {
    return this._data.rotateX;
  }
  get rotateY() {
    return this._data.rotateY;
  }
  get rotateZ() {
    return this._data.rotateZ;
  }
  get scale() {
    return this._data.scale;
  }
  get translateX() {
    return this._data.translateX;
  }
  get translateY() {
    return this._data.translateY;
  }
  get translateZ() {
    return this._data.translateZ;
  }
  set rotateX(value) {
    if (Number.isFinite(value)) {
      if (this._data.rotateX === void 0) {
        this.#orderList.push("rotateX");
      }
      this._data.rotateX = value;
    } else {
      if (this._data.rotateX !== void 0) {
        const index2 = this.#orderList.findIndex((entry) => entry === "rotateX");
        if (index2 >= 0) {
          this.#orderList.splice(index2, 1);
        }
      }
      delete this._data.rotateX;
    }
  }
  set rotateY(value) {
    if (Number.isFinite(value)) {
      if (this._data.rotateY === void 0) {
        this.#orderList.push("rotateY");
      }
      this._data.rotateY = value;
    } else {
      if (this._data.rotateY !== void 0) {
        const index2 = this.#orderList.findIndex((entry) => entry === "rotateY");
        if (index2 >= 0) {
          this.#orderList.splice(index2, 1);
        }
      }
      delete this._data.rotateY;
    }
  }
  set rotateZ(value) {
    if (Number.isFinite(value)) {
      if (this._data.rotateZ === void 0) {
        this.#orderList.push("rotateZ");
      }
      this._data.rotateZ = value;
    } else {
      if (this._data.rotateZ !== void 0) {
        const index2 = this.#orderList.findIndex((entry) => entry === "rotateZ");
        if (index2 >= 0) {
          this.#orderList.splice(index2, 1);
        }
      }
      delete this._data.rotateZ;
    }
  }
  set scale(value) {
    if (Number.isFinite(value)) {
      if (this._data.scale === void 0) {
        this.#orderList.push("scale");
      }
      this._data.scale = value;
    } else {
      if (this._data.scale !== void 0) {
        const index2 = this.#orderList.findIndex((entry) => entry === "scale");
        if (index2 >= 0) {
          this.#orderList.splice(index2, 1);
        }
      }
      delete this._data.scale;
    }
  }
  set translateX(value) {
    if (Number.isFinite(value)) {
      if (this._data.translateX === void 0) {
        this.#orderList.push("translateX");
      }
      this._data.translateX = value;
    } else {
      if (this._data.translateX !== void 0) {
        const index2 = this.#orderList.findIndex((entry) => entry === "translateX");
        if (index2 >= 0) {
          this.#orderList.splice(index2, 1);
        }
      }
      delete this._data.translateX;
    }
  }
  set translateY(value) {
    if (Number.isFinite(value)) {
      if (this._data.translateY === void 0) {
        this.#orderList.push("translateY");
      }
      this._data.translateY = value;
    } else {
      if (this._data.translateY !== void 0) {
        const index2 = this.#orderList.findIndex((entry) => entry === "translateY");
        if (index2 >= 0) {
          this.#orderList.splice(index2, 1);
        }
      }
      delete this._data.translateY;
    }
  }
  set translateZ(value) {
    if (Number.isFinite(value)) {
      if (this._data.translateZ === void 0) {
        this.#orderList.push("translateZ");
      }
      this._data.translateZ = value;
    } else {
      if (this._data.translateZ !== void 0) {
        const index2 = this.#orderList.findIndex((entry) => entry === "translateZ");
        if (index2 >= 0) {
          this.#orderList.splice(index2, 1);
        }
      }
      delete this._data.translateZ;
    }
  }
  getCSS(data = this._data) {
    return `matrix3d(${this.getMat4(data, s_MAT4_RESULT).join(",")})`;
  }
  getCSSOrtho(data = this._data) {
    return `matrix3d(${this.getMat4Ortho(data, s_MAT4_RESULT).join(",")})`;
  }
  getData(position, output = new TransformData(), validationData = {}) {
    const valWidth = validationData.width ?? 0;
    const valHeight = validationData.height ?? 0;
    const valOffsetTop = validationData.offsetTop ?? validationData.marginTop ?? 0;
    const valOffsetLeft = validationData.offsetLeft ?? validationData.offsetLeft ?? 0;
    position.top += valOffsetTop;
    position.left += valOffsetLeft;
    const width = Number.isFinite(position.width) ? position.width : valWidth;
    const height = Number.isFinite(position.height) ? position.height : valHeight;
    const rect = output.corners;
    if (this.hasTransform(position)) {
      rect[0][0] = rect[0][1] = rect[0][2] = 0;
      rect[1][0] = width;
      rect[1][1] = rect[1][2] = 0;
      rect[2][0] = width;
      rect[2][1] = height;
      rect[2][2] = 0;
      rect[3][0] = 0;
      rect[3][1] = height;
      rect[3][2] = 0;
      const matrix = this.getMat4(position, output.mat4);
      const translate = s_GET_ORIGIN_TRANSLATION(position.transformOrigin, width, height, output.originTranslations);
      if (transformOriginDefault === position.transformOrigin) {
        vec3.transformMat4(rect[0], rect[0], matrix);
        vec3.transformMat4(rect[1], rect[1], matrix);
        vec3.transformMat4(rect[2], rect[2], matrix);
        vec3.transformMat4(rect[3], rect[3], matrix);
      } else {
        vec3.transformMat4(rect[0], rect[0], translate[0]);
        vec3.transformMat4(rect[0], rect[0], matrix);
        vec3.transformMat4(rect[0], rect[0], translate[1]);
        vec3.transformMat4(rect[1], rect[1], translate[0]);
        vec3.transformMat4(rect[1], rect[1], matrix);
        vec3.transformMat4(rect[1], rect[1], translate[1]);
        vec3.transformMat4(rect[2], rect[2], translate[0]);
        vec3.transformMat4(rect[2], rect[2], matrix);
        vec3.transformMat4(rect[2], rect[2], translate[1]);
        vec3.transformMat4(rect[3], rect[3], translate[0]);
        vec3.transformMat4(rect[3], rect[3], matrix);
        vec3.transformMat4(rect[3], rect[3], translate[1]);
      }
      rect[0][0] = position.left + rect[0][0];
      rect[0][1] = position.top + rect[0][1];
      rect[1][0] = position.left + rect[1][0];
      rect[1][1] = position.top + rect[1][1];
      rect[2][0] = position.left + rect[2][0];
      rect[2][1] = position.top + rect[2][1];
      rect[3][0] = position.left + rect[3][0];
      rect[3][1] = position.top + rect[3][1];
    } else {
      rect[0][0] = position.left;
      rect[0][1] = position.top;
      rect[1][0] = position.left + width;
      rect[1][1] = position.top;
      rect[2][0] = position.left + width;
      rect[2][1] = position.top + height;
      rect[3][0] = position.left;
      rect[3][1] = position.top + height;
      mat4.identity(output.mat4);
    }
    let maxX = Number.MIN_SAFE_INTEGER;
    let maxY = Number.MIN_SAFE_INTEGER;
    let minX = Number.MAX_SAFE_INTEGER;
    let minY = Number.MAX_SAFE_INTEGER;
    for (let cntr = 4; --cntr >= 0; ) {
      if (rect[cntr][0] > maxX) {
        maxX = rect[cntr][0];
      }
      if (rect[cntr][0] < minX) {
        minX = rect[cntr][0];
      }
      if (rect[cntr][1] > maxY) {
        maxY = rect[cntr][1];
      }
      if (rect[cntr][1] < minY) {
        minY = rect[cntr][1];
      }
    }
    const boundingRect = output.boundingRect;
    boundingRect.x = minX;
    boundingRect.y = minY;
    boundingRect.width = maxX - minX;
    boundingRect.height = maxY - minY;
    position.top -= valOffsetTop;
    position.left -= valOffsetLeft;
    return output;
  }
  getMat4(data = this._data, output = mat4.create()) {
    const matrix = mat4.identity(output);
    let seenKeys = 0;
    const orderList = this.#orderList;
    for (let cntr = 0; cntr < orderList.length; cntr++) {
      const key = orderList[cntr];
      switch (key) {
        case "rotateX":
          seenKeys |= transformKeysBitwise.rotateX;
          mat4.multiply(matrix, matrix, mat4.fromXRotation(s_MAT4_TEMP, degToRad(data[key])));
          break;
        case "rotateY":
          seenKeys |= transformKeysBitwise.rotateY;
          mat4.multiply(matrix, matrix, mat4.fromYRotation(s_MAT4_TEMP, degToRad(data[key])));
          break;
        case "rotateZ":
          seenKeys |= transformKeysBitwise.rotateZ;
          mat4.multiply(matrix, matrix, mat4.fromZRotation(s_MAT4_TEMP, degToRad(data[key])));
          break;
        case "scale":
          seenKeys |= transformKeysBitwise.scale;
          s_SCALE_VECTOR[0] = s_SCALE_VECTOR[1] = data[key];
          mat4.multiply(matrix, matrix, mat4.fromScaling(s_MAT4_TEMP, s_SCALE_VECTOR));
          break;
        case "translateX":
          seenKeys |= transformKeysBitwise.translateX;
          s_TRANSLATE_VECTOR[0] = data.translateX;
          s_TRANSLATE_VECTOR[1] = 0;
          s_TRANSLATE_VECTOR[2] = 0;
          mat4.multiply(matrix, matrix, mat4.fromTranslation(s_MAT4_TEMP, s_TRANSLATE_VECTOR));
          break;
        case "translateY":
          seenKeys |= transformKeysBitwise.translateY;
          s_TRANSLATE_VECTOR[0] = 0;
          s_TRANSLATE_VECTOR[1] = data.translateY;
          s_TRANSLATE_VECTOR[2] = 0;
          mat4.multiply(matrix, matrix, mat4.fromTranslation(s_MAT4_TEMP, s_TRANSLATE_VECTOR));
          break;
        case "translateZ":
          seenKeys |= transformKeysBitwise.translateZ;
          s_TRANSLATE_VECTOR[0] = 0;
          s_TRANSLATE_VECTOR[1] = 0;
          s_TRANSLATE_VECTOR[2] = data.translateZ;
          mat4.multiply(matrix, matrix, mat4.fromTranslation(s_MAT4_TEMP, s_TRANSLATE_VECTOR));
          break;
      }
    }
    if (data !== this._data) {
      for (let cntr = 0; cntr < transformKeys.length; cntr++) {
        const key = transformKeys[cntr];
        if (data[key] === null || (seenKeys & transformKeysBitwise[key]) > 0) {
          continue;
        }
        switch (key) {
          case "rotateX":
            mat4.multiply(matrix, matrix, mat4.fromXRotation(s_MAT4_TEMP, degToRad(data[key])));
            break;
          case "rotateY":
            mat4.multiply(matrix, matrix, mat4.fromYRotation(s_MAT4_TEMP, degToRad(data[key])));
            break;
          case "rotateZ":
            mat4.multiply(matrix, matrix, mat4.fromZRotation(s_MAT4_TEMP, degToRad(data[key])));
            break;
          case "scale":
            s_SCALE_VECTOR[0] = s_SCALE_VECTOR[1] = data[key];
            mat4.multiply(matrix, matrix, mat4.fromScaling(s_MAT4_TEMP, s_SCALE_VECTOR));
            break;
          case "translateX":
            s_TRANSLATE_VECTOR[0] = data[key];
            s_TRANSLATE_VECTOR[1] = 0;
            s_TRANSLATE_VECTOR[2] = 0;
            mat4.multiply(matrix, matrix, mat4.fromTranslation(s_MAT4_TEMP, s_TRANSLATE_VECTOR));
            break;
          case "translateY":
            s_TRANSLATE_VECTOR[0] = 0;
            s_TRANSLATE_VECTOR[1] = data[key];
            s_TRANSLATE_VECTOR[2] = 0;
            mat4.multiply(matrix, matrix, mat4.fromTranslation(s_MAT4_TEMP, s_TRANSLATE_VECTOR));
            break;
          case "translateZ":
            s_TRANSLATE_VECTOR[0] = 0;
            s_TRANSLATE_VECTOR[1] = 0;
            s_TRANSLATE_VECTOR[2] = data[key];
            mat4.multiply(matrix, matrix, mat4.fromTranslation(s_MAT4_TEMP, s_TRANSLATE_VECTOR));
            break;
        }
      }
    }
    return matrix;
  }
  getMat4Ortho(data = this._data, output = mat4.create()) {
    const matrix = mat4.identity(output);
    s_TRANSLATE_VECTOR[0] = (data.left ?? 0) + (data.translateX ?? 0);
    s_TRANSLATE_VECTOR[1] = (data.top ?? 0) + (data.translateY ?? 0);
    s_TRANSLATE_VECTOR[2] = data.translateZ ?? 0;
    mat4.multiply(matrix, matrix, mat4.fromTranslation(s_MAT4_TEMP, s_TRANSLATE_VECTOR));
    if (data.scale !== null) {
      s_SCALE_VECTOR[0] = s_SCALE_VECTOR[1] = data.scale;
      mat4.multiply(matrix, matrix, mat4.fromScaling(s_MAT4_TEMP, s_SCALE_VECTOR));
    }
    if (data.rotateX === null && data.rotateY === null && data.rotateZ === null) {
      return matrix;
    }
    let seenKeys = 0;
    const orderList = this.#orderList;
    for (let cntr = 0; cntr < orderList.length; cntr++) {
      const key = orderList[cntr];
      switch (key) {
        case "rotateX":
          seenKeys |= transformKeysBitwise.rotateX;
          mat4.multiply(matrix, matrix, mat4.fromXRotation(s_MAT4_TEMP, degToRad(data[key])));
          break;
        case "rotateY":
          seenKeys |= transformKeysBitwise.rotateY;
          mat4.multiply(matrix, matrix, mat4.fromYRotation(s_MAT4_TEMP, degToRad(data[key])));
          break;
        case "rotateZ":
          seenKeys |= transformKeysBitwise.rotateZ;
          mat4.multiply(matrix, matrix, mat4.fromZRotation(s_MAT4_TEMP, degToRad(data[key])));
          break;
      }
    }
    if (data !== this._data) {
      for (let cntr = 0; cntr < transformKeys.length; cntr++) {
        const key = transformKeys[cntr];
        if (data[key] === null || (seenKeys & transformKeysBitwise[key]) > 0) {
          continue;
        }
        switch (key) {
          case "rotateX":
            mat4.multiply(matrix, matrix, mat4.fromXRotation(s_MAT4_TEMP, degToRad(data[key])));
            break;
          case "rotateY":
            mat4.multiply(matrix, matrix, mat4.fromYRotation(s_MAT4_TEMP, degToRad(data[key])));
            break;
          case "rotateZ":
            mat4.multiply(matrix, matrix, mat4.fromZRotation(s_MAT4_TEMP, degToRad(data[key])));
            break;
        }
      }
    }
    return matrix;
  }
  hasTransform(data) {
    for (const key of transformKeys) {
      if (Number.isFinite(data[key])) {
        return true;
      }
    }
    return false;
  }
  reset(data) {
    for (const key in data) {
      if (transformKeys.includes(key)) {
        if (Number.isFinite(data[key])) {
          this._data[key] = data[key];
        } else {
          const index2 = this.#orderList.findIndex((entry) => entry === key);
          if (index2 >= 0) {
            this.#orderList.splice(index2, 1);
          }
          delete this._data[key];
        }
      }
    }
  }
}
__name(Transforms, "Transforms");
function s_GET_ORIGIN_TRANSLATION(transformOrigin, width, height, output) {
  const vector = s_VEC3_TEMP;
  switch (transformOrigin) {
    case "top left":
      vector[0] = vector[1] = 0;
      mat4.fromTranslation(output[0], vector);
      mat4.fromTranslation(output[1], vector);
      break;
    case "top center":
      vector[0] = -width * 0.5;
      vector[1] = 0;
      mat4.fromTranslation(output[0], vector);
      vector[0] = width * 0.5;
      mat4.fromTranslation(output[1], vector);
      break;
    case "top right":
      vector[0] = -width;
      vector[1] = 0;
      mat4.fromTranslation(output[0], vector);
      vector[0] = width;
      mat4.fromTranslation(output[1], vector);
      break;
    case "center left":
      vector[0] = 0;
      vector[1] = -height * 0.5;
      mat4.fromTranslation(output[0], vector);
      vector[1] = height * 0.5;
      mat4.fromTranslation(output[1], vector);
      break;
    case null:
    case "center":
      vector[0] = -width * 0.5;
      vector[1] = -height * 0.5;
      mat4.fromTranslation(output[0], vector);
      vector[0] = width * 0.5;
      vector[1] = height * 0.5;
      mat4.fromTranslation(output[1], vector);
      break;
    case "center right":
      vector[0] = -width;
      vector[1] = -height * 0.5;
      mat4.fromTranslation(output[0], vector);
      vector[0] = width;
      vector[1] = height * 0.5;
      mat4.fromTranslation(output[1], vector);
      break;
    case "bottom left":
      vector[0] = 0;
      vector[1] = -height;
      mat4.fromTranslation(output[0], vector);
      vector[1] = height;
      mat4.fromTranslation(output[1], vector);
      break;
    case "bottom center":
      vector[0] = -width * 0.5;
      vector[1] = -height;
      mat4.fromTranslation(output[0], vector);
      vector[0] = width * 0.5;
      vector[1] = height;
      mat4.fromTranslation(output[1], vector);
      break;
    case "bottom right":
      vector[0] = -width;
      vector[1] = -height;
      mat4.fromTranslation(output[0], vector);
      vector[0] = width;
      vector[1] = height;
      mat4.fromTranslation(output[1], vector);
      break;
    default:
      mat4.identity(output[0]);
      mat4.identity(output[1]);
      break;
  }
  return output;
}
__name(s_GET_ORIGIN_TRANSLATION, "s_GET_ORIGIN_TRANSLATION");
class UpdateElementData {
  constructor() {
    this.data = void 0;
    this.dataSubscribers = new PositionData();
    this.dimensionData = { width: 0, height: 0 };
    this.changeSet = void 0;
    this.options = void 0;
    this.queued = false;
    this.styleCache = void 0;
    this.transforms = void 0;
    this.transformData = new TransformData();
    this.subscriptions = void 0;
    this.storeDimension = writable$1(this.dimensionData);
    this.storeTransform = writable$1(this.transformData, () => {
      this.options.transformSubscribed = true;
      return () => this.options.transformSubscribed = false;
    });
    this.queued = false;
    Object.seal(this.dimensionData);
  }
}
__name(UpdateElementData, "UpdateElementData");
async function nextAnimationFrame(cntr = 1) {
  if (!Number.isInteger(cntr) || cntr < 1) {
    throw new TypeError(`nextAnimationFrame error: 'cntr' must be a positive integer greater than 0.`);
  }
  let currentTime = performance.now();
  for (; --cntr >= 0; ) {
    currentTime = await new Promise((resolve2) => requestAnimationFrame(resolve2));
  }
  return currentTime;
}
__name(nextAnimationFrame, "nextAnimationFrame");
class UpdateElementManager {
  static list = [];
  static listCntr = 0;
  static updatePromise;
  static get promise() {
    return this.updatePromise;
  }
  static add(el, updateData) {
    if (this.listCntr < this.list.length) {
      const entry = this.list[this.listCntr];
      entry[0] = el;
      entry[1] = updateData;
    } else {
      this.list.push([el, updateData]);
    }
    this.listCntr++;
    updateData.queued = true;
    if (!this.updatePromise) {
      this.updatePromise = this.wait();
    }
    return this.updatePromise;
  }
  static async wait() {
    const currentTime = await nextAnimationFrame();
    this.updatePromise = void 0;
    for (let cntr = this.listCntr; --cntr >= 0; ) {
      const entry = this.list[cntr];
      const el = entry[0];
      const updateData = entry[1];
      entry[0] = void 0;
      entry[1] = void 0;
      updateData.queued = false;
      if (!el.isConnected) {
        continue;
      }
      if (updateData.options.ortho) {
        s_UPDATE_ELEMENT_ORTHO(el, updateData);
      } else {
        s_UPDATE_ELEMENT(el, updateData);
      }
      if (updateData.options.calculateTransform || updateData.options.transformSubscribed) {
        s_UPDATE_TRANSFORM(el, updateData);
      }
      this.updateSubscribers(updateData);
    }
    this.listCntr = 0;
    return currentTime;
  }
  static immediate(el, updateData) {
    if (!el.isConnected) {
      return;
    }
    if (updateData.options.ortho) {
      s_UPDATE_ELEMENT_ORTHO(el, updateData);
    } else {
      s_UPDATE_ELEMENT(el, updateData);
    }
    if (updateData.options.calculateTransform || updateData.options.transformSubscribed) {
      s_UPDATE_TRANSFORM(el, updateData);
    }
    this.updateSubscribers(updateData);
  }
  static updateSubscribers(updateData) {
    const data = updateData.data;
    const changeSet = updateData.changeSet;
    if (!changeSet.hasChange()) {
      return;
    }
    const output = updateData.dataSubscribers.copy(data);
    const subscriptions = updateData.subscriptions;
    if (subscriptions.length > 0) {
      for (let cntr = 0; cntr < subscriptions.length; cntr++) {
        subscriptions[cntr](output);
      }
    }
    if (changeSet.width || changeSet.height) {
      updateData.dimensionData.width = data.width;
      updateData.dimensionData.height = data.height;
      updateData.storeDimension.set(updateData.dimensionData);
    }
    changeSet.set(false);
  }
}
__name(UpdateElementManager, "UpdateElementManager");
function s_UPDATE_ELEMENT(el, updateData) {
  const changeSet = updateData.changeSet;
  const data = updateData.data;
  if (changeSet.left) {
    el.style.left = `${data.left}px`;
  }
  if (changeSet.top) {
    el.style.top = `${data.top}px`;
  }
  if (changeSet.zIndex) {
    el.style.zIndex = typeof data.zIndex === "number" ? `${data.zIndex}` : null;
  }
  if (changeSet.width) {
    el.style.width = typeof data.width === "number" ? `${data.width}px` : data.width;
  }
  if (changeSet.height) {
    el.style.height = typeof data.height === "number" ? `${data.height}px` : data.height;
  }
  if (changeSet.transformOrigin) {
    el.style.transformOrigin = data.transformOrigin === "center" ? null : data.transformOrigin;
  }
  if (changeSet.transform) {
    el.style.transform = updateData.transforms.isActive ? updateData.transforms.getCSS() : null;
  }
}
__name(s_UPDATE_ELEMENT, "s_UPDATE_ELEMENT");
function s_UPDATE_ELEMENT_ORTHO(el, updateData) {
  const changeSet = updateData.changeSet;
  const data = updateData.data;
  if (changeSet.zIndex) {
    el.style.zIndex = typeof data.zIndex === "number" ? `${data.zIndex}` : null;
  }
  if (changeSet.width) {
    el.style.width = typeof data.width === "number" ? `${data.width}px` : data.width;
  }
  if (changeSet.height) {
    el.style.height = typeof data.height === "number" ? `${data.height}px` : data.height;
  }
  if (changeSet.transformOrigin) {
    el.style.transformOrigin = data.transformOrigin === "center" ? null : data.transformOrigin;
  }
  if (changeSet.left || changeSet.top || changeSet.transform) {
    el.style.transform = updateData.transforms.getCSSOrtho(data);
  }
}
__name(s_UPDATE_ELEMENT_ORTHO, "s_UPDATE_ELEMENT_ORTHO");
function s_UPDATE_TRANSFORM(el, updateData) {
  s_VALIDATION_DATA$1.height = updateData.data.height !== "auto" ? updateData.data.height : updateData.styleCache.offsetHeight;
  s_VALIDATION_DATA$1.width = updateData.data.width !== "auto" ? updateData.data.width : updateData.styleCache.offsetWidth;
  s_VALIDATION_DATA$1.marginLeft = updateData.styleCache.marginLeft;
  s_VALIDATION_DATA$1.marginTop = updateData.styleCache.marginTop;
  updateData.transforms.getData(updateData.data, updateData.transformData, s_VALIDATION_DATA$1);
  updateData.storeTransform.set(updateData.transformData);
}
__name(s_UPDATE_TRANSFORM, "s_UPDATE_TRANSFORM");
const s_VALIDATION_DATA$1 = {
  height: void 0,
  width: void 0,
  marginLeft: void 0,
  marginTop: void 0
};
class Position {
  #data = new PositionData();
  #animate = new AnimationAPI(this, this.#data);
  #enabled = true;
  #positionChangeSet = new PositionChangeSet();
  #options = {
    calculateTransform: false,
    initialHelper: void 0,
    ortho: true,
    transformSubscribed: false
  };
  #parent;
  #stores;
  #styleCache;
  #subscriptions = [];
  #transforms = new Transforms();
  #updateElementData;
  #updateElementPromise;
  #validators;
  #validatorData;
  #state = new PositionStateAPI(this, this.#data, this.#transforms);
  static get Animate() {
    return AnimationGroupAPI;
  }
  static get Initial() {
    return positionInitial;
  }
  static get TransformData() {
    return TransformData;
  }
  static get Validators() {
    return positionValidators;
  }
  static duplicate(position, options) {
    if (!(position instanceof Position)) {
      throw new TypeError(`'position' is not an instance of Position.`);
    }
    const newPosition = new Position(options);
    newPosition.#options = Object.assign({}, position.#options, options);
    newPosition.#validators.add(...position.#validators);
    newPosition.set(position.#data);
    return newPosition;
  }
  constructor(parent, options) {
    if (isPlainObject(parent)) {
      options = parent;
    } else {
      this.#parent = parent;
    }
    const data = this.#data;
    const transforms = this.#transforms;
    this.#styleCache = new StyleCache();
    const updateData = new UpdateElementData();
    updateData.changeSet = this.#positionChangeSet;
    updateData.data = this.#data;
    updateData.options = this.#options;
    updateData.styleCache = this.#styleCache;
    updateData.subscriptions = this.#subscriptions;
    updateData.transforms = this.#transforms;
    this.#updateElementData = updateData;
    if (typeof options === "object") {
      if (typeof options.calculateTransform === "boolean") {
        this.#options.calculateTransform = options.calculateTransform;
      }
      if (typeof options.ortho === "boolean") {
        this.#options.ortho = options.ortho;
      }
      if (Number.isFinite(options.height) || options.height === "auto" || options.height === "inherit" || options.height === null) {
        data.height = updateData.dimensionData.height = typeof options.height === "number" ? Math.round(options.height) : options.height;
      }
      if (Number.isFinite(options.left) || options.left === null) {
        data.left = typeof options.left === "number" ? Math.round(options.left) : options.left;
      }
      if (Number.isFinite(options.maxHeight) || options.maxHeight === null) {
        data.maxHeight = typeof options.maxHeight === "number" ? Math.round(options.maxHeight) : options.maxHeight;
      }
      if (Number.isFinite(options.maxWidth) || options.maxWidth === null) {
        data.maxWidth = typeof options.maxWidth === "number" ? Math.round(options.maxWidth) : options.maxWidth;
      }
      if (Number.isFinite(options.minHeight) || options.minHeight === null) {
        data.minHeight = typeof options.minHeight === "number" ? Math.round(options.minHeight) : options.minHeight;
      }
      if (Number.isFinite(options.minWidth) || options.minWidth === null) {
        data.minWidth = typeof options.minWidth === "number" ? Math.round(options.minWidth) : options.minWidth;
      }
      if (Number.isFinite(options.rotateX) || options.rotateX === null) {
        transforms.rotateX = data.rotateX = options.rotateX;
      }
      if (Number.isFinite(options.rotateY) || options.rotateY === null) {
        transforms.rotateY = data.rotateY = options.rotateY;
      }
      if (Number.isFinite(options.rotateZ) || options.rotateZ === null) {
        transforms.rotateZ = data.rotateZ = options.rotateZ;
      }
      if (Number.isFinite(options.scale) || options.scale === null) {
        transforms.scale = data.scale = options.scale;
      }
      if (Number.isFinite(options.top) || options.top === null) {
        data.top = typeof options.top === "number" ? Math.round(options.top) : options.top;
      }
      if (typeof options.transformOrigin === "string" || options.transformOrigin === null) {
        data.transformOrigin = transformOrigins.includes(options.transformOrigin) ? options.transformOrigin : null;
      }
      if (Number.isFinite(options.translateX) || options.translateX === null) {
        transforms.translateX = data.translateX = options.translateX;
      }
      if (Number.isFinite(options.translateY) || options.translateY === null) {
        transforms.translateY = data.translateY = options.translateY;
      }
      if (Number.isFinite(options.translateZ) || options.translateZ === null) {
        transforms.translateZ = data.translateZ = options.translateZ;
      }
      if (Number.isFinite(options.width) || options.width === "auto" || options.width === "inherit" || options.width === null) {
        data.width = updateData.dimensionData.width = typeof options.width === "number" ? Math.round(options.width) : options.width;
      }
      if (Number.isFinite(options.zIndex) || options.zIndex === null) {
        data.zIndex = typeof options.zIndex === "number" ? Math.round(options.zIndex) : options.zIndex;
      }
    }
    this.#stores = {
      height: propertyStore(this, "height"),
      left: propertyStore(this, "left"),
      rotateX: propertyStore(this, "rotateX"),
      rotateY: propertyStore(this, "rotateY"),
      rotateZ: propertyStore(this, "rotateZ"),
      scale: propertyStore(this, "scale"),
      top: propertyStore(this, "top"),
      transformOrigin: propertyStore(this, "transformOrigin"),
      translateX: propertyStore(this, "translateX"),
      translateY: propertyStore(this, "translateY"),
      translateZ: propertyStore(this, "translateZ"),
      width: propertyStore(this, "width"),
      zIndex: propertyStore(this, "zIndex"),
      maxHeight: propertyStore(this, "maxHeight"),
      maxWidth: propertyStore(this, "maxWidth"),
      minHeight: propertyStore(this, "minHeight"),
      minWidth: propertyStore(this, "minWidth"),
      dimension: { subscribe: updateData.storeDimension.subscribe },
      element: { subscribe: this.#styleCache.stores.element.subscribe },
      resizeContentHeight: { subscribe: this.#styleCache.stores.resizeContentHeight.subscribe },
      resizeContentWidth: { subscribe: this.#styleCache.stores.resizeContentWidth.subscribe },
      resizeOffsetHeight: { subscribe: this.#styleCache.stores.resizeOffsetHeight.subscribe },
      resizeOffsetWidth: { subscribe: this.#styleCache.stores.resizeOffsetWidth.subscribe },
      transform: { subscribe: updateData.storeTransform.subscribe },
      resizeObserved: this.#styleCache.stores.resizeObserved
    };
    subscribeIgnoreFirst(this.#stores.resizeObserved, (resizeData) => {
      const parent2 = this.#parent;
      const el = parent2 instanceof HTMLElement ? parent2 : parent2?.elementTarget;
      if (el instanceof HTMLElement && Number.isFinite(resizeData?.offsetWidth) && Number.isFinite(resizeData?.offsetHeight)) {
        this.set(data);
      }
    });
    this.#stores.transformOrigin.values = transformOrigins;
    [this.#validators, this.#validatorData] = new AdapterValidators();
    if (options?.initial || options?.positionInitial) {
      const initialHelper = options.initial ?? options.positionInitial;
      if (typeof initialHelper?.getLeft !== "function" || typeof initialHelper?.getTop !== "function") {
        throw new Error(
          `'options.initial' position helper does not contain 'getLeft' and / or 'getTop' functions.`
        );
      }
      this.#options.initialHelper = options.initial;
    }
    if (options?.validator) {
      if (isIterable(options?.validator)) {
        this.validators.add(...options.validator);
      } else {
        this.validators.add(options.validator);
      }
    }
  }
  get animate() {
    return this.#animate;
  }
  get dimension() {
    return this.#updateElementData.dimensionData;
  }
  get enabled() {
    return this.#enabled;
  }
  get element() {
    return this.#styleCache.el;
  }
  get elementUpdated() {
    return this.#updateElementPromise;
  }
  get parent() {
    return this.#parent;
  }
  get state() {
    return this.#state;
  }
  get stores() {
    return this.#stores;
  }
  get transform() {
    return this.#updateElementData.transformData;
  }
  get validators() {
    return this.#validators;
  }
  set enabled(enabled) {
    if (typeof enabled !== "boolean") {
      throw new TypeError(`'enabled' is not a boolean.`);
    }
    this.#enabled = enabled;
  }
  set parent(parent) {
    if (parent !== void 0 && !(parent instanceof HTMLElement) && !isObject$1(parent)) {
      throw new TypeError(`'parent' is not an HTMLElement, object, or undefined.`);
    }
    this.#parent = parent;
    this.#state.remove({ name: "#defaultData" });
    this.#styleCache.reset();
    if (parent) {
      this.set(this.#data);
    }
  }
  get height() {
    return this.#data.height;
  }
  get left() {
    return this.#data.left;
  }
  get maxHeight() {
    return this.#data.maxHeight;
  }
  get maxWidth() {
    return this.#data.maxWidth;
  }
  get minHeight() {
    return this.#data.minHeight;
  }
  get minWidth() {
    return this.#data.minWidth;
  }
  get rotateX() {
    return this.#data.rotateX;
  }
  get rotateY() {
    return this.#data.rotateY;
  }
  get rotateZ() {
    return this.#data.rotateZ;
  }
  get rotation() {
    return this.#data.rotateZ;
  }
  get scale() {
    return this.#data.scale;
  }
  get top() {
    return this.#data.top;
  }
  get transformOrigin() {
    return this.#data.transformOrigin;
  }
  get translateX() {
    return this.#data.translateX;
  }
  get translateY() {
    return this.#data.translateY;
  }
  get translateZ() {
    return this.#data.translateZ;
  }
  get width() {
    return this.#data.width;
  }
  get zIndex() {
    return this.#data.zIndex;
  }
  set height(height) {
    this.#stores.height.set(height);
  }
  set left(left) {
    this.#stores.left.set(left);
  }
  set maxHeight(maxHeight) {
    this.#stores.maxHeight.set(maxHeight);
  }
  set maxWidth(maxWidth) {
    this.#stores.maxWidth.set(maxWidth);
  }
  set minHeight(minHeight) {
    this.#stores.minHeight.set(minHeight);
  }
  set minWidth(minWidth) {
    this.#stores.minWidth.set(minWidth);
  }
  set rotateX(rotateX) {
    this.#stores.rotateX.set(rotateX);
  }
  set rotateY(rotateY) {
    this.#stores.rotateY.set(rotateY);
  }
  set rotateZ(rotateZ) {
    this.#stores.rotateZ.set(rotateZ);
  }
  set rotation(rotateZ) {
    this.#stores.rotateZ.set(rotateZ);
  }
  set scale(scale) {
    this.#stores.scale.set(scale);
  }
  set top(top) {
    this.#stores.top.set(top);
  }
  set transformOrigin(transformOrigin) {
    if (transformOrigins.includes(transformOrigin)) {
      this.#stores.transformOrigin.set(transformOrigin);
    }
  }
  set translateX(translateX) {
    this.#stores.translateX.set(translateX);
  }
  set translateY(translateY) {
    this.#stores.translateY.set(translateY);
  }
  set translateZ(translateZ) {
    this.#stores.translateZ.set(translateZ);
  }
  set width(width) {
    this.#stores.width.set(width);
  }
  set zIndex(zIndex) {
    this.#stores.zIndex.set(zIndex);
  }
  get(position = {}, options) {
    const keys = options?.keys;
    const excludeKeys = options?.exclude;
    const numeric = options?.numeric ?? false;
    if (isIterable(keys)) {
      if (numeric) {
        for (const key of keys) {
          position[key] = this[key] ?? numericDefaults[key];
        }
      } else {
        for (const key of keys) {
          position[key] = this[key];
        }
      }
      if (isIterable(excludeKeys)) {
        for (const key of excludeKeys) {
          delete position[key];
        }
      }
      return position;
    } else {
      const data = Object.assign(position, this.#data);
      if (isIterable(excludeKeys)) {
        for (const key of excludeKeys) {
          delete data[key];
        }
      }
      if (numeric) {
        setNumericDefaults(data);
      }
      return data;
    }
  }
  toJSON() {
    return Object.assign({}, this.#data);
  }
  set(position = {}) {
    if (typeof position !== "object") {
      throw new TypeError(`Position - set error: 'position' is not an object.`);
    }
    const parent = this.#parent;
    if (!this.#enabled) {
      return this;
    }
    if (parent !== void 0 && typeof parent?.options?.positionable === "boolean" && !parent?.options?.positionable) {
      return this;
    }
    const immediateElementUpdate = position.immediateElementUpdate === true;
    const data = this.#data;
    const transforms = this.#transforms;
    const targetEl = parent instanceof HTMLElement ? parent : parent?.elementTarget;
    const el = targetEl instanceof HTMLElement && targetEl.isConnected ? targetEl : void 0;
    const changeSet = this.#positionChangeSet;
    const styleCache = this.#styleCache;
    if (el) {
      if (!styleCache.hasData(el)) {
        styleCache.update(el);
        if (!styleCache.hasWillChange)
          ;
        changeSet.set(true);
        this.#updateElementData.queued = false;
      }
      convertRelative(position, this);
      position = this.#updatePosition(position, parent, el, styleCache);
      if (position === null) {
        return this;
      }
    }
    if (Number.isFinite(position.left)) {
      position.left = Math.round(position.left);
      if (data.left !== position.left) {
        data.left = position.left;
        changeSet.left = true;
      }
    }
    if (Number.isFinite(position.top)) {
      position.top = Math.round(position.top);
      if (data.top !== position.top) {
        data.top = position.top;
        changeSet.top = true;
      }
    }
    if (Number.isFinite(position.maxHeight) || position.maxHeight === null) {
      position.maxHeight = typeof position.maxHeight === "number" ? Math.round(position.maxHeight) : null;
      if (data.maxHeight !== position.maxHeight) {
        data.maxHeight = position.maxHeight;
        changeSet.maxHeight = true;
      }
    }
    if (Number.isFinite(position.maxWidth) || position.maxWidth === null) {
      position.maxWidth = typeof position.maxWidth === "number" ? Math.round(position.maxWidth) : null;
      if (data.maxWidth !== position.maxWidth) {
        data.maxWidth = position.maxWidth;
        changeSet.maxWidth = true;
      }
    }
    if (Number.isFinite(position.minHeight) || position.minHeight === null) {
      position.minHeight = typeof position.minHeight === "number" ? Math.round(position.minHeight) : null;
      if (data.minHeight !== position.minHeight) {
        data.minHeight = position.minHeight;
        changeSet.minHeight = true;
      }
    }
    if (Number.isFinite(position.minWidth) || position.minWidth === null) {
      position.minWidth = typeof position.minWidth === "number" ? Math.round(position.minWidth) : null;
      if (data.minWidth !== position.minWidth) {
        data.minWidth = position.minWidth;
        changeSet.minWidth = true;
      }
    }
    if (Number.isFinite(position.rotateX) || position.rotateX === null) {
      if (data.rotateX !== position.rotateX) {
        data.rotateX = transforms.rotateX = position.rotateX;
        changeSet.transform = true;
      }
    }
    if (Number.isFinite(position.rotateY) || position.rotateY === null) {
      if (data.rotateY !== position.rotateY) {
        data.rotateY = transforms.rotateY = position.rotateY;
        changeSet.transform = true;
      }
    }
    if (Number.isFinite(position.rotateZ) || position.rotateZ === null) {
      if (data.rotateZ !== position.rotateZ) {
        data.rotateZ = transforms.rotateZ = position.rotateZ;
        changeSet.transform = true;
      }
    }
    if (Number.isFinite(position.scale) || position.scale === null) {
      position.scale = typeof position.scale === "number" ? Math.max(0, Math.min(position.scale, 1e3)) : null;
      if (data.scale !== position.scale) {
        data.scale = transforms.scale = position.scale;
        changeSet.transform = true;
      }
    }
    if (typeof position.transformOrigin === "string" && transformOrigins.includes(
      position.transformOrigin
    ) || position.transformOrigin === null) {
      if (data.transformOrigin !== position.transformOrigin) {
        data.transformOrigin = position.transformOrigin;
        changeSet.transformOrigin = true;
      }
    }
    if (Number.isFinite(position.translateX) || position.translateX === null) {
      if (data.translateX !== position.translateX) {
        data.translateX = transforms.translateX = position.translateX;
        changeSet.transform = true;
      }
    }
    if (Number.isFinite(position.translateY) || position.translateY === null) {
      if (data.translateY !== position.translateY) {
        data.translateY = transforms.translateY = position.translateY;
        changeSet.transform = true;
      }
    }
    if (Number.isFinite(position.translateZ) || position.translateZ === null) {
      if (data.translateZ !== position.translateZ) {
        data.translateZ = transforms.translateZ = position.translateZ;
        changeSet.transform = true;
      }
    }
    if (Number.isFinite(position.zIndex)) {
      position.zIndex = Math.round(position.zIndex);
      if (data.zIndex !== position.zIndex) {
        data.zIndex = position.zIndex;
        changeSet.zIndex = true;
      }
    }
    if (Number.isFinite(position.width) || position.width === "auto" || position.width === "inherit" || position.width === null) {
      position.width = typeof position.width === "number" ? Math.round(position.width) : position.width;
      if (data.width !== position.width) {
        data.width = position.width;
        changeSet.width = true;
      }
    }
    if (Number.isFinite(position.height) || position.height === "auto" || position.height === "inherit" || position.height === null) {
      position.height = typeof position.height === "number" ? Math.round(position.height) : position.height;
      if (data.height !== position.height) {
        data.height = position.height;
        changeSet.height = true;
      }
    }
    if (el) {
      const defaultData = this.#state.getDefault();
      if (typeof defaultData !== "object") {
        this.#state.save({ name: "#defaultData", ...Object.assign({}, data) });
      }
      if (immediateElementUpdate) {
        UpdateElementManager.immediate(el, this.#updateElementData);
        this.#updateElementPromise = Promise.resolve(performance.now());
      } else if (!this.#updateElementData.queued) {
        this.#updateElementPromise = UpdateElementManager.add(el, this.#updateElementData);
      }
    } else {
      UpdateElementManager.updateSubscribers(this.#updateElementData);
    }
    return this;
  }
  subscribe(handler) {
    this.#subscriptions.push(handler);
    handler(Object.assign({}, this.#data));
    return () => {
      const index2 = this.#subscriptions.findIndex((sub) => sub === handler);
      if (index2 >= 0) {
        this.#subscriptions.splice(index2, 1);
      }
    };
  }
  #updatePosition({
    left,
    top,
    maxWidth,
    maxHeight,
    minWidth,
    minHeight,
    width,
    height,
    rotateX,
    rotateY,
    rotateZ,
    scale,
    transformOrigin,
    translateX,
    translateY,
    translateZ,
    zIndex,
    rotation,
    ...rest
  } = {}, parent, el, styleCache) {
    let currentPosition = s_DATA_UPDATE.copy(this.#data);
    if (el.style.width === "" || width !== void 0) {
      if (width === "auto" || currentPosition.width === "auto" && width !== null) {
        currentPosition.width = "auto";
        width = styleCache.offsetWidth;
      } else if (width === "inherit" || currentPosition.width === "inherit" && width !== null) {
        currentPosition.width = "inherit";
        width = styleCache.offsetWidth;
      } else {
        const newWidth = Number.isFinite(width) ? width : currentPosition.width;
        currentPosition.width = width = Number.isFinite(newWidth) ? Math.round(newWidth) : styleCache.offsetWidth;
      }
    } else {
      width = Number.isFinite(currentPosition.width) ? currentPosition.width : styleCache.offsetWidth;
    }
    if (el.style.height === "" || height !== void 0) {
      if (height === "auto" || currentPosition.height === "auto" && height !== null) {
        currentPosition.height = "auto";
        height = styleCache.offsetHeight;
      } else if (height === "inherit" || currentPosition.height === "inherit" && height !== null) {
        currentPosition.height = "inherit";
        height = styleCache.offsetHeight;
      } else {
        const newHeight = Number.isFinite(height) ? height : currentPosition.height;
        currentPosition.height = height = Number.isFinite(newHeight) ? Math.round(newHeight) : styleCache.offsetHeight;
      }
    } else {
      height = Number.isFinite(currentPosition.height) ? currentPosition.height : styleCache.offsetHeight;
    }
    if (Number.isFinite(left)) {
      currentPosition.left = left;
    } else if (!Number.isFinite(currentPosition.left)) {
      currentPosition.left = typeof this.#options.initialHelper?.getLeft === "function" ? this.#options.initialHelper.getLeft(width) : 0;
    }
    if (Number.isFinite(top)) {
      currentPosition.top = top;
    } else if (!Number.isFinite(currentPosition.top)) {
      currentPosition.top = typeof this.#options.initialHelper?.getTop === "function" ? this.#options.initialHelper.getTop(height) : 0;
    }
    if (Number.isFinite(maxHeight) || maxHeight === null) {
      currentPosition.maxHeight = Number.isFinite(maxHeight) ? Math.round(maxHeight) : null;
    }
    if (Number.isFinite(maxWidth) || maxWidth === null) {
      currentPosition.maxWidth = Number.isFinite(maxWidth) ? Math.round(maxWidth) : null;
    }
    if (Number.isFinite(minHeight) || minHeight === null) {
      currentPosition.minHeight = Number.isFinite(minHeight) ? Math.round(minHeight) : null;
    }
    if (Number.isFinite(minWidth) || minWidth === null) {
      currentPosition.minWidth = Number.isFinite(minWidth) ? Math.round(minWidth) : null;
    }
    if (Number.isFinite(rotateX) || rotateX === null) {
      currentPosition.rotateX = rotateX;
    }
    if (Number.isFinite(rotateY) || rotateY === null) {
      currentPosition.rotateY = rotateY;
    }
    if (rotateZ !== currentPosition.rotateZ && (Number.isFinite(rotateZ) || rotateZ === null)) {
      currentPosition.rotateZ = rotateZ;
    } else if (rotation !== currentPosition.rotateZ && (Number.isFinite(rotation) || rotation === null)) {
      currentPosition.rotateZ = rotation;
    }
    if (Number.isFinite(translateX) || translateX === null) {
      currentPosition.translateX = translateX;
    }
    if (Number.isFinite(translateY) || translateY === null) {
      currentPosition.translateY = translateY;
    }
    if (Number.isFinite(translateZ) || translateZ === null) {
      currentPosition.translateZ = translateZ;
    }
    if (Number.isFinite(scale) || scale === null) {
      currentPosition.scale = typeof scale === "number" ? Math.max(0, Math.min(scale, 1e3)) : null;
    }
    if (typeof transformOrigin === "string" || transformOrigin === null) {
      currentPosition.transformOrigin = transformOrigins.includes(transformOrigin) ? transformOrigin : null;
    }
    if (Number.isFinite(zIndex) || zIndex === null) {
      currentPosition.zIndex = typeof zIndex === "number" ? Math.round(zIndex) : zIndex;
    }
    const validatorData = this.#validatorData;
    if (validatorData.length) {
      s_VALIDATION_DATA.parent = parent;
      s_VALIDATION_DATA.el = el;
      s_VALIDATION_DATA.computed = styleCache.computed;
      s_VALIDATION_DATA.transforms = this.#transforms;
      s_VALIDATION_DATA.height = height;
      s_VALIDATION_DATA.width = width;
      s_VALIDATION_DATA.marginLeft = styleCache.marginLeft;
      s_VALIDATION_DATA.marginTop = styleCache.marginTop;
      s_VALIDATION_DATA.maxHeight = styleCache.maxHeight ?? currentPosition.maxHeight;
      s_VALIDATION_DATA.maxWidth = styleCache.maxWidth ?? currentPosition.maxWidth;
      const isMinimized = parent?.reactive?.minimized ?? false;
      s_VALIDATION_DATA.minHeight = isMinimized ? currentPosition.minHeight ?? 0 : styleCache.minHeight || (currentPosition.minHeight ?? 0);
      s_VALIDATION_DATA.minWidth = isMinimized ? currentPosition.minWidth ?? 0 : styleCache.minWidth || (currentPosition.minWidth ?? 0);
      for (let cntr = 0; cntr < validatorData.length; cntr++) {
        s_VALIDATION_DATA.position = currentPosition;
        s_VALIDATION_DATA.rest = rest;
        currentPosition = validatorData[cntr].validator(s_VALIDATION_DATA);
        if (currentPosition === null) {
          return null;
        }
      }
    }
    return currentPosition;
  }
}
__name(Position, "Position");
const s_DATA_UPDATE = new PositionData();
const s_VALIDATION_DATA = {
  position: void 0,
  parent: void 0,
  el: void 0,
  computed: void 0,
  transforms: void 0,
  height: void 0,
  width: void 0,
  marginLeft: void 0,
  marginTop: void 0,
  maxHeight: void 0,
  maxWidth: void 0,
  minHeight: void 0,
  minWidth: void 0,
  rest: void 0
};
Object.seal(s_VALIDATION_DATA);
class ApplicationState {
  #application;
  #dataSaved = /* @__PURE__ */ new Map();
  constructor(application) {
    this.#application = application;
  }
  get(extra = {}) {
    return Object.assign(extra, {
      position: this.#application?.position?.get(),
      beforeMinimized: this.#application?.position?.state.get({ name: "#beforeMinimized" }),
      options: Object.assign({}, this.#application?.options),
      ui: { minimized: this.#application?.reactive?.minimized }
    });
  }
  getSave({ name }) {
    if (typeof name !== "string") {
      throw new TypeError(`ApplicationState - getSave error: 'name' is not a string.`);
    }
    return this.#dataSaved.get(name);
  }
  remove({ name }) {
    if (typeof name !== "string") {
      throw new TypeError(`ApplicationState - remove: 'name' is not a string.`);
    }
    const data = this.#dataSaved.get(name);
    this.#dataSaved.delete(name);
    return data;
  }
  restore({
    name,
    remove = false,
    async = false,
    animateTo = false,
    duration = 0.1,
    ease = identity,
    interpolate: interpolate2 = lerp$5
  }) {
    if (typeof name !== "string") {
      throw new TypeError(`ApplicationState - restore error: 'name' is not a string.`);
    }
    const dataSaved = this.#dataSaved.get(name);
    if (dataSaved) {
      if (remove) {
        this.#dataSaved.delete(name);
      }
      if (async) {
        return this.set(dataSaved, { async, animateTo, duration, ease, interpolate: interpolate2 }).then(() => dataSaved);
      } else {
        this.set(dataSaved, { async, animateTo, duration, ease, interpolate: interpolate2 });
      }
    }
    return dataSaved;
  }
  save({ name, ...extra }) {
    if (typeof name !== "string") {
      throw new TypeError(`ApplicationState - save error: 'name' is not a string.`);
    }
    const data = this.get(extra);
    this.#dataSaved.set(name, data);
    return data;
  }
  set(data, { async = false, animateTo = false, duration = 0.1, ease = identity, interpolate: interpolate2 = lerp$5 } = {}) {
    if (!isObject$1(data)) {
      throw new TypeError(`ApplicationState - restore error: 'data' is not an object.`);
    }
    const application = this.#application;
    if (!isObject$1(data?.position)) {
      console.warn(`ApplicationState.set warning: 'data.position' is not an object.`);
      return application;
    }
    const rendered = application.rendered;
    if (animateTo && !rendered) {
      console.warn(`ApplicationState.set warning: Application is not rendered and 'animateTo' is true.`);
      return application;
    }
    if (animateTo) {
      if (data.position.transformOrigin !== application.position.transformOrigin) {
        application.position.transformOrigin = data.position.transformOrigin;
      }
      if (isObject$1(data?.ui)) {
        const minimized = typeof data.ui?.minimized === "boolean" ? data.ui.minimized : false;
        if (application?.reactive?.minimized && !minimized) {
          application.maximize({ animate: false, duration: 0 });
        }
      }
      const promise2 = application.position.animate.to(
        data.position,
        { duration, ease, interpolate: interpolate2 }
      ).finished.then((cancelled) => {
        if (cancelled) {
          return application;
        }
        if (isObject$1(data?.options)) {
          application?.reactive.mergeOptions(data.options);
        }
        if (isObject$1(data?.ui)) {
          const minimized = typeof data.ui?.minimized === "boolean" ? data.ui.minimized : false;
          if (!application?.reactive?.minimized && minimized) {
            application.minimize({ animate: false, duration: 0 });
          }
        }
        if (isObject$1(data?.beforeMinimized)) {
          application.position.state.set({ name: "#beforeMinimized", ...data.beforeMinimized });
        }
        return application;
      });
      if (async) {
        return promise2;
      }
    } else {
      if (rendered) {
        if (isObject$1(data?.options)) {
          application?.reactive.mergeOptions(data.options);
        }
        if (isObject$1(data?.ui)) {
          const minimized = typeof data.ui?.minimized === "boolean" ? data.ui.minimized : false;
          if (application?.reactive?.minimized && !minimized) {
            application.maximize({ animate: false, duration: 0 });
          } else if (!application?.reactive?.minimized && minimized) {
            application.minimize({ animate: false, duration });
          }
        }
        if (isObject$1(data?.beforeMinimized)) {
          application.position.state.set({ name: "#beforeMinimized", ...data.beforeMinimized });
        }
        application.position.set(data.position);
      } else {
        let positionData = data.position;
        if (isObject$1(data.beforeMinimized)) {
          positionData = data.beforeMinimized;
          positionData.left = data.position.left;
          positionData.top = data.position.top;
        }
        application.position.set(positionData);
      }
    }
    return application;
  }
}
__name(ApplicationState, "ApplicationState");
class GetSvelteData {
  #applicationShellHolder;
  #svelteData;
  constructor(applicationShellHolder, svelteData) {
    this.#applicationShellHolder = applicationShellHolder;
    this.#svelteData = svelteData;
  }
  get applicationShell() {
    return this.#applicationShellHolder[0];
  }
  component(index2) {
    const data = this.#svelteData[index2];
    return typeof data === "object" ? data?.component : void 0;
  }
  *componentEntries() {
    for (let cntr = 0; cntr < this.#svelteData.length; cntr++) {
      yield [cntr, this.#svelteData[cntr].component];
    }
  }
  *componentValues() {
    for (let cntr = 0; cntr < this.#svelteData.length; cntr++) {
      yield this.#svelteData[cntr].component;
    }
  }
  data(index2) {
    return this.#svelteData[index2];
  }
  dataByComponent(component) {
    for (const data of this.#svelteData) {
      if (data.component === component) {
        return data;
      }
    }
    return void 0;
  }
  dataEntries() {
    return this.#svelteData.entries();
  }
  dataValues() {
    return this.#svelteData.values();
  }
  get length() {
    return this.#svelteData.length;
  }
}
__name(GetSvelteData, "GetSvelteData");
function loadSvelteConfig({ app, template, config, elementRootUpdate } = {}) {
  const svelteOptions = typeof config.options === "object" ? config.options : {};
  let target;
  if (config.target instanceof HTMLElement) {
    target = config.target;
  } else if (template instanceof HTMLElement && typeof config.target === "string") {
    target = template.querySelector(config.target);
  } else {
    target = document.createDocumentFragment();
  }
  if (target === void 0) {
    console.log(
      `%c[TRL] loadSvelteConfig error - could not find target selector, '${config.target}', for config:
`,
      "background: rgb(57,34,34)",
      config
    );
    throw new Error();
  }
  const NewSvelteComponent = config.class;
  const svelteConfig = parseSvelteConfig({ ...config, target }, app);
  const externalContext = svelteConfig.context.get("external");
  externalContext.application = app;
  externalContext.elementRootUpdate = elementRootUpdate;
  let eventbus;
  if (typeof app._eventbus === "object" && typeof app._eventbus.createProxy === "function") {
    eventbus = app._eventbus.createProxy();
    externalContext.eventbus = eventbus;
  }
  const component = new NewSvelteComponent(svelteConfig);
  svelteConfig.eventbus = eventbus;
  let element2;
  if (isApplicationShell(component)) {
    element2 = component.elementRoot;
  }
  if (target instanceof DocumentFragment && target.firstElementChild) {
    if (element2 === void 0) {
      element2 = target.firstElementChild;
    }
    template.append(target);
  } else if (config.target instanceof HTMLElement && element2 === void 0) {
    if (config.target instanceof HTMLElement && typeof svelteOptions.selectorElement !== "string") {
      console.log(
        `%c[TRL] loadSvelteConfig error - HTMLElement target with no 'selectorElement' defined.

Note: If configuring an application shell and directly targeting a HTMLElement did you bind an'elementRoot' and include '<svelte:options accessors={true}/>'?

Offending config:
`,
        "background: rgb(57,34,34)",
        config
      );
      throw new Error();
    }
    element2 = target.querySelector(svelteOptions.selectorElement);
    if (element2 === null || element2 === void 0) {
      console.log(
        `%c[TRL] loadSvelteConfig error - HTMLElement target with 'selectorElement', '${svelteOptions.selectorElement}', not found for config:
`,
        "background: rgb(57,34,34)",
        config
      );
      throw new Error();
    }
  }
  const injectHTML = !(config.target instanceof HTMLElement);
  return { config: svelteConfig, component, element: element2, injectHTML };
}
__name(loadSvelteConfig, "loadSvelteConfig");
class SvelteReactive {
  #application;
  #initialized = false;
  #storeAppOptions;
  #storeAppOptionsUpdate;
  #dataUIState;
  #storeUIState;
  #storeUIStateUpdate;
  #storeUnsubscribe = [];
  constructor(application) {
    this.#application = application;
  }
  initialize() {
    if (this.#initialized) {
      return;
    }
    this.#initialized = true;
    this.#storesInitialize();
    return {
      appOptionsUpdate: this.#storeAppOptionsUpdate,
      uiOptionsUpdate: this.#storeUIStateUpdate,
      subscribe: this.#storesSubscribe.bind(this),
      unsubscribe: this.#storesUnsubscribe.bind(this)
    };
  }
  get dragging() {
    return this.#dataUIState.dragging;
  }
  get minimized() {
    return this.#dataUIState.minimized;
  }
  get resizing() {
    return this.#dataUIState.resizing;
  }
  get draggable() {
    return this.#application?.options?.draggable;
  }
  get headerButtonNoClose() {
    return this.#application?.options?.headerButtonNoClose;
  }
  get headerButtonNoLabel() {
    return this.#application?.options?.headerButtonNoLabel;
  }
  get headerNoTitleMinimized() {
    return this.#application?.options?.headerNoTitleMinimized;
  }
  get minimizable() {
    return this.#application?.options?.minimizable;
  }
  get popOut() {
    return this.#application.popOut;
  }
  get resizable() {
    return this.#application?.options?.resizable;
  }
  get storeAppOptions() {
    return this.#storeAppOptions;
  }
  get storeUIState() {
    return this.#storeUIState;
  }
  get title() {
    return this.#application.title;
  }
  set draggable(draggable2) {
    if (typeof draggable2 === "boolean") {
      this.setOptions("draggable", draggable2);
    }
  }
  set headerButtonNoClose(headerButtonNoClose) {
    if (typeof headerButtonNoClose === "boolean") {
      this.setOptions("headerButtonNoClose", headerButtonNoClose);
    }
  }
  set headerButtonNoLabel(headerButtonNoLabel) {
    if (typeof headerButtonNoLabel === "boolean") {
      this.setOptions("headerButtonNoLabel", headerButtonNoLabel);
    }
  }
  set headerNoTitleMinimized(headerNoTitleMinimized) {
    if (typeof headerNoTitleMinimized === "boolean") {
      this.setOptions("headerNoTitleMinimized", headerNoTitleMinimized);
    }
  }
  set minimizable(minimizable) {
    if (typeof minimizable === "boolean") {
      this.setOptions("minimizable", minimizable);
    }
  }
  set popOut(popOut) {
    if (typeof popOut === "boolean") {
      this.setOptions("popOut", popOut);
    }
  }
  set resizable(resizable) {
    if (typeof resizable === "boolean") {
      this.setOptions("resizable", resizable);
    }
  }
  set title(title) {
    if (typeof title === "string") {
      this.setOptions("title", title);
    } else if (title === void 0 || title === null) {
      this.setOptions("title", "");
    }
  }
  getOptions(accessor, defaultValue) {
    return safeAccess(this.#application.options, accessor, defaultValue);
  }
  mergeOptions(options) {
    this.#storeAppOptionsUpdate((instanceOptions) => deepMerge(instanceOptions, options));
  }
  setOptions(accessor, value) {
    const success = safeSet(this.#application.options, accessor, value);
    if (success) {
      this.#storeAppOptionsUpdate(() => this.#application.options);
    }
  }
  #storesInitialize() {
    const writableAppOptions = writable$1(this.#application.options);
    this.#storeAppOptionsUpdate = writableAppOptions.update;
    const storeAppOptions = {
      subscribe: writableAppOptions.subscribe,
      draggable: propertyStore(writableAppOptions, "draggable"),
      headerButtonNoClose: propertyStore(writableAppOptions, "headerButtonNoClose"),
      headerButtonNoLabel: propertyStore(writableAppOptions, "headerButtonNoLabel"),
      headerNoTitleMinimized: propertyStore(writableAppOptions, "headerNoTitleMinimized"),
      minimizable: propertyStore(writableAppOptions, "minimizable"),
      popOut: propertyStore(writableAppOptions, "popOut"),
      resizable: propertyStore(writableAppOptions, "resizable"),
      title: propertyStore(writableAppOptions, "title")
    };
    Object.freeze(storeAppOptions);
    this.#storeAppOptions = storeAppOptions;
    this.#dataUIState = {
      dragging: false,
      headerButtons: [],
      minimized: this.#application._minimized,
      resizing: false
    };
    const writableUIOptions = writable$1(this.#dataUIState);
    this.#storeUIStateUpdate = writableUIOptions.update;
    const storeUIState = {
      subscribe: writableUIOptions.subscribe,
      dragging: propertyStore(writableUIOptions, "dragging"),
      headerButtons: derived(writableUIOptions, ($options, set2) => set2($options.headerButtons)),
      minimized: derived(writableUIOptions, ($options, set2) => set2($options.minimized)),
      resizing: propertyStore(writableUIOptions, "resizing")
    };
    Object.freeze(storeUIState);
    this.#storeUIState = storeUIState;
  }
  #storesSubscribe() {
    this.#storeUnsubscribe.push(subscribeIgnoreFirst(this.#storeAppOptions.headerButtonNoClose, (value) => {
      this.updateHeaderButtons({ headerButtonNoClose: value });
    }));
    this.#storeUnsubscribe.push(subscribeIgnoreFirst(this.#storeAppOptions.headerButtonNoLabel, (value) => {
      this.updateHeaderButtons({ headerButtonNoLabel: value });
    }));
    this.#storeUnsubscribe.push(subscribeIgnoreFirst(this.#storeAppOptions.popOut, (value) => {
      if (value && this.#application.rendered) {
        ui.windows[this.#application.appId] = this.#application;
      } else {
        delete ui.windows[this.#application.appId];
      }
    }));
  }
  #storesUnsubscribe() {
    this.#storeUnsubscribe.forEach((unsubscribe) => unsubscribe());
    this.#storeUnsubscribe = [];
  }
  updateHeaderButtons({
    headerButtonNoClose = this.#application.options.headerButtonNoClose,
    headerButtonNoLabel = this.#application.options.headerButtonNoLabel
  } = {}) {
    let buttons = this.#application._getHeaderButtons();
    if (typeof headerButtonNoClose === "boolean" && headerButtonNoClose) {
      buttons = buttons.filter((button) => button.class !== "close");
    }
    if (typeof headerButtonNoLabel === "boolean" && headerButtonNoLabel) {
      for (const button of buttons) {
        button.label = void 0;
      }
    }
    this.#storeUIStateUpdate((options) => {
      options.headerButtons = buttons;
      return options;
    });
  }
}
__name(SvelteReactive, "SvelteReactive");
class SvelteApplication extends Application {
  #applicationShellHolder = [null];
  #applicationState;
  #elementTarget = null;
  #elementContent = null;
  #initialZIndex = 95;
  #onMount = false;
  #position;
  #reactive;
  #svelteData = [];
  #getSvelteData = new GetSvelteData(this.#applicationShellHolder, this.#svelteData);
  #stores;
  constructor(options = {}) {
    super(options);
    this.#applicationState = new ApplicationState(this);
    this.#position = new Position(this, {
      ...this.position,
      ...this.options,
      initial: this.options.positionInitial,
      ortho: this.options.positionOrtho,
      validator: this.options.positionValidator
    });
    delete this.position;
    Object.defineProperty(this, "position", {
      get: () => this.#position,
      set: (position) => {
        if (typeof position === "object") {
          this.#position.set(position);
        }
      }
    });
    this.#reactive = new SvelteReactive(this);
    this.#stores = this.#reactive.initialize();
  }
  static get defaultOptions() {
    return deepMerge(super.defaultOptions, {
      defaultCloseAnimation: true,
      draggable: true,
      headerButtonNoClose: false,
      headerButtonNoLabel: false,
      headerNoTitleMinimized: false,
      minHeight: MIN_WINDOW_HEIGHT,
      minWidth: MIN_WINDOW_WIDTH,
      positionable: true,
      positionInitial: Position.Initial.browserCentered,
      positionOrtho: true,
      positionValidator: Position.Validators.transformWindow,
      transformOrigin: "top left"
    });
  }
  get elementContent() {
    return this.#elementContent;
  }
  get elementTarget() {
    return this.#elementTarget;
  }
  get reactive() {
    return this.#reactive;
  }
  get state() {
    return this.#applicationState;
  }
  get svelte() {
    return this.#getSvelteData;
  }
  _activateCoreListeners(html) {
    super._activateCoreListeners(typeof this.options.template === "string" ? html : [this.#elementTarget]);
  }
  bringToTop({ force = false } = {}) {
    if (force || this.popOut) {
      super.bringToTop();
    }
    if (document.activeElement !== document.body && !this.elementTarget.contains(document.activeElement)) {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      document.body.focus();
    }
    ui.activeWindow = this;
  }
  async close(options = {}) {
    const states = Application.RENDER_STATES;
    if (!options.force && ![states.RENDERED, states.ERROR].includes(this._state)) {
      return;
    }
    this.#stores.unsubscribe();
    this._state = states.CLOSING;
    const el = this.#elementTarget;
    if (!el) {
      return this._state = states.CLOSED;
    }
    const content = el.querySelector(".window-content");
    if (content) {
      content.style.overflow = "hidden";
      for (let cntr = content.children.length; --cntr >= 0; ) {
        content.children[cntr].style.overflow = "hidden";
      }
    }
    for (const cls of this.constructor._getInheritanceChain()) {
      Hooks.call(`close${cls.name}`, this, el);
    }
    const animate = typeof this.options.defaultCloseAnimation === "boolean" ? this.options.defaultCloseAnimation : true;
    if (animate) {
      el.style.minHeight = "0";
      const { paddingBottom, paddingTop } = globalThis.getComputedStyle(el);
      await el.animate([
        { maxHeight: `${el.clientHeight}px`, paddingTop, paddingBottom },
        { maxHeight: 0, paddingTop: 0, paddingBottom: 0 }
      ], { duration: 250, easing: "ease-in", fill: "forwards" }).finished;
    }
    const svelteDestroyPromises = [];
    for (const entry of this.#svelteData) {
      svelteDestroyPromises.push(outroAndDestroy(entry.component));
      const eventbus = entry.config.eventbus;
      if (typeof eventbus === "object" && typeof eventbus.off === "function") {
        eventbus.off();
        entry.config.eventbus = void 0;
      }
    }
    await Promise.all(svelteDestroyPromises);
    this.#svelteData.length = 0;
    el.remove();
    this.position.state.restore({
      name: "#beforeMinimized",
      properties: ["width", "height"],
      silent: true,
      remove: true
    });
    this.#applicationShellHolder[0] = null;
    this._element = null;
    this.#elementContent = null;
    this.#elementTarget = null;
    delete ui.windows[this.appId];
    this._minimized = false;
    this._scrollPositions = null;
    this._state = states.CLOSED;
    this.#onMount = false;
    this.#stores.uiOptionsUpdate((storeOptions) => deepMerge(storeOptions, { minimized: this._minimized }));
  }
  _injectHTML(html) {
    if (this.popOut && html.length === 0 && Array.isArray(this.options.svelte)) {
      throw new Error(
        "SvelteApplication - _injectHTML - A popout app with no template can only support one Svelte component."
      );
    }
    this.reactive.updateHeaderButtons();
    const elementRootUpdate = /* @__PURE__ */ __name(() => {
      let cntr = 0;
      return (elementRoot) => {
        if (elementRoot !== null && elementRoot !== void 0 && cntr++ > 0) {
          this.#updateApplicationShell();
          return true;
        }
        return false;
      };
    }, "elementRootUpdate");
    if (Array.isArray(this.options.svelte)) {
      for (const svelteConfig of this.options.svelte) {
        const svelteData = loadSvelteConfig({
          app: this,
          template: html[0],
          config: svelteConfig,
          elementRootUpdate
        });
        if (isApplicationShell(svelteData.component)) {
          if (this.svelte.applicationShell !== null) {
            throw new Error(
              `SvelteApplication - _injectHTML - An application shell is already mounted; offending config:
                    ${JSON.stringify(svelteConfig)}`
            );
          }
          this.#applicationShellHolder[0] = svelteData.component;
          if (isHMRProxy(svelteData.component) && Array.isArray(svelteData.component?.$$?.on_hmr)) {
            svelteData.component.$$.on_hmr.push(() => () => this.#updateApplicationShell());
          }
        }
        this.#svelteData.push(svelteData);
      }
    } else if (typeof this.options.svelte === "object") {
      const svelteData = loadSvelteConfig({
        app: this,
        template: html[0],
        config: this.options.svelte,
        elementRootUpdate
      });
      if (isApplicationShell(svelteData.component)) {
        if (this.svelte.applicationShell !== null) {
          throw new Error(
            `SvelteApplication - _injectHTML - An application shell is already mounted; offending config:
                 ${JSON.stringify(this.options.svelte)}`
          );
        }
        this.#applicationShellHolder[0] = svelteData.component;
        if (isHMRProxy(svelteData.component) && Array.isArray(svelteData.component?.$$?.on_hmr)) {
          svelteData.component.$$.on_hmr.push(() => () => this.#updateApplicationShell());
        }
      }
      this.#svelteData.push(svelteData);
    }
    const isDocumentFragment = html.length && html[0] instanceof DocumentFragment;
    let injectHTML = true;
    for (const svelteData of this.#svelteData) {
      if (!svelteData.injectHTML) {
        injectHTML = false;
        break;
      }
    }
    if (injectHTML) {
      super._injectHTML(html);
    }
    if (this.svelte.applicationShell !== null) {
      this._element = $(this.svelte.applicationShell.elementRoot);
      this.#elementContent = hasGetter(this.svelte.applicationShell, "elementContent") ? this.svelte.applicationShell.elementContent : null;
      this.#elementTarget = hasGetter(this.svelte.applicationShell, "elementTarget") ? this.svelte.applicationShell.elementTarget : null;
    } else if (isDocumentFragment) {
      for (const svelteData of this.#svelteData) {
        if (svelteData.element instanceof HTMLElement) {
          this._element = $(svelteData.element);
          break;
        }
      }
    }
    if (this.#elementTarget === null) {
      const element2 = typeof this.options.selectorTarget === "string" ? this._element.find(this.options.selectorTarget) : this._element;
      this.#elementTarget = element2[0];
    }
    if (this.#elementTarget === null || this.#elementTarget === void 0 || this.#elementTarget.length === 0) {
      throw new Error(`SvelteApplication - _injectHTML: Target element '${this.options.selectorTarget}' not found.`);
    }
    if (typeof this.options.positionable === "boolean" && this.options.positionable) {
      this.#elementTarget.style.zIndex = typeof this.options.zIndex === "number" ? this.options.zIndex : this.#initialZIndex ?? 95;
    }
    this.#stores.subscribe();
  }
  async maximize({ animate = true, duration = 0.1 } = {}) {
    if (!this.popOut || [false, null].includes(this._minimized)) {
      return;
    }
    this._minimized = null;
    const durationMS = duration * 1e3;
    const element2 = this.elementTarget;
    const header = element2.querySelector(".window-header");
    const content = element2.querySelector(".window-content");
    const positionBefore = this.position.state.get({ name: "#beforeMinimized" });
    if (animate) {
      await this.position.state.restore({
        name: "#beforeMinimized",
        async: true,
        animateTo: true,
        properties: ["width"],
        duration: 0.1
      });
    }
    for (let cntr = header.children.length; --cntr >= 0; ) {
      header.children[cntr].style.display = null;
    }
    content.style.display = null;
    let constraints;
    if (animate) {
      ({ constraints } = this.position.state.restore({
        name: "#beforeMinimized",
        animateTo: true,
        properties: ["height"],
        remove: true,
        duration
      }));
    } else {
      ({ constraints } = this.position.state.remove({ name: "#beforeMinimized" }));
    }
    await content.animate([
      { maxHeight: 0, paddingTop: 0, paddingBottom: 0, offset: 0 },
      { ...constraints, offset: 1 },
      { maxHeight: "100%", offset: 1 }
    ], { duration: durationMS, fill: "forwards" }).finished;
    this.position.set({
      minHeight: positionBefore.minHeight ?? this.options?.minHeight ?? MIN_WINDOW_HEIGHT,
      minWidth: positionBefore.minWidth ?? this.options?.minWidth ?? MIN_WINDOW_WIDTH
    });
    element2.style.minWidth = null;
    element2.style.minHeight = null;
    element2.classList.remove("minimized");
    this._minimized = false;
    setTimeout(() => {
      content.style.overflow = null;
      for (let cntr = content.children.length; --cntr >= 0; ) {
        content.children[cntr].style.overflow = null;
      }
    }, 50);
    this.#stores.uiOptionsUpdate((options) => deepMerge(options, { minimized: false }));
  }
  async minimize({ animate = true, duration = 0.1 } = {}) {
    if (!this.rendered || !this.popOut || [true, null].includes(this._minimized)) {
      return;
    }
    this.#stores.uiOptionsUpdate((options) => deepMerge(options, { minimized: true }));
    this._minimized = null;
    const durationMS = duration * 1e3;
    const element2 = this.elementTarget;
    const header = element2.querySelector(".window-header");
    const content = element2.querySelector(".window-content");
    const beforeMinWidth = this.position.minWidth;
    const beforeMinHeight = this.position.minHeight;
    this.position.set({ minWidth: 100, minHeight: 30 });
    element2.style.minWidth = "100px";
    element2.style.minHeight = "30px";
    if (content) {
      content.style.overflow = "hidden";
      for (let cntr = content.children.length; --cntr >= 0; ) {
        content.children[cntr].style.overflow = "hidden";
      }
    }
    const { paddingBottom, paddingTop } = globalThis.getComputedStyle(content);
    const constraints = {
      maxHeight: `${content.clientHeight}px`,
      paddingTop,
      paddingBottom
    };
    if (animate) {
      const animation = content.animate([
        constraints,
        { maxHeight: 0, paddingTop: 0, paddingBottom: 0 }
      ], { duration: durationMS, fill: "forwards" });
      animation.finished.then(() => content.style.display = "none");
    } else {
      setTimeout(() => content.style.display = "none", durationMS);
    }
    const saved = this.position.state.save({ name: "#beforeMinimized", constraints });
    saved.minWidth = beforeMinWidth;
    saved.minHeight = beforeMinHeight;
    const headerOffsetHeight = header.offsetHeight;
    this.position.minHeight = headerOffsetHeight;
    if (animate) {
      await this.position.animate.to({ height: headerOffsetHeight }, { duration }).finished;
    }
    for (let cntr = header.children.length; --cntr >= 0; ) {
      const className = header.children[cntr].className;
      if (className.includes("window-title") || className.includes("close")) {
        continue;
      }
      if (className.includes("keep-minimized")) {
        header.children[cntr].style.display = "block";
        continue;
      }
      header.children[cntr].style.display = "none";
    }
    if (animate) {
      await this.position.animate.to({ width: MIN_WINDOW_WIDTH }, { duration: 0.1 }).finished;
    }
    element2.classList.add("minimized");
    this._minimized = true;
  }
  onSvelteMount({ element: element2, elementContent, elementTarget } = {}) {
  }
  onSvelteRemount({ element: element2, elementContent, elementTarget } = {}) {
  }
  _replaceHTML(element2, html) {
    if (!element2.length) {
      return;
    }
    this.reactive.updateHeaderButtons();
  }
  async _render(force = false, options = {}) {
    if (this._state === Application.RENDER_STATES.NONE && document.querySelector(`#${this.id}`) instanceof HTMLElement) {
      console.warn(`SvelteApplication - _render: A DOM element already exists for CSS ID '${this.id}'. Cancelling initial render for new application with appId '${this.appId}'.`);
      return;
    }
    await super._render(force, options);
    if (!this.#onMount) {
      this.onSvelteMount({ element: this._element[0], elementContent: this.#elementContent, elementTarget: this.#elementTarget });
      this.#onMount = true;
    }
  }
  async _renderInner(data) {
    const html = typeof this.template === "string" ? await renderTemplate(this.template, data) : document.createDocumentFragment();
    return $(html);
  }
  async _renderOuter() {
    const html = await super._renderOuter();
    this.#initialZIndex = html[0].style.zIndex;
    return html;
  }
  setPosition(position) {
    return this.position.set(position);
  }
  #updateApplicationShell() {
    const applicationShell = this.svelte.applicationShell;
    if (applicationShell !== null) {
      this._element = $(applicationShell.elementRoot);
      this.#elementContent = hasGetter(applicationShell, "elementContent") ? applicationShell.elementContent : null;
      this.#elementTarget = hasGetter(applicationShell, "elementTarget") ? applicationShell.elementTarget : null;
      if (this.#elementTarget === null) {
        const element2 = typeof this.options.selectorTarget === "string" ? this._element.find(this.options.selectorTarget) : this._element;
        this.#elementTarget = element2[0];
      }
      if (typeof this.options.positionable === "boolean" && this.options.positionable) {
        this.#elementTarget.style.zIndex = typeof this.options.zIndex === "number" ? this.options.zIndex : this.#initialZIndex ?? 95;
        super.bringToTop();
        this.position.set(this.position.get());
      }
      super._activateCoreListeners([this.#elementTarget]);
      this.onSvelteRemount({ element: this._element[0], elementContent: this.#elementContent, elementTarget: this.#elementTarget });
    }
  }
}
__name(SvelteApplication, "SvelteApplication");
const TJSContainer_svelte_svelte_type_style_lang = "";
function get_each_context$5(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[2] = list[i];
  return child_ctx;
}
__name(get_each_context$5, "get_each_context$5");
function create_if_block_1(ctx) {
  let p;
  return {
    c() {
      p = element("p");
      p.textContent = "Container warning: No children.";
      attr(p, "class", "svelte-1s361pr");
    },
    m(target, anchor) {
      insert(target, p, anchor);
    },
    p: noop$1,
    i: noop$1,
    o: noop$1,
    d(detaching) {
      if (detaching)
        detach(p);
    }
  };
}
__name(create_if_block_1, "create_if_block_1");
function create_if_block$5(ctx) {
  let each_1_anchor;
  let current;
  let each_value = ctx[1];
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
  }
  const out = /* @__PURE__ */ __name((i) => transition_out(each_blocks[i], 1, 1, () => {
    each_blocks[i] = null;
  }), "out");
  return {
    c() {
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      each_1_anchor = empty();
    },
    m(target, anchor) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(target, anchor);
      }
      insert(target, each_1_anchor, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      if (dirty & 2) {
        each_value = ctx2[1];
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context$5(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
            transition_in(each_blocks[i], 1);
          } else {
            each_blocks[i] = create_each_block$5(child_ctx);
            each_blocks[i].c();
            transition_in(each_blocks[i], 1);
            each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
          }
        }
        group_outros();
        for (i = each_value.length; i < each_blocks.length; i += 1) {
          out(i);
        }
        check_outros();
      }
    },
    i(local) {
      if (current)
        return;
      for (let i = 0; i < each_value.length; i += 1) {
        transition_in(each_blocks[i]);
      }
      current = true;
    },
    o(local) {
      each_blocks = each_blocks.filter(Boolean);
      for (let i = 0; i < each_blocks.length; i += 1) {
        transition_out(each_blocks[i]);
      }
      current = false;
    },
    d(detaching) {
      destroy_each(each_blocks, detaching);
      if (detaching)
        detach(each_1_anchor);
    }
  };
}
__name(create_if_block$5, "create_if_block$5");
function create_each_block$5(ctx) {
  let switch_instance;
  let switch_instance_anchor;
  let current;
  const switch_instance_spread_levels = [ctx[2].props];
  var switch_value = ctx[2].class;
  function switch_props(ctx2) {
    let switch_instance_props = {};
    for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
      switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    }
    return { props: switch_instance_props };
  }
  __name(switch_props, "switch_props");
  if (switch_value) {
    switch_instance = construct_svelte_component(switch_value, switch_props());
  }
  return {
    c() {
      if (switch_instance)
        create_component(switch_instance.$$.fragment);
      switch_instance_anchor = empty();
    },
    m(target, anchor) {
      if (switch_instance)
        mount_component(switch_instance, target, anchor);
      insert(target, switch_instance_anchor, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const switch_instance_changes = dirty & 2 ? get_spread_update(switch_instance_spread_levels, [get_spread_object(ctx2[2].props)]) : {};
      if (switch_value !== (switch_value = ctx2[2].class)) {
        if (switch_instance) {
          group_outros();
          const old_component = switch_instance;
          transition_out(old_component.$$.fragment, 1, 0, () => {
            destroy_component(old_component, 1);
          });
          check_outros();
        }
        if (switch_value) {
          switch_instance = construct_svelte_component(switch_value, switch_props());
          create_component(switch_instance.$$.fragment);
          transition_in(switch_instance.$$.fragment, 1);
          mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
        } else {
          switch_instance = null;
        }
      } else if (switch_value) {
        switch_instance.$set(switch_instance_changes);
      }
    },
    i(local) {
      if (current)
        return;
      if (switch_instance)
        transition_in(switch_instance.$$.fragment, local);
      current = true;
    },
    o(local) {
      if (switch_instance)
        transition_out(switch_instance.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(switch_instance_anchor);
      if (switch_instance)
        destroy_component(switch_instance, detaching);
    }
  };
}
__name(create_each_block$5, "create_each_block$5");
function create_fragment$n(ctx) {
  let show_if;
  let current_block_type_index;
  let if_block;
  let if_block_anchor;
  let current;
  const if_block_creators = [create_if_block$5, create_if_block_1];
  const if_blocks = [];
  function select_block_type(ctx2, dirty) {
    if (dirty & 2)
      show_if = null;
    if (show_if == null)
      show_if = !!Array.isArray(ctx2[1]);
    if (show_if)
      return 0;
    if (ctx2[0])
      return 1;
    return -1;
  }
  __name(select_block_type, "select_block_type");
  if (~(current_block_type_index = select_block_type(ctx, -1))) {
    if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  }
  return {
    c() {
      if (if_block)
        if_block.c();
      if_block_anchor = empty();
    },
    m(target, anchor) {
      if (~current_block_type_index) {
        if_blocks[current_block_type_index].m(target, anchor);
      }
      insert(target, if_block_anchor, anchor);
      current = true;
    },
    p(ctx2, [dirty]) {
      let previous_block_index = current_block_type_index;
      current_block_type_index = select_block_type(ctx2, dirty);
      if (current_block_type_index === previous_block_index) {
        if (~current_block_type_index) {
          if_blocks[current_block_type_index].p(ctx2, dirty);
        }
      } else {
        if (if_block) {
          group_outros();
          transition_out(if_blocks[previous_block_index], 1, 1, () => {
            if_blocks[previous_block_index] = null;
          });
          check_outros();
        }
        if (~current_block_type_index) {
          if_block = if_blocks[current_block_type_index];
          if (!if_block) {
            if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
            if_block.c();
          } else {
            if_block.p(ctx2, dirty);
          }
          transition_in(if_block, 1);
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        } else {
          if_block = null;
        }
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(if_block);
      current = true;
    },
    o(local) {
      transition_out(if_block);
      current = false;
    },
    d(detaching) {
      if (~current_block_type_index) {
        if_blocks[current_block_type_index].d(detaching);
      }
      if (detaching)
        detach(if_block_anchor);
    }
  };
}
__name(create_fragment$n, "create_fragment$n");
function instance$l($$self, $$props, $$invalidate) {
  let { warn = false } = $$props;
  let { children: children2 = void 0 } = $$props;
  $$self.$$set = ($$props2) => {
    if ("warn" in $$props2)
      $$invalidate(0, warn = $$props2.warn);
    if ("children" in $$props2)
      $$invalidate(1, children2 = $$props2.children);
  };
  return [warn, children2];
}
__name(instance$l, "instance$l");
class TJSContainer extends SvelteComponent {
  constructor(options) {
    super();
    init$1(this, options, instance$l, create_fragment$n, safe_not_equal, { warn: 0, children: 1 });
  }
  get warn() {
    return this.$$.ctx[0];
  }
  set warn(warn) {
    this.$$set({ warn });
    flush();
  }
  get children() {
    return this.$$.ctx[1];
  }
  set children(children2) {
    this.$$set({ children: children2 });
    flush();
  }
}
__name(TJSContainer, "TJSContainer");
function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
  const o = +getComputedStyle(node).opacity;
  return {
    delay,
    duration,
    easing,
    css: (t) => `opacity: ${t * o}`
  };
}
__name(fade, "fade");
function slide(node, { delay = 0, duration = 400, easing = cubicOut } = {}) {
  const style = getComputedStyle(node);
  const opacity = +style.opacity;
  const height = parseFloat(style.height);
  const padding_top = parseFloat(style.paddingTop);
  const padding_bottom = parseFloat(style.paddingBottom);
  const margin_top = parseFloat(style.marginTop);
  const margin_bottom = parseFloat(style.marginBottom);
  const border_top_width = parseFloat(style.borderTopWidth);
  const border_bottom_width = parseFloat(style.borderBottomWidth);
  return {
    delay,
    duration,
    easing,
    css: (t) => `overflow: hidden;opacity: ${Math.min(t * 20, 1) * opacity};height: ${t * height}px;padding-top: ${t * padding_top}px;padding-bottom: ${t * padding_bottom}px;margin-top: ${t * margin_top}px;margin-bottom: ${t * margin_bottom}px;border-top-width: ${t * border_top_width}px;border-bottom-width: ${t * border_bottom_width}px;`
  };
}
__name(slide, "slide");
function slideFade(node, options) {
  const fadeEasing = options.easingFade || options.easing || identity;
  const slideEasing = options.easingSlide || options.easing || identity;
  const fadeTransition = fade(node);
  const slideTransition = slide(node);
  return {
    delay: options.delay || 0,
    duration: options.duration || 500,
    easing: identity,
    css: (t) => {
      const fadeT = fadeEasing(t);
      const slideT = slideEasing(t);
      return `${slideTransition.css(slideT, 1 - slideT)}; ${fadeTransition.css(fadeT, 1 - fadeT)}`;
    }
  };
}
__name(slideFade, "slideFade");
const s_DEFAULT_TRANSITION = /* @__PURE__ */ __name(() => void 0, "s_DEFAULT_TRANSITION");
const s_DEFAULT_TRANSITION_OPTIONS = {};
const TJSGlassPane_svelte_svelte_type_style_lang = "";
function resizeObserver(node, target) {
  ResizeObserverManager.add(node, target);
  return {
    update: (newTarget) => {
      ResizeObserverManager.remove(node, target);
      target = newTarget;
      ResizeObserverManager.add(node, target);
    },
    destroy: () => {
      ResizeObserverManager.remove(node, target);
    }
  };
}
__name(resizeObserver, "resizeObserver");
resizeObserver.updateCache = function(el) {
  if (!(el instanceof HTMLElement)) {
    throw new TypeError(`resizeObserverUpdate error: 'el' is not an HTMLElement.`);
  }
  const subscribers = s_MAP.get(el);
  if (Array.isArray(subscribers)) {
    const computed = globalThis.getComputedStyle(el);
    const borderBottom = styleParsePixels(el.style.borderBottom) ?? styleParsePixels(computed.borderBottom) ?? 0;
    const borderLeft = styleParsePixels(el.style.borderLeft) ?? styleParsePixels(computed.borderLeft) ?? 0;
    const borderRight = styleParsePixels(el.style.borderRight) ?? styleParsePixels(computed.borderRight) ?? 0;
    const borderTop = styleParsePixels(el.style.borderTop) ?? styleParsePixels(computed.borderTop) ?? 0;
    const paddingBottom = styleParsePixels(el.style.paddingBottom) ?? styleParsePixels(computed.paddingBottom) ?? 0;
    const paddingLeft = styleParsePixels(el.style.paddingLeft) ?? styleParsePixels(computed.paddingLeft) ?? 0;
    const paddingRight = styleParsePixels(el.style.paddingRight) ?? styleParsePixels(computed.paddingRight) ?? 0;
    const paddingTop = styleParsePixels(el.style.paddingTop) ?? styleParsePixels(computed.paddingTop) ?? 0;
    const additionalWidth = borderLeft + borderRight + paddingLeft + paddingRight;
    const additionalHeight = borderTop + borderBottom + paddingTop + paddingBottom;
    for (const subscriber of subscribers) {
      subscriber.styles.additionalWidth = additionalWidth;
      subscriber.styles.additionalHeight = additionalHeight;
      s_UPDATE_SUBSCRIBER(subscriber, subscriber.contentWidth, subscriber.contentHeight);
    }
  }
};
const s_MAP = /* @__PURE__ */ new Map();
class ResizeObserverManager {
  static add(el, target) {
    const updateType = s_GET_UPDATE_TYPE(target);
    if (updateType === 0) {
      throw new Error(`'target' does not match supported ResizeObserverManager update mechanisms.`);
    }
    const computed = globalThis.getComputedStyle(el);
    const borderBottom = styleParsePixels(el.style.borderBottom) ?? styleParsePixels(computed.borderBottom) ?? 0;
    const borderLeft = styleParsePixels(el.style.borderLeft) ?? styleParsePixels(computed.borderLeft) ?? 0;
    const borderRight = styleParsePixels(el.style.borderRight) ?? styleParsePixels(computed.borderRight) ?? 0;
    const borderTop = styleParsePixels(el.style.borderTop) ?? styleParsePixels(computed.borderTop) ?? 0;
    const paddingBottom = styleParsePixels(el.style.paddingBottom) ?? styleParsePixels(computed.paddingBottom) ?? 0;
    const paddingLeft = styleParsePixels(el.style.paddingLeft) ?? styleParsePixels(computed.paddingLeft) ?? 0;
    const paddingRight = styleParsePixels(el.style.paddingRight) ?? styleParsePixels(computed.paddingRight) ?? 0;
    const paddingTop = styleParsePixels(el.style.paddingTop) ?? styleParsePixels(computed.paddingTop) ?? 0;
    const data = {
      updateType,
      target,
      contentWidth: 0,
      contentHeight: 0,
      styles: {
        additionalWidth: borderLeft + borderRight + paddingLeft + paddingRight,
        additionalHeight: borderTop + borderBottom + paddingTop + paddingBottom
      }
    };
    if (s_MAP.has(el)) {
      const subscribers = s_MAP.get(el);
      subscribers.push(data);
    } else {
      s_MAP.set(el, [data]);
    }
    s_RESIZE_OBSERVER.observe(el);
  }
  static remove(el, target = void 0) {
    const subscribers = s_MAP.get(el);
    if (Array.isArray(subscribers)) {
      const index2 = subscribers.findIndex((entry) => entry.target === target);
      if (index2 >= 0) {
        s_UPDATE_SUBSCRIBER(subscribers[index2], void 0, void 0);
        subscribers.splice(index2, 1);
      }
      if (subscribers.length === 0) {
        s_MAP.delete(el);
        s_RESIZE_OBSERVER.unobserve(el);
      }
    }
  }
}
__name(ResizeObserverManager, "ResizeObserverManager");
const s_UPDATE_TYPES = {
  none: 0,
  attribute: 1,
  function: 2,
  resizeObserved: 3,
  setContentBounds: 4,
  setDimension: 5,
  storeObject: 6,
  storesObject: 7
};
const s_RESIZE_OBSERVER = new ResizeObserver((entries) => {
  for (const entry of entries) {
    const subscribers = s_MAP.get(entry?.target);
    if (Array.isArray(subscribers)) {
      const contentWidth = entry.contentRect.width;
      const contentHeight = entry.contentRect.height;
      for (const subscriber of subscribers) {
        s_UPDATE_SUBSCRIBER(subscriber, contentWidth, contentHeight);
      }
    }
  }
});
function s_GET_UPDATE_TYPE(target) {
  if (target?.resizeObserved instanceof Function) {
    return s_UPDATE_TYPES.resizeObserved;
  }
  if (target?.setDimension instanceof Function) {
    return s_UPDATE_TYPES.setDimension;
  }
  if (target?.setContentBounds instanceof Function) {
    return s_UPDATE_TYPES.setContentBounds;
  }
  const targetType = typeof target;
  if (targetType === "object" || targetType === "function") {
    if (isUpdatableStore(target.resizeObserved)) {
      return s_UPDATE_TYPES.storeObject;
    }
    const stores = target?.stores;
    if (typeof stores === "object" || typeof stores === "function") {
      if (isUpdatableStore(stores.resizeObserved)) {
        return s_UPDATE_TYPES.storesObject;
      }
    }
  }
  if (targetType === "object") {
    return s_UPDATE_TYPES.attribute;
  }
  if (targetType === "function") {
    return s_UPDATE_TYPES.function;
  }
  return s_UPDATE_TYPES.none;
}
__name(s_GET_UPDATE_TYPE, "s_GET_UPDATE_TYPE");
function s_UPDATE_SUBSCRIBER(subscriber, contentWidth, contentHeight) {
  const styles = subscriber.styles;
  subscriber.contentWidth = contentWidth;
  subscriber.contentHeight = contentHeight;
  const offsetWidth = Number.isFinite(contentWidth) ? contentWidth + styles.additionalWidth : void 0;
  const offsetHeight = Number.isFinite(contentHeight) ? contentHeight + styles.additionalHeight : void 0;
  const target = subscriber.target;
  switch (subscriber.updateType) {
    case s_UPDATE_TYPES.attribute:
      target.contentWidth = contentWidth;
      target.contentHeight = contentHeight;
      target.offsetWidth = offsetWidth;
      target.offsetHeight = offsetHeight;
      break;
    case s_UPDATE_TYPES.function:
      target?.(offsetWidth, offsetHeight, contentWidth, contentHeight);
      break;
    case s_UPDATE_TYPES.resizeObserved:
      target.resizeObserved?.(offsetWidth, offsetHeight, contentWidth, contentHeight);
      break;
    case s_UPDATE_TYPES.setContentBounds:
      target.setContentBounds?.(contentWidth, contentHeight);
      break;
    case s_UPDATE_TYPES.setDimension:
      target.setDimension?.(offsetWidth, offsetHeight);
      break;
    case s_UPDATE_TYPES.storeObject:
      target.resizeObserved.update((object) => {
        object.contentHeight = contentHeight;
        object.contentWidth = contentWidth;
        object.offsetHeight = offsetHeight;
        object.offsetWidth = offsetWidth;
        return object;
      });
      break;
    case s_UPDATE_TYPES.storesObject:
      target.stores.resizeObserved.update((object) => {
        object.contentHeight = contentHeight;
        object.contentWidth = contentWidth;
        object.offsetHeight = offsetHeight;
        object.offsetWidth = offsetWidth;
        return object;
      });
      break;
  }
}
__name(s_UPDATE_SUBSCRIBER, "s_UPDATE_SUBSCRIBER");
function applyScrolltop(element2, store) {
  if (!isWritableStore(store)) {
    throw new TypeError(`applyScrolltop error: 'store' must be a writable Svelte store.`);
  }
  function storeUpdate(value) {
    if (!Number.isFinite(value)) {
      return;
    }
    setTimeout(() => element2.scrollTop = value, 0);
  }
  __name(storeUpdate, "storeUpdate");
  let unsubscribe = store.subscribe(storeUpdate);
  const resizeControl = resizeObserver(element2, debounce$1(() => {
    if (element2.isConnected) {
      store.set(element2.scrollTop);
    }
  }, 500));
  function onScroll(event) {
    store.set(event.target.scrollTop);
  }
  __name(onScroll, "onScroll");
  const debounceFn = debounce$1((e) => onScroll(e), 500);
  element2.addEventListener("scroll", debounceFn);
  return {
    update: (newStore) => {
      unsubscribe();
      store = newStore;
      if (!isWritableStore(store)) {
        throw new TypeError(`applyScrolltop.update error: 'store' must be a writable Svelte store.`);
      }
      unsubscribe = store.subscribe(storeUpdate);
    },
    destroy: () => {
      element2.removeEventListener("scroll", debounceFn);
      unsubscribe();
      resizeControl.destroy();
    }
  };
}
__name(applyScrolltop, "applyScrolltop");
function applyStyles(node, properties) {
  function setProperties() {
    if (typeof properties !== "object") {
      return;
    }
    for (const prop of Object.keys(properties)) {
      node.style.setProperty(`${prop}`, properties[prop]);
    }
  }
  __name(setProperties, "setProperties");
  setProperties();
  return {
    update(newProperties) {
      properties = newProperties;
      setProperties();
    }
  };
}
__name(applyStyles, "applyStyles");
function autoBlur(node) {
  function onBlur() {
    document.body.removeEventListener("pointerdown", onPointerDown);
  }
  __name(onBlur, "onBlur");
  function onFocus() {
    document.body.addEventListener("pointerdown", onPointerDown);
  }
  __name(onFocus, "onFocus");
  function onPointerDown(event) {
    if (event.target === node || node.contains(event.target)) {
      return;
    }
    if (document.activeElement === node) {
      node.blur();
    }
  }
  __name(onPointerDown, "onPointerDown");
  node.addEventListener("blur", onBlur);
  node.addEventListener("focus", onFocus);
  return {
    destroy: () => {
      document.body.removeEventListener("pointerdown", onPointerDown);
      node.removeEventListener("blur", onBlur);
      node.removeEventListener("focus", onFocus);
    }
  };
}
__name(autoBlur, "autoBlur");
function draggable(node, {
  position,
  active: active2 = true,
  button = 0,
  storeDragging = void 0,
  ease = false,
  easeOptions = { duration: 0.1, ease: cubicOut }
}) {
  let initialPosition = null;
  let initialDragPoint = {};
  let dragging = false;
  let quickTo = position.animate.quickTo(["top", "left"], easeOptions);
  const handlers = {
    dragDown: ["pointerdown", (e) => onDragPointerDown(e), false],
    dragMove: ["pointermove", (e) => onDragPointerChange(e), false],
    dragUp: ["pointerup", (e) => onDragPointerUp(e), false]
  };
  function activateListeners() {
    node.addEventListener(...handlers.dragDown);
    node.classList.add("draggable");
  }
  __name(activateListeners, "activateListeners");
  function removeListeners() {
    if (typeof storeDragging?.set === "function") {
      storeDragging.set(false);
    }
    node.removeEventListener(...handlers.dragDown);
    node.removeEventListener(...handlers.dragMove);
    node.removeEventListener(...handlers.dragUp);
    node.classList.remove("draggable");
  }
  __name(removeListeners, "removeListeners");
  if (active2) {
    activateListeners();
  }
  function onDragPointerDown(event) {
    if (event.button !== button || !event.isPrimary) {
      return;
    }
    if (!position.enabled) {
      return;
    }
    event.preventDefault();
    dragging = false;
    initialPosition = position.get();
    initialDragPoint = { x: event.clientX, y: event.clientY };
    node.addEventListener(...handlers.dragMove);
    node.addEventListener(...handlers.dragUp);
    node.setPointerCapture(event.pointerId);
  }
  __name(onDragPointerDown, "onDragPointerDown");
  function onDragPointerChange(event) {
    if ((event.buttons & 1) === 0) {
      onDragPointerUp(event);
      return;
    }
    if (event.button !== -1 || !event.isPrimary) {
      return;
    }
    event.preventDefault();
    if (!dragging && typeof storeDragging?.set === "function") {
      dragging = true;
      storeDragging.set(true);
    }
    const newLeft = initialPosition.left + (event.clientX - initialDragPoint.x);
    const newTop = initialPosition.top + (event.clientY - initialDragPoint.y);
    if (ease) {
      quickTo(newTop, newLeft);
    } else {
      s_POSITION_DATA.left = newLeft;
      s_POSITION_DATA.top = newTop;
      position.set(s_POSITION_DATA);
    }
  }
  __name(onDragPointerChange, "onDragPointerChange");
  function onDragPointerUp(event) {
    event.preventDefault();
    dragging = false;
    if (typeof storeDragging?.set === "function") {
      storeDragging.set(false);
    }
    node.removeEventListener(...handlers.dragMove);
    node.removeEventListener(...handlers.dragUp);
  }
  __name(onDragPointerUp, "onDragPointerUp");
  return {
    update: (options) => {
      if (typeof options.active === "boolean") {
        active2 = options.active;
        if (active2) {
          activateListeners();
        } else {
          removeListeners();
        }
      }
      if (typeof options.button === "number") {
        button = options.button;
      }
      if (options.position !== void 0 && options.position !== position) {
        position = options.position;
        quickTo = position.animate.quickTo(["top", "left"], easeOptions);
      }
      if (typeof options.ease === "boolean") {
        ease = options.ease;
      }
      if (typeof options.easeOptions === "object") {
        easeOptions = options.easeOptions;
        quickTo.options(easeOptions);
      }
    },
    destroy: () => removeListeners()
  };
}
__name(draggable, "draggable");
class DraggableOptions {
  #ease = false;
  #easeOptions = { duration: 0.1, ease: cubicOut };
  #subscriptions = [];
  constructor({ ease, easeOptions } = {}) {
    Object.defineProperty(this, "ease", {
      get: () => {
        return this.#ease;
      },
      set: (newEase) => {
        if (typeof newEase !== "boolean") {
          throw new TypeError(`'ease' is not a boolean.`);
        }
        this.#ease = newEase;
        this.#updateSubscribers();
      },
      enumerable: true
    });
    Object.defineProperty(this, "easeOptions", {
      get: () => {
        return this.#easeOptions;
      },
      set: (newEaseOptions) => {
        if (newEaseOptions === null || typeof newEaseOptions !== "object") {
          throw new TypeError(`'easeOptions' is not an object.`);
        }
        if (newEaseOptions.duration !== void 0) {
          if (!Number.isFinite(newEaseOptions.duration)) {
            throw new TypeError(`'easeOptions.duration' is not a finite number.`);
          }
          if (newEaseOptions.duration < 0) {
            throw new Error(`'easeOptions.duration' is less than 0.`);
          }
          this.#easeOptions.duration = newEaseOptions.duration;
        }
        if (newEaseOptions.ease !== void 0) {
          if (typeof newEaseOptions.ease !== "function" && typeof newEaseOptions.ease !== "string") {
            throw new TypeError(`'easeOptions.ease' is not a function or string.`);
          }
          this.#easeOptions.ease = newEaseOptions.ease;
        }
        this.#updateSubscribers();
      },
      enumerable: true
    });
    if (ease !== void 0) {
      this.ease = ease;
    }
    if (easeOptions !== void 0) {
      this.easeOptions = easeOptions;
    }
  }
  get easeDuration() {
    return this.#easeOptions.duration;
  }
  get easeValue() {
    return this.#easeOptions.ease;
  }
  set easeDuration(duration) {
    if (!Number.isFinite(duration)) {
      throw new TypeError(`'duration' is not a finite number.`);
    }
    if (duration < 0) {
      throw new Error(`'duration' is less than 0.`);
    }
    this.#easeOptions.duration = duration;
    this.#updateSubscribers();
  }
  set easeValue(value) {
    if (typeof value !== "function" && typeof value !== "string") {
      throw new TypeError(`'value' is not a function or string.`);
    }
    this.#easeOptions.ease = value;
    this.#updateSubscribers();
  }
  reset() {
    this.#ease = false;
    this.#easeOptions = { duration: 0.1, ease: cubicOut };
    this.#updateSubscribers();
  }
  resetEase() {
    this.#easeOptions = { duration: 0.1, ease: cubicOut };
    this.#updateSubscribers();
  }
  subscribe(handler) {
    this.#subscriptions.push(handler);
    handler(this);
    return () => {
      const index2 = this.#subscriptions.findIndex((sub) => sub === handler);
      if (index2 >= 0) {
        this.#subscriptions.splice(index2, 1);
      }
    };
  }
  #updateSubscribers() {
    const subscriptions = this.#subscriptions;
    if (subscriptions.length > 0) {
      for (let cntr = 0; cntr < subscriptions.length; cntr++) {
        subscriptions[cntr](this);
      }
    }
  }
}
__name(DraggableOptions, "DraggableOptions");
draggable.options = (options) => new DraggableOptions(options);
const s_POSITION_DATA = { left: 0, top: 0 };
function create_fragment$m(ctx) {
  let a;
  let html_tag;
  let t;
  let a_class_value;
  let applyStyles_action;
  let mounted;
  let dispose;
  return {
    c() {
      a = element("a");
      html_tag = new HtmlTag(false);
      t = text(ctx[2]);
      html_tag.a = t;
      attr(a, "class", a_class_value = "header-button " + ctx[0].class);
      attr(a, "role", "presentation");
    },
    m(target, anchor) {
      insert(target, a, anchor);
      html_tag.m(ctx[1], a);
      append(a, t);
      if (!mounted) {
        dispose = [
          listen(a, "click", stop_propagation(prevent_default(ctx[4])), true),
          listen(a, "pointerdown", stop_propagation(prevent_default(pointerdown_handler)), true),
          listen(a, "mousedown", stop_propagation(prevent_default(mousedown_handler)), true),
          listen(a, "dblclick", stop_propagation(prevent_default(dblclick_handler)), true),
          action_destroyer(applyStyles_action = applyStyles.call(null, a, ctx[3]))
        ];
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & 2)
        html_tag.p(ctx2[1]);
      if (dirty & 4)
        set_data(t, ctx2[2]);
      if (dirty & 1 && a_class_value !== (a_class_value = "header-button " + ctx2[0].class)) {
        attr(a, "class", a_class_value);
      }
      if (applyStyles_action && is_function(applyStyles_action.update) && dirty & 8)
        applyStyles_action.update.call(null, ctx2[3]);
    },
    i: noop$1,
    o: noop$1,
    d(detaching) {
      if (detaching)
        detach(a);
      mounted = false;
      run_all(dispose);
    }
  };
}
__name(create_fragment$m, "create_fragment$m");
const s_REGEX_HTML = /^\s*<.*>$/;
const pointerdown_handler = /* @__PURE__ */ __name(() => null, "pointerdown_handler");
const mousedown_handler = /* @__PURE__ */ __name(() => null, "mousedown_handler");
const dblclick_handler = /* @__PURE__ */ __name(() => null, "dblclick_handler");
function instance$k($$self, $$props, $$invalidate) {
  let { button = void 0 } = $$props;
  let icon, label, title, styles;
  function onClick(event) {
    const invoke = button.callback ?? button.onclick;
    if (typeof invoke === "function") {
      invoke.call(button, event);
      $$invalidate(0, button);
    }
  }
  __name(onClick, "onClick");
  $$self.$$set = ($$props2) => {
    if ("button" in $$props2)
      $$invalidate(0, button = $$props2.button);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & 33) {
      if (button) {
        $$invalidate(5, title = typeof button.title === "string" ? localize(button.title) : "");
        $$invalidate(1, icon = typeof button.icon !== "string" ? void 0 : s_REGEX_HTML.test(button.icon) ? button.icon : `<i class="${button.icon}" title="${title}"></i>`);
        $$invalidate(2, label = typeof button.label === "string" ? localize(button.label) : "");
        $$invalidate(3, styles = typeof button.styles === "object" ? button.styles : void 0);
      }
    }
  };
  return [button, icon, label, styles, onClick, title];
}
__name(instance$k, "instance$k");
class TJSHeaderButton extends SvelteComponent {
  constructor(options) {
    super();
    init$1(this, options, instance$k, create_fragment$m, safe_not_equal, { button: 0 });
  }
  get button() {
    return this.$$.ctx[0];
  }
  set button(button) {
    this.$$set({ button });
    flush();
  }
}
__name(TJSHeaderButton, "TJSHeaderButton");
const TJSApplicationHeader_svelte_svelte_type_style_lang = "";
function get_each_context$4(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[20] = list[i];
  return child_ctx;
}
__name(get_each_context$4, "get_each_context$4");
function create_each_block$4(ctx) {
  let switch_instance;
  let switch_instance_anchor;
  let current;
  const switch_instance_spread_levels = [ctx[20].props];
  var switch_value = ctx[20].class;
  function switch_props(ctx2) {
    let switch_instance_props = {};
    for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
      switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    }
    return { props: switch_instance_props };
  }
  __name(switch_props, "switch_props");
  if (switch_value) {
    switch_instance = construct_svelte_component(switch_value, switch_props());
  }
  return {
    c() {
      if (switch_instance)
        create_component(switch_instance.$$.fragment);
      switch_instance_anchor = empty();
    },
    m(target, anchor) {
      if (switch_instance)
        mount_component(switch_instance, target, anchor);
      insert(target, switch_instance_anchor, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const switch_instance_changes = dirty & 8 ? get_spread_update(switch_instance_spread_levels, [get_spread_object(ctx2[20].props)]) : {};
      if (switch_value !== (switch_value = ctx2[20].class)) {
        if (switch_instance) {
          group_outros();
          const old_component = switch_instance;
          transition_out(old_component.$$.fragment, 1, 0, () => {
            destroy_component(old_component, 1);
          });
          check_outros();
        }
        if (switch_value) {
          switch_instance = construct_svelte_component(switch_value, switch_props());
          create_component(switch_instance.$$.fragment);
          transition_in(switch_instance.$$.fragment, 1);
          mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
        } else {
          switch_instance = null;
        }
      } else if (switch_value) {
        switch_instance.$set(switch_instance_changes);
      }
    },
    i(local) {
      if (current)
        return;
      if (switch_instance)
        transition_in(switch_instance.$$.fragment, local);
      current = true;
    },
    o(local) {
      if (switch_instance)
        transition_out(switch_instance.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(switch_instance_anchor);
      if (switch_instance)
        destroy_component(switch_instance, detaching);
    }
  };
}
__name(create_each_block$4, "create_each_block$4");
function create_key_block$2(ctx) {
  let header;
  let h4;
  let t0_value = localize(ctx[5]) + "";
  let t0;
  let t1;
  let draggable_action;
  let minimizable_action;
  let current;
  let mounted;
  let dispose;
  let each_value = ctx[3];
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
  }
  const out = /* @__PURE__ */ __name((i) => transition_out(each_blocks[i], 1, 1, () => {
    each_blocks[i] = null;
  }), "out");
  return {
    c() {
      header = element("header");
      h4 = element("h4");
      t0 = text(t0_value);
      t1 = space();
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      attr(h4, "class", "window-title svelte-3umz0z");
      set_style(h4, "display", ctx[2]);
      attr(header, "class", "window-header flexrow");
    },
    m(target, anchor) {
      insert(target, header, anchor);
      append(header, h4);
      append(h4, t0);
      append(header, t1);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(header, null);
      }
      current = true;
      if (!mounted) {
        dispose = [
          action_destroyer(draggable_action = ctx[0].call(null, header, ctx[1])),
          action_destroyer(minimizable_action = ctx[12].call(null, header, ctx[4]))
        ];
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if ((!current || dirty & 32) && t0_value !== (t0_value = localize(ctx2[5]) + ""))
        set_data(t0, t0_value);
      if (dirty & 4) {
        set_style(h4, "display", ctx2[2]);
      }
      if (dirty & 8) {
        each_value = ctx2[3];
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context$4(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
            transition_in(each_blocks[i], 1);
          } else {
            each_blocks[i] = create_each_block$4(child_ctx);
            each_blocks[i].c();
            transition_in(each_blocks[i], 1);
            each_blocks[i].m(header, null);
          }
        }
        group_outros();
        for (i = each_value.length; i < each_blocks.length; i += 1) {
          out(i);
        }
        check_outros();
      }
      if (draggable_action && is_function(draggable_action.update) && dirty & 2)
        draggable_action.update.call(null, ctx2[1]);
      if (minimizable_action && is_function(minimizable_action.update) && dirty & 16)
        minimizable_action.update.call(null, ctx2[4]);
    },
    i(local) {
      if (current)
        return;
      for (let i = 0; i < each_value.length; i += 1) {
        transition_in(each_blocks[i]);
      }
      current = true;
    },
    o(local) {
      each_blocks = each_blocks.filter(Boolean);
      for (let i = 0; i < each_blocks.length; i += 1) {
        transition_out(each_blocks[i]);
      }
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(header);
      destroy_each(each_blocks, detaching);
      mounted = false;
      run_all(dispose);
    }
  };
}
__name(create_key_block$2, "create_key_block$2");
function create_fragment$l(ctx) {
  let previous_key = ctx[0];
  let key_block_anchor;
  let current;
  let key_block = create_key_block$2(ctx);
  return {
    c() {
      key_block.c();
      key_block_anchor = empty();
    },
    m(target, anchor) {
      key_block.m(target, anchor);
      insert(target, key_block_anchor, anchor);
      current = true;
    },
    p(ctx2, [dirty]) {
      if (dirty & 1 && safe_not_equal(previous_key, previous_key = ctx2[0])) {
        group_outros();
        transition_out(key_block, 1, 1, noop$1);
        check_outros();
        key_block = create_key_block$2(ctx2);
        key_block.c();
        transition_in(key_block, 1);
        key_block.m(key_block_anchor.parentNode, key_block_anchor);
      } else {
        key_block.p(ctx2, dirty);
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(key_block);
      current = true;
    },
    o(local) {
      transition_out(key_block);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(key_block_anchor);
      key_block.d(detaching);
    }
  };
}
__name(create_fragment$l, "create_fragment$l");
function instance$j($$self, $$props, $$invalidate) {
  let $storeHeaderButtons;
  let $storeMinimized;
  let $storeHeaderNoTitleMinimized;
  let $storeDraggable;
  let $storeMinimizable;
  let $storeTitle;
  let { draggable: draggable$1 = void 0 } = $$props;
  let { draggableOptions = void 0 } = $$props;
  const application = getContext("external").application;
  const storeTitle = application.reactive.storeAppOptions.title;
  component_subscribe($$self, storeTitle, (value) => $$invalidate(5, $storeTitle = value));
  const storeDraggable = application.reactive.storeAppOptions.draggable;
  component_subscribe($$self, storeDraggable, (value) => $$invalidate(17, $storeDraggable = value));
  const storeDragging = application.reactive.storeUIState.dragging;
  const storeHeaderButtons = application.reactive.storeUIState.headerButtons;
  component_subscribe($$self, storeHeaderButtons, (value) => $$invalidate(14, $storeHeaderButtons = value));
  const storeHeaderNoTitleMinimized = application.reactive.storeAppOptions.headerNoTitleMinimized;
  component_subscribe($$self, storeHeaderNoTitleMinimized, (value) => $$invalidate(16, $storeHeaderNoTitleMinimized = value));
  const storeMinimizable = application.reactive.storeAppOptions.minimizable;
  component_subscribe($$self, storeMinimizable, (value) => $$invalidate(4, $storeMinimizable = value));
  const storeMinimized = application.reactive.storeUIState.minimized;
  component_subscribe($$self, storeMinimized, (value) => $$invalidate(15, $storeMinimized = value));
  let dragOptions;
  let displayHeaderTitle;
  let buttons;
  function minimizable(node, booleanStore) {
    const callback2 = application._onToggleMinimize.bind(application);
    function activateListeners() {
      node.addEventListener("dblclick", callback2);
    }
    __name(activateListeners, "activateListeners");
    function removeListeners() {
      node.removeEventListener("dblclick", callback2);
    }
    __name(removeListeners, "removeListeners");
    if (booleanStore) {
      activateListeners();
    }
    return {
      update: (booleanStore2) => {
        if (booleanStore2) {
          activateListeners();
        } else {
          removeListeners();
        }
      },
      destroy: () => removeListeners()
    };
  }
  __name(minimizable, "minimizable");
  $$self.$$set = ($$props2) => {
    if ("draggable" in $$props2)
      $$invalidate(0, draggable$1 = $$props2.draggable);
    if ("draggableOptions" in $$props2)
      $$invalidate(13, draggableOptions = $$props2.draggableOptions);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & 1) {
      $$invalidate(0, draggable$1 = typeof draggable$1 === "function" ? draggable$1 : draggable);
    }
    if ($$self.$$.dirty & 139264) {
      $$invalidate(1, dragOptions = Object.assign(
        {},
        {
          ease: true,
          easeOptions: { duration: 0.1, ease: cubicOut }
        },
        typeof draggableOptions === "object" ? draggableOptions : {},
        {
          position: application.position,
          active: $storeDraggable,
          storeDragging
        }
      ));
    }
    if ($$self.$$.dirty & 98304) {
      $$invalidate(2, displayHeaderTitle = $storeHeaderNoTitleMinimized && $storeMinimized ? "none" : null);
    }
    if ($$self.$$.dirty & 16384) {
      {
        $$invalidate(3, buttons = $storeHeaderButtons.reduce(
          (array, button) => {
            array.push(isSvelteComponent(button) ? { class: button, props: {} } : {
              class: TJSHeaderButton,
              props: { button }
            });
            return array;
          },
          []
        ));
      }
    }
  };
  return [
    draggable$1,
    dragOptions,
    displayHeaderTitle,
    buttons,
    $storeMinimizable,
    $storeTitle,
    storeTitle,
    storeDraggable,
    storeHeaderButtons,
    storeHeaderNoTitleMinimized,
    storeMinimizable,
    storeMinimized,
    minimizable,
    draggableOptions,
    $storeHeaderButtons,
    $storeMinimized,
    $storeHeaderNoTitleMinimized,
    $storeDraggable
  ];
}
__name(instance$j, "instance$j");
class TJSApplicationHeader extends SvelteComponent {
  constructor(options) {
    super();
    init$1(this, options, instance$j, create_fragment$l, safe_not_equal, { draggable: 0, draggableOptions: 13 });
  }
}
__name(TJSApplicationHeader, "TJSApplicationHeader");
function create_fragment$k(ctx) {
  let div;
  let resizable_action;
  let mounted;
  let dispose;
  return {
    c() {
      div = element("div");
      div.innerHTML = `<i class="fas fa-arrows-alt-h"></i>`;
      attr(div, "class", "window-resizable-handle");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      ctx[10](div);
      if (!mounted) {
        dispose = action_destroyer(resizable_action = ctx[6].call(null, div, {
          active: ctx[1],
          storeResizing: ctx[5]
        }));
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (resizable_action && is_function(resizable_action.update) && dirty & 2)
        resizable_action.update.call(null, {
          active: ctx2[1],
          storeResizing: ctx2[5]
        });
    },
    i: noop$1,
    o: noop$1,
    d(detaching) {
      if (detaching)
        detach(div);
      ctx[10](null);
      mounted = false;
      dispose();
    }
  };
}
__name(create_fragment$k, "create_fragment$k");
function instance$i($$self, $$props, $$invalidate) {
  let $storeElementRoot;
  let $storeMinimized;
  let $storeResizable;
  let { isResizable = false } = $$props;
  const application = getContext("external").application;
  const storeElementRoot = getContext("storeElementRoot");
  component_subscribe($$self, storeElementRoot, (value) => $$invalidate(8, $storeElementRoot = value));
  const storeResizable = application.reactive.storeAppOptions.resizable;
  component_subscribe($$self, storeResizable, (value) => $$invalidate(1, $storeResizable = value));
  const storeMinimized = application.reactive.storeUIState.minimized;
  component_subscribe($$self, storeMinimized, (value) => $$invalidate(9, $storeMinimized = value));
  const storeResizing = application.reactive.storeUIState.resizing;
  let elementResize;
  function resizable(node, { active: active2 = true, storeResizing: storeResizing2 = void 0 } = {}) {
    let position = null;
    let initialPosition = {};
    let resizing = false;
    const handlers = {
      resizeDown: ["pointerdown", (e) => onResizePointerDown(e), false],
      resizeMove: ["pointermove", (e) => onResizePointerMove(e), false],
      resizeUp: ["pointerup", (e) => onResizePointerUp(e), false]
    };
    function activateListeners() {
      node.addEventListener(...handlers.resizeDown);
      $$invalidate(7, isResizable = true);
      node.style.display = "block";
    }
    __name(activateListeners, "activateListeners");
    function removeListeners() {
      if (typeof storeResizing2?.set === "function") {
        storeResizing2.set(false);
      }
      node.removeEventListener(...handlers.resizeDown);
      node.removeEventListener(...handlers.resizeMove);
      node.removeEventListener(...handlers.resizeUp);
      node.style.display = "none";
      $$invalidate(7, isResizable = false);
    }
    __name(removeListeners, "removeListeners");
    if (active2) {
      activateListeners();
    } else {
      node.style.display = "none";
    }
    function onResizePointerDown(event) {
      event.preventDefault();
      resizing = false;
      position = application.position.get();
      if (position.height === "auto") {
        position.height = $storeElementRoot.clientHeight;
      }
      if (position.width === "auto") {
        position.width = $storeElementRoot.clientWidth;
      }
      initialPosition = { x: event.clientX, y: event.clientY };
      node.addEventListener(...handlers.resizeMove);
      node.addEventListener(...handlers.resizeUp);
      node.setPointerCapture(event.pointerId);
    }
    __name(onResizePointerDown, "onResizePointerDown");
    function onResizePointerMove(event) {
      event.preventDefault();
      if (!resizing && typeof storeResizing2?.set === "function") {
        resizing = true;
        storeResizing2.set(true);
      }
      application.position.set({
        width: position.width + (event.clientX - initialPosition.x),
        height: position.height + (event.clientY - initialPosition.y)
      });
    }
    __name(onResizePointerMove, "onResizePointerMove");
    function onResizePointerUp(event) {
      resizing = false;
      if (typeof storeResizing2?.set === "function") {
        storeResizing2.set(false);
      }
      event.preventDefault();
      node.removeEventListener(...handlers.resizeMove);
      node.removeEventListener(...handlers.resizeUp);
      application._onResize(event);
    }
    __name(onResizePointerUp, "onResizePointerUp");
    return {
      update: ({ active: active3 }) => {
        if (active3) {
          activateListeners();
        } else {
          removeListeners();
        }
      },
      destroy: () => removeListeners()
    };
  }
  __name(resizable, "resizable");
  function div_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      elementResize = $$value;
      $$invalidate(0, elementResize), $$invalidate(7, isResizable), $$invalidate(9, $storeMinimized), $$invalidate(8, $storeElementRoot);
    });
  }
  __name(div_binding, "div_binding");
  $$self.$$set = ($$props2) => {
    if ("isResizable" in $$props2)
      $$invalidate(7, isResizable = $$props2.isResizable);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & 897) {
      if (elementResize) {
        $$invalidate(0, elementResize.style.display = isResizable && !$storeMinimized ? "block" : "none", elementResize);
        const elementRoot = $storeElementRoot;
        if (elementRoot) {
          elementRoot.classList[isResizable ? "add" : "remove"]("resizable");
        }
      }
    }
  };
  return [
    elementResize,
    $storeResizable,
    storeElementRoot,
    storeResizable,
    storeMinimized,
    storeResizing,
    resizable,
    isResizable,
    $storeElementRoot,
    $storeMinimized,
    div_binding
  ];
}
__name(instance$i, "instance$i");
class ResizableHandle extends SvelteComponent {
  constructor(options) {
    super();
    init$1(this, options, instance$i, create_fragment$k, safe_not_equal, { isResizable: 7 });
  }
}
__name(ResizableHandle, "ResizableHandle");
const ApplicationShell_svelte_svelte_type_style_lang = "";
function create_else_block(ctx) {
  let current;
  const default_slot_template = ctx[27].default;
  const default_slot = create_slot(default_slot_template, ctx, ctx[26], null);
  return {
    c() {
      if (default_slot)
        default_slot.c();
    },
    m(target, anchor) {
      if (default_slot) {
        default_slot.m(target, anchor);
      }
      current = true;
    },
    p(ctx2, dirty) {
      if (default_slot) {
        if (default_slot.p && (!current || dirty & 67108864)) {
          update_slot_base(
            default_slot,
            default_slot_template,
            ctx2,
            ctx2[26],
            !current ? get_all_dirty_from_scope(ctx2[26]) : get_slot_changes(default_slot_template, ctx2[26], dirty, null),
            null
          );
        }
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(default_slot, local);
      current = true;
    },
    o(local) {
      transition_out(default_slot, local);
      current = false;
    },
    d(detaching) {
      if (default_slot)
        default_slot.d(detaching);
    }
  };
}
__name(create_else_block, "create_else_block");
function create_if_block$4(ctx) {
  let tjscontainer;
  let current;
  tjscontainer = new TJSContainer({
    props: { children: ctx[14] }
  });
  return {
    c() {
      create_component(tjscontainer.$$.fragment);
    },
    m(target, anchor) {
      mount_component(tjscontainer, target, anchor);
      current = true;
    },
    p: noop$1,
    i(local) {
      if (current)
        return;
      transition_in(tjscontainer.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(tjscontainer.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(tjscontainer, detaching);
    }
  };
}
__name(create_if_block$4, "create_if_block$4");
function create_fragment$j(ctx) {
  let div;
  let tjsapplicationheader;
  let t0;
  let section;
  let current_block_type_index;
  let if_block;
  let applyStyles_action;
  let t1;
  let resizablehandle;
  let div_id_value;
  let div_class_value;
  let div_data_appid_value;
  let applyStyles_action_1;
  let div_intro;
  let div_outro;
  let current;
  let mounted;
  let dispose;
  tjsapplicationheader = new TJSApplicationHeader({
    props: {
      draggable: ctx[6],
      draggableOptions: ctx[7]
    }
  });
  const if_block_creators = [create_if_block$4, create_else_block];
  const if_blocks = [];
  function select_block_type(ctx2, dirty) {
    if (Array.isArray(ctx2[14]))
      return 0;
    return 1;
  }
  __name(select_block_type, "select_block_type");
  current_block_type_index = select_block_type(ctx);
  if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  resizablehandle = new ResizableHandle({});
  return {
    c() {
      div = element("div");
      create_component(tjsapplicationheader.$$.fragment);
      t0 = space();
      section = element("section");
      if_block.c();
      t1 = space();
      create_component(resizablehandle.$$.fragment);
      attr(section, "class", "window-content svelte-u0ofv1");
      attr(div, "id", div_id_value = ctx[10].id);
      attr(div, "class", div_class_value = "app window-app " + ctx[10].options.classes.join(" ") + " svelte-u0ofv1");
      attr(div, "data-appid", div_data_appid_value = ctx[10].appId);
    },
    m(target, anchor) {
      insert(target, div, anchor);
      mount_component(tjsapplicationheader, div, null);
      append(div, t0);
      append(div, section);
      if_blocks[current_block_type_index].m(section, null);
      ctx[28](section);
      append(div, t1);
      mount_component(resizablehandle, div, null);
      ctx[29](div);
      current = true;
      if (!mounted) {
        dispose = [
          action_destroyer(applyStyles_action = applyStyles.call(null, section, ctx[9])),
          action_destroyer(ctx[12].call(null, section, ctx[15])),
          listen(div, "pointerdown", ctx[13], true),
          action_destroyer(applyStyles_action_1 = applyStyles.call(null, div, ctx[8])),
          action_destroyer(ctx[11].call(null, div, ctx[16]))
        ];
        mounted = true;
      }
    },
    p(new_ctx, [dirty]) {
      ctx = new_ctx;
      const tjsapplicationheader_changes = {};
      if (dirty & 64)
        tjsapplicationheader_changes.draggable = ctx[6];
      if (dirty & 128)
        tjsapplicationheader_changes.draggableOptions = ctx[7];
      tjsapplicationheader.$set(tjsapplicationheader_changes);
      if_block.p(ctx, dirty);
      if (applyStyles_action && is_function(applyStyles_action.update) && dirty & 512)
        applyStyles_action.update.call(null, ctx[9]);
      if (!current || dirty & 1024 && div_id_value !== (div_id_value = ctx[10].id)) {
        attr(div, "id", div_id_value);
      }
      if (!current || dirty & 1024 && div_class_value !== (div_class_value = "app window-app " + ctx[10].options.classes.join(" ") + " svelte-u0ofv1")) {
        attr(div, "class", div_class_value);
      }
      if (!current || dirty & 1024 && div_data_appid_value !== (div_data_appid_value = ctx[10].appId)) {
        attr(div, "data-appid", div_data_appid_value);
      }
      if (applyStyles_action_1 && is_function(applyStyles_action_1.update) && dirty & 256)
        applyStyles_action_1.update.call(null, ctx[8]);
    },
    i(local) {
      if (current)
        return;
      transition_in(tjsapplicationheader.$$.fragment, local);
      transition_in(if_block);
      transition_in(resizablehandle.$$.fragment, local);
      add_render_callback(() => {
        if (div_outro)
          div_outro.end(1);
        div_intro = create_in_transition(div, ctx[2], ctx[4]);
        div_intro.start();
      });
      current = true;
    },
    o(local) {
      transition_out(tjsapplicationheader.$$.fragment, local);
      transition_out(if_block);
      transition_out(resizablehandle.$$.fragment, local);
      if (div_intro)
        div_intro.invalidate();
      div_outro = create_out_transition(div, ctx[3], ctx[5]);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div);
      destroy_component(tjsapplicationheader);
      if_blocks[current_block_type_index].d();
      ctx[28](null);
      destroy_component(resizablehandle);
      ctx[29](null);
      if (detaching && div_outro)
        div_outro.end();
      mounted = false;
      run_all(dispose);
    }
  };
}
__name(create_fragment$j, "create_fragment$j");
function instance$h($$self, $$props, $$invalidate) {
  let { $$slots: slots = {}, $$scope } = $$props;
  let { elementContent = void 0 } = $$props;
  let { elementRoot = void 0 } = $$props;
  let { draggable: draggable2 = void 0 } = $$props;
  let { draggableOptions = void 0 } = $$props;
  let { children: children2 = void 0 } = $$props;
  let { stylesApp = void 0 } = $$props;
  let { stylesContent = void 0 } = $$props;
  let { appOffsetHeight = false } = $$props;
  let { appOffsetWidth = false } = $$props;
  const appResizeObserver = !!appOffsetHeight || !!appOffsetWidth ? resizeObserver : () => null;
  let { contentOffsetHeight = false } = $$props;
  let { contentOffsetWidth = false } = $$props;
  const contentResizeObserver = !!contentOffsetHeight || !!contentOffsetWidth ? resizeObserver : () => null;
  const bringToTop = /* @__PURE__ */ __name((event) => {
    if (typeof application.options.popOut === "boolean" && application.options.popOut) {
      if (application !== ui?.activeWindow) {
        application.bringToTop.call(application);
      }
      if (document.activeElement !== document.body && event.target !== document.activeElement) {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        document.body.focus();
      }
    }
  }, "bringToTop");
  if (!getContext("storeElementContent")) {
    setContext("storeElementContent", writable$1(elementContent));
  }
  if (!getContext("storeElementRoot")) {
    setContext("storeElementRoot", writable$1(elementRoot));
  }
  const context = getContext("external");
  const application = context.application;
  const allChildren = Array.isArray(children2) ? children2 : typeof context === "object" ? context.children : void 0;
  let { transition = void 0 } = $$props;
  let { inTransition = s_DEFAULT_TRANSITION } = $$props;
  let { outTransition = s_DEFAULT_TRANSITION } = $$props;
  let { transitionOptions = void 0 } = $$props;
  let { inTransitionOptions = s_DEFAULT_TRANSITION_OPTIONS } = $$props;
  let { outTransitionOptions = s_DEFAULT_TRANSITION_OPTIONS } = $$props;
  let oldTransition = void 0;
  let oldTransitionOptions = void 0;
  function resizeObservedContent(offsetWidth, offsetHeight) {
    $$invalidate(20, contentOffsetWidth = offsetWidth);
    $$invalidate(19, contentOffsetHeight = offsetHeight);
  }
  __name(resizeObservedContent, "resizeObservedContent");
  function resizeObservedApp(offsetWidth, offsetHeight, contentWidth, contentHeight) {
    application.position.stores.resizeObserved.update((object) => {
      object.contentWidth = contentWidth;
      object.contentHeight = contentHeight;
      object.offsetWidth = offsetWidth;
      object.offsetHeight = offsetHeight;
      return object;
    });
    $$invalidate(17, appOffsetHeight = offsetHeight);
    $$invalidate(18, appOffsetWidth = offsetWidth);
  }
  __name(resizeObservedApp, "resizeObservedApp");
  function section_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      elementContent = $$value;
      $$invalidate(0, elementContent);
    });
  }
  __name(section_binding, "section_binding");
  function div_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      elementRoot = $$value;
      $$invalidate(1, elementRoot);
    });
  }
  __name(div_binding, "div_binding");
  $$self.$$set = ($$props2) => {
    if ("elementContent" in $$props2)
      $$invalidate(0, elementContent = $$props2.elementContent);
    if ("elementRoot" in $$props2)
      $$invalidate(1, elementRoot = $$props2.elementRoot);
    if ("draggable" in $$props2)
      $$invalidate(6, draggable2 = $$props2.draggable);
    if ("draggableOptions" in $$props2)
      $$invalidate(7, draggableOptions = $$props2.draggableOptions);
    if ("children" in $$props2)
      $$invalidate(21, children2 = $$props2.children);
    if ("stylesApp" in $$props2)
      $$invalidate(8, stylesApp = $$props2.stylesApp);
    if ("stylesContent" in $$props2)
      $$invalidate(9, stylesContent = $$props2.stylesContent);
    if ("appOffsetHeight" in $$props2)
      $$invalidate(17, appOffsetHeight = $$props2.appOffsetHeight);
    if ("appOffsetWidth" in $$props2)
      $$invalidate(18, appOffsetWidth = $$props2.appOffsetWidth);
    if ("contentOffsetHeight" in $$props2)
      $$invalidate(19, contentOffsetHeight = $$props2.contentOffsetHeight);
    if ("contentOffsetWidth" in $$props2)
      $$invalidate(20, contentOffsetWidth = $$props2.contentOffsetWidth);
    if ("transition" in $$props2)
      $$invalidate(22, transition = $$props2.transition);
    if ("inTransition" in $$props2)
      $$invalidate(2, inTransition = $$props2.inTransition);
    if ("outTransition" in $$props2)
      $$invalidate(3, outTransition = $$props2.outTransition);
    if ("transitionOptions" in $$props2)
      $$invalidate(23, transitionOptions = $$props2.transitionOptions);
    if ("inTransitionOptions" in $$props2)
      $$invalidate(4, inTransitionOptions = $$props2.inTransitionOptions);
    if ("outTransitionOptions" in $$props2)
      $$invalidate(5, outTransitionOptions = $$props2.outTransitionOptions);
    if ("$$scope" in $$props2)
      $$invalidate(26, $$scope = $$props2.$$scope);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & 1) {
      if (elementContent !== void 0 && elementContent !== null) {
        getContext("storeElementContent").set(elementContent);
      }
    }
    if ($$self.$$.dirty & 2) {
      if (elementRoot !== void 0 && elementRoot !== null) {
        getContext("storeElementRoot").set(elementRoot);
      }
    }
    if ($$self.$$.dirty & 20971520) {
      if (oldTransition !== transition) {
        const newTransition = s_DEFAULT_TRANSITION !== transition && typeof transition === "function" ? transition : s_DEFAULT_TRANSITION;
        $$invalidate(2, inTransition = newTransition);
        $$invalidate(3, outTransition = newTransition);
        $$invalidate(24, oldTransition = newTransition);
      }
    }
    if ($$self.$$.dirty & 41943040) {
      if (oldTransitionOptions !== transitionOptions) {
        const newOptions = transitionOptions !== s_DEFAULT_TRANSITION_OPTIONS && typeof transitionOptions === "object" ? transitionOptions : s_DEFAULT_TRANSITION_OPTIONS;
        $$invalidate(4, inTransitionOptions = newOptions);
        $$invalidate(5, outTransitionOptions = newOptions);
        $$invalidate(25, oldTransitionOptions = newOptions);
      }
    }
    if ($$self.$$.dirty & 4) {
      if (typeof inTransition !== "function") {
        $$invalidate(2, inTransition = s_DEFAULT_TRANSITION);
      }
    }
    if ($$self.$$.dirty & 1032) {
      {
        if (typeof outTransition !== "function") {
          $$invalidate(3, outTransition = s_DEFAULT_TRANSITION);
        }
        if (application && typeof application?.options?.defaultCloseAnimation === "boolean") {
          $$invalidate(10, application.options.defaultCloseAnimation = outTransition === s_DEFAULT_TRANSITION, application);
        }
      }
    }
    if ($$self.$$.dirty & 16) {
      if (typeof inTransitionOptions !== "object") {
        $$invalidate(4, inTransitionOptions = s_DEFAULT_TRANSITION_OPTIONS);
      }
    }
    if ($$self.$$.dirty & 32) {
      if (typeof outTransitionOptions !== "object") {
        $$invalidate(5, outTransitionOptions = s_DEFAULT_TRANSITION_OPTIONS);
      }
    }
  };
  return [
    elementContent,
    elementRoot,
    inTransition,
    outTransition,
    inTransitionOptions,
    outTransitionOptions,
    draggable2,
    draggableOptions,
    stylesApp,
    stylesContent,
    application,
    appResizeObserver,
    contentResizeObserver,
    bringToTop,
    allChildren,
    resizeObservedContent,
    resizeObservedApp,
    appOffsetHeight,
    appOffsetWidth,
    contentOffsetHeight,
    contentOffsetWidth,
    children2,
    transition,
    transitionOptions,
    oldTransition,
    oldTransitionOptions,
    $$scope,
    slots,
    section_binding,
    div_binding
  ];
}
__name(instance$h, "instance$h");
class ApplicationShell extends SvelteComponent {
  constructor(options) {
    super();
    init$1(this, options, instance$h, create_fragment$j, safe_not_equal, {
      elementContent: 0,
      elementRoot: 1,
      draggable: 6,
      draggableOptions: 7,
      children: 21,
      stylesApp: 8,
      stylesContent: 9,
      appOffsetHeight: 17,
      appOffsetWidth: 18,
      contentOffsetHeight: 19,
      contentOffsetWidth: 20,
      transition: 22,
      inTransition: 2,
      outTransition: 3,
      transitionOptions: 23,
      inTransitionOptions: 4,
      outTransitionOptions: 5
    });
  }
  get elementContent() {
    return this.$$.ctx[0];
  }
  set elementContent(elementContent) {
    this.$$set({ elementContent });
    flush();
  }
  get elementRoot() {
    return this.$$.ctx[1];
  }
  set elementRoot(elementRoot) {
    this.$$set({ elementRoot });
    flush();
  }
  get draggable() {
    return this.$$.ctx[6];
  }
  set draggable(draggable2) {
    this.$$set({ draggable: draggable2 });
    flush();
  }
  get draggableOptions() {
    return this.$$.ctx[7];
  }
  set draggableOptions(draggableOptions) {
    this.$$set({ draggableOptions });
    flush();
  }
  get children() {
    return this.$$.ctx[21];
  }
  set children(children2) {
    this.$$set({ children: children2 });
    flush();
  }
  get stylesApp() {
    return this.$$.ctx[8];
  }
  set stylesApp(stylesApp) {
    this.$$set({ stylesApp });
    flush();
  }
  get stylesContent() {
    return this.$$.ctx[9];
  }
  set stylesContent(stylesContent) {
    this.$$set({ stylesContent });
    flush();
  }
  get appOffsetHeight() {
    return this.$$.ctx[17];
  }
  set appOffsetHeight(appOffsetHeight) {
    this.$$set({ appOffsetHeight });
    flush();
  }
  get appOffsetWidth() {
    return this.$$.ctx[18];
  }
  set appOffsetWidth(appOffsetWidth) {
    this.$$set({ appOffsetWidth });
    flush();
  }
  get contentOffsetHeight() {
    return this.$$.ctx[19];
  }
  set contentOffsetHeight(contentOffsetHeight) {
    this.$$set({ contentOffsetHeight });
    flush();
  }
  get contentOffsetWidth() {
    return this.$$.ctx[20];
  }
  set contentOffsetWidth(contentOffsetWidth) {
    this.$$set({ contentOffsetWidth });
    flush();
  }
  get transition() {
    return this.$$.ctx[22];
  }
  set transition(transition) {
    this.$$set({ transition });
    flush();
  }
  get inTransition() {
    return this.$$.ctx[2];
  }
  set inTransition(inTransition) {
    this.$$set({ inTransition });
    flush();
  }
  get outTransition() {
    return this.$$.ctx[3];
  }
  set outTransition(outTransition) {
    this.$$set({ outTransition });
    flush();
  }
  get transitionOptions() {
    return this.$$.ctx[23];
  }
  set transitionOptions(transitionOptions) {
    this.$$set({ transitionOptions });
    flush();
  }
  get inTransitionOptions() {
    return this.$$.ctx[4];
  }
  set inTransitionOptions(inTransitionOptions) {
    this.$$set({ inTransitionOptions });
    flush();
  }
  get outTransitionOptions() {
    return this.$$.ctx[5];
  }
  set outTransitionOptions(outTransitionOptions) {
    this.$$set({ outTransitionOptions });
    flush();
  }
}
__name(ApplicationShell, "ApplicationShell");
const TJSApplicationShell_svelte_svelte_type_style_lang = "";
const DialogContent_svelte_svelte_type_style_lang = "";
Hooks.on("PopOut:loading", (app) => {
  if (app instanceof SvelteApplication) {
    app.position.enabled = false;
  }
});
Hooks.on("PopOut:popin", (app) => {
  if (app instanceof SvelteApplication) {
    app.position.enabled = true;
  }
});
Hooks.on("PopOut:close", (app) => {
  if (app instanceof SvelteApplication) {
    app.position.enabled = true;
  }
});
function ripple({ duration = 600, background = "rgba(255, 255, 255, 0.7)", event = "click", debounce: debounce$1$1 } = {}) {
  return (element2) => {
    function createRipple(e) {
      const elementRect = element2.getBoundingClientRect();
      const diameter = Math.max(elementRect.width, elementRect.height);
      const radius2 = diameter / 2;
      const left = `${e.clientX - (elementRect.left + radius2)}px`;
      const top = `${e.clientY - (elementRect.top + radius2)}px`;
      const span = document.createElement("span");
      span.style.position = "absolute";
      span.style.width = `${diameter}px`;
      span.style.height = `${diameter}px`;
      span.style.left = left;
      span.style.top = top;
      span.style.background = `var(--tjs-action-ripple-background, ${background})`;
      span.style.borderRadius = "50%";
      span.style.pointerEvents = "none";
      span.style.transform = "translateZ(-1px)";
      element2.prepend(span);
      const animation = span.animate(
        [
          {
            transform: "scale(.7)",
            opacity: 0.5,
            filter: "blur(2px)"
          },
          {
            transform: "scale(4)",
            opacity: 0,
            filter: "blur(5px)"
          }
        ],
        duration
      );
      animation.onfinish = () => span.remove();
    }
    __name(createRipple, "createRipple");
    const eventFn = Number.isInteger(debounce$1$1) && debounce$1$1 > 0 ? debounce$1(createRipple, debounce$1$1) : createRipple;
    element2.addEventListener(event, eventFn);
    return {
      destroy: () => element2.removeEventListener(event, eventFn)
    };
  };
}
__name(ripple, "ripple");
function rippleFocus({ duration = 300, background = "rgba(255, 255, 255, 0.7)", selectors } = {}) {
  return (element2) => {
    const targetEl = typeof selectors === "string" ? element2.querySelector(selectors) : element2.firstChild instanceof HTMLElement ? element2.firstChild : element2;
    let span = void 0;
    let clientX = -1;
    let clientY = -1;
    function blurRipple() {
      if (!(span instanceof HTMLElement) || document.activeElement === targetEl) {
        return;
      }
      const animation = span.animate(
        [
          {
            transform: "scale(3)",
            opacity: 0.3
          },
          {
            transform: "scale(.7)",
            opacity: 0
          }
        ],
        {
          duration,
          fill: "forwards"
        }
      );
      animation.onfinish = () => {
        clientX = clientY = -1;
        span.remove();
        span = void 0;
      };
    }
    __name(blurRipple, "blurRipple");
    function focusRipple() {
      if (span instanceof HTMLElement) {
        return;
      }
      const elementRect = element2.getBoundingClientRect();
      const actualX = clientX >= 0 ? clientX : elementRect.left + elementRect.width / 2;
      const actualY = clientX >= 0 ? clientY : elementRect.top + elementRect.height / 2;
      const diameter = Math.max(elementRect.width, elementRect.height);
      const radius2 = diameter / 2;
      const left = `${actualX - (elementRect.left + radius2)}px`;
      const top = `${actualY - (elementRect.top + radius2)}px`;
      span = document.createElement("span");
      span.style.position = "absolute";
      span.style.width = `${diameter}px`;
      span.style.height = `${diameter}px`;
      span.style.left = left;
      span.style.top = top;
      span.style.background = `var(--tjs-action-ripple-background-focus, var(--tjs-action-ripple-background, ${background}))`;
      span.style.borderRadius = "50%";
      span.style.pointerEvents = "none";
      span.style.transform = "translateZ(-1px)";
      element2.prepend(span);
      span.animate(
        [
          {
            transform: "scale(.7)",
            opacity: 0.5
          },
          {
            transform: "scale(3)",
            opacity: 0.3
          }
        ],
        {
          duration,
          fill: "forwards"
        }
      );
    }
    __name(focusRipple, "focusRipple");
    function onPointerDown(e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    __name(onPointerDown, "onPointerDown");
    targetEl.addEventListener("pointerdown", onPointerDown);
    targetEl.addEventListener("blur", blurRipple);
    targetEl.addEventListener("focus", focusRipple);
    return {
      destroy: () => {
        targetEl.removeEventListener("pointerdown", onPointerDown);
        targetEl.removeEventListener("blur", blurRipple);
        targetEl.removeEventListener("focus", focusRipple);
      }
    };
  };
}
__name(rippleFocus, "rippleFocus");
function createFilterQuery(properties, { caseSensitive = false, store } = {}) {
  let keyword = "";
  let regex;
  if (store !== void 0 && !isWritableStore(store)) {
    throw new TypeError(`createFilterQuery error: 'store' is not a writable store.`);
  }
  const storeKeyword = store ? store : writable$1(keyword);
  if (store) {
    const current = get_store_value(store);
    if (typeof current === "string") {
      keyword = normalizeString(current);
      regex = new RegExp(RegExp.escape(keyword), caseSensitive ? "" : "i");
    } else {
      store.set(keyword);
    }
  }
  function filterQuery(data) {
    if (keyword === "" || !regex) {
      return true;
    }
    if (isIterable(properties)) {
      for (const property of properties) {
        if (regex.test(normalizeString(data?.[property]))) {
          return true;
        }
      }
      return false;
    } else {
      return regex.test(normalizeString(data?.[properties]));
    }
  }
  __name(filterQuery, "filterQuery");
  filterQuery.subscribe = (handler) => {
    return storeKeyword.subscribe(handler);
  };
  filterQuery.set = (value) => {
    if (typeof value === "string") {
      keyword = normalizeString(value);
      regex = new RegExp(RegExp.escape(keyword), caseSensitive ? "" : "i");
      storeKeyword.set(keyword);
    }
  };
  return filterQuery;
}
__name(createFilterQuery, "createFilterQuery");
const mccSessionStorage = new SessionStorage();
function createAccessorStore(target, accessor, initial) {
  if (!hasSetter(target, accessor)) {
    throw new TypeError(`Accessor '${accessor} is not available on target.`);
  }
  const sessionKey = `mcc.${accessor}`;
  target[accessor] = mccSessionStorage.getItem(sessionKey, initial);
  const mccSessionStore = mccSessionStorage.getStore(sessionKey, initial);
  return {
    subscribe: (handler) => mccSessionStore.subscribe(handler),
    set: (value) => {
      target[accessor] = value;
      mccSessionStore.set(value);
    }
  };
}
__name(createAccessorStore, "createAccessorStore");
let active = mccSessionStorage.getItem("mcc.active", false);
const storeActive = mccSessionStorage.getStore("mcc.active", active);
function filterActive(row) {
  return !active || game.modules.get(row.id)?.active;
}
__name(filterActive, "filterActive");
filterActive.subscribe = (handler) => storeActive.subscribe(handler);
filterActive.set = (value) => {
  active = value;
  storeActive.set(value);
};
const statuses = mccSessionStorage.getItem("mcc.statuses", Object.keys(statusData).map((key) => ({ key, value: true })));
const storeStatuses = writable$1(statuses);
storeStatuses.getVisible = (key) => {
  const index2 = statuses.findIndex((entry) => entry.key === key);
  return index2 >= 0 ? statuses[index2].value : void 0;
};
storeStatuses.setExclusive = (index2) => {
  if (index2 >= 0 && index2 < statuses.length) {
    for (const status of statuses) {
      status.value = false;
    }
    statuses[index2].value = true;
    mccSessionStorage.setItem("mcc.statuses", statuses);
    storeStatuses.set(statuses);
  }
};
storeStatuses.setCompatibleVisible = () => {
  for (const status of statuses) {
    status.value = false;
  }
  statuses[3].value = true;
  statuses[4].value = true;
  statuses[7].value = true;
  mccSessionStorage.setItem("mcc.statuses", statuses);
  storeStatuses.set(statuses);
};
storeStatuses.setVisible = (key, value) => {
  const index2 = statuses.findIndex((entry) => entry.key === key);
  if (index2 >= 0) {
    statuses[index2].value = value;
    mccSessionStorage.setItem("mcc.statuses", statuses);
    storeStatuses.set(statuses);
  }
};
storeStatuses.toggleVisible = (key) => {
  const index2 = statuses.findIndex((entry) => entry.key === key);
  if (index2 >= 0) {
    statuses[index2].value = !statuses[index2].value;
    mccSessionStorage.setItem("mcc.statuses", statuses);
    storeStatuses.set(statuses);
  }
};
storeStatuses.reset = () => {
  for (const status of statuses) {
    status.value = true;
  }
  mccSessionStorage.setItem("mcc.statuses", statuses);
  storeStatuses.set(statuses);
};
function filterStatuses(row) {
  return storeStatuses.getVisible(row.status) ?? false;
}
__name(filterStatuses, "filterStatuses");
filterStatuses.subscribe = (handler) => storeStatuses.subscribe(handler);
filterStatuses.getVisible = storeStatuses.getVisible;
filterStatuses.reset = storeStatuses.reset;
filterStatuses.setExclusive = storeStatuses.setExclusive;
filterStatuses.setCompatibleVisible = storeStatuses.setCompatibleVisible;
filterStatuses.setVisible = storeStatuses.setVisible;
filterStatuses.toggleVisible = storeStatuses.toggleVisible;
let sortBy = mccSessionStorage.getItem("mcc.sortBy", "");
const storeSortBy = mccSessionStorage.getStore("mcc.sortBy", "");
function sortByHeader(a, b) {
  if (sortBy && a?.[sortBy] && b?.[sortBy]) {
    if (sortBy === "version") {
      return isNewerVersion(a.version, b.version) ? 1 : -1;
    }
    return a[sortBy].localeCompare(b[sortBy]);
  }
  return 0;
}
__name(sortByHeader, "sortByHeader");
sortByHeader.subscribe = (handler) => storeSortBy.subscribe(handler);
sortByHeader.set = (value) => {
  sortBy = value;
  storeSortBy.set(sortBy);
};
class SpreadsheetStore extends DynArrayReducer {
  #packageLinks = /* @__PURE__ */ new Map();
  #pieData = {
    datasets: [
      {
        backgroundColor: Object.values(statusData).map(
          ({ hsl }) => `hsla(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%, 100%)`
        ),
        hoverBackgroundColor: Object.values(statusData).map(
          ({ hsl }) => `hsla(${hsl[0]}, ${hsl[1]}%, ${hsl[2] + 10}%, 80%)`
        )
      }
    ]
  };
  #version;
  #versions = [];
  #stores;
  constructor() {
    super();
    const filteredPercentage = derived(this, () => {
      let working = 0;
      for (const row of this) {
        if (["G", "N", "C"].includes(row.status)) {
          working++;
        }
      }
      return parseFloat((100 * (working / Math.max(this.index.length, 1))).toFixed(2));
    });
    this.#stores = {
      details: mccSessionStorage.getStore("mcc.details", false),
      active: filterActive,
      filteredPercentage,
      filterSearch: createFilterQuery(["title", "id"], { store: mccSessionStorage.getStore("mcc.search", "") }),
      pieData: writable$1({}),
      reversed: createAccessorStore(this, "reversed", false),
      scrollTop: mccSessionStorage.getStore("mcc.scrollTop", 0),
      sortBy: sortByHeader,
      statuses: filterStatuses,
      version: createAccessorStore(this, "version")
    };
    this.filters.add(this.#stores.filterSearch);
    this.filters.add(filterActive);
    this.filters.add(filterStatuses);
    this.sort.set(sortByHeader);
    this.subscribe(() => {
      const filteredData = [...this];
      this.#pieData.datasets[0].data = Object.keys(statusData).map(
        (status) => filteredData.filter((row) => row.status === status).length
      );
      this.#stores.pieData.set(this.#pieData);
    });
  }
  get stores() {
    return this.#stores;
  }
  get version() {
    return this.#version;
  }
  set version(version2) {
    this.#version = version2;
  }
  get versions() {
    return this.#versions;
  }
  buildPackageLinks() {
    const packageList = SpreadsheetController.getModuleList();
    for (const data of packageList) {
      const packageData = data?.data;
      const id = packageData?.id ?? packageData?.name;
      const url = packageData?.url;
      if (id) {
        this.#packageLinks.set(id, { id, url });
      }
    }
  }
  getPackageLinks(id) {
    return this.#packageLinks.get(id);
  }
  resetFilters() {
    this.#stores.filterSearch.set("");
    this.#stores.statuses.reset();
  }
  async update() {
    const data = await SpreadsheetController.getRows(this.#version);
    this.setData(data);
  }
  async initialize() {
    this.#versions = await SpreadsheetController.getVersions();
    if (typeof this.#version !== "string" || !this.#versions.includes(this.#version)) {
      this.#stores.version.set(this.#versions.at(-1));
    }
    this.#pieData.labels = Object.values(statusData).map(({ explanation }) => explanation);
    this.buildPackageLinks();
    return this.update();
  }
}
__name(SpreadsheetStore, "SpreadsheetStore");
const Loading_svelte_svelte_type_style_lang = "";
function create_fragment$i(ctx) {
  let main;
  let h4;
  let t1;
  let progress;
  return {
    c() {
      main = element("main");
      h4 = element("h4");
      h4.textContent = `${localize("mcc.loading")}`;
      t1 = space();
      progress = element("progress");
      attr(h4, "class", "svelte-1htrh3z");
      attr(main, "class", "svelte-1htrh3z");
    },
    m(target, anchor) {
      insert(target, main, anchor);
      append(main, h4);
      append(main, t1);
      append(main, progress);
    },
    p: noop$1,
    i: noop$1,
    o: noop$1,
    d(detaching) {
      if (detaching)
        detach(main);
    }
  };
}
__name(create_fragment$i, "create_fragment$i");
class Loading extends SvelteComponent {
  constructor(options) {
    super();
    init$1(this, options, null, create_fragment$i, safe_not_equal, {});
  }
}
__name(Loading, "Loading");
const Error_svelte_svelte_type_style_lang = "";
function create_fragment$h(ctx) {
  let main;
  let i0;
  let t0;
  let pre;
  let t1;
  let t2;
  let p;
  let t4;
  let a;
  let t5_value = localize("mcc.issues") + "";
  let t5;
  let t6;
  let i1;
  return {
    c() {
      main = element("main");
      i0 = element("i");
      t0 = space();
      pre = element("pre");
      t1 = text(ctx[0]);
      t2 = space();
      p = element("p");
      p.textContent = `${localize("mcc.error")}`;
      t4 = space();
      a = element("a");
      t5 = text(t5_value);
      t6 = space();
      i1 = element("i");
      attr(i0, "class", "fas fa-exclamation-triangle svelte-pmuzal");
      attr(pre, "class", "svelte-pmuzal");
      attr(i1, "class", "fas fa-external-link-alt");
      attr(a, "href", game.modules.get("mcc").data.bugs);
      attr(main, "class", "svelte-pmuzal");
    },
    m(target, anchor) {
      insert(target, main, anchor);
      append(main, i0);
      append(main, t0);
      append(main, pre);
      append(pre, t1);
      append(main, t2);
      append(main, p);
      append(main, t4);
      append(main, a);
      append(a, t5);
      append(a, t6);
      append(a, i1);
    },
    p(ctx2, [dirty]) {
      if (dirty & 1)
        set_data(t1, ctx2[0]);
    },
    i: noop$1,
    o: noop$1,
    d(detaching) {
      if (detaching)
        detach(main);
    }
  };
}
__name(create_fragment$h, "create_fragment$h");
function instance$g($$self, $$props, $$invalidate) {
  let { error = "" } = $$props;
  console.error(error);
  $$self.$$set = ($$props2) => {
    if ("error" in $$props2)
      $$invalidate(0, error = $$props2.error);
  };
  return [error];
}
__name(instance$g, "instance$g");
class Error$1 extends SvelteComponent {
  constructor(options) {
    super();
    init$1(this, options, instance$g, create_fragment$h, safe_not_equal, { error: 0 });
  }
}
__name(Error$1, "Error$1");
const Reminder_svelte_svelte_type_style_lang = "";
function create_fragment$g(ctx) {
  let div;
  return {
    c() {
      div = element("div");
      div.textContent = `${localize("mcc.reminder")}`;
      attr(div, "class", "notification svelte-9j81xn");
    },
    m(target, anchor) {
      insert(target, div, anchor);
    },
    p: noop$1,
    i: noop$1,
    o: noop$1,
    d(detaching) {
      if (detaching)
        detach(div);
    }
  };
}
__name(create_fragment$g, "create_fragment$g");
class Reminder extends SvelteComponent {
  constructor(options) {
    super();
    init$1(this, options, null, create_fragment$g, safe_not_equal, {});
  }
}
__name(Reminder, "Reminder");
/*!
 * Chart.js v3.9.1
 * https://www.chartjs.org
 * (c) 2022 Chart.js Contributors
 * Released under the MIT License
 */
function noop() {
}
__name(noop, "noop");
const uid = function() {
  let id = 0;
  return function() {
    return id++;
  };
}();
function isNullOrUndef(value) {
  return value === null || typeof value === "undefined";
}
__name(isNullOrUndef, "isNullOrUndef");
function isArray(value) {
  if (Array.isArray && Array.isArray(value)) {
    return true;
  }
  const type = Object.prototype.toString.call(value);
  if (type.slice(0, 7) === "[object" && type.slice(-6) === "Array]") {
    return true;
  }
  return false;
}
__name(isArray, "isArray");
function isObject(value) {
  return value !== null && Object.prototype.toString.call(value) === "[object Object]";
}
__name(isObject, "isObject");
const isNumberFinite = /* @__PURE__ */ __name((value) => (typeof value === "number" || value instanceof Number) && isFinite(+value), "isNumberFinite");
function finiteOrDefault(value, defaultValue) {
  return isNumberFinite(value) ? value : defaultValue;
}
__name(finiteOrDefault, "finiteOrDefault");
function valueOrDefault(value, defaultValue) {
  return typeof value === "undefined" ? defaultValue : value;
}
__name(valueOrDefault, "valueOrDefault");
const toPercentage = /* @__PURE__ */ __name((value, dimension) => typeof value === "string" && value.endsWith("%") ? parseFloat(value) / 100 : value / dimension, "toPercentage");
const toDimension = /* @__PURE__ */ __name((value, dimension) => typeof value === "string" && value.endsWith("%") ? parseFloat(value) / 100 * dimension : +value, "toDimension");
function callback(fn, args, thisArg) {
  if (fn && typeof fn.call === "function") {
    return fn.apply(thisArg, args);
  }
}
__name(callback, "callback");
function each(loopable, fn, thisArg, reverse) {
  let i, len, keys;
  if (isArray(loopable)) {
    len = loopable.length;
    if (reverse) {
      for (i = len - 1; i >= 0; i--) {
        fn.call(thisArg, loopable[i], i);
      }
    } else {
      for (i = 0; i < len; i++) {
        fn.call(thisArg, loopable[i], i);
      }
    }
  } else if (isObject(loopable)) {
    keys = Object.keys(loopable);
    len = keys.length;
    for (i = 0; i < len; i++) {
      fn.call(thisArg, loopable[keys[i]], keys[i]);
    }
  }
}
__name(each, "each");
function _elementsEqual(a0, a1) {
  let i, ilen, v0, v1;
  if (!a0 || !a1 || a0.length !== a1.length) {
    return false;
  }
  for (i = 0, ilen = a0.length; i < ilen; ++i) {
    v0 = a0[i];
    v1 = a1[i];
    if (v0.datasetIndex !== v1.datasetIndex || v0.index !== v1.index) {
      return false;
    }
  }
  return true;
}
__name(_elementsEqual, "_elementsEqual");
function clone$1(source) {
  if (isArray(source)) {
    return source.map(clone$1);
  }
  if (isObject(source)) {
    const target = /* @__PURE__ */ Object.create(null);
    const keys = Object.keys(source);
    const klen = keys.length;
    let k = 0;
    for (; k < klen; ++k) {
      target[keys[k]] = clone$1(source[keys[k]]);
    }
    return target;
  }
  return source;
}
__name(clone$1, "clone$1");
function isValidKey(key) {
  return ["__proto__", "prototype", "constructor"].indexOf(key) === -1;
}
__name(isValidKey, "isValidKey");
function _merger(key, target, source, options) {
  if (!isValidKey(key)) {
    return;
  }
  const tval = target[key];
  const sval = source[key];
  if (isObject(tval) && isObject(sval)) {
    merge(tval, sval, options);
  } else {
    target[key] = clone$1(sval);
  }
}
__name(_merger, "_merger");
function merge(target, source, options) {
  const sources = isArray(source) ? source : [source];
  const ilen = sources.length;
  if (!isObject(target)) {
    return target;
  }
  options = options || {};
  const merger = options.merger || _merger;
  for (let i = 0; i < ilen; ++i) {
    source = sources[i];
    if (!isObject(source)) {
      continue;
    }
    const keys = Object.keys(source);
    for (let k = 0, klen = keys.length; k < klen; ++k) {
      merger(keys[k], target, source, options);
    }
  }
  return target;
}
__name(merge, "merge");
function mergeIf(target, source) {
  return merge(target, source, { merger: _mergerIf });
}
__name(mergeIf, "mergeIf");
function _mergerIf(key, target, source) {
  if (!isValidKey(key)) {
    return;
  }
  const tval = target[key];
  const sval = source[key];
  if (isObject(tval) && isObject(sval)) {
    mergeIf(tval, sval);
  } else if (!Object.prototype.hasOwnProperty.call(target, key)) {
    target[key] = clone$1(sval);
  }
}
__name(_mergerIf, "_mergerIf");
const keyResolvers = {
  "": (v) => v,
  x: (o) => o.x,
  y: (o) => o.y
};
function resolveObjectKey(obj, key) {
  const resolver = keyResolvers[key] || (keyResolvers[key] = _getKeyResolver(key));
  return resolver(obj);
}
__name(resolveObjectKey, "resolveObjectKey");
function _getKeyResolver(key) {
  const keys = _splitKey(key);
  return (obj) => {
    for (const k of keys) {
      if (k === "") {
        break;
      }
      obj = obj && obj[k];
    }
    return obj;
  };
}
__name(_getKeyResolver, "_getKeyResolver");
function _splitKey(key) {
  const parts = key.split(".");
  const keys = [];
  let tmp = "";
  for (const part of parts) {
    tmp += part;
    if (tmp.endsWith("\\")) {
      tmp = tmp.slice(0, -1) + ".";
    } else {
      keys.push(tmp);
      tmp = "";
    }
  }
  return keys;
}
__name(_splitKey, "_splitKey");
function _capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
__name(_capitalize, "_capitalize");
const defined = /* @__PURE__ */ __name((value) => typeof value !== "undefined", "defined");
const isFunction = /* @__PURE__ */ __name((value) => typeof value === "function", "isFunction");
const setsEqual = /* @__PURE__ */ __name((a, b) => {
  if (a.size !== b.size) {
    return false;
  }
  for (const item of a) {
    if (!b.has(item)) {
      return false;
    }
  }
  return true;
}, "setsEqual");
function _isClickEvent(e) {
  return e.type === "mouseup" || e.type === "click" || e.type === "contextmenu";
}
__name(_isClickEvent, "_isClickEvent");
const PI = Math.PI;
const TAU = 2 * PI;
const PITAU = TAU + PI;
const INFINITY = Number.POSITIVE_INFINITY;
const RAD_PER_DEG = PI / 180;
const HALF_PI = PI / 2;
const QUARTER_PI = PI / 4;
const TWO_THIRDS_PI = PI * 2 / 3;
const log10 = Math.log10;
const sign = Math.sign;
function niceNum(range) {
  const roundedRange = Math.round(range);
  range = almostEquals(range, roundedRange, range / 1e3) ? roundedRange : range;
  const niceRange = Math.pow(10, Math.floor(log10(range)));
  const fraction = range / niceRange;
  const niceFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  return niceFraction * niceRange;
}
__name(niceNum, "niceNum");
function _factorize(value) {
  const result = [];
  const sqrt = Math.sqrt(value);
  let i;
  for (i = 1; i < sqrt; i++) {
    if (value % i === 0) {
      result.push(i);
      result.push(value / i);
    }
  }
  if (sqrt === (sqrt | 0)) {
    result.push(sqrt);
  }
  result.sort((a, b) => a - b).pop();
  return result;
}
__name(_factorize, "_factorize");
function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
__name(isNumber, "isNumber");
function almostEquals(x, y, epsilon) {
  return Math.abs(x - y) < epsilon;
}
__name(almostEquals, "almostEquals");
function almostWhole(x, epsilon) {
  const rounded = Math.round(x);
  return rounded - epsilon <= x && rounded + epsilon >= x;
}
__name(almostWhole, "almostWhole");
function _setMinAndMaxByKey(array, target, property) {
  let i, ilen, value;
  for (i = 0, ilen = array.length; i < ilen; i++) {
    value = array[i][property];
    if (!isNaN(value)) {
      target.min = Math.min(target.min, value);
      target.max = Math.max(target.max, value);
    }
  }
}
__name(_setMinAndMaxByKey, "_setMinAndMaxByKey");
function toRadians(degrees) {
  return degrees * (PI / 180);
}
__name(toRadians, "toRadians");
function toDegrees(radians) {
  return radians * (180 / PI);
}
__name(toDegrees, "toDegrees");
function _decimalPlaces(x) {
  if (!isNumberFinite(x)) {
    return;
  }
  let e = 1;
  let p = 0;
  while (Math.round(x * e) / e !== x) {
    e *= 10;
    p++;
  }
  return p;
}
__name(_decimalPlaces, "_decimalPlaces");
function getAngleFromPoint(centrePoint, anglePoint) {
  const distanceFromXCenter = anglePoint.x - centrePoint.x;
  const distanceFromYCenter = anglePoint.y - centrePoint.y;
  const radialDistanceFromCenter = Math.sqrt(distanceFromXCenter * distanceFromXCenter + distanceFromYCenter * distanceFromYCenter);
  let angle = Math.atan2(distanceFromYCenter, distanceFromXCenter);
  if (angle < -0.5 * PI) {
    angle += TAU;
  }
  return {
    angle,
    distance: radialDistanceFromCenter
  };
}
__name(getAngleFromPoint, "getAngleFromPoint");
function distanceBetweenPoints(pt1, pt2) {
  return Math.sqrt(Math.pow(pt2.x - pt1.x, 2) + Math.pow(pt2.y - pt1.y, 2));
}
__name(distanceBetweenPoints, "distanceBetweenPoints");
function _angleDiff(a, b) {
  return (a - b + PITAU) % TAU - PI;
}
__name(_angleDiff, "_angleDiff");
function _normalizeAngle(a) {
  return (a % TAU + TAU) % TAU;
}
__name(_normalizeAngle, "_normalizeAngle");
function _angleBetween(angle, start, end, sameAngleIsFullCircle) {
  const a = _normalizeAngle(angle);
  const s = _normalizeAngle(start);
  const e = _normalizeAngle(end);
  const angleToStart = _normalizeAngle(s - a);
  const angleToEnd = _normalizeAngle(e - a);
  const startToAngle = _normalizeAngle(a - s);
  const endToAngle = _normalizeAngle(a - e);
  return a === s || a === e || sameAngleIsFullCircle && s === e || angleToStart > angleToEnd && startToAngle < endToAngle;
}
__name(_angleBetween, "_angleBetween");
function _limitValue(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
__name(_limitValue, "_limitValue");
function _int16Range(value) {
  return _limitValue(value, -32768, 32767);
}
__name(_int16Range, "_int16Range");
function _isBetween(value, start, end, epsilon = 1e-6) {
  return value >= Math.min(start, end) - epsilon && value <= Math.max(start, end) + epsilon;
}
__name(_isBetween, "_isBetween");
function _lookup(table, value, cmp) {
  cmp = cmp || ((index2) => table[index2] < value);
  let hi = table.length - 1;
  let lo = 0;
  let mid;
  while (hi - lo > 1) {
    mid = lo + hi >> 1;
    if (cmp(mid)) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return { lo, hi };
}
__name(_lookup, "_lookup");
const _lookupByKey = /* @__PURE__ */ __name((table, key, value, last) => _lookup(table, value, last ? (index2) => table[index2][key] <= value : (index2) => table[index2][key] < value), "_lookupByKey");
const _rlookupByKey = /* @__PURE__ */ __name((table, key, value) => _lookup(table, value, (index2) => table[index2][key] >= value), "_rlookupByKey");
function _filterBetween(values, min, max) {
  let start = 0;
  let end = values.length;
  while (start < end && values[start] < min) {
    start++;
  }
  while (end > start && values[end - 1] > max) {
    end--;
  }
  return start > 0 || end < values.length ? values.slice(start, end) : values;
}
__name(_filterBetween, "_filterBetween");
const arrayEvents = ["push", "pop", "shift", "splice", "unshift"];
function listenArrayEvents(array, listener) {
  if (array._chartjs) {
    array._chartjs.listeners.push(listener);
    return;
  }
  Object.defineProperty(array, "_chartjs", {
    configurable: true,
    enumerable: false,
    value: {
      listeners: [listener]
    }
  });
  arrayEvents.forEach((key) => {
    const method = "_onData" + _capitalize(key);
    const base = array[key];
    Object.defineProperty(array, key, {
      configurable: true,
      enumerable: false,
      value(...args) {
        const res = base.apply(this, args);
        array._chartjs.listeners.forEach((object) => {
          if (typeof object[method] === "function") {
            object[method](...args);
          }
        });
        return res;
      }
    });
  });
}
__name(listenArrayEvents, "listenArrayEvents");
function unlistenArrayEvents(array, listener) {
  const stub = array._chartjs;
  if (!stub) {
    return;
  }
  const listeners = stub.listeners;
  const index2 = listeners.indexOf(listener);
  if (index2 !== -1) {
    listeners.splice(index2, 1);
  }
  if (listeners.length > 0) {
    return;
  }
  arrayEvents.forEach((key) => {
    delete array[key];
  });
  delete array._chartjs;
}
__name(unlistenArrayEvents, "unlistenArrayEvents");
function _arrayUnique(items) {
  const set2 = /* @__PURE__ */ new Set();
  let i, ilen;
  for (i = 0, ilen = items.length; i < ilen; ++i) {
    set2.add(items[i]);
  }
  if (set2.size === ilen) {
    return items;
  }
  return Array.from(set2);
}
__name(_arrayUnique, "_arrayUnique");
const requestAnimFrame = function() {
  if (typeof window === "undefined") {
    return function(callback2) {
      return callback2();
    };
  }
  return window.requestAnimationFrame;
}();
function throttled(fn, thisArg, updateFn) {
  const updateArgs = updateFn || ((args2) => Array.prototype.slice.call(args2));
  let ticking = false;
  let args = [];
  return function(...rest) {
    args = updateArgs(rest);
    if (!ticking) {
      ticking = true;
      requestAnimFrame.call(window, () => {
        ticking = false;
        fn.apply(thisArg, args);
      });
    }
  };
}
__name(throttled, "throttled");
function debounce(fn, delay) {
  let timeout;
  return function(...args) {
    if (delay) {
      clearTimeout(timeout);
      timeout = setTimeout(fn, delay, args);
    } else {
      fn.apply(this, args);
    }
    return delay;
  };
}
__name(debounce, "debounce");
const _toLeftRightCenter = /* @__PURE__ */ __name((align) => align === "start" ? "left" : align === "end" ? "right" : "center", "_toLeftRightCenter");
const _alignStartEnd = /* @__PURE__ */ __name((align, start, end) => align === "start" ? start : align === "end" ? end : (start + end) / 2, "_alignStartEnd");
const _textX = /* @__PURE__ */ __name((align, left, right, rtl) => {
  const check = rtl ? "left" : "right";
  return align === check ? right : align === "center" ? (left + right) / 2 : left;
}, "_textX");
function _getStartAndCountOfVisiblePoints(meta, points, animationsDisabled) {
  const pointCount = points.length;
  let start = 0;
  let count = pointCount;
  if (meta._sorted) {
    const { iScale, _parsed } = meta;
    const axis = iScale.axis;
    const { min, max, minDefined, maxDefined } = iScale.getUserBounds();
    if (minDefined) {
      start = _limitValue(
        Math.min(
          _lookupByKey(_parsed, iScale.axis, min).lo,
          animationsDisabled ? pointCount : _lookupByKey(points, axis, iScale.getPixelForValue(min)).lo
        ),
        0,
        pointCount - 1
      );
    }
    if (maxDefined) {
      count = _limitValue(
        Math.max(
          _lookupByKey(_parsed, iScale.axis, max, true).hi + 1,
          animationsDisabled ? 0 : _lookupByKey(points, axis, iScale.getPixelForValue(max), true).hi + 1
        ),
        start,
        pointCount
      ) - start;
    } else {
      count = pointCount - start;
    }
  }
  return { start, count };
}
__name(_getStartAndCountOfVisiblePoints, "_getStartAndCountOfVisiblePoints");
function _scaleRangesChanged(meta) {
  const { xScale, yScale, _scaleRanges } = meta;
  const newRanges = {
    xmin: xScale.min,
    xmax: xScale.max,
    ymin: yScale.min,
    ymax: yScale.max
  };
  if (!_scaleRanges) {
    meta._scaleRanges = newRanges;
    return true;
  }
  const changed = _scaleRanges.xmin !== xScale.min || _scaleRanges.xmax !== xScale.max || _scaleRanges.ymin !== yScale.min || _scaleRanges.ymax !== yScale.max;
  Object.assign(_scaleRanges, newRanges);
  return changed;
}
__name(_scaleRangesChanged, "_scaleRangesChanged");
const atEdge = /* @__PURE__ */ __name((t) => t === 0 || t === 1, "atEdge");
const elasticIn = /* @__PURE__ */ __name((t, s, p) => -(Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * TAU / p)), "elasticIn");
const elasticOut = /* @__PURE__ */ __name((t, s, p) => Math.pow(2, -10 * t) * Math.sin((t - s) * TAU / p) + 1, "elasticOut");
const effects = {
  linear: (t) => t,
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => -t * (t - 2),
  easeInOutQuad: (t) => (t /= 0.5) < 1 ? 0.5 * t * t : -0.5 * (--t * (t - 2) - 1),
  easeInCubic: (t) => t * t * t,
  easeOutCubic: (t) => (t -= 1) * t * t + 1,
  easeInOutCubic: (t) => (t /= 0.5) < 1 ? 0.5 * t * t * t : 0.5 * ((t -= 2) * t * t + 2),
  easeInQuart: (t) => t * t * t * t,
  easeOutQuart: (t) => -((t -= 1) * t * t * t - 1),
  easeInOutQuart: (t) => (t /= 0.5) < 1 ? 0.5 * t * t * t * t : -0.5 * ((t -= 2) * t * t * t - 2),
  easeInQuint: (t) => t * t * t * t * t,
  easeOutQuint: (t) => (t -= 1) * t * t * t * t + 1,
  easeInOutQuint: (t) => (t /= 0.5) < 1 ? 0.5 * t * t * t * t * t : 0.5 * ((t -= 2) * t * t * t * t + 2),
  easeInSine: (t) => -Math.cos(t * HALF_PI) + 1,
  easeOutSine: (t) => Math.sin(t * HALF_PI),
  easeInOutSine: (t) => -0.5 * (Math.cos(PI * t) - 1),
  easeInExpo: (t) => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
  easeOutExpo: (t) => t === 1 ? 1 : -Math.pow(2, -10 * t) + 1,
  easeInOutExpo: (t) => atEdge(t) ? t : t < 0.5 ? 0.5 * Math.pow(2, 10 * (t * 2 - 1)) : 0.5 * (-Math.pow(2, -10 * (t * 2 - 1)) + 2),
  easeInCirc: (t) => t >= 1 ? t : -(Math.sqrt(1 - t * t) - 1),
  easeOutCirc: (t) => Math.sqrt(1 - (t -= 1) * t),
  easeInOutCirc: (t) => (t /= 0.5) < 1 ? -0.5 * (Math.sqrt(1 - t * t) - 1) : 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1),
  easeInElastic: (t) => atEdge(t) ? t : elasticIn(t, 0.075, 0.3),
  easeOutElastic: (t) => atEdge(t) ? t : elasticOut(t, 0.075, 0.3),
  easeInOutElastic(t) {
    const s = 0.1125;
    const p = 0.45;
    return atEdge(t) ? t : t < 0.5 ? 0.5 * elasticIn(t * 2, s, p) : 0.5 + 0.5 * elasticOut(t * 2 - 1, s, p);
  },
  easeInBack(t) {
    const s = 1.70158;
    return t * t * ((s + 1) * t - s);
  },
  easeOutBack(t) {
    const s = 1.70158;
    return (t -= 1) * t * ((s + 1) * t + s) + 1;
  },
  easeInOutBack(t) {
    let s = 1.70158;
    if ((t /= 0.5) < 1) {
      return 0.5 * (t * t * (((s *= 1.525) + 1) * t - s));
    }
    return 0.5 * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2);
  },
  easeInBounce: (t) => 1 - effects.easeOutBounce(1 - t),
  easeOutBounce(t) {
    const m = 7.5625;
    const d = 2.75;
    if (t < 1 / d) {
      return m * t * t;
    }
    if (t < 2 / d) {
      return m * (t -= 1.5 / d) * t + 0.75;
    }
    if (t < 2.5 / d) {
      return m * (t -= 2.25 / d) * t + 0.9375;
    }
    return m * (t -= 2.625 / d) * t + 0.984375;
  },
  easeInOutBounce: (t) => t < 0.5 ? effects.easeInBounce(t * 2) * 0.5 : effects.easeOutBounce(t * 2 - 1) * 0.5 + 0.5
};
/*!
 * @kurkle/color v0.2.1
 * https://github.com/kurkle/color#readme
 * (c) 2022 Jukka Kurkela
 * Released under the MIT License
 */
function round(v) {
  return v + 0.5 | 0;
}
__name(round, "round");
const lim = /* @__PURE__ */ __name((v, l, h) => Math.max(Math.min(v, h), l), "lim");
function p2b(v) {
  return lim(round(v * 2.55), 0, 255);
}
__name(p2b, "p2b");
function n2b(v) {
  return lim(round(v * 255), 0, 255);
}
__name(n2b, "n2b");
function b2n(v) {
  return lim(round(v / 2.55) / 100, 0, 1);
}
__name(b2n, "b2n");
function n2p(v) {
  return lim(round(v * 100), 0, 100);
}
__name(n2p, "n2p");
const map$1 = { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, A: 10, B: 11, C: 12, D: 13, E: 14, F: 15, a: 10, b: 11, c: 12, d: 13, e: 14, f: 15 };
const hex = [..."0123456789ABCDEF"];
const h1 = /* @__PURE__ */ __name((b) => hex[b & 15], "h1");
const h2 = /* @__PURE__ */ __name((b) => hex[(b & 240) >> 4] + hex[b & 15], "h2");
const eq = /* @__PURE__ */ __name((b) => (b & 240) >> 4 === (b & 15), "eq");
const isShort = /* @__PURE__ */ __name((v) => eq(v.r) && eq(v.g) && eq(v.b) && eq(v.a), "isShort");
function hexParse(str) {
  var len = str.length;
  var ret;
  if (str[0] === "#") {
    if (len === 4 || len === 5) {
      ret = {
        r: 255 & map$1[str[1]] * 17,
        g: 255 & map$1[str[2]] * 17,
        b: 255 & map$1[str[3]] * 17,
        a: len === 5 ? map$1[str[4]] * 17 : 255
      };
    } else if (len === 7 || len === 9) {
      ret = {
        r: map$1[str[1]] << 4 | map$1[str[2]],
        g: map$1[str[3]] << 4 | map$1[str[4]],
        b: map$1[str[5]] << 4 | map$1[str[6]],
        a: len === 9 ? map$1[str[7]] << 4 | map$1[str[8]] : 255
      };
    }
  }
  return ret;
}
__name(hexParse, "hexParse");
const alpha = /* @__PURE__ */ __name((a, f) => a < 255 ? f(a) : "", "alpha");
function hexString(v) {
  var f = isShort(v) ? h1 : h2;
  return v ? "#" + f(v.r) + f(v.g) + f(v.b) + alpha(v.a, f) : void 0;
}
__name(hexString, "hexString");
const HUE_RE = /^(hsla?|hwb|hsv)\(\s*([-+.e\d]+)(?:deg)?[\s,]+([-+.e\d]+)%[\s,]+([-+.e\d]+)%(?:[\s,]+([-+.e\d]+)(%)?)?\s*\)$/;
function hsl2rgbn(h, s, l) {
  const a = s * Math.min(l, 1 - l);
  const f = /* @__PURE__ */ __name((n, k = (n + h / 30) % 12) => l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1), "f");
  return [f(0), f(8), f(4)];
}
__name(hsl2rgbn, "hsl2rgbn");
function hsv2rgbn(h, s, v) {
  const f = /* @__PURE__ */ __name((n, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0), "f");
  return [f(5), f(3), f(1)];
}
__name(hsv2rgbn, "hsv2rgbn");
function hwb2rgbn(h, w, b) {
  const rgb = hsl2rgbn(h, 1, 0.5);
  let i;
  if (w + b > 1) {
    i = 1 / (w + b);
    w *= i;
    b *= i;
  }
  for (i = 0; i < 3; i++) {
    rgb[i] *= 1 - w - b;
    rgb[i] += w;
  }
  return rgb;
}
__name(hwb2rgbn, "hwb2rgbn");
function hueValue(r, g2, b, d, max) {
  if (r === max) {
    return (g2 - b) / d + (g2 < b ? 6 : 0);
  }
  if (g2 === max) {
    return (b - r) / d + 2;
  }
  return (r - g2) / d + 4;
}
__name(hueValue, "hueValue");
function rgb2hsl(v) {
  const range = 255;
  const r = v.r / range;
  const g2 = v.g / range;
  const b = v.b / range;
  const max = Math.max(r, g2, b);
  const min = Math.min(r, g2, b);
  const l = (max + min) / 2;
  let h, s, d;
  if (max !== min) {
    d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h = hueValue(r, g2, b, d, max);
    h = h * 60 + 0.5;
  }
  return [h | 0, s || 0, l];
}
__name(rgb2hsl, "rgb2hsl");
function calln(f, a, b, c) {
  return (Array.isArray(a) ? f(a[0], a[1], a[2]) : f(a, b, c)).map(n2b);
}
__name(calln, "calln");
function hsl2rgb(h, s, l) {
  return calln(hsl2rgbn, h, s, l);
}
__name(hsl2rgb, "hsl2rgb");
function hwb2rgb(h, w, b) {
  return calln(hwb2rgbn, h, w, b);
}
__name(hwb2rgb, "hwb2rgb");
function hsv2rgb(h, s, v) {
  return calln(hsv2rgbn, h, s, v);
}
__name(hsv2rgb, "hsv2rgb");
function hue(h) {
  return (h % 360 + 360) % 360;
}
__name(hue, "hue");
function hueParse(str) {
  const m = HUE_RE.exec(str);
  let a = 255;
  let v;
  if (!m) {
    return;
  }
  if (m[5] !== v) {
    a = m[6] ? p2b(+m[5]) : n2b(+m[5]);
  }
  const h = hue(+m[2]);
  const p1 = +m[3] / 100;
  const p2 = +m[4] / 100;
  if (m[1] === "hwb") {
    v = hwb2rgb(h, p1, p2);
  } else if (m[1] === "hsv") {
    v = hsv2rgb(h, p1, p2);
  } else {
    v = hsl2rgb(h, p1, p2);
  }
  return {
    r: v[0],
    g: v[1],
    b: v[2],
    a
  };
}
__name(hueParse, "hueParse");
function rotate(v, deg) {
  var h = rgb2hsl(v);
  h[0] = hue(h[0] + deg);
  h = hsl2rgb(h);
  v.r = h[0];
  v.g = h[1];
  v.b = h[2];
}
__name(rotate, "rotate");
function hslString(v) {
  if (!v) {
    return;
  }
  const a = rgb2hsl(v);
  const h = a[0];
  const s = n2p(a[1]);
  const l = n2p(a[2]);
  return v.a < 255 ? `hsla(${h}, ${s}%, ${l}%, ${b2n(v.a)})` : `hsl(${h}, ${s}%, ${l}%)`;
}
__name(hslString, "hslString");
const map$2 = {
  x: "dark",
  Z: "light",
  Y: "re",
  X: "blu",
  W: "gr",
  V: "medium",
  U: "slate",
  A: "ee",
  T: "ol",
  S: "or",
  B: "ra",
  C: "lateg",
  D: "ights",
  R: "in",
  Q: "turquois",
  E: "hi",
  P: "ro",
  O: "al",
  N: "le",
  M: "de",
  L: "yello",
  F: "en",
  K: "ch",
  G: "arks",
  H: "ea",
  I: "ightg",
  J: "wh"
};
const names$1 = {
  OiceXe: "f0f8ff",
  antiquewEte: "faebd7",
  aqua: "ffff",
  aquamarRe: "7fffd4",
  azuY: "f0ffff",
  beige: "f5f5dc",
  bisque: "ffe4c4",
  black: "0",
  blanKedOmond: "ffebcd",
  Xe: "ff",
  XeviTet: "8a2be2",
  bPwn: "a52a2a",
  burlywood: "deb887",
  caMtXe: "5f9ea0",
  KartYuse: "7fff00",
  KocTate: "d2691e",
  cSO: "ff7f50",
  cSnflowerXe: "6495ed",
  cSnsilk: "fff8dc",
  crimson: "dc143c",
  cyan: "ffff",
  xXe: "8b",
  xcyan: "8b8b",
  xgTMnPd: "b8860b",
  xWay: "a9a9a9",
  xgYF: "6400",
  xgYy: "a9a9a9",
  xkhaki: "bdb76b",
  xmagFta: "8b008b",
  xTivegYF: "556b2f",
  xSange: "ff8c00",
  xScEd: "9932cc",
  xYd: "8b0000",
  xsOmon: "e9967a",
  xsHgYF: "8fbc8f",
  xUXe: "483d8b",
  xUWay: "2f4f4f",
  xUgYy: "2f4f4f",
  xQe: "ced1",
  xviTet: "9400d3",
  dAppRk: "ff1493",
  dApskyXe: "bfff",
  dimWay: "696969",
  dimgYy: "696969",
  dodgerXe: "1e90ff",
  fiYbrick: "b22222",
  flSOwEte: "fffaf0",
  foYstWAn: "228b22",
  fuKsia: "ff00ff",
  gaRsbSo: "dcdcdc",
  ghostwEte: "f8f8ff",
  gTd: "ffd700",
  gTMnPd: "daa520",
  Way: "808080",
  gYF: "8000",
  gYFLw: "adff2f",
  gYy: "808080",
  honeyMw: "f0fff0",
  hotpRk: "ff69b4",
  RdianYd: "cd5c5c",
  Rdigo: "4b0082",
  ivSy: "fffff0",
  khaki: "f0e68c",
  lavFMr: "e6e6fa",
  lavFMrXsh: "fff0f5",
  lawngYF: "7cfc00",
  NmoncEffon: "fffacd",
  ZXe: "add8e6",
  ZcSO: "f08080",
  Zcyan: "e0ffff",
  ZgTMnPdLw: "fafad2",
  ZWay: "d3d3d3",
  ZgYF: "90ee90",
  ZgYy: "d3d3d3",
  ZpRk: "ffb6c1",
  ZsOmon: "ffa07a",
  ZsHgYF: "20b2aa",
  ZskyXe: "87cefa",
  ZUWay: "778899",
  ZUgYy: "778899",
  ZstAlXe: "b0c4de",
  ZLw: "ffffe0",
  lime: "ff00",
  limegYF: "32cd32",
  lRF: "faf0e6",
  magFta: "ff00ff",
  maPon: "800000",
  VaquamarRe: "66cdaa",
  VXe: "cd",
  VScEd: "ba55d3",
  VpurpN: "9370db",
  VsHgYF: "3cb371",
  VUXe: "7b68ee",
  VsprRggYF: "fa9a",
  VQe: "48d1cc",
  VviTetYd: "c71585",
  midnightXe: "191970",
  mRtcYam: "f5fffa",
  mistyPse: "ffe4e1",
  moccasR: "ffe4b5",
  navajowEte: "ffdead",
  navy: "80",
  Tdlace: "fdf5e6",
  Tive: "808000",
  TivedBb: "6b8e23",
  Sange: "ffa500",
  SangeYd: "ff4500",
  ScEd: "da70d6",
  pOegTMnPd: "eee8aa",
  pOegYF: "98fb98",
  pOeQe: "afeeee",
  pOeviTetYd: "db7093",
  papayawEp: "ffefd5",
  pHKpuff: "ffdab9",
  peru: "cd853f",
  pRk: "ffc0cb",
  plum: "dda0dd",
  powMrXe: "b0e0e6",
  purpN: "800080",
  YbeccapurpN: "663399",
  Yd: "ff0000",
  Psybrown: "bc8f8f",
  PyOXe: "4169e1",
  saddNbPwn: "8b4513",
  sOmon: "fa8072",
  sandybPwn: "f4a460",
  sHgYF: "2e8b57",
  sHshell: "fff5ee",
  siFna: "a0522d",
  silver: "c0c0c0",
  skyXe: "87ceeb",
  UXe: "6a5acd",
  UWay: "708090",
  UgYy: "708090",
  snow: "fffafa",
  sprRggYF: "ff7f",
  stAlXe: "4682b4",
  tan: "d2b48c",
  teO: "8080",
  tEstN: "d8bfd8",
  tomato: "ff6347",
  Qe: "40e0d0",
  viTet: "ee82ee",
  JHt: "f5deb3",
  wEte: "ffffff",
  wEtesmoke: "f5f5f5",
  Lw: "ffff00",
  LwgYF: "9acd32"
};
function unpack() {
  const unpacked = {};
  const keys = Object.keys(names$1);
  const tkeys = Object.keys(map$2);
  let i, j, k, ok, nk;
  for (i = 0; i < keys.length; i++) {
    ok = nk = keys[i];
    for (j = 0; j < tkeys.length; j++) {
      k = tkeys[j];
      nk = nk.replace(k, map$2[k]);
    }
    k = parseInt(names$1[ok], 16);
    unpacked[nk] = [k >> 16 & 255, k >> 8 & 255, k & 255];
  }
  return unpacked;
}
__name(unpack, "unpack");
let names;
function nameParse(str) {
  if (!names) {
    names = unpack();
    names.transparent = [0, 0, 0, 0];
  }
  const a = names[str.toLowerCase()];
  return a && {
    r: a[0],
    g: a[1],
    b: a[2],
    a: a.length === 4 ? a[3] : 255
  };
}
__name(nameParse, "nameParse");
const RGB_RE = /^rgba?\(\s*([-+.\d]+)(%)?[\s,]+([-+.e\d]+)(%)?[\s,]+([-+.e\d]+)(%)?(?:[\s,/]+([-+.e\d]+)(%)?)?\s*\)$/;
function rgbParse(str) {
  const m = RGB_RE.exec(str);
  let a = 255;
  let r, g2, b;
  if (!m) {
    return;
  }
  if (m[7] !== r) {
    const v = +m[7];
    a = m[8] ? p2b(v) : lim(v * 255, 0, 255);
  }
  r = +m[1];
  g2 = +m[3];
  b = +m[5];
  r = 255 & (m[2] ? p2b(r) : lim(r, 0, 255));
  g2 = 255 & (m[4] ? p2b(g2) : lim(g2, 0, 255));
  b = 255 & (m[6] ? p2b(b) : lim(b, 0, 255));
  return {
    r,
    g: g2,
    b,
    a
  };
}
__name(rgbParse, "rgbParse");
function rgbString(v) {
  return v && (v.a < 255 ? `rgba(${v.r}, ${v.g}, ${v.b}, ${b2n(v.a)})` : `rgb(${v.r}, ${v.g}, ${v.b})`);
}
__name(rgbString, "rgbString");
const to = /* @__PURE__ */ __name((v) => v <= 31308e-7 ? v * 12.92 : Math.pow(v, 1 / 2.4) * 1.055 - 0.055, "to");
const from = /* @__PURE__ */ __name((v) => v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4), "from");
function interpolate$1(rgb1, rgb2, t) {
  const r = from(b2n(rgb1.r));
  const g2 = from(b2n(rgb1.g));
  const b = from(b2n(rgb1.b));
  return {
    r: n2b(to(r + t * (from(b2n(rgb2.r)) - r))),
    g: n2b(to(g2 + t * (from(b2n(rgb2.g)) - g2))),
    b: n2b(to(b + t * (from(b2n(rgb2.b)) - b))),
    a: rgb1.a + t * (rgb2.a - rgb1.a)
  };
}
__name(interpolate$1, "interpolate$1");
function modHSL(v, i, ratio) {
  if (v) {
    let tmp = rgb2hsl(v);
    tmp[i] = Math.max(0, Math.min(tmp[i] + tmp[i] * ratio, i === 0 ? 360 : 1));
    tmp = hsl2rgb(tmp);
    v.r = tmp[0];
    v.g = tmp[1];
    v.b = tmp[2];
  }
}
__name(modHSL, "modHSL");
function clone(v, proto) {
  return v ? Object.assign(proto || {}, v) : v;
}
__name(clone, "clone");
function fromObject(input) {
  var v = { r: 0, g: 0, b: 0, a: 255 };
  if (Array.isArray(input)) {
    if (input.length >= 3) {
      v = { r: input[0], g: input[1], b: input[2], a: 255 };
      if (input.length > 3) {
        v.a = n2b(input[3]);
      }
    }
  } else {
    v = clone(input, { r: 0, g: 0, b: 0, a: 1 });
    v.a = n2b(v.a);
  }
  return v;
}
__name(fromObject, "fromObject");
function functionParse(str) {
  if (str.charAt(0) === "r") {
    return rgbParse(str);
  }
  return hueParse(str);
}
__name(functionParse, "functionParse");
class Color {
  constructor(input) {
    if (input instanceof Color) {
      return input;
    }
    const type = typeof input;
    let v;
    if (type === "object") {
      v = fromObject(input);
    } else if (type === "string") {
      v = hexParse(input) || nameParse(input) || functionParse(input);
    }
    this._rgb = v;
    this._valid = !!v;
  }
  get valid() {
    return this._valid;
  }
  get rgb() {
    var v = clone(this._rgb);
    if (v) {
      v.a = b2n(v.a);
    }
    return v;
  }
  set rgb(obj) {
    this._rgb = fromObject(obj);
  }
  rgbString() {
    return this._valid ? rgbString(this._rgb) : void 0;
  }
  hexString() {
    return this._valid ? hexString(this._rgb) : void 0;
  }
  hslString() {
    return this._valid ? hslString(this._rgb) : void 0;
  }
  mix(color2, weight) {
    if (color2) {
      const c1 = this.rgb;
      const c2 = color2.rgb;
      let w2;
      const p = weight === w2 ? 0.5 : weight;
      const w = 2 * p - 1;
      const a = c1.a - c2.a;
      const w1 = ((w * a === -1 ? w : (w + a) / (1 + w * a)) + 1) / 2;
      w2 = 1 - w1;
      c1.r = 255 & w1 * c1.r + w2 * c2.r + 0.5;
      c1.g = 255 & w1 * c1.g + w2 * c2.g + 0.5;
      c1.b = 255 & w1 * c1.b + w2 * c2.b + 0.5;
      c1.a = p * c1.a + (1 - p) * c2.a;
      this.rgb = c1;
    }
    return this;
  }
  interpolate(color2, t) {
    if (color2) {
      this._rgb = interpolate$1(this._rgb, color2._rgb, t);
    }
    return this;
  }
  clone() {
    return new Color(this.rgb);
  }
  alpha(a) {
    this._rgb.a = n2b(a);
    return this;
  }
  clearer(ratio) {
    const rgb = this._rgb;
    rgb.a *= 1 - ratio;
    return this;
  }
  greyscale() {
    const rgb = this._rgb;
    const val = round(rgb.r * 0.3 + rgb.g * 0.59 + rgb.b * 0.11);
    rgb.r = rgb.g = rgb.b = val;
    return this;
  }
  opaquer(ratio) {
    const rgb = this._rgb;
    rgb.a *= 1 + ratio;
    return this;
  }
  negate() {
    const v = this._rgb;
    v.r = 255 - v.r;
    v.g = 255 - v.g;
    v.b = 255 - v.b;
    return this;
  }
  lighten(ratio) {
    modHSL(this._rgb, 2, ratio);
    return this;
  }
  darken(ratio) {
    modHSL(this._rgb, 2, -ratio);
    return this;
  }
  saturate(ratio) {
    modHSL(this._rgb, 1, ratio);
    return this;
  }
  desaturate(ratio) {
    modHSL(this._rgb, 1, -ratio);
    return this;
  }
  rotate(deg) {
    rotate(this._rgb, deg);
    return this;
  }
}
__name(Color, "Color");
function index_esm(input) {
  return new Color(input);
}
__name(index_esm, "index_esm");
function isPatternOrGradient(value) {
  if (value && typeof value === "object") {
    const type = value.toString();
    return type === "[object CanvasPattern]" || type === "[object CanvasGradient]";
  }
  return false;
}
__name(isPatternOrGradient, "isPatternOrGradient");
function color(value) {
  return isPatternOrGradient(value) ? value : index_esm(value);
}
__name(color, "color");
function getHoverColor(value) {
  return isPatternOrGradient(value) ? value : index_esm(value).saturate(0.5).darken(0.1).hexString();
}
__name(getHoverColor, "getHoverColor");
const overrides = /* @__PURE__ */ Object.create(null);
const descriptors = /* @__PURE__ */ Object.create(null);
function getScope$1(node, key) {
  if (!key) {
    return node;
  }
  const keys = key.split(".");
  for (let i = 0, n = keys.length; i < n; ++i) {
    const k = keys[i];
    node = node[k] || (node[k] = /* @__PURE__ */ Object.create(null));
  }
  return node;
}
__name(getScope$1, "getScope$1");
function set(root, scope, values) {
  if (typeof scope === "string") {
    return merge(getScope$1(root, scope), values);
  }
  return merge(getScope$1(root, ""), scope);
}
__name(set, "set");
class Defaults {
  constructor(_descriptors2) {
    this.animation = void 0;
    this.backgroundColor = "rgba(0,0,0,0.1)";
    this.borderColor = "rgba(0,0,0,0.1)";
    this.color = "#666";
    this.datasets = {};
    this.devicePixelRatio = (context) => context.chart.platform.getDevicePixelRatio();
    this.elements = {};
    this.events = [
      "mousemove",
      "mouseout",
      "click",
      "touchstart",
      "touchmove"
    ];
    this.font = {
      family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
      size: 12,
      style: "normal",
      lineHeight: 1.2,
      weight: null
    };
    this.hover = {};
    this.hoverBackgroundColor = (ctx, options) => getHoverColor(options.backgroundColor);
    this.hoverBorderColor = (ctx, options) => getHoverColor(options.borderColor);
    this.hoverColor = (ctx, options) => getHoverColor(options.color);
    this.indexAxis = "x";
    this.interaction = {
      mode: "nearest",
      intersect: true,
      includeInvisible: false
    };
    this.maintainAspectRatio = true;
    this.onHover = null;
    this.onClick = null;
    this.parsing = true;
    this.plugins = {};
    this.responsive = true;
    this.scale = void 0;
    this.scales = {};
    this.showLine = true;
    this.drawActiveElementsOnTop = true;
    this.describe(_descriptors2);
  }
  set(scope, values) {
    return set(this, scope, values);
  }
  get(scope) {
    return getScope$1(this, scope);
  }
  describe(scope, values) {
    return set(descriptors, scope, values);
  }
  override(scope, values) {
    return set(overrides, scope, values);
  }
  route(scope, name, targetScope, targetName) {
    const scopeObject = getScope$1(this, scope);
    const targetScopeObject = getScope$1(this, targetScope);
    const privateName = "_" + name;
    Object.defineProperties(scopeObject, {
      [privateName]: {
        value: scopeObject[name],
        writable: true
      },
      [name]: {
        enumerable: true,
        get() {
          const local = this[privateName];
          const target = targetScopeObject[targetName];
          if (isObject(local)) {
            return Object.assign({}, target, local);
          }
          return valueOrDefault(local, target);
        },
        set(value) {
          this[privateName] = value;
        }
      }
    });
  }
}
__name(Defaults, "Defaults");
var defaults = new Defaults({
  _scriptable: (name) => !name.startsWith("on"),
  _indexable: (name) => name !== "events",
  hover: {
    _fallback: "interaction"
  },
  interaction: {
    _scriptable: false,
    _indexable: false
  }
});
function toFontString(font) {
  if (!font || isNullOrUndef(font.size) || isNullOrUndef(font.family)) {
    return null;
  }
  return (font.style ? font.style + " " : "") + (font.weight ? font.weight + " " : "") + font.size + "px " + font.family;
}
__name(toFontString, "toFontString");
function _measureText(ctx, data, gc, longest, string) {
  let textWidth = data[string];
  if (!textWidth) {
    textWidth = data[string] = ctx.measureText(string).width;
    gc.push(string);
  }
  if (textWidth > longest) {
    longest = textWidth;
  }
  return longest;
}
__name(_measureText, "_measureText");
function _longestText(ctx, font, arrayOfThings, cache) {
  cache = cache || {};
  let data = cache.data = cache.data || {};
  let gc = cache.garbageCollect = cache.garbageCollect || [];
  if (cache.font !== font) {
    data = cache.data = {};
    gc = cache.garbageCollect = [];
    cache.font = font;
  }
  ctx.save();
  ctx.font = font;
  let longest = 0;
  const ilen = arrayOfThings.length;
  let i, j, jlen, thing, nestedThing;
  for (i = 0; i < ilen; i++) {
    thing = arrayOfThings[i];
    if (thing !== void 0 && thing !== null && isArray(thing) !== true) {
      longest = _measureText(ctx, data, gc, longest, thing);
    } else if (isArray(thing)) {
      for (j = 0, jlen = thing.length; j < jlen; j++) {
        nestedThing = thing[j];
        if (nestedThing !== void 0 && nestedThing !== null && !isArray(nestedThing)) {
          longest = _measureText(ctx, data, gc, longest, nestedThing);
        }
      }
    }
  }
  ctx.restore();
  const gcLen = gc.length / 2;
  if (gcLen > arrayOfThings.length) {
    for (i = 0; i < gcLen; i++) {
      delete data[gc[i]];
    }
    gc.splice(0, gcLen);
  }
  return longest;
}
__name(_longestText, "_longestText");
function _alignPixel(chart, pixel, width) {
  const devicePixelRatio = chart.currentDevicePixelRatio;
  const halfWidth = width !== 0 ? Math.max(width / 2, 0.5) : 0;
  return Math.round((pixel - halfWidth) * devicePixelRatio) / devicePixelRatio + halfWidth;
}
__name(_alignPixel, "_alignPixel");
function clearCanvas(canvas, ctx) {
  ctx = ctx || canvas.getContext("2d");
  ctx.save();
  ctx.resetTransform();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}
__name(clearCanvas, "clearCanvas");
function drawPoint(ctx, options, x, y) {
  drawPointLegend(ctx, options, x, y, null);
}
__name(drawPoint, "drawPoint");
function drawPointLegend(ctx, options, x, y, w) {
  let type, xOffset, yOffset, size, cornerRadius, width;
  const style = options.pointStyle;
  const rotation = options.rotation;
  const radius2 = options.radius;
  let rad = (rotation || 0) * RAD_PER_DEG;
  if (style && typeof style === "object") {
    type = style.toString();
    if (type === "[object HTMLImageElement]" || type === "[object HTMLCanvasElement]") {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rad);
      ctx.drawImage(style, -style.width / 2, -style.height / 2, style.width, style.height);
      ctx.restore();
      return;
    }
  }
  if (isNaN(radius2) || radius2 <= 0) {
    return;
  }
  ctx.beginPath();
  switch (style) {
    default:
      if (w) {
        ctx.ellipse(x, y, w / 2, radius2, 0, 0, TAU);
      } else {
        ctx.arc(x, y, radius2, 0, TAU);
      }
      ctx.closePath();
      break;
    case "triangle":
      ctx.moveTo(x + Math.sin(rad) * radius2, y - Math.cos(rad) * radius2);
      rad += TWO_THIRDS_PI;
      ctx.lineTo(x + Math.sin(rad) * radius2, y - Math.cos(rad) * radius2);
      rad += TWO_THIRDS_PI;
      ctx.lineTo(x + Math.sin(rad) * radius2, y - Math.cos(rad) * radius2);
      ctx.closePath();
      break;
    case "rectRounded":
      cornerRadius = radius2 * 0.516;
      size = radius2 - cornerRadius;
      xOffset = Math.cos(rad + QUARTER_PI) * size;
      yOffset = Math.sin(rad + QUARTER_PI) * size;
      ctx.arc(x - xOffset, y - yOffset, cornerRadius, rad - PI, rad - HALF_PI);
      ctx.arc(x + yOffset, y - xOffset, cornerRadius, rad - HALF_PI, rad);
      ctx.arc(x + xOffset, y + yOffset, cornerRadius, rad, rad + HALF_PI);
      ctx.arc(x - yOffset, y + xOffset, cornerRadius, rad + HALF_PI, rad + PI);
      ctx.closePath();
      break;
    case "rect":
      if (!rotation) {
        size = Math.SQRT1_2 * radius2;
        width = w ? w / 2 : size;
        ctx.rect(x - width, y - size, 2 * width, 2 * size);
        break;
      }
      rad += QUARTER_PI;
    case "rectRot":
      xOffset = Math.cos(rad) * radius2;
      yOffset = Math.sin(rad) * radius2;
      ctx.moveTo(x - xOffset, y - yOffset);
      ctx.lineTo(x + yOffset, y - xOffset);
      ctx.lineTo(x + xOffset, y + yOffset);
      ctx.lineTo(x - yOffset, y + xOffset);
      ctx.closePath();
      break;
    case "crossRot":
      rad += QUARTER_PI;
    case "cross":
      xOffset = Math.cos(rad) * radius2;
      yOffset = Math.sin(rad) * radius2;
      ctx.moveTo(x - xOffset, y - yOffset);
      ctx.lineTo(x + xOffset, y + yOffset);
      ctx.moveTo(x + yOffset, y - xOffset);
      ctx.lineTo(x - yOffset, y + xOffset);
      break;
    case "star":
      xOffset = Math.cos(rad) * radius2;
      yOffset = Math.sin(rad) * radius2;
      ctx.moveTo(x - xOffset, y - yOffset);
      ctx.lineTo(x + xOffset, y + yOffset);
      ctx.moveTo(x + yOffset, y - xOffset);
      ctx.lineTo(x - yOffset, y + xOffset);
      rad += QUARTER_PI;
      xOffset = Math.cos(rad) * radius2;
      yOffset = Math.sin(rad) * radius2;
      ctx.moveTo(x - xOffset, y - yOffset);
      ctx.lineTo(x + xOffset, y + yOffset);
      ctx.moveTo(x + yOffset, y - xOffset);
      ctx.lineTo(x - yOffset, y + xOffset);
      break;
    case "line":
      xOffset = w ? w / 2 : Math.cos(rad) * radius2;
      yOffset = Math.sin(rad) * radius2;
      ctx.moveTo(x - xOffset, y - yOffset);
      ctx.lineTo(x + xOffset, y + yOffset);
      break;
    case "dash":
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(rad) * radius2, y + Math.sin(rad) * radius2);
      break;
  }
  ctx.fill();
  if (options.borderWidth > 0) {
    ctx.stroke();
  }
}
__name(drawPointLegend, "drawPointLegend");
function _isPointInArea(point, area, margin) {
  margin = margin || 0.5;
  return !area || point && point.x > area.left - margin && point.x < area.right + margin && point.y > area.top - margin && point.y < area.bottom + margin;
}
__name(_isPointInArea, "_isPointInArea");
function clipArea(ctx, area) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(area.left, area.top, area.right - area.left, area.bottom - area.top);
  ctx.clip();
}
__name(clipArea, "clipArea");
function unclipArea(ctx) {
  ctx.restore();
}
__name(unclipArea, "unclipArea");
function _steppedLineTo(ctx, previous, target, flip2, mode) {
  if (!previous) {
    return ctx.lineTo(target.x, target.y);
  }
  if (mode === "middle") {
    const midpoint = (previous.x + target.x) / 2;
    ctx.lineTo(midpoint, previous.y);
    ctx.lineTo(midpoint, target.y);
  } else if (mode === "after" !== !!flip2) {
    ctx.lineTo(previous.x, target.y);
  } else {
    ctx.lineTo(target.x, previous.y);
  }
  ctx.lineTo(target.x, target.y);
}
__name(_steppedLineTo, "_steppedLineTo");
function _bezierCurveTo(ctx, previous, target, flip2) {
  if (!previous) {
    return ctx.lineTo(target.x, target.y);
  }
  ctx.bezierCurveTo(
    flip2 ? previous.cp1x : previous.cp2x,
    flip2 ? previous.cp1y : previous.cp2y,
    flip2 ? target.cp2x : target.cp1x,
    flip2 ? target.cp2y : target.cp1y,
    target.x,
    target.y
  );
}
__name(_bezierCurveTo, "_bezierCurveTo");
function renderText(ctx, text2, x, y, font, opts = {}) {
  const lines = isArray(text2) ? text2 : [text2];
  const stroke = opts.strokeWidth > 0 && opts.strokeColor !== "";
  let i, line;
  ctx.save();
  ctx.font = font.string;
  setRenderOpts(ctx, opts);
  for (i = 0; i < lines.length; ++i) {
    line = lines[i];
    if (stroke) {
      if (opts.strokeColor) {
        ctx.strokeStyle = opts.strokeColor;
      }
      if (!isNullOrUndef(opts.strokeWidth)) {
        ctx.lineWidth = opts.strokeWidth;
      }
      ctx.strokeText(line, x, y, opts.maxWidth);
    }
    ctx.fillText(line, x, y, opts.maxWidth);
    decorateText(ctx, x, y, line, opts);
    y += font.lineHeight;
  }
  ctx.restore();
}
__name(renderText, "renderText");
function setRenderOpts(ctx, opts) {
  if (opts.translation) {
    ctx.translate(opts.translation[0], opts.translation[1]);
  }
  if (!isNullOrUndef(opts.rotation)) {
    ctx.rotate(opts.rotation);
  }
  if (opts.color) {
    ctx.fillStyle = opts.color;
  }
  if (opts.textAlign) {
    ctx.textAlign = opts.textAlign;
  }
  if (opts.textBaseline) {
    ctx.textBaseline = opts.textBaseline;
  }
}
__name(setRenderOpts, "setRenderOpts");
function decorateText(ctx, x, y, line, opts) {
  if (opts.strikethrough || opts.underline) {
    const metrics = ctx.measureText(line);
    const left = x - metrics.actualBoundingBoxLeft;
    const right = x + metrics.actualBoundingBoxRight;
    const top = y - metrics.actualBoundingBoxAscent;
    const bottom = y + metrics.actualBoundingBoxDescent;
    const yDecoration = opts.strikethrough ? (top + bottom) / 2 : bottom;
    ctx.strokeStyle = ctx.fillStyle;
    ctx.beginPath();
    ctx.lineWidth = opts.decorationWidth || 2;
    ctx.moveTo(left, yDecoration);
    ctx.lineTo(right, yDecoration);
    ctx.stroke();
  }
}
__name(decorateText, "decorateText");
function addRoundedRectPath(ctx, rect) {
  const { x, y, w, h, radius: radius2 } = rect;
  ctx.arc(x + radius2.topLeft, y + radius2.topLeft, radius2.topLeft, -HALF_PI, PI, true);
  ctx.lineTo(x, y + h - radius2.bottomLeft);
  ctx.arc(x + radius2.bottomLeft, y + h - radius2.bottomLeft, radius2.bottomLeft, PI, HALF_PI, true);
  ctx.lineTo(x + w - radius2.bottomRight, y + h);
  ctx.arc(x + w - radius2.bottomRight, y + h - radius2.bottomRight, radius2.bottomRight, HALF_PI, 0, true);
  ctx.lineTo(x + w, y + radius2.topRight);
  ctx.arc(x + w - radius2.topRight, y + radius2.topRight, radius2.topRight, 0, -HALF_PI, true);
  ctx.lineTo(x + radius2.topLeft, y);
}
__name(addRoundedRectPath, "addRoundedRectPath");
const LINE_HEIGHT = new RegExp(/^(normal|(\d+(?:\.\d+)?)(px|em|%)?)$/);
const FONT_STYLE = new RegExp(/^(normal|italic|initial|inherit|unset|(oblique( -?[0-9]?[0-9]deg)?))$/);
function toLineHeight(value, size) {
  const matches = ("" + value).match(LINE_HEIGHT);
  if (!matches || matches[1] === "normal") {
    return size * 1.2;
  }
  value = +matches[2];
  switch (matches[3]) {
    case "px":
      return value;
    case "%":
      value /= 100;
      break;
  }
  return size * value;
}
__name(toLineHeight, "toLineHeight");
const numberOrZero = /* @__PURE__ */ __name((v) => +v || 0, "numberOrZero");
function _readValueToProps(value, props) {
  const ret = {};
  const objProps = isObject(props);
  const keys = objProps ? Object.keys(props) : props;
  const read = isObject(value) ? objProps ? (prop) => valueOrDefault(value[prop], value[props[prop]]) : (prop) => value[prop] : () => value;
  for (const prop of keys) {
    ret[prop] = numberOrZero(read(prop));
  }
  return ret;
}
__name(_readValueToProps, "_readValueToProps");
function toTRBL(value) {
  return _readValueToProps(value, { top: "y", right: "x", bottom: "y", left: "x" });
}
__name(toTRBL, "toTRBL");
function toTRBLCorners(value) {
  return _readValueToProps(value, ["topLeft", "topRight", "bottomLeft", "bottomRight"]);
}
__name(toTRBLCorners, "toTRBLCorners");
function toPadding(value) {
  const obj = toTRBL(value);
  obj.width = obj.left + obj.right;
  obj.height = obj.top + obj.bottom;
  return obj;
}
__name(toPadding, "toPadding");
function toFont(options, fallback) {
  options = options || {};
  fallback = fallback || defaults.font;
  let size = valueOrDefault(options.size, fallback.size);
  if (typeof size === "string") {
    size = parseInt(size, 10);
  }
  let style = valueOrDefault(options.style, fallback.style);
  if (style && !("" + style).match(FONT_STYLE)) {
    console.warn('Invalid font style specified: "' + style + '"');
    style = "";
  }
  const font = {
    family: valueOrDefault(options.family, fallback.family),
    lineHeight: toLineHeight(valueOrDefault(options.lineHeight, fallback.lineHeight), size),
    size,
    style,
    weight: valueOrDefault(options.weight, fallback.weight),
    string: ""
  };
  font.string = toFontString(font);
  return font;
}
__name(toFont, "toFont");
function resolve(inputs, context, index2, info) {
  let cacheable = true;
  let i, ilen, value;
  for (i = 0, ilen = inputs.length; i < ilen; ++i) {
    value = inputs[i];
    if (value === void 0) {
      continue;
    }
    if (context !== void 0 && typeof value === "function") {
      value = value(context);
      cacheable = false;
    }
    if (index2 !== void 0 && isArray(value)) {
      value = value[index2 % value.length];
      cacheable = false;
    }
    if (value !== void 0) {
      if (info && !cacheable) {
        info.cacheable = false;
      }
      return value;
    }
  }
}
__name(resolve, "resolve");
function _addGrace(minmax, grace, beginAtZero) {
  const { min, max } = minmax;
  const change = toDimension(grace, (max - min) / 2);
  const keepZero = /* @__PURE__ */ __name((value, add) => beginAtZero && value === 0 ? 0 : value + add, "keepZero");
  return {
    min: keepZero(min, -Math.abs(change)),
    max: keepZero(max, change)
  };
}
__name(_addGrace, "_addGrace");
function createContext(parentContext, context) {
  return Object.assign(Object.create(parentContext), context);
}
__name(createContext, "createContext");
function _createResolver(scopes, prefixes = [""], rootScopes = scopes, fallback, getTarget = () => scopes[0]) {
  if (!defined(fallback)) {
    fallback = _resolve("_fallback", scopes);
  }
  const cache = {
    [Symbol.toStringTag]: "Object",
    _cacheable: true,
    _scopes: scopes,
    _rootScopes: rootScopes,
    _fallback: fallback,
    _getTarget: getTarget,
    override: (scope) => _createResolver([scope, ...scopes], prefixes, rootScopes, fallback)
  };
  return new Proxy(cache, {
    deleteProperty(target, prop) {
      delete target[prop];
      delete target._keys;
      delete scopes[0][prop];
      return true;
    },
    get(target, prop) {
      return _cached(
        target,
        prop,
        () => _resolveWithPrefixes(prop, prefixes, scopes, target)
      );
    },
    getOwnPropertyDescriptor(target, prop) {
      return Reflect.getOwnPropertyDescriptor(target._scopes[0], prop);
    },
    getPrototypeOf() {
      return Reflect.getPrototypeOf(scopes[0]);
    },
    has(target, prop) {
      return getKeysFromAllScopes(target).includes(prop);
    },
    ownKeys(target) {
      return getKeysFromAllScopes(target);
    },
    set(target, prop, value) {
      const storage2 = target._storage || (target._storage = getTarget());
      target[prop] = storage2[prop] = value;
      delete target._keys;
      return true;
    }
  });
}
__name(_createResolver, "_createResolver");
function _attachContext(proxy, context, subProxy, descriptorDefaults) {
  const cache = {
    _cacheable: false,
    _proxy: proxy,
    _context: context,
    _subProxy: subProxy,
    _stack: /* @__PURE__ */ new Set(),
    _descriptors: _descriptors(proxy, descriptorDefaults),
    setContext: (ctx) => _attachContext(proxy, ctx, subProxy, descriptorDefaults),
    override: (scope) => _attachContext(proxy.override(scope), context, subProxy, descriptorDefaults)
  };
  return new Proxy(cache, {
    deleteProperty(target, prop) {
      delete target[prop];
      delete proxy[prop];
      return true;
    },
    get(target, prop, receiver) {
      return _cached(
        target,
        prop,
        () => _resolveWithContext(target, prop, receiver)
      );
    },
    getOwnPropertyDescriptor(target, prop) {
      return target._descriptors.allKeys ? Reflect.has(proxy, prop) ? { enumerable: true, configurable: true } : void 0 : Reflect.getOwnPropertyDescriptor(proxy, prop);
    },
    getPrototypeOf() {
      return Reflect.getPrototypeOf(proxy);
    },
    has(target, prop) {
      return Reflect.has(proxy, prop);
    },
    ownKeys() {
      return Reflect.ownKeys(proxy);
    },
    set(target, prop, value) {
      proxy[prop] = value;
      delete target[prop];
      return true;
    }
  });
}
__name(_attachContext, "_attachContext");
function _descriptors(proxy, defaults2 = { scriptable: true, indexable: true }) {
  const { _scriptable = defaults2.scriptable, _indexable = defaults2.indexable, _allKeys = defaults2.allKeys } = proxy;
  return {
    allKeys: _allKeys,
    scriptable: _scriptable,
    indexable: _indexable,
    isScriptable: isFunction(_scriptable) ? _scriptable : () => _scriptable,
    isIndexable: isFunction(_indexable) ? _indexable : () => _indexable
  };
}
__name(_descriptors, "_descriptors");
const readKey = /* @__PURE__ */ __name((prefix, name) => prefix ? prefix + _capitalize(name) : name, "readKey");
const needsSubResolver = /* @__PURE__ */ __name((prop, value) => isObject(value) && prop !== "adapters" && (Object.getPrototypeOf(value) === null || value.constructor === Object), "needsSubResolver");
function _cached(target, prop, resolve2) {
  if (Object.prototype.hasOwnProperty.call(target, prop)) {
    return target[prop];
  }
  const value = resolve2();
  target[prop] = value;
  return value;
}
__name(_cached, "_cached");
function _resolveWithContext(target, prop, receiver) {
  const { _proxy, _context, _subProxy, _descriptors: descriptors2 } = target;
  let value = _proxy[prop];
  if (isFunction(value) && descriptors2.isScriptable(prop)) {
    value = _resolveScriptable(prop, value, target, receiver);
  }
  if (isArray(value) && value.length) {
    value = _resolveArray(prop, value, target, descriptors2.isIndexable);
  }
  if (needsSubResolver(prop, value)) {
    value = _attachContext(value, _context, _subProxy && _subProxy[prop], descriptors2);
  }
  return value;
}
__name(_resolveWithContext, "_resolveWithContext");
function _resolveScriptable(prop, value, target, receiver) {
  const { _proxy, _context, _subProxy, _stack } = target;
  if (_stack.has(prop)) {
    throw new Error("Recursion detected: " + Array.from(_stack).join("->") + "->" + prop);
  }
  _stack.add(prop);
  value = value(_context, _subProxy || receiver);
  _stack.delete(prop);
  if (needsSubResolver(prop, value)) {
    value = createSubResolver(_proxy._scopes, _proxy, prop, value);
  }
  return value;
}
__name(_resolveScriptable, "_resolveScriptable");
function _resolveArray(prop, value, target, isIndexable) {
  const { _proxy, _context, _subProxy, _descriptors: descriptors2 } = target;
  if (defined(_context.index) && isIndexable(prop)) {
    value = value[_context.index % value.length];
  } else if (isObject(value[0])) {
    const arr = value;
    const scopes = _proxy._scopes.filter((s) => s !== arr);
    value = [];
    for (const item of arr) {
      const resolver = createSubResolver(scopes, _proxy, prop, item);
      value.push(_attachContext(resolver, _context, _subProxy && _subProxy[prop], descriptors2));
    }
  }
  return value;
}
__name(_resolveArray, "_resolveArray");
function resolveFallback(fallback, prop, value) {
  return isFunction(fallback) ? fallback(prop, value) : fallback;
}
__name(resolveFallback, "resolveFallback");
const getScope = /* @__PURE__ */ __name((key, parent) => key === true ? parent : typeof key === "string" ? resolveObjectKey(parent, key) : void 0, "getScope");
function addScopes(set2, parentScopes, key, parentFallback, value) {
  for (const parent of parentScopes) {
    const scope = getScope(key, parent);
    if (scope) {
      set2.add(scope);
      const fallback = resolveFallback(scope._fallback, key, value);
      if (defined(fallback) && fallback !== key && fallback !== parentFallback) {
        return fallback;
      }
    } else if (scope === false && defined(parentFallback) && key !== parentFallback) {
      return null;
    }
  }
  return false;
}
__name(addScopes, "addScopes");
function createSubResolver(parentScopes, resolver, prop, value) {
  const rootScopes = resolver._rootScopes;
  const fallback = resolveFallback(resolver._fallback, prop, value);
  const allScopes = [...parentScopes, ...rootScopes];
  const set2 = /* @__PURE__ */ new Set();
  set2.add(value);
  let key = addScopesFromKey(set2, allScopes, prop, fallback || prop, value);
  if (key === null) {
    return false;
  }
  if (defined(fallback) && fallback !== prop) {
    key = addScopesFromKey(set2, allScopes, fallback, key, value);
    if (key === null) {
      return false;
    }
  }
  return _createResolver(
    Array.from(set2),
    [""],
    rootScopes,
    fallback,
    () => subGetTarget(resolver, prop, value)
  );
}
__name(createSubResolver, "createSubResolver");
function addScopesFromKey(set2, allScopes, key, fallback, item) {
  while (key) {
    key = addScopes(set2, allScopes, key, fallback, item);
  }
  return key;
}
__name(addScopesFromKey, "addScopesFromKey");
function subGetTarget(resolver, prop, value) {
  const parent = resolver._getTarget();
  if (!(prop in parent)) {
    parent[prop] = {};
  }
  const target = parent[prop];
  if (isArray(target) && isObject(value)) {
    return value;
  }
  return target;
}
__name(subGetTarget, "subGetTarget");
function _resolveWithPrefixes(prop, prefixes, scopes, proxy) {
  let value;
  for (const prefix of prefixes) {
    value = _resolve(readKey(prefix, prop), scopes);
    if (defined(value)) {
      return needsSubResolver(prop, value) ? createSubResolver(scopes, proxy, prop, value) : value;
    }
  }
}
__name(_resolveWithPrefixes, "_resolveWithPrefixes");
function _resolve(key, scopes) {
  for (const scope of scopes) {
    if (!scope) {
      continue;
    }
    const value = scope[key];
    if (defined(value)) {
      return value;
    }
  }
}
__name(_resolve, "_resolve");
function getKeysFromAllScopes(target) {
  let keys = target._keys;
  if (!keys) {
    keys = target._keys = resolveKeysFromAllScopes(target._scopes);
  }
  return keys;
}
__name(getKeysFromAllScopes, "getKeysFromAllScopes");
function resolveKeysFromAllScopes(scopes) {
  const set2 = /* @__PURE__ */ new Set();
  for (const scope of scopes) {
    for (const key of Object.keys(scope).filter((k) => !k.startsWith("_"))) {
      set2.add(key);
    }
  }
  return Array.from(set2);
}
__name(resolveKeysFromAllScopes, "resolveKeysFromAllScopes");
function _parseObjectDataRadialScale(meta, data, start, count) {
  const { iScale } = meta;
  const { key = "r" } = this._parsing;
  const parsed = new Array(count);
  let i, ilen, index2, item;
  for (i = 0, ilen = count; i < ilen; ++i) {
    index2 = i + start;
    item = data[index2];
    parsed[i] = {
      r: iScale.parse(resolveObjectKey(item, key), index2)
    };
  }
  return parsed;
}
__name(_parseObjectDataRadialScale, "_parseObjectDataRadialScale");
const EPSILON = Number.EPSILON || 1e-14;
const getPoint = /* @__PURE__ */ __name((points, i) => i < points.length && !points[i].skip && points[i], "getPoint");
const getValueAxis = /* @__PURE__ */ __name((indexAxis) => indexAxis === "x" ? "y" : "x", "getValueAxis");
function splineCurve(firstPoint, middlePoint, afterPoint, t) {
  const previous = firstPoint.skip ? middlePoint : firstPoint;
  const current = middlePoint;
  const next = afterPoint.skip ? middlePoint : afterPoint;
  const d01 = distanceBetweenPoints(current, previous);
  const d12 = distanceBetweenPoints(next, current);
  let s01 = d01 / (d01 + d12);
  let s12 = d12 / (d01 + d12);
  s01 = isNaN(s01) ? 0 : s01;
  s12 = isNaN(s12) ? 0 : s12;
  const fa = t * s01;
  const fb = t * s12;
  return {
    previous: {
      x: current.x - fa * (next.x - previous.x),
      y: current.y - fa * (next.y - previous.y)
    },
    next: {
      x: current.x + fb * (next.x - previous.x),
      y: current.y + fb * (next.y - previous.y)
    }
  };
}
__name(splineCurve, "splineCurve");
function monotoneAdjust(points, deltaK, mK) {
  const pointsLen = points.length;
  let alphaK, betaK, tauK, squaredMagnitude, pointCurrent;
  let pointAfter = getPoint(points, 0);
  for (let i = 0; i < pointsLen - 1; ++i) {
    pointCurrent = pointAfter;
    pointAfter = getPoint(points, i + 1);
    if (!pointCurrent || !pointAfter) {
      continue;
    }
    if (almostEquals(deltaK[i], 0, EPSILON)) {
      mK[i] = mK[i + 1] = 0;
      continue;
    }
    alphaK = mK[i] / deltaK[i];
    betaK = mK[i + 1] / deltaK[i];
    squaredMagnitude = Math.pow(alphaK, 2) + Math.pow(betaK, 2);
    if (squaredMagnitude <= 9) {
      continue;
    }
    tauK = 3 / Math.sqrt(squaredMagnitude);
    mK[i] = alphaK * tauK * deltaK[i];
    mK[i + 1] = betaK * tauK * deltaK[i];
  }
}
__name(monotoneAdjust, "monotoneAdjust");
function monotoneCompute(points, mK, indexAxis = "x") {
  const valueAxis = getValueAxis(indexAxis);
  const pointsLen = points.length;
  let delta, pointBefore, pointCurrent;
  let pointAfter = getPoint(points, 0);
  for (let i = 0; i < pointsLen; ++i) {
    pointBefore = pointCurrent;
    pointCurrent = pointAfter;
    pointAfter = getPoint(points, i + 1);
    if (!pointCurrent) {
      continue;
    }
    const iPixel = pointCurrent[indexAxis];
    const vPixel = pointCurrent[valueAxis];
    if (pointBefore) {
      delta = (iPixel - pointBefore[indexAxis]) / 3;
      pointCurrent[`cp1${indexAxis}`] = iPixel - delta;
      pointCurrent[`cp1${valueAxis}`] = vPixel - delta * mK[i];
    }
    if (pointAfter) {
      delta = (pointAfter[indexAxis] - iPixel) / 3;
      pointCurrent[`cp2${indexAxis}`] = iPixel + delta;
      pointCurrent[`cp2${valueAxis}`] = vPixel + delta * mK[i];
    }
  }
}
__name(monotoneCompute, "monotoneCompute");
function splineCurveMonotone(points, indexAxis = "x") {
  const valueAxis = getValueAxis(indexAxis);
  const pointsLen = points.length;
  const deltaK = Array(pointsLen).fill(0);
  const mK = Array(pointsLen);
  let i, pointBefore, pointCurrent;
  let pointAfter = getPoint(points, 0);
  for (i = 0; i < pointsLen; ++i) {
    pointBefore = pointCurrent;
    pointCurrent = pointAfter;
    pointAfter = getPoint(points, i + 1);
    if (!pointCurrent) {
      continue;
    }
    if (pointAfter) {
      const slopeDelta = pointAfter[indexAxis] - pointCurrent[indexAxis];
      deltaK[i] = slopeDelta !== 0 ? (pointAfter[valueAxis] - pointCurrent[valueAxis]) / slopeDelta : 0;
    }
    mK[i] = !pointBefore ? deltaK[i] : !pointAfter ? deltaK[i - 1] : sign(deltaK[i - 1]) !== sign(deltaK[i]) ? 0 : (deltaK[i - 1] + deltaK[i]) / 2;
  }
  monotoneAdjust(points, deltaK, mK);
  monotoneCompute(points, mK, indexAxis);
}
__name(splineCurveMonotone, "splineCurveMonotone");
function capControlPoint(pt, min, max) {
  return Math.max(Math.min(pt, max), min);
}
__name(capControlPoint, "capControlPoint");
function capBezierPoints(points, area) {
  let i, ilen, point, inArea, inAreaPrev;
  let inAreaNext = _isPointInArea(points[0], area);
  for (i = 0, ilen = points.length; i < ilen; ++i) {
    inAreaPrev = inArea;
    inArea = inAreaNext;
    inAreaNext = i < ilen - 1 && _isPointInArea(points[i + 1], area);
    if (!inArea) {
      continue;
    }
    point = points[i];
    if (inAreaPrev) {
      point.cp1x = capControlPoint(point.cp1x, area.left, area.right);
      point.cp1y = capControlPoint(point.cp1y, area.top, area.bottom);
    }
    if (inAreaNext) {
      point.cp2x = capControlPoint(point.cp2x, area.left, area.right);
      point.cp2y = capControlPoint(point.cp2y, area.top, area.bottom);
    }
  }
}
__name(capBezierPoints, "capBezierPoints");
function _updateBezierControlPoints(points, options, area, loop2, indexAxis) {
  let i, ilen, point, controlPoints;
  if (options.spanGaps) {
    points = points.filter((pt) => !pt.skip);
  }
  if (options.cubicInterpolationMode === "monotone") {
    splineCurveMonotone(points, indexAxis);
  } else {
    let prev = loop2 ? points[points.length - 1] : points[0];
    for (i = 0, ilen = points.length; i < ilen; ++i) {
      point = points[i];
      controlPoints = splineCurve(
        prev,
        point,
        points[Math.min(i + 1, ilen - (loop2 ? 0 : 1)) % ilen],
        options.tension
      );
      point.cp1x = controlPoints.previous.x;
      point.cp1y = controlPoints.previous.y;
      point.cp2x = controlPoints.next.x;
      point.cp2y = controlPoints.next.y;
      prev = point;
    }
  }
  if (options.capBezierPoints) {
    capBezierPoints(points, area);
  }
}
__name(_updateBezierControlPoints, "_updateBezierControlPoints");
function _isDomSupported() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}
__name(_isDomSupported, "_isDomSupported");
function _getParentNode(domNode) {
  let parent = domNode.parentNode;
  if (parent && parent.toString() === "[object ShadowRoot]") {
    parent = parent.host;
  }
  return parent;
}
__name(_getParentNode, "_getParentNode");
function parseMaxStyle(styleValue, node, parentProperty) {
  let valueInPixels;
  if (typeof styleValue === "string") {
    valueInPixels = parseInt(styleValue, 10);
    if (styleValue.indexOf("%") !== -1) {
      valueInPixels = valueInPixels / 100 * node.parentNode[parentProperty];
    }
  } else {
    valueInPixels = styleValue;
  }
  return valueInPixels;
}
__name(parseMaxStyle, "parseMaxStyle");
const getComputedStyle$1 = /* @__PURE__ */ __name((element2) => window.getComputedStyle(element2, null), "getComputedStyle$1");
function getStyle(el, property) {
  return getComputedStyle$1(el).getPropertyValue(property);
}
__name(getStyle, "getStyle");
const positions = ["top", "right", "bottom", "left"];
function getPositionedStyle(styles, style, suffix) {
  const result = {};
  suffix = suffix ? "-" + suffix : "";
  for (let i = 0; i < 4; i++) {
    const pos = positions[i];
    result[pos] = parseFloat(styles[style + "-" + pos + suffix]) || 0;
  }
  result.width = result.left + result.right;
  result.height = result.top + result.bottom;
  return result;
}
__name(getPositionedStyle, "getPositionedStyle");
const useOffsetPos = /* @__PURE__ */ __name((x, y, target) => (x > 0 || y > 0) && (!target || !target.shadowRoot), "useOffsetPos");
function getCanvasPosition(e, canvas) {
  const touches = e.touches;
  const source = touches && touches.length ? touches[0] : e;
  const { offsetX, offsetY } = source;
  let box = false;
  let x, y;
  if (useOffsetPos(offsetX, offsetY, e.target)) {
    x = offsetX;
    y = offsetY;
  } else {
    const rect = canvas.getBoundingClientRect();
    x = source.clientX - rect.left;
    y = source.clientY - rect.top;
    box = true;
  }
  return { x, y, box };
}
__name(getCanvasPosition, "getCanvasPosition");
function getRelativePosition(evt, chart) {
  if ("native" in evt) {
    return evt;
  }
  const { canvas, currentDevicePixelRatio } = chart;
  const style = getComputedStyle$1(canvas);
  const borderBox = style.boxSizing === "border-box";
  const paddings = getPositionedStyle(style, "padding");
  const borders = getPositionedStyle(style, "border", "width");
  const { x, y, box } = getCanvasPosition(evt, canvas);
  const xOffset = paddings.left + (box && borders.left);
  const yOffset = paddings.top + (box && borders.top);
  let { width, height } = chart;
  if (borderBox) {
    width -= paddings.width + borders.width;
    height -= paddings.height + borders.height;
  }
  return {
    x: Math.round((x - xOffset) / width * canvas.width / currentDevicePixelRatio),
    y: Math.round((y - yOffset) / height * canvas.height / currentDevicePixelRatio)
  };
}
__name(getRelativePosition, "getRelativePosition");
function getContainerSize(canvas, width, height) {
  let maxWidth, maxHeight;
  if (width === void 0 || height === void 0) {
    const container = _getParentNode(canvas);
    if (!container) {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
    } else {
      const rect = container.getBoundingClientRect();
      const containerStyle = getComputedStyle$1(container);
      const containerBorder = getPositionedStyle(containerStyle, "border", "width");
      const containerPadding = getPositionedStyle(containerStyle, "padding");
      width = rect.width - containerPadding.width - containerBorder.width;
      height = rect.height - containerPadding.height - containerBorder.height;
      maxWidth = parseMaxStyle(containerStyle.maxWidth, container, "clientWidth");
      maxHeight = parseMaxStyle(containerStyle.maxHeight, container, "clientHeight");
    }
  }
  return {
    width,
    height,
    maxWidth: maxWidth || INFINITY,
    maxHeight: maxHeight || INFINITY
  };
}
__name(getContainerSize, "getContainerSize");
const round1 = /* @__PURE__ */ __name((v) => Math.round(v * 10) / 10, "round1");
function getMaximumSize(canvas, bbWidth, bbHeight, aspectRatio) {
  const style = getComputedStyle$1(canvas);
  const margins = getPositionedStyle(style, "margin");
  const maxWidth = parseMaxStyle(style.maxWidth, canvas, "clientWidth") || INFINITY;
  const maxHeight = parseMaxStyle(style.maxHeight, canvas, "clientHeight") || INFINITY;
  const containerSize = getContainerSize(canvas, bbWidth, bbHeight);
  let { width, height } = containerSize;
  if (style.boxSizing === "content-box") {
    const borders = getPositionedStyle(style, "border", "width");
    const paddings = getPositionedStyle(style, "padding");
    width -= paddings.width + borders.width;
    height -= paddings.height + borders.height;
  }
  width = Math.max(0, width - margins.width);
  height = Math.max(0, aspectRatio ? Math.floor(width / aspectRatio) : height - margins.height);
  width = round1(Math.min(width, maxWidth, containerSize.maxWidth));
  height = round1(Math.min(height, maxHeight, containerSize.maxHeight));
  if (width && !height) {
    height = round1(width / 2);
  }
  return {
    width,
    height
  };
}
__name(getMaximumSize, "getMaximumSize");
function retinaScale(chart, forceRatio, forceStyle) {
  const pixelRatio = forceRatio || 1;
  const deviceHeight = Math.floor(chart.height * pixelRatio);
  const deviceWidth = Math.floor(chart.width * pixelRatio);
  chart.height = deviceHeight / pixelRatio;
  chart.width = deviceWidth / pixelRatio;
  const canvas = chart.canvas;
  if (canvas.style && (forceStyle || !canvas.style.height && !canvas.style.width)) {
    canvas.style.height = `${chart.height}px`;
    canvas.style.width = `${chart.width}px`;
  }
  if (chart.currentDevicePixelRatio !== pixelRatio || canvas.height !== deviceHeight || canvas.width !== deviceWidth) {
    chart.currentDevicePixelRatio = pixelRatio;
    canvas.height = deviceHeight;
    canvas.width = deviceWidth;
    chart.ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    return true;
  }
  return false;
}
__name(retinaScale, "retinaScale");
const supportsEventListenerOptions = function() {
  let passiveSupported = false;
  try {
    const options = {
      get passive() {
        passiveSupported = true;
        return false;
      }
    };
    window.addEventListener("test", null, options);
    window.removeEventListener("test", null, options);
  } catch (e) {
  }
  return passiveSupported;
}();
function readUsedSize(element2, property) {
  const value = getStyle(element2, property);
  const matches = value && value.match(/^(\d+)(\.\d+)?px$/);
  return matches ? +matches[1] : void 0;
}
__name(readUsedSize, "readUsedSize");
function _pointInLine(p1, p2, t, mode) {
  return {
    x: p1.x + t * (p2.x - p1.x),
    y: p1.y + t * (p2.y - p1.y)
  };
}
__name(_pointInLine, "_pointInLine");
function _steppedInterpolation(p1, p2, t, mode) {
  return {
    x: p1.x + t * (p2.x - p1.x),
    y: mode === "middle" ? t < 0.5 ? p1.y : p2.y : mode === "after" ? t < 1 ? p1.y : p2.y : t > 0 ? p2.y : p1.y
  };
}
__name(_steppedInterpolation, "_steppedInterpolation");
function _bezierInterpolation(p1, p2, t, mode) {
  const cp1 = { x: p1.cp2x, y: p1.cp2y };
  const cp2 = { x: p2.cp1x, y: p2.cp1y };
  const a = _pointInLine(p1, cp1, t);
  const b = _pointInLine(cp1, cp2, t);
  const c = _pointInLine(cp2, p2, t);
  const d = _pointInLine(a, b, t);
  const e = _pointInLine(b, c, t);
  return _pointInLine(d, e, t);
}
__name(_bezierInterpolation, "_bezierInterpolation");
const intlCache = /* @__PURE__ */ new Map();
function getNumberFormat(locale, options) {
  options = options || {};
  const cacheKey = locale + JSON.stringify(options);
  let formatter = intlCache.get(cacheKey);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    intlCache.set(cacheKey, formatter);
  }
  return formatter;
}
__name(getNumberFormat, "getNumberFormat");
function formatNumber(num, locale, options) {
  return getNumberFormat(locale, options).format(num);
}
__name(formatNumber, "formatNumber");
const getRightToLeftAdapter = /* @__PURE__ */ __name(function(rectX, width) {
  return {
    x(x) {
      return rectX + rectX + width - x;
    },
    setWidth(w) {
      width = w;
    },
    textAlign(align) {
      if (align === "center") {
        return align;
      }
      return align === "right" ? "left" : "right";
    },
    xPlus(x, value) {
      return x - value;
    },
    leftForLtr(x, itemWidth) {
      return x - itemWidth;
    }
  };
}, "getRightToLeftAdapter");
const getLeftToRightAdapter = /* @__PURE__ */ __name(function() {
  return {
    x(x) {
      return x;
    },
    setWidth(w) {
    },
    textAlign(align) {
      return align;
    },
    xPlus(x, value) {
      return x + value;
    },
    leftForLtr(x, _itemWidth) {
      return x;
    }
  };
}, "getLeftToRightAdapter");
function getRtlAdapter(rtl, rectX, width) {
  return rtl ? getRightToLeftAdapter(rectX, width) : getLeftToRightAdapter();
}
__name(getRtlAdapter, "getRtlAdapter");
function overrideTextDirection(ctx, direction) {
  let style, original;
  if (direction === "ltr" || direction === "rtl") {
    style = ctx.canvas.style;
    original = [
      style.getPropertyValue("direction"),
      style.getPropertyPriority("direction")
    ];
    style.setProperty("direction", direction, "important");
    ctx.prevTextDirection = original;
  }
}
__name(overrideTextDirection, "overrideTextDirection");
function restoreTextDirection(ctx, original) {
  if (original !== void 0) {
    delete ctx.prevTextDirection;
    ctx.canvas.style.setProperty("direction", original[0], original[1]);
  }
}
__name(restoreTextDirection, "restoreTextDirection");
function propertyFn(property) {
  if (property === "angle") {
    return {
      between: _angleBetween,
      compare: _angleDiff,
      normalize: _normalizeAngle
    };
  }
  return {
    between: _isBetween,
    compare: (a, b) => a - b,
    normalize: (x) => x
  };
}
__name(propertyFn, "propertyFn");
function normalizeSegment({ start, end, count, loop: loop2, style }) {
  return {
    start: start % count,
    end: end % count,
    loop: loop2 && (end - start + 1) % count === 0,
    style
  };
}
__name(normalizeSegment, "normalizeSegment");
function getSegment(segment, points, bounds) {
  const { property, start: startBound, end: endBound } = bounds;
  const { between, normalize } = propertyFn(property);
  const count = points.length;
  let { start, end, loop: loop2 } = segment;
  let i, ilen;
  if (loop2) {
    start += count;
    end += count;
    for (i = 0, ilen = count; i < ilen; ++i) {
      if (!between(normalize(points[start % count][property]), startBound, endBound)) {
        break;
      }
      start--;
      end--;
    }
    start %= count;
    end %= count;
  }
  if (end < start) {
    end += count;
  }
  return { start, end, loop: loop2, style: segment.style };
}
__name(getSegment, "getSegment");
function _boundSegment(segment, points, bounds) {
  if (!bounds) {
    return [segment];
  }
  const { property, start: startBound, end: endBound } = bounds;
  const count = points.length;
  const { compare, between, normalize } = propertyFn(property);
  const { start, end, loop: loop2, style } = getSegment(segment, points, bounds);
  const result = [];
  let inside = false;
  let subStart = null;
  let value, point, prevValue;
  const startIsBefore = /* @__PURE__ */ __name(() => between(startBound, prevValue, value) && compare(startBound, prevValue) !== 0, "startIsBefore");
  const endIsBefore = /* @__PURE__ */ __name(() => compare(endBound, value) === 0 || between(endBound, prevValue, value), "endIsBefore");
  const shouldStart = /* @__PURE__ */ __name(() => inside || startIsBefore(), "shouldStart");
  const shouldStop = /* @__PURE__ */ __name(() => !inside || endIsBefore(), "shouldStop");
  for (let i = start, prev = start; i <= end; ++i) {
    point = points[i % count];
    if (point.skip) {
      continue;
    }
    value = normalize(point[property]);
    if (value === prevValue) {
      continue;
    }
    inside = between(value, startBound, endBound);
    if (subStart === null && shouldStart()) {
      subStart = compare(value, startBound) === 0 ? i : prev;
    }
    if (subStart !== null && shouldStop()) {
      result.push(normalizeSegment({ start: subStart, end: i, loop: loop2, count, style }));
      subStart = null;
    }
    prev = i;
    prevValue = value;
  }
  if (subStart !== null) {
    result.push(normalizeSegment({ start: subStart, end, loop: loop2, count, style }));
  }
  return result;
}
__name(_boundSegment, "_boundSegment");
function _boundSegments(line, bounds) {
  const result = [];
  const segments = line.segments;
  for (let i = 0; i < segments.length; i++) {
    const sub = _boundSegment(segments[i], line.points, bounds);
    if (sub.length) {
      result.push(...sub);
    }
  }
  return result;
}
__name(_boundSegments, "_boundSegments");
function findStartAndEnd(points, count, loop2, spanGaps) {
  let start = 0;
  let end = count - 1;
  if (loop2 && !spanGaps) {
    while (start < count && !points[start].skip) {
      start++;
    }
  }
  while (start < count && points[start].skip) {
    start++;
  }
  start %= count;
  if (loop2) {
    end += start;
  }
  while (end > start && points[end % count].skip) {
    end--;
  }
  end %= count;
  return { start, end };
}
__name(findStartAndEnd, "findStartAndEnd");
function solidSegments(points, start, max, loop2) {
  const count = points.length;
  const result = [];
  let last = start;
  let prev = points[start];
  let end;
  for (end = start + 1; end <= max; ++end) {
    const cur = points[end % count];
    if (cur.skip || cur.stop) {
      if (!prev.skip) {
        loop2 = false;
        result.push({ start: start % count, end: (end - 1) % count, loop: loop2 });
        start = last = cur.stop ? end : null;
      }
    } else {
      last = end;
      if (prev.skip) {
        start = end;
      }
    }
    prev = cur;
  }
  if (last !== null) {
    result.push({ start: start % count, end: last % count, loop: loop2 });
  }
  return result;
}
__name(solidSegments, "solidSegments");
function _computeSegments(line, segmentOptions) {
  const points = line.points;
  const spanGaps = line.options.spanGaps;
  const count = points.length;
  if (!count) {
    return [];
  }
  const loop2 = !!line._loop;
  const { start, end } = findStartAndEnd(points, count, loop2, spanGaps);
  if (spanGaps === true) {
    return splitByStyles(line, [{ start, end, loop: loop2 }], points, segmentOptions);
  }
  const max = end < start ? end + count : end;
  const completeLoop = !!line._fullLoop && start === 0 && end === count - 1;
  return splitByStyles(line, solidSegments(points, start, max, completeLoop), points, segmentOptions);
}
__name(_computeSegments, "_computeSegments");
function splitByStyles(line, segments, points, segmentOptions) {
  if (!segmentOptions || !segmentOptions.setContext || !points) {
    return segments;
  }
  return doSplitByStyles(line, segments, points, segmentOptions);
}
__name(splitByStyles, "splitByStyles");
function doSplitByStyles(line, segments, points, segmentOptions) {
  const chartContext = line._chart.getContext();
  const baseStyle = readStyle(line.options);
  const { _datasetIndex: datasetIndex, options: { spanGaps } } = line;
  const count = points.length;
  const result = [];
  let prevStyle = baseStyle;
  let start = segments[0].start;
  let i = start;
  function addStyle(s, e, l, st) {
    const dir = spanGaps ? -1 : 1;
    if (s === e) {
      return;
    }
    s += count;
    while (points[s % count].skip) {
      s -= dir;
    }
    while (points[e % count].skip) {
      e += dir;
    }
    if (s % count !== e % count) {
      result.push({ start: s % count, end: e % count, loop: l, style: st });
      prevStyle = st;
      start = e % count;
    }
  }
  __name(addStyle, "addStyle");
  for (const segment of segments) {
    start = spanGaps ? start : segment.start;
    let prev = points[start % count];
    let style;
    for (i = start + 1; i <= segment.end; i++) {
      const pt = points[i % count];
      style = readStyle(segmentOptions.setContext(createContext(chartContext, {
        type: "segment",
        p0: prev,
        p1: pt,
        p0DataIndex: (i - 1) % count,
        p1DataIndex: i % count,
        datasetIndex
      })));
      if (styleChanged(style, prevStyle)) {
        addStyle(start, i - 1, segment.loop, prevStyle);
      }
      prev = pt;
      prevStyle = style;
    }
    if (start < i - 1) {
      addStyle(start, i - 1, segment.loop, prevStyle);
    }
  }
  return result;
}
__name(doSplitByStyles, "doSplitByStyles");
function readStyle(options) {
  return {
    backgroundColor: options.backgroundColor,
    borderCapStyle: options.borderCapStyle,
    borderDash: options.borderDash,
    borderDashOffset: options.borderDashOffset,
    borderJoinStyle: options.borderJoinStyle,
    borderWidth: options.borderWidth,
    borderColor: options.borderColor
  };
}
__name(readStyle, "readStyle");
function styleChanged(style, prevStyle) {
  return prevStyle && JSON.stringify(style) !== JSON.stringify(prevStyle);
}
__name(styleChanged, "styleChanged");
/*!
 * Chart.js v3.9.1
 * https://www.chartjs.org
 * (c) 2022 Chart.js Contributors
 * Released under the MIT License
 */
class Animator {
  constructor() {
    this._request = null;
    this._charts = /* @__PURE__ */ new Map();
    this._running = false;
    this._lastDate = void 0;
  }
  _notify(chart, anims, date, type) {
    const callbacks = anims.listeners[type];
    const numSteps = anims.duration;
    callbacks.forEach((fn) => fn({
      chart,
      initial: anims.initial,
      numSteps,
      currentStep: Math.min(date - anims.start, numSteps)
    }));
  }
  _refresh() {
    if (this._request) {
      return;
    }
    this._running = true;
    this._request = requestAnimFrame.call(window, () => {
      this._update();
      this._request = null;
      if (this._running) {
        this._refresh();
      }
    });
  }
  _update(date = Date.now()) {
    let remaining = 0;
    this._charts.forEach((anims, chart) => {
      if (!anims.running || !anims.items.length) {
        return;
      }
      const items = anims.items;
      let i = items.length - 1;
      let draw2 = false;
      let item;
      for (; i >= 0; --i) {
        item = items[i];
        if (item._active) {
          if (item._total > anims.duration) {
            anims.duration = item._total;
          }
          item.tick(date);
          draw2 = true;
        } else {
          items[i] = items[items.length - 1];
          items.pop();
        }
      }
      if (draw2) {
        chart.draw();
        this._notify(chart, anims, date, "progress");
      }
      if (!items.length) {
        anims.running = false;
        this._notify(chart, anims, date, "complete");
        anims.initial = false;
      }
      remaining += items.length;
    });
    this._lastDate = date;
    if (remaining === 0) {
      this._running = false;
    }
  }
  _getAnims(chart) {
    const charts = this._charts;
    let anims = charts.get(chart);
    if (!anims) {
      anims = {
        running: false,
        initial: true,
        items: [],
        listeners: {
          complete: [],
          progress: []
        }
      };
      charts.set(chart, anims);
    }
    return anims;
  }
  listen(chart, event, cb) {
    this._getAnims(chart).listeners[event].push(cb);
  }
  add(chart, items) {
    if (!items || !items.length) {
      return;
    }
    this._getAnims(chart).items.push(...items);
  }
  has(chart) {
    return this._getAnims(chart).items.length > 0;
  }
  start(chart) {
    const anims = this._charts.get(chart);
    if (!anims) {
      return;
    }
    anims.running = true;
    anims.start = Date.now();
    anims.duration = anims.items.reduce((acc, cur) => Math.max(acc, cur._duration), 0);
    this._refresh();
  }
  running(chart) {
    if (!this._running) {
      return false;
    }
    const anims = this._charts.get(chart);
    if (!anims || !anims.running || !anims.items.length) {
      return false;
    }
    return true;
  }
  stop(chart) {
    const anims = this._charts.get(chart);
    if (!anims || !anims.items.length) {
      return;
    }
    const items = anims.items;
    let i = items.length - 1;
    for (; i >= 0; --i) {
      items[i].cancel();
    }
    anims.items = [];
    this._notify(chart, anims, Date.now(), "complete");
  }
  remove(chart) {
    return this._charts.delete(chart);
  }
}
__name(Animator, "Animator");
var animator = new Animator();
const transparent = "transparent";
const interpolators = {
  boolean(from2, to2, factor) {
    return factor > 0.5 ? to2 : from2;
  },
  color(from2, to2, factor) {
    const c0 = color(from2 || transparent);
    const c1 = c0.valid && color(to2 || transparent);
    return c1 && c1.valid ? c1.mix(c0, factor).hexString() : to2;
  },
  number(from2, to2, factor) {
    return from2 + (to2 - from2) * factor;
  }
};
class Animation {
  constructor(cfg, target, prop, to2) {
    const currentValue = target[prop];
    to2 = resolve([cfg.to, to2, currentValue, cfg.from]);
    const from2 = resolve([cfg.from, currentValue, to2]);
    this._active = true;
    this._fn = cfg.fn || interpolators[cfg.type || typeof from2];
    this._easing = effects[cfg.easing] || effects.linear;
    this._start = Math.floor(Date.now() + (cfg.delay || 0));
    this._duration = this._total = Math.floor(cfg.duration);
    this._loop = !!cfg.loop;
    this._target = target;
    this._prop = prop;
    this._from = from2;
    this._to = to2;
    this._promises = void 0;
  }
  active() {
    return this._active;
  }
  update(cfg, to2, date) {
    if (this._active) {
      this._notify(false);
      const currentValue = this._target[this._prop];
      const elapsed = date - this._start;
      const remain = this._duration - elapsed;
      this._start = date;
      this._duration = Math.floor(Math.max(remain, cfg.duration));
      this._total += elapsed;
      this._loop = !!cfg.loop;
      this._to = resolve([cfg.to, to2, currentValue, cfg.from]);
      this._from = resolve([cfg.from, currentValue, to2]);
    }
  }
  cancel() {
    if (this._active) {
      this.tick(Date.now());
      this._active = false;
      this._notify(false);
    }
  }
  tick(date) {
    const elapsed = date - this._start;
    const duration = this._duration;
    const prop = this._prop;
    const from2 = this._from;
    const loop2 = this._loop;
    const to2 = this._to;
    let factor;
    this._active = from2 !== to2 && (loop2 || elapsed < duration);
    if (!this._active) {
      this._target[prop] = to2;
      this._notify(true);
      return;
    }
    if (elapsed < 0) {
      this._target[prop] = from2;
      return;
    }
    factor = elapsed / duration % 2;
    factor = loop2 && factor > 1 ? 2 - factor : factor;
    factor = this._easing(Math.min(1, Math.max(0, factor)));
    this._target[prop] = this._fn(from2, to2, factor);
  }
  wait() {
    const promises = this._promises || (this._promises = []);
    return new Promise((res, rej) => {
      promises.push({ res, rej });
    });
  }
  _notify(resolved) {
    const method = resolved ? "res" : "rej";
    const promises = this._promises || [];
    for (let i = 0; i < promises.length; i++) {
      promises[i][method]();
    }
  }
}
__name(Animation, "Animation");
const numbers = ["x", "y", "borderWidth", "radius", "tension"];
const colors = ["color", "borderColor", "backgroundColor"];
defaults.set("animation", {
  delay: void 0,
  duration: 1e3,
  easing: "easeOutQuart",
  fn: void 0,
  from: void 0,
  loop: void 0,
  to: void 0,
  type: void 0
});
const animationOptions = Object.keys(defaults.animation);
defaults.describe("animation", {
  _fallback: false,
  _indexable: false,
  _scriptable: (name) => name !== "onProgress" && name !== "onComplete" && name !== "fn"
});
defaults.set("animations", {
  colors: {
    type: "color",
    properties: colors
  },
  numbers: {
    type: "number",
    properties: numbers
  }
});
defaults.describe("animations", {
  _fallback: "animation"
});
defaults.set("transitions", {
  active: {
    animation: {
      duration: 400
    }
  },
  resize: {
    animation: {
      duration: 0
    }
  },
  show: {
    animations: {
      colors: {
        from: "transparent"
      },
      visible: {
        type: "boolean",
        duration: 0
      }
    }
  },
  hide: {
    animations: {
      colors: {
        to: "transparent"
      },
      visible: {
        type: "boolean",
        easing: "linear",
        fn: (v) => v | 0
      }
    }
  }
});
class Animations {
  constructor(chart, config) {
    this._chart = chart;
    this._properties = /* @__PURE__ */ new Map();
    this.configure(config);
  }
  configure(config) {
    if (!isObject(config)) {
      return;
    }
    const animatedProps = this._properties;
    Object.getOwnPropertyNames(config).forEach((key) => {
      const cfg = config[key];
      if (!isObject(cfg)) {
        return;
      }
      const resolved = {};
      for (const option of animationOptions) {
        resolved[option] = cfg[option];
      }
      (isArray(cfg.properties) && cfg.properties || [key]).forEach((prop) => {
        if (prop === key || !animatedProps.has(prop)) {
          animatedProps.set(prop, resolved);
        }
      });
    });
  }
  _animateOptions(target, values) {
    const newOptions = values.options;
    const options = resolveTargetOptions(target, newOptions);
    if (!options) {
      return [];
    }
    const animations = this._createAnimations(options, newOptions);
    if (newOptions.$shared) {
      awaitAll(target.options.$animations, newOptions).then(() => {
        target.options = newOptions;
      }, () => {
      });
    }
    return animations;
  }
  _createAnimations(target, values) {
    const animatedProps = this._properties;
    const animations = [];
    const running = target.$animations || (target.$animations = {});
    const props = Object.keys(values);
    const date = Date.now();
    let i;
    for (i = props.length - 1; i >= 0; --i) {
      const prop = props[i];
      if (prop.charAt(0) === "$") {
        continue;
      }
      if (prop === "options") {
        animations.push(...this._animateOptions(target, values));
        continue;
      }
      const value = values[prop];
      let animation = running[prop];
      const cfg = animatedProps.get(prop);
      if (animation) {
        if (cfg && animation.active()) {
          animation.update(cfg, value, date);
          continue;
        } else {
          animation.cancel();
        }
      }
      if (!cfg || !cfg.duration) {
        target[prop] = value;
        continue;
      }
      running[prop] = animation = new Animation(cfg, target, prop, value);
      animations.push(animation);
    }
    return animations;
  }
  update(target, values) {
    if (this._properties.size === 0) {
      Object.assign(target, values);
      return;
    }
    const animations = this._createAnimations(target, values);
    if (animations.length) {
      animator.add(this._chart, animations);
      return true;
    }
  }
}
__name(Animations, "Animations");
function awaitAll(animations, properties) {
  const running = [];
  const keys = Object.keys(properties);
  for (let i = 0; i < keys.length; i++) {
    const anim = animations[keys[i]];
    if (anim && anim.active()) {
      running.push(anim.wait());
    }
  }
  return Promise.all(running);
}
__name(awaitAll, "awaitAll");
function resolveTargetOptions(target, newOptions) {
  if (!newOptions) {
    return;
  }
  let options = target.options;
  if (!options) {
    target.options = newOptions;
    return;
  }
  if (options.$shared) {
    target.options = options = Object.assign({}, options, { $shared: false, $animations: {} });
  }
  return options;
}
__name(resolveTargetOptions, "resolveTargetOptions");
function scaleClip(scale, allowedOverflow) {
  const opts = scale && scale.options || {};
  const reverse = opts.reverse;
  const min = opts.min === void 0 ? allowedOverflow : 0;
  const max = opts.max === void 0 ? allowedOverflow : 0;
  return {
    start: reverse ? max : min,
    end: reverse ? min : max
  };
}
__name(scaleClip, "scaleClip");
function defaultClip(xScale, yScale, allowedOverflow) {
  if (allowedOverflow === false) {
    return false;
  }
  const x = scaleClip(xScale, allowedOverflow);
  const y = scaleClip(yScale, allowedOverflow);
  return {
    top: y.end,
    right: x.end,
    bottom: y.start,
    left: x.start
  };
}
__name(defaultClip, "defaultClip");
function toClip(value) {
  let t, r, b, l;
  if (isObject(value)) {
    t = value.top;
    r = value.right;
    b = value.bottom;
    l = value.left;
  } else {
    t = r = b = l = value;
  }
  return {
    top: t,
    right: r,
    bottom: b,
    left: l,
    disabled: value === false
  };
}
__name(toClip, "toClip");
function getSortedDatasetIndices(chart, filterVisible) {
  const keys = [];
  const metasets = chart._getSortedDatasetMetas(filterVisible);
  let i, ilen;
  for (i = 0, ilen = metasets.length; i < ilen; ++i) {
    keys.push(metasets[i].index);
  }
  return keys;
}
__name(getSortedDatasetIndices, "getSortedDatasetIndices");
function applyStack(stack, value, dsIndex, options = {}) {
  const keys = stack.keys;
  const singleMode = options.mode === "single";
  let i, ilen, datasetIndex, otherValue;
  if (value === null) {
    return;
  }
  for (i = 0, ilen = keys.length; i < ilen; ++i) {
    datasetIndex = +keys[i];
    if (datasetIndex === dsIndex) {
      if (options.all) {
        continue;
      }
      break;
    }
    otherValue = stack.values[datasetIndex];
    if (isNumberFinite(otherValue) && (singleMode || (value === 0 || sign(value) === sign(otherValue)))) {
      value += otherValue;
    }
  }
  return value;
}
__name(applyStack, "applyStack");
function convertObjectDataToArray(data) {
  const keys = Object.keys(data);
  const adata = new Array(keys.length);
  let i, ilen, key;
  for (i = 0, ilen = keys.length; i < ilen; ++i) {
    key = keys[i];
    adata[i] = {
      x: key,
      y: data[key]
    };
  }
  return adata;
}
__name(convertObjectDataToArray, "convertObjectDataToArray");
function isStacked(scale, meta) {
  const stacked = scale && scale.options.stacked;
  return stacked || stacked === void 0 && meta.stack !== void 0;
}
__name(isStacked, "isStacked");
function getStackKey(indexScale, valueScale, meta) {
  return `${indexScale.id}.${valueScale.id}.${meta.stack || meta.type}`;
}
__name(getStackKey, "getStackKey");
function getUserBounds(scale) {
  const { min, max, minDefined, maxDefined } = scale.getUserBounds();
  return {
    min: minDefined ? min : Number.NEGATIVE_INFINITY,
    max: maxDefined ? max : Number.POSITIVE_INFINITY
  };
}
__name(getUserBounds, "getUserBounds");
function getOrCreateStack(stacks, stackKey, indexValue) {
  const subStack = stacks[stackKey] || (stacks[stackKey] = {});
  return subStack[indexValue] || (subStack[indexValue] = {});
}
__name(getOrCreateStack, "getOrCreateStack");
function getLastIndexInStack(stack, vScale, positive, type) {
  for (const meta of vScale.getMatchingVisibleMetas(type).reverse()) {
    const value = stack[meta.index];
    if (positive && value > 0 || !positive && value < 0) {
      return meta.index;
    }
  }
  return null;
}
__name(getLastIndexInStack, "getLastIndexInStack");
function updateStacks(controller, parsed) {
  const { chart, _cachedMeta: meta } = controller;
  const stacks = chart._stacks || (chart._stacks = {});
  const { iScale, vScale, index: datasetIndex } = meta;
  const iAxis = iScale.axis;
  const vAxis = vScale.axis;
  const key = getStackKey(iScale, vScale, meta);
  const ilen = parsed.length;
  let stack;
  for (let i = 0; i < ilen; ++i) {
    const item = parsed[i];
    const { [iAxis]: index2, [vAxis]: value } = item;
    const itemStacks = item._stacks || (item._stacks = {});
    stack = itemStacks[vAxis] = getOrCreateStack(stacks, key, index2);
    stack[datasetIndex] = value;
    stack._top = getLastIndexInStack(stack, vScale, true, meta.type);
    stack._bottom = getLastIndexInStack(stack, vScale, false, meta.type);
  }
}
__name(updateStacks, "updateStacks");
function getFirstScaleId(chart, axis) {
  const scales2 = chart.scales;
  return Object.keys(scales2).filter((key) => scales2[key].axis === axis).shift();
}
__name(getFirstScaleId, "getFirstScaleId");
function createDatasetContext(parent, index2) {
  return createContext(
    parent,
    {
      active: false,
      dataset: void 0,
      datasetIndex: index2,
      index: index2,
      mode: "default",
      type: "dataset"
    }
  );
}
__name(createDatasetContext, "createDatasetContext");
function createDataContext(parent, index2, element2) {
  return createContext(parent, {
    active: false,
    dataIndex: index2,
    parsed: void 0,
    raw: void 0,
    element: element2,
    index: index2,
    mode: "default",
    type: "data"
  });
}
__name(createDataContext, "createDataContext");
function clearStacks(meta, items) {
  const datasetIndex = meta.controller.index;
  const axis = meta.vScale && meta.vScale.axis;
  if (!axis) {
    return;
  }
  items = items || meta._parsed;
  for (const parsed of items) {
    const stacks = parsed._stacks;
    if (!stacks || stacks[axis] === void 0 || stacks[axis][datasetIndex] === void 0) {
      return;
    }
    delete stacks[axis][datasetIndex];
  }
}
__name(clearStacks, "clearStacks");
const isDirectUpdateMode = /* @__PURE__ */ __name((mode) => mode === "reset" || mode === "none", "isDirectUpdateMode");
const cloneIfNotShared = /* @__PURE__ */ __name((cached, shared) => shared ? cached : Object.assign({}, cached), "cloneIfNotShared");
const createStack = /* @__PURE__ */ __name((canStack, meta, chart) => canStack && !meta.hidden && meta._stacked && { keys: getSortedDatasetIndices(chart, true), values: null }, "createStack");
class DatasetController {
  constructor(chart, datasetIndex) {
    this.chart = chart;
    this._ctx = chart.ctx;
    this.index = datasetIndex;
    this._cachedDataOpts = {};
    this._cachedMeta = this.getMeta();
    this._type = this._cachedMeta.type;
    this.options = void 0;
    this._parsing = false;
    this._data = void 0;
    this._objectData = void 0;
    this._sharedOptions = void 0;
    this._drawStart = void 0;
    this._drawCount = void 0;
    this.enableOptionSharing = false;
    this.supportsDecimation = false;
    this.$context = void 0;
    this._syncList = [];
    this.initialize();
  }
  initialize() {
    const meta = this._cachedMeta;
    this.configure();
    this.linkScales();
    meta._stacked = isStacked(meta.vScale, meta);
    this.addElements();
  }
  updateIndex(datasetIndex) {
    if (this.index !== datasetIndex) {
      clearStacks(this._cachedMeta);
    }
    this.index = datasetIndex;
  }
  linkScales() {
    const chart = this.chart;
    const meta = this._cachedMeta;
    const dataset = this.getDataset();
    const chooseId = /* @__PURE__ */ __name((axis, x, y, r) => axis === "x" ? x : axis === "r" ? r : y, "chooseId");
    const xid = meta.xAxisID = valueOrDefault(dataset.xAxisID, getFirstScaleId(chart, "x"));
    const yid = meta.yAxisID = valueOrDefault(dataset.yAxisID, getFirstScaleId(chart, "y"));
    const rid = meta.rAxisID = valueOrDefault(dataset.rAxisID, getFirstScaleId(chart, "r"));
    const indexAxis = meta.indexAxis;
    const iid = meta.iAxisID = chooseId(indexAxis, xid, yid, rid);
    const vid = meta.vAxisID = chooseId(indexAxis, yid, xid, rid);
    meta.xScale = this.getScaleForId(xid);
    meta.yScale = this.getScaleForId(yid);
    meta.rScale = this.getScaleForId(rid);
    meta.iScale = this.getScaleForId(iid);
    meta.vScale = this.getScaleForId(vid);
  }
  getDataset() {
    return this.chart.data.datasets[this.index];
  }
  getMeta() {
    return this.chart.getDatasetMeta(this.index);
  }
  getScaleForId(scaleID) {
    return this.chart.scales[scaleID];
  }
  _getOtherScale(scale) {
    const meta = this._cachedMeta;
    return scale === meta.iScale ? meta.vScale : meta.iScale;
  }
  reset() {
    this._update("reset");
  }
  _destroy() {
    const meta = this._cachedMeta;
    if (this._data) {
      unlistenArrayEvents(this._data, this);
    }
    if (meta._stacked) {
      clearStacks(meta);
    }
  }
  _dataCheck() {
    const dataset = this.getDataset();
    const data = dataset.data || (dataset.data = []);
    const _data = this._data;
    if (isObject(data)) {
      this._data = convertObjectDataToArray(data);
    } else if (_data !== data) {
      if (_data) {
        unlistenArrayEvents(_data, this);
        const meta = this._cachedMeta;
        clearStacks(meta);
        meta._parsed = [];
      }
      if (data && Object.isExtensible(data)) {
        listenArrayEvents(data, this);
      }
      this._syncList = [];
      this._data = data;
    }
  }
  addElements() {
    const meta = this._cachedMeta;
    this._dataCheck();
    if (this.datasetElementType) {
      meta.dataset = new this.datasetElementType();
    }
  }
  buildOrUpdateElements(resetNewElements) {
    const meta = this._cachedMeta;
    const dataset = this.getDataset();
    let stackChanged = false;
    this._dataCheck();
    const oldStacked = meta._stacked;
    meta._stacked = isStacked(meta.vScale, meta);
    if (meta.stack !== dataset.stack) {
      stackChanged = true;
      clearStacks(meta);
      meta.stack = dataset.stack;
    }
    this._resyncElements(resetNewElements);
    if (stackChanged || oldStacked !== meta._stacked) {
      updateStacks(this, meta._parsed);
    }
  }
  configure() {
    const config = this.chart.config;
    const scopeKeys = config.datasetScopeKeys(this._type);
    const scopes = config.getOptionScopes(this.getDataset(), scopeKeys, true);
    this.options = config.createResolver(scopes, this.getContext());
    this._parsing = this.options.parsing;
    this._cachedDataOpts = {};
  }
  parse(start, count) {
    const { _cachedMeta: meta, _data: data } = this;
    const { iScale, _stacked } = meta;
    const iAxis = iScale.axis;
    let sorted = start === 0 && count === data.length ? true : meta._sorted;
    let prev = start > 0 && meta._parsed[start - 1];
    let i, cur, parsed;
    if (this._parsing === false) {
      meta._parsed = data;
      meta._sorted = true;
      parsed = data;
    } else {
      if (isArray(data[start])) {
        parsed = this.parseArrayData(meta, data, start, count);
      } else if (isObject(data[start])) {
        parsed = this.parseObjectData(meta, data, start, count);
      } else {
        parsed = this.parsePrimitiveData(meta, data, start, count);
      }
      const isNotInOrderComparedToPrev = /* @__PURE__ */ __name(() => cur[iAxis] === null || prev && cur[iAxis] < prev[iAxis], "isNotInOrderComparedToPrev");
      for (i = 0; i < count; ++i) {
        meta._parsed[i + start] = cur = parsed[i];
        if (sorted) {
          if (isNotInOrderComparedToPrev()) {
            sorted = false;
          }
          prev = cur;
        }
      }
      meta._sorted = sorted;
    }
    if (_stacked) {
      updateStacks(this, parsed);
    }
  }
  parsePrimitiveData(meta, data, start, count) {
    const { iScale, vScale } = meta;
    const iAxis = iScale.axis;
    const vAxis = vScale.axis;
    const labels = iScale.getLabels();
    const singleScale = iScale === vScale;
    const parsed = new Array(count);
    let i, ilen, index2;
    for (i = 0, ilen = count; i < ilen; ++i) {
      index2 = i + start;
      parsed[i] = {
        [iAxis]: singleScale || iScale.parse(labels[index2], index2),
        [vAxis]: vScale.parse(data[index2], index2)
      };
    }
    return parsed;
  }
  parseArrayData(meta, data, start, count) {
    const { xScale, yScale } = meta;
    const parsed = new Array(count);
    let i, ilen, index2, item;
    for (i = 0, ilen = count; i < ilen; ++i) {
      index2 = i + start;
      item = data[index2];
      parsed[i] = {
        x: xScale.parse(item[0], index2),
        y: yScale.parse(item[1], index2)
      };
    }
    return parsed;
  }
  parseObjectData(meta, data, start, count) {
    const { xScale, yScale } = meta;
    const { xAxisKey = "x", yAxisKey = "y" } = this._parsing;
    const parsed = new Array(count);
    let i, ilen, index2, item;
    for (i = 0, ilen = count; i < ilen; ++i) {
      index2 = i + start;
      item = data[index2];
      parsed[i] = {
        x: xScale.parse(resolveObjectKey(item, xAxisKey), index2),
        y: yScale.parse(resolveObjectKey(item, yAxisKey), index2)
      };
    }
    return parsed;
  }
  getParsed(index2) {
    return this._cachedMeta._parsed[index2];
  }
  getDataElement(index2) {
    return this._cachedMeta.data[index2];
  }
  applyStack(scale, parsed, mode) {
    const chart = this.chart;
    const meta = this._cachedMeta;
    const value = parsed[scale.axis];
    const stack = {
      keys: getSortedDatasetIndices(chart, true),
      values: parsed._stacks[scale.axis]
    };
    return applyStack(stack, value, meta.index, { mode });
  }
  updateRangeFromParsed(range, scale, parsed, stack) {
    const parsedValue = parsed[scale.axis];
    let value = parsedValue === null ? NaN : parsedValue;
    const values = stack && parsed._stacks[scale.axis];
    if (stack && values) {
      stack.values = values;
      value = applyStack(stack, parsedValue, this._cachedMeta.index);
    }
    range.min = Math.min(range.min, value);
    range.max = Math.max(range.max, value);
  }
  getMinMax(scale, canStack) {
    const meta = this._cachedMeta;
    const _parsed = meta._parsed;
    const sorted = meta._sorted && scale === meta.iScale;
    const ilen = _parsed.length;
    const otherScale = this._getOtherScale(scale);
    const stack = createStack(canStack, meta, this.chart);
    const range = { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY };
    const { min: otherMin, max: otherMax } = getUserBounds(otherScale);
    let i, parsed;
    function _skip() {
      parsed = _parsed[i];
      const otherValue = parsed[otherScale.axis];
      return !isNumberFinite(parsed[scale.axis]) || otherMin > otherValue || otherMax < otherValue;
    }
    __name(_skip, "_skip");
    for (i = 0; i < ilen; ++i) {
      if (_skip()) {
        continue;
      }
      this.updateRangeFromParsed(range, scale, parsed, stack);
      if (sorted) {
        break;
      }
    }
    if (sorted) {
      for (i = ilen - 1; i >= 0; --i) {
        if (_skip()) {
          continue;
        }
        this.updateRangeFromParsed(range, scale, parsed, stack);
        break;
      }
    }
    return range;
  }
  getAllParsedValues(scale) {
    const parsed = this._cachedMeta._parsed;
    const values = [];
    let i, ilen, value;
    for (i = 0, ilen = parsed.length; i < ilen; ++i) {
      value = parsed[i][scale.axis];
      if (isNumberFinite(value)) {
        values.push(value);
      }
    }
    return values;
  }
  getMaxOverflow() {
    return false;
  }
  getLabelAndValue(index2) {
    const meta = this._cachedMeta;
    const iScale = meta.iScale;
    const vScale = meta.vScale;
    const parsed = this.getParsed(index2);
    return {
      label: iScale ? "" + iScale.getLabelForValue(parsed[iScale.axis]) : "",
      value: vScale ? "" + vScale.getLabelForValue(parsed[vScale.axis]) : ""
    };
  }
  _update(mode) {
    const meta = this._cachedMeta;
    this.update(mode || "default");
    meta._clip = toClip(valueOrDefault(this.options.clip, defaultClip(meta.xScale, meta.yScale, this.getMaxOverflow())));
  }
  update(mode) {
  }
  draw() {
    const ctx = this._ctx;
    const chart = this.chart;
    const meta = this._cachedMeta;
    const elements2 = meta.data || [];
    const area = chart.chartArea;
    const active2 = [];
    const start = this._drawStart || 0;
    const count = this._drawCount || elements2.length - start;
    const drawActiveElementsOnTop = this.options.drawActiveElementsOnTop;
    let i;
    if (meta.dataset) {
      meta.dataset.draw(ctx, area, start, count);
    }
    for (i = start; i < start + count; ++i) {
      const element2 = elements2[i];
      if (element2.hidden) {
        continue;
      }
      if (element2.active && drawActiveElementsOnTop) {
        active2.push(element2);
      } else {
        element2.draw(ctx, area);
      }
    }
    for (i = 0; i < active2.length; ++i) {
      active2[i].draw(ctx, area);
    }
  }
  getStyle(index2, active2) {
    const mode = active2 ? "active" : "default";
    return index2 === void 0 && this._cachedMeta.dataset ? this.resolveDatasetElementOptions(mode) : this.resolveDataElementOptions(index2 || 0, mode);
  }
  getContext(index2, active2, mode) {
    const dataset = this.getDataset();
    let context;
    if (index2 >= 0 && index2 < this._cachedMeta.data.length) {
      const element2 = this._cachedMeta.data[index2];
      context = element2.$context || (element2.$context = createDataContext(this.getContext(), index2, element2));
      context.parsed = this.getParsed(index2);
      context.raw = dataset.data[index2];
      context.index = context.dataIndex = index2;
    } else {
      context = this.$context || (this.$context = createDatasetContext(this.chart.getContext(), this.index));
      context.dataset = dataset;
      context.index = context.datasetIndex = this.index;
    }
    context.active = !!active2;
    context.mode = mode;
    return context;
  }
  resolveDatasetElementOptions(mode) {
    return this._resolveElementOptions(this.datasetElementType.id, mode);
  }
  resolveDataElementOptions(index2, mode) {
    return this._resolveElementOptions(this.dataElementType.id, mode, index2);
  }
  _resolveElementOptions(elementType, mode = "default", index2) {
    const active2 = mode === "active";
    const cache = this._cachedDataOpts;
    const cacheKey = elementType + "-" + mode;
    const cached = cache[cacheKey];
    const sharing = this.enableOptionSharing && defined(index2);
    if (cached) {
      return cloneIfNotShared(cached, sharing);
    }
    const config = this.chart.config;
    const scopeKeys = config.datasetElementScopeKeys(this._type, elementType);
    const prefixes = active2 ? [`${elementType}Hover`, "hover", elementType, ""] : [elementType, ""];
    const scopes = config.getOptionScopes(this.getDataset(), scopeKeys);
    const names2 = Object.keys(defaults.elements[elementType]);
    const context = /* @__PURE__ */ __name(() => this.getContext(index2, active2), "context");
    const values = config.resolveNamedOptions(scopes, names2, context, prefixes);
    if (values.$shared) {
      values.$shared = sharing;
      cache[cacheKey] = Object.freeze(cloneIfNotShared(values, sharing));
    }
    return values;
  }
  _resolveAnimations(index2, transition, active2) {
    const chart = this.chart;
    const cache = this._cachedDataOpts;
    const cacheKey = `animation-${transition}`;
    const cached = cache[cacheKey];
    if (cached) {
      return cached;
    }
    let options;
    if (chart.options.animation !== false) {
      const config = this.chart.config;
      const scopeKeys = config.datasetAnimationScopeKeys(this._type, transition);
      const scopes = config.getOptionScopes(this.getDataset(), scopeKeys);
      options = config.createResolver(scopes, this.getContext(index2, active2, transition));
    }
    const animations = new Animations(chart, options && options.animations);
    if (options && options._cacheable) {
      cache[cacheKey] = Object.freeze(animations);
    }
    return animations;
  }
  getSharedOptions(options) {
    if (!options.$shared) {
      return;
    }
    return this._sharedOptions || (this._sharedOptions = Object.assign({}, options));
  }
  includeOptions(mode, sharedOptions) {
    return !sharedOptions || isDirectUpdateMode(mode) || this.chart._animationsDisabled;
  }
  _getSharedOptions(start, mode) {
    const firstOpts = this.resolveDataElementOptions(start, mode);
    const previouslySharedOptions = this._sharedOptions;
    const sharedOptions = this.getSharedOptions(firstOpts);
    const includeOptions = this.includeOptions(mode, sharedOptions) || sharedOptions !== previouslySharedOptions;
    this.updateSharedOptions(sharedOptions, mode, firstOpts);
    return { sharedOptions, includeOptions };
  }
  updateElement(element2, index2, properties, mode) {
    if (isDirectUpdateMode(mode)) {
      Object.assign(element2, properties);
    } else {
      this._resolveAnimations(index2, mode).update(element2, properties);
    }
  }
  updateSharedOptions(sharedOptions, mode, newOptions) {
    if (sharedOptions && !isDirectUpdateMode(mode)) {
      this._resolveAnimations(void 0, mode).update(sharedOptions, newOptions);
    }
  }
  _setStyle(element2, index2, mode, active2) {
    element2.active = active2;
    const options = this.getStyle(index2, active2);
    this._resolveAnimations(index2, mode, active2).update(element2, {
      options: !active2 && this.getSharedOptions(options) || options
    });
  }
  removeHoverStyle(element2, datasetIndex, index2) {
    this._setStyle(element2, index2, "active", false);
  }
  setHoverStyle(element2, datasetIndex, index2) {
    this._setStyle(element2, index2, "active", true);
  }
  _removeDatasetHoverStyle() {
    const element2 = this._cachedMeta.dataset;
    if (element2) {
      this._setStyle(element2, void 0, "active", false);
    }
  }
  _setDatasetHoverStyle() {
    const element2 = this._cachedMeta.dataset;
    if (element2) {
      this._setStyle(element2, void 0, "active", true);
    }
  }
  _resyncElements(resetNewElements) {
    const data = this._data;
    const elements2 = this._cachedMeta.data;
    for (const [method, arg1, arg2] of this._syncList) {
      this[method](arg1, arg2);
    }
    this._syncList = [];
    const numMeta = elements2.length;
    const numData = data.length;
    const count = Math.min(numData, numMeta);
    if (count) {
      this.parse(0, count);
    }
    if (numData > numMeta) {
      this._insertElements(numMeta, numData - numMeta, resetNewElements);
    } else if (numData < numMeta) {
      this._removeElements(numData, numMeta - numData);
    }
  }
  _insertElements(start, count, resetNewElements = true) {
    const meta = this._cachedMeta;
    const data = meta.data;
    const end = start + count;
    let i;
    const move = /* @__PURE__ */ __name((arr) => {
      arr.length += count;
      for (i = arr.length - 1; i >= end; i--) {
        arr[i] = arr[i - count];
      }
    }, "move");
    move(data);
    for (i = start; i < end; ++i) {
      data[i] = new this.dataElementType();
    }
    if (this._parsing) {
      move(meta._parsed);
    }
    this.parse(start, count);
    if (resetNewElements) {
      this.updateElements(data, start, count, "reset");
    }
  }
  updateElements(element2, start, count, mode) {
  }
  _removeElements(start, count) {
    const meta = this._cachedMeta;
    if (this._parsing) {
      const removed = meta._parsed.splice(start, count);
      if (meta._stacked) {
        clearStacks(meta, removed);
      }
    }
    meta.data.splice(start, count);
  }
  _sync(args) {
    if (this._parsing) {
      this._syncList.push(args);
    } else {
      const [method, arg1, arg2] = args;
      this[method](arg1, arg2);
    }
    this.chart._dataChanges.push([this.index, ...args]);
  }
  _onDataPush() {
    const count = arguments.length;
    this._sync(["_insertElements", this.getDataset().data.length - count, count]);
  }
  _onDataPop() {
    this._sync(["_removeElements", this._cachedMeta.data.length - 1, 1]);
  }
  _onDataShift() {
    this._sync(["_removeElements", 0, 1]);
  }
  _onDataSplice(start, count) {
    if (count) {
      this._sync(["_removeElements", start, count]);
    }
    const newCount = arguments.length - 2;
    if (newCount) {
      this._sync(["_insertElements", start, newCount]);
    }
  }
  _onDataUnshift() {
    this._sync(["_insertElements", 0, arguments.length]);
  }
}
__name(DatasetController, "DatasetController");
DatasetController.defaults = {};
DatasetController.prototype.datasetElementType = null;
DatasetController.prototype.dataElementType = null;
function getAllScaleValues(scale, type) {
  if (!scale._cache.$bar) {
    const visibleMetas = scale.getMatchingVisibleMetas(type);
    let values = [];
    for (let i = 0, ilen = visibleMetas.length; i < ilen; i++) {
      values = values.concat(visibleMetas[i].controller.getAllParsedValues(scale));
    }
    scale._cache.$bar = _arrayUnique(values.sort((a, b) => a - b));
  }
  return scale._cache.$bar;
}
__name(getAllScaleValues, "getAllScaleValues");
function computeMinSampleSize(meta) {
  const scale = meta.iScale;
  const values = getAllScaleValues(scale, meta.type);
  let min = scale._length;
  let i, ilen, curr, prev;
  const updateMinAndPrev = /* @__PURE__ */ __name(() => {
    if (curr === 32767 || curr === -32768) {
      return;
    }
    if (defined(prev)) {
      min = Math.min(min, Math.abs(curr - prev) || min);
    }
    prev = curr;
  }, "updateMinAndPrev");
  for (i = 0, ilen = values.length; i < ilen; ++i) {
    curr = scale.getPixelForValue(values[i]);
    updateMinAndPrev();
  }
  prev = void 0;
  for (i = 0, ilen = scale.ticks.length; i < ilen; ++i) {
    curr = scale.getPixelForTick(i);
    updateMinAndPrev();
  }
  return min;
}
__name(computeMinSampleSize, "computeMinSampleSize");
function computeFitCategoryTraits(index2, ruler, options, stackCount) {
  const thickness = options.barThickness;
  let size, ratio;
  if (isNullOrUndef(thickness)) {
    size = ruler.min * options.categoryPercentage;
    ratio = options.barPercentage;
  } else {
    size = thickness * stackCount;
    ratio = 1;
  }
  return {
    chunk: size / stackCount,
    ratio,
    start: ruler.pixels[index2] - size / 2
  };
}
__name(computeFitCategoryTraits, "computeFitCategoryTraits");
function computeFlexCategoryTraits(index2, ruler, options, stackCount) {
  const pixels = ruler.pixels;
  const curr = pixels[index2];
  let prev = index2 > 0 ? pixels[index2 - 1] : null;
  let next = index2 < pixels.length - 1 ? pixels[index2 + 1] : null;
  const percent = options.categoryPercentage;
  if (prev === null) {
    prev = curr - (next === null ? ruler.end - ruler.start : next - curr);
  }
  if (next === null) {
    next = curr + curr - prev;
  }
  const start = curr - (curr - Math.min(prev, next)) / 2 * percent;
  const size = Math.abs(next - prev) / 2 * percent;
  return {
    chunk: size / stackCount,
    ratio: options.barPercentage,
    start
  };
}
__name(computeFlexCategoryTraits, "computeFlexCategoryTraits");
function parseFloatBar(entry, item, vScale, i) {
  const startValue = vScale.parse(entry[0], i);
  const endValue = vScale.parse(entry[1], i);
  const min = Math.min(startValue, endValue);
  const max = Math.max(startValue, endValue);
  let barStart = min;
  let barEnd = max;
  if (Math.abs(min) > Math.abs(max)) {
    barStart = max;
    barEnd = min;
  }
  item[vScale.axis] = barEnd;
  item._custom = {
    barStart,
    barEnd,
    start: startValue,
    end: endValue,
    min,
    max
  };
}
__name(parseFloatBar, "parseFloatBar");
function parseValue(entry, item, vScale, i) {
  if (isArray(entry)) {
    parseFloatBar(entry, item, vScale, i);
  } else {
    item[vScale.axis] = vScale.parse(entry, i);
  }
  return item;
}
__name(parseValue, "parseValue");
function parseArrayOrPrimitive(meta, data, start, count) {
  const iScale = meta.iScale;
  const vScale = meta.vScale;
  const labels = iScale.getLabels();
  const singleScale = iScale === vScale;
  const parsed = [];
  let i, ilen, item, entry;
  for (i = start, ilen = start + count; i < ilen; ++i) {
    entry = data[i];
    item = {};
    item[iScale.axis] = singleScale || iScale.parse(labels[i], i);
    parsed.push(parseValue(entry, item, vScale, i));
  }
  return parsed;
}
__name(parseArrayOrPrimitive, "parseArrayOrPrimitive");
function isFloatBar(custom) {
  return custom && custom.barStart !== void 0 && custom.barEnd !== void 0;
}
__name(isFloatBar, "isFloatBar");
function barSign(size, vScale, actualBase) {
  if (size !== 0) {
    return sign(size);
  }
  return (vScale.isHorizontal() ? 1 : -1) * (vScale.min >= actualBase ? 1 : -1);
}
__name(barSign, "barSign");
function borderProps(properties) {
  let reverse, start, end, top, bottom;
  if (properties.horizontal) {
    reverse = properties.base > properties.x;
    start = "left";
    end = "right";
  } else {
    reverse = properties.base < properties.y;
    start = "bottom";
    end = "top";
  }
  if (reverse) {
    top = "end";
    bottom = "start";
  } else {
    top = "start";
    bottom = "end";
  }
  return { start, end, reverse, top, bottom };
}
__name(borderProps, "borderProps");
function setBorderSkipped(properties, options, stack, index2) {
  let edge = options.borderSkipped;
  const res = {};
  if (!edge) {
    properties.borderSkipped = res;
    return;
  }
  if (edge === true) {
    properties.borderSkipped = { top: true, right: true, bottom: true, left: true };
    return;
  }
  const { start, end, reverse, top, bottom } = borderProps(properties);
  if (edge === "middle" && stack) {
    properties.enableBorderRadius = true;
    if ((stack._top || 0) === index2) {
      edge = top;
    } else if ((stack._bottom || 0) === index2) {
      edge = bottom;
    } else {
      res[parseEdge(bottom, start, end, reverse)] = true;
      edge = top;
    }
  }
  res[parseEdge(edge, start, end, reverse)] = true;
  properties.borderSkipped = res;
}
__name(setBorderSkipped, "setBorderSkipped");
function parseEdge(edge, a, b, reverse) {
  if (reverse) {
    edge = swap(edge, a, b);
    edge = startEnd(edge, b, a);
  } else {
    edge = startEnd(edge, a, b);
  }
  return edge;
}
__name(parseEdge, "parseEdge");
function swap(orig, v1, v2) {
  return orig === v1 ? v2 : orig === v2 ? v1 : orig;
}
__name(swap, "swap");
function startEnd(v, start, end) {
  return v === "start" ? start : v === "end" ? end : v;
}
__name(startEnd, "startEnd");
function setInflateAmount(properties, { inflateAmount }, ratio) {
  properties.inflateAmount = inflateAmount === "auto" ? ratio === 1 ? 0.33 : 0 : inflateAmount;
}
__name(setInflateAmount, "setInflateAmount");
class BarController extends DatasetController {
  parsePrimitiveData(meta, data, start, count) {
    return parseArrayOrPrimitive(meta, data, start, count);
  }
  parseArrayData(meta, data, start, count) {
    return parseArrayOrPrimitive(meta, data, start, count);
  }
  parseObjectData(meta, data, start, count) {
    const { iScale, vScale } = meta;
    const { xAxisKey = "x", yAxisKey = "y" } = this._parsing;
    const iAxisKey = iScale.axis === "x" ? xAxisKey : yAxisKey;
    const vAxisKey = vScale.axis === "x" ? xAxisKey : yAxisKey;
    const parsed = [];
    let i, ilen, item, obj;
    for (i = start, ilen = start + count; i < ilen; ++i) {
      obj = data[i];
      item = {};
      item[iScale.axis] = iScale.parse(resolveObjectKey(obj, iAxisKey), i);
      parsed.push(parseValue(resolveObjectKey(obj, vAxisKey), item, vScale, i));
    }
    return parsed;
  }
  updateRangeFromParsed(range, scale, parsed, stack) {
    super.updateRangeFromParsed(range, scale, parsed, stack);
    const custom = parsed._custom;
    if (custom && scale === this._cachedMeta.vScale) {
      range.min = Math.min(range.min, custom.min);
      range.max = Math.max(range.max, custom.max);
    }
  }
  getMaxOverflow() {
    return 0;
  }
  getLabelAndValue(index2) {
    const meta = this._cachedMeta;
    const { iScale, vScale } = meta;
    const parsed = this.getParsed(index2);
    const custom = parsed._custom;
    const value = isFloatBar(custom) ? "[" + custom.start + ", " + custom.end + "]" : "" + vScale.getLabelForValue(parsed[vScale.axis]);
    return {
      label: "" + iScale.getLabelForValue(parsed[iScale.axis]),
      value
    };
  }
  initialize() {
    this.enableOptionSharing = true;
    super.initialize();
    const meta = this._cachedMeta;
    meta.stack = this.getDataset().stack;
  }
  update(mode) {
    const meta = this._cachedMeta;
    this.updateElements(meta.data, 0, meta.data.length, mode);
  }
  updateElements(bars, start, count, mode) {
    const reset = mode === "reset";
    const { index: index2, _cachedMeta: { vScale } } = this;
    const base = vScale.getBasePixel();
    const horizontal = vScale.isHorizontal();
    const ruler = this._getRuler();
    const { sharedOptions, includeOptions } = this._getSharedOptions(start, mode);
    for (let i = start; i < start + count; i++) {
      const parsed = this.getParsed(i);
      const vpixels = reset || isNullOrUndef(parsed[vScale.axis]) ? { base, head: base } : this._calculateBarValuePixels(i);
      const ipixels = this._calculateBarIndexPixels(i, ruler);
      const stack = (parsed._stacks || {})[vScale.axis];
      const properties = {
        horizontal,
        base: vpixels.base,
        enableBorderRadius: !stack || isFloatBar(parsed._custom) || (index2 === stack._top || index2 === stack._bottom),
        x: horizontal ? vpixels.head : ipixels.center,
        y: horizontal ? ipixels.center : vpixels.head,
        height: horizontal ? ipixels.size : Math.abs(vpixels.size),
        width: horizontal ? Math.abs(vpixels.size) : ipixels.size
      };
      if (includeOptions) {
        properties.options = sharedOptions || this.resolveDataElementOptions(i, bars[i].active ? "active" : mode);
      }
      const options = properties.options || bars[i].options;
      setBorderSkipped(properties, options, stack, index2);
      setInflateAmount(properties, options, ruler.ratio);
      this.updateElement(bars[i], i, properties, mode);
    }
  }
  _getStacks(last, dataIndex) {
    const { iScale } = this._cachedMeta;
    const metasets = iScale.getMatchingVisibleMetas(this._type).filter((meta) => meta.controller.options.grouped);
    const stacked = iScale.options.stacked;
    const stacks = [];
    const skipNull = /* @__PURE__ */ __name((meta) => {
      const parsed = meta.controller.getParsed(dataIndex);
      const val = parsed && parsed[meta.vScale.axis];
      if (isNullOrUndef(val) || isNaN(val)) {
        return true;
      }
    }, "skipNull");
    for (const meta of metasets) {
      if (dataIndex !== void 0 && skipNull(meta)) {
        continue;
      }
      if (stacked === false || stacks.indexOf(meta.stack) === -1 || stacked === void 0 && meta.stack === void 0) {
        stacks.push(meta.stack);
      }
      if (meta.index === last) {
        break;
      }
    }
    if (!stacks.length) {
      stacks.push(void 0);
    }
    return stacks;
  }
  _getStackCount(index2) {
    return this._getStacks(void 0, index2).length;
  }
  _getStackIndex(datasetIndex, name, dataIndex) {
    const stacks = this._getStacks(datasetIndex, dataIndex);
    const index2 = name !== void 0 ? stacks.indexOf(name) : -1;
    return index2 === -1 ? stacks.length - 1 : index2;
  }
  _getRuler() {
    const opts = this.options;
    const meta = this._cachedMeta;
    const iScale = meta.iScale;
    const pixels = [];
    let i, ilen;
    for (i = 0, ilen = meta.data.length; i < ilen; ++i) {
      pixels.push(iScale.getPixelForValue(this.getParsed(i)[iScale.axis], i));
    }
    const barThickness = opts.barThickness;
    const min = barThickness || computeMinSampleSize(meta);
    return {
      min,
      pixels,
      start: iScale._startPixel,
      end: iScale._endPixel,
      stackCount: this._getStackCount(),
      scale: iScale,
      grouped: opts.grouped,
      ratio: barThickness ? 1 : opts.categoryPercentage * opts.barPercentage
    };
  }
  _calculateBarValuePixels(index2) {
    const { _cachedMeta: { vScale, _stacked }, options: { base: baseValue, minBarLength } } = this;
    const actualBase = baseValue || 0;
    const parsed = this.getParsed(index2);
    const custom = parsed._custom;
    const floating = isFloatBar(custom);
    let value = parsed[vScale.axis];
    let start = 0;
    let length = _stacked ? this.applyStack(vScale, parsed, _stacked) : value;
    let head, size;
    if (length !== value) {
      start = length - value;
      length = value;
    }
    if (floating) {
      value = custom.barStart;
      length = custom.barEnd - custom.barStart;
      if (value !== 0 && sign(value) !== sign(custom.barEnd)) {
        start = 0;
      }
      start += value;
    }
    const startValue = !isNullOrUndef(baseValue) && !floating ? baseValue : start;
    let base = vScale.getPixelForValue(startValue);
    if (this.chart.getDataVisibility(index2)) {
      head = vScale.getPixelForValue(start + length);
    } else {
      head = base;
    }
    size = head - base;
    if (Math.abs(size) < minBarLength) {
      size = barSign(size, vScale, actualBase) * minBarLength;
      if (value === actualBase) {
        base -= size / 2;
      }
      const startPixel = vScale.getPixelForDecimal(0);
      const endPixel = vScale.getPixelForDecimal(1);
      const min = Math.min(startPixel, endPixel);
      const max = Math.max(startPixel, endPixel);
      base = Math.max(Math.min(base, max), min);
      head = base + size;
    }
    if (base === vScale.getPixelForValue(actualBase)) {
      const halfGrid = sign(size) * vScale.getLineWidthForValue(actualBase) / 2;
      base += halfGrid;
      size -= halfGrid;
    }
    return {
      size,
      base,
      head,
      center: head + size / 2
    };
  }
  _calculateBarIndexPixels(index2, ruler) {
    const scale = ruler.scale;
    const options = this.options;
    const skipNull = options.skipNull;
    const maxBarThickness = valueOrDefault(options.maxBarThickness, Infinity);
    let center, size;
    if (ruler.grouped) {
      const stackCount = skipNull ? this._getStackCount(index2) : ruler.stackCount;
      const range = options.barThickness === "flex" ? computeFlexCategoryTraits(index2, ruler, options, stackCount) : computeFitCategoryTraits(index2, ruler, options, stackCount);
      const stackIndex = this._getStackIndex(this.index, this._cachedMeta.stack, skipNull ? index2 : void 0);
      center = range.start + range.chunk * stackIndex + range.chunk / 2;
      size = Math.min(maxBarThickness, range.chunk * range.ratio);
    } else {
      center = scale.getPixelForValue(this.getParsed(index2)[scale.axis], index2);
      size = Math.min(maxBarThickness, ruler.min * ruler.ratio);
    }
    return {
      base: center - size / 2,
      head: center + size / 2,
      center,
      size
    };
  }
  draw() {
    const meta = this._cachedMeta;
    const vScale = meta.vScale;
    const rects = meta.data;
    const ilen = rects.length;
    let i = 0;
    for (; i < ilen; ++i) {
      if (this.getParsed(i)[vScale.axis] !== null) {
        rects[i].draw(this._ctx);
      }
    }
  }
}
__name(BarController, "BarController");
BarController.id = "bar";
BarController.defaults = {
  datasetElementType: false,
  dataElementType: "bar",
  categoryPercentage: 0.8,
  barPercentage: 0.9,
  grouped: true,
  animations: {
    numbers: {
      type: "number",
      properties: ["x", "y", "base", "width", "height"]
    }
  }
};
BarController.overrides = {
  scales: {
    _index_: {
      type: "category",
      offset: true,
      grid: {
        offset: true
      }
    },
    _value_: {
      type: "linear",
      beginAtZero: true
    }
  }
};
class BubbleController extends DatasetController {
  initialize() {
    this.enableOptionSharing = true;
    super.initialize();
  }
  parsePrimitiveData(meta, data, start, count) {
    const parsed = super.parsePrimitiveData(meta, data, start, count);
    for (let i = 0; i < parsed.length; i++) {
      parsed[i]._custom = this.resolveDataElementOptions(i + start).radius;
    }
    return parsed;
  }
  parseArrayData(meta, data, start, count) {
    const parsed = super.parseArrayData(meta, data, start, count);
    for (let i = 0; i < parsed.length; i++) {
      const item = data[start + i];
      parsed[i]._custom = valueOrDefault(item[2], this.resolveDataElementOptions(i + start).radius);
    }
    return parsed;
  }
  parseObjectData(meta, data, start, count) {
    const parsed = super.parseObjectData(meta, data, start, count);
    for (let i = 0; i < parsed.length; i++) {
      const item = data[start + i];
      parsed[i]._custom = valueOrDefault(item && item.r && +item.r, this.resolveDataElementOptions(i + start).radius);
    }
    return parsed;
  }
  getMaxOverflow() {
    const data = this._cachedMeta.data;
    let max = 0;
    for (let i = data.length - 1; i >= 0; --i) {
      max = Math.max(max, data[i].size(this.resolveDataElementOptions(i)) / 2);
    }
    return max > 0 && max;
  }
  getLabelAndValue(index2) {
    const meta = this._cachedMeta;
    const { xScale, yScale } = meta;
    const parsed = this.getParsed(index2);
    const x = xScale.getLabelForValue(parsed.x);
    const y = yScale.getLabelForValue(parsed.y);
    const r = parsed._custom;
    return {
      label: meta.label,
      value: "(" + x + ", " + y + (r ? ", " + r : "") + ")"
    };
  }
  update(mode) {
    const points = this._cachedMeta.data;
    this.updateElements(points, 0, points.length, mode);
  }
  updateElements(points, start, count, mode) {
    const reset = mode === "reset";
    const { iScale, vScale } = this._cachedMeta;
    const { sharedOptions, includeOptions } = this._getSharedOptions(start, mode);
    const iAxis = iScale.axis;
    const vAxis = vScale.axis;
    for (let i = start; i < start + count; i++) {
      const point = points[i];
      const parsed = !reset && this.getParsed(i);
      const properties = {};
      const iPixel = properties[iAxis] = reset ? iScale.getPixelForDecimal(0.5) : iScale.getPixelForValue(parsed[iAxis]);
      const vPixel = properties[vAxis] = reset ? vScale.getBasePixel() : vScale.getPixelForValue(parsed[vAxis]);
      properties.skip = isNaN(iPixel) || isNaN(vPixel);
      if (includeOptions) {
        properties.options = sharedOptions || this.resolveDataElementOptions(i, point.active ? "active" : mode);
        if (reset) {
          properties.options.radius = 0;
        }
      }
      this.updateElement(point, i, properties, mode);
    }
  }
  resolveDataElementOptions(index2, mode) {
    const parsed = this.getParsed(index2);
    let values = super.resolveDataElementOptions(index2, mode);
    if (values.$shared) {
      values = Object.assign({}, values, { $shared: false });
    }
    const radius2 = values.radius;
    if (mode !== "active") {
      values.radius = 0;
    }
    values.radius += valueOrDefault(parsed && parsed._custom, radius2);
    return values;
  }
}
__name(BubbleController, "BubbleController");
BubbleController.id = "bubble";
BubbleController.defaults = {
  datasetElementType: false,
  dataElementType: "point",
  animations: {
    numbers: {
      type: "number",
      properties: ["x", "y", "borderWidth", "radius"]
    }
  }
};
BubbleController.overrides = {
  scales: {
    x: {
      type: "linear"
    },
    y: {
      type: "linear"
    }
  },
  plugins: {
    tooltip: {
      callbacks: {
        title() {
          return "";
        }
      }
    }
  }
};
function getRatioAndOffset(rotation, circumference, cutout) {
  let ratioX = 1;
  let ratioY = 1;
  let offsetX = 0;
  let offsetY = 0;
  if (circumference < TAU) {
    const startAngle = rotation;
    const endAngle = startAngle + circumference;
    const startX = Math.cos(startAngle);
    const startY = Math.sin(startAngle);
    const endX = Math.cos(endAngle);
    const endY = Math.sin(endAngle);
    const calcMax = /* @__PURE__ */ __name((angle, a, b) => _angleBetween(angle, startAngle, endAngle, true) ? 1 : Math.max(a, a * cutout, b, b * cutout), "calcMax");
    const calcMin = /* @__PURE__ */ __name((angle, a, b) => _angleBetween(angle, startAngle, endAngle, true) ? -1 : Math.min(a, a * cutout, b, b * cutout), "calcMin");
    const maxX = calcMax(0, startX, endX);
    const maxY = calcMax(HALF_PI, startY, endY);
    const minX = calcMin(PI, startX, endX);
    const minY = calcMin(PI + HALF_PI, startY, endY);
    ratioX = (maxX - minX) / 2;
    ratioY = (maxY - minY) / 2;
    offsetX = -(maxX + minX) / 2;
    offsetY = -(maxY + minY) / 2;
  }
  return { ratioX, ratioY, offsetX, offsetY };
}
__name(getRatioAndOffset, "getRatioAndOffset");
class DoughnutController extends DatasetController {
  constructor(chart, datasetIndex) {
    super(chart, datasetIndex);
    this.enableOptionSharing = true;
    this.innerRadius = void 0;
    this.outerRadius = void 0;
    this.offsetX = void 0;
    this.offsetY = void 0;
  }
  linkScales() {
  }
  parse(start, count) {
    const data = this.getDataset().data;
    const meta = this._cachedMeta;
    if (this._parsing === false) {
      meta._parsed = data;
    } else {
      let getter = /* @__PURE__ */ __name((i2) => +data[i2], "getter");
      if (isObject(data[start])) {
        const { key = "value" } = this._parsing;
        getter = /* @__PURE__ */ __name((i2) => +resolveObjectKey(data[i2], key), "getter");
      }
      let i, ilen;
      for (i = start, ilen = start + count; i < ilen; ++i) {
        meta._parsed[i] = getter(i);
      }
    }
  }
  _getRotation() {
    return toRadians(this.options.rotation - 90);
  }
  _getCircumference() {
    return toRadians(this.options.circumference);
  }
  _getRotationExtents() {
    let min = TAU;
    let max = -TAU;
    for (let i = 0; i < this.chart.data.datasets.length; ++i) {
      if (this.chart.isDatasetVisible(i)) {
        const controller = this.chart.getDatasetMeta(i).controller;
        const rotation = controller._getRotation();
        const circumference = controller._getCircumference();
        min = Math.min(min, rotation);
        max = Math.max(max, rotation + circumference);
      }
    }
    return {
      rotation: min,
      circumference: max - min
    };
  }
  update(mode) {
    const chart = this.chart;
    const { chartArea } = chart;
    const meta = this._cachedMeta;
    const arcs = meta.data;
    const spacing = this.getMaxBorderWidth() + this.getMaxOffset(arcs) + this.options.spacing;
    const maxSize = Math.max((Math.min(chartArea.width, chartArea.height) - spacing) / 2, 0);
    const cutout = Math.min(toPercentage(this.options.cutout, maxSize), 1);
    const chartWeight = this._getRingWeight(this.index);
    const { circumference, rotation } = this._getRotationExtents();
    const { ratioX, ratioY, offsetX, offsetY } = getRatioAndOffset(rotation, circumference, cutout);
    const maxWidth = (chartArea.width - spacing) / ratioX;
    const maxHeight = (chartArea.height - spacing) / ratioY;
    const maxRadius = Math.max(Math.min(maxWidth, maxHeight) / 2, 0);
    const outerRadius = toDimension(this.options.radius, maxRadius);
    const innerRadius = Math.max(outerRadius * cutout, 0);
    const radiusLength = (outerRadius - innerRadius) / this._getVisibleDatasetWeightTotal();
    this.offsetX = offsetX * outerRadius;
    this.offsetY = offsetY * outerRadius;
    meta.total = this.calculateTotal();
    this.outerRadius = outerRadius - radiusLength * this._getRingWeightOffset(this.index);
    this.innerRadius = Math.max(this.outerRadius - radiusLength * chartWeight, 0);
    this.updateElements(arcs, 0, arcs.length, mode);
  }
  _circumference(i, reset) {
    const opts = this.options;
    const meta = this._cachedMeta;
    const circumference = this._getCircumference();
    if (reset && opts.animation.animateRotate || !this.chart.getDataVisibility(i) || meta._parsed[i] === null || meta.data[i].hidden) {
      return 0;
    }
    return this.calculateCircumference(meta._parsed[i] * circumference / TAU);
  }
  updateElements(arcs, start, count, mode) {
    const reset = mode === "reset";
    const chart = this.chart;
    const chartArea = chart.chartArea;
    const opts = chart.options;
    const animationOpts = opts.animation;
    const centerX = (chartArea.left + chartArea.right) / 2;
    const centerY = (chartArea.top + chartArea.bottom) / 2;
    const animateScale = reset && animationOpts.animateScale;
    const innerRadius = animateScale ? 0 : this.innerRadius;
    const outerRadius = animateScale ? 0 : this.outerRadius;
    const { sharedOptions, includeOptions } = this._getSharedOptions(start, mode);
    let startAngle = this._getRotation();
    let i;
    for (i = 0; i < start; ++i) {
      startAngle += this._circumference(i, reset);
    }
    for (i = start; i < start + count; ++i) {
      const circumference = this._circumference(i, reset);
      const arc = arcs[i];
      const properties = {
        x: centerX + this.offsetX,
        y: centerY + this.offsetY,
        startAngle,
        endAngle: startAngle + circumference,
        circumference,
        outerRadius,
        innerRadius
      };
      if (includeOptions) {
        properties.options = sharedOptions || this.resolveDataElementOptions(i, arc.active ? "active" : mode);
      }
      startAngle += circumference;
      this.updateElement(arc, i, properties, mode);
    }
  }
  calculateTotal() {
    const meta = this._cachedMeta;
    const metaData = meta.data;
    let total = 0;
    let i;
    for (i = 0; i < metaData.length; i++) {
      const value = meta._parsed[i];
      if (value !== null && !isNaN(value) && this.chart.getDataVisibility(i) && !metaData[i].hidden) {
        total += Math.abs(value);
      }
    }
    return total;
  }
  calculateCircumference(value) {
    const total = this._cachedMeta.total;
    if (total > 0 && !isNaN(value)) {
      return TAU * (Math.abs(value) / total);
    }
    return 0;
  }
  getLabelAndValue(index2) {
    const meta = this._cachedMeta;
    const chart = this.chart;
    const labels = chart.data.labels || [];
    const value = formatNumber(meta._parsed[index2], chart.options.locale);
    return {
      label: labels[index2] || "",
      value
    };
  }
  getMaxBorderWidth(arcs) {
    let max = 0;
    const chart = this.chart;
    let i, ilen, meta, controller, options;
    if (!arcs) {
      for (i = 0, ilen = chart.data.datasets.length; i < ilen; ++i) {
        if (chart.isDatasetVisible(i)) {
          meta = chart.getDatasetMeta(i);
          arcs = meta.data;
          controller = meta.controller;
          break;
        }
      }
    }
    if (!arcs) {
      return 0;
    }
    for (i = 0, ilen = arcs.length; i < ilen; ++i) {
      options = controller.resolveDataElementOptions(i);
      if (options.borderAlign !== "inner") {
        max = Math.max(max, options.borderWidth || 0, options.hoverBorderWidth || 0);
      }
    }
    return max;
  }
  getMaxOffset(arcs) {
    let max = 0;
    for (let i = 0, ilen = arcs.length; i < ilen; ++i) {
      const options = this.resolveDataElementOptions(i);
      max = Math.max(max, options.offset || 0, options.hoverOffset || 0);
    }
    return max;
  }
  _getRingWeightOffset(datasetIndex) {
    let ringWeightOffset = 0;
    for (let i = 0; i < datasetIndex; ++i) {
      if (this.chart.isDatasetVisible(i)) {
        ringWeightOffset += this._getRingWeight(i);
      }
    }
    return ringWeightOffset;
  }
  _getRingWeight(datasetIndex) {
    return Math.max(valueOrDefault(this.chart.data.datasets[datasetIndex].weight, 1), 0);
  }
  _getVisibleDatasetWeightTotal() {
    return this._getRingWeightOffset(this.chart.data.datasets.length) || 1;
  }
}
__name(DoughnutController, "DoughnutController");
DoughnutController.id = "doughnut";
DoughnutController.defaults = {
  datasetElementType: false,
  dataElementType: "arc",
  animation: {
    animateRotate: true,
    animateScale: false
  },
  animations: {
    numbers: {
      type: "number",
      properties: ["circumference", "endAngle", "innerRadius", "outerRadius", "startAngle", "x", "y", "offset", "borderWidth", "spacing"]
    }
  },
  cutout: "50%",
  rotation: 0,
  circumference: 360,
  radius: "100%",
  spacing: 0,
  indexAxis: "r"
};
DoughnutController.descriptors = {
  _scriptable: (name) => name !== "spacing",
  _indexable: (name) => name !== "spacing"
};
DoughnutController.overrides = {
  aspectRatio: 1,
  plugins: {
    legend: {
      labels: {
        generateLabels(chart) {
          const data = chart.data;
          if (data.labels.length && data.datasets.length) {
            const { labels: { pointStyle } } = chart.legend.options;
            return data.labels.map((label, i) => {
              const meta = chart.getDatasetMeta(0);
              const style = meta.controller.getStyle(i);
              return {
                text: label,
                fillStyle: style.backgroundColor,
                strokeStyle: style.borderColor,
                lineWidth: style.borderWidth,
                pointStyle,
                hidden: !chart.getDataVisibility(i),
                index: i
              };
            });
          }
          return [];
        }
      },
      onClick(e, legendItem, legend) {
        legend.chart.toggleDataVisibility(legendItem.index);
        legend.chart.update();
      }
    },
    tooltip: {
      callbacks: {
        title() {
          return "";
        },
        label(tooltipItem) {
          let dataLabel = tooltipItem.label;
          const value = ": " + tooltipItem.formattedValue;
          if (isArray(dataLabel)) {
            dataLabel = dataLabel.slice();
            dataLabel[0] += value;
          } else {
            dataLabel += value;
          }
          return dataLabel;
        }
      }
    }
  }
};
class LineController extends DatasetController {
  initialize() {
    this.enableOptionSharing = true;
    this.supportsDecimation = true;
    super.initialize();
  }
  update(mode) {
    const meta = this._cachedMeta;
    const { dataset: line, data: points = [], _dataset } = meta;
    const animationsDisabled = this.chart._animationsDisabled;
    let { start, count } = _getStartAndCountOfVisiblePoints(meta, points, animationsDisabled);
    this._drawStart = start;
    this._drawCount = count;
    if (_scaleRangesChanged(meta)) {
      start = 0;
      count = points.length;
    }
    line._chart = this.chart;
    line._datasetIndex = this.index;
    line._decimated = !!_dataset._decimated;
    line.points = points;
    const options = this.resolveDatasetElementOptions(mode);
    if (!this.options.showLine) {
      options.borderWidth = 0;
    }
    options.segment = this.options.segment;
    this.updateElement(line, void 0, {
      animated: !animationsDisabled,
      options
    }, mode);
    this.updateElements(points, start, count, mode);
  }
  updateElements(points, start, count, mode) {
    const reset = mode === "reset";
    const { iScale, vScale, _stacked, _dataset } = this._cachedMeta;
    const { sharedOptions, includeOptions } = this._getSharedOptions(start, mode);
    const iAxis = iScale.axis;
    const vAxis = vScale.axis;
    const { spanGaps, segment } = this.options;
    const maxGapLength = isNumber(spanGaps) ? spanGaps : Number.POSITIVE_INFINITY;
    const directUpdate = this.chart._animationsDisabled || reset || mode === "none";
    let prevParsed = start > 0 && this.getParsed(start - 1);
    for (let i = start; i < start + count; ++i) {
      const point = points[i];
      const parsed = this.getParsed(i);
      const properties = directUpdate ? point : {};
      const nullData = isNullOrUndef(parsed[vAxis]);
      const iPixel = properties[iAxis] = iScale.getPixelForValue(parsed[iAxis], i);
      const vPixel = properties[vAxis] = reset || nullData ? vScale.getBasePixel() : vScale.getPixelForValue(_stacked ? this.applyStack(vScale, parsed, _stacked) : parsed[vAxis], i);
      properties.skip = isNaN(iPixel) || isNaN(vPixel) || nullData;
      properties.stop = i > 0 && Math.abs(parsed[iAxis] - prevParsed[iAxis]) > maxGapLength;
      if (segment) {
        properties.parsed = parsed;
        properties.raw = _dataset.data[i];
      }
      if (includeOptions) {
        properties.options = sharedOptions || this.resolveDataElementOptions(i, point.active ? "active" : mode);
      }
      if (!directUpdate) {
        this.updateElement(point, i, properties, mode);
      }
      prevParsed = parsed;
    }
  }
  getMaxOverflow() {
    const meta = this._cachedMeta;
    const dataset = meta.dataset;
    const border = dataset.options && dataset.options.borderWidth || 0;
    const data = meta.data || [];
    if (!data.length) {
      return border;
    }
    const firstPoint = data[0].size(this.resolveDataElementOptions(0));
    const lastPoint = data[data.length - 1].size(this.resolveDataElementOptions(data.length - 1));
    return Math.max(border, firstPoint, lastPoint) / 2;
  }
  draw() {
    const meta = this._cachedMeta;
    meta.dataset.updateControlPoints(this.chart.chartArea, meta.iScale.axis);
    super.draw();
  }
}
__name(LineController, "LineController");
LineController.id = "line";
LineController.defaults = {
  datasetElementType: "line",
  dataElementType: "point",
  showLine: true,
  spanGaps: false
};
LineController.overrides = {
  scales: {
    _index_: {
      type: "category"
    },
    _value_: {
      type: "linear"
    }
  }
};
class PolarAreaController extends DatasetController {
  constructor(chart, datasetIndex) {
    super(chart, datasetIndex);
    this.innerRadius = void 0;
    this.outerRadius = void 0;
  }
  getLabelAndValue(index2) {
    const meta = this._cachedMeta;
    const chart = this.chart;
    const labels = chart.data.labels || [];
    const value = formatNumber(meta._parsed[index2].r, chart.options.locale);
    return {
      label: labels[index2] || "",
      value
    };
  }
  parseObjectData(meta, data, start, count) {
    return _parseObjectDataRadialScale.bind(this)(meta, data, start, count);
  }
  update(mode) {
    const arcs = this._cachedMeta.data;
    this._updateRadius();
    this.updateElements(arcs, 0, arcs.length, mode);
  }
  getMinMax() {
    const meta = this._cachedMeta;
    const range = { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY };
    meta.data.forEach((element2, index2) => {
      const parsed = this.getParsed(index2).r;
      if (!isNaN(parsed) && this.chart.getDataVisibility(index2)) {
        if (parsed < range.min) {
          range.min = parsed;
        }
        if (parsed > range.max) {
          range.max = parsed;
        }
      }
    });
    return range;
  }
  _updateRadius() {
    const chart = this.chart;
    const chartArea = chart.chartArea;
    const opts = chart.options;
    const minSize = Math.min(chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
    const outerRadius = Math.max(minSize / 2, 0);
    const innerRadius = Math.max(opts.cutoutPercentage ? outerRadius / 100 * opts.cutoutPercentage : 1, 0);
    const radiusLength = (outerRadius - innerRadius) / chart.getVisibleDatasetCount();
    this.outerRadius = outerRadius - radiusLength * this.index;
    this.innerRadius = this.outerRadius - radiusLength;
  }
  updateElements(arcs, start, count, mode) {
    const reset = mode === "reset";
    const chart = this.chart;
    const opts = chart.options;
    const animationOpts = opts.animation;
    const scale = this._cachedMeta.rScale;
    const centerX = scale.xCenter;
    const centerY = scale.yCenter;
    const datasetStartAngle = scale.getIndexAngle(0) - 0.5 * PI;
    let angle = datasetStartAngle;
    let i;
    const defaultAngle = 360 / this.countVisibleElements();
    for (i = 0; i < start; ++i) {
      angle += this._computeAngle(i, mode, defaultAngle);
    }
    for (i = start; i < start + count; i++) {
      const arc = arcs[i];
      let startAngle = angle;
      let endAngle = angle + this._computeAngle(i, mode, defaultAngle);
      let outerRadius = chart.getDataVisibility(i) ? scale.getDistanceFromCenterForValue(this.getParsed(i).r) : 0;
      angle = endAngle;
      if (reset) {
        if (animationOpts.animateScale) {
          outerRadius = 0;
        }
        if (animationOpts.animateRotate) {
          startAngle = endAngle = datasetStartAngle;
        }
      }
      const properties = {
        x: centerX,
        y: centerY,
        innerRadius: 0,
        outerRadius,
        startAngle,
        endAngle,
        options: this.resolveDataElementOptions(i, arc.active ? "active" : mode)
      };
      this.updateElement(arc, i, properties, mode);
    }
  }
  countVisibleElements() {
    const meta = this._cachedMeta;
    let count = 0;
    meta.data.forEach((element2, index2) => {
      if (!isNaN(this.getParsed(index2).r) && this.chart.getDataVisibility(index2)) {
        count++;
      }
    });
    return count;
  }
  _computeAngle(index2, mode, defaultAngle) {
    return this.chart.getDataVisibility(index2) ? toRadians(this.resolveDataElementOptions(index2, mode).angle || defaultAngle) : 0;
  }
}
__name(PolarAreaController, "PolarAreaController");
PolarAreaController.id = "polarArea";
PolarAreaController.defaults = {
  dataElementType: "arc",
  animation: {
    animateRotate: true,
    animateScale: true
  },
  animations: {
    numbers: {
      type: "number",
      properties: ["x", "y", "startAngle", "endAngle", "innerRadius", "outerRadius"]
    }
  },
  indexAxis: "r",
  startAngle: 0
};
PolarAreaController.overrides = {
  aspectRatio: 1,
  plugins: {
    legend: {
      labels: {
        generateLabels(chart) {
          const data = chart.data;
          if (data.labels.length && data.datasets.length) {
            const { labels: { pointStyle } } = chart.legend.options;
            return data.labels.map((label, i) => {
              const meta = chart.getDatasetMeta(0);
              const style = meta.controller.getStyle(i);
              return {
                text: label,
                fillStyle: style.backgroundColor,
                strokeStyle: style.borderColor,
                lineWidth: style.borderWidth,
                pointStyle,
                hidden: !chart.getDataVisibility(i),
                index: i
              };
            });
          }
          return [];
        }
      },
      onClick(e, legendItem, legend) {
        legend.chart.toggleDataVisibility(legendItem.index);
        legend.chart.update();
      }
    },
    tooltip: {
      callbacks: {
        title() {
          return "";
        },
        label(context) {
          return context.chart.data.labels[context.dataIndex] + ": " + context.formattedValue;
        }
      }
    }
  },
  scales: {
    r: {
      type: "radialLinear",
      angleLines: {
        display: false
      },
      beginAtZero: true,
      grid: {
        circular: true
      },
      pointLabels: {
        display: false
      },
      startAngle: 0
    }
  }
};
class PieController extends DoughnutController {
}
__name(PieController, "PieController");
PieController.id = "pie";
PieController.defaults = {
  cutout: 0,
  rotation: 0,
  circumference: 360,
  radius: "100%"
};
class RadarController extends DatasetController {
  getLabelAndValue(index2) {
    const vScale = this._cachedMeta.vScale;
    const parsed = this.getParsed(index2);
    return {
      label: vScale.getLabels()[index2],
      value: "" + vScale.getLabelForValue(parsed[vScale.axis])
    };
  }
  parseObjectData(meta, data, start, count) {
    return _parseObjectDataRadialScale.bind(this)(meta, data, start, count);
  }
  update(mode) {
    const meta = this._cachedMeta;
    const line = meta.dataset;
    const points = meta.data || [];
    const labels = meta.iScale.getLabels();
    line.points = points;
    if (mode !== "resize") {
      const options = this.resolveDatasetElementOptions(mode);
      if (!this.options.showLine) {
        options.borderWidth = 0;
      }
      const properties = {
        _loop: true,
        _fullLoop: labels.length === points.length,
        options
      };
      this.updateElement(line, void 0, properties, mode);
    }
    this.updateElements(points, 0, points.length, mode);
  }
  updateElements(points, start, count, mode) {
    const scale = this._cachedMeta.rScale;
    const reset = mode === "reset";
    for (let i = start; i < start + count; i++) {
      const point = points[i];
      const options = this.resolveDataElementOptions(i, point.active ? "active" : mode);
      const pointPosition = scale.getPointPositionForValue(i, this.getParsed(i).r);
      const x = reset ? scale.xCenter : pointPosition.x;
      const y = reset ? scale.yCenter : pointPosition.y;
      const properties = {
        x,
        y,
        angle: pointPosition.angle,
        skip: isNaN(x) || isNaN(y),
        options
      };
      this.updateElement(point, i, properties, mode);
    }
  }
}
__name(RadarController, "RadarController");
RadarController.id = "radar";
RadarController.defaults = {
  datasetElementType: "line",
  dataElementType: "point",
  indexAxis: "r",
  showLine: true,
  elements: {
    line: {
      fill: "start"
    }
  }
};
RadarController.overrides = {
  aspectRatio: 1,
  scales: {
    r: {
      type: "radialLinear"
    }
  }
};
class Element {
  constructor() {
    this.x = void 0;
    this.y = void 0;
    this.active = false;
    this.options = void 0;
    this.$animations = void 0;
  }
  tooltipPosition(useFinalPosition) {
    const { x, y } = this.getProps(["x", "y"], useFinalPosition);
    return { x, y };
  }
  hasValue() {
    return isNumber(this.x) && isNumber(this.y);
  }
  getProps(props, final) {
    const anims = this.$animations;
    if (!final || !anims) {
      return this;
    }
    const ret = {};
    props.forEach((prop) => {
      ret[prop] = anims[prop] && anims[prop].active() ? anims[prop]._to : this[prop];
    });
    return ret;
  }
}
__name(Element, "Element");
Element.defaults = {};
Element.defaultRoutes = void 0;
const formatters = {
  values(value) {
    return isArray(value) ? value : "" + value;
  },
  numeric(tickValue, index2, ticks) {
    if (tickValue === 0) {
      return "0";
    }
    const locale = this.chart.options.locale;
    let notation;
    let delta = tickValue;
    if (ticks.length > 1) {
      const maxTick = Math.max(Math.abs(ticks[0].value), Math.abs(ticks[ticks.length - 1].value));
      if (maxTick < 1e-4 || maxTick > 1e15) {
        notation = "scientific";
      }
      delta = calculateDelta(tickValue, ticks);
    }
    const logDelta = log10(Math.abs(delta));
    const numDecimal = Math.max(Math.min(-1 * Math.floor(logDelta), 20), 0);
    const options = { notation, minimumFractionDigits: numDecimal, maximumFractionDigits: numDecimal };
    Object.assign(options, this.options.ticks.format);
    return formatNumber(tickValue, locale, options);
  },
  logarithmic(tickValue, index2, ticks) {
    if (tickValue === 0) {
      return "0";
    }
    const remain = tickValue / Math.pow(10, Math.floor(log10(tickValue)));
    if (remain === 1 || remain === 2 || remain === 5) {
      return formatters.numeric.call(this, tickValue, index2, ticks);
    }
    return "";
  }
};
function calculateDelta(tickValue, ticks) {
  let delta = ticks.length > 3 ? ticks[2].value - ticks[1].value : ticks[1].value - ticks[0].value;
  if (Math.abs(delta) >= 1 && tickValue !== Math.floor(tickValue)) {
    delta = tickValue - Math.floor(tickValue);
  }
  return delta;
}
__name(calculateDelta, "calculateDelta");
var Ticks = { formatters };
defaults.set("scale", {
  display: true,
  offset: false,
  reverse: false,
  beginAtZero: false,
  bounds: "ticks",
  grace: 0,
  grid: {
    display: true,
    lineWidth: 1,
    drawBorder: true,
    drawOnChartArea: true,
    drawTicks: true,
    tickLength: 8,
    tickWidth: (_ctx, options) => options.lineWidth,
    tickColor: (_ctx, options) => options.color,
    offset: false,
    borderDash: [],
    borderDashOffset: 0,
    borderWidth: 1
  },
  title: {
    display: false,
    text: "",
    padding: {
      top: 4,
      bottom: 4
    }
  },
  ticks: {
    minRotation: 0,
    maxRotation: 50,
    mirror: false,
    textStrokeWidth: 0,
    textStrokeColor: "",
    padding: 3,
    display: true,
    autoSkip: true,
    autoSkipPadding: 3,
    labelOffset: 0,
    callback: Ticks.formatters.values,
    minor: {},
    major: {},
    align: "center",
    crossAlign: "near",
    showLabelBackdrop: false,
    backdropColor: "rgba(255, 255, 255, 0.75)",
    backdropPadding: 2
  }
});
defaults.route("scale.ticks", "color", "", "color");
defaults.route("scale.grid", "color", "", "borderColor");
defaults.route("scale.grid", "borderColor", "", "borderColor");
defaults.route("scale.title", "color", "", "color");
defaults.describe("scale", {
  _fallback: false,
  _scriptable: (name) => !name.startsWith("before") && !name.startsWith("after") && name !== "callback" && name !== "parser",
  _indexable: (name) => name !== "borderDash" && name !== "tickBorderDash"
});
defaults.describe("scales", {
  _fallback: "scale"
});
defaults.describe("scale.ticks", {
  _scriptable: (name) => name !== "backdropPadding" && name !== "callback",
  _indexable: (name) => name !== "backdropPadding"
});
function autoSkip(scale, ticks) {
  const tickOpts = scale.options.ticks;
  const ticksLimit = tickOpts.maxTicksLimit || determineMaxTicks(scale);
  const majorIndices = tickOpts.major.enabled ? getMajorIndices(ticks) : [];
  const numMajorIndices = majorIndices.length;
  const first = majorIndices[0];
  const last = majorIndices[numMajorIndices - 1];
  const newTicks = [];
  if (numMajorIndices > ticksLimit) {
    skipMajors(ticks, newTicks, majorIndices, numMajorIndices / ticksLimit);
    return newTicks;
  }
  const spacing = calculateSpacing(majorIndices, ticks, ticksLimit);
  if (numMajorIndices > 0) {
    let i, ilen;
    const avgMajorSpacing = numMajorIndices > 1 ? Math.round((last - first) / (numMajorIndices - 1)) : null;
    skip(ticks, newTicks, spacing, isNullOrUndef(avgMajorSpacing) ? 0 : first - avgMajorSpacing, first);
    for (i = 0, ilen = numMajorIndices - 1; i < ilen; i++) {
      skip(ticks, newTicks, spacing, majorIndices[i], majorIndices[i + 1]);
    }
    skip(ticks, newTicks, spacing, last, isNullOrUndef(avgMajorSpacing) ? ticks.length : last + avgMajorSpacing);
    return newTicks;
  }
  skip(ticks, newTicks, spacing);
  return newTicks;
}
__name(autoSkip, "autoSkip");
function determineMaxTicks(scale) {
  const offset = scale.options.offset;
  const tickLength = scale._tickSize();
  const maxScale = scale._length / tickLength + (offset ? 0 : 1);
  const maxChart = scale._maxLength / tickLength;
  return Math.floor(Math.min(maxScale, maxChart));
}
__name(determineMaxTicks, "determineMaxTicks");
function calculateSpacing(majorIndices, ticks, ticksLimit) {
  const evenMajorSpacing = getEvenSpacing(majorIndices);
  const spacing = ticks.length / ticksLimit;
  if (!evenMajorSpacing) {
    return Math.max(spacing, 1);
  }
  const factors = _factorize(evenMajorSpacing);
  for (let i = 0, ilen = factors.length - 1; i < ilen; i++) {
    const factor = factors[i];
    if (factor > spacing) {
      return factor;
    }
  }
  return Math.max(spacing, 1);
}
__name(calculateSpacing, "calculateSpacing");
function getMajorIndices(ticks) {
  const result = [];
  let i, ilen;
  for (i = 0, ilen = ticks.length; i < ilen; i++) {
    if (ticks[i].major) {
      result.push(i);
    }
  }
  return result;
}
__name(getMajorIndices, "getMajorIndices");
function skipMajors(ticks, newTicks, majorIndices, spacing) {
  let count = 0;
  let next = majorIndices[0];
  let i;
  spacing = Math.ceil(spacing);
  for (i = 0; i < ticks.length; i++) {
    if (i === next) {
      newTicks.push(ticks[i]);
      count++;
      next = majorIndices[count * spacing];
    }
  }
}
__name(skipMajors, "skipMajors");
function skip(ticks, newTicks, spacing, majorStart, majorEnd) {
  const start = valueOrDefault(majorStart, 0);
  const end = Math.min(valueOrDefault(majorEnd, ticks.length), ticks.length);
  let count = 0;
  let length, i, next;
  spacing = Math.ceil(spacing);
  if (majorEnd) {
    length = majorEnd - majorStart;
    spacing = length / Math.floor(length / spacing);
  }
  next = start;
  while (next < 0) {
    count++;
    next = Math.round(start + count * spacing);
  }
  for (i = Math.max(start, 0); i < end; i++) {
    if (i === next) {
      newTicks.push(ticks[i]);
      count++;
      next = Math.round(start + count * spacing);
    }
  }
}
__name(skip, "skip");
function getEvenSpacing(arr) {
  const len = arr.length;
  let i, diff;
  if (len < 2) {
    return false;
  }
  for (diff = arr[0], i = 1; i < len; ++i) {
    if (arr[i] - arr[i - 1] !== diff) {
      return false;
    }
  }
  return diff;
}
__name(getEvenSpacing, "getEvenSpacing");
const reverseAlign = /* @__PURE__ */ __name((align) => align === "left" ? "right" : align === "right" ? "left" : align, "reverseAlign");
const offsetFromEdge = /* @__PURE__ */ __name((scale, edge, offset) => edge === "top" || edge === "left" ? scale[edge] + offset : scale[edge] - offset, "offsetFromEdge");
function sample(arr, numItems) {
  const result = [];
  const increment = arr.length / numItems;
  const len = arr.length;
  let i = 0;
  for (; i < len; i += increment) {
    result.push(arr[Math.floor(i)]);
  }
  return result;
}
__name(sample, "sample");
function getPixelForGridLine(scale, index2, offsetGridLines) {
  const length = scale.ticks.length;
  const validIndex2 = Math.min(index2, length - 1);
  const start = scale._startPixel;
  const end = scale._endPixel;
  const epsilon = 1e-6;
  let lineValue = scale.getPixelForTick(validIndex2);
  let offset;
  if (offsetGridLines) {
    if (length === 1) {
      offset = Math.max(lineValue - start, end - lineValue);
    } else if (index2 === 0) {
      offset = (scale.getPixelForTick(1) - lineValue) / 2;
    } else {
      offset = (lineValue - scale.getPixelForTick(validIndex2 - 1)) / 2;
    }
    lineValue += validIndex2 < index2 ? offset : -offset;
    if (lineValue < start - epsilon || lineValue > end + epsilon) {
      return;
    }
  }
  return lineValue;
}
__name(getPixelForGridLine, "getPixelForGridLine");
function garbageCollect(caches, length) {
  each(caches, (cache) => {
    const gc = cache.gc;
    const gcLen = gc.length / 2;
    let i;
    if (gcLen > length) {
      for (i = 0; i < gcLen; ++i) {
        delete cache.data[gc[i]];
      }
      gc.splice(0, gcLen);
    }
  });
}
__name(garbageCollect, "garbageCollect");
function getTickMarkLength(options) {
  return options.drawTicks ? options.tickLength : 0;
}
__name(getTickMarkLength, "getTickMarkLength");
function getTitleHeight(options, fallback) {
  if (!options.display) {
    return 0;
  }
  const font = toFont(options.font, fallback);
  const padding = toPadding(options.padding);
  const lines = isArray(options.text) ? options.text.length : 1;
  return lines * font.lineHeight + padding.height;
}
__name(getTitleHeight, "getTitleHeight");
function createScaleContext(parent, scale) {
  return createContext(parent, {
    scale,
    type: "scale"
  });
}
__name(createScaleContext, "createScaleContext");
function createTickContext(parent, index2, tick) {
  return createContext(parent, {
    tick,
    index: index2,
    type: "tick"
  });
}
__name(createTickContext, "createTickContext");
function titleAlign(align, position, reverse) {
  let ret = _toLeftRightCenter(align);
  if (reverse && position !== "right" || !reverse && position === "right") {
    ret = reverseAlign(ret);
  }
  return ret;
}
__name(titleAlign, "titleAlign");
function titleArgs(scale, offset, position, align) {
  const { top, left, bottom, right, chart } = scale;
  const { chartArea, scales: scales2 } = chart;
  let rotation = 0;
  let maxWidth, titleX, titleY;
  const height = bottom - top;
  const width = right - left;
  if (scale.isHorizontal()) {
    titleX = _alignStartEnd(align, left, right);
    if (isObject(position)) {
      const positionAxisID = Object.keys(position)[0];
      const value = position[positionAxisID];
      titleY = scales2[positionAxisID].getPixelForValue(value) + height - offset;
    } else if (position === "center") {
      titleY = (chartArea.bottom + chartArea.top) / 2 + height - offset;
    } else {
      titleY = offsetFromEdge(scale, position, offset);
    }
    maxWidth = right - left;
  } else {
    if (isObject(position)) {
      const positionAxisID = Object.keys(position)[0];
      const value = position[positionAxisID];
      titleX = scales2[positionAxisID].getPixelForValue(value) - width + offset;
    } else if (position === "center") {
      titleX = (chartArea.left + chartArea.right) / 2 - width + offset;
    } else {
      titleX = offsetFromEdge(scale, position, offset);
    }
    titleY = _alignStartEnd(align, bottom, top);
    rotation = position === "left" ? -HALF_PI : HALF_PI;
  }
  return { titleX, titleY, maxWidth, rotation };
}
__name(titleArgs, "titleArgs");
class Scale extends Element {
  constructor(cfg) {
    super();
    this.id = cfg.id;
    this.type = cfg.type;
    this.options = void 0;
    this.ctx = cfg.ctx;
    this.chart = cfg.chart;
    this.top = void 0;
    this.bottom = void 0;
    this.left = void 0;
    this.right = void 0;
    this.width = void 0;
    this.height = void 0;
    this._margins = {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    };
    this.maxWidth = void 0;
    this.maxHeight = void 0;
    this.paddingTop = void 0;
    this.paddingBottom = void 0;
    this.paddingLeft = void 0;
    this.paddingRight = void 0;
    this.axis = void 0;
    this.labelRotation = void 0;
    this.min = void 0;
    this.max = void 0;
    this._range = void 0;
    this.ticks = [];
    this._gridLineItems = null;
    this._labelItems = null;
    this._labelSizes = null;
    this._length = 0;
    this._maxLength = 0;
    this._longestTextCache = {};
    this._startPixel = void 0;
    this._endPixel = void 0;
    this._reversePixels = false;
    this._userMax = void 0;
    this._userMin = void 0;
    this._suggestedMax = void 0;
    this._suggestedMin = void 0;
    this._ticksLength = 0;
    this._borderValue = 0;
    this._cache = {};
    this._dataLimitsCached = false;
    this.$context = void 0;
  }
  init(options) {
    this.options = options.setContext(this.getContext());
    this.axis = options.axis;
    this._userMin = this.parse(options.min);
    this._userMax = this.parse(options.max);
    this._suggestedMin = this.parse(options.suggestedMin);
    this._suggestedMax = this.parse(options.suggestedMax);
  }
  parse(raw, index2) {
    return raw;
  }
  getUserBounds() {
    let { _userMin, _userMax, _suggestedMin, _suggestedMax } = this;
    _userMin = finiteOrDefault(_userMin, Number.POSITIVE_INFINITY);
    _userMax = finiteOrDefault(_userMax, Number.NEGATIVE_INFINITY);
    _suggestedMin = finiteOrDefault(_suggestedMin, Number.POSITIVE_INFINITY);
    _suggestedMax = finiteOrDefault(_suggestedMax, Number.NEGATIVE_INFINITY);
    return {
      min: finiteOrDefault(_userMin, _suggestedMin),
      max: finiteOrDefault(_userMax, _suggestedMax),
      minDefined: isNumberFinite(_userMin),
      maxDefined: isNumberFinite(_userMax)
    };
  }
  getMinMax(canStack) {
    let { min, max, minDefined, maxDefined } = this.getUserBounds();
    let range;
    if (minDefined && maxDefined) {
      return { min, max };
    }
    const metas = this.getMatchingVisibleMetas();
    for (let i = 0, ilen = metas.length; i < ilen; ++i) {
      range = metas[i].controller.getMinMax(this, canStack);
      if (!minDefined) {
        min = Math.min(min, range.min);
      }
      if (!maxDefined) {
        max = Math.max(max, range.max);
      }
    }
    min = maxDefined && min > max ? max : min;
    max = minDefined && min > max ? min : max;
    return {
      min: finiteOrDefault(min, finiteOrDefault(max, min)),
      max: finiteOrDefault(max, finiteOrDefault(min, max))
    };
  }
  getPadding() {
    return {
      left: this.paddingLeft || 0,
      top: this.paddingTop || 0,
      right: this.paddingRight || 0,
      bottom: this.paddingBottom || 0
    };
  }
  getTicks() {
    return this.ticks;
  }
  getLabels() {
    const data = this.chart.data;
    return this.options.labels || (this.isHorizontal() ? data.xLabels : data.yLabels) || data.labels || [];
  }
  beforeLayout() {
    this._cache = {};
    this._dataLimitsCached = false;
  }
  beforeUpdate() {
    callback(this.options.beforeUpdate, [this]);
  }
  update(maxWidth, maxHeight, margins) {
    const { beginAtZero, grace, ticks: tickOpts } = this.options;
    const sampleSize = tickOpts.sampleSize;
    this.beforeUpdate();
    this.maxWidth = maxWidth;
    this.maxHeight = maxHeight;
    this._margins = margins = Object.assign({
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    }, margins);
    this.ticks = null;
    this._labelSizes = null;
    this._gridLineItems = null;
    this._labelItems = null;
    this.beforeSetDimensions();
    this.setDimensions();
    this.afterSetDimensions();
    this._maxLength = this.isHorizontal() ? this.width + margins.left + margins.right : this.height + margins.top + margins.bottom;
    if (!this._dataLimitsCached) {
      this.beforeDataLimits();
      this.determineDataLimits();
      this.afterDataLimits();
      this._range = _addGrace(this, grace, beginAtZero);
      this._dataLimitsCached = true;
    }
    this.beforeBuildTicks();
    this.ticks = this.buildTicks() || [];
    this.afterBuildTicks();
    const samplingEnabled = sampleSize < this.ticks.length;
    this._convertTicksToLabels(samplingEnabled ? sample(this.ticks, sampleSize) : this.ticks);
    this.configure();
    this.beforeCalculateLabelRotation();
    this.calculateLabelRotation();
    this.afterCalculateLabelRotation();
    if (tickOpts.display && (tickOpts.autoSkip || tickOpts.source === "auto")) {
      this.ticks = autoSkip(this, this.ticks);
      this._labelSizes = null;
      this.afterAutoSkip();
    }
    if (samplingEnabled) {
      this._convertTicksToLabels(this.ticks);
    }
    this.beforeFit();
    this.fit();
    this.afterFit();
    this.afterUpdate();
  }
  configure() {
    let reversePixels = this.options.reverse;
    let startPixel, endPixel;
    if (this.isHorizontal()) {
      startPixel = this.left;
      endPixel = this.right;
    } else {
      startPixel = this.top;
      endPixel = this.bottom;
      reversePixels = !reversePixels;
    }
    this._startPixel = startPixel;
    this._endPixel = endPixel;
    this._reversePixels = reversePixels;
    this._length = endPixel - startPixel;
    this._alignToPixels = this.options.alignToPixels;
  }
  afterUpdate() {
    callback(this.options.afterUpdate, [this]);
  }
  beforeSetDimensions() {
    callback(this.options.beforeSetDimensions, [this]);
  }
  setDimensions() {
    if (this.isHorizontal()) {
      this.width = this.maxWidth;
      this.left = 0;
      this.right = this.width;
    } else {
      this.height = this.maxHeight;
      this.top = 0;
      this.bottom = this.height;
    }
    this.paddingLeft = 0;
    this.paddingTop = 0;
    this.paddingRight = 0;
    this.paddingBottom = 0;
  }
  afterSetDimensions() {
    callback(this.options.afterSetDimensions, [this]);
  }
  _callHooks(name) {
    this.chart.notifyPlugins(name, this.getContext());
    callback(this.options[name], [this]);
  }
  beforeDataLimits() {
    this._callHooks("beforeDataLimits");
  }
  determineDataLimits() {
  }
  afterDataLimits() {
    this._callHooks("afterDataLimits");
  }
  beforeBuildTicks() {
    this._callHooks("beforeBuildTicks");
  }
  buildTicks() {
    return [];
  }
  afterBuildTicks() {
    this._callHooks("afterBuildTicks");
  }
  beforeTickToLabelConversion() {
    callback(this.options.beforeTickToLabelConversion, [this]);
  }
  generateTickLabels(ticks) {
    const tickOpts = this.options.ticks;
    let i, ilen, tick;
    for (i = 0, ilen = ticks.length; i < ilen; i++) {
      tick = ticks[i];
      tick.label = callback(tickOpts.callback, [tick.value, i, ticks], this);
    }
  }
  afterTickToLabelConversion() {
    callback(this.options.afterTickToLabelConversion, [this]);
  }
  beforeCalculateLabelRotation() {
    callback(this.options.beforeCalculateLabelRotation, [this]);
  }
  calculateLabelRotation() {
    const options = this.options;
    const tickOpts = options.ticks;
    const numTicks = this.ticks.length;
    const minRotation = tickOpts.minRotation || 0;
    const maxRotation = tickOpts.maxRotation;
    let labelRotation = minRotation;
    let tickWidth, maxHeight, maxLabelDiagonal;
    if (!this._isVisible() || !tickOpts.display || minRotation >= maxRotation || numTicks <= 1 || !this.isHorizontal()) {
      this.labelRotation = minRotation;
      return;
    }
    const labelSizes = this._getLabelSizes();
    const maxLabelWidth = labelSizes.widest.width;
    const maxLabelHeight = labelSizes.highest.height;
    const maxWidth = _limitValue(this.chart.width - maxLabelWidth, 0, this.maxWidth);
    tickWidth = options.offset ? this.maxWidth / numTicks : maxWidth / (numTicks - 1);
    if (maxLabelWidth + 6 > tickWidth) {
      tickWidth = maxWidth / (numTicks - (options.offset ? 0.5 : 1));
      maxHeight = this.maxHeight - getTickMarkLength(options.grid) - tickOpts.padding - getTitleHeight(options.title, this.chart.options.font);
      maxLabelDiagonal = Math.sqrt(maxLabelWidth * maxLabelWidth + maxLabelHeight * maxLabelHeight);
      labelRotation = toDegrees(Math.min(
        Math.asin(_limitValue((labelSizes.highest.height + 6) / tickWidth, -1, 1)),
        Math.asin(_limitValue(maxHeight / maxLabelDiagonal, -1, 1)) - Math.asin(_limitValue(maxLabelHeight / maxLabelDiagonal, -1, 1))
      ));
      labelRotation = Math.max(minRotation, Math.min(maxRotation, labelRotation));
    }
    this.labelRotation = labelRotation;
  }
  afterCalculateLabelRotation() {
    callback(this.options.afterCalculateLabelRotation, [this]);
  }
  afterAutoSkip() {
  }
  beforeFit() {
    callback(this.options.beforeFit, [this]);
  }
  fit() {
    const minSize = {
      width: 0,
      height: 0
    };
    const { chart, options: { ticks: tickOpts, title: titleOpts, grid: gridOpts } } = this;
    const display = this._isVisible();
    const isHorizontal = this.isHorizontal();
    if (display) {
      const titleHeight = getTitleHeight(titleOpts, chart.options.font);
      if (isHorizontal) {
        minSize.width = this.maxWidth;
        minSize.height = getTickMarkLength(gridOpts) + titleHeight;
      } else {
        minSize.height = this.maxHeight;
        minSize.width = getTickMarkLength(gridOpts) + titleHeight;
      }
      if (tickOpts.display && this.ticks.length) {
        const { first, last, widest, highest } = this._getLabelSizes();
        const tickPadding = tickOpts.padding * 2;
        const angleRadians = toRadians(this.labelRotation);
        const cos = Math.cos(angleRadians);
        const sin = Math.sin(angleRadians);
        if (isHorizontal) {
          const labelHeight = tickOpts.mirror ? 0 : sin * widest.width + cos * highest.height;
          minSize.height = Math.min(this.maxHeight, minSize.height + labelHeight + tickPadding);
        } else {
          const labelWidth = tickOpts.mirror ? 0 : cos * widest.width + sin * highest.height;
          minSize.width = Math.min(this.maxWidth, minSize.width + labelWidth + tickPadding);
        }
        this._calculatePadding(first, last, sin, cos);
      }
    }
    this._handleMargins();
    if (isHorizontal) {
      this.width = this._length = chart.width - this._margins.left - this._margins.right;
      this.height = minSize.height;
    } else {
      this.width = minSize.width;
      this.height = this._length = chart.height - this._margins.top - this._margins.bottom;
    }
  }
  _calculatePadding(first, last, sin, cos) {
    const { ticks: { align, padding }, position } = this.options;
    const isRotated = this.labelRotation !== 0;
    const labelsBelowTicks = position !== "top" && this.axis === "x";
    if (this.isHorizontal()) {
      const offsetLeft = this.getPixelForTick(0) - this.left;
      const offsetRight = this.right - this.getPixelForTick(this.ticks.length - 1);
      let paddingLeft = 0;
      let paddingRight = 0;
      if (isRotated) {
        if (labelsBelowTicks) {
          paddingLeft = cos * first.width;
          paddingRight = sin * last.height;
        } else {
          paddingLeft = sin * first.height;
          paddingRight = cos * last.width;
        }
      } else if (align === "start") {
        paddingRight = last.width;
      } else if (align === "end") {
        paddingLeft = first.width;
      } else if (align !== "inner") {
        paddingLeft = first.width / 2;
        paddingRight = last.width / 2;
      }
      this.paddingLeft = Math.max((paddingLeft - offsetLeft + padding) * this.width / (this.width - offsetLeft), 0);
      this.paddingRight = Math.max((paddingRight - offsetRight + padding) * this.width / (this.width - offsetRight), 0);
    } else {
      let paddingTop = last.height / 2;
      let paddingBottom = first.height / 2;
      if (align === "start") {
        paddingTop = 0;
        paddingBottom = first.height;
      } else if (align === "end") {
        paddingTop = last.height;
        paddingBottom = 0;
      }
      this.paddingTop = paddingTop + padding;
      this.paddingBottom = paddingBottom + padding;
    }
  }
  _handleMargins() {
    if (this._margins) {
      this._margins.left = Math.max(this.paddingLeft, this._margins.left);
      this._margins.top = Math.max(this.paddingTop, this._margins.top);
      this._margins.right = Math.max(this.paddingRight, this._margins.right);
      this._margins.bottom = Math.max(this.paddingBottom, this._margins.bottom);
    }
  }
  afterFit() {
    callback(this.options.afterFit, [this]);
  }
  isHorizontal() {
    const { axis, position } = this.options;
    return position === "top" || position === "bottom" || axis === "x";
  }
  isFullSize() {
    return this.options.fullSize;
  }
  _convertTicksToLabels(ticks) {
    this.beforeTickToLabelConversion();
    this.generateTickLabels(ticks);
    let i, ilen;
    for (i = 0, ilen = ticks.length; i < ilen; i++) {
      if (isNullOrUndef(ticks[i].label)) {
        ticks.splice(i, 1);
        ilen--;
        i--;
      }
    }
    this.afterTickToLabelConversion();
  }
  _getLabelSizes() {
    let labelSizes = this._labelSizes;
    if (!labelSizes) {
      const sampleSize = this.options.ticks.sampleSize;
      let ticks = this.ticks;
      if (sampleSize < ticks.length) {
        ticks = sample(ticks, sampleSize);
      }
      this._labelSizes = labelSizes = this._computeLabelSizes(ticks, ticks.length);
    }
    return labelSizes;
  }
  _computeLabelSizes(ticks, length) {
    const { ctx, _longestTextCache: caches } = this;
    const widths = [];
    const heights = [];
    let widestLabelSize = 0;
    let highestLabelSize = 0;
    let i, j, jlen, label, tickFont, fontString, cache, lineHeight, width, height, nestedLabel;
    for (i = 0; i < length; ++i) {
      label = ticks[i].label;
      tickFont = this._resolveTickFontOptions(i);
      ctx.font = fontString = tickFont.string;
      cache = caches[fontString] = caches[fontString] || { data: {}, gc: [] };
      lineHeight = tickFont.lineHeight;
      width = height = 0;
      if (!isNullOrUndef(label) && !isArray(label)) {
        width = _measureText(ctx, cache.data, cache.gc, width, label);
        height = lineHeight;
      } else if (isArray(label)) {
        for (j = 0, jlen = label.length; j < jlen; ++j) {
          nestedLabel = label[j];
          if (!isNullOrUndef(nestedLabel) && !isArray(nestedLabel)) {
            width = _measureText(ctx, cache.data, cache.gc, width, nestedLabel);
            height += lineHeight;
          }
        }
      }
      widths.push(width);
      heights.push(height);
      widestLabelSize = Math.max(width, widestLabelSize);
      highestLabelSize = Math.max(height, highestLabelSize);
    }
    garbageCollect(caches, length);
    const widest = widths.indexOf(widestLabelSize);
    const highest = heights.indexOf(highestLabelSize);
    const valueAt = /* @__PURE__ */ __name((idx) => ({ width: widths[idx] || 0, height: heights[idx] || 0 }), "valueAt");
    return {
      first: valueAt(0),
      last: valueAt(length - 1),
      widest: valueAt(widest),
      highest: valueAt(highest),
      widths,
      heights
    };
  }
  getLabelForValue(value) {
    return value;
  }
  getPixelForValue(value, index2) {
    return NaN;
  }
  getValueForPixel(pixel) {
  }
  getPixelForTick(index2) {
    const ticks = this.ticks;
    if (index2 < 0 || index2 > ticks.length - 1) {
      return null;
    }
    return this.getPixelForValue(ticks[index2].value);
  }
  getPixelForDecimal(decimal) {
    if (this._reversePixels) {
      decimal = 1 - decimal;
    }
    const pixel = this._startPixel + decimal * this._length;
    return _int16Range(this._alignToPixels ? _alignPixel(this.chart, pixel, 0) : pixel);
  }
  getDecimalForPixel(pixel) {
    const decimal = (pixel - this._startPixel) / this._length;
    return this._reversePixels ? 1 - decimal : decimal;
  }
  getBasePixel() {
    return this.getPixelForValue(this.getBaseValue());
  }
  getBaseValue() {
    const { min, max } = this;
    return min < 0 && max < 0 ? max : min > 0 && max > 0 ? min : 0;
  }
  getContext(index2) {
    const ticks = this.ticks || [];
    if (index2 >= 0 && index2 < ticks.length) {
      const tick = ticks[index2];
      return tick.$context || (tick.$context = createTickContext(this.getContext(), index2, tick));
    }
    return this.$context || (this.$context = createScaleContext(this.chart.getContext(), this));
  }
  _tickSize() {
    const optionTicks = this.options.ticks;
    const rot = toRadians(this.labelRotation);
    const cos = Math.abs(Math.cos(rot));
    const sin = Math.abs(Math.sin(rot));
    const labelSizes = this._getLabelSizes();
    const padding = optionTicks.autoSkipPadding || 0;
    const w = labelSizes ? labelSizes.widest.width + padding : 0;
    const h = labelSizes ? labelSizes.highest.height + padding : 0;
    return this.isHorizontal() ? h * cos > w * sin ? w / cos : h / sin : h * sin < w * cos ? h / cos : w / sin;
  }
  _isVisible() {
    const display = this.options.display;
    if (display !== "auto") {
      return !!display;
    }
    return this.getMatchingVisibleMetas().length > 0;
  }
  _computeGridLineItems(chartArea) {
    const axis = this.axis;
    const chart = this.chart;
    const options = this.options;
    const { grid, position } = options;
    const offset = grid.offset;
    const isHorizontal = this.isHorizontal();
    const ticks = this.ticks;
    const ticksLength = ticks.length + (offset ? 1 : 0);
    const tl = getTickMarkLength(grid);
    const items = [];
    const borderOpts = grid.setContext(this.getContext());
    const axisWidth = borderOpts.drawBorder ? borderOpts.borderWidth : 0;
    const axisHalfWidth = axisWidth / 2;
    const alignBorderValue = /* @__PURE__ */ __name(function(pixel) {
      return _alignPixel(chart, pixel, axisWidth);
    }, "alignBorderValue");
    let borderValue, i, lineValue, alignedLineValue;
    let tx1, ty1, tx2, ty2, x1, y1, x2, y2;
    if (position === "top") {
      borderValue = alignBorderValue(this.bottom);
      ty1 = this.bottom - tl;
      ty2 = borderValue - axisHalfWidth;
      y1 = alignBorderValue(chartArea.top) + axisHalfWidth;
      y2 = chartArea.bottom;
    } else if (position === "bottom") {
      borderValue = alignBorderValue(this.top);
      y1 = chartArea.top;
      y2 = alignBorderValue(chartArea.bottom) - axisHalfWidth;
      ty1 = borderValue + axisHalfWidth;
      ty2 = this.top + tl;
    } else if (position === "left") {
      borderValue = alignBorderValue(this.right);
      tx1 = this.right - tl;
      tx2 = borderValue - axisHalfWidth;
      x1 = alignBorderValue(chartArea.left) + axisHalfWidth;
      x2 = chartArea.right;
    } else if (position === "right") {
      borderValue = alignBorderValue(this.left);
      x1 = chartArea.left;
      x2 = alignBorderValue(chartArea.right) - axisHalfWidth;
      tx1 = borderValue + axisHalfWidth;
      tx2 = this.left + tl;
    } else if (axis === "x") {
      if (position === "center") {
        borderValue = alignBorderValue((chartArea.top + chartArea.bottom) / 2 + 0.5);
      } else if (isObject(position)) {
        const positionAxisID = Object.keys(position)[0];
        const value = position[positionAxisID];
        borderValue = alignBorderValue(this.chart.scales[positionAxisID].getPixelForValue(value));
      }
      y1 = chartArea.top;
      y2 = chartArea.bottom;
      ty1 = borderValue + axisHalfWidth;
      ty2 = ty1 + tl;
    } else if (axis === "y") {
      if (position === "center") {
        borderValue = alignBorderValue((chartArea.left + chartArea.right) / 2);
      } else if (isObject(position)) {
        const positionAxisID = Object.keys(position)[0];
        const value = position[positionAxisID];
        borderValue = alignBorderValue(this.chart.scales[positionAxisID].getPixelForValue(value));
      }
      tx1 = borderValue - axisHalfWidth;
      tx2 = tx1 - tl;
      x1 = chartArea.left;
      x2 = chartArea.right;
    }
    const limit = valueOrDefault(options.ticks.maxTicksLimit, ticksLength);
    const step = Math.max(1, Math.ceil(ticksLength / limit));
    for (i = 0; i < ticksLength; i += step) {
      const optsAtIndex = grid.setContext(this.getContext(i));
      const lineWidth = optsAtIndex.lineWidth;
      const lineColor = optsAtIndex.color;
      const borderDash = optsAtIndex.borderDash || [];
      const borderDashOffset = optsAtIndex.borderDashOffset;
      const tickWidth = optsAtIndex.tickWidth;
      const tickColor = optsAtIndex.tickColor;
      const tickBorderDash = optsAtIndex.tickBorderDash || [];
      const tickBorderDashOffset = optsAtIndex.tickBorderDashOffset;
      lineValue = getPixelForGridLine(this, i, offset);
      if (lineValue === void 0) {
        continue;
      }
      alignedLineValue = _alignPixel(chart, lineValue, lineWidth);
      if (isHorizontal) {
        tx1 = tx2 = x1 = x2 = alignedLineValue;
      } else {
        ty1 = ty2 = y1 = y2 = alignedLineValue;
      }
      items.push({
        tx1,
        ty1,
        tx2,
        ty2,
        x1,
        y1,
        x2,
        y2,
        width: lineWidth,
        color: lineColor,
        borderDash,
        borderDashOffset,
        tickWidth,
        tickColor,
        tickBorderDash,
        tickBorderDashOffset
      });
    }
    this._ticksLength = ticksLength;
    this._borderValue = borderValue;
    return items;
  }
  _computeLabelItems(chartArea) {
    const axis = this.axis;
    const options = this.options;
    const { position, ticks: optionTicks } = options;
    const isHorizontal = this.isHorizontal();
    const ticks = this.ticks;
    const { align, crossAlign, padding, mirror } = optionTicks;
    const tl = getTickMarkLength(options.grid);
    const tickAndPadding = tl + padding;
    const hTickAndPadding = mirror ? -padding : tickAndPadding;
    const rotation = -toRadians(this.labelRotation);
    const items = [];
    let i, ilen, tick, label, x, y, textAlign, pixel, font, lineHeight, lineCount, textOffset;
    let textBaseline = "middle";
    if (position === "top") {
      y = this.bottom - hTickAndPadding;
      textAlign = this._getXAxisLabelAlignment();
    } else if (position === "bottom") {
      y = this.top + hTickAndPadding;
      textAlign = this._getXAxisLabelAlignment();
    } else if (position === "left") {
      const ret = this._getYAxisLabelAlignment(tl);
      textAlign = ret.textAlign;
      x = ret.x;
    } else if (position === "right") {
      const ret = this._getYAxisLabelAlignment(tl);
      textAlign = ret.textAlign;
      x = ret.x;
    } else if (axis === "x") {
      if (position === "center") {
        y = (chartArea.top + chartArea.bottom) / 2 + tickAndPadding;
      } else if (isObject(position)) {
        const positionAxisID = Object.keys(position)[0];
        const value = position[positionAxisID];
        y = this.chart.scales[positionAxisID].getPixelForValue(value) + tickAndPadding;
      }
      textAlign = this._getXAxisLabelAlignment();
    } else if (axis === "y") {
      if (position === "center") {
        x = (chartArea.left + chartArea.right) / 2 - tickAndPadding;
      } else if (isObject(position)) {
        const positionAxisID = Object.keys(position)[0];
        const value = position[positionAxisID];
        x = this.chart.scales[positionAxisID].getPixelForValue(value);
      }
      textAlign = this._getYAxisLabelAlignment(tl).textAlign;
    }
    if (axis === "y") {
      if (align === "start") {
        textBaseline = "top";
      } else if (align === "end") {
        textBaseline = "bottom";
      }
    }
    const labelSizes = this._getLabelSizes();
    for (i = 0, ilen = ticks.length; i < ilen; ++i) {
      tick = ticks[i];
      label = tick.label;
      const optsAtIndex = optionTicks.setContext(this.getContext(i));
      pixel = this.getPixelForTick(i) + optionTicks.labelOffset;
      font = this._resolveTickFontOptions(i);
      lineHeight = font.lineHeight;
      lineCount = isArray(label) ? label.length : 1;
      const halfCount = lineCount / 2;
      const color2 = optsAtIndex.color;
      const strokeColor = optsAtIndex.textStrokeColor;
      const strokeWidth = optsAtIndex.textStrokeWidth;
      let tickTextAlign = textAlign;
      if (isHorizontal) {
        x = pixel;
        if (textAlign === "inner") {
          if (i === ilen - 1) {
            tickTextAlign = !this.options.reverse ? "right" : "left";
          } else if (i === 0) {
            tickTextAlign = !this.options.reverse ? "left" : "right";
          } else {
            tickTextAlign = "center";
          }
        }
        if (position === "top") {
          if (crossAlign === "near" || rotation !== 0) {
            textOffset = -lineCount * lineHeight + lineHeight / 2;
          } else if (crossAlign === "center") {
            textOffset = -labelSizes.highest.height / 2 - halfCount * lineHeight + lineHeight;
          } else {
            textOffset = -labelSizes.highest.height + lineHeight / 2;
          }
        } else {
          if (crossAlign === "near" || rotation !== 0) {
            textOffset = lineHeight / 2;
          } else if (crossAlign === "center") {
            textOffset = labelSizes.highest.height / 2 - halfCount * lineHeight;
          } else {
            textOffset = labelSizes.highest.height - lineCount * lineHeight;
          }
        }
        if (mirror) {
          textOffset *= -1;
        }
      } else {
        y = pixel;
        textOffset = (1 - lineCount) * lineHeight / 2;
      }
      let backdrop;
      if (optsAtIndex.showLabelBackdrop) {
        const labelPadding = toPadding(optsAtIndex.backdropPadding);
        const height = labelSizes.heights[i];
        const width = labelSizes.widths[i];
        let top = y + textOffset - labelPadding.top;
        let left = x - labelPadding.left;
        switch (textBaseline) {
          case "middle":
            top -= height / 2;
            break;
          case "bottom":
            top -= height;
            break;
        }
        switch (textAlign) {
          case "center":
            left -= width / 2;
            break;
          case "right":
            left -= width;
            break;
        }
        backdrop = {
          left,
          top,
          width: width + labelPadding.width,
          height: height + labelPadding.height,
          color: optsAtIndex.backdropColor
        };
      }
      items.push({
        rotation,
        label,
        font,
        color: color2,
        strokeColor,
        strokeWidth,
        textOffset,
        textAlign: tickTextAlign,
        textBaseline,
        translation: [x, y],
        backdrop
      });
    }
    return items;
  }
  _getXAxisLabelAlignment() {
    const { position, ticks } = this.options;
    const rotation = -toRadians(this.labelRotation);
    if (rotation) {
      return position === "top" ? "left" : "right";
    }
    let align = "center";
    if (ticks.align === "start") {
      align = "left";
    } else if (ticks.align === "end") {
      align = "right";
    } else if (ticks.align === "inner") {
      align = "inner";
    }
    return align;
  }
  _getYAxisLabelAlignment(tl) {
    const { position, ticks: { crossAlign, mirror, padding } } = this.options;
    const labelSizes = this._getLabelSizes();
    const tickAndPadding = tl + padding;
    const widest = labelSizes.widest.width;
    let textAlign;
    let x;
    if (position === "left") {
      if (mirror) {
        x = this.right + padding;
        if (crossAlign === "near") {
          textAlign = "left";
        } else if (crossAlign === "center") {
          textAlign = "center";
          x += widest / 2;
        } else {
          textAlign = "right";
          x += widest;
        }
      } else {
        x = this.right - tickAndPadding;
        if (crossAlign === "near") {
          textAlign = "right";
        } else if (crossAlign === "center") {
          textAlign = "center";
          x -= widest / 2;
        } else {
          textAlign = "left";
          x = this.left;
        }
      }
    } else if (position === "right") {
      if (mirror) {
        x = this.left + padding;
        if (crossAlign === "near") {
          textAlign = "right";
        } else if (crossAlign === "center") {
          textAlign = "center";
          x -= widest / 2;
        } else {
          textAlign = "left";
          x -= widest;
        }
      } else {
        x = this.left + tickAndPadding;
        if (crossAlign === "near") {
          textAlign = "left";
        } else if (crossAlign === "center") {
          textAlign = "center";
          x += widest / 2;
        } else {
          textAlign = "right";
          x = this.right;
        }
      }
    } else {
      textAlign = "right";
    }
    return { textAlign, x };
  }
  _computeLabelArea() {
    if (this.options.ticks.mirror) {
      return;
    }
    const chart = this.chart;
    const position = this.options.position;
    if (position === "left" || position === "right") {
      return { top: 0, left: this.left, bottom: chart.height, right: this.right };
    }
    if (position === "top" || position === "bottom") {
      return { top: this.top, left: 0, bottom: this.bottom, right: chart.width };
    }
  }
  drawBackground() {
    const { ctx, options: { backgroundColor }, left, top, width, height } = this;
    if (backgroundColor) {
      ctx.save();
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(left, top, width, height);
      ctx.restore();
    }
  }
  getLineWidthForValue(value) {
    const grid = this.options.grid;
    if (!this._isVisible() || !grid.display) {
      return 0;
    }
    const ticks = this.ticks;
    const index2 = ticks.findIndex((t) => t.value === value);
    if (index2 >= 0) {
      const opts = grid.setContext(this.getContext(index2));
      return opts.lineWidth;
    }
    return 0;
  }
  drawGrid(chartArea) {
    const grid = this.options.grid;
    const ctx = this.ctx;
    const items = this._gridLineItems || (this._gridLineItems = this._computeGridLineItems(chartArea));
    let i, ilen;
    const drawLine = /* @__PURE__ */ __name((p1, p2, style) => {
      if (!style.width || !style.color) {
        return;
      }
      ctx.save();
      ctx.lineWidth = style.width;
      ctx.strokeStyle = style.color;
      ctx.setLineDash(style.borderDash || []);
      ctx.lineDashOffset = style.borderDashOffset;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      ctx.restore();
    }, "drawLine");
    if (grid.display) {
      for (i = 0, ilen = items.length; i < ilen; ++i) {
        const item = items[i];
        if (grid.drawOnChartArea) {
          drawLine(
            { x: item.x1, y: item.y1 },
            { x: item.x2, y: item.y2 },
            item
          );
        }
        if (grid.drawTicks) {
          drawLine(
            { x: item.tx1, y: item.ty1 },
            { x: item.tx2, y: item.ty2 },
            {
              color: item.tickColor,
              width: item.tickWidth,
              borderDash: item.tickBorderDash,
              borderDashOffset: item.tickBorderDashOffset
            }
          );
        }
      }
    }
  }
  drawBorder() {
    const { chart, ctx, options: { grid } } = this;
    const borderOpts = grid.setContext(this.getContext());
    const axisWidth = grid.drawBorder ? borderOpts.borderWidth : 0;
    if (!axisWidth) {
      return;
    }
    const lastLineWidth = grid.setContext(this.getContext(0)).lineWidth;
    const borderValue = this._borderValue;
    let x1, x2, y1, y2;
    if (this.isHorizontal()) {
      x1 = _alignPixel(chart, this.left, axisWidth) - axisWidth / 2;
      x2 = _alignPixel(chart, this.right, lastLineWidth) + lastLineWidth / 2;
      y1 = y2 = borderValue;
    } else {
      y1 = _alignPixel(chart, this.top, axisWidth) - axisWidth / 2;
      y2 = _alignPixel(chart, this.bottom, lastLineWidth) + lastLineWidth / 2;
      x1 = x2 = borderValue;
    }
    ctx.save();
    ctx.lineWidth = borderOpts.borderWidth;
    ctx.strokeStyle = borderOpts.borderColor;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }
  drawLabels(chartArea) {
    const optionTicks = this.options.ticks;
    if (!optionTicks.display) {
      return;
    }
    const ctx = this.ctx;
    const area = this._computeLabelArea();
    if (area) {
      clipArea(ctx, area);
    }
    const items = this._labelItems || (this._labelItems = this._computeLabelItems(chartArea));
    let i, ilen;
    for (i = 0, ilen = items.length; i < ilen; ++i) {
      const item = items[i];
      const tickFont = item.font;
      const label = item.label;
      if (item.backdrop) {
        ctx.fillStyle = item.backdrop.color;
        ctx.fillRect(item.backdrop.left, item.backdrop.top, item.backdrop.width, item.backdrop.height);
      }
      let y = item.textOffset;
      renderText(ctx, label, 0, y, tickFont, item);
    }
    if (area) {
      unclipArea(ctx);
    }
  }
  drawTitle() {
    const { ctx, options: { position, title, reverse } } = this;
    if (!title.display) {
      return;
    }
    const font = toFont(title.font);
    const padding = toPadding(title.padding);
    const align = title.align;
    let offset = font.lineHeight / 2;
    if (position === "bottom" || position === "center" || isObject(position)) {
      offset += padding.bottom;
      if (isArray(title.text)) {
        offset += font.lineHeight * (title.text.length - 1);
      }
    } else {
      offset += padding.top;
    }
    const { titleX, titleY, maxWidth, rotation } = titleArgs(this, offset, position, align);
    renderText(ctx, title.text, 0, 0, font, {
      color: title.color,
      maxWidth,
      rotation,
      textAlign: titleAlign(align, position, reverse),
      textBaseline: "middle",
      translation: [titleX, titleY]
    });
  }
  draw(chartArea) {
    if (!this._isVisible()) {
      return;
    }
    this.drawBackground();
    this.drawGrid(chartArea);
    this.drawBorder();
    this.drawTitle();
    this.drawLabels(chartArea);
  }
  _layers() {
    const opts = this.options;
    const tz = opts.ticks && opts.ticks.z || 0;
    const gz = valueOrDefault(opts.grid && opts.grid.z, -1);
    if (!this._isVisible() || this.draw !== Scale.prototype.draw) {
      return [{
        z: tz,
        draw: (chartArea) => {
          this.draw(chartArea);
        }
      }];
    }
    return [{
      z: gz,
      draw: (chartArea) => {
        this.drawBackground();
        this.drawGrid(chartArea);
        this.drawTitle();
      }
    }, {
      z: gz + 1,
      draw: () => {
        this.drawBorder();
      }
    }, {
      z: tz,
      draw: (chartArea) => {
        this.drawLabels(chartArea);
      }
    }];
  }
  getMatchingVisibleMetas(type) {
    const metas = this.chart.getSortedVisibleDatasetMetas();
    const axisID = this.axis + "AxisID";
    const result = [];
    let i, ilen;
    for (i = 0, ilen = metas.length; i < ilen; ++i) {
      const meta = metas[i];
      if (meta[axisID] === this.id && (!type || meta.type === type)) {
        result.push(meta);
      }
    }
    return result;
  }
  _resolveTickFontOptions(index2) {
    const opts = this.options.ticks.setContext(this.getContext(index2));
    return toFont(opts.font);
  }
  _maxDigits() {
    const fontSize = this._resolveTickFontOptions(0).lineHeight;
    return (this.isHorizontal() ? this.width : this.height) / fontSize;
  }
}
__name(Scale, "Scale");
class TypedRegistry {
  constructor(type, scope, override) {
    this.type = type;
    this.scope = scope;
    this.override = override;
    this.items = /* @__PURE__ */ Object.create(null);
  }
  isForType(type) {
    return Object.prototype.isPrototypeOf.call(this.type.prototype, type.prototype);
  }
  register(item) {
    const proto = Object.getPrototypeOf(item);
    let parentScope;
    if (isIChartComponent(proto)) {
      parentScope = this.register(proto);
    }
    const items = this.items;
    const id = item.id;
    const scope = this.scope + "." + id;
    if (!id) {
      throw new Error("class does not have id: " + item);
    }
    if (id in items) {
      return scope;
    }
    items[id] = item;
    registerDefaults(item, scope, parentScope);
    if (this.override) {
      defaults.override(item.id, item.overrides);
    }
    return scope;
  }
  get(id) {
    return this.items[id];
  }
  unregister(item) {
    const items = this.items;
    const id = item.id;
    const scope = this.scope;
    if (id in items) {
      delete items[id];
    }
    if (scope && id in defaults[scope]) {
      delete defaults[scope][id];
      if (this.override) {
        delete overrides[id];
      }
    }
  }
}
__name(TypedRegistry, "TypedRegistry");
function registerDefaults(item, scope, parentScope) {
  const itemDefaults = merge(/* @__PURE__ */ Object.create(null), [
    parentScope ? defaults.get(parentScope) : {},
    defaults.get(scope),
    item.defaults
  ]);
  defaults.set(scope, itemDefaults);
  if (item.defaultRoutes) {
    routeDefaults(scope, item.defaultRoutes);
  }
  if (item.descriptors) {
    defaults.describe(scope, item.descriptors);
  }
}
__name(registerDefaults, "registerDefaults");
function routeDefaults(scope, routes) {
  Object.keys(routes).forEach((property) => {
    const propertyParts = property.split(".");
    const sourceName = propertyParts.pop();
    const sourceScope = [scope].concat(propertyParts).join(".");
    const parts = routes[property].split(".");
    const targetName = parts.pop();
    const targetScope = parts.join(".");
    defaults.route(sourceScope, sourceName, targetScope, targetName);
  });
}
__name(routeDefaults, "routeDefaults");
function isIChartComponent(proto) {
  return "id" in proto && "defaults" in proto;
}
__name(isIChartComponent, "isIChartComponent");
class Registry {
  constructor() {
    this.controllers = new TypedRegistry(DatasetController, "datasets", true);
    this.elements = new TypedRegistry(Element, "elements");
    this.plugins = new TypedRegistry(Object, "plugins");
    this.scales = new TypedRegistry(Scale, "scales");
    this._typedRegistries = [this.controllers, this.scales, this.elements];
  }
  add(...args) {
    this._each("register", args);
  }
  remove(...args) {
    this._each("unregister", args);
  }
  addControllers(...args) {
    this._each("register", args, this.controllers);
  }
  addElements(...args) {
    this._each("register", args, this.elements);
  }
  addPlugins(...args) {
    this._each("register", args, this.plugins);
  }
  addScales(...args) {
    this._each("register", args, this.scales);
  }
  getController(id) {
    return this._get(id, this.controllers, "controller");
  }
  getElement(id) {
    return this._get(id, this.elements, "element");
  }
  getPlugin(id) {
    return this._get(id, this.plugins, "plugin");
  }
  getScale(id) {
    return this._get(id, this.scales, "scale");
  }
  removeControllers(...args) {
    this._each("unregister", args, this.controllers);
  }
  removeElements(...args) {
    this._each("unregister", args, this.elements);
  }
  removePlugins(...args) {
    this._each("unregister", args, this.plugins);
  }
  removeScales(...args) {
    this._each("unregister", args, this.scales);
  }
  _each(method, args, typedRegistry) {
    [...args].forEach((arg) => {
      const reg = typedRegistry || this._getRegistryForType(arg);
      if (typedRegistry || reg.isForType(arg) || reg === this.plugins && arg.id) {
        this._exec(method, reg, arg);
      } else {
        each(arg, (item) => {
          const itemReg = typedRegistry || this._getRegistryForType(item);
          this._exec(method, itemReg, item);
        });
      }
    });
  }
  _exec(method, registry2, component) {
    const camelMethod = _capitalize(method);
    callback(component["before" + camelMethod], [], component);
    registry2[method](component);
    callback(component["after" + camelMethod], [], component);
  }
  _getRegistryForType(type) {
    for (let i = 0; i < this._typedRegistries.length; i++) {
      const reg = this._typedRegistries[i];
      if (reg.isForType(type)) {
        return reg;
      }
    }
    return this.plugins;
  }
  _get(id, typedRegistry, type) {
    const item = typedRegistry.get(id);
    if (item === void 0) {
      throw new Error('"' + id + '" is not a registered ' + type + ".");
    }
    return item;
  }
}
__name(Registry, "Registry");
var registry = new Registry();
class ScatterController extends DatasetController {
  update(mode) {
    const meta = this._cachedMeta;
    const { data: points = [] } = meta;
    const animationsDisabled = this.chart._animationsDisabled;
    let { start, count } = _getStartAndCountOfVisiblePoints(meta, points, animationsDisabled);
    this._drawStart = start;
    this._drawCount = count;
    if (_scaleRangesChanged(meta)) {
      start = 0;
      count = points.length;
    }
    if (this.options.showLine) {
      const { dataset: line, _dataset } = meta;
      line._chart = this.chart;
      line._datasetIndex = this.index;
      line._decimated = !!_dataset._decimated;
      line.points = points;
      const options = this.resolveDatasetElementOptions(mode);
      options.segment = this.options.segment;
      this.updateElement(line, void 0, {
        animated: !animationsDisabled,
        options
      }, mode);
    }
    this.updateElements(points, start, count, mode);
  }
  addElements() {
    const { showLine } = this.options;
    if (!this.datasetElementType && showLine) {
      this.datasetElementType = registry.getElement("line");
    }
    super.addElements();
  }
  updateElements(points, start, count, mode) {
    const reset = mode === "reset";
    const { iScale, vScale, _stacked, _dataset } = this._cachedMeta;
    const firstOpts = this.resolveDataElementOptions(start, mode);
    const sharedOptions = this.getSharedOptions(firstOpts);
    const includeOptions = this.includeOptions(mode, sharedOptions);
    const iAxis = iScale.axis;
    const vAxis = vScale.axis;
    const { spanGaps, segment } = this.options;
    const maxGapLength = isNumber(spanGaps) ? spanGaps : Number.POSITIVE_INFINITY;
    const directUpdate = this.chart._animationsDisabled || reset || mode === "none";
    let prevParsed = start > 0 && this.getParsed(start - 1);
    for (let i = start; i < start + count; ++i) {
      const point = points[i];
      const parsed = this.getParsed(i);
      const properties = directUpdate ? point : {};
      const nullData = isNullOrUndef(parsed[vAxis]);
      const iPixel = properties[iAxis] = iScale.getPixelForValue(parsed[iAxis], i);
      const vPixel = properties[vAxis] = reset || nullData ? vScale.getBasePixel() : vScale.getPixelForValue(_stacked ? this.applyStack(vScale, parsed, _stacked) : parsed[vAxis], i);
      properties.skip = isNaN(iPixel) || isNaN(vPixel) || nullData;
      properties.stop = i > 0 && Math.abs(parsed[iAxis] - prevParsed[iAxis]) > maxGapLength;
      if (segment) {
        properties.parsed = parsed;
        properties.raw = _dataset.data[i];
      }
      if (includeOptions) {
        properties.options = sharedOptions || this.resolveDataElementOptions(i, point.active ? "active" : mode);
      }
      if (!directUpdate) {
        this.updateElement(point, i, properties, mode);
      }
      prevParsed = parsed;
    }
    this.updateSharedOptions(sharedOptions, mode, firstOpts);
  }
  getMaxOverflow() {
    const meta = this._cachedMeta;
    const data = meta.data || [];
    if (!this.options.showLine) {
      let max = 0;
      for (let i = data.length - 1; i >= 0; --i) {
        max = Math.max(max, data[i].size(this.resolveDataElementOptions(i)) / 2);
      }
      return max > 0 && max;
    }
    const dataset = meta.dataset;
    const border = dataset.options && dataset.options.borderWidth || 0;
    if (!data.length) {
      return border;
    }
    const firstPoint = data[0].size(this.resolveDataElementOptions(0));
    const lastPoint = data[data.length - 1].size(this.resolveDataElementOptions(data.length - 1));
    return Math.max(border, firstPoint, lastPoint) / 2;
  }
}
__name(ScatterController, "ScatterController");
ScatterController.id = "scatter";
ScatterController.defaults = {
  datasetElementType: false,
  dataElementType: "point",
  showLine: false,
  fill: false
};
ScatterController.overrides = {
  interaction: {
    mode: "point"
  },
  plugins: {
    tooltip: {
      callbacks: {
        title() {
          return "";
        },
        label(item) {
          return "(" + item.label + ", " + item.formattedValue + ")";
        }
      }
    }
  },
  scales: {
    x: {
      type: "linear"
    },
    y: {
      type: "linear"
    }
  }
};
var controllers = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  BarController,
  BubbleController,
  DoughnutController,
  LineController,
  PolarAreaController,
  PieController,
  RadarController,
  ScatterController
});
function abstract() {
  throw new Error("This method is not implemented: Check that a complete date adapter is provided.");
}
__name(abstract, "abstract");
class DateAdapter {
  constructor(options) {
    this.options = options || {};
  }
  init(chartOptions) {
  }
  formats() {
    return abstract();
  }
  parse(value, format) {
    return abstract();
  }
  format(timestamp, format) {
    return abstract();
  }
  add(timestamp, amount, unit) {
    return abstract();
  }
  diff(a, b, unit) {
    return abstract();
  }
  startOf(timestamp, unit, weekday) {
    return abstract();
  }
  endOf(timestamp, unit) {
    return abstract();
  }
}
__name(DateAdapter, "DateAdapter");
DateAdapter.override = function(members) {
  Object.assign(DateAdapter.prototype, members);
};
var adapters = {
  _date: DateAdapter
};
function binarySearch(metaset, axis, value, intersect) {
  const { controller, data, _sorted } = metaset;
  const iScale = controller._cachedMeta.iScale;
  if (iScale && axis === iScale.axis && axis !== "r" && _sorted && data.length) {
    const lookupMethod = iScale._reversePixels ? _rlookupByKey : _lookupByKey;
    if (!intersect) {
      return lookupMethod(data, axis, value);
    } else if (controller._sharedOptions) {
      const el = data[0];
      const range = typeof el.getRange === "function" && el.getRange(axis);
      if (range) {
        const start = lookupMethod(data, axis, value - range);
        const end = lookupMethod(data, axis, value + range);
        return { lo: start.lo, hi: end.hi };
      }
    }
  }
  return { lo: 0, hi: data.length - 1 };
}
__name(binarySearch, "binarySearch");
function evaluateInteractionItems(chart, axis, position, handler, intersect) {
  const metasets = chart.getSortedVisibleDatasetMetas();
  const value = position[axis];
  for (let i = 0, ilen = metasets.length; i < ilen; ++i) {
    const { index: index2, data } = metasets[i];
    const { lo, hi } = binarySearch(metasets[i], axis, value, intersect);
    for (let j = lo; j <= hi; ++j) {
      const element2 = data[j];
      if (!element2.skip) {
        handler(element2, index2, j);
      }
    }
  }
}
__name(evaluateInteractionItems, "evaluateInteractionItems");
function getDistanceMetricForAxis(axis) {
  const useX = axis.indexOf("x") !== -1;
  const useY = axis.indexOf("y") !== -1;
  return function(pt1, pt2) {
    const deltaX = useX ? Math.abs(pt1.x - pt2.x) : 0;
    const deltaY = useY ? Math.abs(pt1.y - pt2.y) : 0;
    return Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
  };
}
__name(getDistanceMetricForAxis, "getDistanceMetricForAxis");
function getIntersectItems(chart, position, axis, useFinalPosition, includeInvisible) {
  const items = [];
  if (!includeInvisible && !chart.isPointInArea(position)) {
    return items;
  }
  const evaluationFunc = /* @__PURE__ */ __name(function(element2, datasetIndex, index2) {
    if (!includeInvisible && !_isPointInArea(element2, chart.chartArea, 0)) {
      return;
    }
    if (element2.inRange(position.x, position.y, useFinalPosition)) {
      items.push({ element: element2, datasetIndex, index: index2 });
    }
  }, "evaluationFunc");
  evaluateInteractionItems(chart, axis, position, evaluationFunc, true);
  return items;
}
__name(getIntersectItems, "getIntersectItems");
function getNearestRadialItems(chart, position, axis, useFinalPosition) {
  let items = [];
  function evaluationFunc(element2, datasetIndex, index2) {
    const { startAngle, endAngle } = element2.getProps(["startAngle", "endAngle"], useFinalPosition);
    const { angle } = getAngleFromPoint(element2, { x: position.x, y: position.y });
    if (_angleBetween(angle, startAngle, endAngle)) {
      items.push({ element: element2, datasetIndex, index: index2 });
    }
  }
  __name(evaluationFunc, "evaluationFunc");
  evaluateInteractionItems(chart, axis, position, evaluationFunc);
  return items;
}
__name(getNearestRadialItems, "getNearestRadialItems");
function getNearestCartesianItems(chart, position, axis, intersect, useFinalPosition, includeInvisible) {
  let items = [];
  const distanceMetric = getDistanceMetricForAxis(axis);
  let minDistance = Number.POSITIVE_INFINITY;
  function evaluationFunc(element2, datasetIndex, index2) {
    const inRange2 = element2.inRange(position.x, position.y, useFinalPosition);
    if (intersect && !inRange2) {
      return;
    }
    const center = element2.getCenterPoint(useFinalPosition);
    const pointInArea = !!includeInvisible || chart.isPointInArea(center);
    if (!pointInArea && !inRange2) {
      return;
    }
    const distance = distanceMetric(position, center);
    if (distance < minDistance) {
      items = [{ element: element2, datasetIndex, index: index2 }];
      minDistance = distance;
    } else if (distance === minDistance) {
      items.push({ element: element2, datasetIndex, index: index2 });
    }
  }
  __name(evaluationFunc, "evaluationFunc");
  evaluateInteractionItems(chart, axis, position, evaluationFunc);
  return items;
}
__name(getNearestCartesianItems, "getNearestCartesianItems");
function getNearestItems(chart, position, axis, intersect, useFinalPosition, includeInvisible) {
  if (!includeInvisible && !chart.isPointInArea(position)) {
    return [];
  }
  return axis === "r" && !intersect ? getNearestRadialItems(chart, position, axis, useFinalPosition) : getNearestCartesianItems(chart, position, axis, intersect, useFinalPosition, includeInvisible);
}
__name(getNearestItems, "getNearestItems");
function getAxisItems(chart, position, axis, intersect, useFinalPosition) {
  const items = [];
  const rangeMethod = axis === "x" ? "inXRange" : "inYRange";
  let intersectsItem = false;
  evaluateInteractionItems(chart, axis, position, (element2, datasetIndex, index2) => {
    if (element2[rangeMethod](position[axis], useFinalPosition)) {
      items.push({ element: element2, datasetIndex, index: index2 });
      intersectsItem = intersectsItem || element2.inRange(position.x, position.y, useFinalPosition);
    }
  });
  if (intersect && !intersectsItem) {
    return [];
  }
  return items;
}
__name(getAxisItems, "getAxisItems");
var Interaction = {
  evaluateInteractionItems,
  modes: {
    index(chart, e, options, useFinalPosition) {
      const position = getRelativePosition(e, chart);
      const axis = options.axis || "x";
      const includeInvisible = options.includeInvisible || false;
      const items = options.intersect ? getIntersectItems(chart, position, axis, useFinalPosition, includeInvisible) : getNearestItems(chart, position, axis, false, useFinalPosition, includeInvisible);
      const elements2 = [];
      if (!items.length) {
        return [];
      }
      chart.getSortedVisibleDatasetMetas().forEach((meta) => {
        const index2 = items[0].index;
        const element2 = meta.data[index2];
        if (element2 && !element2.skip) {
          elements2.push({ element: element2, datasetIndex: meta.index, index: index2 });
        }
      });
      return elements2;
    },
    dataset(chart, e, options, useFinalPosition) {
      const position = getRelativePosition(e, chart);
      const axis = options.axis || "xy";
      const includeInvisible = options.includeInvisible || false;
      let items = options.intersect ? getIntersectItems(chart, position, axis, useFinalPosition, includeInvisible) : getNearestItems(chart, position, axis, false, useFinalPosition, includeInvisible);
      if (items.length > 0) {
        const datasetIndex = items[0].datasetIndex;
        const data = chart.getDatasetMeta(datasetIndex).data;
        items = [];
        for (let i = 0; i < data.length; ++i) {
          items.push({ element: data[i], datasetIndex, index: i });
        }
      }
      return items;
    },
    point(chart, e, options, useFinalPosition) {
      const position = getRelativePosition(e, chart);
      const axis = options.axis || "xy";
      const includeInvisible = options.includeInvisible || false;
      return getIntersectItems(chart, position, axis, useFinalPosition, includeInvisible);
    },
    nearest(chart, e, options, useFinalPosition) {
      const position = getRelativePosition(e, chart);
      const axis = options.axis || "xy";
      const includeInvisible = options.includeInvisible || false;
      return getNearestItems(chart, position, axis, options.intersect, useFinalPosition, includeInvisible);
    },
    x(chart, e, options, useFinalPosition) {
      const position = getRelativePosition(e, chart);
      return getAxisItems(chart, position, "x", options.intersect, useFinalPosition);
    },
    y(chart, e, options, useFinalPosition) {
      const position = getRelativePosition(e, chart);
      return getAxisItems(chart, position, "y", options.intersect, useFinalPosition);
    }
  }
};
const STATIC_POSITIONS = ["left", "top", "right", "bottom"];
function filterByPosition(array, position) {
  return array.filter((v) => v.pos === position);
}
__name(filterByPosition, "filterByPosition");
function filterDynamicPositionByAxis(array, axis) {
  return array.filter((v) => STATIC_POSITIONS.indexOf(v.pos) === -1 && v.box.axis === axis);
}
__name(filterDynamicPositionByAxis, "filterDynamicPositionByAxis");
function sortByWeight(array, reverse) {
  return array.sort((a, b) => {
    const v0 = reverse ? b : a;
    const v1 = reverse ? a : b;
    return v0.weight === v1.weight ? v0.index - v1.index : v0.weight - v1.weight;
  });
}
__name(sortByWeight, "sortByWeight");
function wrapBoxes(boxes) {
  const layoutBoxes = [];
  let i, ilen, box, pos, stack, stackWeight;
  for (i = 0, ilen = (boxes || []).length; i < ilen; ++i) {
    box = boxes[i];
    ({ position: pos, options: { stack, stackWeight = 1 } } = box);
    layoutBoxes.push({
      index: i,
      box,
      pos,
      horizontal: box.isHorizontal(),
      weight: box.weight,
      stack: stack && pos + stack,
      stackWeight
    });
  }
  return layoutBoxes;
}
__name(wrapBoxes, "wrapBoxes");
function buildStacks(layouts2) {
  const stacks = {};
  for (const wrap of layouts2) {
    const { stack, pos, stackWeight } = wrap;
    if (!stack || !STATIC_POSITIONS.includes(pos)) {
      continue;
    }
    const _stack = stacks[stack] || (stacks[stack] = { count: 0, placed: 0, weight: 0, size: 0 });
    _stack.count++;
    _stack.weight += stackWeight;
  }
  return stacks;
}
__name(buildStacks, "buildStacks");
function setLayoutDims(layouts2, params) {
  const stacks = buildStacks(layouts2);
  const { vBoxMaxWidth, hBoxMaxHeight } = params;
  let i, ilen, layout;
  for (i = 0, ilen = layouts2.length; i < ilen; ++i) {
    layout = layouts2[i];
    const { fullSize } = layout.box;
    const stack = stacks[layout.stack];
    const factor = stack && layout.stackWeight / stack.weight;
    if (layout.horizontal) {
      layout.width = factor ? factor * vBoxMaxWidth : fullSize && params.availableWidth;
      layout.height = hBoxMaxHeight;
    } else {
      layout.width = vBoxMaxWidth;
      layout.height = factor ? factor * hBoxMaxHeight : fullSize && params.availableHeight;
    }
  }
  return stacks;
}
__name(setLayoutDims, "setLayoutDims");
function buildLayoutBoxes(boxes) {
  const layoutBoxes = wrapBoxes(boxes);
  const fullSize = sortByWeight(layoutBoxes.filter((wrap) => wrap.box.fullSize), true);
  const left = sortByWeight(filterByPosition(layoutBoxes, "left"), true);
  const right = sortByWeight(filterByPosition(layoutBoxes, "right"));
  const top = sortByWeight(filterByPosition(layoutBoxes, "top"), true);
  const bottom = sortByWeight(filterByPosition(layoutBoxes, "bottom"));
  const centerHorizontal = filterDynamicPositionByAxis(layoutBoxes, "x");
  const centerVertical = filterDynamicPositionByAxis(layoutBoxes, "y");
  return {
    fullSize,
    leftAndTop: left.concat(top),
    rightAndBottom: right.concat(centerVertical).concat(bottom).concat(centerHorizontal),
    chartArea: filterByPosition(layoutBoxes, "chartArea"),
    vertical: left.concat(right).concat(centerVertical),
    horizontal: top.concat(bottom).concat(centerHorizontal)
  };
}
__name(buildLayoutBoxes, "buildLayoutBoxes");
function getCombinedMax(maxPadding, chartArea, a, b) {
  return Math.max(maxPadding[a], chartArea[a]) + Math.max(maxPadding[b], chartArea[b]);
}
__name(getCombinedMax, "getCombinedMax");
function updateMaxPadding(maxPadding, boxPadding) {
  maxPadding.top = Math.max(maxPadding.top, boxPadding.top);
  maxPadding.left = Math.max(maxPadding.left, boxPadding.left);
  maxPadding.bottom = Math.max(maxPadding.bottom, boxPadding.bottom);
  maxPadding.right = Math.max(maxPadding.right, boxPadding.right);
}
__name(updateMaxPadding, "updateMaxPadding");
function updateDims(chartArea, params, layout, stacks) {
  const { pos, box } = layout;
  const maxPadding = chartArea.maxPadding;
  if (!isObject(pos)) {
    if (layout.size) {
      chartArea[pos] -= layout.size;
    }
    const stack = stacks[layout.stack] || { size: 0, count: 1 };
    stack.size = Math.max(stack.size, layout.horizontal ? box.height : box.width);
    layout.size = stack.size / stack.count;
    chartArea[pos] += layout.size;
  }
  if (box.getPadding) {
    updateMaxPadding(maxPadding, box.getPadding());
  }
  const newWidth = Math.max(0, params.outerWidth - getCombinedMax(maxPadding, chartArea, "left", "right"));
  const newHeight = Math.max(0, params.outerHeight - getCombinedMax(maxPadding, chartArea, "top", "bottom"));
  const widthChanged = newWidth !== chartArea.w;
  const heightChanged = newHeight !== chartArea.h;
  chartArea.w = newWidth;
  chartArea.h = newHeight;
  return layout.horizontal ? { same: widthChanged, other: heightChanged } : { same: heightChanged, other: widthChanged };
}
__name(updateDims, "updateDims");
function handleMaxPadding(chartArea) {
  const maxPadding = chartArea.maxPadding;
  function updatePos(pos) {
    const change = Math.max(maxPadding[pos] - chartArea[pos], 0);
    chartArea[pos] += change;
    return change;
  }
  __name(updatePos, "updatePos");
  chartArea.y += updatePos("top");
  chartArea.x += updatePos("left");
  updatePos("right");
  updatePos("bottom");
}
__name(handleMaxPadding, "handleMaxPadding");
function getMargins(horizontal, chartArea) {
  const maxPadding = chartArea.maxPadding;
  function marginForPositions(positions2) {
    const margin = { left: 0, top: 0, right: 0, bottom: 0 };
    positions2.forEach((pos) => {
      margin[pos] = Math.max(chartArea[pos], maxPadding[pos]);
    });
    return margin;
  }
  __name(marginForPositions, "marginForPositions");
  return horizontal ? marginForPositions(["left", "right"]) : marginForPositions(["top", "bottom"]);
}
__name(getMargins, "getMargins");
function fitBoxes(boxes, chartArea, params, stacks) {
  const refitBoxes = [];
  let i, ilen, layout, box, refit, changed;
  for (i = 0, ilen = boxes.length, refit = 0; i < ilen; ++i) {
    layout = boxes[i];
    box = layout.box;
    box.update(
      layout.width || chartArea.w,
      layout.height || chartArea.h,
      getMargins(layout.horizontal, chartArea)
    );
    const { same, other } = updateDims(chartArea, params, layout, stacks);
    refit |= same && refitBoxes.length;
    changed = changed || other;
    if (!box.fullSize) {
      refitBoxes.push(layout);
    }
  }
  return refit && fitBoxes(refitBoxes, chartArea, params, stacks) || changed;
}
__name(fitBoxes, "fitBoxes");
function setBoxDims(box, left, top, width, height) {
  box.top = top;
  box.left = left;
  box.right = left + width;
  box.bottom = top + height;
  box.width = width;
  box.height = height;
}
__name(setBoxDims, "setBoxDims");
function placeBoxes(boxes, chartArea, params, stacks) {
  const userPadding = params.padding;
  let { x, y } = chartArea;
  for (const layout of boxes) {
    const box = layout.box;
    const stack = stacks[layout.stack] || { count: 1, placed: 0, weight: 1 };
    const weight = layout.stackWeight / stack.weight || 1;
    if (layout.horizontal) {
      const width = chartArea.w * weight;
      const height = stack.size || box.height;
      if (defined(stack.start)) {
        y = stack.start;
      }
      if (box.fullSize) {
        setBoxDims(box, userPadding.left, y, params.outerWidth - userPadding.right - userPadding.left, height);
      } else {
        setBoxDims(box, chartArea.left + stack.placed, y, width, height);
      }
      stack.start = y;
      stack.placed += width;
      y = box.bottom;
    } else {
      const height = chartArea.h * weight;
      const width = stack.size || box.width;
      if (defined(stack.start)) {
        x = stack.start;
      }
      if (box.fullSize) {
        setBoxDims(box, x, userPadding.top, width, params.outerHeight - userPadding.bottom - userPadding.top);
      } else {
        setBoxDims(box, x, chartArea.top + stack.placed, width, height);
      }
      stack.start = x;
      stack.placed += height;
      x = box.right;
    }
  }
  chartArea.x = x;
  chartArea.y = y;
}
__name(placeBoxes, "placeBoxes");
defaults.set("layout", {
  autoPadding: true,
  padding: {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  }
});
var layouts = {
  addBox(chart, item) {
    if (!chart.boxes) {
      chart.boxes = [];
    }
    item.fullSize = item.fullSize || false;
    item.position = item.position || "top";
    item.weight = item.weight || 0;
    item._layers = item._layers || function() {
      return [{
        z: 0,
        draw(chartArea) {
          item.draw(chartArea);
        }
      }];
    };
    chart.boxes.push(item);
  },
  removeBox(chart, layoutItem) {
    const index2 = chart.boxes ? chart.boxes.indexOf(layoutItem) : -1;
    if (index2 !== -1) {
      chart.boxes.splice(index2, 1);
    }
  },
  configure(chart, item, options) {
    item.fullSize = options.fullSize;
    item.position = options.position;
    item.weight = options.weight;
  },
  update(chart, width, height, minPadding) {
    if (!chart) {
      return;
    }
    const padding = toPadding(chart.options.layout.padding);
    const availableWidth = Math.max(width - padding.width, 0);
    const availableHeight = Math.max(height - padding.height, 0);
    const boxes = buildLayoutBoxes(chart.boxes);
    const verticalBoxes = boxes.vertical;
    const horizontalBoxes = boxes.horizontal;
    each(chart.boxes, (box) => {
      if (typeof box.beforeLayout === "function") {
        box.beforeLayout();
      }
    });
    const visibleVerticalBoxCount = verticalBoxes.reduce((total, wrap) => wrap.box.options && wrap.box.options.display === false ? total : total + 1, 0) || 1;
    const params = Object.freeze({
      outerWidth: width,
      outerHeight: height,
      padding,
      availableWidth,
      availableHeight,
      vBoxMaxWidth: availableWidth / 2 / visibleVerticalBoxCount,
      hBoxMaxHeight: availableHeight / 2
    });
    const maxPadding = Object.assign({}, padding);
    updateMaxPadding(maxPadding, toPadding(minPadding));
    const chartArea = Object.assign({
      maxPadding,
      w: availableWidth,
      h: availableHeight,
      x: padding.left,
      y: padding.top
    }, padding);
    const stacks = setLayoutDims(verticalBoxes.concat(horizontalBoxes), params);
    fitBoxes(boxes.fullSize, chartArea, params, stacks);
    fitBoxes(verticalBoxes, chartArea, params, stacks);
    if (fitBoxes(horizontalBoxes, chartArea, params, stacks)) {
      fitBoxes(verticalBoxes, chartArea, params, stacks);
    }
    handleMaxPadding(chartArea);
    placeBoxes(boxes.leftAndTop, chartArea, params, stacks);
    chartArea.x += chartArea.w;
    chartArea.y += chartArea.h;
    placeBoxes(boxes.rightAndBottom, chartArea, params, stacks);
    chart.chartArea = {
      left: chartArea.left,
      top: chartArea.top,
      right: chartArea.left + chartArea.w,
      bottom: chartArea.top + chartArea.h,
      height: chartArea.h,
      width: chartArea.w
    };
    each(boxes.chartArea, (layout) => {
      const box = layout.box;
      Object.assign(box, chart.chartArea);
      box.update(chartArea.w, chartArea.h, { left: 0, top: 0, right: 0, bottom: 0 });
    });
  }
};
class BasePlatform {
  acquireContext(canvas, aspectRatio) {
  }
  releaseContext(context) {
    return false;
  }
  addEventListener(chart, type, listener) {
  }
  removeEventListener(chart, type, listener) {
  }
  getDevicePixelRatio() {
    return 1;
  }
  getMaximumSize(element2, width, height, aspectRatio) {
    width = Math.max(0, width || element2.width);
    height = height || element2.height;
    return {
      width,
      height: Math.max(0, aspectRatio ? Math.floor(width / aspectRatio) : height)
    };
  }
  isAttached(canvas) {
    return true;
  }
  updateConfig(config) {
  }
}
__name(BasePlatform, "BasePlatform");
class BasicPlatform extends BasePlatform {
  acquireContext(item) {
    return item && item.getContext && item.getContext("2d") || null;
  }
  updateConfig(config) {
    config.options.animation = false;
  }
}
__name(BasicPlatform, "BasicPlatform");
const EXPANDO_KEY = "$chartjs";
const EVENT_TYPES = {
  touchstart: "mousedown",
  touchmove: "mousemove",
  touchend: "mouseup",
  pointerenter: "mouseenter",
  pointerdown: "mousedown",
  pointermove: "mousemove",
  pointerup: "mouseup",
  pointerleave: "mouseout",
  pointerout: "mouseout"
};
const isNullOrEmpty = /* @__PURE__ */ __name((value) => value === null || value === "", "isNullOrEmpty");
function initCanvas(canvas, aspectRatio) {
  const style = canvas.style;
  const renderHeight = canvas.getAttribute("height");
  const renderWidth = canvas.getAttribute("width");
  canvas[EXPANDO_KEY] = {
    initial: {
      height: renderHeight,
      width: renderWidth,
      style: {
        display: style.display,
        height: style.height,
        width: style.width
      }
    }
  };
  style.display = style.display || "block";
  style.boxSizing = style.boxSizing || "border-box";
  if (isNullOrEmpty(renderWidth)) {
    const displayWidth = readUsedSize(canvas, "width");
    if (displayWidth !== void 0) {
      canvas.width = displayWidth;
    }
  }
  if (isNullOrEmpty(renderHeight)) {
    if (canvas.style.height === "") {
      canvas.height = canvas.width / (aspectRatio || 2);
    } else {
      const displayHeight = readUsedSize(canvas, "height");
      if (displayHeight !== void 0) {
        canvas.height = displayHeight;
      }
    }
  }
  return canvas;
}
__name(initCanvas, "initCanvas");
const eventListenerOptions = supportsEventListenerOptions ? { passive: true } : false;
function addListener(node, type, listener) {
  node.addEventListener(type, listener, eventListenerOptions);
}
__name(addListener, "addListener");
function removeListener(chart, type, listener) {
  chart.canvas.removeEventListener(type, listener, eventListenerOptions);
}
__name(removeListener, "removeListener");
function fromNativeEvent(event, chart) {
  const type = EVENT_TYPES[event.type] || event.type;
  const { x, y } = getRelativePosition(event, chart);
  return {
    type,
    chart,
    native: event,
    x: x !== void 0 ? x : null,
    y: y !== void 0 ? y : null
  };
}
__name(fromNativeEvent, "fromNativeEvent");
function nodeListContains(nodeList, canvas) {
  for (const node of nodeList) {
    if (node === canvas || node.contains(canvas)) {
      return true;
    }
  }
}
__name(nodeListContains, "nodeListContains");
function createAttachObserver(chart, type, listener) {
  const canvas = chart.canvas;
  const observer = new MutationObserver((entries) => {
    let trigger = false;
    for (const entry of entries) {
      trigger = trigger || nodeListContains(entry.addedNodes, canvas);
      trigger = trigger && !nodeListContains(entry.removedNodes, canvas);
    }
    if (trigger) {
      listener();
    }
  });
  observer.observe(document, { childList: true, subtree: true });
  return observer;
}
__name(createAttachObserver, "createAttachObserver");
function createDetachObserver(chart, type, listener) {
  const canvas = chart.canvas;
  const observer = new MutationObserver((entries) => {
    let trigger = false;
    for (const entry of entries) {
      trigger = trigger || nodeListContains(entry.removedNodes, canvas);
      trigger = trigger && !nodeListContains(entry.addedNodes, canvas);
    }
    if (trigger) {
      listener();
    }
  });
  observer.observe(document, { childList: true, subtree: true });
  return observer;
}
__name(createDetachObserver, "createDetachObserver");
const drpListeningCharts = /* @__PURE__ */ new Map();
let oldDevicePixelRatio = 0;
function onWindowResize() {
  const dpr = window.devicePixelRatio;
  if (dpr === oldDevicePixelRatio) {
    return;
  }
  oldDevicePixelRatio = dpr;
  drpListeningCharts.forEach((resize, chart) => {
    if (chart.currentDevicePixelRatio !== dpr) {
      resize();
    }
  });
}
__name(onWindowResize, "onWindowResize");
function listenDevicePixelRatioChanges(chart, resize) {
  if (!drpListeningCharts.size) {
    window.addEventListener("resize", onWindowResize);
  }
  drpListeningCharts.set(chart, resize);
}
__name(listenDevicePixelRatioChanges, "listenDevicePixelRatioChanges");
function unlistenDevicePixelRatioChanges(chart) {
  drpListeningCharts.delete(chart);
  if (!drpListeningCharts.size) {
    window.removeEventListener("resize", onWindowResize);
  }
}
__name(unlistenDevicePixelRatioChanges, "unlistenDevicePixelRatioChanges");
function createResizeObserver(chart, type, listener) {
  const canvas = chart.canvas;
  const container = canvas && _getParentNode(canvas);
  if (!container) {
    return;
  }
  const resize = throttled((width, height) => {
    const w = container.clientWidth;
    listener(width, height);
    if (w < container.clientWidth) {
      listener();
    }
  }, window);
  const observer = new ResizeObserver((entries) => {
    const entry = entries[0];
    const width = entry.contentRect.width;
    const height = entry.contentRect.height;
    if (width === 0 && height === 0) {
      return;
    }
    resize(width, height);
  });
  observer.observe(container);
  listenDevicePixelRatioChanges(chart, resize);
  return observer;
}
__name(createResizeObserver, "createResizeObserver");
function releaseObserver(chart, type, observer) {
  if (observer) {
    observer.disconnect();
  }
  if (type === "resize") {
    unlistenDevicePixelRatioChanges(chart);
  }
}
__name(releaseObserver, "releaseObserver");
function createProxyAndListen(chart, type, listener) {
  const canvas = chart.canvas;
  const proxy = throttled((event) => {
    if (chart.ctx !== null) {
      listener(fromNativeEvent(event, chart));
    }
  }, chart, (args) => {
    const event = args[0];
    return [event, event.offsetX, event.offsetY];
  });
  addListener(canvas, type, proxy);
  return proxy;
}
__name(createProxyAndListen, "createProxyAndListen");
class DomPlatform extends BasePlatform {
  acquireContext(canvas, aspectRatio) {
    const context = canvas && canvas.getContext && canvas.getContext("2d");
    if (context && context.canvas === canvas) {
      initCanvas(canvas, aspectRatio);
      return context;
    }
    return null;
  }
  releaseContext(context) {
    const canvas = context.canvas;
    if (!canvas[EXPANDO_KEY]) {
      return false;
    }
    const initial = canvas[EXPANDO_KEY].initial;
    ["height", "width"].forEach((prop) => {
      const value = initial[prop];
      if (isNullOrUndef(value)) {
        canvas.removeAttribute(prop);
      } else {
        canvas.setAttribute(prop, value);
      }
    });
    const style = initial.style || {};
    Object.keys(style).forEach((key) => {
      canvas.style[key] = style[key];
    });
    canvas.width = canvas.width;
    delete canvas[EXPANDO_KEY];
    return true;
  }
  addEventListener(chart, type, listener) {
    this.removeEventListener(chart, type);
    const proxies = chart.$proxies || (chart.$proxies = {});
    const handlers = {
      attach: createAttachObserver,
      detach: createDetachObserver,
      resize: createResizeObserver
    };
    const handler = handlers[type] || createProxyAndListen;
    proxies[type] = handler(chart, type, listener);
  }
  removeEventListener(chart, type) {
    const proxies = chart.$proxies || (chart.$proxies = {});
    const proxy = proxies[type];
    if (!proxy) {
      return;
    }
    const handlers = {
      attach: releaseObserver,
      detach: releaseObserver,
      resize: releaseObserver
    };
    const handler = handlers[type] || removeListener;
    handler(chart, type, proxy);
    proxies[type] = void 0;
  }
  getDevicePixelRatio() {
    return window.devicePixelRatio;
  }
  getMaximumSize(canvas, width, height, aspectRatio) {
    return getMaximumSize(canvas, width, height, aspectRatio);
  }
  isAttached(canvas) {
    const container = _getParentNode(canvas);
    return !!(container && container.isConnected);
  }
}
__name(DomPlatform, "DomPlatform");
function _detectPlatform(canvas) {
  if (!_isDomSupported() || typeof OffscreenCanvas !== "undefined" && canvas instanceof OffscreenCanvas) {
    return BasicPlatform;
  }
  return DomPlatform;
}
__name(_detectPlatform, "_detectPlatform");
class PluginService {
  constructor() {
    this._init = [];
  }
  notify(chart, hook, args, filter) {
    if (hook === "beforeInit") {
      this._init = this._createDescriptors(chart, true);
      this._notify(this._init, chart, "install");
    }
    const descriptors2 = filter ? this._descriptors(chart).filter(filter) : this._descriptors(chart);
    const result = this._notify(descriptors2, chart, hook, args);
    if (hook === "afterDestroy") {
      this._notify(descriptors2, chart, "stop");
      this._notify(this._init, chart, "uninstall");
    }
    return result;
  }
  _notify(descriptors2, chart, hook, args) {
    args = args || {};
    for (const descriptor of descriptors2) {
      const plugin = descriptor.plugin;
      const method = plugin[hook];
      const params = [chart, args, descriptor.options];
      if (callback(method, params, plugin) === false && args.cancelable) {
        return false;
      }
    }
    return true;
  }
  invalidate() {
    if (!isNullOrUndef(this._cache)) {
      this._oldCache = this._cache;
      this._cache = void 0;
    }
  }
  _descriptors(chart) {
    if (this._cache) {
      return this._cache;
    }
    const descriptors2 = this._cache = this._createDescriptors(chart);
    this._notifyStateChanges(chart);
    return descriptors2;
  }
  _createDescriptors(chart, all) {
    const config = chart && chart.config;
    const options = valueOrDefault(config.options && config.options.plugins, {});
    const plugins2 = allPlugins(config);
    return options === false && !all ? [] : createDescriptors(chart, plugins2, options, all);
  }
  _notifyStateChanges(chart) {
    const previousDescriptors = this._oldCache || [];
    const descriptors2 = this._cache;
    const diff = /* @__PURE__ */ __name((a, b) => a.filter((x) => !b.some((y) => x.plugin.id === y.plugin.id)), "diff");
    this._notify(diff(previousDescriptors, descriptors2), chart, "stop");
    this._notify(diff(descriptors2, previousDescriptors), chart, "start");
  }
}
__name(PluginService, "PluginService");
function allPlugins(config) {
  const localIds = {};
  const plugins2 = [];
  const keys = Object.keys(registry.plugins.items);
  for (let i = 0; i < keys.length; i++) {
    plugins2.push(registry.getPlugin(keys[i]));
  }
  const local = config.plugins || [];
  for (let i = 0; i < local.length; i++) {
    const plugin = local[i];
    if (plugins2.indexOf(plugin) === -1) {
      plugins2.push(plugin);
      localIds[plugin.id] = true;
    }
  }
  return { plugins: plugins2, localIds };
}
__name(allPlugins, "allPlugins");
function getOpts(options, all) {
  if (!all && options === false) {
    return null;
  }
  if (options === true) {
    return {};
  }
  return options;
}
__name(getOpts, "getOpts");
function createDescriptors(chart, { plugins: plugins2, localIds }, options, all) {
  const result = [];
  const context = chart.getContext();
  for (const plugin of plugins2) {
    const id = plugin.id;
    const opts = getOpts(options[id], all);
    if (opts === null) {
      continue;
    }
    result.push({
      plugin,
      options: pluginOpts(chart.config, { plugin, local: localIds[id] }, opts, context)
    });
  }
  return result;
}
__name(createDescriptors, "createDescriptors");
function pluginOpts(config, { plugin, local }, opts, context) {
  const keys = config.pluginScopeKeys(plugin);
  const scopes = config.getOptionScopes(opts, keys);
  if (local && plugin.defaults) {
    scopes.push(plugin.defaults);
  }
  return config.createResolver(scopes, context, [""], {
    scriptable: false,
    indexable: false,
    allKeys: true
  });
}
__name(pluginOpts, "pluginOpts");
function getIndexAxis(type, options) {
  const datasetDefaults = defaults.datasets[type] || {};
  const datasetOptions = (options.datasets || {})[type] || {};
  return datasetOptions.indexAxis || options.indexAxis || datasetDefaults.indexAxis || "x";
}
__name(getIndexAxis, "getIndexAxis");
function getAxisFromDefaultScaleID(id, indexAxis) {
  let axis = id;
  if (id === "_index_") {
    axis = indexAxis;
  } else if (id === "_value_") {
    axis = indexAxis === "x" ? "y" : "x";
  }
  return axis;
}
__name(getAxisFromDefaultScaleID, "getAxisFromDefaultScaleID");
function getDefaultScaleIDFromAxis(axis, indexAxis) {
  return axis === indexAxis ? "_index_" : "_value_";
}
__name(getDefaultScaleIDFromAxis, "getDefaultScaleIDFromAxis");
function axisFromPosition(position) {
  if (position === "top" || position === "bottom") {
    return "x";
  }
  if (position === "left" || position === "right") {
    return "y";
  }
}
__name(axisFromPosition, "axisFromPosition");
function determineAxis(id, scaleOptions) {
  if (id === "x" || id === "y") {
    return id;
  }
  return scaleOptions.axis || axisFromPosition(scaleOptions.position) || id.charAt(0).toLowerCase();
}
__name(determineAxis, "determineAxis");
function mergeScaleConfig(config, options) {
  const chartDefaults = overrides[config.type] || { scales: {} };
  const configScales = options.scales || {};
  const chartIndexAxis = getIndexAxis(config.type, options);
  const firstIDs = /* @__PURE__ */ Object.create(null);
  const scales2 = /* @__PURE__ */ Object.create(null);
  Object.keys(configScales).forEach((id) => {
    const scaleConf = configScales[id];
    if (!isObject(scaleConf)) {
      return console.error(`Invalid scale configuration for scale: ${id}`);
    }
    if (scaleConf._proxy) {
      return console.warn(`Ignoring resolver passed as options for scale: ${id}`);
    }
    const axis = determineAxis(id, scaleConf);
    const defaultId = getDefaultScaleIDFromAxis(axis, chartIndexAxis);
    const defaultScaleOptions = chartDefaults.scales || {};
    firstIDs[axis] = firstIDs[axis] || id;
    scales2[id] = mergeIf(/* @__PURE__ */ Object.create(null), [{ axis }, scaleConf, defaultScaleOptions[axis], defaultScaleOptions[defaultId]]);
  });
  config.data.datasets.forEach((dataset) => {
    const type = dataset.type || config.type;
    const indexAxis = dataset.indexAxis || getIndexAxis(type, options);
    const datasetDefaults = overrides[type] || {};
    const defaultScaleOptions = datasetDefaults.scales || {};
    Object.keys(defaultScaleOptions).forEach((defaultID) => {
      const axis = getAxisFromDefaultScaleID(defaultID, indexAxis);
      const id = dataset[axis + "AxisID"] || firstIDs[axis] || axis;
      scales2[id] = scales2[id] || /* @__PURE__ */ Object.create(null);
      mergeIf(scales2[id], [{ axis }, configScales[id], defaultScaleOptions[defaultID]]);
    });
  });
  Object.keys(scales2).forEach((key) => {
    const scale = scales2[key];
    mergeIf(scale, [defaults.scales[scale.type], defaults.scale]);
  });
  return scales2;
}
__name(mergeScaleConfig, "mergeScaleConfig");
function initOptions(config) {
  const options = config.options || (config.options = {});
  options.plugins = valueOrDefault(options.plugins, {});
  options.scales = mergeScaleConfig(config, options);
}
__name(initOptions, "initOptions");
function initData(data) {
  data = data || {};
  data.datasets = data.datasets || [];
  data.labels = data.labels || [];
  return data;
}
__name(initData, "initData");
function initConfig(config) {
  config = config || {};
  config.data = initData(config.data);
  initOptions(config);
  return config;
}
__name(initConfig, "initConfig");
const keyCache = /* @__PURE__ */ new Map();
const keysCached = /* @__PURE__ */ new Set();
function cachedKeys(cacheKey, generate) {
  let keys = keyCache.get(cacheKey);
  if (!keys) {
    keys = generate();
    keyCache.set(cacheKey, keys);
    keysCached.add(keys);
  }
  return keys;
}
__name(cachedKeys, "cachedKeys");
const addIfFound = /* @__PURE__ */ __name((set2, obj, key) => {
  const opts = resolveObjectKey(obj, key);
  if (opts !== void 0) {
    set2.add(opts);
  }
}, "addIfFound");
class Config {
  constructor(config) {
    this._config = initConfig(config);
    this._scopeCache = /* @__PURE__ */ new Map();
    this._resolverCache = /* @__PURE__ */ new Map();
  }
  get platform() {
    return this._config.platform;
  }
  get type() {
    return this._config.type;
  }
  set type(type) {
    this._config.type = type;
  }
  get data() {
    return this._config.data;
  }
  set data(data) {
    this._config.data = initData(data);
  }
  get options() {
    return this._config.options;
  }
  set options(options) {
    this._config.options = options;
  }
  get plugins() {
    return this._config.plugins;
  }
  update() {
    const config = this._config;
    this.clearCache();
    initOptions(config);
  }
  clearCache() {
    this._scopeCache.clear();
    this._resolverCache.clear();
  }
  datasetScopeKeys(datasetType) {
    return cachedKeys(
      datasetType,
      () => [[
        `datasets.${datasetType}`,
        ""
      ]]
    );
  }
  datasetAnimationScopeKeys(datasetType, transition) {
    return cachedKeys(
      `${datasetType}.transition.${transition}`,
      () => [
        [
          `datasets.${datasetType}.transitions.${transition}`,
          `transitions.${transition}`
        ],
        [
          `datasets.${datasetType}`,
          ""
        ]
      ]
    );
  }
  datasetElementScopeKeys(datasetType, elementType) {
    return cachedKeys(
      `${datasetType}-${elementType}`,
      () => [[
        `datasets.${datasetType}.elements.${elementType}`,
        `datasets.${datasetType}`,
        `elements.${elementType}`,
        ""
      ]]
    );
  }
  pluginScopeKeys(plugin) {
    const id = plugin.id;
    const type = this.type;
    return cachedKeys(
      `${type}-plugin-${id}`,
      () => [[
        `plugins.${id}`,
        ...plugin.additionalOptionScopes || []
      ]]
    );
  }
  _cachedScopes(mainScope, resetCache) {
    const _scopeCache = this._scopeCache;
    let cache = _scopeCache.get(mainScope);
    if (!cache || resetCache) {
      cache = /* @__PURE__ */ new Map();
      _scopeCache.set(mainScope, cache);
    }
    return cache;
  }
  getOptionScopes(mainScope, keyLists, resetCache) {
    const { options, type } = this;
    const cache = this._cachedScopes(mainScope, resetCache);
    const cached = cache.get(keyLists);
    if (cached) {
      return cached;
    }
    const scopes = /* @__PURE__ */ new Set();
    keyLists.forEach((keys) => {
      if (mainScope) {
        scopes.add(mainScope);
        keys.forEach((key) => addIfFound(scopes, mainScope, key));
      }
      keys.forEach((key) => addIfFound(scopes, options, key));
      keys.forEach((key) => addIfFound(scopes, overrides[type] || {}, key));
      keys.forEach((key) => addIfFound(scopes, defaults, key));
      keys.forEach((key) => addIfFound(scopes, descriptors, key));
    });
    const array = Array.from(scopes);
    if (array.length === 0) {
      array.push(/* @__PURE__ */ Object.create(null));
    }
    if (keysCached.has(keyLists)) {
      cache.set(keyLists, array);
    }
    return array;
  }
  chartOptionScopes() {
    const { options, type } = this;
    return [
      options,
      overrides[type] || {},
      defaults.datasets[type] || {},
      { type },
      defaults,
      descriptors
    ];
  }
  resolveNamedOptions(scopes, names2, context, prefixes = [""]) {
    const result = { $shared: true };
    const { resolver, subPrefixes } = getResolver(this._resolverCache, scopes, prefixes);
    let options = resolver;
    if (needContext(resolver, names2)) {
      result.$shared = false;
      context = isFunction(context) ? context() : context;
      const subResolver = this.createResolver(scopes, context, subPrefixes);
      options = _attachContext(resolver, context, subResolver);
    }
    for (const prop of names2) {
      result[prop] = options[prop];
    }
    return result;
  }
  createResolver(scopes, context, prefixes = [""], descriptorDefaults) {
    const { resolver } = getResolver(this._resolverCache, scopes, prefixes);
    return isObject(context) ? _attachContext(resolver, context, void 0, descriptorDefaults) : resolver;
  }
}
__name(Config, "Config");
function getResolver(resolverCache, scopes, prefixes) {
  let cache = resolverCache.get(scopes);
  if (!cache) {
    cache = /* @__PURE__ */ new Map();
    resolverCache.set(scopes, cache);
  }
  const cacheKey = prefixes.join();
  let cached = cache.get(cacheKey);
  if (!cached) {
    const resolver = _createResolver(scopes, prefixes);
    cached = {
      resolver,
      subPrefixes: prefixes.filter((p) => !p.toLowerCase().includes("hover"))
    };
    cache.set(cacheKey, cached);
  }
  return cached;
}
__name(getResolver, "getResolver");
const hasFunction = /* @__PURE__ */ __name((value) => isObject(value) && Object.getOwnPropertyNames(value).reduce((acc, key) => acc || isFunction(value[key]), false), "hasFunction");
function needContext(proxy, names2) {
  const { isScriptable, isIndexable } = _descriptors(proxy);
  for (const prop of names2) {
    const scriptable = isScriptable(prop);
    const indexable = isIndexable(prop);
    const value = (indexable || scriptable) && proxy[prop];
    if (scriptable && (isFunction(value) || hasFunction(value)) || indexable && isArray(value)) {
      return true;
    }
  }
  return false;
}
__name(needContext, "needContext");
var version = "3.9.1";
const KNOWN_POSITIONS = ["top", "bottom", "left", "right", "chartArea"];
function positionIsHorizontal(position, axis) {
  return position === "top" || position === "bottom" || KNOWN_POSITIONS.indexOf(position) === -1 && axis === "x";
}
__name(positionIsHorizontal, "positionIsHorizontal");
function compare2Level(l1, l2) {
  return function(a, b) {
    return a[l1] === b[l1] ? a[l2] - b[l2] : a[l1] - b[l1];
  };
}
__name(compare2Level, "compare2Level");
function onAnimationsComplete(context) {
  const chart = context.chart;
  const animationOptions2 = chart.options.animation;
  chart.notifyPlugins("afterRender");
  callback(animationOptions2 && animationOptions2.onComplete, [context], chart);
}
__name(onAnimationsComplete, "onAnimationsComplete");
function onAnimationProgress(context) {
  const chart = context.chart;
  const animationOptions2 = chart.options.animation;
  callback(animationOptions2 && animationOptions2.onProgress, [context], chart);
}
__name(onAnimationProgress, "onAnimationProgress");
function getCanvas(item) {
  if (_isDomSupported() && typeof item === "string") {
    item = document.getElementById(item);
  } else if (item && item.length) {
    item = item[0];
  }
  if (item && item.canvas) {
    item = item.canvas;
  }
  return item;
}
__name(getCanvas, "getCanvas");
const instances = {};
const getChart = /* @__PURE__ */ __name((key) => {
  const canvas = getCanvas(key);
  return Object.values(instances).filter((c) => c.canvas === canvas).pop();
}, "getChart");
function moveNumericKeys(obj, start, move) {
  const keys = Object.keys(obj);
  for (const key of keys) {
    const intKey = +key;
    if (intKey >= start) {
      const value = obj[key];
      delete obj[key];
      if (move > 0 || intKey > start) {
        obj[intKey + move] = value;
      }
    }
  }
}
__name(moveNumericKeys, "moveNumericKeys");
function determineLastEvent(e, lastEvent, inChartArea, isClick) {
  if (!inChartArea || e.type === "mouseout") {
    return null;
  }
  if (isClick) {
    return lastEvent;
  }
  return e;
}
__name(determineLastEvent, "determineLastEvent");
class Chart {
  constructor(item, userConfig) {
    const config = this.config = new Config(userConfig);
    const initialCanvas = getCanvas(item);
    const existingChart = getChart(initialCanvas);
    if (existingChart) {
      throw new Error(
        "Canvas is already in use. Chart with ID '" + existingChart.id + "' must be destroyed before the canvas with ID '" + existingChart.canvas.id + "' can be reused."
      );
    }
    const options = config.createResolver(config.chartOptionScopes(), this.getContext());
    this.platform = new (config.platform || _detectPlatform(initialCanvas))();
    this.platform.updateConfig(config);
    const context = this.platform.acquireContext(initialCanvas, options.aspectRatio);
    const canvas = context && context.canvas;
    const height = canvas && canvas.height;
    const width = canvas && canvas.width;
    this.id = uid();
    this.ctx = context;
    this.canvas = canvas;
    this.width = width;
    this.height = height;
    this._options = options;
    this._aspectRatio = this.aspectRatio;
    this._layers = [];
    this._metasets = [];
    this._stacks = void 0;
    this.boxes = [];
    this.currentDevicePixelRatio = void 0;
    this.chartArea = void 0;
    this._active = [];
    this._lastEvent = void 0;
    this._listeners = {};
    this._responsiveListeners = void 0;
    this._sortedMetasets = [];
    this.scales = {};
    this._plugins = new PluginService();
    this.$proxies = {};
    this._hiddenIndices = {};
    this.attached = false;
    this._animationsDisabled = void 0;
    this.$context = void 0;
    this._doResize = debounce((mode) => this.update(mode), options.resizeDelay || 0);
    this._dataChanges = [];
    instances[this.id] = this;
    if (!context || !canvas) {
      console.error("Failed to create chart: can't acquire context from the given item");
      return;
    }
    animator.listen(this, "complete", onAnimationsComplete);
    animator.listen(this, "progress", onAnimationProgress);
    this._initialize();
    if (this.attached) {
      this.update();
    }
  }
  get aspectRatio() {
    const { options: { aspectRatio, maintainAspectRatio }, width, height, _aspectRatio } = this;
    if (!isNullOrUndef(aspectRatio)) {
      return aspectRatio;
    }
    if (maintainAspectRatio && _aspectRatio) {
      return _aspectRatio;
    }
    return height ? width / height : null;
  }
  get data() {
    return this.config.data;
  }
  set data(data) {
    this.config.data = data;
  }
  get options() {
    return this._options;
  }
  set options(options) {
    this.config.options = options;
  }
  _initialize() {
    this.notifyPlugins("beforeInit");
    if (this.options.responsive) {
      this.resize();
    } else {
      retinaScale(this, this.options.devicePixelRatio);
    }
    this.bindEvents();
    this.notifyPlugins("afterInit");
    return this;
  }
  clear() {
    clearCanvas(this.canvas, this.ctx);
    return this;
  }
  stop() {
    animator.stop(this);
    return this;
  }
  resize(width, height) {
    if (!animator.running(this)) {
      this._resize(width, height);
    } else {
      this._resizeBeforeDraw = { width, height };
    }
  }
  _resize(width, height) {
    const options = this.options;
    const canvas = this.canvas;
    const aspectRatio = options.maintainAspectRatio && this.aspectRatio;
    const newSize = this.platform.getMaximumSize(canvas, width, height, aspectRatio);
    const newRatio = options.devicePixelRatio || this.platform.getDevicePixelRatio();
    const mode = this.width ? "resize" : "attach";
    this.width = newSize.width;
    this.height = newSize.height;
    this._aspectRatio = this.aspectRatio;
    if (!retinaScale(this, newRatio, true)) {
      return;
    }
    this.notifyPlugins("resize", { size: newSize });
    callback(options.onResize, [this, newSize], this);
    if (this.attached) {
      if (this._doResize(mode)) {
        this.render();
      }
    }
  }
  ensureScalesHaveIDs() {
    const options = this.options;
    const scalesOptions = options.scales || {};
    each(scalesOptions, (axisOptions, axisID) => {
      axisOptions.id = axisID;
    });
  }
  buildOrUpdateScales() {
    const options = this.options;
    const scaleOpts = options.scales;
    const scales2 = this.scales;
    const updated = Object.keys(scales2).reduce((obj, id) => {
      obj[id] = false;
      return obj;
    }, {});
    let items = [];
    if (scaleOpts) {
      items = items.concat(
        Object.keys(scaleOpts).map((id) => {
          const scaleOptions = scaleOpts[id];
          const axis = determineAxis(id, scaleOptions);
          const isRadial = axis === "r";
          const isHorizontal = axis === "x";
          return {
            options: scaleOptions,
            dposition: isRadial ? "chartArea" : isHorizontal ? "bottom" : "left",
            dtype: isRadial ? "radialLinear" : isHorizontal ? "category" : "linear"
          };
        })
      );
    }
    each(items, (item) => {
      const scaleOptions = item.options;
      const id = scaleOptions.id;
      const axis = determineAxis(id, scaleOptions);
      const scaleType = valueOrDefault(scaleOptions.type, item.dtype);
      if (scaleOptions.position === void 0 || positionIsHorizontal(scaleOptions.position, axis) !== positionIsHorizontal(item.dposition)) {
        scaleOptions.position = item.dposition;
      }
      updated[id] = true;
      let scale = null;
      if (id in scales2 && scales2[id].type === scaleType) {
        scale = scales2[id];
      } else {
        const scaleClass = registry.getScale(scaleType);
        scale = new scaleClass({
          id,
          type: scaleType,
          ctx: this.ctx,
          chart: this
        });
        scales2[scale.id] = scale;
      }
      scale.init(scaleOptions, options);
    });
    each(updated, (hasUpdated, id) => {
      if (!hasUpdated) {
        delete scales2[id];
      }
    });
    each(scales2, (scale) => {
      layouts.configure(this, scale, scale.options);
      layouts.addBox(this, scale);
    });
  }
  _updateMetasets() {
    const metasets = this._metasets;
    const numData = this.data.datasets.length;
    const numMeta = metasets.length;
    metasets.sort((a, b) => a.index - b.index);
    if (numMeta > numData) {
      for (let i = numData; i < numMeta; ++i) {
        this._destroyDatasetMeta(i);
      }
      metasets.splice(numData, numMeta - numData);
    }
    this._sortedMetasets = metasets.slice(0).sort(compare2Level("order", "index"));
  }
  _removeUnreferencedMetasets() {
    const { _metasets: metasets, data: { datasets } } = this;
    if (metasets.length > datasets.length) {
      delete this._stacks;
    }
    metasets.forEach((meta, index2) => {
      if (datasets.filter((x) => x === meta._dataset).length === 0) {
        this._destroyDatasetMeta(index2);
      }
    });
  }
  buildOrUpdateControllers() {
    const newControllers = [];
    const datasets = this.data.datasets;
    let i, ilen;
    this._removeUnreferencedMetasets();
    for (i = 0, ilen = datasets.length; i < ilen; i++) {
      const dataset = datasets[i];
      let meta = this.getDatasetMeta(i);
      const type = dataset.type || this.config.type;
      if (meta.type && meta.type !== type) {
        this._destroyDatasetMeta(i);
        meta = this.getDatasetMeta(i);
      }
      meta.type = type;
      meta.indexAxis = dataset.indexAxis || getIndexAxis(type, this.options);
      meta.order = dataset.order || 0;
      meta.index = i;
      meta.label = "" + dataset.label;
      meta.visible = this.isDatasetVisible(i);
      if (meta.controller) {
        meta.controller.updateIndex(i);
        meta.controller.linkScales();
      } else {
        const ControllerClass = registry.getController(type);
        const { datasetElementType, dataElementType } = defaults.datasets[type];
        Object.assign(ControllerClass.prototype, {
          dataElementType: registry.getElement(dataElementType),
          datasetElementType: datasetElementType && registry.getElement(datasetElementType)
        });
        meta.controller = new ControllerClass(this, i);
        newControllers.push(meta.controller);
      }
    }
    this._updateMetasets();
    return newControllers;
  }
  _resetElements() {
    each(this.data.datasets, (dataset, datasetIndex) => {
      this.getDatasetMeta(datasetIndex).controller.reset();
    }, this);
  }
  reset() {
    this._resetElements();
    this.notifyPlugins("reset");
  }
  update(mode) {
    const config = this.config;
    config.update();
    const options = this._options = config.createResolver(config.chartOptionScopes(), this.getContext());
    const animsDisabled = this._animationsDisabled = !options.animation;
    this._updateScales();
    this._checkEventBindings();
    this._updateHiddenIndices();
    this._plugins.invalidate();
    if (this.notifyPlugins("beforeUpdate", { mode, cancelable: true }) === false) {
      return;
    }
    const newControllers = this.buildOrUpdateControllers();
    this.notifyPlugins("beforeElementsUpdate");
    let minPadding = 0;
    for (let i = 0, ilen = this.data.datasets.length; i < ilen; i++) {
      const { controller } = this.getDatasetMeta(i);
      const reset = !animsDisabled && newControllers.indexOf(controller) === -1;
      controller.buildOrUpdateElements(reset);
      minPadding = Math.max(+controller.getMaxOverflow(), minPadding);
    }
    minPadding = this._minPadding = options.layout.autoPadding ? minPadding : 0;
    this._updateLayout(minPadding);
    if (!animsDisabled) {
      each(newControllers, (controller) => {
        controller.reset();
      });
    }
    this._updateDatasets(mode);
    this.notifyPlugins("afterUpdate", { mode });
    this._layers.sort(compare2Level("z", "_idx"));
    const { _active, _lastEvent } = this;
    if (_lastEvent) {
      this._eventHandler(_lastEvent, true);
    } else if (_active.length) {
      this._updateHoverStyles(_active, _active, true);
    }
    this.render();
  }
  _updateScales() {
    each(this.scales, (scale) => {
      layouts.removeBox(this, scale);
    });
    this.ensureScalesHaveIDs();
    this.buildOrUpdateScales();
  }
  _checkEventBindings() {
    const options = this.options;
    const existingEvents = new Set(Object.keys(this._listeners));
    const newEvents = new Set(options.events);
    if (!setsEqual(existingEvents, newEvents) || !!this._responsiveListeners !== options.responsive) {
      this.unbindEvents();
      this.bindEvents();
    }
  }
  _updateHiddenIndices() {
    const { _hiddenIndices } = this;
    const changes = this._getUniformDataChanges() || [];
    for (const { method, start, count } of changes) {
      const move = method === "_removeElements" ? -count : count;
      moveNumericKeys(_hiddenIndices, start, move);
    }
  }
  _getUniformDataChanges() {
    const _dataChanges = this._dataChanges;
    if (!_dataChanges || !_dataChanges.length) {
      return;
    }
    this._dataChanges = [];
    const datasetCount = this.data.datasets.length;
    const makeSet = /* @__PURE__ */ __name((idx) => new Set(
      _dataChanges.filter((c) => c[0] === idx).map((c, i) => i + "," + c.splice(1).join(","))
    ), "makeSet");
    const changeSet = makeSet(0);
    for (let i = 1; i < datasetCount; i++) {
      if (!setsEqual(changeSet, makeSet(i))) {
        return;
      }
    }
    return Array.from(changeSet).map((c) => c.split(",")).map((a) => ({ method: a[1], start: +a[2], count: +a[3] }));
  }
  _updateLayout(minPadding) {
    if (this.notifyPlugins("beforeLayout", { cancelable: true }) === false) {
      return;
    }
    layouts.update(this, this.width, this.height, minPadding);
    const area = this.chartArea;
    const noArea = area.width <= 0 || area.height <= 0;
    this._layers = [];
    each(this.boxes, (box) => {
      if (noArea && box.position === "chartArea") {
        return;
      }
      if (box.configure) {
        box.configure();
      }
      this._layers.push(...box._layers());
    }, this);
    this._layers.forEach((item, index2) => {
      item._idx = index2;
    });
    this.notifyPlugins("afterLayout");
  }
  _updateDatasets(mode) {
    if (this.notifyPlugins("beforeDatasetsUpdate", { mode, cancelable: true }) === false) {
      return;
    }
    for (let i = 0, ilen = this.data.datasets.length; i < ilen; ++i) {
      this.getDatasetMeta(i).controller.configure();
    }
    for (let i = 0, ilen = this.data.datasets.length; i < ilen; ++i) {
      this._updateDataset(i, isFunction(mode) ? mode({ datasetIndex: i }) : mode);
    }
    this.notifyPlugins("afterDatasetsUpdate", { mode });
  }
  _updateDataset(index2, mode) {
    const meta = this.getDatasetMeta(index2);
    const args = { meta, index: index2, mode, cancelable: true };
    if (this.notifyPlugins("beforeDatasetUpdate", args) === false) {
      return;
    }
    meta.controller._update(mode);
    args.cancelable = false;
    this.notifyPlugins("afterDatasetUpdate", args);
  }
  render() {
    if (this.notifyPlugins("beforeRender", { cancelable: true }) === false) {
      return;
    }
    if (animator.has(this)) {
      if (this.attached && !animator.running(this)) {
        animator.start(this);
      }
    } else {
      this.draw();
      onAnimationsComplete({ chart: this });
    }
  }
  draw() {
    let i;
    if (this._resizeBeforeDraw) {
      const { width, height } = this._resizeBeforeDraw;
      this._resize(width, height);
      this._resizeBeforeDraw = null;
    }
    this.clear();
    if (this.width <= 0 || this.height <= 0) {
      return;
    }
    if (this.notifyPlugins("beforeDraw", { cancelable: true }) === false) {
      return;
    }
    const layers = this._layers;
    for (i = 0; i < layers.length && layers[i].z <= 0; ++i) {
      layers[i].draw(this.chartArea);
    }
    this._drawDatasets();
    for (; i < layers.length; ++i) {
      layers[i].draw(this.chartArea);
    }
    this.notifyPlugins("afterDraw");
  }
  _getSortedDatasetMetas(filterVisible) {
    const metasets = this._sortedMetasets;
    const result = [];
    let i, ilen;
    for (i = 0, ilen = metasets.length; i < ilen; ++i) {
      const meta = metasets[i];
      if (!filterVisible || meta.visible) {
        result.push(meta);
      }
    }
    return result;
  }
  getSortedVisibleDatasetMetas() {
    return this._getSortedDatasetMetas(true);
  }
  _drawDatasets() {
    if (this.notifyPlugins("beforeDatasetsDraw", { cancelable: true }) === false) {
      return;
    }
    const metasets = this.getSortedVisibleDatasetMetas();
    for (let i = metasets.length - 1; i >= 0; --i) {
      this._drawDataset(metasets[i]);
    }
    this.notifyPlugins("afterDatasetsDraw");
  }
  _drawDataset(meta) {
    const ctx = this.ctx;
    const clip = meta._clip;
    const useClip = !clip.disabled;
    const area = this.chartArea;
    const args = {
      meta,
      index: meta.index,
      cancelable: true
    };
    if (this.notifyPlugins("beforeDatasetDraw", args) === false) {
      return;
    }
    if (useClip) {
      clipArea(ctx, {
        left: clip.left === false ? 0 : area.left - clip.left,
        right: clip.right === false ? this.width : area.right + clip.right,
        top: clip.top === false ? 0 : area.top - clip.top,
        bottom: clip.bottom === false ? this.height : area.bottom + clip.bottom
      });
    }
    meta.controller.draw();
    if (useClip) {
      unclipArea(ctx);
    }
    args.cancelable = false;
    this.notifyPlugins("afterDatasetDraw", args);
  }
  isPointInArea(point) {
    return _isPointInArea(point, this.chartArea, this._minPadding);
  }
  getElementsAtEventForMode(e, mode, options, useFinalPosition) {
    const method = Interaction.modes[mode];
    if (typeof method === "function") {
      return method(this, e, options, useFinalPosition);
    }
    return [];
  }
  getDatasetMeta(datasetIndex) {
    const dataset = this.data.datasets[datasetIndex];
    const metasets = this._metasets;
    let meta = metasets.filter((x) => x && x._dataset === dataset).pop();
    if (!meta) {
      meta = {
        type: null,
        data: [],
        dataset: null,
        controller: null,
        hidden: null,
        xAxisID: null,
        yAxisID: null,
        order: dataset && dataset.order || 0,
        index: datasetIndex,
        _dataset: dataset,
        _parsed: [],
        _sorted: false
      };
      metasets.push(meta);
    }
    return meta;
  }
  getContext() {
    return this.$context || (this.$context = createContext(null, { chart: this, type: "chart" }));
  }
  getVisibleDatasetCount() {
    return this.getSortedVisibleDatasetMetas().length;
  }
  isDatasetVisible(datasetIndex) {
    const dataset = this.data.datasets[datasetIndex];
    if (!dataset) {
      return false;
    }
    const meta = this.getDatasetMeta(datasetIndex);
    return typeof meta.hidden === "boolean" ? !meta.hidden : !dataset.hidden;
  }
  setDatasetVisibility(datasetIndex, visible) {
    const meta = this.getDatasetMeta(datasetIndex);
    meta.hidden = !visible;
  }
  toggleDataVisibility(index2) {
    this._hiddenIndices[index2] = !this._hiddenIndices[index2];
  }
  getDataVisibility(index2) {
    return !this._hiddenIndices[index2];
  }
  _updateVisibility(datasetIndex, dataIndex, visible) {
    const mode = visible ? "show" : "hide";
    const meta = this.getDatasetMeta(datasetIndex);
    const anims = meta.controller._resolveAnimations(void 0, mode);
    if (defined(dataIndex)) {
      meta.data[dataIndex].hidden = !visible;
      this.update();
    } else {
      this.setDatasetVisibility(datasetIndex, visible);
      anims.update(meta, { visible });
      this.update((ctx) => ctx.datasetIndex === datasetIndex ? mode : void 0);
    }
  }
  hide(datasetIndex, dataIndex) {
    this._updateVisibility(datasetIndex, dataIndex, false);
  }
  show(datasetIndex, dataIndex) {
    this._updateVisibility(datasetIndex, dataIndex, true);
  }
  _destroyDatasetMeta(datasetIndex) {
    const meta = this._metasets[datasetIndex];
    if (meta && meta.controller) {
      meta.controller._destroy();
    }
    delete this._metasets[datasetIndex];
  }
  _stop() {
    let i, ilen;
    this.stop();
    animator.remove(this);
    for (i = 0, ilen = this.data.datasets.length; i < ilen; ++i) {
      this._destroyDatasetMeta(i);
    }
  }
  destroy() {
    this.notifyPlugins("beforeDestroy");
    const { canvas, ctx } = this;
    this._stop();
    this.config.clearCache();
    if (canvas) {
      this.unbindEvents();
      clearCanvas(canvas, ctx);
      this.platform.releaseContext(ctx);
      this.canvas = null;
      this.ctx = null;
    }
    this.notifyPlugins("destroy");
    delete instances[this.id];
    this.notifyPlugins("afterDestroy");
  }
  toBase64Image(...args) {
    return this.canvas.toDataURL(...args);
  }
  bindEvents() {
    this.bindUserEvents();
    if (this.options.responsive) {
      this.bindResponsiveEvents();
    } else {
      this.attached = true;
    }
  }
  bindUserEvents() {
    const listeners = this._listeners;
    const platform = this.platform;
    const _add = /* @__PURE__ */ __name((type, listener2) => {
      platform.addEventListener(this, type, listener2);
      listeners[type] = listener2;
    }, "_add");
    const listener = /* @__PURE__ */ __name((e, x, y) => {
      e.offsetX = x;
      e.offsetY = y;
      this._eventHandler(e);
    }, "listener");
    each(this.options.events, (type) => _add(type, listener));
  }
  bindResponsiveEvents() {
    if (!this._responsiveListeners) {
      this._responsiveListeners = {};
    }
    const listeners = this._responsiveListeners;
    const platform = this.platform;
    const _add = /* @__PURE__ */ __name((type, listener2) => {
      platform.addEventListener(this, type, listener2);
      listeners[type] = listener2;
    }, "_add");
    const _remove = /* @__PURE__ */ __name((type, listener2) => {
      if (listeners[type]) {
        platform.removeEventListener(this, type, listener2);
        delete listeners[type];
      }
    }, "_remove");
    const listener = /* @__PURE__ */ __name((width, height) => {
      if (this.canvas) {
        this.resize(width, height);
      }
    }, "listener");
    let detached;
    const attached = /* @__PURE__ */ __name(() => {
      _remove("attach", attached);
      this.attached = true;
      this.resize();
      _add("resize", listener);
      _add("detach", detached);
    }, "attached");
    detached = /* @__PURE__ */ __name(() => {
      this.attached = false;
      _remove("resize", listener);
      this._stop();
      this._resize(0, 0);
      _add("attach", attached);
    }, "detached");
    if (platform.isAttached(this.canvas)) {
      attached();
    } else {
      detached();
    }
  }
  unbindEvents() {
    each(this._listeners, (listener, type) => {
      this.platform.removeEventListener(this, type, listener);
    });
    this._listeners = {};
    each(this._responsiveListeners, (listener, type) => {
      this.platform.removeEventListener(this, type, listener);
    });
    this._responsiveListeners = void 0;
  }
  updateHoverStyle(items, mode, enabled) {
    const prefix = enabled ? "set" : "remove";
    let meta, item, i, ilen;
    if (mode === "dataset") {
      meta = this.getDatasetMeta(items[0].datasetIndex);
      meta.controller["_" + prefix + "DatasetHoverStyle"]();
    }
    for (i = 0, ilen = items.length; i < ilen; ++i) {
      item = items[i];
      const controller = item && this.getDatasetMeta(item.datasetIndex).controller;
      if (controller) {
        controller[prefix + "HoverStyle"](item.element, item.datasetIndex, item.index);
      }
    }
  }
  getActiveElements() {
    return this._active || [];
  }
  setActiveElements(activeElements) {
    const lastActive = this._active || [];
    const active2 = activeElements.map(({ datasetIndex, index: index2 }) => {
      const meta = this.getDatasetMeta(datasetIndex);
      if (!meta) {
        throw new Error("No dataset found at index " + datasetIndex);
      }
      return {
        datasetIndex,
        element: meta.data[index2],
        index: index2
      };
    });
    const changed = !_elementsEqual(active2, lastActive);
    if (changed) {
      this._active = active2;
      this._lastEvent = null;
      this._updateHoverStyles(active2, lastActive);
    }
  }
  notifyPlugins(hook, args, filter) {
    return this._plugins.notify(this, hook, args, filter);
  }
  _updateHoverStyles(active2, lastActive, replay) {
    const hoverOptions = this.options.hover;
    const diff = /* @__PURE__ */ __name((a, b) => a.filter((x) => !b.some((y) => x.datasetIndex === y.datasetIndex && x.index === y.index)), "diff");
    const deactivated = diff(lastActive, active2);
    const activated = replay ? active2 : diff(active2, lastActive);
    if (deactivated.length) {
      this.updateHoverStyle(deactivated, hoverOptions.mode, false);
    }
    if (activated.length && hoverOptions.mode) {
      this.updateHoverStyle(activated, hoverOptions.mode, true);
    }
  }
  _eventHandler(e, replay) {
    const args = {
      event: e,
      replay,
      cancelable: true,
      inChartArea: this.isPointInArea(e)
    };
    const eventFilter = /* @__PURE__ */ __name((plugin) => (plugin.options.events || this.options.events).includes(e.native.type), "eventFilter");
    if (this.notifyPlugins("beforeEvent", args, eventFilter) === false) {
      return;
    }
    const changed = this._handleEvent(e, replay, args.inChartArea);
    args.cancelable = false;
    this.notifyPlugins("afterEvent", args, eventFilter);
    if (changed || args.changed) {
      this.render();
    }
    return this;
  }
  _handleEvent(e, replay, inChartArea) {
    const { _active: lastActive = [], options } = this;
    const useFinalPosition = replay;
    const active2 = this._getActiveElements(e, lastActive, inChartArea, useFinalPosition);
    const isClick = _isClickEvent(e);
    const lastEvent = determineLastEvent(e, this._lastEvent, inChartArea, isClick);
    if (inChartArea) {
      this._lastEvent = null;
      callback(options.onHover, [e, active2, this], this);
      if (isClick) {
        callback(options.onClick, [e, active2, this], this);
      }
    }
    const changed = !_elementsEqual(active2, lastActive);
    if (changed || replay) {
      this._active = active2;
      this._updateHoverStyles(active2, lastActive, replay);
    }
    this._lastEvent = lastEvent;
    return changed;
  }
  _getActiveElements(e, lastActive, inChartArea, useFinalPosition) {
    if (e.type === "mouseout") {
      return [];
    }
    if (!inChartArea) {
      return lastActive;
    }
    const hoverOptions = this.options.hover;
    return this.getElementsAtEventForMode(e, hoverOptions.mode, hoverOptions, useFinalPosition);
  }
}
__name(Chart, "Chart");
const invalidatePlugins = /* @__PURE__ */ __name(() => each(Chart.instances, (chart) => chart._plugins.invalidate()), "invalidatePlugins");
const enumerable = true;
Object.defineProperties(Chart, {
  defaults: {
    enumerable,
    value: defaults
  },
  instances: {
    enumerable,
    value: instances
  },
  overrides: {
    enumerable,
    value: overrides
  },
  registry: {
    enumerable,
    value: registry
  },
  version: {
    enumerable,
    value: version
  },
  getChart: {
    enumerable,
    value: getChart
  },
  register: {
    enumerable,
    value: (...items) => {
      registry.add(...items);
      invalidatePlugins();
    }
  },
  unregister: {
    enumerable,
    value: (...items) => {
      registry.remove(...items);
      invalidatePlugins();
    }
  }
});
function clipArc(ctx, element2, endAngle) {
  const { startAngle, pixelMargin, x, y, outerRadius, innerRadius } = element2;
  let angleMargin = pixelMargin / outerRadius;
  ctx.beginPath();
  ctx.arc(x, y, outerRadius, startAngle - angleMargin, endAngle + angleMargin);
  if (innerRadius > pixelMargin) {
    angleMargin = pixelMargin / innerRadius;
    ctx.arc(x, y, innerRadius, endAngle + angleMargin, startAngle - angleMargin, true);
  } else {
    ctx.arc(x, y, pixelMargin, endAngle + HALF_PI, startAngle - HALF_PI);
  }
  ctx.closePath();
  ctx.clip();
}
__name(clipArc, "clipArc");
function toRadiusCorners(value) {
  return _readValueToProps(value, ["outerStart", "outerEnd", "innerStart", "innerEnd"]);
}
__name(toRadiusCorners, "toRadiusCorners");
function parseBorderRadius$1(arc, innerRadius, outerRadius, angleDelta) {
  const o = toRadiusCorners(arc.options.borderRadius);
  const halfThickness = (outerRadius - innerRadius) / 2;
  const innerLimit = Math.min(halfThickness, angleDelta * innerRadius / 2);
  const computeOuterLimit = /* @__PURE__ */ __name((val) => {
    const outerArcLimit = (outerRadius - Math.min(halfThickness, val)) * angleDelta / 2;
    return _limitValue(val, 0, Math.min(halfThickness, outerArcLimit));
  }, "computeOuterLimit");
  return {
    outerStart: computeOuterLimit(o.outerStart),
    outerEnd: computeOuterLimit(o.outerEnd),
    innerStart: _limitValue(o.innerStart, 0, innerLimit),
    innerEnd: _limitValue(o.innerEnd, 0, innerLimit)
  };
}
__name(parseBorderRadius$1, "parseBorderRadius$1");
function rThetaToXY(r, theta, x, y) {
  return {
    x: x + r * Math.cos(theta),
    y: y + r * Math.sin(theta)
  };
}
__name(rThetaToXY, "rThetaToXY");
function pathArc(ctx, element2, offset, spacing, end, circular) {
  const { x, y, startAngle: start, pixelMargin, innerRadius: innerR } = element2;
  const outerRadius = Math.max(element2.outerRadius + spacing + offset - pixelMargin, 0);
  const innerRadius = innerR > 0 ? innerR + spacing + offset + pixelMargin : 0;
  let spacingOffset = 0;
  const alpha2 = end - start;
  if (spacing) {
    const noSpacingInnerRadius = innerR > 0 ? innerR - spacing : 0;
    const noSpacingOuterRadius = outerRadius > 0 ? outerRadius - spacing : 0;
    const avNogSpacingRadius = (noSpacingInnerRadius + noSpacingOuterRadius) / 2;
    const adjustedAngle = avNogSpacingRadius !== 0 ? alpha2 * avNogSpacingRadius / (avNogSpacingRadius + spacing) : alpha2;
    spacingOffset = (alpha2 - adjustedAngle) / 2;
  }
  const beta = Math.max(1e-3, alpha2 * outerRadius - offset / PI) / outerRadius;
  const angleOffset = (alpha2 - beta) / 2;
  const startAngle = start + angleOffset + spacingOffset;
  const endAngle = end - angleOffset - spacingOffset;
  const { outerStart, outerEnd, innerStart, innerEnd } = parseBorderRadius$1(element2, innerRadius, outerRadius, endAngle - startAngle);
  const outerStartAdjustedRadius = outerRadius - outerStart;
  const outerEndAdjustedRadius = outerRadius - outerEnd;
  const outerStartAdjustedAngle = startAngle + outerStart / outerStartAdjustedRadius;
  const outerEndAdjustedAngle = endAngle - outerEnd / outerEndAdjustedRadius;
  const innerStartAdjustedRadius = innerRadius + innerStart;
  const innerEndAdjustedRadius = innerRadius + innerEnd;
  const innerStartAdjustedAngle = startAngle + innerStart / innerStartAdjustedRadius;
  const innerEndAdjustedAngle = endAngle - innerEnd / innerEndAdjustedRadius;
  ctx.beginPath();
  if (circular) {
    ctx.arc(x, y, outerRadius, outerStartAdjustedAngle, outerEndAdjustedAngle);
    if (outerEnd > 0) {
      const pCenter = rThetaToXY(outerEndAdjustedRadius, outerEndAdjustedAngle, x, y);
      ctx.arc(pCenter.x, pCenter.y, outerEnd, outerEndAdjustedAngle, endAngle + HALF_PI);
    }
    const p4 = rThetaToXY(innerEndAdjustedRadius, endAngle, x, y);
    ctx.lineTo(p4.x, p4.y);
    if (innerEnd > 0) {
      const pCenter = rThetaToXY(innerEndAdjustedRadius, innerEndAdjustedAngle, x, y);
      ctx.arc(pCenter.x, pCenter.y, innerEnd, endAngle + HALF_PI, innerEndAdjustedAngle + Math.PI);
    }
    ctx.arc(x, y, innerRadius, endAngle - innerEnd / innerRadius, startAngle + innerStart / innerRadius, true);
    if (innerStart > 0) {
      const pCenter = rThetaToXY(innerStartAdjustedRadius, innerStartAdjustedAngle, x, y);
      ctx.arc(pCenter.x, pCenter.y, innerStart, innerStartAdjustedAngle + Math.PI, startAngle - HALF_PI);
    }
    const p8 = rThetaToXY(outerStartAdjustedRadius, startAngle, x, y);
    ctx.lineTo(p8.x, p8.y);
    if (outerStart > 0) {
      const pCenter = rThetaToXY(outerStartAdjustedRadius, outerStartAdjustedAngle, x, y);
      ctx.arc(pCenter.x, pCenter.y, outerStart, startAngle - HALF_PI, outerStartAdjustedAngle);
    }
  } else {
    ctx.moveTo(x, y);
    const outerStartX = Math.cos(outerStartAdjustedAngle) * outerRadius + x;
    const outerStartY = Math.sin(outerStartAdjustedAngle) * outerRadius + y;
    ctx.lineTo(outerStartX, outerStartY);
    const outerEndX = Math.cos(outerEndAdjustedAngle) * outerRadius + x;
    const outerEndY = Math.sin(outerEndAdjustedAngle) * outerRadius + y;
    ctx.lineTo(outerEndX, outerEndY);
  }
  ctx.closePath();
}
__name(pathArc, "pathArc");
function drawArc(ctx, element2, offset, spacing, circular) {
  const { fullCircles, startAngle, circumference } = element2;
  let endAngle = element2.endAngle;
  if (fullCircles) {
    pathArc(ctx, element2, offset, spacing, startAngle + TAU, circular);
    for (let i = 0; i < fullCircles; ++i) {
      ctx.fill();
    }
    if (!isNaN(circumference)) {
      endAngle = startAngle + circumference % TAU;
      if (circumference % TAU === 0) {
        endAngle += TAU;
      }
    }
  }
  pathArc(ctx, element2, offset, spacing, endAngle, circular);
  ctx.fill();
  return endAngle;
}
__name(drawArc, "drawArc");
function drawFullCircleBorders(ctx, element2, inner) {
  const { x, y, startAngle, pixelMargin, fullCircles } = element2;
  const outerRadius = Math.max(element2.outerRadius - pixelMargin, 0);
  const innerRadius = element2.innerRadius + pixelMargin;
  let i;
  if (inner) {
    clipArc(ctx, element2, startAngle + TAU);
  }
  ctx.beginPath();
  ctx.arc(x, y, innerRadius, startAngle + TAU, startAngle, true);
  for (i = 0; i < fullCircles; ++i) {
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(x, y, outerRadius, startAngle, startAngle + TAU);
  for (i = 0; i < fullCircles; ++i) {
    ctx.stroke();
  }
}
__name(drawFullCircleBorders, "drawFullCircleBorders");
function drawBorder(ctx, element2, offset, spacing, endAngle, circular) {
  const { options } = element2;
  const { borderWidth, borderJoinStyle } = options;
  const inner = options.borderAlign === "inner";
  if (!borderWidth) {
    return;
  }
  if (inner) {
    ctx.lineWidth = borderWidth * 2;
    ctx.lineJoin = borderJoinStyle || "round";
  } else {
    ctx.lineWidth = borderWidth;
    ctx.lineJoin = borderJoinStyle || "bevel";
  }
  if (element2.fullCircles) {
    drawFullCircleBorders(ctx, element2, inner);
  }
  if (inner) {
    clipArc(ctx, element2, endAngle);
  }
  pathArc(ctx, element2, offset, spacing, endAngle, circular);
  ctx.stroke();
}
__name(drawBorder, "drawBorder");
class ArcElement extends Element {
  constructor(cfg) {
    super();
    this.options = void 0;
    this.circumference = void 0;
    this.startAngle = void 0;
    this.endAngle = void 0;
    this.innerRadius = void 0;
    this.outerRadius = void 0;
    this.pixelMargin = 0;
    this.fullCircles = 0;
    if (cfg) {
      Object.assign(this, cfg);
    }
  }
  inRange(chartX, chartY, useFinalPosition) {
    const point = this.getProps(["x", "y"], useFinalPosition);
    const { angle, distance } = getAngleFromPoint(point, { x: chartX, y: chartY });
    const { startAngle, endAngle, innerRadius, outerRadius, circumference } = this.getProps([
      "startAngle",
      "endAngle",
      "innerRadius",
      "outerRadius",
      "circumference"
    ], useFinalPosition);
    const rAdjust = this.options.spacing / 2;
    const _circumference = valueOrDefault(circumference, endAngle - startAngle);
    const betweenAngles = _circumference >= TAU || _angleBetween(angle, startAngle, endAngle);
    const withinRadius = _isBetween(distance, innerRadius + rAdjust, outerRadius + rAdjust);
    return betweenAngles && withinRadius;
  }
  getCenterPoint(useFinalPosition) {
    const { x, y, startAngle, endAngle, innerRadius, outerRadius } = this.getProps([
      "x",
      "y",
      "startAngle",
      "endAngle",
      "innerRadius",
      "outerRadius",
      "circumference"
    ], useFinalPosition);
    const { offset, spacing } = this.options;
    const halfAngle = (startAngle + endAngle) / 2;
    const halfRadius = (innerRadius + outerRadius + spacing + offset) / 2;
    return {
      x: x + Math.cos(halfAngle) * halfRadius,
      y: y + Math.sin(halfAngle) * halfRadius
    };
  }
  tooltipPosition(useFinalPosition) {
    return this.getCenterPoint(useFinalPosition);
  }
  draw(ctx) {
    const { options, circumference } = this;
    const offset = (options.offset || 0) / 2;
    const spacing = (options.spacing || 0) / 2;
    const circular = options.circular;
    this.pixelMargin = options.borderAlign === "inner" ? 0.33 : 0;
    this.fullCircles = circumference > TAU ? Math.floor(circumference / TAU) : 0;
    if (circumference === 0 || this.innerRadius < 0 || this.outerRadius < 0) {
      return;
    }
    ctx.save();
    let radiusOffset = 0;
    if (offset) {
      radiusOffset = offset / 2;
      const halfAngle = (this.startAngle + this.endAngle) / 2;
      ctx.translate(Math.cos(halfAngle) * radiusOffset, Math.sin(halfAngle) * radiusOffset);
      if (this.circumference >= PI) {
        radiusOffset = offset;
      }
    }
    ctx.fillStyle = options.backgroundColor;
    ctx.strokeStyle = options.borderColor;
    const endAngle = drawArc(ctx, this, radiusOffset, spacing, circular);
    drawBorder(ctx, this, radiusOffset, spacing, endAngle, circular);
    ctx.restore();
  }
}
__name(ArcElement, "ArcElement");
ArcElement.id = "arc";
ArcElement.defaults = {
  borderAlign: "center",
  borderColor: "#fff",
  borderJoinStyle: void 0,
  borderRadius: 0,
  borderWidth: 2,
  offset: 0,
  spacing: 0,
  angle: void 0,
  circular: true
};
ArcElement.defaultRoutes = {
  backgroundColor: "backgroundColor"
};
function setStyle(ctx, options, style = options) {
  ctx.lineCap = valueOrDefault(style.borderCapStyle, options.borderCapStyle);
  ctx.setLineDash(valueOrDefault(style.borderDash, options.borderDash));
  ctx.lineDashOffset = valueOrDefault(style.borderDashOffset, options.borderDashOffset);
  ctx.lineJoin = valueOrDefault(style.borderJoinStyle, options.borderJoinStyle);
  ctx.lineWidth = valueOrDefault(style.borderWidth, options.borderWidth);
  ctx.strokeStyle = valueOrDefault(style.borderColor, options.borderColor);
}
__name(setStyle, "setStyle");
function lineTo(ctx, previous, target) {
  ctx.lineTo(target.x, target.y);
}
__name(lineTo, "lineTo");
function getLineMethod(options) {
  if (options.stepped) {
    return _steppedLineTo;
  }
  if (options.tension || options.cubicInterpolationMode === "monotone") {
    return _bezierCurveTo;
  }
  return lineTo;
}
__name(getLineMethod, "getLineMethod");
function pathVars(points, segment, params = {}) {
  const count = points.length;
  const { start: paramsStart = 0, end: paramsEnd = count - 1 } = params;
  const { start: segmentStart, end: segmentEnd } = segment;
  const start = Math.max(paramsStart, segmentStart);
  const end = Math.min(paramsEnd, segmentEnd);
  const outside = paramsStart < segmentStart && paramsEnd < segmentStart || paramsStart > segmentEnd && paramsEnd > segmentEnd;
  return {
    count,
    start,
    loop: segment.loop,
    ilen: end < start && !outside ? count + end - start : end - start
  };
}
__name(pathVars, "pathVars");
function pathSegment(ctx, line, segment, params) {
  const { points, options } = line;
  const { count, start, loop: loop2, ilen } = pathVars(points, segment, params);
  const lineMethod = getLineMethod(options);
  let { move = true, reverse } = params || {};
  let i, point, prev;
  for (i = 0; i <= ilen; ++i) {
    point = points[(start + (reverse ? ilen - i : i)) % count];
    if (point.skip) {
      continue;
    } else if (move) {
      ctx.moveTo(point.x, point.y);
      move = false;
    } else {
      lineMethod(ctx, prev, point, reverse, options.stepped);
    }
    prev = point;
  }
  if (loop2) {
    point = points[(start + (reverse ? ilen : 0)) % count];
    lineMethod(ctx, prev, point, reverse, options.stepped);
  }
  return !!loop2;
}
__name(pathSegment, "pathSegment");
function fastPathSegment(ctx, line, segment, params) {
  const points = line.points;
  const { count, start, ilen } = pathVars(points, segment, params);
  const { move = true, reverse } = params || {};
  let avgX = 0;
  let countX = 0;
  let i, point, prevX, minY, maxY, lastY;
  const pointIndex = /* @__PURE__ */ __name((index2) => (start + (reverse ? ilen - index2 : index2)) % count, "pointIndex");
  const drawX = /* @__PURE__ */ __name(() => {
    if (minY !== maxY) {
      ctx.lineTo(avgX, maxY);
      ctx.lineTo(avgX, minY);
      ctx.lineTo(avgX, lastY);
    }
  }, "drawX");
  if (move) {
    point = points[pointIndex(0)];
    ctx.moveTo(point.x, point.y);
  }
  for (i = 0; i <= ilen; ++i) {
    point = points[pointIndex(i)];
    if (point.skip) {
      continue;
    }
    const x = point.x;
    const y = point.y;
    const truncX = x | 0;
    if (truncX === prevX) {
      if (y < minY) {
        minY = y;
      } else if (y > maxY) {
        maxY = y;
      }
      avgX = (countX * avgX + x) / ++countX;
    } else {
      drawX();
      ctx.lineTo(x, y);
      prevX = truncX;
      countX = 0;
      minY = maxY = y;
    }
    lastY = y;
  }
  drawX();
}
__name(fastPathSegment, "fastPathSegment");
function _getSegmentMethod(line) {
  const opts = line.options;
  const borderDash = opts.borderDash && opts.borderDash.length;
  const useFastPath = !line._decimated && !line._loop && !opts.tension && opts.cubicInterpolationMode !== "monotone" && !opts.stepped && !borderDash;
  return useFastPath ? fastPathSegment : pathSegment;
}
__name(_getSegmentMethod, "_getSegmentMethod");
function _getInterpolationMethod(options) {
  if (options.stepped) {
    return _steppedInterpolation;
  }
  if (options.tension || options.cubicInterpolationMode === "monotone") {
    return _bezierInterpolation;
  }
  return _pointInLine;
}
__name(_getInterpolationMethod, "_getInterpolationMethod");
function strokePathWithCache(ctx, line, start, count) {
  let path = line._path;
  if (!path) {
    path = line._path = new Path2D();
    if (line.path(path, start, count)) {
      path.closePath();
    }
  }
  setStyle(ctx, line.options);
  ctx.stroke(path);
}
__name(strokePathWithCache, "strokePathWithCache");
function strokePathDirect(ctx, line, start, count) {
  const { segments, options } = line;
  const segmentMethod = _getSegmentMethod(line);
  for (const segment of segments) {
    setStyle(ctx, options, segment.style);
    ctx.beginPath();
    if (segmentMethod(ctx, line, segment, { start, end: start + count - 1 })) {
      ctx.closePath();
    }
    ctx.stroke();
  }
}
__name(strokePathDirect, "strokePathDirect");
const usePath2D = typeof Path2D === "function";
function draw(ctx, line, start, count) {
  if (usePath2D && !line.options.segment) {
    strokePathWithCache(ctx, line, start, count);
  } else {
    strokePathDirect(ctx, line, start, count);
  }
}
__name(draw, "draw");
class LineElement extends Element {
  constructor(cfg) {
    super();
    this.animated = true;
    this.options = void 0;
    this._chart = void 0;
    this._loop = void 0;
    this._fullLoop = void 0;
    this._path = void 0;
    this._points = void 0;
    this._segments = void 0;
    this._decimated = false;
    this._pointsUpdated = false;
    this._datasetIndex = void 0;
    if (cfg) {
      Object.assign(this, cfg);
    }
  }
  updateControlPoints(chartArea, indexAxis) {
    const options = this.options;
    if ((options.tension || options.cubicInterpolationMode === "monotone") && !options.stepped && !this._pointsUpdated) {
      const loop2 = options.spanGaps ? this._loop : this._fullLoop;
      _updateBezierControlPoints(this._points, options, chartArea, loop2, indexAxis);
      this._pointsUpdated = true;
    }
  }
  set points(points) {
    this._points = points;
    delete this._segments;
    delete this._path;
    this._pointsUpdated = false;
  }
  get points() {
    return this._points;
  }
  get segments() {
    return this._segments || (this._segments = _computeSegments(this, this.options.segment));
  }
  first() {
    const segments = this.segments;
    const points = this.points;
    return segments.length && points[segments[0].start];
  }
  last() {
    const segments = this.segments;
    const points = this.points;
    const count = segments.length;
    return count && points[segments[count - 1].end];
  }
  interpolate(point, property) {
    const options = this.options;
    const value = point[property];
    const points = this.points;
    const segments = _boundSegments(this, { property, start: value, end: value });
    if (!segments.length) {
      return;
    }
    const result = [];
    const _interpolate = _getInterpolationMethod(options);
    let i, ilen;
    for (i = 0, ilen = segments.length; i < ilen; ++i) {
      const { start, end } = segments[i];
      const p1 = points[start];
      const p2 = points[end];
      if (p1 === p2) {
        result.push(p1);
        continue;
      }
      const t = Math.abs((value - p1[property]) / (p2[property] - p1[property]));
      const interpolated = _interpolate(p1, p2, t, options.stepped);
      interpolated[property] = point[property];
      result.push(interpolated);
    }
    return result.length === 1 ? result[0] : result;
  }
  pathSegment(ctx, segment, params) {
    const segmentMethod = _getSegmentMethod(this);
    return segmentMethod(ctx, this, segment, params);
  }
  path(ctx, start, count) {
    const segments = this.segments;
    const segmentMethod = _getSegmentMethod(this);
    let loop2 = this._loop;
    start = start || 0;
    count = count || this.points.length - start;
    for (const segment of segments) {
      loop2 &= segmentMethod(ctx, this, segment, { start, end: start + count - 1 });
    }
    return !!loop2;
  }
  draw(ctx, chartArea, start, count) {
    const options = this.options || {};
    const points = this.points || [];
    if (points.length && options.borderWidth) {
      ctx.save();
      draw(ctx, this, start, count);
      ctx.restore();
    }
    if (this.animated) {
      this._pointsUpdated = false;
      this._path = void 0;
    }
  }
}
__name(LineElement, "LineElement");
LineElement.id = "line";
LineElement.defaults = {
  borderCapStyle: "butt",
  borderDash: [],
  borderDashOffset: 0,
  borderJoinStyle: "miter",
  borderWidth: 3,
  capBezierPoints: true,
  cubicInterpolationMode: "default",
  fill: false,
  spanGaps: false,
  stepped: false,
  tension: 0
};
LineElement.defaultRoutes = {
  backgroundColor: "backgroundColor",
  borderColor: "borderColor"
};
LineElement.descriptors = {
  _scriptable: true,
  _indexable: (name) => name !== "borderDash" && name !== "fill"
};
function inRange$1(el, pos, axis, useFinalPosition) {
  const options = el.options;
  const { [axis]: value } = el.getProps([axis], useFinalPosition);
  return Math.abs(pos - value) < options.radius + options.hitRadius;
}
__name(inRange$1, "inRange$1");
class PointElement extends Element {
  constructor(cfg) {
    super();
    this.options = void 0;
    this.parsed = void 0;
    this.skip = void 0;
    this.stop = void 0;
    if (cfg) {
      Object.assign(this, cfg);
    }
  }
  inRange(mouseX, mouseY, useFinalPosition) {
    const options = this.options;
    const { x, y } = this.getProps(["x", "y"], useFinalPosition);
    return Math.pow(mouseX - x, 2) + Math.pow(mouseY - y, 2) < Math.pow(options.hitRadius + options.radius, 2);
  }
  inXRange(mouseX, useFinalPosition) {
    return inRange$1(this, mouseX, "x", useFinalPosition);
  }
  inYRange(mouseY, useFinalPosition) {
    return inRange$1(this, mouseY, "y", useFinalPosition);
  }
  getCenterPoint(useFinalPosition) {
    const { x, y } = this.getProps(["x", "y"], useFinalPosition);
    return { x, y };
  }
  size(options) {
    options = options || this.options || {};
    let radius2 = options.radius || 0;
    radius2 = Math.max(radius2, radius2 && options.hoverRadius || 0);
    const borderWidth = radius2 && options.borderWidth || 0;
    return (radius2 + borderWidth) * 2;
  }
  draw(ctx, area) {
    const options = this.options;
    if (this.skip || options.radius < 0.1 || !_isPointInArea(this, area, this.size(options) / 2)) {
      return;
    }
    ctx.strokeStyle = options.borderColor;
    ctx.lineWidth = options.borderWidth;
    ctx.fillStyle = options.backgroundColor;
    drawPoint(ctx, options, this.x, this.y);
  }
  getRange() {
    const options = this.options || {};
    return options.radius + options.hitRadius;
  }
}
__name(PointElement, "PointElement");
PointElement.id = "point";
PointElement.defaults = {
  borderWidth: 1,
  hitRadius: 1,
  hoverBorderWidth: 1,
  hoverRadius: 4,
  pointStyle: "circle",
  radius: 3,
  rotation: 0
};
PointElement.defaultRoutes = {
  backgroundColor: "backgroundColor",
  borderColor: "borderColor"
};
function getBarBounds(bar, useFinalPosition) {
  const { x, y, base, width, height } = bar.getProps(["x", "y", "base", "width", "height"], useFinalPosition);
  let left, right, top, bottom, half;
  if (bar.horizontal) {
    half = height / 2;
    left = Math.min(x, base);
    right = Math.max(x, base);
    top = y - half;
    bottom = y + half;
  } else {
    half = width / 2;
    left = x - half;
    right = x + half;
    top = Math.min(y, base);
    bottom = Math.max(y, base);
  }
  return { left, top, right, bottom };
}
__name(getBarBounds, "getBarBounds");
function skipOrLimit(skip2, value, min, max) {
  return skip2 ? 0 : _limitValue(value, min, max);
}
__name(skipOrLimit, "skipOrLimit");
function parseBorderWidth(bar, maxW, maxH) {
  const value = bar.options.borderWidth;
  const skip2 = bar.borderSkipped;
  const o = toTRBL(value);
  return {
    t: skipOrLimit(skip2.top, o.top, 0, maxH),
    r: skipOrLimit(skip2.right, o.right, 0, maxW),
    b: skipOrLimit(skip2.bottom, o.bottom, 0, maxH),
    l: skipOrLimit(skip2.left, o.left, 0, maxW)
  };
}
__name(parseBorderWidth, "parseBorderWidth");
function parseBorderRadius(bar, maxW, maxH) {
  const { enableBorderRadius } = bar.getProps(["enableBorderRadius"]);
  const value = bar.options.borderRadius;
  const o = toTRBLCorners(value);
  const maxR = Math.min(maxW, maxH);
  const skip2 = bar.borderSkipped;
  const enableBorder = enableBorderRadius || isObject(value);
  return {
    topLeft: skipOrLimit(!enableBorder || skip2.top || skip2.left, o.topLeft, 0, maxR),
    topRight: skipOrLimit(!enableBorder || skip2.top || skip2.right, o.topRight, 0, maxR),
    bottomLeft: skipOrLimit(!enableBorder || skip2.bottom || skip2.left, o.bottomLeft, 0, maxR),
    bottomRight: skipOrLimit(!enableBorder || skip2.bottom || skip2.right, o.bottomRight, 0, maxR)
  };
}
__name(parseBorderRadius, "parseBorderRadius");
function boundingRects(bar) {
  const bounds = getBarBounds(bar);
  const width = bounds.right - bounds.left;
  const height = bounds.bottom - bounds.top;
  const border = parseBorderWidth(bar, width / 2, height / 2);
  const radius2 = parseBorderRadius(bar, width / 2, height / 2);
  return {
    outer: {
      x: bounds.left,
      y: bounds.top,
      w: width,
      h: height,
      radius: radius2
    },
    inner: {
      x: bounds.left + border.l,
      y: bounds.top + border.t,
      w: width - border.l - border.r,
      h: height - border.t - border.b,
      radius: {
        topLeft: Math.max(0, radius2.topLeft - Math.max(border.t, border.l)),
        topRight: Math.max(0, radius2.topRight - Math.max(border.t, border.r)),
        bottomLeft: Math.max(0, radius2.bottomLeft - Math.max(border.b, border.l)),
        bottomRight: Math.max(0, radius2.bottomRight - Math.max(border.b, border.r))
      }
    }
  };
}
__name(boundingRects, "boundingRects");
function inRange(bar, x, y, useFinalPosition) {
  const skipX = x === null;
  const skipY = y === null;
  const skipBoth = skipX && skipY;
  const bounds = bar && !skipBoth && getBarBounds(bar, useFinalPosition);
  return bounds && (skipX || _isBetween(x, bounds.left, bounds.right)) && (skipY || _isBetween(y, bounds.top, bounds.bottom));
}
__name(inRange, "inRange");
function hasRadius(radius2) {
  return radius2.topLeft || radius2.topRight || radius2.bottomLeft || radius2.bottomRight;
}
__name(hasRadius, "hasRadius");
function addNormalRectPath(ctx, rect) {
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
}
__name(addNormalRectPath, "addNormalRectPath");
function inflateRect(rect, amount, refRect = {}) {
  const x = rect.x !== refRect.x ? -amount : 0;
  const y = rect.y !== refRect.y ? -amount : 0;
  const w = (rect.x + rect.w !== refRect.x + refRect.w ? amount : 0) - x;
  const h = (rect.y + rect.h !== refRect.y + refRect.h ? amount : 0) - y;
  return {
    x: rect.x + x,
    y: rect.y + y,
    w: rect.w + w,
    h: rect.h + h,
    radius: rect.radius
  };
}
__name(inflateRect, "inflateRect");
class BarElement extends Element {
  constructor(cfg) {
    super();
    this.options = void 0;
    this.horizontal = void 0;
    this.base = void 0;
    this.width = void 0;
    this.height = void 0;
    this.inflateAmount = void 0;
    if (cfg) {
      Object.assign(this, cfg);
    }
  }
  draw(ctx) {
    const { inflateAmount, options: { borderColor, backgroundColor } } = this;
    const { inner, outer } = boundingRects(this);
    const addRectPath = hasRadius(outer.radius) ? addRoundedRectPath : addNormalRectPath;
    ctx.save();
    if (outer.w !== inner.w || outer.h !== inner.h) {
      ctx.beginPath();
      addRectPath(ctx, inflateRect(outer, inflateAmount, inner));
      ctx.clip();
      addRectPath(ctx, inflateRect(inner, -inflateAmount, outer));
      ctx.fillStyle = borderColor;
      ctx.fill("evenodd");
    }
    ctx.beginPath();
    addRectPath(ctx, inflateRect(inner, inflateAmount));
    ctx.fillStyle = backgroundColor;
    ctx.fill();
    ctx.restore();
  }
  inRange(mouseX, mouseY, useFinalPosition) {
    return inRange(this, mouseX, mouseY, useFinalPosition);
  }
  inXRange(mouseX, useFinalPosition) {
    return inRange(this, mouseX, null, useFinalPosition);
  }
  inYRange(mouseY, useFinalPosition) {
    return inRange(this, null, mouseY, useFinalPosition);
  }
  getCenterPoint(useFinalPosition) {
    const { x, y, base, horizontal } = this.getProps(["x", "y", "base", "horizontal"], useFinalPosition);
    return {
      x: horizontal ? (x + base) / 2 : x,
      y: horizontal ? y : (y + base) / 2
    };
  }
  getRange(axis) {
    return axis === "x" ? this.width / 2 : this.height / 2;
  }
}
__name(BarElement, "BarElement");
BarElement.id = "bar";
BarElement.defaults = {
  borderSkipped: "start",
  borderWidth: 0,
  borderRadius: 0,
  inflateAmount: "auto",
  pointStyle: void 0
};
BarElement.defaultRoutes = {
  backgroundColor: "backgroundColor",
  borderColor: "borderColor"
};
var elements = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  ArcElement,
  LineElement,
  PointElement,
  BarElement
});
function lttbDecimation(data, start, count, availableWidth, options) {
  const samples = options.samples || availableWidth;
  if (samples >= count) {
    return data.slice(start, start + count);
  }
  const decimated = [];
  const bucketWidth = (count - 2) / (samples - 2);
  let sampledIndex = 0;
  const endIndex = start + count - 1;
  let a = start;
  let i, maxAreaPoint, maxArea, area, nextA;
  decimated[sampledIndex++] = data[a];
  for (i = 0; i < samples - 2; i++) {
    let avgX = 0;
    let avgY = 0;
    let j;
    const avgRangeStart = Math.floor((i + 1) * bucketWidth) + 1 + start;
    const avgRangeEnd = Math.min(Math.floor((i + 2) * bucketWidth) + 1, count) + start;
    const avgRangeLength = avgRangeEnd - avgRangeStart;
    for (j = avgRangeStart; j < avgRangeEnd; j++) {
      avgX += data[j].x;
      avgY += data[j].y;
    }
    avgX /= avgRangeLength;
    avgY /= avgRangeLength;
    const rangeOffs = Math.floor(i * bucketWidth) + 1 + start;
    const rangeTo = Math.min(Math.floor((i + 1) * bucketWidth) + 1, count) + start;
    const { x: pointAx, y: pointAy } = data[a];
    maxArea = area = -1;
    for (j = rangeOffs; j < rangeTo; j++) {
      area = 0.5 * Math.abs(
        (pointAx - avgX) * (data[j].y - pointAy) - (pointAx - data[j].x) * (avgY - pointAy)
      );
      if (area > maxArea) {
        maxArea = area;
        maxAreaPoint = data[j];
        nextA = j;
      }
    }
    decimated[sampledIndex++] = maxAreaPoint;
    a = nextA;
  }
  decimated[sampledIndex++] = data[endIndex];
  return decimated;
}
__name(lttbDecimation, "lttbDecimation");
function minMaxDecimation(data, start, count, availableWidth) {
  let avgX = 0;
  let countX = 0;
  let i, point, x, y, prevX, minIndex, maxIndex, startIndex, minY, maxY;
  const decimated = [];
  const endIndex = start + count - 1;
  const xMin = data[start].x;
  const xMax = data[endIndex].x;
  const dx = xMax - xMin;
  for (i = start; i < start + count; ++i) {
    point = data[i];
    x = (point.x - xMin) / dx * availableWidth;
    y = point.y;
    const truncX = x | 0;
    if (truncX === prevX) {
      if (y < minY) {
        minY = y;
        minIndex = i;
      } else if (y > maxY) {
        maxY = y;
        maxIndex = i;
      }
      avgX = (countX * avgX + point.x) / ++countX;
    } else {
      const lastIndex = i - 1;
      if (!isNullOrUndef(minIndex) && !isNullOrUndef(maxIndex)) {
        const intermediateIndex1 = Math.min(minIndex, maxIndex);
        const intermediateIndex2 = Math.max(minIndex, maxIndex);
        if (intermediateIndex1 !== startIndex && intermediateIndex1 !== lastIndex) {
          decimated.push({
            ...data[intermediateIndex1],
            x: avgX
          });
        }
        if (intermediateIndex2 !== startIndex && intermediateIndex2 !== lastIndex) {
          decimated.push({
            ...data[intermediateIndex2],
            x: avgX
          });
        }
      }
      if (i > 0 && lastIndex !== startIndex) {
        decimated.push(data[lastIndex]);
      }
      decimated.push(point);
      prevX = truncX;
      countX = 0;
      minY = maxY = y;
      minIndex = maxIndex = startIndex = i;
    }
  }
  return decimated;
}
__name(minMaxDecimation, "minMaxDecimation");
function cleanDecimatedDataset(dataset) {
  if (dataset._decimated) {
    const data = dataset._data;
    delete dataset._decimated;
    delete dataset._data;
    Object.defineProperty(dataset, "data", { value: data });
  }
}
__name(cleanDecimatedDataset, "cleanDecimatedDataset");
function cleanDecimatedData(chart) {
  chart.data.datasets.forEach((dataset) => {
    cleanDecimatedDataset(dataset);
  });
}
__name(cleanDecimatedData, "cleanDecimatedData");
function getStartAndCountOfVisiblePointsSimplified(meta, points) {
  const pointCount = points.length;
  let start = 0;
  let count;
  const { iScale } = meta;
  const { min, max, minDefined, maxDefined } = iScale.getUserBounds();
  if (minDefined) {
    start = _limitValue(_lookupByKey(points, iScale.axis, min).lo, 0, pointCount - 1);
  }
  if (maxDefined) {
    count = _limitValue(_lookupByKey(points, iScale.axis, max).hi + 1, start, pointCount) - start;
  } else {
    count = pointCount - start;
  }
  return { start, count };
}
__name(getStartAndCountOfVisiblePointsSimplified, "getStartAndCountOfVisiblePointsSimplified");
var plugin_decimation = {
  id: "decimation",
  defaults: {
    algorithm: "min-max",
    enabled: false
  },
  beforeElementsUpdate: (chart, args, options) => {
    if (!options.enabled) {
      cleanDecimatedData(chart);
      return;
    }
    const availableWidth = chart.width;
    chart.data.datasets.forEach((dataset, datasetIndex) => {
      const { _data, indexAxis } = dataset;
      const meta = chart.getDatasetMeta(datasetIndex);
      const data = _data || dataset.data;
      if (resolve([indexAxis, chart.options.indexAxis]) === "y") {
        return;
      }
      if (!meta.controller.supportsDecimation) {
        return;
      }
      const xAxis = chart.scales[meta.xAxisID];
      if (xAxis.type !== "linear" && xAxis.type !== "time") {
        return;
      }
      if (chart.options.parsing) {
        return;
      }
      let { start, count } = getStartAndCountOfVisiblePointsSimplified(meta, data);
      const threshold = options.threshold || 4 * availableWidth;
      if (count <= threshold) {
        cleanDecimatedDataset(dataset);
        return;
      }
      if (isNullOrUndef(_data)) {
        dataset._data = data;
        delete dataset.data;
        Object.defineProperty(dataset, "data", {
          configurable: true,
          enumerable: true,
          get: function() {
            return this._decimated;
          },
          set: function(d) {
            this._data = d;
          }
        });
      }
      let decimated;
      switch (options.algorithm) {
        case "lttb":
          decimated = lttbDecimation(data, start, count, availableWidth, options);
          break;
        case "min-max":
          decimated = minMaxDecimation(data, start, count, availableWidth);
          break;
        default:
          throw new Error(`Unsupported decimation algorithm '${options.algorithm}'`);
      }
      dataset._decimated = decimated;
    });
  },
  destroy(chart) {
    cleanDecimatedData(chart);
  }
};
function _segments(line, target, property) {
  const segments = line.segments;
  const points = line.points;
  const tpoints = target.points;
  const parts = [];
  for (const segment of segments) {
    let { start, end } = segment;
    end = _findSegmentEnd(start, end, points);
    const bounds = _getBounds(property, points[start], points[end], segment.loop);
    if (!target.segments) {
      parts.push({
        source: segment,
        target: bounds,
        start: points[start],
        end: points[end]
      });
      continue;
    }
    const targetSegments = _boundSegments(target, bounds);
    for (const tgt of targetSegments) {
      const subBounds = _getBounds(property, tpoints[tgt.start], tpoints[tgt.end], tgt.loop);
      const fillSources = _boundSegment(segment, points, subBounds);
      for (const fillSource of fillSources) {
        parts.push({
          source: fillSource,
          target: tgt,
          start: {
            [property]: _getEdge(bounds, subBounds, "start", Math.max)
          },
          end: {
            [property]: _getEdge(bounds, subBounds, "end", Math.min)
          }
        });
      }
    }
  }
  return parts;
}
__name(_segments, "_segments");
function _getBounds(property, first, last, loop2) {
  if (loop2) {
    return;
  }
  let start = first[property];
  let end = last[property];
  if (property === "angle") {
    start = _normalizeAngle(start);
    end = _normalizeAngle(end);
  }
  return { property, start, end };
}
__name(_getBounds, "_getBounds");
function _pointsFromSegments(boundary, line) {
  const { x = null, y = null } = boundary || {};
  const linePoints = line.points;
  const points = [];
  line.segments.forEach(({ start, end }) => {
    end = _findSegmentEnd(start, end, linePoints);
    const first = linePoints[start];
    const last = linePoints[end];
    if (y !== null) {
      points.push({ x: first.x, y });
      points.push({ x: last.x, y });
    } else if (x !== null) {
      points.push({ x, y: first.y });
      points.push({ x, y: last.y });
    }
  });
  return points;
}
__name(_pointsFromSegments, "_pointsFromSegments");
function _findSegmentEnd(start, end, points) {
  for (; end > start; end--) {
    const point = points[end];
    if (!isNaN(point.x) && !isNaN(point.y)) {
      break;
    }
  }
  return end;
}
__name(_findSegmentEnd, "_findSegmentEnd");
function _getEdge(a, b, prop, fn) {
  if (a && b) {
    return fn(a[prop], b[prop]);
  }
  return a ? a[prop] : b ? b[prop] : 0;
}
__name(_getEdge, "_getEdge");
function _createBoundaryLine(boundary, line) {
  let points = [];
  let _loop = false;
  if (isArray(boundary)) {
    _loop = true;
    points = boundary;
  } else {
    points = _pointsFromSegments(boundary, line);
  }
  return points.length ? new LineElement({
    points,
    options: { tension: 0 },
    _loop,
    _fullLoop: _loop
  }) : null;
}
__name(_createBoundaryLine, "_createBoundaryLine");
function _shouldApplyFill(source) {
  return source && source.fill !== false;
}
__name(_shouldApplyFill, "_shouldApplyFill");
function _resolveTarget(sources, index2, propagate) {
  const source = sources[index2];
  let fill2 = source.fill;
  const visited = [index2];
  let target;
  if (!propagate) {
    return fill2;
  }
  while (fill2 !== false && visited.indexOf(fill2) === -1) {
    if (!isNumberFinite(fill2)) {
      return fill2;
    }
    target = sources[fill2];
    if (!target) {
      return false;
    }
    if (target.visible) {
      return fill2;
    }
    visited.push(fill2);
    fill2 = target.fill;
  }
  return false;
}
__name(_resolveTarget, "_resolveTarget");
function _decodeFill(line, index2, count) {
  const fill2 = parseFillOption(line);
  if (isObject(fill2)) {
    return isNaN(fill2.value) ? false : fill2;
  }
  let target = parseFloat(fill2);
  if (isNumberFinite(target) && Math.floor(target) === target) {
    return decodeTargetIndex(fill2[0], index2, target, count);
  }
  return ["origin", "start", "end", "stack", "shape"].indexOf(fill2) >= 0 && fill2;
}
__name(_decodeFill, "_decodeFill");
function decodeTargetIndex(firstCh, index2, target, count) {
  if (firstCh === "-" || firstCh === "+") {
    target = index2 + target;
  }
  if (target === index2 || target < 0 || target >= count) {
    return false;
  }
  return target;
}
__name(decodeTargetIndex, "decodeTargetIndex");
function _getTargetPixel(fill2, scale) {
  let pixel = null;
  if (fill2 === "start") {
    pixel = scale.bottom;
  } else if (fill2 === "end") {
    pixel = scale.top;
  } else if (isObject(fill2)) {
    pixel = scale.getPixelForValue(fill2.value);
  } else if (scale.getBasePixel) {
    pixel = scale.getBasePixel();
  }
  return pixel;
}
__name(_getTargetPixel, "_getTargetPixel");
function _getTargetValue(fill2, scale, startValue) {
  let value;
  if (fill2 === "start") {
    value = startValue;
  } else if (fill2 === "end") {
    value = scale.options.reverse ? scale.min : scale.max;
  } else if (isObject(fill2)) {
    value = fill2.value;
  } else {
    value = scale.getBaseValue();
  }
  return value;
}
__name(_getTargetValue, "_getTargetValue");
function parseFillOption(line) {
  const options = line.options;
  const fillOption = options.fill;
  let fill2 = valueOrDefault(fillOption && fillOption.target, fillOption);
  if (fill2 === void 0) {
    fill2 = !!options.backgroundColor;
  }
  if (fill2 === false || fill2 === null) {
    return false;
  }
  if (fill2 === true) {
    return "origin";
  }
  return fill2;
}
__name(parseFillOption, "parseFillOption");
function _buildStackLine(source) {
  const { scale, index: index2, line } = source;
  const points = [];
  const segments = line.segments;
  const sourcePoints = line.points;
  const linesBelow = getLinesBelow(scale, index2);
  linesBelow.push(_createBoundaryLine({ x: null, y: scale.bottom }, line));
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    for (let j = segment.start; j <= segment.end; j++) {
      addPointsBelow(points, sourcePoints[j], linesBelow);
    }
  }
  return new LineElement({ points, options: {} });
}
__name(_buildStackLine, "_buildStackLine");
function getLinesBelow(scale, index2) {
  const below = [];
  const metas = scale.getMatchingVisibleMetas("line");
  for (let i = 0; i < metas.length; i++) {
    const meta = metas[i];
    if (meta.index === index2) {
      break;
    }
    if (!meta.hidden) {
      below.unshift(meta.dataset);
    }
  }
  return below;
}
__name(getLinesBelow, "getLinesBelow");
function addPointsBelow(points, sourcePoint, linesBelow) {
  const postponed = [];
  for (let j = 0; j < linesBelow.length; j++) {
    const line = linesBelow[j];
    const { first, last, point } = findPoint(line, sourcePoint, "x");
    if (!point || first && last) {
      continue;
    }
    if (first) {
      postponed.unshift(point);
    } else {
      points.push(point);
      if (!last) {
        break;
      }
    }
  }
  points.push(...postponed);
}
__name(addPointsBelow, "addPointsBelow");
function findPoint(line, sourcePoint, property) {
  const point = line.interpolate(sourcePoint, property);
  if (!point) {
    return {};
  }
  const pointValue = point[property];
  const segments = line.segments;
  const linePoints = line.points;
  let first = false;
  let last = false;
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const firstValue = linePoints[segment.start][property];
    const lastValue = linePoints[segment.end][property];
    if (_isBetween(pointValue, firstValue, lastValue)) {
      first = pointValue === firstValue;
      last = pointValue === lastValue;
      break;
    }
  }
  return { first, last, point };
}
__name(findPoint, "findPoint");
class simpleArc {
  constructor(opts) {
    this.x = opts.x;
    this.y = opts.y;
    this.radius = opts.radius;
  }
  pathSegment(ctx, bounds, opts) {
    const { x, y, radius: radius2 } = this;
    bounds = bounds || { start: 0, end: TAU };
    ctx.arc(x, y, radius2, bounds.end, bounds.start, true);
    return !opts.bounds;
  }
  interpolate(point) {
    const { x, y, radius: radius2 } = this;
    const angle = point.angle;
    return {
      x: x + Math.cos(angle) * radius2,
      y: y + Math.sin(angle) * radius2,
      angle
    };
  }
}
__name(simpleArc, "simpleArc");
function _getTarget(source) {
  const { chart, fill: fill2, line } = source;
  if (isNumberFinite(fill2)) {
    return getLineByIndex(chart, fill2);
  }
  if (fill2 === "stack") {
    return _buildStackLine(source);
  }
  if (fill2 === "shape") {
    return true;
  }
  const boundary = computeBoundary(source);
  if (boundary instanceof simpleArc) {
    return boundary;
  }
  return _createBoundaryLine(boundary, line);
}
__name(_getTarget, "_getTarget");
function getLineByIndex(chart, index2) {
  const meta = chart.getDatasetMeta(index2);
  const visible = meta && chart.isDatasetVisible(index2);
  return visible ? meta.dataset : null;
}
__name(getLineByIndex, "getLineByIndex");
function computeBoundary(source) {
  const scale = source.scale || {};
  if (scale.getPointPositionForValue) {
    return computeCircularBoundary(source);
  }
  return computeLinearBoundary(source);
}
__name(computeBoundary, "computeBoundary");
function computeLinearBoundary(source) {
  const { scale = {}, fill: fill2 } = source;
  const pixel = _getTargetPixel(fill2, scale);
  if (isNumberFinite(pixel)) {
    const horizontal = scale.isHorizontal();
    return {
      x: horizontal ? pixel : null,
      y: horizontal ? null : pixel
    };
  }
  return null;
}
__name(computeLinearBoundary, "computeLinearBoundary");
function computeCircularBoundary(source) {
  const { scale, fill: fill2 } = source;
  const options = scale.options;
  const length = scale.getLabels().length;
  const start = options.reverse ? scale.max : scale.min;
  const value = _getTargetValue(fill2, scale, start);
  const target = [];
  if (options.grid.circular) {
    const center = scale.getPointPositionForValue(0, start);
    return new simpleArc({
      x: center.x,
      y: center.y,
      radius: scale.getDistanceFromCenterForValue(value)
    });
  }
  for (let i = 0; i < length; ++i) {
    target.push(scale.getPointPositionForValue(i, value));
  }
  return target;
}
__name(computeCircularBoundary, "computeCircularBoundary");
function _drawfill(ctx, source, area) {
  const target = _getTarget(source);
  const { line, scale, axis } = source;
  const lineOpts = line.options;
  const fillOption = lineOpts.fill;
  const color2 = lineOpts.backgroundColor;
  const { above = color2, below = color2 } = fillOption || {};
  if (target && line.points.length) {
    clipArea(ctx, area);
    doFill(ctx, { line, target, above, below, area, scale, axis });
    unclipArea(ctx);
  }
}
__name(_drawfill, "_drawfill");
function doFill(ctx, cfg) {
  const { line, target, above, below, area, scale } = cfg;
  const property = line._loop ? "angle" : cfg.axis;
  ctx.save();
  if (property === "x" && below !== above) {
    clipVertical(ctx, target, area.top);
    fill(ctx, { line, target, color: above, scale, property });
    ctx.restore();
    ctx.save();
    clipVertical(ctx, target, area.bottom);
  }
  fill(ctx, { line, target, color: below, scale, property });
  ctx.restore();
}
__name(doFill, "doFill");
function clipVertical(ctx, target, clipY) {
  const { segments, points } = target;
  let first = true;
  let lineLoop = false;
  ctx.beginPath();
  for (const segment of segments) {
    const { start, end } = segment;
    const firstPoint = points[start];
    const lastPoint = points[_findSegmentEnd(start, end, points)];
    if (first) {
      ctx.moveTo(firstPoint.x, firstPoint.y);
      first = false;
    } else {
      ctx.lineTo(firstPoint.x, clipY);
      ctx.lineTo(firstPoint.x, firstPoint.y);
    }
    lineLoop = !!target.pathSegment(ctx, segment, { move: lineLoop });
    if (lineLoop) {
      ctx.closePath();
    } else {
      ctx.lineTo(lastPoint.x, clipY);
    }
  }
  ctx.lineTo(target.first().x, clipY);
  ctx.closePath();
  ctx.clip();
}
__name(clipVertical, "clipVertical");
function fill(ctx, cfg) {
  const { line, target, property, color: color2, scale } = cfg;
  const segments = _segments(line, target, property);
  for (const { source: src, target: tgt, start, end } of segments) {
    const { style: { backgroundColor = color2 } = {} } = src;
    const notShape = target !== true;
    ctx.save();
    ctx.fillStyle = backgroundColor;
    clipBounds(ctx, scale, notShape && _getBounds(property, start, end));
    ctx.beginPath();
    const lineLoop = !!line.pathSegment(ctx, src);
    let loop2;
    if (notShape) {
      if (lineLoop) {
        ctx.closePath();
      } else {
        interpolatedLineTo(ctx, target, end, property);
      }
      const targetLoop = !!target.pathSegment(ctx, tgt, { move: lineLoop, reverse: true });
      loop2 = lineLoop && targetLoop;
      if (!loop2) {
        interpolatedLineTo(ctx, target, start, property);
      }
    }
    ctx.closePath();
    ctx.fill(loop2 ? "evenodd" : "nonzero");
    ctx.restore();
  }
}
__name(fill, "fill");
function clipBounds(ctx, scale, bounds) {
  const { top, bottom } = scale.chart.chartArea;
  const { property, start, end } = bounds || {};
  if (property === "x") {
    ctx.beginPath();
    ctx.rect(start, top, end - start, bottom - top);
    ctx.clip();
  }
}
__name(clipBounds, "clipBounds");
function interpolatedLineTo(ctx, target, point, property) {
  const interpolatedPoint = target.interpolate(point, property);
  if (interpolatedPoint) {
    ctx.lineTo(interpolatedPoint.x, interpolatedPoint.y);
  }
}
__name(interpolatedLineTo, "interpolatedLineTo");
var index = {
  id: "filler",
  afterDatasetsUpdate(chart, _args, options) {
    const count = (chart.data.datasets || []).length;
    const sources = [];
    let meta, i, line, source;
    for (i = 0; i < count; ++i) {
      meta = chart.getDatasetMeta(i);
      line = meta.dataset;
      source = null;
      if (line && line.options && line instanceof LineElement) {
        source = {
          visible: chart.isDatasetVisible(i),
          index: i,
          fill: _decodeFill(line, i, count),
          chart,
          axis: meta.controller.options.indexAxis,
          scale: meta.vScale,
          line
        };
      }
      meta.$filler = source;
      sources.push(source);
    }
    for (i = 0; i < count; ++i) {
      source = sources[i];
      if (!source || source.fill === false) {
        continue;
      }
      source.fill = _resolveTarget(sources, i, options.propagate);
    }
  },
  beforeDraw(chart, _args, options) {
    const draw2 = options.drawTime === "beforeDraw";
    const metasets = chart.getSortedVisibleDatasetMetas();
    const area = chart.chartArea;
    for (let i = metasets.length - 1; i >= 0; --i) {
      const source = metasets[i].$filler;
      if (!source) {
        continue;
      }
      source.line.updateControlPoints(area, source.axis);
      if (draw2 && source.fill) {
        _drawfill(chart.ctx, source, area);
      }
    }
  },
  beforeDatasetsDraw(chart, _args, options) {
    if (options.drawTime !== "beforeDatasetsDraw") {
      return;
    }
    const metasets = chart.getSortedVisibleDatasetMetas();
    for (let i = metasets.length - 1; i >= 0; --i) {
      const source = metasets[i].$filler;
      if (_shouldApplyFill(source)) {
        _drawfill(chart.ctx, source, chart.chartArea);
      }
    }
  },
  beforeDatasetDraw(chart, args, options) {
    const source = args.meta.$filler;
    if (!_shouldApplyFill(source) || options.drawTime !== "beforeDatasetDraw") {
      return;
    }
    _drawfill(chart.ctx, source, chart.chartArea);
  },
  defaults: {
    propagate: true,
    drawTime: "beforeDatasetDraw"
  }
};
const getBoxSize = /* @__PURE__ */ __name((labelOpts, fontSize) => {
  let { boxHeight = fontSize, boxWidth = fontSize } = labelOpts;
  if (labelOpts.usePointStyle) {
    boxHeight = Math.min(boxHeight, fontSize);
    boxWidth = labelOpts.pointStyleWidth || Math.min(boxWidth, fontSize);
  }
  return {
    boxWidth,
    boxHeight,
    itemHeight: Math.max(fontSize, boxHeight)
  };
}, "getBoxSize");
const itemsEqual = /* @__PURE__ */ __name((a, b) => a !== null && b !== null && a.datasetIndex === b.datasetIndex && a.index === b.index, "itemsEqual");
class Legend extends Element {
  constructor(config) {
    super();
    this._added = false;
    this.legendHitBoxes = [];
    this._hoveredItem = null;
    this.doughnutMode = false;
    this.chart = config.chart;
    this.options = config.options;
    this.ctx = config.ctx;
    this.legendItems = void 0;
    this.columnSizes = void 0;
    this.lineWidths = void 0;
    this.maxHeight = void 0;
    this.maxWidth = void 0;
    this.top = void 0;
    this.bottom = void 0;
    this.left = void 0;
    this.right = void 0;
    this.height = void 0;
    this.width = void 0;
    this._margins = void 0;
    this.position = void 0;
    this.weight = void 0;
    this.fullSize = void 0;
  }
  update(maxWidth, maxHeight, margins) {
    this.maxWidth = maxWidth;
    this.maxHeight = maxHeight;
    this._margins = margins;
    this.setDimensions();
    this.buildLabels();
    this.fit();
  }
  setDimensions() {
    if (this.isHorizontal()) {
      this.width = this.maxWidth;
      this.left = this._margins.left;
      this.right = this.width;
    } else {
      this.height = this.maxHeight;
      this.top = this._margins.top;
      this.bottom = this.height;
    }
  }
  buildLabels() {
    const labelOpts = this.options.labels || {};
    let legendItems = callback(labelOpts.generateLabels, [this.chart], this) || [];
    if (labelOpts.filter) {
      legendItems = legendItems.filter((item) => labelOpts.filter(item, this.chart.data));
    }
    if (labelOpts.sort) {
      legendItems = legendItems.sort((a, b) => labelOpts.sort(a, b, this.chart.data));
    }
    if (this.options.reverse) {
      legendItems.reverse();
    }
    this.legendItems = legendItems;
  }
  fit() {
    const { options, ctx } = this;
    if (!options.display) {
      this.width = this.height = 0;
      return;
    }
    const labelOpts = options.labels;
    const labelFont = toFont(labelOpts.font);
    const fontSize = labelFont.size;
    const titleHeight = this._computeTitleHeight();
    const { boxWidth, itemHeight } = getBoxSize(labelOpts, fontSize);
    let width, height;
    ctx.font = labelFont.string;
    if (this.isHorizontal()) {
      width = this.maxWidth;
      height = this._fitRows(titleHeight, fontSize, boxWidth, itemHeight) + 10;
    } else {
      height = this.maxHeight;
      width = this._fitCols(titleHeight, fontSize, boxWidth, itemHeight) + 10;
    }
    this.width = Math.min(width, options.maxWidth || this.maxWidth);
    this.height = Math.min(height, options.maxHeight || this.maxHeight);
  }
  _fitRows(titleHeight, fontSize, boxWidth, itemHeight) {
    const { ctx, maxWidth, options: { labels: { padding } } } = this;
    const hitboxes = this.legendHitBoxes = [];
    const lineWidths = this.lineWidths = [0];
    const lineHeight = itemHeight + padding;
    let totalHeight = titleHeight;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    let row = -1;
    let top = -lineHeight;
    this.legendItems.forEach((legendItem, i) => {
      const itemWidth = boxWidth + fontSize / 2 + ctx.measureText(legendItem.text).width;
      if (i === 0 || lineWidths[lineWidths.length - 1] + itemWidth + 2 * padding > maxWidth) {
        totalHeight += lineHeight;
        lineWidths[lineWidths.length - (i > 0 ? 0 : 1)] = 0;
        top += lineHeight;
        row++;
      }
      hitboxes[i] = { left: 0, top, row, width: itemWidth, height: itemHeight };
      lineWidths[lineWidths.length - 1] += itemWidth + padding;
    });
    return totalHeight;
  }
  _fitCols(titleHeight, fontSize, boxWidth, itemHeight) {
    const { ctx, maxHeight, options: { labels: { padding } } } = this;
    const hitboxes = this.legendHitBoxes = [];
    const columnSizes = this.columnSizes = [];
    const heightLimit = maxHeight - titleHeight;
    let totalWidth = padding;
    let currentColWidth = 0;
    let currentColHeight = 0;
    let left = 0;
    let col = 0;
    this.legendItems.forEach((legendItem, i) => {
      const itemWidth = boxWidth + fontSize / 2 + ctx.measureText(legendItem.text).width;
      if (i > 0 && currentColHeight + itemHeight + 2 * padding > heightLimit) {
        totalWidth += currentColWidth + padding;
        columnSizes.push({ width: currentColWidth, height: currentColHeight });
        left += currentColWidth + padding;
        col++;
        currentColWidth = currentColHeight = 0;
      }
      hitboxes[i] = { left, top: currentColHeight, col, width: itemWidth, height: itemHeight };
      currentColWidth = Math.max(currentColWidth, itemWidth);
      currentColHeight += itemHeight + padding;
    });
    totalWidth += currentColWidth;
    columnSizes.push({ width: currentColWidth, height: currentColHeight });
    return totalWidth;
  }
  adjustHitBoxes() {
    if (!this.options.display) {
      return;
    }
    const titleHeight = this._computeTitleHeight();
    const { legendHitBoxes: hitboxes, options: { align, labels: { padding }, rtl } } = this;
    const rtlHelper = getRtlAdapter(rtl, this.left, this.width);
    if (this.isHorizontal()) {
      let row = 0;
      let left = _alignStartEnd(align, this.left + padding, this.right - this.lineWidths[row]);
      for (const hitbox of hitboxes) {
        if (row !== hitbox.row) {
          row = hitbox.row;
          left = _alignStartEnd(align, this.left + padding, this.right - this.lineWidths[row]);
        }
        hitbox.top += this.top + titleHeight + padding;
        hitbox.left = rtlHelper.leftForLtr(rtlHelper.x(left), hitbox.width);
        left += hitbox.width + padding;
      }
    } else {
      let col = 0;
      let top = _alignStartEnd(align, this.top + titleHeight + padding, this.bottom - this.columnSizes[col].height);
      for (const hitbox of hitboxes) {
        if (hitbox.col !== col) {
          col = hitbox.col;
          top = _alignStartEnd(align, this.top + titleHeight + padding, this.bottom - this.columnSizes[col].height);
        }
        hitbox.top = top;
        hitbox.left += this.left + padding;
        hitbox.left = rtlHelper.leftForLtr(rtlHelper.x(hitbox.left), hitbox.width);
        top += hitbox.height + padding;
      }
    }
  }
  isHorizontal() {
    return this.options.position === "top" || this.options.position === "bottom";
  }
  draw() {
    if (this.options.display) {
      const ctx = this.ctx;
      clipArea(ctx, this);
      this._draw();
      unclipArea(ctx);
    }
  }
  _draw() {
    const { options: opts, columnSizes, lineWidths, ctx } = this;
    const { align, labels: labelOpts } = opts;
    const defaultColor = defaults.color;
    const rtlHelper = getRtlAdapter(opts.rtl, this.left, this.width);
    const labelFont = toFont(labelOpts.font);
    const { color: fontColor, padding } = labelOpts;
    const fontSize = labelFont.size;
    const halfFontSize = fontSize / 2;
    let cursor;
    this.drawTitle();
    ctx.textAlign = rtlHelper.textAlign("left");
    ctx.textBaseline = "middle";
    ctx.lineWidth = 0.5;
    ctx.font = labelFont.string;
    const { boxWidth, boxHeight, itemHeight } = getBoxSize(labelOpts, fontSize);
    const drawLegendBox = /* @__PURE__ */ __name(function(x, y, legendItem) {
      if (isNaN(boxWidth) || boxWidth <= 0 || isNaN(boxHeight) || boxHeight < 0) {
        return;
      }
      ctx.save();
      const lineWidth = valueOrDefault(legendItem.lineWidth, 1);
      ctx.fillStyle = valueOrDefault(legendItem.fillStyle, defaultColor);
      ctx.lineCap = valueOrDefault(legendItem.lineCap, "butt");
      ctx.lineDashOffset = valueOrDefault(legendItem.lineDashOffset, 0);
      ctx.lineJoin = valueOrDefault(legendItem.lineJoin, "miter");
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = valueOrDefault(legendItem.strokeStyle, defaultColor);
      ctx.setLineDash(valueOrDefault(legendItem.lineDash, []));
      if (labelOpts.usePointStyle) {
        const drawOptions = {
          radius: boxHeight * Math.SQRT2 / 2,
          pointStyle: legendItem.pointStyle,
          rotation: legendItem.rotation,
          borderWidth: lineWidth
        };
        const centerX = rtlHelper.xPlus(x, boxWidth / 2);
        const centerY = y + halfFontSize;
        drawPointLegend(ctx, drawOptions, centerX, centerY, labelOpts.pointStyleWidth && boxWidth);
      } else {
        const yBoxTop = y + Math.max((fontSize - boxHeight) / 2, 0);
        const xBoxLeft = rtlHelper.leftForLtr(x, boxWidth);
        const borderRadius = toTRBLCorners(legendItem.borderRadius);
        ctx.beginPath();
        if (Object.values(borderRadius).some((v) => v !== 0)) {
          addRoundedRectPath(ctx, {
            x: xBoxLeft,
            y: yBoxTop,
            w: boxWidth,
            h: boxHeight,
            radius: borderRadius
          });
        } else {
          ctx.rect(xBoxLeft, yBoxTop, boxWidth, boxHeight);
        }
        ctx.fill();
        if (lineWidth !== 0) {
          ctx.stroke();
        }
      }
      ctx.restore();
    }, "drawLegendBox");
    const fillText = /* @__PURE__ */ __name(function(x, y, legendItem) {
      renderText(ctx, legendItem.text, x, y + itemHeight / 2, labelFont, {
        strikethrough: legendItem.hidden,
        textAlign: rtlHelper.textAlign(legendItem.textAlign)
      });
    }, "fillText");
    const isHorizontal = this.isHorizontal();
    const titleHeight = this._computeTitleHeight();
    if (isHorizontal) {
      cursor = {
        x: _alignStartEnd(align, this.left + padding, this.right - lineWidths[0]),
        y: this.top + padding + titleHeight,
        line: 0
      };
    } else {
      cursor = {
        x: this.left + padding,
        y: _alignStartEnd(align, this.top + titleHeight + padding, this.bottom - columnSizes[0].height),
        line: 0
      };
    }
    overrideTextDirection(this.ctx, opts.textDirection);
    const lineHeight = itemHeight + padding;
    this.legendItems.forEach((legendItem, i) => {
      ctx.strokeStyle = legendItem.fontColor || fontColor;
      ctx.fillStyle = legendItem.fontColor || fontColor;
      const textWidth = ctx.measureText(legendItem.text).width;
      const textAlign = rtlHelper.textAlign(legendItem.textAlign || (legendItem.textAlign = labelOpts.textAlign));
      const width = boxWidth + halfFontSize + textWidth;
      let x = cursor.x;
      let y = cursor.y;
      rtlHelper.setWidth(this.width);
      if (isHorizontal) {
        if (i > 0 && x + width + padding > this.right) {
          y = cursor.y += lineHeight;
          cursor.line++;
          x = cursor.x = _alignStartEnd(align, this.left + padding, this.right - lineWidths[cursor.line]);
        }
      } else if (i > 0 && y + lineHeight > this.bottom) {
        x = cursor.x = x + columnSizes[cursor.line].width + padding;
        cursor.line++;
        y = cursor.y = _alignStartEnd(align, this.top + titleHeight + padding, this.bottom - columnSizes[cursor.line].height);
      }
      const realX = rtlHelper.x(x);
      drawLegendBox(realX, y, legendItem);
      x = _textX(textAlign, x + boxWidth + halfFontSize, isHorizontal ? x + width : this.right, opts.rtl);
      fillText(rtlHelper.x(x), y, legendItem);
      if (isHorizontal) {
        cursor.x += width + padding;
      } else {
        cursor.y += lineHeight;
      }
    });
    restoreTextDirection(this.ctx, opts.textDirection);
  }
  drawTitle() {
    const opts = this.options;
    const titleOpts = opts.title;
    const titleFont = toFont(titleOpts.font);
    const titlePadding = toPadding(titleOpts.padding);
    if (!titleOpts.display) {
      return;
    }
    const rtlHelper = getRtlAdapter(opts.rtl, this.left, this.width);
    const ctx = this.ctx;
    const position = titleOpts.position;
    const halfFontSize = titleFont.size / 2;
    const topPaddingPlusHalfFontSize = titlePadding.top + halfFontSize;
    let y;
    let left = this.left;
    let maxWidth = this.width;
    if (this.isHorizontal()) {
      maxWidth = Math.max(...this.lineWidths);
      y = this.top + topPaddingPlusHalfFontSize;
      left = _alignStartEnd(opts.align, left, this.right - maxWidth);
    } else {
      const maxHeight = this.columnSizes.reduce((acc, size) => Math.max(acc, size.height), 0);
      y = topPaddingPlusHalfFontSize + _alignStartEnd(opts.align, this.top, this.bottom - maxHeight - opts.labels.padding - this._computeTitleHeight());
    }
    const x = _alignStartEnd(position, left, left + maxWidth);
    ctx.textAlign = rtlHelper.textAlign(_toLeftRightCenter(position));
    ctx.textBaseline = "middle";
    ctx.strokeStyle = titleOpts.color;
    ctx.fillStyle = titleOpts.color;
    ctx.font = titleFont.string;
    renderText(ctx, titleOpts.text, x, y, titleFont);
  }
  _computeTitleHeight() {
    const titleOpts = this.options.title;
    const titleFont = toFont(titleOpts.font);
    const titlePadding = toPadding(titleOpts.padding);
    return titleOpts.display ? titleFont.lineHeight + titlePadding.height : 0;
  }
  _getLegendItemAt(x, y) {
    let i, hitBox, lh;
    if (_isBetween(x, this.left, this.right) && _isBetween(y, this.top, this.bottom)) {
      lh = this.legendHitBoxes;
      for (i = 0; i < lh.length; ++i) {
        hitBox = lh[i];
        if (_isBetween(x, hitBox.left, hitBox.left + hitBox.width) && _isBetween(y, hitBox.top, hitBox.top + hitBox.height)) {
          return this.legendItems[i];
        }
      }
    }
    return null;
  }
  handleEvent(e) {
    const opts = this.options;
    if (!isListened(e.type, opts)) {
      return;
    }
    const hoveredItem = this._getLegendItemAt(e.x, e.y);
    if (e.type === "mousemove" || e.type === "mouseout") {
      const previous = this._hoveredItem;
      const sameItem = itemsEqual(previous, hoveredItem);
      if (previous && !sameItem) {
        callback(opts.onLeave, [e, previous, this], this);
      }
      this._hoveredItem = hoveredItem;
      if (hoveredItem && !sameItem) {
        callback(opts.onHover, [e, hoveredItem, this], this);
      }
    } else if (hoveredItem) {
      callback(opts.onClick, [e, hoveredItem, this], this);
    }
  }
}
__name(Legend, "Legend");
function isListened(type, opts) {
  if ((type === "mousemove" || type === "mouseout") && (opts.onHover || opts.onLeave)) {
    return true;
  }
  if (opts.onClick && (type === "click" || type === "mouseup")) {
    return true;
  }
  return false;
}
__name(isListened, "isListened");
var plugin_legend = {
  id: "legend",
  _element: Legend,
  start(chart, _args, options) {
    const legend = chart.legend = new Legend({ ctx: chart.ctx, options, chart });
    layouts.configure(chart, legend, options);
    layouts.addBox(chart, legend);
  },
  stop(chart) {
    layouts.removeBox(chart, chart.legend);
    delete chart.legend;
  },
  beforeUpdate(chart, _args, options) {
    const legend = chart.legend;
    layouts.configure(chart, legend, options);
    legend.options = options;
  },
  afterUpdate(chart) {
    const legend = chart.legend;
    legend.buildLabels();
    legend.adjustHitBoxes();
  },
  afterEvent(chart, args) {
    if (!args.replay) {
      chart.legend.handleEvent(args.event);
    }
  },
  defaults: {
    display: true,
    position: "top",
    align: "center",
    fullSize: true,
    reverse: false,
    weight: 1e3,
    onClick(e, legendItem, legend) {
      const index2 = legendItem.datasetIndex;
      const ci = legend.chart;
      if (ci.isDatasetVisible(index2)) {
        ci.hide(index2);
        legendItem.hidden = true;
      } else {
        ci.show(index2);
        legendItem.hidden = false;
      }
    },
    onHover: null,
    onLeave: null,
    labels: {
      color: (ctx) => ctx.chart.options.color,
      boxWidth: 40,
      padding: 10,
      generateLabels(chart) {
        const datasets = chart.data.datasets;
        const { labels: { usePointStyle, pointStyle, textAlign, color: color2 } } = chart.legend.options;
        return chart._getSortedDatasetMetas().map((meta) => {
          const style = meta.controller.getStyle(usePointStyle ? 0 : void 0);
          const borderWidth = toPadding(style.borderWidth);
          return {
            text: datasets[meta.index].label,
            fillStyle: style.backgroundColor,
            fontColor: color2,
            hidden: !meta.visible,
            lineCap: style.borderCapStyle,
            lineDash: style.borderDash,
            lineDashOffset: style.borderDashOffset,
            lineJoin: style.borderJoinStyle,
            lineWidth: (borderWidth.width + borderWidth.height) / 4,
            strokeStyle: style.borderColor,
            pointStyle: pointStyle || style.pointStyle,
            rotation: style.rotation,
            textAlign: textAlign || style.textAlign,
            borderRadius: 0,
            datasetIndex: meta.index
          };
        }, this);
      }
    },
    title: {
      color: (ctx) => ctx.chart.options.color,
      display: false,
      position: "center",
      text: ""
    }
  },
  descriptors: {
    _scriptable: (name) => !name.startsWith("on"),
    labels: {
      _scriptable: (name) => !["generateLabels", "filter", "sort"].includes(name)
    }
  }
};
class Title extends Element {
  constructor(config) {
    super();
    this.chart = config.chart;
    this.options = config.options;
    this.ctx = config.ctx;
    this._padding = void 0;
    this.top = void 0;
    this.bottom = void 0;
    this.left = void 0;
    this.right = void 0;
    this.width = void 0;
    this.height = void 0;
    this.position = void 0;
    this.weight = void 0;
    this.fullSize = void 0;
  }
  update(maxWidth, maxHeight) {
    const opts = this.options;
    this.left = 0;
    this.top = 0;
    if (!opts.display) {
      this.width = this.height = this.right = this.bottom = 0;
      return;
    }
    this.width = this.right = maxWidth;
    this.height = this.bottom = maxHeight;
    const lineCount = isArray(opts.text) ? opts.text.length : 1;
    this._padding = toPadding(opts.padding);
    const textSize = lineCount * toFont(opts.font).lineHeight + this._padding.height;
    if (this.isHorizontal()) {
      this.height = textSize;
    } else {
      this.width = textSize;
    }
  }
  isHorizontal() {
    const pos = this.options.position;
    return pos === "top" || pos === "bottom";
  }
  _drawArgs(offset) {
    const { top, left, bottom, right, options } = this;
    const align = options.align;
    let rotation = 0;
    let maxWidth, titleX, titleY;
    if (this.isHorizontal()) {
      titleX = _alignStartEnd(align, left, right);
      titleY = top + offset;
      maxWidth = right - left;
    } else {
      if (options.position === "left") {
        titleX = left + offset;
        titleY = _alignStartEnd(align, bottom, top);
        rotation = PI * -0.5;
      } else {
        titleX = right - offset;
        titleY = _alignStartEnd(align, top, bottom);
        rotation = PI * 0.5;
      }
      maxWidth = bottom - top;
    }
    return { titleX, titleY, maxWidth, rotation };
  }
  draw() {
    const ctx = this.ctx;
    const opts = this.options;
    if (!opts.display) {
      return;
    }
    const fontOpts = toFont(opts.font);
    const lineHeight = fontOpts.lineHeight;
    const offset = lineHeight / 2 + this._padding.top;
    const { titleX, titleY, maxWidth, rotation } = this._drawArgs(offset);
    renderText(ctx, opts.text, 0, 0, fontOpts, {
      color: opts.color,
      maxWidth,
      rotation,
      textAlign: _toLeftRightCenter(opts.align),
      textBaseline: "middle",
      translation: [titleX, titleY]
    });
  }
}
__name(Title, "Title");
function createTitle(chart, titleOpts) {
  const title = new Title({
    ctx: chart.ctx,
    options: titleOpts,
    chart
  });
  layouts.configure(chart, title, titleOpts);
  layouts.addBox(chart, title);
  chart.titleBlock = title;
}
__name(createTitle, "createTitle");
var plugin_title = {
  id: "title",
  _element: Title,
  start(chart, _args, options) {
    createTitle(chart, options);
  },
  stop(chart) {
    const titleBlock = chart.titleBlock;
    layouts.removeBox(chart, titleBlock);
    delete chart.titleBlock;
  },
  beforeUpdate(chart, _args, options) {
    const title = chart.titleBlock;
    layouts.configure(chart, title, options);
    title.options = options;
  },
  defaults: {
    align: "center",
    display: false,
    font: {
      weight: "bold"
    },
    fullSize: true,
    padding: 10,
    position: "top",
    text: "",
    weight: 2e3
  },
  defaultRoutes: {
    color: "color"
  },
  descriptors: {
    _scriptable: true,
    _indexable: false
  }
};
const map = /* @__PURE__ */ new WeakMap();
var plugin_subtitle = {
  id: "subtitle",
  start(chart, _args, options) {
    const title = new Title({
      ctx: chart.ctx,
      options,
      chart
    });
    layouts.configure(chart, title, options);
    layouts.addBox(chart, title);
    map.set(chart, title);
  },
  stop(chart) {
    layouts.removeBox(chart, map.get(chart));
    map.delete(chart);
  },
  beforeUpdate(chart, _args, options) {
    const title = map.get(chart);
    layouts.configure(chart, title, options);
    title.options = options;
  },
  defaults: {
    align: "center",
    display: false,
    font: {
      weight: "normal"
    },
    fullSize: true,
    padding: 0,
    position: "top",
    text: "",
    weight: 1500
  },
  defaultRoutes: {
    color: "color"
  },
  descriptors: {
    _scriptable: true,
    _indexable: false
  }
};
const positioners = {
  average(items) {
    if (!items.length) {
      return false;
    }
    let i, len;
    let x = 0;
    let y = 0;
    let count = 0;
    for (i = 0, len = items.length; i < len; ++i) {
      const el = items[i].element;
      if (el && el.hasValue()) {
        const pos = el.tooltipPosition();
        x += pos.x;
        y += pos.y;
        ++count;
      }
    }
    return {
      x: x / count,
      y: y / count
    };
  },
  nearest(items, eventPosition) {
    if (!items.length) {
      return false;
    }
    let x = eventPosition.x;
    let y = eventPosition.y;
    let minDistance = Number.POSITIVE_INFINITY;
    let i, len, nearestElement;
    for (i = 0, len = items.length; i < len; ++i) {
      const el = items[i].element;
      if (el && el.hasValue()) {
        const center = el.getCenterPoint();
        const d = distanceBetweenPoints(eventPosition, center);
        if (d < minDistance) {
          minDistance = d;
          nearestElement = el;
        }
      }
    }
    if (nearestElement) {
      const tp = nearestElement.tooltipPosition();
      x = tp.x;
      y = tp.y;
    }
    return {
      x,
      y
    };
  }
};
function pushOrConcat(base, toPush) {
  if (toPush) {
    if (isArray(toPush)) {
      Array.prototype.push.apply(base, toPush);
    } else {
      base.push(toPush);
    }
  }
  return base;
}
__name(pushOrConcat, "pushOrConcat");
function splitNewlines(str) {
  if ((typeof str === "string" || str instanceof String) && str.indexOf("\n") > -1) {
    return str.split("\n");
  }
  return str;
}
__name(splitNewlines, "splitNewlines");
function createTooltipItem(chart, item) {
  const { element: element2, datasetIndex, index: index2 } = item;
  const controller = chart.getDatasetMeta(datasetIndex).controller;
  const { label, value } = controller.getLabelAndValue(index2);
  return {
    chart,
    label,
    parsed: controller.getParsed(index2),
    raw: chart.data.datasets[datasetIndex].data[index2],
    formattedValue: value,
    dataset: controller.getDataset(),
    dataIndex: index2,
    datasetIndex,
    element: element2
  };
}
__name(createTooltipItem, "createTooltipItem");
function getTooltipSize(tooltip, options) {
  const ctx = tooltip.chart.ctx;
  const { body, footer, title } = tooltip;
  const { boxWidth, boxHeight } = options;
  const bodyFont = toFont(options.bodyFont);
  const titleFont = toFont(options.titleFont);
  const footerFont = toFont(options.footerFont);
  const titleLineCount = title.length;
  const footerLineCount = footer.length;
  const bodyLineItemCount = body.length;
  const padding = toPadding(options.padding);
  let height = padding.height;
  let width = 0;
  let combinedBodyLength = body.reduce((count, bodyItem) => count + bodyItem.before.length + bodyItem.lines.length + bodyItem.after.length, 0);
  combinedBodyLength += tooltip.beforeBody.length + tooltip.afterBody.length;
  if (titleLineCount) {
    height += titleLineCount * titleFont.lineHeight + (titleLineCount - 1) * options.titleSpacing + options.titleMarginBottom;
  }
  if (combinedBodyLength) {
    const bodyLineHeight = options.displayColors ? Math.max(boxHeight, bodyFont.lineHeight) : bodyFont.lineHeight;
    height += bodyLineItemCount * bodyLineHeight + (combinedBodyLength - bodyLineItemCount) * bodyFont.lineHeight + (combinedBodyLength - 1) * options.bodySpacing;
  }
  if (footerLineCount) {
    height += options.footerMarginTop + footerLineCount * footerFont.lineHeight + (footerLineCount - 1) * options.footerSpacing;
  }
  let widthPadding = 0;
  const maxLineWidth = /* @__PURE__ */ __name(function(line) {
    width = Math.max(width, ctx.measureText(line).width + widthPadding);
  }, "maxLineWidth");
  ctx.save();
  ctx.font = titleFont.string;
  each(tooltip.title, maxLineWidth);
  ctx.font = bodyFont.string;
  each(tooltip.beforeBody.concat(tooltip.afterBody), maxLineWidth);
  widthPadding = options.displayColors ? boxWidth + 2 + options.boxPadding : 0;
  each(body, (bodyItem) => {
    each(bodyItem.before, maxLineWidth);
    each(bodyItem.lines, maxLineWidth);
    each(bodyItem.after, maxLineWidth);
  });
  widthPadding = 0;
  ctx.font = footerFont.string;
  each(tooltip.footer, maxLineWidth);
  ctx.restore();
  width += padding.width;
  return { width, height };
}
__name(getTooltipSize, "getTooltipSize");
function determineYAlign(chart, size) {
  const { y, height } = size;
  if (y < height / 2) {
    return "top";
  } else if (y > chart.height - height / 2) {
    return "bottom";
  }
  return "center";
}
__name(determineYAlign, "determineYAlign");
function doesNotFitWithAlign(xAlign, chart, options, size) {
  const { x, width } = size;
  const caret = options.caretSize + options.caretPadding;
  if (xAlign === "left" && x + width + caret > chart.width) {
    return true;
  }
  if (xAlign === "right" && x - width - caret < 0) {
    return true;
  }
}
__name(doesNotFitWithAlign, "doesNotFitWithAlign");
function determineXAlign(chart, options, size, yAlign) {
  const { x, width } = size;
  const { width: chartWidth, chartArea: { left, right } } = chart;
  let xAlign = "center";
  if (yAlign === "center") {
    xAlign = x <= (left + right) / 2 ? "left" : "right";
  } else if (x <= width / 2) {
    xAlign = "left";
  } else if (x >= chartWidth - width / 2) {
    xAlign = "right";
  }
  if (doesNotFitWithAlign(xAlign, chart, options, size)) {
    xAlign = "center";
  }
  return xAlign;
}
__name(determineXAlign, "determineXAlign");
function determineAlignment(chart, options, size) {
  const yAlign = size.yAlign || options.yAlign || determineYAlign(chart, size);
  return {
    xAlign: size.xAlign || options.xAlign || determineXAlign(chart, options, size, yAlign),
    yAlign
  };
}
__name(determineAlignment, "determineAlignment");
function alignX(size, xAlign) {
  let { x, width } = size;
  if (xAlign === "right") {
    x -= width;
  } else if (xAlign === "center") {
    x -= width / 2;
  }
  return x;
}
__name(alignX, "alignX");
function alignY(size, yAlign, paddingAndSize) {
  let { y, height } = size;
  if (yAlign === "top") {
    y += paddingAndSize;
  } else if (yAlign === "bottom") {
    y -= height + paddingAndSize;
  } else {
    y -= height / 2;
  }
  return y;
}
__name(alignY, "alignY");
function getBackgroundPoint(options, size, alignment, chart) {
  const { caretSize, caretPadding, cornerRadius } = options;
  const { xAlign, yAlign } = alignment;
  const paddingAndSize = caretSize + caretPadding;
  const { topLeft, topRight, bottomLeft, bottomRight } = toTRBLCorners(cornerRadius);
  let x = alignX(size, xAlign);
  const y = alignY(size, yAlign, paddingAndSize);
  if (yAlign === "center") {
    if (xAlign === "left") {
      x += paddingAndSize;
    } else if (xAlign === "right") {
      x -= paddingAndSize;
    }
  } else if (xAlign === "left") {
    x -= Math.max(topLeft, bottomLeft) + caretSize;
  } else if (xAlign === "right") {
    x += Math.max(topRight, bottomRight) + caretSize;
  }
  return {
    x: _limitValue(x, 0, chart.width - size.width),
    y: _limitValue(y, 0, chart.height - size.height)
  };
}
__name(getBackgroundPoint, "getBackgroundPoint");
function getAlignedX(tooltip, align, options) {
  const padding = toPadding(options.padding);
  return align === "center" ? tooltip.x + tooltip.width / 2 : align === "right" ? tooltip.x + tooltip.width - padding.right : tooltip.x + padding.left;
}
__name(getAlignedX, "getAlignedX");
function getBeforeAfterBodyLines(callback2) {
  return pushOrConcat([], splitNewlines(callback2));
}
__name(getBeforeAfterBodyLines, "getBeforeAfterBodyLines");
function createTooltipContext(parent, tooltip, tooltipItems) {
  return createContext(parent, {
    tooltip,
    tooltipItems,
    type: "tooltip"
  });
}
__name(createTooltipContext, "createTooltipContext");
function overrideCallbacks(callbacks, context) {
  const override = context && context.dataset && context.dataset.tooltip && context.dataset.tooltip.callbacks;
  return override ? callbacks.override(override) : callbacks;
}
__name(overrideCallbacks, "overrideCallbacks");
class Tooltip extends Element {
  constructor(config) {
    super();
    this.opacity = 0;
    this._active = [];
    this._eventPosition = void 0;
    this._size = void 0;
    this._cachedAnimations = void 0;
    this._tooltipItems = [];
    this.$animations = void 0;
    this.$context = void 0;
    this.chart = config.chart || config._chart;
    this._chart = this.chart;
    this.options = config.options;
    this.dataPoints = void 0;
    this.title = void 0;
    this.beforeBody = void 0;
    this.body = void 0;
    this.afterBody = void 0;
    this.footer = void 0;
    this.xAlign = void 0;
    this.yAlign = void 0;
    this.x = void 0;
    this.y = void 0;
    this.height = void 0;
    this.width = void 0;
    this.caretX = void 0;
    this.caretY = void 0;
    this.labelColors = void 0;
    this.labelPointStyles = void 0;
    this.labelTextColors = void 0;
  }
  initialize(options) {
    this.options = options;
    this._cachedAnimations = void 0;
    this.$context = void 0;
  }
  _resolveAnimations() {
    const cached = this._cachedAnimations;
    if (cached) {
      return cached;
    }
    const chart = this.chart;
    const options = this.options.setContext(this.getContext());
    const opts = options.enabled && chart.options.animation && options.animations;
    const animations = new Animations(this.chart, opts);
    if (opts._cacheable) {
      this._cachedAnimations = Object.freeze(animations);
    }
    return animations;
  }
  getContext() {
    return this.$context || (this.$context = createTooltipContext(this.chart.getContext(), this, this._tooltipItems));
  }
  getTitle(context, options) {
    const { callbacks } = options;
    const beforeTitle = callbacks.beforeTitle.apply(this, [context]);
    const title = callbacks.title.apply(this, [context]);
    const afterTitle = callbacks.afterTitle.apply(this, [context]);
    let lines = [];
    lines = pushOrConcat(lines, splitNewlines(beforeTitle));
    lines = pushOrConcat(lines, splitNewlines(title));
    lines = pushOrConcat(lines, splitNewlines(afterTitle));
    return lines;
  }
  getBeforeBody(tooltipItems, options) {
    return getBeforeAfterBodyLines(options.callbacks.beforeBody.apply(this, [tooltipItems]));
  }
  getBody(tooltipItems, options) {
    const { callbacks } = options;
    const bodyItems = [];
    each(tooltipItems, (context) => {
      const bodyItem = {
        before: [],
        lines: [],
        after: []
      };
      const scoped = overrideCallbacks(callbacks, context);
      pushOrConcat(bodyItem.before, splitNewlines(scoped.beforeLabel.call(this, context)));
      pushOrConcat(bodyItem.lines, scoped.label.call(this, context));
      pushOrConcat(bodyItem.after, splitNewlines(scoped.afterLabel.call(this, context)));
      bodyItems.push(bodyItem);
    });
    return bodyItems;
  }
  getAfterBody(tooltipItems, options) {
    return getBeforeAfterBodyLines(options.callbacks.afterBody.apply(this, [tooltipItems]));
  }
  getFooter(tooltipItems, options) {
    const { callbacks } = options;
    const beforeFooter = callbacks.beforeFooter.apply(this, [tooltipItems]);
    const footer = callbacks.footer.apply(this, [tooltipItems]);
    const afterFooter = callbacks.afterFooter.apply(this, [tooltipItems]);
    let lines = [];
    lines = pushOrConcat(lines, splitNewlines(beforeFooter));
    lines = pushOrConcat(lines, splitNewlines(footer));
    lines = pushOrConcat(lines, splitNewlines(afterFooter));
    return lines;
  }
  _createItems(options) {
    const active2 = this._active;
    const data = this.chart.data;
    const labelColors = [];
    const labelPointStyles = [];
    const labelTextColors = [];
    let tooltipItems = [];
    let i, len;
    for (i = 0, len = active2.length; i < len; ++i) {
      tooltipItems.push(createTooltipItem(this.chart, active2[i]));
    }
    if (options.filter) {
      tooltipItems = tooltipItems.filter((element2, index2, array) => options.filter(element2, index2, array, data));
    }
    if (options.itemSort) {
      tooltipItems = tooltipItems.sort((a, b) => options.itemSort(a, b, data));
    }
    each(tooltipItems, (context) => {
      const scoped = overrideCallbacks(options.callbacks, context);
      labelColors.push(scoped.labelColor.call(this, context));
      labelPointStyles.push(scoped.labelPointStyle.call(this, context));
      labelTextColors.push(scoped.labelTextColor.call(this, context));
    });
    this.labelColors = labelColors;
    this.labelPointStyles = labelPointStyles;
    this.labelTextColors = labelTextColors;
    this.dataPoints = tooltipItems;
    return tooltipItems;
  }
  update(changed, replay) {
    const options = this.options.setContext(this.getContext());
    const active2 = this._active;
    let properties;
    let tooltipItems = [];
    if (!active2.length) {
      if (this.opacity !== 0) {
        properties = {
          opacity: 0
        };
      }
    } else {
      const position = positioners[options.position].call(this, active2, this._eventPosition);
      tooltipItems = this._createItems(options);
      this.title = this.getTitle(tooltipItems, options);
      this.beforeBody = this.getBeforeBody(tooltipItems, options);
      this.body = this.getBody(tooltipItems, options);
      this.afterBody = this.getAfterBody(tooltipItems, options);
      this.footer = this.getFooter(tooltipItems, options);
      const size = this._size = getTooltipSize(this, options);
      const positionAndSize = Object.assign({}, position, size);
      const alignment = determineAlignment(this.chart, options, positionAndSize);
      const backgroundPoint = getBackgroundPoint(options, positionAndSize, alignment, this.chart);
      this.xAlign = alignment.xAlign;
      this.yAlign = alignment.yAlign;
      properties = {
        opacity: 1,
        x: backgroundPoint.x,
        y: backgroundPoint.y,
        width: size.width,
        height: size.height,
        caretX: position.x,
        caretY: position.y
      };
    }
    this._tooltipItems = tooltipItems;
    this.$context = void 0;
    if (properties) {
      this._resolveAnimations().update(this, properties);
    }
    if (changed && options.external) {
      options.external.call(this, { chart: this.chart, tooltip: this, replay });
    }
  }
  drawCaret(tooltipPoint, ctx, size, options) {
    const caretPosition = this.getCaretPosition(tooltipPoint, size, options);
    ctx.lineTo(caretPosition.x1, caretPosition.y1);
    ctx.lineTo(caretPosition.x2, caretPosition.y2);
    ctx.lineTo(caretPosition.x3, caretPosition.y3);
  }
  getCaretPosition(tooltipPoint, size, options) {
    const { xAlign, yAlign } = this;
    const { caretSize, cornerRadius } = options;
    const { topLeft, topRight, bottomLeft, bottomRight } = toTRBLCorners(cornerRadius);
    const { x: ptX, y: ptY } = tooltipPoint;
    const { width, height } = size;
    let x1, x2, x3, y1, y2, y3;
    if (yAlign === "center") {
      y2 = ptY + height / 2;
      if (xAlign === "left") {
        x1 = ptX;
        x2 = x1 - caretSize;
        y1 = y2 + caretSize;
        y3 = y2 - caretSize;
      } else {
        x1 = ptX + width;
        x2 = x1 + caretSize;
        y1 = y2 - caretSize;
        y3 = y2 + caretSize;
      }
      x3 = x1;
    } else {
      if (xAlign === "left") {
        x2 = ptX + Math.max(topLeft, bottomLeft) + caretSize;
      } else if (xAlign === "right") {
        x2 = ptX + width - Math.max(topRight, bottomRight) - caretSize;
      } else {
        x2 = this.caretX;
      }
      if (yAlign === "top") {
        y1 = ptY;
        y2 = y1 - caretSize;
        x1 = x2 - caretSize;
        x3 = x2 + caretSize;
      } else {
        y1 = ptY + height;
        y2 = y1 + caretSize;
        x1 = x2 + caretSize;
        x3 = x2 - caretSize;
      }
      y3 = y1;
    }
    return { x1, x2, x3, y1, y2, y3 };
  }
  drawTitle(pt, ctx, options) {
    const title = this.title;
    const length = title.length;
    let titleFont, titleSpacing, i;
    if (length) {
      const rtlHelper = getRtlAdapter(options.rtl, this.x, this.width);
      pt.x = getAlignedX(this, options.titleAlign, options);
      ctx.textAlign = rtlHelper.textAlign(options.titleAlign);
      ctx.textBaseline = "middle";
      titleFont = toFont(options.titleFont);
      titleSpacing = options.titleSpacing;
      ctx.fillStyle = options.titleColor;
      ctx.font = titleFont.string;
      for (i = 0; i < length; ++i) {
        ctx.fillText(title[i], rtlHelper.x(pt.x), pt.y + titleFont.lineHeight / 2);
        pt.y += titleFont.lineHeight + titleSpacing;
        if (i + 1 === length) {
          pt.y += options.titleMarginBottom - titleSpacing;
        }
      }
    }
  }
  _drawColorBox(ctx, pt, i, rtlHelper, options) {
    const labelColors = this.labelColors[i];
    const labelPointStyle = this.labelPointStyles[i];
    const { boxHeight, boxWidth, boxPadding } = options;
    const bodyFont = toFont(options.bodyFont);
    const colorX = getAlignedX(this, "left", options);
    const rtlColorX = rtlHelper.x(colorX);
    const yOffSet = boxHeight < bodyFont.lineHeight ? (bodyFont.lineHeight - boxHeight) / 2 : 0;
    const colorY = pt.y + yOffSet;
    if (options.usePointStyle) {
      const drawOptions = {
        radius: Math.min(boxWidth, boxHeight) / 2,
        pointStyle: labelPointStyle.pointStyle,
        rotation: labelPointStyle.rotation,
        borderWidth: 1
      };
      const centerX = rtlHelper.leftForLtr(rtlColorX, boxWidth) + boxWidth / 2;
      const centerY = colorY + boxHeight / 2;
      ctx.strokeStyle = options.multiKeyBackground;
      ctx.fillStyle = options.multiKeyBackground;
      drawPoint(ctx, drawOptions, centerX, centerY);
      ctx.strokeStyle = labelColors.borderColor;
      ctx.fillStyle = labelColors.backgroundColor;
      drawPoint(ctx, drawOptions, centerX, centerY);
    } else {
      ctx.lineWidth = isObject(labelColors.borderWidth) ? Math.max(...Object.values(labelColors.borderWidth)) : labelColors.borderWidth || 1;
      ctx.strokeStyle = labelColors.borderColor;
      ctx.setLineDash(labelColors.borderDash || []);
      ctx.lineDashOffset = labelColors.borderDashOffset || 0;
      const outerX = rtlHelper.leftForLtr(rtlColorX, boxWidth - boxPadding);
      const innerX = rtlHelper.leftForLtr(rtlHelper.xPlus(rtlColorX, 1), boxWidth - boxPadding - 2);
      const borderRadius = toTRBLCorners(labelColors.borderRadius);
      if (Object.values(borderRadius).some((v) => v !== 0)) {
        ctx.beginPath();
        ctx.fillStyle = options.multiKeyBackground;
        addRoundedRectPath(ctx, {
          x: outerX,
          y: colorY,
          w: boxWidth,
          h: boxHeight,
          radius: borderRadius
        });
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = labelColors.backgroundColor;
        ctx.beginPath();
        addRoundedRectPath(ctx, {
          x: innerX,
          y: colorY + 1,
          w: boxWidth - 2,
          h: boxHeight - 2,
          radius: borderRadius
        });
        ctx.fill();
      } else {
        ctx.fillStyle = options.multiKeyBackground;
        ctx.fillRect(outerX, colorY, boxWidth, boxHeight);
        ctx.strokeRect(outerX, colorY, boxWidth, boxHeight);
        ctx.fillStyle = labelColors.backgroundColor;
        ctx.fillRect(innerX, colorY + 1, boxWidth - 2, boxHeight - 2);
      }
    }
    ctx.fillStyle = this.labelTextColors[i];
  }
  drawBody(pt, ctx, options) {
    const { body } = this;
    const { bodySpacing, bodyAlign, displayColors, boxHeight, boxWidth, boxPadding } = options;
    const bodyFont = toFont(options.bodyFont);
    let bodyLineHeight = bodyFont.lineHeight;
    let xLinePadding = 0;
    const rtlHelper = getRtlAdapter(options.rtl, this.x, this.width);
    const fillLineOfText = /* @__PURE__ */ __name(function(line) {
      ctx.fillText(line, rtlHelper.x(pt.x + xLinePadding), pt.y + bodyLineHeight / 2);
      pt.y += bodyLineHeight + bodySpacing;
    }, "fillLineOfText");
    const bodyAlignForCalculation = rtlHelper.textAlign(bodyAlign);
    let bodyItem, textColor, lines, i, j, ilen, jlen;
    ctx.textAlign = bodyAlign;
    ctx.textBaseline = "middle";
    ctx.font = bodyFont.string;
    pt.x = getAlignedX(this, bodyAlignForCalculation, options);
    ctx.fillStyle = options.bodyColor;
    each(this.beforeBody, fillLineOfText);
    xLinePadding = displayColors && bodyAlignForCalculation !== "right" ? bodyAlign === "center" ? boxWidth / 2 + boxPadding : boxWidth + 2 + boxPadding : 0;
    for (i = 0, ilen = body.length; i < ilen; ++i) {
      bodyItem = body[i];
      textColor = this.labelTextColors[i];
      ctx.fillStyle = textColor;
      each(bodyItem.before, fillLineOfText);
      lines = bodyItem.lines;
      if (displayColors && lines.length) {
        this._drawColorBox(ctx, pt, i, rtlHelper, options);
        bodyLineHeight = Math.max(bodyFont.lineHeight, boxHeight);
      }
      for (j = 0, jlen = lines.length; j < jlen; ++j) {
        fillLineOfText(lines[j]);
        bodyLineHeight = bodyFont.lineHeight;
      }
      each(bodyItem.after, fillLineOfText);
    }
    xLinePadding = 0;
    bodyLineHeight = bodyFont.lineHeight;
    each(this.afterBody, fillLineOfText);
    pt.y -= bodySpacing;
  }
  drawFooter(pt, ctx, options) {
    const footer = this.footer;
    const length = footer.length;
    let footerFont, i;
    if (length) {
      const rtlHelper = getRtlAdapter(options.rtl, this.x, this.width);
      pt.x = getAlignedX(this, options.footerAlign, options);
      pt.y += options.footerMarginTop;
      ctx.textAlign = rtlHelper.textAlign(options.footerAlign);
      ctx.textBaseline = "middle";
      footerFont = toFont(options.footerFont);
      ctx.fillStyle = options.footerColor;
      ctx.font = footerFont.string;
      for (i = 0; i < length; ++i) {
        ctx.fillText(footer[i], rtlHelper.x(pt.x), pt.y + footerFont.lineHeight / 2);
        pt.y += footerFont.lineHeight + options.footerSpacing;
      }
    }
  }
  drawBackground(pt, ctx, tooltipSize, options) {
    const { xAlign, yAlign } = this;
    const { x, y } = pt;
    const { width, height } = tooltipSize;
    const { topLeft, topRight, bottomLeft, bottomRight } = toTRBLCorners(options.cornerRadius);
    ctx.fillStyle = options.backgroundColor;
    ctx.strokeStyle = options.borderColor;
    ctx.lineWidth = options.borderWidth;
    ctx.beginPath();
    ctx.moveTo(x + topLeft, y);
    if (yAlign === "top") {
      this.drawCaret(pt, ctx, tooltipSize, options);
    }
    ctx.lineTo(x + width - topRight, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + topRight);
    if (yAlign === "center" && xAlign === "right") {
      this.drawCaret(pt, ctx, tooltipSize, options);
    }
    ctx.lineTo(x + width, y + height - bottomRight);
    ctx.quadraticCurveTo(x + width, y + height, x + width - bottomRight, y + height);
    if (yAlign === "bottom") {
      this.drawCaret(pt, ctx, tooltipSize, options);
    }
    ctx.lineTo(x + bottomLeft, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - bottomLeft);
    if (yAlign === "center" && xAlign === "left") {
      this.drawCaret(pt, ctx, tooltipSize, options);
    }
    ctx.lineTo(x, y + topLeft);
    ctx.quadraticCurveTo(x, y, x + topLeft, y);
    ctx.closePath();
    ctx.fill();
    if (options.borderWidth > 0) {
      ctx.stroke();
    }
  }
  _updateAnimationTarget(options) {
    const chart = this.chart;
    const anims = this.$animations;
    const animX = anims && anims.x;
    const animY = anims && anims.y;
    if (animX || animY) {
      const position = positioners[options.position].call(this, this._active, this._eventPosition);
      if (!position) {
        return;
      }
      const size = this._size = getTooltipSize(this, options);
      const positionAndSize = Object.assign({}, position, this._size);
      const alignment = determineAlignment(chart, options, positionAndSize);
      const point = getBackgroundPoint(options, positionAndSize, alignment, chart);
      if (animX._to !== point.x || animY._to !== point.y) {
        this.xAlign = alignment.xAlign;
        this.yAlign = alignment.yAlign;
        this.width = size.width;
        this.height = size.height;
        this.caretX = position.x;
        this.caretY = position.y;
        this._resolveAnimations().update(this, point);
      }
    }
  }
  _willRender() {
    return !!this.opacity;
  }
  draw(ctx) {
    const options = this.options.setContext(this.getContext());
    let opacity = this.opacity;
    if (!opacity) {
      return;
    }
    this._updateAnimationTarget(options);
    const tooltipSize = {
      width: this.width,
      height: this.height
    };
    const pt = {
      x: this.x,
      y: this.y
    };
    opacity = Math.abs(opacity) < 1e-3 ? 0 : opacity;
    const padding = toPadding(options.padding);
    const hasTooltipContent = this.title.length || this.beforeBody.length || this.body.length || this.afterBody.length || this.footer.length;
    if (options.enabled && hasTooltipContent) {
      ctx.save();
      ctx.globalAlpha = opacity;
      this.drawBackground(pt, ctx, tooltipSize, options);
      overrideTextDirection(ctx, options.textDirection);
      pt.y += padding.top;
      this.drawTitle(pt, ctx, options);
      this.drawBody(pt, ctx, options);
      this.drawFooter(pt, ctx, options);
      restoreTextDirection(ctx, options.textDirection);
      ctx.restore();
    }
  }
  getActiveElements() {
    return this._active || [];
  }
  setActiveElements(activeElements, eventPosition) {
    const lastActive = this._active;
    const active2 = activeElements.map(({ datasetIndex, index: index2 }) => {
      const meta = this.chart.getDatasetMeta(datasetIndex);
      if (!meta) {
        throw new Error("Cannot find a dataset at index " + datasetIndex);
      }
      return {
        datasetIndex,
        element: meta.data[index2],
        index: index2
      };
    });
    const changed = !_elementsEqual(lastActive, active2);
    const positionChanged = this._positionChanged(active2, eventPosition);
    if (changed || positionChanged) {
      this._active = active2;
      this._eventPosition = eventPosition;
      this._ignoreReplayEvents = true;
      this.update(true);
    }
  }
  handleEvent(e, replay, inChartArea = true) {
    if (replay && this._ignoreReplayEvents) {
      return false;
    }
    this._ignoreReplayEvents = false;
    const options = this.options;
    const lastActive = this._active || [];
    const active2 = this._getActiveElements(e, lastActive, replay, inChartArea);
    const positionChanged = this._positionChanged(active2, e);
    const changed = replay || !_elementsEqual(active2, lastActive) || positionChanged;
    if (changed) {
      this._active = active2;
      if (options.enabled || options.external) {
        this._eventPosition = {
          x: e.x,
          y: e.y
        };
        this.update(true, replay);
      }
    }
    return changed;
  }
  _getActiveElements(e, lastActive, replay, inChartArea) {
    const options = this.options;
    if (e.type === "mouseout") {
      return [];
    }
    if (!inChartArea) {
      return lastActive;
    }
    const active2 = this.chart.getElementsAtEventForMode(e, options.mode, options, replay);
    if (options.reverse) {
      active2.reverse();
    }
    return active2;
  }
  _positionChanged(active2, e) {
    const { caretX, caretY, options } = this;
    const position = positioners[options.position].call(this, active2, e);
    return position !== false && (caretX !== position.x || caretY !== position.y);
  }
}
__name(Tooltip, "Tooltip");
Tooltip.positioners = positioners;
var plugin_tooltip = {
  id: "tooltip",
  _element: Tooltip,
  positioners,
  afterInit(chart, _args, options) {
    if (options) {
      chart.tooltip = new Tooltip({ chart, options });
    }
  },
  beforeUpdate(chart, _args, options) {
    if (chart.tooltip) {
      chart.tooltip.initialize(options);
    }
  },
  reset(chart, _args, options) {
    if (chart.tooltip) {
      chart.tooltip.initialize(options);
    }
  },
  afterDraw(chart) {
    const tooltip = chart.tooltip;
    if (tooltip && tooltip._willRender()) {
      const args = {
        tooltip
      };
      if (chart.notifyPlugins("beforeTooltipDraw", args) === false) {
        return;
      }
      tooltip.draw(chart.ctx);
      chart.notifyPlugins("afterTooltipDraw", args);
    }
  },
  afterEvent(chart, args) {
    if (chart.tooltip) {
      const useFinalPosition = args.replay;
      if (chart.tooltip.handleEvent(args.event, useFinalPosition, args.inChartArea)) {
        args.changed = true;
      }
    }
  },
  defaults: {
    enabled: true,
    external: null,
    position: "average",
    backgroundColor: "rgba(0,0,0,0.8)",
    titleColor: "#fff",
    titleFont: {
      weight: "bold"
    },
    titleSpacing: 2,
    titleMarginBottom: 6,
    titleAlign: "left",
    bodyColor: "#fff",
    bodySpacing: 2,
    bodyFont: {},
    bodyAlign: "left",
    footerColor: "#fff",
    footerSpacing: 2,
    footerMarginTop: 6,
    footerFont: {
      weight: "bold"
    },
    footerAlign: "left",
    padding: 6,
    caretPadding: 2,
    caretSize: 5,
    cornerRadius: 6,
    boxHeight: (ctx, opts) => opts.bodyFont.size,
    boxWidth: (ctx, opts) => opts.bodyFont.size,
    multiKeyBackground: "#fff",
    displayColors: true,
    boxPadding: 0,
    borderColor: "rgba(0,0,0,0)",
    borderWidth: 0,
    animation: {
      duration: 400,
      easing: "easeOutQuart"
    },
    animations: {
      numbers: {
        type: "number",
        properties: ["x", "y", "width", "height", "caretX", "caretY"]
      },
      opacity: {
        easing: "linear",
        duration: 200
      }
    },
    callbacks: {
      beforeTitle: noop,
      title(tooltipItems) {
        if (tooltipItems.length > 0) {
          const item = tooltipItems[0];
          const labels = item.chart.data.labels;
          const labelCount = labels ? labels.length : 0;
          if (this && this.options && this.options.mode === "dataset") {
            return item.dataset.label || "";
          } else if (item.label) {
            return item.label;
          } else if (labelCount > 0 && item.dataIndex < labelCount) {
            return labels[item.dataIndex];
          }
        }
        return "";
      },
      afterTitle: noop,
      beforeBody: noop,
      beforeLabel: noop,
      label(tooltipItem) {
        if (this && this.options && this.options.mode === "dataset") {
          return tooltipItem.label + ": " + tooltipItem.formattedValue || tooltipItem.formattedValue;
        }
        let label = tooltipItem.dataset.label || "";
        if (label) {
          label += ": ";
        }
        const value = tooltipItem.formattedValue;
        if (!isNullOrUndef(value)) {
          label += value;
        }
        return label;
      },
      labelColor(tooltipItem) {
        const meta = tooltipItem.chart.getDatasetMeta(tooltipItem.datasetIndex);
        const options = meta.controller.getStyle(tooltipItem.dataIndex);
        return {
          borderColor: options.borderColor,
          backgroundColor: options.backgroundColor,
          borderWidth: options.borderWidth,
          borderDash: options.borderDash,
          borderDashOffset: options.borderDashOffset,
          borderRadius: 0
        };
      },
      labelTextColor() {
        return this.options.bodyColor;
      },
      labelPointStyle(tooltipItem) {
        const meta = tooltipItem.chart.getDatasetMeta(tooltipItem.datasetIndex);
        const options = meta.controller.getStyle(tooltipItem.dataIndex);
        return {
          pointStyle: options.pointStyle,
          rotation: options.rotation
        };
      },
      afterLabel: noop,
      afterBody: noop,
      beforeFooter: noop,
      footer: noop,
      afterFooter: noop
    }
  },
  defaultRoutes: {
    bodyFont: "font",
    footerFont: "font",
    titleFont: "font"
  },
  descriptors: {
    _scriptable: (name) => name !== "filter" && name !== "itemSort" && name !== "external",
    _indexable: false,
    callbacks: {
      _scriptable: false,
      _indexable: false
    },
    animation: {
      _fallback: false
    },
    animations: {
      _fallback: "animation"
    }
  },
  additionalOptionScopes: ["interaction"]
};
var plugins = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  Decimation: plugin_decimation,
  Filler: index,
  Legend: plugin_legend,
  SubTitle: plugin_subtitle,
  Title: plugin_title,
  Tooltip: plugin_tooltip
});
const addIfString = /* @__PURE__ */ __name((labels, raw, index2, addedLabels) => {
  if (typeof raw === "string") {
    index2 = labels.push(raw) - 1;
    addedLabels.unshift({ index: index2, label: raw });
  } else if (isNaN(raw)) {
    index2 = null;
  }
  return index2;
}, "addIfString");
function findOrAddLabel(labels, raw, index2, addedLabels) {
  const first = labels.indexOf(raw);
  if (first === -1) {
    return addIfString(labels, raw, index2, addedLabels);
  }
  const last = labels.lastIndexOf(raw);
  return first !== last ? index2 : first;
}
__name(findOrAddLabel, "findOrAddLabel");
const validIndex = /* @__PURE__ */ __name((index2, max) => index2 === null ? null : _limitValue(Math.round(index2), 0, max), "validIndex");
class CategoryScale extends Scale {
  constructor(cfg) {
    super(cfg);
    this._startValue = void 0;
    this._valueRange = 0;
    this._addedLabels = [];
  }
  init(scaleOptions) {
    const added = this._addedLabels;
    if (added.length) {
      const labels = this.getLabels();
      for (const { index: index2, label } of added) {
        if (labels[index2] === label) {
          labels.splice(index2, 1);
        }
      }
      this._addedLabels = [];
    }
    super.init(scaleOptions);
  }
  parse(raw, index2) {
    if (isNullOrUndef(raw)) {
      return null;
    }
    const labels = this.getLabels();
    index2 = isFinite(index2) && labels[index2] === raw ? index2 : findOrAddLabel(labels, raw, valueOrDefault(index2, raw), this._addedLabels);
    return validIndex(index2, labels.length - 1);
  }
  determineDataLimits() {
    const { minDefined, maxDefined } = this.getUserBounds();
    let { min, max } = this.getMinMax(true);
    if (this.options.bounds === "ticks") {
      if (!minDefined) {
        min = 0;
      }
      if (!maxDefined) {
        max = this.getLabels().length - 1;
      }
    }
    this.min = min;
    this.max = max;
  }
  buildTicks() {
    const min = this.min;
    const max = this.max;
    const offset = this.options.offset;
    const ticks = [];
    let labels = this.getLabels();
    labels = min === 0 && max === labels.length - 1 ? labels : labels.slice(min, max + 1);
    this._valueRange = Math.max(labels.length - (offset ? 0 : 1), 1);
    this._startValue = this.min - (offset ? 0.5 : 0);
    for (let value = min; value <= max; value++) {
      ticks.push({ value });
    }
    return ticks;
  }
  getLabelForValue(value) {
    const labels = this.getLabels();
    if (value >= 0 && value < labels.length) {
      return labels[value];
    }
    return value;
  }
  configure() {
    super.configure();
    if (!this.isHorizontal()) {
      this._reversePixels = !this._reversePixels;
    }
  }
  getPixelForValue(value) {
    if (typeof value !== "number") {
      value = this.parse(value);
    }
    return value === null ? NaN : this.getPixelForDecimal((value - this._startValue) / this._valueRange);
  }
  getPixelForTick(index2) {
    const ticks = this.ticks;
    if (index2 < 0 || index2 > ticks.length - 1) {
      return null;
    }
    return this.getPixelForValue(ticks[index2].value);
  }
  getValueForPixel(pixel) {
    return Math.round(this._startValue + this.getDecimalForPixel(pixel) * this._valueRange);
  }
  getBasePixel() {
    return this.bottom;
  }
}
__name(CategoryScale, "CategoryScale");
CategoryScale.id = "category";
CategoryScale.defaults = {
  ticks: {
    callback: CategoryScale.prototype.getLabelForValue
  }
};
function generateTicks$1(generationOptions, dataRange) {
  const ticks = [];
  const MIN_SPACING = 1e-14;
  const { bounds, step, min, max, precision, count, maxTicks, maxDigits, includeBounds } = generationOptions;
  const unit = step || 1;
  const maxSpaces = maxTicks - 1;
  const { min: rmin, max: rmax } = dataRange;
  const minDefined = !isNullOrUndef(min);
  const maxDefined = !isNullOrUndef(max);
  const countDefined = !isNullOrUndef(count);
  const minSpacing = (rmax - rmin) / (maxDigits + 1);
  let spacing = niceNum((rmax - rmin) / maxSpaces / unit) * unit;
  let factor, niceMin, niceMax, numSpaces;
  if (spacing < MIN_SPACING && !minDefined && !maxDefined) {
    return [{ value: rmin }, { value: rmax }];
  }
  numSpaces = Math.ceil(rmax / spacing) - Math.floor(rmin / spacing);
  if (numSpaces > maxSpaces) {
    spacing = niceNum(numSpaces * spacing / maxSpaces / unit) * unit;
  }
  if (!isNullOrUndef(precision)) {
    factor = Math.pow(10, precision);
    spacing = Math.ceil(spacing * factor) / factor;
  }
  if (bounds === "ticks") {
    niceMin = Math.floor(rmin / spacing) * spacing;
    niceMax = Math.ceil(rmax / spacing) * spacing;
  } else {
    niceMin = rmin;
    niceMax = rmax;
  }
  if (minDefined && maxDefined && step && almostWhole((max - min) / step, spacing / 1e3)) {
    numSpaces = Math.round(Math.min((max - min) / spacing, maxTicks));
    spacing = (max - min) / numSpaces;
    niceMin = min;
    niceMax = max;
  } else if (countDefined) {
    niceMin = minDefined ? min : niceMin;
    niceMax = maxDefined ? max : niceMax;
    numSpaces = count - 1;
    spacing = (niceMax - niceMin) / numSpaces;
  } else {
    numSpaces = (niceMax - niceMin) / spacing;
    if (almostEquals(numSpaces, Math.round(numSpaces), spacing / 1e3)) {
      numSpaces = Math.round(numSpaces);
    } else {
      numSpaces = Math.ceil(numSpaces);
    }
  }
  const decimalPlaces = Math.max(
    _decimalPlaces(spacing),
    _decimalPlaces(niceMin)
  );
  factor = Math.pow(10, isNullOrUndef(precision) ? decimalPlaces : precision);
  niceMin = Math.round(niceMin * factor) / factor;
  niceMax = Math.round(niceMax * factor) / factor;
  let j = 0;
  if (minDefined) {
    if (includeBounds && niceMin !== min) {
      ticks.push({ value: min });
      if (niceMin < min) {
        j++;
      }
      if (almostEquals(Math.round((niceMin + j * spacing) * factor) / factor, min, relativeLabelSize(min, minSpacing, generationOptions))) {
        j++;
      }
    } else if (niceMin < min) {
      j++;
    }
  }
  for (; j < numSpaces; ++j) {
    ticks.push({ value: Math.round((niceMin + j * spacing) * factor) / factor });
  }
  if (maxDefined && includeBounds && niceMax !== max) {
    if (ticks.length && almostEquals(ticks[ticks.length - 1].value, max, relativeLabelSize(max, minSpacing, generationOptions))) {
      ticks[ticks.length - 1].value = max;
    } else {
      ticks.push({ value: max });
    }
  } else if (!maxDefined || niceMax === max) {
    ticks.push({ value: niceMax });
  }
  return ticks;
}
__name(generateTicks$1, "generateTicks$1");
function relativeLabelSize(value, minSpacing, { horizontal, minRotation }) {
  const rad = toRadians(minRotation);
  const ratio = (horizontal ? Math.sin(rad) : Math.cos(rad)) || 1e-3;
  const length = 0.75 * minSpacing * ("" + value).length;
  return Math.min(minSpacing / ratio, length);
}
__name(relativeLabelSize, "relativeLabelSize");
class LinearScaleBase extends Scale {
  constructor(cfg) {
    super(cfg);
    this.start = void 0;
    this.end = void 0;
    this._startValue = void 0;
    this._endValue = void 0;
    this._valueRange = 0;
  }
  parse(raw, index2) {
    if (isNullOrUndef(raw)) {
      return null;
    }
    if ((typeof raw === "number" || raw instanceof Number) && !isFinite(+raw)) {
      return null;
    }
    return +raw;
  }
  handleTickRangeOptions() {
    const { beginAtZero } = this.options;
    const { minDefined, maxDefined } = this.getUserBounds();
    let { min, max } = this;
    const setMin = /* @__PURE__ */ __name((v) => min = minDefined ? min : v, "setMin");
    const setMax = /* @__PURE__ */ __name((v) => max = maxDefined ? max : v, "setMax");
    if (beginAtZero) {
      const minSign = sign(min);
      const maxSign = sign(max);
      if (minSign < 0 && maxSign < 0) {
        setMax(0);
      } else if (minSign > 0 && maxSign > 0) {
        setMin(0);
      }
    }
    if (min === max) {
      let offset = 1;
      if (max >= Number.MAX_SAFE_INTEGER || min <= Number.MIN_SAFE_INTEGER) {
        offset = Math.abs(max * 0.05);
      }
      setMax(max + offset);
      if (!beginAtZero) {
        setMin(min - offset);
      }
    }
    this.min = min;
    this.max = max;
  }
  getTickLimit() {
    const tickOpts = this.options.ticks;
    let { maxTicksLimit, stepSize } = tickOpts;
    let maxTicks;
    if (stepSize) {
      maxTicks = Math.ceil(this.max / stepSize) - Math.floor(this.min / stepSize) + 1;
      if (maxTicks > 1e3) {
        console.warn(`scales.${this.id}.ticks.stepSize: ${stepSize} would result generating up to ${maxTicks} ticks. Limiting to 1000.`);
        maxTicks = 1e3;
      }
    } else {
      maxTicks = this.computeTickLimit();
      maxTicksLimit = maxTicksLimit || 11;
    }
    if (maxTicksLimit) {
      maxTicks = Math.min(maxTicksLimit, maxTicks);
    }
    return maxTicks;
  }
  computeTickLimit() {
    return Number.POSITIVE_INFINITY;
  }
  buildTicks() {
    const opts = this.options;
    const tickOpts = opts.ticks;
    let maxTicks = this.getTickLimit();
    maxTicks = Math.max(2, maxTicks);
    const numericGeneratorOptions = {
      maxTicks,
      bounds: opts.bounds,
      min: opts.min,
      max: opts.max,
      precision: tickOpts.precision,
      step: tickOpts.stepSize,
      count: tickOpts.count,
      maxDigits: this._maxDigits(),
      horizontal: this.isHorizontal(),
      minRotation: tickOpts.minRotation || 0,
      includeBounds: tickOpts.includeBounds !== false
    };
    const dataRange = this._range || this;
    const ticks = generateTicks$1(numericGeneratorOptions, dataRange);
    if (opts.bounds === "ticks") {
      _setMinAndMaxByKey(ticks, this, "value");
    }
    if (opts.reverse) {
      ticks.reverse();
      this.start = this.max;
      this.end = this.min;
    } else {
      this.start = this.min;
      this.end = this.max;
    }
    return ticks;
  }
  configure() {
    const ticks = this.ticks;
    let start = this.min;
    let end = this.max;
    super.configure();
    if (this.options.offset && ticks.length) {
      const offset = (end - start) / Math.max(ticks.length - 1, 1) / 2;
      start -= offset;
      end += offset;
    }
    this._startValue = start;
    this._endValue = end;
    this._valueRange = end - start;
  }
  getLabelForValue(value) {
    return formatNumber(value, this.chart.options.locale, this.options.ticks.format);
  }
}
__name(LinearScaleBase, "LinearScaleBase");
class LinearScale extends LinearScaleBase {
  determineDataLimits() {
    const { min, max } = this.getMinMax(true);
    this.min = isNumberFinite(min) ? min : 0;
    this.max = isNumberFinite(max) ? max : 1;
    this.handleTickRangeOptions();
  }
  computeTickLimit() {
    const horizontal = this.isHorizontal();
    const length = horizontal ? this.width : this.height;
    const minRotation = toRadians(this.options.ticks.minRotation);
    const ratio = (horizontal ? Math.sin(minRotation) : Math.cos(minRotation)) || 1e-3;
    const tickFont = this._resolveTickFontOptions(0);
    return Math.ceil(length / Math.min(40, tickFont.lineHeight / ratio));
  }
  getPixelForValue(value) {
    return value === null ? NaN : this.getPixelForDecimal((value - this._startValue) / this._valueRange);
  }
  getValueForPixel(pixel) {
    return this._startValue + this.getDecimalForPixel(pixel) * this._valueRange;
  }
}
__name(LinearScale, "LinearScale");
LinearScale.id = "linear";
LinearScale.defaults = {
  ticks: {
    callback: Ticks.formatters.numeric
  }
};
function isMajor(tickVal) {
  const remain = tickVal / Math.pow(10, Math.floor(log10(tickVal)));
  return remain === 1;
}
__name(isMajor, "isMajor");
function generateTicks(generationOptions, dataRange) {
  const endExp = Math.floor(log10(dataRange.max));
  const endSignificand = Math.ceil(dataRange.max / Math.pow(10, endExp));
  const ticks = [];
  let tickVal = finiteOrDefault(generationOptions.min, Math.pow(10, Math.floor(log10(dataRange.min))));
  let exp = Math.floor(log10(tickVal));
  let significand = Math.floor(tickVal / Math.pow(10, exp));
  let precision = exp < 0 ? Math.pow(10, Math.abs(exp)) : 1;
  do {
    ticks.push({ value: tickVal, major: isMajor(tickVal) });
    ++significand;
    if (significand === 10) {
      significand = 1;
      ++exp;
      precision = exp >= 0 ? 1 : precision;
    }
    tickVal = Math.round(significand * Math.pow(10, exp) * precision) / precision;
  } while (exp < endExp || exp === endExp && significand < endSignificand);
  const lastTick = finiteOrDefault(generationOptions.max, tickVal);
  ticks.push({ value: lastTick, major: isMajor(tickVal) });
  return ticks;
}
__name(generateTicks, "generateTicks");
class LogarithmicScale extends Scale {
  constructor(cfg) {
    super(cfg);
    this.start = void 0;
    this.end = void 0;
    this._startValue = void 0;
    this._valueRange = 0;
  }
  parse(raw, index2) {
    const value = LinearScaleBase.prototype.parse.apply(this, [raw, index2]);
    if (value === 0) {
      this._zero = true;
      return void 0;
    }
    return isNumberFinite(value) && value > 0 ? value : null;
  }
  determineDataLimits() {
    const { min, max } = this.getMinMax(true);
    this.min = isNumberFinite(min) ? Math.max(0, min) : null;
    this.max = isNumberFinite(max) ? Math.max(0, max) : null;
    if (this.options.beginAtZero) {
      this._zero = true;
    }
    this.handleTickRangeOptions();
  }
  handleTickRangeOptions() {
    const { minDefined, maxDefined } = this.getUserBounds();
    let min = this.min;
    let max = this.max;
    const setMin = /* @__PURE__ */ __name((v) => min = minDefined ? min : v, "setMin");
    const setMax = /* @__PURE__ */ __name((v) => max = maxDefined ? max : v, "setMax");
    const exp = /* @__PURE__ */ __name((v, m) => Math.pow(10, Math.floor(log10(v)) + m), "exp");
    if (min === max) {
      if (min <= 0) {
        setMin(1);
        setMax(10);
      } else {
        setMin(exp(min, -1));
        setMax(exp(max, 1));
      }
    }
    if (min <= 0) {
      setMin(exp(max, -1));
    }
    if (max <= 0) {
      setMax(exp(min, 1));
    }
    if (this._zero && this.min !== this._suggestedMin && min === exp(this.min, 0)) {
      setMin(exp(min, -1));
    }
    this.min = min;
    this.max = max;
  }
  buildTicks() {
    const opts = this.options;
    const generationOptions = {
      min: this._userMin,
      max: this._userMax
    };
    const ticks = generateTicks(generationOptions, this);
    if (opts.bounds === "ticks") {
      _setMinAndMaxByKey(ticks, this, "value");
    }
    if (opts.reverse) {
      ticks.reverse();
      this.start = this.max;
      this.end = this.min;
    } else {
      this.start = this.min;
      this.end = this.max;
    }
    return ticks;
  }
  getLabelForValue(value) {
    return value === void 0 ? "0" : formatNumber(value, this.chart.options.locale, this.options.ticks.format);
  }
  configure() {
    const start = this.min;
    super.configure();
    this._startValue = log10(start);
    this._valueRange = log10(this.max) - log10(start);
  }
  getPixelForValue(value) {
    if (value === void 0 || value === 0) {
      value = this.min;
    }
    if (value === null || isNaN(value)) {
      return NaN;
    }
    return this.getPixelForDecimal(value === this.min ? 0 : (log10(value) - this._startValue) / this._valueRange);
  }
  getValueForPixel(pixel) {
    const decimal = this.getDecimalForPixel(pixel);
    return Math.pow(10, this._startValue + decimal * this._valueRange);
  }
}
__name(LogarithmicScale, "LogarithmicScale");
LogarithmicScale.id = "logarithmic";
LogarithmicScale.defaults = {
  ticks: {
    callback: Ticks.formatters.logarithmic,
    major: {
      enabled: true
    }
  }
};
function getTickBackdropHeight(opts) {
  const tickOpts = opts.ticks;
  if (tickOpts.display && opts.display) {
    const padding = toPadding(tickOpts.backdropPadding);
    return valueOrDefault(tickOpts.font && tickOpts.font.size, defaults.font.size) + padding.height;
  }
  return 0;
}
__name(getTickBackdropHeight, "getTickBackdropHeight");
function measureLabelSize(ctx, font, label) {
  label = isArray(label) ? label : [label];
  return {
    w: _longestText(ctx, font.string, label),
    h: label.length * font.lineHeight
  };
}
__name(measureLabelSize, "measureLabelSize");
function determineLimits(angle, pos, size, min, max) {
  if (angle === min || angle === max) {
    return {
      start: pos - size / 2,
      end: pos + size / 2
    };
  } else if (angle < min || angle > max) {
    return {
      start: pos - size,
      end: pos
    };
  }
  return {
    start: pos,
    end: pos + size
  };
}
__name(determineLimits, "determineLimits");
function fitWithPointLabels(scale) {
  const orig = {
    l: scale.left + scale._padding.left,
    r: scale.right - scale._padding.right,
    t: scale.top + scale._padding.top,
    b: scale.bottom - scale._padding.bottom
  };
  const limits = Object.assign({}, orig);
  const labelSizes = [];
  const padding = [];
  const valueCount = scale._pointLabels.length;
  const pointLabelOpts = scale.options.pointLabels;
  const additionalAngle = pointLabelOpts.centerPointLabels ? PI / valueCount : 0;
  for (let i = 0; i < valueCount; i++) {
    const opts = pointLabelOpts.setContext(scale.getPointLabelContext(i));
    padding[i] = opts.padding;
    const pointPosition = scale.getPointPosition(i, scale.drawingArea + padding[i], additionalAngle);
    const plFont = toFont(opts.font);
    const textSize = measureLabelSize(scale.ctx, plFont, scale._pointLabels[i]);
    labelSizes[i] = textSize;
    const angleRadians = _normalizeAngle(scale.getIndexAngle(i) + additionalAngle);
    const angle = Math.round(toDegrees(angleRadians));
    const hLimits = determineLimits(angle, pointPosition.x, textSize.w, 0, 180);
    const vLimits = determineLimits(angle, pointPosition.y, textSize.h, 90, 270);
    updateLimits(limits, orig, angleRadians, hLimits, vLimits);
  }
  scale.setCenterPoint(
    orig.l - limits.l,
    limits.r - orig.r,
    orig.t - limits.t,
    limits.b - orig.b
  );
  scale._pointLabelItems = buildPointLabelItems(scale, labelSizes, padding);
}
__name(fitWithPointLabels, "fitWithPointLabels");
function updateLimits(limits, orig, angle, hLimits, vLimits) {
  const sin = Math.abs(Math.sin(angle));
  const cos = Math.abs(Math.cos(angle));
  let x = 0;
  let y = 0;
  if (hLimits.start < orig.l) {
    x = (orig.l - hLimits.start) / sin;
    limits.l = Math.min(limits.l, orig.l - x);
  } else if (hLimits.end > orig.r) {
    x = (hLimits.end - orig.r) / sin;
    limits.r = Math.max(limits.r, orig.r + x);
  }
  if (vLimits.start < orig.t) {
    y = (orig.t - vLimits.start) / cos;
    limits.t = Math.min(limits.t, orig.t - y);
  } else if (vLimits.end > orig.b) {
    y = (vLimits.end - orig.b) / cos;
    limits.b = Math.max(limits.b, orig.b + y);
  }
}
__name(updateLimits, "updateLimits");
function buildPointLabelItems(scale, labelSizes, padding) {
  const items = [];
  const valueCount = scale._pointLabels.length;
  const opts = scale.options;
  const extra = getTickBackdropHeight(opts) / 2;
  const outerDistance = scale.drawingArea;
  const additionalAngle = opts.pointLabels.centerPointLabels ? PI / valueCount : 0;
  for (let i = 0; i < valueCount; i++) {
    const pointLabelPosition = scale.getPointPosition(i, outerDistance + extra + padding[i], additionalAngle);
    const angle = Math.round(toDegrees(_normalizeAngle(pointLabelPosition.angle + HALF_PI)));
    const size = labelSizes[i];
    const y = yForAngle(pointLabelPosition.y, size.h, angle);
    const textAlign = getTextAlignForAngle(angle);
    const left = leftForTextAlign(pointLabelPosition.x, size.w, textAlign);
    items.push({
      x: pointLabelPosition.x,
      y,
      textAlign,
      left,
      top: y,
      right: left + size.w,
      bottom: y + size.h
    });
  }
  return items;
}
__name(buildPointLabelItems, "buildPointLabelItems");
function getTextAlignForAngle(angle) {
  if (angle === 0 || angle === 180) {
    return "center";
  } else if (angle < 180) {
    return "left";
  }
  return "right";
}
__name(getTextAlignForAngle, "getTextAlignForAngle");
function leftForTextAlign(x, w, align) {
  if (align === "right") {
    x -= w;
  } else if (align === "center") {
    x -= w / 2;
  }
  return x;
}
__name(leftForTextAlign, "leftForTextAlign");
function yForAngle(y, h, angle) {
  if (angle === 90 || angle === 270) {
    y -= h / 2;
  } else if (angle > 270 || angle < 90) {
    y -= h;
  }
  return y;
}
__name(yForAngle, "yForAngle");
function drawPointLabels(scale, labelCount) {
  const { ctx, options: { pointLabels } } = scale;
  for (let i = labelCount - 1; i >= 0; i--) {
    const optsAtIndex = pointLabels.setContext(scale.getPointLabelContext(i));
    const plFont = toFont(optsAtIndex.font);
    const { x, y, textAlign, left, top, right, bottom } = scale._pointLabelItems[i];
    const { backdropColor } = optsAtIndex;
    if (!isNullOrUndef(backdropColor)) {
      const borderRadius = toTRBLCorners(optsAtIndex.borderRadius);
      const padding = toPadding(optsAtIndex.backdropPadding);
      ctx.fillStyle = backdropColor;
      const backdropLeft = left - padding.left;
      const backdropTop = top - padding.top;
      const backdropWidth = right - left + padding.width;
      const backdropHeight = bottom - top + padding.height;
      if (Object.values(borderRadius).some((v) => v !== 0)) {
        ctx.beginPath();
        addRoundedRectPath(ctx, {
          x: backdropLeft,
          y: backdropTop,
          w: backdropWidth,
          h: backdropHeight,
          radius: borderRadius
        });
        ctx.fill();
      } else {
        ctx.fillRect(backdropLeft, backdropTop, backdropWidth, backdropHeight);
      }
    }
    renderText(
      ctx,
      scale._pointLabels[i],
      x,
      y + plFont.lineHeight / 2,
      plFont,
      {
        color: optsAtIndex.color,
        textAlign,
        textBaseline: "middle"
      }
    );
  }
}
__name(drawPointLabels, "drawPointLabels");
function pathRadiusLine(scale, radius2, circular, labelCount) {
  const { ctx } = scale;
  if (circular) {
    ctx.arc(scale.xCenter, scale.yCenter, radius2, 0, TAU);
  } else {
    let pointPosition = scale.getPointPosition(0, radius2);
    ctx.moveTo(pointPosition.x, pointPosition.y);
    for (let i = 1; i < labelCount; i++) {
      pointPosition = scale.getPointPosition(i, radius2);
      ctx.lineTo(pointPosition.x, pointPosition.y);
    }
  }
}
__name(pathRadiusLine, "pathRadiusLine");
function drawRadiusLine(scale, gridLineOpts, radius2, labelCount) {
  const ctx = scale.ctx;
  const circular = gridLineOpts.circular;
  const { color: color2, lineWidth } = gridLineOpts;
  if (!circular && !labelCount || !color2 || !lineWidth || radius2 < 0) {
    return;
  }
  ctx.save();
  ctx.strokeStyle = color2;
  ctx.lineWidth = lineWidth;
  ctx.setLineDash(gridLineOpts.borderDash);
  ctx.lineDashOffset = gridLineOpts.borderDashOffset;
  ctx.beginPath();
  pathRadiusLine(scale, radius2, circular, labelCount);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}
__name(drawRadiusLine, "drawRadiusLine");
function createPointLabelContext(parent, index2, label) {
  return createContext(parent, {
    label,
    index: index2,
    type: "pointLabel"
  });
}
__name(createPointLabelContext, "createPointLabelContext");
class RadialLinearScale extends LinearScaleBase {
  constructor(cfg) {
    super(cfg);
    this.xCenter = void 0;
    this.yCenter = void 0;
    this.drawingArea = void 0;
    this._pointLabels = [];
    this._pointLabelItems = [];
  }
  setDimensions() {
    const padding = this._padding = toPadding(getTickBackdropHeight(this.options) / 2);
    const w = this.width = this.maxWidth - padding.width;
    const h = this.height = this.maxHeight - padding.height;
    this.xCenter = Math.floor(this.left + w / 2 + padding.left);
    this.yCenter = Math.floor(this.top + h / 2 + padding.top);
    this.drawingArea = Math.floor(Math.min(w, h) / 2);
  }
  determineDataLimits() {
    const { min, max } = this.getMinMax(false);
    this.min = isNumberFinite(min) && !isNaN(min) ? min : 0;
    this.max = isNumberFinite(max) && !isNaN(max) ? max : 0;
    this.handleTickRangeOptions();
  }
  computeTickLimit() {
    return Math.ceil(this.drawingArea / getTickBackdropHeight(this.options));
  }
  generateTickLabels(ticks) {
    LinearScaleBase.prototype.generateTickLabels.call(this, ticks);
    this._pointLabels = this.getLabels().map((value, index2) => {
      const label = callback(this.options.pointLabels.callback, [value, index2], this);
      return label || label === 0 ? label : "";
    }).filter((v, i) => this.chart.getDataVisibility(i));
  }
  fit() {
    const opts = this.options;
    if (opts.display && opts.pointLabels.display) {
      fitWithPointLabels(this);
    } else {
      this.setCenterPoint(0, 0, 0, 0);
    }
  }
  setCenterPoint(leftMovement, rightMovement, topMovement, bottomMovement) {
    this.xCenter += Math.floor((leftMovement - rightMovement) / 2);
    this.yCenter += Math.floor((topMovement - bottomMovement) / 2);
    this.drawingArea -= Math.min(this.drawingArea / 2, Math.max(leftMovement, rightMovement, topMovement, bottomMovement));
  }
  getIndexAngle(index2) {
    const angleMultiplier = TAU / (this._pointLabels.length || 1);
    const startAngle = this.options.startAngle || 0;
    return _normalizeAngle(index2 * angleMultiplier + toRadians(startAngle));
  }
  getDistanceFromCenterForValue(value) {
    if (isNullOrUndef(value)) {
      return NaN;
    }
    const scalingFactor = this.drawingArea / (this.max - this.min);
    if (this.options.reverse) {
      return (this.max - value) * scalingFactor;
    }
    return (value - this.min) * scalingFactor;
  }
  getValueForDistanceFromCenter(distance) {
    if (isNullOrUndef(distance)) {
      return NaN;
    }
    const scaledDistance = distance / (this.drawingArea / (this.max - this.min));
    return this.options.reverse ? this.max - scaledDistance : this.min + scaledDistance;
  }
  getPointLabelContext(index2) {
    const pointLabels = this._pointLabels || [];
    if (index2 >= 0 && index2 < pointLabels.length) {
      const pointLabel = pointLabels[index2];
      return createPointLabelContext(this.getContext(), index2, pointLabel);
    }
  }
  getPointPosition(index2, distanceFromCenter, additionalAngle = 0) {
    const angle = this.getIndexAngle(index2) - HALF_PI + additionalAngle;
    return {
      x: Math.cos(angle) * distanceFromCenter + this.xCenter,
      y: Math.sin(angle) * distanceFromCenter + this.yCenter,
      angle
    };
  }
  getPointPositionForValue(index2, value) {
    return this.getPointPosition(index2, this.getDistanceFromCenterForValue(value));
  }
  getBasePosition(index2) {
    return this.getPointPositionForValue(index2 || 0, this.getBaseValue());
  }
  getPointLabelPosition(index2) {
    const { left, top, right, bottom } = this._pointLabelItems[index2];
    return {
      left,
      top,
      right,
      bottom
    };
  }
  drawBackground() {
    const { backgroundColor, grid: { circular } } = this.options;
    if (backgroundColor) {
      const ctx = this.ctx;
      ctx.save();
      ctx.beginPath();
      pathRadiusLine(this, this.getDistanceFromCenterForValue(this._endValue), circular, this._pointLabels.length);
      ctx.closePath();
      ctx.fillStyle = backgroundColor;
      ctx.fill();
      ctx.restore();
    }
  }
  drawGrid() {
    const ctx = this.ctx;
    const opts = this.options;
    const { angleLines, grid } = opts;
    const labelCount = this._pointLabels.length;
    let i, offset, position;
    if (opts.pointLabels.display) {
      drawPointLabels(this, labelCount);
    }
    if (grid.display) {
      this.ticks.forEach((tick, index2) => {
        if (index2 !== 0) {
          offset = this.getDistanceFromCenterForValue(tick.value);
          const optsAtIndex = grid.setContext(this.getContext(index2 - 1));
          drawRadiusLine(this, optsAtIndex, offset, labelCount);
        }
      });
    }
    if (angleLines.display) {
      ctx.save();
      for (i = labelCount - 1; i >= 0; i--) {
        const optsAtIndex = angleLines.setContext(this.getPointLabelContext(i));
        const { color: color2, lineWidth } = optsAtIndex;
        if (!lineWidth || !color2) {
          continue;
        }
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = color2;
        ctx.setLineDash(optsAtIndex.borderDash);
        ctx.lineDashOffset = optsAtIndex.borderDashOffset;
        offset = this.getDistanceFromCenterForValue(opts.ticks.reverse ? this.min : this.max);
        position = this.getPointPosition(i, offset);
        ctx.beginPath();
        ctx.moveTo(this.xCenter, this.yCenter);
        ctx.lineTo(position.x, position.y);
        ctx.stroke();
      }
      ctx.restore();
    }
  }
  drawBorder() {
  }
  drawLabels() {
    const ctx = this.ctx;
    const opts = this.options;
    const tickOpts = opts.ticks;
    if (!tickOpts.display) {
      return;
    }
    const startAngle = this.getIndexAngle(0);
    let offset, width;
    ctx.save();
    ctx.translate(this.xCenter, this.yCenter);
    ctx.rotate(startAngle);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    this.ticks.forEach((tick, index2) => {
      if (index2 === 0 && !opts.reverse) {
        return;
      }
      const optsAtIndex = tickOpts.setContext(this.getContext(index2));
      const tickFont = toFont(optsAtIndex.font);
      offset = this.getDistanceFromCenterForValue(this.ticks[index2].value);
      if (optsAtIndex.showLabelBackdrop) {
        ctx.font = tickFont.string;
        width = ctx.measureText(tick.label).width;
        ctx.fillStyle = optsAtIndex.backdropColor;
        const padding = toPadding(optsAtIndex.backdropPadding);
        ctx.fillRect(
          -width / 2 - padding.left,
          -offset - tickFont.size / 2 - padding.top,
          width + padding.width,
          tickFont.size + padding.height
        );
      }
      renderText(ctx, tick.label, 0, -offset, tickFont, {
        color: optsAtIndex.color
      });
    });
    ctx.restore();
  }
  drawTitle() {
  }
}
__name(RadialLinearScale, "RadialLinearScale");
RadialLinearScale.id = "radialLinear";
RadialLinearScale.defaults = {
  display: true,
  animate: true,
  position: "chartArea",
  angleLines: {
    display: true,
    lineWidth: 1,
    borderDash: [],
    borderDashOffset: 0
  },
  grid: {
    circular: false
  },
  startAngle: 0,
  ticks: {
    showLabelBackdrop: true,
    callback: Ticks.formatters.numeric
  },
  pointLabels: {
    backdropColor: void 0,
    backdropPadding: 2,
    display: true,
    font: {
      size: 10
    },
    callback(label) {
      return label;
    },
    padding: 5,
    centerPointLabels: false
  }
};
RadialLinearScale.defaultRoutes = {
  "angleLines.color": "borderColor",
  "pointLabels.color": "color",
  "ticks.color": "color"
};
RadialLinearScale.descriptors = {
  angleLines: {
    _fallback: "grid"
  }
};
const INTERVALS = {
  millisecond: { common: true, size: 1, steps: 1e3 },
  second: { common: true, size: 1e3, steps: 60 },
  minute: { common: true, size: 6e4, steps: 60 },
  hour: { common: true, size: 36e5, steps: 24 },
  day: { common: true, size: 864e5, steps: 30 },
  week: { common: false, size: 6048e5, steps: 4 },
  month: { common: true, size: 2628e6, steps: 12 },
  quarter: { common: false, size: 7884e6, steps: 4 },
  year: { common: true, size: 3154e7 }
};
const UNITS = Object.keys(INTERVALS);
function sorter(a, b) {
  return a - b;
}
__name(sorter, "sorter");
function parse(scale, input) {
  if (isNullOrUndef(input)) {
    return null;
  }
  const adapter = scale._adapter;
  const { parser, round: round2, isoWeekday } = scale._parseOpts;
  let value = input;
  if (typeof parser === "function") {
    value = parser(value);
  }
  if (!isNumberFinite(value)) {
    value = typeof parser === "string" ? adapter.parse(value, parser) : adapter.parse(value);
  }
  if (value === null) {
    return null;
  }
  if (round2) {
    value = round2 === "week" && (isNumber(isoWeekday) || isoWeekday === true) ? adapter.startOf(value, "isoWeek", isoWeekday) : adapter.startOf(value, round2);
  }
  return +value;
}
__name(parse, "parse");
function determineUnitForAutoTicks(minUnit, min, max, capacity) {
  const ilen = UNITS.length;
  for (let i = UNITS.indexOf(minUnit); i < ilen - 1; ++i) {
    const interval = INTERVALS[UNITS[i]];
    const factor = interval.steps ? interval.steps : Number.MAX_SAFE_INTEGER;
    if (interval.common && Math.ceil((max - min) / (factor * interval.size)) <= capacity) {
      return UNITS[i];
    }
  }
  return UNITS[ilen - 1];
}
__name(determineUnitForAutoTicks, "determineUnitForAutoTicks");
function determineUnitForFormatting(scale, numTicks, minUnit, min, max) {
  for (let i = UNITS.length - 1; i >= UNITS.indexOf(minUnit); i--) {
    const unit = UNITS[i];
    if (INTERVALS[unit].common && scale._adapter.diff(max, min, unit) >= numTicks - 1) {
      return unit;
    }
  }
  return UNITS[minUnit ? UNITS.indexOf(minUnit) : 0];
}
__name(determineUnitForFormatting, "determineUnitForFormatting");
function determineMajorUnit(unit) {
  for (let i = UNITS.indexOf(unit) + 1, ilen = UNITS.length; i < ilen; ++i) {
    if (INTERVALS[UNITS[i]].common) {
      return UNITS[i];
    }
  }
}
__name(determineMajorUnit, "determineMajorUnit");
function addTick(ticks, time, timestamps) {
  if (!timestamps) {
    ticks[time] = true;
  } else if (timestamps.length) {
    const { lo, hi } = _lookup(timestamps, time);
    const timestamp = timestamps[lo] >= time ? timestamps[lo] : timestamps[hi];
    ticks[timestamp] = true;
  }
}
__name(addTick, "addTick");
function setMajorTicks(scale, ticks, map2, majorUnit) {
  const adapter = scale._adapter;
  const first = +adapter.startOf(ticks[0].value, majorUnit);
  const last = ticks[ticks.length - 1].value;
  let major, index2;
  for (major = first; major <= last; major = +adapter.add(major, 1, majorUnit)) {
    index2 = map2[major];
    if (index2 >= 0) {
      ticks[index2].major = true;
    }
  }
  return ticks;
}
__name(setMajorTicks, "setMajorTicks");
function ticksFromTimestamps(scale, values, majorUnit) {
  const ticks = [];
  const map2 = {};
  const ilen = values.length;
  let i, value;
  for (i = 0; i < ilen; ++i) {
    value = values[i];
    map2[value] = i;
    ticks.push({
      value,
      major: false
    });
  }
  return ilen === 0 || !majorUnit ? ticks : setMajorTicks(scale, ticks, map2, majorUnit);
}
__name(ticksFromTimestamps, "ticksFromTimestamps");
class TimeScale extends Scale {
  constructor(props) {
    super(props);
    this._cache = {
      data: [],
      labels: [],
      all: []
    };
    this._unit = "day";
    this._majorUnit = void 0;
    this._offsets = {};
    this._normalized = false;
    this._parseOpts = void 0;
  }
  init(scaleOpts, opts) {
    const time = scaleOpts.time || (scaleOpts.time = {});
    const adapter = this._adapter = new adapters._date(scaleOpts.adapters.date);
    adapter.init(opts);
    mergeIf(time.displayFormats, adapter.formats());
    this._parseOpts = {
      parser: time.parser,
      round: time.round,
      isoWeekday: time.isoWeekday
    };
    super.init(scaleOpts);
    this._normalized = opts.normalized;
  }
  parse(raw, index2) {
    if (raw === void 0) {
      return null;
    }
    return parse(this, raw);
  }
  beforeLayout() {
    super.beforeLayout();
    this._cache = {
      data: [],
      labels: [],
      all: []
    };
  }
  determineDataLimits() {
    const options = this.options;
    const adapter = this._adapter;
    const unit = options.time.unit || "day";
    let { min, max, minDefined, maxDefined } = this.getUserBounds();
    function _applyBounds(bounds) {
      if (!minDefined && !isNaN(bounds.min)) {
        min = Math.min(min, bounds.min);
      }
      if (!maxDefined && !isNaN(bounds.max)) {
        max = Math.max(max, bounds.max);
      }
    }
    __name(_applyBounds, "_applyBounds");
    if (!minDefined || !maxDefined) {
      _applyBounds(this._getLabelBounds());
      if (options.bounds !== "ticks" || options.ticks.source !== "labels") {
        _applyBounds(this.getMinMax(false));
      }
    }
    min = isNumberFinite(min) && !isNaN(min) ? min : +adapter.startOf(Date.now(), unit);
    max = isNumberFinite(max) && !isNaN(max) ? max : +adapter.endOf(Date.now(), unit) + 1;
    this.min = Math.min(min, max - 1);
    this.max = Math.max(min + 1, max);
  }
  _getLabelBounds() {
    const arr = this.getLabelTimestamps();
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    if (arr.length) {
      min = arr[0];
      max = arr[arr.length - 1];
    }
    return { min, max };
  }
  buildTicks() {
    const options = this.options;
    const timeOpts = options.time;
    const tickOpts = options.ticks;
    const timestamps = tickOpts.source === "labels" ? this.getLabelTimestamps() : this._generate();
    if (options.bounds === "ticks" && timestamps.length) {
      this.min = this._userMin || timestamps[0];
      this.max = this._userMax || timestamps[timestamps.length - 1];
    }
    const min = this.min;
    const max = this.max;
    const ticks = _filterBetween(timestamps, min, max);
    this._unit = timeOpts.unit || (tickOpts.autoSkip ? determineUnitForAutoTicks(timeOpts.minUnit, this.min, this.max, this._getLabelCapacity(min)) : determineUnitForFormatting(this, ticks.length, timeOpts.minUnit, this.min, this.max));
    this._majorUnit = !tickOpts.major.enabled || this._unit === "year" ? void 0 : determineMajorUnit(this._unit);
    this.initOffsets(timestamps);
    if (options.reverse) {
      ticks.reverse();
    }
    return ticksFromTimestamps(this, ticks, this._majorUnit);
  }
  afterAutoSkip() {
    if (this.options.offsetAfterAutoskip) {
      this.initOffsets(this.ticks.map((tick) => +tick.value));
    }
  }
  initOffsets(timestamps) {
    let start = 0;
    let end = 0;
    let first, last;
    if (this.options.offset && timestamps.length) {
      first = this.getDecimalForValue(timestamps[0]);
      if (timestamps.length === 1) {
        start = 1 - first;
      } else {
        start = (this.getDecimalForValue(timestamps[1]) - first) / 2;
      }
      last = this.getDecimalForValue(timestamps[timestamps.length - 1]);
      if (timestamps.length === 1) {
        end = last;
      } else {
        end = (last - this.getDecimalForValue(timestamps[timestamps.length - 2])) / 2;
      }
    }
    const limit = timestamps.length < 3 ? 0.5 : 0.25;
    start = _limitValue(start, 0, limit);
    end = _limitValue(end, 0, limit);
    this._offsets = { start, end, factor: 1 / (start + 1 + end) };
  }
  _generate() {
    const adapter = this._adapter;
    const min = this.min;
    const max = this.max;
    const options = this.options;
    const timeOpts = options.time;
    const minor = timeOpts.unit || determineUnitForAutoTicks(timeOpts.minUnit, min, max, this._getLabelCapacity(min));
    const stepSize = valueOrDefault(timeOpts.stepSize, 1);
    const weekday = minor === "week" ? timeOpts.isoWeekday : false;
    const hasWeekday = isNumber(weekday) || weekday === true;
    const ticks = {};
    let first = min;
    let time, count;
    if (hasWeekday) {
      first = +adapter.startOf(first, "isoWeek", weekday);
    }
    first = +adapter.startOf(first, hasWeekday ? "day" : minor);
    if (adapter.diff(max, min, minor) > 1e5 * stepSize) {
      throw new Error(min + " and " + max + " are too far apart with stepSize of " + stepSize + " " + minor);
    }
    const timestamps = options.ticks.source === "data" && this.getDataTimestamps();
    for (time = first, count = 0; time < max; time = +adapter.add(time, stepSize, minor), count++) {
      addTick(ticks, time, timestamps);
    }
    if (time === max || options.bounds === "ticks" || count === 1) {
      addTick(ticks, time, timestamps);
    }
    return Object.keys(ticks).sort((a, b) => a - b).map((x) => +x);
  }
  getLabelForValue(value) {
    const adapter = this._adapter;
    const timeOpts = this.options.time;
    if (timeOpts.tooltipFormat) {
      return adapter.format(value, timeOpts.tooltipFormat);
    }
    return adapter.format(value, timeOpts.displayFormats.datetime);
  }
  _tickFormatFunction(time, index2, ticks, format) {
    const options = this.options;
    const formats = options.time.displayFormats;
    const unit = this._unit;
    const majorUnit = this._majorUnit;
    const minorFormat = unit && formats[unit];
    const majorFormat = majorUnit && formats[majorUnit];
    const tick = ticks[index2];
    const major = majorUnit && majorFormat && tick && tick.major;
    const label = this._adapter.format(time, format || (major ? majorFormat : minorFormat));
    const formatter = options.ticks.callback;
    return formatter ? callback(formatter, [label, index2, ticks], this) : label;
  }
  generateTickLabels(ticks) {
    let i, ilen, tick;
    for (i = 0, ilen = ticks.length; i < ilen; ++i) {
      tick = ticks[i];
      tick.label = this._tickFormatFunction(tick.value, i, ticks);
    }
  }
  getDecimalForValue(value) {
    return value === null ? NaN : (value - this.min) / (this.max - this.min);
  }
  getPixelForValue(value) {
    const offsets = this._offsets;
    const pos = this.getDecimalForValue(value);
    return this.getPixelForDecimal((offsets.start + pos) * offsets.factor);
  }
  getValueForPixel(pixel) {
    const offsets = this._offsets;
    const pos = this.getDecimalForPixel(pixel) / offsets.factor - offsets.end;
    return this.min + pos * (this.max - this.min);
  }
  _getLabelSize(label) {
    const ticksOpts = this.options.ticks;
    const tickLabelWidth = this.ctx.measureText(label).width;
    const angle = toRadians(this.isHorizontal() ? ticksOpts.maxRotation : ticksOpts.minRotation);
    const cosRotation = Math.cos(angle);
    const sinRotation = Math.sin(angle);
    const tickFontSize = this._resolveTickFontOptions(0).size;
    return {
      w: tickLabelWidth * cosRotation + tickFontSize * sinRotation,
      h: tickLabelWidth * sinRotation + tickFontSize * cosRotation
    };
  }
  _getLabelCapacity(exampleTime) {
    const timeOpts = this.options.time;
    const displayFormats = timeOpts.displayFormats;
    const format = displayFormats[timeOpts.unit] || displayFormats.millisecond;
    const exampleLabel = this._tickFormatFunction(exampleTime, 0, ticksFromTimestamps(this, [exampleTime], this._majorUnit), format);
    const size = this._getLabelSize(exampleLabel);
    const capacity = Math.floor(this.isHorizontal() ? this.width / size.w : this.height / size.h) - 1;
    return capacity > 0 ? capacity : 1;
  }
  getDataTimestamps() {
    let timestamps = this._cache.data || [];
    let i, ilen;
    if (timestamps.length) {
      return timestamps;
    }
    const metas = this.getMatchingVisibleMetas();
    if (this._normalized && metas.length) {
      return this._cache.data = metas[0].controller.getAllParsedValues(this);
    }
    for (i = 0, ilen = metas.length; i < ilen; ++i) {
      timestamps = timestamps.concat(metas[i].controller.getAllParsedValues(this));
    }
    return this._cache.data = this.normalize(timestamps);
  }
  getLabelTimestamps() {
    const timestamps = this._cache.labels || [];
    let i, ilen;
    if (timestamps.length) {
      return timestamps;
    }
    const labels = this.getLabels();
    for (i = 0, ilen = labels.length; i < ilen; ++i) {
      timestamps.push(parse(this, labels[i]));
    }
    return this._cache.labels = this._normalized ? timestamps : this.normalize(timestamps);
  }
  normalize(values) {
    return _arrayUnique(values.sort(sorter));
  }
}
__name(TimeScale, "TimeScale");
TimeScale.id = "time";
TimeScale.defaults = {
  bounds: "data",
  adapters: {},
  time: {
    parser: false,
    unit: false,
    round: false,
    isoWeekday: false,
    minUnit: "millisecond",
    displayFormats: {}
  },
  ticks: {
    source: "auto",
    major: {
      enabled: false
    }
  }
};
function interpolate(table, val, reverse) {
  let lo = 0;
  let hi = table.length - 1;
  let prevSource, nextSource, prevTarget, nextTarget;
  if (reverse) {
    if (val >= table[lo].pos && val <= table[hi].pos) {
      ({ lo, hi } = _lookupByKey(table, "pos", val));
    }
    ({ pos: prevSource, time: prevTarget } = table[lo]);
    ({ pos: nextSource, time: nextTarget } = table[hi]);
  } else {
    if (val >= table[lo].time && val <= table[hi].time) {
      ({ lo, hi } = _lookupByKey(table, "time", val));
    }
    ({ time: prevSource, pos: prevTarget } = table[lo]);
    ({ time: nextSource, pos: nextTarget } = table[hi]);
  }
  const span = nextSource - prevSource;
  return span ? prevTarget + (nextTarget - prevTarget) * (val - prevSource) / span : prevTarget;
}
__name(interpolate, "interpolate");
class TimeSeriesScale extends TimeScale {
  constructor(props) {
    super(props);
    this._table = [];
    this._minPos = void 0;
    this._tableRange = void 0;
  }
  initOffsets() {
    const timestamps = this._getTimestampsForTable();
    const table = this._table = this.buildLookupTable(timestamps);
    this._minPos = interpolate(table, this.min);
    this._tableRange = interpolate(table, this.max) - this._minPos;
    super.initOffsets(timestamps);
  }
  buildLookupTable(timestamps) {
    const { min, max } = this;
    const items = [];
    const table = [];
    let i, ilen, prev, curr, next;
    for (i = 0, ilen = timestamps.length; i < ilen; ++i) {
      curr = timestamps[i];
      if (curr >= min && curr <= max) {
        items.push(curr);
      }
    }
    if (items.length < 2) {
      return [
        { time: min, pos: 0 },
        { time: max, pos: 1 }
      ];
    }
    for (i = 0, ilen = items.length; i < ilen; ++i) {
      next = items[i + 1];
      prev = items[i - 1];
      curr = items[i];
      if (Math.round((next + prev) / 2) !== curr) {
        table.push({ time: curr, pos: i / (ilen - 1) });
      }
    }
    return table;
  }
  _getTimestampsForTable() {
    let timestamps = this._cache.all || [];
    if (timestamps.length) {
      return timestamps;
    }
    const data = this.getDataTimestamps();
    const label = this.getLabelTimestamps();
    if (data.length && label.length) {
      timestamps = this.normalize(data.concat(label));
    } else {
      timestamps = data.length ? data : label;
    }
    timestamps = this._cache.all = timestamps;
    return timestamps;
  }
  getDecimalForValue(value) {
    return (interpolate(this._table, value) - this._minPos) / this._tableRange;
  }
  getValueForPixel(pixel) {
    const offsets = this._offsets;
    const decimal = this.getDecimalForPixel(pixel) / offsets.factor - offsets.end;
    return interpolate(this._table, decimal * this._tableRange + this._minPos, true);
  }
}
__name(TimeSeriesScale, "TimeSeriesScale");
TimeSeriesScale.id = "timeseries";
TimeSeriesScale.defaults = TimeScale.defaults;
var scales = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  RadialLinearScale,
  TimeScale,
  TimeSeriesScale
});
const registerables = [
  controllers,
  elements,
  plugins,
  scales
];
Chart.register(...registerables);
const PieChartLegend_svelte_svelte_type_style_lang = "";
function get_each_context$3(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[8] = list[i];
  child_ctx[10] = i;
  return child_ctx;
}
__name(get_each_context$3, "get_each_context$3");
function create_each_block$3(key_1, ctx) {
  let div;
  let span;
  let t0_value = ctx[1].datasets[0].data[ctx[10]] + "";
  let t0;
  let t1;
  let t2_value = ctx[2].index.length + "";
  let t2;
  let t3;
  let a;
  let t4_value = ctx[1].labels[ctx[10]] + "";
  let t4;
  let mounted;
  let dispose;
  function click_handler() {
    return ctx[6](ctx[8]);
  }
  __name(click_handler, "click_handler");
  return {
    key: key_1,
    first: null,
    c() {
      div = element("div");
      span = element("span");
      t0 = text(t0_value);
      t1 = text(" / ");
      t2 = text(t2_value);
      t3 = space();
      a = element("a");
      t4 = text(t4_value);
      attr(span, "class", "svelte-hgkg6b");
      set_style(span, "background-color", ctx[1].datasets[0].backgroundColor[ctx[10]]);
      attr(a, "class", "svelte-hgkg6b");
      attr(div, "class", "entry svelte-hgkg6b");
      toggle_class(div, "line-through", !ctx[8].value);
      this.first = div;
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, span);
      append(span, t0);
      append(span, t1);
      append(span, t2);
      append(div, t3);
      append(div, a);
      append(a, t4);
      if (!mounted) {
        dispose = listen(div, "click", click_handler);
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & 3 && t0_value !== (t0_value = ctx[1].datasets[0].data[ctx[10]] + ""))
        set_data(t0, t0_value);
      if (dirty & 4 && t2_value !== (t2_value = ctx[2].index.length + ""))
        set_data(t2, t2_value);
      if (dirty & 3) {
        set_style(span, "background-color", ctx[1].datasets[0].backgroundColor[ctx[10]]);
      }
      if (dirty & 3 && t4_value !== (t4_value = ctx[1].labels[ctx[10]] + ""))
        set_data(t4, t4_value);
      if (dirty & 1) {
        toggle_class(div, "line-through", !ctx[8].value);
      }
    },
    d(detaching) {
      if (detaching)
        detach(div);
      mounted = false;
      dispose();
    }
  };
}
__name(create_each_block$3, "create_each_block$3");
function create_fragment$f(ctx) {
  let section;
  let each_blocks = [];
  let each_1_lookup = /* @__PURE__ */ new Map();
  let t0;
  let hr;
  let t1;
  let div;
  let a0;
  let i0;
  let t2;
  let t3_value = localize("mcc.showCompatible") + "";
  let t3;
  let t4;
  let a1;
  let i1;
  let t5;
  let t6_value = localize("mcc.resetFilters") + "";
  let t6;
  let mounted;
  let dispose;
  let each_value = ctx[0];
  const get_key = /* @__PURE__ */ __name((ctx2) => ctx2[8].key, "get_key");
  for (let i = 0; i < each_value.length; i += 1) {
    let child_ctx = get_each_context$3(ctx, each_value, i);
    let key = get_key(child_ctx);
    each_1_lookup.set(key, each_blocks[i] = create_each_block$3(key, child_ctx));
  }
  return {
    c() {
      section = element("section");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      t0 = space();
      hr = element("hr");
      t1 = space();
      div = element("div");
      a0 = element("a");
      i0 = element("i");
      t2 = space();
      t3 = text(t3_value);
      t4 = space();
      a1 = element("a");
      i1 = element("i");
      t5 = space();
      t6 = text(t6_value);
      attr(hr, "class", "svelte-hgkg6b");
      attr(i0, "class", "fas fa-thumbs-up");
      attr(i1, "class", "fas fa-trash");
      attr(div, "class", "links svelte-hgkg6b");
      attr(section, "class", "svelte-hgkg6b");
    },
    m(target, anchor) {
      insert(target, section, anchor);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(section, null);
      }
      append(section, t0);
      append(section, hr);
      append(section, t1);
      append(section, div);
      append(div, a0);
      append(a0, i0);
      append(a0, t2);
      append(a0, t3);
      append(div, t4);
      append(div, a1);
      append(a1, i1);
      append(a1, t5);
      append(a1, t6);
      if (!mounted) {
        dispose = [
          listen(a0, "click", ctx[5].setCompatibleVisible),
          listen(a1, "click", ctx[7])
        ];
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & 39) {
        each_value = ctx2[0];
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value, each_1_lookup, section, destroy_block, create_each_block$3, t0, get_each_context$3);
      }
    },
    i: noop$1,
    o: noop$1,
    d(detaching) {
      if (detaching)
        detach(section);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].d();
      }
      mounted = false;
      run_all(dispose);
    }
  };
}
__name(create_fragment$f, "create_fragment$f");
function instance$f($$self, $$props, $$invalidate) {
  let $statuses;
  let $pieData;
  let $spreadsheetStore;
  const spreadsheetStore = getContext("spreadsheetStore");
  component_subscribe($$self, spreadsheetStore, (value) => $$invalidate(2, $spreadsheetStore = value));
  const { pieData, statuses: statuses2 } = spreadsheetStore.stores;
  component_subscribe($$self, pieData, (value) => $$invalidate(1, $pieData = value));
  component_subscribe($$self, statuses2, (value) => $$invalidate(0, $statuses = value));
  const click_handler = /* @__PURE__ */ __name((status) => statuses2.toggleVisible(status.key), "click_handler");
  const click_handler_12 = /* @__PURE__ */ __name(() => spreadsheetStore.resetFilters(), "click_handler_1");
  return [
    $statuses,
    $pieData,
    $spreadsheetStore,
    spreadsheetStore,
    pieData,
    statuses2,
    click_handler,
    click_handler_12
  ];
}
__name(instance$f, "instance$f");
class PieChartLegend extends SvelteComponent {
  constructor(options) {
    super();
    init$1(this, options, instance$f, create_fragment$f, safe_not_equal, {});
  }
}
__name(PieChartLegend, "PieChartLegend");
const PieChart_svelte_svelte_type_style_lang = "";
function create_fragment$e(ctx) {
  let section;
  let div;
  let canvas;
  let t;
  let piechartlegend;
  let current;
  let mounted;
  let dispose;
  piechartlegend = new PieChartLegend({});
  return {
    c() {
      section = element("section");
      div = element("div");
      canvas = element("canvas");
      t = space();
      create_component(piechartlegend.$$.fragment);
      attr(canvas, "width", radius * 2);
      attr(canvas, "height", radius * 2);
      attr(div, "class", "svelte-18qyuj6");
      attr(section, "class", "svelte-18qyuj6");
    },
    m(target, anchor) {
      insert(target, section, anchor);
      append(section, div);
      append(div, canvas);
      ctx[7](canvas);
      append(section, t);
      mount_component(piechartlegend, section, null);
      current = true;
      if (!mounted) {
        dispose = listen(canvas, "click", ctx[3]);
        mounted = true;
      }
    },
    p: noop$1,
    i(local) {
      if (current)
        return;
      transition_in(piechartlegend.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(piechartlegend.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(section);
      ctx[7](null);
      destroy_component(piechartlegend);
      mounted = false;
      dispose();
    }
  };
}
__name(create_fragment$e, "create_fragment$e");
const radius = 125;
function isInsideChart(x, y) {
  return Math.sqrt((x - radius) ** 2 + (-y + radius) ** 2) < radius;
}
__name(isInsideChart, "isInsideChart");
function instance$e($$self, $$props, $$invalidate) {
  let $statuses;
  let $pieData;
  const spreadsheetStore = getContext("spreadsheetStore");
  const { statuses: statuses2, pieData } = spreadsheetStore.stores;
  component_subscribe($$self, statuses2, (value) => $$invalidate(5, $statuses = value));
  component_subscribe($$self, pieData, (value) => $$invalidate(6, $pieData = value));
  let chart = null, canvasEl;
  function updateDataVisibility(statusEntries) {
    for (let i = 0; i < statusEntries.length; i++) {
      chart[statusEntries[i].value ? "show" : "hide"](0, i);
    }
  }
  __name(updateDataVisibility, "updateDataVisibility");
  onMount(() => {
    $$invalidate(4, chart = new Chart(
      canvasEl,
      {
        type: "pie",
        data: $pieData,
        options: {
          aspectRatio: 1,
          borderColor: "transparent",
          layout: { padding: 0 },
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false }
          },
          responsive: false,
          onHover: (event) => {
            event.chart.canvas.style.cursor = isInsideChart(event.x, event.y) ? "pointer" : "default";
          }
        }
      }
    ));
    updateDataVisibility($statuses);
  });
  onDestroy(() => {
    if (chart)
      chart.destroy();
    $$invalidate(4, chart = null);
  });
  function onClick(event) {
    const rect = canvasEl.getBoundingClientRect();
    if (!isInsideChart(event.clientX - rect.left, event.clientY - rect.top)) {
      return;
    }
    const statusLength = $statuses.filter((status) => status.value).length;
    if (statusLength <= 1) {
      statuses2.reset();
      return;
    }
    const points = chart.getElementsAtEventForMode(event, "nearest", { intersect: true }, true);
    if (statusLength > 1 && points.length) {
      const firstPoint = points[0];
      statuses2.setExclusive(firstPoint.index);
    }
  }
  __name(onClick, "onClick");
  function canvas_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      canvasEl = $$value;
      $$invalidate(0, canvasEl);
    });
  }
  __name(canvas_binding, "canvas_binding");
  $$self.$$.update = () => {
    if ($$self.$$.dirty & 80) {
      if (chart) {
        $$invalidate(4, chart.data = $pieData, chart);
        chart.update();
      }
    }
    if ($$self.$$.dirty & 48) {
      if (chart) {
        updateDataVisibility($statuses);
      }
    }
  };
  return [
    canvasEl,
    statuses2,
    pieData,
    onClick,
    chart,
    $statuses,
    $pieData,
    canvas_binding
  ];
}
__name(instance$e, "instance$e");
class PieChart extends SvelteComponent {
  constructor(options) {
    super();
    init$1(this, options, instance$e, create_fragment$e, safe_not_equal, {});
  }
}
__name(PieChart, "PieChart");
const s_STYLE_KEY = "#__tjs-root-styles";
const cssVariables = new StyleManager({ docKey: s_STYLE_KEY });
class FoundryStyles {
  static #sheet = void 0;
  static #sheetMap = /* @__PURE__ */ new Map();
  static #initialized = false;
  static #initialize() {
    this.#initialized = true;
    const styleSheets = Array.from(document.styleSheets).filter((sheet2) => sheet2.href !== null);
    let sheet;
    const foundryStyleSheet = foundry.utils.getRoute("/css/style.css");
    for (const styleSheet of styleSheets) {
      let url;
      try {
        url = new URL(styleSheet.href);
      } catch (err) {
        continue;
      }
      if (typeof url.pathname === "string" && url.pathname === foundryStyleSheet) {
        this.#sheet = sheet = styleSheet;
        break;
      }
    }
    if (!sheet) {
      return;
    }
    for (const rule of sheet.cssRules) {
      if (!(rule instanceof CSSStyleRule)) {
        continue;
      }
      const obj = {};
      for (const entry of rule.style.cssText.split(";")) {
        const parts = entry.split(":");
        if (parts.length < 2) {
          continue;
        }
        obj[parts[0].trim()] = parts[1].trim();
      }
      this.#sheetMap.set(rule.selectorText, obj);
    }
  }
  static getProperties(selector) {
    if (!this.#initialized) {
      this.#initialize();
    }
    if (this.#sheetMap.has(selector)) {
      return this.#sheetMap.get(selector);
    }
    for (const key of this.#sheetMap.keys()) {
      if (key.includes(selector)) {
        return this.#sheetMap.get(key);
      }
    }
    return void 0;
  }
  static getProperty(selector, property) {
    if (!this.#initialized) {
      this.#initialize();
    }
    if (this.#sheetMap.has(selector)) {
      const data = this.#sheetMap.get(selector);
      return typeof data === "object" && property in data ? data[property] : void 0;
    }
    for (const key of this.#sheetMap.keys()) {
      if (key.includes(selector)) {
        const data = this.#sheetMap.get(key);
        if (typeof data === "object" && property in data) {
          return data[property];
        }
      }
    }
    return void 0;
  }
}
__name(FoundryStyles, "FoundryStyles");
const TJSIconButton_svelte_svelte_type_style_lang = "";
function create_fragment$d(ctx) {
  let div;
  let a;
  let i;
  let i_class_value;
  let div_title_value;
  let applyStyles_action;
  let mounted;
  let dispose;
  return {
    c() {
      div = element("div");
      a = element("a");
      i = element("i");
      attr(i, "class", i_class_value = null_to_empty(ctx[0]) + " svelte-su3d4z");
      attr(a, "role", "presentation");
      attr(a, "class", "svelte-su3d4z");
      attr(div, "title", div_title_value = localize(ctx[1]));
      attr(div, "role", "presentation");
      attr(div, "class", "svelte-su3d4z");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, a);
      append(a, i);
      if (!mounted) {
        dispose = [
          listen(a, "click", ctx[7]),
          action_destroyer(ctx[3].call(null, a)),
          listen(div, "click", ctx[4]),
          action_destroyer(applyStyles_action = applyStyles.call(null, div, ctx[2]))
        ];
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & 1 && i_class_value !== (i_class_value = null_to_empty(ctx2[0]) + " svelte-su3d4z")) {
        attr(i, "class", i_class_value);
      }
      if (dirty & 2 && div_title_value !== (div_title_value = localize(ctx2[1]))) {
        attr(div, "title", div_title_value);
      }
      if (applyStyles_action && is_function(applyStyles_action.update) && dirty & 4)
        applyStyles_action.update.call(null, ctx2[2]);
    },
    i: noop$1,
    o: noop$1,
    d(detaching) {
      if (detaching)
        detach(div);
      mounted = false;
      run_all(dispose);
    }
  };
}
__name(create_fragment$d, "create_fragment$d");
function instance$d($$self, $$props, $$invalidate) {
  let { button = void 0 } = $$props;
  let { icon = void 0 } = $$props;
  let { title = void 0 } = $$props;
  let { styles = void 0 } = $$props;
  let { efx = void 0 } = $$props;
  let { onClickPropagate = void 0 } = $$props;
  function onClick(event) {
    if (!onClickPropagate) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
  __name(onClick, "onClick");
  function click_handler(event) {
    bubble.call(this, $$self, event);
  }
  __name(click_handler, "click_handler");
  $$self.$$set = ($$props2) => {
    if ("button" in $$props2)
      $$invalidate(6, button = $$props2.button);
    if ("icon" in $$props2)
      $$invalidate(0, icon = $$props2.icon);
    if ("title" in $$props2)
      $$invalidate(1, title = $$props2.title);
    if ("styles" in $$props2)
      $$invalidate(2, styles = $$props2.styles);
    if ("efx" in $$props2)
      $$invalidate(3, efx = $$props2.efx);
    if ("onClickPropagate" in $$props2)
      $$invalidate(5, onClickPropagate = $$props2.onClickPropagate);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & 65) {
      $$invalidate(0, icon = typeof button === "object" && typeof button.icon === "string" ? button.icon : typeof icon === "string" ? icon : "");
    }
    if ($$self.$$.dirty & 66) {
      $$invalidate(1, title = typeof button === "object" && typeof button.title === "string" ? button.title : typeof title === "string" ? title : "");
    }
    if ($$self.$$.dirty & 68) {
      $$invalidate(2, styles = typeof button === "object" && typeof button.styles === "object" ? button.styles : typeof styles === "object" ? styles : void 0);
    }
    if ($$self.$$.dirty & 72) {
      $$invalidate(3, efx = typeof button === "object" && typeof button.efx === "function" ? button.efx : typeof efx === "function" ? efx : () => {
      });
    }
    if ($$self.$$.dirty & 96) {
      $$invalidate(5, onClickPropagate = typeof button === "object" && typeof button.onClickPropagate === "boolean" ? button.onClickPropagate : typeof onClickPropagate === "boolean" ? onClickPropagate : true);
    }
  };
  return [icon, title, styles, efx, onClick, onClickPropagate, button, click_handler];
}
__name(instance$d, "instance$d");
class TJSIconButton extends SvelteComponent {
  constructor(options) {
    super();
    init$1(this, options, instance$d, create_fragment$d, safe_not_equal, {
      button: 6,
      icon: 0,
      title: 1,
      styles: 2,
      efx: 3,
      onClickPropagate: 5
    });
  }
}
__name(TJSIconButton, "TJSIconButton");
const TJSToggleIconButton_svelte_svelte_type_style_lang = "";
function create_if_block$3(ctx) {
  let current;
  const default_slot_template = ctx[16].default;
  const default_slot = create_slot(default_slot_template, ctx, ctx[15], null);
  return {
    c() {
      if (default_slot)
        default_slot.c();
    },
    m(target, anchor) {
      if (default_slot) {
        default_slot.m(target, anchor);
      }
      current = true;
    },
    p(ctx2, dirty) {
      if (default_slot) {
        if (default_slot.p && (!current || dirty & 32768)) {
          update_slot_base(
            default_slot,
            default_slot_template,
            ctx2,
            ctx2[15],
            !current ? get_all_dirty_from_scope(ctx2[15]) : get_slot_changes(default_slot_template, ctx2[15], dirty, null),
            null
          );
        }
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(default_slot, local);
      current = true;
    },
    o(local) {
      transition_out(default_slot, local);
      current = false;
    },
    d(detaching) {
      if (default_slot)
        default_slot.d(detaching);
    }
  };
}
__name(create_if_block$3, "create_if_block$3");
function create_fragment$c(ctx) {
  let div;
  let a;
  let i;
  let i_class_value;
  let t;
  let div_title_value;
  let applyStyles_action;
  let current;
  let mounted;
  let dispose;
  let if_block = ctx[4] && create_if_block$3(ctx);
  return {
    c() {
      div = element("div");
      a = element("a");
      i = element("i");
      t = space();
      if (if_block)
        if_block.c();
      attr(i, "class", i_class_value = null_to_empty(ctx[0]) + " svelte-qlfxx4");
      toggle_class(i, "selected", ctx[4]);
      attr(a, "role", "presentation");
      attr(a, "class", "svelte-qlfxx4");
      toggle_class(a, "selected", ctx[4]);
      attr(div, "title", div_title_value = localize(ctx[5]));
      attr(div, "role", "presentation");
      attr(div, "class", "svelte-qlfxx4");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, a);
      append(a, i);
      append(div, t);
      if (if_block)
        if_block.m(div, null);
      current = true;
      if (!mounted) {
        dispose = [
          listen(a, "click", ctx[6]),
          action_destroyer(ctx[3].call(null, a)),
          listen(div, "click", ctx[7]),
          listen(div, "close", ctx[8]),
          action_destroyer(applyStyles_action = applyStyles.call(null, div, ctx[2]))
        ];
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (!current || dirty & 1 && i_class_value !== (i_class_value = null_to_empty(ctx2[0]) + " svelte-qlfxx4")) {
        attr(i, "class", i_class_value);
      }
      if (!current || dirty & 17) {
        toggle_class(i, "selected", ctx2[4]);
      }
      if (!current || dirty & 16) {
        toggle_class(a, "selected", ctx2[4]);
      }
      if (ctx2[4]) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty & 16) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block$3(ctx2);
          if_block.c();
          transition_in(if_block, 1);
          if_block.m(div, null);
        }
      } else if (if_block) {
        group_outros();
        transition_out(if_block, 1, 1, () => {
          if_block = null;
        });
        check_outros();
      }
      if (!current || dirty & 32 && div_title_value !== (div_title_value = localize(ctx2[5]))) {
        attr(div, "title", div_title_value);
      }
      if (applyStyles_action && is_function(applyStyles_action.update) && dirty & 4)
        applyStyles_action.update.call(null, ctx2[2]);
    },
    i(local) {
      if (current)
        return;
      transition_in(if_block);
      current = true;
    },
    o(local) {
      transition_out(if_block);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div);
      if (if_block)
        if_block.d();
      mounted = false;
      run_all(dispose);
    }
  };
}
__name(create_fragment$c, "create_fragment$c");
function instance$c($$self, $$props, $$invalidate) {
  let titleCurrent;
  let $store, $$unsubscribe_store = noop$1, $$subscribe_store = /* @__PURE__ */ __name(() => ($$unsubscribe_store(), $$unsubscribe_store = subscribe(store, ($$value) => $$invalidate(14, $store = $$value)), store), "$$subscribe_store");
  $$self.$$.on_destroy.push(() => $$unsubscribe_store());
  let { $$slots: slots = {}, $$scope } = $$props;
  let { button = void 0 } = $$props;
  let { icon = void 0 } = $$props;
  let { title = void 0 } = $$props;
  let { titleSelected = void 0 } = $$props;
  let { store = void 0 } = $$props;
  $$subscribe_store();
  let { styles = void 0 } = $$props;
  let { efx = void 0 } = $$props;
  let { onClickPropagate = void 0 } = $$props;
  let { onClosePropagate = void 0 } = $$props;
  let selected = false;
  function onClick(event) {
    $$invalidate(4, selected = !selected);
    if (store) {
      store.set(selected);
    }
    if (!onClickPropagate) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
  __name(onClick, "onClick");
  function onClickDiv(event) {
    if (!onClickPropagate) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
  __name(onClickDiv, "onClickDiv");
  function onClose(event) {
    $$invalidate(4, selected = false);
    if (store) {
      store.set(false);
    }
    if (!onClosePropagate) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
  __name(onClose, "onClose");
  $$self.$$set = ($$props2) => {
    if ("button" in $$props2)
      $$invalidate(13, button = $$props2.button);
    if ("icon" in $$props2)
      $$invalidate(0, icon = $$props2.icon);
    if ("title" in $$props2)
      $$invalidate(9, title = $$props2.title);
    if ("titleSelected" in $$props2)
      $$invalidate(10, titleSelected = $$props2.titleSelected);
    if ("store" in $$props2)
      $$subscribe_store($$invalidate(1, store = $$props2.store));
    if ("styles" in $$props2)
      $$invalidate(2, styles = $$props2.styles);
    if ("efx" in $$props2)
      $$invalidate(3, efx = $$props2.efx);
    if ("onClickPropagate" in $$props2)
      $$invalidate(11, onClickPropagate = $$props2.onClickPropagate);
    if ("onClosePropagate" in $$props2)
      $$invalidate(12, onClosePropagate = $$props2.onClosePropagate);
    if ("$$scope" in $$props2)
      $$invalidate(15, $$scope = $$props2.$$scope);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & 8193) {
      $$invalidate(0, icon = typeof button === "object" && typeof button.icon === "string" ? button.icon : typeof icon === "string" ? icon : "");
    }
    if ($$self.$$.dirty & 8704) {
      $$invalidate(9, title = typeof button === "object" && typeof button.title === "string" ? button.title : typeof title === "string" ? title : "");
    }
    if ($$self.$$.dirty & 9216) {
      $$invalidate(10, titleSelected = typeof button === "object" && typeof button.titleSelected === "string" ? button.titleSelected : typeof titleSelected === "string" ? titleSelected : "");
    }
    if ($$self.$$.dirty & 8194) {
      $$subscribe_store($$invalidate(1, store = typeof button === "object" && isWritableStore(button.store) ? button.store : isWritableStore(store) ? store : void 0));
    }
    if ($$self.$$.dirty & 8196) {
      $$invalidate(2, styles = typeof button === "object" && typeof button.styles === "object" ? button.styles : typeof styles === "object" ? styles : void 0);
    }
    if ($$self.$$.dirty & 8200) {
      $$invalidate(3, efx = typeof button === "object" && typeof button.efx === "function" ? button.efx : typeof efx === "function" ? efx : () => {
      });
    }
    if ($$self.$$.dirty & 12288) {
      $$invalidate(12, onClosePropagate = typeof button === "object" && typeof button.onClosePropagate === "boolean" ? button.onClosePropagate : typeof onClosePropagate === "boolean" ? onClosePropagate : false);
    }
    if ($$self.$$.dirty & 10240) {
      $$invalidate(11, onClickPropagate = typeof button === "object" && typeof button.onClickPropagate === "boolean" ? button.onClickPropagate : typeof onClickPropagate === "boolean" ? onClickPropagate : false);
    }
    if ($$self.$$.dirty & 16386) {
      if (store) {
        $$invalidate(4, selected = $store);
      }
    }
    if ($$self.$$.dirty & 1552) {
      $$invalidate(5, titleCurrent = selected && titleSelected !== "" ? titleSelected : title);
    }
  };
  return [
    icon,
    store,
    styles,
    efx,
    selected,
    titleCurrent,
    onClick,
    onClickDiv,
    onClose,
    title,
    titleSelected,
    onClickPropagate,
    onClosePropagate,
    button,
    $store,
    $$scope,
    slots
  ];
}
__name(instance$c, "instance$c");
class TJSToggleIconButton extends SvelteComponent {
  constructor(options) {
    super();
    init$1(this, options, instance$c, create_fragment$c, safe_not_equal, {
      button: 13,
      icon: 0,
      title: 9,
      titleSelected: 10,
      store: 1,
      styles: 2,
      efx: 3,
      onClickPropagate: 11,
      onClosePropagate: 12
    });
  }
}
__name(TJSToggleIconButton, "TJSToggleIconButton");
Hooks.once("init", () => {
  !foundry.utils.isNewerVersion(10, game.version ?? game?.data?.version);
});
const TJSContentEdit_svelte_svelte_type_style_lang = "";
function findDiffStart(a, b, pos) {
  for (let i = 0; ; i++) {
    if (i == a.childCount || i == b.childCount)
      return a.childCount == b.childCount ? null : pos;
    let childA = a.child(i), childB = b.child(i);
    if (childA == childB) {
      pos += childA.nodeSize;
      continue;
    }
    if (!childA.sameMarkup(childB))
      return pos;
    if (childA.isText && childA.text != childB.text) {
      for (let j = 0; childA.text[j] == childB.text[j]; j++)
        pos++;
      return pos;
    }
    if (childA.content.size || childB.content.size) {
      let inner = findDiffStart(childA.content, childB.content, pos + 1);
      if (inner != null)
        return inner;
    }
    pos += childA.nodeSize;
  }
}
__name(findDiffStart, "findDiffStart");
function findDiffEnd(a, b, posA, posB) {
  for (let iA = a.childCount, iB = b.childCount; ; ) {
    if (iA == 0 || iB == 0)
      return iA == iB ? null : { a: posA, b: posB };
    let childA = a.child(--iA), childB = b.child(--iB), size = childA.nodeSize;
    if (childA == childB) {
      posA -= size;
      posB -= size;
      continue;
    }
    if (!childA.sameMarkup(childB))
      return { a: posA, b: posB };
    if (childA.isText && childA.text != childB.text) {
      let same = 0, minSize = Math.min(childA.text.length, childB.text.length);
      while (same < minSize && childA.text[childA.text.length - same - 1] == childB.text[childB.text.length - same - 1]) {
        same++;
        posA--;
        posB--;
      }
      return { a: posA, b: posB };
    }
    if (childA.content.size || childB.content.size) {
      let inner = findDiffEnd(childA.content, childB.content, posA - 1, posB - 1);
      if (inner)
        return inner;
    }
    posA -= size;
    posB -= size;
  }
}
__name(findDiffEnd, "findDiffEnd");
class Fragment {
  constructor(content, size) {
    this.content = content;
    this.size = size || 0;
    if (size == null)
      for (let i = 0; i < content.length; i++)
        this.size += content[i].nodeSize;
  }
  nodesBetween(from2, to2, f, nodeStart = 0, parent) {
    for (let i = 0, pos = 0; pos < to2; i++) {
      let child = this.content[i], end = pos + child.nodeSize;
      if (end > from2 && f(child, nodeStart + pos, parent || null, i) !== false && child.content.size) {
        let start = pos + 1;
        child.nodesBetween(Math.max(0, from2 - start), Math.min(child.content.size, to2 - start), f, nodeStart + start);
      }
      pos = end;
    }
  }
  descendants(f) {
    this.nodesBetween(0, this.size, f);
  }
  textBetween(from2, to2, blockSeparator, leafText) {
    let text2 = "", separated = true;
    this.nodesBetween(from2, to2, (node, pos) => {
      if (node.isText) {
        text2 += node.text.slice(Math.max(from2, pos) - pos, to2 - pos);
        separated = !blockSeparator;
      } else if (node.isLeaf) {
        if (leafText) {
          text2 += typeof leafText === "function" ? leafText(node) : leafText;
        } else if (node.type.spec.leafText) {
          text2 += node.type.spec.leafText(node);
        }
        separated = !blockSeparator;
      } else if (!separated && node.isBlock) {
        text2 += blockSeparator;
        separated = true;
      }
    }, 0);
    return text2;
  }
  append(other) {
    if (!other.size)
      return this;
    if (!this.size)
      return other;
    let last = this.lastChild, first = other.firstChild, content = this.content.slice(), i = 0;
    if (last.isText && last.sameMarkup(first)) {
      content[content.length - 1] = last.withText(last.text + first.text);
      i = 1;
    }
    for (; i < other.content.length; i++)
      content.push(other.content[i]);
    return new Fragment(content, this.size + other.size);
  }
  cut(from2, to2 = this.size) {
    if (from2 == 0 && to2 == this.size)
      return this;
    let result = [], size = 0;
    if (to2 > from2)
      for (let i = 0, pos = 0; pos < to2; i++) {
        let child = this.content[i], end = pos + child.nodeSize;
        if (end > from2) {
          if (pos < from2 || end > to2) {
            if (child.isText)
              child = child.cut(Math.max(0, from2 - pos), Math.min(child.text.length, to2 - pos));
            else
              child = child.cut(Math.max(0, from2 - pos - 1), Math.min(child.content.size, to2 - pos - 1));
          }
          result.push(child);
          size += child.nodeSize;
        }
        pos = end;
      }
    return new Fragment(result, size);
  }
  cutByIndex(from2, to2) {
    if (from2 == to2)
      return Fragment.empty;
    if (from2 == 0 && to2 == this.content.length)
      return this;
    return new Fragment(this.content.slice(from2, to2));
  }
  replaceChild(index2, node) {
    let current = this.content[index2];
    if (current == node)
      return this;
    let copy = this.content.slice();
    let size = this.size + node.nodeSize - current.nodeSize;
    copy[index2] = node;
    return new Fragment(copy, size);
  }
  addToStart(node) {
    return new Fragment([node].concat(this.content), this.size + node.nodeSize);
  }
  addToEnd(node) {
    return new Fragment(this.content.concat(node), this.size + node.nodeSize);
  }
  eq(other) {
    if (this.content.length != other.content.length)
      return false;
    for (let i = 0; i < this.content.length; i++)
      if (!this.content[i].eq(other.content[i]))
        return false;
    return true;
  }
  get firstChild() {
    return this.content.length ? this.content[0] : null;
  }
  get lastChild() {
    return this.content.length ? this.content[this.content.length - 1] : null;
  }
  get childCount() {
    return this.content.length;
  }
  child(index2) {
    let found2 = this.content[index2];
    if (!found2)
      throw new RangeError("Index " + index2 + " out of range for " + this);
    return found2;
  }
  maybeChild(index2) {
    return this.content[index2] || null;
  }
  forEach(f) {
    for (let i = 0, p = 0; i < this.content.length; i++) {
      let child = this.content[i];
      f(child, p, i);
      p += child.nodeSize;
    }
  }
  findDiffStart(other, pos = 0) {
    return findDiffStart(this, other, pos);
  }
  findDiffEnd(other, pos = this.size, otherPos = other.size) {
    return findDiffEnd(this, other, pos, otherPos);
  }
  findIndex(pos, round2 = -1) {
    if (pos == 0)
      return retIndex(0, pos);
    if (pos == this.size)
      return retIndex(this.content.length, pos);
    if (pos > this.size || pos < 0)
      throw new RangeError(`Position ${pos} outside of fragment (${this})`);
    for (let i = 0, curPos = 0; ; i++) {
      let cur = this.child(i), end = curPos + cur.nodeSize;
      if (end >= pos) {
        if (end == pos || round2 > 0)
          return retIndex(i + 1, end);
        return retIndex(i, curPos);
      }
      curPos = end;
    }
  }
  toString() {
    return "<" + this.toStringInner() + ">";
  }
  toStringInner() {
    return this.content.join(", ");
  }
  toJSON() {
    return this.content.length ? this.content.map((n) => n.toJSON()) : null;
  }
  static fromJSON(schema, value) {
    if (!value)
      return Fragment.empty;
    if (!Array.isArray(value))
      throw new RangeError("Invalid input for Fragment.fromJSON");
    return new Fragment(value.map(schema.nodeFromJSON));
  }
  static fromArray(array) {
    if (!array.length)
      return Fragment.empty;
    let joined, size = 0;
    for (let i = 0; i < array.length; i++) {
      let node = array[i];
      size += node.nodeSize;
      if (i && node.isText && array[i - 1].sameMarkup(node)) {
        if (!joined)
          joined = array.slice(0, i);
        joined[joined.length - 1] = node.withText(joined[joined.length - 1].text + node.text);
      } else if (joined) {
        joined.push(node);
      }
    }
    return new Fragment(joined || array, size);
  }
  static from(nodes) {
    if (!nodes)
      return Fragment.empty;
    if (nodes instanceof Fragment)
      return nodes;
    if (Array.isArray(nodes))
      return this.fromArray(nodes);
    if (nodes.attrs)
      return new Fragment([nodes], nodes.nodeSize);
    throw new RangeError("Can not convert " + nodes + " to a Fragment" + (nodes.nodesBetween ? " (looks like multiple versions of prosemirror-model were loaded)" : ""));
  }
}
__name(Fragment, "Fragment");
Fragment.empty = new Fragment([], 0);
const found = { index: 0, offset: 0 };
function retIndex(index2, offset) {
  found.index = index2;
  found.offset = offset;
  return found;
}
__name(retIndex, "retIndex");
class ReplaceError extends Error {
}
__name(ReplaceError, "ReplaceError");
class Slice {
  constructor(content, openStart, openEnd) {
    this.content = content;
    this.openStart = openStart;
    this.openEnd = openEnd;
  }
  get size() {
    return this.content.size - this.openStart - this.openEnd;
  }
  insertAt(pos, fragment) {
    let content = insertInto(this.content, pos + this.openStart, fragment);
    return content && new Slice(content, this.openStart, this.openEnd);
  }
  removeBetween(from2, to2) {
    return new Slice(removeRange(this.content, from2 + this.openStart, to2 + this.openStart), this.openStart, this.openEnd);
  }
  eq(other) {
    return this.content.eq(other.content) && this.openStart == other.openStart && this.openEnd == other.openEnd;
  }
  toString() {
    return this.content + "(" + this.openStart + "," + this.openEnd + ")";
  }
  toJSON() {
    if (!this.content.size)
      return null;
    let json = { content: this.content.toJSON() };
    if (this.openStart > 0)
      json.openStart = this.openStart;
    if (this.openEnd > 0)
      json.openEnd = this.openEnd;
    return json;
  }
  static fromJSON(schema, json) {
    if (!json)
      return Slice.empty;
    let openStart = json.openStart || 0, openEnd = json.openEnd || 0;
    if (typeof openStart != "number" || typeof openEnd != "number")
      throw new RangeError("Invalid input for Slice.fromJSON");
    return new Slice(Fragment.fromJSON(schema, json.content), openStart, openEnd);
  }
  static maxOpen(fragment, openIsolating = true) {
    let openStart = 0, openEnd = 0;
    for (let n = fragment.firstChild; n && !n.isLeaf && (openIsolating || !n.type.spec.isolating); n = n.firstChild)
      openStart++;
    for (let n = fragment.lastChild; n && !n.isLeaf && (openIsolating || !n.type.spec.isolating); n = n.lastChild)
      openEnd++;
    return new Slice(fragment, openStart, openEnd);
  }
}
__name(Slice, "Slice");
Slice.empty = new Slice(Fragment.empty, 0, 0);
function removeRange(content, from2, to2) {
  let { index: index2, offset } = content.findIndex(from2), child = content.maybeChild(index2);
  let { index: indexTo, offset: offsetTo } = content.findIndex(to2);
  if (offset == from2 || child.isText) {
    if (offsetTo != to2 && !content.child(indexTo).isText)
      throw new RangeError("Removing non-flat range");
    return content.cut(0, from2).append(content.cut(to2));
  }
  if (index2 != indexTo)
    throw new RangeError("Removing non-flat range");
  return content.replaceChild(index2, child.copy(removeRange(child.content, from2 - offset - 1, to2 - offset - 1)));
}
__name(removeRange, "removeRange");
function insertInto(content, dist, insert2, parent) {
  let { index: index2, offset } = content.findIndex(dist), child = content.maybeChild(index2);
  if (offset == dist || child.isText) {
    if (parent && !parent.canReplace(index2, index2, insert2))
      return null;
    return content.cut(0, dist).append(insert2).append(content.cut(dist));
  }
  let inner = insertInto(child.content, dist - offset - 1, insert2);
  return inner && content.replaceChild(index2, child.copy(inner));
}
__name(insertInto, "insertInto");
const lower16 = 65535;
const factor16 = Math.pow(2, 16);
function makeRecover(index2, offset) {
  return index2 + offset * factor16;
}
__name(makeRecover, "makeRecover");
function recoverIndex(value) {
  return value & lower16;
}
__name(recoverIndex, "recoverIndex");
function recoverOffset(value) {
  return (value - (value & lower16)) / factor16;
}
__name(recoverOffset, "recoverOffset");
const DEL_BEFORE = 1, DEL_AFTER = 2, DEL_ACROSS = 4, DEL_SIDE = 8;
class MapResult {
  constructor(pos, delInfo, recover) {
    this.pos = pos;
    this.delInfo = delInfo;
    this.recover = recover;
  }
  get deleted() {
    return (this.delInfo & DEL_SIDE) > 0;
  }
  get deletedBefore() {
    return (this.delInfo & (DEL_BEFORE | DEL_ACROSS)) > 0;
  }
  get deletedAfter() {
    return (this.delInfo & (DEL_AFTER | DEL_ACROSS)) > 0;
  }
  get deletedAcross() {
    return (this.delInfo & DEL_ACROSS) > 0;
  }
}
__name(MapResult, "MapResult");
class StepMap {
  constructor(ranges, inverted = false) {
    this.ranges = ranges;
    this.inverted = inverted;
    if (!ranges.length && StepMap.empty)
      return StepMap.empty;
  }
  recover(value) {
    let diff = 0, index2 = recoverIndex(value);
    if (!this.inverted)
      for (let i = 0; i < index2; i++)
        diff += this.ranges[i * 3 + 2] - this.ranges[i * 3 + 1];
    return this.ranges[index2 * 3] + diff + recoverOffset(value);
  }
  mapResult(pos, assoc = 1) {
    return this._map(pos, assoc, false);
  }
  map(pos, assoc = 1) {
    return this._map(pos, assoc, true);
  }
  _map(pos, assoc, simple) {
    let diff = 0, oldIndex = this.inverted ? 2 : 1, newIndex = this.inverted ? 1 : 2;
    for (let i = 0; i < this.ranges.length; i += 3) {
      let start = this.ranges[i] - (this.inverted ? diff : 0);
      if (start > pos)
        break;
      let oldSize = this.ranges[i + oldIndex], newSize = this.ranges[i + newIndex], end = start + oldSize;
      if (pos <= end) {
        let side = !oldSize ? assoc : pos == start ? -1 : pos == end ? 1 : assoc;
        let result = start + diff + (side < 0 ? 0 : newSize);
        if (simple)
          return result;
        let recover = pos == (assoc < 0 ? start : end) ? null : makeRecover(i / 3, pos - start);
        let del = pos == start ? DEL_AFTER : pos == end ? DEL_BEFORE : DEL_ACROSS;
        if (assoc < 0 ? pos != start : pos != end)
          del |= DEL_SIDE;
        return new MapResult(result, del, recover);
      }
      diff += newSize - oldSize;
    }
    return simple ? pos + diff : new MapResult(pos + diff, 0, null);
  }
  touches(pos, recover) {
    let diff = 0, index2 = recoverIndex(recover);
    let oldIndex = this.inverted ? 2 : 1, newIndex = this.inverted ? 1 : 2;
    for (let i = 0; i < this.ranges.length; i += 3) {
      let start = this.ranges[i] - (this.inverted ? diff : 0);
      if (start > pos)
        break;
      let oldSize = this.ranges[i + oldIndex], end = start + oldSize;
      if (pos <= end && i == index2 * 3)
        return true;
      diff += this.ranges[i + newIndex] - oldSize;
    }
    return false;
  }
  forEach(f) {
    let oldIndex = this.inverted ? 2 : 1, newIndex = this.inverted ? 1 : 2;
    for (let i = 0, diff = 0; i < this.ranges.length; i += 3) {
      let start = this.ranges[i], oldStart = start - (this.inverted ? diff : 0), newStart = start + (this.inverted ? 0 : diff);
      let oldSize = this.ranges[i + oldIndex], newSize = this.ranges[i + newIndex];
      f(oldStart, oldStart + oldSize, newStart, newStart + newSize);
      diff += newSize - oldSize;
    }
  }
  invert() {
    return new StepMap(this.ranges, !this.inverted);
  }
  toString() {
    return (this.inverted ? "-" : "") + JSON.stringify(this.ranges);
  }
  static offset(n) {
    return n == 0 ? StepMap.empty : new StepMap(n < 0 ? [0, -n, 0] : [0, 0, n]);
  }
}
__name(StepMap, "StepMap");
StepMap.empty = new StepMap([]);
const stepsByID = /* @__PURE__ */ Object.create(null);
class Step {
  getMap() {
    return StepMap.empty;
  }
  merge(other) {
    return null;
  }
  static fromJSON(schema, json) {
    if (!json || !json.stepType)
      throw new RangeError("Invalid input for Step.fromJSON");
    let type = stepsByID[json.stepType];
    if (!type)
      throw new RangeError(`No step type ${json.stepType} defined`);
    return type.fromJSON(schema, json);
  }
  static jsonID(id, stepClass) {
    if (id in stepsByID)
      throw new RangeError("Duplicate use of step JSON ID " + id);
    stepsByID[id] = stepClass;
    stepClass.prototype.jsonID = id;
    return stepClass;
  }
}
__name(Step, "Step");
class StepResult {
  constructor(doc, failed) {
    this.doc = doc;
    this.failed = failed;
  }
  static ok(doc) {
    return new StepResult(doc, null);
  }
  static fail(message) {
    return new StepResult(null, message);
  }
  static fromReplace(doc, from2, to2, slice) {
    try {
      return StepResult.ok(doc.replace(from2, to2, slice));
    } catch (e) {
      if (e instanceof ReplaceError)
        return StepResult.fail(e.message);
      throw e;
    }
  }
}
__name(StepResult, "StepResult");
function mapFragment(fragment, f, parent) {
  let mapped = [];
  for (let i = 0; i < fragment.childCount; i++) {
    let child = fragment.child(i);
    if (child.content.size)
      child = child.copy(mapFragment(child.content, f, child));
    if (child.isInline)
      child = f(child, parent, i);
    mapped.push(child);
  }
  return Fragment.fromArray(mapped);
}
__name(mapFragment, "mapFragment");
class AddMarkStep extends Step {
  constructor(from2, to2, mark) {
    super();
    this.from = from2;
    this.to = to2;
    this.mark = mark;
  }
  apply(doc) {
    let oldSlice = doc.slice(this.from, this.to), $from = doc.resolve(this.from);
    let parent = $from.node($from.sharedDepth(this.to));
    let slice = new Slice(mapFragment(oldSlice.content, (node, parent2) => {
      if (!node.isAtom || !parent2.type.allowsMarkType(this.mark.type))
        return node;
      return node.mark(this.mark.addToSet(node.marks));
    }, parent), oldSlice.openStart, oldSlice.openEnd);
    return StepResult.fromReplace(doc, this.from, this.to, slice);
  }
  invert() {
    return new RemoveMarkStep(this.from, this.to, this.mark);
  }
  map(mapping) {
    let from2 = mapping.mapResult(this.from, 1), to2 = mapping.mapResult(this.to, -1);
    if (from2.deleted && to2.deleted || from2.pos >= to2.pos)
      return null;
    return new AddMarkStep(from2.pos, to2.pos, this.mark);
  }
  merge(other) {
    if (other instanceof AddMarkStep && other.mark.eq(this.mark) && this.from <= other.to && this.to >= other.from)
      return new AddMarkStep(Math.min(this.from, other.from), Math.max(this.to, other.to), this.mark);
    return null;
  }
  toJSON() {
    return {
      stepType: "addMark",
      mark: this.mark.toJSON(),
      from: this.from,
      to: this.to
    };
  }
  static fromJSON(schema, json) {
    if (typeof json.from != "number" || typeof json.to != "number")
      throw new RangeError("Invalid input for AddMarkStep.fromJSON");
    return new AddMarkStep(json.from, json.to, schema.markFromJSON(json.mark));
  }
}
__name(AddMarkStep, "AddMarkStep");
Step.jsonID("addMark", AddMarkStep);
class RemoveMarkStep extends Step {
  constructor(from2, to2, mark) {
    super();
    this.from = from2;
    this.to = to2;
    this.mark = mark;
  }
  apply(doc) {
    let oldSlice = doc.slice(this.from, this.to);
    let slice = new Slice(mapFragment(oldSlice.content, (node) => {
      return node.mark(this.mark.removeFromSet(node.marks));
    }, doc), oldSlice.openStart, oldSlice.openEnd);
    return StepResult.fromReplace(doc, this.from, this.to, slice);
  }
  invert() {
    return new AddMarkStep(this.from, this.to, this.mark);
  }
  map(mapping) {
    let from2 = mapping.mapResult(this.from, 1), to2 = mapping.mapResult(this.to, -1);
    if (from2.deleted && to2.deleted || from2.pos >= to2.pos)
      return null;
    return new RemoveMarkStep(from2.pos, to2.pos, this.mark);
  }
  merge(other) {
    if (other instanceof RemoveMarkStep && other.mark.eq(this.mark) && this.from <= other.to && this.to >= other.from)
      return new RemoveMarkStep(Math.min(this.from, other.from), Math.max(this.to, other.to), this.mark);
    return null;
  }
  toJSON() {
    return {
      stepType: "removeMark",
      mark: this.mark.toJSON(),
      from: this.from,
      to: this.to
    };
  }
  static fromJSON(schema, json) {
    if (typeof json.from != "number" || typeof json.to != "number")
      throw new RangeError("Invalid input for RemoveMarkStep.fromJSON");
    return new RemoveMarkStep(json.from, json.to, schema.markFromJSON(json.mark));
  }
}
__name(RemoveMarkStep, "RemoveMarkStep");
Step.jsonID("removeMark", RemoveMarkStep);
class AddNodeMarkStep extends Step {
  constructor(pos, mark) {
    super();
    this.pos = pos;
    this.mark = mark;
  }
  apply(doc) {
    let node = doc.nodeAt(this.pos);
    if (!node)
      return StepResult.fail("No node at mark step's position");
    let updated = node.type.create(node.attrs, null, this.mark.addToSet(node.marks));
    return StepResult.fromReplace(doc, this.pos, this.pos + 1, new Slice(Fragment.from(updated), 0, node.isLeaf ? 0 : 1));
  }
  invert(doc) {
    let node = doc.nodeAt(this.pos);
    if (node) {
      let newSet = this.mark.addToSet(node.marks);
      if (newSet.length == node.marks.length) {
        for (let i = 0; i < node.marks.length; i++)
          if (!node.marks[i].isInSet(newSet))
            return new AddNodeMarkStep(this.pos, node.marks[i]);
        return new AddNodeMarkStep(this.pos, this.mark);
      }
    }
    return new RemoveNodeMarkStep(this.pos, this.mark);
  }
  map(mapping) {
    let pos = mapping.mapResult(this.pos, 1);
    return pos.deletedAfter ? null : new AddNodeMarkStep(pos.pos, this.mark);
  }
  toJSON() {
    return { stepType: "addNodeMark", pos: this.pos, mark: this.mark.toJSON() };
  }
  static fromJSON(schema, json) {
    if (typeof json.pos != "number")
      throw new RangeError("Invalid input for AddNodeMarkStep.fromJSON");
    return new AddNodeMarkStep(json.pos, schema.markFromJSON(json.mark));
  }
}
__name(AddNodeMarkStep, "AddNodeMarkStep");
Step.jsonID("addNodeMark", AddNodeMarkStep);
class RemoveNodeMarkStep extends Step {
  constructor(pos, mark) {
    super();
    this.pos = pos;
    this.mark = mark;
  }
  apply(doc) {
    let node = doc.nodeAt(this.pos);
    if (!node)
      return StepResult.fail("No node at mark step's position");
    let updated = node.type.create(node.attrs, null, this.mark.removeFromSet(node.marks));
    return StepResult.fromReplace(doc, this.pos, this.pos + 1, new Slice(Fragment.from(updated), 0, node.isLeaf ? 0 : 1));
  }
  invert(doc) {
    let node = doc.nodeAt(this.pos);
    if (!node || !this.mark.isInSet(node.marks))
      return this;
    return new AddNodeMarkStep(this.pos, this.mark);
  }
  map(mapping) {
    let pos = mapping.mapResult(this.pos, 1);
    return pos.deletedAfter ? null : new RemoveNodeMarkStep(pos.pos, this.mark);
  }
  toJSON() {
    return { stepType: "removeNodeMark", pos: this.pos, mark: this.mark.toJSON() };
  }
  static fromJSON(schema, json) {
    if (typeof json.pos != "number")
      throw new RangeError("Invalid input for RemoveNodeMarkStep.fromJSON");
    return new RemoveNodeMarkStep(json.pos, schema.markFromJSON(json.mark));
  }
}
__name(RemoveNodeMarkStep, "RemoveNodeMarkStep");
Step.jsonID("removeNodeMark", RemoveNodeMarkStep);
class ReplaceStep extends Step {
  constructor(from2, to2, slice, structure = false) {
    super();
    this.from = from2;
    this.to = to2;
    this.slice = slice;
    this.structure = structure;
  }
  apply(doc) {
    if (this.structure && contentBetween(doc, this.from, this.to))
      return StepResult.fail("Structure replace would overwrite content");
    return StepResult.fromReplace(doc, this.from, this.to, this.slice);
  }
  getMap() {
    return new StepMap([this.from, this.to - this.from, this.slice.size]);
  }
  invert(doc) {
    return new ReplaceStep(this.from, this.from + this.slice.size, doc.slice(this.from, this.to));
  }
  map(mapping) {
    let from2 = mapping.mapResult(this.from, 1), to2 = mapping.mapResult(this.to, -1);
    if (from2.deletedAcross && to2.deletedAcross)
      return null;
    return new ReplaceStep(from2.pos, Math.max(from2.pos, to2.pos), this.slice);
  }
  merge(other) {
    if (!(other instanceof ReplaceStep) || other.structure || this.structure)
      return null;
    if (this.from + this.slice.size == other.from && !this.slice.openEnd && !other.slice.openStart) {
      let slice = this.slice.size + other.slice.size == 0 ? Slice.empty : new Slice(this.slice.content.append(other.slice.content), this.slice.openStart, other.slice.openEnd);
      return new ReplaceStep(this.from, this.to + (other.to - other.from), slice, this.structure);
    } else if (other.to == this.from && !this.slice.openStart && !other.slice.openEnd) {
      let slice = this.slice.size + other.slice.size == 0 ? Slice.empty : new Slice(other.slice.content.append(this.slice.content), other.slice.openStart, this.slice.openEnd);
      return new ReplaceStep(other.from, this.to, slice, this.structure);
    } else {
      return null;
    }
  }
  toJSON() {
    let json = { stepType: "replace", from: this.from, to: this.to };
    if (this.slice.size)
      json.slice = this.slice.toJSON();
    if (this.structure)
      json.structure = true;
    return json;
  }
  static fromJSON(schema, json) {
    if (typeof json.from != "number" || typeof json.to != "number")
      throw new RangeError("Invalid input for ReplaceStep.fromJSON");
    return new ReplaceStep(json.from, json.to, Slice.fromJSON(schema, json.slice), !!json.structure);
  }
}
__name(ReplaceStep, "ReplaceStep");
Step.jsonID("replace", ReplaceStep);
class ReplaceAroundStep extends Step {
  constructor(from2, to2, gapFrom, gapTo, slice, insert2, structure = false) {
    super();
    this.from = from2;
    this.to = to2;
    this.gapFrom = gapFrom;
    this.gapTo = gapTo;
    this.slice = slice;
    this.insert = insert2;
    this.structure = structure;
  }
  apply(doc) {
    if (this.structure && (contentBetween(doc, this.from, this.gapFrom) || contentBetween(doc, this.gapTo, this.to)))
      return StepResult.fail("Structure gap-replace would overwrite content");
    let gap = doc.slice(this.gapFrom, this.gapTo);
    if (gap.openStart || gap.openEnd)
      return StepResult.fail("Gap is not a flat range");
    let inserted = this.slice.insertAt(this.insert, gap.content);
    if (!inserted)
      return StepResult.fail("Content does not fit in gap");
    return StepResult.fromReplace(doc, this.from, this.to, inserted);
  }
  getMap() {
    return new StepMap([
      this.from,
      this.gapFrom - this.from,
      this.insert,
      this.gapTo,
      this.to - this.gapTo,
      this.slice.size - this.insert
    ]);
  }
  invert(doc) {
    let gap = this.gapTo - this.gapFrom;
    return new ReplaceAroundStep(this.from, this.from + this.slice.size + gap, this.from + this.insert, this.from + this.insert + gap, doc.slice(this.from, this.to).removeBetween(this.gapFrom - this.from, this.gapTo - this.from), this.gapFrom - this.from, this.structure);
  }
  map(mapping) {
    let from2 = mapping.mapResult(this.from, 1), to2 = mapping.mapResult(this.to, -1);
    let gapFrom = mapping.map(this.gapFrom, -1), gapTo = mapping.map(this.gapTo, 1);
    if (from2.deletedAcross && to2.deletedAcross || gapFrom < from2.pos || gapTo > to2.pos)
      return null;
    return new ReplaceAroundStep(from2.pos, to2.pos, gapFrom, gapTo, this.slice, this.insert, this.structure);
  }
  toJSON() {
    let json = {
      stepType: "replaceAround",
      from: this.from,
      to: this.to,
      gapFrom: this.gapFrom,
      gapTo: this.gapTo,
      insert: this.insert
    };
    if (this.slice.size)
      json.slice = this.slice.toJSON();
    if (this.structure)
      json.structure = true;
    return json;
  }
  static fromJSON(schema, json) {
    if (typeof json.from != "number" || typeof json.to != "number" || typeof json.gapFrom != "number" || typeof json.gapTo != "number" || typeof json.insert != "number")
      throw new RangeError("Invalid input for ReplaceAroundStep.fromJSON");
    return new ReplaceAroundStep(json.from, json.to, json.gapFrom, json.gapTo, Slice.fromJSON(schema, json.slice), json.insert, !!json.structure);
  }
}
__name(ReplaceAroundStep, "ReplaceAroundStep");
Step.jsonID("replaceAround", ReplaceAroundStep);
function contentBetween(doc, from2, to2) {
  let $from = doc.resolve(from2), dist = to2 - from2, depth = $from.depth;
  while (dist > 0 && depth > 0 && $from.indexAfter(depth) == $from.node(depth).childCount) {
    depth--;
    dist--;
  }
  if (dist > 0) {
    let next = $from.node(depth).maybeChild($from.indexAfter(depth));
    while (dist > 0) {
      if (!next || next.isLeaf)
        return true;
      next = next.firstChild;
      dist--;
    }
  }
  return false;
}
__name(contentBetween, "contentBetween");
class AttrStep extends Step {
  constructor(pos, attr2, value) {
    super();
    this.pos = pos;
    this.attr = attr2;
    this.value = value;
  }
  apply(doc) {
    let node = doc.nodeAt(this.pos);
    if (!node)
      return StepResult.fail("No node at attribute step's position");
    let attrs = /* @__PURE__ */ Object.create(null);
    for (let name in node.attrs)
      attrs[name] = node.attrs[name];
    attrs[this.attr] = this.value;
    let updated = node.type.create(attrs, null, node.marks);
    return StepResult.fromReplace(doc, this.pos, this.pos + 1, new Slice(Fragment.from(updated), 0, node.isLeaf ? 0 : 1));
  }
  getMap() {
    return StepMap.empty;
  }
  invert(doc) {
    return new AttrStep(this.pos, this.attr, doc.nodeAt(this.pos).attrs[this.attr]);
  }
  map(mapping) {
    let pos = mapping.mapResult(this.pos, 1);
    return pos.deletedAfter ? null : new AttrStep(pos.pos, this.attr, this.value);
  }
  toJSON() {
    return { stepType: "attr", pos: this.pos, attr: this.attr, value: this.value };
  }
  static fromJSON(schema, json) {
    if (typeof json.pos != "number" || typeof json.attr != "string")
      throw new RangeError("Invalid input for AttrStep.fromJSON");
    return new AttrStep(json.pos, json.attr, json.value);
  }
}
__name(AttrStep, "AttrStep");
Step.jsonID("attr", AttrStep);
let TransformError = /* @__PURE__ */ __name(class extends Error {
}, "TransformError");
TransformError = /* @__PURE__ */ __name(function TransformError2(message) {
  let err = Error.call(this, message);
  err.__proto__ = TransformError2.prototype;
  return err;
}, "TransformError");
TransformError.prototype = Object.create(Error.prototype);
TransformError.prototype.constructor = TransformError;
TransformError.prototype.name = "TransformError";
const classesById = /* @__PURE__ */ Object.create(null);
class Selection {
  constructor($anchor, $head, ranges) {
    this.$anchor = $anchor;
    this.$head = $head;
    this.ranges = ranges || [new SelectionRange($anchor.min($head), $anchor.max($head))];
  }
  get anchor() {
    return this.$anchor.pos;
  }
  get head() {
    return this.$head.pos;
  }
  get from() {
    return this.$from.pos;
  }
  get to() {
    return this.$to.pos;
  }
  get $from() {
    return this.ranges[0].$from;
  }
  get $to() {
    return this.ranges[0].$to;
  }
  get empty() {
    let ranges = this.ranges;
    for (let i = 0; i < ranges.length; i++)
      if (ranges[i].$from.pos != ranges[i].$to.pos)
        return false;
    return true;
  }
  content() {
    return this.$from.doc.slice(this.from, this.to, true);
  }
  replace(tr, content = Slice.empty) {
    let lastNode = content.content.lastChild, lastParent = null;
    for (let i = 0; i < content.openEnd; i++) {
      lastParent = lastNode;
      lastNode = lastNode.lastChild;
    }
    let mapFrom = tr.steps.length, ranges = this.ranges;
    for (let i = 0; i < ranges.length; i++) {
      let { $from, $to } = ranges[i], mapping = tr.mapping.slice(mapFrom);
      tr.replaceRange(mapping.map($from.pos), mapping.map($to.pos), i ? Slice.empty : content);
      if (i == 0)
        selectionToInsertionEnd(tr, mapFrom, (lastNode ? lastNode.isInline : lastParent && lastParent.isTextblock) ? -1 : 1);
    }
  }
  replaceWith(tr, node) {
    let mapFrom = tr.steps.length, ranges = this.ranges;
    for (let i = 0; i < ranges.length; i++) {
      let { $from, $to } = ranges[i], mapping = tr.mapping.slice(mapFrom);
      let from2 = mapping.map($from.pos), to2 = mapping.map($to.pos);
      if (i) {
        tr.deleteRange(from2, to2);
      } else {
        tr.replaceRangeWith(from2, to2, node);
        selectionToInsertionEnd(tr, mapFrom, node.isInline ? -1 : 1);
      }
    }
  }
  static findFrom($pos, dir, textOnly = false) {
    let inner = $pos.parent.inlineContent ? new TextSelection($pos) : findSelectionIn($pos.node(0), $pos.parent, $pos.pos, $pos.index(), dir, textOnly);
    if (inner)
      return inner;
    for (let depth = $pos.depth - 1; depth >= 0; depth--) {
      let found2 = dir < 0 ? findSelectionIn($pos.node(0), $pos.node(depth), $pos.before(depth + 1), $pos.index(depth), dir, textOnly) : findSelectionIn($pos.node(0), $pos.node(depth), $pos.after(depth + 1), $pos.index(depth) + 1, dir, textOnly);
      if (found2)
        return found2;
    }
    return null;
  }
  static near($pos, bias = 1) {
    return this.findFrom($pos, bias) || this.findFrom($pos, -bias) || new AllSelection($pos.node(0));
  }
  static atStart(doc) {
    return findSelectionIn(doc, doc, 0, 0, 1) || new AllSelection(doc);
  }
  static atEnd(doc) {
    return findSelectionIn(doc, doc, doc.content.size, doc.childCount, -1) || new AllSelection(doc);
  }
  static fromJSON(doc, json) {
    if (!json || !json.type)
      throw new RangeError("Invalid input for Selection.fromJSON");
    let cls = classesById[json.type];
    if (!cls)
      throw new RangeError(`No selection type ${json.type} defined`);
    return cls.fromJSON(doc, json);
  }
  static jsonID(id, selectionClass) {
    if (id in classesById)
      throw new RangeError("Duplicate use of selection JSON ID " + id);
    classesById[id] = selectionClass;
    selectionClass.prototype.jsonID = id;
    return selectionClass;
  }
  getBookmark() {
    return TextSelection.between(this.$anchor, this.$head).getBookmark();
  }
}
__name(Selection, "Selection");
Selection.prototype.visible = true;
class SelectionRange {
  constructor($from, $to) {
    this.$from = $from;
    this.$to = $to;
  }
}
__name(SelectionRange, "SelectionRange");
let warnedAboutTextSelection = false;
function checkTextSelection($pos) {
  if (!warnedAboutTextSelection && !$pos.parent.inlineContent) {
    warnedAboutTextSelection = true;
    console["warn"]("TextSelection endpoint not pointing into a node with inline content (" + $pos.parent.type.name + ")");
  }
}
__name(checkTextSelection, "checkTextSelection");
class TextSelection extends Selection {
  constructor($anchor, $head = $anchor) {
    checkTextSelection($anchor);
    checkTextSelection($head);
    super($anchor, $head);
  }
  get $cursor() {
    return this.$anchor.pos == this.$head.pos ? this.$head : null;
  }
  map(doc, mapping) {
    let $head = doc.resolve(mapping.map(this.head));
    if (!$head.parent.inlineContent)
      return Selection.near($head);
    let $anchor = doc.resolve(mapping.map(this.anchor));
    return new TextSelection($anchor.parent.inlineContent ? $anchor : $head, $head);
  }
  replace(tr, content = Slice.empty) {
    super.replace(tr, content);
    if (content == Slice.empty) {
      let marks = this.$from.marksAcross(this.$to);
      if (marks)
        tr.ensureMarks(marks);
    }
  }
  eq(other) {
    return other instanceof TextSelection && other.anchor == this.anchor && other.head == this.head;
  }
  getBookmark() {
    return new TextBookmark(this.anchor, this.head);
  }
  toJSON() {
    return { type: "text", anchor: this.anchor, head: this.head };
  }
  static fromJSON(doc, json) {
    if (typeof json.anchor != "number" || typeof json.head != "number")
      throw new RangeError("Invalid input for TextSelection.fromJSON");
    return new TextSelection(doc.resolve(json.anchor), doc.resolve(json.head));
  }
  static create(doc, anchor, head = anchor) {
    let $anchor = doc.resolve(anchor);
    return new this($anchor, head == anchor ? $anchor : doc.resolve(head));
  }
  static between($anchor, $head, bias) {
    let dPos = $anchor.pos - $head.pos;
    if (!bias || dPos)
      bias = dPos >= 0 ? 1 : -1;
    if (!$head.parent.inlineContent) {
      let found2 = Selection.findFrom($head, bias, true) || Selection.findFrom($head, -bias, true);
      if (found2)
        $head = found2.$head;
      else
        return Selection.near($head, bias);
    }
    if (!$anchor.parent.inlineContent) {
      if (dPos == 0) {
        $anchor = $head;
      } else {
        $anchor = (Selection.findFrom($anchor, -bias, true) || Selection.findFrom($anchor, bias, true)).$anchor;
        if ($anchor.pos < $head.pos != dPos < 0)
          $anchor = $head;
      }
    }
    return new TextSelection($anchor, $head);
  }
}
__name(TextSelection, "TextSelection");
Selection.jsonID("text", TextSelection);
class TextBookmark {
  constructor(anchor, head) {
    this.anchor = anchor;
    this.head = head;
  }
  map(mapping) {
    return new TextBookmark(mapping.map(this.anchor), mapping.map(this.head));
  }
  resolve(doc) {
    return TextSelection.between(doc.resolve(this.anchor), doc.resolve(this.head));
  }
}
__name(TextBookmark, "TextBookmark");
class NodeSelection extends Selection {
  constructor($pos) {
    let node = $pos.nodeAfter;
    let $end = $pos.node(0).resolve($pos.pos + node.nodeSize);
    super($pos, $end);
    this.node = node;
  }
  map(doc, mapping) {
    let { deleted, pos } = mapping.mapResult(this.anchor);
    let $pos = doc.resolve(pos);
    if (deleted)
      return Selection.near($pos);
    return new NodeSelection($pos);
  }
  content() {
    return new Slice(Fragment.from(this.node), 0, 0);
  }
  eq(other) {
    return other instanceof NodeSelection && other.anchor == this.anchor;
  }
  toJSON() {
    return { type: "node", anchor: this.anchor };
  }
  getBookmark() {
    return new NodeBookmark(this.anchor);
  }
  static fromJSON(doc, json) {
    if (typeof json.anchor != "number")
      throw new RangeError("Invalid input for NodeSelection.fromJSON");
    return new NodeSelection(doc.resolve(json.anchor));
  }
  static create(doc, from2) {
    return new NodeSelection(doc.resolve(from2));
  }
  static isSelectable(node) {
    return !node.isText && node.type.spec.selectable !== false;
  }
}
__name(NodeSelection, "NodeSelection");
NodeSelection.prototype.visible = false;
Selection.jsonID("node", NodeSelection);
class NodeBookmark {
  constructor(anchor) {
    this.anchor = anchor;
  }
  map(mapping) {
    let { deleted, pos } = mapping.mapResult(this.anchor);
    return deleted ? new TextBookmark(pos, pos) : new NodeBookmark(pos);
  }
  resolve(doc) {
    let $pos = doc.resolve(this.anchor), node = $pos.nodeAfter;
    if (node && NodeSelection.isSelectable(node))
      return new NodeSelection($pos);
    return Selection.near($pos);
  }
}
__name(NodeBookmark, "NodeBookmark");
class AllSelection extends Selection {
  constructor(doc) {
    super(doc.resolve(0), doc.resolve(doc.content.size));
  }
  replace(tr, content = Slice.empty) {
    if (content == Slice.empty) {
      tr.delete(0, tr.doc.content.size);
      let sel = Selection.atStart(tr.doc);
      if (!sel.eq(tr.selection))
        tr.setSelection(sel);
    } else {
      super.replace(tr, content);
    }
  }
  toJSON() {
    return { type: "all" };
  }
  static fromJSON(doc) {
    return new AllSelection(doc);
  }
  map(doc) {
    return new AllSelection(doc);
  }
  eq(other) {
    return other instanceof AllSelection;
  }
  getBookmark() {
    return AllBookmark;
  }
}
__name(AllSelection, "AllSelection");
Selection.jsonID("all", AllSelection);
const AllBookmark = {
  map() {
    return this;
  },
  resolve(doc) {
    return new AllSelection(doc);
  }
};
function findSelectionIn(doc, node, pos, index2, dir, text2 = false) {
  if (node.inlineContent)
    return TextSelection.create(doc, pos);
  for (let i = index2 - (dir > 0 ? 0 : 1); dir > 0 ? i < node.childCount : i >= 0; i += dir) {
    let child = node.child(i);
    if (!child.isAtom) {
      let inner = findSelectionIn(doc, child, pos + dir, dir < 0 ? child.childCount : 0, dir, text2);
      if (inner)
        return inner;
    } else if (!text2 && NodeSelection.isSelectable(child)) {
      return NodeSelection.create(doc, pos - (dir < 0 ? child.nodeSize : 0));
    }
    pos += child.nodeSize * dir;
  }
  return null;
}
__name(findSelectionIn, "findSelectionIn");
function selectionToInsertionEnd(tr, startLen, bias) {
  let last = tr.steps.length - 1;
  if (last < startLen)
    return;
  let step = tr.steps[last];
  if (!(step instanceof ReplaceStep || step instanceof ReplaceAroundStep))
    return;
  let map2 = tr.mapping.maps[last], end;
  map2.forEach((_from, _to, _newFrom, newTo) => {
    if (end == null)
      end = newTo;
  });
  tr.setSelection(Selection.near(tr.doc.resolve(end), bias));
}
__name(selectionToInsertionEnd, "selectionToInsertionEnd");
function bind(f, self) {
  return !self || !f ? f : f.bind(self);
}
__name(bind, "bind");
class FieldDesc {
  constructor(name, desc, self) {
    this.name = name;
    this.init = bind(desc.init, self);
    this.apply = bind(desc.apply, self);
  }
}
__name(FieldDesc, "FieldDesc");
[
  new FieldDesc("doc", {
    init(config) {
      return config.doc || config.schema.topNodeType.createAndFill();
    },
    apply(tr) {
      return tr.doc;
    }
  }),
  new FieldDesc("selection", {
    init(config, instance2) {
      return config.selection || Selection.atStart(instance2.doc);
    },
    apply(tr) {
      return tr.selection;
    }
  }),
  new FieldDesc("storedMarks", {
    init(config) {
      return config.storedMarks || null;
    },
    apply(tr, _marks, _old, state) {
      return state.selection.$cursor ? tr.storedMarks : null;
    }
  }),
  new FieldDesc("scrollToSelection", {
    init() {
      return 0;
    },
    apply(tr, prev) {
      return tr.scrolledIntoView ? prev + 1 : prev;
    }
  })
];
globalThis.ProseMirror ? ProseMirror.ProseMirrorKeyMaps : class {
};
const TJSProseMirror_svelte_svelte_type_style_lang = "";
const TJSTinyMCE_svelte_svelte_type_style_lang = "";
const TJSSvgFolder_svelte_svelte_type_style_lang = "";
const TJSIconFolder_svelte_svelte_type_style_lang = "";
const TJSInputText_svelte_svelte_type_style_lang = "";
function create_fragment$b(ctx) {
  let div;
  let input_1;
  let applyStyles_action;
  let mounted;
  let dispose;
  let input_1_levels = [
    { class: "tjs-input" },
    { type: ctx[0] },
    { placeholder: ctx[2] },
    { disabled: ctx[1] }
  ];
  let input_1_data = {};
  for (let i = 0; i < input_1_levels.length; i += 1) {
    input_1_data = assign(input_1_data, input_1_levels[i]);
  }
  return {
    c() {
      div = element("div");
      input_1 = element("input");
      set_attributes(input_1, input_1_data);
      toggle_class(input_1, "svelte-173wftf", true);
      attr(div, "class", "tjs-input-container svelte-173wftf");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, input_1);
      if (input_1.autofocus)
        input_1.focus();
      ctx[12](input_1);
      set_input_value(input_1, ctx[7]);
      if (!mounted) {
        dispose = [
          listen(input_1, "input", ctx[13]),
          action_destroyer(autoBlur.call(null, input_1)),
          listen(input_1, "focusin", ctx[8]),
          listen(input_1, "keydown", ctx[9]),
          action_destroyer(ctx[5].call(null, div)),
          action_destroyer(applyStyles_action = applyStyles.call(null, div, ctx[4]))
        ];
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      set_attributes(input_1, input_1_data = get_spread_update(input_1_levels, [
        { class: "tjs-input" },
        dirty & 1 && { type: ctx2[0] },
        dirty & 4 && { placeholder: ctx2[2] },
        dirty & 2 && { disabled: ctx2[1] }
      ]));
      if (dirty & 128 && input_1.value !== ctx2[7]) {
        set_input_value(input_1, ctx2[7]);
      }
      toggle_class(input_1, "svelte-173wftf", true);
      if (applyStyles_action && is_function(applyStyles_action.update) && dirty & 16)
        applyStyles_action.update.call(null, ctx2[4]);
    },
    i: noop$1,
    o: noop$1,
    d(detaching) {
      if (detaching)
        detach(div);
      ctx[12](null);
      mounted = false;
      run_all(dispose);
    }
  };
}
__name(create_fragment$b, "create_fragment$b");
function instance$b($$self, $$props, $$invalidate) {
  let $store, $$unsubscribe_store = noop$1, $$subscribe_store = /* @__PURE__ */ __name(() => ($$unsubscribe_store(), $$unsubscribe_store = subscribe(store, ($$value) => $$invalidate(7, $store = $$value)), store), "$$subscribe_store");
  $$self.$$.on_destroy.push(() => $$unsubscribe_store());
  let { input = void 0 } = $$props;
  let { type = void 0 } = $$props;
  let { disabled = void 0 } = $$props;
  let { options = void 0 } = $$props;
  let { placeholder = void 0 } = $$props;
  let { store = void 0 } = $$props;
  $$subscribe_store();
  let { styles = void 0 } = $$props;
  let { efx = void 0 } = $$props;
  const localOptions = {
    blurOnEnterKey: true,
    cancelOnEscKey: false,
    clearOnEscKey: false
  };
  let inputEl;
  let initialValue;
  function onFocusIn(event) {
    initialValue = localOptions.cancelOnEscKey ? inputEl.value : void 0;
  }
  __name(onFocusIn, "onFocusIn");
  function onKeyDown(event) {
    if (localOptions.blurOnEnterKey && event.key === "Enter") {
      inputEl.blur();
      return;
    }
    if (event.key === "Escape") {
      if (localOptions.cancelOnEscKey && typeof initialValue === "string") {
        store.set(initialValue);
        initialValue = void 0;
        inputEl.blur();
      } else if (localOptions.clearOnEscKey) {
        store.set("");
        inputEl.blur();
      }
    }
  }
  __name(onKeyDown, "onKeyDown");
  function input_1_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      inputEl = $$value;
      $$invalidate(6, inputEl);
    });
  }
  __name(input_1_binding, "input_1_binding");
  function input_1_input_handler() {
    $store = this.value;
    store.set($store);
  }
  __name(input_1_input_handler, "input_1_input_handler");
  $$self.$$set = ($$props2) => {
    if ("input" in $$props2)
      $$invalidate(11, input = $$props2.input);
    if ("type" in $$props2)
      $$invalidate(0, type = $$props2.type);
    if ("disabled" in $$props2)
      $$invalidate(1, disabled = $$props2.disabled);
    if ("options" in $$props2)
      $$invalidate(10, options = $$props2.options);
    if ("placeholder" in $$props2)
      $$invalidate(2, placeholder = $$props2.placeholder);
    if ("store" in $$props2)
      $$subscribe_store($$invalidate(3, store = $$props2.store));
    if ("styles" in $$props2)
      $$invalidate(4, styles = $$props2.styles);
    if ("efx" in $$props2)
      $$invalidate(5, efx = $$props2.efx);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & 2049) {
      {
        $$invalidate(0, type = isObject$1(input) && typeof input.type === "string" ? input.type : typeof type === "string" ? type : "text");
        switch (type) {
          case "email":
          case "number":
          case "password":
          case "search":
          case "text":
          case "url":
            break;
          default:
            throw new Error(`'TJSInputText only supports text input types: 'email', 'number', 'password', 'search', 'text', 'url'.`);
        }
      }
    }
    if ($$self.$$.dirty & 2050) {
      $$invalidate(1, disabled = isObject$1(input) && typeof input.disabled === "boolean" ? input.disabled : typeof disabled === "boolean" ? disabled : false);
    }
    if ($$self.$$.dirty & 3072) {
      {
        $$invalidate(10, options = isObject$1(input) && isObject$1(input.options) ? input.options : isObject$1(options) ? options : {});
        if (typeof options?.blurOnEnterKey === "boolean") {
          localOptions.blurOnEnterKey = options.blurOnEnterKey;
        }
        if (typeof options?.cancelOnEscKey === "boolean") {
          localOptions.cancelOnEscKey = options.cancelOnEscKey;
        }
        if (typeof options?.clearOnEscKey === "boolean") {
          localOptions.clearOnEscKey = options.clearOnEscKey;
        }
      }
    }
    if ($$self.$$.dirty & 2052) {
      $$invalidate(2, placeholder = isObject$1(input) && typeof input.placeholder === "string" ? localize(input.placeholder) : typeof placeholder === "string" ? localize(placeholder) : void 0);
    }
    if ($$self.$$.dirty & 2056) {
      $$subscribe_store($$invalidate(3, store = isObject$1(input) && isWritableStore(input.store) ? input.store : isWritableStore(store) ? store : writable$1(void 0)));
    }
    if ($$self.$$.dirty & 2064) {
      $$invalidate(4, styles = isObject$1(input) && isObject$1(input.styles) ? input.styles : typeof styles === "object" ? styles : void 0);
    }
    if ($$self.$$.dirty & 2080) {
      $$invalidate(5, efx = isObject$1(input) && typeof input.efx === "function" ? input.efx : typeof efx === "function" ? efx : () => {
      });
    }
  };
  return [
    type,
    disabled,
    placeholder,
    store,
    styles,
    efx,
    inputEl,
    $store,
    onFocusIn,
    onKeyDown,
    options,
    input,
    input_1_binding,
    input_1_input_handler
  ];
}
__name(instance$b, "instance$b");
class TJSInputText extends SvelteComponent {
  constructor(options) {
    super();
    init$1(this, options, instance$b, create_fragment$b, safe_not_equal, {
      input: 11,
      type: 0,
      disabled: 1,
      options: 10,
      placeholder: 2,
      store: 3,
      styles: 4,
      efx: 5
    });
  }
}
__name(TJSInputText, "TJSInputText");
const TJSSelect_svelte_svelte_type_style_lang = "";
function get_each_context$2(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[10] = list[i];
  return child_ctx;
}
__name(get_each_context$2, "get_each_context$2");
function create_each_block$2(ctx) {
  let option;
  let t0_value = ctx[10].label + "";
  let t0;
  let t1;
  let option_value_value;
  return {
    c() {
      option = element("option");
      t0 = text(t0_value);
      t1 = space();
      attr(option, "class", "tjs-select-option svelte-rt6859");
      option.__value = option_value_value = ctx[10].value;
      option.value = option.__value;
    },
    m(target, anchor) {
      insert(target, option, anchor);
      append(option, t0);
      append(option, t1);
    },
    p(ctx2, dirty) {
      if (dirty & 1 && t0_value !== (t0_value = ctx2[10].label + ""))
        set_data(t0, t0_value);
      if (dirty & 1 && option_value_value !== (option_value_value = ctx2[10].value)) {
        option.__value = option_value_value;
        option.value = option.__value;
      }
    },
    d(detaching) {
      if (detaching)
        detach(option);
    }
  };
}
__name(create_each_block$2, "create_each_block$2");
function create_fragment$a(ctx) {
  let div;
  let select_1;
  let applyStyles_action;
  let mounted;
  let dispose;
  let each_value = ctx[0];
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
  }
  return {
    c() {
      div = element("div");
      select_1 = element("select");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      attr(select_1, "class", "tjs-select svelte-rt6859");
      if (ctx[4] === void 0)
        add_render_callback(() => ctx[9].call(select_1));
      attr(div, "class", "tjs-select-container svelte-rt6859");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, select_1);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(select_1, null);
      }
      select_option(select_1, ctx[4]);
      if (!mounted) {
        dispose = [
          listen(select_1, "change", ctx[8]),
          listen(select_1, "change", ctx[9]),
          action_destroyer(autoBlur.call(null, select_1)),
          listen(div, "change", ctx[7]),
          action_destroyer(ctx[3].call(null, div)),
          action_destroyer(applyStyles_action = applyStyles.call(null, div, ctx[2]))
        ];
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & 1) {
        each_value = ctx2[0];
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context$2(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block$2(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(select_1, null);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value.length;
      }
      if (dirty & 17) {
        select_option(select_1, ctx2[4]);
      }
      if (applyStyles_action && is_function(applyStyles_action.update) && dirty & 4)
        applyStyles_action.update.call(null, ctx2[2]);
    },
    i: noop$1,
    o: noop$1,
    d(detaching) {
      if (detaching)
        detach(div);
      destroy_each(each_blocks, detaching);
      mounted = false;
      run_all(dispose);
    }
  };
}
__name(create_fragment$a, "create_fragment$a");
function instance$a($$self, $$props, $$invalidate) {
  let $store, $$unsubscribe_store = noop$1, $$subscribe_store = /* @__PURE__ */ __name(() => ($$unsubscribe_store(), $$unsubscribe_store = subscribe(store, ($$value) => $$invalidate(4, $store = $$value)), store), "$$subscribe_store");
  $$self.$$.on_destroy.push(() => $$unsubscribe_store());
  let { select = void 0 } = $$props;
  let { selected = void 0 } = $$props;
  let { options = void 0 } = $$props;
  let { store = void 0 } = $$props;
  $$subscribe_store();
  let { styles = void 0 } = $$props;
  let { efx = void 0 } = $$props;
  onMount(() => {
    if (selected && store && !options.includes($store) && options.includes(selected)) {
      store.set(selected);
    }
  });
  function change_handler(event) {
    bubble.call(this, $$self, event);
  }
  __name(change_handler, "change_handler");
  function change_handler_1(event) {
    bubble.call(this, $$self, event);
  }
  __name(change_handler_1, "change_handler_1");
  function select_1_change_handler() {
    $store = select_value(this);
    store.set($store);
    $$invalidate(0, options), $$invalidate(6, select);
  }
  __name(select_1_change_handler, "select_1_change_handler");
  $$self.$$set = ($$props2) => {
    if ("select" in $$props2)
      $$invalidate(6, select = $$props2.select);
    if ("selected" in $$props2)
      $$invalidate(5, selected = $$props2.selected);
    if ("options" in $$props2)
      $$invalidate(0, options = $$props2.options);
    if ("store" in $$props2)
      $$subscribe_store($$invalidate(1, store = $$props2.store));
    if ("styles" in $$props2)
      $$invalidate(2, styles = $$props2.styles);
    if ("efx" in $$props2)
      $$invalidate(3, efx = $$props2.efx);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & 96) {
      $$invalidate(5, selected = typeof select === "object" && typeof select.selected === "string" ? select.selected : typeof selected === "string" ? selected : void 0);
    }
    if ($$self.$$.dirty & 65) {
      $$invalidate(0, options = typeof select === "object" && Array.isArray(select.options) ? select.options : Array.isArray(options) ? options : []);
    }
    if ($$self.$$.dirty & 66) {
      $$subscribe_store($$invalidate(1, store = typeof select === "object" && isWritableStore(select.store) ? select.store : isWritableStore(store) ? store : writable$1(void 0)));
    }
    if ($$self.$$.dirty & 68) {
      $$invalidate(2, styles = typeof select === "object" && typeof select.styles === "object" ? select.styles : typeof styles === "object" ? styles : void 0);
    }
    if ($$self.$$.dirty & 72) {
      $$invalidate(3, efx = typeof select === "object" && typeof select.efx === "function" ? select.efx : typeof efx === "function" ? efx : () => {
      });
    }
  };
  return [
    options,
    store,
    styles,
    efx,
    $store,
    selected,
    select,
    change_handler,
    change_handler_1,
    select_1_change_handler
  ];
}
__name(instance$a, "instance$a");
class TJSSelect extends SvelteComponent {
  constructor(options) {
    super();
    init$1(this, options, instance$a, create_fragment$a, safe_not_equal, {
      select: 6,
      selected: 5,
      options: 0,
      store: 1,
      styles: 2,
      efx: 3
    });
  }
}
__name(TJSSelect, "TJSSelect");
const TJSToggleLabel_svelte_svelte_type_style_lang = "";
const ResizeHitBox_svelte_svelte_type_style_lang = "";
const SelectedBorder_svelte_svelte_type_style_lang = "";
const PositionControl_svelte_svelte_type_style_lang = "";
const TJSPositionControlLayer_svelte_svelte_type_style_lang = "";
const TJSMenu_svelte_svelte_type_style_lang = "";
const TJSContextMenu_svelte_svelte_type_style_lang = "";
const { document: document_1 } = globals;
const get_after_slot_changes = /* @__PURE__ */ __name((dirty) => ({}), "get_after_slot_changes");
const get_after_slot_context = /* @__PURE__ */ __name((ctx) => ({}), "get_after_slot_context");
function get_each_context$1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[19] = list[i];
  return child_ctx;
}
__name(get_each_context$1, "get_each_context$1");
const get_before_slot_changes = /* @__PURE__ */ __name((dirty) => ({}), "get_before_slot_changes");
const get_before_slot_context = /* @__PURE__ */ __name((ctx) => ({}), "get_before_slot_context");
function create_each_block$1(ctx) {
  let li;
  let i;
  let i_class_value;
  let t_value = localize(ctx[19].label) + "";
  let t;
  let mounted;
  let dispose;
  function click_handler() {
    return ctx[14](ctx[19]);
  }
  __name(click_handler, "click_handler");
  return {
    c() {
      li = element("li");
      i = element("i");
      t = text(t_value);
      attr(i, "class", i_class_value = null_to_empty(ctx[19].icon) + " svelte-ugn418");
      attr(li, "class", "tjs-context-item svelte-ugn418");
      attr(li, "role", "presentation");
    },
    m(target, anchor) {
      insert(target, li, anchor);
      append(li, i);
      append(li, t);
      if (!mounted) {
        dispose = listen(li, "click", stop_propagation(prevent_default(click_handler)));
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & 2 && i_class_value !== (i_class_value = null_to_empty(ctx[19].icon) + " svelte-ugn418")) {
        attr(i, "class", i_class_value);
      }
      if (dirty & 2 && t_value !== (t_value = localize(ctx[19].label) + ""))
        set_data(t, t_value);
    },
    d(detaching) {
      if (detaching)
        detach(li);
      mounted = false;
      dispose();
    }
  };
}
__name(create_each_block$1, "create_each_block$1");
function create_fragment$9(ctx) {
  let t0;
  let nav;
  let ol;
  let t1;
  let t2;
  let nav_transition;
  let current;
  let mounted;
  let dispose;
  const before_slot_template = ctx[12].before;
  const before_slot = create_slot(before_slot_template, ctx, ctx[11], get_before_slot_context);
  let each_value = ctx[1];
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
  }
  const after_slot_template = ctx[12].after;
  const after_slot = create_slot(after_slot_template, ctx, ctx[11], get_after_slot_context);
  return {
    c() {
      t0 = space();
      nav = element("nav");
      ol = element("ol");
      if (before_slot)
        before_slot.c();
      t1 = space();
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      t2 = space();
      if (after_slot)
        after_slot.c();
      attr(ol, "class", "tjs-context-items svelte-ugn418");
      attr(nav, "id", ctx[0]);
      attr(nav, "class", "tjs-context-menu svelte-ugn418");
      set_style(nav, "z-index", ctx[2]);
    },
    m(target, anchor) {
      insert(target, t0, anchor);
      insert(target, nav, anchor);
      append(nav, ol);
      if (before_slot) {
        before_slot.m(ol, null);
      }
      append(ol, t1);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(ol, null);
      }
      append(ol, t2);
      if (after_slot) {
        after_slot.m(ol, null);
      }
      ctx[15](nav);
      current = true;
      if (!mounted) {
        dispose = [
          listen(window, "blur", ctx[7]),
          listen(document_1.body, "pointerdown", ctx[6]),
          listen(document_1.body, "wheel", ctx[13]),
          listen(nav, "click", stop_propagation(prevent_default(click_handler_1))),
          listen(nav, "keydown", stop_propagation(prevent_default(keydown_handler)))
        ];
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (before_slot) {
        if (before_slot.p && (!current || dirty & 2048)) {
          update_slot_base(
            before_slot,
            before_slot_template,
            ctx2,
            ctx2[11],
            !current ? get_all_dirty_from_scope(ctx2[11]) : get_slot_changes(before_slot_template, ctx2[11], dirty, get_before_slot_changes),
            get_before_slot_context
          );
        }
      }
      if (dirty & 34) {
        each_value = ctx2[1];
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context$1(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block$1(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(ol, t2);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value.length;
      }
      if (after_slot) {
        if (after_slot.p && (!current || dirty & 2048)) {
          update_slot_base(
            after_slot,
            after_slot_template,
            ctx2,
            ctx2[11],
            !current ? get_all_dirty_from_scope(ctx2[11]) : get_slot_changes(after_slot_template, ctx2[11], dirty, get_after_slot_changes),
            get_after_slot_context
          );
        }
      }
      if (!current || dirty & 1) {
        attr(nav, "id", ctx2[0]);
      }
      if (!current || dirty & 4) {
        set_style(nav, "z-index", ctx2[2]);
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(before_slot, local);
      transition_in(after_slot, local);
      add_render_callback(() => {
        if (!nav_transition)
          nav_transition = create_bidirectional_transition(nav, ctx[4], {}, true);
        nav_transition.run(1);
      });
      current = true;
    },
    o(local) {
      transition_out(before_slot, local);
      transition_out(after_slot, local);
      if (!nav_transition)
        nav_transition = create_bidirectional_transition(nav, ctx[4], {}, false);
      nav_transition.run(0);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(t0);
      if (detaching)
        detach(nav);
      if (before_slot)
        before_slot.d(detaching);
      destroy_each(each_blocks, detaching);
      if (after_slot)
        after_slot.d(detaching);
      ctx[15](null);
      if (detaching && nav_transition)
        nav_transition.end();
      mounted = false;
      run_all(dispose);
    }
  };
}
__name(create_fragment$9, "create_fragment$9");
const click_handler_1 = /* @__PURE__ */ __name(() => null, "click_handler_1");
const keydown_handler = /* @__PURE__ */ __name(() => null, "keydown_handler");
function instance$9($$self, $$props, $$invalidate) {
  let { $$slots: slots = {}, $$scope } = $$props;
  let { id = "" } = $$props;
  let { x = 0 } = $$props;
  let { y = 0 } = $$props;
  let { items = [] } = $$props;
  let { zIndex = 1e4 } = $$props;
  let { transitionOptions = void 0 } = $$props;
  let menuEl;
  const local = current_component;
  const dispatch2 = createEventDispatcher();
  let closed = false;
  function animate(node) {
    const expandUp = y + node.clientHeight > document.body.clientHeight;
    const expandLeft = x + node.clientWidth > document.body.clientWidth;
    node.style.top = expandUp ? null : `${y}px`;
    node.style.bottom = expandUp ? `${document.body.clientHeight - y}px` : null;
    node.style.left = expandLeft ? null : `${x}px`;
    node.style.right = expandLeft ? `${document.body.clientWidth - x}px` : null;
    return slideFade(node, transitionOptions);
  }
  __name(animate, "animate");
  function onClick(callback2) {
    if (typeof callback2 === "function") {
      callback2();
    }
    if (!closed) {
      dispatch2("close");
      closed = true;
      outroAndDestroy(local);
    }
  }
  __name(onClick, "onClick");
  function onClose(event, isWheel = false) {
    if (event.target === menuEl || menuEl.contains(event.target)) {
      return;
    }
    if (!isWheel && Math.floor(event.pageX) === x && Math.floor(event.pageY) === y) {
      return;
    }
    if (!closed) {
      dispatch2("close");
      closed = true;
      outroAndDestroy(local);
    }
  }
  __name(onClose, "onClose");
  function onWindowBlur() {
    if (!closed) {
      dispatch2("close");
      closed = true;
      outroAndDestroy(local);
    }
  }
  __name(onWindowBlur, "onWindowBlur");
  const wheel_handler = /* @__PURE__ */ __name((event) => onClose(event, true), "wheel_handler");
  const click_handler = /* @__PURE__ */ __name((item) => onClick(item.onclick), "click_handler");
  function nav_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      menuEl = $$value;
      $$invalidate(3, menuEl);
    });
  }
  __name(nav_binding, "nav_binding");
  $$self.$$set = ($$props2) => {
    if ("id" in $$props2)
      $$invalidate(0, id = $$props2.id);
    if ("x" in $$props2)
      $$invalidate(8, x = $$props2.x);
    if ("y" in $$props2)
      $$invalidate(9, y = $$props2.y);
    if ("items" in $$props2)
      $$invalidate(1, items = $$props2.items);
    if ("zIndex" in $$props2)
      $$invalidate(2, zIndex = $$props2.zIndex);
    if ("transitionOptions" in $$props2)
      $$invalidate(10, transitionOptions = $$props2.transitionOptions);
    if ("$$scope" in $$props2)
      $$invalidate(11, $$scope = $$props2.$$scope);
  };
  return [
    id,
    items,
    zIndex,
    menuEl,
    animate,
    onClick,
    onClose,
    onWindowBlur,
    x,
    y,
    transitionOptions,
    $$scope,
    slots,
    wheel_handler,
    click_handler,
    nav_binding
  ];
}
__name(instance$9, "instance$9");
class TJSContextMenu$1 extends SvelteComponent {
  constructor(options) {
    super();
    init$1(this, options, instance$9, create_fragment$9, safe_not_equal, {
      id: 0,
      x: 8,
      y: 9,
      items: 1,
      zIndex: 2,
      transitionOptions: 10
    });
  }
}
__name(TJSContextMenu$1, "TJSContextMenu$1");
const SettingEntry_svelte_svelte_type_style_lang = "";
const TJSSettingsEdit_svelte_svelte_type_style_lang = "";
cssVariables.setProperties({
  "--tjs-action-ripple-background": "rgba(0, 0, 0, 0.35)"
}, false);
cssVariables.setProperties({
  "--tjs-icon-button-background": "none",
  "--tjs-icon-button-background-hover": "rgba(0, 0, 0, 0.10)",
  "--tjs-icon-button-background-selected": "rgba(0, 0, 0, 0.20)",
  "--tjs-icon-button-border-radius": "50%",
  "--tjs-icon-button-clip-path": "none",
  "--tjs-icon-button-diameter": "2em",
  "--tjs-icon-button-transition": "background 200ms linear, clip-path 200ms linear"
}, false);
{
  const props = FoundryStyles.getProperties('input[type="text"], input[type="number"]');
  if (typeof props === "object") {
    cssVariables.setProperties({
      "--tjs-input-background": "background" in props ? props.background : "rgba(0, 0, 0, 0.05)",
      "--tjs-input-border": "border" in props ? props.border : "1px solid var(--color-border-light-tertiary)",
      "--tjs-input-border-radius": "border-radius" in props ? props["border-radius"] : "3px",
      "--tjs-input-height": "height" in props ? props.height : "var(--form-field-height)",
      "--tjs-input-min-width": "min-width" in props ? props["min-width"] : "20px",
      "--tjs-input-padding": "padding" in props ? props["padding"] : "1px 3px",
      "--tjs-input-width": "width" in props ? props.width : "calc(100% - 2px)"
    }, false);
  }
}
{
  const props = FoundryStyles.getProperties("option, optgroup");
  if (typeof props === "object") {
    cssVariables.setProperties({
      "--tjs-select-option-background": "background" in props ? props.background : "var(--color-bg-option)"
    }, false);
  }
}
cssVariables.setProperties({
  "--tjs-label-transition": "background 200ms linear"
}, false);
cssVariables.setProperties({
  "--tjs-menu-border": "1px solid var(--color-border-dark, #000)",
  "--tjs-menu-box-shadow": "0 0 2px var(--color-shadow-dark, #000)",
  "--tjs-menu-color": "var(--color-text-light-primary, #EEE)",
  "--tjs-menu-item-hover-text-shadow-color": "var(--color-text-hyperlink, red)"
}, false);
Hooks.on("PopOut:loading", (app, popout) => {
  if (app instanceof SvelteApplication) {
    popout.document.addEventListener("DOMContentLoaded", () => cssVariables.clone(popout.document));
  }
});
const Controls_svelte_svelte_type_style_lang = "";
function create_if_block$2(ctx) {
  let div;
  let tjsiconbutton;
  let div_transition;
  let current;
  tjsiconbutton = new TJSIconButton({
    props: { button: ctx[6] }
  });
  tjsiconbutton.$on("click", scrollSmooth$1);
  return {
    c() {
      div = element("div");
      create_component(tjsiconbutton.$$.fragment);
      attr(div, "class", "scrollTop iconButton svelte-1dhbvj9");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      mount_component(tjsiconbutton, div, null);
      current = true;
    },
    p: noop$1,
    i(local) {
      if (current)
        return;
      transition_in(tjsiconbutton.$$.fragment, local);
      add_render_callback(() => {
        if (!div_transition)
          div_transition = create_bidirectional_transition(div, fade, {}, true);
        div_transition.run(1);
      });
      current = true;
    },
    o(local) {
      transition_out(tjsiconbutton.$$.fragment, local);
      if (!div_transition)
        div_transition = create_bidirectional_transition(div, fade, {}, false);
      div_transition.run(0);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div);
      destroy_component(tjsiconbutton);
      if (detaching && div_transition)
        div_transition.end();
    }
  };
}
__name(create_if_block$2, "create_if_block$2");
function create_fragment$8(ctx) {
  let nav;
  let label;
  let t1;
  let tjsselect;
  let t2;
  let tjsinputtext;
  let t3;
  let div0;
  let tjstoggleiconbutton0;
  let t4;
  let div1;
  let tjstoggleiconbutton1;
  let t5;
  let if_block_anchor;
  let current;
  tjsselect = new TJSSelect({ props: { select: ctx[2] } });
  tjsinputtext = new TJSInputText({ props: { input: ctx[3] } });
  tjstoggleiconbutton0 = new TJSToggleIconButton({
    props: { button: ctx[4] }
  });
  tjstoggleiconbutton1 = new TJSToggleIconButton({
    props: { button: ctx[5] }
  });
  let if_block = ctx[0] > 300 && create_if_block$2(ctx);
  return {
    c() {
      nav = element("nav");
      label = element("label");
      label.textContent = `${localize("mcc.selectVersion")}`;
      t1 = space();
      create_component(tjsselect.$$.fragment);
      t2 = space();
      create_component(tjsinputtext.$$.fragment);
      t3 = space();
      div0 = element("div");
      create_component(tjstoggleiconbutton0.$$.fragment);
      t4 = space();
      div1 = element("div");
      create_component(tjstoggleiconbutton1.$$.fragment);
      t5 = space();
      if (if_block)
        if_block.c();
      if_block_anchor = empty();
      attr(label, "class", "svelte-1dhbvj9");
      attr(div0, "class", "iconButton svelte-1dhbvj9");
      attr(div1, "class", "iconButton svelte-1dhbvj9");
      attr(nav, "class", "svelte-1dhbvj9");
    },
    m(target, anchor) {
      insert(target, nav, anchor);
      append(nav, label);
      append(nav, t1);
      mount_component(tjsselect, nav, null);
      append(nav, t2);
      mount_component(tjsinputtext, nav, null);
      append(nav, t3);
      append(nav, div0);
      mount_component(tjstoggleiconbutton0, div0, null);
      append(nav, t4);
      append(nav, div1);
      mount_component(tjstoggleiconbutton1, div1, null);
      insert(target, t5, anchor);
      if (if_block)
        if_block.m(target, anchor);
      insert(target, if_block_anchor, anchor);
      current = true;
    },
    p(ctx2, [dirty]) {
      if (ctx2[0] > 300) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty & 1) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block$2(ctx2);
          if_block.c();
          transition_in(if_block, 1);
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      } else if (if_block) {
        group_outros();
        transition_out(if_block, 1, 1, () => {
          if_block = null;
        });
        check_outros();
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(tjsselect.$$.fragment, local);
      transition_in(tjsinputtext.$$.fragment, local);
      transition_in(tjstoggleiconbutton0.$$.fragment, local);
      transition_in(tjstoggleiconbutton1.$$.fragment, local);
      transition_in(if_block);
      current = true;
    },
    o(local) {
      transition_out(tjsselect.$$.fragment, local);
      transition_out(tjsinputtext.$$.fragment, local);
      transition_out(tjstoggleiconbutton0.$$.fragment, local);
      transition_out(tjstoggleiconbutton1.$$.fragment, local);
      transition_out(if_block);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(nav);
      destroy_component(tjsselect);
      destroy_component(tjsinputtext);
      destroy_component(tjstoggleiconbutton0);
      destroy_component(tjstoggleiconbutton1);
      if (detaching)
        detach(t5);
      if (if_block)
        if_block.d(detaching);
      if (detaching)
        detach(if_block_anchor);
    }
  };
}
__name(create_fragment$8, "create_fragment$8");
function scrollSmooth$1(event) {
  event.target.dispatchEvent(new CustomEvent("scrollTop:smooth", { bubbles: true }));
}
__name(scrollSmooth$1, "scrollSmooth$1");
function instance$8($$self, $$props, $$invalidate) {
  let $scrollTop;
  const spreadsheetStore = getContext("spreadsheetStore");
  const { details, active: active2, filterSearch, scrollTop, version: version2 } = spreadsheetStore.stores;
  component_subscribe($$self, scrollTop, (value) => $$invalidate(0, $scrollTop = value));
  const select = {
    store: version2,
    efx: rippleFocus(),
    options: spreadsheetStore.versions.map((entry) => ({ label: `v${entry}`, value: entry })),
    styles: { width: "7em" }
  };
  const input = {
    store: filterSearch,
    efx: rippleFocus(),
    placeholder: "Search module compatibility...",
    type: "search"
  };
  const buttonDetails = {
    store: details,
    icon: "fas fa-info",
    efx: ripple(),
    title: "mcc.showDetails",
    titleSelected: "mcc.hideDetails"
  };
  const buttonActive = {
    store: active2,
    icon: "fas fa-check",
    efx: ripple(),
    title: "mcc.enableActive",
    titleSelected: "mcc.disableActive"
  };
  const buttonScrollTop = {
    icon: "fas fa-angle-double-up",
    efx: ripple(),
    title: "mcc.scrollTop"
  };
  return [
    $scrollTop,
    scrollTop,
    select,
    input,
    buttonDetails,
    buttonActive,
    buttonScrollTop
  ];
}
__name(instance$8, "instance$8");
class Controls extends SvelteComponent {
  constructor(options) {
    super();
    init$1(this, options, instance$8, create_fragment$8, safe_not_equal, {});
  }
}
__name(Controls, "Controls");
const Heading_svelte_svelte_type_style_lang = "";
function create_fragment$7(ctx) {
  let th;
  let t0_value = localize(`mcc.${ctx[0]}`) + "";
  let t0;
  let t1;
  let i;
  let i_class_value;
  let mounted;
  let dispose;
  return {
    c() {
      th = element("th");
      t0 = text(t0_value);
      t1 = space();
      i = element("i");
      attr(i, "class", i_class_value = "fas fa-sort" + (ctx[1] !== ctx[0] ? "" : ctx[2] ? "-up" : "-down") + " svelte-g8xeip");
      attr(th, "class", "svelte-g8xeip");
    },
    m(target, anchor) {
      insert(target, th, anchor);
      append(th, t0);
      append(th, t1);
      append(th, i);
      if (!mounted) {
        dispose = listen(th, "click", ctx[6]);
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & 1 && t0_value !== (t0_value = localize(`mcc.${ctx2[0]}`) + ""))
        set_data(t0, t0_value);
      if (dirty & 7 && i_class_value !== (i_class_value = "fas fa-sort" + (ctx2[1] !== ctx2[0] ? "" : ctx2[2] ? "-up" : "-down") + " svelte-g8xeip")) {
        attr(i, "class", i_class_value);
      }
    },
    i: noop$1,
    o: noop$1,
    d(detaching) {
      if (detaching)
        detach(th);
      mounted = false;
      dispose();
    }
  };
}
__name(create_fragment$7, "create_fragment$7");
function instance$7($$self, $$props, $$invalidate) {
  let $reversed;
  let $sortBy;
  let { name } = $$props;
  const spreadsheetStore = getContext("spreadsheetStore");
  const { sortBy: sortBy2, reversed } = spreadsheetStore.stores;
  component_subscribe($$self, sortBy2, (value) => $$invalidate(1, $sortBy = value));
  component_subscribe($$self, reversed, (value) => $$invalidate(7, $reversed = value));
  let direction = $sortBy === name && $reversed;
  function setSortBy(heading) {
    set_store_value(sortBy2, $sortBy = heading, $sortBy);
    $$invalidate(2, direction = !direction);
    set_store_value(reversed, $reversed = direction, $reversed);
  }
  __name(setSortBy, "setSortBy");
  const click_handler = /* @__PURE__ */ __name(() => setSortBy(name), "click_handler");
  $$self.$$set = ($$props2) => {
    if ("name" in $$props2)
      $$invalidate(0, name = $$props2.name);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & 3) {
      if ($sortBy !== name) {
        $$invalidate(2, direction = true);
      }
    }
  };
  return [name, $sortBy, direction, sortBy2, reversed, setSortBy, click_handler];
}
__name(instance$7, "instance$7");
class Heading extends SvelteComponent {
  constructor(options) {
    super();
    init$1(this, options, instance$7, create_fragment$7, safe_not_equal, { name: 0 });
  }
}
__name(Heading, "Heading");
const Header_svelte_svelte_type_style_lang = "";
function create_if_block$1(ctx) {
  let heading0;
  let t0;
  let heading1;
  let t1;
  let heading2;
  let t2;
  let heading3;
  let current;
  heading0 = new Heading({ props: { name: "type" } });
  heading1 = new Heading({ props: { name: "id" } });
  heading2 = new Heading({ props: { name: "version" } });
  heading3 = new Heading({ props: { name: "status" } });
  return {
    c() {
      create_component(heading0.$$.fragment);
      t0 = space();
      create_component(heading1.$$.fragment);
      t1 = space();
      create_component(heading2.$$.fragment);
      t2 = space();
      create_component(heading3.$$.fragment);
    },
    m(target, anchor) {
      mount_component(heading0, target, anchor);
      insert(target, t0, anchor);
      mount_component(heading1, target, anchor);
      insert(target, t1, anchor);
      mount_component(heading2, target, anchor);
      insert(target, t2, anchor);
      mount_component(heading3, target, anchor);
      current = true;
    },
    i(local) {
      if (current)
        return;
      transition_in(heading0.$$.fragment, local);
      transition_in(heading1.$$.fragment, local);
      transition_in(heading2.$$.fragment, local);
      transition_in(heading3.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(heading0.$$.fragment, local);
      transition_out(heading1.$$.fragment, local);
      transition_out(heading2.$$.fragment, local);
      transition_out(heading3.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(heading0, detaching);
      if (detaching)
        detach(t0);
      destroy_component(heading1, detaching);
      if (detaching)
        detach(t1);
      destroy_component(heading2, detaching);
      if (detaching)
        detach(t2);
      destroy_component(heading3, detaching);
    }
  };
}
__name(create_if_block$1, "create_if_block$1");
function create_key_block$1(ctx) {
  let tr;
  let heading0;
  let t0;
  let t1;
  let heading1;
  let current;
  heading0 = new Heading({ props: { name: "title" } });
  let if_block = ctx[0] && create_if_block$1();
  heading1 = new Heading({ props: { name: "notes" } });
  return {
    c() {
      tr = element("tr");
      create_component(heading0.$$.fragment);
      t0 = space();
      if (if_block)
        if_block.c();
      t1 = space();
      create_component(heading1.$$.fragment);
      attr(tr, "class", "svelte-130xaph");
    },
    m(target, anchor) {
      insert(target, tr, anchor);
      mount_component(heading0, tr, null);
      append(tr, t0);
      if (if_block)
        if_block.m(tr, null);
      append(tr, t1);
      mount_component(heading1, tr, null);
      current = true;
    },
    p(ctx2, dirty) {
      if (ctx2[0]) {
        if (if_block) {
          if (dirty & 1) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block$1();
          if_block.c();
          transition_in(if_block, 1);
          if_block.m(tr, t1);
        }
      } else if (if_block) {
        group_outros();
        transition_out(if_block, 1, 1, () => {
          if_block = null;
        });
        check_outros();
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(heading0.$$.fragment, local);
      transition_in(if_block);
      transition_in(heading1.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(heading0.$$.fragment, local);
      transition_out(if_block);
      transition_out(heading1.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(tr);
      destroy_component(heading0);
      if (if_block)
        if_block.d();
      destroy_component(heading1);
    }
  };
}
__name(create_key_block$1, "create_key_block$1");
function create_fragment$6(ctx) {
  let thead;
  let previous_key = ctx[0];
  let current;
  let key_block = create_key_block$1(ctx);
  return {
    c() {
      thead = element("thead");
      key_block.c();
      attr(thead, "class", "svelte-130xaph");
    },
    m(target, anchor) {
      insert(target, thead, anchor);
      key_block.m(thead, null);
      current = true;
    },
    p(ctx2, [dirty]) {
      if (dirty & 1 && safe_not_equal(previous_key, previous_key = ctx2[0])) {
        group_outros();
        transition_out(key_block, 1, 1, noop$1);
        check_outros();
        key_block = create_key_block$1(ctx2);
        key_block.c();
        transition_in(key_block, 1);
        key_block.m(thead, null);
      } else {
        key_block.p(ctx2, dirty);
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(key_block);
      current = true;
    },
    o(local) {
      transition_out(key_block);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(thead);
      key_block.d(detaching);
    }
  };
}
__name(create_fragment$6, "create_fragment$6");
function instance$6($$self, $$props, $$invalidate) {
  let $details;
  const { details } = getContext("spreadsheetStore").stores;
  component_subscribe($$self, details, (value) => $$invalidate(0, $details = value));
  return [$details, details];
}
__name(instance$6, "instance$6");
class Header extends SvelteComponent {
  constructor(options) {
    super();
    init$1(this, options, instance$6, create_fragment$6, safe_not_equal, {});
  }
}
__name(Header, "Header");
function flip(node, { from: from2, to: to2 }, params = {}) {
  const style = getComputedStyle(node);
  const transform = style.transform === "none" ? "" : style.transform;
  const [ox, oy] = style.transformOrigin.split(" ").map(parseFloat);
  const dx = from2.left + from2.width * ox / to2.width - (to2.left + ox);
  const dy = from2.top + from2.height * oy / to2.height - (to2.top + oy);
  const { delay = 0, duration = /* @__PURE__ */ __name((d) => Math.sqrt(d) * 120, "duration"), easing = cubicOut } = params;
  return {
    delay,
    duration: is_function(duration) ? duration(Math.sqrt(dx * dx + dy * dy)) : duration,
    easing,
    css: (t, u) => {
      const x = u * dx;
      const y = u * dy;
      const sx = t + u * from2.width / to2.width;
      const sy = t + u * from2.height / to2.height;
      return `transform: ${transform} translate(${x}px, ${y}px) scale(${sx}, ${sy});`;
    }
  };
}
__name(flip, "flip");
class TJSContextMenu {
  static #contextMenu = void 0;
  static create({ id = "", x = 0, y = 0, items = [], zIndex = 1e4, ...transitionOptions } = {}) {
    if (this.#contextMenu !== void 0) {
      return;
    }
    const filteredItems = items.filter((item) => item.condition === void 0 ? true : typeof item.condition === "function" ? item.condition() : item.condition);
    this.#contextMenu = new TJSContextMenu$1({
      target: document.body,
      intro: true,
      props: { id, x, y, items: filteredItems, zIndex, transitionOptions: { duration: 200, ...transitionOptions } }
    });
    this.#contextMenu.$on("close", () => {
      this.#contextMenu = void 0;
    });
  }
}
__name(TJSContextMenu, "TJSContextMenu");
const Rows_svelte_svelte_type_style_lang = "";
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[7] = list[i];
  return child_ctx;
}
__name(get_each_context, "get_each_context");
function create_if_block(ctx) {
  let td0;
  let t0_value = ctx[7].type + "";
  let t0;
  let t1;
  let td1;
  let t2_value = ctx[7].id + "";
  let t2;
  let t3;
  let td2;
  let t4_value = ctx[7].version + "";
  let t4;
  let t5;
  let td3;
  let t6_value = ctx[7].status + "";
  let t6;
  return {
    c() {
      td0 = element("td");
      t0 = text(t0_value);
      t1 = space();
      td1 = element("td");
      t2 = text(t2_value);
      t3 = space();
      td2 = element("td");
      t4 = text(t4_value);
      t5 = space();
      td3 = element("td");
      t6 = text(t6_value);
      attr(td0, "class", "svelte-xqr2v2");
      attr(td1, "class", "svelte-xqr2v2");
      attr(td2, "class", "center svelte-xqr2v2");
      attr(td3, "class", "center svelte-xqr2v2");
    },
    m(target, anchor) {
      insert(target, td0, anchor);
      append(td0, t0);
      insert(target, t1, anchor);
      insert(target, td1, anchor);
      append(td1, t2);
      insert(target, t3, anchor);
      insert(target, td2, anchor);
      append(td2, t4);
      insert(target, t5, anchor);
      insert(target, td3, anchor);
      append(td3, t6);
    },
    p(ctx2, dirty) {
      if (dirty & 1 && t0_value !== (t0_value = ctx2[7].type + ""))
        set_data(t0, t0_value);
      if (dirty & 1 && t2_value !== (t2_value = ctx2[7].id + ""))
        set_data(t2, t2_value);
      if (dirty & 1 && t4_value !== (t4_value = ctx2[7].version + ""))
        set_data(t4, t4_value);
      if (dirty & 1 && t6_value !== (t6_value = ctx2[7].status + ""))
        set_data(t6, t6_value);
    },
    d(detaching) {
      if (detaching)
        detach(td0);
      if (detaching)
        detach(t1);
      if (detaching)
        detach(td1);
      if (detaching)
        detach(t3);
      if (detaching)
        detach(td2);
      if (detaching)
        detach(t5);
      if (detaching)
        detach(td3);
    }
  };
}
__name(create_if_block, "create_if_block");
function create_each_block(key_1, ctx) {
  let tr;
  let td0;
  let t0_value = ctx[7].title + "";
  let t0;
  let t1;
  let t2;
  let td1;
  let t3_value = ctx[7].notes + "";
  let t3;
  let t4;
  let tr_title_value;
  let rect;
  let stop_animation = noop$1;
  let mounted;
  let dispose;
  let if_block = ctx[1] && create_if_block(ctx);
  function contextmenu_handler(...args) {
    return ctx[6](ctx[7], ...args);
  }
  __name(contextmenu_handler, "contextmenu_handler");
  return {
    key: key_1,
    first: null,
    c() {
      tr = element("tr");
      td0 = element("td");
      t0 = text(t0_value);
      t1 = space();
      if (if_block)
        if_block.c();
      t2 = space();
      td1 = element("td");
      t3 = text(t3_value);
      t4 = space();
      attr(td0, "class", "svelte-xqr2v2");
      attr(td1, "class", "svelte-xqr2v2");
      attr(tr, "title", tr_title_value = statusData[ctx[7].status].explanation);
      attr(tr, "class", "svelte-xqr2v2");
      set_style(tr, "background-color", ctx[5](ctx[7].status));
      this.first = tr;
    },
    m(target, anchor) {
      insert(target, tr, anchor);
      append(tr, td0);
      append(td0, t0);
      append(tr, t1);
      if (if_block)
        if_block.m(tr, null);
      append(tr, t2);
      append(tr, td1);
      append(td1, t3);
      append(tr, t4);
      if (!mounted) {
        dispose = listen(tr, "contextmenu", contextmenu_handler);
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & 1 && t0_value !== (t0_value = ctx[7].title + ""))
        set_data(t0, t0_value);
      if (ctx[1]) {
        if (if_block) {
          if_block.p(ctx, dirty);
        } else {
          if_block = create_if_block(ctx);
          if_block.c();
          if_block.m(tr, t2);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
      if (dirty & 1 && t3_value !== (t3_value = ctx[7].notes + ""))
        set_data(t3, t3_value);
      if (dirty & 1 && tr_title_value !== (tr_title_value = statusData[ctx[7].status].explanation)) {
        attr(tr, "title", tr_title_value);
      }
      if (dirty & 1) {
        set_style(tr, "background-color", ctx[5](ctx[7].status));
      }
    },
    r() {
      rect = tr.getBoundingClientRect();
    },
    f() {
      fix_position(tr);
      stop_animation();
    },
    a() {
      stop_animation();
      stop_animation = create_animation(tr, rect, flip, { duration: 250 });
    },
    d(detaching) {
      if (detaching)
        detach(tr);
      if (if_block)
        if_block.d();
      mounted = false;
      dispose();
    }
  };
}
__name(create_each_block, "create_each_block");
function create_fragment$5(ctx) {
  let tbody;
  let each_blocks = [];
  let each_1_lookup = /* @__PURE__ */ new Map();
  let each_value = [...ctx[0]];
  const get_key = /* @__PURE__ */ __name((ctx2) => ctx2[7].id, "get_key");
  for (let i = 0; i < each_value.length; i += 1) {
    let child_ctx = get_each_context(ctx, each_value, i);
    let key = get_key(child_ctx);
    each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
  }
  return {
    c() {
      tbody = element("tbody");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      attr(tbody, "class", "svelte-xqr2v2");
    },
    m(target, anchor) {
      insert(target, tbody, anchor);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(tbody, null);
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & 51) {
        each_value = [...ctx2[0]];
        for (let i = 0; i < each_blocks.length; i += 1)
          each_blocks[i].r();
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value, each_1_lookup, tbody, fix_and_destroy_block, create_each_block, null, get_each_context);
        for (let i = 0; i < each_blocks.length; i += 1)
          each_blocks[i].a();
      }
    },
    i: noop$1,
    o: noop$1,
    d(detaching) {
      if (detaching)
        detach(tbody);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].d();
      }
    }
  };
}
__name(create_fragment$5, "create_fragment$5");
function instance$5($$self, $$props, $$invalidate) {
  let $spreadsheetStore;
  let $details;
  const spreadsheetStore = getContext("spreadsheetStore");
  component_subscribe($$self, spreadsheetStore, (value) => $$invalidate(0, $spreadsheetStore = value));
  const { details } = spreadsheetStore.stores;
  component_subscribe($$self, details, (value) => $$invalidate(1, $details = value));
  function onContextMenu(event, id, official) {
    const linkData = spreadsheetStore.getPackageLinks(id);
    if (linkData) {
      const items = [];
      if (official) {
        items.push(
          {
            label: "mcc.packageListingURL",
            icon: "fas fa-external-link",
            onclick: () => window.open(`https://foundryvtt.com/packages/${linkData.id}`, "_blank")
          },
          {
            label: "mcc.foundryHubURL",
            icon: "fas fa-external-link",
            image: "https://www.foundryvtt-hub.com/wp-content/uploads/2021/08/foundryhublogo4-verysmall.webp",
            onclick: () => window.open(`https://www.foundryvtt-hub.com/package/${linkData.id}`, "_blank")
          },
          {
            label: "mcc.bazaarURL",
            icon: "fas fa-external-link",
            image: "https://forge-vtt.com/images/the-forge-logo-48x48.png",
            onclick: () => window.open(`https://forge-vtt.com/bazaar/package/${linkData.id}`, "_blank")
          }
        );
      }
      if (linkData.url) {
        items.push({
          label: "mcc.projectURL",
          icon: "fas fa-code",
          onclick: () => window.open(linkData.url, "_blank")
        });
      }
      TJSContextMenu.create({
        duration: 200,
        id: "mmc-package-menu",
        x: event.pageX,
        y: event.pageY,
        items
      });
    }
  }
  __name(onContextMenu, "onContextMenu");
  function getColor(status) {
    const { hsl } = statusData[status];
    return `hsla(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%, 60%)`;
  }
  __name(getColor, "getColor");
  const contextmenu_handler = /* @__PURE__ */ __name((row, event) => onContextMenu(event, row.id, row.official), "contextmenu_handler");
  return [
    $spreadsheetStore,
    $details,
    spreadsheetStore,
    details,
    onContextMenu,
    getColor,
    contextmenu_handler
  ];
}
__name(instance$5, "instance$5");
class Rows extends SvelteComponent {
  constructor(options) {
    super();
    init$1(this, options, instance$5, create_fragment$5, safe_not_equal, {});
  }
}
__name(Rows, "Rows");
const Footer_svelte_svelte_type_style_lang = "";
function create_fragment$4(ctx) {
  let footer;
  let p0;
  let t0_value = localize("mcc.report.visible") + "";
  let t0;
  let t1;
  let t2_value = ctx[0].index.length + "";
  let t2;
  let t3;
  let t4_value = ctx[0].data.length + "";
  let t4;
  let t5;
  let p1;
  let t6_value = localize("mcc.report.percentage") + "";
  let t6;
  let t7;
  let t8;
  let t9;
  let t10;
  let p2;
  let t12;
  let a;
  let t13_value = localize("mcc.source") + "";
  let t13;
  let t14;
  let i;
  return {
    c() {
      footer = element("footer");
      p0 = element("p");
      t0 = text(t0_value);
      t1 = text(": ");
      t2 = text(t2_value);
      t3 = text(" / ");
      t4 = text(t4_value);
      t5 = space();
      p1 = element("p");
      t6 = text(t6_value);
      t7 = text(": ");
      t8 = text(ctx[1]);
      t9 = text("%");
      t10 = space();
      p2 = element("p");
      p2.textContent = `${SpreadsheetController.spreadsheetStatus}`;
      t12 = space();
      a = element("a");
      t13 = text(t13_value);
      t14 = space();
      i = element("i");
      attr(p1, "title", localize("mcc.percentageTooltip"));
      attr(i, "class", "fas fa-external-link-alt");
      attr(a, "href", `https://docs.google.com/spreadsheets/d/${SpreadsheetController.spreadsheetID}/pubhtml`);
      attr(a, "class", "svelte-m3ll1t");
      attr(footer, "class", "svelte-m3ll1t");
    },
    m(target, anchor) {
      insert(target, footer, anchor);
      append(footer, p0);
      append(p0, t0);
      append(p0, t1);
      append(p0, t2);
      append(p0, t3);
      append(p0, t4);
      append(footer, t5);
      append(footer, p1);
      append(p1, t6);
      append(p1, t7);
      append(p1, t8);
      append(p1, t9);
      append(footer, t10);
      append(footer, p2);
      append(footer, t12);
      append(footer, a);
      append(a, t13);
      append(a, t14);
      append(a, i);
    },
    p(ctx2, [dirty]) {
      if (dirty & 1 && t2_value !== (t2_value = ctx2[0].index.length + ""))
        set_data(t2, t2_value);
      if (dirty & 1 && t4_value !== (t4_value = ctx2[0].data.length + ""))
        set_data(t4, t4_value);
      if (dirty & 2)
        set_data(t8, ctx2[1]);
    },
    i: noop$1,
    o: noop$1,
    d(detaching) {
      if (detaching)
        detach(footer);
    }
  };
}
__name(create_fragment$4, "create_fragment$4");
function instance$4($$self, $$props, $$invalidate) {
  let $spreadsheetStore;
  let $filteredPercentage;
  const spreadsheetStore = getContext("spreadsheetStore");
  component_subscribe($$self, spreadsheetStore, (value) => $$invalidate(0, $spreadsheetStore = value));
  const { filteredPercentage } = spreadsheetStore.stores;
  component_subscribe($$self, filteredPercentage, (value) => $$invalidate(1, $filteredPercentage = value));
  return [$spreadsheetStore, $filteredPercentage, spreadsheetStore, filteredPercentage];
}
__name(instance$4, "instance$4");
class Footer extends SvelteComponent {
  constructor(options) {
    super();
    init$1(this, options, instance$4, create_fragment$4, safe_not_equal, {});
  }
}
__name(Footer, "Footer");
const Table_svelte_svelte_type_style_lang = "";
function create_fragment$3(ctx) {
  let main;
  let reminder;
  let t0;
  let piechart;
  let t1;
  let stickyheader;
  let t2;
  let div;
  let table;
  let header;
  let t3;
  let rows;
  let t4;
  let footer;
  let current;
  let mounted;
  let dispose;
  reminder = new Reminder({});
  piechart = new PieChart({});
  stickyheader = new Controls({});
  header = new Header({});
  rows = new Rows({});
  footer = new Footer({});
  return {
    c() {
      main = element("main");
      create_component(reminder.$$.fragment);
      t0 = space();
      create_component(piechart.$$.fragment);
      t1 = space();
      create_component(stickyheader.$$.fragment);
      t2 = space();
      div = element("div");
      table = element("table");
      create_component(header.$$.fragment);
      t3 = space();
      create_component(rows.$$.fragment);
      t4 = space();
      create_component(footer.$$.fragment);
      attr(table, "class", "svelte-1hj39xm");
      attr(div, "class", "svelte-1hj39xm");
      attr(main, "class", "svelte-1hj39xm");
    },
    m(target, anchor) {
      insert(target, main, anchor);
      mount_component(reminder, main, null);
      append(main, t0);
      mount_component(piechart, main, null);
      append(main, t1);
      mount_component(stickyheader, main, null);
      append(main, t2);
      append(main, div);
      append(div, table);
      mount_component(header, table, null);
      append(table, t3);
      mount_component(rows, table, null);
      insert(target, t4, anchor);
      mount_component(footer, target, anchor);
      current = true;
      if (!mounted) {
        dispose = [
          action_destroyer(applyScrolltop.call(null, main, ctx[0])),
          listen(main, "scrollTop:smooth", scrollSmooth)
        ];
        mounted = true;
      }
    },
    p: noop$1,
    i(local) {
      if (current)
        return;
      transition_in(reminder.$$.fragment, local);
      transition_in(piechart.$$.fragment, local);
      transition_in(stickyheader.$$.fragment, local);
      transition_in(header.$$.fragment, local);
      transition_in(rows.$$.fragment, local);
      transition_in(footer.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(reminder.$$.fragment, local);
      transition_out(piechart.$$.fragment, local);
      transition_out(stickyheader.$$.fragment, local);
      transition_out(header.$$.fragment, local);
      transition_out(rows.$$.fragment, local);
      transition_out(footer.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(main);
      destroy_component(reminder);
      destroy_component(piechart);
      destroy_component(stickyheader);
      destroy_component(header);
      destroy_component(rows);
      if (detaching)
        detach(t4);
      destroy_component(footer, detaching);
      mounted = false;
      run_all(dispose);
    }
  };
}
__name(create_fragment$3, "create_fragment$3");
function scrollSmooth(event) {
  event.currentTarget.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  event.preventDefault();
  event.stopPropagation();
}
__name(scrollSmooth, "scrollSmooth");
function instance$3($$self) {
  const { scrollTop } = getContext("spreadsheetStore").stores;
  return [scrollTop];
}
__name(instance$3, "instance$3");
class Table extends SvelteComponent {
  constructor(options) {
    super();
    init$1(this, options, instance$3, create_fragment$3, safe_not_equal, {});
  }
}
__name(Table, "Table");
function create_catch_block(ctx) {
  let error;
  let current;
  error = new Error$1({ props: { error: ctx[11] } });
  return {
    c() {
      create_component(error.$$.fragment);
    },
    m(target, anchor) {
      mount_component(error, target, anchor);
      current = true;
    },
    p: noop$1,
    i(local) {
      if (current)
        return;
      transition_in(error.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(error.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(error, detaching);
    }
  };
}
__name(create_catch_block, "create_catch_block");
function create_then_block(ctx) {
  let table;
  let current;
  table = new Table({});
  return {
    c() {
      create_component(table.$$.fragment);
    },
    m(target, anchor) {
      mount_component(table, target, anchor);
      current = true;
    },
    p: noop$1,
    i(local) {
      if (current)
        return;
      transition_in(table.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(table.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(table, detaching);
    }
  };
}
__name(create_then_block, "create_then_block");
function create_pending_block(ctx) {
  let loading;
  let current;
  loading = new Loading({});
  return {
    c() {
      create_component(loading.$$.fragment);
    },
    m(target, anchor) {
      mount_component(loading, target, anchor);
      current = true;
    },
    p: noop$1,
    i(local) {
      if (current)
        return;
      transition_in(loading.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(loading.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(loading, detaching);
    }
  };
}
__name(create_pending_block, "create_pending_block");
function create_key_block(ctx) {
  let await_block_anchor;
  let current;
  let info = {
    ctx,
    current: null,
    token: null,
    hasCatch: true,
    pending: create_pending_block,
    then: create_then_block,
    catch: create_catch_block,
    error: 11,
    blocks: [, , ,]
  };
  handle_promise(ctx[2].initialize(), info);
  return {
    c() {
      await_block_anchor = empty();
      info.block.c();
    },
    m(target, anchor) {
      insert(target, await_block_anchor, anchor);
      info.block.m(target, info.anchor = anchor);
      info.mount = () => await_block_anchor.parentNode;
      info.anchor = await_block_anchor;
      current = true;
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      update_await_block_branch(info, ctx, dirty);
    },
    i(local) {
      if (current)
        return;
      transition_in(info.block);
      current = true;
    },
    o(local) {
      for (let i = 0; i < 3; i += 1) {
        const block = info.blocks[i];
        transition_out(block);
      }
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(await_block_anchor);
      info.block.d(detaching);
      info.token = null;
      info = null;
    }
  };
}
__name(create_key_block, "create_key_block");
function create_default_slot(ctx) {
  let previous_key = ctx[1];
  let key_block_anchor;
  let current;
  let key_block = create_key_block(ctx);
  return {
    c() {
      key_block.c();
      key_block_anchor = empty();
    },
    m(target, anchor) {
      key_block.m(target, anchor);
      insert(target, key_block_anchor, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      if (dirty & 2 && safe_not_equal(previous_key, previous_key = ctx2[1])) {
        group_outros();
        transition_out(key_block, 1, 1, noop$1);
        check_outros();
        key_block = create_key_block(ctx2);
        key_block.c();
        transition_in(key_block, 1);
        key_block.m(key_block_anchor.parentNode, key_block_anchor);
      } else {
        key_block.p(ctx2, dirty);
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(key_block);
      current = true;
    },
    o(local) {
      transition_out(key_block);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(key_block_anchor);
      key_block.d(detaching);
    }
  };
}
__name(create_default_slot, "create_default_slot");
function create_fragment$2(ctx) {
  let applicationshell;
  let updating_elementRoot;
  let current;
  function applicationshell_elementRoot_binding(value) {
    ctx[7](value);
  }
  __name(applicationshell_elementRoot_binding, "applicationshell_elementRoot_binding");
  let applicationshell_props = {
    $$slots: { default: [create_default_slot] },
    $$scope: { ctx }
  };
  if (ctx[0] !== void 0) {
    applicationshell_props.elementRoot = ctx[0];
  }
  applicationshell = new ApplicationShell({ props: applicationshell_props });
  binding_callbacks.push(() => bind$1(applicationshell, "elementRoot", applicationshell_elementRoot_binding));
  return {
    c() {
      create_component(applicationshell.$$.fragment);
    },
    m(target, anchor) {
      mount_component(applicationshell, target, anchor);
      current = true;
    },
    p(ctx2, [dirty]) {
      const applicationshell_changes = {};
      if (dirty & 4098) {
        applicationshell_changes.$$scope = { dirty, ctx: ctx2 };
      }
      if (!updating_elementRoot && dirty & 1) {
        updating_elementRoot = true;
        applicationshell_changes.elementRoot = ctx2[0];
        add_flush_callback(() => updating_elementRoot = false);
      }
      applicationshell.$set(applicationshell_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(applicationshell.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(applicationshell.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(applicationshell, detaching);
    }
  };
}
__name(create_fragment$2, "create_fragment$2");
function instance$2($$self, $$props, $$invalidate) {
  let $position;
  let $stateStore;
  let $version;
  const spreadsheetStore = new SpreadsheetStore();
  setContext("spreadsheetStore", spreadsheetStore);
  let { elementRoot } = $$props;
  const { application } = getContext("external");
  const stateStore = mccSessionStorage.getStore(`mcc.appState`);
  component_subscribe($$self, stateStore, (value) => $$invalidate(8, $stateStore = value));
  const position = application.position;
  component_subscribe($$self, position, (value) => $$invalidate(6, $position = value));
  const storePosition = debounce$1(() => set_store_value(stateStore, $stateStore = application.state.get(), $stateStore), 500);
  const { version: version2 } = spreadsheetStore.stores;
  component_subscribe($$self, version2, (value) => $$invalidate(1, $version = value));
  function applicationshell_elementRoot_binding(value) {
    elementRoot = value;
    $$invalidate(0, elementRoot);
  }
  __name(applicationshell_elementRoot_binding, "applicationshell_elementRoot_binding");
  $$self.$$set = ($$props2) => {
    if ("elementRoot" in $$props2)
      $$invalidate(0, elementRoot = $$props2.elementRoot);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & 64) {
      storePosition($position);
    }
  };
  return [
    elementRoot,
    $version,
    spreadsheetStore,
    stateStore,
    position,
    version2,
    $position,
    applicationshell_elementRoot_binding
  ];
}
__name(instance$2, "instance$2");
class ModuleCompatibilityCheckerShell extends SvelteComponent {
  constructor(options) {
    super();
    init$1(this, options, instance$2, create_fragment$2, safe_not_equal, { elementRoot: 0 });
  }
  get elementRoot() {
    return this.$$.ctx[0];
  }
  set elementRoot(elementRoot) {
    this.$$set({ elementRoot });
    flush();
  }
}
__name(ModuleCompatibilityCheckerShell, "ModuleCompatibilityCheckerShell");
class ModuleCompatibilityChecker extends SvelteApplication {
  constructor(options = {}) {
    super(options);
    try {
      this.state.set(JSON.parse(sessionStorage.getItem("mcc.appState")));
    } catch (err) {
    }
  }
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "mcc",
      title: "mcc.appTitle",
      classes: ["mcc"],
      width: Math.max(window.innerWidth * (2 / 3), 800),
      height: Math.max(window.innerHeight * (2 / 3), 580),
      resizable: true,
      minWidth: 800,
      minHeight: 580,
      svelte: {
        class: ModuleCompatibilityCheckerShell,
        target: document.body
      }
    });
  }
}
__name(ModuleCompatibilityChecker, "ModuleCompatibilityChecker");
globalThis.ModuleCompatibilityChecker = ModuleCompatibilityChecker;
function create_fragment$1(ctx) {
  let button;
  let mounted;
  let dispose;
  return {
    c() {
      button = element("button");
      button.textContent = `${localize("mcc.button")}`;
      attr(button, "type", "button");
    },
    m(target, anchor) {
      insert(target, button, anchor);
      if (!mounted) {
        dispose = listen(button, "click", ctx[1]);
        mounted = true;
      }
    },
    p: noop$1,
    i: noop$1,
    o: noop$1,
    d(detaching) {
      if (detaching)
        detach(button);
      mounted = false;
      dispose();
    }
  };
}
__name(create_fragment$1, "create_fragment$1");
function instance$1($$self) {
  const mccMainApp = new ModuleCompatibilityChecker();
  const click_handler = /* @__PURE__ */ __name(() => mccMainApp.render(true, { focus: true }), "click_handler");
  return [mccMainApp, click_handler];
}
__name(instance$1, "instance$1");
class ModuleManagementButton extends SvelteComponent {
  constructor(options) {
    super();
    init$1(this, options, instance$1, create_fragment$1, safe_not_equal, {});
  }
}
__name(ModuleManagementButton, "ModuleManagementButton");
const PatreonButton_svelte_svelte_type_style_lang = "";
function create_fragment(ctx) {
  let span;
  let i;
  let t0;
  let t1_value = localize("mcc.patreon") + "";
  let t1;
  let mounted;
  let dispose;
  return {
    c() {
      span = element("span");
      i = element("i");
      t0 = space();
      t1 = text(t1_value);
      attr(i, "class", "fab fa-patreon");
      attr(span, "class", "tag patreon svelte-1mk0d2n");
    },
    m(target, anchor) {
      insert(target, span, anchor);
      append(span, i);
      append(span, t0);
      append(span, t1);
      if (!mounted) {
        dispose = listen(span, "click", ctx[0]);
        mounted = true;
      }
    },
    p: noop$1,
    i: noop$1,
    o: noop$1,
    d(detaching) {
      if (detaching)
        detach(span);
      mounted = false;
      dispose();
    }
  };
}
__name(create_fragment, "create_fragment");
function instance($$self) {
  const click_handler = /* @__PURE__ */ __name(() => window.open("https://www.patreon.com/bePatron?u=15896855", "_blank"), "click_handler");
  return [click_handler];
}
__name(instance, "instance");
class PatreonButton extends SvelteComponent {
  constructor(options) {
    super();
    init$1(this, options, instance, create_fragment, safe_not_equal, {});
  }
}
__name(PatreonButton, "PatreonButton");
const init = "";
Hooks.on("renderModuleManagement", (app, [html]) => {
  applyModuleManagementColors(app, html);
  new PatreonButton({
    target: html.querySelector(":is([data-module-id='mcc'], [data-module-name='mcc']) .package-overview"),
    anchor: html.querySelector(":is([data-module-id='mcc'], [data-module-name='mcc']) .tag")
  });
  let footer = html.querySelector("footer");
  if (!footer) {
    footer = document.createElement("footer");
    footer.classList.add("flexrow");
    html.querySelector("form").append(footer);
  }
  new ModuleManagementButton({
    target: footer,
    anchor: html.querySelector("[name='deactivate']")
  });
  app.setPosition();
});
async function applyModuleManagementColors(app, html) {
  html.querySelector(".notes").textContent += localize("mcc.moduleManagementColorsExplanation");
  app.setPosition();
  const version2 = (await SpreadsheetController.getVersions()).at(-1);
  const spreadsheet = await SpreadsheetController.getSpreadsheet(version2);
  html.querySelectorAll("#module-list :is([data-module-id], [data-module-name])").forEach((el) => {
    const module = game.modules.get(el.dataset.moduleId ?? el.dataset.moduleName);
    const { status } = SpreadsheetController.lookupCompatibility(spreadsheet, module);
    const { hsl } = statusData[status];
    el.style.backgroundColor = `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%, 15%)`;
  });
}
__name(applyModuleManagementColors, "applyModuleManagementColors");
//# sourceMappingURL=index.js.map
