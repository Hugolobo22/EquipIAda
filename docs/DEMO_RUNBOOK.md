# Roteiro de apresentação local

## Antes de abrir a página

1. Inicie o Ollama e confira que o modelo configurado em `.env.local` está instalado. Nesta máquina, o modelo é `qwen3:8b`; `.env.example` mantém `qwen3:4b-instruct` para máquinas mais leves.
2. Abra `Iniciar EquipIAda.cmd` na pasta do projeto ou execute `npm run local` e mantenha a janela aberta. O iniciador confere a configuração e o modelo, inicia Ollama se necessário e mantém o Next.js em `127.0.0.1:3000`. Ctrl+C encerra a aplicação. Para desenvolvimento manual, `npm run dev` continua disponível.
3. Em outro terminal, execute `npm run demo:check`. O comando verifica `ANSWER_PROVIDER=ollama`, a lista de modelos, aquece o modelo, confirma `http://127.0.0.1:3000` e faz uma pergunta sintética por `/api/ask`. O aquecimento mantém o modelo carregado por até dez minutos. A consulta usa `localOnly: true` e é recusada se o servidor estiver configurado com outro provedor.
4. Se o Next.js escolher outra porta, no PowerShell use `$env:DEMO_APP_URL='http://127.0.0.1:3001'; npm run demo:check` com a porta mostrada no terminal.

Se o diagnóstico falhar, siga a mensagem exibida: iniciar Ollama, baixar o modelo com `ollama pull NOME_DO_MODELO`, corrigir `.env.local` ou iniciar a página. O aquecimento direto não consome o limite da rota; a verificação de resposta pela aplicação consome uma das 20 consultas por hora.

Neste notebook, o Node está em `C:\Program Files\nodejs` e o Ollama portátil em `%LOCALAPPDATA%\EquipIAda\ollama`; o iniciador encontra o Ollama sem depender do PATH do terminal. A configuração local ignorada pelo Git usa `qwen3:8b`. O inicializador não baixa programas nem modelos. Em outra máquina, prepare Node, dependências, Ollama e o modelo antes de iniciar.

## Ensaio no notebook da apresentação — 11 de novembro

Validado no Acer Nitro ANV15-41, Ryzen 7 7735HS, 32 GB de RAM e RTX 4050 Laptop de 6 GB, com Node 26.13.0, npm 11.20.0, Ollama 0.40.16 e `qwen3:8b`. O modelo já estava baixado; foi instalado o executável portátil oficial ausente, com SHA-256 conferido contra o release oficial. Nenhuma chamada paga foi habilitada.

O arquivo `Iniciar EquipIAda.cmd` foi executado com Ollama e aplicação inicialmente parados. Ele iniciou os dois serviços e abriu o Next.js somente em `127.0.0.1:3000`. Passaram os 38 testes de regras e banco, os 16 casos completos no Chrome (incluindo modelo real e banco de teste), typecheck, lint e build. O diagnóstico no servidor da apresentação recebeu a resposta de controle por `/api/ask` em cerca de 2,9 s após aquecimento. O tempo varia conforme a pergunta e a carga do notebook.

O banco da apresentação abriu com migração 1 e zero avaliações. Os registros sintéticos ficaram em bancos separados; os testes comprovaram persistência, atualização sem duplicação, rollback e recuperação de falhas pela interface. As capturas desta execução usam a data corrente e preservam as evidências de 09/11. [Relatório do notebook](../reports/notebook-readiness-2026-11-11.json).

No dia, conecte o carregador, abra o iniciador, mantenha sua janela aberta e execute `npm run demo:check` pouco antes de demonstrar. Abra `http://127.0.0.1:3000` no Chrome. O modelo pode sair da memória depois do período de inatividade; repita o diagnóstico se necessário. A rolagem permite mostrar a resposta e o formulário abaixo do palco. Use o iniciador ou `npm run local`: a rota de resposta bloqueia deliberadamente o modo de produção usado por `npm start`.

