# Testes automatizados e evidências

Em **17/11/2026**, antes do envio ao GitHub, Next.js e `eslint-config-next` foram corrigidos para 16.4.5. Passaram 38 testes de regras/banco, 15 cenários de navegador, tipos, lint e build. Um cenário ficou ignorado por ser a consulta opcional ao Ollama real, não habilitada nesta execução; as respostas simuladas e o SQLite real isolado foram usados nos demais casos. A auditoria de execução ficou com zero alertas; a auditoria completa ainda aponta 15 em ferramentas de desenvolvimento. `next-env.d.ts` passou a ser ignorado pelo Git, conforme o guia incluído no Next.js, pois é gerado novamente por `next dev`, `next build` ou `next typegen`. [Relatório da revisão](../reports/pre-publication-validation-2026-11-17.json).

Em **11/11/2026**, o ensaio no notebook da apresentação passou nos 38 testes de regras/banco e em uma execução completa dos 16 cenários Chrome, com o caso real do Ollama habilitado. Typecheck, lint, build, inicialização pelo `.cmd` e diagnóstico pela aplicação também passaram. Node 26.13.0, SQLite 3.54.0, Ollama 0.40.16 e `qwen3:8b`. As capturas têm a data de cada execução para preservar evidências anteriores. [Relatório deste notebook](../reports/notebook-readiness-2026-11-11.json). A cópia local foi testada; um clone limpo em outro ambiente continua pendente.

O usuário informou que o conteúdo principal da UC foi testes automatizados. Este documento relaciona os requisitos ao que o projeto realmente testa, sem transformar um relatório de execução em garantia de correção geral ou em teste com colegas.

## Camadas

| Camada | Ferramentas e arquivos | O que prova | O que não prova |
|---|---|---|---|
| Regras e validação | `node:test`; `sessionEngine`, `wordTheft`, `contextualSpeech`, `askApi`, `feedback` | Limites, preservação do original, seleção, contratos e casos de borda | Layout, efeitos GSAP ou precisão do modelo |
| Diagnóstico | `tests/checkDemo.test.mjs` com processo separado e fetch simulado | Diagnóstico não declara sucesso quando a rota falha ou aponta para provedor pago | Disponibilidade real do Ollama |
| Integração SQLite | `tests/feedbackRepository.test.mjs` com arquivo temporário real | Migração, chaves, transação/rollback, atualização sem duplicação e persistência após fechar e reabrir | Funcionamento do formulário no navegador |
| Fluxo de interface | Playwright/Chrome; `tests/browser/experience.spec.ts` | Foco, desafios, transições, cancelamento, recuperação e responsividade simulada | Toque físico, leitor de tela e diversão percebida |
| Integração UI → API → banco | `tests/browser/feedback.spec.ts` | Consentimento explícito, gravação real, consulta após recarregar e recuperação de erro | Aplicação em outra máquina ou banco de produção |
| Modelo local | Cenário opcional real, `demo:check` e `evaluateAnswers.mjs` | Consulta de verdade ao Ollama e avaliação de amostras sintéticas | Verificação factual automática ou confiabilidade estatística |

## Como executar

```bash
npm ci
npm run db:init
npm run test
npm run typecheck
npm run lint
npm run build
npm run test:browser
```

Os testes de regras e banco não usam modelo nem rede. A integração SQLite trabalha em diretórios temporários e encerra as conexões antes de removê-los. A falha de gravação é produzida por um trigger de teste que aborta a inclusão na tabela filha; o teste verifica que o registro pai foi revertido e uma operação posterior funciona.

O Playwright requer Google Chrome, inicia porta 3100 com `.next-test` e usa um arquivo `data/test-feedback-<processo>.sqlite`. O arquivo real `data/equipiada.sqlite` não recebe avaliações sintéticas dos testes. A porta 3100 deve estar livre. O arquivo de teste pode ser inspecionado localmente, mas é ignorado pelo Git.

O modo padrão usa fixtures apenas para a resposta do modelo; os testes de feedback atravessam a rota HTTP e o SQLite reais. Para incluir o cenário de resposta real:

```powershell
$env:EQUIPIADA_REAL_MODEL='true'
npm run test:browser
Remove-Item Env:EQUIPIADA_REAL_MODEL
```

Nesse modo Ollama e o modelo configurado precisam estar disponíveis. A consulta mantém `localOnly: true`. Os relatórios completos de resposta sintética e suas limitações ficam em [ANSWER_EVALUATION.md](ANSWER_EVALUATION.md).

## Casos de banco essenciais para a banca

1. Banco novo retorna total zero e médias nulas; migração registra versão 1.
2. Uma avaliação com duas cenas gera um registro pai e duas linhas filhas na ordem correta.
3. Fechar e reabrir a conexão preserva os dados.
4. Repetir o UUID não duplica; alterar notas com o mesmo UUID atualiza a avaliação e suas cenas.
5. Falha na inclusão da cena reverte toda a transação.
6. SQLite rejeita notas inválidas e chave estrangeira sem registro pai.
7. API rejeita campos de pergunta/resposta, corpo excessivo, tipo incorreto e notas fora do intervalo.
8. UI não grava automaticamente; após falha, a resposta permanece e o formulário pode tentar novamente.

## Registro e limitações

Antes desta adequação, a evidência era de 32 testes de regras e 12 cenários no Chrome. Na adequação A3 passaram **38 testes de regras/validação/diagnóstico e banco**, incluindo quatro integrações com SQLite real, e **16 cenários no Chrome** (15 na execução completa, mais o novo caso de formulário em 320 px). Um cenário consultou o Ollama real; os testes de feedback atravessaram HTTP e banco reais. Tipos, lint e build passaram. Os seis testes de feedback/banco foram repetidos após o ajuste final de caminho. Evidências e limitações: `reports/a3-validation-2026-11-09.json`.

Build, lint e tipos são verificações estáticas/de compilação, não substitutos dos testes funcionais. Não existe percentual de cobertura medido; não afirmar cobertura total. Um teste passar não prova diversão nem veracidade da resposta. Toque físico, leitor de tela, execução em outra máquina e validação com colegas permanecem pendentes.

## Ensaio em outra máquina

Seguir apenas o README, clonando a versão entregue. Registrar: commit, sistema operacional, versão do Node/Ollama, modelo, comandos executados, migração do banco, uma resposta real e uma avaliação salva e lida após reiniciar. Anotar erros e correções reais. Uma pasta de teste na mesma máquina é uma verificação útil, mas não cumpre sozinha o requisito de outro ambiente do documento A3.
