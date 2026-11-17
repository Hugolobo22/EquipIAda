"use client";

import { useRef, useState } from "react";
import type { SpeechCue } from "@/lib/contextualSpeech";

type Props = { onComplete: () => void; onSpeech: (cue: SpeechCue) => void };

export function MaintenanceTask({ onComplete, onSpeech }: Props) {
  const [repaired, setRepaired] = useState<number[]>([]);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const labels = ["Desligar modo soneca", "Conectar boa vontade"];

  function repair(index: number) {
    if (repaired.includes(index)) return;
    const next = [...repaired, index];
    setRepaired(next);
    if (next.length === 2) onComplete();
    else {
      onSpeech({ text: index === 0 ? "A soneca desligou. Sinto falta dela já." : "Boa vontade conectada. A soneca continua resistindo.", emotion: "annoyed", gesture: "point" });
      buttons.current[1 - index]?.focus();
    }
  }

  return (
    <div className="maintenance-task">
      <p role="status">{repaired.length} de 2 ajustes feitos. A manutenção é só uma encenação.</p>
      <div className="maintenance-switches" role="group" aria-label="Painel da manutenção">
        {labels.map((label, index) => (
          <button key={label} type="button" ref={button => { buttons.current[index] = button; }} disabled={repaired.includes(index)} onClick={() => repair(index)}>
            <span className={`repair-indicator${repaired.includes(index) ? " repaired" : ""}`} aria-hidden="true" />
            {repaired.includes(index) ? index === 0 ? "Soneca desligada" : "Boa vontade conectada" : label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function DramaticTask({ onComplete, onSpeech }: Props) {
  const [charge, setCharge] = useState(0);

  function chargeCourage() {
    if (charge >= 100) return;
    const next = charge + 50;
    setCharge(next);
    if (next === 100) onComplete();
    else onSpeech({ text: "Cinquenta por cento de coragem. Os outros cinquenta estão no intervalo.", emotion: "curious", gesture: "point" });
  }

  return (
    <div className="dramatic-task">
      <div className="courage-label"><span>Coragem para trabalhar</span><strong>{charge}%</strong></div>
      <div className="courage-track" role="progressbar" aria-label="Coragem para trabalhar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={charge}>
        <div style={{ width: `${charge}%` }} />
      </div>
      <p role="status">{charge === 0 ? "É uma barra de coragem imaginária. Dois empurrões resolvem." : "Metade da coragem carregada. Falta só mais um empurrão."}</p>
      <button type="button" onClick={chargeCourage} disabled={charge === 100}>{charge === 0 ? "Carregar coragem" : "Completar a carga"}</button>
    </div>
  );
}
