import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ArrowLeft, Save, Package, Plus, Trash2, Loader2, ImagePlus, GripVertical, Palette, HardDrive } from "lucide-react";
import { toast } from "sonner";
import {
  fetchAdminProduct,
  fetchAdminCategories,
  createAdminProduct,
  updateAdminProduct,
  AdminCategory,
} from "@/services/adminApi";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface ImageInput {
  id?: number;
  url: string;
  ordem: number;
  principal: boolean;
}

interface SpecInput {
  id?: number;
  label: string;
  valor: string;
}

// Modelos de iPhone disponíveis (atualizado)
const IPHONE_MODELS = [
  "IPHONE 6", "IPHONE 6 PLUS", "IPHONE 6S", "IPHONE 6S PLUS",
  "IPHONE 7", "IPHONE 7 PLUS", "IPHONE 8", "IPHONE 8 PLUS",
  "IPHONE X", "IPHONE XR", "IPHONE XS", "IPHONE XS MAX",
  "IPHONE 11", "IPHONE 11 PRO", "IPHONE 11 PRO MAX",
  "IPHONE 12", "IPHONE 12 MINI", "IPHONE 12 PRO", "IPHONE 12 PRO MAX",
  "IPHONE 13", "IPHONE 13 MINI", "IPHONE 13 PRO", "IPHONE 13 PRO MAX",
  "IPHONE 14", "IPHONE 14 PLUS", "IPHONE 14 PRO", "IPHONE 14 PRO MAX",
  "IPHONE 15", "IPHONE 15 PLUS", "IPHONE 15 PRO", "IPHONE 15 PRO MAX",
  "IPHONE 16E", "IPHONE 16", "IPHONE 16 PLUS", "IPHONE 16 PRO", "IPHONE 16 PRO MAX",
  "IPHONE 17", "IPHONE AIR", "IPHONE 17 PRO", "IPHONE 17 PRO MAX",
  "IPHONE SE 2020", "IPHONE SE 2022"
];

// Condições disponíveis
const CONDITIONS = [
  { value: "novo", label: "Novo" },
  { value: "seminovo", label: "Seminovo" },
  { value: "usado_excelente", label: "Usado - Excelente" },
  { value: "usado_bom", label: "Usado - Bom" },
  { value: "recondicionado", label: "Recondicionado" },
  { value: "com_defeito", label: "Com defeito" }
];

// Saúde da Bateria
const BATTERY_HEALTH = [
  { value: "perfeita", label: "Perfeita (95% até 100%)" },
  { value: "boa", label: "Boa (80% até 94%)" },
  { value: "ok", label: "OK (60% até 79%)" },
  { value: "ruim", label: "Ruim (40% até 59%)" },
  { value: "muito_ruim", label: "Muito Ruim (abaixo de 39%)" }
];

// Capacidades disponíveis padrão
const DEFAULT_CAPACITIES = ["64GB", "128GB", "256GB", "512GB", "1TB"];

// Cores disponíveis padrão com códigos hex
const DEFAULT_COLORS = [
  { name: "Amarelo", code: "#FFD700" },
  { name: "Azul", code: "#007AFF" },
  { name: "Branco", code: "#FFFFFF" },
  { name: "Bronze", code: "#CD7F32" },
  { name: "Cinza", code: "#808080" },
  { name: "Dourado", code: "#DAA520" },
  { name: "Laranja", code: "#FF9500" },
  { name: "Prata", code: "#C0C0C0" },
  { name: "Preto", code: "#1C1C1E" },
  { name: "Rosa", code: "#FF2D55" },
  { name: "Roxo", code: "#AF52DE" },
  { name: "Verde", code: "#34C759" },
  { name: "Vermelho", code: "#FF3B30" },
  { name: "Titânio Natural", code: "#D4D4D4" },
  { name: "Titânio Azul", code: "#5A6E7F" },
  { name: "Titânio Preto", code: "#1C1C1C" },
  { name: "Titânio Branco", code: "#F5F5F5" },
];

