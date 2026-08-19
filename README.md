# Integração RD Station → Kommo

Recebe conversões do RD Station Marketing e cria ou atualiza contatos e oportunidades na Kommo.

## Rotas iniciais

| `event_identifier` do RD | Origem | Produto | Destino |
|---|---|---|---|
| `[FORM] - Totem de Autoatendimento` | Site | Totem de Autoatendimento | Funil Nextcard |
| `[LEADSTER] - LP Totem` | Leadster | Totem de Autoatendimento | Funil Nextcard |
| `totem-de-autoatendimento` | Landing Page | Totem de Autoatendimento | Funil Nextcard |
| `[FORM] - Catracas Expedidoras de Comandas` | Site | Catracas Expedidoras de Comandas | Funil Nextcard |
| `[LEADSTER] - LP Catracas Expedidoras` | Leadster | Catracas Expedidoras de Comandas | Funil Nextcard |
| `catracas-expedidoras-de-comandas` | Landing Page | Catracas Expedidoras de Comandas | Funil Nextcard |
| `[FORM] - Comandas Eletrônicas Site` | Site | Comandas Eletrônicas | Funil Nextcard |
| `[LEADSTER] - LP Comandas Eletrônicas` | Leadster | Comandas Eletrônicas | Funil Nextcard |
| `comandas-eletronicas-google` | Landing Page | Comandas Eletrônicas | Funil Nextcard |
| `[META LEADS ADS] - COMANDAS` | Meta Ads | Comandas Eletrônicas | Funil Nextcard |
| `Formulário de Contato - Site Teloos` | Site | Teloos | Funil Teloos |
| `[LEADSTER] - Site Teloos` | Leadster | Teloos | Funil Teloos |
| `Formulário Contato Site` | Site | Contato geral Nextcard | Funil Nextcard |

Etapa de entrada: `NOVOS LEADS RD`.

## Configuração local

1. Copie `.env.example` para `.env.local`.
2. Preencha `KOMMO_LONG_LIVED_TOKEN` localmente. Nunca envie ou versione o token.
3. Crie um segredo longo e aleatório para `RD_WEBHOOK_SECRET`.
4. Mantenha `KOMMO_SYNC_ENABLED=false` durante a captura inicial.
5. Execute `npm run dev`.

Webhook local:

```text
POST http://localhost:3000/api/webhooks/rd?secret=SEU_SEGREDO
```

O mesmo endpoint aceita a ação **Enviar Leads para Integração** dos Fluxos de Automação do RD. Nesse formato, informe a rota pela URL:

```text
Site:     /api/webhooks/rd?secret=SEGREDO&route=totem-site
Leadster: /api/webhooks/rd?secret=SEGREDO&route=totem-leadster
LP RD:    /api/webhooks/rd?secret=SEGREDO&route=totem-lp
Geral:    /api/webhooks/rd?secret=SEGREDO&route=totem-geral
Catracas: /api/webhooks/rd?secret=SEGREDO&route=catracas-geral
Comandas: /api/webhooks/rd?secret=SEGREDO&route=comandas-geral
Teloos:   /api/webhooks/rd?secret=SEGREDO&route=teloos-geral
Contato Nextcard: /api/webhooks/rd?secret=SEGREDO&route=nextcard-contato-site
```

Se o validador de URL do RD rejeitar parâmetros, use o formato equivalente sem query string:

```text
https://rd-kommo.vercel.app/api/webhooks/rd/totem-geral/SEGREDO
https://rd-kommo.vercel.app/api/webhooks/rd/catracas-geral/SEGREDO
https://rd-kommo.vercel.app/api/webhooks/rd/comandas-geral/SEGREDO
https://rd-kommo.vercel.app/api/webhooks/rd/teloos-geral/SEGREDO
https://rd-kommo.vercel.app/api/webhooks/rd/nextcard-contato-site/SEGREDO
```

Cada fluxo deve ter como critério a conversão correspondente à sua origem.

Em produção, cadastre no RD a URL HTTPS fornecida pela Vercel, incluindo o segredo. O endpoint de saúde é `/api/health`.

## Implantação segura

Na Vercel, configure as variáveis de ambiente da `.env.example`. Primeiro publique com `KOMMO_SYNC_ENABLED=false`, envie uma conversão de teste por cada origem e confira no log apenas as chaves capturadas. Depois ajuste os nomes de campos necessários e altere para `true`.

O serviço nunca registra nome, e-mail, telefone ou os valores dos campos personalizados. Os logs contêm apenas o identificador do evento e os nomes das chaves recebidas.

## Comportamento

- Eventos desconhecidos são ignorados.
- O contato é localizado por telefone ou e-mail com conferência exata.
- Telefones brasileiros são normalizados para `+55`.
- Um contato existente é atualizado.
- Uma oportunidade Totem aberta no mesmo funil é atualizada.
- Uma oportunidade Catracas aberta no mesmo funil é atualizada.
- Uma oportunidade Comandas aberta no mesmo funil é atualizada.
- Uma oportunidade Teloos aberta no Funil Teloos é atualizada.
- Sem oportunidade aberta, uma nova é criada em `NOVOS LEADS RD`.
- Campos personalizados são encontrados pelo nome; campos ausentes geram aviso sem bloquear o lead.
- O campo `Foco do Cliente` recebe `Totem`, `Catraca`, `Comanda` ou `Teloos`, conforme o produto.
- No formulário geral da Nextcard, `De qual Estado você é?` também corresponde ao campo `De qual Estado você fala?` da Kommo.
