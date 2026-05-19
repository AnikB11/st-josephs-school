"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SCHOOL } from "@/lib/constants";

export function Hero({
  headline,
  subhead,
}: {
  headline?: string | null;
  subhead?: string | null;
}) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-grid mask-fade-y opacity-[0.35]" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu blur-3xl"
      >
        <div
          className="relative left-1/2 aspect-[1155/678] w-[72rem] -translate-x-1/2 bg-gradient-to-tr from-primary/15 via-accent/10 to-emerald/10 opacity-50"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>

      <div className="container-wide py-20 sm:py-28 lg:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-medium text-slate-600 backdrop-blur"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Admissions open for 2026–27
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05, ease: "easeOut" }}
              className="heading mt-6 text-balance text-4xl font-semibold leading-[1.05] sm:text-5xl lg:text-6xl"
            >
              {headline ? (
                headline
              ) : (
                <>
                  Where tradition meets{" "}
                  <span className="relative inline-block">
                    <span className="relative z-10 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                      tomorrow.
                    </span>
                  </span>
                </>
              )}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
              className="lead mt-6 max-w-xl text-lg"
            >
              {subhead ??
                `${SCHOOL.name} has nurtured generations of curious, compassionate young people for over ${
                  new Date().getFullYear() - SCHOOL.founded
                } years — with the academic rigor of a top-tier institution and the warmth of a close community.`}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link href="/admissions">
                <Button size="lg" className="group">
                  Apply for admission
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline">Discover the school</Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="mt-10 flex items-center gap-6 text-xs text-slate-500"
            >
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald" /> Accredited
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald" /> 32:1 community
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald" /> 60+ years
              </span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.1, ease: "easeOut" }}
            className="lg:col-span-5"
          >
            <HeroVisual />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="relative mx-auto aspect-[5/6] w-full max-w-md">
      <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-slate-50 via-white to-slate-50 ring-1 ring-slate-200/80 shadow-[0_8px_40px_-12px_rgba(15,23,42,0.18)]" />

      {/* Animated rings — feel of a drone orbit */}
      <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute inset-6 rounded-[1.75rem] border border-dashed border-slate-200"
      />
      <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: -360 }}
        transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
        className="absolute inset-12 rounded-[1.5rem] border border-slate-100"
      />

      {/* Center medallion */}
      <div className="absolute inset-0 grid place-items-center">
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: [-4, 4, -4] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center"
        >
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <span className="font-display text-2xl font-semibold">SJ</span>
          </div>
          <p className="mt-5 font-display text-sm font-semibold text-slate-800">
            St. Joseph's
          </p>
          <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
            Est. {SCHOOL.founded}
          </p>
        </motion.div>
      </div>

      {/* Floating chips */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="absolute left-2 top-12 rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-xs shadow-sm backdrop-blur"
      >
        <p className="font-medium text-slate-900">98% pass rate</p>
        <p className="text-[10px] text-slate-500">Class XII 2026</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75 }}
        className="absolute -right-2 bottom-16 rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-xs shadow-sm backdrop-blur"
      >
        <p className="font-medium text-slate-900">800+ students</p>
        <p className="text-[10px] text-slate-500">Across 12 grades</p>
      </motion.div>
    </div>
  );
}
