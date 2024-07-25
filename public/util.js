// General
export function r(id) {
  return document.querySelector(`#${id}`);
}

export function c(cls) {
  return document.querySelectorAll(`.${cls}`);
}

export function mapQueryString() {
  var dictionary = {};
  const queryString = window.location.search.substring(1);

  if (queryString === "") {
    return {};
  }

  var parts = queryString.split("&");

  for (var i = 0; i < parts.length; i++) {
    var p = parts[i];
    var keyValuePair = p.split("=");
    var key = keyValuePair[0];
    var value = keyValuePair[1];
    value = decodeURIComponent(value);
    value = value.replace(/\+/g, " ");
    dictionary[key] = value;
  }
  return dictionary;
}

// UI
export function modalClose(modal) {
  modal.classList.remove("is-active");
}

export function modalOpen(modal) {
  modal.classList.add("is-active");
}
