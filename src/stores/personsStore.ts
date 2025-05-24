// import { create } from 'zustand';

// import Database from "@tauri-apps/plugin-sql";

// export interface Person {
//   id: number;
//   name: string;
//   role: string;
//   contact: string;
//   address: string;
//   remarks: string;
//   account: string;
//   invoices_no: number;
// }

// interface Invoice {
//   id: number;
//   invoice_no: string;
//   type: string;
//   date: string;
//   total: number;
// }

// interface PersonsStore {
//   persons: Person[];
//   filteredPersons: Person[];
//   invoices: Invoice[];
//   currentPerson: Partial<Person>;
//   loading: boolean;
//   error: string | null;
//   searchQuery: string;

//   // Actions
//   fetchPersons: () => Promise<void>;
//   fetchInvoicesByPersonId: (personId: number) => Promise<void>;
//   addPerson: (person: Omit<Person, "id" | "invoices_no">) => Promise<void>;
//   updatePerson: (person: Person) => Promise<void>;
//   deletePerson: (id: number) => Promise<void>;
//   setCurrentPerson: (person: Partial<Person>) => void;
//   clearCurrentPerson: () => void;
//   setSearchQuery: (query: string) => void;
//   filterPersons: () => void;
//   downloadCSV: () => void;
//   downloadPDF: () => void;
//   handleParsedData: (rows: Person[]) => Promise<void>;
// }

// export const usePersonsStore = create<PersonsStore>((set, get) => {
//   // Helper function to get database connection
//   const getDb = async () => {
//     return await Database.load('sqlite:learn_pos.db');
//   };

//   return {
//     persons: [],
//     filteredPersons: [],
//     invoices: [],
//     currentPerson: {
//       name: "",
//       role: "",
//       contact: "",
//       address: "",
//       remarks: "",
//       account: "",
//       invoices_no: 0,
//     },
//     loading: false,
//     error: null,
//     searchQuery: "",

//     fetchPersons: async () => {
//       set({ loading: true, error: null });
//       try {
//         const db = await getDb();
//         const result = await db.select<Person[]>(`
//           SELECT
//             persons.id,
//             persons.name,
//             persons.contact,
//             persons.account,
//             persons.address,
//             persons.role,
//             persons.remarks,
//             COUNT(invoices.id) AS invoices_no
//           FROM persons
//           LEFT JOIN invoices ON persons.id = invoices.person_id
//           GROUP BY persons.id
//           ORDER BY persons.id DESC
//         `);
//         set({ persons: result, filteredPersons: result, loading: false });
//       } catch (error) {
//         console.error("Error fetching persons:", error);
//         set({ error: "Failed to fetch persons", loading: false });
//       }
//     },

//     fetchInvoicesByPersonId: async (personId: number) => {
//       try {
//         const db = await getDb();
//         const result = await db.select<Invoice[]>(
//           `
//           SELECT invoices.*, SUM((cart.qty * cart.price - cart.discount) - invoices.discount + invoices.tax) AS total
//                      FROM invoices
//                      INNER JOIN persons ON invoices.person_id = persons.id
//                      LEFT JOIN cart ON invoices.id = cart.invoice_id
//                      WHERE invoices.person_id = ?
//                      GROUP BY invoices.id, invoices.discount, invoices.tax ORDER BY invoices.id DESC
//         `,
//           [personId]
//         );
//         set({ invoices: result });
//       } catch (error) {
//         console.error("Error fetching invoices:", error);
//         set({ error: "Failed to fetch invoices" });
//       }
//     },

//     addPerson: async (person) => {
//       try {
//         const db = await getDb();
//         const result = await db.execute(
//           `INSERT INTO persons (name, role, contact, address, remarks, account)
//           //  VALUES (?, ?, ?, ?, ?, ?)`,
//           [
//             person.name,
//             person.role,
//             person.contact,
//             person.address,
//             person.remarks,
//             person.account,
//           ]
//         );

