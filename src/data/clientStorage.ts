import { supabase } from '../lib/supabase';

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: 'Teste Grátis' | 'Pagante' | 'Expirado';
  registrationDate: string;
  lastActivity?: string;
  daysRemaining?: number;
  expirationDate?: string;
}

export interface Payment {
  id: string;
  client_id: string;
  mercadopago_payment_id: string;
  status: string;
  amount: number;
  payment_method?: string;
  external_reference?: string;
  created_at: string;
  updated_at: string;
}

// Verificar se o Supabase está configurado
const isSupabaseConfigured = () => {
  try {
    return !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
  } catch {
    return false;
  }
};

// Função para calcular dias restantes
const calculateDaysRemaining = (registrationDate: string, status: string): number => {
  if (status === 'Pagante') return 30; // Pagantes têm 30 dias
  if (status === 'Expirado') return 0;
  
  const parseDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('/');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  };

  const regDate = parseDate(registrationDate);
  const today = new Date();
  const diffTime = today.getTime() - regDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, 3 - diffDays); // 3 dias de teste grátis
};

// Função para calcular data de expiração
const calculateExpirationDate = (registrationDate: string, status: string): string => {
  const parseDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('/');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  };

  const regDate = parseDate(registrationDate);
  const daysToAdd = status === 'Pagante' ? 30 : 3;
  const expirationDate = new Date(regDate.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));
  
  return expirationDate.toLocaleDateString('pt-BR');
};

// Função para atualizar status baseado nos dias
const updateStatusBasedOnDays = (client: Client): Client => {
  const daysRemaining = calculateDaysRemaining(client.registrationDate, client.status);
  const expirationDate = calculateExpirationDate(client.registrationDate, client.status);
  
  let newStatus = client.status;
  
  // Se é teste grátis e passou de 3 dias, expira
  if (client.status === 'Teste Grátis' && daysRemaining <= 0) {
    newStatus = 'Expirado';
  }
  
  // Se é pagante e passou de 30 dias, expira
  if (client.status === 'Pagante') {
    const paymentDays = calculateDaysRemaining(client.registrationDate, 'Pagante');
    if (paymentDays <= 0) {
      newStatus = 'Expirado';
    }
  }
  
  return {
    ...client,
    status: newStatus,
    daysRemaining,
    expirationDate
  };
};

// Dados iniciais de exemplo para localStorage
const initialClients: Client[] = [
  {
    id: '1',
    name: 'Maria Silva Santos',
    phone: '51999887766',
    email: 'maria.silva@email.com',
    status: 'Pagante',
    registrationDate: '15/12/2024',
    lastActivity: '22/12/2024'
  },
  {
    id: '2',
    name: 'João Carlos Oliveira',
    phone: '51988776655',
    email: 'joao.carlos@email.com',
    status: 'Teste Grátis',
    registrationDate: '20/12/2024',
    lastActivity: '23/12/2024'
  },
  {
    id: '3',
    name: 'Ana Paula Costa',
    phone: '51977665544',
    email: 'ana.paula@email.com',
    status: 'Expirado',
    registrationDate: '10/12/2024',
    lastActivity: '18/12/2024'
  },
  {
    id: '4',
    name: 'Carlos Eduardo Mendes',
    phone: '51966554433',
    email: 'carlos.mendes@email.com',
    status: 'Pagante',
    registrationDate: '08/12/2024',
    lastActivity: '23/12/2024'
  },
  {
    id: '5',
    name: 'Fernanda Lima',
    phone: '51955443322',
    email: 'fernanda.lima@email.com',
    status: 'Teste Grátis',
    registrationDate: '22/12/2024',
    lastActivity: '23/12/2024'
  }
].map(client => updateStatusBasedOnDays(client));

// Função para converter dados do Supabase para o formato da aplicação
const formatClientFromDB = (dbClient: any): Client => {
  const client = {
    id: dbClient.id,
    name: dbClient.name,
    phone: dbClient.phone,
    email: dbClient.email,
    status: dbClient.status,
    registrationDate: new Date(dbClient.registration_date).toLocaleDateString('pt-BR'),
    lastActivity: dbClient.last_activity ? new Date(dbClient.last_activity).toLocaleDateString('pt-BR') : undefined
  };
  
  return updateStatusBasedOnDays(client);
};

// Funções para localStorage com sincronização
const STORAGE_KEY = 'finai_clients_v2';
const SYNC_KEY = 'finai_last_sync';

