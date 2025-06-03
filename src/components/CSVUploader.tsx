// import React, { useState, useCallback } from "react";
// import  Database  from "@tauri-apps/plugin-sql";
// import Papa from "papaparse";

// type StockRow = {
//   name: string;
//   code: string;
//   type: string;
//   category: string;
//   unit: string;
//   qty: number;
//   min_qty: number;
//   target_qty: number;
//   sale_price: number;
//   purchase_price: number;
//   discount: number;
//   expiry: string;
//   location: string;
//   remarks: string;
// };

// const CSVUploader: React.FC = () => {
//   const [csvData, setCsvData] = useState<StockRow[]>([]);
//   const [error, setError] = useState<string | null>(null);
//   const [importing, setImporting] = useState(false);

//   const handleFile = useCallback((file: File) => {
//     Papa.parse(file, {
//       header: true,
//       skipEmptyLines: true,
//       complete: (results) => {
//         const rows = results.data as any[];

//         const cleaned: StockRow[] = rows.map((row) => ({
//           name: row.name?.trim() || "",
//           code: row.code?.trim() || "",
//           type: row.type?.trim() || "",
//           category: row.category?.trim() || "",
//           unit: row.unit?.trim() || "",
//           qty: parseInt(row.qty) || 0,
//           min_qty: parseInt(row.min_qty) || 0,
//           target_qty: parseInt(row.target_qty) || 0,
//           sale_price: parseFloat(row.sale_price) || 0,
//           purchase_price: parseFloat(row.purchase_price) || 0,
//           discount: parseFloat(row.discount) || 0,
//           expiry: /^\d{4}-\d{2}-\d{2}$/.test(row.expiry) ? row.expiry : "",
//           location: row.location?.trim() || "",
//           remarks: row.remarks?.trim() || "",
//         }));

//         setCsvData(cleaned);
//         setError(null);
//       },
//       error: (err) => {
//         setError("Failed to parse CSV: " + err.message);
//       },
//     });
//   }, []);