//         if (result.rowsAffected > 0) {
//           get().fetchPersons();
//           get().clearCurrentPerson();
//         }
//       } catch (error) {
//         console.error("Error adding person:", error);
//         set({ error: "Failed to add person" });
//       }
//     },

//     updatePerson: async (person) => {
//       try {
//         const db = await getDb();
//         const result = await db.execute(
//           `UPDATE persons
//            SET name = ?, role = ?, contact = ?, address = ?, remarks = ?, account = ?
//            WHERE id = ?`,
//           [
//             person.name,
//             person.role,
//             person.contact,
//             person.address,
//             person.remarks,
//             person.account,
//             person.id,
//           ]
//         );

//         if (result.rowsAffected > 0) {
//           get().fetchPersons();
//           get().clearCurrentPerson();
//         }
//       } catch (error) {
//         console.error("Error updating person:", error);
//         set({ error: "Failed to update person" });
//       }
//     },

//     deletePerson: async (id) => {
//       if (!confirm("Are you sure you want to delete this person?")) return;

//       try {
//         const db = await getDb();
//         const result = await db.execute(`DELETE FROM persons WHERE id = ?`, [
//           id,
//         ]);

//         if (result.rowsAffected > 0) {
//           get().fetchPersons();
//           get().clearCurrentPerson();
//         }
//       } catch (error) {
//         console.error("Error deleting person:", error);
//         set({ error: "Failed to delete person" });
//       }
//     },

//     setCurrentPerson: (person) => {
//       set({ currentPerson: person });
//       if (person.id) {
//         get().fetchInvoicesByPersonId(person.id);
//         console.log("Fetching invoices for person ID:", person.id);
//       }
//     },

//     clearCurrentPerson: () => {
//       set({
//         currentPerson: {
//           name: "",
//           role: "",
//           contact: "",
//           address: "",
//           remarks: "",
//           account: "",
//           invoices_no: 0,
//         },
//         invoices: [],
//       });
//     },

//     setSearchQuery: (query) => {
//       set({ searchQuery: query });
//       get().filterPersons();
//     },

//     filterPersons: () => {
//       const { persons, searchQuery } = get();
//       if (!searchQuery) {
//         set({ filteredPersons: persons });
//         return;
//       }

//       const query = searchQuery.toLowerCase();
//       const filtered = persons.filter((person) =>
//         Object.values(person).some((value) =>
//           String(value).toLowerCase().includes(query)
//         )
//       );
//       set({ filteredPersons: filtered });
//     },

//     handleParsedData: async (rows: Person[]) => {
//       try {
//         const db = await getDb();

//         for (const row of rows) {
//           const cleaned = {
//             name: row.name?.trim() || "",
//             role: row.role?.trim() || "",
//             contact: row.contact?.trim() || "",
//             address: row.address?.trim() || "",
//             remarks: row.remarks?.trim() || "",
//             account: row.account?.trim() || "",
//           };

//           // Basic validation: name, role, and contact must be present
//           if (!cleaned.name || !cleaned.role || !cleaned.contact) continue;

//           try {
//             const result = await db.execute(
//               `INSERT INTO persons
//                 (name, role, contact,account, address, remarks, created_at, updated_at)
//                VALUES (?, ?, ?, ?, ?,?, datetime('now'), datetime('now'))
//                ON CONFLICT(contact) DO UPDATE SET
//                  name = excluded.name,
//                  role = excluded.role,
//                    account = excluded.account,
//                  address = excluded.address,
//                  remarks = excluded.remarks,
//                  updated_at = datetime('now')`,
//               [
//                 cleaned.name,
//                 cleaned.role,
//                 cleaned.contact,
//                 cleaned.account,
//                 cleaned.address,
//                 cleaned.remarks,
//               ]
//             );
//             console.log("trigger from personStore");
//             if (result.rowsAffected > 0) {
//               get().fetchPersons();
//               get().clearCurrentPerson();
//             }
//           } catch (rowError) {
//             console.error("Error inserting row:", cleaned.contact, rowError);
//           }
//         }

