import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Produto from "./pages/Produto";
import Carrinho from "./pages/Carrinho";
import Busca from "./pages/Busca";
import Checkout from "./pages/Checkout";
import OrderConfirmed from "./pages/OrderConfirmed";
import MeusPedidos from "./pages/MeusPedidos";
import AcompanharPedido from "./pages/AcompanharPedido";
import Enderecos from "./pages/Enderecos";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminProductForm from "./pages/admin/AdminProductForm";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminOrders from "./pages/admin/AdminOrders";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/produto/:id" element={<Produto />} />
          <Route path="/carrinho" element={<Carrinho />} />
          <Route path="/busca" element={<Busca />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/pedido-confirmado" element={<OrderConfirmed />} />
          <Route path="/meus-pedidos" element={<MeusPedidos />} />
          <Route path="/pedido/:orderNumber" element={<AcompanharPedido />} />
          <Route path="/enderecos" element={<Enderecos />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/login" element={<AdminDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/produtos" element={<AdminProducts />} />
          <Route path="/admin/produtos/novo" element={<AdminProductForm />} />
          <Route path="/admin/produtos/:id" element={<AdminProductForm />} />
          <Route path="/admin/categorias" element={<AdminCategories />} />
          <Route path="/admin/pedidos" element={<AdminOrders />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
