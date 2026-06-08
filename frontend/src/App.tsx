import "./styles.css";

export default function App() {
  return (
    <main className="app-shell">
      <section className="chat-panel" aria-label="AI support chat">
        <header className="chat-header">
          <div>
            <p className="eyebrow">AuroraMart support</p>
            <h1>AI Live Chat Agent</h1>
          </div>
          <span className="status-pill">Online</span>
        </header>

        <div className="empty-state">
          <p>Chat UI coming in the frontend stage.</p>
        </div>
      </section>
    </main>
  );
}

