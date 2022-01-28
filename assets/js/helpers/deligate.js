const deligate = (event, selector, callback, elem = document.body) => {
   elem.addEventListener(event, function (e) {
      let target = e.target;
      let selElem = target.closest(selector);
      if (!selElem) return;
      callback(e, selElem, target);
   });
};

export default deligate;
