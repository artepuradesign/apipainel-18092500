import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Package, Search, Eye, Loader2 } from "lucide-react";
import { fetchPedidosByEmail, fetchPedidosByUsuarioId, Pedido } from "@/services/pedidosApi";

const statusConfig: Record<string, { label: string; color: string }> = {
  pendente: { label: "Pendente", color: "bg-yellow-100 text-yellow-800" },
  pago: { label: "Pago", color: "bg-green-100 text-green-800" },
  preparando: { label: "Preparando", color: "bg-blue-100 text-blue-800" },
  enviado: { label: "Enviado", color: "bg-purple-100 text-purple-800" },
  entregue: { label: "Entregue", color: "bg-green-100 text-green-800" },
  cancelado: { label: "Cancelado", color: "bg-red-100 text-red-800" },
};

const MeusPedidos = () => {
  const [searchEmail, setSearchEmail] = useState("");
  const [orders, setOrders] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Carregar pedidos do usuário logado ou por email salvo
  useEffect(() => {
    const loadOrders = async () => {
      setIsLoading(true);
      setHasSearched(true);

      try {
        // Primeiro tenta buscar por usuario_id se logado
        const userDataStr = localStorage.getItem("usuario");
        if (userDataStr) {
          const userData = JSON.parse(userDataStr);
          if (userData.id) {
            const pedidos = await fetchPedidosByUsuarioId(userData.id);
            setOrders(pedidos);
            if (userData.email) {
              setSearchEmail(userData.email);
            }
            setIsLoading(false);
            return;
          }
        }

        // Fallback para busca por email
        const savedEmail = localStorage.getItem("customerEmail") || localStorage.getItem("userEmail");
        if (savedEmail) {
          setSearchEmail(savedEmail);
          const pedidos = await fetchPedidosByEmail(savedEmail);
          setOrders(pedidos);
        } else {
          setHasSearched(false);
        }
      } catch (error) {
        console.error("Erro ao buscar pedidos:", error);
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, []);

  const handleSearch = async (emailToSearch?: string) => {
    const email = emailToSearch || searchEmail;
    if (!email) return;

    setIsLoading(true);
    setHasSearched(true);
    
    try {
      const pedidos = await fetchPedidosByEmail(email);
      setOrders(pedidos);
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return Number(price).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-4 md:py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Meus Pedidos</h1>

        {/* Search Form */}
        <Card className="mb-6">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="Digite seu email para buscar pedidos"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button onClick={() => handleSearch()} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                Buscar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">Buscando pedidos...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && hasSearched && orders.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Nenhum pedido encontrado</h2>
              <p className="text-muted-foreground mb-6">
                Não encontramos pedidos para o email informado.
              </p>
              <Button asChild>
                <Link to="/">Continuar Comprando</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Orders List */}
        {!isLoading && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.pendente;
              
              return (
                <Card key={order.id}>
                  <CardHeader className="p-4 md:p-6 pb-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Pedido</p>
                        <CardTitle className="text-lg">#{order.numero}</CardTitle>
                      </div>
                      <Badge className={status.color}>{status.label}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6 pt-2">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Data: {formatDate(order.created_at)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.itens?.length || 0} {order.itens?.length === 1 ? "item" : "itens"}
                        </p>
                        <p className="font-semibold">{formatPrice(order.total)}</p>
                      </div>
                      
                      {/* Items Preview */}
                      <div className="flex -space-x-2">
                        {order.itens?.slice(0, 4).map((item, idx) => (
                          <div
                            key={idx}
                            className="w-12 h-12 rounded-lg border-2 border-background overflow-hidden bg-muted"
                          >
                            {item.imagem ? (
                              <img
                                src={item.imagem}
                                alt={item.nome}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-6 h-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        ))}
                        {order.itens && order.itens.length > 4 && (
                          <div className="w-12 h-12 rounded-lg border-2 border-background bg-muted flex items-center justify-center text-xs font-medium">
                            +{order.itens.length - 4}
                          </div>
                        )}
                      </div>

                      <Button variant="outline" asChild>
                        <Link to={`/pedido/${order.numero}`}>
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Detalhes
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MeusPedidos;