"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAppStore, type ChatMessage } from "@/store/app";
import {
  Bot,
  Send,
  Sparkles,
  Shield,
  Search,
  CalendarDays,
  DollarSign,
  MessageSquare,
  ChevronDown,
  Loader2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import { v4 as uuidv4 } from "uuid";

// ============ TYPES ============

interface AIAgent {
  id: string;
  name: string;
  emoji: string;
  description: string;
  gradient: string;
  icon: React.ElementType;
  tagLine: string;
}

// ============ AGENT DEFINITIONS ============

const AI_AGENTS: AIAgent[] = [
  {
    id: "hr_assistant",
    name: "HR Assistant",
    emoji: "\uD83D\uDCBC",
    description: "General questions, policy help, onboarding guidance",
    gradient: "from-emerald-500 to-teal-600",
    icon: Bot,
    tagLine: "Ask HR",
  },
  {
    id: "payroll_detective",
    name: "Payroll Detective",
    emoji: "\uD83D\uDD75\uFE0F",
    description: "Payroll queries, anomaly reports, pay stub info",
    gradient: "from-amber-500 to-orange-600",
    icon: DollarSign,
    tagLine: "Pay & Deductions",
  },
  {
    id: "pto_fairy",
    name: "PTO Fairy",
    emoji: "\uD83E\uDDDA",
    description: "PTO balance, time-off requests, leave calendar",
    gradient: "from-violet-500 to-purple-600",
    icon: CalendarDays,
    tagLine: "Time Off Magic",
  },
  {
    id: "compliance_agent",
    name: "Compliance Agent",
    emoji: "\uD83C\uDF0D",
    description: "Labor law, compliance alerts, regulatory updates",
    gradient: "from-rose-500 to-pink-600",
    icon: Shield,
    tagLine: "Border Buddy",
  },
];

const QUICK_SUGGESTIONS = [
  { label: "Check my PTO balance", icon: CalendarDays, agent: "pto_fairy" },
  { label: "Show my recent attendance", icon: Search, agent: "hr_assistant" },
  { label: "What's my pay rate?", icon: DollarSign, agent: "payroll_detective" },
  { label: "Any compliance alerts?", icon: Shield, agent: "compliance_agent" },
  { label: "Help me request time off", icon: Sparkles, agent: "pto_fairy" },
];

// ============ HELPER: Format timestamp ============

function formatTimestamp(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (isToday) return `Today, ${time}`;

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();
  if (isYesterday) return `Yesterday, ${time}`;

  return `${date.toLocaleDateString([], { month: "short", day: "numeric" })}, ${time}`;
}

// ============ TYPING INDICATOR ============

function TypingIndicator({ agent }: { agent: AIAgent }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-start gap-3 px-4 py-2"
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback
          className={`bg-gradient-to-br ${agent.gradient} text-white text-sm font-bold`}
        >
          {agent.emoji}
        </AvatarFallback>
      </Avatar>
      <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0ms]" />
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:150ms]" />
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </motion.div>
  );
}

// ============ MESSAGE BUBBLE ============

