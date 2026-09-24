import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./AgentApp";
import MeetingApp from "./MeetingApp";

const Root = window.location.pathname.startsWith("/meetings") ? MeetingApp : App;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
