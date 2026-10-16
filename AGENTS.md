# Instruções do Projeto: CRA-SP Educa

ATENÇÃO: PROIBIDO EDITAR OS CODIGOS SEM AUTORIZAÇÃO EXPLICITA DO DONO DO PROJETO, ADM. MARCELO TORRES.

Este arquivo documenta as diretrizes fundamentais, a arquitetura e as regras de negócio decididas para o Hub CRA-SP. Sempre consulte este documento antes de propor mudanças arquiteturais. NÃO USE A COR ROXA PARA DETALHES!

## 1. Visão Geral do Produto
O CRA-SPEduca não é uma plataforma de hospedagem de vídeos (LMS tradicional). Ele atua como um **Conector Educacional**.
* **Modelo Declaratório:** O usuário gerencia a própria jornada. Nós oferecemos o catálogo e o link do parceiro (AVA externo), e o aluno volta ao Hub para declarar seu status (Matriculado, Cursando, Desisti, Concluído) e fazer o upload do certificado final.

## 3. Padrões Visuais, de UI/UX e Hibridismo Taxonômico
* **Simetria e Precisão:** Manter rigor matemático nas proporções, alinhamentos e espaçamentos dos cards da vitrine e elementos do painel.
* **Transições Suaves:** Animações e trocas de estado na UI não devem apresentar engasgos, garantindo 60 FPS na renderização.
* **Minimalismo e Geometria:** Interfaces limpas, profissionais, em Light Mode mandatório com geometria padronizada (`rounded-xl` e `rounded-full`).
* **Hibridismo Taxonômico de Idiomas:** Atributos estruturais e infraestrutura de componentes (`type`, `role`, `isLoading`, `isOpen`) devem ser escritos em Inglês. Rótulos, textos visíveis, entidades do negócio (Cursos, Vagas, Certificados) e atributos de acessibilidade (`aria-label`, `placeholder`) permanecem em Português.

## 4. Arquitetura Técnica
* **Modelo:** Full-Stack Monolítico (Frontend React + Backend Node.js/Express)
* **Hospedagem:** Google Cloud Run (Serverless).
* **Decisão Arquitetural:** Optamos por **NÃO** utilizar o Firebase Cloud Functions. O modelo de API Express hospedada no Cloud Run atende perfeitamente à demanda transacional leve (cliques para mudança de status), centraliza a gestão de rotas e garante extrema eficiência financeira usando a cota gratuita do Google Cloud.

## 5. Definições Estritas de Stack e Conexão Dinâmica
* **Gerenciamento de Estado Global (`/src/store`):** Uso exclusivo do **Zustand** para gerenciamento de sessão, lista em tempo real de vagas/cursos e acompanhamento de uploads de certificados.
* **Estilização e Componentes:** Tailwind CSS com HTML5 semântico.
* **Banco de Dados e Armazenamento (Dual-Firebase / Dual-Write):** Uso de uma instância principal do Firestore para a aplicação e uma instância secundária isolada operando como Cofre (Vault) de Leads para a equipe de negócios.
* **Acoplamento Inverso na Camada `/src/api`:** Funções da API devem ser fábricas puras (Factory Pattern) recebendo as instâncias dos serviços Firebase por parâmetro.

## 6. Estrutura de Banco de Dados (Firebase)
* **Firestore (Banco de Dados):** 
  *   Coleção Pública (Vitrine): Única e exclusivamente a coleção `paginaPublica`, que atua como um super-documento (View Materializada) contendo o necessário para renderizar a Landing Page com apenas 1 Read.
  *   Coleção Única Transacional e de Perfil (`usuarios`): A fim de otimizar os custos financeiros com leituras (Reads), todo o escopo do usuário fica concentrado em um único documento (`doc.id == uid`). Com apenas **1 leitura (1 Read)** no momento do login, o sistema recupera: dados de cadastro, histórico de cursos (`jornadaCursos`), candidaturas a vagas (`jornadaVagas`) e certificações validadas (Minhas Conquistas). Todo esse histórico é armazenado em listas (arrays) dentro deste documento único.
  *   Coleções de Catálogos (Leitura Sob Demanda): As coleções `catalogoCursos` e `catalogoVagas` só devem ser lidas se o usuário entrar nas respectivas telas de "Explorar". A coleção `catalogoIes` deve ser lida estritamente durante o cadastro, e apenas se o usuário selecionar o perfil de "Estudante de Administração".
  *   Status possíveis do aluno em cursos: `PRE_MATRICULADO` -> `MATRICULADO` -> `AGUARDANDO_CERTIFICADO` -> `EM_ANALISE` -> `CONCLUIDO` ou `DESISTIU`.
