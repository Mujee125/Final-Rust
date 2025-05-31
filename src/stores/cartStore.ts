// import { create } from "zustand";
// import  Database  from "@tauri-apps/plugin-sql";


// interface Product {
//   id: number;
//   code: string;
//   name: string;
//   category: string;
//   unit: string;
//   qty: number;
//   price: number;
//   sale_price: number;
//   purchase_price: number;
//   location: string;
//   min_qty?: number;
//   expiry?: string;
//   is_dangerous?: boolean;
//   discount?: number;
//   total?: number;
// }

// interface Person {
//   id: number;
//   name: string;
//   contact: string;
//   role: string;
//   address: string;
//   remarks: string;
// }

// interface Invoice {
//   id?: number;
//   invoice_no: string;
//   reference: string;
//   type: "Sale" | "Purchase";
//   date: string;
//   discount: number;
//   tax: number;
//   received: number;
//   remarks: string;
//   person_id: number;
//   user_id: number;
// }

// interface RecentInvoice {
//   id: number;
//   invoice_no: string;
//   type: string;
//   date: string;
//   person: string;
//   total: number;
// }

// interface Shop {
//   id: number;
//   name: string;
//   description: string;
//   address: string;
//   contact: string;
// }

// interface CartState {
//   // State variables
//   isBarcodeMode: boolean;
//   searchItemQuery: string;
//   searchPersonQuery: string;
//   itemSuggestions: Product[];
//   personSuggestions: Person[];
//   prev_id: number;
//   invoiceId: number;
//   items: Product[];
//   persons: Person[];
//   shop: Shop;
//   invoice: Invoice;
//   person: Person;
//   cartItems: Product[];
//   recentInvoices: RecentInvoice[];
//   username: string;

//   total: number;
//   discountRS: number;
//   taxRS: number;
//   net: number;
//   balance: number;
//   // Methods
//   getDb: () => Promise<Database>;
//   getProductClass: (product: Product) => string;
//   isDangerous: (product: Product) => boolean;
//   fetchItems: () => Promise<void>;
//   fetchRecentInvoices: () => Promise<void>;
//   fetchPersons: () => Promise<void>;
//   changeInvoiceType: () => void;
//   fetchCartItems: () => Promise<void>;
//   searchItems: () => void;
//   barcodeChange: (barcode: string) => Promise<void>;
//   searchPersons: () => void;
//   addProductToCart: (product: Product) => Promise<void>;
//   saveCartItem: (product: Product) => Promise<void>;
//   deleteCartItem: (product: Product) => Promise<void>;
//   checkOut: () => Promise<void>;
//   resetCart: () => void;

//   updateCartQuantity: (value: number, product: Product) => Promise<void>;
//   updateCartProductQuantity: (
//     product: Product,
//     newQty: number,
//     invoiceType: "Sale" | "Purchase"
//   ) => Promise<void>;
//   fillPersonData: (person: Person) => void;
//   saveInvoice: () => Promise<void>;
//   printAndCheckout: () => void;
//   setInvoice: (invoice: Invoice) => void;
//   query: () => Promise<void>;
//   initializeData: (id?: number) => Promise<void>;
//   setSearchItemQuery: (query: string) => void;
//   setSearchPersonQuery: (query: string) => void;
//   setIsBarcodeMode: (mode: boolean) => void;
//   updateCalculations: () => void;

// }

// const getDb = async () => {
//   return await Database.load("sqlite:learn_pos.db");
// };
// const generateInvoiceNumber = (type: "Sale" | "Purchase", prevId: number) => {
//   const prefix = type === "Sale" ? "S" : "P";
//   return `${prefix}${prevId + 1}`;
// };

// export const useCartStore = create<CartState>((set, get) => ({
//   // Initial state
//   isBarcodeMode: false,
//   searchItemQuery: "",
//   searchPersonQuery: "",
//   itemSuggestions: [],
//   personSuggestions: [],
//   prev_id: 1,
//   invoiceId: -1,
//   items: [],
//   persons: [],
//   shop: {
//     id: 0,
//     name: "",
//     description: "",
//     address: "",
//     contact: "",
//   },
//   invoice: {
//     invoice_no: "",
//     reference: "",
//     type: "Sale",
//     date: new Date().toISOString().split("T")[0],
//     discount: 0,
//     tax: 0,
//     received: 0,
//     remarks: "",
//     person_id: -1,
//     user_id: 1,
//   },
//   person: {
//     id: -1,
//     name: "",
//     contact: "",
//     role: "",
//     address: "",
//     remarks: "",
//   },
//   cartItems: [],
//   recentInvoices: [],
//   username: "Admin",

