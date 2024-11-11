import { v4 as uuidv4 } from "uuid";
import { Server, StableBTreeMap, ic } from "azle";
import express from "express";

// UserRole Enum
enum UserRole {
    Customer = "Customer",
    RestaurantOwner = "RestaurantOwner",
    DeliveryPerson = "DeliveryPerson"
}

// User
class User {
    id: string;
    username: string;
    email: string;
    phoneNumber: string;
    role: UserRole;
    createdAt: number;

    constructor(username: string, email: string, phoneNumber: string, role: UserRole) {
        this.id = uuidv4();
        this.username = username;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.role = role;
        this.createdAt = Date.now();
    }
}

// Restaurant
class Restaurant {
    id: string;
    ownerId: string;
    name: string;
    description: string;
    address: string;
    createdAt: number;

    constructor(ownerId: string, name: string, description: string, address: string) {
        this.id = uuidv4();
        this.ownerId = ownerId;
        this.name = name;
        this.description = description;
        this.address = address;
        this.createdAt = Date.now();
    }
}

// MenuItem
class MenuItem {
    id: string;
    restaurantId: string;
    name: string;
    description: string;
    price: number;
    quantityKg: number;
    createdAt: number;

    constructor(restaurantId: string, name: string, description: string, price: number, quantityKg: number) {
        this.id = uuidv4();
        this.restaurantId = restaurantId;
        this.name = name;
        this.description = description;
        this.price = price;
        this.quantityKg = quantityKg;
        this.createdAt = Date.now();
    }
}

// Order
class Order {
    id: string;
    customerId: string;
    restaurantId: string;
    items: string[]; // MenuItem IDs
    totalBill: number;
    status: string;
    createdAt: number;

    constructor(customerId: string, restaurantId: string, items: string[]) {
        this.id = uuidv4();
        this.customerId = customerId;
        this.restaurantId = restaurantId;
        this.items = items;
        this.totalBill = 0; // Initially set to 0
        this.status = "pending";
        this.createdAt = Date.now();
    }

    // Method to calculate the total bill for the order
    calculateTotalBill(menuItemManager: any): void {
        this.totalBill = 0; // Reset totalBill before recalculating
        for (const itemId of this.items) {
            const menuItemOpt = menuItemManager.get(itemId);
            if (!menuItemOpt.Some) {
                throw new Error(`Menu item ${itemId} not found.`);
            }
            this.totalBill += menuItemOpt.Some.price;
        }
    }
}

// Delivery
class Delivery {
    id: string;
    orderId: string;
    deliveryPersonId: string;
    status: string;
    createdAt: number;

    constructor(orderId: string, deliveryPersonId: string) {
        this.id = uuidv4();
        this.orderId = orderId;
        this.deliveryPersonId = deliveryPersonId;
        this.status = "assigned";
        this.createdAt = Date.now();
    }
}

// Smart Order Batching System
class BatchOrder {
    id: string;
    deliveryPersonId: string;
    orders: string[];  // Order IDs
    optimizedRoute: string[];  // Location coordinates in optimal sequence
    totalDistance: number;
    status: string;
    createdAt: number;

    constructor(deliveryPersonId: string, orders: string[], optimizedRoute: string[], totalDistance: number) {
        this.id = uuidv4();
        this.deliveryPersonId = deliveryPersonId;
        this.orders = orders;
        this.optimizedRoute = optimizedRoute; // Now passing optimizedRoute to constructor
        this.totalDistance = totalDistance;
        this.status = "pending";
        this.createdAt = Date.now();
    }
}

// Dynamic Pricing System
class PricingRule {
    id: string;
    restaurantId: string;
    condition: {
        type: string; // "time", "demand", "weather", "special_event"
        parameters: {
            startTime?: number;
            endTime?: number;
            demandThreshold?: number;
            weatherCondition?: string;
            eventName?: string;
        };
    };
    adjustmentType: string; // "percentage" or "fixed"
    adjustmentValue: number;
    priority: number;
    createdAt: number;

    constructor(
        restaurantId: string,
        condition: any,
        adjustmentType: string,
        adjustmentValue: number,
        priority: number
    ) {
        this.id = uuidv4();
        this.restaurantId = restaurantId;
        this.condition = condition;
        this.adjustmentType = adjustmentType;
        this.adjustmentValue = adjustmentValue;
        this.priority = priority;
        this.createdAt = Date.now();
    }
}

