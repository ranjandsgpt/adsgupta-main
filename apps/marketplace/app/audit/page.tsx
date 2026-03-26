export default function AuditPage() {
  return (
    <main className="min-h-screen">
      <iframe
        src="https://pousali.adsgupta.com/audit"
        className="w-full border-0"
        style={{ height: 'calc(100vh - 64px)', minHeight: '800px' }}
        title="Amazon Advertising Audit Tool"
        allow="clipboard-write"
      />
    </main>
  );
}

