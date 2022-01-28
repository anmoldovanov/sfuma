export default (elem) => elem.hasAttribute("disabled") || elem.getAttribute("aria-disabled") == "true";
