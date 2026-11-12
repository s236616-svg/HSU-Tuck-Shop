export type Role = 'student' | 'staff' | 'admin'

export type DemoUser = {
  id: string
  fullName: string
  username: string
  email: string
  password: string
  roles: Role[]
  roleNote: string
  programme: string
  yearOfEntrance: number
  studentId: string
  phone: string
  walletBalance: number
  loyaltyStamps: number
  avatarUrl: string | null
  createdAt: string
  lastLoginAt: string | null
}

export type DemoOrder = {
  id: string
  status: 'PAID' | 'PREPARING' | 'READY' | 'COLLECTED' | 'CANCELLED'
  slot: string
  studentId: string
  total: number
  itemIds: number[]
  payment: string
  code: string
}

export type DemoSlot = {
  id: string
  time: string
  location: string
  booked: number
  capacity: number
  enabled: boolean
}

export type DemoNotification = {
  id: string
  kind: 'order' | 'stock' | 'loyalty'
  en: string
  zh: string
  read: boolean
}

export const demoUser: DemoUser = {
  id: 'u_1',
  fullName: 'Chan Tai Ming Kevin',
  username: 'KC823',
  email: 's123456@hsu.edu.hk',
  password: 'Tuck1234',
  roles: ['student', 'staff', 'admin'],
  roleNote: 'Student Union member · granted tuck shop admin authority',
  programme: 'BA-AC',
  yearOfEntrance: 2023,
  studentId: 's123456',
  phone: '',
  walletBalance: 99999,
  loyaltyStamps: 7,
  avatarUrl: null,
  createdAt: '2023-09-01T00:00:00Z',
  lastLoginAt: null,
}

export const initialOrders: DemoOrder[] = [
  { id: '#4821', status: 'READY', slot: '12:30–13:00', studentId: 's123456', total: 46, itemIds: [1, 2], payment: 'HSU Wallet', code: '7249' },
  { id: '#4824', status: 'PREPARING', slot: '10:30–11:00', studentId: 's123458', total: 68, itemIds: [109], payment: 'Octopus', code: '3812' },
  { id: '#4826', status: 'PAID', slot: '10:30–11:00', studentId: 's123456', total: 30, itemIds: [1, 2], payment: 'PayMe', code: '6420' },
  { id: '#4766', status: 'COLLECTED', slot: '15:00–15:30', studentId: 's123456', total: 31, itemIds: [3, 4], payment: 'Octopus', code: '9014' },
  { id: '#4592', status: 'CANCELLED', slot: '11:00–11:30', studentId: 's123456', total: 68, itemIds: [106], payment: 'Visa', code: '1188' },
  { id: '#4829', status: 'PAID', slot: '11:00–11:30', studentId: 's123462', total: 22, itemIds: [7, 18], payment: 'AlipayHK', code: '5630' },
  { id: '#4832', status: 'PREPARING', slot: '15:00–15:30', studentId: 's123471', total: 39, itemIds: [28, 44], payment: 'WeChat Pay HK', code: '4471' },
  { id: '#4835', status: 'READY', slot: '15:30–16:00', studentId: 's123489', total: 16, itemIds: [54], payment: 'Cash at counter', code: '2864' },
]

export const initialSlots: DemoSlot[] = [
  { id: 's1', time: '10:30–11:00', location: 'Lee Quo Wei Academic Building, G/F', booked: 5, capacity: 8, enabled: true },
  { id: 's2', time: '11:00–11:30', location: 'Lee Quo Wei Academic Building, G/F', booked: 4, capacity: 8, enabled: true },
  { id: 's3', time: '12:30–13:00', location: 'Lee Quo Wei Academic Building, G/F', booked: 6, capacity: 8, enabled: true },
  { id: 's4', time: '13:00–13:30', location: 'Lee Quo Wei Academic Building, G/F', booked: 8, capacity: 8, enabled: true },
  { id: 's5', time: '15:00–15:30', location: 'S H Ho Academic Building, G/F', booked: 2, capacity: 8, enabled: true },
  { id: 's6', time: '15:30–16:00', location: 'S H Ho Academic Building, G/F', booked: 1, capacity: 8, enabled: true },
]

export const initialNotifications: DemoNotification[] = [
  { id: 'n1', kind: 'order', en: 'Order #4821 is ready for pickup', zh: '訂單 #4821 已可取貨', read: false },
  { id: 'n2', kind: 'stock', en: 'HSUHK LED Display Stand is back in stock', zh: '恒生大學 LED 展示燈已補貨', read: false },
  { id: 'n3', kind: 'loyalty', en: 'You earned a new TS Stamp', zh: '你已獲得一個新的 TS 印花', read: false },
  { id: 'n4', kind: 'order', en: 'Order #4835 is packed and waiting for collection', zh: '訂單 #4835 已包裝好並等候領取', read: false },
  { id: 'n5', kind: 'stock', en: 'Oreo Ice Cream Stick is available again', zh: 'Oreo 雪糕條現已重新有貨', read: false },
  { id: 'n6', kind: 'loyalty', en: 'Only 3 more TS Stamps until your free drink', zh: '再儲 3 個 TS 印花即可換免費飲品', read: false },
]

export function readStore<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) as T : fallback
  } catch {
    return fallback
  }
}

export function writeStore<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function ensureDemoSeed() {
  if (localStorage.getItem('hsu-demo') !== 'true') {
    localStorage.setItem('hsu-demo', 'true')
    writeStore('hsu-users', [demoUser])
    writeStore('hsu-orders', initialOrders)
    writeStore('hsu-slots', initialSlots)
    writeStore('hsu-notifications', initialNotifications)
    writeStore('hsu-favs', [])
    localStorage.setItem('hsu-view', 'student')
  }
  return readStore<DemoUser[]>('hsu-users', [demoUser])
}

export function currentUser(): DemoUser {
  const users = readStore<DemoUser[]>('hsu-users', [demoUser])
  return users.find(user => user.id === localStorage.getItem('hsu-session')) || users[0] || demoUser
}

export function updateStoredUser(next: DemoUser) {
  const users = readStore<DemoUser[]>('hsu-users', [demoUser])
  writeStore('hsu-users', users.map(user => user.id === next.id ? next : user))
}
