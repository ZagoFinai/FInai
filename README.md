# FinAí - Sistema Integrado com Mercado Pago

## 🚀 Funcionalidades

### Sistema de Pagamentos Automáticos com Mercado Pago
- **Integração Mercado Pago**: Processamento seguro de pagamentos brasileiros
- **Múltiplas Formas de Pagamento**: PIX, cartão de crédito/débito, boleto
- **Webhook Automático**: Atualização instantânea de status
- **Notificação WhatsApp**: Cliente recebe confirmação automática
- **Sincronização em Tempo Real**: Painel atualizado automaticamente

### Painel de Controle
- **Monitoramento em Tempo Real**: Status dos clientes atualizados automaticamente
- **Gestão de Status**: Mudanças automáticas baseadas em regras de negócio
- **Relatórios**: Exportação de dados em CSV
- **Filtros Avançados**: Busca por status, nome, telefone ou email

### Bot WhatsApp (N8N)
- **IA Integrada**: Assistente financeiro inteligente
- **Controle de Acesso**: Liberação após cadastro
- **Memória Persistente**: Histórico de conversas
- **Notificações**: Confirmação de pagamentos via Mercado Pago

## 🔄 Fluxo de Pagamento Automático

```
1. Cliente faz cadastro → Status: "Teste Grátis"
2. Cliente efetua pagamento no Mercado Pago (PIX, cartão, boleto)
3. Mercado Pago envia webhook para Supabase Edge Function
4. Edge Function atualiza status para "Pagante" no banco
5. Painel de controle reflete mudança automaticamente
6. Cliente recebe notificação no WhatsApp
```

## 📋 Configuração

### 1. Supabase
- Configure as variáveis de ambiente no `.env`
- Execute as migrações do banco de dados
- Deploy da Edge Function para webhooks do Mercado Pago

### 2. Mercado Pago
- Crie uma conta no [Mercado Pago Developers](https://developers.mercadopago.com)
- Configure webhook endpoint: `https://seu-projeto.supabase.co/functions/v1/mercadopago-webhook`
- Eventos necessários: `payment.created`, `payment.updated`
- Configure produtos e preços no dashboard

### 3. N8N
- Importe o workflow `FINAI_BOT_MERCADOPAGO.json`
- Configure credenciais do WAHA, Google Gemini e Redis
- Configure webhook para notificações de pagamento

### 4. WAHA (WhatsApp)
- Configure instância do WhatsApp
- Configure webhook para receber mensagens

## 🛠️ Tecnologias

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Pagamentos**: Mercado Pago (PIX, cartão, boleto)
- **Bot**: N8N + WAHA + Google Gemini
- **Deploy**: Netlify

## 📊 Regras de Negócio

### Status Automáticos
- **Teste Grátis → Expirado**: Após 3 dias do cadastro
- **Pagamento → Pagante**: Instantâneo via webhook Mercado Pago
- **Pagante → Expirado**: Após 30 dias sem atividade

### Notificações
- Cadastro concluído → Liberação do bot
- Pagamento confirmado → Notificação de ativação
- Status expirado → Link para renovação

## 💳 Formas de Pagamento Aceitas

- **PIX**: Pagamento instantâneo
- **Cartão de Crédito**: Todas as bandeiras
- **Cartão de Débito**: Débito online
- **Boleto Bancário**: Vencimento em 3 dias

## 🔐 Segurança

- Verificação de assinatura nos webhooks Mercado Pago
- RLS (Row Level Security) no Supabase
- Validação de dados em todas as camadas
- Criptografia de dados sensíveis
- Processamento PCI DSS compliant

## 📈 Monitoramento

- Logs de pagamentos em tempo real
- Métricas de conversão no painel
- Alertas de falhas de pagamento
- Relatórios de receita automáticos

## 🇧🇷 Vantagens do Mercado Pago

- **Líder no Brasil**: Maior confiança dos usuários
- **PIX Integrado**: Pagamento instantâneo brasileiro
- **Taxas Competitivas**: Menores custos de transação
- **Suporte Local**: Atendimento em português
- **Compliance**: Totalmente regulamentado no Brasil

## 📱 Variáveis de Ambiente

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Mercado Pago (para Edge Function)
MERCADOPAGO_ACCESS_TOKEN=your_mercadopago_access_token
N8N_PAYMENT_WEBHOOK_URL=your_n8n_webhook_url
```

## 🚀 Deploy

1. **Frontend**: Deploy automático no Netlify
2. **Edge Function**: Deploy automático no Supabase
3. **Webhook**: Configure URL no painel do Mercado Pago
4. **N8N**: Importe e ative o workflow

O sistema está pronto para processar pagamentos brasileiros de forma 100% automática!