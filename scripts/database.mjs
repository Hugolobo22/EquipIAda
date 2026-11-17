import nextEnv from "@next/env";
import { FeedbackRepository, feedbackDatabasePath } from "../src/server/feedbackRepository.ts";

nextEnv.loadEnvConfig(process.cwd(), true);
const repository = new FeedbackRepository();
try {
  console.log(`Banco local: ${feedbackDatabasePath()}`);
  console.log(JSON.stringify(repository.summary(), null, 2));
} finally {
  repository.close();
}
