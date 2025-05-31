
import { useEffect, useRef, useState } from "react";
import {
  FaShoppingCart,
  FaReceipt,
  FaSearch,
  FaBarcode,
  FaKeyboard,
  FaPlus,
  FaMinus,
  FaUser,
  FaBox,
  FaEdit,
  FaPrint,
} from "react-icons/fa";
import { useReactToPrint } from "react-to-print";
import { FaXmark } from "react-icons/fa6";
import { useCartStore } from "../stores/cartStore";
import { Link } from "wouter";
import Invoice from "../components/Invoice";
import { useSettingsStore } from "../stores/settingsStore";
import { useAuthStore } from "../stores/authStore";
import Receipt from "../components/Receipt";

const CartManagement = () => {

  const componentRef = useRef<HTMLDivElement>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  const {
    isBarcodeMode,
    searchItemQuery,
    searchPersonQuery,
    itemSuggestions,
    personSuggestions,
    invoice,
    person,
    cartItems,
    recentInvoices,
 
    changeInvoiceType,
    searchItems,
    searchPersons,
    barcodeChange,
    addProductToCart,
    updateCartQuantity,
    deleteCartItem,
    fillPersonData,
    isDangerous,
    getProductClass,
    checkOut,
    initializeData,
    setSearchItemQuery,
    setSearchPersonQuery,
    setIsBarcodeMode,
    setInvoice,
    updateCalculations,
  } = useCartStore();

  const [calculationData, setCalculationData] = useState({
    total: 0,
    discountRS: 0,
    taxRS: 0,
    net: 0,
    balance: 0,
  });

  useEffect(() => {
    const result = updateCalculations?.();
    if (result !== undefined) setCalculationData(result);
  }, [cartItems, invoice]);
  const { shop } = useSettingsStore();
  const { user } = useAuthStore();

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  const handleBarcodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      barcodeChange(e.currentTarget.value);
      e.currentTarget.value = "";
    }
  };

  const handleInvoicePrint = useReactToPrint({
    contentRef:  componentRef,
  });

  const handlePrintReceipt = useReactToPrint({
    contentRef:  receiptRef,
  });

  const printAndCheckout = async () => {
    await handlePrintReceipt();
    checkOut();
  };
  

  return (
    <div className="col-span-3 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-2 overflow-y-auto">
      <div className="h-2/3 col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left: Product Table */}
        <div className="lg:col-span-2">
          <div className="flex flex-col md:flex-row justify-between space-y-2 my-1 p-1">
            <div>
              {invoice.type === "Sale" ? (
                <button
                  onClick={changeInvoiceType}
                  className="px-4 py-2 bg-green-200 hover:bg-green-300 shadow-md rounded-md text-xl"
                >
                  <FaShoppingCart className="mr-2 inline" /> Sale Invoice - No.{" "}
                  <b className="text-red-500"> {invoice.invoice_no}</b>
                </button>
              ) : (
                <button
                  onClick={changeInvoiceType}
                  className="px-4 py-2 bg-blue-200 hover:bg-blue-300 shadow-md rounded-md text-xl"
                >
                  <FaShoppingCart className="mr-2 inline" /> Purchase Invoice -
                  No. <b className="text-red-500"> {invoice.invoice_no}</b>
                </button>
              )}
            </div>
            {invoice.type === "Purchase" && (
              <div>
                <span>
                  <label className="text-gray-800 text-sm">Ref. No. :</label>
                  &nbsp;
                  <input
                    title="Reference No."
                    type="text"
                    value={invoice.reference}
                    onChange={(e) =>
                      setInvoice({ ...invoice, reference: e.target.value })
                    }
                    className="w-28 p-1 mr-2 text-sm border-light shadow-md rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </span>
                <span>
                  <label className="text-gray-800 text-sm">Date:</label>&nbsp;
                  <input
                    title="Date"
                    value={invoice.date}
                    onChange={(e) =>
                      setInvoice({ ...invoice, date: e.target.value })
                    }
                    type="date"
                    className="p-1 text-sm border-light shadow-md rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </span>
              </div>
            )}
          </div>

          {/* Product Search and Table */}
          <div className="p-1 overflow-hidden">
            {/* Search Bar Section */}
            <div className="flex flex-cols justify-between gap-2 mb-3">
              <div className="w-full">
                <div className="relative">
                  {isBarcodeMode ? (
                    <input
                      id="barcodeInput"
                      type="text"
                      placeholder="Scan Item Code ..."
                      className="w-full p-2 pl-10 pr-16 border-light shadow-md rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      onKeyDown={handleBarcodeKeyDown}
                    />
                  ) : (
                    <input
                      type="text"
                      placeholder="Search Items..."
                      className="w-full p-2 pl-10 pr-16 border-light shadow-md rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      value={searchItemQuery}
                      onChange={(e) => {
                        setSearchItemQuery(e.target.value);
                        searchItems();
                      }}
                    />
                  )}
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  {isBarcodeMode ? (
                    <FaBarcode
                      onClick={() => setIsBarcodeMode(false)}
                      className="absolute hover:bg-green-200 text-2xl rounded-md px-3 right-1 top-1/2 transform -translate-y-1/2  cursor-pointer w-[2em] h-[1.45em]"
                    />
                  ) : (
                    <FaKeyboard
                      onClick={() => setIsBarcodeMode(true)}
                      className="absolute hover:bg-green-200 text-2xl rounded-md px-3 right-1 top-1/2 transform -translate-y-1/2 cursor-pointer w-[2em] h-[1.45em]"
                    />
                  )}
                </div>
                {/* Suggestions List */}
                {itemSuggestions.length > 0 && (
                  <ul className="absolute w-[51%] bg-white shadow-md mt-1 -ml-1 rounded-md border-light border-gray-200 max-h-60 overflow-y-auto z-10">
                    {itemSuggestions.map((product) => (
                      <li
                        key={product.id}
                        className={`flex justify-between px-4 py-2 border-b cursor-pointer hover:bg-gray-100 ${getProductClass(
                          product
                        )}`}
                        onClick={() => addProductToCart(product)}
                      >
                        <div className="w-1/2 text-lg">
                          {product.name}
                          {isDangerous(product) && (
                            <span className="text-amber-600 font-semibold ml-2">
                              ⚠️ Caution: Regulated Item
                            </span>
                          )}
                        </div>
                        <div className="text-green-600">
                          Rs:{" "}
                          {invoice.type === "Sale"
                            ? product.sale_price
                            : product.purchase_price}
                        </div>
                        <div className="text-blue-600">Qty: {product.qty}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {/* Add New Item Button */}
              <Link
                to="/stock"
                className="w-32 pt-2 text-white bg-green-600 hover:bg-green-700 rounded-md shadow-md text-center text-sm"
              >
                <FaPlus className="mr-2 inline" /> New Item
              </Link>
            </div>
            <div className="overflow-y-auto h-[470px] bg-white border-light rounded-lg shadow-md">
              <table
                id="receipt"
                className="min-w-full border-collapse text-center"
              >
                <thead className="bg-gray-300 sticky top-0 shadow-md">
                  <tr className="border-b border-gray-200 text-sm">
                    <th className="py-2 px-4">Qty</th>
                    <th className="py-2 px-4">Code</th>
                    <th className="py-2 px-4">Name</th>
                    <th className="py-2 px-4">Category</th>
                    <th className="py-2 px-4">Unit</th>
                    <th className="py-2 px-4">Price</th>
                    <th className="py-2 px-4">Amount</th>
                    <th className="py-2 px-4">Location</th>
                    <th className="py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((product) => (
                    <tr
                      key={product.id}
                      className="group  hover:bg-green-100 border-b border-gray-200"
                    >
                      <td className="py-2 px-0 text-sm m-0">
                        <button
                          title="Decrease"
                          onClick={() => {
                            if (product.qty > 1) {
                              updateCartQuantity(
                                product.qty - 1,
                                product
                              ).catch(() => {
                                // Show error to user if needed
                              });
                            }
                          }}
                          className="text-white group-hover:text-gray-800 group-hover:bg-blue-200 px-2 py-1 rounded-md"
                        >
                          <FaMinus />
                        </button>
                        <input
                          title="value"
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 1;
                            if (value > 0) {
                              updateCartQuantity(value, product).catch(() => {
                                // Show error to user if needed
                              });
                            }
                          }}
                          type="number"
                          value={product.qty}
                          min="1"
                          className="w-16 py-1 text-center rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          title="Increase"
                          onClick={() => {
                            updateCartQuantity(product.qty + 1, product).catch(
                              () => {
                                // Show error to user if needed
                              }
                            );
                          }}
                          className="text-white group-hover:text-gray-800 group-hover:bg-blue-200 px-2 py-1 rounded-md"
                        >
                          <FaPlus />
                        </button>
                      </td>
                      <td className="py-2 px-4 text-sm">{product.code}</td>
                      <td className="py-2 px-4 text-sm text-left">
                        {product.name}
                      </td>
                      <td className="py-2 px-4 text-sm">{product.category}</td>
                      <td className="py-2 px-4 text-sm">{product.unit}</td>
                      <td className="py-2 px-4 text-sm">{product.price}</td>
                      <td className="py-2 px-4  text-sm">
                        {product.price * product.qty}
                      </td>
                      <td className="py-2 px-4 text-sm">{product.location}</td>
                      <td
                        onClick={() => deleteCartItem(product)}
                        className="py-2 px-4"
                      >
                        <FaXmark className="cursor-pointer text-white group-hover:text-red-500" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Customer/Supplier form */}
        <div
          className={`hidden lg:block p-3 mt-2 md:col-span-1 shadow-lg rounded-lg ${
            invoice.type === "Sale" ? "bg-green-100" : "bg-blue-100"
          }`}
        >
          <h2 className="text-lg font-semibold mb-2">
            <FaUser
              className={`mr-1 inline ${
                invoice.type === "Sale" ? "text-green-600" : "text-blue-600"
              }`}
            />
            {invoice.type === "Sale" ? "Customer" : "Supplier"} Details
          </h2>
          <form className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {/* Customer Search */}
              <div className="col-span-2 flex flex-cols gap-2">
                <div className="w-full relative">
                  <input
                    type="text"
                    placeholder={
                      invoice.type === "Sale"
                        ? "Search Customers..."
                        : "Search Suppliers..."
                    }
                    className="w-full p-2 pl-10 border-light rounded-md text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={searchPersonQuery}
                    onChange={(e) => {
                      setSearchPersonQuery(e.target.value);
                      searchPersons();
                    }}
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                </div>
                {/* Suggestions List */}
                {personSuggestions.length > 0 && (
                  <ul className="absolute w-96 bg-white shadow-md mt-12 border-light border-gray-200 rounded-md max-h-60 overflow-y-auto z-10">
                    {personSuggestions.map((person) => (
                      <li
                        key={person.id}
                        className="px-4 py-2 border-b cursor-pointer hover:bg-gray-100"
                        onClick={() => fillPersonData(person)}
                      >
                        {person.name}
                      </li>
                    ))}
                  </ul>
                )}
                {/* Add New Person Button */}
                <Link
                  to="/persons"
                  className="w-28 pt-2 bg-green-600 hover:bg-green-700 rounded-md shadow-md text-white text-center text-sm"
                >
                  Add New
                </Link>
              </div>

              {/* Name Input */}
              <div>
                <label
                  htmlFor="personName"
                  className="block text-xs font-medium"
                >
                  Name
                </label>
                <input
                  value={person.name}
                  type="text"
                  id="personName"
                  className="w-full p-2 text-sm border-light rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Name"
                  disabled
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
                  value={person.contact}
                  type="text"
                  id="personContact"
                  className="w-full p-2 text-sm border-light rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contact Information (e.g., phone, email)"
                  disabled
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
                  value={person.address}
                  id="personAddress"
                  className="w-full p-2 text-sm border-light rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Enter Address"
                  disabled
                ></textarea>
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
                  value={person.remarks}
                  id="personRemarks"
                  className="w-full p-2 text-sm border-light rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Enter Remarks"
                  disabled
                ></textarea>
              </div>
              <div className="col-span-2 border-t  border-gray-200 pt-4">
                <h3 className="text-sm mb-2">
                  <FaReceipt
                    className={`mr-1 inline ${
                      invoice.type === "Sale"
                        ? "text-green-600"
                        : "text-blue-600"
                    }`}
                  />
                  Invoice Remarks
                </h3>
                <textarea
                  value={invoice.remarks}
                  onChange={(e) =>
                    setInvoice({ ...invoice, remarks: e.target.value })
                  }
                  id="invoiceRemarks"
                  className=" bg-white w-full p-2 text-sm border-light rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Enter Remarks"
                ></textarea>
              </div>
            </div>
          </form>

          {/* Recent Invoices Table */}
          <div className="col-span-2 mt-2">
            <h3 className="text-sm mb-2">
              <FaBox
                className={`mr-1 inline ${
                  invoice.type === "Sale" ? "text-green-600" : "text-blue-600"
                }`}
              />
              Recent Invoices
            </h3>
            <div className="h-[180px] overflow-y-auto">
              <table className="table-auto h-full w-full text-xs border-collapse">
                <thead className="bg-gray-300">
                  <tr className="border-b border-gray-200">
                    <th className="p-1   text-left">Invoice No.</th>
                    <th className="p-1   text-left">Type</th>
                    <th className="p-1   text-left">Date</th>
                    <th className="p-1   text-left">Person</th>
                    <th className="p-1   text-left">Amount</th>
                    <th className="p-1   text-left">Edit</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {recentInvoices.map((inv) => (
                    <tr key={inv.id} className="border-b border-gray-200">
                      <td className="p-1  ">{inv.invoice_no}</td>
                      <td className="p-1  ">{inv.invoice_type}</td>
                      <td className="p-1  ">{inv.date}</td>
                      <td className="p-1  ">{inv.person}</td>
                      <td className="p-1  ">{inv.total ? inv.total : "0"}</td>
                      <td className="border-b border-gray-200 text-center text-blue-500 hover:text-blue-700 text-sm">
                        <button
                          title="Edit Invoice"
                          onClick={() => initializeData(inv.id)}
                          className="p-2"
                        >
                          <FaEdit className="inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="col-span-3 grid grid-cols-6 gap-2 bg-white shadow-lg rounded-lg p-4">
        {/* Discount Input Percent */}
        <div>
          <input
            value={invoice.discount}
            onChange={(e) =>
              setInvoice({
                ...invoice,
                discount: parseFloat(e.target.value) || 0,
              })
            }
            type="text"
            className="w-full p-2 text-xl text-center  border-2 border-green-400 rounded-md shadow-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter Discount"
          />
          <label
            htmlFor="productDiscount"
            className="block text-sm font-medium"
          >
            Discount - %
          </label>
        </div>
        {/* Tax Input Percent */}
        <div className="mb-2">
          <input
            value={invoice.tax}
            onChange={(e) =>
              setInvoice({ ...invoice, tax: parseFloat(e.target.value) || 0 })
            }
            type="text"
            id="productTax"
            className="w-full p-2 text-xl text-center  border-2 border-orange-400 rounded-md shadow-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter Tax"
          />
          <label htmlFor="productTax" className="block text-sm font-medium">
            Tax - %
          </label>
        </div>
        {/* Cash Received */}
        <div>
          <input
            value={invoice.received}
            onChange={(e) =>
              setInvoice({
                ...invoice,
                received: parseFloat(e.target.value) || 0,
              })
            }
            type="number"
            id="cashReceived"
            className="w-full p-2 text-xl text-center  border-2 border-blue-400 rounded-md shadow-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Cash Received"
          />
          {invoice.type === "Sale" ? (
            <label htmlFor="cashReceived" className="block text-sm font-medium">
              Cash Received
            </label>
          ) : (
            <label htmlFor="cashReceived" className="block text-sm font-medium">
              Amount Paid
            </label>
          )}
        </div>
        {/* Net Amount */}
        <div>
          <input
            type="text"
            id="netAmount"
            className="w-full p-2 text-xl text-center border-light rounded-md shadow-md bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Net Amount"
            value={calculationData.net}
            disabled
          />
          <label htmlFor="netAmount" className="block text-sm font-medium">
            Net Amount
          </label>
        </div>

        <button
          disabled={cartItems.length === 0}
          onClick={checkOut}
          type="button"
          className="text-white bg-green-600 hover:bg-green-700 rounded-md shadow-md text-2xl"
        >
          Checkout
        </button>
        <button
          disabled={cartItems.length === 0}
          onClick={printAndCheckout}
          type="button"
          className="text-white bg-blue-500 hover:bg-blue-600 rounded-md shadow-md text-md xl:text-xl"
        >
          Receipt <FaPrint className="inline" />
        </button>

        {/* Discount Input */}
        <div>
          <input
            type="text"
            value={calculationData.discountRS}
            className="w-full p-2 text-xl text-center border-light bg-green-100 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter Discount"
            disabled
          />
          <label
            htmlFor="productDiscount"
            className="block text-sm font-medium"
          >
            Discount - Rs.
          </label>
        </div>
        {/* Tax Input */}
        <div className="mb-2">
          <input
            value={calculationData.taxRS}
            type="text"
            id="productTaxRS"
            className="w-full p-2 text-xl text-center border-light bg-orange-100 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter Tax"
            disabled
          />
          <label htmlFor="productTaxRS" className="block text-sm font-medium">
            Tax - Rs.
          </label>
        </div>
        {/* Balance Amount */}
        <div>
          <input
            value={calculationData.balance}
            type="text"
            id="balanceAmount"
            className="w-full p-2 text-xl text-center border-light rounded-md shadow-md bg-green-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Balance Amount"
            disabled
          />
          <label htmlFor="balanceAmount" className="block text-sm font-medium">
            Balance Amount
          </label>
        </div>
        {/* Total Items */}
        <div>
          <input
            value={cartItems.length}
            type="text"
            id="totalItems"
            className="w-full p-2 text-xl text-center border-light rounded-md shadow-md bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Total Items"
            disabled
          />
          <label htmlFor="totalItems" className="block text-sm font-medium">
            Total Items
          </label>
        </div>
        {/* Total Amount */}
        <div>
          <input
            type="text"
            id="totalAmount"
            className="w-full p-2 text-xl text-center border-light rounded-md shadow-md bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Total Amount"
            value={calculationData.total}
            disabled
          />
          <label htmlFor="totalAmount" className="block text-sm font-medium">
            Total Amount
          </label>
        </div>
        <button
          disabled={cartItems.length === 0}
          onClick={handleInvoicePrint}
          type="button"
          className="bg-yellow-400 hover:bg-yellow-500 rounded-md shadow-md text-md xl:text-xl"
        >
          Invoice <FaPrint className="inline" />
        </button>
      </div>

      {/* Hidden components for printing */}
      <div className="hidden">
        <div ref={receiptRef}>
          <Receipt
            shop={{
              name: shop?.name || "",
              description: shop?.description || "",
              contact: shop?.contact || "",
            }}
            invoice={invoice}
            person={person}
            username={user?.username ?? ""}
            cartItems={cartItems}
            discountRS={calculationData.discountRS}
            taxRS={calculationData.taxRS}
            total={calculationData.total}
            net={calculationData.net}
          />
        </div>
      </div>
      <div className="hidden">
        <div ref={componentRef}>
          <Invoice
            invoiceNo={invoice.invoice_no}
            date={invoice.date}
            shop={{
              name: shop?.name || "",
              address: shop?.address || "",
              contact: shop?.contact || "",
            }}
            person={{ name: person.name, contact: person.contact }}
            username={user?.username ?? ""}
            items={cartItems.map((item) => ({
              name: item.name,
              qty: item.qty,
              unitPrice: item.price,
              total: item.qty * item.price,
            }))}
            total={calculationData.total}
            taxRS={calculationData.taxRS}
            discountRS={calculationData.discountRS}
            net={calculationData.net}
          />
        </div>
      </div>
    </div>
  );
};

export default CartManagement;