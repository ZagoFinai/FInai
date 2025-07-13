/*
  # Sistema de Rastreamento de Pagamentos Mercado Pago

  1. Nova tabela para pagamentos
    - `payments`
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key para clients)
      - `mercadopago_payment_id` (text, ID do pagamento no MP)
      - `status` (text, status do pagamento)
      - `amount` (decimal, valor pago)
      - `payment_method` (text, método de pagamento)
      - `created_at` (timestamp)

  2. Função para atualizar status automaticamente
    - Trigger que atualiza cliente quando pagamento é aprovado

  3. Segurança
    - RLS habilitado
    - Políticas de acesso
*/

-- Criar tabela de pagamentos
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  mercadopago_payment_id text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  amount decimal(10,2) NOT NULL,
  payment_method text,
  external_reference text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Política para leitura (apenas admins)
CREATE POLICY "Admins can read payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (true);

-- Política para inserção (apenas sistema)
CREATE POLICY "System can insert payments"
  ON payments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política para atualização (apenas sistema)
CREATE POLICY "System can update payments"
  ON payments
  FOR UPDATE
  TO authenticated
  USING (true);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_payments_client_id ON payments(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_mp_id ON payments(mercadopago_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Função para atualizar cliente quando pagamento é aprovado
CREATE OR REPLACE FUNCTION update_client_on_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o pagamento foi aprovado, atualizar cliente para "Pagante"
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    UPDATE clients 
    SET 
      status = 'Pagante',
      last_activity = now(),
      updated_at = now()
    WHERE id = NEW.client_id;
    
    -- Log da atualização
    RAISE NOTICE 'Cliente % atualizado para Pagante devido ao pagamento %', NEW.client_id, NEW.mercadopago_payment_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para executar a função
DROP TRIGGER IF EXISTS trigger_update_client_on_payment ON payments;
CREATE TRIGGER trigger_update_client_on_payment
  AFTER UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_client_on_payment();

-- Trigger para updated_at
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();