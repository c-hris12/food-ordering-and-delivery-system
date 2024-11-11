
# Food Ordering and Delivery System

This system is designed for managing the operations of a food delivery service, including user management, restaurant management, order processing, delivery management, and dynamic pricing. It is built using `express` for the backend and `azle` for smart contract management.

## Features

- **User Management**: Allows for different user roles, including `Customer`, `RestaurantOwner`, and `DeliveryPerson`.
- **Restaurant Management**: Enables restaurant owners to create, update, and view restaurant details.
- **Menu Item Management**: Allows restaurant owners to create and manage menu items.
- **Order Management**: Customers can place orders, and restaurant owners can view them.
- **Delivery Management**: Delivery personnel can manage their deliveries, accept, or mark them as completed.
- **Smart Order Batching**: Optimizes the delivery routes for multiple orders to improve efficiency.
- **Dynamic Pricing**: Allows for dynamic pricing based on various conditions like time, demand, and special events.
- **Loyalty Program**: Customers earn points based on their orders, and they can redeem them for rewards.
- **Restaurant Analytics**: Provides detailed metrics for restaurants, including daily orders, popular items, peak hours, and delivery performance.

## Setup

1. Clone the repository:
    ```bash
    git clone https://github.com/c-hris12/food-ordering-and-delivery-system.git
    cd food-ordering-and-delivery-system
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Start the server:
    ```bash
    npm start
    ```

## API Endpoints

### 1. User Management

- **POST /users**: Create a new user.
- **GET /users**: Get all users.

### 2. Restaurant Management

- **POST /restaurants**: Create a new restaurant.
- **GET /restaurants**: Get all restaurants.

### 3. Menu Item Management

- **POST /menu-items**: Add a new menu item.
- **GET /menu-items**: Get all menu items.

### 4. Order Management

- **POST /orders**: Place a new order.
- **GET /orders**: Get all orders.

### 5. Delivery Management

- **POST /deliveries**: Create a new delivery.
- **GET /deliveries**: Get all deliveries.
- **PATCH /deliveries/:id/accept**: Accept a delivery.
- **PATCH /deliveries/:id/delivered**: Mark delivery as completed.

### 6. Smart Order Batching

- **POST /batch-orders**: Create a batch order with optimized delivery routes.
- **GET /batch-orders**: Get all batch orders.
- **GET /batch-orders/:id**: Get a specific batch order.
- **GET /batch-orders/delivery-person/:deliveryPersonId**: Get batch orders for a specific delivery person.

### 7. Dynamic Pricing

- **POST /pricing-rules**: Create a new pricing rule.
- **GET /pricing-rules**: Get all pricing rules.
- **GET /pricing-rules/:id**: Get a specific pricing rule.
- **GET /pricing-rules/restaurant/:restaurantId**: Get pricing rules for a specific restaurant.

### 8. Loyalty Program

- **POST /loyalty/earn-points**: Add points to a user's loyalty program based on their order.
- **GET /loyalty-programs**: Get all loyalty programs.
- **GET /loyalty-programs/:loyaltyProgramId**: Get a specific loyalty program.
- **GET /loyalty-programs/:userId**: Get the loyalty program for a specific user.

### 9. Restaurant Analytics

- **POST /analytics/restaurant**: Create analytics for a restaurant.
- **GET /analytics/restaurant/:restaurantId**: Get restaurant analytics for a specific restaurant.
- **GET /analytics**: Get all restaurant analytics.
- **GET /analytics/restaurant/:restaurantId/peak-hours**: Get peak hours for a restaurant.
- **GET /analytics/restaurant/:restaurantId/popular-items**: Get popular items for a restaurant.
- **GET /analytics/restaurant/:restaurantId/delivery-performance**: Get delivery performance for a restaurant.

## Dependencies

- `express`: Web framework for Node.js.
- `uuid`: For generating unique IDs for various entities like users, restaurants, and orders.
- `azle`: For managing smart contracts in the backend.
- `StableBTreeMap`: A data structure for managing state on the server.

## License

MIT License. See LICENSE for details.