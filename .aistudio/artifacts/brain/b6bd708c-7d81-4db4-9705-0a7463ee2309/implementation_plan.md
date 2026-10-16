# Roteamento Contextual da Vitrine para Usuários Autenticados

Este plano corrige o comportamento dos botões de ação (CTAs) e cards da Vitrine Pública quando acessada por um usuário já autenticado, direcionando-o diretamente para as áreas correspondentes do ambiente logado em vez de acionar o fluxo de login bloqueado.

## User Review & Critical Decisions

> [!IMPORTANT]
> Nenhuma alteração visual, de layout, de estilos CSS ou de regras de negócio do backend será realizada. A intervenção é estritamente de roteamento de estado no cliente (Zustand) e aguarda sua aprovação para execução.

- **Decisão Confirmada 1 (Banner Principal — "Explorar Cursos e Vagas")**: Redireciona o usuário logado para a aba inicial do ambiente logado (`inicio` / Meu Painel) com rolagem suave para o topo.
- **Decisão Confirmada 2 (Seções de Cursos e Vagas — Cards e Botões "Ver mais")**: Redireciona o usuário logado para `Explorar Cursos` (`cursos`) ao clicar em qualquer card de curso ou em *"Ver mais cursos"*, e para `Explorar Vagas` (`vagas`) ao clicar em qualquer card de vaga ou em *"Ver mais vagas"*.
- **Decisão Confirmada 3 (Como Funciona e Prova Social — "Quero me cadastrar agora" e "Fazer parte do CRA-SP Educa")**: Redireciona o usuário logado para a página inicial do ambiente logado (`inicio` / Meu Painel) com rolagem suave para o topo.

---

## 1. Overview & Core Concept

- **What It Does**: Torna todos os pontos de conversão da Vitrine Pública sensíveis ao estado de autenticação do usuário (`user`), eliminando botões inoperantes quando o aluno navega pela vitrine estando logado (`activeTab === 'vitrine'`).
- **Target Audience / Persona**: Estudantes, recém-formados e profissionais registrados no CRA-SP que já realizaram login na plataforma e retornaram à vitrine institucional clicando na logo do cabeçalho.
- **Key Value**: Elimina cliques sem resposta (dead clicks) na vitrine logada e conduz o usuário diretamente ao catálogo completo ou ao seu painel de jornada com zero atrito.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Visitante Não Autenticado (`!user`)**: Mantém 100% do comportamento atual — clicar em qualquer CTA ou card da vitrine abre a tela de autenticação (`setIsLoginOpen(true)`).
  2. **Usuário Autenticado na Vitrine (`user` presente e `activeTab === 'vitrine'`)**:
     - Clicar em **"Explorar Cursos e Vagas"** (Banner Principal) → alterna `activeTab` para `'inicio'` e posiciona a janela no topo.
     - Clicar em um **Card de Curso** ou em **"Ver mais cursos"** → alterna `activeTab` para `'cursos'` (Explorar Cursos) e posiciona a janela no topo.
     - Clicar em um **Card de Vaga** ou em **"Ver mais vagas"** → alterna `activeTab` para `'vagas'` (Explorar Vagas) e posiciona a janela no topo.
     - Clicar em **"Quero me cadastrar agora"** (Como Funciona) ou **"Fazer parte do CRA-SP Educa"** (Números de Impacto) → alterna `activeTab` para `'inicio'` e posiciona a janela no topo.
- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Preservação integral do Design System atual (Light Mode, geometria `rounded-full` / `rounded-[16px]`, paleta institucional azul `#1e3a8a` / `#1e40af` e amarelo `#eab308`, suporte a Alto Contraste).
- **Interactive Feedback & Motion**:
  - Ao transitar da vitrine para uma aba logada, a janela executa `window.scrollTo({ top: 0, behavior: 'smooth' })`, evitando que o usuário caia no meio da página destino quando clica em seções inferiores da vitrine.

---

## 3. Key Product Decisions & Trade-Offs

- **Decisão 1: Roteamento via Estado Global Existente (`useNavigationStore`)**
  - *Chosen Approach*: Utilizar a mutação `setActiveTab` já existente em `useNavigationStore` combinada com a leitura de `user` de `useAuthStore`.
  - *Why*: O roteador principal da aplicação observa `user && profileComplete !== false && activeTab !== 'vitrine'`. Alterar `activeTab` de `'vitrine'` para `'inicio'`, `'cursos'` ou `'vagas'` desmonta a vitrine e monta o painel logado imediatamente na aba correta, com custo zero de rede e sem criar novos estados.
  - *Alternatives Considered*: Criar listeners adicionais ou redirecionamentos via `window.location`, descartados por causarem recarregamento completo da SPA e perda do cache em memória.

