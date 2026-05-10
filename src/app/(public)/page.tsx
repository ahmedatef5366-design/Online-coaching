import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="relative">
      {/* Hero --------------------------------------------------------------- */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(163,230,53,0.15),transparent_70%),radial-gradient(50%_40%_at_80%_60%,rgba(249,115,22,0.10),transparent_70%)]"
        />
        <div className="container relative flex min-h-[80vh] flex-col items-start justify-center gap-6 py-24">
          <p className="rounded-full border border-border bg-card px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground">
            Online coaching · 1-on-1
          </p>
          <h1 className="max-w-3xl font-display text-5xl font-extrabold leading-[1.05] tracking-tight md:text-7xl">
            Build the body you{" "}
            <span className="text-primary">actually</span> want.
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Personalized workouts, flexible nutrition, daily accountability,
            and direct coach access — all in one place.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/signup"
              className="rounded-md bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Start your journey
            </Link>
            <Link
              href="#how-it-works"
              className="rounded-md border border-border px-5 py-3 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              How it works
            </Link>
          </div>
        </div>
      </section>

      {/* Features ----------------------------------------------------------- */}
      <section className="border-y border-border/60 bg-card/40 py-16">
        <div className="container">
          <h2 className="mb-10 font-display text-3xl font-bold md:text-4xl">
            Everything you need, nothing you don&apos;t.
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              [
                "Personalized Workout Plan",
                "Programs built around your level, schedule, and goals.",
              ],
              [
                "Flexible Nutrition System",
                "Hit your macros without giving up the foods you love.",
              ],
              [
                "Daily Check-in & Tracking",
                "Stay accountable with quick nightly check-ins.",
              ],
              [
                "Direct Coach Access",
                "Real feedback from a real coach — not a chatbot.",
              ],
              [
                "Visual & Metric Progress",
                "Track weight, measurements, and progress photos in one place.",
              ],
              [
                "Built for the Gym",
                "Mobile-first portal with rest timers and set logging.",
              ],
            ].map(([title, desc]) => (
              <div
                key={title}
                className="rounded-xl border border-border bg-background/40 p-5"
              >
                <h3 className="mb-2 font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works ------------------------------------------------------- */}
      <section id="how-it-works" className="py-16">
        <div className="container">
          <h2 className="mb-10 font-display text-3xl font-bold md:text-4xl">
            How it works
          </h2>
          <ol className="grid gap-4 sm:grid-cols-3">
            {[
              ["1", "Join", "Sign up and share your goals."],
              [
                "2",
                "Get your plan",
                "Receive a custom workout + nutrition plan.",
              ],
              [
                "3",
                "Track & transform",
                "Log workouts and check in daily — we adjust as you go.",
              ],
            ].map(([num, title, desc]) => (
              <li
                key={num}
                className="rounded-xl border border-border bg-card/60 p-6"
              >
                <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                  {num}
                </div>
                <h3 className="mb-1 text-lg font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA Footer --------------------------------------------------------- */}
      <section className="border-t border-border/60 py-16">
        <div className="container flex flex-col items-start gap-4">
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            Ready to start?
          </h2>
          <p className="max-w-xl text-muted-foreground">
            Stop guessing. Get a plan that fits your life and a coach who
            actually pays attention.
          </p>
          <Link
            href="/signup"
            className="rounded-md bg-primary px-6 py-3 font-semibold text-primary-foreground"
          >
            Sign up now
          </Link>
        </div>
      </section>
    </div>
  );
}