//   total: 0,
//   discountRS: 0,
//   taxRS: 0,
//   net: 0,
//   balance: 0,
//   // Database connection helper
//   getDb,
//   setSearchItemQuery: (query) => set({ searchItemQuery: query }),
//   setSearchPersonQuery: (query) => set({ searchPersonQuery: query }),
//   setIsBarcodeMode: (mode) => set({ isBarcodeMode: mode }),

//   // Add a new method to update all calculations

//   // Product classification
//   getProductClass: (product) => {
//     const now = new Date();
//     const expiryDate = new Date(product.expiry || "");
//     const isExpired = expiryDate < now;
//     const isLowStock = product.qty <= (product.min_qty || 0);
//     const isDanger = get().isDangerous(product);

//     if (isExpired) return "bg-red-200";
//     if (isDanger) return "bg-yellow-200";
//     if (isLowStock) return "bg-blue-200";
//     return "";
//   },

//   isDangerous: (product) => {
//     const dangerousItems = ["Detail", "Explosive Item", "Chemical X"];
//     return false && dangerousItems.includes(product.name);
//   },
//   updateCalculations: () => {
//     const { cartItems, invoice } = get();

//     // Calculate total
//     const total = cartItems.reduce(
//       (sum, item) => sum + item.price * item.qty,
//       0
//     );

//     // Calculate discount
//     const discountRS = (total * invoice.discount) / 100;

//     // Calculate tax
//     const taxRS = ((total - discountRS) * invoice.tax) / 100;

//     // Calculate net
//     const net = total - discountRS + taxRS;

//     // Calculate balance
//     const balance = net - invoice.received;

//     return { total, discountRS, taxRS, net, balance };
//   },

//   // Data fetching methods
//   fetchItems: async () => {
//     const db = await get().getDb();
//     const items = await db.select<Product[]>("SELECT * FROM stock");
//     set({ items });
//   },

//   fetchRecentInvoices: async () => {
//     const db = await get().getDb();
//     const recentInvoices = await db.select<RecentInvoice[]>(`
//       SELECT
//         i.id,
//         i.invoice_no,
//         i.type,
//         i.date,
//         p.name as person,
//         SUM(c.qty * c.price) as total
//       FROM invoices i
//       LEFT JOIN persons p ON i.person_id = p.id
//       LEFT JOIN cart c ON i.id = c.invoice_id
//       GROUP BY i.id
//       ORDER BY i.date DESC
//     `);
//     set({ recentInvoices });
//   },

//   fetchPersons: async () => {
//     const db = await get().getDb();
//     const persons = await db.select<Person[]>("SELECT * FROM persons");
//     set({ persons });
//   },

//   changeInvoiceType: () => {
//     const { cartItems, invoice, prev_id } = get();
//     if (cartItems.length === 0) {
//       const newType = invoice.type === "Sale" ? "Purchase" : "Sale";
//       //   const newInvoiceNo = (newType === "Sale" ? "S" : "P") + (prev_id + 1);

//       const newInvoiceNo = generateInvoiceNumber(newType, prev_id);
//       set({
//         invoice: {
//           ...invoice,
//           type: newType,
//           invoice_no: newInvoiceNo,
//           discount: 0,
//           tax: 0,
//           received: 0,
//         },
//         cartItems: [],
//       });
//     }
//   },

//   fetchCartItems: async () => {
//     const { invoiceId } = get();
//     if (invoiceId === -1) return;

//     const db = await get().getDb();
//     const cartItems = await db.select<Product[]>(
//       `
//       SELECT
//         c.id,
//         c.qty,
//         c.price,
//         s.code,
//         s.name,
//         s.category,
//         s.unit,
//         s.location,
//         s.sale_price,
//         s.purchase_price,
//         (c.qty * c.price) as total
//       FROM cart c
//       JOIN stock s ON c.stock_id = s.id
//       WHERE c.invoice_id = $1
//     `,
//       [invoiceId]
//     );
//     set({ cartItems });
//     get().updateCalculations();
//   },

//   searchItems: () => {
//     const { items, searchItemQuery } = get();
//     if (!searchItemQuery) {
//       set({ itemSuggestions: [] });
//       return;
//     }

//     const query = searchItemQuery.toLowerCase();
//     const suggestions = items.filter(
//       (item) =>
//         item.name.toLowerCase().includes(query) ||
//         item.code.toLowerCase().includes(query)
//     );
//     set({ itemSuggestions: suggestions });
//   },

