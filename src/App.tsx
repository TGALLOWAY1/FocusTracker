import { BrowserRouter } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { AuthGate } from "./components/auth/AuthGate";
import { HydrationGate } from "./components/auth/HydrationGate";
import { ToastProvider, ToastBridge } from "./components/ui/Toast";

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <ToastBridge />
        <AuthGate>
          {(session) => (
            <HydrationGate key={session.user.id} session={session}>
              <AppShell />
            </HydrationGate>
          )}
        </AuthGate>
      </ToastProvider>
    </BrowserRouter>
  );
}
