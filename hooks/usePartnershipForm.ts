import { useState, type ChangeEvent, type FormEvent } from 'react';
import { resetTurnstile } from '@/components/TurnstileWidget';
import {
  INITIAL_PARTNERSHIP_FORM,
  submitPartnership,
  validatePartnershipForm,
  type PartnershipFormData,
} from '@/lib/partnership';
import { LEAD_SUBMIT_MESSAGES } from '@/lib/leads';

export function usePartnershipForm() {
  const [form, setForm] = useState<PartnershipFormData>(INITIAL_PARTNERSHIP_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof PartnershipFormData, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? '';

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    const field = name as keyof PartnershipFormData;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nextErrors = validatePartnershipForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    if (!turnstileSiteKey) {
      setSubmitError(LEAD_SUBMIT_MESSAGES.missingSiteKey);
      return;
    }

    if (!turnstileToken) {
      setSubmitError(LEAD_SUBMIT_MESSAGES.missingTurnstile);
      return;
    }

    setLoading(true);
    setSubmitError(null);

    try {
      const result = await submitPartnership(form, turnstileToken);
      if (!result.ok) {
        setSubmitError(result.error);
        setTurnstileToken(null);
        resetTurnstile();
        return;
      }
      setSubmitted(true);
    } catch {
      setSubmitError(LEAD_SUBMIT_MESSAGES.networkError);
      setTurnstileToken(null);
      resetTurnstile();
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSubmitted(false);
    setForm(INITIAL_PARTNERSHIP_FORM);
    setErrors({});
    setSubmitError(null);
    setTurnstileToken(null);
    resetTurnstile();
  };

  return {
    form,
    submitted,
    loading,
    errors,
    submitError,
    turnstileSiteKey,
    setTurnstileToken,
    handleChange,
    handleSubmit,
    reset,
  };
}
