// ------------
//
// [DOMTools]
// a fairly optimized DOM manipulation library. vaguely inspired by jQuery syntax. performance is a main focus.
//
// ------------
//
// Partially based on Daniel Eager's jQuery Lite
//   https://github.com/deager/jquery-lite
//
// Using some code from jQuery under the following license:
//   Copyright JS Foundation and other contributors, https://js.foundation/
//
//   Permission is hereby granted, free of charge, to any person obtaining
//   a copy of this software and associated documentation files (the
//   "Software"), to deal in the Software without restriction, including
//   without limitation the rights to use, copy, modify, merge, publish,
//   distribute, sublicense, and/or sell copies of the Software, and to
//   permit persons to whom the Software is furnished to do so, subject to
//   the following conditions:
//
//   The above copyright notice and this permission notice shall be
//   included in all copies or substantial portions of the Software.
//
//   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
//   EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
//   MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
//   NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
//   LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
//   OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
//   WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

export type DOMElement = Element;
export type DOMElementList = NodeListOf<DOMElement> | HTMLCollectionOf<DOMElement> | DOMElement[];
export type DOMNodeCompatible = DOMElement | DOMElementList | Window | Document | DOMBaseNode;

let _pageLoaded = false;
let _eventQueue = null;

function crashOrDefault<T>(def: T | (new () => T), message = 'No elements in DOMTools node'): T {
  if ($d.useStrict) {
    throw new Error(message);
  }
  if (typeof def === 'function') {
    return new (def as new () => T)();
  }
  return def as T;
}

function crashOrWarn(message: string, ...extraArgs: any[]): void {
  if ($d.useStrict) {
    throw new Error(message + ' ' + extraArgs.join(' '));
  }
  console.warn(message, ...extraArgs);
}

// https://stackoverflow.com/a/25352300
function isValidCssIdentifierOffsetBy1(str: string): boolean {
  let code = str.charCodeAt(1);
  if ((code <= 64 || code >= 91) && // upper alpha (A-Z)
    (code <= 96 || code >= 123)) { // lower alpha (a-z)
    return false;
  }

  for (let i = 2, len = str.length; i < len; i++) {
    code = str.charCodeAt(i);
    if ((code <= 47 || code >= 58) && // numeric (0-9)
      (code <= 64 || code >= 91) && // upper alpha (A-Z)
      (code <= 96 || code >= 123) && // lower alpha (a-z)
      str[i] !== '_' &&
      str[i] !== '-') {
      return false;
    }
  }

  return true;
}

function isValidHtmlIdentifier(str: string, start = 0, end = str.length): boolean {
  let code: number;
  for (let i = start; i < end; i++) {
    code = str.charCodeAt(i);
    if (!(code > 47 && code < 58) && // numeric (0-9)
      !(code > 64 && code < 91) && // upper alpha (A-Z)
      !(code > 96 && code < 123) && // lower alpha (a-z)
      str[i] !== '_' &&
      str[i] !== '-') {
      return false;
    }
  }
  return true;
}

/**
 * Creates a DOMNode from a CSS selector, fast-tracking where possible, with the selector root being a parameter
 * @param selector the selector
 * @param root the selector root
 * @param alwaysQuerySelector set to true to simply do querySelectorAll
 * @param rootIsDocument set to true when root === window.document, allows fast-track #id and [name], and create element via <tag>
 */
export function $element(selector: string, root: Element | Document, alwaysQuerySelector?: boolean, rootIsDocument?: boolean): DOMBaseNode {
  // querySelectorAll returns static elements, so it's an option here
  if (alwaysQuerySelector) {
    return new DOMNodeCollection(root.querySelectorAll(selector));
  }

  switch (selector[0]) {
    case '.': // fast-track .class
      if (isValidCssIdentifierOffsetBy1(selector)) {
        return new DOMNodeCollection(root.getElementsByClassName(selector.slice(1)));
      }
      break;
    case '#': // fast-track #id
      if (rootIsDocument && isValidCssIdentifierOffsetBy1(selector)) {
        return new DOMNode(document.getElementById(selector.slice(1)));
      }
      break;
    case '[': // fast-track [name="foobar"]
      if (rootIsDocument && selector.startsWith('[name=') && selector[selector.length - 1] === ']') {
        const sliced = selector['[name='.length] === '"'
          ? selector.slice('[name="'.length, -'"]'.length)
          : selector.slice('[name='.length, -']'.length);

        if (isValidHtmlIdentifier(sliced)) {
          return new DOMNodeCollection(document.getElementsByName(sliced));
        }
      }
      break;
    case '<': // create element via <tagname>
      if (rootIsDocument && selector[selector.length - 1] === '>' && isValidHtmlIdentifier(selector, 1, selector.length - 1)) {
        return new DOMNode(document.createElement(selector.slice(1, -1)));
      }
      break;
    default: // fast-track tagname
      if (isValidHtmlIdentifier(selector)) {
        return new DOMNodeCollection(root.getElementsByTagName(selector));
      }
      break;
  }

  // allowQuerySelector is an option so you can avoid creating static element lists when you want live ones
  if ($d.allowQuerySelector) {
    return new DOMNodeCollection(root.querySelectorAll(selector));
  }

  return crashOrDefault(DOMEmptyNode, 'Argument must be a CSS selector or <tag>, was ' + selector);
}

