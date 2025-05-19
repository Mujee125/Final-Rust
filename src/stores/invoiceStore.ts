

import { create } from "zustand";

import Database from "@tauri-apps/plugin-sql";




 export interface Invoice {
  id?: string;
  invoice_no: string;
  type: string;
  date: string;
  person: string;
  discount_amount: number;
  tax_amount: number;
  received: string;
  user: string;
  discount: number;
  tax: number;
  remarks: string;
  subtotal?: number;
  total?: number;
  items?: number;
}

 interface InvoiceItem {
  id?: string;
  invoice_id?: string;
  product_id?: string;
  name: string;
  category: string;
  unit: string;
  qty: number;
  price: number;
  discount: number;
}

// Helper function to get database connection
const getDb = async () => {
  return await Database.load("sqlite:learn_pos.db");
};

interface InvoiceState {
  // Data state
  data: Invoice[];
  filteredData: Invoice[];
  invoiceItems: InvoiceItem[];
  searchQuery: string;
  invoice: Invoice;
  loading: boolean;
  error: string | null;
  // Methods
  fetchTableData: () => Promise<void>;
  searchProducts: () => void;
  selectInvoice: (inv: Invoice) => Promise<void>;
  downloadCSV: () => Promise<void>;
  downloadPDF: () => Promise<void>;
  deleteInvoice: () => Promise<void>;
  setInvoice: (invoice: Partial<Invoice>) => void;
  setSearchQuery: (query: string) => void;
}

const initialInvoiceState: Omit<
  InvoiceState,
  | "fetchTableData"
  | "searchProducts"
  | "selectInvoice"
  | "downloadCSV"
  | "downloadPDF"
  | "deleteInvoice"
  | "setInvoice"
  | "setSearchQuery"
> = {
  data: [],
  filteredData: [],
  invoiceItems: [],
  searchQuery: "",
  loading: false,
  error: null,
  invoice: {
    id: "",
    invoice_no: "",
    date: "",
    discount: 0,
    tax: 0,
    type: "",
    remarks: "",
    person: "",
    user: "",
    discount_amount: 0,
    tax_amount: 0,
    received: "",
    subtotal: 0,
    total: 0,
  },
};

