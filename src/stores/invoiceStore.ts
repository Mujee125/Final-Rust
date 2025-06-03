

import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { useCartStore } from "./cartStore";

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
  id?: string
  invoice_id?: number;
  product_id?: number;
  name: string;
  category: string;
  unit: string;
  qty: number;
  price: number;
  discount: number;
}


interface InvoiceState {
  data: Invoice[];
  filteredData: Invoice[];
  invoiceItems: InvoiceItem[];
  searchQuery: string;
  invoice: Invoice;
  loading: boolean;
  error: string | null;
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
      const invoices: Invoice[] = await invoke("fetch_invoices");

      if (invoices && invoices.length > 0) {
        set({
          data: invoices,
          filteredData: invoices,
          loading: false,
        });
        console.log("Fetched invoices:", invoices);
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
      const invoiceWithItems = await invoke<{
        invoice: Invoice;
        items: InvoiceItem[];
      }>("fetch_invoice_with_items_for_invoice", { id: inv.id });

      set({
        
        invoice: invoiceWithItems.invoice ?? initialInvoiceState.invoice,
        invoiceItems: invoiceWithItems.items ?? [],
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

  downloadCSV: async () => {
    const { data } = get();
    try {
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

  downloadPDF: async () => {
    const jsPDF = (await import("jspdf")).default;
    const { autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF();
    doc.text("Invoices", 14, 10);

    autoTable(doc, {
      head: [
        [
          "Sr. #",
          "Invoice No.",
          "Type",
          "Date",
          "Person",
          "Discount",
          "Tax",
          "Received",
          "User",
          "Subtotal",
          "Total",
        ],
      ],
      body: get().data.map((item, index) => [
        String(index + 1),
        item.invoice_no ?? "",
        item.type ?? "",
        item.date ?? "",
        item.person ?? "",
        item.discount ?? 0,
        item.tax ?? 0,
        item.received ?? "",
        item.user ?? "",
        item.subtotal ?? 0,
        item.total ?? 0,
      ]),
      startY: 20,
    });

    doc.save("invoices.pdf");
  },

  deleteInvoice: async () => {
    const { invoice, fetchTableData } = get();
    if (!invoice.id || !confirm("Are you sure you want to delete this record?"))
      return;

    try {
      await invoke("delete_invoice_cmd", { id: invoice.id });
      await fetchTableData();
      set({ invoice: initialInvoiceState.invoice });
   
    } catch (error) {
      console.error("Error deleting invoice:", error);
      throw error;
    }
    
  },

  setInvoice: (invoice: Partial<Invoice>) => {
    set((state) => ({
      invoice: { ...state.invoice, ...invoice },
    }));
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
    get().searchProducts();
  },
}));