//   barcodeChange: async (barcode: string) => {
//     const { items } = get();
//     const item = items.find((i) => i.code === barcode);
//     if (item) {
//       await get().addProductToCart(item);
//       set({ searchItemQuery: "" });
//     }
//   },

//   searchPersons: () => {
//     const { persons, searchPersonQuery } = get();
//     if (!searchPersonQuery) {
//       set({ personSuggestions: [] });
//       return;
//     }

//     const query = searchPersonQuery.toLowerCase();
//     const suggestions = persons.filter((person) =>
//       Object.values(person).some((value) =>
//         String(value).toLowerCase().includes(query)
//       )
//     );
//     set({ personSuggestions: suggestions });
//   },

//   addProductToCart: async (product: Product) => {
//     const { person, invoiceId, invoice, prev_id } = get();
//     if (person.id === -1) {
//       alert("Person not selected.");
//       return;
//     }

//     if (invoiceId === -1) {
//       const newInvoiceNo = generateInvoiceNumber(invoice.type, prev_id);
//       set({
//         invoice: {
//           ...invoice,
//           invoice_no: newInvoiceNo,
//         },
//       });
//       await get().saveInvoice();
//     }

//     await get().saveCartItem(product);
//     set({ searchItemQuery: "", itemSuggestions: [] });
//     await get().fetchItems();
//     await get().fetchCartItems();
//   },

//   saveCartItem: async (product: Product) => {
//     const { cartItems, invoiceId, invoice } = get();
//     const db = await get().getDb();

//     // Start transaction
//     await db.execute("BEGIN");

//     try {
//       // Check if product already in cart
//       const existingItem = cartItems.find((item) => item.id === product.id);

//       if (existingItem) {
//         // Update existing cart item
//         await db.execute("UPDATE cart SET qty = qty + 1 WHERE id = $1", [
//           existingItem.id,
//         ]);

//         // Update stock based on invoice type
//         if (invoice.type === "Sale") {
//           await db.execute("UPDATE stock SET qty = qty - 1 WHERE id = $1", [
//             product.id,
//           ]);
//         } else if (invoice.type === "Purchase") {
//           await db.execute("UPDATE stock SET qty = qty + 1 WHERE id = $1", [
//             product.id,
//           ]);
//         }
//       } else {
//         // Insert new cart item
//         await db.execute(
//           "INSERT INTO cart (stock_id, invoice_id, qty, price, discount) VALUES ($1, $2, $3, $4, $5)",
//           [
//             product.id,
//             invoiceId,
//             1,
//             invoice.type === "Sale"
//               ? product.sale_price
//               : product.purchase_price,
//             product.discount || 0,
//           ]
//         );

//         // Update stock based on invoice type
//         if (invoice.type === "Sale") {
//           await db.execute("UPDATE stock SET qty = qty - 1 WHERE id = $1", [
//             product.id,
//           ]);
//         } else if (invoice.type === "Purchase") {
//           await db.execute("UPDATE stock SET qty = qty + 1 WHERE id = $1", [
//             product.id,
//           ]);
//         }
//       }

//       await db.execute("COMMIT");
//       await get().fetchCartItems();
//       await get().fetchItems();
//       get().updateCalculations();
//     } catch (error) {
//       await db.execute("ROLLBACK");
//       console.error("Failed to save cart item:", error);
//       throw error;
//     }
//   },

  
//   deleteCartItem: async (product: Product) => {
//     const db = await get().getDb();

//     // Start transaction
//     await db.execute("BEGIN");

//     try {
//       // 1. Get the stock_id, quantity, and invoice_id before deleting
//       const cartItem = await db.select<
//         {
//           stock_id: number;
//           qty: number;
//           invoice_id: number;
//         }[]
//       >("SELECT stock_id, qty, invoice_id FROM cart WHERE id = $1", [
//         product.id,
//       ]);

//       if (cartItem.length > 0) {
//         const { stock_id, qty, invoice_id } = cartItem[0];

//         // 2. Get the invoice type (in case it's different from current invoice)
//         const invoiceData = await db.select<{ type: "Sale" | "Purchase" }[]>(
//           "SELECT type FROM invoices WHERE id = $1",
//           [invoice_id]
//         );

//         if (invoiceData.length > 0) {
//           const invoiceType = invoiceData[0].type;

//           // 3. Update stock based on the actual invoice type
//           if (invoiceType === "Sale") {
//             // Restore stock (reverse sale transaction)
//             await db.execute("UPDATE stock SET qty = qty + $1 WHERE id = $2", [
//               qty,
//               stock_id,
//             ]);
//           } else if (invoiceType === "Purchase") {
//             // Reduce stock (reverse purchase transaction)
//             await db.execute("UPDATE stock SET qty = qty - $1 WHERE id = $2", [
//               qty,
//               stock_id,
//             ]);
//           }
//         }
//       }

