import dynamic from "next/dynamic";

const ClientWorkspace = dynamic(() => import("../src/NextWorkspace.jsx"), { ssr: false });

export default function WorkspacePage() {
  return <ClientWorkspace />;
}
