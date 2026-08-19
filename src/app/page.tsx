const events = [
  ["Totem", "Site", "[FORM] - Totem de Autoatendimento"],
  ["Totem", "Leadster", "[LEADSTER] - LP Totem"],
  ["Totem", "Landing Page", "totem-de-autoatendimento"],
  ["Catracas", "Site", "[FORM] - Catracas Expedidoras de Comandas"],
  ["Catracas", "Leadster", "[LEADSTER] - LP Catracas Expedidoras"],
  ["Catracas", "Landing Page", "catracas-expedidoras-de-comandas"],
  ["Comandas", "Site", "[FORM] - Comandas Eletrônicas Site"],
  ["Comandas", "Leadster", "[LEADSTER] - LP Comandas Eletrônicas"],
  ["Comandas", "Landing Page", "comandas-eletronicas-google"],
  ["Teloos", "Site", "Formulário de Contato - Site Teloos"],
  ["Teloos", "Leadster", "[LEADSTER] - Site Teloos"],
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
      <p>Destinos: Funil Nextcard ou Funil Teloos → NOVOS LEADS RD.</p>
    </main>
  );
}
