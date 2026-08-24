# ⚡ LOCASH AutoBills - Arquitetura de Ingestão Automática de Faturas por E-mail (Gmail x IA Gemini x Webhook)

Este documento descreve a arquitetura completa do pipeline de automação para captura, leitura por IA e processamento de contas de consumo (energia elétrica, água, gás, telecom) direto da caixa de entrada do Gmail para qualquer aplicativo Web/SaaS.

---

## 🏛️ 1. Diagrama de Fluxo

```
[Concessionária (ex: Neoenergia Coelba)]
                │
                ▼ (Envia e-mail com fatura em PDF)
      [Caixa de Entrada Gmail]
                │
                ▼ (Google Apps Script - Gatilho por Tempo a cada 1h)
 [Filtro: from:neoenergia has:attachment -label:LOCASH-Processado]
                │
                ▼ (Converte PDF para Base64 + Monta Payload JSON)
     [Vercel Serverless Webhook /api/energy-inbox]
                │
                ▼ (Chamada Multimodal Google Gemini 3.6 Flash)
 [IA Vision: Extrai Conta Contrato, Instalação, Titular, Vencimento, Valor R$, kWh, Código de Barras e PIX]
                │
                ▼ (Retorno JSON Estruturado com 98%+ de Confiança)
  [LOCASH / Banco de Dados Supabase: Ingestão na Unidade Consumidora Correta]
                │
                ▼
 [Gmail: Marca thread com etiqueta 'LOCASH-Processado' e como lido (Anti-duplicidade)]
```

---

## 🔑 2. Componentes Principais

### A. Endpoint Serverless (`/api/energy-inbox.ts`)
- **Hospedagem:** Vercel Serverless Functions.
- **Segurança:** Autenticação via header `X-Locash-Secret` ou chave no body.
- **Motor de IA:** Google Gemini 3.6 Flash Multimodal API.
- **Payload aceito:**
  ```json
  {
    "secret": "locash_energy_2026",
    "fileBase64": "<base64_do_pdf>",
    "filename": "fatura.pdf",
    "sender": "cliente@neoenergiacoelba.com.br",
    "subject": "Fatura Digital"
  }
  ```

### B. Script de Monitoramento no Gmail (`google_apps_script_locash.js`)
- **Hospedagem:** Google Apps Script (Gratuito, sem servidor próprio).
- **Mecanismo Anti-Duplicidade:** Etiqueta `LOCASH-Processado` criada diretamente no Gmail.
- **Agendamento:** Temporizador de eventos do Google (Trigger) executando a cada 1 hora.

---

## 📋 3. Schema JSON Extraído pela IA

```json
{
  "providerName": "Neoenergia Coelba",
  "consumerUnit": "7068254234",
  "installationCode": "11180635",
  "holderName": "NOME DO CLIENTE",
  "billingPeriod": "07/2026",
  "dueDate": "2026-08-04",
  "consumptionKwh": 178,
  "amountTotal": 145.80,
  "barcode": "836000000018...",
  "pixCode": "00020101021226870014br.gov.bcb.pix...",
  "ocrConfidence": 98,
  "status": "PENDENTE"
}
```

---

## 🔄 4. Regras de Vinculação com Imóveis / Clientes

1. **Casamento por Unidade Consumidora (UC / Conta Contrato):**
   - O sistema busca o registro de imóvel cuja `consumerUnit === parsedBill.consumerUnit`.
   - Havendo correspondência, a fatura é anexada diretamente àquele imóvel.
2. **Fallback para Caixa de Entrada Inteligente (Inbox):**
   - Caso a Conta Contrato ainda não esteja cadastrada, a fatura fica em fila pendente para vinculação com 1 clique.
3. **Prevenção de Duplicidade:**
   - Hash SHA-256 gerado a partir do arquivo/conteúdo impede o reprocessamento da mesma fatura do mesmo mês.

---

## 🚀 5. Reutilização em Outros Aplicativos

Para replicar este mesmo ecossistema em qualquer outro sistema futuro:
1. Copiar o arquivo `api/energy-inbox.ts` para a pasta de APIs do novo projeto.
2. Configurar a variável de ambiente `VITE_GEMINI_API_KEY` com a chave do Google AI Studio.
3. No Google Apps Script do cliente, apontar a `WEBHOOK_URL` para o novo domínio.
