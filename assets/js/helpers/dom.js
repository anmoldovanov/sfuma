import is from "./is";
import { strToArray, arrayUnique } from "./utils";
import { on, once, off } from "./event-handler";

export function getElements(elem, parent = document) {
   return elem ? (is.string(elem) ? [...parent.querySelectorAll(elem)] : is.nodeList(elem) || is.array(elem) ? [...elem] : [elem]) : [];
}
export function getElement(elem, parent = document) {
   return is.string(elem) ? parent.querySelector(elem) : elem;
}

const isArgObject = (elem, arg, fn) => {
   if (is.object(arg)) {
      for (const key in arg) {
         fn(elem, key, arg[key]);
      }
      return true;
   }
};

const dir = (elem, property, filter) => {
   let elems = [];
   while (elem) {
      elem = elem[property];
      if (elem && (!filter || elem.matches(filter))) {
         elems.push(elem);
      }
   }
   return elems;
};

export function toggleClass(elem, classes, s) {
   if (classes && elem && !isArgObject(elem, classes, toggleClass)) {
      elem.classList[s ? "add" : "remove"](...strToArray(classes));
   }
}
export function addClass(elem, classes) {
   toggleClass(elem, classes, true);
}
export function removeClass(elem, classes) {
   toggleClass(elem, classes, false);
}
export function attr(elem, name, s) {
   if (elem && name && !isArgObject(elem, name, attr)) {
      elem.setAttribute(name, s);
   }
}
export function removeAttr(elem, name) {
   strToArray(name).forEach((name) => elem.removeAttribute(name));
}
export function toggleAttr(elem, name, s) {
   strToArray(name).forEach((name) => elem.toggleAttribute(name, s));
}
export function remove(elem) {
   elem.remove();
}
export function toggle(elem, s) {
   elem.toggleAttribute("hidden", s);
}
export function hide(elem) {
   toggle(elem, true);
}
export function show(elem) {
   toggle(elem, false);
}
export function closest(elem, selectors) {
   return arrayUnique(strToArray(selectors).map((selector) => elem.closest(selector)));
}
export function prop(elem, name, value) {
   if (elem && name && !isArgObject(elem, name, prop)) {
      elem[name] = value;
   }
}
export function css(elem, name, value) {
   if (elem && name && !isArgObject(elem, name, css)) {
      elem.style.setProperty(name, value);
   }
}
export function siblings(elem, filter) {
   return [...elem.parentNode.children].filter((child) => child !== elem && (!filter || child.matches(filter)));
}
export function children(elem, filter) {
   return [...elem.children].filter((child) => !filter || child.matches(filter));
}
export function parents(elem, filter) {
   return dir(elem, "parentElement", filter);
}
export function prevAll(elem, filter) {
   return dir(elem, "previousElementSibling", filter);
}
export function nextAll(elem, filter) {
   return dir(elem, "nextElementSibling", filter);
}
export function parent(elem, filter) {
   return parents(elem, filter)[0];
}
export function prev(elem, filter) {
   return prevAll(elem, filter)[0];
}
export function next(elem, filter) {
   return nextAll(elem, filter)[0];
}
export function find(elem, selector) {
   return [...elem.querySelectorAll(selector)];
}
export function _is(elem, selector) {
   return elem.matches(selector);
}
export function has(elem, selector) {
   return getElement(selector, elem) && elem;
}
export function repaint(elem) {
   /* eslint-disable */
   elem && elem.offsetWidth;
   /* eslint-enable */
}
export function animate(elem, value) {
   if (!elem) return;
   removeClass(elem, value);
   repaint(elem);
   addClass(elem, value);
   let animations = elem.getAnimations();
   if (animations.length) {
      return Promise.all(animations.map(({ finished }) => finished))
         .then((_) => {
            removeClass(elem, value);
         })
         .catch((err) => {});
   } else {
      removeClass(elem, value);
   }
}

const foreachMethods = { toggleClass, addClass, removeClass, attr, removeAttr, toggleAttr, on, once, off, remove, prop, closest, toggle, hide, show, is: _is, repaint, animate };
const mapMethods = { parent, parents, prev, next, prevAll, nextAll, children, siblings, find, has };

export function fragment(html, findSelectors) {
   var parser = new DOMParser();
   var doc = parser.parseFromString(html, "text/html");
   if (findSelectors) {
      return [...doc.querySelectorAll(findSelectors)];
   }
   return doc.body.children.length > 1 ? [...doc.body.children] : doc.body.firstChild;
}
export const $ = (function () {
   let Constructor = function (selector) {
      if (selector === "document") {
         this.elems = [document];
      } else if (selector === "window") {
         this.elems = [window];
      } else {
         this.elems = getElements(selector);
      }
   };
   let prototype = Constructor.prototype;

   prototype.map = function (callback) {
      this.elems = this.elems.map(callback);
      return this;
   };
   prototype.each = function (callback) {
      this.elems.forEach(callback);
      return this;
   };
   prototype.add = function (selector) {
      this.elems = arrayUnique(this.elems.concat(getElements(selector)).filter(Boolean));
      return this;
   };
   prototype.filter = function (value) {
      this.elems = this.elems.filter((elem, i, list) => (is.fn(value) ? value(elem, i, list) : elem.matches(value)));
      return this;
   };
   prototype.toArray = function () {
      return this.elems;
   };

   Object.entries(mapMethods).forEach(([name, fn]) => {
      prototype[name.split(" ").pop()] = function () {
         this.elems = arrayUnique(
            this.elems
               .map((item) => fn(item, ...arguments))
               .flat()
               .filter(Boolean)
         );
         return this;
      };
   });
   Object.entries(foreachMethods).forEach(([name, fn]) => {
      prototype[name.split(" ").pop()] = function () {
         this.elems.forEach((item) => fn(item, ...arguments));
         return this;
      };
   });

   let instantiate = function (selector) {
      return new Constructor(selector);
   };
   return instantiate;
})();
