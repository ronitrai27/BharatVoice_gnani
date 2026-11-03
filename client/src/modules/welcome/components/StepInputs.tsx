"use client";

import { useState } from "react";
import { ArrowUpIcon, ChevronsUpDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CITIES } from "../i18n/cities";
import {
  CATEGORY_CODES,
  type CategoryCode,
  LANGUAGES,
  type LangCode,
  type Messages,
} from "../i18n/messages";

// Each step shows its own input with its own Send button right next to it.
// Pressing Send hands the answer to the parent, which adds it to the chat.

const INDIAN_MOBILE = /^[6-9]\d{9}$/;

function digitsOnly(value: string) {
  return value.replace(/\D/g, "").replace(/^(91|0)(?=\d{10}$)/, "");
}

function SendButton({
  t,
  disabled,
  className,
}: {
  t: Messages;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <Button
      type="submit"
      disabled={disabled}
      aria-label={t.send}
      className={cn("shrink-0 gap-1.5", className)}
    >
      {t.send}
      <ArrowUpIcon />
    </Button>
  );
}

function FieldError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-2 px-1 text-sm text-red-600">
      {message}
    </p>
  );
}

export function LanguageInput({
  t,
  onSend,
}: {
  t: Messages;
  onSend: (lang: LangCode) => void;
}) {
  const [selected, setSelected] = useState<LangCode | null>(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (selected) onSend(selected);
      }}
      className="flex items-end gap-3"
    >
      <div
        role="radiogroup"
        aria-label="Preferred language"
        className="flex flex-1 flex-wrap gap-2"
      >
        {LANGUAGES.map((l) => (
          <button
            key={l.code}
            type="button"
            role="radio"
            aria-checked={selected === l.code}
            onClick={() => setSelected(l.code)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm transition-colors",
              selected === l.code
                ? "border-[#191919] bg-[#191919] text-white"
                : "border-input bg-white hover:bg-muted",
            )}
          >
            {l.label}
          </button>
        ))}
      </div>
      <SendButton t={t} disabled={!selected} />
    </form>
  );
}

export function BusinessInput({
  t,
  onSend,
}: {
  t: Messages;
  onSend: (business: { name: string; category: CategoryCode }) => void;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<CategoryCode | null>(null);
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2 || !category) {
      setError(t.required);
      return;
    }
    onSend({ name: name.trim(), category });
  }

  return (
    <form onSubmit={submit}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t.shopNamePlaceholder}
          aria-label={t.shopNamePlaceholder}
          maxLength={80}
          className="h-10 flex-1 bg-white"
        />
        <Select
          value={category}
          onValueChange={(v) => setCategory(v as CategoryCode)}
          items={CATEGORY_CODES.map((c) => ({
            value: c,
            label: t.categories[c],
          }))}
        >
          <SelectTrigger className="w-full bg-white data-[size=default]:h-10 sm:w-56">
            <SelectValue placeholder={t.categoryPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_CODES.map((c) => (
              <SelectItem key={c} value={c}>
                {t.categories[c]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <SendButton t={t} className="h-10" />
      </div>
      <FieldError message={error} />
    </form>
  );
}

export function CityInput({
  t,
  onSend,
}: {
  t: Messages;
  onSend: (city: string) => void;
}) {
  const [city, setCity] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (city) onSend(city);
      }}
      className="flex gap-3"
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <button
              type="button"
              className="flex h-10 flex-1 items-center justify-between rounded-lg border border-input bg-white px-3 text-sm outline-none transition-colors hover:bg-muted/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          }
        >
          <span className={cn(!city && "text-muted-foreground")}>
            {city ?? t.cityPlaceholder}
          </span>
          <ChevronsUpDownIcon className="size-4 text-muted-foreground" />
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="start"
          sideOffset={8}
          className="w-(--anchor-width) p-0"
        >
          <Command className="h-auto">
            <CommandInput placeholder={t.citySearch} />
            <CommandList className="h-56 max-h-56 p-1">
              <CommandEmpty>{t.cityEmpty}</CommandEmpty>
              <CommandGroup>
                {CITIES.map((c) => (
                  <CommandItem
                    key={c}
                    value={c}
                    data-checked={city === c}
                    onSelect={() => {
                      setCity(c);
                      setOpen(false);
                    }}
                  >
                    {c}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <SendButton t={t} disabled={!city} className="h-10" />
    </form>
  );
}

export function PurposeInput({
  t,
  onSend,
}: {
  t: Messages;
  onSend: (purpose: string) => void;
}) {
  const [text, setText] = useState("");

  function send() {
    if (text.trim().length >= 3) onSend(text.trim());
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
    >
      <InputGroup className="rounded-2xl bg-white">
        <InputGroupTextarea
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder={t.purposePlaceholder}
          aria-label={t.purposePlaceholder}
          maxLength={500}
          className="max-h-40 min-h-16"
        />
        <InputGroupAddon align="block-end">
          <InputGroupButton
            type="submit"
            variant="default"
            size="sm"
            disabled={text.trim().length < 3}
            className="ml-auto gap-1.5 rounded-full px-3"
          >
            {t.send}
            <ArrowUpIcon />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </form>
  );
}

export function PhoneInput({
  t,
  onSend,
}: {
  t: Messages;
  onSend: (phone: string) => void;
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const digits = digitsOnly(value);
    if (!INDIAN_MOBILE.test(digits)) {
      setError(t.invalidPhone);
      return;
    }
    onSend(`+91 ${digits.slice(0, 5)} ${digits.slice(5)}`);
  }

  return (
    <form onSubmit={submit}>
      <div className="flex gap-3">
        <div className="flex h-10 flex-1 items-center rounded-lg border border-input bg-white pl-3 focus-within:ring-3 focus-within:ring-ring/50">
          <span className="text-sm text-muted-foreground">+91</span>
          <Input
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(null);
            }}
            placeholder={t.phonePlaceholder}
            aria-label={t.phonePlaceholder}
            maxLength={14}
            className="h-9 flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0"
          />
        </div>
        <SendButton t={t} disabled={!value.trim()} className="h-10" />
      </div>
      <FieldError message={error} />
    </form>
  );
}

export function NameInput({
  t,
  onSend,
}: {
  t: Messages;
  onSend: (name: string) => void;
}) {
  const [name, setName] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (name.trim().length >= 2) onSend(name.trim());
      }}
      className="flex gap-3"
    >
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t.namePlaceholder}
        aria-label={t.namePlaceholder}
        maxLength={30}
        autoFocus
        className="h-10 flex-1 bg-white"
      />
      <SendButton t={t} disabled={name.trim().length < 2} className="h-10" />
    </form>
  );
}
