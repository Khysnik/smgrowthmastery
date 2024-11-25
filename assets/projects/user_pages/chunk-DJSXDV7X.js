import {
  CF2Component,
  init_runtime
} from "./chunk-E4UTD2XC.js";
import {
  __esm,
  init_define_process
} from "./chunk-XDBWEWVZ.js";

// projects/lib/packages/yggdrasil-blueprints/__generated__/blueprints/modal-v1.ts
var ModalV1;
var init_modal_v1 = __esm({
  "projects/lib/packages/yggdrasil-blueprints/__generated__/blueprints/modal-v1.ts"() {
    init_define_process();
    init_runtime();
    ModalV1 = class extends CF2Component {
      constructor(el, runtimeSel) {
        super(el, runtimeSel);
      }
      mount(el) {
        const node = this;
        this.onClose = this.onClose ?? function() {
        };
        this.close = this.close ?? function() {
          if (node.element) {
            $("body").removeClass("hide-page-scroll");
            node.element.style.display = "none";
            node.onClose();
          }
          ;
        };
        this.setupModalClose = function() {
          $(node.element).on("click", function(e) {
            if (e.target !== e.currentTarget) return;
            if (window.getSelection().type === "Range") return;
            node.close();
          });
          $(node.element).on("click", ".elModalClose", function() {
            node.close();
          });
        };
        this.setupModalClose();
      }
    };
    window["ModalV1"] = ModalV1;
  }
});

export {
  init_modal_v1
};
//# sourceMappingURL=chunk-DJSXDV7X.js.map