function MessageBubble({
  message,
  agent,
  userName,
  userInitials,
}: {
  message: ChatMessage;
  agent: AIAgent;
  userName: string;
  userInitials: string;
}) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={`flex items-start gap-3 px-4 py-1.5 ${isUser ? "flex-row-reverse" : ""}`}
    >
      {/* Avatar */}
      <Avatar className="h-8 w-8 shrink-0 mt-0.5">
        {isUser ? (
          <AvatarFallback className="bg-gradient-to-br from-slate-600 to-slate-800 text-white text-xs font-semibold">
            {userInitials}
          </AvatarFallback>
        ) : (
          <AvatarFallback
            className={`bg-gradient-to-br ${agent.gradient} text-white text-sm font-bold`}
          >
            {agent.emoji}
          </AvatarFallback>
        )}
      </Avatar>

      {/* Bubble */}
      <div className={`max-w-[75%] sm:max-w-[65%] space-y-1 ${isUser ? "items-end" : "items-start"}`}>
        {/* Name + time */}
        <div className={`flex items-center gap-2 ${isUser ? "justify-end" : ""}`}>
          <span className="text-xs font-medium text-muted-foreground">
            {isUser ? userName : agent.name}
          </span>
          <span className="text-[10px] text-muted-foreground/70">
            {formatTimestamp(message.createdAt)}
          </span>
        </div>

        {/* Content */}
        <div
          className={`rounded-2xl px-4 py-2.5 shadow-sm leading-relaxed text-sm ${
            isUser
              ? "bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-tr-sm"
              : "bg-muted text-foreground rounded-tl-sm"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none prose-p:my-1 prose-li:my-0.5 prose-strong:text-emerald-700 dark:prose-strong:text-emerald-400 prose-ul:my-1 prose-ol:my-1 prose-headings:text-emerald-700 dark:prose-headings:text-emerald-400 [&_li]:marker:text-emerald-500">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ============ AGENT SELECTOR (MOBILE DROPDOWN) ============

function AgentSelectorMobile({
  activeAgent,
  onSelect,
}: {
  activeAgent: AIAgent;
  onSelect: (agent: AIAgent) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden mb-4">
      <Button
        variant="outline"
        className="w-full justify-between border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
        onClick={() => setOpen(!open)}
      >
        <span className="flex items-center gap-2">
          <span>{activeAgent.emoji}</span>
          <span className="font-medium">{activeAgent.name}</span>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {activeAgent.tagLine}
          </Badge>
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </Button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
              {AI_AGENTS.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => {
                    onSelect(agent);
                    setOpen(false);
                  }}
                  className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all duration-200 ${
                    activeAgent.id === agent.id
                      ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 shadow-sm"
                      : "border-border hover:border-emerald-200 dark:hover:border-emerald-800 hover:bg-accent/50"
                  }`}
                >
                  <span className="text-lg">{agent.emoji}</span>
                  <div className="text-left">
                    <p className="font-medium text-xs whitespace-nowrap">{agent.name}</p>
                    <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {agent.tagLine}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============ AGENT SELECTOR (DESKTOP SIDEBAR) ============

