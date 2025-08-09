// src/components/JobQuestionForm.js
import React from 'react';
import '../styles/Form.css';

function JobQuestionForm({
  companyName,
  setCompanyName,
  role,
  setRole,
  jobDescription,
  setJobDescription,
  jobQuestion,
  setJobQuestion,
  clearInput,
  onGenerate,
}) {
  return (
    <div className="form-container">
      <h2>Answer a Job Application Question</h2>
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
      <div className="input-group">
        <label htmlFor="jobQuestion">Job Application Question</label>
        <textarea
          id="jobQuestion"
          value={jobQuestion}
          onChange={(e) => setJobQuestion(e.target.value)}
        ></textarea>
        <button className="clear-button" onClick={() => clearInput(setJobQuestion)}>Clear</button>
      </div>
      <button onClick={onGenerate}>Generate Answer</button>
    </div>
  );
}

export default JobQuestionForm;