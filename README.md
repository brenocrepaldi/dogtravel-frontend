# DogTravel — Frontend

Interface web da plataforma DogTravel, construída com Next.js 16 e App Router. Conecta donos de cães a passeadores profissionais com rastreamento em tempo real, chat, pagamentos e gerenciamento completo de perfil para ambos os papéis.

---

## Stack de tecnologias

| Categoria | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Linguagem | TypeScript 5 |
| UI / Estilo | Tailwind CSS v4, shadcn/ui, Radix UI |
| State management — servidor | TanStack React Query v5 |
| State management — cliente | Zustand v5 |
| Autenticação | NextAuth.js v5 (Auth.js), JWT com refresh token rotation |
| Formulários & validação | React Hook Form v7, Zod v4 |
| Requisições HTTP | Axios com interceptors de autenticação |
| Mapas & rastreamento | Mapbox GL v3, react-map-gl v8 |
| WebSocket | Socket.io Client v4 |
| Datas | date-fns v4 |
| Upload de arquivos | react-dropzone |
| Notificações | Sonner |
| Ícones | Lucide React |
| Utilitários CSS | clsx, tailwind-merge, class-variance-authority |
| Internacionalização de telefone | react-phone-number-input |

---

## Estrutura do projeto

```
src/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Rotas públicas: login, registro, recuperação de senha
│   ├── api/auth/               # Handler NextAuth (JWT callbacks, refresh)
│   ├── dashboard/              # Dashboard contextual por role (_client / _walker)
│   ├── dogs/                   # Gerenciamento de cães do cliente
│   ├── walkers/                # Exploração e perfis públicos de passeadores
│   ├── walks/
│   │   ├── new/                # Formulário de solicitação de passeio (multi-step)
│   │   └── [id]/
│   │       ├── tracking/       # Mapa ao vivo (walker: GPS broadcast / cliente: visualização)
│   │       └── chat/           # Chat do passeio
│   ├── profile/                # Configurações de conta
│   │   ├── details/            # Nome, e-mail, telefone, foto
│   │   ├── documents/          # Upload de documentos (walker)
│   │   ├── walker-profile/     # Bio, tags, tamanhos atendidos (walker)
│   │   ├── bank-account/       # Dados bancários para repasse (walker)
│   │   └── payment-methods/    # Cartões e PIX (cliente)
│   ├── payments/               # Histórico de pagamentos
│   └── clients/[id]/           # Perfil público do cliente (acessível por walkers)
│
├── components/
│   ├── ui/                     # Componentes shadcn/ui (Button, Input, Dialog, etc.)
│   └── common/                 # Sidebar, PageHeader, EmptyState, Providers
│
├── features/                   # Módulos de domínio (api + hooks por feature)
│   ├── auth/
│   ├── walks/
│   ├── walkers/
│   ├── dogs/
│   ├── payments/
│   ├── tracking/
│   ├── reviews/
│   └── stats/
│
├── services/
│   └── api.ts                  # Instância Axios com interceptors de auth e 401
│
├── lib/
│   ├── auth.ts                 # Configuração NextAuth: authorize, JWT callback, refresh lock
│   └── utils.ts
│
├── types/
│   ├── index.ts                # DTOs e interfaces globais
│   └── next-auth.d.ts          # Augmentação de tipos NextAuth (Session, JWT, User)
│
└── proxy.ts                    # Proteção de rotas por autenticação e role (Edge; renomeado de middleware.ts na convenção do Next.js 16)
```

---

## Funcionalidades

### Autenticação & sessão
- Registro com validação de CPF (algoritmo matemático), e-mail, telefone E.164
- Login com credentials (e-mail + senha), sessão JWT com cookie httpOnly
- Refresh automático de access token (15 min) com lock por usuário para evitar race conditions
- Refresh token com rotação a cada renovação, expiração em 7 dias
- Recuperação de senha via e-mail com token de tempo limitado
- Redirecionamento pós-login baseado em role

### Dashboards por role
- **Cliente:** resumo de passeios recentes, cães cadastrados, próximos agendamentos
- **Walker:** passeios pendentes de aceitação, ganhos do dia e do mês, avaliação média, agendamentos futuros

### Solicitação de passeio (multi-step)
- Seleção de cães, data e horário, duração, endereço e localização GPS
- Estimativa de preço em tempo real com breakdown (taxa base, taxa por cão extra, desconto primeira corrida)
- Seleção opcional de passeador pré-definido com verificação de disponibilidade no slot escolhido
- Seleção de forma de pagamento (cartão cadastrado ou PIX instantâneo)

