"use strict";

let isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
document.documentElement.classList.toggle("is-safari", isSafari);

import anime from "animejs/lib/anime.es.js";

import { $ } from "./helpers/dom.js";

import Modal from "./Modal.js";
Modal.initAll();

import Dropdown from "./Dropdown.js";
Dropdown.initAll();

import Tablist from "./Tablist.js";
Tablist.initAll();

import "./parts/header";
import "./parts/solutions";
import "./parts/sliders";

Modal.get("feedback-modal")?.on("open contentClose", ({ type }) => {
   anime({
      targets: ".main-wrapper",
      translateX: type == "open" ? "-10rem" : 0,
      easing: "easeInOutQuad",
      duration: 350,
   });
});
