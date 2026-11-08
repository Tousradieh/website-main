'use client';

import { useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formFieldClass } from '@/lib/form-ui';
import { hammasirApi } from '@/lib/hammasir';

interface LoginFormProps {
  onSignIn: (token: string) => void;
}

export default function LoginForm({ onSignIn }: LoginFormProps) {
  const [code, setCode] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!code.trim() || !pin.trim()) {
      setError('کد پرسنلی و رمز را وارد کنید');
      return;
    }
    setLoading(true);
    setError(null);
    const result = await hammasirApi<{ token: string }>('/api/login', { body: { code, pin } });
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onSignIn(result.token);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 sm:p-8 border border-border" noValidate>
      <h2 className="text-brand-900 font-heading font-bold text-xl mb-1">ورود پرسنل</h2>
      <p className="text-muted-foreground text-sm mb-6">
        رمز ورود را از واحد منابع انسانی یا سرپرست کارگاه خود دریافت کنید.
      </p>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="hammasir-code" className="text-sm font-medium text-brand-900">
          کد پرسنلی
        </label>
        <input
          id="hammasir-code"
          inputMode="numeric"
          autoComplete="username"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          dir="ltr"
          className={formFieldClass(false)}
        />
      </div>

      <div className="flex flex-col gap-1.5 mt-4">
        <label htmlFor="hammasir-pin" className="text-sm font-medium text-brand-900">
          رمز
        </label>
        <input
          id="hammasir-pin"
          type="password"
          inputMode="numeric"
          autoComplete="current-password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          dir="ltr"
          className={formFieldClass(false)}
        />
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-4 py-3"
        >
          {error}
        </p>
      ) : null}

      <Button type="submit" variant="brand" disabled={loading} className="mt-6 w-full h-auto px-6 py-3.5 rounded-md">
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            در حال ورود...
          </>
        ) : (
          'ورود'
        )}
      </Button>
    </form>
  );
}
