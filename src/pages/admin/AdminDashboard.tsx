import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Package,
  ShoppingCart,
  DollarSign,
  Plus,
  List,
  Clock,
  FolderTree,
} from "lucide-react";
import { fetchAdminStats, fetchAdminPedidos, AdminPedido } from "@/services/adminApi";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
    
    if (!token) {
      navigate("/admin/login", { replace: true });
    } else {
      setIsAuthenticated(true);
    }
  }, [navigate]);

  // Buscar estatísticas - só ativa quando autenticado
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: fetchAdminStats,
    staleTime: 2 * 60 * 1000, // 2 minutos
    retry: 2,
    enabled: isAuthenticated === true,
  });

  // Buscar pedidos recentes - só ativa quando autenticado
  const { data: pedidosData, isLoading: loadingPedidos } = useQuery({
    queryKey: ["admin-pedidos-recentes"],
    queryFn: () => fetchAdminPedidos(5, 1),
    staleTime: 2 * 60 * 1000,
    retry: 2,
    enabled: isAuthenticated === true,
  });

  // Não renderiza nada enquanto verifica autenticação
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      aguardando_pagamento: "Aguardando",
      pendente: "Pendente",
      pago: "Pago",
      preparando: "Preparando",
      enviado: "Enviado",
      entregue: "Entregue",
      cancelado: "Cancelado",
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      aguardando_pagamento: "bg-yellow-100 text-yellow-700",
      pendente: "bg-yellow-100 text-yellow-700",
      pago: "bg-green-100 text-green-700",
      preparando: "bg-blue-100 text-blue-700",
      enviado: "bg-purple-100 text-purple-700",
      entregue: "bg-green-100 text-green-700",
      cancelado: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const statsCards = [
    {
      title: "Total de Vendas",
      value: stats ? formatCurrency(stats.totalVendas) : "R$ 0,00",
      icon: DollarSign,
      color: "text-green-500",
    },
    {
      title: "Pedidos",
      value: stats?.totalPedidos?.toString() ?? "0",
      icon: ShoppingCart,
      color: "text-blue-500",
    },
    {
      title: "Produtos",
      value: stats?.totalProdutos?.toString() ?? "0",
      icon: Package,
      color: "text-purple-500",
    },
    {
      title: "Categorias",
      value: stats?.totalCategorias?.toString() ?? "0",
      icon: FolderTree,
      color: "text-orange-500",
    },
  ];

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <Header />

      <div className="container py-4 lg:py-8 flex-1">
        {/* Quick Actions - responsive grid */}
        <div className="grid grid-cols-2 lg:flex lg:flex-wrap gap-2 lg:gap-4 mb-6 lg:mb-8">
          <Button asChild size="sm" className="lg:size-default bg-foreground text-background hover:bg-foreground/90">
            <Link to="/admin/produtos/novo">
              <Plus className="w-4 h-4 mr-1 lg:mr-2" />
              <span className="hidden sm:inline">Novo</span> Produto
            </Link>
          </Button>
          <Button variant="outline" asChild size="sm" className="lg:size-default">
            <Link to="/admin/produtos">
              <Package className="w-4 h-4 mr-1 lg:mr-2" />
              Produtos
            </Link>
          </Button>
          <Button variant="outline" asChild size="sm" className="lg:size-default">
            <Link to="/admin/categorias">
              <FolderTree className="w-4 h-4 mr-1 lg:mr-2" />
              Categorias
            </Link>
          </Button>
          <Button variant="outline" asChild size="sm" className="lg:size-default">
            <Link to="/admin/pedidos">
              <List className="w-4 h-4 mr-1 lg:mr-2" />
              Pedidos
            </Link>
          </Button>
        </div>

        {/* Stats Grid - responsive */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
          {statsCards.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs lg:text-sm text-muted-foreground truncate">{stat.title}</p>
                    {loadingStats ? (
                      <Skeleton className="h-6 lg:h-8 w-16 lg:w-24 mt-1" />
                    ) : (
                      <p className="text-lg lg:text-2xl font-bold mt-1 truncate">{stat.value}</p>
                    )}
                  </div>
                  <div className={`p-2 lg:p-3 rounded-full bg-muted ${stat.color} flex-shrink-0`}>
                    <stat.icon className="w-4 h-4 lg:w-6 lg:h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Orders - mobile optimized */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between px-4 lg:px-6">
            <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
              <Clock className="w-4 h-4 lg:w-5 lg:h-5" />
              Pedidos Recentes
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/pedidos">Ver todos</Link>
            </Button>
          </CardHeader>
          <CardContent className="px-4 lg:px-6">
            {loadingPedidos ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : pedidosData?.pedidos && pedidosData.pedidos.length > 0 ? (
              <>
                {/* Mobile - Cards */}
                <div className="lg:hidden space-y-3">
                  {pedidosData.pedidos.map((pedido: AdminPedido) => (
                    <div key={pedido.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">#{pedido.numero}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pedido.status)}`}>
                          {getStatusLabel(pedido.status)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground truncate max-w-[150px]">{pedido.nome_cliente}</span>
                        <span className="font-medium">{formatCurrency(Number(pedido.total))}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(pedido.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  ))}
                </div>
                {/* Desktop - Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Pedido</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Cliente</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Valor</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pedidosData.pedidos.map((pedido: AdminPedido) => (
                        <tr key={pedido.id} className="border-b hover:bg-muted/50">
                          <td className="p-3 font-medium">#{pedido.numero}</td>
                          <td className="p-3">{pedido.nome_cliente}</td>
                          <td className="p-3">{formatCurrency(Number(pedido.total))}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pedido.status)}`}>
                              {getStatusLabel(pedido.status)}
                            </span>
                          </td>
                          <td className="p-3 text-muted-foreground text-sm">
                            {new Date(pedido.created_at).toLocaleDateString("pt-BR")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum pedido encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default AdminDashboard;