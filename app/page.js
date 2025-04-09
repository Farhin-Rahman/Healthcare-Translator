'use client'
import { useState, useEffect, useCallback } from 'react';
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

  // Translation handler
  const handleTranslate = useCallback(async () => {
    if (!transcript.trim()) return;
    
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: transcript, targetLanguage })
      });
      if (!response.ok) {
        throw new Error('Translation request failed');
      }
      const data = await response.json();
      setTranslation(data.translatedText);
      setError(null);
    } catch (err) {
      setError("Translation service unavailable. Please try again.");
      console.error(err);
    }
  }, [transcript, targetLanguage]);

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

    recognition.onerror = (event) => {
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    if (isListening) {
      recognition.start();
    }
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [isListening]);

  // Auto-translation effect
  useEffect(() => {
    handleTranslate();
  }, [transcript, targetLanguage, handleTranslate]);

  // Text-to-speech function
  const speakTranslation = () => {
    if (!translation) return;
  
    const languageMap = {
      es: 'es-ES', // Spanish
      fr: 'fr-FR', // French
      de: 'de-DE', // German
      bn: 'bn-IN', // Bengali
      zh: 'zh-CN', // Chinese (Simplified)
      ar: 'ar-SA', // Arabic
      hi: 'hi-IN', // Hindi
      ko: 'ko-KR', // Korean
      ja: 'ja-JP', // Japanese
      it: 'it-IT', // Italian
      pt: 'pt-PT', // Portuguese
      pl: 'pl-PL', // Polish
      sv: 'sv-SE', // Swedish
      th: 'th-TH', // Thai
      vi: 'vi-VN', // Vietnamese
      el: 'el-GR', // Greek
      cs: 'cs-CZ', // Czech
      hu: 'hu-HU', // Hungarian
      nl: 'nl-NL', // Dutch
      ro: 'ro-RO', // Romanian
    };
  
    const utterance = new SpeechSynthesisUtterance(translation);
    utterance.lang = languageMap[targetLanguage] || 'en-US'; // Default to English if not found
  
    // Check if the browser supports the selected language
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find((v) => v.lang === utterance.lang);
    if (voice) {
      utterance.voice = voice;
    } else {
      console.warn(`No voice found for language: ${utterance.lang}`);
    }
  
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header - Made more prominent */}
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-blue-800 mb-2">Medical Translator</h1>
        <p className="text-lg text-gray-700">Real-time patient-provider communication</p>
      </header>

      {/* Language Selection - Improved styling */}
      <div className="max-w-md mx-auto mb-8">
        <label className="block mb-2 text-lg font-semibold text-gray-700">Translate to:</label>
        <select
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value)}
          className="w-full p-4 text-lg border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800"
        >
<option value="bn">Bengali (বাংলা)</option>
  <option value="cs">Czech (Čeština)</option>
  <option value="nl">Dutch (Nederlands)</option>
  <option value="fr">French (Français)</option>
  <option value="de">German (Deutsch)</option>
  <option value="el">Greek (Ελληνικά)</option>
  <option value="hi">Hindi (हिन्दी)</option>
  <option value="hu">Hungarian (Magyar)</option>
  <option value="it">Italian (Italiano)</option>
  <option value="ja">Japanese (日本語)</option>
  <option value="ko">Korean (한국어)</option>
  <option value="pl">Polish (Polski)</option>
  <option value="pt">Portuguese (Português)</option>
  <option value="ro">Romanian (Română)</option>
  <option value="es">Spanish (Español)</option>
  <option value="sv">Swedish (Svenska)</option>
  <option value="th">Thai (ไทย)</option>
  <option value="vi">Vietnamese (Tiếng Việt)</option>
</select>
      </div>

      {/* Microphone Button - Enhanced styling */}
      <div className="flex justify-center mb-8">
        <button
          onClick={() => setIsListening(!isListening)}
          className={`flex items-center gap-3 px-6 py-4 rounded-lg text-white text-lg font-semibold shadow-lg transform transition-all duration-200 ${
            isListening 
            ? 'bg-red-500 animate-pulse scale-105' 
            : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
          }`}
        >
          {isListening ? <FaStop size={24} /> : <FaMicrophone size={24} />}
          {isListening ? "Stop Listening" : "Start Speaking"}
        </button>
      </div>

      {/* Transcript and Translation Boxes - Improved visibility and styling */}
      <div className="grid gap-6 md:grid-cols-2 max-w-6xl mx-auto">
        {/* Patient's Speech Box */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="bg-blue-50 p-4 border-b border-blue-100">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-blue-800">
              <FaUser className="text-blue-600" /> Patient Speech
            </h2>
          </div>
          <div className="p-6">
            <div className="min-h-[200px] p-4 bg-white rounded-lg text-gray-800 text-lg leading-relaxed">
              {transcript || 
                <span className="text-gray-500 italic">
                  Speech will appear here...
                </span>
              }
            </div>
          </div>
        </div>

        {/* Translation Box */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="bg-green-50 p-4 border-b border-green-100">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-green-800">
              <FaLanguage className="text-green-600" /> Translation
            </h2>
          </div>
          <div className="p-6">
            <div className="min-h-[200px] p-4 bg-white rounded-lg text-gray-800 text-lg leading-relaxed mb-4">
              {translation || 
                <span className="text-gray-500 italic">
                  Translation will appear here...
                </span>
              }
            </div>
            {translation && (
              <button
                onClick={speakTranslation}
                className="w-full flex justify-center items-center gap-2 p-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-lg font-semibold"
              >
                <FaVolumeUp size={20} /> Speak Translation
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Display - Improved visibility */}
      {error && (
        <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-lg text-center font-semibold">
          <FaExclamationTriangle className="inline mr-2" />
          {error}
        </div>
      )}
    </div>
  );
}