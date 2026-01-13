import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  ArrowLeft,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { fetchAdminProducts, deleteAdminProduct, AdminProduct } from "@/services/adminApi";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const AdminProducts = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminProducts();
      setProducts(data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
      return;
    }
    loadProducts();
  }, [navigate]);


  const handleDelete = async (id: number) => {
    try {
      setDeleting(id);
      await deleteAdminProduct(id);
      setProducts(products.filter((p) => p.id !== id));
      toast.success("Produto excluído com sucesso!");
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast.error('Erro ao excluir produto');
    } finally {
      setDeleting(null);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.categoria?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <Header />

      <div className="container py-4 lg:py-8 flex-1">
        <div className="flex items-center gap-2 lg:gap-4 mb-4 lg:mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/dashboard">
              <ArrowLeft className="w-4 h-4 mr-1 lg:mr-2" />
              <span className="hidden sm:inline">Voltar</span>
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 lg:px-6">
            <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
              <Package className="w-4 h-4 lg:w-5 lg:h-5" />
              Produtos ({products.length})
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadProducts} disabled={loading}>
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline ml-2">Atualizar</span>
              </Button>
              <Button asChild size="sm">
                <Link to="/admin/produtos/novo">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline ml-2">Novo Produto</span>
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-4 lg:px-6">
            {/* Search */}
            <div className="relative mb-4 lg:mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, categoria ou SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Mobile - Cards */}
                <div className="lg:hidden space-y-3">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-start gap-3">
                        {product.imagens && product.imagens.length > 0 ? (
                          <img 
                            src={product.imagens[0].url} 
                            alt={product.nome}
                            className="w-14 h-14 object-cover rounded flex-shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 bg-muted rounded flex items-center justify-center flex-shrink-0">
                            <Package className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{product.nome}</p>
                          <p className="text-xs text-muted-foreground">{product.categoria || '-'}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-medium text-sm">{formatPrice(product.preco)}</span>
                            <span
                              className={`px-1.5 py-0.5 rounded-full text-xs ${
                                product.estoque > 5
                                  ? "bg-green-100 text-green-700"
                                  : product.estoque > 0
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {product.estoque} un.
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <Link to={`/admin/produtos/${product.id}`}>
                              <Edit className="w-4 h-4" />
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                disabled={deleting === product.id}
                              >
                                {deleting === product.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação não pode ser desfeita. O produto "{product.nome}" será removido permanentemente.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(product.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop - Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Img</TableHead>
                        <TableHead>Produto</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Preço</TableHead>
                        <TableHead>Preço Original</TableHead>
                        <TableHead>Estoque</TableHead>
                        <TableHead>Condição</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            {product.imagens && product.imagens.length > 0 ? (
                              <img 
                                src={product.imagens[0].url} 
                                alt={product.nome}
                                className="w-12 h-12 object-cover rounded"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                                <Package className="w-6 h-6 text-muted-foreground" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="font-medium max-w-[200px] truncate">
                            {product.nome}
                          </TableCell>
                          <TableCell>{product.categoria || '-'}</TableCell>
                          <TableCell>{formatPrice(product.preco)}</TableCell>
                          <TableCell className="text-muted-foreground line-through">
                            {formatPrice(product.preco_original)}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                product.estoque > 5
                                  ? "bg-green-100 text-green-700"
                                  : product.estoque > 0
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {product.estoque} un.
                            </span>
                          </TableCell>
                          <TableCell>{product.condicao}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="icon" asChild>
                                <Link to={`/admin/produtos/${product.id}`}>
                                  <Edit className="w-4 h-4" />
                                </Link>
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-destructive hover:text-destructive"
                                    disabled={deleting === product.id}
                                  >
                                    {deleting === product.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-4 h-4" />
                                    )}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta ação não pode ser desfeita. O produto "{product.nome}" será removido permanentemente.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(product.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Excluir
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {filteredProducts.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhum produto encontrado</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default AdminProducts;
