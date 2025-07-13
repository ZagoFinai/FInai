import { supabase } from '../lib/supabase';

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: 'Teste Grátis' | 'Pagante' | 'Expirado';
  registrationDate: string;
  lastActivity?: string;
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
];

// Função para converter dados do Supabase para o formato da aplicação
const formatClientFromDB = (dbClient: any): Client => ({
  id: dbClient.id,
  name: dbClient.name,
  phone: dbClient.phone,
  email: dbClient.email,
  status: dbClient.status,
  registrationDate: new Date(dbClient.registration_date).toLocaleDateString('pt-BR'),
  lastActivity: dbClient.last_activity ? new Date(dbClient.last_activity).toLocaleDateString('pt-BR') : undefined
});

// Funções para localStorage
const getClientsFromLocalStorage = (): Client[] => {
  try {
    const stored = localStorage.getItem('finai_clients');
    if (!stored) {
      localStorage.setItem('finai_clients', JSON.stringify(initialClients));
      return initialClients;
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error('Erro ao carregar clientes do localStorage:', error);
    return initialClients;
  }
};

const saveClientsToLocalStorage = (clients: Client[]): void => {
  try {
    localStorage.setItem('finai_clients', JSON.stringify(clients));
  } catch (error) {
    console.error('Erro ao salvar clientes no localStorage:', error);
  }
};

// Funções principais que usam Supabase ou localStorage como fallback
export const getClients = async (): Promise<Client[]> => {
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

      return data?.map(formatClientFromDB) || [];
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

export const addClient = async (clientData: Omit<Client, 'id' | 'registrationDate' | 'lastActivity'>): Promise<Client | null> => {
  const newClient: Client = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    ...clientData,
    status: 'Teste Grátis',
    registrationDate: new Date().toLocaleDateString('pt-BR'),
    lastActivity: new Date().toLocaleDateString('pt-BR')
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
          registration_date: new Date().toISOString(),
          last_activity: new Date().toISOString()
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
      return formatClientFromDB(data);
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
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('clients')
        .update({ 
          status, 
          last_activity: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', clientId);

      if (error) {
        console.error('Erro ao atualizar status no Supabase:', error);
        // Fallback para localStorage
        const clients = getClientsFromLocalStorage();
        const updatedClients = clients.map(client => 
          client.id === clientId 
            ? { ...client, status, lastActivity: new Date().toLocaleDateString('pt-BR') }
            : client
        );
        saveClientsToLocalStorage(updatedClients);
        return true;
      }

      return true;
    } catch (error) {
      console.error('Erro ao conectar com Supabase:', error);
      // Fallback para localStorage
      const clients = getClientsFromLocalStorage();
      const updatedClients = clients.map(client => 
        client.id === clientId 
          ? { ...client, status, lastActivity: new Date().toLocaleDateString('pt-BR') }
          : client
      );
      saveClientsToLocalStorage(updatedClients);
      return true;
    }
  } else {
    // Usar localStorage
    const clients = getClientsFromLocalStorage();
    const updatedClients = clients.map(client => 
      client.id === clientId 
        ? { ...client, status, lastActivity: new Date().toLocaleDateString('pt-BR') }
        : client
    );
    saveClientsToLocalStorage(updatedClients);
    return true;
  }
};

// Função para sincronizar dados do localStorage para o Supabase (migração única)
export const migrateLocalStorageToSupabase = async (): Promise<void> => {
  if (!isSupabaseConfigured()) return;

  try {
    const localData = localStorage.getItem('finai_clients');
    if (!localData) return;

    const localClients = JSON.parse(localData);
    
    for (const client of localClients) {
      await supabase
        .from('clients')
        .upsert({
          name: client.name,
          phone: client.phone,
          email: client.email,
          status: client.status,
          registration_date: new Date(client.registrationDate.split('/').reverse().join('-')).toISOString(),
          last_activity: client.lastActivity ? new Date(client.lastActivity.split('/').reverse().join('-')).toISOString() : new Date().toISOString()
        });
    }

    // Limpar localStorage após migração
    localStorage.removeItem('finai_clients');
    console.log('Migração do localStorage para Supabase concluída');
  } catch (error) {
    console.error('Erro na migração:', error);
  }
};