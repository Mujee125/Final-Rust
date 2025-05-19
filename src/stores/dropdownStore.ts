
import { create } from "zustand";

import Database from "@tauri-apps/plugin-sql";


interface DropdownItem {
  id: number;
  name: string;
}

type QueryResult = { rowsAffected: number; lastInsertId?: number };

interface DropdownStore {
  values: Record<string, DropdownItem[]>; // per-table values
  loading: boolean;
  error: string | null;
  fetchData: (tableName: string) => Promise<void>;
  addItem: (tableName: string, name: string) => Promise<number | undefined>;
  updateItem: (tableName: string, id: number, name: string) => Promise<boolean>;
  deleteItem: (tableName: string, id: number) => Promise<boolean>;
}

export const useDropdownStore = create<DropdownStore>((set) => ({
  values: {},
  loading: false,
  error: null,

  fetchData: async (tableName) => {
    set({ loading: true, error: null });
    try {
      const db = await Database.load("sqlite:learn_pos.db");
      const result: DropdownItem[] = await db.select<DropdownItem[]>(
        `SELECT * FROM ${tableName} ORDER BY name ASC`
      );
      set((state) => ({
        values: { ...state.values, [tableName]: result },
        loading: false,
      }));
    } catch (error) {
      console.error("Fetch error:", error);
      set((state) => ({
        error: "Failed to fetch data",
        loading: false,
        values: { ...state.values, [tableName]: [] },
      }));
    }
  },

  addItem: async (tableName, name) => {
    try {
      const db = await Database.load("sqlite:learn_pos.db");
      const result: QueryResult = await db.execute(
        `INSERT INTO ${tableName} (name) VALUES (?)`,
        [name]
      );
      if (result.rowsAffected > 0) {
        const updatedData: DropdownItem[] = await db.select<DropdownItem[]>(
          `SELECT * FROM ${tableName} ORDER BY name ASC`
        );
        set((state) => ({
          values: { ...state.values, [tableName]: updatedData },
        }));
        return result.lastInsertId;
      }
    } catch (error) {
      console.error("Add item error:", error);
      set({ error: "Failed to add item" });
    }
    return undefined;
  },

  updateItem: async (tableName, id, name) => {
    try {
      const db = await Database.load("sqlite:learn_pos.db");
      const result: QueryResult = await db.execute(
        `UPDATE ${tableName} SET name = ? WHERE id = ?`,
        [name, id]
      );
      if (result.rowsAffected > 0) {
        const updatedData: DropdownItem[] = await db.select<DropdownItem[]>(
          `SELECT * FROM ${tableName} ORDER BY name ASC`
        );
        set((state) => ({
          values: { ...state.values, [tableName]: updatedData },
        }));
        return true;
      }
    } catch (error) {
      console.error("Update error:", error);
      set({ error: "Failed to update item" });
    }
    return false;
  },

  deleteItem: async (tableName, id) => {
    try {
      const db = await Database.load("sqlite:learn_pos.db");
      const result: QueryResult = await db.execute(
        `DELETE FROM ${tableName} WHERE id = ?`,
        [id]
      );
      if (result.rowsAffected > 0) {
        const updatedData: DropdownItem[] = await db.select<DropdownItem[]>(
          `SELECT * FROM ${tableName} ORDER BY name ASC`
        );
        set((state) => ({
          values: { ...state.values, [tableName]: updatedData },
        }));
        return true;
      }
    } catch (error) {
      console.error("Delete error:", error);
      set({ error: "Failed to delete item" });
    }
    return false;
  },
}));
