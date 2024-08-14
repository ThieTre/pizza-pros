import * as utils from "./util.js";
import * as comps from "./components.js";
import Order from "./order.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

// Firebase and Firestore
const firebaseConfig = {
  apiKey: "AIzaSyCcRzR1yT0QGechkX5i2DohZszNXq5h--o",
  authDomain: "pizza-pros-ebd28.firebaseapp.com",
  projectId: "pizza-pros-ebd28",
  storageBucket: "pizza-pros-ebd28.appspot.com",
  messagingSenderId: "221689299349",
  appId: "1:221689299349:web:ff0f3b2e075c772fb0769c",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);

const collections = {
  orders: collection(db, "Orders"),
  fundraisers: collection(db, "Fundraisers"),
  products: collection(db, "Products"),
  users: collection(db, "Users"),
};

// Basic assignments
let order = null;
const queryMap = utils.mapQueryString();

// Map product info
let product_info = new Map();
let q = query(collections.products);
await getDocs(q).then((snap) => {
  snap.docs.forEach((doc) => {
    let data = doc.data();
    product_info[data.Type] = { price: data.Price };
  });
});

//// Functions ////

// Genral
const r = utils.r;
const c = utils.c;

async function getSnapFromId(collection, id) {
  const docRef = doc(collection, id);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return snap.data();
  } else {
    return null;
  }
}

async function openModal(name) {
  let element = r(name);
  let background = r(`${name}-bg`);
  element.classList.add("is-active");
  background.addEventListener("click", () => {
    element.classList.remove("is-active");
  });
}

async function closeModal(name) {
  let element = r(name);
  element.classList.remove("is-active");
}

// UI
async function loadFundraiser() {
  r("search-page").classList.add("is-hidden");
  r("order-page").classList.remove("is-hidden");

  // Populate summary
  const orgTitle = r("org-title");
  const orgPkpInfo = r("org-subtitle");
  orgTitle.innerHTML = order.fundraiserData.Name;
  orgPkpInfo.innerHTML = order.fundraiserData.Pickup;
  r("checkout-btn").addEventListener("click", () => {
    loadCheckout();
  });

  // Populate add modal data
  const addModalScroller = r("add-modal-choices-box");
  const addModalPrice = r("add-modal-price");
  const addModalTitle = r("add-modal-title");
  let buttons = [];

  function selectItem(selectedBtn, data) {
    buttons.forEach((otherBtn) => {
      otherBtn.classList.remove("is-info", "has-text-weight-bold");
    });
    addModalPrice.innerHTML = "$" + data.price;
    addModalTitle.innerHTML = selectedBtn.innerHTML + " Pizza";
    selectedBtn.classList.add("is-info", "has-text-weight-bold");
  }

  let index = 0;
  for (let productType in product_info) {
    let info = product_info[productType];
    let btn = comps.choicesRow(addModalScroller, productType);
    buttons.push(btn);

    if (index == 0) {
      selectItem(btn, info);
    }
    index++;

    btn.addEventListener("click", () => {
      selectItem(btn, info);
    });
  }

  // Popup button
  r("add-item-button").addEventListener("click", () => {
    openModal("add-modal");
  });

  // Modal button
  r("add-item-modal-button").addEventListener("click", () => {
    const selectedItemName = addModalTitle.innerHTML.split(" ")[0];
    const quantity = Number(r("add-modal-quantity-input").value);
    order.incrementItem(selectedItemName, quantity);
    closeModal("add-modal");
    updateOrderTable();
  });

  updateOrderTable();
}

async function loadCheckout() {
  openModal("checkout-modal");
  r("checkout-total-price").innerHTML = r("total-price").innerHTML;
  r("checkout-total-quantity").innerHTML = r("total-quantity").innerHTML;

  const firstNameInput = r("checkout-first-name");
  const lastNameInput = r("checkout-last-name");
  const emailInput = r("checkout-email");

  const inputs = [firstNameInput, lastNameInput, emailInput];
  inputs.forEach((input) => {
    input.classList.remove("is-danger");
  });

  r("checkout-modal-confirm").addEventListener("click", () => {
    inputs.forEach((input) => {
      let isMissingInput = false;
      if (input.value == "") {
        input.classList.add("is-danger");
        isMissingInput = true;
      }
      if (isMissingInput) {
        return;
      }
    });
  });
}