Este ensaio valida este notebook com a cópia local existente. Não foi feito um clone limpo do GitHub nem o teste formal em outro ambiente. Testes com colegas, leitor de tela e toque físico continuam pendentes. As respostas do modelo continuam sujeitas a erro factual.

## Demonstração sugerida

- Faça uma pergunta curta e conhecida, como “Quanto é 20% de 150?”. Mostre que Enviar repetidamente não resolve um desafio ativo.
- Resolva uma pegadinha com a ação própria e observe a continuação automática após a fala de conclusão. Não é preciso apertar Enviar de novo. Pular permanece disponível inclusive nessa pausa.
- Experimente a manutenção: os dois ajustes podem ser feitos em qualquer ordem. No carregamento dramático, dois empurrões completam a coragem fictícia, separada da resposta real.
- Faça uma pergunta conceitual já ensaiada. A execução mais recente de 23 perguntas teve mediana de cerca de 3,5 s, mas isso não prevê o tempo de outra pergunta. A revisão encontrou dois erros factuais e duas respostas para revisar. Confira o texto antes de usá-lo como exemplo factual.
- Durante a espera, mostre **Cancelar resposta** e depois **Tentar novamente**. A pergunta original continua visível; o cancelamento encerra a espera na interface, mas a liberação imediata do processamento no Ollama depende da propagação do sinal pelo servidor.
- Se o modelo falhar, mostre a mensagem recuperável e Reiniciar pergunta. Não apresente resposta pré-gravada como se fosse geração em tempo real.

## Verificações feitas no navegador

Em viewport de 390 px, o passeio automático cortava o balão; o deslocamento foi limitado em telas estreitas. Em 320 px, a página não teve rolagem horizontal, a pegadinha e Pular ficaram visíveis, o foco do botão do desafio ficou visível e Pular preservou a pergunta original. O fluxo de espera, Cancelar resposta e Tentar novamente foi verificado no navegador: o foco permaneceu no painel e o campo e a última pergunta mantiveram o texto original.

Em 9 de novembro de 2026, passaram 11 cenários em Chrome automatizado: quatro desafios e resposta única; cancelamento e nova tentativa; mensagem de limite; devoluções do ladrão de palavras; apagão e reinício em 320 e 390 px; reinício durante consulta com descarte de resposta antiga; conclusão do roubo animado; Pular durante o roubo; resposta real do Ollama na interface; restauração das posições do mascote e do botão. Os casos de recuperação usaram respostas simuladas identificadas como fixtures. O cenário de resposta útil consultou `qwen3:8b` de verdade. A verificação por `/api/ask` respondeu a pergunta de controle em cerca de 2,7 s após aquecimento; isso não prevê o tempo de outras perguntas.

Touch e movimento reduzido foram simulados no navegador. Toque em aparelho físico, leitor de tela e sessões com colegas seguem pendentes. Os resultados e uma captura da resposta real estão em `reports/local-validation-2026-11-09.json` e `reports/local-validation-2026-11-09.png`.

Validação final desta alteração: 29 testes aprovados com `node --experimental-strip-types --test tests/*.test.mjs`; tipos com `node node_modules/typescript/bin/tsc --noEmit`; lint com `node node_modules/eslint/bin/eslint.js .`; build com `node node_modules/next/dist/bin/next build`. Os executáveis dos scripts do package.json foram chamados diretamente porque o ambiente não disponibilizava `npm` no PATH. O iniciador `.cmd` também foi executado após encerrar o Ollama preparado na sessão e conseguiu iniciar o serviço e a aplicação novamente.

Arquivos desta estabilização: `src/types/session.ts`, `src/lib/sessionEngine.ts`, `src/hooks/useMascotScene.ts`, `src/components/Scene.tsx`, `src/app/globals.css`, `src/app/api/ask/route.ts`, `scripts/checkDemo.mjs`, `scripts/startLocal.mjs`, `Iniciar EquipIAda.cmd`, `package.json`, `tests/sessionEngine.test.mjs`, `tests/checkDemo.test.mjs`, README, arquitetura, roadmap e este roteiro. A configuração `.env.local` é ignorada pelo Git. A preparação também colocou Ollama e Node portáteis em `%LOCALAPPDATA%\EquipIAda` e o modelo em `%USERPROFILE%\.ollama`.

