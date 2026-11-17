# Roadmap para Codex

## Prioridade acadêmica A3

O documento fornecido em 09/11 exige banco integrado, README reproduzível, código público e entrega até 27/11. A aplicação continua local. A [matriz A3](A3_COMPLIANCE.md) governa o fechamento acadêmico e registra pendências sem marcar etapas administrativas como cumpridas sem prova.

- [x] Implementar avaliação voluntária com SQLite, migração, contrato sem prompts privados e testes de persistência/rollback.
- [x] Documentar RF/RNF, banco e estratégia de testes, com os quatro integrantes informados pelo usuário.
- [ ] Confirmar com o professor a composição de quatro integrantes, pois o PDF menciona cinco.
- [ ] Executar o README em outro computador e registrar evidências reais.
- [x] Revisar e enviar a versão de 17/11 ao GitHub público, com banco, melhorias, testes e evidências. O fechamento acadêmico e as entregas administrativas até 27/11 continuam pendentes.
- [ ] Confirmar UC HUB, formulário, lista de aptos em 30/11 e ensaio individual da banca.

### Etapa 0 — Auditoria inicial
- [ ] Inspecionar o código real, instalar dependências, executar typecheck/lint/build; reportar evidências.
- [ ] Corrigir bugs reproduzidos sem redesenhar interface nem trocar stack.

### Etapa 1 — Personalidade adaptativa e Diretor de Caos (primeira implementação)
- [x] Adicionar tipos para sessão, traços, gatilhos e ações.
- [x] Implementar função pura `chooseNextAction(...)`, com random injetável e limite de quatro pegadinhas.
- [x] Implementar atualização dos traços (preguiça, sarcasmo, drama, curiosidade, paciência) por evento do usuário.
- [x] Evitar repetição, suportar skip e recuperação, preservar pergunta original.
- [x] Integrar incrementalmente à cena atual mantendo roubo de botão.
- [x] Testes de regras e edge cases.

As novas pegadinhas desta etapa são encenações por fala; somente o roubo do botão tem animação própria.

### Etapa 2 — IA real local para demonstração
- [x] Backend `/api/ask` validado, timeout, tratamento de falhas e limite de consultas local.
- [x] Escolher falas cômicas contextuais locais por tema amplo, traços e progresso da rodada, separadas da resposta factual e sem chamada adicional.
- [x] Ligar resposta útil à cena com fallback honesto e nova tentativa.
- [x] Ajustar instruções da resposta local e apresentação em texto simples; ainda requer revisão factual humana.

Para a apresentação, o provedor escolhido é Ollama local, sem chave ou custo por chamada. `.env.example` sugere `qwen3:4b-instruct`; esta máquina usa `qwen3:8b` em `.env.local` após comparação pontual de precisão. A resposta real só funciona quando o serviço e o modelo estiverem instalados na máquina. OpenAI permanece desativada. Limite compartilhado e liberação de produção seguem pendentes; nenhuma chamada paga foi feita.

- [x] Diagnóstico local antes da apresentação: configuração, modelo, aquecimento e página.
- [x] Estabilizar a rodada: campo bloqueado entre desafios e após falha/cancelamento, sucesso só após resposta recebida e mensagem específica para limite de consultas.
- [x] Adicionar iniciador local e confirmar resposta real pela aplicação com proteção `localOnly`.
- [x] Verificar restauração do mascote e do botão, cancelamento, nova tentativa e reinício no navegador; evidências em `reports/local-validation-2026-11-09.json`.

Escopo confirmado em 9 de novembro de 2026: uso local com Ollama. Publicação não faz parte da entrega atual. O iniciador escuta somente em `127.0.0.1`; a opção paga permanece desativada.

### Etapa 3 — Novas pegadinhas
- [x] Impedir spam de Enviar durante pegadinha ativa; cada desafio exige resolução ou Pular.
- [x] Palavra mágica em campo separado da pergunta original.
- [x] Ladrão de palavras (somente visual + duas devoluções progressivas; pergunta original intacta).
- [x] Apagão + lanterna, acessíveis em mouse, teclado e toque.
- [ ] Mundo invertido com restauração garantida.
- [x] Refinar timing de gestos e falas, com poses temporárias e controles que não interrompem os desafios.
- [x] Dar à manutenção dois ajustes próprios e ao carregamento dramático uma barra interativa de coragem.
- [x] Reduzir rodadas comuns para duas ou três cenas e continuar automaticamente após a resolução, mantendo Pular e o máximo de quatro.
- [ ] Ampliar o desenho das expressões além dos cinco estados atuais.

### Etapa 4 — Qualidade, dados e validação
- [ ] Revisar acessibilidade, foco, touch e movimento reduzido.
- [x] Ampliar o roteiro reproduzível de 15 para 23 perguntas sintéticas; revisão factual continua necessária e encontrou falhas na amostra atual.
- [x] Adicionar testes reproduzíveis de navegador para foco, desafios, timers, cancelamento, telas estreitas e uma rodada real opcional com Ollama.
- [x] Avaliações voluntárias com notas agregadas em SQLite, sem perguntas ou respostas e com testes de integração.
- [ ] Testar com usuários reais e documentar resultados; não alegar testes antes disso.

Viewport de 320/390 px, teclado, foco, touch e movimento reduzido simulados foram revisados com testes de navegador reproduzíveis em `docs/DEMO_RUNBOOK.md`. Toque físico e leitor de tela continuam pendentes. O roteiro com colegas está preparado, mas as sessões ainda não aconteceram.

### Etapa 5 — Expansões
- [ ] InstaIAda e easter eggs; relatório de convivência; experiências compartilháveis.

**Regra de entrega:** pequena fatia funcional, tipos, cenários feliz/limite/falha, comandos executados e evidência de validação ou erro. Não alterar mais de uma etapa sem confirmação.
