import { mockProducts } from './mock-data'

export const mockOrders = [
  {
    id: '1',
    user_email: 'marco.rossi@email.it',
    total_amount: 67.30,
    status: 'pending',
    shipping_address: 'Via Roma 123, 84011 Amalfi (SA), Italia',
    created_at: '2024-08-09T10:30:00Z',
    updated_at: '2024-08-09T10:30:00Z',
    order_items: [
      {
        id: '1',
        order_id: '1',
        product_id: '1',
        quantity: 2,
        price: 24.90,
        created_at: '2024-08-09T10:30:00Z',
        products: mockProducts.find(p => p.id === '1')
      },
      {
        id: '2',
        order_id: '1',
        product_id: '2',
        quantity: 1,
        price: 18.50,
        created_at: '2024-08-09T10:30:00Z',
        products: mockProducts.find(p => p.id === '2')
      }
    ]
  },
  {
    id: '2',
    user_email: 'giulia.verdi@gmail.com',
    total_amount: 28.90,
    status: 'processing',
    shipping_address: 'Corso Umberto I 45, 80073 Capri (NA), Italia',
    created_at: '2024-08-09T09:15:00Z',
    updated_at: '2024-08-09T11:00:00Z',
    order_items: [
      {
        id: '3',
        order_id: '2',
        product_id: '3',
        quantity: 1,
        price: 28.90,
        created_at: '2024-08-09T09:15:00Z',
        products: mockProducts.find(p => p.id === '3')
      }
    ]
  },
  {
    id: '3',
    user_email: 'antonio.bianchi@outlook.it',
    total_amount: 77.50,
    status: 'shipped',
    shipping_address: 'Piazza del Duomo 7, 84010 Ravello (SA), Italia',
    created_at: '2024-08-08T14:20:00Z',
    updated_at: '2024-08-09T08:30:00Z',
    order_items: [
      {
        id: '4',
        order_id: '3',
        product_id: '4',
        quantity: 1,
        price: 45.00,
        created_at: '2024-08-08T14:20:00Z',
        products: mockProducts.find(p => p.id === '4')
      },
      {
        id: '5',
        order_id: '3',
        product_id: '6',
        quantity: 1,
        price: 32.50,
        created_at: '2024-08-08T14:20:00Z',
        products: mockProducts.find(p => p.id === '6')
      }
    ]
  },
  {
    id: '4',
    user_email: 'francesca.ferrari@libero.it',
    total_amount: 12.90,
    status: 'delivered',
    shipping_address: 'Via Chiaia 88, 80132 Napoli (NA), Italia',
    created_at: '2024-08-07T16:45:00Z',
    updated_at: '2024-08-08T10:15:00Z',
    order_items: [
      {
        id: '6',
        order_id: '4',
        product_id: '5',
        quantity: 1,
        price: 12.90,
        created_at: '2024-08-07T16:45:00Z',
        products: mockProducts.find(p => p.id === '5')
      }
    ]
  },
  {
    id: '5',
    user_email: 'luca.marino@yahoo.it',
    total_amount: 91.80,
    status: 'pending',
    shipping_address: 'Via dei Mille 234, 80121 Napoli (NA), Italia',
    created_at: '2024-08-09T12:00:00Z',
    updated_at: '2024-08-09T12:00:00Z',
    order_items: [
      {
        id: '7',
        order_id: '5',
        product_id: '1',
        quantity: 1,
        price: 24.90,
        created_at: '2024-08-09T12:00:00Z',
        products: mockProducts.find(p => p.id === '1')
      },
      {
        id: '8',
        order_id: '5',
        product_id: '3',
        quantity: 1,
        price: 28.90,
        created_at: '2024-08-09T12:00:00Z',
        products: mockProducts.find(p => p.id === '3')
      },
      {
        id: '9',
        order_id: '5',
        product_id: '2',
        quantity: 2,
        price: 18.50,
        created_at: '2024-08-09T12:00:00Z',
        products: mockProducts.find(p => p.id === '2')
      }
    ]
  },
  {
    id: '6',
    user_email: 'sara.ricci@tiscali.it',
    total_amount: 32.50,
    status: 'cancelled',
    shipping_address: 'Via Toledo 156, 80134 Napoli (NA), Italia',
    created_at: '2024-08-06T11:30:00Z',
    updated_at: '2024-08-07T09:00:00Z',
    order_items: [
      {
        id: '10',
        order_id: '6',
        product_id: '6',
        quantity: 1,
        price: 32.50,
        created_at: '2024-08-06T11:30:00Z',
        products: mockProducts.find(p => p.id === '6')
      }
    ]
  }
]