async function loadFundraisersSearch() {
  r("search-page").classList.remove("is-hidden");
  r("order-page").classList.add("is-hidden");

  // Populate table
  const fundraisersTable = r("fundraisers-table-body");
  const q = query(collections.fundraisers);
  await getDocs(q).then((snap) => {
    snap.docs.forEach((doc) => {
      let data = doc.data();
      let [viewBtn, editBtn] = comps.fundraiserRow(
        fundraisersTable,
        data.Name,
        data.Due,
        data.Pickup,
        true
      );

      viewBtn.addEventListener("click", () => {
        window.location.search = `fundraiserid=${doc.id}`;
      });
      editBtn.addEventListener("click", () => {
        loadFundraiserEdit(doc.id, data);
      });
    });
  });
}

async function loadFundraiserEdit(fundraiserId, fundraiserData) {
  openModal("fundraiser-edit-modal");
  if (fundraiserId) {
    // Get existing order data
    let totalRevenue = 0;
    let totalQuantity = 0;
    let qtyMap = new Map();
    const q = query(
      collections.orders,
      where("FundraiserId", "==", fundraiserId)
    );
    await getDocs(q).then((snap) => {
      snap.docs.forEach((doc) => {
        let data = doc.data();
        for (let productType in data.Products) {
          const qty = data.Products[productType];
          const price = product_info[productType].price;
          totalRevenue += price * qty;
          totalQuantity += qty;

          if (qtyMap[productType]) {
            qtyMap[productType] += qty;
          } else {
            qtyMap[productType] = qty;
          }
        }
      });

      // Setup quantity map export
      let csv = "Product,Quantity\n";
      for (let product in qtyMap) {
        qty = qtyMap[product];
        csv += `${product},${qty}\n`;
      }

      r("fundraiser-export-btn").addEventListener("click", () => {
        utils.download(
          `${fundraiserData.Name} Export ${Date.now().toString()}.csv`,
          csv
        );
      });

      r("fundraiser-edit-total-quantity").innerHTML = totalQuantity + "x";
      r("fundraiser-edit-total-price").innerHTML = "$" + totalRevenue;
    });
  } else {
  }
}

function updateOrderTable() {
  const orderTable = r("order-table-body");
  const priceText = r("total-price");
  const quantityText = r("total-quantity");

  let totalPrice = 0;
  let totalQuantity = 0;
  orderTable.innerHTML = "";
  for (const [itemName, quantity] of Object.entries(order.itemMap)) {
    const price = product_info[itemName].price;
    const exitBtn = comps.orderRow(orderTable, itemName, price, quantity);

    totalPrice += quantity * price;
    totalQuantity += quantity;

    exitBtn.addEventListener("click", () => {
      order.removeItem(itemName);
      updateOrderTable();
    });
  }

  if (totalPrice <= 0) {
    r("checkout-btn").classList.add("is-hidden");
  } else {
    r("checkout-btn").classList.remove("is-hidden");
  }

  priceText.innerHTML = "$" + totalPrice;
  quantityText.innerHTML = totalQuantity + "x";
}

async function resolveOrder() {
  if (queryMap.orderid) {
    // Populate the order object with existing order data if applicable
    const data = await getSnapFromId(collections.orders, queryMap.orderid);
    if (!data) {
      return;
    }
    order = Order.fromOrder(data);
  } else if (queryMap.fundraiserid) {
    // Populate from fundraiser id
    order = new Order();
    order.fundraiserId = queryMap.fundraiserid;
  }
}

//// Execution ////

r("navbar-find").addEventListener("click", () => {
  window.location.search = "";
});

await resolveOrder();

// Check for fundraiser data
if (order && order.fundraiserId) {
  order.fundraiserData = await getSnapFromId(
    collections.fundraisers,
    order.fundraiserId
  );
}

// Load appropriate page
if (order && order.fundraiserData) {
  loadFundraiser();
} else {
  loadFundraisersSearch();
}
