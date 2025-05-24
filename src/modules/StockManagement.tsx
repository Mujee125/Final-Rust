

import React, { useEffect } from "react";
import { useStockStore } from "../stores/stockStore";
import {
  FaSearch,
 
  FaUpload,
  FaPlus,
  FaEdit,
  FaTrashAlt,
  FaTimes,
  FaBoxes,
  FaBox,
  FaTimesCircle,
  FaPlusCircle,
} from "react-icons/fa";
import ExtendableDropdown from "../components/ExtendableDropdown";
import { FaBoxesStacked, FaCalculator } from "react-icons/fa6";
import CSVUploader from "../components/CSVUploader";

const StockManagement: React.FC = () => {
  const {
    filteredStockItems,
    currentItem,
    stats,

    searchQuery,
    pPurchasePrice,
    pSalePrice,
    purchaseFactor,
    saleFactor,
    unitSalePrice,
    unitPurchasePrice,
    fetchStockItems,
    fetchStats,
    updateStock,
    saveNewStock,
    deleteStockItem,
    setCurrentItem,
    resetCurrentItem,
    setSearchQuery,
    downloadCSV,
    downloadPDF,
    setPPurchasePrice,
    setPSalePrice,
    setPurchaseFactor,
    setSaleFactor,
    handleParsedData,
  } = useStockStore();


  useEffect(() => {
    fetchStockItems();
    fetchStats();
  }, []);


  return (
    <div className="flex overflow-hidden">
      {/* Left: Stock Table */}
      <div
        className="lefttable p-1 overflow-y-auto"
        style={{ maxHeight: "calc(100vh - 4rem)" }}
      >
        {/* Statistics Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-4">
          {/* Total Items */}
          <div className="bg-white p-2 rounded-lg shadow flex items-center space-x-2">
            <div className="bg-green-100 text-green-600 rounded-md size-8 flex items-center justify-center">
              <FaBoxes className="text-xl" />
            </div>
            <div>
              <h3 className="text-xs text-gray-800">Total Items</h3>
              <p className="text-gray-500">{stats.total_items_registered}</p>
            </div>
          </div>

          {/* Low Stock Items */}
          <div className="bg-white p-2 rounded-lg shadow flex items-center space-x-2">
            <div className="bg-yellow-100 text-yellow-600 rounded-md size-8 flex items-center justify-center">
              <FaBox className="text-xl" />
            </div>
            <div>
              <h3 className="text-xs text-gray-800">Low Stock Items</h3>
              <p className="text-gray-500">{stats.low_stock_items}</p>
            </div>
          </div>

          {/* Expired Items */}
          <div className="bg-white p-2 rounded-lg shadow flex items-center space-x-2">
            <div className="bg-red-100 text-red-500 rounded-md size-8 flex items-center justify-center">
              <FaTimesCircle className="text-xl" />
            </div>
            <div>
              <h3 className="text-xs text-gray-800">Expired Items</h3>
              <p className="text-gray-500">{stats.expired_items}</p>
            </div>
          </div>
        </div>

        {/* Buttons and Search */}
        <div className="flex justify-between items-center mb-2">
          {/* Product List Heading */}
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <FaBoxesStacked className="highlight mr-2" />
            Stock List
            <CSVUploader onFileParsed={handleParsedData} />
          </h2>

          {/* Search Bar */}
          <div className="relative w-80">
            <input
              type="text"
              placeholder="Search Products..."
              className="w-full p-2 pl-10 pr-12 border-light  rounded-md shadow-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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

        {/* Stock Table */}
        <div
          className="overflow-y-auto shadow-md rounded-lg"
          style={{ maxHeight: "76vh" }}
        >
          <table id="tableData" className="min-w-full bg-white border-collapse">
            <thead className="bg-gray-200 sticky top-0 shadow-md">
              <tr className="border-light">
                <th className="py-1 lg:py-2 px-4  text-sm capitalize text-left">
                  Sr. #
                </th>
                <th className="py-1 lg:py-2 px-4  text-sm capitalize text-left">
                  Name
                </th>
                <th className="py-1 lg:py-2 px-4  text-sm capitalize text-left">
                  Code
                </th>
                <th className="py-1 lg:py-2 px-4  text-sm capitalize text-left">
                  Qty
                </th>
                <th className="py-1 lg:py-2 px-4  text-sm capitalize text-left">
                  Unit
                </th>
                <th className="py-1 lg:py-2 px-4  text-sm capitalize text-left">
                  Sale Price
                </th>
                <th className="py-1 lg:py-2 px-4  text-sm capitalize text-left">
                  Expiry
                </th>
                <th className="py-1 lg:py-2 px-4  text-sm capitalize text-left">
                  Location
                </th>
              </tr>
            </thead>
            <tbody className="overflow-y-auto">
              {filteredStockItems.map((item, index) => (
                <tr
                  key={item.id}
                  onClick={() => setCurrentItem(item)}
                  className="cursor-pointer hover:bg-gray-100 border-light"
                >
                  <td className="py-1 lg:py-2 px-4  text-sm">{index + 1}</td>
                  <td className="py-1 lg:py-2 px-4  text-sm">{item.name}</td>
                  <td className="py-1 lg:py-2 px-4  text-sm">{item.code}</td>
                  <td className="py-1 lg:py-2 px-4  text-sm">{item.qty}</td>
                  <td className="py-1 lg:py-2 px-4  text-sm">{item.unit}</td>
                  <td className="py-1 lg:py-2 px-4  text-sm">
                    ${item.sale_price}
                  </td>
                  <td className="py-1 lg:py-2 px-4  text-sm">{item.expiry}</td>
                  <td className="py-1 lg:py-2 px-4  text-sm">
                    {item.location}
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
            <FaPlusCircle className="highlight mr-1" />
            {currentItem.id ? "Edit Product" : "Add New Product"}
          </h2>
          {currentItem.id && (
            <button
              title="Delete Stock Item"
              onClick={() => currentItem.id && deleteStockItem(currentItem.id)}
              className="text-red-400 hover:text-red-600"
            >
              <FaTrashAlt />
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {/* Product Name */}
            <div>
              <label className="block text-xs font-medium">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={currentItem.name}
                onChange={(e) =>
                  setCurrentItem({ ...currentItem, name: e.target.value })
                }
                className="w-full p-2 text-sm border-light  rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter Product Name"
                required
              />
            </div>

            {/* Product Code */}
            <div>
              <label className="block text-xs font-medium">
                Code <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={currentItem.code}
                  onChange={(e) =>
                    setCurrentItem({ ...currentItem, code: e.target.value })
                  }
                  className="w-full py-2 pl-2 pr-12 text-sm border-light  rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter Product Code"
                  required
                />
              </div>
            </div>

            <div className="col-span-2 grid grid-cols-2 gap-2">
              {/* Category */}
              <ExtendableDropdown
                value={currentItem.category}
                onChange={(value) =>
                  setCurrentItem({ ...currentItem, category: value })
                }
                label="Category"
                placeholder="Enter Category"
                tableName="categories"
              />

              {/* Unit */}
              <ExtendableDropdown
                value={currentItem.unit}
                onChange={(value) =>
                  setCurrentItem({ ...currentItem, unit: value })
                }
                label="Unit"
                placeholder="Enter Unit"
                tableName="units"
              />
            </div>

            <div className="col-span-2 grid grid-cols-2 gap-2">
              {/* Purchase Price */}
              <div>
                <label className="block text-xs font-medium">
                  Purchase Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={currentItem.purchase_price || 0}
                  onChange={(e) =>
                    setCurrentItem({
                      ...currentItem,
                      purchase_price: Number(e.target.value),
                    })
                  }
                  className="w-full p-2 text-sm text-center border-light  rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter Purchase Price"
                  required
                />
              </div>

              {/* Sale Price */}
              <div>
                <label className="block text-xs font-medium">
                  Sale Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={currentItem.sale_price || 0}
                  onChange={(e) =>
                    setCurrentItem({
                      ...currentItem,
                      sale_price: Number(e.target.value),
                    })
                  }
                  className="w-full p-2 text-sm text-center border-light  rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter Sale Price"
                  required
                />
              </div>
            </div>

            <div className="col-span-2 grid grid-cols-3 gap-2">
              {/* Current Quantity */}
              <div>
                <label className="block text-xs font-medium">
                  Current Quantity
                </label>
                <input
                  type="number"
                  value={currentItem.qty || 0}
                  onChange={(e) =>
                    setCurrentItem({
                      ...currentItem,
                      qty: Number(e.target.value),
                    })
                  }
                  className="w-full p-2 text-sm text-center border-light  rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter Stock Quantity"
                />
              </div>

              {/* Minimum Quantity */}
              <div>
                <label className="block text-xs font-medium">
                  Minimum Quantity
                </label>
                <input
                  type="number"
                  value={currentItem.min_qty || 0}
                  onChange={(e) =>
                    setCurrentItem({
                      ...currentItem,
                      min_qty: Number(e.target.value),
                    })
                  }
                  className="w-full p-2 text-sm text-center border-light  rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter Minimum Quantity"
                />
              </div>

              {/* Target Quantity */}
              <div>
                <label className="block text-xs font-medium">
                  Target Quantity
                </label>
                <input
                  type="number"
                  value={currentItem.target_qty || 0}
                  onChange={(e) =>
                    setCurrentItem({
                      ...currentItem,
                      target_qty: Number(e.target.value),
                    })
                  }
                  className="w-full p-2 text-sm text-center border-light  rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter Target Quantity"
                />
              </div>
            </div>

            {/* Location */}
            <ExtendableDropdown
              value={currentItem.location}
              onChange={(value) =>
                setCurrentItem({ ...currentItem, location: value })
              }
              label="Location"
              placeholder="Enter Location"
              tableName="locations"
            />

            {/* Expiry */}
            <div>
              <label className="block text-xs font-medium">
                Expiry Date (If any)
              </label>
              <input
                type="date"
                value={currentItem.expiry || ""}
                onChange={(e) =>
                  setCurrentItem({ ...currentItem, expiry: e.target.value })
                }
                className="w-full p-2 text-sm border-light  rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter Expiry"
              />
            </div>

            {/* Remarks */}
            <div className="col-span-2">
              <label className="block text-xs font-medium">Remarks</label>
              <input
                type="text"
                value={currentItem.remarks}
                onChange={(e) =>
                  setCurrentItem({ ...currentItem, remarks: e.target.value })
                }
                className="w-full p-2 text-sm border-light  rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter Remarks"
              />
            </div>
          </div>

          {/* Form Buttons */}
          <div className="flex justify-end gap-2">
            {currentItem.id && (
              <button
                onClick={updateStock}
                className="buttons bg-blue-500 hover:bg-blue-600 text-white text-sm flex items-center"
              >
                <FaEdit className="mr-2" /> Update
              </button>
            )}
            <button
              onClick={saveNewStock}
              className="buttons limebtn text-sm flex items-center"
            >
              <FaPlus className="mr-2" /> Add as New
            </button>

            <button
              onClick={resetCurrentItem}
              type="button"
              className="buttons text-white bg-gray-500 hover:bg-gray-700 text-sm flex items-center"
            >
              <FaTimes className="mr-2" /> Clear
            </button>
          </div>

          {/* Price Calculator */}
          <h2 className="text-md mt-4 flex items-center">
            <FaCalculator className="mr-2 highlight " />
            Price Calculator
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {/* Pack Purchase Price */}
            <div>
              <label className="block text-xs font-medium">
                Pack Pur. Price
              </label>
              <input
                type="number"
                value={pPurchasePrice}
                onChange={(e) => setPPurchasePrice(Number(e.target.value))}
                className="w-full p-2 text-sm border-light  rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Pack Pur. Price"
              />
            </div>
            {/* Purchase Unit Factor */}
            <div>
              <label className="block text-xs font-medium">
                Pur. Unit Factor
              </label>
              <input
                type="number"
                value={purchaseFactor}
                onChange={(e) => setPurchaseFactor(Number(e.target.value))}
                className="w-full p-2 text-sm border-light  rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Pur. Unit Factor"
              />
            </div>
            {/* Unit Purchase Price */}
            <div>
              <label className="block text-xs font-medium">
                Unit Pur. Price
              </label>
              <input
                disabled
                type="number"
                value={unitPurchasePrice}
                className="w-full p-2 text-sm border-light  rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Unit Pur. price"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {/* Pack Sale Price */}
            <div>
              <label className="block text-xs font-medium">
                Pack Sale Price
              </label>
              <input
                type="number"
                value={pSalePrice}
                onChange={(e) => setPSalePrice(Number(e.target.value))}
                className="w-full p-2 text-sm border-light  rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Pack Sale Price"
              />
            </div>
            {/* Sale Unit Factor */}
            <div>
              <label className="block text-xs font-medium">
                Sale Unit Factor
              </label>
              <input
                type="number"
                value={saleFactor}
                onChange={(e) => setSaleFactor(Number(e.target.value))}
                className="w-full p-2 text-sm border-light  rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Sale Unit Factor"
              />
            </div>
            {/* Unit Sale Price */}
            <div>
              <label className="block text-xs font-medium">
                Unit Sale. Price
              </label>
              <input
                type="number"
                value={unitSalePrice}
                className="w-full p-2 text-sm border-light  rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Unit Sale price"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockManagement;
