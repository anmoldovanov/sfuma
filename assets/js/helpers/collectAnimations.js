import toMs from "./toMs.js";
import camelToKebab from "./camelToKebab.js";

const DURATION = "state-duration";
const DURATION_ENTER = DURATION + "-enter";
const DURATION_LEAVE = DURATION + "-leave";
const EVENT_OPEN = "open";
const EVENT_CLOSE = "close";

function collectAnimations({ elem, promises, eventName }) {
   let duration;
   if (eventName == EVENT_OPEN || eventName == EVENT_CLOSE) {
      let computedStyle = getComputedStyle(elem);
      let getDuration = (name) => elem.dataset[camelToKebab(name)] || computedStyle.getPropertyValue("--" + name);
      duration = toMs(getDuration(eventName == EVENT_OPEN ? DURATION_ENTER : DURATION_LEAVE)) || toMs(getDuration(DURATION));
   }
   let promisesDuration = !isNaN(duration) ? new Promise((resolve) => setTimeout(resolve, duration)) : null;
   promisesDuration && promises.add(promisesDuration);

   if (this.opts.awaitingEvents.includes(eventName)) {
      let promisesEvent = new Promise((resolve) => {
         this.animationDone = resolve;
      });
      promises.add(promisesEvent);
   }

   const animations = elem.getAnimations();
   let promisesAnimation = animations.length ? Promise.allSettled(animations.map(({ finished }) => finished)) : null;

   promisesAnimation && promises.add(promisesAnimation);

   return promises;
}
export default collectAnimations;
