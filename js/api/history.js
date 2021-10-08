
export const add = (data) => {
  history.pushState(data, null, data.link);
  document.title = data.title; // change title in browser tab
};

export const replace = (data) => {
  history.replaceState(data, null, data.link);
  document.title = data.title; // change title in browser tab
};