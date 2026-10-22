import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, GeneratedImage, LLMModelId } from '../../types';
import { chatWithCopilot, generateStudioImage } from '../../services/api';
import { saveChatMessage, getChatMessages, clearChatMessages } from '../../services/db';
import { MessageSquare, Send, Sparkles, Image as ImageIcon, Film, Trash2, ArrowRight, Bot, User, Check, Cpu } from 'lucide-react';

interface FlowCopilotProps {
  onUsePromptInVideo: (prompt: string) => void;
  onAddImageToStudio: (img: GeneratedImage) => void;
}

const INTELLIGENCE_MODELS: { id: LLMModelId; name: string; provider: string; badge: string; desc: string }[] = [
  { id: 'gemini-4-argon', name: 'Gemini 4 Argon', provider: 'Google DeepMind', badge: 'Ultra Reasoning', desc: 'Elite physics, STEM reasoning, and cinematography' },
  { id: 'chatgpt-gpt-6-astra', name: 'ChatGPT GPT-6 Astra', provider: 'OpenAI', badge: 'Creative Engine', desc: 'Worldbuilding, storytelling, and rapid multimodal ideation' },
  { id: 'claude-fable-5.1', name: 'Claude Fable 5.1', provider: 'Anthropic', badge: 'Screenplay Master', desc: 'Nuanced dialogue, poetic pacing, and emotional depth' },
  { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', provider: 'Google AI', badge: 'Instant Speed', desc: 'High-speed real-time responses and translations' }
];

const STARTER_SUGGESTIONS = [
  '⚡ Create an epic 60s anime sword fight choreography for Seedance 2.5',
  '🇵🇭 Sumulat ng makapigil-hiningang Tagalog battle dialogue at video scene prompt',
  '🏔️ Cinematic 4K drone shot of emerald fjord mountains at sunset with Veo 2',
  '🎨 Generate an image of a cybernetic samurai with glowing katana in heavy rain'
];

export const FlowCopilot: React.FC<FlowCopilotProps> = ({
  onUsePromptInVideo,
  onAddImageToStudio
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<LLMModelId>('gemini-4-argon');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getChatMessages().then((loaded) => {
      if (loaded.length > 0) {
        setMessages(loaded);
      } else {
        // Welcome message
        const welcomeMsg: ChatMessage = {
          id: 'msg-welcome',
          role: 'assistant',
          content: `👋 **Welcome to FlowMotion Copilot!**\n\nI am powered by **Gemini 4 Argon**, **ChatGPT GPT-6 Astra**, and **Claude Fable 5.1** intelligence. I can:\n• **Answer any questions** on cinematic video pacing, physics, and worldbuilding.\n• Formulate ultra-fluid **anime fighting prompts** for **Seedance 2.5 & Kling 2.0**.\n• Script realistic **cinematic landscapes** for **Google Veo 2 & MiniMax**.\n• Craft localized **Tagalog (Filipino)** dialogue, dubbing lines, and auto-captions.\n• Directly **generate 4K images** on the fly in chat!\n\nSwitch models above anytime or try a suggestion below.`,
          timestamp: Date.now(),
          modelUsed: 'gemini-4-argon',
          suggestedPrompts: STARTER_SUGGESTIONS
        };
        setMessages([welcomeMsg]);
        saveChatMessage(welcomeMsg);
      }
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    setInputText('');

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: text,
      timestamp: Date.now()
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    saveChatMessage(userMessage);
    setIsLoading(true);

    try {
      // Check if user specifically asks to generate an image
      const lower = text.toLowerCase();
      let generatedImgUrl: string | undefined = undefined;

      if (lower.startsWith('generate image') || lower.startsWith('draw') || lower.startsWith('create image') || lower.includes('generate an image')) {
        const cleanPrompt = text.replace(/^(generate image of|generate image|create image of|create image|draw an image of|draw a|draw)/i, '').trim();
        const style = lower.includes('anime') ? 'anime' : lower.includes('landscape') ? 'cinematic_landscape' : 'photorealism';
        const img = await generateStudioImage(cleanPrompt || text, style, '16:9');
        generatedImgUrl = img.imageUrl;
        onAddImageToStudio(img);
      }

      // Call Chatbot API with selected LLM intelligence model
      const { reply, modelUsed } = await chatWithCopilot(text, newHistory, 'English', selectedModel);

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: reply,
        timestamp: Date.now(),
        modelUsed: (modelUsed as LLMModelId) || selectedModel,
        generatedImageUrl: generatedImgUrl
      };

      const finalHistory = [...newHistory, assistantMessage];
      setMessages(finalHistory);
      saveChatMessage(assistantMessage);
    } catch (err: any) {
      console.error('Copilot response error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    await clearChatMessages();
    setMessages([]);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-h-[850px] rounded-2xl bg-slate-900/60 border border-white/5 overflow-hidden shadow-2xl">
      {/* Copilot Header with LLM Intelligence Selector */}
      <div className="px-5 py-3.5 border-b border-white/5 bg-slate-950/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-100">Flow Copilot</h3>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Frontier Intelligence
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Gemini 4 Argon · ChatGPT GPT-6 Astra · Claude Fable 5.1
            </p>
          </div>
        </div>

        {/* Model Selector & Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-white/10">
            <Cpu className="w-3.5 h-3.5 text-emerald-400 ml-1.5" />
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as LLMModelId)}
              className="bg-transparent text-xs text-slate-200 font-semibold focus:outline-none cursor-pointer pr-2 py-0.5"
            >
              {INTELLIGENCE_MODELS.map((m) => (
                <option key={m.id} value={m.id} className="bg-slate-900 text-slate-100">
                  {m.name} ({m.badge})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleClearHistory}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-900/30 text-slate-400 hover:text-rose-300 border border-white/5 cursor-pointer transition-all"
            title="Clear Conversation"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-emerald-600/30 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-tr-none shadow-md shadow-indigo-500/20'
                  : 'bg-slate-950/70 border border-white/10 text-slate-200 rounded-tl-none shadow-sm'
              }`}
            >
              {/* Model Tag if Assistant */}
              {msg.role === 'assistant' && msg.modelUsed && (
                <div className="mb-2 pb-1.5 border-b border-white/5 flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>{msg.modelUsed.toUpperCase()}</span>
                </div>
              )}

              {/* Message Content with Markdown formatting */}
              <div className="whitespace-pre-wrap space-y-2">{msg.content}</div>

              {/* Generated Image in Chat if any */}
              {msg.generatedImageUrl && (
                <div className="mt-3 rounded-xl overflow-hidden border border-white/10 bg-slate-900">
                  <img
                    src={msg.generatedImageUrl}
                    alt="Generated in chat"
                    className="w-full h-auto object-cover max-h-72"
                  />
                  <div className="p-2 bg-slate-950 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-emerald-400 font-mono">
                      ✨ Direct AI Image Generation
                    </span>
                    <button
                      onClick={() => onUsePromptInVideo(msg.content)}
                      className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <Film className="w-3 h-3" />
                      <span>Animate in Video Flow</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Assistant Message Actions */}
              {msg.role === 'assistant' && (
                <div className="mt-3 pt-2.5 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(msg.content, msg.id)}
                      className="hover:text-slate-200 cursor-pointer flex items-center gap-1"
                    >
                      {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : null}
                      <span>{copiedId === msg.id ? 'Copied!' : 'Copy'}</span>
                    </button>

                    <button
                      onClick={() => onUsePromptInVideo(msg.content)}
                      className="text-indigo-400 hover:text-indigo-300 cursor-pointer flex items-center gap-1 font-semibold"
                    >
                      <Film className="w-3 h-3" />
                      <span>Use in Video Flow</span>
                    </button>
                  </div>

                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-600/30 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/10 rounded-tl-none flex items-center gap-2 text-xs text-slate-400">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{selectedModel} is synthesizing cinematic response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Chips */}
      <div className="px-4 py-2 border-t border-white/5 bg-slate-950/30 flex items-center gap-2 overflow-x-auto text-[11px] text-slate-400">
        <span className="text-slate-500 shrink-0 font-medium">Quick Ideas:</span>
        {STARTER_SUGGESTIONS.map((sug, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(sug)}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 whitespace-nowrap cursor-pointer transition-all border border-white/5"
          >
            {sug}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-3.5 sm:p-4 border-t border-white/5 bg-slate-950/80 flex items-center gap-3">
        <textarea
          rows={1}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="Ask anything or prompt: e.g. 'Generate image of a neon cyber samurai' or 'Mag-suggest ng 60s anime fight scene in Tagalog'..."
          className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-slate-900 border border-white/10 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-all resize-none shadow-inner"
        />

        <button
          type="button"
          disabled={!inputText.trim() || isLoading}
          onClick={() => handleSendMessage()}
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20 cursor-pointer transition-all disabled:opacity-40 shrink-0"
        >
          <Send className="w-4 h-4 ml-0.5" />
        </button>
      </div>
    </div>
  );
};
