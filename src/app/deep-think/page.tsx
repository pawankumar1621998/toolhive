"use client";

import { useState } from "react";
import Head from "next/head";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Brain, Lightbulb, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";

export default function DeepThinkPage() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError("");
    setResponse("");

    try {
      const res = await fetch("/api/deep-think", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Failed to get response");
      }

      // For streaming response
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          fullResponse += chunk;
          setResponse(fullResponse);
        }
      }
    } catch (err) {
      setError((err as Error).message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const examplePrompts = [
    {
      icon: <Lightbulb className="w-5 h-5" />,
      title: "Explain a Concept",
      text: "Explain how neural networks learn. Show your step-by-step reasoning.",
    },
    {
      icon: <AlertTriangle className="w-5 h-5" />,
      title: "Debug Code",
      text: "Why is my JavaScript code running slowly? Analyze step by step:\n\nfunction slow() {\n  for (let i = 0; i < 1000000; i++) {\n    console.log(i);\n  }\n}",
    },
    {
      icon: <CheckCircle className="w-5 h-5" />,
      title: "Decision Making",
      text: "I should start my own business or get a job? Analyze the pros and cons with step-by-step reasoning.",
    },
    {
      icon: <Brain className="w-5 h-5" />,
      title: "Problem Solving",
      text: "Solve this puzzle: If 3 cats catch 3 mice in 3 minutes, how many cats are needed to catch 100 mice in 100 minutes?",
    },
  ];

  return (
    <>
      <Head>
        <title>Deep Think - Step-by-Step AI Reasoning | ToolHive</title>
        <meta name="description" content="AI-powered step-by-step reasoning tool. Get detailed, logical thinking processes for complex problems." />
      </Head>
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
        <Navbar />
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-violet-500/20 text-violet-300 px-4 py-2 rounded-full mb-4">
              <Brain className="w-5 h-5" />
              <span className="text-sm font-medium">Powered by GLM-5.1 Thinking Model</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Deep Think</h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              AI-powered step-by-step reasoning for complex problems. Get detailed, logical thinking processes like having a conversation with a brilliant mind.
            </p>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
              <label className="block text-white font-medium mb-3">
                What would you like to think about?
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask any question, explain a concept, debug code, solve a problem... The AI will show its step-by-step thinking process."
                className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                rows={4}
              />
              <div className="flex items-center justify-between mt-4">
                <p className="text-slate-500 text-sm">
                  {prompt.length}/2000 characters
                </p>
                <button
                  type="submit"
                  disabled={loading || !prompt.trim()}
                  className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium transition-colors"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Thinking...
                    </>
                  ) : (
                    <>
                      <Brain className="w-5 h-5" />
                      Start Thinking
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-8">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {/* Response */}
          {response && (
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 mb-8">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-violet-400" />
                AI Response
              </h2>
              <div className="prose prose-invert prose-slate max-w-none">
                <pre className="whitespace-pre-wrap text-slate-300 font-sans text-sm leading-relaxed bg-slate-900/50 rounded-xl p-4 overflow-x-auto">
                  {response}
                </pre>
              </div>
            </div>
          )}

          {/* Example Prompts */}
          <div>
            <h3 className="text-white font-semibold mb-4">Try these examples:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {examplePrompts.map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => setPrompt(example.text)}
                  className="bg-slate-800/30 hover:bg-slate-800/60 border border-slate-700 hover:border-violet-500/50 rounded-xl p-4 text-left transition-all group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-violet-400 group-hover:scale-110 transition-transform">
                      {example.icon}
                    </div>
                    <span className="text-white font-medium">{example.title}</span>
                  </div>
                  <p className="text-slate-400 text-sm line-clamp-2">{example.text}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="mt-12 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-2xl p-6 border border-violet-500/20">
            <h3 className="text-white font-semibold mb-4">How Deep Think Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl mb-2">🧠</div>
                <h4 className="text-white font-medium mb-1">Thinking Model</h4>
                <p className="text-slate-400 text-sm">Uses GLM-5.1 with extended thinking enabled for step-by-step reasoning</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">📝</div>
                <h4 className="text-white font-medium mb-1">Visible Reasoning</h4>
                <p className="text-slate-400 text-sm">See the AI's thought process as it works through your problem</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">⚡</div>
                <h4 className="text-white font-medium mb-1">Detailed Analysis</h4>
                <p className="text-slate-400 text-sm">Get comprehensive answers with logical explanations</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}