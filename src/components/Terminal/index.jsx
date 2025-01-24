import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal as TerminalIcon, Send, ChevronRight, ExternalLink, 
  Clock, User, Mail, Github, Linkedin, Award, Briefcase, 
  Code, Sparkles, Mic, MicOff, Volume2, VolumeX, 
  ArrowUp, ArrowDown, History, Trash2, Loader2 
} from 'lucide-react';

const Terminal = () => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [autoComplete, setAutoComplete] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcript, setTranscript] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  
  const endOfMessagesRef = useRef(null);
  const inputRef = useRef(null);

  const commands = {
    help: {
      description: 'Show available commands',
      execute: () => ({
        type: 'system',
        content: [
          '💡 Available Commands:',
          '',
          'about       - Professional summary',
          'experience  - Work history',
          'education   - Academic background',
          'skills     - Technical expertise',
          'projects   - Portfolio highlights',
          'contact    - Contact information',
          'social     - Social media links',
          'clear      - Clear terminal',
          'voice      - Toggle voice feedback',
          'help       - Show this help message'
        ]
      })
    },
    about: {
      description: 'Show professional summary',
      execute: () => ({
        type: 'system',
        content: [
          '👋 Professional Summary',
          '',
          'Senior Software Engineer with 8+ years of experience building scalable applications',
          'and leading engineering teams. Specialized in:',
          '',
          '• Full-stack web development',
          '• Cloud architecture & DevOps',
          '• Team leadership & mentoring',
          '• System design & architecture',
          '',
          'Currently focused on AI/ML integration and serverless architectures.',
        ]
      })
    },
    experience: {
      description: 'Show work history',
      execute: () => ({
        type: 'system',
        content: [
          '💼 Professional Experience',
          '',
          'Senior Software Engineer @ TechCorp (2021-Present)',
          '• Led development of microservices architecture serving 1M+ users',
          '• Reduced system latency by 40% through optimization',
          '• Mentored junior developers and conducted technical interviews',
          '',
          'Software Engineer @ StartupInc (2019-2021)',
          '• Developed full-stack features for SaaS platform',
          '• Implemented CI/CD pipelines reducing deployment time by 60%',
          '• Improved test coverage from 65% to 90%',
          '',
          'Junior Developer @ CodeCo (2017-2019)',
          '• Built responsive web applications using React/Node.js',
          '• Optimized database queries improving performance by 25%'
        ],
        links: [
          { text: 'View LinkedIn', url: 'https://linkedin.com/in/example' }
        ]
      })
    },
    skills: {
      description: 'Show technical skills',
      execute: () => ({
        type: 'system',
        content: [
          '🛠️ Technical Skills',
          '',
          'Languages:',
          '• JavaScript/TypeScript ⭐⭐⭐⭐⭐',
          '• Python ⭐⭐⭐⭐',
          '• Go ⭐⭐⭐',
          '',
          'Frontend:',
          '• React/Next.js ⭐⭐⭐⭐⭐',
          '• Vue/Nuxt.js ⭐⭐⭐⭐',
          '• Modern CSS/Tailwind ⭐⭐⭐⭐',
          '',
          'Backend:',
          '• Node.js/Express ⭐⭐⭐⭐⭐',
          '• Django/FastAPI ⭐⭐⭐⭐',
          '• PostgreSQL/MongoDB ⭐⭐⭐⭐',
          '',
          'DevOps:',
          '• AWS/GCP ⭐⭐⭐⭐',
          '• Docker/Kubernetes ⭐⭐⭐⭐',
          '• CI/CD ⭐⭐⭐⭐'
        ]
      })
    },
    projects: {
      description: 'Show portfolio projects',
      execute: () => ({
        type: 'system',
        content: [
          '🚀 Featured Projects',
          '',
          'CloudScale - Cloud resource optimization platform',
          '• Reduced cloud costs by 35% for enterprise clients',
          '• Tech: React, Node.js, AWS, Terraform',
          '• Used by 100+ companies',
          '',
          'DataViz - Real-time analytics dashboard',
          '• Processes 1M+ events/second',
          '• Tech: Vue.js, Python, ClickHouse, Kafka',
          '• Open-source, 1k+ GitHub stars',
          '',
          'AIChat - Intelligent customer service bot',
          '• Reduced support response time by 60%',
          '• Tech: Python, FastAPI, OpenAI, Redis',
          '• Handles 10k+ conversations daily'
        ],
        links: [
          { text: 'View GitHub', url: 'https://github.com/example' }
        ]
      })
    },
    contact: {
      description: 'Show contact information',
      execute: () => ({
        type: 'system',
        content: [
          '📫 Contact Information',
          '',
          'Email: dev@example.com',
          'Phone: +1 (555) 123-4567',
          'Location: San Francisco, CA',
          '',
          'Available for:',
          '• Full-time opportunities',
          '• Technical consulting',
          '• Speaking engagements',
          '• Open source collaboration'
        ],
        links: [
          { text: 'Send Email', url: 'mailto:dev@example.com' },
          { text: 'Schedule Call', url: 'https://calendly.com/example' }
        ]
      })
    },
    social: {
      description: 'Show social media links',
      execute: () => ({
        type: 'system',
        content: [
          '🌐 Social Media & Professional Profiles',
          '',
          '• LinkedIn: /in/example',
          '• GitHub: @example',
          '• Twitter: @example',
          '• Dev.to: @example',
          '• Medium: @example'
        ],
        links: [
          { text: 'LinkedIn', url: 'https://linkedin.com/in/example' },
          { text: 'GitHub', url: 'https://github.com/example' },
          { text: 'Twitter', url: 'https://twitter.com/example' }
        ]
      })
    },
    clear: {
      description: 'Clear terminal',
      execute: () => {
        setHistory([]);
        return null;
      }
    },
    voice: {
      description: 'Toggle voice feedback',
      execute: () => {
        setVoiceEnabled(!voiceEnabled);
        return {
          type: 'system',
          content: [
            `🎤 Voice feedback ${voiceEnabled ? 'disabled' : 'enabled'}`
          ]
        };
      }
    }
  };

  useEffect(() => {
    const welcomeMessage = {
      type: 'system',
      content: [
        '👋 Welcome to Terminal Vitae v2.0',
        'Type "help" to see available commands.',
        '',
        'Pro tips:',
        '• Use ↑↓ for command history',
        '• Tab for auto-completion',
        '• "voice" command enables speech'
      ],
      timestamp: new Date().toLocaleTimeString()
    };
    setHistory([welcomeMessage]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const simulateProcessing = async (duration = 500) => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, duration));
    setIsProcessing(false);
  };

  const handleCommand = async (cmd) => {
    const trimmedCmd = cmd.trim().toLowerCase();
    
    // Add to command history
    if (trimmedCmd && !['clear'].includes(trimmedCmd)) {
      setCommandHistory(prev => [trimmedCmd, ...prev].slice(0, 50));
    }

    // Add user input to history
    setHistory(prev => [...prev, {
      type: 'user',
      content: cmd,
      timestamp: new Date().toLocaleTimeString()
    }]);

    // Process command
    if (trimmedCmd in commands) {
      await simulateProcessing();
      const result = commands[trimmedCmd].execute();
      if (result) {
        setHistory(prev => [...prev, {
          ...result,
          timestamp: new Date().toLocaleTimeString()
        }]);

        // Speak the response if voice is enabled
        if (voiceEnabled && result.content) {
          speak(Array.isArray(result.content) ? result.content.join(' ') : result.content);
        }
      }
    } else if (trimmedCmd) {
      setHistory(prev => [...prev, {
        type: 'error',
        content: `Command not found: ${cmd}. Type "help" for available commands.`,
        timestamp: new Date().toLocaleTimeString()
      }]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        setHistoryIndex(prev => prev + 1);
        setInput(commandHistory[historyIndex + 1]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        setHistoryIndex(prev => prev - 1);
        setInput(commandHistory[historyIndex - 1]);
      } else {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const suggestions = Object.keys(commands).filter(cmd => 
        cmd.startsWith(input.toLowerCase())
      );
      if (suggestions.length === 1) {
        setInput(suggestions[0]);
      } else if (suggestions.length > 1) {
        setAutoComplete(suggestions);
      }
    }
  };

  const speak = async (text) => {
    if (!voiceEnabled) return;
    
    setIsSpeaking(true);
    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/cjVigY5qzO86Huf0OWal/stream`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': import.meta.env.VITE_ELEVENLABS_API_KEY,
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
              stability: 0.75,  // Increased for more consistent professional tone
              similarity_boost: 0.75,  // Increased for more natural speech
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const audio = new Audio(URL.createObjectURL(blob));
      audio.play();
      
      audio.onended = () => {
        URL.revokeObjectURL(audio.src);
        setIsSpeaking(false);
      };
    } catch (error) {
      console.error('Speech synthesis failed:', error);
      setIsSpeaking(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        await transcribeAudio(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsListening(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setHistory(prev => [...prev, {
        type: 'error',
        content: 'Error accessing microphone. Please check permissions.',
        timestamp: new Date().toLocaleTimeString()
      }]);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  };

  const transcribeAudio = async (blob) => {
    try {
      setIsProcessing(true);
      const formData = new FormData();
      formData.append('file', blob, 'audio.wav');
      formData.append('model', 'whisper-1');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (data.text) {
        setTranscript(data.text);
        setInput(data.text);
        handleCommand(data.text);
      }
    } catch (error) {
      console.error('Transcription error:', error);
      setHistory(prev => [...prev, {
        type: 'error',
        content: 'Error transcribing audio. Please try again.',
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-100">
      <motion.div 
        className="sticky top-0 z-10 bg-gray-800/80 backdrop-blur-sm p-3 flex items-center justify-between border-b border-gray-700"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center space-x-2">
          <TerminalIcon size={16} className="text-green-400" />
          <span className="text-sm font-medium">Terminal Vitae 2.0</span>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            {voiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>
          <button 
            onClick={() => handleCommand('clear')}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            <Trash2 size={14} />
          </button>
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <Clock size={14} />
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </motion.div>

      <div className="flex-1 p-4 overflow-auto space-y-4">
        <AnimatePresence mode="popLayout">
          {history.map((entry, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-2"
              layout
            >
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <User size={12} />
                <span>{entry.timestamp}</span>
              </div>

              <div className={`pl-6 ${
                entry.type === 'error' ? 'text-red-400' :
                entry.type === 'user' ? 'text-blue-400' :
                'text-gray-100'
              }`}>
                {Array.isArray(entry.content) ? (
                  entry.content.map((line, i) => (
                    <div key={i} className="font-mono">{line}</div>
                  ))
                ) : (
                  <div className="font-mono">{entry.content}</div>
                )}

                {entry.links && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {entry.links.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-sm bg-gray-800 hover:bg-gray-700 text-blue-400 px-3 py-1 rounded-full transition-colors"
                      >
                        <span>{link.text}</span>
                        <ExternalLink size={12} />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={endOfMessagesRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!input.trim() || isProcessing) return;
          handleCommand(input);
          setInput('');
          setHistoryIndex(-1);
          setAutoComplete([]);
        }}
        className="sticky bottom-0 bg-gray-800/80 backdrop-blur-sm border-t border-gray-700 p-3"
      >
        {autoComplete.length > 0 && (
          <div className="absolute bottom-full left-0 right-0 bg-gray-800 border-t border-gray-700 p-2">
            <div className="flex flex-wrap gap-2">
              {autoComplete.map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInput(suggestion);
                    setAutoComplete([]);
                    inputRef.current?.focus();
                  }}
                  className="px-2 py-1 text-sm bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isProcessing}
              placeholder={isProcessing ? 'Processing...' : 'Type a command...'}
              className="w-full bg-gray-900 text-gray-100 rounded-lg px-3 py-2 pl-8 text-sm
                       placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500
                       disabled:opacity-50 disabled:cursor-not-allowed"
              autoFocus
            />
            <ChevronRight size={16} className="absolute left-2 top-2.5 text-gray-500" />
          </div>
          
          <button
            type="button"
            onClick={isListening ? stopRecording : startRecording}
            className={`p-2 ${
              isListening ? 'text-red-400 hover:text-red-300' : 'text-gray-400 hover:text-gray-300'
            } transition-colors relative`}
          >
            {isListening ? (
              <motion.div
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <MicOff size={16} />
              </motion.div>
            ) : (
              <Mic size={16} />
            )}
            {isProcessing && (
              <motion.div
                className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              />
            )}
          </button>
          
          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="p-2 text-blue-400 hover:text-blue-300 disabled:opacity-50 
                     disabled:cursor-not-allowed transition-colors relative"
          >
            <Send size={16} />
            {isSpeaking && (
              <motion.div
                className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Terminal;