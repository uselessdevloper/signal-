"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface CompanyLogoProps {
  company: string;
  className?: string;
  size?: number;
}

export function CompanyLogo({ company, className, size = 16 }: CompanyLogoProps) {
  const [imgError, setImgError] = useState(false);
  const normalized = (company || "").toLowerCase().trim();

  // 1. Precise inline vector SVGs for top tech companies
  if (normalized.includes("stripe")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0 rounded-sm", className)}
      >
        <rect width="40" height="40" rx="8" fill="#635BFF" />
        <path
          d="M28.3 18.2C28.3 14.8 25.5 13 21.6 13C16.8 13 13.5 15.5 13.5 19.3C13.5 25.3 21.4 24.1 21.4 27.2C21.4 28.5 20.2 29.2 18.7 29.2C16.4 29.2 14.4 27.8 14.4 26.2H11.5C11.5 29.8 14.5 31.8 18.6 31.8C23.6 31.8 27 29.4 27 25.4C27 19.1 19 20.5 19 17.5C19 16.4 20 15.6 21.4 15.6C23.4 15.6 25.1 16.7 25.3 18.2H28.3Z"
          fill="white"
        />
      </svg>
    );
  }

  if (normalized.includes("datadog")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0 rounded-sm", className)}
      >
        <rect width="40" height="40" rx="8" fill="#632CA6" />
        <path
          d="M20 10C14.48 10 10 14.48 10 20C10 25.52 14.48 30 20 30C25.52 30 30 25.52 30 20C30 14.48 25.52 10 20 10ZM25.2 21.6C24.8 23.8 22.8 25.5 20.5 25.5C18.2 25.5 16.3 23.9 15.7 21.8L17.6 21.3C18 22.6 19.1 23.6 20.5 23.6C21.9 23.6 23.1 22.5 23.3 21.1L25.2 21.6ZM20 16.2C18.5 16.2 17.3 15 17.3 13.5H19.3C19.3 13.9 19.6 14.2 20 14.2C20.4 14.2 20.7 13.9 20.7 13.5H22.7C22.7 15 21.5 16.2 20 16.2Z"
          fill="white"
        />
      </svg>
    );
  }

  if (normalized.includes("google") || normalized.includes("gcp")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0", className)}
      >
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          fill="#EA4335"
        />
      </svg>
    );
  }

  if (normalized.includes("vercel")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0", className)}
      >
        <path d="M12 2L24 22H0L12 2Z" fill="#000000" />
      </svg>
    );
  }

  if (normalized.includes("amazon") || normalized.includes("aws")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0", className)}
      >
        <path
          d="M13.9 12.6c0 .8-.5 1.3-1.3 1.3-.7 0-1.2-.5-1.2-1.3 0-.9.5-1.4 1.2-1.4.8 0 1.3.5 1.3 1.4zm6.6 6.7c-.3.3-.8.4-1.2.2-2.3-1.4-5.3-2.2-8.5-2.2-4.5 0-8.6 1.6-11.4 4.3-.3.3-.8.3-1.1 0-.3-.3-.3-.8 0-1.1C1.2 17.6 5.8 15.8 10.8 15.8c3.5 0 6.8.9 9.3 2.5.5.3.6.8.4 1z"
          fill="#FF9900"
        />
        <path
          d="M18.8 18.2c-.3-.4-1.6-.2-2.4-.1-.3 0-.4-.2-.1-.4 1.7-1.1 3.5-.8 3.8-.4.3.4-.2 2.2-1.8 3.5-.2.2-.4.1-.3-.2.3-.8.9-2 .8-2.4z"
          fill="#FF9900"
        />
      </svg>
    );
  }

  if (normalized.includes("anthropic")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0", className)}
      >
        <path
          d="M14.2 3.5H9.8L3 20.5H7.7L9.1 16.8H14.9L16.3 20.5H21L14.2 3.5ZM10.4 13.4L12 9.1L13.6 13.4H10.4Z"
          fill="#CC785C"
        />
      </svg>
    );
  }

  if (normalized.includes("meta") || normalized.includes("facebook")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0", className)}
      >
        <path
          d="M16.9 4C14.7 4 12.8 5.3 12 7.1C11.2 5.3 9.3 4 7.1 4C3.7 4 1 6.8 1 10.3C1 14.6 4.6 18.3 9.3 19.8L12 20.7L14.7 19.8C19.4 18.3 23 14.6 23 10.3C23 6.8 20.3 4 16.9 4ZM12 16.3C8.6 15 6 12.6 6 10.3C6 8.5 7.4 7 9.1 7C10.6 7 11.9 7.9 12.4 9.3H11.6V11.3H12.4C11.9 12.7 10.6 13.6 9.1 13.6C8.8 13.6 8.5 13.5 8.2 13.4L7.5 15.2C8 15.5 8.5 15.6 9.1 15.6C11.3 15.6 13.2 14.3 14 12.5C14.8 14.3 16.7 15.6 18.9 15.6C19.5 15.6 20 15.5 20.5 15.2L19.8 13.4C19.5 13.5 19.2 13.6 18.9 13.6C17.4 13.6 16.1 12.7 15.6 11.3H16.4V9.3H15.6C16.1 7.9 17.4 7 18.9 7C20.6 7 22 8.5 22 10.3C22 12.6 19.4 15 16 16.3H12Z"
          fill="#0668E1"
        />
      </svg>
    );
  }

  if (normalized.includes("apple")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0 text-zinc-900", className)}
      >
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.98.6-2.61 1.34-.56.64-.99 1.7-0.86 2.72 1 .08 1.93-.46 2.55-1.21z" />
      </svg>
    );
  }

  if (normalized.includes("github")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0 text-zinc-900", className)}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        />
      </svg>
    );
  }

  // 2. Real-time CDN Logo with resilient fallback
  const domain = `${normalized.replace(/[^a-z0-9]/g, "")}.com`;
  const logoUrl = `https://logo.clearbit.com/${domain}`;

  if (!imgError) {
    return (
      <img
        src={logoUrl}
        alt={`${company} logo`}
        width={size}
        height={size}
        onError={() => setImgError(true)}
        className={cn("shrink-0 rounded-sm object-contain", className)}
        style={{ width: `${size}px`, height: `${size}px` }}
      />
    );
  }

  // 3. Fallback Monogram Badge
  const initial = (company || "C").trim().charAt(0).toUpperCase();
  return (
    <div
      style={{ width: `${size}px`, height: `${size}px` }}
      className={cn(
        "rounded bg-zinc-900 text-white font-bold text-[9px] flex items-center justify-center shrink-0 shadow-2xs select-none",
        className
      )}
    >
      {initial}
    </div>
  );
}
