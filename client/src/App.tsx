import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import Dashboard from "@/pages/dashboard";
import POS from "@/pages/pos";
import Inventory from "@/pages/inventory";
import Customers from "@/pages/customers";
import Employees from "@/pages/employees";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import Login from "@/pages/login";
import InvoicePage from "@/pages/invoice";
import FixProducts from "@/pages/fix-products";
import NotFound from "@/pages/not-found";
import { useAuth } from "./lib/auth";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  console.log("ZnForge POS Router: isLoading=", isLoading, "isAuthenticated=", isAuthenticated);

  if (isLoading) {
    console.log("ZnForge POS: Showing loading spinner");
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Loading ZnForge POS...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/pos" component={POS} />
      <Route path="/inventory" component={Inventory} />
      <Route path="/customers" component={Customers} />
      <Route path="/employees" component={Employees} />
      <Route path="/reports" component={Reports} />
      <Route path="/settings" component={Settings} />
      <Route path="/invoice/:invoiceId" component={InvoicePage} />
      <Route path="/fix-products" component={FixProducts} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
