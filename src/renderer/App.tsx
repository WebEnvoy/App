import { AppShellView } from "./AppShellView";
import { useAppController } from "./useAppController";
import "./workbench.css";

export function App() {
  return <AppShellView controller={useAppController()} />;
}
