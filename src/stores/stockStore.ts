
import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";

interface StockItem {
  id: number | null;
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
  discount: number;
  expiry: string | null;
  location: string;
  remarks: string;
  created_at?: string;
  updated_at?: string;
}

interface Stats {
  total_items_registered: number;
  low_stock_items: number;
  expired_items: number;
}

interface StockStore {
  stockItems: StockItem[];
  filteredStockItems: StockItem[];
  currentItem: StockItem;
  stats: Stats;
  searchQuery: string;
  loading: boolean;
  error: string | null;

  // Price calculator fields
  pPurchasePrice: number;
  pSalePrice: number;
  purchaseFactor: number;
  saleFactor: number;

  // Actions
  fetchStockItems: () => Promise<void>;
  fetchStats: () => Promise<void>;
  updateStock: () => Promise<void>;
  saveNewStock: () => Promise<void>;
  deleteStockItem: (id: number) => Promise<void>;
  setCurrentItem: (item: StockItem) => void;
  resetCurrentItem: () => void;
  setSearchQuery: (query: string) => void;
  filterStockItems: () => void;
  downloadCSV: () => void;
  downloadPDF: () => void;

  // Price calculator actions
  setPPurchasePrice: (value: number) => void;
  setPSalePrice: (value: number) => void;
  setPurchaseFactor: (value: number) => void;
  setSaleFactor: (value: number) => void;
  handleParsedData: (rows: StockItem[]) => Promise<void>;
  // Computed values
  unitSalePrice: string;
  unitPurchasePrice: string;
}