// Especificações de tela por modelo (telas pré-cadastradas)
const DISPLAY_SPECS: Record<string, string> = {
  "IPHONE 6": "4.7\" Retina HD",
  "IPHONE 6 PLUS": "5.5\" Retina HD",
  "IPHONE 6S": "4.7\" Retina HD",
  "IPHONE 6S PLUS": "5.5\" Retina HD",
  "IPHONE 7": "4.7\" Retina HD",
  "IPHONE 7 PLUS": "5.5\" Retina HD",
  "IPHONE 8": "4.7\" Retina HD",
  "IPHONE 8 PLUS": "5.5\" Retina HD",
  "IPHONE X": "5.8\" Super Retina HD",
  "IPHONE XR": "6.1\" Liquid Retina HD",
  "IPHONE XS": "5.8\" Super Retina HD",
  "IPHONE XS MAX": "6.5\" Super Retina HD",
  "IPHONE 11": "6.1\" Liquid Retina HD",
  "IPHONE 11 PRO": "5.8\" Super Retina XDR",
  "IPHONE 11 PRO MAX": "6.5\" Super Retina XDR",
  "IPHONE 12": "6.1\" Super Retina XDR",
  "IPHONE 12 MINI": "5.4\" Super Retina XDR",
  "IPHONE 12 PRO": "6.1\" Super Retina XDR",
  "IPHONE 12 PRO MAX": "6.7\" Super Retina XDR",
  "IPHONE 13": "6.1\" Super Retina XDR",
  "IPHONE 13 MINI": "5.4\" Super Retina XDR",
  "IPHONE 13 PRO": "6.1\" Super Retina XDR ProMotion",
  "IPHONE 13 PRO MAX": "6.7\" Super Retina XDR ProMotion",
  "IPHONE 14": "6.1\" Super Retina XDR",
  "IPHONE 14 PLUS": "6.7\" Super Retina XDR",
  "IPHONE 14 PRO": "6.1\" Super Retina XDR ProMotion",
  "IPHONE 14 PRO MAX": "6.7\" Super Retina XDR ProMotion",
  "IPHONE 15": "6.1\" Super Retina XDR",
  "IPHONE 15 PLUS": "6.7\" Super Retina XDR",
  "IPHONE 15 PRO": "6.1\" Super Retina XDR ProMotion",
  "IPHONE 15 PRO MAX": "6.7\" Super Retina XDR ProMotion",
  "IPHONE 16E": "6.1\" Super Retina XDR",
  "IPHONE 16": "6.1\" Super Retina XDR",
  "IPHONE 16 PLUS": "6.7\" Super Retina XDR",
  "IPHONE 16 PRO": "6.3\" Super Retina XDR ProMotion",
  "IPHONE 16 PRO MAX": "6.9\" Super Retina XDR ProMotion",
  "IPHONE 17": "6.1\" Super Retina XDR",
  "IPHONE AIR": "6.6\" Super Retina XDR",
  "IPHONE 17 PRO": "6.3\" Super Retina XDR ProMotion",
  "IPHONE 17 PRO MAX": "6.9\" Super Retina XDR ProMotion",
  "IPHONE SE 2020": "4.7\" Retina HD",
  "IPHONE SE 2022": "4.7\" Retina HD",
};

// Especificações de câmera por modelo
const CAMERA_SPECS: Record<string, string> = {
  "IPHONE 6": "8MP",
  "IPHONE 6 PLUS": "8MP",
  "IPHONE 6S": "12MP",
  "IPHONE 6S PLUS": "12MP",
  "IPHONE 7": "12MP",
  "IPHONE 7 PLUS": "12MP + 12MP",
  "IPHONE 8": "12MP",
  "IPHONE 8 PLUS": "12MP + 12MP",
  "IPHONE X": "12MP + 12MP",
  "IPHONE XR": "12MP",
  "IPHONE XS": "12MP + 12MP",
  "IPHONE XS MAX": "12MP + 12MP",
  "IPHONE 11": "12MP + 12MP",
  "IPHONE 11 PRO": "12MP + 12MP + 12MP",
  "IPHONE 11 PRO MAX": "12MP + 12MP + 12MP",
  "IPHONE 12": "12MP + 12MP",
  "IPHONE 12 MINI": "12MP + 12MP",
  "IPHONE 12 PRO": "12MP + 12MP + 12MP + LiDAR",
  "IPHONE 12 PRO MAX": "12MP + 12MP + 12MP + LiDAR",
  "IPHONE 13": "12MP + 12MP",
  "IPHONE 13 MINI": "12MP + 12MP",
  "IPHONE 13 PRO": "12MP + 12MP + 12MP + LiDAR",
  "IPHONE 13 PRO MAX": "12MP + 12MP + 12MP + LiDAR",
  "IPHONE 14": "12MP + 12MP",
  "IPHONE 14 PLUS": "12MP + 12MP",
  "IPHONE 14 PRO": "48MP + 12MP + 12MP + LiDAR",
  "IPHONE 14 PRO MAX": "48MP + 12MP + 12MP + LiDAR",
  "IPHONE 15": "48MP + 12MP",
  "IPHONE 15 PLUS": "48MP + 12MP",
  "IPHONE 15 PRO": "48MP + 12MP + 12MP + LiDAR",
  "IPHONE 15 PRO MAX": "48MP + 12MP + 12MP + LiDAR",
  "IPHONE 16E": "48MP + 12MP",
  "IPHONE 16": "48MP + 12MP",
  "IPHONE 16 PLUS": "48MP + 12MP",
  "IPHONE 16 PRO": "48MP + 48MP + 12MP + LiDAR",
  "IPHONE 16 PRO MAX": "48MP + 48MP + 12MP + LiDAR",
  "IPHONE 17": "48MP + 24MP",
  "IPHONE AIR": "48MP + 24MP",
  "IPHONE 17 PRO": "48MP + 48MP + 12MP + LiDAR",
  "IPHONE 17 PRO MAX": "48MP + 48MP + 12MP + LiDAR",
  "IPHONE SE 2020": "12MP",
  "IPHONE SE 2022": "12MP",
};

