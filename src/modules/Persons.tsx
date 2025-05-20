import React, { useEffect, useRef } from "react";
import { Person, usePersonsStore } from "../stores/personsStore";
import {
  FaSearch,
  FaDownload,
  FaUpload,
  FaPlus,
  FaEdit,
  FaTrashAlt,
  FaTimes,
  FaPlusCircle,
} from "react-icons/fa";
import ExtendableDropdown from "../components/ExtendableDropdown";
import { useCartStore } from "../stores/cartStore";
import { useLocation } from "wouter";
import { FaBox, FaUsers } from "react-icons/fa6";
import CSVUploader from "../components/CSVUploader";

const Persons: React.FC = () => {
  const {
    
    filteredPersons,
    invoices,
    currentPerson,
 
    searchQuery,
    fetchPersons,
  handleParsedData,
   
    addPerson,
    updatePerson,
    deletePerson,
    setCurrentPerson,
    clearCurrentPerson,
    setSearchQuery,
    downloadCSV,
    downloadPDF,
  } = usePersonsStore();

  const { initializeData } = useCartStore();
  
  const [, setLocation] = useLocation();

  const fetchInvoiceForCart = async (invoiceId: number) => {
    setLocation(`/cart`);
    await initializeData(invoiceId);
      
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPersons();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Handle CSV import here
      console.log("File selected:", e.target.files[0]);
      // You would implement the actual CSV import logic here
    }
  };

  const openFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex overflow-hidden">
      {/* Left: Product Table */}
      <div
        className="lefttable p-1 overflow-y-auto"
        style={{ maxHeight: "calc(100vh - 4rem)" }}
      >
        {/* Add New Button and Export Icons */}
        <div className="flex justify-between items-center mb-4">
          {/* Product List Heading */}
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <FaUsers className=" highlight mr-2 w-[25px] h-[20px]" />
            Persons List
            <CSVUploader onFileParsed={handleParsedData} />
          </h2>

          {/* Search Bar */}
          <div className="relative w-80">
            <input
              type="text"
              placeholder="Search Person..."
              className="bg-white w-full p-2 pl-10 pr-4 border-light rounded-md shadow-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>

          <div className="flex items-center">
            {/* Export Buttons */}
            <button
              onClick={downloadCSV}
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

        <div
          className="overflow-y-auto shadow-md rounded-lg"
          style={{ maxHeight: "76vh" }}
        >
          <table id="tableData" className="min-w-full bg-white border-collapse">
            <thead className="bg-gray-200 sticky top-0 shadow-md">
              <tr>
                <th className="py-1 lg:py-2 px-4 border-b border-gray-100 text-sm capitalize text-left">
                  Name
                </th>
                <th className="py-1 lg:py-2 px-4 border-b  border-gray-100 text-sm capitalize text-left">
                  Contact
                </th>
                <th className="py-1 lg:py-2 px-4 border-b border-gray-100 text-sm capitalize text-left">
                  Role
                </th>
                <th className="py-1 lg:py-2 px-4 border-b border-gray-100 text-sm capitalize text-left">
                  Address
                </th>
                <th className="py-1 lg:py-2 px-4 border-b border-gray-100 text-sm capitalize text-left">
                  Remarks
                </th>
                <th className="py-1 lg:py-2 px-4 border-b border-gray-100 text-sm capitalize text-left">
                  Invoices
                </th>
              </tr>
            </thead>
            <tbody className="overflow-y-auto">
              {filteredPersons.map((person) => (
                <tr
                  key={person.id}
                  onClick={() => setCurrentPerson(person)}
                  className="cursor-pointer hover:bg-gray-100"
                >
                  <td className="py-1 lg:py-2 px-4 border-b border-gray-100 text-sm">
                    <span>{person.name}</span>
                  </td>
                  <td className="py-1 lg:py-2 px-4 border-b border-gray-100 text-sm">
                    <span>{person.contact}</span>
                  </td>
                  <td className="py-1 lg:py-2 px-4 border-b border-gray-100 text-sm">
                    <span>{person.role}</span>
                  </td>
                  <td className="py-1 lg:py-2 px-4 border-b border-gray-100 text-sm">
                    <span>{person.address}</span>
                  </td>
                  <td className="py-1 lg:py-2 px-4 border-b border-gray-100 text-sm">
                    <span>{person.remarks}</span>
                  </td>
                  <td className="py-1 lg:py-2 px-4 border-b border-gray-100 text-sm">
                    <span>{person.invoices_no}</span>
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
          <h2 className="text-lg flex items-center">
            <FaPlusCircle className="highlight mr-1 inline" />
            Manage Person
          </h2>
          <div className="flex space-x-4">
            {currentPerson.id && currentPerson.invoices_no === 0 && (
              <button
                title="Delete"
                onClick={() =>
                  currentPerson.id && deletePerson(currentPerson.id)
                }
                className="text-red-400 hover:text-red-600"
              >
                <FaTrashAlt />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {/* Name Input */}
            <div>
              <label htmlFor="personName" className="block text-xs font-medium">
                Name
              </label>
              <input
                type="text"
                id="personName"
                value={currentPerson.name || ""}
                onChange={(e) =>
                  setCurrentPerson({ ...currentPerson, name: e.target.value })
                }
                className="w-full p-2 text-sm border-light rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter Name"
              />
            </div>

            {/* Contact Input */}
            <div>
              <label
                htmlFor="personContact"
                className="block text-xs font-medium"
              >
                Contact
              </label>
              <input
                type="text"
                id="personContact"
                value={currentPerson.contact || ""}
                onChange={(e) =>
                  setCurrentPerson({
                    ...currentPerson,
                    contact: e.target.value,
                  })
                }
                className="w-full p-2 text-sm border-light rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter Contact Information (e.g., phone, email)"
              />
            </div>

            <ExtendableDropdown
              value={currentPerson.role || ""}
              onChange={(value) =>
                setCurrentPerson({ ...currentPerson, role: value })
              }
              label="Role"
              placeholder="Enter Role"
              tableName="roles"
            />

            {/* Account Input */}
            <div>
              <label
                htmlFor="personAccount"
                className="block text-xs font-medium"
              >
                Account No.
              </label>
              <input
                type="text"
                id="personAccount"
                value={currentPerson.account || ""}
                onChange={(e) =>
                  setCurrentPerson({
                    ...currentPerson,
                    account: e.target.value,
                  })
                }
                className="w-full p-2 text-sm border-light rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter Account Information"
              />
            </div>

            {/* Address Input */}
            <div>
              <label
                htmlFor="personAddress"
                className="block text-xs font-medium"
              >
                Address
              </label>
              <textarea
                id="personAddress"
                value={currentPerson.address || ""}
                onChange={(e) =>
                  setCurrentPerson({
                    ...currentPerson,
                    address: e.target.value,
                  })
                }
                className="w-full p-2 text-sm border-light rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter Address"
                rows={3}
              />
            </div>

            {/* Remarks Input */}
            <div>
              <label
                htmlFor="personRemarks"
                className="block text-xs font-medium"
              >
                Remarks
              </label>
              <textarea
                id="personRemarks"
                value={currentPerson.remarks || ""}
                onChange={(e) =>
                  setCurrentPerson({
                    ...currentPerson,
                    remarks: e.target.value,
                  })
                }
                className="w-full p-2 text-sm border-light rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter Remarks"
                rows={3}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            {currentPerson.id && (
              <button
                onClick={() => updatePerson(currentPerson as Person)}
                className="buttons bg-blue-500 hover:bg-blue-600 text-white text-sm flex items-center"
              >
                <FaEdit className="mr-2" />
                Update
              </button>
            )}
            <button
              onClick={() =>
                addPerson(currentPerson as Omit<Person, "id" | "invoices_no">)
              }
              className="buttons limebtn text-sm flex items-center"
            >
              <FaPlus className="mr-2" />
              Add as New
            </button>

            <button
              onClick={clearCurrentPerson}
              type="button"
              className="buttons text-white bg-gray-500 hover:bg-gray-700 text-sm flex items-center"
            >
              <FaTimes className="mr-2" />
              Clear
            </button>
          </div>
        </div>

        {/* Compact Product Table */}
        <div className="mt-6">
          <h3 className="text-sm mb-2">
            <FaBox className="mr-2 highlight" />
            Recent Invoices of Selected Person
          </h3>
          <table className="table-auto w-full text-xs border-collapse">
            <thead>
              <tr className="border-light">
                <th className="p-1  text-left">Invoice No.</th>
                <th className="p-1  text-left">Type</th>
                <th className="p-1  text-left">Date</th>
                <th className="p-1  text-left">Amount</th>
                <th className="p-1  text-left">Edit</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-light">
                  <td className="p-1 ">{invoice.invoice_no}</td>
                  <td className="p-1 ">{invoice.type}</td>
                  <td className="p-1 ">{invoice.date}</td>
                  <td className="p-1 ">{invoice.total?.toFixed(0) ?? 0}</td>
                  <td
                    className="py-2 px-4 
                  
                  text-blue-500 hover:text-blue-700 text-sm"
                  >
                    <button
                      onClick={() => {
                        fetchInvoiceForCart(invoice.id);
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
    </div>
  );
};

export default Persons;
