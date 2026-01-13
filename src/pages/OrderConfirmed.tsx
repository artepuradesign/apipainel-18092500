import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Package, Mail, ArrowRight } from "lucide-react";

const OrderConfirmed = () => {
  const orderNumber = localStorage.getItem("lastOrderNumber") || Math.random().toString(36).substring(2, 8).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-12">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-12 pb-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">Pedido Confirmado!</h1>
            <p className="text-muted-foreground mb-6">Seu pedido foi recebido e está sendo processado.</p>
            <div className="bg-muted p-4 rounded-lg mb-8 inline-block">
              <p className="text-sm text-muted-foreground">Número do pedido</p>
              <p className="text-2xl font-bold">#{orderNumber}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <Mail className="w-8 h-8 text-primary" />
                <div className="text-left">
                  <p className="font-medium">Confirmação por email</p>
                  <p className="text-sm text-muted-foreground">Enviamos os detalhes para seu email</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <Package className="w-8 h-8 text-primary" />
                <div className="text-left">
                  <p className="font-medium">Acompanhe seu pedido</p>
                  <p className="text-sm text-muted-foreground">Você receberá atualizações por email</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <Button asChild size="lg" className="w-full md:w-auto">
                <Link to={`/pedido/${orderNumber}`}>
                  Acompanhar Pedido <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <div>
                <Button asChild variant="outline" size="lg" className="w-full md:w-auto">
                  <Link to="/">Continuar Comprando</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default OrderConfirmed;
