import is from "./is";
export function strToArray(str = "", separator = " ") {
   return (is.array(str) ? str : str.split(separator)).filter(Boolean);
}
export function arrayUnique(array) {
   return [...new Set(array)];
}
export function findAndRemove(source, target) {
   return source.splice(0, source.length, ...source.filter((t) => t !== target));
}
