import { useState, useEffect } from "react";
import { ShoppingCart, User, Heart, Menu, LogOut, Package, MapPin, UserCircle, HelpCircle, ChevronDown, ChevronRight } from "lucide-react";
import AppleLogo from "@/assets/logo-apple.svg";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import SearchDropdown from "./SearchDropdown";
import LoginModal from "./LoginModal";
import UserMenuDropdown from "./UserMenuDropdown";
import { useCart } from "@/hooks/useCart";
import { useCategories } from "@/hooks/useCategories";
import { toast } from "sonner";

interface Usuario {
  id: number;
  nome: string;
  email: string;
  tipo: 'admin' | 'cliente';
}

const Header = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProdutosOpen, setIsProdutosOpen] = useState(false);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const { getItemCount } = useCart();
  const { categories } = useCategories();
  const itemCount = getItemCount();
  const navigate = useNavigate();

  // Verificar se usuário está logado
  useEffect(() => {
    const checkAuth = () => {
      const usuarioData = localStorage.getItem('usuario');
      if (usuarioData) {
        try {
          setUsuario(JSON.parse(usuarioData));
        } catch {
          setUsuario(null);
        }
      } else {
        setUsuario(null);
      }
    };

    checkAuth();
    // Escutar mudanças no localStorage
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
    setIsMobileMenuOpen(false);
    toast.success("Você saiu da sua conta");
    navigate('/');
  };

  const handleLoginSuccess = () => {
    const usuarioData = localStorage.getItem('usuario');
    if (usuarioData) {
      try {
        const user = JSON.parse(usuarioData);
        setUsuario(user);
        // Redirecionar baseado no tipo
        if (user.tipo === 'admin') {
          navigate('/admin/dashboard');
        }
      } catch {
        setUsuario(null);
      }
    }
  };

  return (
    <>
      <header className="w-full sticky top-0 z-50 bg-background">
        {/* Main header */}
        <div className="border-b border-border py-3 md:py-4">
          <div className="container flex items-center justify-between gap-3 md:gap-6">
            {/* Mobile Menu Button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="shrink-0 rounded-full hover:bg-foreground hover:text-background">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0">
                <div className="p-4 border-b border-border">
                  <Link to="/" className="flex items-center gap-1.5" onClick={() => setIsMobileMenuOpen(false)}>
                    <img src={AppleLogo} alt="Apple" className="w-5 h-5" />
                    <span className="text-xl font-bold text-foreground">iPlace</span>
                    <span className="text-xs text-muted-foreground ml-1">seminovos</span>
                  </Link>
                </div>
                
                {/* Mostrar nome do usuário se logado */}
                {usuario && (
                  <div className="p-4 border-b border-border bg-secondary/50">
                    <p className="text-sm text-muted-foreground">Olá,</p>
                    <p className="font-medium text-foreground">{usuario.nome}</p>
                  </div>
                )}
                
                <nav className="p-4">
                  <Collapsible open={isProdutosOpen} onOpenChange={setIsProdutosOpen}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-3 text-foreground hover:bg-secondary rounded-lg transition-colors">
                      <span className="font-medium">Produtos</span>
                      {isProdutosOpen ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <ul className="ml-4 mt-1 space-y-1 border-l border-border pl-3">
                        {categories.map((cat) => (
                          <li key={cat.id}>
                            <Link
                              to={`/busca?categoria=${cat.slug}`}
                              className="block px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {cat.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </CollapsibleContent>
                  </Collapsible>
                </nav>
                
                <div className="p-4 border-t border-border mt-auto">
                  {usuario ? (
                    <div className="space-y-2">
                      <Link 
                        to="/meus-pedidos" 
                        className="flex items-center gap-3 px-3 py-3 text-foreground hover:bg-secondary rounded-lg transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Package className="w-5 h-5" />
                        Meus Pedidos
                      </Link>
                      <Link 
                        to="/enderecos" 
                        className="flex items-center gap-3 px-3 py-3 text-foreground hover:bg-secondary rounded-lg transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <MapPin className="w-5 h-5" />
                        Endereços
                      </Link>
                      <a 
                        href="https://api.whatsapp.com/send?phone=5598989145930&text=Olá, preciso de ajuda!"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-3 py-3 text-foreground hover:bg-secondary rounded-lg transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <HelpCircle className="w-5 h-5" />
                        Ajuda
                      </a>
                      {usuario.tipo === 'admin' && (
                        <Link 
                          to="/admin/dashboard" 
                          className="flex items-center gap-3 px-3 py-3 text-primary font-medium hover:bg-secondary rounded-lg transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <User className="w-5 h-5" />
                          Painel Admin
                        </Link>
                      )}
                      <button 
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-3 w-full text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <LogOut className="w-5 h-5" />
                        Sair
                      </button>
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsLoginOpen(true);
                      }}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Entre ou cadastre-se
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-1.5 shrink-0">
              <img src={AppleLogo} alt="Apple" className="w-5 h-5 md:w-6 md:h-6" />
              <span className="text-xl md:text-2xl font-bold text-foreground">iPlace</span>
              <span className="text-xs text-muted-foreground ml-1">seminovos</span>
            </Link>

            {/* Search - Hidden on mobile, shown on md+ */}
            <div className="hidden md:block flex-1 max-w-xl">
              <SearchDropdown />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 md:gap-2">
              {usuario ? (
                <UserMenuDropdown 
                  userName={usuario.nome}
                  userEmail={usuario.email}
                  userType={usuario.tipo}
                  onLogout={handleLogout}
                />
              ) : (
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-foreground rounded-full hover:bg-foreground hover:text-background"
                  onClick={() => setIsLoginOpen(true)}
                >
                  <User className="w-5 h-5" />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="text-foreground hidden sm:flex rounded-full hover:bg-transparent hover:text-transparent group">
                <Heart className="w-5 h-5 group-hover:fill-red-500 group-hover:text-red-500 transition-colors" />
              </Button>
              <Link to="/carrinho">
                <Button variant="ghost" size="icon" className="text-foreground relative rounded-full hover:bg-foreground hover:text-background">
                  <ShoppingCart className="w-5 h-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {itemCount > 9 ? '9+' : itemCount}
                    </span>
                  )}
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden container mt-3">
            <SearchDropdown />
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="bg-background border-b border-border hidden lg:block">
          <div className="container">
            <ul className="flex items-center justify-center gap-8 py-3 text-sm font-medium">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link 
                    to={`/busca?categoria=${cat.slug}`}
                    className="text-foreground hover:text-foreground/70 transition-colors py-2"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </header>

      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => {
          setIsLoginOpen(false);
          handleLoginSuccess();
        }} 
      />
    </>
  );
};

export default Header;
