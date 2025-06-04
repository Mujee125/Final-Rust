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
    const { invoiceId } = get();
    if (invoiceId === -1) {
      const { total, discountRS, taxRS, net, balance } =
        get().calculateLocalTotals();
      set({ total, discountRS, taxRS, net, balance });
      return { total, discountRS, taxRS, net, balance };
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
    console.log("invoiceId", invoiceId);
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
      get().fetchRecentInvoices();
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
      await invoke("update_invoice_details", {
        invoice: {
          ...invoice,
          
        },
      });
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
        reference: "",
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
        newQty,
        oldQty: product.qty,
        invoiceType: invoiceType,
      });

      await get().fetchCartItems();
      get().updateCalculations();
    } catch (error) {
      console.error("Transaction failed:", error);
      throw error;
    }
  },

  fillPersonData: (person: Person) => {
    set((state) => {
      const updatedInvoice = { ...state.invoice, person_id: person.id };
      // Update state first
      return {
        person,
        invoice: updatedInvoice,
        searchPersonQuery: "",
        personSuggestions: [],
      };
    });

    // Now, after state is updated, update the backend
    setTimeout(() => {
      const { invoiceId, invoice } = get();
      if (invoiceId !== -1) {
        invoke("update_invoice_details", {
          invoice: { ...invoice, person_id: person.id },
        }).catch((error) => {
          console.error("Failed to update invoice person:", error);
        });
      }
    }, 0);
  },

  saveInvoice: async () => {
    const { invoice, invoiceId } = get();
    if (invoiceId !== -1) return;

    try {
      const  lastInsertId  = await invoke<number>("create_new_invoice", {
        invoice,
      });
      set({
        invoiceId: lastInsertId,
        prev_id: lastInsertId,
        invoice: {
          ...invoice,
          id: lastInsertId,
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
    const mappedInvoice = {
      ...invoice,
      type: invoice.type || (invoice as any).invoice_type, // prefer 'type', fallback to 'invoice_type'
    };
    set({
      invoiceId: mappedInvoice.id || -1,
      invoice: mappedInvoice,
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
      const latestId = await invoke<number>("get_max_invoice_id");
      set({ prev_id: latestId });
      console.log("Latest invoice ID:", latestId);
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
        invoice.type = invoice.type || (invoice as any).invoice_type;
        await get().setInvoice(invoice);
        
      } catch (error) {
        console.error("Error fetching invoice:", error);
      }
    } else {
      const { persons, prev_id, cartItems, invoice } = get();
      if (!cartItems || cartItems.length === 0) {
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
      } else {
        set({
          invoice: { ...invoice },
        });
      }
    }

    await get().fetchRecentInvoices();
  },
}));