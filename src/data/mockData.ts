import { Product, Query } from '../types';

// Mock orders data
export interface MockOrder {
  id: string;
  orderNumber: string;
  totalAmount: number;
  totalQuantity: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  buyer: {
    id: string;
    name: string;
    email: string;
    role: string;
    companyName?: string;
  };
  items: Array<{
    id: string;
    quantity: number;
    pricePerKg: number;
    totalPrice: number;
    product: {
      id: string;
      name: string;
      grade: string;
      sellerId: string;
    };
  }>;
}

export const mockOrders: MockOrder[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    totalAmount: 85000,
    totalQuantity: 100,
    status: 'DELIVERED',
    paymentStatus: 'PAID',
    createdAt: '2024-01-15T10:30:00Z',
    buyer: {
      id: '1',
      name: 'Admin User',
      email: 'admin@staplewise.com',
      role: 'ADMIN',
      companyName: 'StapleWise Admin'
    },
    items: [
      {
        id: '1',
        quantity: 100,
        pricePerKg: 850,
        totalPrice: 85000,
        product: {
          id: '1',
          name: 'W320 Cashew Kernels',
          grade: 'W320',
          sellerId: '4'
        }
      }
    ]
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    totalAmount: 47500,
    totalQuantity: 50,
    status: 'SHIPPED',
    paymentStatus: 'PAID',
    createdAt: '2024-01-20T14:15:00Z',
    buyer: {
      id: '1',
      name: 'Admin User',
      email: 'admin@staplewise.com',
      role: 'ADMIN',
      companyName: 'StapleWise Admin'
    },
    items: [
      {
        id: '2',
        quantity: 50,
        pricePerKg: 950,
        totalPrice: 47500,
        product: {
          id: '2',
          name: 'W180 Cashew Kernels',
          grade: 'W180',
          sellerId: '4'
        }
      }
    ]
  }
];

// Mock users data
export const mockUsersData = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@staplewise.com',
    phone: '+91 98765 43210',
    role: 'ADMIN',
    companyName: 'StapleWise Admin',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Sales Manager',
    email: 'sales@staplewise.com',
    phone: '+91 98765 43211',
    role: 'SALES',
    companyName: 'StapleWise Sales',
    isActive: true,
    createdAt: '2024-01-02T00:00:00Z'
  },
  {
    id: '3',
    name: 'John Buyer',
    email: 'buyer@example.com',
    phone: '+91 98765 43212',
    role: 'BUYER',
    companyName: 'ABC Trading Co.',
    isActive: true,
    createdAt: '2024-01-03T00:00:00Z'
  },
  {
    id: '4',
    name: 'Jane Seller',
    email: 'seller@example.com',
    phone: '+91 98765 43213',
    role: 'SELLER',
    companyName: 'XYZ Exports',
    gst: '29ABCDE1234F1Z5',
    isActive: true,
    createdAt: '2024-01-04T00:00:00Z'
  }
];

