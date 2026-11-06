# Continuação com Codex

Abra este repositório e leia `AGENTS.md`, `README.md`, `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, `docs/PRANKS.md` e `docs/ROADMAP.md` antes de modificar código. Inspecione também a implementação atual; não recrie o mascote SVG ou a cena.

## Estado atual

- Etapa 1: Diretor de Caos puro, traços de sessão e integração com a cena.
- Etapa 2: a cena chama `/api/ask` após pular ou completar até quatro pegadinhas. O provedor escolhido para a apresentação é Ollama local; `.env.example` sugere `qwen3:4b-instruct`, e esta máquina usa `qwen3:8b` em `.env.local`. OpenAI está desativada por padrão.
- Etapa 3 iniciada: Enviar não avança uma pegadinha ativa; a ação da cena ou Pular libera a continuação. A palavra mágica usa campo próprio, o ladrão de palavras devolve duas palavras separadamente apenas na prévia visual, e o apagão exige lanterna e interruptor.
- As falas cômicas são predefinidas. A resposta útil só é real se Ollama, o modelo e `.env.local` estiverem configurados. As instruções e a limpeza da saída melhoram a apresentação, mas não garantem precisão factual.
- Não há banco de dados nem catálogo completo de 20 pegadinhas.
- `npm run demo:check` verifica a demonstração local e aquece o modelo; `docs/DEMO_RUNBOOK.md` registra o roteiro e os testes de viewport/teclado. Testes com colegas ainda não ocorreram.

## Antes da próxima mudança

Execute `npm run test`, `npm run typecheck`, `npm run lint` e `npm run build`, registrando o resultado real. Para testar a resposta local, inicie Ollama, execute `ollama pull qwen3:4b-instruct`, configure `ANSWER_PROVIDER=ollama` em `.env.local` e rode `npm run dev`.

Trabalhe em incrementos. Preserve a pergunta original, a opção **Pular pegadinha**, o limite de quatro, a acessibilidade de teclado/toque e o SVG em camadas. Não habilite chamadas pagas sem orçamento e ativação explícitos.
