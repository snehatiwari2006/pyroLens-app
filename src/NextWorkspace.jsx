import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";

// Keeps the established React Router workspace functional during the Next.js
// migration. New server-rendered views can be added under pages/ incrementally.
export default function NextWorkspace() {
  return <BrowserRouter><App /></BrowserRouter>;
}
