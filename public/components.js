// Module to handle generation of replicated HTML components

export function orderRow(name, unitPrice, quantity, parent) {
  const totalPrice = unitPrice * quantity;
  const element = document.createElement("tr");
  element.innerHTML = `    
  <td>${name}</td>
  <td>$${unitPrice}</td>
  <td>${quantity}</td>
  <td>$${totalPrice}</td>
  <td class="is-narrow has-text-centered pr-6 has-text-centered">

  <figure class="image is-24x24 is-clickable" id="delete-btn">
    <img  class="fas fa-times" style="color: #d72828;"/>
  </figure>
  </td>`;

  if (parent) {
    parent.appendChild(element);
  }
  return element.querySelector("#delete-btn");
}

export function choicesRow(name, parent) {
  const element = document.createElement("div");
  element.classList.add(
    "button",
    "is-in",
    "is-fullwidth",
    "add-modal-choice",
    "mb-2"
  );
  element.id = `add-modal-choice-${name}`;
  element.innerHTML = name;
  if (parent) {
    parent.appendChild(element);
  }
  return element;
}
