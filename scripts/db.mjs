// Base de dados PostgreSQL local para desenvolvimento (sem Docker nem instalação).
// Uso: npm run db  → fica a correr em localhost:5433 até carregares Ctrl+C.
import EmbeddedPostgres from "embedded-postgres";
import { existsSync } from "node:fs";
import path from "node:path";

const dataDir = path.resolve(".pgdata");
const firstRun = !existsSync(dataDir);

const pg = new EmbeddedPostgres({
  databaseDir: dataDir,
  user: "amizade",
  password: "amizade",
  port: 5433,
  persistent: true,
});

if (firstRun) await pg.initialise();
await pg.start();
if (firstRun) await pg.createDatabase("amizade");

console.log("PostgreSQL pronto em postgresql://amizade:amizade@localhost:5433/amizade");

const stop = async () => {
  await pg.stop();
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