//       // 4. Delete the cart item
//       await db.execute("DELETE FROM cart WHERE id = $1", [product.id]);

//       await db.execute("COMMIT");
//       await get().fetchCartItems(); // Refresh data
//       await get().fetchItems(); // Refresh stock data
//       get().updateCalculations();
//     } catch (error) {
//       await db.execute("ROLLBACK");
//       console.error("Transaction failed:", error);
//       throw error;
//     }
//   },

//   checkOut: async () => {
//     const { invoice, invoiceId, cartItems } = get();
//     if (invoiceId === -1 || cartItems.length === 0) return;

//     const db = await get().getDb();
//     await db.execute(
//       "UPDATE invoices SET discount = $1, tax = $2, received = $3, remarks = $4 WHERE id = $5",
//       [
//         invoice.discount,
//         invoice.tax,
//         invoice.received,
//         invoice.remarks,
//         invoiceId,
//       ]
//     );

//     // Update stock quantities
//     for (const item of cartItems) {
//       if (invoice.type === "Sale") {
//         await db.execute("UPDATE stock SET qty = qty - $1 WHERE id = $2", [
//           item.qty,
//           item.id,
//         ]);
//       } else {
//         await db.execute("UPDATE stock SET qty = qty + $1 WHERE id = $2", [
//           item.qty,
//           item.id,
//         ]);
//       }
//     }

//     get().resetCart();
//     await get().fetchItems();
//     get().fetchRecentInvoices();
//   },

//   resetCart: () => {
//     const { invoice, prev_id, persons } = get();
//     set({
//       prev_id: prev_id,
//       invoiceId: -1,
//       cartItems: [],
//       invoice: {
//         ...invoice,
//         invoice_no: "",
//         date: new Date().toISOString().split("T")[0],
//         discount: 0,
//         tax: 0,
//         received: 0,
//         remarks: "",
//         person_id: persons[0]?.id || -1,
//       },
//       person: persons[0] || {
//         id: -1,
//         name: "",
//         contact: "",
//         role: "",
//         address: "",
//         remarks: "",
//       },
//     });
//     get().fetchRecentInvoices();
//   },

//   updateCartQuantity: async (value: number, product: Product) => {
//     if (value > 0) {
//       const { invoice } = get();
//       try {
//         await get().updateCartProductQuantity(product, value, invoice.type);
//       } catch (error) {
//         console.error("Failed to update cart:", error);
//         // Optionally show error to user
//       }
//     }
//   },

//   updateCartProductQuantity: async (
//     product: Product,
//     newQty: number,
//     invoiceType: "Sale" | "Purchase"
//   ) => {
//     const db = await get().getDb();

//     // Start transaction
//     await db.execute("BEGIN");

//     try {
//       // 1. First get the current cart item details including stock_id
//       const cartItem = await db.select<{ stock_id: number; qty: number }[]>(
//         "SELECT stock_id, qty FROM cart WHERE id = $1",
//         [product.id]
//       );

//       if (cartItem.length === 0) {
//         throw new Error("Cart item not found");
//       }

//       const { stock_id, qty: oldQty } = cartItem[0];

//       // 2. Update the cart quantity
//       await db.execute("UPDATE cart SET qty = $1 WHERE id = $2", [
//         newQty,
//         product.id,
//       ]);

//       // 3. Update the stock based on invoice type
//       if (invoiceType === "Sale") {
//         // For sales: reverse old quantity and apply new quantity
//         await db.execute("UPDATE stock SET qty = qty + $1 - $2 WHERE id = $3", [
//           oldQty,
//           newQty,
//           stock_id,
//         ]);
//       } else if (invoiceType === "Purchase") {
//         // For purchases: reverse old quantity and apply new quantity
//         await db.execute("UPDATE stock SET qty = qty - $1 + $2 WHERE id = $3", [
//           oldQty,
//           newQty,
//           stock_id,
//         ]);
//       }

//       await db.execute("COMMIT");
//       await get().fetchCartItems();
//       get().updateCalculations();
//     } catch (error) {
//       await db.execute("ROLLBACK");
//       console.error("Transaction failed:", error);
//       throw error;
//     }
//   },
//   fillPersonData: (person: Person) => {
//     set({
//       person,
//       invoice: { ...get().invoice, person_id: person.id },
//       searchPersonQuery: "",
//       personSuggestions: [],
//     });
//   },

