import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, MessageCircle, CheckCircle } from 'lucide-react';

const conversation = [
  { speaker: 'assistant', text: "Benvenuto al servizio di segnalazione problemi stradali. Che problema desidera segnalare?", field: null, time: 0 },
  { speaker: 'citizen', text: "C'è una buca pericolosa in via Roma, vicino al numero 25.", field: 'problema', value: { tipo: 'buca', descrizione: 'pericolosa' }, time: 5 },
  { speaker: 'assistant', text: "Capito. Su una scala da 1 a 5, quanto è grave?", field: null, time: 10 },
  { speaker: 'citizen', text: "Direi 4, è grande e pericolosa.", field: 'gravita', value: 4, time: 14 },
  { speaker: 'assistant', text: "Ho registrato tutto. Posso inviare la segnalazione?", field: 'posizione', value: { via: 'Roma', numero: '25' }, time: 18 },
  { speaker: 'citizen', text: "Sì, grazie.", field: 'conferma', value: true, time: 22 },
  { speaker: 'assistant', text: "Segnalazione inviata. Grazie per il suo contributo alla sicurezza stradale.", field: 'stato', value: 'inviata', time: 24 }
];

const JsonAnimation = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [json, setJson] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState(null);
  const audioRef = useRef(null);
  const conversationRef = useRef(null);
  const jsonRef = useRef(null);

  useEffect(() => {
    if (isPlaying && currentStep < conversation.length) {
      const currentMessage = conversation[currentStep];
      const nextMessage = conversation[currentStep + 1];

      if (currentMessage.field) {
        setJson(prevJson => ({
          ...prevJson,
          [currentMessage.field]: currentMessage.value
        }));
      }

      if (nextMessage) {
        const timer = setTimeout(() => {
          setCurrentStep(prevStep => prevStep + 1);
        }, (nextMessage.time - currentMessage.time) * 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [currentStep, isPlaying]);

  useEffect(() => {
    // Scorrimento automatico per la conversazione
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
    // Scorrimento automatico per il JSON
    if (jsonRef.current) {
      jsonRef.current.scrollTop = jsonRef.current.scrollHeight;
    }
  }, [currentStep, json]);

  useEffect(() => {
    // Precarica l'audio quando il componente viene montato
    audioRef.current.load();
  }, []);

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(error => {
        console.error("Errore nella riproduzione:", error);
        setAudioError(`Errore nella riproduzione: ${error.message}`);
      });
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleReset = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentStep(0);
    setJson({});
    setAudioError(null);
  };

  const handleAudioError = (e) => {
    console.error("Errore audio:", e);
    setAudioError(`Errore nel caricamento dell'audio: ${e.message}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-4">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold mb-6 text-center text-indigo-700">Segnalazione Problema Stradale</h2>
        <div className="grid grid-cols-2 gap-8">
          <div ref={conversationRef} className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Conversazione</h3>
            <AnimatePresence>
              {conversation.slice(0, currentStep + 1).map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className={`flex items-start mb-4 ${message.speaker === 'assistant' ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-3/4 p-3 rounded-lg ${message.speaker === 'assistant' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                    {message.speaker === 'assistant' ? <MessageCircle className="inline-block mr-2" size={18} /> : <AlertCircle className="inline-block mr-2" size={18} />}
                    {message.text}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div ref={jsonRef} className="bg-gray-900 rounded-lg p-4 h-96 overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4 text-gray-300">JSON Generato</h3>
            <AnimatePresence>
              {Object.entries(json).map(([key, value]) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.5 }}
                  className="mb-2"
                >
                  <span className="text-green-400">"{key}"</span>:
                  <span className="text-yellow-300"> {JSON.stringify(value, null, 2)}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
        <div className="flex justify-center space-x-4 mt-6">
          <button onClick={handlePlay} className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full transition duration-300 ease-in-out flex items-center" disabled={isPlaying}>
            <CheckCircle className="mr-2" size={18} /> Play
          </button>
          <button onClick={handlePause} className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-full transition duration-300 ease-in-out flex items-center" disabled={!isPlaying}>
            <AlertCircle className="mr-2" size={18} /> Pause
          </button>
          <button onClick={handleReset} className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full transition duration-300 ease-in-out flex items-center">
            <MessageCircle className="mr-2" size={18} /> Reset
          </button>
        </div>
      </div>
      {audioError && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {audioError}
        </div>
      )}
      <audio
        ref={audioRef}
        src="/dialogue.mp3"
        onError={handleAudioError}
      />
    </div>
  );
};

export default JsonAnimation;
