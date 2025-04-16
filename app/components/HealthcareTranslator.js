'use client';
import { useState, useEffect, useCallback } from 'react';
import { FaMicrophone, FaStop, FaVolumeUp, FaSpinner, FaTimes } from 'react-icons/fa';

export default function HealthcareTranslator() {
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    // Load voices on mount
    window.speechSynthesis.getVoices();
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4 md:p-8">
      {/* Your entire JSX here */}
    </div>
  );
}
