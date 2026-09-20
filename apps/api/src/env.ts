import { resolve } from "node:path";
import dotenv from "dotenv";

// npm workspaces run scripts from the package directory, while Vercel runs from
// the repository root. Load either location without overriding hosted secrets.
for (const path of [resolve(process.cwd(), ".env"), resolve(process.cwd(), "../../.env")]) {
  dotenv.config({ path, override: false, quiet: true });
}