// Complete list of cashew grades
export const cashewGrades = [
  'A180', 'W210', 'W240', 'W320', 'W400',
  'A210(W210)', 'A240(W240)', 'A320(W320)', 'A400(W400)',
  'JK0', 'K00', 'LWP', 'S00 (JH)', 'SK0',
  'SSW(WW320)', 'SSW1(W300)', 'SWP',
  'BB0', 'BB1', 'BB2',
  'DP0', 'DP1', 'DP2',
  'DS0', 'DW0', 'DW1', 'DW2', 'DW (S)',
  'FW0', 'FW1', 'FW2', 'HDW', 'JH0',
  'KW0', 'KW1', 'KW2',
  'OP0', 'OW0', 'OW1', 'OW2',
  'PKP', 'PKS', 'RW1', 'RW2', 'SDP',
  'SK1', 'SS0', 'SSP', 'SSP1', 'SSP2',
  'SW240', 'SWP1', 'SWP2'
];

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'W320 Cashew Kernels',
    grade: 'W320',
    pricePerKg: 85,
   category: 'CASHEWS',
   sellerId: '4',
   stock: 500,
   minimumOrderQuantity: 100,
    location: 'Mangalore',
    image: 'https://images.pexels.com/photos/4198019/pexels-photo-4198019.jpeg?auto=compress&cs=tinysrgb&w=400',
    specifications: 'Premium quality W320 grade cashew kernels, 100% natural, 320 pieces per pound',
    deliveryTime: '3-5 business days'
  },
  {
    id: '2',
    name: 'W180 Cashew Kernels',
    grade: 'W180',
    pricePerKg: 95,
   category: 'CASHEWS',
   sellerId: '4',
   stock: 300,
   minimumOrderQuantity: 50,
    location: 'Panruti',
    image: 'https://images.pexels.com/photos/1630588/pexels-photo-1630588.jpeg?auto=compress&cs=tinysrgb&w=400',
    specifications: 'Premium quality W180 grade cashew kernels, 180 pieces per pound',
    deliveryTime: '2-4 business days'
  },
  {
    id: '3',
    name: 'LWP Cashew Kernels',
    grade: 'LWP',
    pricePerKg: 75,
   category: 'CASHEWS',
   sellerId: '5',
   stock: 800,
   minimumOrderQuantity: 200,
    location: 'Mumbai',
    image: 'https://images.pexels.com/photos/4110256/pexels-photo-4110256.jpeg?auto=compress&cs=tinysrgb&w=400',
    specifications: 'Large White Pieces - Broken cashew kernels, excellent for processing',
    deliveryTime: '1-3 business days'
  },
  {
    id: '4',
    name: 'SWP Cashew Kernels',
    grade: 'SWP',
    pricePerKg: 70,
   category: 'CASHEWS',
   sellerId: '5',
   stock: 600,
   minimumOrderQuantity: 150,
    location: 'Kollam',
    image: 'https://images.pexels.com/photos/4198020/pexels-photo-4198020.jpeg?auto=compress&cs=tinysrgb&w=400',
    specifications: 'Small White Pieces - Broken cashew kernels, ideal for bakery use',
    deliveryTime: '2-4 business days'
  },
  {
    id: '5',
    name: 'W240 Cashew Kernels',
    grade: 'W240',
    pricePerKg: 88,
   category: 'CASHEWS',
   sellerId: '6',
   stock: 400,
   minimumOrderQuantity: 75,
    location: 'Goa',
    image: 'https://images.pexels.com/photos/4110257/pexels-photo-4110257.jpeg?auto=compress&cs=tinysrgb&w=400',
    specifications: 'Premium quality W240 grade cashew kernels, 240 pieces per pound',
    deliveryTime: '3-5 business days'
  },
  {
    id: '6',
    name: 'A180 Cashew Kernels',
    grade: 'A180',
    pricePerKg: 98,
   category: 'CASHEWS',
   sellerId: '6',
   stock: 250,
   minimumOrderQuantity: 50,
    location: 'Kochi',
    image: 'https://images.pexels.com/photos/4198021/pexels-photo-4198021.jpeg?auto=compress&cs=tinysrgb&w=400',
    specifications: 'Super premium A180 grade cashew kernels, largest size available',
    deliveryTime: '2-3 business days'
  },
  {
    id: '7',
    name: 'BB0 Cashew Kernels',
    grade: 'BB0',
    pricePerKg: 65,
   category: 'CASHEWS',
   sellerId: '7',
   stock: 900,
   minimumOrderQuantity: 300,
    location: 'Vizag',
    image: 'https://images.pexels.com/photos/4110258/pexels-photo-4110258.jpeg?auto=compress&cs=tinysrgb&w=400',
    specifications: 'Baby Bits - Small broken pieces, perfect for confectionery',
    deliveryTime: '4-6 business days'
  },
  {
    id: '8',
    name: 'JH0 Cashew Kernels',
    grade: 'JH0',
    pricePerKg: 72,
   category: 'CASHEWS',
   sellerId: '7',
   stock: 700,
   minimumOrderQuantity: 250,
    location: 'Cuddalore',
    image: 'https://images.pexels.com/photos/4198022/pexels-photo-4198022.jpeg?auto=compress&cs=tinysrgb&w=400',
    specifications: 'JH Grade - High quality broken kernels for industrial use',
    deliveryTime: '3-4 business days'
  },
  {
    id: '9',
    name: 'W400 Cashew Kernels',
    grade: 'W400',
    pricePerKg: 78,
   category: 'CASHEWS',
   sellerId: '8',
   stock: 350,
   minimumOrderQuantity: 100,
    location: 'Pondicherry',
    image: 'https://images.pexels.com/photos/4110259/pexels-photo-4110259.jpeg?auto=compress&cs=tinysrgb&w=400',
    specifications: 'W400 grade cashew kernels, 400 pieces per pound',
    deliveryTime: '2-4 business days'
  },
  {
    id: '10',
    name: 'SSW Cashew Kernels',
    grade: 'SSW(WW320)',
    pricePerKg: 82,
   category: 'CASHEWS',
   sellerId: '8',
   stock: 450,
   minimumOrderQuantity: 125,
    location: 'Mangalore',
    image: 'https://images.pexels.com/photos/4198023/pexels-photo-4198023.jpeg?auto=compress&cs=tinysrgb&w=400',
    specifications: 'Scorched Slightly Wholes - Premium quality with slight scorching',
    deliveryTime: '3-5 business days'
  }
];