const getClientsFromLocalStorage = (): Client[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const updatedInitialClients = initialClients.map(client => updateStatusBasedOnDays(client));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedInitialClients));
      localStorage.setItem(SYNC_KEY, new Date().toISOString());
      return updatedInitialClients;
    }
    
    const clients = JSON.parse(stored);
    // Atualizar status baseado nos dias sempre que carregar
    const updatedClients = clients.map((client: Client) => updateStatusBasedOnDays(client));
    
    // Salvar de volta se houve mudanças
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedClients));
    
    return updatedClients;
  } catch (error) {
    console.error('Erro ao carregar clientes do localStorage:', error);
    const updatedInitialClients = initialClients.map(client => updateStatusBasedOnDays(client));
    return updatedInitialClients;
  }
};

const saveClientsToLocalStorage = (clients: Client[]): void => {
  try {
    // Atualizar status antes de salvar
    const updatedClients = clients.map(client => updateStatusBasedOnDays(client));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedClients));
    localStorage.setItem(SYNC_KEY, new Date().toISOString());
    
    // Disparar evento customizado para sincronização entre abas
    window.dispatchEvent(new CustomEvent('finai-clients-updated', { 
      detail: { clients: updatedClients, timestamp: new Date().toISOString() }
    }));
  } catch (error) {
    console.error('Erro ao salvar clientes no localStorage:', error);
  }
};

// Listener para sincronização entre abas/dispositivos
let syncListenerAdded = false;

const addSyncListener = (callback: (clients: Client[]) => void) => {
  if (syncListenerAdded) return;
  
  // Listener para mudanças no localStorage (entre abas)
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        const clients = JSON.parse(e.newValue);
        const updatedClients = clients.map((client: Client) => updateStatusBasedOnDays(client));
        callback(updatedClients);
      } catch (error) {
        console.error('Erro ao sincronizar dados:', error);
      }
    }
  });
  
  // Listener para evento customizado
  window.addEventListener('finai-clients-updated', (e: any) => {
    const updatedClients = e.detail.clients.map((client: Client) => updateStatusBasedOnDays(client));
    callback(updatedClients);
  });
  
  syncListenerAdded = true;
};

// Funções principais que usam Supabase ou localStorage como fallback
export const getClients = async (onUpdate?: (clients: Client[]) => void): Promise<Client[]> => {
  // Adicionar listener de sincronização se callback fornecido
  if (onUpdate) {
    addSyncListener(onUpdate);
  }
  
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('registration_date', { ascending: false });

      if (error) {
        console.error('Erro ao buscar clientes no Supabase:', error);
        return getClientsFromLocalStorage();
      }

      const clients = data?.map(formatClientFromDB) || [];
      
      // Sincronizar com localStorage
      if (clients.length > 0) {
        saveClientsToLocalStorage(clients);
      }
      
      return clients;
    } catch (error) {
      console.error('Erro ao conectar com Supabase:', error);
      return getClientsFromLocalStorage();
    }
  } else {
    return getClientsFromLocalStorage();
  }
};

export const getPayments = async (): Promise<Payment[]> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          clients (
            name,
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar pagamentos no Supabase:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao conectar com Supabase:', error);
      return [];
    }
  } else {
    return [];
  }
};

export const addClient = async (clientData: Omit<Client, 'id' | 'registrationDate' | 'lastActivity' | 'daysRemaining' | 'expirationDate'>): Promise<Client | null> => {
  const now = new Date();
  const registrationDate = now.toLocaleDateString('pt-BR');
  
  const newClient: Client = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    ...clientData,
    status: 'Teste Grátis',
    registrationDate,
    lastActivity: registrationDate,
    daysRemaining: 3,
    expirationDate: calculateExpirationDate(registrationDate, 'Teste Grátis')
  };

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([{
          name: clientData.name,
          phone: clientData.phone,
          email: clientData.email,
          status: 'Teste Grátis' as const,
          registration_date: now.toISOString(),
          last_activity: now.toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar cliente no Supabase:', error);
        // Fallback para localStorage
        const clients = getClientsFromLocalStorage();
        const updatedClients = [...clients, newClient];
        saveClientsToLocalStorage(updatedClients);
        console.log('✅ Cliente adicionado ao localStorage:', newClient.name);
        return newClient;
      }

      console.log('✅ Cliente adicionado ao Supabase:', data.name);
      const formattedClient = formatClientFromDB(data);
      
      // Sincronizar com localStorage
      const clients = getClientsFromLocalStorage();
      const updatedClients = [...clients, formattedClient];
      saveClientsToLocalStorage(updatedClients);
      
      return formattedClient;
    } catch (error) {
      console.error('Erro ao conectar com Supabase:', error);
      // Fallback para localStorage
      const clients = getClientsFromLocalStorage();
      const updatedClients = [...clients, newClient];
      saveClientsToLocalStorage(updatedClients);
      console.log('✅ Cliente adicionado ao localStorage (fallback):', newClient.name);
      return newClient;
    }
  } else {
    // Usar localStorage
    const clients = getClientsFromLocalStorage();
    const updatedClients = [...clients, newClient];
    saveClientsToLocalStorage(updatedClients);
    console.log('✅ Cliente adicionado ao localStorage:', newClient.name);
    return newClient;
  }
};

