import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { FeedbackRepository } from "../src/server/feedbackRepository.ts";

function temporaryDatabase(run) {
  const directory = mkdtempSync(join(tmpdir(), "equipiada-db-"));
  try { run(join(directory, "feedback.sqlite")); }
  finally {
    assert.ok(resolve(directory).startsWith(join(resolve(tmpdir()), "equipiada-db-")));
    rmSync(directory, { recursive: true, force: true });
  }
}

test("integração: migração, gravação relacional e reabertura mantêm avaliações sem texto privado", () => {
  temporaryDatabase(path => {
    const id = randomUUID();
    let repository = new FeedbackRepository(path);
    assert.deepEqual(repository.summary(), { total: 0, helpfulnessAverage: null, enjoymentAverage: null });
    assert.equal(repository.save({ id, helpfulness: 3, enjoyment: 2, pranks: ["maintenance", "blackout"] }).created, true);
    repository.close();
    repository = new FeedbackRepository(path);
    assert.deepEqual(repository.summary(), { total: 1, helpfulnessAverage: 3, enjoymentAverage: 2 });
    repository.close();
    const db = new DatabaseSync(path);
    try {
      assert.equal(db.prepare("PRAGMA user_version").get().user_version, 1);
      assert.deepEqual(db.prepare("SELECT prank_id FROM feedback_prank ORDER BY position").all().map(row => row.prank_id), ["maintenance", "blackout"]);
      assert.deepEqual(db.prepare("PRAGMA table_info(feedback)").all().map(row => row.name), ["id", "helpfulness", "enjoyment", "created_at"]);
    } finally { db.close(); }
  });
});

test("integração: repetir ou atualizar a mesma avaliação não duplica registros nem cenas", () => {
  temporaryDatabase(path => {
    const repository = new FeedbackRepository(path);
    const id = randomUUID();
    try {
      const input = { id, helpfulness: 1, enjoyment: 1, pranks: ["blackout"] };
      repository.save(input);
      assert.equal(repository.save(input).created, false);
      const updated = repository.save({ id: id.toUpperCase(), helpfulness: 3, enjoyment: 2, pranks: ["word-thief"] });
      assert.equal(updated.created, false);
      assert.deepEqual(updated.summary, { total: 1, helpfulnessAverage: 3, enjoymentAverage: 2 });
      const db = new DatabaseSync(path);
      try { assert.deepEqual(db.prepare("SELECT prank_id FROM feedback_prank").all().map(row => row.prank_id), ["word-thief"]); }
      finally { db.close(); }
    } finally { repository.close(); }
  });
});

test("integração: falha na tabela filha reverte toda a transação e permite recuperar", () => {
  temporaryDatabase(path => {
    const repository = new FeedbackRepository(path);
    const db = new DatabaseSync(path);
    try {
      db.exec("CREATE TRIGGER fail_prank BEFORE INSERT ON feedback_prank BEGIN SELECT RAISE(ABORT, 'falha simulada de persistência'); END;");
      assert.throws(() => repository.save({ id: randomUUID(), helpfulness: 3, enjoyment: 3, pranks: ["blackout"] }));
      assert.equal(repository.summary().total, 0);
      db.exec("DROP TRIGGER fail_prank;");
      assert.equal(repository.save({ id: randomUUID(), helpfulness: 2, enjoyment: 1, pranks: [] }).summary.total, 1);
    } finally { db.close(); repository.close(); }
  });
});

test("integração: SQLite também impõe notas válidas e integridade referencial", () => {
  temporaryDatabase(path => {
    const repository = new FeedbackRepository(path);
    const db = new DatabaseSync(path);
    try {
      db.exec("PRAGMA foreign_keys = ON;");
      assert.throws(() => db.prepare("INSERT INTO feedback(id, helpfulness, enjoyment) VALUES(?, ?, ?)").run(randomUUID(), 0, 3));
      assert.throws(() => db.prepare("INSERT INTO feedback_prank(feedback_id, position, prank_id) VALUES(?, ?, ?)").run(randomUUID(), 0, "blackout"));
      assert.equal(repository.summary().total, 0);
    } finally { db.close(); repository.close(); }
  });
});
