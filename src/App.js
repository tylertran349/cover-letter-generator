// src/App.js
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import CoverLetterForm from './components/CoverLetterForm';
import JobQuestionForm from './components/JobQuestionForm';
import SettingsModal from './components/SettingsModal';
import ResponseDisplay from './components/ResponseDisplay';
import axios from 'axios';

import './styles/App.css';

function App() {
  const [mode, setMode] = useState('cover-letter');
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobQuestion, setJobQuestion] = useState(
    'What interests you about working for this company?'
  );
  const [generatedResponse, setGeneratedResponse] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // State for the model, loaded from localStorage or set to default
  const [model, setModel] = useState(() => {
    return localStorage.getItem('gemini-model') || 'gemini-2.5-pro';
  });

  // State for the resume, loaded from localStorage
  const [resume, setResume] = useState(() => {
    return localStorage.getItem('user-resume') || '';
  });

  // Effect to save the selected model to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('gemini-model', model);
  }, [model]);

  // Effect to save the user's resume to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('user-resume', resume);
  }, [resume]);


  const handleGenerate = async () => {
    const apiKey = localStorage.getItem('gemini-api-key');
    if (!apiKey) {
      setGeneratedResponse('API Key not found. Please set it in the Settings menu.');
      return;
    }

    setIsLoading(true);
    setGeneratedResponse('');

    const taskInstruction =
      mode === 'cover-letter'
        ? 'Write a formal cover letter using the provided details.'
        : `Answer the following job application question using the provided details: "${jobQuestion}"`;

    const prompt = `
      **CONTEXT:**
      - Company Name: ${companyName}
      - Role/Job Name: ${role}
      - Job Description: ${jobDescription}
      - My Resume: ${resume}

      **TASK:**
      ${taskInstruction}

      **OUTPUT RULES:**
      1.  Use the vocabulary of a college freshman but maintain a formal tone.
      2.  Your response MUST contain ONLY the text of the cover letter or the answer.
      3.  DO NOT include any introductory phrases, headings, titles, or conversational text like "Here is the cover letter:" or "Based on the information provided...".
      4.  The output must begin directly with the first word of the cover letter (e.g., "Dear Hiring Manager,") or the answer. Do not add any text before it.
    `;

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
        }
      );
      setGeneratedResponse(response.data.candidates[0].content.parts[0].text.trim());
    } catch (error) {
      console.error('Error generating response:', error);
      let errorMessage = 'An error occurred. Please check the console for more details.';
      if (error.response && error.response.data && error.response.data.error) {
          errorMessage = `Error from API: ${error.response.data.error.message}`;
      }
      setGeneratedResponse(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const clearInput = (setter) => {
    setter('');
  };

  return (
    <div className="app-container">
      <Sidebar setMode={setMode} openSettings={() => setIsSettingsOpen(true)} />
      <main className="main-content">
        {mode === 'cover-letter' ? (
          <CoverLetterForm
            companyName={companyName}
            setCompanyName={setCompanyName}
            role={role}
            setRole={setRole}
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            clearInput={clearInput}
            onGenerate={handleGenerate}
          />
        ) : (
          <JobQuestionForm
            companyName={companyName}
            setCompanyName={setCompanyName}
            role={role}
            setRole={setRole}
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            jobQuestion={jobQuestion}
            setJobQuestion={setJobQuestion}
            clearInput={clearInput}
            onGenerate={handleGenerate}
          />
        )}
        {isLoading && <div className="loading">Generating...</div>}
        {generatedResponse && <ResponseDisplay response={generatedResponse} />}
      </main>
      {isSettingsOpen && (
        <SettingsModal
          resume={resume}
          setResume={setResume}
          closeModal={() => setIsSettingsOpen(false)}
          clearInput={clearInput}
          model={model}
          setModel={setModel}
        />
      )}
    </div>
  );
}

export default App;