* **Cofre Secundário (Vault / Dual-Write):** Os dados sensíveis dos Leads (CPF e Celular) devem ser gravados OBRIGATORIAMENTE protegidos com criptografia simétrica autenticada (AES-256-GCM), conforme exigido na Seção 16, sendo estritamente proibida a gravação desses campos em texto limpo em qualquer repositório. Apenas o banco de dados principal (primário) mantém o Hash PBKDF2/SHA256 destes campos.
* **Firebase Auth:** Responsável pelo cadastro e login (E-mail/Senha).
* **Firebase Storage:** Armazenará os PDFs e imagens de certificados enviados pelos alunos.

## 7. Estrutura de Pastas e Organização do Projeto
A topologia física do repositório deve respeitar a seguinte taxonomia:

```plaintext
/ (Raiz do Projeto)
├── server.ts               # [SERVER NODE.JS] O coração da segurança, rotas (e-MEC, Cadastros) e acesso ao Firestore Admin.
├── /data-plane-iac         # [IaC] Regras do Firestore (firestore.rules) e Storage (storage.rules).
└── /src                    # [CLIENT WEB] Aplicação React / Vite (Thin Client)
    ├── /api                # [BACKEND CONNECTION] Funções que o frontend usa para chamar o nosso server.ts
    ├── /types              # [CONTRACTS] Definições TypeScript e Schemas Zod.
    ├── /store              # [STATE] Gerenciamento de estado global e subscrições.
    ├── /pages              # [VIEWS] Páginas (PublicLandingPage, LoggedDashboard).
    ├── /components         # [UI] Componentes visuais puros e de layout.
    │   ├── /layout         # Header, Footer, Navbar pública e navegação logada.
    │   ├── /showcase       # Componentes da vitrine (Cards de Cursos, Lista de Vagas).
    │   └── /ui             # Componentes atômicos (Botões, Uploaders, Modais).
    ├── /lib                # [UTILS] Funções puras, máscaras, sanitizadores de arquivo e URL.
    ├── App.tsx             # Roteador de acesso (Público vs. Autenticado).
    └── index.css           # Configuração de estilos e Design System (Tailwind CSS).
```

## 8. Ambiente de Desenvolvimento
* **Foco em Produção:** O desenvolvimento deve ser pensado primariamente para o ambiente de produção publicado (`https://crasp-educa.ai.studio/`). O código e a arquitetura já devem ser consolidados visando o funcionamento online, evitando abstrações ou "gambiarras" que só funcionem no ambiente local/dev.

## 9. Métricas de Qualidade, Segurança e Clean Code (GRC & AppSec)

**Métricas de Clean Code:**
* **Limite de Linhas por Arquivo:** Módulos não devem ultrapassar 250 a 300 linhas.
* **Responsabilidade Única (SRP):** Funções devem ter, no máximo, 30 linhas, executando uma única tarefa.
* **Comprimento de Linha:** Evitar linhas horizontais com mais de 120 caracteres.

**Segurança de Aplicação (AppSec & OWASP Top 10):**
* **Proibição de Mutações Diretas:** É expressamente proibido invocar funções mutáveis do Firebase (`setDoc`, `updateDoc`, `addDoc`) no lado do cliente (`/src`). Toda escrita no banco deve ser enviada via fetch para o nosso servidor (`server.ts`), que é o único detentor da credencial Admin autorizada a escrever no Firestore.
* **Prevenção de DOM-Based XSS (Injeção de HTML):** É terminantemente proibido o uso de `dangerouslySetInnerHTML` com dados brutos. Qualquer renderização de HTML dinâmico no React deve passar OBRIGATORIAMENTE por sanitização.
* **Validação Rígida de Uploads (Certificados):** Todo upload de certificado para o Firebase Storage deve ser limitado a 5MB, validado (`application/pdf`, `image/png`, `image/jpeg`) e com nome do arquivo sanitizado no cliente (remoção de caracteres especiais e sequências como `../`).
* **Mitigação de Open Redirect (URLs Externas):** Links externos dinamizados pelo banco DEVEM passar por validação rigorosa que exija protocolo seguro, recusando qualquer URL que não comece obrigatoriamente com `https://`.

