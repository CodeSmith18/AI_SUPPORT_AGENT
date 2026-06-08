const title = "AI Support Chat";

export default function HomePage() {
  return (
    <main className="shell">
      <section className="chat-widget" aria-label={title}>
        <header>
          <p>Spur Demo Store</p>
          <h1>{title}</h1>
        </header>

        <div className="placeholder">
          <p>The chat experience will land in the next stages.</p>
        </div>
      </section>
    </main>
  );
}
