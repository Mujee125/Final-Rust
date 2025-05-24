
// import { create } from "zustand";
// import Database from "@tauri-apps/plugin-sql";

// // ----------------------
// // Types
// // ----------------------

// interface User {
//   id: number;
//   username: string;
//   email: string;
//   password?: string;
//   image?: string | null;
//   first_login: boolean;
// }

// interface AuthState {
//   user: User | null;
//   error: string | null;
//   login: (
//     email: string,
//     password: string
//   ) => Promise<{ success: boolean; isFirstLogin: boolean }>;
//   logout: () => Promise<void>;
//   loadSession: (navigate: (path: string) => void) => Promise<void>;
// }

// // ----------------------
// // Auth Store
// // ----------------------

// export const useAuthStore = create<AuthState>((set) => ({
//   user: null,
//   error: null,

//   // ----------------------
//   // Login
//   // ----------------------
//   login: async (email, password) => {
//     try {
//       const db = await Database.load("sqlite:learn_pos.db");

//       const users = await db.select<User[]>(
//         "SELECT id, username, email, password, image, first_login  FROM users WHERE email = ?",
//         [email]
//       );

//       if (users.length === 0) {
//         return { success: false, isFirstLogin: false };
//       }

//       const user = users[0];
//       const passwordMatches = user.password
//         ? await verifyPassword(password, user.password)
//         : false;

//       if (!passwordMatches) {
//         set({ error: "Invalid credentials." });
//         return { success: false, isFirstLogin: false };
//       }

//       // Save session in DB
//       const token = generateToken(); // Replace with your own logic
//       await db.execute(
//         "INSERT INTO sessions (user_id, token, is_active) VALUES (?, ?, 1)",
//         [user.id, token]
//       );
//       // Update first_login flag if it's their first login
//       let isFirstLogin = user.first_login;
//       if (isFirstLogin) {
//         await db.execute("UPDATE users SET first_login = 0 WHERE id = ?", [
//           user.id,
//         ]);
//       }

//       set({
//         user: {
//           id: user.id,
//           username: user.username,
//           email: user.email,
//           image: user.image || null,
//           first_login: false,
//         },
//         error: null,
//       });

//       return { success: true, isFirstLogin };
//     } catch (err) {
//       console.error("Login error:", err);
//       set({ error: "An error occurred. Please try again." });
//       return { success: false, isFirstLogin: false };
//     }
//   },

//   // ----------------------
//   // Logout
//   // ----------------------
//   logout: async () => {
//     try {
//       const db = await Database.load("sqlite:learn_pos.db");

//       const currentUser = useAuthStore.getState().user;
//       if (currentUser) {
//         await db.execute(
//           "UPDATE sessions SET is_active = 0 WHERE user_id = ? AND is_active = 1",
//           [currentUser.id]
//         );
//       }

//       set({ user: null, error: null });
//     } catch (err) {
//       console.error("Logout error:", err);
//     }
//   },

//   // ----------------------
//   // Load Session on App Start
//   // ----------------------
//   loadSession: async (navigate: (path: string) => void) => {
//     try {
//       const db = await Database.load("sqlite:learn_pos.db");

//       const session = await db.select<{ user_id: number }[]>(
//         "SELECT user_id FROM sessions WHERE is_active = 1 LIMIT 1"
//       );

//       if (session.length === 0) return;

//       const userResult = await db.select<User[]>(
//         "SELECT id, username, email, image, first_login FROM users WHERE id = ?",
//         [session[0].user_id]
//       );

//       if (userResult.length > 0) {
//         const user = userResult[0];
//         set({
//           user: {
//             id: user.id,
//             username: user.username,
//             email: user.email,
//             image: user.image || null,
//             first_login: user.first_login,
//           },
//           error: null,
//         });
//         navigate("/cart");
//       }
//     } catch (err) {
//       console.error("Failed to load session:", err);
//     }
//   },
// }));

// // ----------------------
// // Helper: Fake Password Verifier (replace with bcrypt)
// // ----------------------
// async function verifyPassword(
//   plainPassword: string,
//   hashedPassword: string
// ): Promise<boolean> {
//   return plainPassword === hashedPassword;
// }

// // ----------------------
// // Helper: Fake Token Generator
// // ----------------------
// function generateToken(): string {
//   return Math.random().toString(36).substring(2) + Date.now().toString(36);
// }


import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";

// ----------------------
// Types
// ----------------------

interface User {
  id: number;
  username: string;
  email: string;
  password?: string;
  image?: string | null;
  first_login: boolean;
}

interface AuthState {
  user: User | null;
  error: string | null;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; isFirstLogin: boolean }>;
  logout: () => Promise<void>;
  loadSession: (navigate: (path: string) => void) => Promise<void>;
}

// ----------------------
// Auth Store
// ----------------------

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  error: null,

  // ----------------------
  // Login
  // ----------------------
  login: async (email, password) => {
    try {
      const response = await invoke<{
        success: boolean;
        is_first_login: boolean;
        user: User | null;
      }>("login", {
        credentials: {
          email,
          password,
        },
      });

      if (!response.success || !response.user) {
        set({ error: "Invalid credentials." });
        return { success: false, isFirstLogin: false };
      }

      set({
        user: {
          id: response.user.id,
          username: response.user.username,
          email: response.user.email,
          image: response.user.image || null,
          first_login: false, // Updated by backend after first login
        },
        error: null,
      });

      return {
        success: true,
        isFirstLogin: response.is_first_login,
      };
    } catch (err) {
      console.error("Login error:", err);
      set({ error: "An error occurred. Please try again." });
      return { success: false, isFirstLogin: false };
    }
  },

  // ----------------------
  // Logout
  // ----------------------
  logout: async () => {
    try {
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        await invoke("logout", { userId: currentUser.id });
      }

      set({ user: null, error: null });
    } catch (err) {
      console.error("Logout error:", err);
    }
  },

  // ----------------------
  // Load Session on App Start
  // ----------------------
  loadSession: async (navigate: (path: string) => void) => {
    try {
      const user = await invoke<User | null>("load_session");

      if (user) {
        set({
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            image: user.image || null,
            first_login: user.first_login,
          },
          error: null,
        });
        navigate("/cart");
      }
    } catch (err) {
      console.error("Failed to load session:", err);
    }
  },
}));