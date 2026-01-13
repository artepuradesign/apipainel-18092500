import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { QrCode, CreditCard, ShieldCheck, ArrowLeft, User, Loader2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import PaymentModal from "@/components/PaymentModal";
import LoginModal from "@/components/LoginModal";

const Checkout = () => {
  const { cartItems, getTotal } = useCart();
  const { user, isLoggedIn, isLoading } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card">("pix");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [defaultToRegister, setDefaultToRegister] = useState(false);

  const subtotal = getTotal();
  const shipping = subtotal > 299 ? 0 : 29.9;
  const total = subtotal + shipping;

  // Recarregar estado do usuário quando o modal fechar
  useEffect(() => {
    // Força recarregamento do estado de autenticação
  }, [showLoginModal]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-16 text-center">
          <h1 className="text-xl md:text-2xl font-semibold mb-4">Carrinho vazio</h1>
          <Link to="/"><Button>Voltar para a loja</Button></Link>
        </main>
        <Footer />
      </div>
    );
  }

  // Se não estiver logado, mostrar aviso com botões que abrem o modal
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8 md:py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-semibold mb-4">Faça login para continuar</h1>
            <p className="text-muted-foreground mb-8">
              Para finalizar sua compra, você precisa estar logado em sua conta. 
              Assim podemos garantir a segurança do seu pedido e você poderá acompanhar o status da entrega.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                size="lg"
                onClick={() => {
                  setDefaultToRegister(false);
                  setShowLoginModal(true);
                }}
              >
                Entrar na minha conta
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => {
                  setDefaultToRegister(true);
                  setShowLoginModal(true);
                }}
              >
                Criar conta
              </Button>
            </div>
            <div className="mt-6">
              <Button variant="ghost" asChild>
                <Link to="/carrinho">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar ao carrinho
                </Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />

        <LoginModal 
          isOpen={showLoginModal} 
          onClose={() => setShowLoginModal(false)}
          defaultToRegister={defaultToRegister}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-4 md:py-8">
        <div className="flex items-center gap-2 mb-4 md:mb-6">
          <Button variant="ghost" size="sm" asChild className="text-xs md:text-sm">
            <Link to="/carrinho"><ArrowLeft className="w-4 h-4 mr-1 md:mr-2" />Voltar</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Dados do cliente logado */}
            <Card>
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Dados do Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Nome:</span>
                    <span className="font-medium">{user?.nome}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">{user?.email}</span>
                  </div>
                  {user?.telefone && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Telefone:</span>
                      <span className="font-medium">{user?.telefone}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Forma de pagamento */}
            <Card>
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-base md:text-lg">Forma de Pagamento</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as "pix" | "card")} className="space-y-3 md:space-y-4">
                  <div className="flex items-center space-x-3 p-3 md:p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="pix" id="pix" />
                    <Label htmlFor="pix" className="flex items-center gap-2 md:gap-3 cursor-pointer flex-1">
                      <QrCode className="w-5 h-5 md:w-6 md:h-6 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-sm md:text-base">PIX</p>
                        <p className="text-xs md:text-sm text-muted-foreground">Aprovação instantânea</p>
                      </div>
                      <span className="ml-auto text-xs font-medium text-green-600 shrink-0">5% off</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 md:p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex items-center gap-2 md:gap-3 cursor-pointer flex-1">
                      <CreditCard className="w-5 h-5 md:w-6 md:h-6 text-primary shrink-0" />
                      <div>
                        <p className="font-medium text-sm md:text-base">Cartão de Crédito</p>
                        <p className="text-xs md:text-sm text-muted-foreground">Em até 12x sem juros</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                <Button onClick={() => setShowPaymentModal(true)} className="w-full mt-6" size="lg">
                  Continuar para Pagamento
                </Button>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-20">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-base md:text-lg">Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0 space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-xs md:text-sm gap-2">
                    <span className="text-muted-foreground truncate">{item.quantity}x {item.name}</span>
                    <span className="shrink-0">{(item.price * item.quantity).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between text-xs md:text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{subtotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                </div>
                <div className="flex justify-between text-xs md:text-sm">
                  <span className="text-muted-foreground">Frete</span>
                  <span className="text-green-600">{shipping === 0 ? "Grátis" : shipping.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                </div>
                {paymentMethod === "pix" && (
                  <div className="flex justify-between text-xs md:text-sm text-green-600">
                    <span>Desconto PIX (5%)</span>
                    <span>-{(total * 0.05).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-base md:text-lg">
                  <span>Total</span>
                  <span>{(paymentMethod === "pix" ? total * 0.95 : total).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                </div>
                <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground bg-muted p-2 md:p-3 rounded-lg">
                  <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
                  <span>Compra 100% segura</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        paymentMethod={paymentMethod}
        total={total}
        subtotal={subtotal}
        shipping={shipping}
        cartItems={cartItems}
        user={user}
      />
    </div>
  );
};

export default Checkout;