// Chips por modelo
const CHIP_SPECS: Record<string, string> = {
  "IPHONE 6": "A8", "IPHONE 6 PLUS": "A8",
  "IPHONE 6S": "A9", "IPHONE 6S PLUS": "A9",
  "IPHONE 7": "A10 Fusion", "IPHONE 7 PLUS": "A10 Fusion",
  "IPHONE 8": "A11 Bionic", "IPHONE 8 PLUS": "A11 Bionic",
  "IPHONE X": "A11 Bionic",
  "IPHONE XR": "A12 Bionic", "IPHONE XS": "A12 Bionic", "IPHONE XS MAX": "A12 Bionic",
  "IPHONE 11": "A13 Bionic", "IPHONE 11 PRO": "A13 Bionic", "IPHONE 11 PRO MAX": "A13 Bionic",
  "IPHONE 12": "A14 Bionic", "IPHONE 12 MINI": "A14 Bionic", "IPHONE 12 PRO": "A14 Bionic", "IPHONE 12 PRO MAX": "A14 Bionic",
  "IPHONE 13": "A15 Bionic", "IPHONE 13 MINI": "A15 Bionic", "IPHONE 13 PRO": "A15 Bionic", "IPHONE 13 PRO MAX": "A15 Bionic",
  "IPHONE 14": "A15 Bionic", "IPHONE 14 PLUS": "A15 Bionic", "IPHONE 14 PRO": "A16 Bionic", "IPHONE 14 PRO MAX": "A16 Bionic",
  "IPHONE 15": "A16 Bionic", "IPHONE 15 PLUS": "A16 Bionic", "IPHONE 15 PRO": "A17 Pro", "IPHONE 15 PRO MAX": "A17 Pro",
  "IPHONE 16E": "A18", "IPHONE 16": "A18", "IPHONE 16 PLUS": "A18", "IPHONE 16 PRO": "A18 Pro", "IPHONE 16 PRO MAX": "A18 Pro",
  "IPHONE 17": "A19", "IPHONE AIR": "A19", "IPHONE 17 PRO": "A19 Pro", "IPHONE 17 PRO MAX": "A19 Pro",
  "IPHONE SE 2020": "A13 Bionic", "IPHONE SE 2022": "A15 Bionic",
};

// Interface para variação selecionada
interface VariationSelection {
  cor: string;
  cor_codigo: string;
  capacidade: string;
  estoque: number;
  preco: string;
}

// Interface para cor customizada
interface ColorOption {
  name: string;
  code: string;
}

const AdminProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id && id !== 'novo';

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  // Dados básicos do produto
  const [formData, setFormData] = useState({
    nome: "",
    sku: "",
    categoria_id: "",
    modelo: "",
    condicao: "",
    saude_bateria: "",
    preco: "",
    preco_original: "",
    estoque: "",
    garantia_meses: "12",
    descricao: "",
    descricao_curta: "",
    tela: "",
    camera: "",
    chip: "",
    destaque: false,
    ativo: true,
  });

  // Lista de cores e capacidades disponíveis (dinâmicas)
  const [availableColors, setAvailableColors] = useState<ColorOption[]>(DEFAULT_COLORS);
  const [availableCapacities, setAvailableCapacities] = useState<string[]>(DEFAULT_CAPACITIES);
  const [availableDisplaySpecs, setAvailableDisplaySpecs] = useState<string[]>(
    [...new Set(Object.values(DISPLAY_SPECS))]
  );

  // Modais para cadastrar cor/capacidade/tela
  const [showColorModal, setShowColorModal] = useState(false);
  const [showCapacityModal, setShowCapacityModal] = useState(false);
  const [showDisplayModal, setShowDisplayModal] = useState(false);
  const [newColor, setNewColor] = useState({ name: "", code: "#000000" });
  const [newCapacity, setNewCapacity] = useState("");
  const [newDisplaySpec, setNewDisplaySpec] = useState("");

  // Seleção de cores e capacidades (checkboxes)
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedCapacities, setSelectedCapacities] = useState<string[]>([]);
  
  // Variações geradas automaticamente
  const [variations, setVariations] = useState<VariationSelection[]>([]);

  const [images, setImages] = useState<ImageInput[]>([
    { url: "", ordem: 0, principal: true }
  ]);

  const [specs, setSpecs] = useState<SpecInput[]>([]);
  const [showSpecSelector, setShowSpecSelector] = useState(false);

  // Carregar categorias
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchAdminCategories();
        setCategories(data);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        setCategories([
          { id: 1, nome: 'iPhones', slug: 'iphones', descricao: '', imagem: '', ordem: 1, ativo: true },
          { id: 2, nome: 'iPads', slug: 'ipads', descricao: '', imagem: '', ordem: 2, ativo: true },
          { id: 3, nome: 'Apple Watch', slug: 'apple-watch', descricao: '', imagem: '', ordem: 3, ativo: true },
          { id: 4, nome: 'MacBooks', slug: 'macbooks', descricao: '', imagem: '', ordem: 4, ativo: true },
          { id: 5, nome: 'Acessórios', slug: 'acessorios', descricao: '', imagem: '', ordem: 5, ativo: true },
        ]);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login", { replace: true });
    } else {
      setIsAuthenticated(true);
      if (isEditing) {
        loadProduct();
      }
    }
  }, [navigate, isEditing, id]);

  // Auto-preencher especificações quando modelo muda
  useEffect(() => {
    if (formData.modelo) {
      setFormData(prev => ({
        ...prev,
        tela: DISPLAY_SPECS[formData.modelo] || "",
        camera: CAMERA_SPECS[formData.modelo] || "",
        chip: CHIP_SPECS[formData.modelo] || ""
      }));
    }
  }, [formData.modelo]);

  // Gerar variações quando cores ou capacidades mudam
  useEffect(() => {
    if (selectedColors.length > 0 && selectedCapacities.length > 0) {
      const newVariations: VariationSelection[] = [];
      
      selectedColors.forEach(colorName => {
        const color = availableColors.find(c => c.name === colorName);
        selectedCapacities.forEach(capacity => {
          // Verificar se já existe
          const existing = variations.find(
            v => v.cor === colorName && v.capacidade === capacity
          );
          
          newVariations.push({
            cor: colorName,
            cor_codigo: color?.code || "#000000",
            capacidade: capacity,
            estoque: existing?.estoque ?? 0,
            preco: existing?.preco ?? formData.preco
          });
        });
      });
      
      setVariations(newVariations);
    } else {
      setVariations([]);
    }
  }, [selectedColors, selectedCapacities]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const product = await fetchAdminProduct(Number(id));

      setFormData({
        nome: product.nome || "",
        sku: product.sku || "",
        categoria_id: String(product.categoria_id || ""),
        modelo: product.modelo || "",
        condicao: product.condicao || "",
        saude_bateria: product.saude_bateria || "",
        preco: String(product.preco || ""),
        preco_original: String(product.preco_original || ""),
        estoque: String(product.estoque || ""),
        garantia_meses: String(product.garantia_meses || "12"),
        descricao: product.descricao || "",
        descricao_curta: product.descricao_curta || "",
        tela: product.tela || "",
        camera: product.camera || "",
        chip: product.chip || "",
        destaque: product.destaque || false,
        ativo: product.ativo !== false,
      });

      if (product.imagens && product.imagens.length > 0) {
        setImages(product.imagens);
      }

      if (product.especificacoes && product.especificacoes.length > 0) {
        setSpecs(product.especificacoes);
      }

      // Carregar variações existentes
      if (product.variacoes && product.variacoes.length > 0) {
        const loadedVariations = product.variacoes.map((v: any) => ({
          cor: v.cor || '',
          cor_codigo: v.cor_codigo || '',
          capacidade: v.capacidade || '',
          estoque: v.estoque || 0,
          preco: String(v.preco || '')
        }));
        setVariations(loadedVariations);
        
        // Extrair cores e capacidades selecionadas
        const colors = [...new Set(loadedVariations.map((v: VariationSelection) => v.cor).filter(Boolean))];
        const capacities = [...new Set(loadedVariations.map((v: VariationSelection) => v.capacidade).filter(Boolean))];
        setSelectedColors(colors);
        setSelectedCapacities(capacities);

        // Adicionar cores personalizadas que não estão na lista padrão
        const customColors: ColorOption[] = [];
        loadedVariations.forEach((v: VariationSelection) => {
          if (v.cor && !availableColors.find(c => c.name === v.cor)) {
            customColors.push({ name: v.cor, code: v.cor_codigo || '#000000' });
          }
        });
        if (customColors.length > 0) {
          setAvailableColors(prev => [...prev, ...customColors]);
        }

        // Adicionar capacidades personalizadas
        capacities.forEach(cap => {
          if (!availableCapacities.includes(cap)) {
            setAvailableCapacities(prev => [...prev, cap]);
          }
        });
      }
    } catch (error) {
      console.error('Erro ao carregar produto:', error);
      toast.error('Erro ao carregar produto');
      navigate('/admin/produtos');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Toggle cor
  const toggleColor = (colorName: string) => {
    setSelectedColors(prev => 
      prev.includes(colorName) 
        ? prev.filter(c => c !== colorName)
        : [...prev, colorName]
    );
  };

  // Toggle capacidade
  const toggleCapacity = (capacity: string) => {
    setSelectedCapacities(prev => 
      prev.includes(capacity) 
        ? prev.filter(c => c !== capacity)
        : [...prev, capacity]
    );
  };

  // Adicionar nova cor
  const handleAddColor = () => {
    if (!newColor.name.trim()) {
      toast.error("Informe o nome da cor");
      return;
    }
    if (availableColors.find(c => c.name.toLowerCase() === newColor.name.toLowerCase())) {
      toast.error("Esta cor já existe");
      return;
    }
    setAvailableColors(prev => [...prev, { name: newColor.name.trim(), code: newColor.code }]);
    setNewColor({ name: "", code: "#000000" });
    setShowColorModal(false);
    toast.success("Cor adicionada com sucesso!");
  };

  // Adicionar nova capacidade
  const handleAddCapacity = () => {
    if (!newCapacity.trim()) {
      toast.error("Informe a capacidade");
      return;
    }
    if (availableCapacities.includes(newCapacity.trim())) {
      toast.error("Esta capacidade já existe");
      return;
    }
    setAvailableCapacities(prev => [...prev, newCapacity.trim()]);
    setNewCapacity("");
    setShowCapacityModal(false);
    toast.success("Capacidade adicionada com sucesso!");
  };

  // Adicionar nova especificação de tela
  const handleAddDisplaySpec = () => {
    if (!newDisplaySpec.trim()) {
      toast.error("Informe a especificação da tela");
      return;
    }
    if (availableDisplaySpecs.includes(newDisplaySpec.trim())) {
      toast.error("Esta especificação já existe");
      return;
    }
    setAvailableDisplaySpecs(prev => [...prev, newDisplaySpec.trim()]);
    setFormData(prev => ({ ...prev, tela: newDisplaySpec.trim() }));
    setNewDisplaySpec("");
    setShowDisplayModal(false);
    toast.success("Especificação de tela adicionada!");
  };

  // Atualizar variação
  const updateVariation = (index: number, field: 'estoque' | 'preco', value: string | number) => {
    const newVariations = [...variations];
    (newVariations[index] as any)[field] = value;
    setVariations(newVariations);
  };

  // Gerenciamento de imagens
  const addImage = () => {
    setImages([...images, { url: "", ordem: images.length, principal: false }]);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    if (images[index].principal && newImages.length > 0) {
      newImages[0].principal = true;
    }
    setImages(newImages);
  };

  const updateImage = (index: number, url: string) => {
    const newImages = [...images];
    newImages[index].url = url;
    setImages(newImages);
  };

  const setMainImage = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      principal: i === index,
    }));
    setImages(newImages);
  };

  // Gerenciamento de especificações
  const addSpec = (specLabel?: string) => {
    const newSpec: SpecInput = { label: specLabel || "", valor: "" };
    setSpecs([...specs, newSpec]);
    setShowSpecSelector(false);
  };

  const removeSpec = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  const updateSpec = (index: number, field: 'label' | 'valor', value: string) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = value;
    setSpecs(newSpecs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.categoria_id || !formData.preco) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const validImages = images.filter(img => img.url.trim());
    if (validImages.length === 0) {
      toast.error("Adicione pelo menos uma imagem");
      return;
    }

    const validSpecs = specs.filter(s => s.label.trim() && s.valor.trim());

    // Preparar variações para envio
    const validVariations = variations.map(v => ({
      cor: v.cor,
      cor_codigo: v.cor_codigo,
      capacidade: v.capacidade,
      estoque: Number(v.estoque) || 0,
      preco: Number(v.preco) || Number(formData.preco) || 0
    }));

    try {
      setSaving(true);

      const productData = {
        nome: formData.nome,
        sku: formData.sku,
        categoria_id: Number(formData.categoria_id),
        modelo: formData.modelo,
        condicao: formData.condicao,
        saude_bateria: formData.saude_bateria,
        preco: Number(formData.preco),
        preco_original: Number(formData.preco_original) || Number(formData.preco),
        estoque: Number(formData.estoque) || 0,
        garantia_meses: Number(formData.garantia_meses) || 12,
        descricao: formData.descricao,
        descricao_curta: formData.descricao_curta,
        tela: formData.tela,
        camera: formData.camera,
        chip: formData.chip,
        destaque: formData.destaque,
        ativo: formData.ativo,
        imagens: validImages.map((img) => img.url),
        especificacoes: validSpecs,
        variacoes: validVariations,
      };

      if (isEditing) {
        await updateAdminProduct(Number(id), productData);
        toast.success("Produto atualizado com sucesso!");
      } else {
        await createAdminProduct(productData);
        toast.success("Produto cadastrado com sucesso!");
      }
      
      navigate("/admin/produtos");
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error(isEditing ? "Erro ao atualizar produto" : "Erro ao cadastrar produto");
    } finally {
      setSaving(false);
    }
  };

  if (isAuthenticated === null || loading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <Header />

      <div className="flex-1 py-8">
        <div className="container">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/produtos">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Link>
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dados Básicos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  {isEditing ? "Editar Produto" : "Novo Produto"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2 lg:col-span-2">
                    <Label htmlFor="nome">Nome do Produto *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => handleChange("nome", e.target.value)}
                      placeholder="Ex: iPhone 15 Pro Max"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => handleChange("sku", e.target.value)}
                      placeholder="Ex: IPH15PM-256"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="categoria_id">Categoria *</Label>
                    <Select
                      value={formData.categoria_id}
                      onValueChange={(value) => handleChange("categoria_id", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent className="bg-background">
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={String(cat.id)}>
                            {cat.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="modelo">Modelo *</Label>
                    <Select
                      value={formData.modelo}
                      onValueChange={(value) => handleChange("modelo", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o modelo" />
                      </SelectTrigger>
                      <SelectContent className="bg-background max-h-60">
                        {IPHONE_MODELS.map((model) => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="condicao">Condição *</Label>
                    <Select
                      value={formData.condicao}
                      onValueChange={(value) => handleChange("condicao", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent className="bg-background">
                        {CONDITIONS.map((cond) => (
                          <SelectItem key={cond.value} value={cond.value}>
                            {cond.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="saude_bateria">Saúde da Bateria</Label>
                    <Select
                      value={formData.saude_bateria}
                      onValueChange={(value) => handleChange("saude_bateria", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent className="bg-background">
                        {BATTERY_HEALTH.map((health) => (
                          <SelectItem key={health.value} value={health.value}>
                            {health.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preco">Preço (R$) *</Label>
                    <Input
                      id="preco"
                      type="number"
                      step="0.01"
                      value={formData.preco}
                      onChange={(e) => handleChange("preco", e.target.value)}
                      placeholder="0,00"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preco_original">Preço Original (R$)</Label>
                    <Input
                      id="preco_original"
                      type="number"
                      step="0.01"
                      value={formData.preco_original}
                      onChange={(e) => handleChange("preco_original", e.target.value)}
                      placeholder="0,00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estoque">Quantidade em Estoque</Label>
                    <Input
                      id="estoque"
                      type="number"
                      min="0"
                      value={formData.estoque}
                      onChange={(e) => handleChange("estoque", e.target.value)}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="garantia_meses">Garantia (meses)</Label>
                    <Input
                      id="garantia_meses"
                      type="number"
                      value={formData.garantia_meses}
                      onChange={(e) => handleChange("garantia_meses", e.target.value)}
                      placeholder="12"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cor e Capacidade - Seções Unificadas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Cor e Capacidade
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Cores */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Cores Disponíveis</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowColorModal(true)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Cadastrar Cor
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {availableColors.map((color) => (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => toggleColor(color.name)}
                        className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-all ${
                          selectedColors.includes(color.name)
                            ? 'border-foreground ring-2 ring-foreground ring-offset-2 bg-secondary'
                            : 'border-border hover:border-muted-foreground bg-background'
                        }`}
                        title={color.name}
                      >
                        <span
                          className="w-5 h-5 rounded border border-border flex-shrink-0"
                          style={{ backgroundColor: color.code }}
                        />
                        <span className="text-sm">{color.name}</span>
                      </button>
                    ))}
                  </div>
                  {selectedColors.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Selecionado: {selectedColors.join(", ")}
                    </p>
                  )}
                </div>

                {/* Separador */}
                <div className="border-t" />

                {/* Capacidades */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Capacidades Disponíveis</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCapacityModal(true)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Cadastrar Capacidade
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {availableCapacities.map((capacity) => (
                      <button
                        key={capacity}
                        type="button"
                        onClick={() => toggleCapacity(capacity)}
                        className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                          selectedCapacities.includes(capacity)
                            ? 'border-foreground bg-foreground text-background'
                            : 'border-border hover:border-muted-foreground bg-background'
                        }`}
                      >
                        <HardDrive className="w-4 h-4" />
                        <span className="text-sm font-medium">{capacity}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Variações Geradas */}
            {variations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Estoque por Variação</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Defina o estoque e preço para cada combinação de cor e capacidade
                  </p>
                  <div className="space-y-3">
                    {variations.map((variation, index) => (
                      <div key={`${variation.cor}-${variation.capacidade}`} className="flex items-center gap-4 p-3 border rounded-lg">
                        <div className="flex items-center gap-2 min-w-[140px]">
                          <span
                            className="w-5 h-5 rounded border border-border flex-shrink-0"
                            style={{ backgroundColor: variation.cor_codigo }}
                          />
                          <span className="text-sm font-medium">{variation.cor}</span>
                        </div>
                        <div className="min-w-[80px]">
                          <span className="text-sm font-medium">{variation.capacidade}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">Estoque:</Label>
                          <Input
                            type="number"
                            value={variation.estoque}
                            onChange={(e) => updateVariation(index, 'estoque', e.target.value)}
                            className="w-20"
                            min="0"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">Preço (R$):</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={variation.preco}
                            onChange={(e) => updateVariation(index, 'preco', e.target.value)}
                            className="w-28"
                            placeholder={formData.preco || "Base"}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Especificações Adicionais */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Especificações Adicionais</CardTitle>
                <div className="relative">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowSpecSelector(!showSpecSelector)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar
                  </Button>
                  {showSpecSelector && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-background border rounded-lg shadow-lg z-50 p-2">
                      <p className="text-sm font-medium mb-2 px-2">Selecione uma especificação:</p>
                      <button
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-secondary rounded text-sm"
                        onClick={() => addSpec("Tela")}
                      >
                        Tela
                      </button>
                      <button
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-secondary rounded text-sm"
                        onClick={() => addSpec("Câmera")}
                      >
                        Câmera
                      </button>
                      <button
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-secondary rounded text-sm"
                        onClick={() => addSpec("Chip")}
                      >
                        Chip
                      </button>
                      <div className="border-t mt-2 pt-2">
                        <button
                          type="button"
                          className="w-full text-left px-3 py-2 hover:bg-secondary rounded text-sm text-muted-foreground"
                          onClick={() => addSpec("")}
                        >
                          + Personalizado
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Tela - Seção Especial */}
                <div className="p-4 border rounded-lg bg-secondary/50">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-base font-medium">Tela</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDisplayModal(true)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Nova Tela
                    </Button>
                  </div>
                  <Select
                    value={formData.tela}
                    onValueChange={(value) => handleChange("tela", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a especificação de tela" />
                    </SelectTrigger>
                    <SelectContent className="bg-background max-h-60">
                      {availableDisplaySpecs.map((spec) => (
                        <SelectItem key={spec} value={spec}>
                          {spec}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {availableDisplaySpecs.length === 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Nenhuma tela cadastrada. Clique em "Nova Tela" para adicionar.
                    </p>
                  )}
                </div>

                {specs.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Clique em "Adicionar" para incluir especificações como Câmera, Chip, etc.
                  </p>
                ) : (
                  specs.map((spec, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Input
                        value={spec.label}
                        onChange={(e) => updateSpec(index, 'label', e.target.value)}
                        placeholder="Ex: Câmera"
                        className="flex-1"
                      />
                      <Input
                        value={spec.valor}
                        onChange={(e) => updateSpec(index, 'valor', e.target.value)}
                        placeholder="Ex: 48MP + 12MP"
                        className="flex-1"
                      />
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeSpec(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Descrições */}
            <Card>
              <CardHeader>
                <CardTitle>Descrições</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="descricao_curta">Descrição Curta</Label>
                  <Input
                    id="descricao_curta"
                    value={formData.descricao_curta}
                    onChange={(e) => handleChange("descricao_curta", e.target.value)}
                    placeholder="Breve descrição do produto"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição Completa</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => handleChange("descricao", e.target.value)}
                    placeholder="Descreva o produto, estado de conservação, acessórios inclusos..."
                    rows={4}
                  />
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="destaque"
                      checked={formData.destaque}
                      onCheckedChange={(checked) => handleChange("destaque", checked)}
                    />
                    <Label htmlFor="destaque">Produto em destaque</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="ativo"
                      checked={formData.ativo}
                      onCheckedChange={(checked) => handleChange("ativo", checked)}
                    />
                    <Label htmlFor="ativo">Produto ativo</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Imagens */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ImagePlus className="w-5 h-5" />
                  Imagens
                </CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addImage}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {images.map((image, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    <GripVertical className="w-5 h-5 text-muted-foreground mt-2 cursor-move" />
                    
                    {image.url && (
                      <img 
                        src={image.url} 
                        alt={`Preview ${index + 1}`}
                        className="w-16 h-16 object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    )}
                    
                    <div className="flex-1 space-y-2">
                      <Input
                        value={image.url}
                        onChange={(e) => updateImage(index, e.target.value)}
                        placeholder="Cole a URL da imagem"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="mainImage"
                          checked={image.principal}
                          onChange={() => setMainImage(index)}
                          id={`main-${index}`}
                        />
                        <Label htmlFor={`main-${index}`} className="text-sm text-muted-foreground">
                          Imagem principal
                        </Label>
                      </div>
                    </div>
                    
                    {images.length > 1 && (
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeImage(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Botão de Salvar */}
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" asChild>
                <Link to="/admin/produtos">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={saving} className="min-w-[150px] bg-foreground text-background hover:bg-foreground/90">
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {isEditing ? "Atualizar" : "Cadastrar"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal: Cadastrar Nova Cor */}
      <Dialog open={showColorModal} onOpenChange={setShowColorModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cadastrar Nova Cor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="colorName">Nome da Cor</Label>
              <Input
                id="colorName"
                value={newColor.name}
                onChange={(e) => setNewColor(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Azul Petróleo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="colorCode">Código da Cor</Label>
              <div className="flex gap-3">
                <input
                  type="color"
                  id="colorCode"
                  value={newColor.code}
                  onChange={(e) => setNewColor(prev => ({ ...prev, code: e.target.value }))}
                  className="w-14 h-10 rounded border cursor-pointer"
                />
                <Input
                  value={newColor.code}
                  onChange={(e) => setNewColor(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
              <span
                className="w-10 h-10 rounded border"
                style={{ backgroundColor: newColor.code }}
              />
              <span className="text-sm">{newColor.name || "Nome da cor"}</span>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowColorModal(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleAddColor} className="bg-foreground text-background hover:bg-foreground/90">
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Cadastrar Nova Capacidade */}
      <Dialog open={showCapacityModal} onOpenChange={setShowCapacityModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cadastrar Nova Capacidade</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="capacityValue">Capacidade</Label>
              <Input
                id="capacityValue"
                value={newCapacity}
                onChange={(e) => setNewCapacity(e.target.value)}
                placeholder="Ex: 2TB"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowCapacityModal(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleAddCapacity} className="bg-foreground text-background hover:bg-foreground/90">
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Cadastrar Nova Tela */}
      <Dialog open={showDisplayModal} onOpenChange={setShowDisplayModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cadastrar Nova Especificação de Tela</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="displaySpec">Especificação da Tela</Label>
              <Input
                id="displaySpec"
                value={newDisplaySpec}
                onChange={(e) => setNewDisplaySpec(e.target.value)}
                placeholder='Ex: 6.7" Super Retina XDR ProMotion'
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Exemplos: 6.1" Super Retina XDR, 6.7" Super Retina XDR ProMotion
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowDisplayModal(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleAddDisplaySpec} className="bg-foreground text-background hover:bg-foreground/90">
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default AdminProductForm;