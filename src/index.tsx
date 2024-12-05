import React from 'react';
import ReactDOM from 'react-dom/client';
import TicketManager from './TicketManager';
import './index.css';

const rootElement = document.getElementById('wp-react-ticket-manager');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <TicketManager />
    </React.StrictMode>
  );
}