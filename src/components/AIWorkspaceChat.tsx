import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Send, Brain, Code, FileText, Search, Briefcase, 
  Calendar, Heart, Copy, Check, HelpCircle, RefreshCw, Trash2, 
  BookOpen, Plus, Bot, User, CheckCheck, Lightbulb
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
  
  // Custom manual memory pref state
  const [customPrefText, setCustomPrefText] = useState('');
  const [showAddPref, setShowAddPref] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Initial welcome message based on domain
  useEffect(() => {
    if (messages.length === 0) {
      const getGreeting = () => {
        switch (activeDomain) {
          case 'coding':
            return "Greetings! I've loaded your software engineering sandbox. Ask me to draft complex algorithms, explain design systems, debug compiler loops, or optimize application files.";
          case 'writing':
            return "Welcome! I've fully tuned my semantic models for editorial design & high-level writing. What are we brainstorming, drafting, or detailing today?";
          case 'research':
            return "Intelligence models online. Place analytical constraints, submit hypotheses for structured peer reviews, or command target query data categorization.";
          case 'business':
            return "Professional advisory core loaded. Let's design business pitches, model strategic roadmaps, optimize customer outreach copy, or review career milestones.";
          case 'productivity':
            return "Temporal optimization buffer active. I stand ready to scaffold tasks, devise structured scheduling routines, or detail project milestones.";
          case 'education':
            return "Academy learning channel synced. Ask me to compose step-by-step guides, parse complex topics into humble analogies, or frame dynamic vocabulary flashcards.";
          case 'health':
            return "Health & Fitness informational channel active. Let's schedule optimized wellness blueprints, analyze biological nutrition profiles, or review cardiovascular outlines safely.";
          default:
            return "Hello! I am your personal AI assistant. Our context-aware channel is online. What can we think, learn, compile, or design together today?";
        }
      };

      setMessages([
        {
          id: 'welcome',
          role: 'model',
          content: getGreeting(),
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [activeDomain]);

  // Handle Domain Shift
  const handleDomainChange = (domain: AssistantDomain) => {
    setActiveDomain(domain);
    // Restart chat clear context
    setMessages([]);
  };

  // Domain configuration details
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

  // Pre-loaded domain template prompts to jumpstart high fidelity outputs
  const getTemplates = (dom: AssistantDomain) => {
    switch (dom) {
      case 'coding':
        return [
          { label: '⚛️ React Async Hook', text: 'Write a custom React hook in TypeScript that handles asynchronous API requests with states for loading, error, dynamic retry count, and cached responses.' },
          { label: '🎛️ CSS Grid Layout', text: 'Generate a layout using clean Tailwind classes representing a responsive dashboard bento grid with asymmetric cards.' },
          { label: '⏱️ Debounce Fn', text: 'Create a highly performant TypeScript debounce function with generic type-safety and cancellation methods.' }
        ];
      case 'writing':
        return [
          { label: '📧 Cold Pitch Letter', text: 'Write an elegant, high-converting cold email pitch proposing digital design optimizations to an online boutique shop. Keep it crisp.' },
          { label: '✍️ Social Post Starter', text: 'Compose three engaging LinkedIn hook variations describing the psychological friction of over-engineering software.' },
          { label: '📖 Story Analogy', text: 'Explain the technical concept of "latency vs. throughput" using a vivid cinematic analogy set in a bustling coffee shop.' }
        ];
      case 'research':
        return [
          { label: '📊 Peer Review Synthesis', text: 'Draft a critical peer-review guideline focusing on identifying methodology biases in artificial neural network studies.' },
          { label: '🔎 Search Synthesis', text: 'Outline a clean 4-stage systematic research workflow to evaluate the efficiency of solar energy storage materials.' },
          { label: '🗂️ Theme Classifier', text: 'Categorize these topics into hierarchical data trees: [Distributed systems, SQL sharding, CSS nesting, Node.js streams, CSS variables].' }
        ];
      case 'business':
        return [
          { label: '📈 SaaS Pricing Model', text: 'Compare the user-acquisition and retention mechanics of a freemium vs. tier-based commercial pricing model for a developers product.' },
          { label: '📝 Resume Elevator Pitch', text: 'Optimize my personal elevator statement: "I am a frontend dev looking to work on innovative UI/UX stacks with server integrations."' },
          { label: '🎯 Target Audience', text: 'Detail the ideal developer persona for a SaaS platform centered on zero-config database provisioning.' }
        ];
      case 'productivity':
        return [
          { label: '📅 Block Scheduling Routine', text: 'Deconstruct a congested 10-hour work schedule into four focused deep-work segments and thermal stasis recovery buffer gaps.' },
          { label: '⚙️ Sprint Backlog Form', text: 'Suggest a clean markdown template for structured task ticket breakdowns (User story, technical limits, verification criteria).' },
          { label: '💡 Eisenhower Matrix', text: 'Outline an intuitive workflow for prioritizing critical but non-urgent tasks to prevent burn-out states.' }
        ];
      case 'education':
        return [
          { label: '🏫 Core Concept Analogy', text: 'Explain the core scientific differences between Classical Mechanics and Quantum Physics using simple household analogies.' },
          { label: '📝 Flashcard Generator', text: 'Generate a set of 5 Q&A flashcards to learn essential concepts of asynchronous event loops in JavaScript.' },
          { label: '🎓 Study Syllabus Plan', text: 'Draft a structured, 3-week study roadmap to master basic relational database design principles.' }
        ];
      case 'health':
        return [
          { label: '🥗 Nutrition Breakdown', text: 'Detail the macronutrient and metabolic benefits of a whole-foods plant-balanced nutrition strategy for high focus levels.' },
          { label: '🧘 Desk Mobility Flow', text: 'Draft a simple 10-minute progressive body mobility routine that resolves lower-back and neck stiffness caused by computer sessions.' },
          { label: '💧 Circadian Fluid Hydration', text: 'Outline an optimal fluid intake schedule across a standard 16-hour waking day to prevent physical lethargy.' }
        ];
      default:
        return [
          { label: '🧠 Deconstruct Concept', text: 'Explain the technical details behind quantum computing in simple language with clear visual metaphors.' },
          { label: '✍️ Refine & Edit Text', text: 'Review and polish this line to sound professional and polished: "tell me what you need so i can build this app right now"' },
          { label: '💡 Creative Outlines', text: 'Brainstorm 5 unique startup ideas that utilize local state storage and secure proxy endpoints.' }
        ];
    }
  };

  // Convert raw message text into neat copyable HTML with code highlights, bullet lists, bold text and markdown table support
  const renderMessageContent = (text: string) => {
    // Basic formatting helper that maps markdown rules to HTML tags
    const lines = text.split('\n');
    let insideCodeBlock = false;
    let codeContent = '';
    let language = '';

    const elements: React.ReactNode[] = [];
    let currentParagraph: React.ReactNode[] = [];
    let listItems: React.ReactNode[] = [];
    let keyIdx = 0;

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        elements.push(<p key={`p-${keyIdx++}`} className="mb-3 leading-relaxed text-slate-300 font-sans text-xs md:text-sm">{currentParagraph}</p>);
        currentParagraph = [];
      }
    };

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(<ul key={`ul-${keyIdx++}`} className="list-disc pl-5 mb-4 space-y-1 text-slate-300 text-xs md:text-sm font-sans">{listItems}</ul>);
        listItems = [];
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code blocks selector
      if (line.startsWith('```')) {
        if (insideCodeBlock) {
          // End of code block, construct highlight card
          const finalCode = codeContent;
          const currentLang = language || 'code';
          insideCodeBlock = false;
          codeContent = '';
          language = '';
          flushParagraph();
          flushList();

          elements.push(
            <div key={`code-ctr-${keyIdx++}`} className="my-4 rounded-lg bg-black/80 font-mono text-[11px] md:text-xs text-cyan-300 border border-white/10 overflow-hidden relative shadow-lg group">
              <div className="flex items-center justify-between px-3.5 py-1.5 bg-white/5 border-b border-white/5 select-none text-[10px] uppercase text-slate-400">
                <span>{currentLang}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(finalCode);
                    // trigger notification logic
                  }}
                  className="flex items-center gap-1 hover:text-white transition duration-150"
                  title="Copy code block"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>
              </div>
              <pre className="p-4 overflow-x-auto leading-relaxed select-text"><code>{finalCode}</code></pre>
            </div>
          );
        } else {
          // Start of code block
          insideCodeBlock = true;
          language = line.slice(3).trim();
          flushParagraph();
          flushList();
        }
        continue;
      }

      if (insideCodeBlock) {
        codeContent += line + '\n';
        continue;
      }

      // Headers processing
      if (line.startsWith('#')) {
        flushParagraph();
        flushList();
        const level = line.match(/^#+/)?.[0].length || 1;
        const textOnly = line.replace(/^#+\s*/, '');
        const sizeClass = level === 1 ? 'text-lg font-bold' : level === 2 ? 'text-md font-bold mt-4 mb-2' : 'text-sm font-bold mt-2';
        elements.push(
          <div key={`h-${keyIdx++}`} className={`text-white tracking-wide font-mono uppercase border-b border-white/5 pb-1 mb-2 ${sizeClass}`}>
            {textOnly}
          </div>
        );
        continue;
      }

      // List item processing
      if (line.startsWith('- ') || line.startsWith('* ') || line.match(/^\d+\.\s/)) {
        flushParagraph();
        const listText = line.replace(/^[-*\d]+\.\s*|^[-*]\s*/, '');
        listItems.push(<li key={`li-${keyIdx++}`} className="leading-relaxed">{parseInlineMarkdown(listText)}</li>);
        continue;
      } else {
        flushList();
      }

      // Handle blank lines
      if (line.trim() === '') {
        flushParagraph();
        continue;
      }

      // Standard text line parsing
      currentParagraph.push(parseInlineMarkdown(line));
      currentParagraph.push(<br key={`br-${keyIdx++}`} />);
    }

    // Capture remaining items
    flushParagraph();
    flushList();

    return elements;
  };

  // Parses inner bold text, code tags and links
  const parseInlineMarkdown = (text: string) => {
    const parts: React.ReactNode[] = [];
    let keyIdx = 0;
    
    // Simple inline matching
    let formattedText = text;
    // Highlight backticks `code`
    const regexBackticks = /`([^`]+)`/g;
    // Highlight bold **text**
    const regexBold = /\*\*([^*]+)\*\*/g;

    let partsList: { type: 'text' | 'code' | 'bold', text: string }[] = [];
    
    // We can do a basic tokenization mapping for bold and code
    let currentIdx = 0;
    while (currentIdx < text.length) {
      if (text.startsWith('**', currentIdx)) {
        const nextIdx = text.indexOf('**', currentIdx + 2);
        if (nextIdx !== -1) {
          partsList.push({ type: 'bold', text: text.slice(currentIdx + 2, nextIdx) });
          currentIdx = nextIdx + 2;
          continue;
        }
      }
      if (text.startsWith('`', currentIdx)) {
        const nextIdx = text.indexOf('`', currentIdx + 1);
        if (nextIdx !== -1) {
          partsList.push({ type: 'code', text: text.slice(currentIdx + 1, nextIdx) });
          currentIdx = nextIdx + 1;
          continue;
        }
      }
      
      const char = text[currentIdx];
      const last = partsList[partsList.length - 1];
      if (last && last.type === 'text') {
        last.text += char;
      } else {
        partsList.push({ type: 'text', text: char });
      }
      currentIdx++;
    }

    return partsList.map((pi, index) => {
      if (pi.type === 'bold') {
        return <strong key={index} className="text-white font-bold">{pi.text}</strong>;
      }
      if (pi.type === 'code') {
        return <code key={index} className="px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-cyan-400 font-mono text-[11px]">{pi.text}</code>;
      }
      return <span key={index}>{pi.text}</span>;
    });
  };

  // Submit chat prompt
  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || userInput;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    // Update messages log immediately
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setUserInput('');
    setLoading(true);

    try {
      // Send chat request to modern node server
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          memory,
          domain: activeDomain
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Computational glitch occurred.");
      }

      // Add Model reply to database state
      const modelMsg: ChatMessage = {
        id: `msg-${Date.now()}-model`,
        role: 'model',
        content: data.replyText,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, modelMsg]);

      // Check for dynamically harvested preferences/memories
      if (data.extractedMemories && Array.isArray(data.extractedMemories)) {
        data.extractedMemories.forEach((pref: string) => {
          if (pref.trim()) {
            onAddMemory(pref);
          }
        });
      }

    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now()}-error`,
        role: 'model',
        content: `⚠️ **COMMUNICATION ABORTED:** ${err.message || 'The cognitive socket timed out block.'}`,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Trigger input submit
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Message Copy
  const handleCopyMessage = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(msgId);
    setTimeout(() => setCopiedMessageId(null), 2500);
  };

  // Add custom manual context memory
  const handleAddManualPrefText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrefText.trim()) return;
    onAddMemory(customPrefText.trim());
    setCustomPrefText('');
    setShowAddPref(false);
  };

  const domainMeta = getDomainMeta(activeDomain);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-full min-h-[640px]">
      
      {/* 1. Left Chat Panel (cols-8) */}
      <div className="xl:col-span-8 flex flex-col bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-md relative h-full">
        
        {/* Chat Header details */}
        <div className={`flex items-center justify-between px-5 py-3 border-b border-white/10 ${domainMeta.bg}`}>
          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded bg-white/5 border ${domainMeta.border}`}>
              <domainMeta.icon className={`w-4 h-4 ${domainMeta.color}`} />
            </div>
            <div>
              <span className="block font-mono text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">
                {domainMeta.label}
              </span>
              <span className="block font-sans text-xs text-slate-500 mt-1">
                Contextual reasoning stream operational
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block font-mono text-[9px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full select-none">
              ● PERSONAL AI ONLINE
            </span>
            <button
              onClick={() => setMessages([])}
              className="p-1 px-2 rounded font-mono text-[9px] text-slate-400 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 transition"
              title="Reset current conversation turn"
            >
              CLEAR LOGS
            </button>
          </div>
        </div>

        {/* Messaging sandbox */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 max-h-[460px] min-h-[380px]">
          {messages.map((m) => {
            const isModel = m.role === 'model';
            return (
              <div 
                key={m.id} 
                className={`flex gap-3 max-w-[85%] ${isModel ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
              >
                {/* Visual Avatar nodes */}
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border leading-none ${
                  isModel 
                    ? 'bg-cyan-950/20 text-cyan-400 border-cyan-500/30' 
                    : 'bg-white/5 text-slate-300 border-white/10'
                }`}>
                  {isModel ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Message body bubbles */}
                <div className={`rounded-xl p-4 relative border shadow-sm group ${
                  isModel 
                    ? 'bg-white/2 border-white/5 rounded-tl-none text-slate-300' 
                    : 'bg-cyan-950/10 border-cyan-500/20 rounded-tr-none text-slate-200'
                }`}>
                  {/* Dynamic Copy option */}
                  <button
                    onClick={() => handleCopyMessage(m.id, m.content)}
                    className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 hover:text-cyan-400 transition text-slate-500 duration-150 rounded"
                    title="Copy full content"
                  >
                    {copiedMessageId === m.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <div className="select-text pr-4 leading-relaxed font-sans mt-0.5">
                    {renderMessageContent(m.content)}
                  </div>

                  <span className="block mt-2 font-mono text-[8px] text-slate-500 text-right leading-none">
                    {m.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 mr-auto max-w-[80%]">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-cyan-950/20 text-cyan-400 border border-cyan-500/30">
                <bot-icon className="relative">
                  <span className="animate-ping absolute inline-flex h-1.5 w-1.5 rounded-full bg-cyan-400 opacity-75"></span>
                  <Bot className="w-4 h-4" />
                </bot-icon>
              </div>
              <div className="bg-white/2 border border-white/5 rounded-xl rounded-tl-none p-4 text-slate-400 font-mono text-[10px] space-y-1.5">
                <p className="animate-pulse">AI is thinking... Synap latency resolved...</p>
                <div className="w-24 h-1 px-1 bg-white/10 rounded overflow-hidden">
                  <div className="h-full bg-cyan-400 animate-loading-bar rounded"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input interface containing preset prompts and typing entry */}
        <div className="mt-auto border-t border-white/10 bg-black/20 p-4 space-y-3.5">
          {/* Quick presets templates row */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 pl-0.5 select-none">
              <Lightbulb className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-mono text-[9px] font-bold tracking-wider uppercase">Fidelity Presets (Domain Amplifiers):</span>
            </div>
            <div className="flex flex-wrap gap-2 max-h-16 overflow-y-auto pr-1">
              {getTemplates(activeDomain).map((t, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(t.text)}
                  className="px-2.5 py-1 text-[9px] font-mono rounded bg-white/5 border border-white/5 hover:border-cyan-500/30 hover:bg-cyan-500/5 text-slate-300 hover:text-cyan-400 transition"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <textarea
              id="assistant-chat-input"
              rows={1}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Prompt your Personalized assistant (Domain: ${activeDomain})...`}
              className="flex-1 text-xs md:text-sm font-sans bg-black/40 border border-white/10 rounded-lg p-2.5 pr-10 text-slate-200 focus:outline-none focus:border-cyan-400 transition-all resize-none max-h-32"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={loading || !userInput.trim()}
              className={`p-2.5 rounded-lg border flex-shrink-0 transition-all duration-200 cursor-pointer ${
                !userInput.trim() || loading
                  ? 'bg-white/5 border-white/5 text-slate-600'
                  : 'bg-cyan-500 border-cyan-400 text-slate-950 font-bold hover:bg-cyan-400 active:scale-95 shadow-lg shadow-cyan-400/5'
              }`}
              title="Secure transmission"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* 2. Right Context Memory & Controls Panel (cols-4) */}
      <div className="xl:col-span-4 space-y-5 flex flex-col h-full justify-between">
        
        {/* Capability Selectors */}
        <div className="p-5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="font-mono text-[10px] tracking-[0.2em] font-bold uppercase text-cyan-400">
              CAPABILITY SECTORS
            </h3>
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
                  className={`flex flex-col items-start p-2 rounded-lg border text-left transition ${
                    isSelected
                      ? `bg-cyan-500/10 ${domMeta.border} shadow-[0_0_12px_rgba(34,211,238,0.1)]`
                      : 'bg-white/2 border-white/5 hover:border-white/20'
                  }`}
                >
                  <domMeta.icon className={`w-4 h-4 mb-1.5 ${isSelected ? domMeta.color : 'text-slate-500'}`} />
                  <span className={`block font-mono text-[9px] font-bold tracking-wider capitalize leading-none ${
                    isSelected ? 'text-white' : 'text-slate-400'
                  }`}>
                    {dom}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Workspace Dynamic Contextual Memory Database Panel */}
        <div className="p-5 rounded-xl bg-white/5 border border-white/10 flex-grow backdrop-blur-md flex flex-col justify-between overflow-hidden min-h-[300px]">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-amber-500 animate-pulse" />
                <h3 className="font-mono text-[10px] tracking-[0.2em] font-bold uppercase text-amber-500">
                  CRITICAL USER MEMORY
                </h3>
              </div>
              <button
                type="button"
                onClick={onClearMemory}
                className="text-slate-500 hover:text-rose-400 text-[10px] font-mono duration-150"
                title="Wipe memory vault"
              >
                UNLINK CORE
              </button>
            </div>

            <p className="text-[10px] text-slate-400 leading-normal font-sans mb-3">
              This vault securely retains goals, user developer details, or instructions dynamically learned from chat context. Manually add parameters below.
            </p>

            {/* List of active preferences */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {memory.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-white/10 rounded-lg select-none">
                  <Bot className="w-8 h-8 mx-auto text-slate-700 mb-1" />
                  <p className="font-mono text-[9px] tracking-wider text-slate-600">NO USER FACTS COMPILED</p>
                </div>
              ) : (
                memory.map((pref, i) => (
                  <div 
                    key={i} 
                    className="flex items-start gap-2 p-2 rounded bg-black/30 border border-white/5 text-[11px] font-mono leading-normal text-slate-300"
                  >
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{pref}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add custom preference context entry */}
          <div className="mt-4 pt-3 border-t border-white/5">
            {!showAddPref ? (
              <button
                type="button"
                onClick={() => setShowAddPref(true)}
                className="w-full py-1.5 text-center font-mono text-[9px] text-cyan-400 hover:text-cyan-300 border border-white/5 hover:border-cyan-500/20 rounded bg-white/2 transition"
              >
                + COMPILE CUSTOM PREFERENCE FACT
              </button>
            ) : (
              <form onSubmit={handleAddManualPrefText} className="space-y-2 animate-fade-in">
                <input
                  id="add-memory-input"
                  type="text"
                  required
                  placeholder="e.g., I am learning Rust or I prefer dark themes"
                  value={customPrefText}
                  onChange={(e) => setCustomPrefText(e.target.value)}
                  className="w-full text-[10px] font-mono bg-black/40 border border-white/10 rounded-md p-1.5 focus:outline-none focus:border-cyan-400 text-slate-200"
                />
                <div className="flex gap-2 text-[8px] font-mono">
                  <button
                    type="submit"
                    className="flex-1 py-1 bg-cyan-950/40 border border-cyan-400/40 text-cyan-400 font-semibold hover:bg-cyan-950/80 rounded"
                  >
                    INJECT préférence
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomPrefText('');
                      setShowAddPref(false);
                    }}
                    className="px-2 py-1 bg-white/5 border border-white/10 text-slate-400 hover:text-white rounded"
                  >
                    CANCEL
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* System telemetry diagnostic stats */}
        <div className="p-4 rounded-xl bg-white/2 border border-white/5">
          <span className="block font-mono text-[8px] text-slate-500 uppercase">OMNISCIENT STATUS:</span>
          <div className="flex justify-between font-mono text-[10px] mt-1">
            <span className="text-slate-400">Cognition level:</span>
            <span className="text-cyan-400">99.98% OK</span>
          </div>
          <div className="flex justify-between font-mono text-[10px] mt-0.5">
            <span className="text-slate-400">Memory entries locked:</span>
            <span className="text-amber-500">{memory.length} items</span>
          </div>
          <div className="flex justify-between font-mono text-[10px] mt-0.5">
            <span className="text-slate-400">System architecture:</span>
            <span className="text-slate-300">@google/genai CJS</span>
          </div>
        </div>

      </div>

    </div>
  );
}
