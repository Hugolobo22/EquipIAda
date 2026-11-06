# Catálogo de 20 pegadinhas — especificação, não implementação

Dificuldade: B baixa, M média, A alta. Todas são opcionais e reversíveis; o Diretor de Caos define elegibilidade e limites.

| ID | Nome | Gatilho | Comportamento | Dificuldade |
|---|---|---|---|---|
| 01 | Prompt insuficiente | Pergunta curta | Exige detalhes | B |
| 02 | Não sou bibliotecária | Prompt longo | Reclama do textão | B |
| 03 | Indecisa | Reformulações repetidas | Questiona indecisão | B |
| 04 | Interrogatório | Tentativa de resposta | Devolve perguntas | M |
| 05 | Enter traidor | Enter na caixa | Insere linha e provoca | B |
| 06 | Botão fugitivo | Cursor/ação de enviar | Botão foge | M |
| 07 | Palavra mágica | Insistência | Pede 'por favor' | B |
| 08 | Ladrão de palavras | Pergunta pronta | Oculta palavras apenas visualmente | A |
| 09 | Campo rebelde | Edição do prompt | Campo desloca um pouco | M |
| 10 | Apagão digital | IA sobrecarregada | Tela escurece | M |
| 11 | Lanterna virtual | Apagão | Foco revela interruptor | M |
| 12 | Mundo invertido | Pânico encenado | Gira interface e restaura | M |
| 13 | Janela infinita | Insistência | Modal dentro de modal limitado | M |
| 14 | Manutenção emergencial | IA ganha tempo | Simula manutenção cômica | B |
| 15 | Soneca remunerada | Ociosidade | Mascote dorme | M |
| 16 | Sequestro do botão | Tentativas repetidas | IAda segura e desloca botão | A |
| 17 | Terceirização | IA perde discussão | Chama IA fictícia relutante | M |
| 18 | InstaIAda | Easter egg clicado | Feed fictício de memes | A |
| 19 | Carregamento dramático | Pré-resposta | Barra cômica de progresso | B |
| 20 | A última pergunta | Antes de se render | Pergunta provocadora e responde | M |

## Vínculos de contexto
- Prompt curto → 01; texto longo → 02; reformulação → 03; insistência → 04/07/20.
- Mouse/teclado → 05/06/09/16; no toque, ajustar desafios.
- Pegadinhas encadeadas: 10 + 11 é um único desafio composto para fins de contagem.
- Novidades eventuais: 12/17/18; 15 apenas se não interromper escrita.

## Status efetivo do protótipo
O Diretor de Caos possui um catálogo tipado e escolhe por contexto, traços e movimento reduzido. `01`, `02`, `04` e `14` têm falas e ações de resolução; `06/16` mantém a animação parcial de roubo do botão; `05` provoca ao pressionar Enter; `07` pede “por favor” em um campo próprio; `08` mascara duas palavras apenas na apresentação e exige uma ação para cada devolução; `10/11` formam um único desafio de apagão, lanterna e interruptor; `19` aparece como atraso dramático em fala, sem barra própria. Enquanto uma pegadinha está ativa, Enviar não conta nova tentativa. São demonstrações, não as pegadinhas completas da tabela. Após a encenação, a resposta útil pode vir do Ollama local configurado. As demais seguem não implementadas.

## Anti-loop e UX
No máximo quatro sabotagens principais por pergunta por padrão. Botão de pular acessível mesmo com tela escura ou invertida. Nunca destruir prompt real, bloquear foco ou dar impressão de falha técnica real persistente. Quando limite chega, o personagem pode fazer uma contrapergunta **retórica** sem exigir outra resposta do usuário antes de entregar a explicação útil.
