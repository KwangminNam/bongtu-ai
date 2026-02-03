"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Send, Bot, User, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { BackButton } from "@/components/back-button";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/lib/stores/chat";

const SUGGESTIONS = [
  "내 경조사 기록 요약해줘",
  "가장 많이 주고받은 지인은?",
  "결혼식 적정 축의금 알려줘",
  "이번 달 경조사 지출은?",
];

export function ChatUI() {
  const { messages, addMessage, updateLastAssistantMessage, clearMessages } =
    useChatStore();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const userMessage = {
        id: Date.now().toString(),
        role: "user" as const,
        content,
      };

      addMessage(userMessage);
      setInput("");
      setIsLoading(true);

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant" as const,
        content: "",
      };

      addMessage(assistantMessage);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        if (!response.ok) throw new Error("API Error");

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (reader) {
          let fullContent = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            fullContent += chunk;

            updateLastAssistantMessage(fullContent);
          }
        }
      } catch {
        updateLastAssistantMessage(
          "죄송합니다. 오류가 발생했습니다. 다시 시도해주세요."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, addMessage, updateLastAssistantMessage]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-5 pt-14 pb-4 border-b">
        <BackButton />
        <div className="flex-1">
          <h1 className="text-xl font-bold">AI 어시스턴트</h1>
          <p className="text-xs text-muted-foreground">
            경조사 기록을 분석하고 제안해드려요
          </p>
        </div>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearMessages}
            className="text-muted-foreground"
          >
            <Trash2 size={18} />
          </Button>
        )}
      </div>

      {/* 메시지 영역 */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 py-4 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Bot size={32} className="text-primary" />
            </div>
            <h2 className="font-semibold mb-2">무엇을 도와드릴까요?</h2>
            <p className="text-sm text-muted-foreground mb-6">
              경조사 기록을 분석하고 적정 금액을 제안해드려요
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-sm">
              {SUGGESTIONS.map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot size={16} className="text-primary" />
                </div>
              )}
              <Card
                className={cn(
                  "px-4 py-3 max-w-[80%]",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                <p className="text-sm whitespace-pre-wrap">
                  {message.content || (
                    <Loader2 size={16} className="animate-spin text-muted-foreground" />
                  )}
                </p>
              </Card>
              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <User size={16} className="text-primary-foreground" />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 입력 영역 */}
      <div className="border-t px-5 py-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send size={18} />
          </Button>
        </form>
      </div>
    </div>
  );
}
