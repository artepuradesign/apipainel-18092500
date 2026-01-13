// Utilitário simples para codificar/decodificar IDs de produtos em hash
// Usa base64 com alguns caracteres substituídos para URL-safe

const SALT = 'iplace2024';

// Codifica ID para hash
export const encodeProductId = (id: string | number): string => {
  const data = `${SALT}-${id}`;
  // Simples base64 URL-safe
  const encoded = btoa(data)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return encoded;
};

// Decodifica hash para ID
export const decodeProductHash = (hash: string): string | null => {
  try {
    // Restaura caracteres base64
    let base64 = hash
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    // Adiciona padding se necessário
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }
    
    const decoded = atob(base64);
    
    // Verifica se tem o salt correto
    if (!decoded.startsWith(`${SALT}-`)) {
      return null;
    }
    
    return decoded.replace(`${SALT}-`, '');
  } catch {
    return null;
  }
};

// Verifica se é um hash válido ou um ID/slug comum
export const isProductHash = (value: string): boolean => {
  // Hash é sempre base64-like e não contém só números ou letras simples
  if (/^\d+$/.test(value)) return false; // É um ID numérico
  if (value.includes('-') && !value.includes('_')) {
    // Provavelmente é um slug como "iphone-12-pro"
    return false;
  }
  
  // Tenta decodificar
  const decoded = decodeProductHash(value);
  return decoded !== null;
};
