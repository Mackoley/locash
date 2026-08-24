/**
 * ==============================================================================
 * LOCASH - INTEGRAÇÃO GMAIL x AUTOBILLS (NEOENERGIA COELBA)
 * ==============================================================================
 * 
 * Este script roda no Google Apps Script (100% gratuito) dentro do seu Gmail.
 * Ele monitora automaticamente e-mails da Neoenergia com faturas em PDF,
 * envia para a IA do LOCASH processar e marca o e-mail como processado.
 * 
 * COMO CONFIGURAR EM 2 MINUTOS:
 * 1. Acesse https://script.google.com no seu navegador (logado no Gmail).
 * 2. Clique em "+ Novo Projeto".
 * 3. Apague qualquer código existente e Cole TODO este arquivo lá.
 * 4. Clique no ícone de "Salvar" (disquete) e depois no botão "Executar" (▶ Run).
 * 5. O Google vai pedir autorização para ler seus e-mails: clique em "Avançado" > "Acessar (não seguro)".
 * 6. Para deixar 100% automático todo dia/hora:
 *    - Clique no ícone de Relógio ("Acionadores / Triggers") no menu lateral esquerdo.
 *    - Clique em "+ Adicionar Acionador".
 *    - Escolha a função: "processarFaturasNeoenergia".
 *    - Origem do evento: "Baseado no tempo" > "Temporizador de horas" > "A cada 1 hora" (ou diariamente).
 *    - Salve! Pronto, nunca mais precisará abrir faturas manualmente.
 */

// CONFIGURAÇÕES DO LOCASH
const LOCASH_CONFIG = {
  // URL do Webhook do seu app LOCASH na Vercel
  WEBHOOK_URL: 'https://locash-delta.vercel.app/api/energy-inbox',
  
  // Chave de segurança do webhook
  SECRET: 'locash_energy_2026',
  
  // Nome da etiqueta (label) que o script colocará nos e-mails já lidos
  PROCESSED_LABEL: 'LOCASH-Processado',
  
  // Termo de busca no Gmail para encontrar faturas da Neoenergia / Coelba
  GMAIL_QUERY: 'from:(neoenergia OR coelba) has:attachment filename:pdf -label:LOCASH-Processado'
};

/**
 * Função Principal de Varredura e Ingestão Automática
 */
function processarFaturasNeoenergia() {
  Logger.log('Iniciando varredura de faturas Neoenergia...');
  
  // 1. Obter ou criar a etiqueta no Gmail
  let label = GmailApp.getUserLabelByName(LOCASH_CONFIG.PROCESSED_LABEL);
  if (!label) {
    label = GmailApp.createLabel(LOCASH_CONFIG.PROCESSED_LABEL);
  }

  // 2. Buscar threads de e-mail que atendem aos critérios
  const threads = GmailApp.search(LOCASH_CONFIG.GMAIL_QUERY, 0, 10);
  Logger.log(`Encontradas ${threads.length} mensagens para processar.`);

  if (threads.length === 0) {
    Logger.log('Nenhuma fatura nova pendente no momento.');
    return;
  }

  // 3. Iterar por cada e-mail
  for (let i = 0; i < threads.length; i++) {
    const thread = threads[i];
    const messages = thread.getMessages();

    for (let j = 0; j < messages.length; j++) {
      const msg = messages[j];
      const attachments = msg.getAttachments();

      for (let k = 0; k < attachments.length; k++) {
        const att = attachments[k];
        const contentType = att.getContentType();
        const filename = att.getName();

        // Verificar se é arquivo PDF
        if (contentType === 'application/pdf' || filename.toLowerCase().endsWith('.pdf')) {
          Logger.log(`Processando anexo: ${filename} do remetente ${msg.getFrom()}...`);

          const fileBytes = att.getBytes();
          const fileBase64 = Utilities.base64Encode(fileBytes);

          // Preparar payload para o Webhook LOCASH
          const payload = {
            secret: LOCASH_CONFIG.SECRET,
            fileBase64: fileBase64,
            filename: filename,
            sender: msg.getFrom(),
            subject: msg.getSubject(),
            receivedAt: msg.getDate().toISOString()
          };

          const options = {
            method: 'post',
            contentType: 'application/json',
            payload: JSON.stringify(payload),
            muteHttpExceptions: true
          };

          try {
            const response = UrlFetchApp.fetch(LOCASH_CONFIG.WEBHOOK_URL, options);
            const statusCode = response.getResponseCode();
            const responseText = response.getContentText();

            if (statusCode >= 200 && statusCode < 300) {
              Logger.log(`✅ Fatura ${filename} processada com sucesso no LOCASH!`);
              Logger.log(`Resposta: ${responseText}`);
            } else {
              Logger.log(`⚠️ Erro ao enviar fatura (Status ${statusCode}): ${responseText}`);
            }
          } catch (err) {
            Logger.log(`❌ Falha na conexão com o Webhook: ${err}`);
          }
        }
      }
    }

    // 4. Marcar thread com a etiqueta para não reprocessar
    thread.addLabel(label);
    thread.markRead();
  }

  Logger.log('Varredura finalizada com sucesso!');
}

/**
 * Função Utilitária para Testar a Conexão com o Webhook
 */
function testarConexaoLocash() {
  const options = {
    method: 'get',
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch(LOCASH_CONFIG.WEBHOOK_URL, options);
  Logger.log(`Status Conexão: ${response.getResponseCode()}`);
  Logger.log(`Conteúdo: ${response.getContentText()}`);
}
