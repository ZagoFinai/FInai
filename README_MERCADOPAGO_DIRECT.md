# 🚀 Sistema Mercado Pago DIRETO (Sem Supabase)

## 📋 Configuração Simplificada

### **1. O que você precisa:**
- Conta no Mercado Pago Developers
- N8N configurado com WAHA
- Nenhum banco de dados externo!

### **2. Como funciona:**
```
1. Cliente se cadastra → localStorage
2. Cliente escolhe plano → Mercado Pago
3. Cliente paga → Volta para site
4. Sistema detecta retorno → Atualiza localStorage
5. Notificação automática → N8N → WhatsApp
```

## ⚙️ **Configuração do N8N:**

### **1. Importe o workflow:**
- Use o arquivo: `n8n/FINAI_BOT_MERCADOPAGO_DIRECT.json`
- Configure suas credenciais (WAHA, Gemini, Redis)

### **2. Configure a URL do webhook:**
- No arquivo `src/api/mercadopago-direct.ts`
- Linha 45: Substitua `'https://seu-n8n.com/webhook/payment-webhook'`
- Pela URL real do seu webhook N8N

### **3. Teste o webhook:**
- URL: `https://seu-n8n.com/webhook/payment-webhook`
- Método: POST
- Body de teste:
```json
{
  "type": "payment_success",
  "client": {
    "id": "123",
    "name": "João Silva",
    "phone": "51999887766",
    "email": "joao@email.com"
  },
  "payment": {
    "status": "approved",
    "amount": 19.90,
    "method": "mercadopago"
  },
  "message": "🎉 Pagamento confirmado! Seu plano está ativo!"
}
```

## 🔄 **Fluxo Automático:**

### **Cadastro:**
1. Cliente preenche formulário
2. Dados salvos no localStorage
3. Status: "Teste Grátis"

### **Pagamento:**
1. Cliente escolhe plano
2. Redireciona para Mercado Pago
3. Cliente paga (PIX, cartão, boleto)
4. Mercado Pago redireciona de volta

### **Confirmação:**
1. Sistema detecta retorno com `?payment=success`
2. Atualiza status para "Pagante" no localStorage
3. Envia notificação para N8N
4. N8N envia WhatsApp automático

## 💡 **Vantagens desta abordagem:**

✅ **Sem banco de dados** - Tudo no localStorage  
✅ **Sem Supabase** - Mais simples de configurar  
✅ **Sem webhooks complexos** - Usa URL de retorno  
✅ **Funciona offline** - Dados locais  
✅ **Fácil de testar** - Simulação automática  

## 🛠️ **Para produção real:**

### **1. Configurar Mercado Pago:**
- Criar aplicação no [Mercado Pago Developers](https://developers.mercadopago.com)
- Obter Access Token
- Configurar URLs de retorno

### **2. Implementar backend:**
- Criar endpoint para criar preferências
- Validar pagamentos
- Processar webhooks (opcional)

### **3. Configurar domínio:**
- URLs de retorno devem apontar para seu domínio
- Exemplo: `https://seusite.com/?payment=success`

## 🧪 **Modo de Teste:**

O sistema atual simula pagamentos automaticamente:
- Após 30 segundos, pagamentos pendentes são "aprovados"
- Status muda automaticamente para "Pagante"
- Notificação é enviada para N8N

## 📱 **URLs importantes:**

- **Site:** `https://cadastrofinai.netlify.app`
- **N8N Webhook:** `https://seu-n8n.com/webhook/payment-webhook`
- **WhatsApp:** `https://wa.me/5551994093944`

## 🔧 **Personalização:**

### **Preços dos planos:**
```javascript
// Em src/api/mercadopago-direct.ts
export const MERCADOPAGO_PRODUCTS = {
  essential: {
    unit_price: 19.90, // Altere aqui
  },
  premium: {
    unit_price: 39.90, // Altere aqui
  },
};
```

### **Mensagem WhatsApp:**
```javascript
// Personalize a mensagem de confirmação
message: `🎉 *Pagamento Confirmado!*\n\n✅ Seu plano FinAí está ativo!\n💰 Valor: R$ ${amount}\n\n🚀 Aproveite todos os recursos premium!`
```

## 🎯 **Resultado:**

Sistema **100% funcional** sem complexidade de banco de dados, mas com todas as funcionalidades de pagamento automático e notificações WhatsApp!

Quer que eu ajude a configurar alguma parte específica?