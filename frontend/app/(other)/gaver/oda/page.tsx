"use client";

import { ArrowDownOnSquareIcon } from "@heroicons/react/24/outline";
import ConfettiBoom from "react-confetti-boom";

export default function OdaPage() {
  return (
    <main className="min-h-screen bg-bg flex items-center justify-center p-4 overflow-hidden">
      <ConfettiBoom mode="fall" particleCount={50} />
      <div className="bg-card rounded-2xl shadow-sm p-8 md:p-12 text-center max-w-md w-full relative z-10">
        <div className="text-6xl mb-6">🎁</div>
        <h1 className="font-display text-3xl md:text-4xl text-text mb-4">
          Hei ODD sjef boss girl sis / bro / kjære søster
        </h1>
        <p className="text-lg text-muted mb-8">Du har fått en gave! Det er et gavekort på medlemskap på Oslo Badstue!! </p>
        <a
          href="/images/prepaid-gift-subscription.pdf"
          download="prepaid-gift-subscription.pdf"
          className="inline-block"
        >
          <button
            type="button"
            className="bg-primary mx-auto flex gap-2 items-center justify-center text-white font-sans font-medium px-6 py-3 rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
          >
            Last ned stygg PDF med instruksjoner og sånn <ArrowDownOnSquareIcon className="h-4 w-4" />
          </button>
        </a>
      </div>
    </main>
  );
}