// Loyalty and Rewards System
class LoyaltyProgram {
    id: string;
    userId: string;
    points: number;
    tier: string;
    historicalPoints: number;
    rewards: string[];
    createdAt: number;

    constructor(userId: string) {
        this.id = uuidv4();
        this.userId = userId;
        this.points = 0;
        this.tier = "BRONZE";
        this.historicalPoints = 0;
        this.rewards = [];
        this.createdAt = Date.now();
    }
}

// Restaurant Analytics System
class RestaurantAnalytics {
    id: string;
    restaurantId: string;
    metrics: {
        dailyOrders: Map<string, number>;
        popularItems: Map<string, number>;
        peakHours: Map<string, number>;
        averageOrderValue: number;
        customerRetentionRate: number;
        deliveryPerformance: {
            averageTime: number;
            lateDeliveries: number;
            onTimeDeliveries: number;
        };
    };
    lastUpdated: number;

    constructor(
        restaurantId: string,
        dailyOrders: Map<string, number>,
        popularItems: Map<string, number>,
        peakHours: Map<string, number>,
        averageOrderValue: number,
        customerRetentionRate: number,
        deliveryPerformance: {
            averageTime: number;
            lateDeliveries: number;
            onTimeDeliveries: number;
        }
    ) {
        // Ensure all fields are provided
        if (!restaurantId || !dailyOrders || !popularItems || !peakHours || !averageOrderValue || !customerRetentionRate || !deliveryPerformance) {
            throw new Error("All fields are required.");
        }

        this.id = uuidv4();
        this.restaurantId = restaurantId;
        this.metrics = {
            dailyOrders: dailyOrders,
            popularItems: popularItems,
            peakHours: peakHours,
            averageOrderValue: averageOrderValue,
            customerRetentionRate: customerRetentionRate,
            deliveryPerformance: deliveryPerformance
        };
        this.lastUpdated = Date.now();
    }
}



// Storage
const userManager = StableBTreeMap<string, User>(0);
const restaurantManager = StableBTreeMap<string, Restaurant>(1);
const menuItemManager = StableBTreeMap<string, MenuItem>(2);
const orderManager = StableBTreeMap<string, Order>(3);
const deliveryManager = StableBTreeMap<string, Delivery>(4);
const batchOrderManager = StableBTreeMap<string, BatchOrder>(5);
const pricingRuleManager = StableBTreeMap<string, PricingRule>(6);
const loyaltyManager = StableBTreeMap<string, LoyaltyProgram>(7);
const analyticsManager = StableBTreeMap<string, RestaurantAnalytics>(8);

