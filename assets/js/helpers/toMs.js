function toMs(time) {
   let num = parseFloat(time);
   let unit = time.match(/m?s/);
   if (unit) {
      unit = unit[0];
   }
   switch (unit) {
      case "s":
         return num * 1000;
      case "ms":
         return num;
      default:
         return num;
   }
}
export default toMs;
