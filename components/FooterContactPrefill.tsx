"use client";

import { useRef, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { isValidEmail, sanitizeText } from "@/lib/form-utils";
import { CONTACT_EMAIL_PREFILL_STORAGE_KEY } from "@/lib/public-form-security";

type FooterContactPrefillProps = {
  locale: Locale;
  label: string;
  placeholder: string;
  submitLabel: string;
};

export function FooterContactPrefill({
  locale,
  label,
  placeholder,
  submitLabel,
}: FooterContactPrefillProps) {
  const emailRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const contactUrl = `/${locale}/contact`;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const candidate = sanitizeText(emailRef.current?.value, 254, {
      singleLine: true,
    });
    try {
      if (isValidEmail(candidate)) {
        sessionStorage.setItem(CONTACT_EMAIL_PREFILL_STORAGE_KEY, candidate);
      } else {
        sessionStorage.removeItem(CONTACT_EMAIL_PREFILL_STORAGE_KEY);
      }
    } catch {
      // Storage can be unavailable in hardened/private browser modes. The clean
      // navigation still works; only the optional prefill is skipped.
    }

    router.push(contactUrl);
  }

  return (
    <form action={contactUrl} method="get" onSubmit={handleSubmit}>
      <label htmlFor="footer-email">{label}</label>
      <div className="footer-form-row">
        <input
          id="footer-email"
          ref={emailRef}
          // Deliberately no `name`: the no-JavaScript GET fallback navigates to
          // a clean URL and never places the address in a query string.
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          placeholder={placeholder}
        />
        <button type="submit">{submitLabel}</button>
      </div>
    </form>
  );
}