export default Server(() => {
    const app = express();
    app.use(express.json());

    // Create user
    app.post("/users", (req, res) => {
        const { username, email, phoneNumber, role } = req.body;

        // Validate payload
        if (!username || !email || !phoneNumber || !role) {
            return res.status(400).json({
                status: 400,
                error: "Invalid payload: Ensure all required fields are provided."
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: "Invalid email address."
            });
        }

        // Check for existing email
        const existingEmail = userManager.values().find(user => user.email === email);
        if (existingEmail) {
            return res.status(400).json({
                error: "Email already exists."
            });
        }

        // Check for existing phone number
        const phoneRegex = /^\+?[0-9]{10,14}$/;
        if (!phoneRegex.test(phoneNumber)) {
            return res.status(400).json({
                error: "Invalid phone number."
            });
        }

        // Create new user
        const user = new User(username, email, phoneNumber, role);
        userManager.insert(user.id, user);
        res.status(201).json({
            message: "User created successfully.",
            user: user
        });
    });

    // Get all users
    app.get("/users", (req, res) => {
        const users = userManager.values();
        if (users.length === 0) {
            return res.status(404).json({
                message: "No users found."
            });
        }
        res.status(200).json({
            message: "Users retrieved successfully",
            user: users
        });
    });

    // Create restaurant
    app.post("/restaurants", (req, res) => {
        const { ownerId, name, description, address } = req.body;

        // Validate restaurant payload
        if (!name || !description || !address) {
            return res.status(400).json({
                status: 400,
                error: "Invalid payload: Ensure 'name', 'description', and 'address' are provided."
            });
        }

        // Ensure the user exists and is an owner
        const ownerOpt = userManager.get(ownerId);

        if (!ownerOpt.Some) {
            return res.status(404).json({ error: "User not found." });
        }

        const owner = ownerOpt.Some;

        if (owner.role !== UserRole.RestaurantOwner) {
            return res.status(400).json({ error: "User must be a restaurant owner." });
        }

        const restaurant = new Restaurant(ownerId, name, description, address);
        restaurantManager.insert(restaurant.id, restaurant);

        res.status(201).json({
            message: "Restaurant created successfully.",
            restaurant
        });
    });

    // Get all restaurants
    app.get("/restaurants", (req, res) => {
        const restaurants = restaurantManager.values();
        if (restaurants.length === 0) {
            return res.status(404).json({ message: "No restaurants found." });
        }
        res.status(200).json({
            message: "Restaurants retrieved successfully.",
            restaurants: restaurants
        });
    });

    // Create menu item
    app.post("/menu-items", (req, res) => {
        const { restaurantId, name, description, price, quantityKg } = req.body;

        // Validate the menu-item payload
        if (!restaurantId || !name || !description || !price || !quantityKg) {
            return res.status(400).json({
                status: 400,
                error: "Invalid payload: Ensure 'restaurantId', 'name', 'description', 'price' and 'quantityKg'  are provided."
            });
        }

        // Ensure the restaurant exists
        const restaurant = restaurantManager.get(restaurantId);
        if (!restaurant.Some) {
            return res.status(404).json({
                status: 404,
                error: "Restaurant not found."
            });
        }

        const menuItem = new MenuItem(restaurantId, name, description, price, quantityKg);
        menuItemManager.insert(menuItem.id, menuItem);

        res.status(201).json({
            message: "Menu item created successfully.",
            menuItem
        });
    });

    // Get all menu items
    app.get("/menu-items", (req, res) => {
        const menuItems = menuItemManager.values();
        if (menuItems.length === 0) {
            return res.status(404).json({ message: "No menu items found." });
        }
        res.status(200).json({
            message: "Menu Items retrieved successfully.",
            menuItems: menuItems
        });
    });

    // Create order
    app.post("/orders", (req, res) => {
        const { customerId, restaurantId, items } = req.body;

        // Validate the orders payload
        if (!customerId || !restaurantId || !items) {
            return res.status(400).json({
                status: 400,
                error: "Invalid payload: Ensure 'customerId', 'restaurantId' and 'items' are provided."
            });
        }

        // Validate customer and restaurant
        const customerOpt = userManager.get(customerId);
        const restaurantOpt = restaurantManager.get(restaurantId);

        // Check if customer exists
        if (!customerOpt.Some) {
            return res.status(404).json({ error: "Customer not found." });
        }

        const customer = customerOpt.Some;

        // Validate customer role
        if (customer.role !== UserRole.Customer) {
            return res.status(400).json({ error: "Invalid customer role." });
        }

        // Check if restaurant exists
        if (!restaurantOpt.Some) {
            return res.status(404).json({ error: "Restaurant not found." });
        }

        // Create the order
        const order = new Order(customerId, restaurantId, items);

        // Calculate the total bill
        try {
            order.calculateTotalBill(menuItemManager);
        } catch (error) {
            return res.status(404).json({ error: "Error calculating the totalBill." });
        }

        // Save the order
        orderManager.insert(order.id, order);

        res.status(201).json({
            message: "Order created successfully.",
            order
        });
    });


    // Get all orders
    app.get("/orders", (req, res) => {
        const orders = orderManager.values();
        if (orders.length === 0) {
            return res.status(404).json({ message: "No orders found." });
        }
        res.status(200).json({
            message: "Orders fetched successfully.",
            orders: orders
        });
    });

    // Create delivery
    app.post("/deliveries", (req, res) => {
        const { orderId, deliveryPersonId } = req.body;

        // Validate the delivery payload
        if (!orderId || !deliveryPersonId) {
            return res.status(400).json({
                status: 400,
                error: "Invalid payload: Ensure 'orderId' and 'deliveryPersonId' are provided."
            });
        }

        // Ensure the order exists
        const orderOpt = orderManager.get(orderId);
        if (!orderOpt.Some) {
            return res.status(404).json({ error: "Order not found." });
        }

        // Ensure the delivery person exists and is valid
        const deliveryPersonOpt = userManager.get(deliveryPersonId);
        if (!deliveryPersonOpt.Some) {
            return res.status(404).json({ error: "Delivery person not found." });
        }

        const deliveryPerson = deliveryPersonOpt.Some;
        if (deliveryPerson.role !== UserRole.DeliveryPerson) {
            return res.status(400).json({ error: "Invalid delivery person role." });
        }

        const delivery = new Delivery(orderId, deliveryPersonId);
        deliveryManager.insert(delivery.id, delivery);

        res.status(201).json({
            message: "Delivery created successfully.",
            delivery
        });
    });

    // Get all deliveries
    app.get("/deliveries", (req, res) => {
        const deliveries = deliveryManager.values();
        if (deliveries.length === 0) {
            return res.status(404).json({ message: "No deliveries found." });
        }
        res.status(200).json({
            message: "Deliveries Fetched successfully.",
            deliveries
        });
    });

    // Accept delivery
    app.patch("/deliveries/:id/accept", (req, res) => {
        const { id } = req.params;

        const deliveryOpt = deliveryManager.get(id);
        if (!deliveryOpt.Some) {
            return res.status(404).json({ error: "Delivery not found." });
        }

        const delivery = deliveryOpt.Some;
        delivery.status = "accepted";
        deliveryManager.insert(id, delivery);

        res.status(200).json({
            message: "Delivery accepted successfully.",
            delivery
        });
    });

    // Mark delivery as delivered
    app.patch("/deliveries/:id/delivered", (req, res) => {
        const { id } = req.params;

        const deliveryOpt = deliveryManager.get(id);
        if (!deliveryOpt.Some) {
            return res.status(404).json({ error: "Delivery not found." });
        }

        const delivery = deliveryOpt.Some;
        delivery.status = "delivered";
        deliveryManager.insert(id, delivery);

        res.status(200).json({
            message: "Delivery marked as delivered.",
            delivery
        });
    });

    // Smart Order Batching Endpoint
    app.post("/batch-orders", (req, res) => {
        const { deliveryPersonId, orderIds, locations } = req.body;

        // Validate the batch-orders payload
        if (!deliveryPersonId || !orderIds || !locations || !Array.isArray(locations) || locations.length === 0) {
            return res.status(400).json({
                status: 400,
                error: "Invalid payload: Ensure all required fields are provided and locations is a non-empty array."
            });
        }

        // Validate delivery person
        const deliveryPersonOpt = userManager.get(deliveryPersonId);
        if (!deliveryPersonOpt.Some || deliveryPersonOpt.Some.role !== UserRole.DeliveryPerson) {
            return res.status(400).json({ error: "Invalid delivery person." });
        }

        // Validate orders
        for (const orderId of orderIds) {
            const orderOpt = orderManager.get(orderId);
            if (!orderOpt.Some) {
                return res.status(404).json({ error: `Order ${orderId} not found.` });
            }
        }

        // Implement route optimization
        const optimizedRoute = optimizeDeliveryRoute(locations);
        const totalDistance = calculateTotalDistance(optimizedRoute);

        // Create batch order with optimized route
        const batchOrder = new BatchOrder(deliveryPersonId, orderIds, optimizedRoute, totalDistance);
        batchOrderManager.insert(batchOrder.id, batchOrder);

        res.status(201).json({
            message: "Batch order created successfully.",
            batchOrder
        });
    });

    // Batch Order Retrieval Functions
    app.get("/batch-orders", (req, res) => {
        const batchOrders = batchOrderManager.values();
        if (batchOrders.length === 0) {
            return res.status(404).json({ message: "No batch orders found." });
        }
        res.status(200).json({
            message: "Batch orders retrieved successfully.",
            batchOrders
        });
    });

    app.get("/batch-orders/:id", (req, res) => {
        const { id } = req.params;
        const batchOrderOpt = batchOrderManager.get(id);

        if (!batchOrderOpt.Some) {
            return res.status(404).json({ error: "Batch order not found." });
        }

        res.status(200).json({
            message: "Batch order retrieved successfully.",
            batchOrder: batchOrderOpt.Some
        });
    });

    app.get("/batch-orders/delivery-person/:deliveryPersonId", (req, res) => {
        const { deliveryPersonId } = req.params;
        const batchOrders = batchOrderManager.values().filter(
            order => order.deliveryPersonId === deliveryPersonId
        );

        if (batchOrders.length === 0) {
            return res.status(404).json({
                message: "No batch orders found for this delivery person."
            });
        }

        res.status(200).json({
            message: "Batch orders retrieved successfully.",
            batchOrders
        });
    });



    // Dynamic Pricing Rule Creation
    app.post("/pricing-rules", (req, res) => {
        const { restaurantId, condition, adjustmentType, adjustmentValue, priority } = req.body;

        // Validate the pricing-rules payload
        if (!restaurantId || !condition || !adjustmentType || !adjustmentValue || !priority) {
            return res.status(400).json({
                status: 400,
                error: "Invalid payload: Ensure all required fields are provided."
            });
        }

        // Validate restaurant
        const restaurantOpt = restaurantManager.get(restaurantId);
        if (!restaurantOpt.Some) {
            return res.status(404).json({ error: "Restaurant not found." });
        }

        const pricingRule = new PricingRule(
            restaurantId,
            condition,
            adjustmentType,
            adjustmentValue,
            priority
        );
        pricingRuleManager.insert(pricingRule.id, pricingRule);

        res.status(201).json({
            message: "Pricing rule created successfully.",
            pricingRule
        });
    });

    // Pricing Rule Retrieval Functions
    app.get("/pricing-rules", (req, res) => {
        const pricingRules = pricingRuleManager.values();
        if (pricingRules.length === 0) {
            return res.status(404).json({ message: "No pricing rules found." });
        }
        res.status(200).json({
            message: "Pricing rules retrieved successfully.",
            pricingRules
        });
    });

    app.get("/pricing-rules/:id", (req, res) => {
        const { id } = req.params;
        const pricingRuleOpt = pricingRuleManager.get(id);

        if (!pricingRuleOpt.Some) {
            return res.status(404).json({ error: "Pricing rule not found." });
        }

        res.status(200).json({
            message: "Pricing rule retrieved successfully.",
            pricingRule: pricingRuleOpt.Some
        });
    });

    app.get("/pricing-rules/restaurant/:restaurantId", (req, res) => {
        const { restaurantId } = req.params;
        const pricingRules = pricingRuleManager.values().filter(
            rule => rule.restaurantId === restaurantId
        );

        if (pricingRules.length === 0) {
            return res.status(404).json({
                message: "No pricing rules found for this restaurant."
            });
        }

        res.status(200).json({
            message: "Pricing rules retrieved successfully.",
            pricingRules
        });
    });

    // Loyalty Points Management
    app.post("/loyalty/earn-points", (req, res) => {
        const { userId, orderId } = req.body;

        // Validate the loyalty Points Payload
        if (!userId || !orderId) {
            return res.status(400).json({
                status: 400,
                error: "Invalid payload: Ensure all required fields are provided."
            });
        }

        // Get or create loyalty program
        let loyaltyProgramOpt = loyaltyManager.get(userId);
        let loyaltyProgram;

        if (!loyaltyProgramOpt.Some) {
            loyaltyProgram = new LoyaltyProgram(userId);
        } else {
            loyaltyProgram = loyaltyProgramOpt.Some;
        }

        // Calculate points from order
        const orderOpt = orderManager.get(orderId);
        if (!orderOpt.Some) {
            return res.status(404).json({ error: "Order not found." });
        }

        const pointsEarned = calculateLoyaltyPoints(orderOpt.Some);
        loyaltyProgram.points += pointsEarned;
        loyaltyProgram.historicalPoints += pointsEarned;

        // Update tier based on historical points
        loyaltyProgram.tier = calculateTier(loyaltyProgram.historicalPoints);

        loyaltyManager.insert(userId, loyaltyProgram);

        res.status(200).json({
            message: "Points earned successfully.",
            pointsEarned,
            loyaltyProgram
        });
    });

    // Loyalty Program Retrieval Functions
    app.get("/loyalty-programs", (req, res) => {
        const loyaltyPrograms = loyaltyManager.values();
        if ("None" in loyaltyPrograms) {
            return res.status(404).json({ message: "No loyalty programs found." });
        }
        res.status(200).json({
            message: "Loyalty programs retrieved successfully.",
            loyaltyPrograms
        });
    });


    app.get("/loyalty-programs/:loyaltyProgramId", (req, res) => {
        const { loyaltyProgramId } = req.params;
        const loyaltyProgramOpt = loyaltyManager.get(loyaltyProgramId);

        if (!loyaltyProgramOpt.Some) {
            return res.status(404).json({ error: "Loyalty program with the specified Id not found." });
        }

        res.status(200).json({
            message: "Loyalty program retrieved successfully.",
            loyaltyProgram: loyaltyProgramOpt.Some
        });
    });

    app.get("/loyalty-programs/:userId", (req, res) => {
        const { userId } = req.params;
        const loyaltyProgramOpt = loyaltyManager.get(userId);

        if (!loyaltyProgramOpt.Some) {
            return res.status(404).json({ error: "Loyalty program for the user not found." });
        }

        res.status(200).json({
            message: "Loyalty program retrieved successfully.",
            loyaltyProgram: loyaltyProgramOpt.Some
        });
    });


    // Start server
    return app.listen();
});

