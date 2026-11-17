import { DatabaseSync } from "node:sqlite";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { validateFeedback, type FeedbackInput, type FeedbackSummary } from "../lib/feedback.ts";

export function feedbackDatabasePath() {
  // Arquivo criado em execução: não incluir banco/dados locais no rastreamento do build.
  return resolve(/* turbopackIgnore: true */ process.cwd(), process.env.EQUIPIADA_DATABASE_PATH || "data/equipiada.sqlite");
}

/** Persistência SQL isolada das regras de cena e do provedor de respostas. */
export class FeedbackRepository {
  private db: DatabaseSync;

  constructor(path = feedbackDatabasePath()) {
    if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
    this.db = new DatabaseSync(path);
    try {
      this.db.exec("PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 3000;");
      const version = this.db.prepare("PRAGMA user_version").get()?.user_version;
      if (version === 0) {
        const migration = readFileSync(resolve(process.cwd(), "database/migrations/001_feedback.sql"), "utf8");
        this.db.exec("BEGIN IMMEDIATE");
        try { this.db.exec(migration); this.db.exec("COMMIT"); }
        catch (error) { this.db.exec("ROLLBACK"); throw error; }
      } else if (version !== 1) throw new Error("Versão do banco não suportada.");
    } catch (error) {
      this.db.close();
      throw error;
    }
  }

  save(input: FeedbackInput): { created: boolean; summary: FeedbackSummary } {
    if (!validateFeedback(input)) throw new Error("Avaliação inválida.");
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const id = input.id.toLowerCase();
      const existing = this.db.prepare("SELECT id FROM feedback WHERE id = ?").get(id);
      if (existing) {
        this.db.prepare("UPDATE feedback SET helpfulness = ?, enjoyment = ? WHERE id = ?").run(input.helpfulness, input.enjoyment, id);
        this.db.prepare("DELETE FROM feedback_prank WHERE feedback_id = ?").run(id);
      } else {
        this.db.prepare("INSERT INTO feedback (id, helpfulness, enjoyment) VALUES (?, ?, ?)").run(id, input.helpfulness, input.enjoyment);
      }
      const insertPrank = this.db.prepare("INSERT INTO feedback_prank (feedback_id, position, prank_id) VALUES (?, ?, ?)");
      input.pranks.forEach((prank, position) => insertPrank.run(id, position, prank));
      const summary = this.summary();
      this.db.exec("COMMIT");
      return { created: !existing, summary };
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
  }

  summary(): FeedbackSummary {
    const result = this.db.prepare("SELECT COUNT(*) AS total, AVG(helpfulness) AS helpfulnessAverage, AVG(enjoyment) AS enjoymentAverage FROM feedback").get();
    return {
      total: Number(result?.total ?? 0),
      helpfulnessAverage: result?.helpfulnessAverage == null ? null : Number(result.helpfulnessAverage),
      enjoymentAverage: result?.enjoymentAverage == null ? null : Number(result.enjoymentAverage),
    };
  }

  close() { this.db.close(); }
}

let repository: FeedbackRepository | undefined;
export function getFeedbackRepository() {
  repository ??= new FeedbackRepository();
  return repository;
}
