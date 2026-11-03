"use client";

import { useState } from "react";
import { ArrowUpIcon, MessageCircleIcon } from "lucide-react";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Message, MessageContent } from "@/components/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ChatMessage = { id: number; text: string };

// UI only for now: sent messages are kept in local state, nothing is sent anywhere.
export function WelcomeChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");

  function send() {
    const text = draft.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { id: prev.length + 1, text }]);
    setDraft("");
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    send();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <TooltipProvider>
      <div className="flex h-full flex-col">
        <MessageScrollerProvider>
          <MessageScroller className="flex-1">
            <MessageScrollerViewport>
              <MessageScrollerContent className="mx-auto w-full max-w-2xl px-4 py-6">
                {messages.length === 0 ? (
                  <Empty className="my-auto border-0">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <MessageCircleIcon />
                      </EmptyMedia>
                      <EmptyTitle>Your conversation starts here</EmptyTitle>
                      <EmptyDescription>
                        Say hello to begin. I&apos;ll ask a few quick questions
                        to set up your AI employee.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                ) : (
                  messages.map((m, i) => (
                    <MessageScrollerItem
                      key={m.id}
                      scrollAnchor={i === messages.length - 1}
                    >
                      <Message align="end">
                        <MessageContent>
                          <Bubble align="end">
                            <BubbleContent>{m.text}</BubbleContent>
                          </Bubble>
                        </MessageContent>
                      </Message>
                    </MessageScrollerItem>
                  ))
                )}
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton />
          </MessageScroller>
        </MessageScrollerProvider>

        <form onSubmit={onSubmit} className="mx-auto w-full max-w-2xl px-4 pb-4">
          <InputGroup className="rounded-2xl bg-white">
            <InputGroupTextarea
              rows={1}
              placeholder="Type your message..."
              aria-label="Message"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              className="max-h-40 min-h-12"
            />
            <InputGroupAddon align="block-end">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <InputGroupButton
                      type="submit"
                      variant="default"
                      size="icon-sm"
                      aria-label="Send message"
                      disabled={!draft.trim()}
                      className="ml-auto rounded-full"
                    />
                  }
                >
                  <ArrowUpIcon />
                </TooltipTrigger>
                <TooltipContent>Send message</TooltipContent>
              </Tooltip>
            </InputGroupAddon>
          </InputGroup>
        </form>
      </div>
    </TooltipProvider>
  );
}
