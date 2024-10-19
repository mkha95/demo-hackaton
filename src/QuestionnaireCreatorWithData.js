import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { FileText, User, PhoneCall, BarChart, Plus, Save, Trash2, CheckCircle, Link, ArrowLeft, AlertCircle, MessageCircle } from 'lucide-react';
import { useAudio } from './AudioContext'; // Add this import
import JsonAnimation from './JsonAnimation';

const QuestionnaireCreatorWithData = ({ isPlaying, onPlay, onPause, onReset }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [questionnaireData, setQuestionnaireData] = useState({
    name: '',
    category: '',
    agentType: '',
    questions: [],
    endpoint: '',
    hotlineNumber: ''
  });
  const [showEndpointData, setShowEndpointData] = useState(false);
  const [showJsonData, setShowJsonData] = useState(false);
  const cursorControl = useAnimation();
  const [hotlineNumber, setHotlineNumber] = useState('');
  const [audioError, setAudioError] = useState(null);
  const audioRef = useRef(null);
  const { playBackgroundMusic, pauseBackgroundMusic, playDialogue, isDialoguePlaying } = useAudio();
  const [isBackgroundMusicPlaying, setIsBackgroundMusicPlaying] = useState(true);
  const [showJsonAnimation, setShowJsonAnimation] = useState(false);

  const questionTypes = [
    { type: 'text', label: 'Testo' },
    { type: 'number', label: 'Numero' },
    { type: 'select', label: 'Selezione' },
    { type: 'rating', label: 'Valutazione' }
  ];

  const steps = [
    { type: 'input', field: 'name', label: "Nome Questionario", value: "Sondaggio Mobilità Urbana 2024" },
    { type: 'input', field: 'endpoint', label: "Endpoint Salvataggio", value: "https://api.comune.it/sondaggio-mobilita-2024" },
    { type: 'input', field: 'category', label: "Categoria Utente", value: "Residenti Urbani" },
    { type: 'input', field: 'agentType', label: "Tipo di Agent", value: "Esperto Mobilità Urbana" },
    { type: 'question', text: "Con quale frequenza utilizza i mezzi pubblici?", questionType: 'select', options: ['Ogni giorno', '2-3 volte a settimana', 'Una volta a settimana', 'Raramente', 'Mai'] },
    { type: 'question', text: "Quanti minuti impiega in media per raggiungere il lavoro/scuola?", questionType: 'number', min: 0, max: 120 },
    { type: 'question', text: "Come valuta la qualità complessiva del trasporto pubblico?", questionType: 'rating', scale: 5 },
    { type: 'question', text: "Quali miglioramenti suggerirebbe per il sistema di trasporto pubblico?", questionType: 'text' },
    { type: 'activation', text: "Attivazione Hotline", number: "800-MOBILITA" },
    { type: 'statistics', title: "Statistiche Sondaggio", stats: {
      partecipanti: 500,
      completati: 450,
      tempoMedio: "12 min",
      soddisfazioneMedia: "3.8/5"
    }}
  ];

  const moveCursor = async (x, y) => {
    await cursorControl.start({ x, y, transition: { duration: 1 } });
  };

  const simulateClick = async () => {
    await cursorControl.start({ scale: 0.8, transition: { duration: 0.1 } });
    await cursorControl.start({ scale: 1, transition: { duration: 0.1 } });
  };

  const simulateTyping = async (field, value) => {
    for (let i = 0; i <= value.length; i++) {
      setQuestionnaireData(prev => ({ ...prev, [field]: value.slice(0, i) }));
      await new Promise(resolve => setTimeout(resolve, 10)); // Reduced from 20ms to 10ms
    }
  };

  const simulateHotlineActivation = async () => {
    await moveCursor(window.innerWidth / 2 - 100, window.innerHeight - 150);
    await simulateClick();
    setHotlineNumber("800-MOBILITA");
  };

  const simulateEndpointClick = async () => {
    await moveCursor(50, 160);
    await simulateClick();
    setShowEndpointData(true);
  };

  const simulateJsonViewClick = async () => {
    await moveCursor(50, 160);
    await simulateClick();
    setShowJsonData(true);
  };

  useEffect(() => {
    const runStep = async () => {
      const step = steps[currentStep];
      if (step.type === 'input') {
        await moveCursor(50, 100 + currentStep * 60);
        await simulateTyping(step.field, step.value);
      } else if (step.type === 'question') {
        await moveCursor(50, 280 + questionnaireData.questions.length * 60);
        await simulateClick();
        setQuestionnaireData(prev => ({ ...prev, questions: [...prev.questions, { ...step, id: Date.now() }] }));
      } else if (step.type === 'activation') {
        await simulateHotlineActivation();
      }
      
      // Scroll to the bottom of the page
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
      });
      
      if (currentStep < steps.length - 1) {
        setTimeout(() => setCurrentStep(currentStep + 1), 800);
      } else if (currentStep === steps.length - 1) {
        setTimeout(simulateEndpointClick, 1200);
      }
    };

    runStep();
  }, [currentStep]);

  useEffect(() => {
    // Start playing background music when the component mounts
    playBackgroundMusic();
    setIsBackgroundMusicPlaying(true);

    // Stop the music when the component unmounts
    return () => {
      pauseBackgroundMusic();
    };
  }, []);

  useEffect(() => {
    if (showJsonData && isDialoguePlaying) {
      pauseBackgroundMusic();
      setIsBackgroundMusicPlaying(false);
    } else if (!showJsonData && !isBackgroundMusicPlaying) {
      playBackgroundMusic();
      setIsBackgroundMusicPlaying(true);
    }
  }, [showJsonData, isDialoguePlaying]);

  const handleAudioError = (e) => {
    console.error("Errore audio:", e);
    // Mostriamo l'errore solo se non è un'interruzione
    if (e.type !== 'abort') {
      setAudioError(`Errore nel caricamento dell'audio: ${e.message}`);
    }
  };

  const renderQuestion = (question) => {
    switch (question.questionType) {
      case 'text':
        return <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="Inserisci la tua risposta" />;
      case 'number':
        return <input type="number" min={question.min} max={question.max} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="Inserisci un numero" />;
      case 'select':
        return (
          <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
            {question.options.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'rating':
        return (
          <div className="flex space-x-2 mt-2">
            {[...Array(question.scale)].map((_, i) => (
              <button key={i} className="w-8 h-8 rounded-full bg-gray-200 hover:bg-yellow-400 focus:bg-yellow-400 transition-colors">
                {i + 1}
              </button>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  const endpointData = {
    totalResponses: 450,
    averageCompletionTime: "12 minutes",
    questionStats: [
      { 
        question: "Con quale frequenza utilizza i mezzi pubblici?", 
        responses: {
          "Ogni giorno": 40, 
          "2-3 volte a settimana": 30, 
          "Una volta a settimana": 15, 
          "Raramente": 10, 
          "Mai": 5
        }
      },
      { 
        question: "Quanti minuti impiega in media per raggiungere il lavoro/scuola?", 
        averageTime: 35,
        distribution: {
          "0-15 min": 20,
          "16-30 min": 35,
          "31-45 min": 25,
          "46-60 min": 15,
          "Più di 60 min": 5
        }
      },
      { 
        question: "Come valuta la qualità complessiva del trasporto pubblico?", 
        averageRating: 3.8,
        distribution: {
          "1 stella": 5,
          "2 stelle": 10,
          "3 stelle": 25,
          "4 stelle": 40,
          "5 stelle": 20
        }
      },
      { 
        question: "Quali miglioramenti suggerirebbe per il sistema di trasporto pubblico?", 
        commonSuggestions: [
          "Aumentare la frequenza dei mezzi",
          "Migliorare la puntualità",
          "Rinnovare la flotta dei veicoli",
          "Estendere gli orari di servizio",
          "Implementare corsie preferenziali per autobus"
        ]
      }
    ]
  };

  const jsonData = {
    questionnaireInfo: {
      name: questionnaireData.name,
      category: questionnaireData.category,
      agentType: questionnaireData.agentType,
      hotlineNumber: questionnaireData.hotlineNumber
    },
    responses: endpointData.questionStats.map(stat => ({
      question: stat.question,
      data: stat.responses || stat.distribution || stat.commonSuggestions
    })),
    totalResponses: endpointData.totalResponses,
    averageCompletionTime: endpointData.averageCompletionTime
  };

  if (showJsonAnimation) {
    return <JsonAnimation onBack={() => setShowJsonAnimation(false)} />;
  }

  if (showJsonData) {
    return (
      <div className="bg-gray-100 p-8 min-h-screen">
        <button 
          onClick={() => setShowJsonData(false)}
          className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="mr-2" /> Torna al questionario
        </button>
        <h2 className="text-2xl font-bold mb-4">Dati JSON dell'Endpoint</h2>
        <pre className="bg-white p-4 rounded-lg shadow overflow-x-auto">
          {JSON.stringify(jsonData, null, 2)}
        </pre>
        <button 
          onClick={() => setShowJsonAnimation(true)}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center"
        >
          <MessageCircle className="mr-2" size={20} />
          Visualizza Animazione JSON
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-lg shadow-xl max-w-4xl mx-auto relative overflow-hidden">
      <h1 className="text-4xl font-bold mb-8 text-blue-800 text-center">Creazione Questionario PA</h1>
      
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-sm font-medium text-gray-700">Nome Questionario</label>
          <input 
            type="text" 
            value={questionnaireData.name} 
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            readOnly 
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-sm font-medium text-gray-700">Categoria Utente</label>
          <input 
            type="text" 
            value={questionnaireData.category} 
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            readOnly 
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-sm font-medium text-gray-700">Tipo di Agent</label>
          <input 
            type="text" 
            value={questionnaireData.agentType} 
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            readOnly 
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-sm font-medium text-gray-700">Endpoint Salvataggio</label>
          <input 
            type="text" 
            value={questionnaireData.endpoint} 
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            readOnly 
          />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Domande del Questionario:</h2>
        <ul className="space-y-4">
          {questionnaireData.questions.map((q, index) => (
            <li key={q.id} className="bg-white p-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-lg text-gray-800">{index + 1}. {q.text}</span>
                <button className="text-red-500 hover:text-red-700">
                  <Trash2 size={20} />
                </button>
              </div>
              {renderQuestion(q)}
            </li>
          ))}
        </ul>
        <button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full flex items-center justify-center w-full sm:w-auto transition-colors duration-300">
          <Plus className="mr-2" size={20} />
          Aggiungi Domanda
        </button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <button className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full flex items-center justify-center w-full sm:w-auto transition-colors duration-300">
          <Save className="mr-2" size={20} />
          Salva Questionario
        </button>
        <button 
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 rounded-full flex items-center justify-center w-full sm:w-auto transition-colors duration-300"
          onClick={simulateHotlineActivation}
        >
          <PhoneCall className="mr-2" size={20} />
          Attiva Hotline
        </button>
      </div>

      {hotlineNumber && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-green-100 p-4 rounded-lg shadow-md mb-8"
        >
          <h3 className="font-semibold text-xl mb-2 text-green-800">Hotline Attivata</h3>
          <p className="text-green-700">Numero Verde: <strong>{hotlineNumber}</strong></p>
        </motion.div>
      )}

      {currentStep >= steps.length - 1 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-blue-100 p-6 rounded-lg shadow-md"
        >
          <h3 className="font-semibold text-xl mb-4 text-blue-800">Statistiche Sondaggio</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(steps[steps.length - 1].stats).map(([key, value]) => (
              <div key={key} className="flex items-center bg-white p-3 rounded-md shadow">
                <BarChart className="mr-3 text-blue-600" size={24} />
                <div>
                  <span className="block text-sm text-gray-600">{key}</span>
                  <strong className="text-lg text-gray-800">{value}</strong>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {showEndpointData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-8 bg-white p-6 rounded-lg shadow-lg"
        >
          <h3 className="text-2xl font-bold mb-4 text-blue-800">Dati del Sondaggio</h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="col-span-1 bg-blue-50 p-4 rounded-md">
              <p className="text-lg font-semibold">Risposte Totali</p>
              <p className="text-3xl font-bold text-blue-600">{endpointData.totalResponses}</p>
            </div>
            <div className="col-span-1 bg-green-50 p-4 rounded-md">
              <p className="text-lg font-semibold">Tempo Medio di Completamento</p>
              <p className="text-3xl font-bold text-green-600">{endpointData.averageCompletionTime}</p>
            </div>
          </div>
          {endpointData.questionStats.map((stat, index) => (
            <div key={index} className="mb-6 bg-gray-50 p-4 rounded-lg">
              <h4 className="text-xl font-semibold mb-3">{stat.question}</h4>
              {stat.responses && (
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(stat.responses).map(([option, value]) => (
                    <div key={option} className="flex justify-between items-center bg-white p-2 rounded">
                      <span>{option}</span>
                      <span className="font-bold">{value}%</span>
                    </div>
                  ))}
                </div>
              )}
              {stat.averageTime && (
                <div className="mt-3">
                  <p className="font-semibold">Tempo medio: {stat.averageTime} minuti</p>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {Object.entries(stat.distribution).map(([range, value]) => (
                      <div key={range} className="flex justify-between items-center bg-white p-2 rounded">
                        <span>{range}</span>
                        <span className="font-bold">{value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {stat.averageRating && (
                <div className="mt-3">
                  <p className="font-semibold">Valutazione media: {stat.averageRating}/5</p>
                  <div className="flex items-center mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className={`w-6 h-6 ${star <= Math.round(stat.averageRating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {Object.entries(stat.distribution).map(([rating, value]) => (
                      <div key={rating} className="flex justify-between items-center bg-white p-2 rounded">
                        <span>{rating}</span>
                        <span className="font-bold">{value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {stat.commonSuggestions && (
                <div className="mt-3">
                  <p className="font-semibold">Suggerimenti comuni:</p>
                  <ul className="list-disc list-inside mt-2">
                    {stat.commonSuggestions.map((suggestion, i) => (
                      <li key={i} className="text-gray-700">{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
          <button 
            onClick={simulateJsonViewClick}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center"
          >
            <Link className="mr-2" size={20} />
            Visualizza JSON dell'Endpoint
          </button>
        </motion.div>
      )}

      {audioError && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {audioError}
        </div>
      )}

      <motion.div
        className="w-6 h-6 rounded-full bg-blue-500 opacity-50 absolute pointer-events-none z-50"
        animate={cursorControl}
        initial={{ x: 0, y: 0 }}
      />
    </div>
  );
};

export default QuestionnaireCreatorWithData;
