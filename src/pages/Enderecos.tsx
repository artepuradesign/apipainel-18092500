import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Plus, Construction } from "lucide-react";
import { Link } from "react-router-dom";

const Enderecos = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-4 md:py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Meus Endereços</h1>
        </div>

        <Card>
          <CardContent className="text-center py-16">
            <Construction className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Em breve!</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              A funcionalidade de gerenciamento de endereços estará disponível em breve. 
              Por enquanto, você pode adicionar seu endereço durante o checkout.
            </p>
            <Button asChild>
              <Link to="/">Continuar Comprando</Link>
            </Button>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Enderecos;