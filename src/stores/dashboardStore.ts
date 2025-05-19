
import { create } from "zustand";
import Database from "@tauri-apps/plugin-sql";

interface DashboardStats {
  today_total_sale: number;
  today_total_purchase: number;
  this_month_total_sale: number;
  this_month_total_purchase: number;
  total_items_registered: number;
  low_stock_items: number;
  expired_items: number;
}

interface DashboardStatsState {
  stats: DashboardStats;
  loading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
  clearError: () => void;
}

export const useDashboardStore = create<DashboardStatsState>((set) => ({
  stats: {
    today_total_sale: 0,
    today_total_purchase: 0,
    this_month_total_sale: 0,
    this_month_total_purchase: 0,
    total_items_registered: 0,
    low_stock_items: 0,
    expired_items: 0,
  },
  loading: false,
  error: null,

  fetchStats: async () => {
    set({ loading: true, error: null });
    try {
      const db = await Database.load("sqlite:learn_pos.db");

      const query = `
        SELECT
          (SELECT COALESCE(SUM(((c.qty * c.price) - c.discount) - i.discount + i.tax), 0)
           FROM invoices i
           JOIN cart c ON i.id = c.invoice_id
           WHERE i.type = 'Sale' AND DATE(i.date) = DATE('now')) AS today_total_sale,
          
          (SELECT COALESCE(SUM(((c.qty * c.price) - c.discount) - i.discount + i.tax), 0)
           FROM invoices i
           JOIN cart c ON i.id = c.invoice_id
           WHERE i.type = 'Purchase' AND DATE(i.date) = DATE('now')) AS today_total_purchase,
          
          (SELECT COALESCE(SUM(((c.qty * c.price) - c.discount) - i.discount + i.tax), 0)
           FROM invoices i
           JOIN cart c ON i.id = c.invoice_id
           WHERE i.type = 'Sale' AND strftime('%m', i.date) = strftime('%m', 'now') 
           AND strftime('%Y', i.date) = strftime('%Y', 'now')) AS this_month_total_sale,
          
          (SELECT COALESCE(SUM(((c.qty * c.price) - c.discount) - i.discount + i.tax), 0)
           FROM invoices i
           JOIN cart c ON i.id = c.invoice_id
           WHERE i.type = 'Purchase' AND strftime('%m', i.date) = strftime('%m', 'now') 
           AND strftime('%Y', i.date) = strftime('%Y', 'now')) AS this_month_total_purchase,
          
          (SELECT COUNT(*) FROM stock) AS total_items_registered,
          
          (SELECT COUNT(*) FROM stock WHERE qty < min_qty) AS low_stock_items,
          
          (SELECT COUNT(*) FROM stock WHERE expiry < DATE('now')) AS expired_items;
      `;

      const result = await db.select<DashboardStats[]>(query);
  
      if (result.length > 0) {
        set({ stats: result[0], loading: false });
      }
    } catch (err) {
      console.error("Database error:", err);
      set({
        error: "Failed to fetch dashboard stats",
        loading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));

interface DailyStat {
  date: string;
  sale: number;
  purchase: number;
}

interface DailyStatsState {
  data: DailyStat[];
  loading: boolean;
  error: string | null;
  fetchDailyStats: () => Promise<void>;
  clearError: () => void;
}

export const useDailyStatsStore = create<DailyStatsState>((set) => ({
  data: [],
  loading: false,
  error: null,

  fetchDailyStats: async () => {
    set({ loading: true, error: null });
    try {
      const db = await Database.load("sqlite:learn_pos.db");

      const query = `
        WITH RECURSIVE last_31_days AS (
          SELECT DATE('now') AS date
          UNION ALL
          SELECT DATE(date, '-1 day')
          FROM last_31_days
          WHERE date > DATE('now', '-30 day')
        )
        SELECT
          d.date,
          COALESCE(SUM(CASE WHEN i.type = 'Sale' THEN c.qty * c.price - c.discount ELSE 0 END), 0) AS sale,
          COALESCE(SUM(CASE WHEN i.type = 'Purchase' THEN c.qty * c.price - c.discount ELSE 0 END), 0) AS purchase
        FROM last_31_days d
        LEFT JOIN invoices i ON d.date = DATE(i.date)
        LEFT JOIN cart c ON i.id = c.invoice_id
        GROUP BY d.date
        ORDER BY d.date;
      `;

      const rows = await db.select<DailyStat[]>(query);
      set({ data: rows, loading: false });
    } catch (err) {
      console.error("Error fetching daily stats:", err);
      set({
        error: "Failed to fetch daily stats",
        loading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));