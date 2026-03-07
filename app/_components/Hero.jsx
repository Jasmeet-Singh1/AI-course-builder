"use client";

import React from "react";

function Hero() {
  return (
    <section className="bg-white lg:grid lg:place-content-center">
      <div className="mx-auto w-screen max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-extrabold text-primary sm:text-5xl">
            AI Course Generator
            <strong className="text-black font-extrabold sm:block">
              <span className="block whitespace-nowrap">
                Customer Learning Paths
              </span>
              <span className="block">Powered by AI</span>
            </strong>
          </h1>

          <p className="mt-4 text-base text-pretty text-gray-700 sm:text-lg/relaxed">
            Unlock personalized education with AI-driven learning paths. Tailor
            your learning journey to your unique needs and goals.
          </p>

          <div className="mt-4 flex justify-center gap-4 sm:mt-6">
            <a
              className="inline-block rounded border border-primary bg-primary px-5 py-3 font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
              href="#"
            >
              Get Started
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
