# 🏦 CorretoraIPRO – API Oficial

API moderna desenvolvida em **Next.js 14**, integrada com **Stripe** e **Supabase**, projetada para operações seguras e escaláveis, incluindo:

- Registro e controle de créditos  
- Cálculo de saldo  
- Registro de uso  
- Processamento de Webhooks do Stripe  
- Integração futura com sistemas externos

---

## 🚀 Tecnologias Utilizadas

- **Next.js 14 (Route Handlers)**
- **TypeScript (opcional, desativado neste projeto)**
- **Stripe (Checkout + Webhooks)**
- **Supabase (Service Role + Database)**
- **Vercel (Deploy e Webhooks)**

---

## 📁 Estrutura de Pastas
/
├── app/api/
│ └── credits/
│ ├── add/route.ts
│ ├── balance/route.ts
│ └── use/route.ts
│
├── app/api/payments/
│ └── stripe-webhook/route.ts
│
├── package.json
├── next.config.js
└── .env (não versionado)


---

## 🔐 Variáveis de Ambiente

Crie um arquivo **`.env.example`** na raiz:

```env
# SUPABASE
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# STRIPE
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# NEXTJS
NODE_ENV=production