// Helper functions
// Enhanced route optimization function
function optimizeDeliveryRoute(locations: string[]): string[] {
    if (!locations || locations.length === 0) {
        return [];
    }

    // Start with the first location as the depot
    const optimizedRoute = [locations[0]];
    const unvisited = locations.slice(1);

    // Simple nearest neighbor algorithm
    while (unvisited.length > 0) {
        const currentLocation = optimizedRoute[optimizedRoute.length - 1];
        let nearestIdx = 0;
        let minDistance = Number.MAX_VALUE;

        // Find the nearest unvisited location
        for (let i = 0; i < unvisited.length; i++) {
            const [lat1, long1] = currentLocation.split(',').map(Number);
            const [lat2, long2] = unvisited[i].split(',').map(Number);
            const distance = calculateDistance(lat1, long1, lat2, long2);

            if (distance < minDistance) {
                minDistance = distance;
                nearestIdx = i;
            }
        }

        // Add the nearest location to the route and remove it from unvisited
        optimizedRoute.push(unvisited[nearestIdx]);
        unvisited.splice(nearestIdx, 1);
    }

    // Return to depot (optional, uncomment if you want a round trip)
    // optimizedRoute.push(optimizedRoute[0]);

    return optimizedRoute;
}

function calculateTotalDistance(route: string[]): number {
    let totalDistance = 0;
    for (let i = 0; i < route.length - 1; i++) {
        const [lat1, long1] = route[i].split(',').map(Number);
        const [lat2, long2] = route[i + 1].split(',').map(Number);
        totalDistance += calculateDistance(lat1, long1, lat2, long2);
    }
    return totalDistance;
}