### Rastreamento em tempo real
- **Walker:** transmissão contínua de GPS via `watchPosition`, countdown do tempo contratado, barra de progresso, botão de conclusão com validação de proximidade geográfica (raio 300m)
- **Cliente:** mapa com posição ao vivo do passeador, mesma barra de progresso, countdown sincronizado
- Marker animado com foto do cão, fallback para emoji
- Overlay quando localização ainda não está disponível

### Chat
- Interface de mensagens por passeio com polling HTTP como fallback
- WebSocket via Socket.io (namespace `/chat`) para mensagens em tempo real

### Gerenciamento de cães (cliente)
- Cadastro com nome, raça, idade, tamanho, gênero, foto e observações
- Upload de foto com preview, edição e exclusão

### Exploração de passeadores
- Listagem com filtro por nome e por tamanho de cão suportado
- Perfil público: bio, avaliação, número de passeios, tags, certifications verificadas, trust badges
- Disponibilidade por slot antes de confirmar solicitação

### Avaliações
- Avaliação com estrelas (1–5) e comentário após conclusão do passeio
- Exibida no perfil do passeador e no histórico do cliente

### Pagamentos
- Cadastro de cartão de crédito/débito (brand detectada: Visa, Mastercard, Elo, Amex, Hipercard) e PIX
- Definição de método padrão, remoção
- Histórico de cobranças com status e descrição

### Perfil do passeador
- Bio, localização, área de atuação, disponibilidade textual, tags de serviço
- Tamanhos de cão suportados, expertise comportamental
- Dados bancários para repasse (banco, agência, conta, CPF titular, chave PIX)
- Upload de documentos: RG/CNH + selfie, certidão de antecedentes, certificados profissionais

### Proteção de rotas (middleware Edge)
- Usuários não autenticados → redirecionados para `/login`
- Usuários autenticados em páginas de auth → redirecionados para `/dashboard`
- Rotas exclusivas de cliente protegidas contra walkers e vice-versa

---

## Configuração

### Pré-requisitos
- Node.js ≥ 20
- Backend DogTravel rodando (ver `../backend/README.md`)

### Instalação

```bash
npm install
```

### Variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# URL pública do backend REST
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# URL da aplicação (usada em redirects e Open Graph)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# URL base para NextAuth (obrigatório em produção)
NEXTAUTH_URL=http://localhost:3000

# Segredo para assinar os cookies de sessão JWT
# Gerar com: openssl rand -base64 32
NEXTAUTH_SECRET=seu-segredo-aqui

# URL do servidor WebSocket
NEXT_PUBLIC_WS_URL=ws://localhost:3001

# URL pública do armazenamento de mídia (MinIO) — deve coincidir com
# MINIO_PUBLIC_URL do backend. Usada para liberar o host em next/image.
NEXT_PUBLIC_MEDIA_URL=http://localhost:9000

# Token de acesso público do Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...
```

---

## Scripts

```bash
npm run dev      # Servidor de desenvolvimento (Turbopack)
npm run build    # Build de produção otimizado
npm run start    # Servidor de produção
npm run lint     # ESLint
```

O servidor de desenvolvimento inicia em [http://localhost:3000](http://localhost:3000).
A documentação Swagger do backend está em [http://localhost:3001/api/docs](http://localhost:3001/api/docs).

---

## Padrões de arquitetura

### Server state vs. UI state
- **TanStack React Query** gerencia todo estado do servidor: cache, revalidação, paginação, mutations com `onError`/`onSuccess`
- **Zustand** utilizado exclusivamente para estado de UI volátil (ex.: rastreamento ao vivo, estado do mapa)

### Fluxo de autenticação
1. Login envia credenciais para `POST /auth/login` via `fetch` nativo (não axios)
2. NextAuth armazena `accessToken`, `refreshToken` e `expiresAt` no cookie JWT httpOnly
3. O callback `jwt()` verifica a expiração com buffer de 60s e executa refresh antes do vencimento
4. Um lock por usuário (`Map<userId, Promise>`) evita rotação dupla do refresh token em requisições concorrentes
5. O interceptor Axios lê a sessão a cada request e detecta `RefreshAccessTokenError` para redirecionar ao login

### Organização por feature
Cada domínio em `src/features/` exporta apenas `api/` (chamadas HTTP) e `hooks/` (React Query wrappers). Componentes de página importam apenas hooks — nunca fazem chamadas HTTP diretamente.
