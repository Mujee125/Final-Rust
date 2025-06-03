
export interface UserSettings {
  id?: number;
  username: string;
  email: string;
  password?: string;
  image?: string | null;
  status?: number;
  person_id?: number;
  first_login?: boolean;
  created_at?: string;
  updated_at?: string;
}

// 1. Cart
export interface Cart {
  id: number;
  stock_id: number;
  invoice_id: number;
  qty: number;
  price: number;
  discount?: number;
}

// 2. Categories
export interface Category {
  id: number;
  name: string;
}

// 3. Invoices
export interface Invoice {
  id: number;
  invoice_no: string;
  reference: string;
  type: string;
  date: string;
  discount?: number;
  received: number;
  tax?: number;
  remarks?: string;
  person_id: number;
  user_id: number;
  created_at?: string;
  updated_at?: string;
}

// 4. Locations
export interface Location {
  id: number;
  name: string;
}

// 5. Persons
export interface Person {
  id: number;
  name: string;
  role: string;
  contact: string;
  account?: string;
  address: string;
  remarks?: string;
  created_at?: string;
  updated_at?: string;
}

// 6. Roles
export interface Role {
  id: number;
  name: string;
}

// 7. Shop
export interface Shop {
  id: number;
  name?: string;
  description?: string;
  contact?: string;
  email?: string;
  website?: string;
  address?: string;
  image?: Blob;
}

// 8. Stock
export interface Stock {
  id: number;
  name: string;
  code: string;
  type: string;
  category: string;
  unit: string;
  qty: number;
  min_qty: number;
  target_qty: number;
  sale_price: number;
  purchase_price: number;
  discount?: number;
  expiry: string;
  location: string;
  remarks?: string;
  created_at?: string;
  updated_at?: string;
}

// 9. Types
export interface TypeModel {
  id: number;
  name: string;
}

// 10. Units
export interface Unit {
  id: number;
  name: string;
}

// 11. Sessions
export interface Session {
  id: number;
  user_id: string;
  token: string;
  is_active?: boolean;
}

// 12. Users
export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  image?: Blob;
  status?: number;
  person_id?: number;
  first_login?: boolean;
  created_at?: string;
  updated_at?: string;
}



