export const findScrollableParent = (
  el: HTMLElement | null,
): HTMLElement | Window => {
  while (el && el !== document.body) {
    const style = getComputedStyle(el);
    if (style.overflowY === "auto" || style.overflowY === "scroll") {
      return el;
    }
    el = el.parentElement;
  }
  return window;
};
