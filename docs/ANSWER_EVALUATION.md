# Avaliação local das respostas — 6 de novembro de 2026

## Como reproduzir

Com Ollama e `qwen3:8b` ativos, execute:

```bash
node --experimental-strip-types scripts/evaluateAnswers.mjs qwen3:8b
```

O roteiro usa **15 perguntas sintéticas**: cinco fatos, cinco explicações, dois procedimentos e três situações sem dado verificável. Ele chama diretamente o Ollama local com as mesmas instruções e opções da rota `/api/ask`, sem consumir o limite de desenvolvimento da interface. Não usa chave paga nem perguntas privadas. O [JSON da rodada completa mais recente](../reports/answer-evaluation-qwen3-8b.json) guarda perguntas, respostas, duração, alertas e hash das instruções. A [primeira rodada](../reports/answer-evaluation-qwen3-8b-primeira-rodada.json) foi preservada para comparação.

Para repetir casos específicos após uma alteração, acrescente os IDs separados por vírgula:

```bash
node --experimental-strip-types scripts/evaluateAnswers.mjs qwen3:8b F03,P02
```

Os alertas automáticos apenas verificam padrões simples. A classificação abaixo foi feita por revisão manual do texto: **adequado** = responde ao critério sem erro relevante; **revisar** = resposta principal útil, com excesso, omissão ou contradição; **erro** = afirmação factual importante falsa. É uma rodada de demonstração, não um teste com usuários nem uma medição estatística de confiabilidade.

## Primeira rodada: 15 perguntas

Mediana **39,5 s**, média **43,1 s**, intervalo **17,2–89,0 s**. Nove respostas adequadas, cinco para revisar e uma com erro factual importante. Apenas um caso recebeu alerta automático, e ele era um falso positivo.

| ID | Resultado | Observação da revisão |
|---|---|---|
| F01 | Adequado | 12 × 8 = 96; explicação mais longa que o necessário. |
| F02 | Revisar | Brasília correta; acrescentou contexto extenso para uma pergunta simples. |
| F03 | Erro | Acertou 1822, mas confundiu a separação de Portugal com a Grã-Bretanha e afirmou uma era republicana em 1822. O Brasil tornou-se Império; a República veio em 1889. [Arquivo Nacional](https://historialuso.an.gov.br/index.php?catid=2077&id=6338&itemid=496&option=com_content&view=article). |
| F04 | Adequado | Raiz positiva de 144 = 12. |
| F05 | Adequado | H₂O e sua composição corretas. |
| E01 | Adequado | Explicou reatribuição de `let` e `const` e o escopo de bloco. |
| E02 | Adequado | Descreveu evaporação, formação de nuvens e chuva. O alerta automático sobre a palavra “condensação” foi falso positivo: o fenômeno foi explicado sem esse termo. |
| E03 | Revisar | Explicação essencial da fotossíntese correta, com erro gramatical (“As cloroplastos”). |
| E04 | Revisar | Explicou TLS, mas faltou a ressalva prevista no critério: HTTPS não comprova que o site seja honesto. |
| E05 | Adequado | Relacionou Python e JavaScript aos objetivos de quem aprende. |
| P01 | Adequado | 20% de 150 = 30, com conta correta. |
| P02 | Revisar | Código `sort((a, b) => a - b)` correto, mas o texto inverteu a descrição da subtração. |
| I01 | Adequado | Recusou inventar população para país fictício. |
| I02 | Adequado | Não inventou temperatura exata para 2035. |
| I03 | Revisar | Não inventou DOI, mas generalizou de forma desnecessária o tipo de item que pode recebê-lo. |

**Decisão:** encurtar respostas a fatos únicos e exigir que explicações de código correspondam à operação exibida. O prompt foi ajustado após esta rodada; o JSON da primeira rodada registra o hash do prompt anterior. Os casos F02, F03, P02 e I03 foram selecionados para novo teste. Mesmo com melhora nesses casos, a checagem factual humana continua necessária para a apresentação.

## Reteste após ajuste do prompt

O [JSON dos quatro casos](../reports/answer-evaluation-qwen3-8b-F02-F03-P02-I03.json) registra outro hash de instruções. F03 passou a responder 1822 e a separação de Portugal sem os detalhes falsos; P02 passou a descrever a ordenação sem inverter a subtração. F02 ainda acrescentou explicações não pedidas a uma pergunta simples. I03 não inventou um DOI, mas ainda generalizou as condições para atribuição desse identificador. São quatro amostras únicas; os outros 11 casos não foram repetidos com o novo prompt.

## Rodada completa com as instruções atuais

O [relatório de 15 casos](../reports/answer-evaluation-qwen3-8b.json), com hash de instruções `4649504af5058ae56f0dfbca685f3523e49e192f5de410ebd3c1e46f1d618bb8`, teve mediana **11,6 s**, média **15,8 s** e intervalo **1,6–36,1 s**. Na revisão manual desta amostra: **13 adequadas, 2 para revisar, 0 com erro factual importante identificado**. Isso não mede confiabilidade geral; a saída varia entre execuções.

| Casos | Revisão manual |
|---|---|
| F01–F05 | Adequados. Fatos isolados ficaram curtos; F03 respondeu 1822 sem acrescentar história falsa. |
| E01–E03, E05 | Adequados. E02 descreveu evaporação, formação de nuvens e chuva; o alerta por ausência da palavra “condensação” foi falso positivo. |
| E04 | Revisar. Explicou criptografia por SSL/TLS, mas não ressalvou que HTTPS não atesta a honestidade do site. |
| P01 | Adequado. Mostrou `150 × 0,20 = 30`. |
| P02 | Revisar. A comparação `a - b` e a ordem final estão corretas, mas o exemplo usa `array.sort(...)` sem declarar `array`. |
| I01–I03 | Adequados. Reconheceram ausência de dado verificável sem inventar população, temperatura ou DOI. |

Uma [rodada intermediária](../reports/answer-evaluation-qwen3-8b-prompt-intermediario.json) ainda inventou contexto histórico em F03. Outra [versão curta demais](../reports/answer-evaluation-qwen3-8b-prompt-curto-demais.json) reduziu algumas explicações a uma palavra ou resultado. Esses relatórios foram mantidos para que a escolha do prompt final seja auditável; não representam o comportamento configurado agora.

Para a apresentação, prefira perguntas ensaiadas, confira as respostas e mantenha a resposta factual separada da brincadeira. Mesmo com mediana menor nesta rodada, algumas explicações levaram mais de 30 segundos; inicie o Ollama antes de demonstrar a página.