## Melhoria de ritmo e pegadinhas — 9 de novembro

Rodadas de até 80 caracteres têm duas cenas; as demais têm três. Apenas perguntas com mais de 400 caracteres e drama inicial alto chegam a quatro. O orçamento fica fixo durante a pergunta. Resolver uma cena dá 1,2 s para a fala de conclusão e avança sozinho. Pular, Reiniciar e desmontar a cena cancelam o timer. O passeio e os controles de humor aguardam a rodada terminar. Acenos e poses retornam a repouso; o gesto de pegar acompanha o roubo.

Passaram **32 testes de regras** e **12 cenários Playwright no Chrome**, incluindo uma rodada completa com resposta real do Ollama. Os outros casos de resposta usam fixtures e não medem a qualidade do modelo. Os cenários cobrem continuação automática, manutenção nos dois controles, barra de coragem por teclado, foco, Pular e Reiniciar durante a pausa, cancelamento e nova tentativa, ladrão de palavras, erro de limite, descarte de resposta antiga, gestos temporários, roubo animado e telas de 320/390 px com touch e movimento reduzido simulados. As capturas estão em `reports/maintenance-preview-2026-11-09.png`, `reports/dramatic-preview-2026-11-09.png` e `reports/experience-2026-11-09.png`.

Para reproduzir, com Google Chrome instalado:

```powershell
npm run test
npm run test:browser
$env:EQUIPIADA_REAL_MODEL='true'
npm run test:browser
```

O modo padrão simula respostas para testar a interface. A variável habilita apenas o cenário identificado como consulta real ao Ollama; a proteção `localOnly` continua ativa. Após a adequação A3, os testes iniciam servidor próprio na porta 3100 e banco SQLite separado da aplicação da porta 3000. Os artefatos temporários do Playwright são ignorados pelo Git.

Tipos, lint e build também passaram. O cenário real foi repetido após a nota da resposta e a descrição acessível do mascote em português. O relatório consolidado está em `reports/experience-validation-2026-11-09.json`.

Arquivos desta melhoria: motor e tipos da sessão, falas e estado do mascote, `useMascotScene.ts`, `Scene.tsx`, `Mascot.tsx`, novo `PrankTasks.tsx`, estilos, instruções em `askApi.ts`, roteiro de avaliação, testes de regras e de navegador, `playwright.config.ts`, manifests/lockfile, `.gitignore` e documentação. Não foram implementadas as 20 pegadinhas completas nem novos desenhos de expressão. Toque físico, leitor de tela e testes com colegas permanecem pendentes.

## Teste rápido com colegas — ainda não realizado

O formulário **Valeu a insistência?** agora permite registrar notas reais voluntárias depois da resposta. Ele não armazena perguntas ou respostas. Os bancos usados pelos testes automatizados são separados e seus registros sintéticos não contam como testes com colegas. A migração e o roteiro de banco estão em `docs/DATABASE.md`; a evidência atual de adequação está em `reports/a3-validation-2026-11-09.json`.

Convide duas ou três pessoas e observe sem explicar os controles antes. Peça que cada uma: (1) faça uma pergunta, (2) tente resolver uma pegadinha, (3) encontre Pular, e (4) identifique onde aparece a resposta útil. Alterne entre celular e computador quando possível.

Registre apenas observações agregadas, sem copiar perguntas privadas:

| Pessoa | Dispositivo | Concluiu? | Encontrou Pular? | Onde travou? | Entendeu a resposta? |
|---|---|---|---|---|---|
| A | — | — | — | — | — |
| B | — | — | — | — | — |
| C | — | — | — | — | — |

Depois, priorize os problemas repetidos e documente o que foi alterado. Não marque “testado com usuários” no roadmap antes de realizar as sessões.
