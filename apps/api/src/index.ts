import { app } from "./app.js";

const port = Number(process.env.PORT ?? 8787);

app.listen(port, () => {
  console.log(`Operation AI API listening on http://localhost:${port}`);
});
