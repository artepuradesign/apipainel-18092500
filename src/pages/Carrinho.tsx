import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/hooks/useCart";

const Carrinho = () => {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, getTotal } = useCart();
  const [coupon, setCoupon] = useState("");

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const subtotal = getTotal();
  const shipping = subtotal > 299 ? 0 : 29.90;
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-12 md:py-16 text-center">
          <ShoppingBag className="w-16 h-16 md:w-20 md:h-20 text-muted-foreground mx-auto mb-4 md:mb-6" />
          <h1 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">Seu carrinho está vazio</h1>
          <p className="text-sm md:text-base text-muted-foreground mb-6 md:mb-8">
            Adicione produtos para continuar comprando
          </p>
          <Link to="/">
            <Button>Continuar comprando</Button>
          </Link>
        </main>
        <Footer />
        <WhatsAppButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Breadcrumb - Hidden on mobile */}
      <div className="bg-secondary py-2 md:py-3 hidden sm:block">
        <div className="container">
          <nav className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <span className="text-foreground">Carrinho</span>
          </nav>
        </div>
      </div>

      <main className="container py-4 md:py-8">
        <h1 className="text-xl md:text-2xl font-semibold mb-4 md:mb-8">Meu Carrinho</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3 md:space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 md:gap-4 p-3 md:p-4 bg-card rounded-lg border border-border"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/produto/${item.id}`}
                    className="font-medium text-sm md:text-base text-foreground hover:text-primary line-clamp-2"
                  >
                    {item.name}
                  </Link>
                  {item.color && (
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">
                      {item.color} {item.capacity && `- ${item.capacity}`}
                    </p>
                  )}
                  <p className="text-base md:text-lg font-bold text-foreground mt-1 md:mt-2">
                    {formatPrice(item.price)}
                  </p>
                  <div className="flex items-center justify-between gap-2 mt-2 md:mt-3">
                    <div className="flex items-center border border-border rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1.5 md:p-2 hover:bg-secondary transition-colors"
                      >
                        <Minus className="w-3 h-3 md:w-4 md:h-4" />
                      </button>
                      <span className="px-3 md:px-4 text-sm md:text-base font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1.5 md:p-2 hover:bg-secondary transition-colors"
                      >
                        <Plus className="w-3 h-3 md:w-4 md:h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-destructive hover:text-destructive/80 transition-colors p-2"
                    >
                      <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg border border-border p-4 md:p-6 sticky top-20">
              <h2 className="font-semibold text-base md:text-lg mb-4">Resumo do pedido</h2>

              {/* Coupon */}
              <div className="flex gap-2 mb-4 md:mb-6">
                <Input
                  placeholder="Cupom de desconto"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  className="flex-1 text-sm"
                />
                <Button variant="outline" size="sm" className="shrink-0">Aplicar</Button>
              </div>

              <div className="space-y-2 md:space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frete</span>
                  <span className={shipping === 0 ? "text-primary" : ""}>
                    {shipping === 0 ? "Grátis" : formatPrice(shipping)}
                  </span>
                </div>
                <div className="border-t border-border pt-2 md:pt-3 flex justify-between font-semibold text-base md:text-lg">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  ou em até 12x de {formatPrice(total / 12)} sem juros
                </p>
              </div>

              <Button 
                onClick={() => navigate("/checkout")}
                className="w-full mt-4 md:mt-6 py-5 md:py-6 text-sm md:text-base"
              >
                Finalizar compra
              </Button>

              <Link to="/" className="block mt-3 md:mt-4">
                <Button variant="ghost" className="w-full text-sm">
                  Continuar comprando
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Carrinho;
