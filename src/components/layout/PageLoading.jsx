export default function PageLoading() {
  return (
    <main id="main-content" className="lab-container" aria-busy="true">
      <p role="status" className="lab-eyebrow mb-8">
        Loading operations…
      </p>
      <div className="lab-skeleton mb-6" aria-hidden="true" />
      <div className="lab-competition-grid" aria-hidden="true">
        <div className="lab-skeleton" />
        <div className="lab-skeleton" />
      </div>
    </main>
  );
}
