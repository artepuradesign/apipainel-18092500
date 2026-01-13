import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Package,
  MapPin,
  HelpCircle,
  LogOut,
  ChevronDown,
  LayoutDashboard,
} from "lucide-react";

interface UserMenuDropdownProps {
  userName?: string;
  userEmail?: string;
  userType?: 'admin' | 'cliente';
  onLogout: () => void;
}

const UserMenuDropdown = ({ userName, userEmail, userType, onLogout }: UserMenuDropdownProps) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    ...(userType === 'admin' ? [{
      icon: LayoutDashboard,
      label: "Dashboard",
      href: "/admin/dashboard",
    }] : []),
    {
      icon: Package,
      label: "Meus Pedidos",
      href: "/meus-pedidos",
    },
    {
      icon: MapPin,
      label: "Endereços",
      href: "/enderecos",
    },
    {
      icon: HelpCircle,
      label: "Ajuda",
      href: "https://api.whatsapp.com/send?phone=5598989145930&text=Olá, preciso de ajuda!",
      external: true,
    },
  ];

  const handleItemClick = (href: string, external?: boolean) => {
    setOpen(false);
    if (external) {
      window.open(href, "_blank");
    } else {
      navigate(href);
    }
  };

  const handleLogout = () => {
    setOpen(false);
    onLogout();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 px-3 group rounded-full hover:bg-transparent">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center transition-colors group-hover:bg-foreground">
            <User className="w-4 h-4 text-muted-foreground transition-colors group-hover:text-background" />
          </div>
          <span className="hidden md:inline-block text-sm font-medium max-w-[100px] truncate text-foreground">
            {userName || "Minha Conta"}
          </span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="end">
        {/* User Info */}
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{userName || "Usuário"}</p>
              {userEmail && (
                <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Menu Items */}
        <div className="p-2">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleItemClick(item.href, item.external)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm hover:bg-muted transition-colors text-left"
            >
              <item.icon className="w-4 h-4 text-muted-foreground" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <Separator />

        {/* Logout */}
        <div className="p-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm hover:bg-destructive/10 text-destructive transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default UserMenuDropdown;