import { create } from "zustand";
import  Database  from "@tauri-apps/plugin-sql";

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

export const useStockStore = create<StockStore>((set, get) => {
  // Helper function to get database connection
  const getDb = async () => {
    return await Database.load("sqlite:learn_pos.db");
  };

  return {
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
        const db = await getDb();
        const result = await db.select<StockItem[]>(`
          SELECT * FROM stock ORDER BY id DESC
        `);
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
        const db = await getDb();

        // Total items
        const totalItems = await db.select<{ count: number }[]>(`
          SELECT COUNT(*) as count FROM stock
        `);

        // Low stock items
        const lowStock = await db.select<{ count: number }[]>(`
          SELECT COUNT(*) as count FROM stock WHERE qty < min_qty
        `);

        // Expired items
        const expiredItems = await db.select<{ count: number }[]>(`
          SELECT COUNT(*) as count FROM stock WHERE expiry < date('now')
        `);

        set({
          stats: {
            total_items_registered: totalItems[0]?.count || 0,
            low_stock_items: lowStock[0]?.count || 0,
            expired_items: expiredItems[0]?.count || 0,
          },
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
        const db = await getDb();
        const timestamp = new Date()
          .toISOString()
          .slice(0, 19)
          .replace("T", " ");

        if (currentItem.id) {
          // Update existing item
          const result = await db.execute(
            `UPDATE stock SET 
              name = ?, code = ?,type=?, category = ?, unit = ?, 
              qty = ?, min_qty = ?, target_qty = ?, sale_price = ?, 
              purchase_price = ?, discount = ?, expiry = ?, location = ?, 
              remarks = ?, updated_at = ?
             WHERE id = ?`,
            [
              currentItem.name,
              currentItem.code,
              currentItem.type,
              currentItem.category,
              currentItem.unit,
              currentItem.qty,
              currentItem.min_qty,
              currentItem.target_qty,
              currentItem.sale_price,
              currentItem.purchase_price,
              currentItem.discount,
              currentItem.expiry,
              currentItem.location,
              currentItem.remarks,
              timestamp,
              currentItem.id,
            ]
          );

          if (result.rowsAffected > 0) {
            get().fetchStockItems();
            get().fetchStats();
            get().resetCurrentItem();
          }
        }
      } catch (error) {
        console.error("Error updating stock item:", error);
        set({ error: "Failed to update stock item" });
      }
    },

    saveNewStock: async () => {
      const { currentItem } = get();
      if (!currentItem.name || !currentItem.code) {
        alert("Name and Code are required fields");
        return;
      }

      try {
        const db = await getDb();
        const timestamp = new Date()
          .toISOString()
          .slice(0, 19)
          .replace("T", " ");

        const result = await db.execute(
          `INSERT INTO stock (
            name, code,type, category, unit, qty, min_qty, target_qty,
            sale_price, purchase_price, discount, expiry, location, remarks,
            created_at, updated_at
          ) VALUES (?, ?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            currentItem.name,
            currentItem.code,
            currentItem.type,
            currentItem.category,
            currentItem.unit,
            currentItem.qty,
            currentItem.min_qty,
            currentItem.target_qty,
            currentItem.sale_price,
            currentItem.purchase_price,
            currentItem.discount,
            currentItem.expiry,
            currentItem.location,
            currentItem.remarks,
            timestamp,
            timestamp,
          ]
        );

        if (result.rowsAffected > 0) {
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
      if (!id || !confirm("Are you sure you want to delete this record?"))
        return;

      try {
        const db = await getDb();
        const result = await db.execute(`DELETE FROM stock WHERE id = ?`, [id]);

        if (result.rowsAffected > 0) {
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

    handleParsedData: async (rows: StockItem[]) => {
      try {
        const db = await getDb();

        for (const row of rows) {
          const cleaned = {
            name: row.name?.trim() || "",
            code: row.code?.trim() || "",
            type: row.type?.trim() || "",
            category: row.category?.trim() || "",
            unit: row.unit?.trim() || "",
            qty: row.qty || 0,
            min_qty: row.min_qty || 0,
            target_qty: row.target_qty || 0,
            sale_price: row.sale_price || 0,
            purchase_price: row.purchase_price || 0,
            discount: row.discount || 0,
            expiry: /^\d{4}-\d{2}-\d{2}$/.test(row.expiry ?? "")
              ? row.expiry ?? ""
              : "",
            location: row.location?.trim() || "",
            remarks: row.remarks?.trim() || "",
          };

          if (!cleaned.name || !cleaned.code) continue;

          try {
            const timestamp = new Date()
              .toISOString()
              .slice(0, 19)
              .replace("T", " ");
              const result = await db.execute(
                `INSERT INTO stock 
                (name, code, type, category, unit, qty, min_qty, target_qty, sale_price, purchase_price, discount, expiry, location, remarks, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
               ON CONFLICT(code) DO UPDATE SET 
                 name=excluded.name, qty=excluded.qty, updated_at=datetime('now')`,
                [
                  cleaned.name,
                  cleaned.code,
                  cleaned.type,
                  cleaned.category,
                  cleaned.unit,
                  cleaned.qty,
                  cleaned.min_qty,
                  cleaned.target_qty,
                  cleaned.sale_price,
                  cleaned.purchase_price,
                  cleaned.discount,
                  cleaned.expiry,
                  cleaned.location,
                  cleaned.remarks,
                  timestamp,
                  timestamp,
                ]
              );
            if (result.rowsAffected > 0) {
              get().fetchStockItems();
              get().fetchStats();
              get().resetCurrentItem();
            }
          } catch (rowError) {
            console.error("Error inserting row:", cleaned.code, rowError);
          }
        }

        alert("Stock data imported successfully!");
      } catch (error) {
        console.error("Error during stock data import:", error);
        alert("An error occurred while importing stock data.");
      }
    },

    setPPurchasePrice: (value) => set({ pPurchasePrice: value }),
    setPSalePrice: (value) => set({ pSalePrice: value }),
    setPurchaseFactor: (value) => set({ purchaseFactor: value }),
    setSaleFactor: (value) => set({ saleFactor: value }),
  };
});