import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Heart, Share2, ChevronLeft, ChevronRight, Check, Star, MapPin, CreditCard, ChevronRight as ArrowRight, Loader2, Minus, Plus, Box, Smartphone, QrCode } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/hooks/useCart";
import { useApiProduct } from "@/hooks/useApiProducts";
import { useProductVariations } from "@/hooks/useProductVariations";
import { toast } from "sonner";
import { decodeProductHash, isProductHash } from "@/lib/productHash";
import { generateProductSpecs } from "@/lib/iphoneSpecs";
import BestSellers from "@/components/BestSellers";
import Modal3DViewer from "@/components/Modal3DViewer";
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Produto = () => {
  const { id: rawId } = useParams();
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [cep, setCep] = useState("");
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedCapacity, setSelectedCapacity] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  
  // Estados para frete
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [shippingResult, setShippingResult] = useState<{
    price: number;
    days: number;
    estimatedDate: string;
  } | null>(null);
  
  // Estados para 3D e QR Code
  const [show3DModal, setShow3DModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  
  // Decodifica o hash para obter o ID real
  const id = rawId && isProductHash(rawId) ? decodeProductHash(rawId) || rawId : rawId;
  
  const { data: product, isLoading, error } = useApiProduct(id || '');
  // Usar o ID numérico do produto para buscar variações (não o slug)
  const productId = product?.id || '';
  const { data: variations } = useProductVariations(productId);

  // URL do produto para QR Code
  const productUrl = typeof window !== 'undefined' ? window.location.href : '';

  // Set initial selections when variations load
  useEffect(() => {
    if (variations) {
      // Select first available color
      const availableColor = variations.colors.find(c => c.available);
      if (availableColor && !selectedColor) {
        setSelectedColor(availableColor.name);
      }
      // Select first available capacity
      const availableCapacity = variations.capacities.find(c => c.available);
      if (availableCapacity && !selectedCapacity) {
        setSelectedCapacity(availableCapacity.value);
      }
    }
  }, [variations]);

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  // Get current variation price and stock
  const getCurrentVariation = () => {
    if (!variations || !selectedColor || !selectedCapacity) return null;
    return variations.variations.find(
      v => v.color === selectedColor && v.capacity === selectedCapacity
    );
  };

  const currentVariation = getCurrentVariation();
  const currentPrice = currentVariation?.price || product?.price || 0;
  const currentStock = currentVariation?.stock ?? product?.stock ?? 0;

  // Reset quantity when stock changes
  useEffect(() => {
    if (quantity > currentStock && currentStock > 0) {
      setQuantity(currentStock);
    } else if (currentStock > 0 && quantity === 0) {
      setQuantity(1);
    }
  }, [currentStock]);

  // Check if a capacity is available for the selected color
  const isCapacityAvailableForColor = (capacity: string) => {
    if (!variations || !selectedColor) return false;
    return variations.variations.some(
      v => v.color === selectedColor && v.capacity === capacity && v.available
    );
  };

  // Check if a color is available for the selected capacity
  const isColorAvailableForCapacity = (color: string) => {
    if (!variations || !selectedCapacity) return true;
    return variations.variations.some(
      v => v.color === color && v.capacity === selectedCapacity && v.available
    );
  };

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

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-16 text-center">
          <h1 className="text-2xl font-semibold mb-4">Produto não encontrado</h1>
          <Link to="/">
            <Button>Voltar para a loja</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const installmentPrice = currentPrice / product.installments;

  const handleAddToCart = () => {
    addToCart({
      id: Number(product.id),
      name: product.name,
      image: product.images[0],
      price: currentPrice,
      color: selectedColor || '',
      capacity: selectedCapacity || '',
    }, quantity);
    toast.success(`${quantity} ${quantity > 1 ? 'itens adicionados' : 'item adicionado'} ao carrinho!`);
  };

  const handleBuyNow = () => {
    addToCart({
      id: Number(product.id),
      name: product.name,
      image: product.images[0],
      price: currentPrice,
      color: selectedColor || '',
      capacity: selectedCapacity || '',
    }, quantity);
    toast.success(`${quantity} ${quantity > 1 ? 'itens adicionados' : 'item adicionado'} ao carrinho!`);
    navigate('/carrinho');
  };

  const handleCalculateShipping = async () => {
    if (cep.length < 8) {
      toast.error("Digite um CEP válido");
      return;
    }
    
    setIsCalculatingShipping(true);
    setShippingResult(null);
    
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Verificar se é região Nordeste (CEPs 40000-000 a 65999-999)
    const cepNumber = parseInt(cep);
    const isNordeste = cepNumber >= 40000000 && cepNumber <= 65999999;
    
    const days = isNordeste ? 3 : 7;
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + days);
    
    setShippingResult({
      price: 0, // Frete grátis
      days,
      estimatedDate: estimatedDate.toLocaleDateString('pt-BR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
      })
    });
    
    setIsCalculatingShipping(false);
  };

  const handleUseLocation = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocalização não suportada pelo navegador");
      return;
    }
    
    setIsLoadingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await response.json();
          const postalCode = data.address?.postcode?.replace(/\D/g, '');
          
          if (postalCode && postalCode.length >= 8) {
            setCep(postalCode.slice(0, 8));
            toast.success("CEP detectado com sucesso!");
          } else {
            toast.error("Não foi possível detectar o CEP da sua localização");
          }
        } catch (err) {
          toast.error("Erro ao buscar CEP da localização");
        }
        setIsLoadingLocation(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error("Não foi possível obter sua localização");
        setIsLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const nextImage = () => {
    setCurrentImage((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
  };

  // Verificar se produto tem modelo 3D
  const has3DModel = !!(product as any).modelo_3d_url;
  const hasAR = !!(product as any).ar_enabled;
  const model3DUrl = (product as any).modelo_3d_url || '';

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      <Header />
      
      {/* Breadcrumb */}
      <div className="border-b border-border">
        <div className="container py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link to={`/?category=${product.categorySlug}`} className="hover:text-primary transition-colors">
              {product.category}
            </Link>
            <span>/</span>
            <span className="text-foreground truncate max-w-[300px]">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Section */}
      <main className="container py-4 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16">
          
          {/* Mobile Only - Title and SKU */}
          <div className="lg:hidden order-1">
            <span className="text-xs text-muted-foreground block mb-1">Ref: {product.sku || product.id}</span>
            <h1 className="text-lg font-medium text-foreground leading-snug">
              {product.condition} {product.name} {selectedColor ? `- ${selectedColor}` : ''} - {product.conditionDescription || "Excelente - Sem marcas de uso"}
            </h1>
          </div>

          {/* Left Column - Images */}
          <div className="space-y-3 order-2 lg:order-1">
            
            {/* Main Image */}
            <div className="relative aspect-square flex items-center justify-center rounded-xl overflow-hidden">
              <img
                src={product.images[currentImage]}
                alt={product.name}
                className="w-full h-full object-contain"
              />
              
              {/* Navigation Arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 border border-border rounded-full flex items-center justify-center bg-background/90 hover:bg-secondary transition-colors shadow-sm"
                    aria-label="Imagem anterior"
                  >
                    <ChevronLeft className="w-5 h-5 text-foreground" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 border border-border rounded-full flex items-center justify-center bg-background/90 hover:bg-secondary transition-colors shadow-sm"
                    aria-label="Próxima imagem"
                  >
                    <ChevronRight className="w-5 h-5 text-foreground" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails - show up to 10 images + 3D + QR */}
            <div className="flex gap-2 lg:gap-3 justify-start overflow-x-auto py-2 scrollbar-thin">
              {product.images.slice(0, 10).map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImage(index)}
                  className={`w-14 h-14 lg:w-16 lg:h-16 flex-shrink-0 border-2 rounded-lg overflow-hidden transition-colors bg-secondary/30 ${
                    currentImage === index 
                      ? "border-foreground" 
                      : "border-border hover:border-muted-foreground"
                  }`}
                >
                  <img 
                    src={image} 
                    alt="" 
                    className="w-full h-full object-contain p-1" 
                  />
                </button>
              ))}
              
              
              {/* Botão para QR Code */}
              <button
                onClick={() => setShowQRModal(true)}
                className="w-14 h-14 lg:w-16 lg:h-16 flex-shrink-0 border-2 border-border rounded-lg overflow-hidden bg-secondary flex items-center justify-center hover:border-foreground transition-colors"
                title="QR Code do produto"
              >
                <QrCode className="w-6 h-6 text-foreground" />
              </button>

              {/* Botão para visualização 3D (sempre visível) */}
              <button
                onClick={() => setShow3DModal(true)}
                className="w-14 h-14 lg:w-16 lg:h-16 flex-shrink-0 border-2 border-border rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center hover:border-foreground transition-colors"
                title="Ver em 3D"
              >
                <Box className="w-6 h-6 text-white" />
              </button>
            </div>
            
            {/* Botão AR (quando disponível) */}
            {hasAR && model3DUrl && (
              <a
                rel="ar"
                href={model3DUrl}
                className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/80 transition-colors"
              >
                <Smartphone className="w-5 h-5" />
                Ver em AR (Realidade Aumentada)
              </a>
            )}
          </div>

          {/* Right Column - Product Info (after image on mobile) */}
          <div className="space-y-5 order-3 lg:order-2">
            {/* Title Row - Desktop Only */}
            <div className="hidden lg:block">
              <h1 className="text-2xl font-semibold text-foreground leading-tight">
                {product.condition} {product.name} {selectedColor ? `- ${selectedColor}` : ''} - {product.conditionDescription || "Excelente - Sem marcas de uso"}
              </h1>
            </div>

            {/* SKU and Rating - Desktop Only */}
            <div className="hidden lg:flex items-center gap-4 flex-wrap">
              <span className="text-sm text-muted-foreground">Ref: {product.sku || product.id}</span>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(product.rating) ? "fill-muted-foreground text-muted-foreground" : "text-muted"}`}
                  />
                ))}
              </div>
            </div>

            {/* Condition Badge */}
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-md border border-blue-200">
                <Check className="w-4 h-4" />
                {product.conditionDescription || product.condition}
              </span>
            </div>

            {/* Price Section */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl lg:text-4xl font-bold text-foreground">
                    {formatPrice(currentPrice)}
                  </span>
                  <span className="text-sm text-muted-foreground">no PIX</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="p-2 hover:bg-secondary rounded-full transition-colors"
                    aria-label="Adicionar aos favoritos"
                  >
                    <Heart 
                      className={`w-5 h-5 ${isFavorite ? "fill-primary text-primary" : "text-muted-foreground"}`} 
                    />
                  </button>
                  <button 
                    className="p-2 hover:bg-secondary rounded-full transition-colors"
                    aria-label="Compartilhar"
                  >
                    <Share2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                ou <span className="font-medium text-primary">{product.installments}x</span> de{" "}
                <span className="font-medium text-primary">{formatPrice(installmentPrice)}</span>
              </p>
            </div>

            {/* Payment Methods Link */}
            <button className="flex items-center gap-2 text-sm text-primary hover:underline w-full py-3 border-y border-border">
              <CreditCard className="w-5 h-5" />
              <span>veja todas as formas de pagamento</span>
              <ArrowRight className="w-4 h-4 ml-auto" />
            </button>

            {/* Shipping Calculator */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Calcule o prazo de entrega</p>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Insira seu CEP"
                  value={cep}
                  onChange={(e) => setCep(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  className="flex-1 h-11"
                  maxLength={9}
                />
                <Button 
                  onClick={handleCalculateShipping}
                  disabled={isCalculatingShipping}
                  className="h-11 px-6 bg-foreground hover:bg-foreground/80 text-background rounded-lg transition-all"
                >
                  {isCalculatingShipping ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Calcular"
                  )}
                </Button>
              </div>
              <button 
                onClick={handleUseLocation}
                disabled={isLoadingLocation}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                {isLoadingLocation ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MapPin className="w-4 h-4" />
                )}
                <span>{isLoadingLocation ? "Obtendo localização..." : "Use minha localização"}</span>
              </button>
              
              {/* Resultado do cálculo de frete */}
              {shippingResult && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <Check className="w-5 h-5" />
                    <span className="font-medium">
                      {shippingResult.price === 0 ? "Frete Grátis!" : formatPrice(shippingResult.price)}
                    </span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    Entrega estimada: <strong>{shippingResult.estimatedDate}</strong>
                  </p>
                  <p className="text-xs text-green-500 mt-1">
                    ({shippingResult.days} dias úteis)
                  </p>
                </div>
              )}
            </div>

            {/* Color Selector - only show registered colors */}
            {variations && variations.colors.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">
                  Escolha a Cor{" "}
                  <span className="font-semibold">{selectedColor}</span>
                </p>
                <div className="flex gap-2 flex-wrap">
                  {variations.colors.map((color) => {
                    const isSelected = selectedColor === color.name;
                    const isAvailable = color.available && isColorAvailableForCapacity(color.name);
                    
                    return (
                      <button
                        key={color.name}
                        onClick={() => isAvailable && setSelectedColor(color.name)}
                        disabled={!isAvailable}
                        className={`w-10 h-10 rounded border transition-all ${
                          isSelected 
                            ? 'ring-2 ring-foreground ring-offset-2 border-foreground' 
                            : 'border-border hover:border-muted-foreground'
                        } ${!isAvailable ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                        style={{ backgroundColor: color.code }}
                        aria-label={`Cor ${color.name}${!isAvailable ? ' - Indisponível' : ''}`}
                        title={`${color.name}${!isAvailable ? ' - Indisponível' : ''}`}
                      >
                        {!isAvailable && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-[2px] bg-muted-foreground rotate-45 absolute" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Capacity Selector */}
            {variations && variations.capacities.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Escolha a Capacidade</p>
                <div className="flex gap-2 flex-wrap">
                  {variations.capacities.map((capacity) => {
                    const isSelected = selectedCapacity === capacity.value;
                    const isAvailable = capacity.available && isCapacityAvailableForColor(capacity.value);
                    
                    return (
                      <button
                        key={capacity.value}
                        onClick={() => isAvailable && setSelectedCapacity(capacity.value)}
                        disabled={!isAvailable}
                        className={`px-4 py-2 border rounded text-sm font-medium transition-colors ${
                          isSelected 
                            ? 'border-foreground text-foreground bg-background' 
                            : 'border-border text-muted-foreground bg-background hover:border-muted-foreground'
                        } ${!isAvailable ? 'opacity-40 cursor-not-allowed line-through bg-muted' : 'cursor-pointer'}`}
                      >
                        {capacity.value}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            {currentStock > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Quantidade</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-10 h-10 flex items-center justify-center border border-border rounded-lg hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-medium text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(currentStock, q + 1))}
                    disabled={quantity >= currentStock}
                    className="w-10 h-10 flex items-center justify-center border border-border rounded-lg hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-muted-foreground">
                    ({currentStock} disponíveis)
                  </span>
                </div>
              </div>
            )}

            {/* Desktop Add to Cart Button */}
            <div className="hidden lg:flex gap-3 pt-4">
              <Button 
                onClick={handleAddToCart} 
                className="flex-1 h-14 text-base font-semibold bg-foreground hover:bg-foreground/80 text-background rounded-lg transition-all"
                disabled={currentStock === 0}
              >
                {currentStock === 0 ? "Esgotado" : "Adicionar ao carrinho"}
              </Button>
              <Button 
                onClick={handleBuyNow} 
                className="flex-1 h-14 text-base font-semibold bg-foreground hover:bg-foreground/80 text-background rounded-lg transition-all"
                disabled={currentStock === 0}
              >
                Comprar
              </Button>
            </div>

            {/* Stock Warning */}
            {currentStock > 0 && currentStock <= 5 && (
              <p className="text-sm text-amber-600 font-medium text-center">
                Apenas {currentStock} unidades em estoque!
              </p>
            )}
          </div>
        </div>

        {/* Specifications Section */}
        {product && (
          <div className="mt-12 pt-8 border-t border-border">
            <h2 className="text-xl font-semibold mb-6">Especificações</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {generateProductSpecs(
                product.name,
                product.specs || [],
                selectedCapacity,
                selectedColor
              ).map((spec) => (
                <div key={spec.label} className="space-y-1">
                  <dt className="text-sm text-muted-foreground">{spec.label}</dt>
                  <dd className="font-medium">{spec.value}</dd>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {product.description && (
          <div className="mt-12 pt-8 border-t border-border">
            <h2 className="text-xl font-semibold mb-4">Descrição do Produto</h2>
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          </div>
        )}

        {/* Best Sellers Section */}
        <BestSellers excludeProductId={product.id} />
      </main>

      {/* Fixed Bottom Bar - Mobile/Tablet */}
      <div className="fixed bottom-0 left-0 right-0 bg-transparent p-4 lg:hidden z-50">
        <div className="container flex gap-3">
          <Button 
            onClick={handleAddToCart} 
            className="flex-1 h-12 text-sm font-semibold bg-foreground hover:bg-foreground/80 text-background rounded-lg transition-all shadow-lg"
            disabled={currentStock === 0}
          >
            {currentStock === 0 ? "Esgotado" : "Adicionar ao carrinho"}
          </Button>
          <Button 
            onClick={handleBuyNow} 
            className="flex-1 h-12 text-sm font-semibold bg-foreground hover:bg-foreground/80 text-background rounded-lg transition-all shadow-lg"
            disabled={currentStock === 0}
          >
            Comprar
          </Button>
        </div>
      </div>


      {/* Modal QR Code */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>QR Code do Produto</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="bg-white p-4 rounded-xl">
              <QRCodeSVG
                value={productUrl}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Escaneie o QR Code para acessar este produto no seu celular
            </p>
            <p className="text-xs text-muted-foreground break-all text-center max-w-full">
              {productUrl}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Visualização 3D */}
      <Dialog open={show3DModal} onOpenChange={setShow3DModal}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Box className="w-5 h-5" />
              Visualização 3D - {product?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 h-full min-h-[400px] bg-gradient-to-b from-secondary to-background rounded-lg overflow-hidden flex items-center justify-center">
            {has3DModel && model3DUrl ? (
              <Modal3DViewer
                isOpen={true}
                onClose={() => setShow3DModal(false)}
                modelUrl={model3DUrl}
                productName={product?.name || ''}
              />
            ) : (
              <div className="text-center p-8">
                <Box className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Modelo 3D em breve</h3>
                <p className="text-muted-foreground text-sm max-w-md">
                  A visualização 3D interativa deste produto estará disponível em breve.
                  Com ela você poderá girar, ampliar e ver o produto de todos os ângulos.
                </p>
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground text-center">
            {has3DModel ? 'Arraste para girar • Scroll para zoom • Segure Shift + arraste para mover' : 'Recurso em desenvolvimento'}
          </p>
        </DialogContent>
      </Dialog>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Produto;
