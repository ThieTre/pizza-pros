// Class representing a single pizza order

class Order {
  constructor(fundraiserId) {
    this.fundraiserId = fundraiserId;
    this.itemMap = new Map();
  }

  static fromOrder(data) {
    const order = new Order();
    order.fundraiserId = data.FundraiserId;
    order.userId = data.UID;
    order.status = data.Status;
    if (data.Products) {
      for (const [itemName, quantity] of Object.entries(data.Products)) {
        order.itemMap[itemName] = quantity;
      } 
    }
    return order;
  }

  incrementItem(itemName, quantity) {
    const currentCount = this.itemMap[itemName] || 0;
    const newCount = currentCount + quantity;
    if (newCount <= 0) {
      this.removeItem(itemName);
    } else {
      this.itemMap[itemName] = newCount;
    }
  }

  removeItem(itemName) {
    delete this.itemMap[itemName];
  }
}

export default Order;
