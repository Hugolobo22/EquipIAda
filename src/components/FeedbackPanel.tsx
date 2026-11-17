"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { FeedbackSummary, Rating } from "@/lib/feedback";
import type { PrankId } from "@/types/session";

export function FeedbackPanel({ pranks }: { pranks: PrankId[] }) {
  const [id] = useState(() => crypto.randomUUID());
  const [helpfulness, setHelpfulness] = useState<Rating | null>(null);
  const [enjoyment, setEnjoyment] = useState<Rating | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [summary, setSummary] = useState<FeedbackSummary | null>(null);
  const savedRef = useRef<HTMLParagraphElement>(null);
  const submittingRef = useRef(false);
  const hasSubmittedRef = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/feedback", { signal: controller.signal, cache: "no-store" })
      .then(async response => {
        if (!response.ok) return;
        const data = await response.json() as FeedbackSummary;
        if (!controller.signal.aborted && !hasSubmittedRef.current && Number.isInteger(data.total)) setSummary(data);
      }).catch(() => { /* o formulário continua disponível sem o resumo */ });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (status === "saved") savedRef.current?.focus();
  }, [status]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (helpfulness === null || enjoyment === null || submittingRef.current || status === "saved") return;
    submittingRef.current = true;
    hasSubmittedRef.current = true;
    setStatus("saving");
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, helpfulness, enjoyment, pranks }),
      });
      const result = await response.json();
      if (!response.ok || result.saved !== true) throw new Error("Não foi possível salvar");
      setSummary(result.summary);
      setStatus("saved");
    } catch { setStatus("error"); }
    finally { submittingRef.current = false; }
  }

  return (
    <section className="feedback-panel" aria-label="Avaliar experiência">
      <strong>Valeu a insistência?</strong>
      <p className="feedback-privacy">Avaliação opcional, salva só neste computador. Perguntas e respostas não são guardadas.</p>
      {status === "saved" ? (
        <p role="status" tabIndex={-1} ref={savedRef}>Avaliação salva. A IAda vai fingir que não se importa.</p>
      ) : (
        <form onSubmit={submit}>
          <fieldset disabled={status === "saving"}>
            <legend>A resposta ajudou?</legend>
            <div className="feedback-options">
              {([[3, "Sim"], [2, "Em parte"], [1, "Não"]] as const).map(([value, label]) => (
                <label key={value}><input type="radio" name={`helpfulness-${id}`} value={value} checked={helpfulness === value} onChange={() => setHelpfulness(value)} />{label}</label>
              ))}
            </div>
          </fieldset>
          <fieldset disabled={status === "saving"}>
            <legend>E a brincadeira?</legend>
            <div className="feedback-options">
              {([[3, "Divertida"], [2, "Neutra"], [1, "Cansativa"]] as const).map(([value, label]) => (
                <label key={value}><input type="radio" name={`enjoyment-${id}`} value={value} checked={enjoyment === value} onChange={() => setEnjoyment(value)} />{label}</label>
              ))}
            </div>
          </fieldset>
          {status === "error" && <p role="alert">Não consegui salvar a avaliação. Sua resposta continua disponível; tente novamente.</p>}
          <button type="submit" disabled={status === "saving" || helpfulness === null || enjoyment === null}>
            {status === "saving" ? "Salvando avaliação…" : status === "error" ? "Tentar salvar novamente" : "Salvar avaliação"}
          </button>
        </form>
      )}
      {summary && <small>{summary.total} {summary.total === 1 ? "avaliação neste computador" : "avaliações neste computador"}.</small>}
    </section>
  );
}
