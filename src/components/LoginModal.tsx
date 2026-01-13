import { useState, useEffect } from "react";
import { Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/services/api";
import { useNavigate } from "react-router-dom";
import AppleLogo from "@/assets/logo-apple.svg";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultToRegister?: boolean;
}

const LoginModal = ({ isOpen, onClose, defaultToRegister = false }: LoginModalProps) => {
  const [isLogin, setIsLogin] = useState(!defaultToRegister);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Sincronizar estado com prop quando modal abre
  useEffect(() => {
    if (isOpen) {
      setIsLogin(!defaultToRegister);
    }
  }, [isOpen, defaultToRegister]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = isLogin ? '/login.php' : '/cadastro.php';
      const body = isLogin 
        ? { email, senha: password }
        : { nome, email, senha: password };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro ao processar requisição');
      }

      // Salvar dados do usuário
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('usuario', JSON.stringify(data.data.usuario));

      // Compatibilidade com páginas administrativas
      if (data.data.usuario.tipo === 'admin') {
        localStorage.setItem('adminToken', data.data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.data.usuario));
        sessionStorage.setItem('adminToken', data.data.token);
        sessionStorage.setItem('adminUser', JSON.stringify(data.data.usuario));
      } else {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        sessionStorage.removeItem('adminToken');
        sessionStorage.removeItem('adminUser');
      }

      toast({
        title: isLogin ? "Login realizado!" : "Cadastro realizado!",
        description: `Bem-vindo, ${data.data.usuario.nome}!`,
      });

      // Limpar formulário
      setNome("");
      setEmail("");
      setPassword("");
      onClose();

      // Recarregar a página para atualizar o estado de autenticação
      // Isso garante que o useAuth detecte o novo login
      if (data.data.usuario.tipo === 'admin') {
        window.location.href = '/admin/dashboard';
      } else {
        // Se estiver no checkout, apenas recarregar para continuar a compra
        window.location.reload();
      }

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Erro ao processar requisição",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setNome("");
    setEmail("");
    setPassword("");
    setIsLogin(true);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[90vw] max-w-[400px] p-0 overflow-hidden rounded-2xl border-0 shadow-xl">
        {/* Header with logo and security badge */}
        <div className="bg-background border-b border-border p-5 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <img src={AppleLogo} alt="Apple" className="w-5 h-5" />
              <span className="text-xl font-bold text-foreground">iPlace</span>
              <span className="text-xs text-muted-foreground ml-1">seminovos</span>
            </div>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-1">
              <Lock className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">100% seguro</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <DialogHeader className="mb-6">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold">
                {isLogin ? "Fazer login" : "Criar conta"}
              </DialogTitle>
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-muted-foreground hover:text-foreground underline"
              >
                {isLogin ? "Não sou cadastrado" : "Já tenho conta"}
              </button>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Nome completo*
                </label>
                <Input
                  type="text"
                  placeholder="Seu nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full rounded-lg"
                  required={!isLogin}
                  disabled={isLoading}
                />
              </div>
            )}

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">
                Email*
              </label>
              <Input
                type="email"
                placeholder="nome@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">
                Senha*
              </label>
              <Input
                type="password"
                placeholder={isLogin ? "Sua senha" : "Mínimo 6 caracteres"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg"
                required
                minLength={6}
                disabled={isLoading}
              />
            </div>

            {isLogin && (
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-foreground underline"
              >
                Não sei a minha senha
              </button>
            )}

            <Button
              type="submit"
              className="w-full bg-foreground hover:bg-foreground/80 text-background font-medium py-6 rounded-lg transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Aguarde...
                </>
              ) : (
                isLogin ? "Entrar" : "Criar conta"
              )}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
