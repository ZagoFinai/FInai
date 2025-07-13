import React, { useState, useEffect } from 'react';
import { Users, MessageCircle, LogOut, Shield, Eye, Filter, Search, Download, Calendar, TrendingUp, DollarSign, Trash2, AlertTriangle, Wifi, WifiOff, RefreshCw, Clock, Zap, CreditCard, Bell } from 'lucide-react';
import { Client, getClients, deleteClient, migrateLocalStorageToSupabase, updateClientStatus } from '../data/clientStorage';
import { processAutomaticStatusUpdates, getStatusChangeInfo } from '../utils/statusManager';
import { checkStatusPeriodically, checkUserStatus } from '../api/status-api';

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [isProcessingStatus, setIsProcessingStatus] = useState(false);
  const [lastStatusUpdate, setLastStatusUpdate] = useState<Date | null>(null);
  const [expiredUsersCount, setExpiredUsersCount] = useState(0);

  // Verificar se Supabase está configurado
  useEffect(() => {
    const checkSupabaseConnection = () => {
      const hasSupabaseConfig = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
      setIsSupabaseConnected(hasSupabaseConfig);
    };

    checkSupabaseConnection();
  }, []);

  // Carregar clientes e configurar atualização automática
  useEffect(() => {
    const loadClients = async () => {
      setIsLoading(true);
      
      // Executar migração do localStorage na primeira carga (se Supabase estiver configurado)
      if (isSupabaseConnected) {
        await migrateLocalStorageToSupabase();
      }
      
      const clientsData = await getClients();
      setClients(clientsData);
      setIsLoading(false);
    };

    // Carregar inicialmente
    loadClients();

    // Atualizar a cada 5 segundos para capturar novos cadastros e pagamentos
    const interval = setInterval(async () => {
      const clientsData = await getClients();
      setClients(clientsData);
    }, 5000);

    return () => clearInterval(interval);
  }, [isSupabaseConnected]);

  // Processar atualizações automáticas de status a cada 30 segundos
  useEffect(() => {
    const processStatusUpdates = async () => {
      if (clients.length === 0 || isProcessingStatus) return;
      
      setIsProcessingStatus(true);
      
      try {
        const result = await processAutomaticStatusUpdates(clients, updateClientStatus);
        
        if (result.updated > 0) {
          setClients(result.clients);
          setLastStatusUpdate(new Date());
          console.log(`✅ ${result.updated} cliente(s) tiveram status atualizado automaticamente`);
        }

        // Verificar usuários expirados
        const expiredUsers = checkStatusPeriodically();
        setExpiredUsersCount(expiredUsers.length);
        
      } catch (error) {
        console.error('Erro ao processar atualizações de status:', error);
      } finally {
        setIsProcessingStatus(false);
      }
    };

    // Processar imediatamente na primeira carga
    if (clients.length > 0) {
      processStatusUpdates();
    }

    // Processar a cada 30 segundos
    const statusInterval = setInterval(processStatusUpdates, 30000);

    return () => clearInterval(statusInterval);
  }, [clients.length, isProcessingStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pagante':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Teste Grátis':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Expirado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pagante':
        return '✅';
      case 'Teste Grátis':
        return '🆓';
      case 'Expirado':
        return '❌';
      default:
        return '❓';
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    const success = await deleteClient(clientId);
    if (success) {
      const clientsData = await getClients();
      setClients(clientsData);
      setDeleteConfirm(null);
    }
  };

  const handleManualStatusUpdate = async (clientId: string, newStatus: Client['status']) => {
    const success = await updateClientStatus(clientId, newStatus);
    if (success) {
      const clientsData = await getClients();
      setClients(clientsData);
    }
  };

  const handleCheckUserStatus = (phone: string) => {
    const status = checkUserStatus(phone);
    if (status) {
      alert(`Status: ${status.status}\nDias restantes: ${status.daysRemaining || 'N/A'}\nExpirado: ${status.isExpired ? 'Sim' : 'Não'}`);
    } else {
      alert('Usuário não encontrado');
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesStatus = filterStatus === 'Todos' || client.status === filterStatus;
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.phone.includes(searchTerm) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusCounts = {
    total: clients.length,
    pagante: clients.filter(c => c.status === 'Pagante').length,
    teste: clients.filter(c => c.status === 'Teste Grátis').length,
    expirado: clients.filter(c => c.status === 'Expirado').length
  };

  const formatPhone = (phone: string) => {
    return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`;
  };

  const exportData = () => {
    const csvContent = [
      ['Nome', 'Telefone', 'Email', 'Status', 'Data Cadastro', 'Última Atividade'],
      ...filteredClients.map(client => [
        client.name,
        formatPhone(client.phone),
        client.email,
        client.status,
        client.registrationDate,
        client.lastActivity || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clientes_finai_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados dos clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-slate-600 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Painel FinAí - Cadastros em Tempo Real</h1>
                <p className="text-gray-600 text-sm">Sincronização automática de novos cadastros</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {expiredUsersCount > 0 && (
                <div className="flex items-center bg-red-50 border border-red-200 rounded-xl px-4 py-2">
                  <Bell className="w-4 h-4 text-red-600 mr-2 animate-pulse" />
                  <span className="text-red-700 text-sm font-medium">{expiredUsersCount} usuário(s) expirado(s)</span>
                </div>
              )}
              
              <div className={`hidden md:flex items-center border rounded-xl px-4 py-2 ${
                isSupabaseConnected 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                {isSupabaseConnected ? (
                  <>
                    <Wifi className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-green-700 text-sm font-medium">Banco Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-yellow-600 mr-2" />
                    <span className="text-yellow-700 text-sm font-medium">Modo Local</span>
                  </>
                )}
              </div>
              
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition-all duration-200 hover:scale-[1.02] shadow-lg"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Status Control System Alert */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-2xl p-6 mb-8">
          <div className="flex items-start space-x-4">
            <Clock className="w-8 h-8 text-purple-600 mt-1" />
            <div>
              <h3 className="text-xl font-bold text-purple-800 mb-2">⏰ Sistema de Controle de Status Automático</h3>
              <p className="text-purple-700 mb-4">
                O bot agora verifica automaticamente o status dos usuários e bloqueia acesso após 3 dias de teste grátis:
              </p>
              
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold text-purple-800">Teste Grátis (3 dias)</span>
                  </div>
                  <p className="text-purple-700 text-sm">Bot funciona normalmente, informa dias restantes</p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold text-purple-800">Expirado</span>
                  </div>
                  <p className="text-purple-700 text-sm">Bot bloqueia e direciona para pagamento</p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <CreditCard className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold text-purple-800">Pagante</span>
                  </div>
                  <p className="text-purple-700 text-sm">Acesso total liberado permanentemente</p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-3 border border-purple-200">
                <p className="text-purple-800 text-sm">
                  <strong>🔄 Verificação:</strong> A cada 6 horas o sistema verifica usuários expirados e envia notificação automática
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Automatic Status Management Info */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 mb-8">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white">
              <Zap className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-blue-800 mb-2">Gerenciamento Automático de Status</h3>
              <p className="text-blue-700 mb-4">
                O sistema atualiza automaticamente os status dos clientes baseado em regras de negócio e pagamentos:
              </p>
              
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-blue-800">Teste → Expirado</span>
                  </div>
                  <p className="text-blue-700 text-sm">Após 3 dias do cadastro</p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-blue-800">Pagamento → Pagante</span>
                  </div>
                  <p className="text-blue-700 text-sm">Instantâneo via Mercado Pago</p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Bell className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-blue-800">Notificação Automática</span>
                  </div>
                  <p className="text-blue-700 text-sm">WhatsApp enviado quando expira</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isProcessingStatus ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`}></div>
                  <span className="text-blue-700 text-sm">
                    {isProcessingStatus ? 'Processando atualizações...' : 'Sistema ativo'}
                  </span>
                </div>
                
                {lastStatusUpdate && (
                  <div className="text-blue-600 text-sm">
                    Última atualização: {lastStatusUpdate.toLocaleTimeString('pt-BR')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total de Clientes</p>
                <p className="text-3xl font-bold text-gray-800">{statusCounts.total}</p>
                <p className="text-gray-500 text-xs mt-1">Cadastros ativos</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Clientes Pagantes</p>
                <p className="text-3xl font-bold text-green-600">{statusCounts.pagante}</p>
                <p className="text-gray-500 text-xs mt-1">Receita ativa</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Teste Grátis (3 dias)</p>
                <p className="text-3xl font-bold text-blue-600">{statusCounts.teste}</p>
                <p className="text-gray-500 text-xs mt-1">Potenciais conversões</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Contas Expiradas</p>
                <p className="text-3xl font-bold text-red-600">{statusCounts.expirado}</p>
                <p className="text-gray-500 text-xs mt-1">Necessitam atenção</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700 font-medium">Filtros:</span>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="Todos">Todos os Status</option>
                <option value="Pagante">✅ Pagante</option>
                <option value="Teste Grátis">🆓 Teste Grátis (3 dias)</option>
                <option value="Expirado">❌ Expirado</option>
              </select>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por nome, telefone ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-80"
                />
              </div>
              
              <button
                onClick={exportData}
                className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl transition-all duration-200 hover:scale-[1.02] shadow-lg"
              >
                <Download className="w-4 h-4" />
                <span>Exportar CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Clients Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
              <Eye className="w-5 h-5 mr-2 text-blue-600" />
              Lista de Clientes ({filteredClients.length} {filteredClients.length === 1 ? 'resultado' : 'resultados'})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Cliente</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Contato</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Cadastro</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Última Atividade</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredClients.map((client) => {
                  const statusInfo = getStatusChangeInfo(client);
                  
                  return (
                    <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-800">{client.name}</div>
                          <div className="text-gray-500 text-sm">ID: {client.id.length > 8 ? client.id.slice(0, 8) + '...' : client.id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-gray-600 font-medium">{formatPhone(client.phone)}</div>
                          <div className="text-gray-500 text-sm">{client.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(client.status)}`}>
                            <span className="mr-1">{getStatusIcon(client.status)}</span>
                            {client.status}
                          </span>
                          
                          {statusInfo.willChange && (
                            <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-200">
                              <Clock className="w-3 h-3 inline mr-1" />
                              Muda para "{statusInfo.newStatus}" em {statusInfo.daysUntilChange} dia(s)
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-600 text-sm">{client.registrationDate}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-600 text-sm">{client.lastActivity}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center space-x-2">
                            <a
                              href={`https://wa.me/55${client.phone}?text=Olá ${client.name.split(' ')[0]}, aqui é da equipe FinAí. Como posso ajudá-lo(a)?`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-xl transition-all duration-200 text-sm font-medium hover:scale-[1.02] shadow-lg"
                            >
                              <MessageCircle className="w-4 h-4" />
                              <span>WhatsApp</span>
                            </a>
                            
                            <button
                              onClick={() => handleCheckUserStatus(client.phone)}
                              className="inline-flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-xl transition-all duration-200 text-sm font-medium hover:scale-[1.02] shadow-lg"
                            >
                              <Clock className="w-4 h-4" />
                              <span>Status</span>
                            </button>
                            
                            {deleteConfirm === client.id ? (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleDeleteClient(client.id)}
                                  className="inline-flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-xl transition-all duration-200 text-sm font-medium"
                                >
                                  <AlertTriangle className="w-4 h-4" />
                                  <span>Confirmar</span>
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(null)}
                                  className="inline-flex items-center space-x-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-xl transition-all duration-200 text-sm font-medium"
                                >
                                  <span>Cancelar</span>
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirm(client.id)}
                                className="inline-flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-xl transition-all duration-200 text-sm font-medium hover:scale-[1.02] shadow-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Excluir</span>
                              </button>
                            )}
                          </div>
                          
                          {/* Manual Status Change */}
                          <div className="flex items-center space-x-1">
                            <select
                              value={client.status}
                              onChange={(e) => handleManualStatusUpdate(client.id, e.target.value as Client['status'])}
                              className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="Teste Grátis">🆓 Teste Grátis</option>
                              <option value="Pagante">✅ Pagante</option>
                              <option value="Expirado">❌ Expirado</option>
                            </select>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredClients.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">Nenhum cliente encontrado</p>
              <p className="text-gray-400 text-sm">Tente ajustar os filtros ou termo de busca</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <p className="text-gray-600 text-sm">
              FinAí © 2025 – Sistema com controle automático de status
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                  isProcessingStatus ? 'bg-orange-500' : 'bg-green-500'
                }`}></div>
                <span>
                  {isProcessingStatus ? 'Verificando status...' : 'Sistema ativo'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}