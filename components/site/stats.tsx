"use client";

import { motion } from "framer-motion";
import { Award, BookOpen, GraduationCap, Users } from "lucide-react";

const STATS = [
  { icon: Users, value: "800+", label: "Students", hint: "Pre-K through Grade 12" },
  { icon: GraduationCap, value: "60+", label: "Years", hint: "Of community trust" },
  { icon: BookOpen, value: "32:1", label: "Class size", hint: "Personal attention" },
  { icon: Award, value: "98%", label: "Pass rate", hint: "Class XII 2026" },
] as const;

export function Stats() {
  return (
    <section className="relative border-y border-slate-200/70 bg-slate-50/40">
      <div className="container-wide py-16">
        <div className="grid grid-cols-2 gap-8 sm:gap-10 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              viewport={{ once: true, margin: "-50px" }}
              className="flex flex-col"
            >
              <s.icon className="h-5 w-5 text-primary" />
              <p className="mt-4 font-display text-3xl font-semibold text-slate-900 sm:text-4xl">
                {s.value}
              </p>
              <p className="mt-1 text-sm font-medium text-slate-800">{s.label}</p>
              <p className="text-xs text-slate-500">{s.hint}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
