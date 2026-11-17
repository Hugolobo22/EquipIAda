# Requisitos e critérios de aceite

Fonte: visão do produto, decisões desta conversa e critérios acadêmicos fornecidos em 09/11/2026. Não foram realizadas entrevistas com usuários nem levantamentos externos. A principal hipótese de produto é que um número limitado de obstáculos humorísticos torna a interação divertida; essa hipótese ainda precisa de teste com colegas.

## Requisitos funcionais

| ID | Requisito | Critério de aceite | Evidência automatizada |
|---|---|---|---|
| RF01 | Receber e preservar a pergunta original | Espaços e conteúdo permanecem iguais ao primeiro envio; desafios não a reescrevem | `sessionEngine.test.mjs`, `wordTheft.test.mjs`, navegador |
| RF02 | Escolher cenas limitadas e sem repetição | Orçamento fixado entre 2 e 4; mesma cena não se repete na pergunta | `sessionEngine.test.mjs` |
| RF03 | Resolver ou pular desafios | Enviar não resolve cena ativa; ação própria resolve; Pular funciona inclusive no apagão e na transição | `experience.spec.ts` |
| RF04 | Obter uma resposta real local | A rota consulta Ollama com a pergunta original; `localOnly` impede seleção paga pela UI | `checkDemo.test.mjs` e cenário opcional real do navegador |
| RF05 | Cancelar, repetir e reiniciar | Cancelamento mantém a pergunta; repetir não cria novas cenas; reinício ignora resposta antiga | `experience.spec.ts` |
| RF06 | Avaliar voluntariamente a experiência | Duas notas válidas e cenas são gravadas só após confirmação, sem perguntas/respostas | `feedback.test.mjs`, `feedback.spec.ts` |
| RF07 | Persistir e consultar avaliações | Notas sobrevivem à reabertura; repetição de envio não duplica; API retorna resumo agregado | `feedbackRepository.test.mjs`, `feedback.spec.ts` |

## Requisitos não funcionais

| ID | Requisito | Critério de aceite e limite |
|---|---|---|
| RNF01 | Privacidade | Contrato fechado de feedback; dados livres rejeitados; prompts não registrados por padrão; banco real ignorado pelo Git |
| RNF02 | Recuperação de falhas | Erro de modelo ou banco mantém a UI utilizável e permite repetir/reiniciar; transações não deixam avaliação parcial |
| RNF03 | Acessibilidade | Controles sem dependência exclusiva de mouse, foco progressivo e movimento reduzido; testes simulados existem, aparelho físico e leitor de tela pendentes |
| RNF04 | Limites e segurança de entrada | Pergunta até 4.000 caracteres/16 KB; feedback até 2 KB, notas 1–3 e no máximo quatro cenas conhecidas; SQL parametrizado; credenciais só no servidor |
| RNF05 | Execução local reproduzível | Node ≥22.13, npm, migração versionada, `.env.example`, modelo Ollama instalado e README com passos completos |
| RNF06 | Testabilidade | Regras puras independem de React/GSAP; SQLite temporário real para integração; fixtures de modelo separadas da consulta real |
| RNF07 | Tempo de resposta limitado | Backend local tem timeout de 90 s e cancelamento na interface; latências de amostras não são garantia de desempenho |
| RNF08 | Honestidade da resposta | Resposta factual fica separada da personagem e é identificada como gerada por modelo local; erros conhecidos são documentados, sem promessa de verificação factual |

## Aceite da fatia de banco

- Criar a estrutura sem copiar um banco desta máquina.
- Ler resumo vazio, preencher duas notas pela UI e salvar.
- Reabrir o arquivo e obter a mesma contagem.
- Repetir o envio com o mesmo identificador sem inflar métricas.
- Provocar falha na tabela filha e confirmar rollback do registro pai.
- Rejeitar campos de pergunta/resposta, notas fora do intervalo e cenas inválidas.
- Reproduzir erro de API na UI e salvar novamente sem perder a resposta exibida.

O aceite acadêmico completo também depende de UC HUB, envio da versão pública, instalação em outro ambiente e domínio individual. Esses itens não são substituídos por testes automatizados.
