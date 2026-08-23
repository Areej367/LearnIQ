import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Brain,
  Lightbulb,
  BookOpen,
  ArrowRight,
  Loader2,
  HelpCircle,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { ChatMessage, ConceptNode, Subject, UserProfile } from '../types';
import { fetchAITutorResponse } from '../services/api';

interface AITutorViewProps {
  user: UserProfile;
  concepts: ConceptNode[];
  subjects: Subject[];
  initialConcept?: ConceptNode | null;
}

export const AITutorView: React.FC<AITutorViewProps> = ({
  user,
  concepts,
  subjects,
  initialConcept,
}) => {
  const [selectedConceptId, setSelectedConceptId] = useState<string>(
    initialConcept?.id || 'c-db-3nf'
  );
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-init-1',
      sender: 'ai',
      text: `Hello ${user.name.split(' ')[0]}! I am your **Socratic Learning AI Tutor**.\n\nI have access to your **LearnIQ SkillGraph** and notice you've been working through **Database Systems** and **Algorithms**.\n\nRather than just giving you the answers, I'll guide you step-by-step to build strong, intuitive mental models. What concept or problem shall we explore together?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      socraticPrompt:
        'Tip: You can ask about 3NF dependencies, recursion call stacks, or binary search invariants.',
      suggestedFollowUps: [
        'Why does 3NF require eliminating transitive dependencies?',
        'Walk me through the call stack of recursion',
        'How does binary search prune the search space?',
      ],
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const activeConcept = concepts.find((c) => c.id === selectedConceptId);
  const activeSubject = subjects.find((s) => s.id === activeConcept?.subjectId);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const tutorResponse = await fetchAITutorResponse({
        message: query,
        history: [...messages, userMsg],
        conceptContext: {
          title: activeConcept?.title,
          masteryScore: activeConcept?.masteryScore,
          prerequisites: activeConcept?.prerequisites,
        },
        studentProfile: {
          name: user.name,
          weakConcepts: concepts.filter((c) => c.status === 'weak').map((c) => c.title),
        },
      });

      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'ai',
        text: tutorResponse.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        socraticPrompt: tutorResponse.socraticPrompt,
        suggestedFollowUps: tutorResponse.suggestedFollowUps,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Tutor chat failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="ai-tutor-view" className="space-y-6 pb-12">
      {/* Top Header & Active Concept Focus Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-sky-600/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
              <span>Socratic AI Learning Mentor</span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                Cognitive Guidance
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Guiding inquiries, mental model refinement, and prerequisite repair through dialectic pedagogy
            </p>
          </div>
        </div>

        {/* Concept Context Switcher */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-slate-400">Context:</span>
          <select
            value={selectedConceptId}
            onChange={(e) => setSelectedConceptId(e.target.value)}
            className="bg-slate-100 hover:bg-slate-200/80 font-bold text-slate-800 py-1.5 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
          >
            {concepts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} ({c.masteryScore}% Mastery)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Chat Workspace */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col min-h-[620px]">
        {/* Messages Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-slate-50/40">
          {messages.map((msg) => {
            const isAi = msg.sender === 'ai';

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3.5 ${
                  isAi ? 'max-w-3xl' : 'max-w-2xl ml-auto flex-row-reverse'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    isAi
                      ? 'bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-xs'
                      : 'bg-slate-800 text-white'
                  }`}
                >
                  {isAi ? <Bot className="w-4 h-4" /> : user.name.charAt(0)}
                </div>

                {/* Bubble */}
                <div className="space-y-2">
                  <div
                    className={`p-4 rounded-2xl text-xs lg:text-sm leading-relaxed ${
                      isAi
                        ? 'bg-white text-slate-800 border border-slate-200/80 shadow-xs'
                        : 'bg-indigo-600 text-white shadow-sm'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-normal">{msg.text}</div>

                    {/* Socratic Prompt Callout */}
                    {msg.socraticPrompt && (
                      <div className="mt-3 p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span className="font-medium">{msg.socraticPrompt}</span>
                      </div>
                    )}
                  </div>

                  {/* Suggested Follow-Ups */}
                  {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {msg.suggestedFollowUps.map((chip, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(chip)}
                          className="px-3 py-1.5 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 rounded-xl text-xs font-semibold transition-all shadow-2xs text-left"
                        >
                          💬 {chip}
                        </button>
                      ))}
                    </div>
                  )}

                  <span
                    className={`text-[10px] font-medium block ${
                      isAi ? 'text-slate-400' : 'text-right text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
              <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                <span>Formulating Socratic guidance...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Ask the Socratic Tutor anything about ${activeConcept?.title || 'this topic'}...`}
              className="flex-1 px-4 py-3 bg-slate-100 rounded-2xl border border-slate-200 text-xs lg:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl transition-all disabled:opacity-50 shadow-md shadow-indigo-600/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
