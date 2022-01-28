export default (elem, s) => {
   if (elem.disabled == null) {
      elem.setAttribute("aria-disabled", !!s);
   } else {
      elem.toggleAttribute("disabled", !!s);
   }
};
