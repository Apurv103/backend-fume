import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import GuestList from "./pages/GuestList";
import DoorPolicy from "./pages/DoorPolicy";
import DrinksMenu from "./pages/DrinksMenu";
import FoodMenu from "./pages/FoodMenu";
import ShishaMenu from "./pages/ShishaMenu";
import Login from "./pages/Login";
import ServerWorkspace from "./pages/ServerWorkspace";
import ManagerDashboard from "./pages/ManagerDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import NotFound from "./pages/NotFound";
import RequireRole from "./components/RequireRole";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/guest-list" element={<GuestList />} />
          <Route path="/door-policy" element={<DoorPolicy />} />
          <Route path="/drinks-menu" element={<DrinksMenu />} />
          <Route path="/food-menu" element={<FoodMenu />} />
          <Route path="/shisha-menu" element={<ShishaMenu />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/server"
            element={
              <RequireRole roles={["server", "manager", "owner"]}>
                <ServerWorkspace />
              </RequireRole>
            }
          />
          <Route
            path="/manager"
            element={
              <RequireRole roles={["manager", "owner"]}>
                <ManagerDashboard />
              </RequireRole>
            }
          />
          <Route
            path="/owner"
            element={
              <RequireRole roles={["owner"]}>
                <OwnerDashboard />
              </RequireRole>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