/**
 * Delays a function's execution to when the DOM loads, but before all images and media are loaded
 * @param func the function to execute
 */
export function $onLoad(func: () => void): Document {
  if (_pageLoaded) {
    func();
    return document;
  }

  if (_eventQueue === null) {
    _eventQueue = [];
    document.addEventListener('DOMContentLoaded', () => {
      _pageLoaded = true;
      for (const fn of _eventQueue) fn();
      _eventQueue = null;
    }, { capture: false, once: true, passive: true });
  }

  _eventQueue.push(func);

  return document;
}

/**
 * Creates a DOMNode wrapping around an existing element-like object
 * @param obj the object to wrap around
 */
export function $wrap(obj: DOMNodeCompatible): DOMBaseNode {
  if (obj instanceof Element) {
    return new DOMNode(obj);
  }

  if (obj instanceof NodeList || obj instanceof HTMLCollection || Array.isArray(obj)) {
    return new DOMNodeCollection(obj);
  }

  if (obj instanceof DOMBaseNode) {
    return obj;
  }

  if (obj === window) {
    return new DOMNodeRaw(window, document && document.documentElement ? document.documentElement : crashOrDefault(null, 'Document element not available yet'));
  }

  if (obj === document) {
    return new DOMNodeRaw(document, document.documentElement);
  }

  // TODO generic documents/windows?

  return crashOrDefault(DOMEmptyNode, 'Unknown object type ' + (obj as any).prototype);
}

export type DOMToolsCompatible = DOMNodeCompatible | string | (() => void);

/**
 * The main DomTools function. it's basically like jQuery!
 * @param arg the argument - a selector, a function to execute on DOM load, or an object to wrap into a DOMNode
 */
export default function $d(arg: DOMNodeCompatible | string): DOMBaseNode;
export default function $d(arg: (() => void)): Document;
export default function $d(arg: DOMNodeCompatible | string | (() => void)): Document | DOMBaseNode;
export default function $d(arg: DOMNodeCompatible | string | (() => void)): Document | DOMBaseNode {
  switch (typeof arg) {
    case 'string':
      return $element(arg, document, /*alwaysQuerySelector*/ false, /*rootIsDocument*/ true);
    case 'function':
      return $onLoad(arg);
    case 'object':
      return $wrap(arg);
  }

  return crashOrDefault(DOMEmptyNode, 'Unknown argument type ' + (arg as any).prototype);
}

/**
 * Calls DomTools but throws if the returned value is empty. This is a direct opposited to jQuery which never throws.
 * @param arg the argument - a selector, a function to execute on DOM load, or an object to wrap into a DOMNode
 */
function strict(arg: DOMNodeCompatible | string): DOMBaseNode;
function strict(arg: (() => void)): Document;
function strict(arg: DOMNodeCompatible | string | (() => void)): Document | DOMBaseNode;
function strict(arg: DOMNodeCompatible | string | (() => void)): Document | DOMBaseNode {
  const originalUseStrict = $d.useStrict;
  $d.useStrict = true;
  try {
    const result = $d(arg);
    if (!(result instanceof Document) && !result.element) throw new Error(`$d call for "${arg}" returned empty`);
    return result;
  } finally {
    $d.useStrict = originalUseStrict;
  }
}

$d.strict = strict;

// set to true to fallback to querySelector without passing alwaysQuerySelector=true
$d.allowQuerySelector = true;

