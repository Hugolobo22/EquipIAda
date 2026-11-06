# Roteiro de apresentação local

## Antes de abrir a página

1. Inicie o Ollama e confira que o modelo configurado em `.env.local` está instalado. Nesta máquina, o modelo é `qwen3:8b`; `.env.example` mantém `qwen3:4b-instruct` para máquinas mais leves.
2. Em um terminal, execute `npm run dev` e mantenha o servidor aberto.
3. Em outro terminal, execute `npm run demo:check`. O comando verifica `ANSWER_PROVIDER=ollama`, a lista de modelos, faz uma pergunta sintética curta para aquecer o modelo por até dez minutos e confirma `http://127.0.0.1:3000`. Ele não usa chave nem faz chamada paga.
4. Se o Next.js escolher outra porta, no PowerShell use `$env:DEMO_APP_URL='http://127.0.0.1:3001'; npm run demo:check` com a porta mostrada no terminal.

Se o diagnóstico falhar, siga a mensagem exibida: iniciar Ollama, baixar o modelo com `ollama pull NOME_DO_MODELO`, corrigir `.env.local` ou iniciar a página. A pergunta de aquecimento não passa pela rota `/api/ask` e não consome seu limite local de 20 consultas por hora.

## Demonstração sugerida

- Faça uma pergunta curta e conhecida, como “Quanto é 20% de 150?”. Mostre que Enviar repetidamente não resolve um desafio ativo.
- Resolva uma pegadinha com a ação própria e mostre que Pular permanece disponível.
- Faça uma pergunta conceitual já ensaiada. Avise que a resposta local pode demorar: a rodada mais recente de 15 perguntas teve mediana de 11,6 segundos, mas algumas explicações levaram mais de 30 segundos. Confira o texto antes de usá-lo como exemplo factual.
- Durante a espera, mostre **Cancelar resposta** e depois **Tentar novamente**. A pergunta original continua visível; o cancelamento encerra a espera na interface, mas a liberação imediata do processamento no Ollama depende da propagação do sinal pelo servidor.
- Se o modelo falhar, mostre a mensagem recuperável e Reiniciar pergunta. Não apresente resposta pré-gravada como se fosse geração em tempo real.

## Verificações feitas no navegador

Em viewport de 390 px, o passeio automático cortava o balão; o deslocamento foi limitado em telas estreitas. Em 320 px, a página não teve rolagem horizontal, a pegadinha e Pular ficaram visíveis, o foco do botão do desafio ficou visível e Pular preservou a pergunta original. O fluxo de espera, Cancelar resposta e Tentar novamente foi verificado no navegador: o foco permaneceu no painel e o campo e a última pergunta mantiveram o texto original. Esses testes usaram viewport e teclado no navegador; toque em aparelho físico, leitor de tela e preferência de movimento reduzido ainda precisam de revisão prática.

## Teste rápido com colegas — ainda não realizado

Convide duas ou três pessoas e observe sem explicar os controles antes. Peça que cada uma: (1) faça uma pergunta, (2) tente resolver uma pegadinha, (3) encontre Pular, e (4) identifique onde aparece a resposta útil. Alterne entre celular e computador quando possível.

Registre apenas observações agregadas, sem copiar perguntas privadas:

| Pessoa | Dispositivo | Concluiu? | Encontrou Pular? | Onde travou? | Entendeu a resposta? |
|---|---|---|---|---|---|
| A | — | — | — | — | — |
| B | — | — | — | — | — |
| C | — | — | — | — | — |

Depois, priorize os problemas repetidos e documente o que foi alterado. Não marque “testado com usuários” no roadmap antes de realizar as sessões.