// Enhanced distance calculation function
function calculateDistance(lat1: number, long1: number, lat2: number, long2: number): number {
    if (isNaN(lat1) || isNaN(long1) || isNaN(lat2) || isNaN(long2)) {
        throw new Error("Invalid coordinates provided");
    }

    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLong = (long2 - long1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLong / 2) * Math.sin(dLong / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function calculateLoyaltyPoints(order: Order): number {
    // Base points from order value
    let points = Math.floor(order.totalBill / 10);

    // Bonus points for large orders
    if (order.totalBill > 100) points += 50;
    if (order.totalBill > 200) points += 100;

    return points;
}

function calculateTier(historicalPoints: number): string {
    if (historicalPoints >= 5000) return "PLATINUM";
    if (historicalPoints >= 2000) return "GOLD";
    if (historicalPoints >= 500) return "SILVER";
    return "BRONZE";
}

function updateAnalytics(analytics: RestaurantAnalytics, startDate: any, endDate: any): void {
    const orders = orderManager.values().filter(order =>
        order.restaurantId === analytics.restaurantId &&
        order.createdAt >= Number(startDate) &&
        order.createdAt <= Number(endDate)
    );

    // Update daily orders
    orders.forEach(order => {
        const date = new Date(order.createdAt).toISOString().split('T')[0];
        const currentCount = analytics.metrics.dailyOrders.get(date) || 0;
        analytics.metrics.dailyOrders.set(date, currentCount + 1);
    });

    // Update average order value
    const totalOrderValue = orders.reduce((sum, order) => sum + order.totalBill, 0);
    analytics.metrics.averageOrderValue = totalOrderValue / orders.length || 0;

    // Update peak hours
    orders.forEach(order => {
        const hour = new Date(order.createdAt).getHours();
        const currentCount = analytics.metrics.peakHours.get(hour.toString()) || 0;
        analytics.metrics.peakHours.set(hour.toString(), currentCount + 1);
    });

}
