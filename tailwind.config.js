/*
 ** TailwindCSS Configuration File
 **
 ** Docs: https://tailwindcss.com/docs/configuration
 ** DEFAULT: https://github.com/tailwindcss/tailwindcss/blob/master/stubs/defaultConfig.stub.js
 */

// const { colors, fontWeight } = require('tailwindcss/defaultTheme')
const { spacing } = require("tailwindcss/defaultTheme");
const plugin = require("tailwindcss/plugin");

module.exports = {
   // future: {
   //    DEFAULT: true,
   //    removeDeprecatedGapUtilities: true,
   // },
   content: ["assets/**/*.html"],
   theme: {
      screens: {
         "below-sm": { max: "549px" },
         sm: "550px",
         "below-md": { max: "767px" },
         md: "768px",
         "below-lg": { max: "1024px" },
         lg: "1024px",
         // "lg-xl": { min: "1024px", max: "1280px" },
         xl: "1250px",
         // "xl-xxl": { min: "1280px", max: "1560px" },
         // "lg-xxl": { min: "1024px", max: "1560px" },
         xxl: "1760px",
         hd: "1900px",
      },
      colors: {
         black: {
            dark: "#000",
            DEFAULT: "#161514",
         },
         divider: {
            DEFAULT: "#BABABA",
         },
         white: "#fff",
         "var-color": "var(--color)",
         // line: "#D2D2D2",
         primary: {
            // 100: "#bdb4f2",
            DEFAULT: "#716D56",
            // light: "#F2DFD8",
         },
         secondary: {
            DEFAULT: "#989CA4",
         },

         red: {
            DEFAULT: "#FF0000",
         },
         green: {
            DEFAULT: "#529326",
         },
         gray: {
            DEFAULT: "#8C8C8C",
         },
         yellow: {
            DEFAULT: "#F9DE6B",
         },
         transparent: "transparent",
      },

      fontFamily: {
         primary: '"Proxima Nova", sans-serif',
      },

      // boxShadow: {
      //    // DEFAULT:
      //    //    "1rem 1.5rem 9rem rgba(0, 0, 0, 0.15), 0px 0px 0.5px rgba(0, 0, 0, 0.7), 0px 1px .3rem rgba(0, 0, 0, 0.1), 1px .4rem 1.5rem rgba(0, 0, 0, 0.08)",
      //    "active-sm": "0 0 0 .4rem #F2DFD8",
      //    active: "0 0 0 .8rem #F2DFD8",
      //    outline: "0 0 0 .3rem rgba(112, 65, 181, 0.49)",
      //    "outline-inset": "inset 0 0 0 .3rem rgba(112, 65, 181, 0.49)",
      //    DEFAULT: "0px 1rem 3rem #17142a",
      //    // DEFAULT: '0px 1px .5rem rgba(0, 0, 0, 0.05)',
      //    none: "none",
      // },
      columnCount: [1, 2, 3, 4],
      borderRadius: {
         none: "0",
         nano: ".2rem",
         tiny: ".4rem",
         sm: ".8rem",
         DEFAULT: "1.6rem",
         lg: "3.2rem",
         full: "9999px",
         size: "calc(var(--size, 9999px) / 2)",
      },
      // lineHeight: {
      //    min: ".85",
      //    none: "1",
      //    tiny: "1.15",
      //    tight: "1.25",
      //    snug: "1.35",
      //    normal: "1.55",
      //    loose: "2.1",
      // },
      fontSize: {
         // "5xl": "2.6rem",
         // "4xl": "2.4rem",
         // "3xl": "1.8rem",
         // "2xl": "1.6rem",
         "2xl": ["4.4rem", 54 / 44],
         "mob-2xl": ["3.2rem", 54 / 44],
         xl: ["2.4rem", 36 / 24],
         lg: ["2.1rem", 30 / 18],
         base: ["1.8rem", 22 / 18],
         // "mob-lg": ["2rem", 28 / 20],
         sm: ["1.6rem", 24 / 16],
         // sm: ["1.4rem", 21 / 14],
         tiny: ["1.3rem", 21 / 14],
      },
      extend: {
         gridTemplateColumns(theme) {
            let result = {};
            Object.entries(theme("spacing")).forEach(([key, size]) => {
               result[`fill-min-${key}`] = `repeat(auto-fill, minmax(${size}, 1fr))`;
            });
            return result;
         },
         minWidth(theme) {
            return { ...theme("spacing") };
         },
         maxWidth(theme) {
            return { ...theme("spacing") };
         },
         scale: {
            "-100": "-1",
         },
         zIndex: {
            "-1": "-1",
            1: "1",
            2: "2",
            3: "3",
            4: "4",
         },
         opacity: {
            2: "0.02",
            3: "0.03",
            5: "0.05",
            7: "0.07",
            8: "0.08",
            12: "0.12",
            15: "0.15",
            35: "0.35",
            99: "0.99",
         },
      },

      spacing: {
         full: "100%",
         px: "1px",
         inherit: "inherit",
         0: "0",
         1: "1px",
         2: "2px",
         3: ".3rem",
         4: ".4rem",
         5: ".5rem",
         6: ".6rem",
         7: ".7rem",
         8: ".8rem",
         9: ".9rem",
         10: "1rem",
         11: "1.1rem",
         12: "1.2rem",
         13: "1.3rem",
         14: "1.4rem",
         15: "1.5rem",
         16: "1.6rem",
         17: "1.7rem",
         18: "1.8rem",
         19: "1.9rem",
         20: "2rem",
         21: "2.1rem",
         22: "2.2rem",
         23: "2.3rem",
         24: "2.4rem",
         25: "2.5rem",
         26: "2.6rem",
         27: "2.7rem",
         28: "2.8rem",
         30: "3rem",
         32: "3.2rem",
         35: "3.5rem",
         40: "4rem",
         43: "4.3rem",
         45: "4.5rem",
         47: "4.7rem",
         48: "4.8rem",
         50: "5rem",
         52: "5.2rem",
         53: "5.3rem",
         55: "5.5rem",
         60: "6rem",
         62: "6.2rem",
         63: "6.3rem",
         64: "6.4rem",
         65: "6.5rem",
         70: "7rem",
         75: "7.5rem",
         78: "7.8rem",
         80: "8rem",
         85: "8.5rem",
         90: "9rem",
         95: "9.5rem",
         100: "10rem",
         110: "11rem",
         120: "12rem",
         125: "12.5rem",
         130: "13rem",
         140: "14rem",
         145: "14.5rem",
         150: "15rem",
         160: "16rem",
         170: "17rem",
         180: "18rem",
         190: "19rem",
         200: "20rem",
         210: "21rem",
         220: "22rem",
         230: "23rem",
         240: "24rem",
         250: "25rem",
         270: "27rem",
         300: "30rem",
         330: "33rem",
         350: "35rem",
         400: "40rem",
         450: "45rem",
         500: "50rem",
         550: "55rem",
         600: "60rem",
         700: "70rem",
         750: "75rem",
         780: "78rem",
         800: "80rem",
         900: "90rem",
         1000: "100rem",
         1100: "110rem",
         container: "var(--container-padding)",
      },
   },
   corePlugins: {
      container: false,
      // ringWidth: false,
      // ringOpacity: false,
      // ringOffsetWidth: false,
      // ringOffsetColor: false,
   },
};
