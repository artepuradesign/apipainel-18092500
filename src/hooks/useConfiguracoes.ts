import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '@/services/api';

export interface Configuracoes {
  loja_nome: string;
  loja_telefone: string;
  loja_whatsapp: string;
  loja_email: string;
  frete_gratis_acima: string;
  parcelas_maximo: string;
  parcelas_sem_juros: string;
  cep: string;
}

const defaultConfig: Configuracoes = {
  loja_nome: 'iPlace Seminovos',
  loja_telefone: '(98) 98914-5930',
  loja_whatsapp: '5598989145930',
  loja_email: 'contato@iplaceseminovos.com.br',
  frete_gratis_acima: '500',
  parcelas_maximo: '12',
  parcelas_sem_juros: '3',
  cep: '',
};

export const fetchConfiguracoes = async (): Promise<Configuracoes> => {
  try {
    const response = await fetch(`${API_BASE_URL}/configuracoes.php`);
    
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Erro ao buscar configurações');
    }
    
    return { ...defaultConfig, ...data.data };
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    return defaultConfig;
  }
};

export const useConfiguracoes = () => {
  return useQuery({
    queryKey: ['configuracoes'],
    queryFn: fetchConfiguracoes,
    staleTime: 1000 * 60 * 10, // 10 minutos
    gcTime: 1000 * 60 * 30, // 30 minutos
    initialData: defaultConfig,
  });
};
