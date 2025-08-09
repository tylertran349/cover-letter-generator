import React, { useState, useEffect } from 'react';
import '../styles/Modal.css';
import '../styles/Form.css';

function SettingsModal({
  resume, setResume,
  closeModal, clearInput,
  model, setModel,
  temperature, setTemperature
}) {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const savedApiKey = localStorage.getItem('gemini-api-key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('gemini-api-key', apiKey);
    closeModal();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Settings</h2>

        <div className="input-group">
          <label htmlFor="apiKey">Gemini API Key</label>
          <input
            type="password"
            id="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Gemini API Key"
          />
        </div>

        <div className="input-group">
          <label htmlFor="model-select">Model</label>
          <select id="model-select" value={model} onChange={(e) => setModel(e.target.value)}>
            <option value="gemini-2.5-pro">gemini-2.5-pro</option>
            <option value="gemini-2.5-flash">gemini-2.5-flash</option>
            <option value="gemini-2.5-flash-lite">gemini-2.5-flash-lite</option>
          </select>
        </div>

        <div className="input-group">
          <label htmlFor="temperature-slider">Temperature: {Number(temperature).toFixed(1)}</label>
          <div className="slider-container">
            <span>0.0</span>
            <input
              type="range"
              id="temperature-slider"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              className="temperature-slider"
            />
            <span>2.0</span>
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="resume">Your Resume</label>
          <textarea
            id="resume"
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            placeholder="Paste your resume here..."
          ></textarea>
          <button className="clear-button" onClick={() => clearInput(setResume)}>Clear</button>
        </div>
        <div className="modal-actions">
          <button onClick={handleSave}>Save & Close</button>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;