/*
  # Criar tabela de clientes do FinAí

  1. Nova Tabela
    - `clients`
      - `id` (uuid, primary key)
      - `name` (text, nome completo do cliente)
      - `phone` (text, telefone com DDD)
      - `email` (text, email do cliente)
      - `status` (text, status do cliente: 'Teste Grátis', 'Pagante', 'Expirado')
      - `registration_date` (timestamp, data de cadastro)
      - `last_activity` (timestamp, última atividade)
      - `created_at` (timestamp, criado automaticamente)
      - `updated_at` (timestamp, atualizado automaticamente)

  2. Segurança
    - Habilitar RLS na tabela `clients`
    - Adicionar política para permitir leitura e escrita pública (para o sistema de cadastro)
*/

CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  status text NOT NULL DEFAULT 'Teste Grátis',
  registration_date timestamptz DEFAULT now(),
  last_activity timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Política para permitir acesso público (necessário para o sistema de cadastro)
CREATE POLICY "Permitir acesso público aos clientes"
  ON clients
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_registration_date ON clients(registration_date);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Inserir dados de exemplo
INSERT INTO clients (name, phone, email, status, registration_date, last_activity) VALUES
  ('Maria Silva Santos', '51999887766', 'maria.silva@email.com', 'Pagante', '2024-12-15 10:00:00', '2024-12-22 15:30:00'),
  ('João Carlos Oliveira', '51988776655', 'joao.carlos@email.com', 'Teste Grátis', '2024-12-20 14:20:00', '2024-12-23 09:15:00'),
  ('Ana Paula Costa', '51977665544', 'ana.paula@email.com', 'Expirado', '2024-12-10 08:45:00', '2024-12-18 16:20:00'),
  ('Carlos Eduardo Mendes', '51966554433', 'carlos.mendes@email.com', 'Pagante', '2024-12-08 11:30:00', '2024-12-23 12:45:00'),
  ('Fernanda Lima', '51955443322', 'fernanda.lima@email.com', 'Teste Grátis', '2024-12-22 16:10:00', '2024-12-23 18:00:00');