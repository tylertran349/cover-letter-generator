// src/components/ResponseDisplay.js
import React, { useState } from 'react';
import '../styles/Response.css';

function ResponseDisplay({ response }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(response).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
      },
      (err) => {
        console.error('Could not copy text: ', err);
      }
    );
  };

  return (
    <div className="response-container">
      <h3>Generated Response:</h3>
      <div className="response-content">
        <pre>{response}</pre>
      </div>
      <button onClick={handleCopy}>{copied ? 'Copied!' : 'Copy to Clipboard'}</button>
    </div>
  );
}

export default ResponseDisplay;