- **Decisão 2: Mitigação de Riscos (Performance, GRC e Auditorias)**
  - *PageSpeed Insights / WebPageTest (LCP, TBT, CLS)*: Nenhum pacote novo ou importação pesada é adicionada ao bundle inicial; `useNavigationStore` já faz parte do chunk principal carregado pelo cabeçalho (`Header`).
  - *Memória Heap ($\Delta M_{heap} = 0$)*: Funções puras de clique sem criação de subscrições, timers ou closures retidas.
  - *WAVE Accessibility (10/10)*: Nenhuma tag semântica (`<button>`, `<h2>`, `<h3>`), atributo `aria-*` ou contraste é alterado.
  - *Complexidade Ciclomática ($V(G) \le 7$)*: A extração de um handler simples por seção adiciona apenas 1 ramificação condicional (`if (user)`), mantendo todos os componentes dentro das métricas de Clean Code e bem abaixo do limite de 250 linhas.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌──────────────────────────────────────────────────────────────────────┐
│                        Zustand Global Stores                         │
│  ┌──────────────────────────────┐  ┌──────────────────────────────┐  │
│  │        useAuthStore          │  │      useNavigationStore      │  │
│  │  • user (Auth State)         │  │  • activeTab: DashboardTab   │  │
│  │  • setIsLoginOpen(boolean)   │  │  • setActiveTab(tab)         │  │
│  └──────────────┬───────────────┘  └──────────────┬───────────────┘  │
└─────────────────┼─────────────────────────────────┼──────────────────┘
                  │                                 │
                  ▼                                 ▼
┌──────────────────────────────────────────────────────────────────────┐
│                   Vitrine Pública (Showcase CTAs)                    │
│                                                                      │
│  ┌─────────────────────────┐       ┌──────────────────────────────┐  │
│  │       HeroBanner        │       │    FeaturedCourses (Cards    │  │
│  │ "Explorar Cursos/Vagas" │       │    + "Ver mais cursos")      │  │
│  └────────────┬────────────┘       └──────────────┬───────────────┘  │
│               │                                   │                  │
│               │ user ? 'inicio'                   │ user ? 'cursos'  │
│               ▼                                   ▼                  │
│  ┌─────────────────────────┐       ┌──────────────────────────────┐  │
│  │  HowItWorks / Social    │       │     FeaturedVagas (Cards     │  │
│  │ "Quero me cadastrar" /  │       │     + "Ver mais vagas")      │  │
│  │ "Fazer parte do Educa"  │       └──────────────┬───────────────┘  │
│  └────────────┬────────────┘                      │                  │
│               │ user ? 'inicio'                   │ user ? 'vagas'   │
└───────────────┼───────────────────────────────────┼──────────────────┘
                │                                   │
                └─────────────────┬─────────────────┘
                                  ▼
         ┌─────────────────────────────────────────────────┐
         │          Condição de Clique (Handler)            │
         │  • Se autenticado (user):                       │
         │      setActiveTab(abaDestino)                   │
         │      window.scrollTo({ top: 0, behavior: ... }) │
         │  • Se visitante (!user):                        │
         │      setIsLoginOpen(true)                       │
         └─────────────────────────────────────────────────┘
```

- **Data Model & State**:
  - `useAuthStore`: Fornece `user` (indicando sessão autenticada ativa) e `setIsLoginOpen`.
  - `useNavigationStore`: Fornece `setActiveTab`, aceitando `'inicio' | 'cursos' | 'vagas'`.

- **Interactive Component & State Mapping**:
  - **Banner Principal (`HeroBanner`)**: O botão *"Explorar Cursos e Vagas"* verifica `if (user)` → `setActiveTab('inicio')` + `window.scrollTo({ top: 0, behavior: 'smooth' })`; caso contrário → `setIsLoginOpen(true)`.
  - **Cursos em Destaque (`FeaturedCourses`)**: Tanto os 3 cards de cursos quanto o botão *"Ver mais cursos"* compartilham o handler `handleCourseAction`: `if (user)` → `setActiveTab('cursos')` + `window.scrollTo({ top: 0, behavior: 'smooth' })`; caso contrário → `setIsLoginOpen(true)`.
  - **Vagas em Destaque (`FeaturedVagas`)**: Tanto os 3 cards de vagas quanto o botão *"Ver mais vagas"* compartilham o handler `handleVagaAction`: `if (user)` → `setActiveTab('vagas')` + `window.scrollTo({ top: 0, behavior: 'smooth' })`; caso contrário → `setIsLoginOpen(true)`.
  - **Como Funciona (`HowItWorks`)**: O botão *"Quero me cadastrar agora"* verifica `if (user)` → `setActiveTab('inicio')` + `window.scrollTo({ top: 0, behavior: 'smooth' })`; caso contrário → `setIsLoginOpen(true)`.
  - **Prova Social (`SocialProof`)**: O botão *"Fazer parte do CRA-SP Educa"* verifica `if (user)` → `setActiveTab('inicio')` + `window.scrollTo({ top: 0, behavior: 'smooth' })`; caso contrário → `setIsLoginOpen(true)`.
