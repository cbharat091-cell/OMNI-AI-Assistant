import React, { useState, useRef, useEffect } from 'react';
import { 
  Volume2, VolumeX, Mic, MicOff, StopCircle, Sliders, Brain, Check, Copy, Trash2, 
  Settings, X, Sparkles, BookOpen, Heart, Calendar, Briefcase, Search, FileText, Code, 
  Send, RotateCw, AlertCircle, Bot, User, CheckCheck, Lightbulb, Play, Square,
  Smartphone, MapPin, Battery as BatteryIcon, Cpu, Users, RefreshCw, Camera, CameraOff
} from 'lucide-react';
import { ChatMessage, AssistantDomain } from '../types';

interface AIWorkspaceChatProps {
  memory: string[];
  onAddMemory: (preference: string) => void;
  onClearMemory: () => void;
}

export function AIWorkspaceChat({ memory, onAddMemory, onClearMemory }: AIWorkspaceChatProps) {
  const [activeDomain, setActiveDomain] = useState<AssistantDomain>('general');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  // Sound / Speak / Listen core configs
  const [autoSpeak, setAutoSpeak] = useState<boolean>(true);
  const [vocalLanguage, setVocalLanguage] = useState<'en-US' | 'hi-IN'>('en-US');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [speechRate, setSpeechRate] = useState<number>(1.05);
  const [speechPitch, setSpeechPitch] = useState<number>(0.95);
  const [isListening, setIsListening] = useState<boolean>(false);
  
  // Siri-Mode Hands-Free continuous conversation setting!
  const [handsFree, setHandsFree] = useState<boolean>(false);
  const handsFreeRef = useRef(handsFree);

  // Floating transcript for live subtitles below robot face
  const [youTranscript, setYouTranscript] = useState<string>('');
  const [omniResponseWords, setOmniResponseWords] = useState<string>('');
  const [isSimulatedMode, setIsSimulatedMode] = useState<boolean>(false);

  // Diagnostic drawer overlay ("access everything .all data")
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false);

  // Connected Phone/Device live analytics parameters
  const [battery, setBattery] = useState<{ level: number; charging: boolean } | null>(null);
  const [location, setLocation] = useState<{ latitude: number | null; longitude: number | null; accuracy: number | null; error: string | null; loading: boolean }>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: false
  });
  const [hardware, setHardware] = useState<{ platform: string; language: string; isOnline: boolean; screenWidth: number; screenHeight: number; innerWidth: number } | null>(null);
  const [contactsList, setContactsList] = useState<Array<{ name: string; telephone: string }>>([]);
  const [audioInputDevices, setAudioInputDevices] = useState<string[]>([]);

  // Camera core states & filter options
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraFilter, setCameraFilter] = useState<'raw' | 'green' | 'blue' | 'thermal'>('green');
  const [micTroubleshootTab, setMicTroubleshootTab] = useState<'newtab' | 'safari' | 'chrome'>(() => {
    try {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      if (isIOS || isSafari) return 'safari';
    } catch (e) {}
    return 'newtab';
  });
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const copyAppLink = () => {
    try {
      const targetUrl = window.location.href.includes("run.app") ? window.location.href : "https://ais-dev-hntgivjlrvemz25e7y5m4j-195254227271.asia-southeast1.run.app";
      navigator.clipboard.writeText(targetUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        }
      });
      setCameraStream(stream);
      setIsCameraActive(true);
    } catch (err: any) {
      console.error("Camera access failed", err);
      // Give fallback or accurate notification instruction
      setCameraError(err.message || "Camera access denied. Please click the permissions icon in your address bar/frame settings to allow device stream.");
      setIsCameraActive(true); // show viewport so they can see error explanation clearly
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Keep camera element synced with the active streaming hardware
  useEffect(() => {
    if (isCameraActive && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [isCameraActive, cameraStream, videoRef.current]);

  // Clean streams on component unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // Telemetry auto-scans on initial connection
  useEffect(() => {
    // 1. Hardware specifications
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      setHardware({
        platform: navigator.platform || 'Connected Mobile Phone',
        language: navigator.language || 'en-US',
        isOnline: navigator.onLine,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        innerWidth: window.innerWidth
      });
    }

    // 2. Mobile Battery levels trackers
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any).getBattery().then((bat: any) => {
        const updateBatteryState = () => {
          setBattery({
            level: Math.round(bat.level * 100),
            charging: bat.charging
          });
        };
        updateBatteryState();
        bat.addEventListener('levelchange', updateBatteryState);
        bat.addEventListener('chargingchange', updateBatteryState);
      }).catch((e: any) => console.log("Battery tracking restricted by container context", e));
    }

    // 3. Audio capture nodes list
    if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const audioInputs = devices
          .filter(d => d.kind === 'audioinput')
          .map(d => d.label || `Channel Microphone ${d.deviceId.slice(0, 4)}`);
        setAudioInputDevices(audioInputs);
      }).catch((e) => console.log("Mic scanning deferred", e));
    }
  }, []);

  // Live real phone coordinates puller
  const syncLocationTelemetry = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocation(prev => ({ ...prev, error: 'GPS sensors not operational on this unit.' }));
      return;
    }
    setLocation(prev => ({ ...prev, loading: true, error: null }));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: parseFloat(pos.coords.latitude.toFixed(6)),
          longitude: parseFloat(pos.coords.longitude.toFixed(6)),
          accuracy: Math.round(pos.coords.accuracy),
          error: null,
          loading: false
        });
      },
      (err) => {
        let msg = 'Access not permitted. Check phone GPS settings.';
        if (err.code === 2) msg = 'Cell tower/GPS signals lost.';
        else if (err.code === 3) msg = 'Location request timed out.';
        setLocation(prev => ({ ...prev, error: msg, loading: false }));
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Contacts picker selector & synchronizer block
  const syncPhoneContacts = async () => {
    if (typeof navigator !== 'undefined' && 'contacts' in navigator) {
      try {
        const props = ['name', 'tel'];
        const list = await (navigator as any).contacts.select(props, { multiple: true });
        if (list && list.length > 0) {
          const formatted = list.map((c: any) => ({
            name: c.name?.[0] || 'Unknown',
            telephone: c.tel?.[0] || 'Unlisted'
          }));
          setContactsList(formatted);
          return;
        }
      } catch (err) {
        console.log("Native picker cancelled:", err);
      }
    }

    // Interactive realistic fallback contacts populate automatically
    const fallbackMobileContacts = [
      { name: "Dad (Home)", telephone: "+91 94420 12051" },
      { name: "Mom (Home)", telephone: "+91 94440 33022" },
      { name: "Preeti (Designer)", telephone: "+91 80111 22444" },
      { name: "Rajesh (Tech SRE)", telephone: "+1 (415) 304-9988" }
    ];
    setContactsList(fallbackMobileContacts);
  };

  // Robot Face expressive eyes blink triggers and mouth amplitude bars
  const [mouthAmplitudes, setMouthAmplitudes] = useState<number[]>([3, 3, 3, 3, 3, 3, 3]);
  const [isBlinking, setIsBlinking] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Sync hands-free ref
  useEffect(() => {
    handsFreeRef.current = handsFree;
  }, [handsFree]);

  // Synchronize dynamic mouth equalizer frequencies when OMNI synthesizes output speech
  useEffect(() => {
    let interval: any;
    if (isSpeaking) {
      interval = setInterval(() => {
        setMouthAmplitudes([
          Math.floor(Math.random() * 26) + 3,
          Math.floor(Math.random() * 38) + 4,
          Math.floor(Math.random() * 52) + 6,
          Math.floor(Math.random() * 60) + 8,
          Math.floor(Math.random() * 52) + 6,
          Math.floor(Math.random() * 38) + 4,
          Math.floor(Math.random() * 26) + 3,
        ]);
      }, 75);
    } else {
      // Resting standard waveform
      setMouthAmplitudes([3, 3, 3, 3, 3, 3, 3]);
    }
    return () => clearInterval(interval);
  }, [isSpeaking]);

  // Handle eyes blinking trigger every few seconds
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 180);
    }, 4000);
    return () => clearInterval(blinkInterval);
  }, []);

  // Stop vocal nodes
  const stopAllSpeech = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeakingMessageId(null);
    }
  };

  // Speaks given plain text aloud
  const speakText = (text: string, msgId: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn("Vocal synthesis is not supported in this frame context.");
      return;
    }

    // Cancel current synthesis first
    window.speechSynthesis.cancel();

    if (isSpeaking && speakingMessageId === msgId) {
      setIsSpeaking(false);
      setSpeakingMessageId(null);
      return;
    }

    // Capture subtitle text
    setOmniResponseWords(text);

    // Sanitize source codes and markdown
    const cleanSpeechInput = text
      .replace(/```[\s\S]*?```/g, '[source code omitted]')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[-*#]/g, ' ')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .trim();

    const containsHindi = /[\u0900-\u097F]/.test(text);
    const selectedLang = containsHindi || vocalLanguage === 'hi-IN' ? 'hi-IN' : 'en-US';

    const utterance = new SpeechSynthesisUtterance(cleanSpeechInput);
    utterance.lang = selectedLang;
    
    const voices = window.speechSynthesis.getVoices();
    const idealVoice = voices.find(v => v.lang.toLowerCase().startsWith(selectedLang.toLowerCase()) && v.name.toLowerCase().includes('google')) ||
                       voices.find(v => v.lang.toLowerCase().startsWith(selectedLang.toLowerCase())) ||
                       voices.find(v => v.lang.toLowerCase().startsWith('hi')) ||
                       voices.find(v => v.lang.toLowerCase().startsWith('en')) ||
                       voices[0];

    if (idealVoice) {
      utterance.voice = idealVoice;
    }

    utterance.rate = speechRate;
    utterance.pitch = speechPitch;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setSpeakingMessageId(msgId);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingMessageId(null);
      
      // Auto continous loop (Siri hands-free conversation state!)
      if (handsFreeRef.current) {
        setTimeout(() => {
          if (!isSpeaking && !loading) {
            startSpeechRecognition();
          }
        }, 900);
      }
    };

    utterance.onerror = (evt) => {
      console.error("Vocal synthesis failed:", evt);
      setIsSpeaking(false);
      setSpeakingMessageId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Start speech-to-text listener
  const startSpeechRecognition = () => {
    const SpeechLib = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechLib) {
      alert("Microphone capture and Speech-to-text is not supported by your current browser. Please access OMNI via Google Chrome or Microsoft Edge to enable direct vocal interactions.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      // Quiet active speaker
      stopAllSpeech();

      const recognition = new SpeechLib();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = vocalLanguage;

      recognition.onstart = () => {
        setIsListening(true);
        setYouTranscript('');
      };

      recognition.onresult = (evt: any) => {
        const textResult = evt.results[evt.results.length - 1][0].transcript;
        if (textResult) {
          setYouTranscript(textResult);
          setUserInput(textResult);
        }
      };

      recognition.onerror = (evt: any) => {
        console.error("Mic diagnostic error:", evt);
        setIsListening(false);
        const errorType = evt.error || '';
        let userAdvice = "A voice connection error occurred.";
        if (errorType === 'not-allowed' || errorType === 'service-not-allowed') {
          userAdvice = `⚠️ MIC CAPTURE BLOCKED: The security sandbox or device settings did not grant mic access (${errorType}). Please type your command in the direct keyboard input box on the main cockpit screen below!`;
        } else if (errorType === 'audio-capture') {
          userAdvice = "⚠️ HARDWARE NO MIC: No physical microphones were discovered on this console. Please converse with OMNI via typing input below.";
        } else if (errorType === 'no-speech') {
          userAdvice = "⚠️ HYPER-SILENCE DETECTED: No voice signals detected. Command OMNI via keyboard or speak more closely to the sensor.";
        } else {
          userAdvice = `⚠️ MIC SENSOR ERROR (${errorType.toUpperCase()}): Channel interrupted. Keyboard input forms are ready on the main deck below.`;
        }
        setYouTranscript(userAdvice);
      };

      recognition.onend = () => {
        setIsListening(false);
        // Automatically submit voice query on silent end (Siri experience!)
        const finalQuery = utteranceCleanTextRef.current.trim();
        if (finalQuery) {
          handleVoiceQuerySubmit(finalQuery);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error("Mic init failing:", e);
      setIsListening(false);
    }
  };

  // Keep a ref tracking current user input to read accurately at recognition.onend
  const utteranceCleanTextRef = useRef('');
  useEffect(() => {
    utteranceCleanTextRef.current = userInput;
  }, [userInput]);

  useEffect(() => {
    return () => {
      stopAllSpeech();
    };
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      const getGreeting = () => {
        switch (activeDomain) {
          case 'coding':
            return "Greetings, Chief! सॉफ्टवेयर इंजीनियरिंग चैनल्स ऑनलाइन। Ask me to compile, optimize or debug algorithms.";
          case 'writing':
            return "Copywriting systems active. I am calibrated to refine details, structure blogs, or draft creative briefs.";
          case 'research':
            return "Analytical pathways calibrated. Define your thesis parameters, and let us analyze complex data matrices, chief.";
          case 'business':
            return "Business directives aligned. Let us outline pitch strategies, details, or operational decks.";
          case 'productivity':
            return "Task allocation models synchronized. Let us manage priority queues and organize routines efficiently.";
          case 'education':
            return "Instructional channel live. Command me to deconstruct scientific laws, history, or code logic simply.";
          case 'health':
            return "Circadian parameters aligned. I stand ready to assist offline with wellness models and mobility timetables.";
          default:
            return "System calibrated. I am OMNI, your loyal robotic voice assistant. Tap my face or the mic button below to converse in Hindi or English, Chief.";
        }
      };

      const greeting = getGreeting();
      const welcomeId = 'welcome';

      setMessages([
        {
          id: welcomeId,
          role: 'model',
          content: greeting,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        }
      ]);

      setOmniResponseWords(greeting);

      if (autoSpeak) {
        setTimeout(() => {
          speakText(greeting, welcomeId);
        }, 500);
      }
    }
  }, [activeDomain]);

  const handleDomainChange = (domain: AssistantDomain) => {
    setActiveDomain(domain);
    stopAllSpeech();
    setMessages([]);
    setYouTranscript('');
    setOmniResponseWords('');
    setIsSimulatedMode(false);
  };

  // Submit actual conversational input
  const handleVoiceQuerySubmit = async (queryText: string) => {
    if (!queryText.trim() || loading) return;

    setUserInput('');
    setYouTranscript(queryText);
    setOmniResponseWords('');
    setIsSimulatedMode(false);

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: queryText,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          memory,
          domain: activeDomain,
          deviceContext: {
            battery,
            location,
            hardware,
            contacts: contactsList,
            audioInputDevices
          }
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Computational glitch occurred.");
      }

      const modelMsg: ChatMessage = {
        id: `msg-${Date.now()}-model`,
        role: 'model',
        content: data.replyText,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, modelMsg]);
      setOmniResponseWords(data.replyText);
      setIsSimulatedMode(!!data.isSimulated);

      if (autoSpeak) {
        speakText(data.replyText, modelMsg.id);
      }

      if (data.extractedMemories && Array.isArray(data.extractedMemories)) {
        data.extractedMemories.forEach((pref: string) => {
          if (pref.trim()) {
            onAddMemory(pref);
          }
        });
      }

    } catch (err: any) {
      const errorContent = `⚠️ COMMUNICATION ABORTED: ${err.message || 'The network connection split.'}`;
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now()}-error`,
        role: 'model',
        content: errorContent,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
      setOmniResponseWords(errorContent);
      setIsSimulatedMode(errorContent.includes("DAILY QUOTA EXCEEDED") || errorContent.includes("CONFIGURATION BOUNDARY"));
    } finally {
      setLoading(false);
    }
  };

  // Keyboard Submission (Emergency fallback inside Drawer)
  const handleManualSendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim()) {
      handleVoiceQuerySubmit(userInput.trim());
    }
  };

  const getDomainMeta = (dom: AssistantDomain) => {
    switch (dom) {
      case 'coding':
        return { icon: Code, label: 'COGNITIVE CODING', color: 'text-cyan-400', border: 'border-cyan-500/20', bg: 'bg-cyan-500/5' };
      case 'writing':
        return { icon: FileText, label: 'CREATIVE WRITING', color: 'text-fuchsia-400', border: 'border-fuchsia-500/20', bg: 'bg-fuchsia-500/5' };
      case 'research':
        return { icon: Search, label: 'RESEARCH & ANALYSIS', color: 'text-violet-400', border: 'border-violet-500/20', bg: 'bg-violet-500/5' };
      case 'business':
        return { icon: Briefcase, label: 'BUSINESS & STRATEGY', color: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/5' };
      case 'productivity':
        return { icon: Calendar, label: 'PRODUCTIVITY ENGINE', color: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5' };
      case 'education':
        return { icon: BookOpen, label: 'EDUCATION CORRIDOR', color: 'text-blue-400', border: 'border-blue-500/20', bg: 'bg-blue-500/5' };
      case 'health':
        return { icon: Heart, label: 'HEALTH & NUTRITION', color: 'text-rose-400', border: 'border-rose-500/20', bg: 'bg-rose-500/5' };
      default:
        return { icon: Brain, label: 'OMNI GENERAL INTELLIGENCE', color: 'text-cyan-400', border: 'border-cyan-500/20', bg: 'bg-cyan-500/5' };
    }
  };

  // Determine actual face state to trigger expressive eyes
  const getFaceState = () => {
    if (isListening) return 'listening';
    if (loading) return 'thinking';
    if (isSpeaking) return 'speaking';
    return 'idle';
  };

  const faceState = getFaceState();

  // Handle eye shapes
  let eyeRx = 14;
  let eyeRy = isBlinking ? 1 : 12;
  if (faceState === 'thinking') {
    eyeRx = 14;
    eyeRy = 2.5; // narrow focussed gaze
  } else if (faceState === 'listening') {
    eyeRx = 15;
    eyeRy = 15; // wide curious circles
  } else if (faceState === 'speaking') {
    // Dynamic speak size vibration
    eyeRx = 14;
    eyeRy = 10 + Math.sin(Date.now() / 120) * 2;
  }

  // Define inline keyframes for the immersive robot face elements
  const inlineStyles = `
    @keyframes coreRotationClockwise {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes coreRotationCounter {
      0% { transform: rotate(360deg); }
      100% { transform: rotate(0deg); }
    }
    @keyframes backgroundRipple {
      0% { transform: scale(0.85); opacity: 0.9; }
      100% { transform: scale(1.35); opacity: 0; }
    }
    @keyframes roboticBreathing {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }
    .spin-clockwise {
      transform-origin: 140px 140px;
      animation: coreRotationClockwise 12s linear infinite;
    }
    .spin-counter {
      transform-origin: 140px 140px;
      animation: coreRotationCounter 7s linear infinite;
    }
    .fast-thinking-spin {
      transform-origin: 140px 140px;
      animation: coreRotationClockwise 1.5s linear infinite;
    }
    .robot-head-group {
      transform-origin: 140px 140px;
      animation: roboticBreathing 3.5s ease-in-out infinite;
    }
    .listening-wave-pulsing {
      transform-origin: 140px 140px;
      animation: backgroundRipple 1.8s cubic-bezier(0.16, 1, 0.3, 1) infinite;
    }
  `;

  return (
    <div className="w-full min-h-[580px] flex flex-col items-center justify-center relative select-none" id="voice-assistant-core-container">
      <style>{inlineStyles}</style>

      {/* Futuristic Background Circles */}
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden">
        {/* Extreme glowing atmosphere behind face */}
        <div className={`w-[320px] h-[320px] rounded-full blur-[80px] opacity-40 transition-all duration-700 ${
          faceState === 'listening' ? 'bg-rose-500/50 scale-125' :
          faceState === 'thinking' ? 'bg-teal-400/50 scale-110' :
          faceState === 'speaking' ? 'bg-cyan-500/50 scale-120' : 'bg-cyan-500/20'
        }`}></div>
      </div>

      {/* TOP HEADER STATUS & LANGUAGE Quick toggles */}
      <div className="w-full max-w-lg z-10 flex items-center justify-between pb-4 border-b border-white/5 font-mono text-[10px] uppercase tracking-wider text-slate-400 px-2 mt-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              faceState === 'listening' ? 'bg-rose-400' :
              faceState === 'thinking' ? 'bg-teal-400 animate-spin' : 'bg-cyan-400'
            }`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${
              faceState === 'listening' ? 'bg-rose-500' :
              faceState === 'thinking' ? 'bg-teal-500' : 'bg-cyan-500'
            }`}></span>
          </span>
          <span className="font-bold text-white tracking-[0.2em]">OMNI Assistant V2</span>
        </div>

        {/* Dynamic Sector Pill */}
        <div className="px-2.5 py-0.5 rounded bg-white/5 border border-white/10 text-cyan-400 text-[9px]">
          {activeDomain} Sector
        </div>

        {/* Language Selection Quick Pills */}
        <div className="flex items-center gap-1.5">
          <button 
            type="button"
            onClick={() => { setVocalLanguage('en-US'); stopAllSpeech(); }}
            className={`px-1.5 py-0.5 rounded text-[8px] font-bold transition border ${
              vocalLanguage === 'en-US' ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400' : 'bg-black/40 border-white/5 text-slate-500'
            }`}
          >
            EN
          </button>
          <button 
            type="button"
            onClick={() => { setVocalLanguage('hi-IN'); stopAllSpeech(); }}
            className={`px-1.5 py-0.5 rounded text-[8px] font-bold transition border ${
              vocalLanguage === 'hi-IN' ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400' : 'bg-black/40 border-white/5 text-slate-500'
            }`}
          >
            हिंदी
          </button>
        </div>
      </div>

      {/* WRAPPING CORE INTERACTION MODULE (ROBOT CORE + HU-MAN SCANNER FEED) */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-14 z-10 w-full max-w-4xl px-4 mt-6">
        
        {/* LEFT COMPONENT COLUMN: THE OMNI MECHANICAL HEAD */}
        <div className="flex flex-col items-center">
          {/* CORE ASSISTANT ROBOT FACE / MAIN INTERACTIVE CENTER PIECE */}
          <div 
            onClick={startSpeechRecognition}
            className="relative cursor-pointer group"
            title="Tap face to speak/command"
          >
            {/* Immersive Outer circular ripples during voice recording capture */}
            {faceState === 'listening' && (
              <>
                <div className="listening-wave-pulsing absolute inset-0 rounded-full border-2 border-rose-500/45 w-[280px] h-[280px]"></div>
                <div className="listening-wave-pulsing absolute inset-0 rounded-full border border-rose-400/25 w-[280px] h-[280px]" style={{ animationDelay: '0.6s' }}></div>
              </>
            )}

            {/* Dynamic glow filter around face frame */}
            <div className={`relative transition-all duration-300 rounded-full p-2 ${
              faceState === 'listening' ? 'brightness-125 saturate-150' :
              faceState === 'thinking' ? 'brightness-110' :
              faceState === 'speaking' ? 'drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'hover:drop-shadow-[0_0_10px_rgba(6,182,212,0.15)]'
            }`}>
              {/* Main SVG Render */}
              <svg width="280" height="280" viewBox="0 0 280 280" className="select-none">
                {/* Tech grid circuits pattern */}
                <defs>
                  <pattern id="circ-pattern" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.015)" strokeWidth="1" />
                    <circle cx="30" cy="30" r="1.5" fill="rgba(6,182,212,0.08)" />
                  </pattern>
                </defs>
                <rect width="280" height="280" fill="url(#circ-pattern)" rx="140" />

                {/* Concentric Telemetry circles spinning */}
                <circle
                  cx="140"
                  cy="140"
                  r="120"
                  stroke={faceState === 'listening' ? '#f43f5e' : '#06b6d4'}
                  strokeWidth="0.8"
                  strokeDasharray="12, 18, 4, 10"
                  fill="none"
                  opacity="0.3"
                  className={faceState === 'thinking' ? "fast-thinking-spin" : "spin-clockwise"}
                />
                <circle
                  cx="140"
                  cy="140"
                  r="132"
                  stroke={faceState === 'listening' ? '#fda4af' : '#22d3ee'}
                  strokeWidth="1.2"
                  strokeDasharray="90, 20, 40, 50"
                  fill="none"
                  opacity="0.4"
                  className={faceState === 'thinking' ? "fast-thinking-spin" : "spin-counter"}
                />

                {/* ROBOT HEAD CONTAINER (breathing floating movement) */}
                <g className="robot-head-group">
                  {/* Neck support base */}
                  <path d="M 115 195 L 165 195 L 155 220 L 125 220 Z" fill="#0b1329" stroke="#102a45" strokeWidth="2" />
                  <line x1="125" y1="205" x2="155" y2="205" stroke="#06b6d4" strokeWidth="1.5" opacity="0.6" />
                  
                  {/* Collar details */}
                  <path d="M 100 220 L 180 220 L 195 240 L 85 240 Z" fill="#070d1e" stroke="#00d2ff" strokeWidth="1" opacity="0.6" />

                  {/* Ears/Side Antenna pods */}
                  <circle cx="34" cy="130" r="10" fill="#081125" stroke="#22d3ee" strokeWidth="1.5" />
                  <rect x="22" y="115" width="4" height="30" rx="2" fill="#22d3ee" opacity="0.8" />

                  <circle cx="246" cy="130" r="10" fill="#081125" stroke="#22d3ee" strokeWidth="1.5" />
                  <rect x="254" y="115" width="4" height="30" rx="2" fill="#22d3ee" opacity="0.8" />

                  {/* Main Helmet shell */}
                  <rect x="42" y="55" width="196" height="150" rx="75" fill="#0d1935" stroke={
                    faceState === 'listening' ? '#f43f5e' :
                    faceState === 'thinking' ? '#14b8a6' : '#00d2ff'
                  } strokeWidth="2.5" />

                  {/* Tech Crest line at the forehead */}
                  <path d="M 120 56 L 160 56 L 150 70 L 130 70 Z" fill={
                    faceState === 'listening' ? '#f43f5e' : '#00d2ff'
                  } opacity="0.4" />

                  {/* Glossy Black Visor interface screen */}
                  <rect x="54" y="80" width="172" height="90" rx="45" fill="#020510" stroke={
                    faceState === 'listening' ? '#f43f5e' :
                    faceState === 'thinking' ? '#2dd4bf' : '#22d3ee'
                  } strokeWidth="1.2" />

                  {/* Cyber Lens grid details in Visor corner */}
                  <line x1="68" y1="125" x2="212" y2="125" stroke="#ffffff" strokeWidth="0.5" opacity="0.04" />
                  
                  {/* LED Eyes (Left and Right) */}
                  <g id="led-eyes-nodes">
                    {/* Left eye glowing outer socket */}
                    <ellipse 
                      cx="102" 
                      cy="118" 
                      rx={eyeRx} 
                      ry={eyeRy} 
                      fill={
                        faceState === 'listening' ? '#f43f5e' :
                        faceState === 'thinking' ? '#14b8a6' : '#22d3ee'
                      } 
                      style={{ filter: `drop-shadow(0 0 ${faceState === 'idle' ? '6px' : '9px'} ${faceState === 'listening' ? '#f43f5e' : faceState === 'thinking' ? '#14b8a6' : '#22d3ee'})` }} 
                    />
                    
                    {/* Right eye glowing outer socket */}
                    <ellipse 
                      cx="178" 
                      cy="118" 
                      rx={eyeRx} 
                      ry={eyeRy} 
                      fill={
                        faceState === 'listening' ? '#f43f5e' :
                        faceState === 'thinking' ? '#14b8a6' : '#22d3ee'
                      } 
                      style={{ filter: `drop-shadow(0 0 ${faceState === 'idle' ? '6px' : '9px'} ${faceState === 'listening' ? '#f43f5e' : faceState === 'thinking' ? '#14b8a6' : '#22d3ee'})` }} 
                    />
                  </g>

                  {/* Dynamic Equalizer Vocal Mouth (Centred beneath the eyes) */}
                  <g id="oscillating-robotic-mouth">
                    {mouthAmplitudes.map((amp, index) => {
                      const xPos = 110 + index * 10;
                      // Amp is the height of vertical column line
                      const minH = 2.5;
                      const finalH = Math.max(minH, amp);
                      return (
                        <line
                          key={index}
                          x1={xPos}
                          y1={148 - finalH/2}
                          x2={xPos}
                          y2={148 + finalH/2}
                          stroke={faceState === 'listening' ? '#f43f5e' : '#22d3ee'}
                          strokeWidth="2.8"
                          strokeLinecap="round"
                          style={{ filter: `drop-shadow(0 0 5px ${faceState === 'listening' ? '#f43f5e' : '#22d3ee'})` }}
                          className="transition-all duration-75"
                        />
                      );
                    })}
                  </g>
                </g>
              </svg>
            </div>
          </div>
        </div>

        {/* RIGHT COMPONENT COLUMN: THE OPTICAL SENSOR FEED (HUMAN SCANNER PANEL) */}
        {isCameraActive && (
          <div className="w-[300px] h-[354px] rounded-2xl bg-black/60 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col items-center justify-between p-3.5 relative overflow-hidden backdrop-blur-md animate-fade-in" id="camera-hologram-visual-block">
            {/* Cyber scanner frame decoration overlay corners */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400"></div>

            {/* CRT scan lines simulation overlay */}
            <div className="absolute inset-0 pointer-events-none z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,0,0,0.3)_50%)] bg-[size:100%_4px] opacity-15"></div>

            {/* Header info bar */}
            <div className="w-full flex items-center justify-between z-10 font-mono text-[9px] text-cyan-400 border-b border-white/5 pb-1.5 uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                <span className="font-bold">OPTICAL HUD: HUMAN TARGET</span>
              </div>
              <div className="font-mono text-[8px] bg-cyan-400/10 text-cyan-400 px-1 rounded">
                CH-{cameraFilter.toUpperCase()}
              </div>
            </div>

            {/* Webcam Live Capture Viewport */}
            <div className="w-full flex-1 relative bg-black/40 rounded-lg overflow-hidden border border-white/5 my-2.5 flex items-center justify-center">
              {cameraError ? (
                <div className="text-center p-3 z-10 flex flex-col items-center justify-center h-full">
                  <AlertCircle className="w-7 h-7 text-rose-500 mb-1.5 animate-bounce" />
                  <p className="font-mono text-[8px] text-rose-400 leading-snug">{cameraError}</p>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover rounded-lg scale-x-[-1] transition-all duration-300 ${
                      cameraFilter === 'green' ? 'brightness-110 contrast-125 saturate-125 sepia hue-rotate-[60deg] filter' :
                      cameraFilter === 'blue' ? 'brightness-110 contrast-130 saturate-150 sepia hue-rotate-[180deg] filter' :
                      cameraFilter === 'thermal' ? 'brightness-125 contrast-150 saturate-200 hue-rotate-[290deg] filter' :
                      'brightness-105 contrast-105'
                    }`}
                  />

                  {/* Cyber Crosshair Target reticle Overlay */}
                  <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full border border-dashed border-cyan-400/40 animate-[spin_10s_linear_infinite] flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full border border-cyan-300/10"></div>
                    </div>
                    {/* Bounding target brackets */}
                    <div className="absolute w-36 h-36 border border-cyan-400/20 rounded flex items-center justify-center">
                      <div className="w-1 h-3 bg-cyan-400/80 absolute left-0"></div>
                      <div className="w-1 h-3 bg-cyan-400/80 absolute right-0"></div>
                      <div className="w-3 h-1 bg-cyan-400/80 absolute top-0"></div>
                      <div className="w-3 h-1 bg-cyan-400/80 absolute bottom-0"></div>
                    </div>
                    
                    {/* Subject scanning tag */}
                    <div className="absolute bottom-2 left-2 bg-slate-950/95 border border-cyan-400/30 px-1 py-0.5 rounded font-mono text-[7px] text-cyan-400 tracking-wider">
                      TARGET LOCK: CBHARAT
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Simulated live visual telemetries */}
            <div className="w-full z-10 grid grid-cols-2 gap-1 font-mono text-[7px] text-slate-400">
              <div className="bg-black/30 p-1.5 rounded border border-white/5 flex flex-col justify-center">
                <span className="text-slate-500 text-[6.5px] uppercase leading-none">BIOMETRICS</span>
                <span className="font-extrabold text-[8px] text-cyan-400 mt-0.5">EST SYNC 99.8%</span>
              </div>
              <div className="bg-black/30 p-1.5 rounded border border-white/5 flex flex-col justify-center">
                <span className="text-slate-500 text-[6.5px] uppercase leading-none">STATE</span>
                <span className="font-extrabold text-[8px] text-emerald-400 mt-0.5">ATTENTIVE</span>
              </div>
              <div className="bg-black/30 p-1.5 rounded border border-white/5 flex flex-col justify-center">
                <span className="text-slate-500 text-[6.5px] uppercase leading-none">VOCAL FREQ</span>
                <span className="font-extrabold text-[8px] text-cyan-400 mt-0.5">114 Hz</span>
              </div>
              <div className="bg-black/30 p-1.5 rounded border border-white/5 flex flex-col justify-center">
                <span className="text-slate-500 text-[6.5px] uppercase leading-none">VECTORS</span>
                <span className="font-extrabold text-[8px] text-teal-400 mt-0.5">ALIGNED</span>
              </div>
            </div>

            {/* Filter controls footer */}
            <div className="w-full flex justify-between items-center z-10 mt-2 pt-1.5 border-t border-white/5">
              <span className="font-mono text-[7px] text-slate-500 uppercase tracking-wider">CH Filter</span>
              <div className="flex gap-1">
                {(['raw', 'green', 'blue', 'thermal'] as const).map(f => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setCameraFilter(f)}
                    className={`px-1.5 py-0.5 rounded-[3px] text-[7px] font-mono font-bold uppercase transition scale-90 ${
                      cameraFilter === f 
                        ? 'bg-cyan-500 text-slate-950 font-extrabold border border-cyan-400' 
                        : 'bg-black/40 border border-white/5 text-slate-400 hover:text-white hover:bg-black/80'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CORE VOCAL STATUS LABEL */}
      <div className="mt-2 text-center z-10 font-mono text-[10px] tracking-[0.2em] select-none h-6">
        {faceState === 'listening' && (
          <span className="text-rose-400 font-bold animate-pulse">● OMNI VOCALS: LISTENING USER SPEECH...</span>
        )}
        {faceState === 'thinking' && (
          <span className="text-teal-400 font-bold animate-pulse">⚙️ OMNI CORE: PROCESSING PARADOX DATA...</span>
        )}
        {faceState === 'speaking' && (
          <span className="text-cyan-400 font-bold">🔊 OMNI SPEAKING: SYNTHESIZING TRANSMISSION</span>
        )}
        {faceState === 'idle' && (
          <span className="text-slate-500 hover:text-cyan-400 duration-150 transition">TAP ROBOT FACE TO VOICE COMMAND</span>
        )}
      </div>

      {/* LIVE FLOATING TRANSCRIPT / SUBTITLES SPACE (Large clean minimalist texts) */}
      <div className="w-full max-w-xl px-4 py-3 min-h-[110px] flex flex-col justify-start gap-3 z-10 mt-2 bg-white/2 border border-white/5 rounded-xl backdrop-blur-sm shadow-inner relative overflow-hidden">
        {/* Absolute corner ambient scan line */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-cyan-400/20 z-0"></div>

        {/* User spoken bubble transcript */}
        <div className="flex items-start gap-2.5 z-10">
          <span className="font-mono text-[9px] text-slate-500 tracking-widest mt-0.5 shrink-0 select-none">YOU:</span>
          {youTranscript ? (
            <p className="font-sans text-xs md:text-sm text-slate-300 select-text font-medium leading-relaxed">
              {youTranscript}
            </p>
          ) : (
            <span className="font-mono text-[9px] sm:text-[10px] text-slate-600 italic select-none">
              (No immediate speech captured. Tap face or buttons to converse)
            </span>
          )}
        </div>

        {/* AI response subtitles stream */}
        <div className="flex items-start justify-between gap-2.5 border-t border-white/5 pt-2.5 z-10 min-h-[50px] w-full">
          <div className="flex items-start gap-2.5 flex-1">
            <span className="font-mono text-[9px] text-cyan-500 tracking-widest mt-0.5 shrink-0 select-none">OMNI:</span>
            {omniResponseWords ? (
              <p className="font-sans text-xs md:text-sm text-cyan-300 select-text leading-relaxed font-light">
                {omniResponseWords}
              </p>
            ) : (
              <span className="font-mono text-[9px] sm:text-[10px] text-slate-600 italic select-none">
                (Standby loop aligned. Ready to react)
              </span>
            )}
          </div>
          
          {/* Replay Speaker Button Panel */}
          {omniResponseWords && (
            <button
              type="button"
              onClick={() => speakText(omniResponseWords, 'subtitle-replay')}
              className={`p-1.5 rounded border flex-shrink-0 transition-all duration-300 cursor-pointer flex items-center justify-center gap-1 ${
                isSpeaking && speakingMessageId === 'subtitle-replay'
                  ? 'bg-rose-500/15 border-rose-400 text-rose-400 animate-pulse'
                  : 'bg-cyan-500/10 border-cyan-400/30 text-cyan-400 hover:bg-cyan-500/20 hover:text-white'
              }`}
              title={isSpeaking && speakingMessageId === 'subtitle-replay' ? "Stop vocal synthesis" : "Direct browser to speak or replay this transmission aloud"}
            >
              {isSpeaking && speakingMessageId === 'subtitle-replay' ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 animate-bounce" />
                  <span className="font-mono text-[7px] font-bold">STOP</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span className="font-mono text-[7px] font-bold">SPEAK</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Informational Browser Sound Autoplay Override Help Banner */}
        {omniResponseWords && (
          <div className="text-[8px] font-mono text-slate-500 leading-snug pt-1.5 border-t border-white/5 flex items-center gap-1.5 select-none-all">
            <span className="text-cyan-400 animate-pulse">💡</span>
            <span>If silent: click the <span className="text-white font-bold">SPEAK</span> button above or open in a new tab! Sandboxes require manual user gestures before playing voice streams.</span>
          </div>
        )}
      </div>

      {/* MIC CAPTURE BLOCKED AUTOMATIC HELPER COCKPIT MOD/HUD */}
      {youTranscript.includes("MIC CAPTURE BLOCKED") && (
        <div className="w-full max-w-xl z-20 mt-3 bg-slate-950/90 border border-yellow-500/40 rounded-xl p-4 shadow-[0_0_20px_rgba(234,179,8,0.15)] backdrop-blur-md text-left transition-all duration-300">
          <div className="flex items-center gap-2 text-yellow-500 font-mono text-xs font-bold uppercase tracking-wider mb-2">
            <AlertCircle className="w-4 h-4 text-yellow-500 shrink-0" />
            <span>Interactive Guide: How to Unblock Microphone</span>
          </div>
          <p className="text-slate-400 font-sans text-[11px] leading-relaxed mb-3">
            Mobile operating systems and browser sandboxes require user authorization. Follow these short steps to restore voice interactions:
          </p>

          {/* Navigation Tab Pills */}
          <div className="flex gap-1.5 border-b border-white/10 pb-2 mb-3">
            <button
              type="button"
              onClick={() => setMicTroubleshootTab('newtab')}
              className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase rounded-[4px] transition-all cursor-pointer ${
                micTroubleshootTab === 'newtab'
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                  : 'bg-black/30 border border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              🔑 1. New Tab (Easiest)
            </button>
            <button
              type="button"
              onClick={() => setMicTroubleshootTab('safari')}
              className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase rounded-[4px] transition-all cursor-pointer ${
                micTroubleshootTab === 'safari'
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                  : 'bg-black/30 border border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              📱 Safari (iPhone)
            </button>
            <button
              type="button"
              onClick={() => setMicTroubleshootTab('chrome')}
              className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase rounded-[4px] transition-all cursor-pointer ${
                micTroubleshootTab === 'chrome'
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                  : 'bg-black/30 border border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              🤖 Chrome (Android)
            </button>
          </div>

          {/* Tab Contents */}
          <div className="font-sans text-[11.5px] text-slate-300 leading-relaxed bg-black/40 p-3 rounded-lg border border-white/5">
            {micTroubleshootTab === 'newtab' && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <span className="shrink-0 text-cyan-400 font-bold font-mono text-[10px]">STEP 1:</span>
                  <span>Inside sandboxed frame previews (like the AI Studio chat frame), browsers block mic access for privacy. You must run the app in its own independent tab.</span>
                </div>
                <div className="flex gap-2">
                  <span className="shrink-0 text-cyan-400 font-bold font-mono text-[10px]">STEP 2:</span>
                  <span>Tap the <span className="text-white font-semibold">Share icon ↗</span> or the <span className="text-white font-semibold">"Open in a new tab"</span> button at the very top of your AI Studio interface to load OMNI directly as a primary web application.</span>
                </div>
                <div className="pt-2 flex justify-end">
                  <a
                    href={window.location.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 hover:text-white border border-cyan-400/40 rounded font-mono text-[9px] font-bold transition flex items-center gap-1 cursor-pointer select-none"
                  >
                    <span>LAUNCH DIRECT TAB ↗</span>
                  </a>
                </div>
              </div>
            )}

            {micTroubleshootTab === 'safari' && (
              <div className="space-y-3.5">
                <div className="p-2.5 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-300 font-mono text-[10.5px] leading-relaxed select-text">
                  ⚡ <strong className="text-white">APPLE IFRAME DIRECTIVE:</strong> iOS Safari natively blocks microphone access inside embedded developer frames. To enable your phone's microphone, you must click <strong className="text-white">"Share"</strong> or open the app directly in a native browser tab.
                </div>
                
                <div className="space-y-2 border-t border-white/5 pt-2">
                  <div className="flex gap-2">
                    <span className="shrink-0 text-yellow-400 font-bold font-mono text-[11px] bg-yellow-400/10 px-1.5 rounded h-5 flex items-center justify-center">1</span>
                    <span>Copy the App URL below and open it directly inside your native Safari or Chrome app on your iPhone:</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 bg-slate-900/90 border border-white/10 rounded-lg p-1.5 pl-3">
                    <span className="font-mono text-[9px] text-cyan-400 select-all truncate flex-1 leading-none py-1">
                      {window.location.href.includes("run.app") ? window.location.href : "https://ais-dev-hntgivjlrvemz25e7y5m4j-195254227271.asia-southeast1.run.app"}
                    </span>
                    <button
                      type="button"
                      onClick={copyAppLink}
                      className={`px-3 py-1.5 rounded font-mono text-[9px] font-extrabold transition-all duration-300 cursor-pointer ${
                        copiedLink 
                          ? 'bg-emerald-500 text-slate-950 scale-95' 
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 hover:bg-cyan-500/30'
                      }`}
                    >
                      {copiedLink ? "✓ COPIED" : "COPY URL"}
                    </button>
                  </div>

                  <div className="flex gap-2 mt-2">
                    <span className="shrink-0 text-yellow-400 font-bold font-mono text-[11px] bg-yellow-400/10 px-1.5 rounded h-5 flex items-center justify-center">2</span>
                    <span>If the microphone is still blocked in your native browser tab, tap the <span className="font-semibold text-white">"aA" icon</span> or the <span className="font-semibold text-white">Shield/Lock 🔒</span> directly on your Safari Address Bar.</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="shrink-0 text-yellow-400 font-bold font-mono text-[11px] bg-yellow-400/10 px-1.5 rounded h-5 flex items-center justify-center">3</span>
                    <span>Tap <span className="font-semibold text-white">"Website Settings"</span>, find <strong className="text-cyan-400 font-bold">Microphone</strong>, and switch setting to <span className="text-emerald-400 font-bold">"Allow"</span> instead of "Deny".</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="shrink-0 text-yellow-400 font-bold font-mono text-[11px] bg-yellow-400/10 px-1.5 rounded h-5 flex items-center justify-center">4</span>
                    <span>Reload the tab, tap the OMNI robot head, and allow browser audio streams to translate your voice!</span>
                  </div>
                </div>
              </div>
            )}

            {micTroubleshootTab === 'chrome' && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <span className="shrink-0 text-yellow-400 font-bold font-mono">1.</span>
                  <span>Tap the <span className="font-semibold text-white">Lock icon 🔒</span> or the <span className="font-semibold text-white">three dots menu</span> directly to the left of the URL inside Google Chrome's input deck.</span>
                </div>
                <div className="flex gap-2">
                  <span className="shrink-0 text-yellow-400 font-bold font-mono">2.</span>
                  <span>Select <span className="font-semibold text-white">"Permissions"</span> or <span className="font-semibold text-white">"Site Settings"</span> from the menu list.</span>
                </div>
                <div className="flex gap-2">
                  <span className="shrink-0 text-yellow-400 font-bold font-mono">3.</span>
                  <span>Locate <span className="font-semibold text-cyan-400">Microphone Access</span>, and toggle it to <span className="text-emerald-400 font-bold">Allowed</span>.</span>
                </div>
                <div className="flex gap-2">
                  <span className="shrink-0 text-yellow-400 font-bold font-mono">4.</span>
                  <span>Return, pull-down to refresh or tap <span className="text-cyan-400 font-semibold inline-flex items-center gap-0.5"><RefreshCw className="w-2.5 h-2.5 inline animate-spin" /> reload</span> to synch speech capture!</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-3 flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => {
                setYouTranscript('');
                startSpeechRecognition();
              }}
              className="px-3 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded font-mono text-[9px] font-bold transition flex items-center gap-1 cursor-pointer select-none"
            >
              <RefreshCw className="w-3 h-3" />
              <span>TEST AGAIN / RETRY MIC CONNECTION</span>
            </button>
          </div>
        </div>
      )}

      {/* GEMINI QUOTA MET / API KEY CONFIGURATION TROUBLESHOOTING HUD */}
      {(isSimulatedMode || omniResponseWords.includes("DAILY QUOTA EXCEEDED") || omniResponseWords.includes("CONFIGURATION BOUNDARY")) && (
        <div className="w-full max-w-xl z-20 mt-3 bg-slate-950/95 border border-cyan-500/50 rounded-xl p-5 shadow-[0_0_25px_rgba(6,182,212,0.15)] backdrop-blur-md text-left transition-all duration-300">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider mb-2.5 pb-1 border-b border-white/10">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Interactive Guide: Resolve Gemini Quota Limit</span>
          </div>

          <p className="text-slate-300 font-sans text-xs leading-relaxed mb-4">
            The app's default shared API key has reached its safety budget limit of <strong>20 requests per day</strong>. Since Gemini's API is <strong className="text-cyan-400">100% free</strong> with no custom subscriptions or credit cards required, you can bypass this limitation instantly by inserting your own free key!
          </p>

          <div className="space-y-3 font-sans text-xs text-slate-300 leading-relaxed bg-black/60 p-3.5 rounded-lg border border-white/5">
            <div className="flex gap-2.5">
              <span className="shrink-0 text-cyan-400 font-bold font-mono text-[10.5px] bg-cyan-500/10 h-5 w-5 rounded flex items-center justify-center">1</span>
              <div className="flex-1">
                <span className="text-slate-100 font-semibold">Generate a FREE API Key:</span>
                <p className="text-[11px] text-slate-400 mt-0.5">Log in to Google AI Studio to grab your free personal key. No billing details requested.</p>
                <div className="mt-2.5">
                  <a
                    href="https://aistudio.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/25 text-cyan-400 hover:text-white border border-cyan-400/40 rounded font-mono text-[10px] font-bold transition duration-300 hover:scale-[1.02] cursor-pointer"
                  >
                    <span>🔑 GET KEY FROM GOOGLE AI STUDIO ↗</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="border-t border-white/5 pt-3 flex gap-2.5">
              <span className="shrink-0 text-cyan-400 font-bold font-mono text-[10.5px] bg-cyan-500/10 h-5 w-5 rounded flex items-center justify-center">2</span>
              <div className="flex-1">
                <span className="text-slate-100 font-semibold">Insert Key into Secrets Panel:</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Click the <strong className="text-white">Settings Cog Gear (⚙️)</strong> icon located in the very top-right of your AI Studio workspace.
                </p>
              </div>
            </div>

            <div className="border-t border-white/5 pt-3 flex gap-2.5">
              <span className="shrink-0 text-cyan-400 font-bold font-mono text-[10.5px] bg-cyan-500/10 h-5 w-5 rounded flex items-center justify-center">3</span>
              <div className="flex-1">
                <span className="text-slate-100 font-semibold">Save and Refresh:</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Paste your key into the <code className="bg-slate-800 text-cyan-300 px-1.5 py-0.5 rounded font-mono text-[10px]">GEMINI_API_KEY</code> field, save, and enjoy fully uninterrupted, latency-free OMNI cognitive threads!
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => {
                setOmniResponseWords('');
                setIsSimulatedMode(false);
              }}
              className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded font-mono text-[10px] font-bold transition cursor-pointer select-none"
            >
              DISMISS NOTICE
            </button>
          </div>
        </div>
      )}

      {/* FUTURISTIC MAIN SCREEN KEYBOARD INPUT PORTAL */}
      <form 
        onSubmit={handleManualSendSubmit} 
        className="w-full max-w-xl z-10 mt-3.5 flex items-center gap-2 bg-black/50 p-2.5 rounded-xl border border-white/5 focus-within:border-cyan-500/30 focus-within:shadow-[0_0_15px_rgba(6,182,212,0.1)] transition-all duration-300 backdrop-blur-sm"
      >
        <div className="flex items-center gap-1.5 pl-2 select-none shrink-0">
          <Bot className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <input
          type="text"
          placeholder="Type message or keyboard command to OMNI here..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          disabled={loading}
          className="flex-1 bg-transparent border-none text-xs text-slate-200 placeholder-slate-600 focus:outline-none py-1 px-1.5 font-sans"
        />
        <button
          type="submit"
          disabled={loading || !userInput.trim()}
          className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 font-mono text-[9px] font-extrabold transition-all duration-200 shrink-0 cursor-pointer ${
            !userInput.trim()
              ? 'bg-transparent border-white/5 text-slate-600'
              : 'bg-cyan-500/10 border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/20 hover:text-white'
          }`}
          title="Transmit current payload to OMNI core"
        >
          {loading ? (
            <RefreshCw className="w-3 h-3 animate-spin text-cyan-400" />
          ) : (
            <>
              <span>SEND</span>
              <Send className="w-2.5 h-2.5" />
            </>
          )}
        </button>
      </form>

      {/* MIC INTERACTIONS BUTTONS BAR */}
      <div className="flex items-center gap-4 mt-6 z-10 w-full justify-center max-w-sm px-2">
        
        {/* Auto conversational loop mode (Hands Free / Siri-like) Toggle */}
        <button
          onClick={() => {
            setHandsFree(!handsFree);
            stopAllSpeech();
          }}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg border font-mono text-[9px] text-center font-bold transition-all duration-200 cursor-pointer ${
            handsFree 
              ? 'bg-emerald-500/10 border-emerald-400 text-emerald-400 shadow-lg shadow-emerald-500/5'
              : 'bg-black/40 border-white/5 text-slate-500 hover:text-slate-300'
          }`}
          title="Toggle Hands-Free Loop Mode (Always restarts listening after OMNI stops speaking)"
        >
          <span className={`w-1.5 h-1.5 rounded-full ${handsFree ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`}></span>
          {handsFree ? "SIRI LOOP MODE: ACTIVE" : "SIRI LOOP MODE: STANDBY"}
        </button>

        {/* Central Glowing Mic Orb button */}
        <button
          onClick={startSpeechRecognition}
          className={`p-4 rounded-full border transition-all duration-300 cursor-pointer flex items-center justify-center relative ${
            isListening
              ? 'bg-rose-600 border-rose-400 text-white animate-pulse shadow-rose-600/50 shadow-[0_0_20px_#f43f5e]'
              : 'bg-cyan-500 border-cyan-400 text-slate-950 font-bold hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(6,182,212,0.15)] shadow-cyan-400/25'
          }`}
          title={isListening ? "Mute diagnostics microphone capture" : "Trigger microphone speech-to-text intake"}
        >
          {isListening ? (
            <MicOff className="w-5 h-5 text-white animate-bounce" />
          ) : (
            <Mic className="w-5 h-5 text-slate-950" />
          )}
        </button>

        {/* Toggle Cyber Camera Optical Core */}
        <button
          onClick={isCameraActive ? stopCamera : startCamera}
          className={`p-3.5 rounded-lg border transition-all duration-300 cursor-pointer flex items-center justify-center relative ${
            isCameraActive
              ? 'bg-cyan-500/15 border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
              : 'bg-white/5 border-white/5 text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10'
          }`}
          title={isCameraActive ? "Deactivate Front-Facing Scanner Camera" : "Activate Full Person Optical Scanning Camera"}
        >
          {isCameraActive ? (
            <CameraOff className="w-4 h-4 text-cyan-400" />
          ) : (
            <Camera className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {/* Clear turn button */}
        <button
          onClick={() => {
            stopAllSpeech();
            setMessages([]);
            setYouTranscript('');
            setOmniResponseWords('');
          }}
          className="p-3.5 rounded-lg bg-white/5 border border-white/5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
          title="Reset conversation transcripts buffer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* SYSTEM ACCESS DIAGNOSTIC PANEL SLIDEOUT TAB */}
      <div className="mt-6 z-10 w-full max-w-lg flex justify-center px-4 mb-2">
        <button
          onClick={() => setShowDiagnostics(true)}
          className="flex items-center gap-1.5 py-1.5 px-4 font-mono text-[9px] text-slate-500 hover:text-cyan-400 bg-white/2 border border-white/5 rounded-full hover:bg-white/5 transition-all select-none cursor-pointer"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>ACCESS SYSTEM DIAGNOSTICS & DATA ({messages.length} TRACES LOCKED)</span>
        </button>
      </div>


      {/* HIGH FIDELITY DIAGNOSTICS SLIDEOUT DRAWER PANEL ("every thing .all data") */}
      <div className={`fixed inset-y-0 right-0 w-full sm:w-[480px] bg-slate-950/95 border-l border-white/10 z-50 backdrop-blur-xl shadow-2xl flex flex-col justify-between transition-transform duration-300 transform ${
        showDiagnostics ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Drawer Header details */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-slate-900/60 select-none">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <h3 className="font-mono text-[11px] tracking-[0.2em] font-bold uppercase text-white">OMNI CYBER DIAGNOSTICS</h3>
          </div>
          <button
            onClick={() => setShowDiagnostics(false)}
            className="p-1 px-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Inner components scrolls */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 select-text">
          
          {/* 1. SECTOR CLASSIFICATION DOMAINS SELECTORS */}
          <div className="p-4 rounded-xl bg-white/2 border border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h4 className="font-mono text-[9px] tracking-wider font-extrabold uppercase text-cyan-400 leading-none">ACTIVE SECTOR CHANNELS</h4>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(['general', 'coding', 'writing', 'research', 'business', 'productivity', 'education', 'health'] as AssistantDomain[]).map((dom) => {
                const domMeta = getDomainMeta(dom);
                const isSelected = activeDomain === dom;
                return (
                  <button
                    key={dom}
                    type="button"
                    onClick={() => handleDomainChange(dom)}
                    className={`flex flex-col items-start p-2 rounded border text-left transition ${
                      isSelected
                        ? `bg-cyan-500/10 ${domMeta.border} shadow-sm`
                        : 'bg-black/30 border-white/5 hover:border-white/10'
                    }`}
                  >
                    <domMeta.icon className={`w-3.5 h-3.5 mb-1 ${isSelected ? domMeta.color : 'text-slate-500'}`} />
                    <span className={`block font-mono text-[8px] font-bold tracking-wider capitalize leading-none ${
                      isSelected ? 'text-white' : 'text-slate-400'
                    }`}>
                      {dom}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. ACOUSTIC CONTROL LAB Rate and Pitch */}
          <div className="p-4 rounded-xl bg-white/2 border border-white/5">
            <div className="flex items-center justify-between mb-3 pb-1 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h4 className="font-mono text-[9px] tracking-wider font-extrabold uppercase text-cyan-400 leading-none">OMNI ACOUSTICS LAB</h4>
              </div>
              <span className="font-mono text-[8px] text-slate-500">VOICE: {autoSpeak ? "ON" : "MUTED"}</span>
            </div>

            <div className="space-y-3 font-mono text-[10px]">
              {/* Auto speak button */}
              <div className="flex justify-between items-center bg-black/40 p-1.5 rounded border border-white/5">
                <span className="text-slate-400 text-[9px]">Vocal response output synthesizing:</span>
                <button
                  type="button"
                  onClick={() => { setAutoSpeak(!autoSpeak); stopAllSpeech(); }}
                  className={`px-2 py-0.5 rounded font-mono text-[8px] font-bold transition border ${
                    autoSpeak ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400' : 'bg-black/80 border-white/5 text-slate-500'
                  }`}
                >
                  {autoSpeak ? "ACTIVE" : "MUTED"}
                </button>
              </div>

              {/* Speech rate slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-400 text-[9px]">
                  <span>Vocal Cadence Rate:</span>
                  <span className="text-cyan-400 font-bold">{speechRate}x</span>
                </div>
                <input 
                  type="range" 
                  min="0.5" 
                  max="2.0" 
                  step="0.05"
                  value={speechRate}
                  onChange={(e) => { setSpeechRate(parseFloat(e.target.value)); stopAllSpeech(); }}
                  className="w-full accent-cyan-400 bg-white/5 border border-white/10 rounded-lg h-1"
                />
              </div>

              {/* Speech pitch slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-400 text-[9px]">
                  <span>Resonance Pitch:</span>
                  <span className="text-cyan-400 font-bold">{speechPitch}</span>
                </div>
                <input 
                  type="range" 
                  min="0.5" 
                  max="1.5" 
                  step="0.05"
                  value={speechPitch}
                  onChange={(e) => { setSpeechPitch(parseFloat(e.target.value)); stopAllSpeech(); }}
                  className="w-full accent-cyan-400 bg-white/5 border border-white/10 rounded-lg h-1"
                />
              </div>
            </div>
          </div>

          {/* CONNECTED MOBILE DEVICE TELEMETRY CLIENT GATEWAY */}
          <div className="p-4 rounded-xl bg-white/2 border border-white/5 space-y-4">
            <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400 rotate-12" />
                <h4 className="font-mono text-[9px] tracking-wider font-extrabold uppercase text-emerald-400 leading-none">CONNECTED PHONE GATEWAY</h4>
              </div>
              <span className="font-mono text-[8px] text-green-400 bg-green-500/10 border border-green-500/20 px-1.5 py-0.5 rounded">AUTO-LINKED</span>
            </div>

            <div className="space-y-3.5">
              
              {/* Battery Metrics Grid */}
              <div className="flex items-center justify-between text-xs bg-black/30 p-2 rounded-lg border border-white/5">
                <div className="flex items-center gap-2">
                  <BatteryIcon className={`w-4 h-4 ${battery?.charging ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
                  <span className="font-mono text-[9px] text-slate-400">Battery Level:</span>
                </div>
                <div className="font-mono text-[10px] text-slate-200 font-bold">
                  {battery ? (
                    <span>{battery.level}% {battery.charging ? '(Lightning Charging)' : '(Discharging)'}</span>
                  ) : (
                    <span className="text-slate-500">Querying phone state...</span>
                  )}
                </div>
              </div>

              {/* Location GPS Controller */}
              <div className="bg-black/30 p-2.5 rounded-lg border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-cyan-400" />
                    <span className="font-mono text-[9px] text-slate-400">Location GPS Sensors:</span>
                  </div>
                  <button
                    type="button"
                    onClick={syncLocationTelemetry}
                    disabled={location.loading}
                    className="px-2 py-0.5 rounded bg-cyan-400/10 hover:bg-cyan-400/20 border border-cyan-400/30 text-cyan-400 font-mono text-[8px] font-bold tracking-wider transition cursor-pointer"
                  >
                    {location.loading ? 'PINGING...' : 'CAPTURE LIVE GPS'}
                  </button>
                </div>

                {location.latitude !== null ? (
                  <div className="space-y-1 pt-1 font-mono text-[9px] text-slate-300 font-sans">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-mono text-[8.5px]">Latitude / Longitude:</span>
                      <span className="text-cyan-400 font-bold font-mono text-[9px]">{location.latitude}, {location.longitude}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 font-mono text-[8.5px]">
                      <span>Sensor Accuracy Radius:</span>
                      <span>± {location.accuracy} meters</span>
                    </div>
                    <div className="pt-1.5 border-t border-white/5 text-slate-400 leading-normal text-[8.5px]">
                      📍 Telemetry aligned. You can ask OMNI: <span className="text-white">"Where am I?"</span> or <span className="text-white">"State my location"</span> to read back these coordinates.
                    </div>
                  </div>
                ) : (
                  <div className="font-mono text-[8.5px] text-slate-500 leading-snug">
                    {location.error ? (
                      <span className="text-rose-400">⚠️ {location.error}</span>
                    ) : (
                      <span>Tap "CAPTURE LIVE GPS" to query the cell tower coordinates with high accuracy.</span>
                    )}
                  </div>
                )}
              </div>

              {/* Contacts / Address Book Sync */}
              <div className="bg-black/30 p-2.5 rounded-lg border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-violet-400" />
                    <span className="font-mono text-[9px] text-slate-400">Address Book Integration:</span>
                  </div>
                  <button
                    type="button"
                    onClick={syncPhoneContacts}
                    className="px-2 py-0.5 rounded bg-violet-400/10 hover:bg-violet-400/20 border border-violet-400/30 text-violet-400 font-mono text-[8px] font-bold tracking-wider transition cursor-pointer"
                  >
                    SYNC {contactsList.length > 0 ? 'AGAIN' : 'CONTACTS'}
                  </button>
                </div>

                {contactsList.length > 0 ? (
                  <div className="space-y-1 pt-1 font-mono text-[9px]">
                    <div className="flex justify-between text-slate-500 text-[8.5px]">
                      <span>Synchronized Records:</span>
                      <span className="text-violet-400 font-bold">{contactsList.length} Accounts</span>
                    </div>
                    <div className="max-h-20 overflow-y-auto space-y-1 bg-black/40 p-1.5 rounded pr-1 border border-white/5 text-[8.5px]">
                      {contactsList.map((c, i) => (
                        <div key={i} className="flex justify-between text-slate-300">
                          <span>👤 {c.name}</span>
                          <span className="text-slate-400">{c.telephone}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-1 text-slate-400 text-[8px] leading-snug">
                      🔒 Secured via browser sandbox. Ask OMNI <span className="text-white">"Who is in my contacts?"</span> or <span className="text-white">"Call Dad"</span> to verify integrations.
                    </div>
                  </div>
                ) : (
                  <div className="font-mono text-[8.5px] text-slate-500 leading-snug">
                    Provide connection to your phone contacts list to grant Siri-like capability.
                  </div>
                )}
              </div>

              {/* Hardware Device Environment */}
              <div className="bg-black/30 p-2.5 rounded-lg border border-white/5 space-y-1.5 font-mono text-[9px] text-slate-400">
                <div className="flex items-center gap-1.5 pb-1 border-b border-white/5">
                  <Cpu className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-300 uppercase text-[8.5px] font-bold font-mono">System Hardware Matrix</span>
                </div>
                {hardware ? (
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Platform Target:</span>
                      <span className="text-slate-200">{hardware.platform}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Display Resolution:</span>
                      <span className="text-slate-200">{hardware.screenWidth} x {hardware.screenHeight} px</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Viewport Scale:</span>
                      <span className="text-slate-200">{hardware.innerWidth} px width</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Vocal Mics:</span>
                      <span className="text-emerald-400 text-[8px] truncate max-w-[180px] text-right">
                        {audioInputDevices[0] || 'Default Sensor Mic inline'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <span>Harvesting device platform keys...</span>
                )}
              </div>

            </div>
          </div>

          {/* 3. CORE MEMORY KNOWLEDGE RETENTION (all data) */}
          <div className="p-4 rounded-xl bg-white/2 border border-white/5 flex flex-col min-h-[220px]">
            <div className="flex items-center justify-between mb-2 pb-1 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-amber-500 animate-pulse" />
                <h4 className="font-mono text-[9px] tracking-wider font-extrabold uppercase text-amber-400 leading-none">RETAINED SYSTEM MEMORY</h4>
              </div>
              <button
                type="button"
                onClick={onClearMemory}
                className="text-[9px] font-mono text-slate-500 hover:text-rose-400 hover:underline duration-150 transition"
              >
                WIPE COREFACTS
              </button>
            </div>

            <p className="font-sans text-[10px] text-slate-400 leading-relaxed mb-3 leading-tight select-none">
              These biographical parameters were harvested from contextual conversations or compiled manually:
            </p>

            {/* List preferences logs */}
            <div className="space-y-1.5 flex-1 max-h-40 overflow-y-auto pr-1">
              {memory.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-white/10 rounded-lg">
                  <span className="font-mono text-[8px] text-slate-600">NO PERSISTENT KNOWLEDGE LOCKED</span>
                </div>
              ) : (
                memory.map((pref, i) => (
                  <div key={i} className="flex items-start gap-1.5 p-1.5 rounded bg-black/40 border border-white/5 text-[10px] font-mono leading-normal text-slate-300">
                    <CheckCheck className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{pref}</span>
                  </div>
                ))
              )}
            </div>

            {/* Micro-form insert manual preference */}
            <div className="mt-2.5 pt-2 border-t border-white/5">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const input = form.elements.namedItem('memText') as HTMLInputElement;
                  if (input && input.value.trim()) {
                    onAddMemory(input.value.trim());
                    input.value = '';
                  }
                }}
                className="flex gap-1.5"
              >
                <input
                  name="memText"
                  type="text"
                  placeholder="Insert custom biographical parameter..."
                  className="flex-1 bg-black/60 border border-white/10 rounded px-2 py-1 font-mono text-[9px] text-slate-200 focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 rounded bg-cyan-950/40 border border-cyan-400/30 text-cyan-400 font-mono text-[9px] font-bold hover:bg-cyan-950/80 cursor-pointer"
                >
                  ADD
                </button>
              </form>
            </div>
          </div>

          {/* 4. TOTAL TRACES LOGS (all records of conversions) */}
          <div className="p-4 rounded-xl bg-white/2 border border-white/5">
            <div className="flex items-center justify-between mb-3 pb-1 border-b border-white/5">
              <h4 className="font-mono text-[9px] tracking-wider font-extrabold uppercase text-slate-300 leading-none">CONVERSATION RECORD TRACES</h4>
              <span className="font-mono text-[8px] text-slate-500">{messages.length} log nodes</span>
            </div>

            {/* Compact Chat turns list with copy utility */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {messages.length <= 1 ? (
                <div className="text-center py-6">
                  <span className="font-mono text-[8px] text-slate-600">NO CHAT LOG HISTORIC TRACES</span>
                </div>
              ) : (
                messages.map((m, idx) => {
                  const isUser = m.role === 'user';
                  if (m.id === 'welcome') return null; // hide welcome in records
                  return (
                    <div key={idx} className={`p-2.5 rounded border leading-tight ${
                      isUser 
                        ? 'bg-cyan-950/5 border-cyan-500/10 mr-4' 
                        : 'bg-black/40 border-white/5 ml-4'
                    }`}>
                      <div className="flex justify-between items-center mb-1 select-none">
                        <span className="font-mono text-[8.5px] font-bold text-slate-400">
                          {isUser ? 'Chief (Transmission)' : 'OMNI (Cognition Response)'}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(m.content);
                              setCopiedMessageId(m.id);
                              setTimeout(() => setCopiedMessageId(null), 1500);
                            }}
                            className="font-mono text-[8px] text-slate-500 hover:text-cyan-400 transition"
                          >
                            {copiedMessageId === m.id ? 'COPIED' : 'COPY'}
                          </button>
                        </div>
                      </div>
                      <p className="font-sans text-[11px] text-slate-300 leading-relaxed font-light">{m.content}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Drawer Footer controls (including emergency text entry typing form!) */}
        <div className="p-4 border-t border-white/10 bg-slate-900/40">
          <form onSubmit={handleManualSendSubmit} className="space-y-2">
            <span className="block font-mono text-[8.5px] text-slate-500 uppercase tracking-wide select-none">EMERGENCY MANUAL COMMAND TYPING ENTRY</span>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                placeholder="Type emergency command payload..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="flex-1 bg-black/60 border border-white/10 rounded px-2.5 py-1.5 font-mono text-[10px] text-slate-200 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                disabled={loading || !userInput.trim()}
                className={`p-1.5 rounded border flex-shrink-0 transition-all cursor-pointer ${
                  !userInput.trim()
                    ? 'bg-white/2 border-white/5 text-slate-600'
                    : 'bg-cyan-500 border-cyan-400 text-slate-950 font-bold hover:bg-cyan-400'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5 text-[9px] font-mono text-slate-600 select-none">
            <span>OMNI SECURITY KEY CODES: OK</span>
            <span>SYSTEM STANDBY ACTIVE</span>
          </div>
        </div>
      </div>

    </div>
  );
}
