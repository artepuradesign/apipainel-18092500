// Especificações padrão de iPhones

export interface iPhoneSpec {
  model: string;
  display: string;
  camera: string;
  chip: string;
  battery?: string;
}

// Mapeamento de modelos para especificações
const IPHONE_SPECS: Record<string, iPhoneSpec> = {
  // iPhone 6 series
  "IPHONE 6": { model: "iPhone 6", display: "4.7\" Retina HD", camera: "8MP", chip: "A8" },
  "IPHONE 6 PLUS": { model: "iPhone 6 Plus", display: "5.5\" Retina HD", camera: "8MP", chip: "A8" },
  "IPHONE 6S": { model: "iPhone 6s", display: "4.7\" Retina HD", camera: "12MP", chip: "A9" },
  "IPHONE 6S PLUS": { model: "iPhone 6s Plus", display: "5.5\" Retina HD", camera: "12MP", chip: "A9" },
  
  // iPhone 7 series
  "IPHONE 7": { model: "iPhone 7", display: "4.7\" Retina HD", camera: "12MP", chip: "A10 Fusion" },
  "IPHONE 7 PLUS": { model: "iPhone 7 Plus", display: "5.5\" Retina HD", camera: "12MP + 12MP", chip: "A10 Fusion" },
  
  // iPhone 8 series
  "IPHONE 8": { model: "iPhone 8", display: "4.7\" Retina HD", camera: "12MP", chip: "A11 Bionic" },
  "IPHONE 8 PLUS": { model: "iPhone 8 Plus", display: "5.5\" Retina HD", camera: "12MP + 12MP", chip: "A11 Bionic" },
  
  // iPhone X series
  "IPHONE X": { model: "iPhone X", display: "5.8\" Super Retina HD", camera: "12MP + 12MP", chip: "A11 Bionic" },
  "IPHONE XR": { model: "iPhone XR", display: "6.1\" Liquid Retina HD", camera: "12MP", chip: "A12 Bionic" },
  "IPHONE XS": { model: "iPhone XS", display: "5.8\" Super Retina HD", camera: "12MP + 12MP", chip: "A12 Bionic" },
  "IPHONE XS MAX": { model: "iPhone XS Max", display: "6.5\" Super Retina HD", camera: "12MP + 12MP", chip: "A12 Bionic" },
  
  // iPhone 11 series
  "IPHONE 11": { model: "iPhone 11", display: "6.1\" Liquid Retina HD", camera: "12MP + 12MP", chip: "A13 Bionic" },
  "IPHONE 11 PRO": { model: "iPhone 11 Pro", display: "5.8\" Super Retina XDR", camera: "12MP + 12MP + 12MP", chip: "A13 Bionic" },
  "IPHONE 11 PRO MAX": { model: "iPhone 11 Pro Max", display: "6.5\" Super Retina XDR", camera: "12MP + 12MP + 12MP", chip: "A13 Bionic" },
  
  // iPhone 12 series
  "IPHONE 12": { model: "iPhone 12", display: "6.1\" Super Retina XDR", camera: "12MP + 12MP", chip: "A14 Bionic" },
  "IPHONE 12 MINI": { model: "iPhone 12 mini", display: "5.4\" Super Retina XDR", camera: "12MP + 12MP", chip: "A14 Bionic" },
  "IPHONE 12 PRO": { model: "iPhone 12 Pro", display: "6.1\" Super Retina XDR", camera: "12MP + 12MP + 12MP + LiDAR", chip: "A14 Bionic" },
  "IPHONE 12 PRO MAX": { model: "iPhone 12 Pro Max", display: "6.7\" Super Retina XDR", camera: "12MP + 12MP + 12MP + LiDAR", chip: "A14 Bionic" },
  
  // iPhone 13 series
  "IPHONE 13": { model: "iPhone 13", display: "6.1\" Super Retina XDR", camera: "12MP + 12MP", chip: "A15 Bionic" },
  "IPHONE 13 MINI": { model: "iPhone 13 mini", display: "5.4\" Super Retina XDR", camera: "12MP + 12MP", chip: "A15 Bionic" },
  "IPHONE 13 PRO": { model: "iPhone 13 Pro", display: "6.1\" Super Retina XDR ProMotion", camera: "12MP + 12MP + 12MP + LiDAR", chip: "A15 Bionic" },
  "IPHONE 13 PRO MAX": { model: "iPhone 13 Pro Max", display: "6.7\" Super Retina XDR ProMotion", camera: "12MP + 12MP + 12MP + LiDAR", chip: "A15 Bionic" },
  
  // iPhone 14 series
  "IPHONE 14": { model: "iPhone 14", display: "6.1\" Super Retina XDR", camera: "12MP + 12MP", chip: "A15 Bionic" },
  "IPHONE 14 PLUS": { model: "iPhone 14 Plus", display: "6.7\" Super Retina XDR", camera: "12MP + 12MP", chip: "A15 Bionic" },
  "IPHONE 14 PRO": { model: "iPhone 14 Pro", display: "6.1\" Super Retina XDR ProMotion", camera: "48MP + 12MP + 12MP + LiDAR", chip: "A16 Bionic" },
  "IPHONE 14 PRO MAX": { model: "iPhone 14 Pro Max", display: "6.7\" Super Retina XDR ProMotion", camera: "48MP + 12MP + 12MP + LiDAR", chip: "A16 Bionic" },
  
  // iPhone 15 series
  "IPHONE 15": { model: "iPhone 15", display: "6.1\" Super Retina XDR", camera: "48MP + 12MP", chip: "A16 Bionic" },
  "IPHONE 15 PLUS": { model: "iPhone 15 Plus", display: "6.7\" Super Retina XDR", camera: "48MP + 12MP", chip: "A16 Bionic" },
  "IPHONE 15 PRO": { model: "iPhone 15 Pro", display: "6.1\" Super Retina XDR ProMotion", camera: "48MP + 12MP + 12MP + LiDAR", chip: "A17 Pro" },
  "IPHONE 15 PRO MAX": { model: "iPhone 15 Pro Max", display: "6.7\" Super Retina XDR ProMotion", camera: "48MP + 12MP + 12MP + LiDAR", chip: "A17 Pro" },
  
  // iPhone 16 series
  "IPHONE 16E": { model: "iPhone 16e", display: "6.1\" Super Retina XDR", camera: "48MP + 12MP", chip: "A18" },
  "IPHONE 16": { model: "iPhone 16", display: "6.1\" Super Retina XDR", camera: "48MP + 12MP", chip: "A18" },
  "IPHONE 16 PLUS": { model: "iPhone 16 Plus", display: "6.7\" Super Retina XDR", camera: "48MP + 12MP", chip: "A18" },
  "IPHONE 16 PRO": { model: "iPhone 16 Pro", display: "6.3\" Super Retina XDR ProMotion", camera: "48MP + 48MP + 12MP + LiDAR", chip: "A18 Pro" },
  "IPHONE 16 PRO MAX": { model: "iPhone 16 Pro Max", display: "6.9\" Super Retina XDR ProMotion", camera: "48MP + 48MP + 12MP + LiDAR", chip: "A18 Pro" },
  
  // iPhone 17 series
  "IPHONE 17": { model: "iPhone 17", display: "6.1\" Super Retina XDR", camera: "48MP + 24MP", chip: "A19" },
  "IPHONE AIR": { model: "iPhone Air", display: "6.6\" Super Retina XDR", camera: "48MP + 24MP", chip: "A19" },
  "IPHONE 17 PRO": { model: "iPhone 17 Pro", display: "6.3\" Super Retina XDR ProMotion", camera: "48MP + 48MP + 12MP + LiDAR", chip: "A19 Pro" },
  "IPHONE 17 PRO MAX": { model: "iPhone 17 Pro Max", display: "6.9\" Super Retina XDR ProMotion", camera: "48MP + 48MP + 12MP + LiDAR", chip: "A19 Pro" },
  
  // iPhone SE series
  "IPHONE SE": { model: "iPhone SE", display: "4.7\" Retina HD", camera: "12MP", chip: "A13 Bionic" },
  "IPHONE SE 2020": { model: "iPhone SE (2020)", display: "4.7\" Retina HD", camera: "12MP", chip: "A13 Bionic" },
  "IPHONE SE 2022": { model: "iPhone SE (2022)", display: "4.7\" Retina HD", camera: "12MP", chip: "A15 Bionic" },
};

