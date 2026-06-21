"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeading } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { createSupabaseBrowserClient } from "@/lib/db/supabaseBrowser";

export function LoginForm() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
        return;
      }
      // Full reload so Server Components pick up the new session cookie.
      window.location.href = "/";
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeading>Log in</CardHeading>
      <form onSubmit={submit} className="flex flex-col gap-6">
        <Input
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error ? (
          <p data-testid="login-error" className="text-base font-bold text-danger">
            {error}
          </p>
        ) : null}
        <Button variant="secondary" type="submit" data-testid="login-submit" disabled={busy}>
          {busy ? "…" : "Log in"}
        </Button>
      </form>
    </Card>
  );
}
