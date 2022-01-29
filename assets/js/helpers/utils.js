import is from "./is";
import camelToKebab from "./camelToKebab";
export function strToArray(str = "", separator = " ") {
   return (is.array(str) ? str : str.split(separator)).filter(Boolean);
}
export function arrayUnique(array) {
   return [...new Set(array)];
}
export function findAndRemove(source, target) {
   return source.splice(0, source.length, ...source.filter((t) => t !== target));
}
export function getElementStateClass(baseName, elemName, state) {
   baseName = baseName.toLowerCase();
   const isBase = !elemName || elemName == baseName;
   return `${isBase ? baseName : `${baseName}-${elemName}`}--${camelToKebab(state)} `;
}