//   saveInvoice: async () => {
//     const { invoice, invoiceId } = get();
//     if (invoiceId !== -1) return;

//     const db = await get().getDb();
//     const { lastInsertId } = await db.execute(
//       `INSERT INTO invoices (
//         invoice_no, reference, type, date, discount, tax, received, remarks, person_id, user_id
//       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
//       [
//         invoice.invoice_no,
//         invoice.reference,
//         invoice.type,
//         invoice.date,
//         invoice.discount,
//         invoice.tax,
//         invoice.received,
//         invoice.remarks,
//         invoice.person_id,
//         invoice.user_id,
//       ]
//     );

//     set({
//       invoiceId: lastInsertId,
//       prev_id: lastInsertId,
//       invoice: {
//         ...invoice,
//         id: lastInsertId,
//       },
//     });
//   },

//   printAndCheckout: () => {
  
//     get().checkOut();
//   },

//   setInvoice: (invoice: Invoice) => {
//     set({
//       invoiceId: invoice.id || -1,
//       invoice: invoice,
//     });

//     get().fetchCartItems();
//     get().updateCalculations();
//     const { persons } = get();
//     const person = persons.find((p) => p.id === invoice.person_id);
//     if (person) {
//       set({ person });
//     }
//   },

//   query: async () => {
//     const db = await get().getDb();
//     const result = await db.select<{ latest_id: number }[]>(
//       "SELECT IFNULL(MAX(id), 0) AS latest_id FROM invoices"
//     );
//     set({ prev_id: result[0]?.latest_id || 0 });
//   },

//   initializeData: async (id?: number) => {
//     await get().query();
//     await get().fetchItems();
//     await get().fetchPersons();

//     const db = await get().getDb();
//     const shop = await db.select<Shop[]>("SELECT * FROM shop LIMIT 1");
//     if (shop.length > 0) {
//       set({ shop: shop[0] });
//     }

//     if (id) {
//       const db = await get().getDb();
//       const invoice = await db.select<Invoice[]>(
//         "SELECT * FROM invoices WHERE id = $1",
//         [id]
//       );
//       if (invoice.length > 0) {
//         await get().setInvoice(invoice[0]);
//       }
//     } else {
//       const { persons, prev_id } = get();
//       const newType = "Sale";
//       const newInvoiceNo = generateInvoiceNumber(newType, prev_id);
//       set({
//         person: persons[0] || {
//           id: -1,
//           name: "",
//           contact: "",
//           role: "",
//           address: "",
//           remarks: "",
//         },
//         invoice: {
//           //   ...get().invoice,
//           //   person_id: persons[0]?.id || -1,
//           invoice_no: newInvoiceNo,
//           reference: "",
//           type: newType,
//           date: new Date().toISOString().split("T")[0],
//           discount: 0,
//           tax: 0,
//           received: 0,
//           remarks: "",
//           person_id: persons[0]?.id || -1,
//           user_id: 1,
//         },
//       });
//     }

//     await get().fetchRecentInvoices();
//   },
// }));

import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";

interface Product {
  id: number;
  code: string;
  name: string;
  category: string;
  unit: string;
  qty: number;
  price: number;
  sale_price: number;
  purchase_price: number;
  location: string;
  min_qty?: number;
  expiry?: string;
  is_dangerous?: boolean;
  discount?: number;
  total?: number;
}

interface Person {
  id: number;
  name: string;
  contact: string;
  role: string;
  address: string;
  remarks: string;
}

interface Invoice {
  id?: number;
  invoice_no: string;
  reference: string;
  type: "Sale" | "Purchase";
  date: string;
  discount: number;
  tax: number;
  received: number;
  remarks: string;
  person_id: number;
  user_id: number;
}

interface RecentInvoice {
  id: number;
  invoice_no: string;
  invoice_type: string;
  date: string;
  person: string;
  total: number;
}

interface Shop {
  id: number;
  name: string;
  description: string;
  address: string;
  contact: string;
}

interface CartState {
  // State variables
  isBarcodeMode: boolean;
  searchItemQuery: string;
  searchPersonQuery: string;
  itemSuggestions: Product[];
  personSuggestions: Person[];
  prev_id: number;
  invoiceId: number;
  items: Product[];
  persons: Person[];
  shop: Shop;
  invoice: Invoice;
  person: Person;
  cartItems: Product[];
  recentInvoices: RecentInvoice[];
  username: string;

