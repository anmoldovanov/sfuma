import cloneDeep from "./cloneDeep.js";
import { getElements, getElement } from "./dom.js";
import camelToKebab from "./camelToKebab.js";
import { on, once, off } from "./event-handler";

const VERSION = "0.1";

class Base {
   constructor({ opts, elem }) {
      // console.log(instance.name);

      elem = getElement(elem);
      if (!elem) return;
      let constructorName = camelToKebab(this.constructor.NAME);

      this.opts = cloneDeep({
         ...this.constructor.defaultSettings,
         ...JSON.parse((elem.dataset && elem.dataset[constructorName]) || "{}"),
         ...opts,
      });

      if (this.constructor.defaults) {
         for (const [key, value] of Object.entries(this.constructor.defaults)) {
            if (this.opts[key]) {
               this.opts[key] = cloneDeep({ ...value, ...this.opts[key] });
            }
         }
      }
      this.uuid = constructorName + "-" + Math.random().toString(36).substring(2, 9);
      this.id = elem.id ||= this.opts.initialId ?? this.uuid;

      this._events = {};

      Object.entries(this.opts.on).forEach((events) => this.on(...events));

      return this;
   }
   static get VERSION() {
      return VERSION;
   }
   get inDOM() {
      return !!document.getElementById(this.id);
   }
   update(opts) {
      this.opts = cloneDeep({ ...this.opts, ...opts });
      return this;
   }
   find(...params) {
      return this.findAll(...params)[0];
   }
   findAll(selector, excludeNestedIntstances = true) {
      let elems = getElements(selector, this.baseNode);
      if (excludeNestedIntstances) {
         let instancesIds = [...this.instances.keys(), this.baseNode.id].map((s) => "#" + s).join(",");
         elems = elems.filter((elem) => elem.closest(instancesIds).id === this.id);
      }
      return elems;
   }
   _emit(eventName, detail = this) {
      this.baseNode.dispatchEvent(new CustomEvent(eventName, { detail }));
      return this;
   }
   on() {
      on(this.baseNode, ...arguments);
      return this;
   }
   once() {
      once(this.baseNode, ...arguments);
      return this;
   }
   off() {
      off(this.baseNode, ...arguments);
      return this;
   }
   get instances() {
      return this.constructor.instances;
   }
   get defaultSettings() {
      return this.constructor.defaultSettings;
   }
   static get(elem) {
      for (let [id, instance] of this.instances) {
         if ([id, instance.baseNode].includes(elem)) {
            return instance;
         }
      }
   }
   static getOrCreate(elem, opts) {
      return this.get(elem, opts) || new this(elem, opts);
   }
   static initAll(opts, parent = document) {
      return getElements(this.defaultSettings.selectors[this.NAME.toLowerCase()], parent).map((elem) => this.getOrCreate(elem, opts));
   }
   static updateDefaultSettings(opts) {
      return cloneDeep({ ...this.defaultSettings, ...opts });
   }
}
export default Base;