// Encontra as specs de um iPhone baseado no nome do produto
export const getIPhoneSpecs = (productName: string): iPhoneSpec | null => {
  const nameUpper = productName.toUpperCase();
  
  // Tenta encontrar o modelo mais específico primeiro
  for (const [model, specs] of Object.entries(IPHONE_SPECS)) {
    if (nameUpper.includes(model)) {
      return specs;
    }
  }
  
  return null;
};

// Gera specs adicionais para o produto
export const generateProductSpecs = (
  productName: string,
  existingSpecs: { label: string; value: string }[],
  selectedCapacity?: string | null,
  selectedColor?: string | null
): { label: string; value: string }[] => {
  const specs: { label: string; value: string }[] = [];
  const existingLabels = new Set(existingSpecs.map(s => s.label.toLowerCase()));
  
  // Adiciona specs do iPhone se for um iPhone
  const iphoneSpecs = getIPhoneSpecs(productName);
  if (iphoneSpecs) {
    if (!existingLabels.has('tela')) {
      specs.push({ label: 'Tela', value: iphoneSpecs.display });
    }
    if (!existingLabels.has('câmera') && !existingLabels.has('camera')) {
      specs.push({ label: 'Câmera', value: iphoneSpecs.camera });
    }
    if (!existingLabels.has('chip') && !existingLabels.has('processador')) {
      specs.push({ label: 'Chip', value: iphoneSpecs.chip });
    }
  }
  
  // Adiciona capacidade selecionada se não existir
  if (selectedCapacity && !existingLabels.has('capacidade')) {
    specs.push({ label: 'Capacidade', value: selectedCapacity });
  }
  
  // Adiciona cor selecionada se não existir
  if (selectedColor && !existingLabels.has('cor')) {
    specs.push({ label: 'Cor', value: selectedColor });
  }
  
  // Combina specs existentes com as novas
  return [...specs, ...existingSpecs.filter(s => 
    !specs.some(newSpec => newSpec.label.toLowerCase() === s.label.toLowerCase())
  )];
};