**Arquitetura, Performance e RAM (ISO/IEC 25010):**
* **Complexidade Ciclomática:** $V(G) \le 3$ para APIs/Services e $V(G) \le 7$ para componentes visuais React.
* **Enclausuramento de Subscrições (`onSnapshot`):** Proibido inicializar listeners do Firestore diretamente em efeitos dispersos nos componentes. Toda subscrição em tempo real deve possuir lógica explícita de `unsubscribe()` na desmontagem para evitar vazamento de memória (Memory Leak).

## 10. Conformidade, Legislações e Acessibilidade (Governo Federal)
* **LGPD (Lei nº 13.709/2018):** Os certificados contêm dados pessoais (PII). A emissão de logs exige a remoção do caractere `@` e CPFs sem hashing SHA-256 com salt.
* **Lei de Governo Digital (Lei nº 14.129/2021):** Validação sintática via Zod na borda da aplicação para qualquer entrada de dado ou arquivo.
* **Acessibilidade (Lei nº 13.146/2015 & e-MAG / WCAG 2.2 AA):** Navegação 100% funcional por teclado. Uso de tags semânticas nativas (`<button>`, `<article>`, `<header>`).
* **ISO/IEC 25010:** Variação de memória Heap nula no navegador ($\Delta M_{heap} = 0$) ao transitar entre as áreas.
* **ISO 5230 (Compliance SBOM):** Proibição de dependências com licenças restritivas (GPL v3, AGPL).

## 11. Regras e Comandos Especiais
* **Segurança:** O Backend (Node.js) é o único autorizado a escrever/alterar as jornadas no banco, utilizando a chave `FIREBASE_ADMIN_CREDENTIALS` mantida em segredo nas variáveis de ambiente.
* **Comando VOLUMETRIA:** Quando o usuário digitar "VOLUMETRIA", gere uma lista contendo o número de linhas e o nome/caminho de cada arquivo ordenado do maior para o menor. O retorno deve ser exclusivamente via chat e **é expressamente proibido editar qualquer código** ao executar este comando.

## 12. Imutabilidade de Segurança (Core AppSec Homologado)
* **Imutabilidade de Borda:** Os arquivos `server.ts` (na sua camada de middlewares de segurança: `helmet`, `rateLimit`, `trust proxy`), `/data-plane-iac/firestore.rules` e a arquitetura Zod (`profileSchema` com validação matemática de CPF e `HMAC_PEPPER_KEY`) estão declarados como **"Core AppSec"**. É ESTRITAMENTE PROIBIDO realizar *downgrade*, remover ou enfraquecer essas validações durante o desenvolvimento de novas funcionalidades.
* **Comando HOMOLOGAÇÃO APPSEC:** Quando o usuário digitar "HOMOLOGAÇÃO APPSEC", o agente deverá ler os arquivos `server.ts` e `firestore.rules` para auditar e garantir que as travas de segurança implementadas (Helmet, Rate Limit, Trust Proxy, Regras do Firestore e Criptografia HMAC) continuam ativas e idênticas, reportando qualquer anomalia. O retorno deve ser exclusivamente via chat e sem alterar código.
## 13. Padrão Ouro de Leitura de Dados Volumosos (Catálogos)

* **Arquitetura Homologada:** A leitura de grandes volumes de dados estáticos (coleções `catalogoIes`, `catalogoCursos`, `catalogoVagas`) deve seguir estritamente o padrão implementado e aprovado pela auditoria de segurança e performance.
* **Fatiamento no Banco (Firestore):** Os dados devem ser fatiados em documentos sequenciais (ex: `parte1`, `parte2`, etc.) dentro de sua respectiva coleção para contornar o limite de 1MB por documento e otimizar leituras.
* **Cache e Orquestração (Backend):** O `server.ts` é o único responsável por buscar essas partes no Firestore via Admin SDK, concatená-las, processá-las e mantê-las em memória (In-Memory Cache). 
* **Proibição de Leitura Direta no Client:** É estritamente proibido fazer o frontend (React) baixar milhares de registros diretamente do Firestore. O frontend deve apenas consumir esses dados cacheados através de requisições à API REST do nosso backend. Este padrão não deve ser alterado ou reinventado.

