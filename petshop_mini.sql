-- ============================================================
--  BANCO DE DADOS: PET SHOP (versão reduzida)
-- ============================================================

CREATE DATABASE IF NOT EXISTS petshop;
USE petshop;

-- ============================================================
--  TABELAS (5)
-- ============================================================

CREATE TABLE clientes (
    id       INT AUTO_INCREMENT PRIMARY KEY,
    nome     VARCHAR(100) NOT NULL,
    telefone VARCHAR(15)
);

CREATE TABLE animais (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    nome       VARCHAR(60)  NOT NULL,
    especie    VARCHAR(40)  NOT NULL,
    id_cliente INT NOT NULL,
    FOREIGN KEY (id_cliente) REFERENCES clientes(id)
);

CREATE TABLE veterinarios (
    id    INT AUTO_INCREMENT PRIMARY KEY,
    nome  VARCHAR(100) NOT NULL,
    crmv  VARCHAR(20)  NOT NULL UNIQUE
);

CREATE TABLE servicos (
    id    INT AUTO_INCREMENT PRIMARY KEY,
    nome  VARCHAR(80)  NOT NULL,
    preco DECIMAL(10,2) NOT NULL
);

CREATE TABLE agendamentos (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    id_animal    INT NOT NULL,
    id_servico   INT NOT NULL,
    id_veterinario INT,
    data_hora    DATETIME NOT NULL,
    status       VARCHAR(20) DEFAULT 'agendado',
    FOREIGN KEY (id_animal)     REFERENCES animais(id),
    FOREIGN KEY (id_servico)    REFERENCES servicos(id),
    FOREIGN KEY (id_veterinario) REFERENCES veterinarios(id)
);

-- ============================================================
--  DADOS
-- ============================================================

INSERT INTO clientes (nome, telefone) VALUES
('Ana Souza',     '(11)91111-0001'),
('Bruno Lima',    '(11)91111-0002'),
('Carla Mendes',  '(11)91111-0003'),
('Daniel Rocha',  '(11)91111-0004'),
('Elisa Torres',  '(11)91111-0005'),
('Felipe Alves',  '(11)91111-0006'),
('Gabriela Costa','(11)91111-0007'),
('Henrique Melo', '(11)91111-0008'),
('Isabela Reis',  '(11)91111-0009'),
('João Pedro',    '(11)91111-0010');

INSERT INTO animais (nome, especie, id_cliente) VALUES
('Rex',    'Cão',   1),
('Luna',   'Gato',  1),
('Bolt',   'Cão',   2),
('Mia',    'Gato',  3),
('Thor',   'Cão',   4),
('Nala',   'Gato',  5),
('Max',    'Cão',   6),
('Mel',    'Cão',   7),
('Simba',  'Gato',  8),
('Pipoca', 'Cão',   9),
('Blue',   'Cão',   10),
('Minnie', 'Gato',  10);

INSERT INTO veterinarios (nome, crmv) VALUES
('Dr. Ricardo Alves',  'SP-12345'),
('Dra. Fernanda Lima', 'SP-12346'),
('Dr. Marcos Gomes',   'SP-12347');

INSERT INTO servicos (nome, preco) VALUES
('Banho Pequeno Porte',  60.00),
('Banho Médio Porte',    90.00),
('Tosa Completa',        80.00),
('Consulta Veterinária',150.00),
('Vacinação',            80.00);

