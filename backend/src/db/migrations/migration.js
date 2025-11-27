// AQUI HÁ A DEFINIR A ESTRUTURA COMPLETA DO BANCO DE DADOS MONEY FLOW
// CLASSE PRINCIPAL DE MIGRAÇÕES, A CLASSE É O NOSSO SISTEMA CONSTRUTOR DO BANCO DE DADOS, RESPONSÁVEL POR CRIAR E VERIFICAR A ESTRUTURA DE TABELAS DO BANCO MONEY FLOW.
class Migration {
    // Instanciando da classe Migration, em nosso construtor irá ser definido um array que contenha todas as tabelas e campos necessários no banco de dados Money Flow, tabelas essas com nomes amigáveis e comandos SQL.
    constructor() {
        this.tables = [
            {
                name: 'usuarios',
                sql: `
                    CREATE TABLE IF NOT EXISTS usuarios (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        nome TEXT NOT NULL,
                        email TEXT UNIQUE NOT NULL,
                        senha_hash TEXT NOT NULL,
                        data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
                        ultimo_acesso DATETIME,
                        ativo INTEGER DEFAULT 1
                    )
                `
            },
            {
                name: 'categorias',
                sql: `
                    CREATE TABLE IF NOT EXISTS categorias (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        nome TEXT NOT NULL,
                        tipo TEXT CHECK(tipo IN ('receita', 'despesa')) NOT NULL,
                        cor TEXT DEFAULT '#007bff',
                        icone TEXT DEFAULT 'receipt',
                        usuario_id INTEGER,
                        data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
                        ativo INTEGER DEFAULT 1,
                        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
                    )
                `
            },
            {
                name: 'contas',
                sql: `
                    CREATE TABLE IF NOT EXISTS contas (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        nome TEXT NOT NULL,
                        saldo_inicial DECIMAL(10,2) DEFAULT 0,
                        tipo TEXT CHECK(tipo IN ('conta_corrente', 'poupanca', 'carteira', 'investimento', 'cartao')) NOT NULL,
                        usuario_id INTEGER NOT NULL,
                        ativa INTEGER DEFAULT 1,
                        cor TEXT DEFAULT '#28a745',
                        data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
                    )
                `
            },
            {
                name: 'transacoes',
                sql: `
                    CREATE TABLE IF NOT EXISTS transacoes (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        descricao TEXT NOT NULL,
                        valor DECIMAL(10,2) NOT NULL,
                        tipo TEXT CHECK(tipo IN ('receita', 'despesa')) NOT NULL,
                        data_transacao DATE NOT NULL,
                        data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
                        categoria_id INTEGER NOT NULL,
                        usuario_id INTEGER NOT NULL,
                        conta_id INTEGER NOT NULL,
                        observacoes TEXT,
                        recorrente INTEGER DEFAULT 0,
                        pago INTEGER DEFAULT 1,
                        ativo INTEGER DEFAULT 1,
                        FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE RESTRICT,
                        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
                        FOREIGN KEY (conta_id) REFERENCES contas(id) ON DELETE RESTRICT
                    )
                `
            },
            {
                name: 'orcamentos',
                sql: `
                    CREATE TABLE IF NOT EXISTS orcamentos (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        categoria_id INTEGER NOT NULL,
                        usuario_id INTEGER NOT NULL,
                        valor_limite DECIMAL(10,2) NOT NULL,
                        mes_ano DATE NOT NULL,
                        data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
                        ativo INTEGER DEFAULT 1,
                        FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE,
                        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
                        UNIQUE(categoria_id, usuario_id, mes_ano)
                    )
                `
            },
            {
                name: 'objetivos',
                sql: `
                    CREATE TABLE IF NOT EXISTS objetivos (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        usuario_id INTEGER NOT NULL,
                        nome TEXT NOT NULL,
                        descricao TEXT,
                        valor_total DECIMAL(10,2) NOT NULL,
                        valor_atual DECIMAL(10,2) DEFAULT 0,
                        data_conclusao DATE NOT NULL,
                        cor TEXT DEFAULT '#007bff',
                        icone TEXT DEFAULT 'target',
                        tipo TEXT CHECK(tipo IN ('fundo_emergencia', 'carro', 'casa', 'viagem', 'reforma', 'dividas', 'personalizado')),
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        ativo INTEGER DEFAULT 1,
                        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
                    )
                `
            },
            {
                name: 'objetivos_compartilhados',
                sql: `
                    CREATE TABLE IF NOT EXISTS objetivos_compartilhados (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        objetivo_id INTEGER NOT NULL,
                        usuario_dono_id INTEGER NOT NULL,
                        usuario_compartilhado_id INTEGER NOT NULL,
                        permissao TEXT CHECK(permissao IN ('leitura', 'escrita')) DEFAULT 'leitura',
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        ativo INTEGER DEFAULT 1,
                        FOREIGN KEY (objetivo_id) REFERENCES objetivos(id) ON DELETE CASCADE,
                        FOREIGN KEY (usuario_dono_id) REFERENCES usuarios(id) ON DELETE CASCADE,
                        FOREIGN KEY (usuario_compartilhado_id) REFERENCES usuarios(id) ON DELETE CASCADE
                    )
                `
            },
            {
                name: 'convites_colaboracao',
                sql: `
                    CREATE TABLE IF NOT EXISTS convites_colaboracao (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        usuario_remetente_id INTEGER NOT NULL,
                        usuario_destinatario_email TEXT NOT NULL,
                        token TEXT UNIQUE NOT NULL,
                        expira_em DATETIME NOT NULL,
                        status TEXT CHECK(status IN ('pendente', 'aceito', 'recusado')) DEFAULT 'pendente',
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        ativo INTEGER DEFAULT 1,
                        FOREIGN KEY (usuario_remetente_id) REFERENCES usuarios(id) ON DELETE CASCADE
                    )
                `
            },
            {
                name: 'simulacoes',
                sql: `
                    CREATE TABLE IF NOT EXISTS simulacoes (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        usuario_id INTEGER NOT NULL,
                        nome TEXT NOT NULL,
                        descricao TEXT,
                        scenario_data TEXT NOT NULL,
                        resultado TEXT NOT NULL,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        ativo INTEGER DEFAULT 1,
                        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
                    )
                `
            }
        ];
    }

    // Função facilitar a obtenção dos nomes e campos das tabelas SQL.
    getTablesSQLs() {
        return this.tables.map(table => ({
            name: table.name,
            sql: table.sql
        }));
    }

    // Função para facilitar a obtenção dos nomes das tabelas SQL.
    getTableNames() {
        return this.tables.map(table => table.name);
    }
}

// Exportando a classe Migration para uso externo.
module.exports = Migration;