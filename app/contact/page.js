"use client";

import Container from "@/components/Container";
import Input from "@/components/Input";
import TextArea from "@/components/TextArea";
import Button from "@/components/Button";
import { useState } from "react";

function SocialButton({ href, label, Icon }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="group inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-4 py-2 text-sm font-extrabold text-slate-800 shadow-sm
      hover:bg-white hover:border-blue-300 hover:shadow-md
      focus:outline-none focus:ring-4 focus:ring-blue-500/15
      transition
      dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-white
      dark:hover:bg-blue-950/45 dark:hover:border-blue-400/45
      dark:hover:shadow-[0_10px_30px_rgba(37,99,235,0.18)]
      dark:focus:ring-blue-400/20"
    >
      <Icon className="h-5 w-5 text-blue-700 group-hover:text-red-500 transition dark:text-blue-200 dark:group-hover:text-red-300" />
      <span>{label}</span>
    </a>
  );
}

function FacebookIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z" />
    </svg>
  );
}

function InstagramIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9z" />
      <path d="M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
      <path d="M17.4 6.6a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
    </svg>
  );
}

function YouTubeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M21.6 7.2a3 3 0 0 0-2.1-2.1C17.7 4.6 12 4.6 12 4.6s-5.7 0-7.5.5A3 3 0 0 0 2.4 7.2 31.7 31.7 0 0 0 2 12c0 1.7.1 3.4.4 4.8a3 3 0 0 0 2.1 2.1c1.8.5 7.5.5 7.5.5s5.7 0 7.5-.5a3 3 0 0 0 2.1-2.1c.3-1.4.4-3.1.4-4.8 0-1.7-.1-3.4-.4-4.8zM10.2 15.3V8.7L16 12l-5.8 3.3z" />
    </svg>
  );
}

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    const form = new FormData(e.target);
    const payload = {
      name: String(form.get("name") || ""),
      email: String(form.get("email") || ""),
      message: String(form.get("message") || ""),
    };

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);
    setLoading(false);

    if (data?.ok) {
      e.target.reset();
      setMsg("Message sent successfully.");
    } else {
      setMsg("Failed to send. Please check inputs.");
    }
  };

  return (
    <Container>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white/70 p-8 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Contact
          </h1>

          <p className="mt-3 text-slate-600 leading-relaxed dark:text-blue-100/75">
            For nursing topics, website support, or collaboration, reach out anytime. We’ll respond as soon as possible.
          </p>

          <div className="mt-6 grid gap-3 text-sm font-semibold text-slate-700 dark:text-blue-100/80">
            <a
              href="mailto:support@nursingnepal.com"
              className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 shadow-sm
              hover:bg-white hover:border-blue-300 transition
              dark:border-blue-400/20 dark:bg-blue-950/30 dark:hover:bg-blue-950/45 dark:hover:border-blue-400/45"
            >
              Email: support@nursingnepal.com
            </a>

            <a
              href="tel:+9779800000000"
              className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 shadow-sm
              hover:bg-white hover:border-blue-300 transition
              dark:border-blue-400/20 dark:bg-blue-950/30 dark:hover:bg-blue-950/45 dark:hover:border-blue-400/45"
            >
              Phone: +977 9800000000
            </a>

            <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/30">
              Location: Nepal
            </div>
          </div>

          <div className="mt-6">
            <div className="text-sm font-extrabold text-slate-900 dark:text-white">
              Follow Nursing Nepal
            </div>

            <div className="mt-3 flex flex-wrap gap-3">
              <SocialButton href="https://facebook.com" label="Facebook" Icon={FacebookIcon} />
              <SocialButton href="https://instagram.com" label="Instagram" Icon={InstagramIcon} />
              <SocialButton href="https://youtube.com" label="YouTube" Icon={YouTubeIcon} />
            </div>
          </div>
        </div>

        <form
          onSubmit={submit}
          className="rounded-3xl border border-slate-200 bg-white/70 p-8 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25"
        >
          <div className="grid gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">
                Name
              </label>
              <div className="mt-2">
                <Input name="name" placeholder="Your name" required />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">
                Email
              </label>
              <div className="mt-2">
                <Input name="email" type="email" placeholder="you@example.com" required />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">
                Message
              </label>
              <div className="mt-2">
                <TextArea name="message" placeholder="Write your message..." required />
              </div>
            </div>

            {msg && (
              <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100/80">
                {msg}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full py-3">
              {loading ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </form>
      </div>
    </Container>
  );
}
