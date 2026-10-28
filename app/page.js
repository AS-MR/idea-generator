"use client";

import { useEffect, useState } from "react";

const categories = [
  "Startup",
  "App",
  "Blog post",
  "YouTube video",
  "Side project",
  "Story",
  "Gift",
];

const GROQ_MODEL =
  process.env.NEXT_PUBLIC_GROQ_MODEL || "llama-3.3-70b-versatile";

export default function Home() {
  const [theme, setTheme] = useState("blue");
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [count, setCount] = useState("5");
  const [ideas, setIdeas] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  function toggleTheme() {
    setTheme((current) => (current === "blue" ? "pink" : "blue"));
  }

  async function generateIdeas(event) {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    setIdeas([]);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
      if (!apiKey) {
        throw new Error(
          "NEXT_PUBLIC_GROQ_API_KEY is not set. Add it to .env locally or to GitHub Actions Secrets for deployment."
        );
      }

      const cleanTopic = String(topic || "").slice(0, 200).trim() || "anything";
      const cleanCategory = String(category || "General").slice(0, 50);
      const parsedCount = Number.parseInt(count, 10) || 5;
      const cleanCount = Math.min(Math.max(parsedCount, 1), 10);

      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: GROQ_MODEL,
            temperature: 1,
            response_format: { type: "json_object" },
            messages: [
              {
                role: "system",
                content:
                  'You are a creative idea generator. Reply ONLY with JSON: {"ideas":[{"title":string,"description":string}]}. Descriptions are 1-2 sentences.',
              },
              {
                role: "user",
                content: `Generate ${cleanCount} original ${cleanCategory} ideas about: ${cleanTopic}`,
              },
            ],
          }),
        }
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || "Failed to generate ideas");
      }

      const parsed = JSON.parse(result.choices[0].message.content);
      setIdeas(parsed.ideas || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main>
      <div className="header-bar">
        <h1>💡 Idea Generator</h1>
        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "blue" ? "pink" : "blue"} theme`}
        >
          {theme === "blue" ? "🩷 Pink theme" : "💙 Blue theme"}
        </button>
      </div>
      <form onSubmit={generateIdeas}>
        <input
          id="topic"
          name="topic"
          placeholder="Topic or theme (e.g. sustainable cities)"
          maxLength={200}
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
        />
        <select
          aria-label="Idea category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          {categories.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
        <select
          aria-label="Number of ideas"
          value={count}
          onChange={(event) => setCount(event.target.value)}
        >
          {[3, 4, 5, 6, 8, 10].map((number) => (
            <option key={number} value={number}>
              {number}
            </option>
          ))}
        </select>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Thinking…" : "Generate ideas"}
        </button>
      </form>
      {error && <p id="error" role="alert">{error}</p>}
      <section id="results" aria-live="polite" aria-label="Generated ideas">
        {ideas.map((idea, index) => (
          <article className="card" key={`${idea.title}-${index}`}>
            <h2>{idea.title}</h2>
            <p>{idea.description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
