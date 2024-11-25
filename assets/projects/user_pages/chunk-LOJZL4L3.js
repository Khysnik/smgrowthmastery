import {
  Cart,
  init_Cart,
  openCart
} from "./chunk-BJEG6XD3.js";
import {
  init_cf_utils,
  range
} from "./chunk-JUFAPXHB.js";
import {
  __esm,
  init_define_process
} from "./chunk-XDBWEWVZ.js";

// projects/lib/packages/yggdrasil-blueprints/src/Elements/Order/AddToCart/addToCart.ts
function getSelectedVariant(component, selectedPropertyIndex, newSelectedValue) {
  const { product, variantValues, valuesPositions } = component;
  const { sorted_property_values: propertyValues, property_values_variant_mapping: valuesVariants } = product;
  let selectedValuePath = newSelectedValue.join(",");
  if (Object.keys(variantValues ?? {}).length <= 1) return product.default_variant?.id;
  if (!valuesVariants[selectedValuePath]) {
    const distances = [];
    const rightPart = range(selectedPropertyIndex + 1, propertyValues.length - 1, 1);
    const leftPart = range(0, selectedPropertyIndex - 1, 1);
    const orderedIndexes = rightPart.concat(leftPart);
    Object.values(variantValues).forEach((values) => {
      if (values[selectedPropertyIndex] == newSelectedValue[selectedPropertyIndex]) {
        let distance = 0;
        let changedProperties = 0;
        orderedIndexes.forEach((position, count) => {
          if (values[position] != newSelectedValue[position]) {
            changedProperties += 1;
            distance = 1e4 * count + valuesPositions[values[position]] - valuesPositions[newSelectedValue[position]];
          }
        });
        distances.push({
          distance,
          changedProperties,
          variantPath: values.join(",")
        });
      }
    });
    distances.sort((d1, d2) => {
      const diffChangedProperties = d1.changedProperties - d2.changedProperties;
      if (diffChangedProperties != 0) return diffChangedProperties;
      return d1.distance - d2.distance;
    });
    selectedValuePath = distances[0].variantPath;
  }
  return valuesVariants[selectedValuePath];
}
var mountComponent, renderAndMount, registerVariantEventListeners;
var init_addToCart = __esm({
  "projects/lib/packages/yggdrasil-blueprints/src/Elements/Order/AddToCart/addToCart.ts"() {
    init_define_process();
    init_Cart();
    init_cf_utils();
    mountComponent = (component) => {
      component.variantValues = Object.entries(component.product.property_values_variant_mapping ?? {}).reduce((acc, entries) => {
        const values = entries[0].split(",").map((value) => parseInt(value));
        acc[entries[1]] = values;
        return acc;
      }, {}) ?? {};
      component.valuesPositions = component.product.sorted_property_values?.reduce((acc, property) => {
        property.value_ids.forEach((value, index) => {
          acc[value] = index;
        });
        return acc;
      }, {}) ?? {};
      const variantSelects = component.element.querySelectorAll(".elVariantSelector");
      const newValues = [...variantSelects].map((e) => e.value);
      const selectedVariantId = getSelectedVariant(component, 0, newValues);
      document.dispatchEvent(
        new CustomEvent("ProductCarousel:Update", {
          detail: {
            productId: component.product.id,
            variantId: selectedVariantId
          }
        })
      );
      registerVariantEventListeners(component);
    };
    renderAndMount = (component) => {
      component.render();
      registerVariantEventListeners(component);
    };
    registerVariantEventListeners = (component) => {
      const variantSelects = component.element.querySelectorAll(".elVariantSelector");
      component.element.querySelector('[href="#add-to-cart"').addEventListener("click", () => {
        const product = component.product;
        const variant = component.currentVariant ?? product.variants[0];
        const price = component.selected_price ?? variant.prices[0];
        Cart.incrementOperation({
          product_id: product.id,
          variant_id: Number(variant.id),
          price_id: Number(price.id)
        });
        openCart();
      });
      variantSelects.forEach((select, index) => {
        select.addEventListener("click", (evt) => {
          evt.stopImmediatePropagation();
          evt.stopPropagation();
          evt.preventDefault();
        });
        select.addEventListener("change", (evt) => {
          evt.stopImmediatePropagation();
          evt.stopPropagation();
          evt.preventDefault();
          const newValues = [...variantSelects].map((e) => e.value);
          const selectedVariantId = getSelectedVariant(component, index, newValues);
          const newVariant = component.product.variants.find((v) => v.id == String(selectedVariantId));
          component.currentVariant = newVariant;
          component.selected_price = component.currentVariant.prices[0];
          document.dispatchEvent(
            new CustomEvent("ProductCarousel:Update", {
              detail: {
                productId: component.product.id,
                variantId: newVariant.id
              }
            })
          );
          renderAndMount(component);
        });
      });
    };
  }
});

export {
  mountComponent,
  getSelectedVariant,
  init_addToCart
};
//# sourceMappingURL=chunk-LOJZL4L3.js.map
