import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import CoverLetterForm from './components/CoverLetterForm';
import JobQuestionForm from './components/JobQuestionForm';
import SettingsModal from './components/SettingsModal';
import ResponseDisplay from './components/ResponseDisplay';
import axios from 'axios';

import './styles/App.css';

const DEFAULT_MODEL = 'gemini-3-flash-preview';

const loadStoredResumes = () => {
  try {
    const storedResumes = JSON.parse(localStorage.getItem('user-resume-pdfs') || '[]');
    return Array.isArray(storedResumes)
      ? storedResumes.filter((resumePdf) => resumePdf.id && resumePdf.name && resumePdf.dataUrl)
      : [];
  } catch {
    return [];
  }
};

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
    const savedModel = localStorage.getItem('gemini-model');
    if (!savedModel || savedModel !== DEFAULT_MODEL) {
      return DEFAULT_MODEL;
    }
    return savedModel;
  });

  // State for temperature, loaded from localStorage or set to default
  const [temperature, setTemperature] = useState(() => {
    // localStorage stores strings, so we parse it to a number
    return parseFloat(localStorage.getItem('gemini-temperature')) || 1.0;
  });

  // State for uploaded resume PDFs, loaded from localStorage
  const [resumePdfs, setResumePdfs] = useState(loadStoredResumes);
  const [selectedResumeId, setSelectedResumeId] = useState(() => {
    return localStorage.getItem('selected-resume-pdf-id') || '';
  });
  const [resumeStorageError, setResumeStorageError] = useState('');

  // Effect to save the selected model to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('gemini-model', model);
  }, [model]);

  // Effect to save the temperature to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('gemini-temperature', temperature);
  }, [temperature]);

  // Effect to save uploaded resume PDFs to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('user-resume-pdfs', JSON.stringify(resumePdfs));
      setResumeStorageError('');
    } catch {
      setResumeStorageError('Could not save resume PDFs. Try deleting a large resume and uploading a smaller PDF.');
    }
  }, [resumePdfs]);

  useEffect(() => {
    if (resumePdfs.length === 0) {
      setSelectedResumeId('');
      localStorage.removeItem('selected-resume-pdf-id');
      return;
    }

    const selectedResumeExists = resumePdfs.some((resumePdf) => resumePdf.id === selectedResumeId);
    if (!selectedResumeExists) {
      setSelectedResumeId(resumePdfs[0].id);
    } else {
      localStorage.setItem('selected-resume-pdf-id', selectedResumeId);
    }
  }, [resumePdfs, selectedResumeId]);


  const handleGenerate = async () => {
    const apiKey = localStorage.getItem('gemini-api-key');
    if (!apiKey) {
      setGeneratedResponse('API Key not found. Please set it in the Settings menu.');
      return;
    }

    const selectedResume = resumePdfs.find((resumePdf) => resumePdf.id === selectedResumeId);
    if (!selectedResume) {
      setGeneratedResponse('Please upload and select a resume PDF in Settings before generating a response.');
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
      - Selected Resume PDF: ${selectedResume.name}

      **TASK:**
      ${taskInstruction}

      **OUTPUT RULES:**
      1. Use the vocabulary of a college freshman but maintain a formal tone.
      2. Your response MUST contain ONLY the text of the cover letter or the answer.
      3. DO NOT include any introductory phrases, headings, titles, or conversational text like "Here is the cover letter:" or "Based on the information provided...".
      4. For COVER LETTERS: Begin with a formal salutation (e.g., "Dear Hiring Manager,") and end with a sign-off containing ONLY my full name.
      5. For JOB APPLICATION ANSWERS: DO NOT include any salutations, signatures, names, or contact information. Provide ONLY the answer text.
      6. Make the writing sound natural and human, not like it was written by AI.
      7. Use simple grammar only. Keep sentences clear and direct.
      8. Use only commas and periods for punctuation. Do not use semicolons, colons, dashes, parentheses, bullet points, or numbered lists.
      9. Keep the response as short and concise as possible. Remove all fluff and only include details that directly help answer the prompt.
    `;

    const resumeData = selectedResume.dataUrl.split(',')[1];

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          contents: [{
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: selectedResume.type || 'application/pdf',
                  data: resumeData,
                },
              },
            ],
          }],
          generationConfig: {
            temperature: Number(temperature),
          },
        }
      );

      // --- ADD THIS CHECK ---
      // Check if the candidates array exists and is not empty
      if (response.data.candidates && response.data.candidates.length > 0) {
        setGeneratedResponse(response.data.candidates[0].content.parts[0].text.trim());
      } else {
        // If there are no candidates, it was likely blocked by safety settings.
        console.log("API Response was blocked:", response.data); // Log the reason for debugging
        setGeneratedResponse("The response was blocked by the API's safety filters. Try adjusting your input.");
      }

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
            resumePdfs={resumePdfs}
            selectedResumeId={selectedResumeId}
            setSelectedResumeId={setSelectedResumeId}
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
            resumePdfs={resumePdfs}
            selectedResumeId={selectedResumeId}
            setSelectedResumeId={setSelectedResumeId}
            clearInput={clearInput}
            onGenerate={handleGenerate}
          />
        )}
        {isLoading && <div className="loading">Generating...</div>}
        {generatedResponse && <ResponseDisplay response={generatedResponse} />}
      </main>
      {isSettingsOpen && (
        <SettingsModal
          resumePdfs={resumePdfs}
          setResumePdfs={setResumePdfs}
          selectedResumeId={selectedResumeId}
          setSelectedResumeId={setSelectedResumeId}
          resumeStorageError={resumeStorageError}
          closeModal={() => setIsSettingsOpen(false)}
          model={model}
          setModel={setModel}
          temperature={temperature}
          setTemperature={setTemperature}
        />
      )}
    </div>
  );
}

export default App;