INSERT INTO agendamentos (id_animal, id_servico, id_veterinario, data_hora, status) VALUES
(1,  2, NULL, '2024-01-08 08:00', 'concluido'),
(2,  1, NULL, '2024-01-09 09:00', 'concluido'),
(3,  2, NULL, '2024-01-10 08:00', 'concluido'),
(4,  1, NULL, '2024-01-11 10:00', 'concluido'),
(5,  3, NULL, '2024-01-12 09:00', 'concluido'),
(6,  1, NULL, '2024-01-15 10:00', 'concluido'),
(7,  3, NULL, '2024-01-16 11:00', 'concluido'),
(8,  2, NULL, '2024-01-17 14:00', 'concluido'),
(9,  1, NULL, '2024-01-18 08:00', 'concluido'),
(10, 2, NULL, '2024-01-19 09:00', 'concluido'),
(1,  4, 1,    '2024-02-01 09:00', 'concluido'),
(2,  4, 2,    '2024-02-02 10:00', 'concluido'),
(3,  4, 1,    '2024-02-03 11:00', 'concluido'),
(5,  4, 3,    '2024-02-04 14:00', 'concluido'),
(7,  5, 1,    '2024-02-05 09:00', 'concluido'),
(9,  5, 2,    '2024-02-06 10:00', 'concluido'),
(11, 2, NULL, '2024-03-01 08:00', 'concluido'),
(12, 1, NULL, '2024-03-02 09:00', 'concluido'),
(4,  3, NULL, '2024-03-03 10:00', 'concluido'),
(6,  4, 3,    '2024-03-04 11:00', 'concluido'),
(8,  3, NULL, '2024-03-05 14:00', 'concluido'),
(10, 4, 1,    '2024-03-06 09:00', 'concluido'),
(1,  3, NULL, '2024-03-07 10:00', 'concluido'),
(3,  5, 2,    '2024-03-08 11:00', 'concluido'),
(5,  2, NULL, '2024-04-01 08:00', 'agendado'),
(7,  1, NULL, '2024-04-02 09:00', 'agendado'),
(2,  3, NULL, '2024-04-03 10:00', 'cancelado'),
(4,  4, 1,    '2024-04-04 11:00', 'agendado'),
(6,  5, 3,    '2024-04-05 14:00', 'agendado'),
(11, 4, 2,    '2024-04-06 09:00', 'agendado');

-- ============================================================
--  CONSULTAS SQL
-- ============================================================

-- 1. Todos os animais com o nome do dono
SELECT a.nome AS pet, a.especie, c.nome AS dono
FROM animais a
JOIN clientes c ON a.id_cliente = c.id;

-- 2. Agendamentos concluídos com serviço e valor
SELECT c.nome AS dono, a.nome AS pet, s.nome AS servico,
       ag.data_hora, s.preco
FROM agendamentos ag
JOIN animais  a ON ag.id_animal  = a.id
JOIN clientes c ON a.id_cliente  = c.id
JOIN servicos s ON ag.id_servico = s.id
WHERE ag.status = 'concluido';

-- 3. Agendamentos entre janeiro e fevereiro de 2024
SELECT a.nome AS pet, s.nome AS servico, ag.data_hora
FROM agendamentos ag
JOIN animais  a ON ag.id_animal  = a.id
JOIN servicos s ON ag.id_servico = s.id
WHERE ag.data_hora BETWEEN '2024-01-01' AND '2024-02-28';

-- 4. Quantidade de atendimentos por serviço
SELECT s.nome, COUNT(*) AS total, SUM(s.preco) AS receita
FROM agendamentos ag
JOIN servicos s ON ag.id_servico = s.id
WHERE ag.status = 'concluido'
GROUP BY s.nome
ORDER BY receita DESC;

-- 5. Veterinário com mais consultas
SELECT v.nome, COUNT(*) AS consultas
FROM agendamentos ag
JOIN veterinarios v ON ag.id_veterinario = v.id
WHERE ag.status = 'concluido'
GROUP BY v.nome
ORDER BY consultas DESC;

-- 6. Média de preço dos serviços
SELECT AVG(preco) AS preco_medio FROM servicos;

-- 7. Clientes com animais cadastrados
SELECT c.nome AS cliente, COUNT(a.id) AS qtd_pets
FROM clientes c
LEFT JOIN animais a ON c.id = a.id_cliente
GROUP BY c.nome
ORDER BY qtd_pets DESC;
