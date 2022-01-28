const is = {};
["string", "number", "boolean", "symbol", "undefined", "bigint"].forEach((name) => {
   is[name] = (value) => typeof value === name;
});

is.array = Array.isArray;
is.object = (value) => value && value.constructor.name === "Object";
is.fn = (value) => typeof value === "function";
is.truthy = (value) => !!value;
is.falsy = (value) => !value;
is.null = (value) => value === null;
is.NaN = isNaN;
is.nodeList = (value) => NodeList.prototype.isPrototypeOf(value);

const api = {
   all(func) {
      return function () {
         return Array.from(arguments)
            .flat()
            .every((value) => func.call(null, value));
      };
   },
   any(func) {
      return function () {
         return Array.from(arguments)
            .flat()
            .some((value) => func.call(null, value));
      };
   },
   not(func) {
      return function () {
         return !Array.from(arguments)
            .flat()
            .some((value) => func.call(null, value));
      };
   },
};

Object.entries(api).forEach(([apiName, apiFunc]) => {
   is[apiName] = Object.entries(is).reduce((list, [name, func]) => {
      if (!api[name]) {
         list[name] = apiFunc(func);
      }
      return list;
   }, {});
});

export default is;
