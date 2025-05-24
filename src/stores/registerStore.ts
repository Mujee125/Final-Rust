// // import { create } from "zustand";
// // import Database from "@tauri-apps/plugin-sql";

// // interface RegisterState {
// //   username: string;
// //   email: string;
// //   password: string;
// //   adminpassword: string;
// //   error: string;
// //   loading: boolean;
// //   setFormData: (
// //     data: Partial<
// //       Omit<RegisterState, "error" | "loading" | "setFormData" | "register">
// //     >
// //   ) => void;
// //   register: () => Promise<boolean>;
// //   reset: () => void;
// // }

// // export const useRegisterStore = create<RegisterState>((set, get) => ({
// //   username: "",
// //   email: "",
// //   password: "",
// //   adminpassword: "",
// //   error: "",
// //   loading: false,

// //   setFormData: (data) => set((state) => ({ ...state, ...data })),

// //   register: async () => {
// //     const { username, email, password, adminpassword } = get();

// //     // Basic validation
// //     if (!username || !email || !password || !adminpassword) {
// //       set({ error: "All fields are required" });
// //       return false;
// //     }

  

// //     set({ loading: true, error: "" });

// //     try {
// //       // Connect to SQLite database
// //       const db = await Database.load("sqlite:learn_pos.db");

// //       // Check if user already exists
// //       const existingUsers = await db.select<{ id: number }[]>(
// //         "SELECT id FROM users WHERE username = ? OR email = ?",
// //         [username, email]
// //       );

// //       if (existingUsers.length > 0) {
// //         set({ error: "Username or email already exists", loading: false });
// //         return false;
// //       }

// //       // Insert new user
// //       await db.execute(
// //         "INSERT INTO users (username, email, password, created_at) VALUES (?, ?, ?, datetime('now'))",
// //         [username, email, password] // Note: In production, you should hash the password
// //       );

// //       set({ loading: false });
// //       return true;
// //     } catch (err) {
// //       console.error("Registration error:", err);
// //       set({ error: "An error occurred during registration", loading: false });
// //       return false;
// //     }
// //   },

// //   reset: () =>
// //     set({
// //       username: "",
// //       email: "",
// //       password: "",
// //       adminpassword: "",
// //       error: "",
// //       loading: false,
// //     }),
// // }));


// import { create } from "zustand";
// import { invoke } from "@tauri-apps/api/core";

// interface RegisterState {
//   username: string;
//   email: string;
//   password: string;
//   adminpassword: string;
//   error: string;
//   loading: boolean;
//   setFormData: (
//     data: Partial<
//       Omit<RegisterState, "error" | "loading" | "setFormData" | "register">
//     >
//   ) => void;
//   register: () => Promise<boolean>;
//   reset: () => void;
// }

// export const useRegisterStore = create<RegisterState>((set, get) => ({
//   username: "",
//   email: "",
//   password: "",
//   adminpassword: "",
//   error: "",
//   loading: false,

//   setFormData: (data) => set((state) => ({ ...state, ...data })),

//   register: async () => {
//     const { username, email, password, adminpassword } = get();

//     if (!username || !email || !password || !adminpassword) {
//       set({ error: "All fields are required" });
//       return false;
//     }

//     set({ loading: true, error: "" });

//     try {
//       await invoke("register_user", {
//         form: { username, email, password },
//       });

//       set({ loading: false });
//       return true;
//     } catch (err: any) {
//       console.error("Tauri register error:", err);
//       set({
//         error: (err as string) ?? "Registration failed",
//         loading: false,
//       });
//       return false;
//     }
//   },

//   reset: () =>
//     set({
//       username: "",
//       email: "",
//       password: "",
//       adminpassword: "",
//       error: "",
//       loading: false,
//     }),
// }));


// stores/register.ts
import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
interface RegisterState {
  username: string;
  email: string;
  password: string;
  adminpassword: string;
  error: string;
  loading: boolean;
  setFormData: (
    data: Partial<
      Omit<RegisterState, "error" | "loading" | "setFormData" | "register" | "reset">
    >
  ) => void;
  register: () => Promise<boolean>;
  reset: () => void;
}

export const useRegisterStore = create<RegisterState>((set, get) => ({
  username: "",
  email: "",
  password: "",
  adminpassword: "",
  error: "",
  loading: false,

  setFormData: (data) => set((state) => ({ ...state, ...data })),

  register: async () => {
    const { username, email, password, adminpassword } = get();

    // Basic validation
    if (!username || !email || !password || !adminpassword) {
      set({ error: "All fields are required" });
      return false;
    }

    set({ loading: true, error: "" });

    try {
      // Call Rust backend command
      const response = await invoke<{ success: boolean; message: string; user_id?: number }>(
        "register_user", 
        {
          data: {
            username,
            email,
            password,
            adminpassword
          }
        }
      );

      if (!response.success) {
        set({ error: response.message, loading: false });
        return false;
      }

      set({ loading: false });
      return true;
    } catch (err) {
      console.error("Registration error:", err);
      set({ 
        error: typeof err === "string" ? err : "An error occurred during registration",
        loading: false 
      });
      return false;
    }
  },

  reset: async () => {
    // Optionally call the Rust reset command if you need backend cleanup
    try {
      await invoke("reset_register");
    } catch (err) {
      console.error("Reset error:", err);
    }
    
    set({
      username: "",
      email: "",
      password: "",
      adminpassword: "",
      error: "",
      loading: false,
    });
  }
}));