//         alert("Person data imported successfully!");
//       } catch (error) {
//         console.error("Error during person data import:", error);
//         alert("An error occurred while importing person data.");
//       }
//     },

//     downloadCSV: () => {
//       const { filteredPersons } = get();
//       const headers = [
//         "Name",
//         "Contact",
//         "Role",
//         "Address",
//         "Remarks",
//         "Invoices",
//       ];
//       const csvRows = [
//         headers.join(","),
//         ...filteredPersons.map((person) =>
//           [
//             person.name,
//             person.contact,
//             person.role,
//             person.address,
//             person.remarks,
//             person.invoices_no,
//           ]
//             .map((field) => `"${field?.toString().replace(/"/g, '""')}"`)
//             .join(",")
//         ),
//       ];

//       const csvContent = csvRows.join("\n");
//       const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//       const url = URL.createObjectURL(blob);
//       const link = document.createElement("a");
//       link.href = url;
//       link.download = "persons.csv";
//       link.click();
//     },

//     downloadPDF: async () => {
//       const jsPDF = (await import("jspdf")).default;
//       const { autoTable } = await import("jspdf-autotable");

//       const doc = new jsPDF();
//       doc.text("Persons List", 14, 10);

//       autoTable(doc, {
//         head: [["Name", "Contact", "Role", "Address", "Remarks", "Invoices"]],
//         body: get().filteredPersons.map((person) => [
//           person.name,
//           person.contact,
//           person.role,
//           person.address,
//           person.remarks,
//           person.invoices_no,
//         ]),
//         startY: 20,
//       });

//       doc.save("persons.pdf");
//     },
//   };
// });

import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";


await invoke("initialize_db");
export interface Person {
  id: number;
  name: string;
  role: string;
  contact: string;
  address: string;
  remarks: string;
  account: string;
  invoices_no: number;
}

interface Invoice {
  id: number;
  invoice_no: string;
  type: string;
  date: string;
  total: number;
}

interface PersonsStore {
  persons: Person[];
  filteredPersons: Person[];
  invoices: Invoice[];
  currentPerson: Partial<Person>;
  loading: boolean;
  error: string | null;
  searchQuery: string;

  // Actions
  fetchPersons: () => Promise<void>;
  fetchInvoicesByPersonId: (personId: number) => Promise<void>;
  addPerson: (person: Omit<Person, "id" | "invoices_no">) => Promise<void>;
  updatePerson: (person: Person) => Promise<void>;
  deletePerson: (id: number) => Promise<void>;
  setCurrentPerson: (person: Partial<Person>) => void;
  clearCurrentPerson: () => void;
  setSearchQuery: (query: string) => void;
  filterPersons: () => void;
  downloadCSV: () => void;
  downloadPDF: () => void;
  handleParsedData: (rows: Person[]) => Promise<void>;
}