  total: number;
  discountRS: number;
  taxRS: number;
  net: number;
  balance: number;
  // Methods
  getProductClass: (product: Product) => string;
  isDangerous: (product: Product) => boolean;
  fetchItems: () => Promise<void>;
  fetchRecentInvoices: () => Promise<void>;
  fetchPersons: () => Promise<void>;
  changeInvoiceType: () => void;
  fetchCartItems: () => Promise<void>;
  searchItems: () => void;
  barcodeChange: (barcode: string) => Promise<void>;
  searchPersons: () => void;
  addProductToCart: (product: Product) => Promise<void>;
  saveCartItem: (product: Product) => Promise<void>;
  deleteCartItem: (product: Product) => Promise<void>;
  checkOut: () => Promise<void>;
  resetCart: () => void;
  updateCartQuantity: (value: number, product: Product) => Promise<void>;
  updateCartProductQuantity: (
    product: Product,
    newQty: number,
    invoiceType: "Sale" | "Purchase"
  ) => Promise<void>;
  fillPersonData: (person: Person) => void;
  saveInvoice: () => Promise<void>;
  printAndCheckout: () => void;
  setInvoice: (invoice: Invoice) => void;
  query: () => Promise<void>;
  initializeData: (id?: number) => Promise<void>;
  setSearchItemQuery: (query: string) => void;
  setSearchPersonQuery: (query: string) => void;
  setIsBarcodeMode: (mode: boolean) => void;
  updateCalculations: () => void;
  calculateLocalTotals: () => {
    total: number;
    discountRS: number;
    taxRS: number;
    net: number;
    balance: number;
  };
}

const generateInvoiceNumber = (type: "Sale" | "Purchase", prevId: number) => {
  const prefix = type === "Sale" ? "S" : "P";
  return `${prefix}${prevId + 1}`;
};

