"use strict";

let isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
document.documentElement.classList.toggle("is-safari", isSafari);

import anime from "animejs/lib/anime.es.js";

import { $ } from "./helpers/dom.js";

import Modal from "./Modal.js";

Modal.initAll();

// function alertModal({ title = "", description = "", button = "" }) {
//    let modal = Modal.create(
//       Modal.wrapContent(`
//          <div class="modal-alert__title" data-modal-title>${title}</div>
//          <div class="modal-alert__description" data-modal-description>${description}</div>
//          <button class="btn btn--md btn--primary" data-close-modal>${button}</button>
//       `),
//       {
//          createOnOpen: true,
//          removeOnClosed: true,
//          destroyOnClosed: true,
//          classes: {
//             modal: "modal modal-alert",
//             content: "modal-content modal-alert-content",
//          },
//       }
//    );
//    modal.open();
//    return modal;
// }

// alertModal({
//    title: "Hi",
//    description: "my Name",
//    button: "Ok!",
// });

// window.alertModal = alertModal;

import Dropdown from "./Dropdown.js";
Dropdown.initAll();

import Tablist from "./Tablist.js";
Tablist.initAll();

import "./parts/header";
import "./parts/solutions";
import "./parts/sliders";

Modal.get("feedback-modal")
   ?.update({
      hooks: {
         preventClose(modal) {
            return !modal.find('[type="checkbox"]')?.checked;
         },
         closePrevented(modal) {
            $(modal.modal).find('[type="checkbox"]').animate("animate-headshake");
         },
      },
   })
   .on("open contentClose", ({ type }) => {
      anime({
         targets: ".main-wrapper",
         translateX: type == "open" ? "-10rem" : 0,
         easing: "easeInOutQuad",
         duration: 350,
      });
   });