//   const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
//     e.preventDefault();
//     const file = e.dataTransfer.files[0];
//     if (file && file.type === "text/csv") {
//       handleFile(file);
//     } else {
//       setError("Only CSV files are supported.");
//     }
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file && file.type === "text/csv") {
//       handleFile(file);
//     } else {
//       setError("Please select a valid CSV file.");
//     }
//   };

//   const saveToDatabase = async () => {
//     try {
//       setImporting(true);
//       const db = await Database.load("sqlite:learn_pos.db");
//       let inserted = 0;

//       for (const row of csvData) {
//         if (!row.name || !row.code) continue;

//         await db.execute(
//           `INSERT INTO stock
//             (name, code, type, category, unit, qty, min_qty, target_qty, sale_price, purchase_price, discount, expiry, location, remarks, created_at, updated_at)
//            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
//            ON CONFLICT(code) DO UPDATE SET
//              name=excluded.name, qty=excluded.qty, updated_at=datetime('now')`,
//           [
//             row.name,
//             row.code,
//             row.type,
//             row.category,
//             row.unit,
//             row.qty,
//             row.min_qty,
//             row.target_qty,
//             row.sale_price,
//             row.purchase_price,
//             row.discount,
//             row.expiry,
//             row.location,
//             row.remarks,
//           ]
//         );
//         inserted++;
//       }

//       alert(`${inserted} records saved successfully.`);
//       setCsvData([]);
//     } catch (err) {
//       console.error(err);
//       setError("Failed to save to database.");
//     } finally {
//       setImporting(false);
//     }
//   };

//   return (
//     <div className="p-6 space-y-4">
//       <h2 className="text-xl font-semibold">📥 Import CSV File</h2>

//       {/* Drag & Drop Area */}
//       <div
//         onDrop={handleDrop}
//         onDragOver={(e) => e.preventDefault()}
//         className="w-full h-40 border-4 border-dashed border-blue-400 rounded-lg flex items-center justify-center text-gray-500 hover:border-blue-600"
//       >
//         Drag & Drop your CSV file here
//       </div>

//       {/* File Input as fallback */}
//       <label htmlFor="csv-upload" className="block text-sm font-medium text-gray-700">
//         Or select a CSV file:
//       </label>
//       <input
//         id="csv-upload"
//         type="file"
//         accept=".csv"
//         onChange={handleFileChange}
//         title="Select a CSV file to upload"
//         placeholder="Choose CSV file"
//         className="file:mr-4 file:py-2 file:px-4
//                    file:rounded-full file:border-0
//                    file:text-sm file:font-semibold
//                    file:bg-blue-500 file:text-white
//                    hover:file:bg-blue-600"
//       />

//       {/* Error Message */}
//       {error && <div className="text-red-500">{error}</div>}

//       {/* Preview Table */}
//       {csvData.length > 0 && (
//         <>
//           <h3 className="text-lg font-semibold">📋 Preview Data</h3>
//           <div className="overflow-auto max-h-64 border border-gray-300 rounded">
//             <table className="min-w-full text-sm text-left table-auto">
//               <thead className="bg-gray-100 sticky top-0">
//                 <tr>
//                   {Object.keys(csvData[0]).map((key) => (
//                     <th key={key} className="px-3 py-2 border">
//                       {key}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {csvData.slice(0, 10).map((row, idx) => (
//                   <tr key={idx} className="even:bg-gray-50">
//                     {Object.values(row).map((val, i) => (
//                       <td key={i} className="px-3 py-1 border">
//                         {val}
//                       </td>
//                     ))}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//           <p className="text-sm text-gray-600">Showing first 10 rows.</p>

//           <button
//             onClick={saveToDatabase}
//             disabled={importing}
//             className="mt-4 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
//           >
//             {importing ? "Importing..." : "Save to Database"}
//           </button>
//         </>
//       )}
//     </div>
//   );
// };

// export default CSVUploader;

// import React, { useState, useCallback } from "react";
// import Papa from "papaparse";
// import Database from "@tauri-apps/plugin-sql";
// import { FaDownload } from "react-icons/fa";

// export type StockRow = {
//   name: string;
//   code: string;
//   type: string;
//   category: string;
//   unit: string;
//   qty: number;
//   min_qty: number;
//   target_qty: number;
//   sale_price: number;
//   purchase_price: number;
//   discount: number;
//   expiry: string;
//   location: string;
//   remarks: string;
// };

// type CSVUploaderProps = {
//   onUploadComplete?: (data: StockRow[]) => void;
//   saveToDatabase?: boolean;
// };

// const CSVUploader: React.FC<CSVUploaderProps> = ({
//   onUploadComplete,
//   saveToDatabase = true,
// }) => {
//   const [error, setError] = useState<string | null>(null);
//   const [importing, setImporting] = useState(false);

//   const handleFile = useCallback(
//     (file: File) => {
//       Papa.parse(file, {
//         header: true,
//         skipEmptyLines: true,
//         complete: async (results) => {
//           try {
//             const rows = results.data as any[];
//             const cleaned: StockRow[] = rows.map((row) => ({
//               name: row.name?.trim() || "",
//               code: row.code?.trim() || "",
//               type: row.type?.trim() || "",
//               category: row.category?.trim() || "",
//               unit: row.unit?.trim() || "",
//               qty: parseInt(row.qty) || 0,
//               min_qty: parseInt(row.min_qty) || 0,
//               target_qty: parseInt(row.target_qty) || 0,
//               sale_price: parseFloat(row.sale_price) || 0,
//               purchase_price: parseFloat(row.purchase_price) || 0,
//               discount: parseFloat(row.discount) || 0,
//               expiry: /^\d{4}-\d{2}-\d{2}$/.test(row.expiry) ? row.expiry : "",
//               location: row.location?.trim() || "",
//               remarks: row.remarks?.trim() || "",
//             }));

//             if (saveToDatabase) {
//               setImporting(true);
//               const db = await Database.load("sqlite:learn_pos.db");

//               for (const row of cleaned) {
//                 if (!row.name || !row.code) continue;

//                 await db.execute(
//                   `INSERT INTO stock 
//                   (name, code, type, category, unit, qty, min_qty, target_qty, sale_price, purchase_price, discount, expiry, location, remarks, created_at, updated_at)
//                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
//                  ON CONFLICT(code) DO UPDATE SET 
//                    name=excluded.name, qty=excluded.qty, updated_at=datetime('now')`,
//                   [
//                     row.name,
//                     row.code,
//                     row.type,
//                     row.category,
//                     row.unit,
//                     row.qty,
//                     row.min_qty,
//                     row.target_qty,
//                     row.sale_price,
//                     row.purchase_price,
//                     row.discount,
//                     row.expiry,
//                     row.location,
//                     row.remarks,
//                   ]
//                 );
//               }
//             }

//             if (onUploadComplete) {
//               onUploadComplete(cleaned);
//             }

//             setError(null);
//           } catch (err) {
//             console.error(err);
//             setError("Failed to process CSV file.");
//           } finally {
//             setImporting(false);
//           }
//         },
//         error: (err) => {
//           setError("Failed to parse CSV: " + err.message);
//         },
//       });
//     },
//     [onUploadComplete, saveToDatabase]
//   );

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file && file.type === "text/csv") {
//       handleFile(file);
//     } else {
//       setError("Please select a valid CSV file.");
//     }
//   };

//   return (
//     <>
  
//       <label
//         htmlFor="csv-upload"
//         className=" px-4 py-2 bg-yellow-400 hover:bg-yellow-500 rounded-md shadow-md text-sm ml-4 flex items-center"
//       >
//         <FaDownload className="mr-1" /> Import CSV
//       </label>
//       <input
//         title="Upload CSV"
//         type="file"
//         id="csv-upload"
//         onChange={handleFileChange}
//         accept=".csv"
//         style={{ display: "none" }}
//       />
//       {importing && <p className="text-blue-600 text-sm">Importing...</p>}
//       {error && <p className="text-red-500 text-sm">{error}</p>}
//     </>
//   );
// };

// export default CSVUploader;
import React, { useState } from "react";
import Papa from "papaparse";
import { FaDownload } from "react-icons/fa";

type CSVUploaderProps = {
  onFileParsed: (data: any[]) => Promise<void>; // callback to process parsed data
  onUploadComplete?: (data: any[]) => void; // optional callback after success
};

const CSVUploader: React.FC<CSVUploaderProps> = ({
  onFileParsed,
  onUploadComplete,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/csv") {
      setError("Please select a valid CSV file.");
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          setImporting(true);
          const rows = results.data as any[];
          await onFileParsed(rows); // custom logic from parent
          if (onUploadComplete) {
            onUploadComplete(rows);
          }
          setError(null);
        } catch (err) {
          console.error(err);
          setError("Failed to process CSV file.");
        } finally {
          setImporting(false);
        }
      },
      error: (err) => {
        setError("Failed to parse CSV: " + err.message);
      },
    });
  };

  return (
    <>
      <label
        htmlFor="csv-upload"
        className=" px-4 py-2 bg-yellow-400 hover:bg-yellow-500 rounded-md shadow-md text-sm ml-4 flex items-center"
      >
        <FaDownload className="mr-1" /> Import CSV
      </label>
      <input
        title="Upload CSV"
        type="file"
        id="csv-upload"
        onChange={handleFileChange}
        accept=".csv"
        style={{ display: "none" }}
      />
      {importing && <p className="text-blue-600 text-sm">Importing...</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </>
  );
};

export default CSVUploader;