// set to true to throw instead of nooping when an error occurs
$d.useStrict = false;

// set to true for verbose logging for debugging purposes
$d.verbose = false;

// TODO typing
// adds a function to a plugin... you probably don't want to call this directly
function $addFunction(plugin, name, func) {
  if (!name || typeof name !== 'string') {
    crashOrWarn('DOMTools extend function names must be strings.', name);
    return false;
  }
  if (!func || typeof func !== 'function') {
    crashOrWarn('DOMTools extend functions must be valid functions.', func);
    return false;
  }
  if (name in DOMBaseNode.prototype) {
    crashOrWarn(`DOMTools extend function ${name} already exists in plugin ${DOMBaseNode.prototype[name].plugin.name}.`, func);
    return false;
  }
  func.plugin = plugin;
  plugin.definitions[name] = func;
  DOMBaseNode.prototype[name] = func;
  return true;
}

$d.plugins = {};
$d.extend = (pluginName, ...args) => {
  const me = '$d.extend';

  if (pluginName in $d.plugins) {
    crashOrWarn(`Attempted to define plugin ${pluginName} twice.`);
    return null;
  }
  const plugin = { name: pluginName, definitions: {} };
  let corruptedState = false;

  for (const arg of args) {
    switch (typeof arg) {
      case 'function':
        // add from func by function name
        if (!arg.name || arg.name === 'anonymous' || arg.name === '') {
          crashOrWarn(`${me} method must have a name. Try passing an object or array instead.`, arg);
          break;
        }

        if (!$addFunction(plugin, arg.name, arg)) {
          corruptedState = true;
        }
        break;
      case 'object':
        if (Array.isArray(arg)) {
          // add from array map [name, func]
          if (arg.length % 2 !== 0) {
            crashOrWarn(`${me} array must be a sequence of [name, func], was`, arg);
            break;
          }

          for (let i = 0; i < arg.length; i += 2) {
            if (!$addFunction(plugin, arg[i], arg[i + 1])) {
              corruptedState = true;
              break;
            }
          }
        } else {
          // add from object map
          for (const [name, func] of Object.entries(arg)) {
            if (!$addFunction(plugin, name, func)) {
              corruptedState = true;
              break;
            }
          }
        }
        break;
      default:
        crashOrWarn(`Invalid ${me} argument type ${typeof arg}, must be a named function, array or pain object`);
        break;
    }
  }

  if (corruptedState) {
    console.error(`DOMTools state corrupted due to error(s) when loading ${pluginName}. Plugin methods may be invalid.`);
  }

  if ($d.verbose) {
    console.log(`Loaded plugin ${pluginName} with definition:`, plugin);
  }

  $d.plugins[pluginName] = plugin;

  return plugin;
};

const whitespaceRegex = /[^\x20\t\r\n\f]+/g;
export class DOMBaseNode {
  _originalDisplay?: string;
  get elements(): DOMElementList {
    throw new Error('TODO: Return an iterable of elements');
  }
  get element(): DOMElement | null {
    return this.elements[0]; // can be overriden if elements is not an array
  }
  get(index: number): DOMElement | null {
    return this.elements[index]; // can be overriden if elements is not an array
  }

  // methods that operate on this.elements will never throw if the list is empty, so this is an option
  throwIfEmpty(): this {
    if (!this.element) {
      throw new Error('No elements in DOMTools node');
    }
    return this;
  }

  html(string: string): this;
  html(): string;
  html(string?: string): this | string {
    if (string !== undefined) {
      for (const el of this.elements) {
        el.innerHTML = string;
      }
      return this;
    }

    return this.element ? this.element.innerHTML : crashOrDefault('');
  }

  empty(): this {
    return this.html('');
  }

  append(arg: string | Node | DOMBaseNode | (string | Node | DOMBaseNode)[]): this {
    if (!this.element) {
      return crashOrDefault(this);
    }

    if (typeof arg === 'string') {
      this.element.innerHTML += arg;
      return this;
    }

    if (Array.isArray(arg)) {
      for (const el of arg) {
        this.append(el);
      }
    } else if (arg instanceof DOMBaseNode) {
      for (const el of arg.elements) {
        this.element.appendChild(el);
      }
    } else if (arg instanceof Node) {
      this.element.appendChild(arg);
    } else {
      return crashOrDefault(this, 'Unsupported argument type, must be Node or DOMTools node or array thereof');
    }

    return this;
  }

