import React, { useState, useEffect, useRef } from 'react'; // Import useRef
import '../styles/Modal.css';
import '../styles/Form.css';

function SettingsModal({
  resumePdfs, setResumePdfs,
  selectedResumeId, setSelectedResumeId,
  resumeStorageError,
  closeModal, // This function is crucial for closing the modal
  model, setModel,
  temperature, setTemperature
}) {
  const [apiKey, setApiKey] = useState('');
  const modalRef = useRef(null); // Create a ref to attach to the modal's content div
  const fileInputRef = useRef(null);

  // Effect to load API key from localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem('gemini-api-key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  // Effect to handle clicks outside the modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      // If the modalRef exists and the clicked element is NOT inside the modal content
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeModal(); // Close the modal without saving
      }
    };

    // Attach the event listener to the document when the modal opens
    // Using 'mousedown' instead of 'click' can prevent issues with elements being removed
    // before the 'click' event fires.
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup function: remove the event listener when the component unmounts
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeModal]); // Dependency array: Re-run effect if closeModal changes (though usually stable)

  const handleSave = () => {
    localStorage.setItem('gemini-api-key', apiKey);
    closeModal(); // Close the modal after saving
  };

  const handleResumeUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    const pdfFiles = files.filter((file) => (
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    ));

    const uploadedResumes = await Promise.all(pdfFiles.map((file, index) => (
      new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
          resolve({
            id: `${Date.now()}-${index}-${file.name}`,
            name: file.name,
            size: file.size,
            type: file.type || 'application/pdf',
            uploadedAt: new Date().toISOString(),
            dataUrl: reader.result,
          });
        };

        reader.onerror = reject;
        reader.readAsDataURL(file);
      })
    )));

    if (uploadedResumes.length > 0) {
      setResumePdfs((currentResumes) => [...currentResumes, ...uploadedResumes]);
      if (!selectedResumeId) {
        setSelectedResumeId(uploadedResumes[0].id);
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteResume = (resumeId) => {
    setResumePdfs((currentResumes) => currentResumes.filter((resumePdf) => resumePdf.id !== resumeId));
    if (resumeId === selectedResumeId) {
      setSelectedResumeId('');
    }
  };

  const handleClearResumes = () => {
    setResumePdfs([]);
    setSelectedResumeId('');
  };

  return (
    <div className="modal-overlay">
      {/* Attach the ref to the div that contains all the modal's visible content */}
      <div className="modal-content" ref={modalRef}>
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
            <option value="gemini-3-flash-preview">gemini-3-flash-preview</option>
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
          <label htmlFor="resume-upload">Resume PDFs</label>
          <input
            ref={fileInputRef}
            type="file"
            id="resume-upload"
            accept="application/pdf,.pdf"
            multiple
            onChange={handleResumeUpload}
          />
          {resumePdfs.length > 0 ? (
            <>
              <select
                id="default-resume-select"
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
              >
                {resumePdfs.map((resumePdf) => (
                  <option key={resumePdf.id} value={resumePdf.id}>
                    {resumePdf.name}
                  </option>
                ))}
              </select>
              <div className="resume-list">
                {resumePdfs.map((resumePdf) => (
                  <div className="resume-list-item" key={resumePdf.id}>
                    <span>{resumePdf.name}</span>
                    <button className="clear-button" onClick={() => handleDeleteResume(resumePdf.id)}>
                      Delete
                    </button>
                  </div>
                ))}
              </div>
              <button className="clear-button" onClick={handleClearResumes}>Clear All Resumes</button>
            </>
          ) : (
            <p className="helper-text">Upload one or more PDF resumes to use when generating responses.</p>
          )}
          {resumeStorageError && <p className="error-text">{resumeStorageError}</p>}
        </div>
        <div className="modal-actions">
          <button onClick={handleSave}>Save & Close</button>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;