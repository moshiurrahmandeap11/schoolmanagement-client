export const setFavicon = (url) => {
  const link =
    document.querySelector("link#app-favicon") ||
    document.querySelector("link[rel='icon']");

  if (link) {
    link.href = url;
  }
};