  appendToAll(arg: string | Node | DOMBaseNode | string[] | Node[] | DOMBaseNode[]): this {
    if (typeof arg === 'string') {
      for (const el of this.elements) {
        el.innerHTML += arg;
      }
      return this;
    }

    if (!this.element) {
      return crashOrDefault(this);
    }

    if (Array.isArray(arg)) {
      for (const el of arg) {
        this.appendToAll(el);
      }
    } else if (arg instanceof DOMBaseNode) {
      for (const ownEl of this.elements) {
        for (const el of arg.elements) {
          ownEl.appendChild(el.cloneNode(true));
        }
      }
    } else if (arg instanceof Node) {
      for (const el of this.elements) {
        el.appendChild(arg.cloneNode(true));
      }
    } else {
      return crashOrDefault(this, 'Unsupported argument type, must be element or DOMTools node or array thereof');
    }

    return this;
  }

  appendText(text: string): this {
    for (const el of this.elements) {
      el.appendChild(document.createTextNode(text));
    }
    return this;
  }

  attr(name: string): string;
  attr(name: string, value: string): this;
  attr(name: string, value?: string): this | string {
    if (value !== undefined) {
      for (const el of this.elements) {
        el.setAttribute(name, value);
      }
      return this;
    }

    return this.element ? this.element.getAttribute(name) : crashOrDefault('');
  }

  // supports comma-separated OR space-separated classes, not both at the same time
  addClass(class1: string, ...otherClasses: string[]): this {
    if (otherClasses.length !== 0) {
      for (const el of this.elements) {
        el.classList.add(class1, ...otherClasses);
      }
    } else {
      const results = class1.match(whitespaceRegex);
      for (const el of this.elements) {
        el.classList.add(...results);
      }
    }
    return this;
  }

  // TODO support same as above & add toggleClass
  removeClass(dropClass: string): this {
    for (const el of this.elements) {
      el.classList.remove(dropClass);
    }
    return this;
  }

  hasClass(class1: string): boolean {
    for (const el of this.elements) {
      if (el.classList.contains(class1)) return true;
    }

    return false;
  }

  children(): DOMNodeCollection {
    const allChildren = [];

    for (const el of this.elements) {
      allChildren.push(...(el.children as unknown as Iterable<Element>));
    }

    return new DOMNodeCollection(allChildren);
  }

  parent(): DOMNodeCollection {
    const parents = new Set<Element>();

    for (const el of this.elements) {
      parents.add(el.parentElement);
    }

    return new DOMNodeCollection([...parents]);
  }

  find(selector: string, alwaysQuerySelector?: boolean): DOMBaseNode {
    const matchingElements = new Set<Element>();

    for (const el of this.elements) {
      for (const match of $element(selector, el, alwaysQuerySelector).elements) {
        matchingElements.add(match);
      }
    }

    return new DOMNodeCollection([...matchingElements]);
  }

  remove(): this {
    for (const el of this.elements) {
      el.remove();
    }
    return this; // returns detached elements
  }

  on(type: string, callback: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): this {
    for (const el of this.elements) {
      el.addEventListener(type, callback, options);
    }
    return this;
  }

  once(type: string, callback: EventListenerOrEventListenerObject, useCapture?: boolean): this {
    for (const el of this.elements) {
      el.addEventListener(type, callback, { capture: useCapture, once: true });
    }
    return this;
  }

  off(type: string, callback?: EventListenerOrEventListenerObject): this {
    for (const el of this.elements) {
      el.removeEventListener(type, callback);
    }
    return this;
  }

  // foreach, without creating any sort of DOMNode(s)
  each(callback: (el: DOMElement, index: number, elements: DOMElementList) => void): this {
    const elements = this.elements;
    for (let i = 0, len = elements.length; i < len; i++) {
      callback(elements[i], i++, elements);
    }
    return this;
  }

  // map, without creating any sort of DOMNode(s)
  map<T>(callback: (el: DOMElement, index: number, elements: DOMElementList) => T): T[] {
    const elements = this.elements;
    const arr = new Array(elements.length);
    for (let i = 0, len = elements.length; i < len; i++) {
      arr[i] = callback(elements[i], i, elements);
    }
    return arr;
  }