export const useCartStore = create<CartState>((set, get) => ({
  // Initial state
  isBarcodeMode: false,
  searchItemQuery: "",
  searchPersonQuery: "",
  itemSuggestions: [],
  personSuggestions: [],
  prev_id: 1,
  invoiceId: -1,
  items: [],
  persons: [],
  shop: {
    id: 0,
    name: "",
    description: "",
    address: "",
    contact: "",
  },
  invoice: {
    invoice_no: "",
    reference: "",
    type: "Sale",
    date: new Date().toISOString().split("T")[0],
    discount: 0,
    tax: 0,
    received: 0,
    remarks: "",
    person_id: -1,
    user_id: 1,
  },
  person: {
    id: -1,
    name: "",
    contact: "",
    role: "",
    address: "",
    remarks: "",
  },
  cartItems: [],
  recentInvoices: [],
  username: "Admin",

  total: 0,
  discountRS: 0,
  taxRS: 0,
  net: 0,
  balance: 0,

  // UI methods
  setSearchItemQuery: (query) => set({ searchItemQuery: query }),
  setSearchPersonQuery: (query) => set({ searchPersonQuery: query }),
  setIsBarcodeMode: (mode) => set({ isBarcodeMode: mode }),

  // Product classification
  getProductClass: (product) => {
    const now = new Date();
    const expiryDate = new Date(product.expiry || "");
    const isExpired = expiryDate < now;
    const isLowStock = product.qty <= (product.min_qty || 0);
    const isDanger = get().isDangerous(product);

    if (isExpired) return "bg-red-200";
    if (isDanger) return "bg-yellow-200";
    if (isLowStock) return "bg-blue-200";
    return "";
  },

  isDangerous: (product) => {
    const dangerousItems = ["Detail", "Explosive Item", "Chemical X"];
    return false && dangerousItems.includes(product.name);
  },

  updateCalculations: async () => {
    const { invoiceId, cartItems, invoice } = get();
    if (invoiceId === -1) {
      const { total, discountRS, taxRS, net, balance } =
        get().calculateLocalTotals();
      set({ total, discountRS, taxRS, net, balance });
      return;
    }

    try {
      const summary = await invoke<{
        total: number;
        discount: number;
        tax: number;
        net: number;
        balance: number;
      }>("calculate_cart_summary_command", { invoiceId });

      set({
        total: summary.total,
        discountRS: summary.discount,
        taxRS: summary.tax,
        net: summary.net,
        balance: summary.balance,
      });
    } catch (error) {
      console.error("Failed to calculate cart summary:", error);
      const { total, discountRS, taxRS, net, balance } =
        get().calculateLocalTotals();
      set({ total, discountRS, taxRS, net, balance });
    }
  },

  calculateLocalTotals: () => {
    const { cartItems, invoice } = get();
    const total = cartItems.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );
    const discountRS = (total * invoice.discount) / 100;
    const taxRS = ((total - discountRS) * invoice.tax) / 100;
    const net = total - discountRS + taxRS;
    const balance = net - invoice.received;
    return { total, discountRS, taxRS, net, balance };
  },

  // Data fetching methods
  fetchItems: async () => {
    try {
      const items = await invoke<Product[]>("fetch_stock_items");
      set({ items });
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  },

  fetchRecentInvoices: async () => {
    try {
      const recentInvoices = await invoke<RecentInvoice[]>(
        "fetch_recent_invoices"
      );
      set({ recentInvoices });
      console.log("Recent Invoices:", recentInvoices);
    } catch (error) {
      console.error("Error fetching recent invoices:", error);
    }
  },

  fetchPersons: async () => {
    try {
      const persons = await invoke<Person[]>("get_all_persons_command");
      set({ persons });
    } catch (error) {
      console.error("Error fetching persons:", error);
    }
  },

  changeInvoiceType: () => {
    const { cartItems, invoice, prev_id } = get();
    if (cartItems.length === 0) {
      const newType = invoice.type === "Sale" ? "Purchase" : "Sale";
      const newInvoiceNo = generateInvoiceNumber(newType, prev_id);
      set({
        invoice: {
          ...invoice,
          type: newType,
          invoice_no: newInvoiceNo,
          discount: 0,
          tax: 0,
          received: 0,
        },
        cartItems: [],
      });
    }
  },

  fetchCartItems: async () => {
    const { invoiceId } = get();
    if (invoiceId === -1) return;

    try {
      const cartItems = await invoke<Product[]>("fetch_cart_items", {
        invoiceId,
      });
      set({ cartItems });
      get().updateCalculations();
    } catch (error) {
      console.error("Error fetching cart items:", error);
    }
  },

  searchItems: () => {
    const { items, searchItemQuery } = get();
    if (!searchItemQuery) {
      set({ itemSuggestions: [] });
      return;
    }

    const query = searchItemQuery.toLowerCase();
    const suggestions = items.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.code.toLowerCase().includes(query)
    );
    set({ itemSuggestions: suggestions });
  },

  barcodeChange: async (barcode: string) => {
    const { items } = get();
    const item = items.find((i) => i.code === barcode);
    if (item) {
      await get().addProductToCart(item);
      set({ searchItemQuery: "" });
    }
  },

  searchPersons: () => {
    const { persons, searchPersonQuery } = get();
    if (!searchPersonQuery) {
      set({ personSuggestions: [] });
      return;
    }

    const query = searchPersonQuery.toLowerCase();
    const suggestions = persons.filter((person) =>
      Object.values(person).some((value) =>
        String(value).toLowerCase().includes(query)
      )
    );
    set({ personSuggestions: suggestions });
  },

  addProductToCart: async (product: Product) => {
    const { person, invoiceId, invoice, prev_id } = get();
    if (person.id === -1) {
      alert("Person not selected.");
      return;
    }

    if (invoiceId === -1) {
      const newInvoiceNo = generateInvoiceNumber(invoice.type, prev_id);
      set({
        invoice: {
          ...invoice,
          invoice_no: newInvoiceNo,
        },
      });
      await get().saveInvoice();
    }

    await get().saveCartItem(product);
    set({ searchItemQuery: "", itemSuggestions: [] });
    await get().fetchItems();
    await get().fetchCartItems();
  },

  saveCartItem: async (product: Product) => {
    const { cartItems, invoiceId, invoice } = get();
    const existingItem = cartItems.find((item) => item.id === product.id);

    try {
      const price =
        invoice.type === "Sale" ? product.sale_price : product.purchase_price;

      if (existingItem) {
        await invoke("update_cart_item_quantity", {
          cartItemId: product.id,
          stockId: product.id,
          newQty: existingItem.qty + 1,
          oldQty: existingItem.qty,
          invoiceType: invoice.type,
        });
      } else {
        await invoke("add_cart_item", {
          item: {
            stock_id: product.id,
            invoice_id: invoiceId,
            qty: 1,
            price,
            discount: product.discount || 0,
          },
          invoiceType: invoice.type,
        });
      }

      await get().fetchCartItems();
      await get().fetchItems();
      get().updateCalculations();
    } catch (error) {
      console.error("Failed to save cart item:", error);
      throw error;
    }
  },

  deleteCartItem: async (product: Product) => {
    try {
      await invoke("remove_cart_item", {
        cartItemId: product.id, // Only pass the cart item ID
      });

      // Refresh data after deletion
      await get().fetchCartItems();
      await get().fetchItems();
      get().updateCalculations();
    } catch (error) {
      console.error("Transaction failed:", error);
      throw error;
    }
  },

  checkOut: async () => {
    const { invoice, invoiceId, cartItems } = get();
    if (invoiceId === -1 || cartItems.length === 0) return;

    try {
      await invoke("update_invoice_details", { invoice });
      await invoke("checkout_invoice", {
        invoiceId,
        cartItems,
        invoiceType: invoice.type,
      });

      get().resetCart();
      await get().fetchItems();
      get().fetchRecentInvoices();
    } catch (error) {
      console.error("Error during checkout:", error);
    }
  },

  resetCart: () => {
    const { invoice, prev_id, persons } = get();
    set({
      prev_id: prev_id,
      invoiceId: -1,
      cartItems: [],
      invoice: {
        ...invoice,
        invoice_no: "",
        date: new Date().toISOString().split("T")[0],
        discount: 0,
        tax: 0,
        received: 0,
        remarks: "",
        person_id: persons[0]?.id || -1,
      },
      person: persons[0] || {
        id: -1,
        name: "",
        contact: "",
        role: "",
        address: "",
        remarks: "",
      },
    });
    get().fetchRecentInvoices();
  },

  updateCartQuantity: async (value: number, product: Product) => {
    if (value > 0) {
      const { invoice } = get();
      try {
        await get().updateCartProductQuantity(product, value, invoice.type);
      } catch (error) {
        console.error("Failed to update cart:", error);
      }
    }
  },

  updateCartProductQuantity: async (
    product: Product,
    newQty: number,
    invoiceType: "Sale" | "Purchase"
  ) => {
    try {
      await invoke("update_cart_item_quantity", {
        cartItemId: product.id,
        stockId: product.id,
        newQty,
        oldQty: product.qty,
        invoiceType,
      });

      await get().fetchCartItems();
      get().updateCalculations();
    } catch (error) {
      console.error("Transaction failed:", error);
      throw error;
    }
  },

  fillPersonData: (person: Person) => {
    set({
      person,
      invoice: { ...get().invoice, person_id: person.id },
      searchPersonQuery: "",
      personSuggestions: [],
    });
  },

  saveInvoice: async () => {
    const { invoice, invoiceId } = get();
    if (invoiceId !== -1) return;

    try {
      const newId = await invoke<number>("create_new_invoice", { invoice });
      set({
        invoiceId: newId,
        prev_id: newId,
        invoice: {
          ...invoice,
          id: newId,
        },
      });
    } catch (error) {
      console.error("Failed to save invoice:", error);
    }
  },

  printAndCheckout: () => {
    get().checkOut();
  },

  setInvoice: (invoice: Invoice) => {
    set({
      invoiceId: invoice.id || -1,
      invoice: invoice,
    });

    get().fetchCartItems();
    get().updateCalculations();
    const { persons } = get();
    const person = persons.find((p) => p.id === invoice.person_id);
    if (person) {
      set({ person });
    }
  },

  query: async () => {
    try {
      const recentInvoices = await invoke<RecentInvoice[]>(
        "fetch_recent_invoices"
      );
      const latest_id = recentInvoices.length > 0 ? recentInvoices[0].id : 0;
      set({ prev_id: latest_id });
    } catch (error) {
      console.error("Error fetching latest invoice ID:", error);
    }
  },

  initializeData: async (id?: number) => {
    await get().query();
    await get().fetchItems();
    await get().fetchPersons();

    try {
      const shop = await invoke<Shop>("get_shop_settings");
      set({ shop });
    } catch (error) {
      console.error("Error fetching shop info:", error);
    }

    if (id) {
      try {
        const invoice = await invoke<Invoice>("fetch_invoice_with_items", {
          id,
        });
        await get().setInvoice(invoice);
        console.log("invoice in cart store", invoice);
      } catch (error) {
        console.error("Error fetching invoice:", error);
      }
    } else {
      const { persons, prev_id } = get();
      const newType = "Sale";
      const newInvoiceNo = generateInvoiceNumber(newType, prev_id);
      set({
        person: persons[0] || {
          id: -1,
          name: "",
          contact: "",
          role: "",
          address: "",
          remarks: "",
        },
        invoice: {
          invoice_no: newInvoiceNo,
          reference: "",
          type: newType,
          date: new Date().toISOString().split("T")[0],
          discount: 0,
          tax: 0,
          received: 0,
          remarks: "",
          person_id: persons[0]?.id || -1,
          user_id: 1,
        },
      });
    }

    await get().fetchRecentInvoices();
  },
}));