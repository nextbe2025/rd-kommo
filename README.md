# Integração RD Station → Kommo

Recebe conversões do RD Station Marketing e cria ou atualiza contatos e oportunidades na Kommo.

## Rotas iniciais

| `event_identifier` do RD | Origem | Produto | Destino |
|---|---|---|---|
| `[FORM] - Totem de Autoatendimento` | Site | Totem de Autoatendimento | Funil Nextcard |
| `[LEADSTER] - LP Totem` | Leadster | Totem de Autoatendimento | Funil Nextcard |
| `totem-de-autoatendimento` | Landing Page | Totem de Autoatendimento | Funil Nextcard |

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
```

Se o validador de URL do RD rejeitar parâmetros, use o formato equivalente sem query string:

```text
https://rd-kommo.vercel.app/api/webhooks/rd/totem-geral/SEGREDO
```

Cada fluxo deve ter como critério a conversão correspondente à sua origem.

Em produção, cadastre no RD a URL HTTPS fornecida pela Vercel, incluindo o segredo. O endpoint de saúde é `/api/health`.

## Implantação segura

Na Vercel, configure as variáveis de ambiente da `.env.example`. Primeiro publique com `KOMMO_SYNC_ENABLED=false`, envie uma conversão de teste por cada origem e confira no log apenas as chaves capturadas. Depois ajuste os nomes de campos necessários e altere para `true`.

O serviço nunca registra nome, e-mail, telefone ou os valores dos campos personalizados. Os logs contêm apenas o identificador do evento e os nomes das chaves recebidas.

## Conectar a conta RD pela API

Crie um aplicativo privado do produto **RD Station Marketing** no App Publisher e cadastre exatamente esta callback:

```text
https://rd-kommo.vercel.app/api/auth/rd/callback
```

Na Vercel, configure `RD_CLIENT_ID`, `RD_CLIENT_SECRET` e `RD_REDIRECT_URI`. Após o redeploy, abra no navegador:

```text
https://rd-kommo.vercel.app/api/auth/rd/start?secret=SEU_RD_WEBHOOK_SECRET
```

Ao autorizar a conta correta, o callback troca o código por um token temporário e cria uma única assinatura `WEBHOOK.CONVERTED` limitada aos três eventos do Totem. Os tokens do RD não são retornados ao navegador nem armazenados pela aplicação.

## Comportamento

- Eventos desconhecidos são ignorados.
- O contato é localizado por telefone ou e-mail com conferência exata.
- Telefones brasileiros são normalizados para `+55`.
- Um contato existente é atualizado.
- Uma oportunidade Totem aberta no mesmo funil é atualizada.
- Sem oportunidade aberta, uma nova é criada em `ETAPA DE LEADS ENTRADA`.
- Campos personalizados são encontrados pelo nome; campos ausentes geram aviso sem bloquear o lead.
