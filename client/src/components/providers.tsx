"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { useEffect, useRef } from "react";
import * as Sentry from "@sentry/nextjs";
import { client } from "@/lib/fetch-client";
import { setupSentryInterceptor } from "@/lib/logging";

function AuthTokenSetter({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const interceptorSetup = useRef(false);

  useEffect(() => {
    if (!interceptorSetup.current) {
      setupSentryInterceptor();
      interceptorSetup.current = true;
    }
  }, []);

  useEffect(() => {
    if (session?.accessToken) {
      client.setAuthToken(session.accessToken);
    } else {
      client.setAuthToken(null);
    }
  }, [session?.accessToken]);

  // Sentry user context 설정
  useEffect(() => {
    if (session?.user) {
      Sentry.setUser({
        id: session.user.id,
        email: session.user.email ?? undefined,
      });
    } else {
      Sentry.setUser(null);
    }
  }, [session?.user]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthTokenSetter>{children}</AuthTokenSetter>
      </ThemeProvider>
    </SessionProvider>
  );
}
