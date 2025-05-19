

import { useState, useEffect } from "react";
import {
  FaReceipt,
  FaSearch,
  FaUpload,
  FaEdit,
  FaTrashAlt,
  FaPlusCircle,
  FaBox,
} from "react-icons/fa";
import { Invoice, useInvoiceStore } from "../stores/invoiceStore"; // Update with the correct path
import { useCartStore } from "../stores/cartStore";
import { useLocation } from "wouter";

const InvoicePage = () => {
  const [isDarkMode,] = useState(false);

  // Get state and actions from the store
  const {
   
    filteredData,
    invoiceItems,
    searchQuery,
    invoice,
    fetchTableData,

    selectInvoice,
    deleteInvoice,
    downloadCSV,
    downloadPDF,
    setInvoice,
    setSearchQuery,
  } = useInvoiceStore();
  const { initializeData } = useCartStore();
    
    const [, setLocation] = useLocation();
  
  const fetchInvoiceForCart = async (invoiceId: number) => {
    setLocation(`/cart`);
    await initializeData(invoiceId);
    
  };
  // Fetch data on component mount
  useEffect(() => {
    fetchTableData();
  }, [fetchTableData]);

  const handleSelectInvoice = async (selectedInvoice: Invoice) => {
    await selectInvoice(selectedInvoice);
  };

  const handleDeleteInvoice = async () => {
    await deleteInvoice();
  };

  return (
    <div className={`flex overflow-hidden ${isDarkMode ? "dark-mode" : ""}`}>
      {/* Left: Product Table */}
      <div
        className="lefttable p-1"
        style={{
          maxHeight: "calc(100vh - 4rem)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Add New Button and Export Icons */}
        <div className="flex justify-between items-center mb-4">
          {/* Product List Heading */}
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <FaReceipt className="highlight mr-2" />
            Invoices List
          </h2>

          {/* Search Bar */}
          <div className="relative w-80">
            <input
              type="text"
              placeholder="Search Invoices..."
              className="w-full p-2 pl-10 pr-4 border-light rounded-md shadow-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>

          <div className="flex items-center">
            {/* Export Buttons */}
            <button
              onClick={downloadCSV}
              id="downloadCSV"
              className="buttons bg-green-300 hover:bg-green-400 text-sm mr-1 flex items-center"
            >
              <FaUpload className="mr-1" /> Export CSV
            </button>
            <button
              onClick={downloadPDF}
              className="buttons bg-red-300 hover:bg-red-400 text-sm flex items-center"
            >
              <FaUpload className="mr-1" /> Export PDF
            </button>
          </div>
        </div>

        {/* Table Wrapper */}
        <div
          className="overflow-y-auto border-light rounded-lg shadow-md"
          style={{ maxHeight: "76vh" }}
        >
          <table id="tableData" className="min-w-full bg-white border-collapse">
            <thead className="bg-gray-200 sticky top-0 shadow-md">
              <tr className="border-light">
                <th className="py-1 lg:py-2 px-4  text-sm capitalize text-left">
                  Invoice No.
                </th>
                <th className="py-1 lg:py-2 px-4  text-sm capitalize text-left">
                  Type
                </th>
                <th className="py-1 lg:py-2 px-4  text-sm capitalize text-left">
                  Date
                </th>
                <th className="py-1 lg:py-2 px-4  text-sm capitalize text-left">
                  Person
                </th>
                <th className="py-1 lg:py-2 px-4  text-sm capitalize text-left">
                  Discount
                </th>
                <th className="py-1 lg:py-2 px-4  text-sm capitalize text-left">
                  Tax
                </th>
                <th className="py-1 lg:py-2 px-4  text-sm capitalize text-left">
                  Received
                </th>
                <th className="py-1 lg:py-2 px-4  text-sm capitalize text-left">
                  User
                </th>
                <th className="py-1 lg:py-2 px-4  text-sm capitalize text-left">
                  Edit
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  onClick={() => handleSelectInvoice(row)}
                  className="cursor-pointer hover:bg-gray-100 border-light"
                >
                  <td className="py-1 lg:py-2 px-4  text-sm">
                    <a>
                      <span>{row.invoice_no}</span>
                    </a>
                  </td>
                  <td className="py-1 lg:py-2 px-4  text-sm">
                    <a>
                      <span>{row.type}</span>
                    </a>
                  </td>
                  <td className="py-1 lg:py-2 px-4  text-sm">
                    <a>
                      <span>{row.date}</span>
                    </a>
                  </td>
                  <td className="py-1 lg:py-2 px-4  text-sm">
                    <a>
                      <span>{row.person}</span>
                    </a>
                  </td>
                  <td className="py-1 lg:py-2 px-4  text-sm">
                    <a>
                      <span>{row.discount_amount?.toFixed(2)}</span>
                    </a>
                  </td>
                  <td className="py-1 lg:py-2 px-4  text-sm">
                    <a>
                      <span>{row.tax_amount?.toFixed(2)}</span>
                    </a>
                  </td>
                  <td className="py-1 lg:py-2 px-4  text-sm">
                    <a>
                      <span>{row.received}</span>
                    </a>
                  </td>
                  <td className="py-1 lg:py-2 px-4  text-sm">
                    <a>
                      <span>{row.user}</span>
                    </a>
                  </td>
                  <td className="py-1 lg:py-2 px-4  text-blue-500 hover:text-blue-700 text-sm">
                    {/* Edit Button */}
                    <button
                      onClick={() => {
                        if (invoice.id) {
                          fetchInvoiceForCart(Number(invoice.id));
                        } else {
                          console.error("Invoice ID is undefined");
                        }
                      }}
                      title="Edit Invoice"
                      className="text-blue-500 hover:text-blue-700 cursor-pointer"
                    >
                      <FaEdit />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right: Add New Product Form */}
      <div
        className="rightform p-4 fixed top-11 right-0 h-full bottom-0 left-auto overflow-y-auto bg-white shadow-lg rounded-lg"
        style={{ maxHeight: "calc(100vh - 4rem)" }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg">
            <FaPlusCircle className="highlight mr-1" />
            Invoice Details
          </h2>
          {invoice.id && (
            <div className="flex space-x-4">
              {/* Edit Button */}
              <button
                onClick={() => {
                  if (invoice.id) {
                    fetchInvoiceForCart(Number(invoice.id));
                  } else {
                    console.error("Invoice ID is undefined");
                  }
                }}
                title="Edit Invoice"
                className="text-blue-500 hover:text-blue-700 cursor-pointer"
              >
                <FaEdit />
              </button>
              {/* Delete Button */}
              <button
                title="Delete Invoice"
                onClick={handleDeleteInvoice}
                className="text-red-400 hover:text-red-600"
              >
                <FaTrashAlt />
              </button>
            </div>
          )}
        </div>
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {/* Invoice Number Input */}
            <div>
              <label htmlFor="invoiceNo" className="block text-xs font-medium">
                Invoice Number
              </label>
              <input
                type="text"
                value={invoice.invoice_no}
                onChange={(e) =>
                  setInvoice({ ...invoice, invoice_no: e.target.value })
                }
                id="invoiceNo"
                className="w-full p-2 text-sm border-light rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter invoice number"
              />
            </div>

            {/* Type Input */}
            <div>
              <label
                htmlFor="invoiceType"
                className="block text-xs font-medium"
              >
                Type
              </label>
              <input
                value={invoice.type}
                onChange={(e) =>
                  setInvoice({ ...invoice, type: e.target.value })
                }
                type="text"
                id="invoiceType"
                className="w-full p-2 text-sm border-light rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter type (e.g., Sale, Purchase)"
              />
            </div>

            {/* Date Input */}
            <div>
              <label
                htmlFor="invoiceDate"
                className="block text-xs font-medium"
              >
                Date
              </label>
              <input
                value={invoice.date}
                onChange={(e) =>
                  setInvoice({ ...invoice, date: e.target.value })
                }
                type="date"
                id="invoiceDate"
                className="w-full p-2 text-sm border-light rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Discount Input */}
            <div>
              <label
                htmlFor="invoiceDiscount"
                className="block text-xs font-medium"
              >
                Discount (%)
              </label>
              <input
                value={invoice.discount || 0}
                onChange={(e) =>
                  setInvoice({
                    ...invoice,
                    discount: parseFloat(e.target.value) || 0,
                  })
                }
                type="number"
                step="0.01"
                id="invoiceDiscount"
                className="w-full p-2 text-sm border-light rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter discount percentage"
              />
            </div>

            {/* Tax Input */}
            <div>
              <label htmlFor="invoiceTax" className="block text-xs font-medium">
                Tax (%)
              </label>
              <input
                value={invoice.tax || 0}
                onChange={(e) =>
                  setInvoice({
                    ...invoice,
                    tax: parseFloat(e.target.value) || 0,
                  })
                }
                type="number"
                step="0.01"
                id="invoiceTax"
                className="w-full p-2 text-sm border-light rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter tax percentage"
              />
            </div>

            {/* Remarks Input */}
            <div>
              <label
                htmlFor="invoiceRemarks"
                className="block text-xs font-medium"
              >
                Remarks
              </label>
              <textarea
                value={invoice.remarks || ""}
                onChange={(e) =>
                  setInvoice({ ...invoice, remarks: e.target.value })
                }
                id="invoiceRemarks"
                className="w-full p-2 text-sm border-light rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter any remarks"
              />
            </div>
          </div>
        </form>

        {/* Compact Product Table */}
        <div className="mt-6">
          <h3 className="text-sm mb-2">
            <FaBox className="highlight mr-1" />
            Items List
          </h3>
          <table className="table-auto w-full text-xs border-collapse">
            <thead>
              <tr className="border-light">
                <th className="p-1 border-light text-left">Name</th>
                <th className="p-1 border-light text-left">Category</th>
                <th className="p-1 border-light text-left">Unit</th>
                <th className="p-1 border-light text-left">Qty</th>
                <th className="p-1 border-light text-left">Price</th>
                <th className="p-1 border-light text-left">Discount</th>
                <th className="p-1 border-light text-left">Sub</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {invoiceItems.map((item, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="p-1 ">{item.name}</td>
                  <td className="p-1 ">{item.category}</td>
                  <td className="p-1 ">{item.unit}</td>
                  <td className="p-1 ">{item.qty}</td>
                  <td className="p-1 ">{item.price}</td>
                  <td className="p-1 ">{item.discount}</td>
                  <td className="p-1 ">
                    {(item.qty * item.price - item.discount).toFixed(0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;