# 🔧 Configuração Completa - Mercado Pago + Painel

## 📋 O que você precisa para integrar tudo:

### 1. **Conta Mercado Pago Developers**
```
1. Acesse: https://developers.mercadopago.com
2. Faça login com sua conta Mercado Pago
3. Crie uma aplicação
4. Anote as credenciais:
   - Access Token (Produção)
   - Access Token (Sandbox para testes)
   - Webhook Secret (opcional, mas recomendado)
```

### 2. **Configurar Variáveis de Ambiente no Supabase**
```env
# No painel do Supabase > Settings > Edge Functions > Environment Variables
MERCADOPAGO_ACCESS_TOKEN=seu_access_token_aqui
MERCADOPAGO_WEBHOOK_SECRET=seu_webhook_secret_aqui
N8N_PAYMENT_WEBHOOK_URL=https://seu-n8n.com/webhook/payment-webhook
```

### 3. **Executar Migração do Banco**
```sql
-- Execute no SQL Editor do Supabase:
-- Copie e cole o conteúdo do arquivo: supabase/migrations/add_payment_tracking.sql
```

### 4. **Deploy da Edge Function**
```bash
# No terminal do seu projeto:
supabase functions deploy mercadopago-webhook
```

### 5. **Configurar Webhook no Mercado Pago**
```
1. Acesse: https://www.mercadopago.com.br/developers/panel/webhooks
2. Clique em "Criar webhook"
3. URL: https://seu-projeto.supabase.co/functions/v1/mercadopago-webhook
4. Eventos: payment.created, payment.updated
5. Salvar
```

### 6. **Configurar N8N**
```
1. Importe o arquivo: n8n/FINAI_BOT_MERCADOPAGO.json
2. Configure as credenciais:
   - WAHA (WhatsApp)
   - Google Gemini
   - Redis
3. Ative o workflow
4. Anote a URL do webhook de pagamentos
```

### 7. **Conectar Supabase no Painel**
```
1. Clique em "Connect to Supabase" no canto superior direito
2. Configure as variáveis no .env:
   VITE_SUPABASE_URL=sua_url_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

## 🔄 Fluxo Completo de Funcionamento:

```
1. Cliente se cadastra no site
   ↓
2. Cliente escolhe plano e paga no Mercado Pago
   ↓
3. Mercado Pago confirma pagamento
   ↓
4. Webhook é enviado para Supabase Edge Function
   ↓
5. Edge Function atualiza status do cliente para "Pagante"
   ↓
6. Edge Function envia notificação para N8N
   ↓
7. N8N envia mensagem WhatsApp para o cliente
   ↓
8. Painel de controle mostra status atualizado automaticamente
```

## ✅ Como Testar:

### Teste com Sandbox (Recomendado):
```
1. Use Access Token de Sandbox
2. Use cartões de teste do Mercado Pago:
   - Visa: 4509 9535 6623 3704
   - Mastercard: 5031 7557 3453 0604
3. CVV: qualquer 3 dígitos
4. Vencimento: qualquer data futura
```

### Verificar se está funcionando:
```
1. Faça um cadastro de teste
2. Escolha um plano e "pague"
3. Verifique no painel se o status mudou para "Pagante"
4. Verifique se chegou mensagem no WhatsApp
5. Verifique logs no Supabase Edge Functions
```

## 🛠️ Troubleshooting:

### Se o status não atualizar:
```
1. Verifique logs da Edge Function no Supabase
2. Confirme se o webhook está configurado corretamente
3. Teste manualmente a Edge Function
4. Verifique se as variáveis de ambiente estão corretas
```

### Se a notificação WhatsApp não chegar:
```
1. Verifique se o N8N está rodando
2. Confirme se a URL do webhook N8N está correta
3. Teste o webhook N8N manualmente
4. Verifique credenciais do WAHA
```

## 📞 Suporte:

Se precisar de ajuda com algum passo específico, me informe qual parte está com problema que eu te ajudo a resolver!

## 🔐 Segurança:

- ✅ Validação de assinatura do Mercado Pago
- ✅ RLS (Row Level Security) no Supabase
- ✅ Variáveis de ambiente protegidas
- ✅ Logs de auditoria completos
- ✅ Fallback para localStorage se Supabase falhar

O sistema está pronto para produção! 🚀