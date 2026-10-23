import { OSProvider, useOS } from "./os/os";
import Boot from "./components/Boot";
import Lock from "./components/Lock";
import Desktop from "./components/Desktop";

function Shell() {
  const { phase } = useOS();
  if (phase === "boot" || phase === "restarting" || phase === "shuttingdown" || phase === "off") return <Boot />;
  if (phase === "lock" || phase === "signin") return <Lock />;
  return <Desktop />;
}

export default function App() {
  return (
    <OSProvider>
      <Shell />
    </OSProvider>
  );
}
