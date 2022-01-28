const focus = (elem, opts = { preventScroll: true }) => {
   elem && elem.focus(opts);
   return elem;
};
export default focus;
