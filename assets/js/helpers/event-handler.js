import { getElements } from "./dom";
import is from "./is";
import { strToArray } from "./utils";

class EventHandler {
   constructor(eventsSet = new Set()) {
      this.eventsSet = eventsSet;
      ["on", "off", "once"].forEach((name) => (this[name] = this[name].bind(this)));
   }
   on(elems, events, handler, opts) {
      elems = getElements(elems);
      elems.forEach((elem) => {
         strToArray(events).forEach((event) => {
            let [baseEvent, namespace] = event.split(".");
            elem.addEventListener(baseEvent, handler, opts);
            this.eventsSet.add({ elem, event, baseEvent, namespace, handler, opts });
         });
      });
      return elems;
   }
   once(elems, events, handler, opts) {
      if (!is.object(opts)) {
         opts = { capture: opts };
      }
      opts.once = true;
      return on(elems, events, handler, opts);
   }
   off(elems, events, handler, opts) {
      const eventsSet = this.eventsSet;
      const removeSets = (sets, opts) => {
         sets.forEach(function ({ elem, event, handler }) {
            elem.removeEventListener(event, handler, opts);
            eventsSet.delete(arguments[0]);
         });
      };
      elems = getElements(elems);
      elems.forEach((elem) => {
         if (events) {
            strToArray(events).forEach((event) => {
               let [baseEvent, namespace] = event.split(".");
               let sets = [...eventsSet].filter(
                  (set) => set.elem === elem && (!baseEvent || set.event === event) && (!namespace || set.namespace === namespace) && (!handler || set.handler == handler)
               );
               removeSets(sets, opts);
            });
         } else {
            removeSets(
               [...eventsSet].filter((set) => set.elem === elem),
               opts
            );
         }
      });
      return elems;
   }
   emit(elems, events, opts) {
      elems = getElements(elems);
      elems.forEach((elem) => {
         strToArray(events).forEach((event) => {
            elem.dispatchEvent(new CustomEvent(event, opts));
         });
      });
   }
}
const { on, off, once, emit } = new EventHandler();
export { on, off, once, emit, EventHandler };
