# Money Flow - Sistema Completo de Gestão Financeira

![Money Flow](https://img.shields.io/badge/Status-Em%20Desenvolvimento-blue)
![Tecnologias](https://img.shields.io/badge/Tech-Node.js%20%7C%20React%20%7C%20TypeScript-green)

## Sobre o Projeto

O **Money Flow** é uma solução web integrada e moderna para controle financeiro pessoal, desenvolvida para democratizar o acesso à educação financeira e oferecer ferramentas profissionais de forma simples e acessível.

Mais do que um simples aplicativo de gastos, é um assistente financeiro inteligente que combina planejamento, análise e colaboração em uma única plataforma.

## O que Resolvemos

- **Desorganização Financeira**: Controle centralizado de todas as finanças
- **Falta de Planejamento**: Sistema de metas e orçamentos intuitivos
- **Dificuldade de Colaboração**: Compartilhamento seguro de objetivos financeiros
- **Análise Superficial**: Insights profundos sobre hábitos de consumo
- **Falta de Perspectiva**: Simulações de impacto das decisões financeiras

## Funcionalidades Principais

### Gestão Financeira Básica
- ✅ Controle completo de transações (receitas, despesas, transferências)
- ✅ Categorização personalizável com cores e ícones
- ✅ Múltiplas contas bancárias (corrente, poupança, investimentos)
- ✅ Dashboard analítico com gráficos e métricas

### Planejamento Financeiro
- ✅ Metas financeiras com sistema de contribuições
- ✅ Orçamentos mensais por categoria
- ✅ Simulações de cenários "E se?"
- ✅ Alertas e notificações inteligentes

### Colaboração
- ✅ Compartilhamento de objetivos com familiares/amigos
- ✅ Sistema de convites por email
- ✅ Gestão de permissões granulares
- ✅ Acompanhamento de contribuições compartilhadas

## Tecnologias

### Backend
- **Node.js** + Express.js
- **SQLite** com migrações automáticas
- **JWT** para autenticação
- **bcryptjs** para segurança
- **Helmet** + **CORS** para proteção

### Frontend
- **React 18** + **TypeScript**
- **Vite** para build e desenvolvimento
- **Tailwind CSS** para estilização
- **React Hook Form** para formulários
- **Recharts** para visualizações

## Estrutura do Projeto
money-flow/
|  backend/
|  ├── src/
|  │ ├── db/
|  │ │ ├── config/ # Configuração e conexão do banco
|  │ │ ├── database/ # Banco de dados SQLite
|  │ │ ├── migrations/ # Sistema de migrações automáticas
|  │ │ └── models/ # Modelos de dados
|  │ ├── logic/
|  │ │ ├── controllers/ # Lógica de negócio│ │ ├── middlewares/ # Interceptores de requisições
|  │ │ └── routes/ # Definição de rotas
|  │ └── app.js # Classe principal da aplicação
|  ├── .env # Variáveis de ambiente
|  ├── package.json # Dependências e scripts
|  └── server.js # Ponto de entrada
|  frontend/
|  ├── src/
|  │ ├── components/
|  │ │ ├── layout/ # Componentes de layout geral
|  │ │ └── ui/ # Componentes de interface reutilizáveis
|  │ ├── contexts/ # Contexts do React para estado global
|  │ ├── pages/ # Páginas da aplicação
|  │ │ └── auth/ # Páginas de autenticação
|  │ ├── services/ # Serviços de API
|  │ ├── styles/ # Estilos globais e temas
|  │ ├── types/ # Definições TypeScript
|  │ ├── App.tsx # Componente principal
|  │ ├── main.tsx # Ponto de entrada
|  │ └── vite-env.d.ts # Tipos do Vite
|  ├── index.html # HTML base
|  ├── package.json # Dependências e scripts
|  ├── tailwind.config.js # Configuração do Tailwind
|  ├── tsconfig.json # Configuração TypeScript
|  └── vite.config.ts # Configuração do Vite

## 🚀 Como Executar
### Backend
cd backend
npm install
npm run migrate
npm run dev

### Frontend
cd frontend
npm install
npm run dev

## Status do Desenvolvimento
Módulo	          Status	 Cobertura
Autenticação	    ✅	     Completo
Transações	      ✅	     CRUD + Análise
Dashboard	        ✅	     Múltiplas Métricas
Metas Financeiras	✅	     Metas + Contribuições
Colaboração	      ✅	     Compartilhamento Completo
Simulações	      ✅	     Cenários Flexíveis

## 🔮 Roadmap Futuro (SEM GARANTIA DE TEMPO)
Fase 2 - Aprimoramentos:
• Aplicativo Mobile Nativo - React Native para iOS/Android
• Integração com Bancos - Open Banking via APIs regulamentadas
• Relatórios Avançados - PDF customizável e compartilhável
• Sistema de Alertas - Notificações push personalizadas
Fase 3 - Expansão:
• Assistente IA - Análise preditiva e recomendações inteligentes
• Internacionalização - Suporte a múltiplas moedas e idiomas
• Sync em Tempo Real - WebSockets para colaboração instantânea
• Módulo de Investimentos - Acompanhamento de carteira
Fase 4 - Ecossistema:
• API Pública - Desenvolvedores criam integrações
• Versão Business - Para pequenas empresas
• Programa de Educação - Conteúdo financeiro integrado
• Parcerias Estratégicas - Instituições financeiras e educacionais