  $each(callback: (el: DOMBaseNode, index: number, elements: DOMElementList) => void): this {
    const elements = this.elements;
    for (let i = 0, len = elements.length; i < len; i++) {
      callback(new DOMNode(elements[i]), i++, elements);
    }
    return this;
  }

  $map(callback: (el: DOMBaseNode, index: number, elements: DOMElementList) => DOMBaseNode | undefined): DOMBaseNode {
    const elements = this.elements;
    const arr = new Array(elements.length);
    for (let i = 0, len = elements.length; i < len; i++) {
      let newElement = callback(new DOMNode(elements[i]), i, elements);
      if (!(newElement instanceof DOMBaseNode)) {
        newElement = new DOMNode(newElement);
      }
      arr[i] = newElement;
    }
    return new DOMNodeCollection(arr);
  }

  // POSSIBLE ISSUE: only stores display for the first matched element
  hide() {
    this._originalDisplay = this.css('display');
    this.css('display', 'none');
    return this;
  }

  show() {
    this.css('display', this._originalDisplay || '');
    delete this._originalDisplay;
    return this;
  }

  css(property: string): string;
  css(property: string, value: string): this;
  css(property: string, value?: string): this | string {
    if (value === undefined) {
      return this.element ? (this.element as HTMLElement).style.getPropertyValue(property) : crashOrDefault('');
    }

    for (const el of this.elements) {
      (el as HTMLElement).style[property] = value;
    }
    return this;
  }

  clearChildren(): this {
    for (const el of this.elements) {
      let firstChild: ChildNode;
      while (firstChild = el.firstChild) firstChild.remove();
    }
    return this;
  }

  text(): string;
  text(string: string): this;
  text(string?: string): this | string {
    if (string !== undefined) {
      for (const el of this.elements) {
        let firstChild;
        while (firstChild = el.firstChild) firstChild.remove();

        el.appendChild(document.createTextNode(string));
      }
      return this;
    }

    const text = [];
    for (const el of this.elements) {
      text.push((el as HTMLElement).innerText); // only visible text
    }
    return text.join('');
  }

  val(): string;
  val(value: string): this;
  val(value?: string): this | string {
    if (value !== undefined) {
      for (const el of this.elements) {
        (el as HTMLInputElement).value = value;
      }
      return this;
    }

    return this.element ? (this.element as HTMLInputElement).value : crashOrDefault(undefined);
  }

  checked(): boolean;
  checked(value: boolean): this;
  checked(value?: boolean): this | boolean {
    if (value !== undefined) {
      for (const el of this.elements) {
        (el as HTMLInputElement).checked = (el as HTMLInputElement).checked !== undefined ? value : crashOrDefault(value, 'Element is not a checkbox');
      }
      return this;
    }

    return this.element && (this.element as HTMLInputElement).checked !== undefined
      ? (this.element as HTMLInputElement).checked
      : crashOrDefault(undefined, 'Element is not a checkbox');
  }

  private _eventFunction(name: string, callback: EventListenerOrEventListenerObject, useCapture: boolean | AddEventListenerOptions) {
    return this.on(name, callback, useCapture);
  }

  private _dualEventFunction(name: string, callback: EventListenerOrEventListenerObject, useCapture: boolean | AddEventListenerOptions) {
    if (callback) {
      return this.on(name, callback, useCapture);
    }

    for (const el of this.elements) {
      el[name]();
    }
    return this;
  }

  click(callback: EventListenerOrEventListenerObject, useCapture: boolean | AddEventListenerOptions) { return this._dualEventFunction('click', callback, useCapture); }
  blur(callback: EventListenerOrEventListenerObject, useCapture: boolean | AddEventListenerOptions) { return this._dualEventFunction('blur', callback, useCapture); }
  focus(callback: EventListenerOrEventListenerObject, useCapture: boolean | AddEventListenerOptions) { return this._dualEventFunction('focus', callback, useCapture); }

