import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ShoppingCart,
  Search,
  Eye,
  ArrowLeft,
  Package,
  User,
  CreditCard,
  MapPin,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { fetchAdminPedidos, AdminPedido, updateAdminPedidoStatus } from "@/services/adminApi";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  pendente: { label: "Pendente", variant: "secondary" },
  pago: { label: "Pago", variant: "default" },
  preparando: { label: "Preparando", variant: "outline" },
  enviado: { label: "Enviado", variant: "outline" },
  entregue: { label: "Entregue", variant: "default" },
  cancelado: { label: "Cancelado", variant: "destructive" },
};

const AdminOrders = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [orders, setOrders] = useState<AdminPedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const result = await fetchAdminPedidos(100);
      setOrders(result.pedidos);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
      toast.error("Erro ao carregar pedidos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
      return;
    }
    loadOrders();
  }, [navigate]);


  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      setUpdating(orderId);
      await updateAdminPedidoStatus(orderId, newStatus);
      setOrders(orders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      toast.success("Status atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status");
    } finally {
      setUpdating(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status] || statusConfig.pendente;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatPrice = (price: number) => {
    return Number(price).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPaymentLabel = (method: string) => {
    const labels: Record<string, string> = {
      pix: "PIX",
      cartao: "Cartão de Crédito",
      boleto: "Boleto",
    };
    return labels[method] || method;
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.nome_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.numero?.includes(searchTerm) ||
      order.email_cliente?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <Header />

      <div className="container py-4 lg:py-8 flex-1">
        <div className="flex items-center gap-2 lg:gap-4 mb-4 lg:mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/dashboard">
              <ArrowLeft className="w-4 h-4 mr-1 lg:mr-2" />
              <span className="hidden sm:inline">Voltar</span>
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 lg:px-6">
            <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
              <ShoppingCart className="w-4 h-4 lg:w-5 lg:h-5" />
              Pedidos ({orders.length})
            </CardTitle>
            <Button variant="outline" size="sm" onClick={loadOrders} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline ml-2">Atualizar</span>
            </Button>
          </CardHeader>
          <CardContent className="px-4 lg:px-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4 lg:mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="preparando">Preparando</SelectItem>
                  <SelectItem value="enviado">Enviado</SelectItem>
                  <SelectItem value="entregue">Entregue</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Mobile - Cards */}
                <div className="lg:hidden space-y-3">
                  {filteredOrders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">#{order.numero}</span>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground truncate max-w-[150px]">{order.nome_cliente}</span>
                        <span className="font-medium">{formatPrice(order.total)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-muted-foreground">{formatDate(order.created_at)}</span>
                        <div className="flex items-center gap-2">
                          <Select
                            value={order.status}
                            onValueChange={(value) => handleStatusChange(order.id, value)}
                            disabled={updating === order.id}
                          >
                            <SelectTrigger className="w-28 h-8 text-xs">
                              {updating === order.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <SelectValue />
                              )}
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pendente">Pendente</SelectItem>
                              <SelectItem value="pago">Pago</SelectItem>
                              <SelectItem value="preparando">Preparando</SelectItem>
                              <SelectItem value="enviado">Enviado</SelectItem>
                              <SelectItem value="entregue">Entregue</SelectItem>
                              <SelectItem value="cancelado">Cancelado</SelectItem>
                            </SelectContent>
                          </Select>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Pedido #{order.numero}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-6">
                                <div className="flex items-start gap-3">
                                  <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                                  <div>
                                    <p className="font-medium">{order.nome_cliente}</p>
                                    <p className="text-sm text-muted-foreground">{order.email_cliente}</p>
                                    {order.telefone_cliente && (
                                      <p className="text-sm text-muted-foreground">{order.telefone_cliente}</p>
                                    )}
                                  </div>
                                </div>
                                {order.endereco_logradouro && (
                                  <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                                    <p className="text-sm">
                                      {order.endereco_logradouro}, {order.endereco_numero}
                                      {order.endereco_complemento && ` - ${order.endereco_complemento}`}
                                      <br />
                                      {order.endereco_bairro} - {order.endereco_cidade}/{order.endereco_estado}
                                      <br />
                                      CEP: {order.endereco_cep}
                                    </p>
                                  </div>
                                )}
                                <div className="flex items-start gap-3">
                                  <CreditCard className="w-5 h-5 text-muted-foreground mt-0.5" />
                                  <p className="text-sm">{getPaymentLabel(order.forma_pagamento)}</p>
                                </div>
                                <div className="flex items-start gap-3">
                                  <Package className="w-5 h-5 text-muted-foreground mt-0.5" />
                                  <div className="flex-1">
                                    <p className="font-medium mb-2">Produtos</p>
                                    {order.itens && order.itens.length > 0 ? (
                                      order.itens.map((item, index) => (
                                        <div key={index} className="flex justify-between text-sm py-1">
                                          <span>{item.nome} x{item.quantidade}</span>
                                          <span>{formatPrice(item.preco_unitario)}</span>
                                        </div>
                                      ))
                                    ) : (
                                      <p className="text-sm text-muted-foreground">Itens não disponíveis</p>
                                    )}
                                    <div className="border-t mt-2 pt-2">
                                      <div className="flex justify-between font-medium mt-1">
                                        <span>Total</span>
                                        <span>{formatPrice(order.total)}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop - Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pedido</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Pagamento</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">#{order.numero}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{order.nome_cliente}</p>
                              <p className="text-sm text-muted-foreground">{order.email_cliente}</p>
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(order.created_at)}</TableCell>
                          <TableCell className="font-medium">{formatPrice(order.total)}</TableCell>
                          <TableCell>{getPaymentLabel(order.forma_pagamento)}</TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Select
                                value={order.status}
                                onValueChange={(value) => handleStatusChange(order.id, value)}
                                disabled={updating === order.id}
                              >
                                <SelectTrigger className="w-32 h-8">
                                  {updating === order.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <SelectValue />
                                  )}
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pendente">Pendente</SelectItem>
                                  <SelectItem value="pago">Pago</SelectItem>
                                  <SelectItem value="preparando">Preparando</SelectItem>
                                  <SelectItem value="enviado">Enviado</SelectItem>
                                  <SelectItem value="entregue">Entregue</SelectItem>
                                  <SelectItem value="cancelado">Cancelado</SelectItem>
                                </SelectContent>
                              </Select>

                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-lg">
                                  <DialogHeader>
                                    <DialogTitle>Pedido #{order.numero}</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-6">
                                    <div className="flex items-start gap-3">
                                      <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                                      <div>
                                        <p className="font-medium">{order.nome_cliente}</p>
                                        <p className="text-sm text-muted-foreground">{order.email_cliente}</p>
                                        {order.telefone_cliente && (
                                          <p className="text-sm text-muted-foreground">{order.telefone_cliente}</p>
                                        )}
                                      </div>
                                    </div>

                                    {order.endereco_logradouro && (
                                      <div className="flex items-start gap-3">
                                        <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                                        <p className="text-sm">
                                          {order.endereco_logradouro}, {order.endereco_numero}
                                          {order.endereco_complemento && ` - ${order.endereco_complemento}`}
                                          <br />
                                          {order.endereco_bairro} - {order.endereco_cidade}/{order.endereco_estado}
                                          <br />
                                          CEP: {order.endereco_cep}
                                        </p>
                                      </div>
                                    )}

                                    <div className="flex items-start gap-3">
                                      <CreditCard className="w-5 h-5 text-muted-foreground mt-0.5" />
                                      <p className="text-sm">{getPaymentLabel(order.forma_pagamento)}</p>
                                    </div>

                                    <div className="flex items-start gap-3">
                                      <Package className="w-5 h-5 text-muted-foreground mt-0.5" />
                                      <div className="flex-1">
                                        <p className="font-medium mb-2">Produtos</p>
                                        {order.itens && order.itens.length > 0 ? (
                                          order.itens.map((item, index) => (
                                            <div key={index} className="flex justify-between text-sm py-1">
                                              <span>{item.nome} x{item.quantidade}</span>
                                              <span>{formatPrice(item.preco_unitario)}</span>
                                            </div>
                                          ))
                                        ) : (
                                          <p className="text-sm text-muted-foreground">Itens não disponíveis</p>
                                        )}
                                        <div className="border-t mt-2 pt-2">
                                          {order.subtotal && (
                                            <div className="flex justify-between text-sm">
                                              <span>Subtotal</span>
                                              <span>{formatPrice(order.subtotal)}</span>
                                            </div>
                                          )}
                                          {order.desconto > 0 && (
                                            <div className="flex justify-between text-sm text-green-600">
                                              <span>Desconto</span>
                                              <span>-{formatPrice(order.desconto)}</span>
                                            </div>
                                          )}
                                          {order.frete > 0 && (
                                            <div className="flex justify-between text-sm">
                                              <span>Frete</span>
                                              <span>{formatPrice(order.frete)}</span>
                                            </div>
                                          )}
                                          <div className="flex justify-between font-medium mt-1">
                                            <span>Total</span>
                                            <span>{formatPrice(order.total)}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {filteredOrders.length === 0 && (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhum pedido encontrado</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default AdminOrders;
