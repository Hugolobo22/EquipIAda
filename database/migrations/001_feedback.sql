-- Estrutura reproduzível. Não há perguntas, respostas, nomes ou credenciais.
CREATE TABLE feedback (
  id TEXT PRIMARY KEY NOT NULL,
  helpfulness INTEGER NOT NULL CHECK (helpfulness BETWEEN 1 AND 3),
  enjoyment INTEGER NOT NULL CHECK (enjoyment BETWEEN 1 AND 3),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
) STRICT;

CREATE TABLE feedback_prank (
  feedback_id TEXT NOT NULL REFERENCES feedback(id) ON DELETE CASCADE,
  position INTEGER NOT NULL CHECK (position BETWEEN 0 AND 3),
  prank_id TEXT NOT NULL CHECK (prank_id IN (
    'short-prompt', 'long-prompt', 'runaway-button', 'interrogation', 'magic-word',
    'word-thief', 'blackout', 'dramatic-delay', 'maintenance'
  )),
  PRIMARY KEY (feedback_id, position),
  UNIQUE (feedback_id, prank_id)
) STRICT;

PRAGMA user_version = 1;
