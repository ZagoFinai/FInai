// API para verificação de status dos usuários

export interface UserStatus {
  phone: string;
  status: 'Teste Grátis' | 'Pagante' | 'Expirado';
  registrationDate: string;
  daysRemaining?: number;
  isExpired: boolean;
}

// Função para calcular dias restantes do teste
export const calculateDaysRemaining = (registrationDate: string): number => {
  const parseDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('/');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  };

  const regDate = parseDate(registrationDate);
  const today = new Date();
  const diffTime = today.getTime() - regDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, 3 - diffDays); // 3 dias de teste
};

// Função para verificar se usuário expirou
export const isUserExpired = (client: any): boolean => {
  if (client.status === 'Pagante') return false;
  if (client.status === 'Expirado') return true;
  
  const daysRemaining = calculateDaysRemaining(client.registrationDate);
  return daysRemaining <= 0;
};

// Função para verificar status de um usuário específico
export const checkUserStatus = (phone: string): UserStatus | null => {
  try {
    const clients = JSON.parse(localStorage.getItem('finai_clients') || '[]');
    const client = clients.find((c: any) => c.phone === phone.replace(/\D/g, ''));
    
    if (!client) return null;
    
    const daysRemaining = calculateDaysRemaining(client.registrationDate);
    const isExpired = isUserExpired(client);
    
    // Atualizar status se expirou
    if (isExpired && client.status === 'Teste Grátis') {
      const updatedClients = clients.map((c: any) => 
        c.id === client.id ? { ...c, status: 'Expirado' } : c
      );
      localStorage.setItem('finai_clients', JSON.stringify(updatedClients));
      client.status = 'Expirado';
    }
    
    return {
      phone: client.phone,
      status: client.status,
      registrationDate: client.registrationDate,
      daysRemaining: client.status === 'Teste Grátis' ? daysRemaining : undefined,
      isExpired
    };
  } catch (error) {
    console.error('Erro ao verificar status do usuário:', error);
    return null;
  }
};

// Função para buscar usuários expirados
export const getExpiredUsers = (): UserStatus[] => {
  try {
    const clients = JSON.parse(localStorage.getItem('finai_clients') || '[]');
    const expiredUsers: UserStatus[] = [];
    const updatedClients = [];
    
    for (const client of clients) {
      const daysRemaining = calculateDaysRemaining(client.registrationDate);
      const isExpired = isUserExpired(client);
      
      // Se expirou e ainda está como "Teste Grátis", atualizar para "Expirado"
      if (isExpired && client.status === 'Teste Grátis') {
        const updatedClient = { ...client, status: 'Expirado' };
        updatedClients.push(updatedClient);
        
        expiredUsers.push({
          phone: client.phone,
          status: 'Expirado',
          registrationDate: client.registrationDate,
          isExpired: true
        });
      } else {
        updatedClients.push(client);
      }
    }
    
    // Salvar clientes atualizados
    if (expiredUsers.length > 0) {
      localStorage.setItem('finai_clients', JSON.stringify(updatedClients));
    }
    
    return expiredUsers;
  } catch (error) {
    console.error('Erro ao buscar usuários expirados:', error);
    return [];
  }
};

// Função para notificar N8N sobre usuários expirados
export const notifyExpiredUsers = async (expiredUsers: UserStatus[]) => {
  const n8nWebhookUrl = 'https://seu-n8n.com/webhook/status-check'; // Substitua pela sua URL
  
  for (const user of expiredUsers) {
    try {
      await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'user_expired',
          phone: user.phone,
          client: user
        })
      });
      console.log(`✅ Notificação de expiração enviada para ${user.phone}`);
    } catch (error) {
      console.error(`❌ Erro ao notificar expiração para ${user.phone}:`, error);
    }
  }
};

// Função para verificar status periodicamente
export const checkStatusPeriodically = () => {
  const expiredUsers = getExpiredUsers();
  
  if (expiredUsers.length > 0) {
    console.log(`🔄 ${expiredUsers.length} usuário(s) expiraram`);
    notifyExpiredUsers(expiredUsers);
  }
  
  return expiredUsers;
};