## 14. Pipeline de Auditoria Contínua (QA & GRC)
Para garantir a manutenção do estado da arte do projeto, após cada ciclo de implementação ou melhoria de funcionalidades, o agente deve recomendar ou assegurar que a plataforma seja validada nas 6 autoridades globais de auditoria:
1. **Google PageSpeed Insights:** Manter 100/100 (Performance, SEO e Core Web Vitals). **Exceção de Compliance Homologada (Práticas Recomendadas):** É tolerada a pontuação mínima de 96/100 exclusivamente na categoria "Práticas Recomendadas" caso a penalidade seja referente à distorção de Aspect Ratio da imagem do VLibras (`vlibras-popup.webp`). Trata-se de um falso positivo gerado pela injeção do componente de acessibilidade federal. Fica expressamente proibida a edição do DOM ou CSS para tentar suprimir esse erro, a fim de preservar a fidelidade visual e a animação nativa da ferramenta governamental.
2. **Mozilla Observatory:** Manter A+ ou Score > 100 (Segurança de Aplicação e CSP).
3. **SecurityHeaders.com:** Manter A+ (Proteção estrita de Hardware e Anti-Clickjacking).
4. **Qualys SSL Labs:** Manter A+ (Força Criptográfica TLS 1.3 e integridade de cifras).
5. **WebPageTest:** Manter métricas de elite (LCP < 1.5s, TBT 0, CLS 0).
6. **WAVE Web Accessibility Tool:** Manter 10/10 ou Zero Erros na extensão (Acessibilidade WCAG 2.2 AA).

## 15. Protocolo de Triagem e Defesa contra Auditorias Externas (SAST/DAST)
Toda análise de vulnerabilidade, linting ou auditoria estática externa trazida ao agente **DEVE ser submetida a um escrutínio crítico profundo**. É expressamente proibido o acatamento cego de apontamentos automatizados. O agente deve aplicar a seguinte matriz de reflexão antes de acatar ou editar qualquer código:

* **Mapeamento de Contexto Global (AST Mental):** Nunca valide erros de "Endpoint Não Encontrado (404)" ou "Rota Inexistente" lendo arquivos isolados. O agente deve reconstruir a árvore de roteamento (ex: prefixos injetados dinamicamente via `app.use()` no `server.ts`) para desmascarar falsos positivos criados pela falta de visão global da ferramenta de auditoria.
* **Trade-off de Purismo vs. Performance (Prioridade da Regra 13):** Diretrizes de *Clean Code* (como limite de linhas e Complexidade Ciclomática) são estritamente subordinadas à orquestração de performance. Se quebrar uma função em pedaços para satisfazer um linter for destruir o In-Memory Cache (Regra 13) ou a velocidade da interface, o apontamento da auditoria DEVE ser sumariamente recusado com base na proteção da Experiência do Usuário (UX/WebPageTest).
* **Detecção de Alucinação Semântica e Falsos Positivos:** O agente deve cruzar a acusação da auditoria com a evidência descrita. Exemplo: se o relatório acusa "protocolo inseguro", mas a URL mostrada contém `https://`, o apontamento deve ser exposto como alucinação da ferramenta e recusado imediatamente.
* **Gestão de Risco Pragmática (Probabilidade vs. Impacto):** Apontamentos de purismo transacional (ex: *Race Conditions* e *Locks*) devem ser avaliados sob o risco prático. É proibido sugerir refatorações complexas de transações de banco de dados funcionais para cobrir cenários de concorrência com probabilidade estatística quase nula, a fim de evitar o "efeito dominó" de quebra de sistema.
* **Formato de Resposta (Padrão de Defesa):** O agente deve retornar um relatório ponto a ponto, carimbando cada item como `(Recusado ❌)` ou `(Requer Avaliação ⚠️)`, seguido da fundamentação técnica arquitetural, sem executar nenhuma alteração no código até a concordância explícita do líder técnico.

## 16. Arquitetura de Cofre (Vault) e Dual-Write
* **Escopo Estrito de Leads:** A escrita no Cofre secundário é exclusiva para a captação de Leads (Cadastros de Perfil e Atualizações de Contato). É terminantemente proibido trafegar histórico de cursos, vagas ou metadados de sistema para o Cofre.
* **Criptografia vs. Texto Limpo:** A fim de atender ao Artigo 46 da LGPD, os dados pessoais (CPF e Celular) devem ser gravados no Cofre secundário (Vault) **OBRIGATORIAMENTE** protegidos com criptografia simétrica autenticada (AES-256-GCM), utilizando a chave `VAULT_ENCRYPTION_KEY`. Fica estritamente proibida a gravação desses campos em texto limpo.
* **Tolerância a Falhas (Não-Bloqueante):** A escrita no Cofre secundário nunca pode interromper a experiência do usuário. Caso o Firebase do Cofre falhe, a requisição deve ser tratada via `.catch()` em background, registrando o log no servidor e permitindo que o aluno continue navegando no sistema principal normalmente.