// Additional sellers for product mapping
export const additionalSellers = [
  { id: '5', name: 'Mumbai Cashew Co', companyName: 'Mumbai Cashew Co', email: 'info@mumbaicashew.com', phone: '+91 98765 43215', city: 'Mumbai' },
  { id: '6', name: 'Goa Premium Nuts', companyName: 'Goa Premium Nuts', email: 'sales@goapremium.com', phone: '+91 98765 43216', city: 'Goa' },
  { id: '7', name: 'Vizag Exports Ltd', companyName: 'Vizag Exports Ltd', email: 'export@vizagexports.com', phone: '+91 98765 43217', city: 'Vizag' },
  { id: '8', name: 'South Coast Traders', companyName: 'South Coast Traders', email: 'trade@southcoast.com', phone: '+91 98765 43218', city: 'Pondicherry' }
];

export const mockQueries: Query[] = [
  {
    id: '1',
    type: 'buy',
    productId: '1',
    quantity: 10,
    companyName: 'ABC Foods Ltd',
    pincode: '560001',
    email: 'buyer@abcfoods.com',
    phone: '+919876543210',
    status: 'assigned',
    assignedTo: 'sales@staplewise.com',
    assignedToId: '1',
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    type: 'sell',
    productId: '2',
    quantity: 25,
    companyName: 'XYZ Cashews',
    pincode: '641001',
    email: 'seller@xyzcashews.com',
    phone: '+919876543211',
    gst: 'GST123456789',
    status: 'completed',
    assignedTo: 'sales@staplewise.com',
    assignedToId: '1',
    createdAt: new Date('2024-01-14')
  },
  {
    id: '3',
    type: 'buy',
    productId: '3',
    quantity: 50,
    companyName: 'DEF Trading Co',
    pincode: '400001',
    email: 'procurement@deftrading.com',
    phone: '+919876543212',
    status: 'rejected',
    assignedTo: 'sales@staplewise.com',
    assignedToId: '1',
    createdAt: new Date('2024-01-20')
  },
  {
    id: '4',
    type: 'sell',
    productId: '4',
    quantity: 75,
    companyName: 'GHI Exports',
    pincode: '600001',
    email: 'sales@ghiexports.com',
    phone: '+919876543213',
    gst: 'GST987654321',
    status: 'assigned',
    assignedTo: 'sales@staplewise.com',
    assignedToId: '1',
    createdAt: new Date('2024-01-18')
  },
  {
    id: '5',
    type: 'buy',
    productId: '5',
    quantity: 30,
    companyName: 'JKL Industries',
    pincode: '110001',
    email: 'purchase@jklindustries.com',
    phone: '+919876543214',
    status: 'pending',
    assignedTo: 'sales@staplewise.com',
    assignedToId: '1',
    createdAt: new Date('2024-01-22')
  }
];