  keypress(callback: EventListenerOrEventListenerObject, useCapture: boolean | AddEventListenerOptions) { return this._eventFunction('keypress', callback, useCapture); }
  submit(callback: EventListenerOrEventListenerObject, useCapture: boolean | AddEventListenerOptions) { return this._eventFunction('submit', callback, useCapture); }
  load(callback: EventListenerOrEventListenerObject, useCapture: boolean | AddEventListenerOptions) { return this._eventFunction('load', callback, useCapture); }
  dblclick(callback: EventListenerOrEventListenerObject, useCapture: boolean | AddEventListenerOptions) { return this._eventFunction('dblclick', callback, useCapture); }
  keydown(callback: EventListenerOrEventListenerObject, useCapture: boolean | AddEventListenerOptions) { return this._eventFunction('keydown', callback, useCapture); }
  change(callback: EventListenerOrEventListenerObject, useCapture: boolean | AddEventListenerOptions) { return this._eventFunction('change', callback, useCapture); }
  resize(callback: EventListenerOrEventListenerObject, useCapture: boolean | AddEventListenerOptions) { return this._eventFunction('resize', callback, useCapture); }
  mouseenter(callback: EventListenerOrEventListenerObject, useCapture: boolean | AddEventListenerOptions) { return this._eventFunction('mouseenter', callback, useCapture); }
  keyup(callback: EventListenerOrEventListenerObject, useCapture: boolean | AddEventListenerOptions) { return this._eventFunction('keyup', callback, useCapture); }
  scroll(callback: EventListenerOrEventListenerObject, useCapture: boolean | AddEventListenerOptions) { return this._eventFunction('scroll', callback, useCapture); }
  mouseleave(callback: EventListenerOrEventListenerObject, useCapture: boolean | AddEventListenerOptions) { return this._eventFunction('mouseleave', callback, useCapture); }
  unload(callback: EventListenerOrEventListenerObject, useCapture: boolean | AddEventListenerOptions) { return this._eventFunction('unload', callback, useCapture); }
}

const _emptyArray = [];
class DOMEmptyNode extends DOMBaseNode {
  get elements() {
    return _emptyArray;
  }
  get element() {
    return null;
  }
}

class DOMNode extends DOMBaseNode {
  _elements: DOMElementList;

  constructor(element: DOMElement) {
    super();
    this._elements = [element];
  }

  get elements() {
    return this._elements;
  }

  // less memory-intensive implementations...
  children(): DOMNodeCollection {
    return new DOMNodeCollection(this.element.children);
  }

  parent(): DOMNodeCollection {
    return new DOMNode(this.element.parentElement);
  }

  find(selector: string, alwaysQuerySelector?: boolean): DOMBaseNode {
    return $element(selector, this.element, alwaysQuerySelector);
  }

  each(callback: (el: DOMElement, index: number, elements: DOMElementList) => void): this {
    callback(this.element, 0, this.elements);
    return this;
  }

  map<T>(callback: (el: DOMElement, index: number, elements: DOMElementList) => T): T[] {
    return [callback(this.element, 0, this.elements)];
  }

  $each(callback: (el: DOMBaseNode, index: number, elements: DOMElementList) => void): this {
    callback(new DOMNode(this.element), 0, this.elements);
    return this;
  }

  $map(callback: (el: DOMBaseNode, index: number, elements: DOMElementList) => DOMBaseNode | undefined): DOMBaseNode {
    let newElement = callback(new DOMNode(this.element), 0, this.elements);
    if (!(newElement instanceof DOMBaseNode)) {
      newElement = new DOMNode(newElement);
    }
    return newElement;
  }
}

export class DOMNodeCollection extends DOMBaseNode {
  _elements: DOMElementList;
  // elements: NodeList, Array, anything with a length property and indexer, except DOMNodeCollection, or array of DOMBaseNode
  constructor(elements: DOMElementList) {
    super();
    this._elements = elements;
  }
  get elements() {
    return this._elements;
  }
}

// special case- a DOMNode that isn't really a DOMNode, just an EventTarget with a node representation elsewhere
export class DOMNodeRaw extends DOMNode {
  _eventTarget: EventTarget;

  constructor(eventTarget: EventTarget, element: Element | HTMLElement) {
    super(element);
    this._eventTarget = eventTarget;
  }

  on(type: string, callback: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): this {
    this._eventTarget.addEventListener(type, callback, options);
    return this;
  }

  once(type: string, callback: EventListenerOrEventListenerObject, useCapture?: boolean): this {
    this._eventTarget.addEventListener(type, callback, { capture: useCapture, once: true });
    return this;
  }

  off(type: string, callback?: EventListenerOrEventListenerObject): this {
    this._eventTarget.removeEventListener(type, callback);
    return this;
  }
}

export const $window = $d.strict(window);
export const $document = $d.strict(document);

// created by the worlds biggest sub <3