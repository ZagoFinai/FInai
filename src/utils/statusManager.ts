export interface StatusRule {
  fromStatus: string;
  toStatus: string;
  daysAfterRegistration?: number;
  daysAfterLastActivity?: number;
  condition?: (client: any) => boolean;
}

// Regras de negócio para mudança automática de status
export const statusRules: StatusRule[] = [
  // Teste Grátis expira após 3 dias
  {
    fromStatus: 'Teste Grátis',
    toStatus: 'Expirado',
    daysAfterRegistration: 3
  },
  // Clientes inativos por 30 dias ficam expirados (apenas se não forem pagantes)
  {
    fromStatus: 'Pagante',
    toStatus: 'Expirado',
    daysAfterLastActivity: 30
  }
];

// Função para calcular diferença em dias entre duas datas
export const daysDifference = (date1: string, date2: string = new Date().toLocaleDateString('pt-BR')): number => {
  const parseDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('/');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  };

  const d1 = parseDate(date1);
  const d2 = parseDate(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Função para calcular dias restantes do teste grátis
export const calculateDaysRemaining = (registrationDate: string): number => {
  const daysSinceRegistration = daysDifference(registrationDate);
  return Math.max(0, 3 - daysSinceRegistration); // 3 dias de teste
};

// Função para determinar o novo status baseado nas regras
export const calculateNewStatus = (client: any): string => {
  const currentDate = new Date().toLocaleDateString('pt-BR');
  
  for (const rule of statusRules) {
    if (client.status !== rule.fromStatus) continue;
    
    let shouldChange = false;
    
    // Verificar regra baseada em dias após registro
    if (rule.daysAfterRegistration) {
      const daysSinceRegistration = daysDifference(client.registrationDate, currentDate);
      if (daysSinceRegistration >= rule.daysAfterRegistration) {
        shouldChange = true;
      }
    }
    
    // Verificar regra baseada em dias após última atividade
    if (rule.daysAfterLastActivity && client.lastActivity) {
      const daysSinceActivity = daysDifference(client.lastActivity, currentDate);
      if (daysSinceActivity >= rule.daysAfterLastActivity) {
        shouldChange = true;
      }
    }
    
    // Verificar condição customizada
    if (rule.condition && rule.condition(client)) {
      shouldChange = true;
    }
    
    if (shouldChange) {
      return rule.toStatus;
    }
  }
  
  return client.status; // Manter status atual se nenhuma regra se aplicar
};

// Função para obter informações sobre quando o status mudará
export const getStatusChangeInfo = (client: any): { willChange: boolean; daysUntilChange?: number; newStatus?: string } => {
  const currentDate = new Date().toLocaleDateString('pt-BR');
  
  for (const rule of statusRules) {
    if (client.status !== rule.fromStatus) continue;
    
    if (rule.daysAfterRegistration) {
      const daysSinceRegistration = daysDifference(client.registrationDate, currentDate);
      const daysUntilChange = rule.daysAfterRegistration - daysSinceRegistration;
      
      if (daysUntilChange > 0) {
        return {
          willChange: true,
          daysUntilChange,
          newStatus: rule.toStatus
        };
      }
    }
    
    if (rule.daysAfterLastActivity && client.lastActivity) {
      const daysSinceActivity = daysDifference(client.lastActivity, currentDate);
      const daysUntilChange = rule.daysAfterLastActivity - daysSinceActivity;
      
      if (daysUntilChange > 0) {
        return {
          willChange: true,
          daysUntilChange,
          newStatus: rule.toStatus
        };
      }
    }
  }
  
  return { willChange: false };
};

// Função para processar todos os clientes e atualizar status automaticamente
export const processAutomaticStatusUpdates = async (
  clients: any[], 
  updateClientStatus: (id: string, status: string) => Promise<boolean>
): Promise<{ updated: number; clients: any[] }> => {
  let updatedCount = 0;
  const updatedClients = [];
  
  for (const client of clients) {
    const newStatus = calculateNewStatus(client);
    
    if (newStatus !== client.status) {
      const success = await updateClientStatus(client.id, newStatus as any);
      if (success) {
        updatedCount++;
        updatedClients.push({
          ...client,
          status: newStatus,
          lastActivity: new Date().toLocaleDateString('pt-BR')
        });
        
        // Se usuário expirou, notificar N8N
        if (newStatus === 'Expirado') {
          try {
            await fetch('https://seu-n8n.com/webhook/status-check', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'user_expired',
                phone: client.phone,
                client: { ...client, status: newStatus }
              })
            });
          } catch (error) {
            console.error('Erro ao notificar N8N sobre expiração:', error);
          }
        }
      } else {
        updatedClients.push(client);
      }
    } else {
      updatedClients.push(client);
    }
  }
  
  return { updated: updatedCount, clients: updatedClients };
};