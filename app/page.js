'use client'
import { useState, useEffect } from 'react';
import { 
  FaMicrophone, 
  FaStop, 
  FaVolumeUp, 
  FaUser, 
  FaLanguage,
  FaExclamationTriangle 
} from 'react-icons/fa';

export default function HealthcareTranslator() {
  // State declarations
  const [transcript, setTranscript] = useState('');
  const [translation, setTranslation] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [error, setError] = useState(null);

  // Speech recognition effect
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Your browser doesn\'t support speech recognition. Try Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event) => {
      const text = Array.from(event.results)
        .slice(-1)[0][0].transcript;
      setTranscript(text);
    };

    if (isListening) recognition.start();
    return () => recognition.stop();
  }, [isListening]);

  // Translation handler
  const handleTranslate = async () => {
    if (!transcript.trim()) return;
    
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: transcript, targetLanguage })
      });
      const data = await response.json();
      setTranslation(data.translatedText);
      setError(null);
    } catch (err) {
      setError("Translation service unavailable. Please try again.");
      console.error(err);
    }
  };

  // Auto-translation effect
  useEffect(() => {
    handleTranslate();
  }, [transcript, targetLanguage]);

  // Text-to-speech function
  const speakTranslation = () => {
    if (!translation) return;
    const utterance = new SpeechSynthesisUtterance(translation);
    utterance.lang = targetLanguage === 'es' ? 'es-ES' : 
                    targetLanguage === 'fr' ? 'fr-FR' : 'de-DE';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-blue-800">Medical Translator</h1>
        <p className="text-gray-600">Real-time patient-provider communication</p>
      </header>

      {/* Language Selection */}
      <div className="max-w-md mx-auto mb-8">
        <label className="block mb-2 font-medium">Translate to:</label>
        <select
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value)}
          className="w-full p-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
        </select>
      </div>

      {/* Microphone Button */}
      <div className="flex justify-center mb-8">
        <button
          onClick={() => setIsListening(!isListening)}
          className={`flex items-center gap-2 p-4 rounded-full text-white ${
            isListening ? 'bg-red-500 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'
          } transition-all`}
        >
          {isListening ? <FaStop size={20} /> : <FaMicrophone size={20} />}
          {isListening ? "Stop Listening" : "Start Speaking"}
        </button>
      </div>

      {/* Dual Transcript Display */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-blue-700 mb-4">
            <FaUser className="text-blue-500" /> Patient
          </h2>
          <div className="min-h-40 p-4 bg-gray-50 rounded-lg border border-gray-200">
            {transcript || <span className="text-gray-400">Speech will appear here...</span>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-green-700 mb-4">
            <FaLanguage className="text-green-500" /> Translation
          </h2>
          <div className="min-h-40 p-4 bg-gray-50 rounded-lg border border-gray-200 mb-4">
            {translation || <span className="text-gray-400">Translation will appear here...</span>}
          </div>
          {translation && (
            <button
              onClick={speakTranslation}
              className="w-full flex justify-center items-center gap-2 p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <FaVolumeUp /> Hear Translation
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-lg">
          <FaExclamationTriangle className="inline mr-2" />
          {error}
        </div>
      )}
    </div>
  );
}