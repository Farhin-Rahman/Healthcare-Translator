'use client'
import { useState, useEffect, useCallback } from 'react';
import { 
  FaMicrophone, 
  FaStop, 
  FaVolumeUp, 
  FaUser, 
  FaLanguage,
  FaExclamationTriangle,
  FaSpinner 
} from 'react-icons/fa';

export default function HealthcareTranslator() {
  // State declarations
  const [transcript, setTranscript] = useState('');
  const [translation, setTranslation] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Microphone click handler
  const handleMicClick = useCallback(() => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("For best accuracy:\n\n• Use Chrome/Edge on desktop\n• Allow microphone access");
      return;
    }
    setIsListening(prev => !prev);
  }, []);

  // Translation handler
  const handleTranslate = useCallback(async () => {
    if (!transcript.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: transcript, 
          targetLanguage 
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setTranslation(data.translatedText);
      setError(null);
    } catch (err) {
      setError(err.message || "Translation service unavailable. Please try again.");
      console.error("Translation error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [transcript, targetLanguage]);

  // Speech recognition effect
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech recognition not supported in your browser");
      return;
    }
  
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;
  
    recognition.onresult = (event) => {
      const lastResult = Array.from(event.results).slice(-1)[0][0];
      setTranscript(lastResult.transcript);
    };
  
    recognition.onerror = (event) => {
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };
  
    if (isListening) {
      try {
        recognition.start();
      } catch (e) {
        setError("Could not access microphone. Please check permissions.");
      }
    }
  
    return () => {
      if (recognition) recognition.stop();
    };
  }, [isListening]);

  // Auto-translation with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      handleTranslate();
    }, 500); // Debounce to avoid rapid API calls
    
    return () => clearTimeout(timer);
  }, [transcript, targetLanguage, handleTranslate]);

  // Text-to-speech function
  const speakTranslation = useCallback(() => {
    if (!translation || isLoading) return;
    
    const languageMap = {
      es: 'es-ES', fr: 'fr-FR', de: 'de-DE', bn: 'bn-IN',
      zh: 'zh-CN', ar: 'ar-SA', hi: 'hi-IN', ko: 'ko-KR',
      ja: 'ja-JP', it: 'it-IT', pt: 'pt-PT', pl: 'pl-PL',
      sv: 'sv-SE', th: 'th-TH', vi: 'vi-VN', el: 'el-GR',
      cs: 'cs-CZ', hu: 'hu-HU', nl: 'nl-NL', ro: 'ro-RO'
    };
  
    const utterance = new SpeechSynthesisUtterance(translation);
    utterance.lang = languageMap[targetLanguage] || 'en-US';
    utterance.rate = 0.9; // Slightly slower for medical terms
    
    // Wait for voices to load if needed
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const voice = voices.find(v => v.lang === utterance.lang);
      if (voice) utterance.voice = voice;
      window.speechSynthesis.speak(utterance);
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find(v => v.lang === utterance.lang);
        if (voice) utterance.voice = voice;
        window.speechSynthesis.speak(utterance);
      };
    }
  }, [translation, targetLanguage, isLoading]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-blue-800 mb-2">Medical Translator</h1>
        <p className="text-lg text-gray-700">Real-time patient-provider communication</p>
      </header>

      <div className="max-w-md mx-auto mb-8">
        <label className="block mb-2 text-lg font-semibold text-gray-700">
          Translate to:
        </label>
        <select
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value)}
          disabled={isLoading}
          className="w-full p-4 text-lg border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800 disabled:opacity-50"
        >
          {/* Language options remain the same */}
        </select>
      </div>

      <div className="flex justify-center mb-8">
        <button
          onClick={handleMicClick}
          disabled={isLoading}
          aria-busy={isLoading}
          className={`flex items-center justify-center gap-3 px-6 py-4 rounded-lg text-white text-lg font-semibold shadow-lg transition-all duration-200 min-w-[200px] ${
            isLoading ? 'bg-gray-500 opacity-50 cursor-not-allowed' :
            isListening ? 'bg-red-500 animate-pulse' : 
            'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? (
            <>
              <FaSpinner className="animate-spin" size={24} />
              Processing...
            </>
          ) : isListening ? (
            <>
              <FaStop size={24} />
              Stop Listening
            </>
          ) : (
            <>
              <FaMicrophone size={24} />
              Start Speaking
            </>
          )}
        </button>
      </div>

      {/* Rest of your JSX remains the same */}
    </div>
  );
}