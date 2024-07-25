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

const ORDERS = collection(db, "Orders");
const FUNDRAISERS = collection(db, "Fundraisers");
const PRODUCTS = collection(db, "Products");
const USERS = collection(db, "Users");

//// Functions

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

// UI
async function loadFundraiser(order) {
  // Make components visible
  r("order-summary").classList.remove("is-hidden");
  r("order-box").classList.remove("is-hidden");

  // Get fundraiser doc from order or query it
  let fundData = null;
  if (order.fundraiser) {
    fundData = (await getDoc(order.fundraiser)).data();
  } else {
    let q = query(FUNDRAISERS, where("Name", "==", "Example School"));
    fundData = await getDocs(q).then((snap) => {
      if (!snap.docs[0]) {
        console.log("No fundraiser of name " + fundData.Name);
        return;
      }
      return snap.docs[0].data();
    });
  }

  // Populate summary
  const orgTitle = r("org-title");
  const orgPkpInfo = r("org-subtitle");
  orgTitle.innerHTML = fundData.Name;
  const options = {
    month: "2-digit",
    day: "2-digit",
    year: "2-digit",
    hour12: true,
  };
  const startStamp = fundData.Pickup_Start.toDate();
  const endStamp = fundData.Pickup_End.toDate();
  const startTime = startStamp.toLocaleString("en-US", {
    hour: "numeric",
    hour12: true,
  });
  const endTime = endStamp.toLocaleString("en-US", {
    hour: "numeric",
    hour12: true,
  });
  const date = startStamp.toLocaleString("en-US", options);
  orgPkpInfo.innerHTML = "Pickup ".concat(
    date,
    ", ",
    startTime,
    " - ",
    endTime
  );

  // Populate add modal data
  const addModalScroller = r("add-modal-choices-box");
  const addModalPrice = r("add-modal-price");
  let q = query(PRODUCTS);
  let buttons = [];
  fundData = await getDocs(q).then((snap) => {
    snap.docs.forEach((doc) => {
      let data = doc.data();
      let btn = comps.choicesRow(data.Type, addModalScroller);
      PRODUCT_INFO[data.Type] = { Price: data.Price };
      buttons.push(btn);
      btn.addEventListener("click", () => {
        buttons.forEach((choiceBtn) => {
          choiceBtn.classList.remove("is-info", "has-text-weight-bold");
        });
        addModalPrice.innerHTML = "$" + data.Price;
        btn.classList.add("is-info", "has-text-weight-bold");
      });
    });
  });

  const addBtn = r("add-item-button");

  addBtn.addEventListener("click", () => {
    openModal("add-modal");
  });
  updateOrderTable();
}

function updateOrderTable() {
  const orderTable = r("order-table-body");
  orderTable.innerHTML = "";
  console.log(order.itemMap);
  for (const [itemName, quantity] of Object.entries(order.itemMap)) {
    console.log(PRODUCT_INFO);
    const exitBtn = comps.orderRow(
      itemName,
      PRODUCT_INFO[itemName].Price,
      quantity,
      orderTable
    );
    exitBtn.addEventListener("click", () => {
      order.removeItem(itemName);
      updateOrderTable();
    });
  }
}

//// Execution

let PRODUCT_INFO = new Map();

// Map query string
const queryMap = utils.mapQueryString();
let order = new Order();
if (!queryMap.fundraisername & !queryMap.orderid) {
  // TODO: send to fundraiser screen?
} else {
  // Populate the order object with existing order data if applicable
  if (queryMap.orderid) {
    const data = await getSnapFromId(ORDERS, queryMap.orderid);
    if (data) {
      order = Order.fromPayload(data);
    }
  }
  loadFundraiser(order); // load the fundraiser
}