export const usePersonsStore = create<PersonsStore>((set, get) => ({
  persons: [],
  filteredPersons: [],
  invoices: [],
  currentPerson: {
    name: "",
    role: "",
    contact: "",
    address: "",
    remarks: "",
    account: "",
    invoices_no: 0,
  },
  loading: false,
  error: null,
  searchQuery: "",

  fetchPersons: async () => {
    set({ loading: true, error: null });
    try {
      const result = await invoke<Person[]>("get_all_persons_command");
      set({ persons: result, filteredPersons: result, loading: false });
    } catch (error) {
      console.error("Error fetching persons:", error);
      set({ error: "Failed to fetch persons", loading: false });
    }
  },

  fetchInvoicesByPersonId: async (personId: number) => {
    try {
      const result = await invoke<Invoice[]>(
        "get_invoices_by_person_id_command",
        {
          personId,
        }
      );
      set({ invoices: result });
    } catch (error) {
      console.error("Error fetching invoices:", error);
      set({ error: "Failed to fetch invoices" });
    }
  },

  addPerson: async (person) => {
    try {
      console.log("in create person ")
      const result = await invoke<number>("create_person", { person });
      if (result > 0) {
        get().fetchPersons();
        get().clearCurrentPerson();
      }
    } catch (error) {
      console.error("Error adding person:", error);
      set({ error: "Failed to add person" });
    }
  },

  updatePerson: async (person) => {
    try {
      const result = await invoke<number>("update_person_command", { person });
      if (result > 0) {
        get().fetchPersons();
        get().clearCurrentPerson();
      }
    } catch (error) {
      console.error("Error updating person:", error);
      set({ error: "Failed to update person" });
    }
  },

  deletePerson: async (id) => {
    if (!confirm("Are you sure you want to delete this person?")) return;

    try {
      const result = await invoke<number>("delete_person_command", { id });
      if (result > 0) {
        get().fetchPersons();
        get().clearCurrentPerson();
      }
    } catch (error) {
      console.error("Error deleting person:", error);
      set({ error: "Failed to delete person" });
    }
  },

  setCurrentPerson: (person) => {
    set({ currentPerson: person });
    if (person.id) {
      get().fetchInvoicesByPersonId(person.id);
      console.log("Fetching invoices for person ID:", person.id);
    }
  },

  clearCurrentPerson: () => {
    set({
      currentPerson: {
        name: "",
        role: "",
        contact: "",
        address: "",
        remarks: "",
        account: "",
        invoices_no: 0,
      },
      invoices: [],
    });
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().filterPersons();
  },

  filterPersons: () => {
    const { persons, searchQuery } = get();
    if (!searchQuery) {
      set({ filteredPersons: persons });
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = persons.filter((person) =>
      Object.values(person).some((value) =>
        String(value).toLowerCase().includes(query)
      )
    );
    set({ filteredPersons: filtered });
  },

  handleParsedData: async (rows: Person[]) => {
    try {
      for (const row of rows) {
        const cleaned = {
          name: row.name?.trim() || "",
          role: row.role?.trim() || "",
          contact: row.contact?.trim() || "",
          address: row.address?.trim() || "",
          remarks: row.remarks?.trim() || "",
          account: row.account?.trim() || "",
        };

        // Basic validation: name, role, and contact must be present
        if (!cleaned.name || !cleaned.role || !cleaned.contact) continue;

        try {
          const result = await invoke<number>("create_person", {
            person: cleaned,
          });
          if (result > 0) {
            get().fetchPersons();
            get().clearCurrentPerson();
          }
        } catch (rowError) {
          console.error("Error inserting row:", cleaned.contact, rowError);
        }
      }

      alert("Person data imported successfully!");
    } catch (error) {
      console.error("Error during person data import:", error);
      alert("An error occurred while importing person data.");
    }
  },

  downloadCSV: () => {
    const { filteredPersons } = get();
    const headers = [
      "Name",
      "Contact",
      "Role",
      "Address",
      "Remarks",
      "Invoices",
    ];
    const csvRows = [
      headers.join(","),
      ...filteredPersons.map((person) =>
        [
          person.name,
          person.contact,
          person.role,
          person.address,
          person.remarks,
          person.invoices_no,
        ]
          .map((field) => `"${field?.toString().replace(/"/g, '""')}"`)
          .join(",")
      ),
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "persons.csv";
    link.click();
  },

  downloadPDF: async () => {
    const jsPDF = (await import("jspdf")).default;
    const { autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF();
    doc.text("Persons List", 14, 10);

    autoTable(doc, {
      head: [["Name", "Contact", "Role", "Address", "Remarks", "Invoices"]],
      body: get().filteredPersons.map((person) => [
        person.name,
        person.contact,
        person.role,
        person.address,
        person.remarks,
        person.invoices_no,
      ]),
      startY: 20,
    });

    doc.save("persons.pdf");
  },
}));