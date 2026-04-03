# Predictus — Frontend de Cadastro

Interface web do fluxo de cadastro multi-step, desenvolvida como teste técnico para a Predictus.

## Stack

- **Next.js 16** (App Router) · **TypeScript**
- **React Hook Form** + **Zod** (formulários e validação)
- **TanStack Query v5** (estado do servidor)
- **shadcn/ui** · **Tailwind CSS** (componentes e estilos)
- **IMask** (máscaras de input)

---

## Rodando com Docker (recomendado)

> Este projeto depende do backend para funcionar. Antes de iniciar o frontend, suba os containers da API.

**1. Suba a API primeiro**

Clone e inicie o backend: https://github.com/matheus-calixto-silva/multi-step-backend

Siga os passos do README do repositório acima para build e execução dos containers. A API ficará disponível em `http://localhost:3001`.

**2. Suba o frontend**

```bash
docker-compose up --build
```

O frontend estará disponível em **http://localhost:3000**.

---

## Rodando localmente

```bash
# 1. Instalar dependências
pnpm install

# 2. Configurar variável de ambiente
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local

# 3. Garantir que o backend está rodando (porta 3001)

# 4. Iniciar em modo de desenvolvimento
pnpm dev
```

Acesse **http://localhost:3000/register** para iniciar o fluxo.

---

## Variáveis de ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `NEXT_PUBLIC_API_URL` | URL base da API backend | `http://localhost:3001` |

---

## Estrutura do projeto

```
src/
├── app/
│   ├── layout.tsx              # Fontes, QueryProvider, Toaster global
│   ├── page.tsx                # Redireciona para /register
│   └── register/
│       ├── page.tsx            # Suspense boundary
│       └── register-flow.tsx   # Orquestrador do fluxo multi-step
├── components/
│   ├── form-input.tsx          # Input integrado com React Hook Form
│   ├── masked-form-input.tsx   # Input com máscara (IMask + RHF)
│   ├── submit-button.tsx       # Botão com estado de loading
│   ├── step-layout.tsx         # Wrapper de step: indicador + título + back
│   ├── step-indicator.tsx      # Barra de progresso (5 etapas)
│   ├── ui/                     # Componentes shadcn/ui
│   └── steps/
│       ├── identification-step.tsx   # Step 1: Nome + E-mail
│       ├── mfa-verification-step.tsx # Verificação do código MFA
│       ├── document-step.tsx         # Step 2: CPF ou CNPJ
│       ├── contact-step.tsx          # Step 3: Telefone celular
│       ├── address-step.tsx          # Step 4: CEP + endereço completo
│       ├── review-step.tsx           # Step 5: Revisão com botões "Editar"
│       └── success-step.tsx          # Tela de sucesso
├── hooks/
│   └── use-registration.ts     # React Query hooks (create, update, MFA, CEP)
├── schemas/                    # Schemas Zod por step
├── lib/
│   └── api.ts                  # Instância Axios com baseURL configurável
└── providers/
    └── query-provider.tsx      # QueryClientProvider
```

---

## Fluxo de navegação

```
/register
    │
    ├── Identificação (nome + e-mail)
    │       │
    │       └── Verificação MFA (código 6 dígitos enviado por e-mail)
    │               │
    │               ├── Documento (CPF ou CNPJ)
    │               │
    │               ├── Contato (telefone celular)
    │               │
    │               ├── Endereço (CEP com auto-preenchimento via ViaCEP)
    │               │
    │               └── Revisão (dados + botões "Editar" por seção)
    │                       │
    │                       └── Sucesso ✓
    │
    └── ?id=<uuid>  ← retomada de cadastro em andamento
```

---

## Funcionalidades

- **Persistência incremental:** cada step salva no banco; o cadastro pode ser retomado via `?id=` na URL
- **MFA por e-mail:** código de 6 dígitos com expiração de 10 minutos
- **Consulta automática de CEP:** ao preencher o CEP, os campos de rua, bairro, cidade e estado são preenchidos automaticamente via ViaCEP
- **Edição na revisão:** botões "Editar" em cada seção permitem corrigir dados sem perder o progresso
- **Mobile-first:** layout responsivo, `inputMode` correto por campo, `autoFocus` ao entrar em cada step
- **Retomada de cadastro:** e-mail de abandono enviado automaticamente com link de retomada

---

## Build de produção

```bash
pnpm build
pnpm start
```

> Para Docker, o `Dockerfile` usa build multi-stage com `output: standalone` para imagem enxuta. A variável `NEXT_PUBLIC_API_URL` é injetada em **build time** via `ARG`.

---

## CI/CD

Este repositório possui os seguintes arquivos de automação:

- `.github/dependabot.yml`: atualização automática de dependências `npm`, `docker` e `github-actions`
- `.github/workflows/security-quality-checks.yml`: valida `lint`, `build` e faz scan de vulnerabilidades com Trivy
- `.github/workflows/docker-publish.yml`: constrói e publica a imagem Docker no GitHub Container Registry (`ghcr.io`)

### Publicação da imagem

A workflow publica imagens em:

```text
ghcr.io/<owner>/<repo>
```

Exemplo deste projeto:

```text
ghcr.io/matheus-calixto-silva/multi-step-frontend:latest
```

> Como `NEXT_PUBLIC_API_URL` é embutida no bundle do Next.js, defina a variável de repositório `NEXT_PUBLIC_API_URL` no GitHub antes de publicar a imagem de produção.

---

## Produção com Docker Compose

Foi adicionado um arquivo `docker-compose.prod.yml` para subir o frontend usando a imagem já publicada no registry:

```bash
docker compose -f docker-compose.prod.yml up -d
```

Se quiser usar outra tag ou outro registry:

```bash
FRONTEND_IMAGE=ghcr.io/<owner>/<repo>:<tag> docker compose -f docker-compose.prod.yml up -d
```