function AgentSelectorSidebar({
  activeAgent,
  onSelect,
}: {
  activeAgent: AIAgent;
  onSelect: (agent: AIAgent) => void;
}) {
  return (
    <div className="hidden lg:flex flex-col w-72 shrink-0">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-5 w-5 text-emerald-500" />
          <h3 className="text-base font-semibold">AI Agents</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Choose an agent to start a conversation
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {AI_AGENTS.map((agent) => {
          const isActive = activeAgent.id === agent.id;
          const AgentIcon = agent.icon;

          return (
            <Card
              key={agent.id}
              className={`cursor-pointer transition-all duration-300 overflow-hidden group ${
                isActive
                  ? "border-emerald-300 dark:border-emerald-700 shadow-md shadow-emerald-500/10"
                  : "hover:border-emerald-200 dark:hover:border-emerald-800 hover:shadow-sm"
              }`}
              onClick={() => onSelect(agent)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Agent Avatar */}
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    className={`h-11 w-11 rounded-xl bg-gradient-to-br ${agent.gradient} flex items-center justify-center shrink-0 shadow-lg ${
                      isActive ? "ring-2 ring-offset-2 ring-emerald-400 dark:ring-emerald-600 ring-offset-background" : ""
                    }`}
                  >
                    <span className="text-xl">{agent.emoji}</span>
                  </motion.div>

                  {/* Agent Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="font-semibold text-sm">{agent.name}</h4>
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 rounded-full bg-emerald-500"
                        />
                      )}
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0 mb-1.5"
                    >
                      {agent.tagLine}
                    </Badge>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {agent.description}
                    </p>
                  </div>
                </div>

                {/* Start Chat Button */}
                <Button
                  size="sm"
                  variant={isActive ? "default" : "outline"}
                  className={`w-full mt-3 text-xs h-8 transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-sm"
                      : "group-hover:border-emerald-300 group-hover:text-emerald-700 dark:group-hover:border-emerald-700 dark:group-hover:text-emerald-400"
                  }`}
                >
                  <AgentIcon className="h-3.5 w-3.5 mr-1.5" />
                  {isActive ? "Active Chat" : "Start Chat"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ============ MAIN COMPONENT ============

export function AIChatView() {
  const { currentUserId, employees, chatMessages, setChatMessages, addChatMessage } =
    useAppStore();

  const [activeAgent, setActiveAgent] = useState<AIAgent>(AI_AGENTS[0]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [showSuggestions, setShowSuggestions] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const currentUser = employees.find((e) => e.id === currentUserId);
  const userName = currentUser
    ? `${currentUser.firstName} ${currentUser.lastName}`
    : "You";
  const userInitials = currentUser
    ? `${currentUser.firstName[0]}${currentUser.lastName[0]}`
    : "U";

  // Filter messages for current session
  const sessionMessages = chatMessages.filter(
    (m) => m.sessionId === sessionId
  );

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [sessionMessages, isTyping, scrollToBottom]);

  // Focus input when agent changes
  useEffect(() => {
    inputRef.current?.focus();
  }, [activeAgent]);

  // Determine agent for a message
  const getAgentForMessage = (message: ChatMessage): AIAgent => {
    if (message.role === "user") return activeAgent;
    const found = AI_AGENTS.find((a) => a.id === message.agentType);
    return found || AI_AGENTS[0];
  };

  // Send message handler
  const handleSend = useCallback(
    async (text?: string) => {
      const messageText = (text || inputValue).trim();
      if (!messageText || isTyping) return;

      const userId = currentUserId || currentUser?.id;
      if (!userId) return;

      // Generate session ID on first message
      const sid = sessionId || uuidv4();
      if (!sessionId) setSessionId(sid);

      // Add user message locally
      const userMsg: ChatMessage = {
        id: uuidv4(),
        sessionId: sid,
        userId,
        role: "user",
        content: messageText,
        agentType: activeAgent.id,
        createdAt: new Date().toISOString(),
      };
      addChatMessage(userMsg);
      setInputValue("");
      setShowSuggestions(false);
      setIsTyping(true);

      try {
        const res = await fetch("/api/ai-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            message: messageText,
            agentType: activeAgent.id,
            sessionId: sid,
          }),
        });

        if (!res.ok) throw new Error("Failed to send message");

        const data = await res.json();

        if (data.userMessage) {
          // Replace local user message with server version
          setChatMessages([
            ...chatMessages.filter((m) => m.id !== userMsg.id),
            data.userMessage,
          ]);
        }

        if (data.assistantMessage) {
          addChatMessage(data.assistantMessage);
        }
      } catch (error) {
        console.error("Chat error:", error);
        // Add error message
        addChatMessage({
          id: uuidv4(),
          sessionId: sid,
          userId,
          role: "assistant",
          content:
            "I'm sorry, I encountered an error processing your request. Please try again.",
          agentType: activeAgent.id,
          createdAt: new Date().toISOString(),
        });
      } finally {
        setIsTyping(false);
        inputRef.current?.focus();
      }
    },
    [
      inputValue,
      isTyping,
      sessionId,
      currentUserId,
      currentUser,
      activeAgent,
      chatMessages,
      addChatMessage,
      setChatMessages,
    ]
  );

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: (typeof QUICK_SUGGESTIONS)[number]) => {
    const agent = AI_AGENTS.find((a) => a.id === suggestion.agent);
    if (agent) setActiveAgent(agent);
    setInputValue(suggestion.label);
    setTimeout(() => {
      handleSend(suggestion.label);
    }, 100);
  };

  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-11rem)] gap-4">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <MessageSquare className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight">AI Chat</h2>
          <p className="text-sm text-muted-foreground">
            Chat with specialized AI agents for instant HR support
          </p>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Desktop Agent Sidebar */}
        <AgentSelectorSidebar activeAgent={activeAgent} onSelect={setActiveAgent} />

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-h-0 rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          {/* Mobile Agent Selector */}
          <AgentSelectorMobile activeAgent={activeAgent} onSelect={setActiveAgent} />

          {/* Chat Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20">
            <motion.div
              key={activeAgent.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className={`h-9 w-9 rounded-lg bg-gradient-to-br ${activeAgent.gradient} flex items-center justify-center shadow-md`}
            >
              <span className="text-base">{activeAgent.emoji}</span>
            </motion.div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm truncate">{activeAgent.name}</h3>
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                >
                  <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {activeAgent.description}
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="text-xs text-muted-foreground hover:text-emerald-600"
              onClick={() => {
                setSessionId("");
                setShowSuggestions(true);
                setChatMessages([]);
              }}
            >
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              New Chat
            </Button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full" ref={scrollAreaRef}>
              <div className="py-4 flex flex-col min-h-full">
                {/* Empty state */}
                {sessionMessages.length === 0 && !isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex-1 flex flex-col items-center justify-center px-4 py-12 text-center"
                  >
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                      className={`h-20 w-20 rounded-2xl bg-gradient-to-br ${activeAgent.gradient} flex items-center justify-center shadow-xl mb-6`}
                    >
                      <span className="text-4xl">{activeAgent.emoji}</span>
                    </motion.div>
                    <h3 className="text-lg font-semibold mb-1">{activeAgent.name}</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mb-6">
                      {activeAgent.description}. Ask me anything to get started!
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {QUICK_SUGGESTIONS.filter(
                        (s) => s.agent === activeAgent.id
                      ).map((s) => {
                        const Icon = s.icon;
                        return (
                          <Button
                            key={s.label}
                            variant="outline"
                            size="sm"
                            className="text-xs border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-700 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-700"
                            onClick={() => handleSuggestionClick(s)}
                          >
                            <Icon className="h-3 w-3 mr-1.5" />
                            {s.label}
                          </Button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Message list */}
                <AnimatePresence initial={false}>
                  {sessionMessages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      agent={getAgentForMessage(message)}
                      userName={userName}
                      userInitials={userInitials}
                    />
                  ))}
                </AnimatePresence>

                {/* Typing indicator */}
                <AnimatePresence>
                  {isTyping && <TypingIndicator agent={activeAgent} />}
                </AnimatePresence>

                {/* Scroll anchor */}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </div>

          {/* Quick Suggestions */}
          <AnimatePresence>
            {showSuggestions && sessionMessages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="px-4 pt-2"
              >
                <Separator className="mb-3" />
                <div className="flex flex-wrap gap-2 pb-1">
                  {QUICK_SUGGESTIONS.map((suggestion) => {
                    const Icon = suggestion.icon;
                    return (
                      <motion.button
                        key={suggestion.label}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-background hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors text-xs text-muted-foreground hover:text-emerald-700 dark:hover:text-emerald-400"
                      >
                        <Icon className="h-3 w-3" />
                        {suggestion.label}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat Input */}
          <div className="border-t border-border p-3 bg-background">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message ${activeAgent.name}...`}
                  disabled={isTyping}
                  className="pr-4 rounded-xl border-emerald-200 dark:border-emerald-800 focus-visible:ring-emerald-400 dark:focus-visible:ring-emerald-600 h-11 bg-muted/30 focus-ring-emerald"
                />
              </div>
              <Button
                type="submit"
                size="icon"
                disabled={!inputValue.trim() || isTyping}
                className="btn-gradient h-11 w-11 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-500/20 disabled:opacity-40 disabled:shadow-none shrink-0"
              >
                {isTyping ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
            <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
              Powered by MSBM-HR AI Engine &middot; Your data stays secure and private
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
