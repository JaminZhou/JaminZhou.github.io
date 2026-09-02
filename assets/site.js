const masthead = document.querySelector(".site-masthead");

function updateMasthead() {
  masthead?.classList.toggle("is-scrolled", window.scrollY > 8);
}

updateMasthead();
window.addEventListener("scroll", updateMasthead, { passive: true });

for (const element of document.querySelectorAll("[style-hover], [style-active]")) {
  const baseStyle = element.getAttribute("style") ?? "";
  const hoverStyle = element.getAttribute("style-hover") ?? "";
  const activeStyle = element.getAttribute("style-active") ?? hoverStyle;

  const apply = (extra) => {
    element.setAttribute("style", `${baseStyle};${extra}`);
  };

  element.addEventListener("pointerenter", () => apply(hoverStyle));
  element.addEventListener("pointerleave", () => apply(""));
  element.addEventListener("pointerdown", () => apply(activeStyle));
  element.addEventListener("pointerup", () => apply(hoverStyle));
  element.addEventListener("pointercancel", () => apply(""));
}

document.addEventListener("click", (event) => {
  for (const menu of document.querySelectorAll("details.language-menu[open]")) {
    if (!menu.contains(event.target)) menu.removeAttribute("open");
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;

  for (const menu of document.querySelectorAll("details.language-menu[open]")) {
    menu.removeAttribute("open");
    menu.querySelector("summary")?.focus();
  }
});
