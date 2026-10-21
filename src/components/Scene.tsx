"use client";

import { useState, type KeyboardEvent } from "react";
import {
  ArrowRight, BrainCircuit, CheckCircle2, ChevronRight,
  Coffee, CornerDownLeft, Eye, Hand, MessageCircle, MousePointer2,
  MoveUpRight, RotateCcw, Send, Sparkles, WandSparkles,
} from "lucide-react";
import { Mascot } from "@/components/Mascot";
import { EMOTIONS, type MascotEmotion } from "@/types/mascot";
import { useMascotScene } from "@/hooks/useMascotScene";

const faceIcons: Record<MascotEmotion, string> = {
  neutral: "◡", curious: "?", sarcastic: "↗", annoyed: "!", sleepy: "zZ",
};

export function Scene() {
  const scene = useMascotScene();
  const [question, setQuestion] = useState("Como funciona o JavaScript?");
  const [aboutOpen, setAboutOpen] = useState(false);

  function onInputKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      scene.send(question);
    } else if (event.key === "Enter" && !event.shiftKey) {
      // Enter mantém comportamento de textarea (quebra de linha).
      scene.enterTease();
    }
  }

  return (
    <div className="page-shell">
      <div className="background-flare flare-one" aria-hidden="true" />
      <div className="background-flare flare-two" aria-hidden="true" />
      <header className="topbar layout-width">
        <a href="#inicio" className="brand" aria-label="EquipIAda — início">
          <span className="brand-emblem"><Sparkles size={21} strokeWidth={2.6}/></span>
          <span>Equip<span className="brand-accent">IA</span>da<span className="brand-dot">.</span></span>
        </a>
        <nav className="topnav" aria-label="Navegação">
          <a href="#laboratorio" className="active-nav">Laboratório</a>
          <a href="#controles">Personalidade</a>
          <button type="button" onClick={() => setAboutOpen(!aboutOpen)} aria-expanded={aboutOpen}>Sobre o protótipo</button>
        </nav>
        <div className="top-status"><span className="status-light"/> IAda está acordada <span className="status-divider">·</span> v0.1</div>
      </header>

      <main className="layout-width" id="inicio">
        <div className="intro">
          <div className="eyebrow"><span className="eyebrow-spark">✦</span> CONHEÇA A IA MENOS PRESTATIVA DA INTERNET <span className="eyebrow-spark">✦</span></div>
          <h1>Ela tem todas as respostas.<br/><span>Só não quer te dar.</span></h1>
          <p>Faça uma pergunta. Conheça a IAda. E boa sorte tentando fazê-la trabalhar.</p>
        </div>

        {aboutOpen && (
          <section className="about-inline" aria-label="Sobre o protótipo">
            <strong>Uma demonstração de interação, ainda sem modelo de IA.</strong>
            <span>Este MVP foca no mascote: olhos, piscadas, emoções, gestos, movimentação e roubo do botão. O texto final é simulado; nenhuma pergunta é enviada a um serviço externo.</span>
          </section>
        )}

        <div className="workspace" id="laboratorio">
          <section className="stage-frame" aria-label="Palco interativo da IAda">
            <div className="stage-top">
              <div className="stage-pills"><span className="purple-pill"><span className="purple-pulse"/> {scene.stolen ? "BOTÃO SEQUESTRADO" : "EXPERIÊNCIA AO VIVO"}</span><span className="stage-meta">CENA 01 / A IA QUE NÃO QUER TRABALHAR</span></div>
              <div className="stage-top-icon"><WandSparkles size={16}/></div>
            </div>
            <div className="stage-body" ref={scene.sceneRef} onPointerMove={scene.onPointerMove} onPointerLeave={scene.onPointerLeave}>
              <div className="stage-grid" aria-hidden="true"/>
              <div className="planet planet-one" aria-hidden="true">✳</div>
              <div className="planet planet-two" aria-hidden="true">✦</div>
              <div className="planet planet-three" aria-hidden="true">✧</div>
              <div className="tiny-note note-left"><span>💤</span> intervalo<br/>em andamento</div>
              <div className="tiny-note note-right"><span>✧</span> 0% motivada<br/>100% debochada</div>
              <div className="scene-floor" aria-hidden="true" />
              <div className="actor" ref={scene.actorRef}>
                <div className="bubble" key={scene.state.speech} role="status" aria-live="polite">
                  <span className="bubble-avatar">IA</span>
                  <p>{scene.state.speech}</p>
                  <span className="bubble-tail" />
                </div>
                <Mascot emotion={scene.state.emotion} gesture={scene.state.gesture}/>
                <span className="mascot-shadow" aria-hidden="true"/>
              </div>
              <div className="stage-bottom-group">
                <div className="composer">
                  <textarea
                    aria-label="Sua pergunta para a IAda"
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    onKeyDown={onInputKeyDown}
                    placeholder="Escreva sua pergunta... se tiver coragem."
                    rows={2}
                  />
                  <button type="button" className="send-button" ref={scene.sendButtonRef} onClick={() => scene.send(question)} aria-label="Tentar enviar pergunta" aria-disabled={scene.busy}>
                    <Send size={20} strokeWidth={2.4}/>
                  </button>
                </div>
                <div className="composer-help"><span><CornerDownLeft size={12}/> Enter quebra linha. Ctrl + Enter tenta enviar.</span><span><MousePointer2 size={12}/> Mova o cursor para testar os olhos</span></div>
              </div>
            </div>
            <div className="stage-footer">
              <div className="tip"><span className="tip-icon"><Sparkles size={16}/></span><span>{scene.hint}</span></div>
              <button type="button" className="skip-button" onClick={scene.answerPrototype} title="Ignorar pegadinhas e exibir resposta simulada">Pular pegadinha <ArrowRight size={15}/></button>
            </div>
          </section>

          <aside className="control-panel" id="controles">
            <div className="panel-header"><div className="panel-icon"><BrainCircuit size={20}/></div><div><h2>Controle de cena</h2><p>Brinque com o humor da IAda</p></div></div>
            <div className="panel-section">
              <div className="panel-section-label"><span>01</span> HUMOR ATUAL</div>
              <div className="emotions">
                {EMOTIONS.map(item => (
                  <button key={item.key} type="button" disabled={scene.busy} className={`emotion-option ${scene.state.emotion===item.key?"emotion-active":""}`} onClick={() => scene.setEmotion(item.key)} aria-pressed={scene.state.emotion===item.key}>
                    <span className="emotion-face">{faceIcons[item.key]}</span><span className="emotion-name">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="panel-separator"/>
            <div className="panel-section">
              <div className="panel-section-label"><span>02</span> AÇÕES</div>
              <div className="action-buttons">
                <button type="button" onClick={scene.move} disabled={scene.busy}><MoveUpRight size={18}/><span><strong>Passear pelo cenário</strong><small>Movimentação livre</small></span><ChevronRight size={16} className="action-chevron"/></button>
                <button type="button" onClick={scene.wave} disabled={scene.busy}><Hand size={18}/><span><strong>Acenar para você</strong><small>Gesto + balão de fala</small></span><ChevronRight size={16} className="action-chevron"/></button>
                <button type="button" onClick={()=>scene.setEmotion("sarcastic")} disabled={scene.busy}><MessageCircle size={18}/><span><strong>Modo debochado</strong><small>Sarcasmo ativado</small></span><ChevronRight size={16} className="action-chevron"/></button>
                <button type="button" onClick={()=>scene.setEmotion("sleepy")} disabled={scene.busy}><Coffee size={18}/><span><strong>Hora do cochilo</strong><small>Pausa dramática</small></span><ChevronRight size={16} className="action-chevron"/></button>
              </div>
            </div>
            <div className="panel-separator"/>
            <div className="panel-section">
              <div className="panel-section-label"><span>03</span> ESTADO DA SESSÃO</div>
              <div className="metric-card"><div><span>Insistência do usuário</span><strong>{Math.min(scene.state.attempts, 2)} / 2</strong></div><div className="progress-track"><div style={{width:`${Math.min(scene.state.attempts,2)*50}%`}}/></div><small>Depois de duas tentativas, a IAda se rende.</small></div>
              <button type="button" className="reset-control" onClick={()=>{scene.resetAnimations(); scene.speak("De novo?! Achei que tínhamos encerrado por hoje...", "neutral", "idle");}}><RotateCcw size={14}/> Recolocar tudo no lugar</button>
            </div>
            <div className="panel-bottom"><span className="star">✦</span><p><strong>Pequeno detalhe:</strong> não existe backend de IA neste protótipo. O foco é validar o comportamento animado do mascote.</p></div>
          </aside>
        </div>

        <section className="feature-row" aria-label="Funcionalidades do protótipo">
          <div><span><Eye size={18}/></span><strong>Olhos que te seguem</strong><small>Tracking em tempo real</small></div>
          <div><span><WandSparkles size={18}/></span><strong>5 personalidades</strong><small>Expressões e gestos</small></div>
          <div><span><MousePointer2 size={18}/></span><strong>Botão sequestrado</strong><small>Interação física animada</small></div>
          <div><span><CheckCircle2 size={18}/></span><strong>Um pouco de caos</strong><small>Mas sempre reversível</small></div>
        </section>
      </main>
      <footer className="layout-width footer"><span>© EquipIAda Lab — Feito para não ajudar.</span><span>Protótipo de comportamento visual · Next.js + React + GSAP</span></footer>
    </div>
  );
}
