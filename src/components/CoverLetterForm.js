// src/components/CoverLetterForm.js
import React from 'react';
import '../styles/Form.css';

function CoverLetterForm({
  companyName,
  setCompanyName,
  role,
  setRole,
  jobDescription,
  setJobDescription,
  clearInput,
  onGenerate,
}) {
  return (
    <div className="form-container">
      <h2>Generate a Cover Letter</h2>
      <div className="input-group">
        <label htmlFor="companyName">Company Name</label>
        <input
          type="text"
          id="companyName"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />
        <button className="clear-button" onClick={() => clearInput(setCompanyName)}>Clear</button>
      </div>
      <div className="input-group">
        <label htmlFor="role">Role/Job Name</label>
        <input
          type="text"
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />
        <button className="clear-button" onClick={() => clearInput(setRole)}>Clear</button>
      </div>
      <div className="input-group">
        <label htmlFor="jobDescription">Job Description</label>
        <textarea
          id="jobDescription"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        ></textarea>
        <button className="clear-button" onClick={() => clearInput(setJobDescription)}>Clear</button>
      </div>
      <button onClick={onGenerate}>Generate Cover Letter</button>
    </div>
  );
}

export default CoverLetterForm;