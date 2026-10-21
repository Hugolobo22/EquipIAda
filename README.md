# EquipIAda — Protótipo animado da IAda

Um protótipo **executável** do mascote expressivo e flutuante da EquipIAda. O projeto é feito em **Next.js 16 + React 19 + TypeScript + GSAP**, com mascote **SVG vetorial próprio** (não uma imagem estática).

## Referência visual

O arquivo `docs/referencia-visual-IAda.png` registra o conceito de identidade visual aprovado na conversa. O SVG implementado é simplificado, com camadas animáveis e degradês, para facilitar a prototipação.

## Como executar

Requisitos: Node.js 20.9+ e npm.

```bash
npm install
npm run dev
```

Acesse http://localhost:3000.

Para conferir tipos e build:

```bash
npm run typecheck
npm run lint
npm run build
```

## O que funciona

| Recurso | Implementação |
|---|---|
| Olhos seguem cursor | `onPointerMove` atualiza variáveis CSS sem renderizar o React a cada pixel |
| Flutuação, piscadas | Keyframes CSS isolados por partes do SVG |
| Cinco expressões | Normal, curiosa, sarcástica, irritada e sonolenta |
| Balões de fala | Textos reativos ligados ao estado do mascote |
| Braços e gestos | SVG em camadas; aceno, apontar, pegar e shrug |
| Passear pela página | GSAP reposiciona o ator no palco, com passeios automáticos |
| Roubo do botão | Timeline GSAP desloca o mascote até o botão, depois os dois se movimentam juntos |
| Liberar/ignorar | Controle "Pular pegadinha" sempre acessível |
| Tecla Enter rebelde | Enter quebra linha; Ctrl/⌘ + Enter tenta enviar |
| Mobile | Estilos responsivos; interação não depende de mouse |

**Importante:** a resposta final é uma **simulação deliberada**. Não há integração com modelo de IA nem envio externo de prompts neste protótipo. O objetivo desta entrega é validar movimentos, gestos e dramaturgia da IAda.

## Estrutura

```text
src/
  app/
    page.tsx                 # Página principal
    layout.tsx               # Metadados e tipografia
    globals.css              # Layout, personagem, keyframes, responsividade
  components/
    Mascot.tsx               # SVG editável (corpo, olhos, braços, rosto)
    Scene.tsx                # Palco, campo de pergunta, controles e UX
  hooks/
    useMascotScene.ts        # Diretor de cena, pointer tracking, GSAP
  lib/
    mascotReducer.ts         # Regras de transição de estado
  types/
    mascot.ts                # Tipos, eventos e emoções
```

## Contrato de estado

`MascotEmotion` possui `neutral`, `curious`, `sarcastic`, `annoyed`, `sleepy`.

`MascotGesture` possui `idle`, `wave`, `point`, `grab`, `shrug`.

O `mascotReducer` recebe eventos como `SPEAK`, `SET_EMOTION`, `SET_GESTURE` e `REGISTER_ATTEMPT`; não contém lógica de renderização. `useMascotScene` coordena a interface com o GSAP e aplica limites de interação.

## Como plugar uma IA real depois

1. Criar `src/app/api/ask/route.ts` para consultar o provedor **no servidor** (nunca expor token no browser).
2. Manter pergunta original em estado separado dos textos visualmente sabotados.
3. Passar o contexto e o número de tentativas para o **Diretor de Caos**, que selecionará apenas ações permitidas.
4. Consultar o modelo para a resposta útil, após o número máximo de interações ou a opção de pular.
5. Validar a estrutura dos eventos retornados (por exemplo, com Zod) e aplicar limites de custo, tempo, abuso e tamanho do prompt.

## Acessibilidade e limitações

- A ação de pular permite sair da encenação a qualquer momento.
- Em `prefers-reduced-motion`, animações CSS são minimizadas. É recomendável também reduzir durações dos tweens GSAP na implementação de produção.
- Em telas touch, os olhos ficam em posição neutra; as demais animações funcionam por toque.
- O roubo do botão é um efeito visual com retorno automático, não altera o texto original.
- Este SVG é uma interpretação vetorial simplificada do conceito aprovado. Para uma identidade final de maior fidelidade, pode ser substituído por um arquivo Rive, mantendo a mesma API de estados e gestos.