export const deleteClient = async (clientId: string): Promise<boolean> => {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);

      if (error) {
        console.error('Erro ao excluir cliente no Supabase:', error);
        // Fallback para localStorage
        const clients = getClientsFromLocalStorage();
        const updatedClients = clients.filter(client => client.id !== clientId);
        saveClientsToLocalStorage(updatedClients);
        return true;
      }

      // Sincronizar com localStorage
      const clients = getClientsFromLocalStorage();
      const updatedClients = clients.filter(client => client.id !== clientId);
      saveClientsToLocalStorage(updatedClients);
      
      return true;
    } catch (error) {
      console.error('Erro ao conectar com Supabase:', error);
      // Fallback para localStorage
      const clients = getClientsFromLocalStorage();
      const updatedClients = clients.filter(client => client.id !== clientId);
      saveClientsToLocalStorage(updatedClients);
      return true;
    }
  } else {
    // Usar localStorage
    const clients = getClientsFromLocalStorage();
    const updatedClients = clients.filter(client => client.id !== clientId);
    saveClientsToLocalStorage(updatedClients);
    return true;
  }
};

export const updateClientStatus = async (clientId: string, status: Client['status']): Promise<boolean> => {
  const now = new Date();
  
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('clients')
        .update({ 
          status, 
          last_activity: now.toISOString(),
          updated_at: now.toISOString()
        })
        .eq('id', clientId);

      if (error) {
        console.error('Erro ao atualizar status no Supabase:', error);
        // Fallback para localStorage
        const clients = getClientsFromLocalStorage();
        const updatedClients = clients.map(client => {
          if (client.id === clientId) {
            const updatedClient = { 
              ...client, 
              status, 
              lastActivity: now.toLocaleDateString('pt-BR')
            };
            return updateStatusBasedOnDays(updatedClient);
          }
          return client;
        });
        saveClientsToLocalStorage(updatedClients);
        return true;
      }

      // Sincronizar com localStorage
      const clients = getClientsFromLocalStorage();
      const updatedClients = clients.map(client => {
        if (client.id === clientId) {
          const updatedClient = { 
            ...client, 
            status, 
            lastActivity: now.toLocaleDateString('pt-BR')
          };
          return updateStatusBasedOnDays(updatedClient);
        }
        return client;
      });
      saveClientsToLocalStorage(updatedClients);
      
      return true;
    } catch (error) {
      console.error('Erro ao conectar com Supabase:', error);
      // Fallback para localStorage
      const clients = getClientsFromLocalStorage();
      const updatedClients = clients.map(client => {
        if (client.id === clientId) {
          const updatedClient = { 
            ...client, 
            status, 
            lastActivity: now.toLocaleDateString('pt-BR')
          };
          return updateStatusBasedOnDays(updatedClient);
        }
        return client;
      });
      saveClientsToLocalStorage(updatedClients);
      return true;
    }
  } else {
    // Usar localStorage
    const clients = getClientsFromLocalStorage();
    const updatedClients = clients.map(client => {
      if (client.id === clientId) {
        const updatedClient = { 
          ...client, 
          status, 
          lastActivity: now.toLocaleDateString('pt-BR')
        };
        return updateStatusBasedOnDays(updatedClient);
      }
      return client;
    });
    saveClientsToLocalStorage(updatedClients);
    return true;
  }
};

// Função para forçar atualização de status de todos os clientes
export const refreshAllClientsStatus = async (): Promise<Client[]> => {
  const clients = await getClients();
  const updatedClients = clients.map(client => updateStatusBasedOnDays(client));
  saveClientsToLocalStorage(updatedClients);
  return updatedClients;
};

// Função para sincronizar dados do localStorage para o Supabase (migração única)
export const migrateLocalStorageToSupabase = async (): Promise<void> => {
  if (!isSupabaseConfigured()) return;

  try {
    const localData = localStorage.getItem(STORAGE_KEY);
    if (!localData) return;

    const localClients = JSON.parse(localData);
    
    for (const client of localClients) {
      const registrationDate = client.registrationDate.split('/').reverse().join('-');
      const lastActivity = client.lastActivity ? client.lastActivity.split('/').reverse().join('-') : registrationDate;
      
      await supabase
        .from('clients')
        .upsert({
          name: client.name,
          phone: client.phone,
          email: client.email,
          status: client.status,
          registration_date: new Date(registrationDate).toISOString(),
          last_activity: new Date(lastActivity).toISOString()
        });
    }

    console.log('Migração do localStorage para Supabase concluída');
  } catch (error) {
    console.error('Erro na migração:', error);
  }
};