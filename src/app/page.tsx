const events = [
  ["Totem", "Site", "[FORM] - Totem de Autoatendimento"],
  ["Totem", "Leadster", "[LEADSTER] - LP Totem"],
  ["Totem", "Landing Page", "totem-de-autoatendimento"],
  ["Catracas", "Site", "[FORM] - Catracas Expedidoras de Comandas"],
  ["Catracas", "Leadster", "[LEADSTER] - LP Catracas Expedidoras"],
  ["Catracas", "Landing Page", "catracas-expedidoras-de-comandas"],
];

export default function Home() {
  return (
    <main style={{ fontFamily: "system-ui", maxWidth: 760, margin: "64px auto", padding: 24 }}>
      <h1>RD Station → Kommo</h1>
      <p>Integração dos produtos da Nextcard.</p>
      <ul>
        {events.map(([product, source, event]) => (
          <li key={event}><strong>{product} · {source}:</strong> {event}</li>
        ))}
      </ul>
      <p>Destino: Funil Nextcard → NOVOS LEADS RD.</p>
    </main>
  );
}
