"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { GlobeIcon, MessageCircleIcon, RotateCcwIcon } from "lucide-react";
import { Mascot } from "page-mascot";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Message, MessageContent } from "@/components/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { submitOnboarding } from "@/lib/onboarding-api";
import { LANGUAGES, MESSAGES } from "../i18n/messages";
import { type Answers, buildTranscript, STEPS } from "../script";
import {
  BusinessInput,
  CityInput,
  LanguageInput,
  NameInput,
  PhoneInput,
  PurposeInput,
} from "./StepInputs";
import { StreamingText } from "./StreamingText";
import { useSmoothFollow } from "./useSmoothFollow";

const TYPING_MS = 1100; // short pause so the agent's reply feels natural
const STORAGE_KEY = "gnani:onboarding";

type Status = "idle" | "saving" | "error" | "saved";

export function WelcomeChat() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [typing, setTyping] = useState(false);
  // Id of the agent message currently being "streamed" word by word.
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [restored, setRestored] = useState(false);
  const submitting = useRef(false);
  const scrollArea = useRef<HTMLDivElement>(null);
  useSmoothFollow(scrollArea);

  // Restore progress after a page refresh.
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as {
          stepIndex: number;
          answers: Answers;
        };
        setStepIndex(parsed.stepIndex);
        setAnswers(parsed.answers);
      }
    } catch {
      // Storage can be unavailable; the conversation just starts over.
    }
    setRestored(true);
  }, []);

  useEffect(() => {
    if (!restored) return;
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ stepIndex, answers }),
      );
    } catch {}
  }, [restored, stepIndex, answers]);

  const step = STEPS[stepIndex];
  const t = MESSAGES[answers.lang ?? "en"];
  const lines = buildTranscript(stepIndex, answers);

  // Records the user's answer, shows it, then lets the agent "reply".
  function answer(patch: Partial<Answers>) {
    setAnswers((prev) => ({ ...prev, ...patch }));
    setTyping(true);
    const next = stepIndex + 1;
    setTimeout(() => {
      setStepIndex(next);
      setStreamingId(`a-${STEPS[next]}`);
      setTyping(false);
    }, TYPING_MS);
  }

  async function save() {
    const { lang, business, city, purpose, phone, agentName } = answers;
    if (!lang || !business || !city || !purpose || !phone || !agentName) return;
    if (submitting.current) return;
    submitting.current = true;
    setStatus("saving");
    try {
      await submitOnboarding({
        preferredLanguage: lang,
        shopName: business.name,
        category: business.category,
        city,
        purpose,
        phone,
        aiEmployeeName: agentName,
      });
      setStatus("saved");
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {}
      setTimeout(() => router.replace("/dashboard"), 1500);
    } catch {
      setStatus("error");
      submitting.current = false;
    }
  }

  // Final step: send everything to the server in one go.
  useEffect(() => {
    if (restored && step === "done" && status === "idle") void save();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restored, step, status]);

  // Clears everything and restarts the conversation from the language step.
  function retake() {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {}
    submitting.current = false;
    setAnswers({});
    setStepIndex(0);
    setStreamingId(null);
    setTyping(false);
    setStatus("idle");
  }

  function retry() {
    setStatus("idle");
  }

  const showInput = restored && !typing && !streamingId && step !== "done";
  const langLabel = LANGUAGES.find((l) => l.code === answers.lang)?.label;

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between px-5 pt-4">
        <Mascot
          directions="/crt-directions.webp"
          reactions="/crt-reactions.webp"
          size={48}
          label="Onboarding agent"
        />
        {answers.lang && (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-input bg-white px-3 py-1.5 text-sm">
              <GlobeIcon className="size-3.5 text-muted-foreground" />
              {langLabel}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-full bg-white"
              onClick={retake}
              disabled={status === "saving" || status === "saved"}
            >
              <RotateCcwIcon />
              {t.retake}
            </Button>
            {answers.lang !== "en" && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-full bg-white"
                onClick={() => setAnswers((p) => ({ ...p, lang: "en" }))}
              >
                ENG
              </Button>
            )}
          </div>
        )}
      </header>
      <div ref={scrollArea} className="flex min-h-0 flex-1 flex-col">
        <MessageScrollerProvider autoScroll={false}>
          <MessageScroller className="flex-1">
            <MessageScrollerViewport>
              <MessageScrollerContent className="mx-auto w-full max-w-2xl px-4 py-6">
                {lines.length === 0 ? (
                  <Empty className="my-auto border-0">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <MessageCircleIcon />
                      </EmptyMedia>
                      <EmptyTitle>Say hello to begin</EmptyTitle>
                      <EmptyDescription>
                        I&apos;ll ask a few quick questions to set up your AI
                        employee. Pick your preferred language to start.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                ) : (
                  lines.map((line, i) => (
                    <MessageScrollerItem
                      key={line.id}
                      scrollAnchor={i === lines.length - 1 && !typing}
                    >
                      <Message align={line.role === "user" ? "end" : "start"}>
                        <MessageContent>
                          <Bubble
                            align={line.role === "user" ? "end" : "start"}
                            variant={line.role === "user" ? "default" : "muted"}
                          >
                            <BubbleContent>
                              {line.id === streamingId ? (
                                <StreamingText
                                  text={line.text}
                                  onDone={() => setStreamingId(null)}
                                />
                              ) : (
                                line.text
                              )}
                            </BubbleContent>
                          </Bubble>
                        </MessageContent>
                      </Message>
                    </MessageScrollerItem>
                  ))
                )}

                {(typing || (status === "saving" && !streamingId)) && (
                  <MessageScrollerItem scrollAnchor>
                    <Message>
                      <MessageContent>
                        <Bubble variant="muted">
                          <BubbleContent aria-label="typing">
                            <span className="flex items-center gap-1 py-1">
                              {[0, 1, 2].map((d) => (
                                <span
                                  key={d}
                                  className="size-1.5 animate-bounce rounded-full bg-foreground/40"
                                  style={{ animationDelay: `${d * 120}ms` }}
                                />
                              ))}
                            </span>
                          </BubbleContent>
                        </Bubble>
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                )}

                {status === "error" && (
                  <MessageScrollerItem scrollAnchor>
                    <Message>
                      <MessageContent>
                        <Bubble variant="destructive">
                          <BubbleContent>{t.saveFailed}</BubbleContent>
                        </Bubble>
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                )}
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton />
          </MessageScroller>
        </MessageScrollerProvider>
      </div>

      <div className="mx-auto w-full max-w-2xl px-4 pb-4">
        {showInput && step === "language" && (
          <LanguageInput t={t} onSend={(lang) => answer({ lang })} />
        )}
        {showInput && step === "business" && (
          <BusinessInput t={t} onSend={(business) => answer({ business })} />
        )}
        {showInput && step === "city" && (
          <CityInput t={t} onSend={(city) => answer({ city })} />
        )}
        {showInput && step === "purpose" && (
          <PurposeInput t={t} onSend={(purpose) => answer({ purpose })} />
        )}
        {showInput && step === "phone" && (
          <PhoneInput t={t} onSend={(phone) => answer({ phone })} />
        )}
        {showInput && step === "name" && (
          <NameInput t={t} onSend={(agentName) => answer({ agentName })} />
        )}
        {status === "error" && (
          <div className="flex gap-3">
            <Button onClick={retry} className="flex-1">
              {t.retry}
            </Button>
            <Button onClick={retake} variant="outline" className="flex-1">
              {t.retake}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
