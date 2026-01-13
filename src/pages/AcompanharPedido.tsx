import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Package, 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  Truck, 
  MapPin,
  CreditCard,
  QrCode,
  Calendar,
  Mail,
  Loader2
} from "lucide-react";
import { fetchPedidoByNumero, Pedido } from "@/services/pedidosApi";

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pendente: { label: "Pendente", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  pago: { label: "Pago", color: "bg-green-100 text-green-800", icon: CheckCircle },
  preparando: { label: "Preparando", color: "bg-blue-100 text-blue-800", icon: Package },
  enviado: { label: "Enviado", color: "bg-purple-100 text-purple-800", icon: Truck },
  entregue: { label: "Entregue", color: "bg-green-100 text-green-800", icon: CheckCircle },
  cancelado: { label: "Cancelado", color: "bg-red-100 text-red-800", icon: Clock },
};

const allSteps = [
  { key: "pago", label: "Pagamento Aprovado", icon: CheckCircle },
  { key: "preparando", label: "Em Preparação", icon: Package },
  { key: "enviado", label: "Enviado", icon: Truck },
  { key: "entregue", label: "Entregue", icon: CheckCircle },
];

const AcompanharPedido = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<Pedido | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderNumber) return;
      
      setIsLoading(true);
      try {
        const pedido = await fetchPedidoByNumero(orderNumber);
        setOrder(pedido);
      } catch (error) {
        console.error("Erro ao buscar pedido:", error);
        setOrder(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrder();
  }, [orderNumber]);

  const formatPrice = (price: number) => {
    return Number(price).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const getCurrentStepIndex = () => {
    if (!order) return -1;
    return allSteps.findIndex(step => step.key === order.status);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-16 text-center">
          <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Carregando pedido...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-16 text-center">
          <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Pedido não encontrado</h1>
          <p className="text-muted-foreground mb-6">
            Não foi possível encontrar o pedido #{orderNumber}
          </p>
          <Button asChild>
            <Link to="/meus-pedidos">Ver Meus Pedidos</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const status = statusConfig[order.status] || statusConfig.pendente;
  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-4 md:py-8">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link to="/meus-pedidos">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Meus Pedidos
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Header */}
            <Card>
              <CardHeader className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Número do pedido</p>
                    <h1 className="text-2xl font-bold">#{order.numero}</h1>
                  </div>
                  <Badge className={`${status.color} w-fit`}>
                    {status.label}
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Progress Tracker */}
            <Card>
              <CardHeader className="p-4 md:p-6 pb-0">
                <CardTitle className="text-lg">Acompanhamento do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-muted" />
                  
                  {/* Steps */}
                  <div className="space-y-6">
                    {allSteps.map((step, index) => {
                      const isCompleted = index <= currentStepIndex;
                      const isCurrent = index === currentStepIndex;
                      const StepIcon = step.icon;
                      
                      return (
                        <div key={step.key} className="relative flex items-start gap-4">
                          <div 
                            className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all ${
                              isCompleted 
                                ? "bg-primary text-primary-foreground" 
                                : "bg-muted text-muted-foreground"
                            } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}
                          >
                            <StepIcon className="w-5 h-5" />
                          </div>
                          <div className="pt-2.5">
                            <p className={`font-medium ${isCompleted ? "" : "text-muted-foreground"}`}>
                              {step.label}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {order.codigo_rastreio && (
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Código de Rastreio</p>
                    <p className="font-mono font-bold">{order.codigo_rastreio}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader className="p-4 md:p-6 pb-0">
                <CardTitle className="text-lg">Itens do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <div className="space-y-4">
                  {order.itens?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted">
                        {item.imagem ? (
                          <img 
                            src={item.imagem} 
                            alt={item.nome}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{item.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          Quantidade: {item.quantidade}
                        </p>
                      </div>
                      <p className="font-medium shrink-0">
                        {formatPrice(Number(item.preco_unitario) * item.quantidade)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Details */}
            <Card>
              <CardHeader className="p-4 md:p-6 pb-0">
                <CardTitle className="text-lg">Detalhes do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Data do Pedido</p>
                    <p className="font-medium">{formatDate(order.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{order.email_cliente}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {order.forma_pagamento === "pix" ? (
                    <QrCode className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <CreditCard className="w-5 h-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Pagamento</p>
                    <p className="font-medium">
                      {order.forma_pagamento === "pix" ? "PIX" : 
                       order.forma_pagamento === "cartao" ? "Cartão de Crédito" : 
                       "Boleto"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader className="p-4 md:p-6 pb-0">
                <CardTitle className="text-lg">Resumo</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Frete</span>
                  <span className="text-green-600">
                    {Number(order.frete) === 0 ? "Grátis" : formatPrice(order.frete)}
                  </span>
                </div>
                {Number(order.desconto) > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Desconto</span>
                    <span>-{formatPrice(order.desconto)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Help */}
            <Card>
              <CardContent className="p-4 md:p-6 text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  Precisa de ajuda com seu pedido?
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <a 
                    href="https://api.whatsapp.com/send?phone=5598989145930&text=Olá, preciso de ajuda com meu pedido!"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Falar com Suporte
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AcompanharPedido;