import {
  type CategoryCode,
  fill,
  LANGUAGES,
  type LangCode,
  MESSAGES,
} from "./i18n/messages";

// The onboarding conversation is a fixed script. These are its steps, in order.
export const STEPS = [
  "language",
  "business",
  "city",
  "purpose",
  "phone",
  "name",
  "done",
] as const;

export type Step = (typeof STEPS)[number];

// What the user has answered so far. A missing key means "not answered yet".
export type Answers = {
  lang?: LangCode;
  business?: { name: string; category: CategoryCode };
  city?: string;
  purpose?: string;
  phone?: string;
  agentName?: string;
};

export type ChatLine = { id: string; role: "agent" | "user"; text: string };

// Builds the whole conversation from the current step and the answers, so a
// page refresh can restore it without storing any message text.
export function buildTranscript(stepIndex: number, a: Answers): ChatLine[] {
  const lines: ChatLine[] = [];
  if (!a.lang) return lines;

  const t = MESSAGES[a.lang];
  const langLabel = LANGUAGES.find((l) => l.code === a.lang)?.label ?? a.lang;
  const reached = (step: Step) => stepIndex >= STEPS.indexOf(step);

  lines.push({ id: "u-language", role: "user", text: langLabel });

  if (reached("business")) {
    lines.push({
      id: "a-business",
      role: "agent",
      text: `${t.greet} ${t.askBusiness}`,
    });
  }
  if (a.business) {
    lines.push({
      id: "u-business",
      role: "user",
      text: `${t.nameLabel}: ${a.business.name} · ${t.categoryLabel}: ${t.categories[a.business.category]}`,
    });
  }
  if (reached("city")) {
    lines.push({ id: "a-city", role: "agent", text: t.askCity });
  }
  if (a.city) lines.push({ id: "u-city", role: "user", text: a.city });

  if (reached("purpose")) {
    lines.push({ id: "a-purpose", role: "agent", text: t.askPurpose });
  }
  if (a.purpose) lines.push({ id: "u-purpose", role: "user", text: a.purpose });

  if (reached("phone")) {
    lines.push({ id: "a-phone", role: "agent", text: t.askPhone });
  }
  if (a.phone) lines.push({ id: "u-phone", role: "user", text: a.phone });

  if (reached("name")) {
    lines.push({ id: "a-name", role: "agent", text: t.askName });
  }
  if (a.agentName)
    lines.push({ id: "u-name", role: "user", text: a.agentName });

  if (reached("done") && a.business && a.agentName) {
    lines.push({
      id: "a-done",
      role: "agent",
      text: fill(t.done, { agentName: a.agentName, shopName: a.business.name }),
    });
  }
  return lines;
}
