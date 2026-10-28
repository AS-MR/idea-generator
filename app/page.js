"use client";

import { useState } from "react";

const categories = [
  "Startup",
  "App",
  "Blog post",
  "YouTube video",
  "Side project",
  "Story",
  "Gift",
];

export default function Home() {
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [count, setCount] = useState("5");
  const [ideas, setIdeas] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function generateIdeas(event) {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    setIdeas([]);

    try {
      const response = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, category, count }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate ideas");
      }

      setIdeas(data.ideas);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main>
      <h1>💡 Idea Generator</h1>
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
