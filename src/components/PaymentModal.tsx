import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  QrCode,
  CreditCard,
  Copy,
  Check,
  Loader2,
  ShieldCheck,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { useCart, CartItem } from "@/hooks/useCart";
import { createPedido, updatePedidoStatus } from "@/services/pedidosApi";
import { User as UserType } from "@/hooks/useAuth";
import { useInvalidateProducts } from "@/hooks/useInvalidateProducts";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentMethod: "pix" | "card";
  total: number;
  subtotal: number;
  shipping: number;
  cartItems: CartItem[];
  user: UserType | null;
}

const PaymentModal = ({
  isOpen,
  onClose,
  paymentMethod,
  total,
  subtotal,
  shipping,
  cartItems,
  user,
}: PaymentModalProps) => {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const { invalidateAllProducts } = useInvalidateProducts();
  const [isProcessing, setIsProcessing] = useState(false);
  const [pixGenerated, setPixGenerated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const [cardData, setCardData] = useState({
    number: "",
    name: user?.nome?.toUpperCase() || "",
    expiry: "",
    cvv: "",
    installments: "1",
  });

  const finalTotal = paymentMethod === "pix" ? total * 0.95 : total;
  const discount = paymentMethod === "pix" ? total * 0.05 : 0;

  const pixCode =
    "00020126580014br.gov.bcb.pix0136a1b2c3d4-e5f6-7890-abcd-ef1234567890520400005303986540" +
    finalTotal.toFixed(2).replace(".", "") +
    "5802BR5925IPLACE LTDA6009SAO PAULO62070503***6304";

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    toast.success("Código PIX copiado!");
    setTimeout(() => setCopied(false), 3000);
  };

  const handleGeneratePix = async () => {
    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }

    setIsProcessing(true);
    try {
      const numero = await saveOrderToAPI("pix", "pendente");
      setOrderNumber(numero);
      setPixGenerated(true);
      toast.success("Pedido registrado! Aguardando pagamento.");
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      toast.error("Erro ao registrar pedido. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmPixPayment = async () => {
    if (!orderNumber) {
      toast.error("Erro: pedido não encontrado");
      return;
    }

    setIsProcessing(true);
    try {
      await updatePedidoStatus(orderNumber, "pago");
      // Invalida cache de produtos para atualizar estoque
      invalidateAllProducts();
      clearCart();
      onClose();
      localStorage.setItem("lastOrderNumber", orderNumber);
      toast.success("Pagamento confirmado!");
      navigate("/pedido-confirmado");
    } catch (error) {
      console.error("Erro ao confirmar pagamento:", error);
      toast.error("Erro ao confirmar pagamento. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(" ") : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  const handleCardPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }

    if (
      !cardData.number ||
      !cardData.name ||
      !cardData.expiry ||
      !cardData.cvv
    ) {
      toast.error("Preencha todos os dados do cartão");
      return;
    }

    setIsProcessing(true);
    try {
      const numero = await saveOrderToAPI("cartao", "pendente");
      await updatePedidoStatus(numero, "pago");
      
      // Invalida cache de produtos para atualizar estoque
      invalidateAllProducts();
      clearCart();
      onClose();
      localStorage.setItem("lastOrderNumber", numero);
      toast.success("Pagamento aprovado!");
      navigate("/pedido-confirmado");
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
      toast.error("Erro ao processar pagamento. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  const saveOrderToAPI = async (
    method: "pix" | "cartao" | "boleto",
    status: "pendente" | "pago" = "pendente"
  ): Promise<string> => {
    if (!user) throw new Error("Usuário não autenticado");

    const result = await createPedido({
      usuario_id: user.id,
      nome_cliente: user.nome,
      email_cliente: user.email,
      telefone_cliente: user.telefone,
      cpf_cliente: user.cpf,
      subtotal,
      desconto: discount,
      frete: shipping,
      total: finalTotal,
      forma_pagamento: method,
      status,
      itens: cartItems.map((item) => ({
        produto_id: !isNaN(Number(item.id)) ? Number(item.id) : undefined,
        nome: item.name,
        sku: String(item.id),
        imagem: item.image,
        quantidade: item.quantity,
        preco_unitario: item.price,
      })),
    });

    return result.numero;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {paymentMethod === "pix" ? (
              <>
                <QrCode className="w-5 h-5" />
                Pagamento via PIX
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Pagamento com Cartão
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Dados do cliente logado */}
          {user && (
            <div className="p-3 bg-muted/50 rounded-lg text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <div>
                <span className="text-muted-foreground">Cliente: </span>
                <strong>{user.nome}</strong>
                <span className="text-muted-foreground ml-2">({user.email})</span>
              </div>
            </div>
          )}

          {paymentMethod === "pix" ? (
            <>
              {!pixGenerated ? (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground mb-4">
                    Clique para gerar o QR Code PIX
                  </p>
                  <Button
                    onClick={handleGeneratePix}
                    disabled={isProcessing}
                    size="lg"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      "Gerar QR Code PIX"
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orderNumber && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                      <p className="text-sm text-green-800">
                        Pedido <strong>#{orderNumber}</strong> registrado!
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Status: Aguardando pagamento
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col items-center">
                    <div className="w-40 h-40 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                      <div className="text-center">
                        <QrCode className="w-24 h-24 text-foreground mx-auto" />
                        <p className="text-xs text-muted-foreground mt-2">
                          QR Code PIX
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4 text-center">
                      Escaneie o QR Code com o app do seu banco
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Ou copie o código PIX:
                    </Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={pixCode.substring(0, 40) + "..."}
                        readOnly
                        className="font-mono text-xs"
                      />
                      <Button variant="outline" size="icon" onClick={handleCopyPix}>
                        {copied ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      <strong>Importante:</strong> Após realizar o pagamento, clique
                      no botão abaixo para confirmar.
                    </p>
                  </div>

                  <Button
                    onClick={handleConfirmPixPayment}
                    className="w-full"
                    size="lg"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Confirmando...
                      </>
                    ) : (
                      "Já realizei o pagamento"
                    )}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleCardPayment} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Número do Cartão</Label>
                <Input
                  id="cardNumber"
                  placeholder="0000 0000 0000 0000"
                  value={cardData.number}
                  onChange={(e) =>
                    setCardData({
                      ...cardData,
                      number: formatCardNumber(e.target.value),
                    })
                  }
                  maxLength={19}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardName">Nome no Cartão</Label>
                <Input
                  id="cardName"
                  placeholder="Como está no cartão"
                  value={cardData.name}
                  onChange={(e) =>
                    setCardData({
                      ...cardData,
                      name: e.target.value.toUpperCase(),
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Validade</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/AA"
                    value={cardData.expiry}
                    onChange={(e) =>
                      setCardData({
                        ...cardData,
                        expiry: formatExpiry(e.target.value),
                      })
                    }
                    maxLength={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="000"
                    value={cardData.cvv}
                    onChange={(e) =>
                      setCardData({
                        ...cardData,
                        cvv: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    maxLength={4}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="installments">Parcelas</Label>
                <select
                  id="installments"
                  value={cardData.installments}
                  onChange={(e) =>
                    setCardData({ ...cardData, installments: e.target.value })
                  }
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                    <option key={n} value={n}>
                      {n}x de{" "}
                      {(total / n).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}{" "}
                      sem juros
                    </option>
                  ))}
                </select>
              </div>

              <Button
                type="submit"
                className="w-full py-6"
                size="lg"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  `Pagar ${finalTotal.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}`
                )}
              </Button>
            </form>
          )}

          {/* Order Summary */}
          <Separator />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>
                {subtotal.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Frete</span>
              <span className="text-green-600">
                {shipping === 0
                  ? "Grátis"
                  : shipping.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
              </span>
            </div>
            {paymentMethod === "pix" && (
              <div className="flex justify-between text-green-600">
                <span>Desconto PIX (5%)</span>
                <span>
                  -
                  {discount.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>
                {finalTotal.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground p-3 bg-muted rounded-lg">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            <span>Pagamento 100% seguro</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