export const useStockStore = create<StockStore>((set, get) => ({
  stockItems: [],
  filteredStockItems: [],
  currentItem: {
    id: null,
    name: "",
    code: "",
    type: "",
    category: "",
    unit: "",
    qty: 0,
    min_qty: 0,
    target_qty: 0,
    sale_price: 0,
    purchase_price: 0,
    discount: 0,
    expiry: null,
    location: "",
    remarks: "",
  },
  stats: {
    total_items_registered: 0,
    low_stock_items: 0,
    expired_items: 0,
  },
  searchQuery: "",
  loading: false,
  error: null,

  // Price calculator fields
  pPurchasePrice: 0,
  pSalePrice: 0,
  purchaseFactor: 0,
  saleFactor: 0,

  // Computed values
  get unitSalePrice() {
    const { pSalePrice, saleFactor } = get();
    return saleFactor > 0 ? (pSalePrice / saleFactor).toFixed(2) : "0";
  },
  get unitPurchasePrice() {
    const { pPurchasePrice, purchaseFactor } = get();
    return purchaseFactor > 0
      ? (pPurchasePrice / purchaseFactor).toFixed(2)
      : "0";
  },

  fetchStockItems: async () => {
    set({ loading: true, error: null });
    try {
      const result = await invoke<StockItem[]>("fetch_stock_items");
      set({
        stockItems: result,
        filteredStockItems: result,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching stock items:", error);
      set({ error: "Failed to fetch stock items", loading: false });
    }
  },

  fetchStats: async () => {
    try {
      const result = await invoke<Stats>("fetch_stock_stats");
      set({
        stats: result,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      set({ error: "Failed to fetch statistics" });
    }
  },

  updateStock: async () => {
    const { currentItem } = get();
    if (!currentItem.name || !currentItem.code) {
      alert("Name and Code are required fields");
      return;
    }

    try {
      const result = await invoke<number>("save_stock_item", {
        item: currentItem,
      });
      if (result > 0) {
        get().fetchStockItems();
        get().fetchStats();
        get().resetCurrentItem();
      }
    } catch (error) {
      console.error("Error updating stock item:", error);
      set({ error: "Failed to update stock item" });
    }
  },

  saveNewStock: async () => {
    let { currentItem } = get();
    if (!currentItem.name || !currentItem.code) {
      alert("Name and Code are required fields");
      return;
    }
    // Remove id to force insert as new
    const newItem = { ...currentItem, id: null };
    try {
      const result = await invoke<number>("save_stock_item", {
        item: newItem,
      });
      if (result > 0) {
        get().fetchStockItems();
        get().fetchStats();
        get().resetCurrentItem();
      }
    } catch (error) {
      console.error("Error saving new stock item:", error);
      set({ error: "Failed to save new stock item" });
    }
  },

  deleteStockItem: async (id) => {
    if (!id || !confirm("Are you sure you want to delete this record?")) return;

    try {
      const result = await invoke<number>("delete_stock_item", { id });
      if (result > 0) {
        get().fetchStockItems();
        get().fetchStats();
      }
    } catch (error) {
      console.error("Error deleting stock item:", error);
      set({ error: "Failed to delete stock item" });
    }
  },

  setCurrentItem: (item) => {
    set({ currentItem: item });
  },

  resetCurrentItem: () => {
    set({
      currentItem: {
        id: null,
        name: "",
        code: "",
        type: "",
        category: "",
        unit: "",
        qty: 0,
        min_qty: 0,
        target_qty: 0,
        sale_price: 0,
        purchase_price: 0,
        discount: 0,
        expiry: null,
        location: "",
        remarks: "",
      },
    });
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().filterStockItems();
  },

  filterStockItems: () => {
    const { stockItems, searchQuery } = get();
    if (!searchQuery) {
      set({ filteredStockItems: stockItems });
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = stockItems.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(query)
      )
    );
    set({ filteredStockItems: filtered });
  },

  downloadCSV: () => {
    const { filteredStockItems } = get();
    const headers = [
      "Sr. #",
      "Name",
      "Code",
      "Qty",
      "Unit",
      "Sale Price",
      "Expiry",
      "Location",
    ];
    const csvRows = [
      headers.join(","),
      ...filteredStockItems.map((item, index) =>
        [
          index + 1,
          item.name,
          item.code,
          item.qty,
          item.unit,
          item.sale_price,
          item.expiry,
          item.location,
        ]
          .map((field) => `"${field?.toString().replace(/"/g, '""')}"`)
          .join(",")
      ),
    ];

    const csvContent = csvRows.join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "stock.csv";
    link.click();
  },

  downloadPDF: async () => {
    const jsPDF = (await import("jspdf")).default;
    const { autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF();
    doc.text("Stock List", 14, 10);

    autoTable(doc, {
      head: [
        [
          "Sr. #",
          "Name",
          "Code",
          "Qty",
          "Unit",
          "Sale Price",
          "Expiry",
          "Location",
        ],
      ],
      body: get().filteredStockItems.map((item, index) => [
        index + 1,
        item.name,
        item.code,
        item.qty,
        item.unit,
        item.sale_price,
        item.expiry,
        item.location,
      ]),
      startY: 20,
    });

    doc.save("stock.pdf");
  },

  //   handleParsedData: async (rows: StockItem[]) => {
  //     try {
  //       const result = await invoke<number>("import_stock_items", {
  //         items: rows,
  //       });
  //       if (result > 0) {
  //         get().fetchStockItems();
  //         get().fetchStats();
  //         get().resetCurrentItem();
  //         alert("Stock data imported successfully!");
  //       }
  //     } catch (error) {
  //       console.error("Error during stock data import:", error);
  //       alert("An error occurred while importing stock data.");
  //     }
  //   },

  handleParsedData: async (rows: StockItem[]) => {
    try {
      // Convert to a simpler structure with proper number types
      const importData = rows.map((row) => ({
        name: row.name,
        code: row.code,
        type: row.type,
        category: row.category,
        unit: row.unit,
        qty: typeof row.qty === "string" ? parseFloat(row.qty) : row.qty,
        min_qty:
          typeof row.min_qty === "string"
            ? parseFloat(row.min_qty)
            : row.min_qty,
        target_qty:
          typeof row.target_qty === "string"
            ? parseFloat(row.target_qty)
            : row.target_qty,
        sale_price:
          typeof row.sale_price === "string"
            ? parseFloat(row.sale_price)
            : row.sale_price,
        purchase_price:
          typeof row.purchase_price === "string"
            ? parseFloat(row.purchase_price)
            : row.purchase_price,
        discount:
          typeof row.discount === "string"
            ? parseFloat(row.discount)
            : row.discount,
        expiry: row.expiry,
        location: row.location,
        remarks: row.remarks,
      }));

      const result = await invoke<number>("import_stock_items", {
        items: importData,
      });
      if (result > 0) {
        get().fetchStockItems();
        get().fetchStats();
        get().resetCurrentItem();
        alert(`Successfully imported ${result} stock items`);
      }
    } catch (error) {
      console.error("Error during stock data import:", error);
      alert("An error occurred while importing stock data.");
    }
  },
  setPPurchasePrice: (value) => set({ pPurchasePrice: value }),
  setPSalePrice: (value) => set({ pSalePrice: value }),
  setPurchaseFactor: (value) => set({ purchaseFactor: value }),
  setSaleFactor: (value) => set({ saleFactor: value }),
}));