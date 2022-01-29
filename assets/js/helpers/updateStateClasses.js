const STATE_TRANSITION_ENTER_ACTIVE = "enterActive";
const STATE_TRANSITION_ENTER_FROM = "enterFrom";
const STATE_TRANSITION_ENTER_TO = "enterTo";
const STATE_TRANSITION_LEAVE_ACTIVE = "leaveActive";
const STATE_TRANSITION_LEAVE_FROM = "leaveFrom";
const STATE_TRANSITION_LEAVE_TO = "leaveTo";

const STATES_ANIMATIONS = [
   STATE_TRANSITION_ENTER_ACTIVE,
   STATE_TRANSITION_ENTER_FROM,
   STATE_TRANSITION_ENTER_TO,
   STATE_TRANSITION_LEAVE_ACTIVE,
   STATE_TRANSITION_LEAVE_FROM,
   STATE_TRANSITION_LEAVE_TO,
];
import camelToKebab from "./camelToKebab";
import { toggleClass } from "./dom";
import is from "./is";
import { getElementStateClass } from "./utils";
function updateStateClasses({ elem, states, elemName, STATES }) {
   const c = ["", ""];
   let transitionName = elem.dataset.transitionName || this.opts.transitionName || "v";
   if (is.object(transitionName)) {
      transitionName = transitionName[elemName];
   }
   STATES.forEach((state) => {
      c[states.states.includes(state) | 0] += getElementStateClass(this.constructor.NAME, elemName, state);
   });
   STATES_ANIMATIONS.forEach((state) => {
      c[states.animations.includes(state) | 0] += `${transitionName ? `${transitionName}-${camelToKebab(state)}` : ""} ${elem.dataset[state] ?? ""} `;
   });
   c.forEach((classes, s) => toggleClass(elem, classes, s));
}
export default updateStateClasses;
