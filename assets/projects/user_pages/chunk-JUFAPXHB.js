import {
  __esm,
  init_define_process
} from "./chunk-XDBWEWVZ.js";

// projects/user_pages/app/javascript/lander/cf_utils.ts
function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == "x" ? r : r & 3 | 8;
    return v.toString(16);
  });
}
function IntlTel_loadUtils() {
  const promise = window.intlTelInputGlobals.loadUtils(
    "https://cdn.jsdelivr.net/npm/intl-tel-input@17.0.16/build/js/utils.js"
  );
  if (promise) {
    IntlTel_UtilsLoadPromise = promise.then((data) => {
      console.log("Phone utils loaded!!");
      return data;
    });
  }
  return IntlTel_UtilsLoadPromise;
}
function IntlTel_initPhoneInput(inputElement, options = {}) {
  IntlTel_loadUtils();
  const iti = window.intlTelInput(inputElement, {
    autoPlaceholder: "aggressive",
    preferredCountries: ["us", "ca", "gb", "ie", "ai", "nz"],
    // TODO: I think the intialCountry logic should be placed in here
    // - First try to get the country from garlic
    // - Second from cfVisitorData
    // - Third from the browser
    // - Fourth falls back to US
    initialCountry: "us",
    ...options
  });
  inputElement.iti = iti;
  return iti.promise;
}
function closeOnClickOutside(element, cb) {
  document.addEventListener(
    "click",
    (evt) => {
      if (evt.target !== element && !element.contains(evt.target)) {
        cb();
      }
    },
    { capture: true }
  );
}
function range(min, max, step = 1) {
  let arraySize = Math.floor((max - min) / step);
  if (arraySize < 0) arraySize = 0;
  return new Array(arraySize).fill(0).map((_, index) => index * step + min);
}
function removePageScroll() {
  document.body.classList.add("remove-page-scroll");
}
function addPageScroll() {
  document.body.classList.remove("remove-page-scroll");
}
var IntlTel_UtilsLoadPromise;
var init_cf_utils = __esm({
  "projects/user_pages/app/javascript/lander/cf_utils.ts"() {
    init_define_process();
    IntlTel_UtilsLoadPromise = null;
  }
});

export {
  uuidv4,
  IntlTel_loadUtils,
  IntlTel_initPhoneInput,
  closeOnClickOutside,
  range,
  removePageScroll,
  addPageScroll,
  init_cf_utils
};
//# sourceMappingURL=chunk-JUFAPXHB.js.map
