
import { Route, Switch, useLocation } from "wouter";
import { useEffect, useState } from "react";

import "./App.css";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./modules/Dashboard";
import CartManagement from "./modules/CartManagement";
import Persons from "./modules/Persons";
import StockManagement from "./modules/StockManagement";
import InvoicePage from "./modules/InvoicePage";
import Setting from "./modules/Setting";
import { initializeSettingsStore } from "./stores/settingsStore";
import { useAuthStore } from "./stores/authStore";

function App() {
  const [location, setLocation] = useLocation();
  const [, navigate] = useLocation();
  const { user } = useAuthStore();
  const [initialized, setInitialized] = useState(false);

  const loadSession = useAuthStore((state) => state.loadSession);

  useEffect(() => {
    loadSession(navigate);
    initializeSettingsStore();
  }, []);

  // Redirect to /login if not logged in
  useEffect(() => {
    if (!user && location !== "/login" && location !== "/register") {
      setLocation("/login");
    }
    setInitialized(true);
  }, [user, location, setLocation]);

  if (!initialized) return <div>Loading...</div>;

  const isLoggedIn = !!user;

  return (
    <div id="app" className="flex h-screen text-gray-700  font-regular">
      {isLoggedIn && <Sidebar />}
      <div className="flex flex-col w-full bg-stone-200">
        {isLoggedIn && <Topbar />}
        <div className="m-0 pl-1 pr-3">
          <div id="content-area">
            <Switch>
              {/* Public routes */}
              <Route path="/login" component={Login} />
              <Route path="/register" component={Register} />

              {/* Protected routes */}
              {isLoggedIn ? (
                <>
                  <Route path="/dashboard" component={Dashboard} />
                  <Route path="/cart" component={CartManagement} />
                  <Route path="/persons" component={Persons} />
                  <Route path="/stock" component={StockManagement} />
                  <Route path="/invoices" component={InvoicePage} />
                  <Route path="/settings" component={Setting} />
                  <Route>Not Found</Route>
                </>
              ) : (
                <Route>🔒 Please log in to access this page.</Route>
              )}
            </Switch>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;


