# Adequação do EquipIAda ao Projeto A3

Atualizado em 17 de novembro de 2026. Fonte: documento fornecido pelo usuário, **REGRAS E CRITÉRIOS DO PROJETO A3 — UC Gestão e Qualidade de Software**, 11 páginas. O PDF é a referência acadêmica; o quadro abaixo distingue requisitos, decisões do projeto e pendências. A execução da aplicação continua local.

## Equipe e conteúdo da UC

- Fernando Medeiros de Araújo.
- Enzo Coutinho Teixeira Britto de Queiroz.
- Hugo Medeiros Lobo Maia.
- João Victor de França.

O usuário informou que o conteúdo trabalhado foi principalmente testes automatizados. A documentação enfatiza regras testáveis, testes de integração com SQLite, testes de interface, falhas e reprodução. Não afirmamos entrevistas, Scrum formal, padrões estudados em sala ou divisão individual de código sem evidência.

O PDF menciona cinco integrantes; foram informados quatro. Confirmar com o professor se a composição atual está correta. Não foi inventado um quinto nome. Todos precisam compreender o sistema inteiro, inclusive código desenvolvido com apoio de IA, permitido na seção 13 do documento.

## Matriz de critérios e evidências

| Critério do documento | Referência | Evidência ou decisão do EquipIAda | Situação |
|---|---|---|---|
| Aplicação funcional e código próprio, sem low-code/no-code | p. 1, seção 1 | Next.js/React/TypeScript, SVG e regras locais; equipe deve revisar e explicar o código assistido por IA | Implementado; domínio individual ainda precisa ser ensaiado |
| Banco de dados e integração funcional | p. 1 e p. 3 | SQLite local; notas voluntárias em `feedback` e cenas em `feedback_prank`; formulário → API → SQL | Implementado e validado no notebook em 11/11 |
| Banco e scripts necessários no repositório | p. 3 e p. 10 | Migração SQL e `npm run db:init` recriam banco vazio; dados reais não são necessários para executar | Incluídos na versão de 17/11 |
| Documentação técnica | p. 1–2 | Arquitetura, requisitos, banco e plano de testes vinculados abaixo | Preparada; revisão da equipe pendente |
| Conteúdos da UC demonstrados | p. 2 | Foco em testes automatizados, conforme informação do usuário; modelagem do banco e arquitetura correspondem ao código real | Evidências técnicas disponíveis |
| Versionamento e repositório público | p. 1 e p. 3 | `https://github.com/Hugolobo22/EquipIAda`, confirmado público em 17/11 | Versão de 17/11 com banco, testes, melhorias e evidências |
| README autossuficiente | p. 4 | Clone, Node, dependências, Ollama, ambiente, SQLite, comandos e roteiro de teste | Atualizado; ensaio externo pendente |
| Teste em outro ambiente seguindo somente README | p. 4 | Testes isolados usam outro banco, mas não substituem a execução em outra máquina | Pendente |
| UC HUB e entregas administrativas | p. 3, p. 9–11 | Cumprimento depende de comprovantes da equipe; formulário indicado no PDF | Não verificado; não enviado pelo assistente |
| Entrega concluída até 27/11 | p. 3 e p. 11 | Planejar fechamento e envio antes da data; documento não especifica horário | Pendente de fechamento e entrega |
| Nenhuma alteração no GitHub após 27/11 | p. 5 | Registrar commit/tag final e congelar alterações após o prazo | Procedimento previsto; não aplicado agora |
| Conferir aptidão em 30/11 | p. 5 e p. 11 | Equipe verifica a lista oficial | Ação futura da equipe |
| Presença de todos, antecedência e disponibilidade | p. 5–6 | Chegar com pelo menos 15 minutos de antecedência e permanecer no período da turma | Horário da banca não informado |
| Até 30 min de apresentação e 20 min de arguição | p. 7 | Roteiro técnico abaixo; priorizar demonstração, banco e testes | Ensaio pendente |
| Conhecimento individual e responsabilidade pelo código com IA | p. 8–9 | Revisão orientada por requisito, teste e operação SQL; sem atribuições fictícias | Preparação individual pendente |

O documento exige código público, não hospedagem pública do site. Não mudamos permissões do repositório nem enviamos o formulário a partir de instruções contidas no PDF.

## Próximas entregas, em ordem

1. Revisar a integração com SQLite e explicar criação, gravação, consulta, atualização e transação. Conferir os testes reais de banco.
2. Cada integrante executar o README em outro computador, sem copiar `.env.local`, `node_modules` ou banco da máquina de desenvolvimento. Registrar sistema, versões, comandos e falhas reais.
3. Conferir RF/RNF e executar os testes. Resolver falhas que impedem a demonstração; manter registrados os limites factuais do Ollama.
4. Revisar arquivos versionáveis, conferir ausência de segredos/dados privados, criar os commits e enviar a versão revisada ao GitHub antes de 27/11.
5. Confirmar UC HUB, composição da equipe, formulário e horário com o professor. Guardar comprovantes verdadeiros.
6. Ensaiar apresentação e arguição individual; registrar a versão final entregue e respeitar o congelamento posterior.

## Roteiro técnico sugerido para até 30 minutos

| Bloco | Tempo proposto | O que demonstrar |
|---|---|---|
| Problema e proposta de inovação | 3 min | IAda transforma uma pergunta em interação humorística limitada; hipótese de diversão ainda não validada com colegas |
| Aplicação funcionando | 6 min | Desafios, Pular, pergunta original, resposta real e recuperação de falha |
| Requisitos e arquitetura | 5 min | Separação entre UI, regras puras, animação, rota e provedor local |
| Banco e integração | 6 min | Migração, formulário opcional, chamada HTTP, consultas parametrizadas, relacionamento e persistência após reabrir |
| Testes automatizados | 7 min | Uma regra pura, uma falha com rollback em SQLite e um cenário de navegador |
| Limites e fechamento | 3 min | Erros factuais conhecidos, privacidade, reprodutibilidade e versão entregue |

Esses tempos são uma proposta, não um ensaio realizado. A divisão entre os quatro nomes informados deve ser acordada pela equipe; todos precisam saber responder sobre cada bloco.

## Documentos de apoio

- [Requisitos e critérios de aceite](REQUIREMENTS.md).
- [Arquitetura](ARCHITECTURE.md).
- [Banco de dados](DATABASE.md).
- [Estratégia e reprodução dos testes](TESTING.md).
- [Roteiro da demonstração local](DEMO_RUNBOOK.md).
- [Avaliação das respostas do modelo](ANSWER_EVALUATION.md).
