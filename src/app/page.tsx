const events = [
  ["[FORM] - Totem de Autoatendimento", "Site"],
  ["[LEADSTER] - LP Totem", "Leadster"],
  ["totem-de-autoatendimento", "Landing Page"],
];

export default function Home() {
  return (
    <main style={{ fontFamily: "system-ui", maxWidth: 760, margin: "64px auto", padding: 24 }}>
      <h1>RD Station → Kommo</h1>
      <p>Integração do produto Totem de Autoatendimento.</p>
      <ul>
        {events.map(([event, source]) => (
          <li key={event}><strong>{source}:</strong> {event}</li>
        ))}
      </ul>
      <p>Destino: Funil Nextcard → ETAPA DE LEADS DE ENTRADA.</p>
    </main>
  );
}
