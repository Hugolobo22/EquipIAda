# Instruções para Codex — EquipIAda

Leia `README.md`, `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, `docs/PRANKS.md` e `docs/ROADMAP.md` antes de modificar código.

## Produto
EquipIAda é uma IA que não quer trabalhar: o mascote flutuante IAda provoca o usuário, tenta evitar perguntas e, após obstáculos limitados, fornece resposta real. Slogan: **Você pergunta. A gente complica.** Uma persona inicial evolui ao longo da sessão. Interface principal sem histórico visível, com última pergunta, balão de fala e palco animado.

## Situação real
O código atual é um protótipo Next.js/React/TypeScript/GSAP: olhos acompanham cursor, flutuação/piscadas, cinco expressões, gestos, passeio, balão e roubo do botão Enviar. O Diretor de Caos e os traços da sessão existem. Cada pegadinha ativa exige ação própria ou Pular; spam em Enviar não avança. A palavra mágica usa campo separado; o ladrão de palavras altera só a apresentação, com duas devoluções progressivas; o apagão exige lanterna e interruptor acessíveis. Outras pegadinhas ainda são simples. Falas cômicas locais usam tema amplo, traços e progresso da rodada; a classificação pode errar e não faz chamada adicional ao modelo. A cena solicita resposta útil pela rota `/api/ask` ao pular ou terminar as pegadinhas. O provedor escolhido é Ollama local; `.env.example` sugere `qwen3:4b-instruct` e esta máquina de desenvolvimento usa `qwen3:8b` em `.env.local`. Sem serviço, modelo e `ANSWER_PROVIDER=ollama`, a resposta fica indisponível. `npm run demo:check` verifica e aquece a configuração local. Instruções e limpeza de Markdown melhoram apresentação, mas não verificam fatos. Há roteiro de 23 perguntas sintéticas para avaliação local. OpenAI é opção paga desativada. Há banco SQLite local para avaliações voluntárias de utilidade e diversão, sem armazenar perguntas ou respostas. Exige Node.js 22.13+; migração em database/migrations/001_feedback.sql e inicialização com npm run db:init. O Playwright usa porta 3100 e banco separado. Não há 20 pegadinhas completas. Testes com colegas ainda não aconteceram. Não afirmar o contrário.

## Regras obrigatórias
- Não apagar/refatorar o protótipo inteiro sem justificativa. Trabalhar em incrementos verificáveis.
- Mascote deve continuar SVG editável em camadas, podendo evoluir futuramente para Rive.
- Separar visual, motor de animação, estado comportamental e lógica do Diretor de Caos. Não permitir JavaScript gerado por LLM na UI.
- Jamais perder ou alterar a pergunta original. Remover palavras deve ser **somente apresentação**, com reversão.
- Máximo inicial: quatro sabotagens principais por pergunta; opção **Pular pegadinha** sempre disponível. A IA deve eventualmente responder de verdade e não entrar em loop de contraperguntas.
- Humor sarcástico, jamais insultos ou humilhação. Erros de rede não impedem pular ou recuperar UI.
- Preferir teclas e touch acessíveis, focus management e `prefers-reduced-motion`. Nunca usar evasão de botão sem alternativa de teclado.
- Proteger chaves no backend, validar entradas, limitar custos/rate limits. Não adicionar segredo ao repositório.
- Evitar telemetria com prompts privados por padrão.

## Comandos
`npm install`, `npm run dev`, `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`.
Não alegar testes que não foram executados. Após cada mudança, reportar arquivos alterados, validação e limitações.

## Próxima tarefa preferencial
Priorizar a adequação A3 de `docs/A3_COMPLIANCE.md`: integração SQLite, testes automatizados, README reproduzível, ensaio em outra máquina e entrega do código público até 27/11. A aplicação continua local; a Etapa 2 com Ollama já foi implementada e validada. Não habilitar chamadas pagas só por existir uma chave.

Responda e documente em português do Brasil.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