export const useInvoiceStore = create<InvoiceState>()((set, get) => ({
  ...initialInvoiceState,


  fetchTableData: async () => {
    set({ loading: true, error: null });
    try {
      const db = await getDb();
      console.log("Fetching invoice data from database...");

      // Fixed query to match your actual table structure
      const invoices = await db.select<Invoice[]>(`
       SELECT
  invoices.id,
  invoices.invoice_no,
  invoices.type,
  invoices.date,
  invoices.discount,
  invoices.received,
  invoices.tax,
  invoices.remarks,
  persons.name AS person,
  users.username AS user,
  COUNT(cart.id) AS items,
  SUM(cart.qty * cart.price - cart.discount) AS subtotal,
  (SUM(cart.qty * cart.price - cart.discount) * (invoices.discount / 100)) AS discount_amount,
  (
    (
      SUM(cart.qty * cart.price - cart.discount) -
      (SUM(cart.qty * cart.price - cart.discount) * (invoices.discount / 100))
    ) * (invoices.tax / 100)
  ) AS tax_amount,
  (
    (
      SUM(cart.qty * cart.price - cart.discount) -
      (SUM(cart.qty * cart.price - cart.discount) * (invoices.discount / 100))
    ) + (
      (
        SUM(cart.qty * cart.price - cart.discount) -
        (SUM(cart.qty * cart.price - cart.discount) * (invoices.discount / 100))
      ) * (invoices.tax / 100)
    )
  ) AS total
FROM invoices
  INNER JOIN persons ON persons.id = invoices.person_id
  JOIN cart ON cart.invoice_id = invoices.id
  JOIN users ON invoices.user_id = users.id
  JOIN stock ON cart.stock_id = stock.id
GROUP BY
  invoices.id,
  invoices.invoice_no,
  invoices.type,
  invoices.date,
  invoices.discount,
  invoices.received,
  invoices.tax,
  invoices.remarks,
  persons.name,
  users.username
ORDER BY invoices.id DESC;

      `);

   

      if (invoices && invoices.length > 0) {
        set({
          data: invoices,
          filteredData: invoices,
          loading: false,
        });
      } else {
        console.warn("No invoices found in database");
        set({
          data: [],
          filteredData: [],
          loading: false,
          error: "No invoices found",
        });
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      set({
        loading: false,
        error: `Failed to fetch invoices: ${
          error instanceof Error ? error.message : String(error)
        }`,
      });
    }
  },

  selectInvoice: async (inv: Invoice) => {
    set({ loading: true, error: null });
    try {
      const db = await getDb();
      const items = await db.select<InvoiceItem[]>(
        `
        SELECT 
          cart.id,
          stock.name,
          stock.category,
          stock.unit,
          cart.qty,
          cart.price,
          cart.discount
        FROM cart
        JOIN stock ON stock.id = cart.stock_id
        WHERE cart.invoice_id = $1
      `,
        [inv.id]
      );

      set({
        invoice: inv,
        invoiceItems: items,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching invoice items:", error);
      set({
        loading: false,
        error: `Failed to fetch invoice items: ${
          error instanceof Error ? error.message : String(error)
        }`,
      });
    }
  },

  // Search functionality
  searchProducts: () => {
    const { searchQuery, data } = get();
    const query = searchQuery.toLowerCase();

    set({
      filteredData: searchQuery
        ? data.filter((product) =>
            Object.values(product).some((value) =>
              String(value).toLowerCase().includes(query)
            )
          )
        : [...data],
    });
  },



  // Export to CSV
  downloadCSV: async () => {
    const { data } = get();
    try {
      // Convert data to CSV format
      const headers = Object.keys(data[0]).filter((key) => key !== "id");
      const csvRows = [
        headers.join(","),
        ...data.map((row) =>
          headers
            .map((fieldName) => JSON.stringify(row[fieldName as keyof Invoice]))
            .join(",")
        ),
      ];

      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      });

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "invoices.csv");
      link.click();
    } catch (error) {
      console.error("Error generating CSV:", error);
      throw error;
    }
  },

  // Export to PDF
  downloadPDF: async () => {
    const { filteredData } = get();
    try {
      // Dynamically import jsPDF (tree-shaking)
      const jsPDF = (await import("jspdf")).default;
      await import("jspdf-autotable");

      const doc = new jsPDF();
      doc.text("Invoices", 14, 10);

      // Prepare data for PDF
      const headers = [
        "Invoice No.",
        "Type",
        "Date",
        "Person",
        "Discount",
        "Tax",
        "Received",
        "User",
      ];

      const rows = filteredData.map((invoice) => [
        invoice.invoice_no,
        invoice.type,
        invoice.date,
        invoice.person,
        invoice.discount_amount.toFixed(2),
        invoice.tax_amount.toFixed(2),
        invoice.received,
        invoice.user,
      ]);

      // @ts-ignore - autotable is added to jsPDF
      doc.autoTable({
        head: [headers],
        body: rows,
        startY: 20,
        theme: "striped",
        styles: {
          fontSize: 10,
          cellPadding: { top: 4, right: 4, bottom: 4, left: 4 },
          valign: "middle",
          halign: "left",
        },
        headStyles: {
          fillColor: [229, 231, 235],
          textColor: 33,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        tableLineColor: 200,
        tableLineWidth: 0.1,
        margin: { top: 20, left: 14, right: 14 },
      });

      doc.save("invoices.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw error;
    }
  },

  // Delete invoice
  deleteInvoice: async () => {
    const { invoice, fetchTableData } = get();
    if (!invoice.id || !confirm("Are you sure you want to delete this record?"))
      return;

    try {
      const db = await getDb();

      // Start transaction
      await db.execute("BEGIN TRANSACTION");

      // Delete cart items first
      await db.execute("DELETE FROM cart WHERE invoice_id = $1", [invoice.id]);

      // Then delete the invoice
      await db.execute("DELETE FROM invoices WHERE id = $1", [invoice.id]);

      // Commit transaction
      await db.execute("COMMIT");

      // Refresh data
      await fetchTableData();
      set({ invoice: initialInvoiceState.invoice });
    } catch (error) {
      console.error("Error deleting invoice:", error);
      try {
        const db = await getDb();
        await db.execute("ROLLBACK");
      } catch (rollbackError) {
        console.error("Error rolling back transaction:", rollbackError);
      }
      throw error;
    }
  },

  // Update invoice state
  setInvoice: (invoice: Partial<Invoice>) => {
    set((state) => ({
      invoice: { ...state.invoice, ...invoice },
    }));
  },

  // Update search query
  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
    get().searchProducts();
  },
}));