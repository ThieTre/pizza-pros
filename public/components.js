// Module to handle generation of replicated HTML components

export function orderRow(parent, name, unitPrice, quantity) {
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
  parent.appendChild(element);
  return element.querySelector("#delete-btn");
}

export function fundraiserRow(parent, name, due, pickup, isAdmin) {
  const element = document.createElement("tr");
  element.innerHTML = `    
  <td>${name}</td>
  <td>${due}</td>
  <td>${pickup}</td>
  <td>
    <button class="button is-size-7 is-pulled-right">
      <div id="view-button" class="text has-text-weight-bold pl-1 pr-1 is-size-6 has-text-link">View</div>
    </button>
    <button id="edit-button" class="button is-size-7 is-pulled-right mr-2 ${
      isAdmin ? "" : "is-hidden"
    }">
      <div class="text has-text-weight-bold pl-1 pr-1 is-size-6 has-text-link">Edit</div>
    </button>
  </td>`;

  parent.appendChild(element);
  return [
    element.querySelector("#view-button"),
    element.querySelector("#edit-button"),
  ];
}

export function choicesRow(parent, name) {
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
  parent.appendChild(element);
  return element;
}
