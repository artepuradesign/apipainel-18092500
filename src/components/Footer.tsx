import { Facebook, Instagram, Youtube, ChevronRight, Phone, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import AppleLogo from "@/assets/logo-apple.svg";

const Footer = () => {
  const [openSections, setOpenSections] = useState<string[]>([]);

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const FooterSection = ({ 
    title, 
    id, 
    children 
  }: { 
    title: string; 
    id: string; 
    children: React.ReactNode;
  }) => (
    <Collapsible open={openSections.includes(id)} onOpenChange={() => toggleSection(id)}>
      <CollapsibleTrigger className="flex items-center justify-between w-full md:cursor-default">
        <h4 className="font-semibold text-sm">{title}</h4>
        <ChevronDown className={`w-4 h-4 md:hidden transition-transform ${openSections.includes(id) ? 'rotate-180' : ''}`} />
      </CollapsibleTrigger>
      <CollapsibleContent className="md:!block">
        <div className="mt-3">
          {children}
        </div>
      </CollapsibleContent>
      {/* Desktop always visible */}
      <div className="hidden md:block mt-3">
        {children}
      </div>
    </Collapsible>
  );

  return (
    <footer className="bg-background mt-8 md:mt-12">
      {/* Top Section */}
      <div className="border-t border-border">
        <div className="container py-8 md:py-12">
          {/* Mobile: Collapsible sections */}
          <div className="space-y-4 md:hidden">
            <FooterSection title="Departamento" id="dept">
              <ul className="space-y-2 text-sm">
                <li><Link to="/busca?q=iphone" className="text-muted-foreground hover:text-foreground">iPhone</Link></li>
                <li><Link to="/busca?q=mac" className="text-muted-foreground hover:text-foreground">Mac</Link></li>
                <li><Link to="/busca?q=apple-watch" className="text-muted-foreground hover:text-foreground">Apple Watch</Link></li>
                <li><Link to="/busca?q=ipad" className="text-muted-foreground hover:text-foreground">iPad</Link></li>
                <li><Link to="/busca?q=acessorios" className="text-muted-foreground hover:text-foreground">Acessórios</Link></li>
              </ul>
            </FooterSection>

            <FooterSection title="Serviços" id="services">
              <ul className="space-y-2 text-sm">
                <li><Link to="#" className="text-muted-foreground hover:text-foreground">Garantia</Link></li>
                <li><Link to="#" className="text-muted-foreground hover:text-foreground">Assistência Técnica</Link></li>
                <li><Link to="#" className="text-muted-foreground hover:text-foreground">Retire em loja</Link></li>
              </ul>
            </FooterSection>

            <FooterSection title="Saiba mais" id="more">
              <ul className="space-y-2 text-sm">
                <li><Link to="#" className="text-muted-foreground hover:text-foreground">Sobre a iPlace</Link></li>
                <li><Link to="#" className="text-muted-foreground hover:text-foreground">Dúvidas</Link></li>
                <li><Link to="#" className="text-muted-foreground hover:text-foreground">Políticas de Privacidade</Link></li>
              </ul>
            </FooterSection>

            <FooterSection title="Atendimento" id="contact">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-primary" />
                  <span className="font-medium">0800 123 4567</span>
                </div>
                <p className="text-xs text-muted-foreground">Seg à sex das 08h às 19h</p>
              </div>
            </FooterSection>
          </div>

          {/* Desktop: Grid layout */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Institucional Links */}
            <div className="space-y-3">
              <Link to="#" className="flex items-center justify-between text-foreground hover:text-primary transition-colors py-2 border-b border-border">
                <span className="text-sm">Nossas Lojas</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link to="#" className="flex items-center justify-between text-foreground hover:text-primary transition-colors py-2 border-b border-border">
                <span className="text-sm">iPlace Educacional</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link to="#" className="flex items-center justify-between text-foreground hover:text-primary transition-colors py-2 border-b border-border">
                <span className="text-sm">Blog iPlace</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Departamento */}
            <div>
              <h4 className="font-semibold mb-4 pb-2 border-b border-border">Departamento</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/busca?q=iphone" className="text-muted-foreground hover:text-foreground">iPhone</Link></li>
                <li><Link to="/busca?q=mac" className="text-muted-foreground hover:text-foreground">Mac</Link></li>
                <li><Link to="/busca?q=apple-watch" className="text-muted-foreground hover:text-foreground">Apple Watch</Link></li>
                <li><Link to="/busca?q=ipad" className="text-muted-foreground hover:text-foreground">iPad</Link></li>
                <li><Link to="/busca?q=acessorios" className="text-muted-foreground hover:text-foreground">Acessórios</Link></li>
              </ul>
            </div>

            {/* Serviços */}
            <div>
              <h4 className="font-semibold mb-4 pb-2 border-b border-border">Serviços</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="#" className="text-muted-foreground hover:text-foreground">Garantia</Link></li>
                <li><Link to="#" className="text-muted-foreground hover:text-foreground">Assistência Técnica</Link></li>
                <li><Link to="#" className="text-muted-foreground hover:text-foreground">Retire em loja</Link></li>
              </ul>
            </div>

            {/* Saiba mais */}
            <div>
              <h4 className="font-semibold mb-4 pb-2 border-b border-border">Saiba mais</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="#" className="text-muted-foreground hover:text-foreground">Sobre a iPlace</Link></li>
                <li><Link to="#" className="text-muted-foreground hover:text-foreground">Dúvidas</Link></li>
                <li><Link to="#" className="text-muted-foreground hover:text-foreground">Políticas de Privacidade</Link></li>
                <li><Link to="#" className="text-muted-foreground hover:text-foreground">Trabalhe Conosco</Link></li>
                <li><Link to="#" className="text-muted-foreground hover:text-foreground">Compra Segura</Link></li>
              </ul>
            </div>

            {/* Atendimento */}
            <div>
              <h4 className="font-semibold mb-4 pb-2 border-b border-border">Atendimento</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="#" className="text-muted-foreground hover:text-foreground">Troca e Devoluções</Link></li>
                <li><Link to="#" className="text-muted-foreground hover:text-foreground">Minha Conta</Link></li>
              </ul>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-primary" />
                  <span className="font-medium">0800 123 4567</span>
                </div>
                <p className="text-xs text-muted-foreground">Seg à sex das 08h às 19h</p>
                <p className="text-xs text-muted-foreground">Sábados das 08h às 18h</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-border bg-secondary/50">
        <div className="container py-4 md:py-6">
          <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
            {/* Social */}
            <div className="flex items-center gap-3">
              <span className="text-xs md:text-sm font-medium">Redes sociais</span>
              <div className="flex gap-2">
                <a href="https://instagram.com/iplaceseminovos" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="https://facebook.com/iplaceseminovos" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="https://youtube.com/@iplaceseminovos" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                  <Youtube className="w-4 h-4" />
                </a>
                <a href="https://tiktok.com/@iplaceseminovos" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Logo */}
            <div className="flex items-center gap-1.5">
              <img src={AppleLogo} alt="Apple" className="w-5 h-5" />
              <span className="text-lg md:text-xl font-bold text-foreground">iPlace</span>
              <span className="text-xs text-muted-foreground ml-1">seminovos</span>
            </div>

            {/* Copyright */}
            <p className="text-xs text-muted-foreground text-center">
              © 2026 iPlace Seminovos. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
