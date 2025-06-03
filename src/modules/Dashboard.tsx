
import React, { useEffect } from "react";
import { FaTachometerAlt } from "react-icons/fa";
import {
  FaChartBar,
  FaChartLine,
  FaBoxesStacked,
  FaChartPie,
  FaReceipt,
  FaChartArea,
} from "react-icons/fa6";
import ChartCard from "../components/ChartCard";
import {
  useDashboardStore,
  useDailyStatsStore,
} from "../stores/dashboardStore";
import { useCartStore } from "../stores/cartStore";
import { useLocation } from "wouter";

const Dashboard: React.FC = () => {
  const { stats, loading, error, fetchStats } = useDashboardStore();
  const {
    data: dailyStats,
    loading: dailyStatsLoading,
    error: dailyStatsError,
    fetchDailyStats,
  } = useDailyStatsStore();
  const { recentInvoices } = useCartStore();
const { initializeData } = useCartStore();
  
      const [, navigate] = useLocation();

  const fetchInvoiceForCart = async (invoiceId: number) => {
    navigate(`/cart`);
    await initializeData(invoiceId);
    
  };
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchStats(), fetchDailyStats()]);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      }
    };
    loadData();
  }, [fetchStats, fetchDailyStats]);

  if (loading || dailyStatsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || dailyStatsError) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
        <p className="font-semibold">Error:</p>
        <p>{error || dailyStatsError}</p>
        <button
          onClick={() => {
            if (error) fetchStats();
            if (dailyStatsError) fetchDailyStats();
          }}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-1 bg-stone-200">
      {/* Dashboard Header */}
      <h1 className="text-xl font-semibold text-gray-800 flex items-center">
        <FaTachometerAlt className="highlight mr-2" />
        Dashboard
      </h1>
      <div className="mt-4"></div>

      {/* Dashboard Statistics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Today Sale */}
        <div className="bg-white p-4 rounded-lg shadow flex items-center space-x-4">
          <div className="bg-green-100 text-green-600 rounded-md w-10 h-10 flex items-center justify-center">
            <FaChartBar className="text-2xl" />
          </div>
          <div>
            <h3 className="text-xs text-gray-800">Today Sale</h3>
            <p className="text-gray-500">{stats.today_total_sale.toFixed(0)}</p>
          </div>
        </div>

        {/* Today Purchase */}
        <div className="bg-white p-4 rounded-lg shadow flex items-center space-x-4">
          <div className="bg-blue-100 text-blue-600 rounded-md w-10 h-10 flex items-center justify-center">
            <FaChartBar className="text-2xl" />
          </div>
          <div>
            <h3 className="text-xs text-gray-800">Today Purchase</h3>
            <p className="text-gray-500">
              {stats.today_total_purchase.toFixed(0)}
            </p>
          </div>
        </div>

        {/* This Month Sale */}
        <div className="bg-white p-4 rounded-lg shadow flex items-center space-x-4">
          <div className="bg-yellow-100 text-yellow-600 rounded-md w-10 h-10 flex items-center justify-center">
            <FaChartLine className="text-2xl" />
          </div>
          <div>
            <h3 className="text-xs text-gray-800">This Month Sale</h3>
            <p className="text-gray-500">
              {stats.this_month_total_sale.toFixed(0)}
            </p>
          </div>
        </div>

        {/* This Month Purchase */}
        <div className="bg-white p-4 rounded-lg shadow flex items-center space-x-4">
          <div className="bg-purple-100 text-purple-600 rounded-md w-10 h-10 flex items-center justify-center">
            <FaChartLine className="text-2xl" />
          </div>
          <div>
            <h3 className="text-xs text-gray-800">This Month Purchase</h3>
            <p className="text-gray-500">
              {stats.this_month_total_purchase.toFixed(0)}
            </p>
          </div>
        </div>

        {/* Total Items */}
        <div className="bg-white p-4 rounded-lg shadow flex items-center space-x-4">
          <div className="bg-green-100 text-green-600 rounded-md w-10 h-10 flex items-center justify-center">
            <FaBoxesStacked className="text-2xl" />
          </div>
          <div>
            <h3 className="text-xs text-gray-800">Total Items</h3>
            <p className="text-gray-500">{stats.total_items_registered}</p>
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="bg-white p-4 rounded-lg shadow flex items-center space-x-4">
          <div className="bg-red-100 text-red-500 rounded-md w-10 h-10 flex items-center justify-center">
            <FaChartPie className="text-2xl" />
          </div>
          <div>
            <h3 className="text-xs text-gray-800">Low Stock Items</h3>
            <p className="text-gray-500">{stats.low_stock_items}</p>
          </div>
        </div>
      </div>

      {/* Recent Orders & Activity Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Recent Invoices */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <FaReceipt className="highlight mr-2" />
            Recent Invoices
          </h2>
          <ul className="text-sm">
            <li className="flex w-full px-4 py-2 border-b border-gray-200 gap-2 text-gray-600">
              <span className="flex-1 text-left">Date</span>
              <span className="flex-1 text-left">Invoice No.</span>
              <span className="flex-1 text-left">Type</span>
              <span className="flex-1 text-left">Person</span>
              <span className="flex-1 text-left">Amount (Rs.)</span>
            </li>
            {recentInvoices.map((invoice) => (
              <li key={invoice.id}>
                <button
                  className="flex w-full px-4 py-2 border-b border-gray-200 gap-2 hover:bg-gray-100 text-gray-800"
                  onClick={() => {
                    fetchInvoiceForCart(invoice.id);
                  }}
                >
                  <span className="flex-1 text-left">{invoice.date}</span>
                  <span className="flex-1 text-left">{invoice.invoice_no}</span>
                  <span className="flex-1 text-left">
                    {invoice.invoice_type}
                  </span>
                  <span className="flex-1 text-left">{invoice.person}</span>
                  <span className="flex-1 text-left text-gray-800 font-semibold">
                    {invoice.total ? invoice.total.toFixed(0) : "0"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Chart Section */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <FaChartArea className="highlight mr-2" />
            Sales & Purchase Trends
          </h2>
          {dailyStats.length > 0 ? (
            <ChartCard dailyStats={dailyStats} />
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">No chart data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;