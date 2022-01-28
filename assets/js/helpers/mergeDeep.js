import is from "./is";
function mergeDeep(target, ...sources) {
   sources.forEach((source) => {
      if (!is.object(target) || !is.object(source)) {
         return source;
      }
      Object.keys(source).forEach((key) => {
         const targetValue = target[key];
         const sourceValue = source[key];
         if (is.array(targetValue) && is.array(sourceValue)) {
            target[key] = targetValue.concat(sourceValue);
         } else if (is.object(targetValue) && is.object(sourceValue)) {
            target[key] = mergeDeep(Object.assign({}, targetValue), sourceValue);
         } else {
            target[key] = sourceValue;
         }
      });
   });

   return target;
}

export default mergeDeep;
