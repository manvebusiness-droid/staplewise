import { mockProducts, mockQueries, mockOrders, mockUsersData } from '../data/mockData';
import { Product, Query, Order, User } from '../types';

// Mock API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class AdminService {
  static async getDashboardStats() {
    await delay(500);
    return {
      stats: {
        totalVisitors: 12345,
        totalProducts: mockProducts.length,
        totalQueries: mockQueries.length,
        totalUsers: mockUsersData.length
      },
      recentActivity: {
        queries: mockQueries.slice(0, 5),
        orders: mockOrders.slice(0, 5)
      }
    };
  }

  static async getQueries() {
    await delay(300);
    return mockQueries;
  }

  static async getOrders() {
    await delay(300);
    return mockOrders;
  }

  static async getUsers() {
    await delay(300);
    return mockUsersData;
  }

  static async getSellers() {
    await delay(300);
    return mockUsersData.filter(user => user.role === 'SELLER');
  }

  static async assignQuery(queryId: string, assignedToId: string) {
    await delay(200);
    return {
      query: {
        id: queryId,
        status: 'ASSIGNED',
        assignedToId: assignedToId
      }
    };
  }

  static async deleteQuery(queryId: string) {
    await delay(200);
    return { success: true };
  }

  static async updateQueryStatus(queryId: string, status: string) {
    await delay(200);
    return {
      query: {
        id: queryId,
        status: status
      }
    };
  }

  static async deleteUser(userId: string) {
    await delay(200);
    return { success: true };
  }

  static async createSalesEmployee(employeeData: any) {
    await delay(300);
    return {
      user: {
        id: Date.now().toString(),
        name: employeeData.name,
        email: employeeData.email,
        phone: employeeData.phone,
        companyName: employeeData.companyName,
        role: 'SALES'
      }
    };
  }

  static async createOrder(orderData: any) {
    await delay(300);
    const newOrder = {
      id: Date.now().toString(),
      orderNumber: `ORD-${Date.now()}`,
      sellerId: orderData.sellerId,
      sellerName: orderData.sellerName,
      sellerEmail: orderData.sellerEmail,
      sellerPhone: orderData.sellerPhone,
      orderName: `${orderData.productName} - ${orderData.grade}`,
      productName: orderData.productName,
      category: orderData.category,
      grade: orderData.grade,
      quantity: orderData.quantity,
      totalQuantity: orderData.quantity,
      pricePerKg: orderData.pricePerKg,
      totalAmount: orderData.quantity * orderData.pricePerKg,
      deliveryAddress: orderData.deliveryAddress,
      notes: orderData.notes,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      createdAt: new Date().toISOString(),
      items: [{
        id: '1',
        quantity: orderData.quantity,
        pricePerKg: orderData.pricePerKg,
        totalPrice: orderData.quantity * orderData.pricePerKg,
        product: {
          id: '1',
          name: orderData.productName,
          category: orderData.category,
          grade: orderData.grade
        }
      }]
    };
    return newOrder;
  }
}

export class ApiClient {
  static async updateOrder(orderId: string, orderData: any) {
    await delay(200);
    return {
      id: orderId,
      ...orderData,
      totalAmount: orderData.quantity * orderData.pricePerKg,
      updatedAt: new Date().toISOString()
    };
  }

  static async deleteOrder(orderId: string) {
    await delay(200);
    return { success: true };
  }
}