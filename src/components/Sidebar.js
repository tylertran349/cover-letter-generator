import React from 'react';
import '../styles/Sidebar.css'; // Add this import

function Sidebar({ setMode, openSettings }) {
  // ... component code remains the same
  return (
    <aside className="sidebar">
      <nav>
        <ul>
          <li>
            <button onClick={() => setMode('cover-letter')}>Cover Letter</button>
          </li>
          <li>
            <button onClick={() => setMode('job-question')}>Answer Job Application Question</button>
          </li>
        </ul>
      </nav>
      <div className="settings-button-container">
        <button onClick={openSettings}>Settings</button>
      </div>
    </aside>
  );
}

export default Sidebar;