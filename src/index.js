import React from "react";
import { createRoot } from 'react-dom/client';
import App from "./App";
import { initializeContract } from "./utils/near";

const container = document.getElementById('root');
const root = createRoot(container); // createRoot(container!) if you use TypeScript
window.nearInitPromise = initializeContract()
  .then(() => {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  })
  .catch(console.error);


