# Roadmap para Codex

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

### Etapa 3 — Novas pegadinhas
- [x] Impedir spam de Enviar durante pegadinha ativa; cada desafio exige resolução ou Pular.
- [x] Palavra mágica em campo separado da pergunta original.
- [x] Ladrão de palavras (somente visual + duas devoluções progressivas; pergunta original intacta).
- [x] Apagão + lanterna, acessíveis em mouse, teclado e toque.
- [ ] Mundo invertido com restauração garantida.
- [ ] Personalidades visuais mais expressivas / timing de gestos.

### Etapa 4 — Qualidade, dados e validação
- [ ] Revisar acessibilidade, foco, touch e movimento reduzido.
- [x] Criar roteiro reproduzível de 15 perguntas sintéticas para medir respostas locais; revisão factual humana segue necessária.
- [ ] Testes e métricas agregadas opcionais respeitando privacidade.
- [ ] Testar com usuários reais e documentar resultados; não alegar testes antes disso.

Revisão parcial em viewport de 320 e 390 px e teclado documentada em `docs/DEMO_RUNBOOK.md`. Toque físico, leitor de tela e movimento reduzido continuam pendentes. O roteiro de teste com colegas está preparado, mas as sessões ainda não aconteceram.

### Etapa 5 — Expansões
- [ ] InstaIAda e easter eggs; relatório de convivência; experiências compartilháveis.

**Regra de entrega:** pequena fatia funcional, tipos, cenários feliz/limite/falha, comandos executados e evidência de validação ou erro. Não alterar mais de uma etapa sem confirmação.
