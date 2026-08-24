/**
 * LOCASH - INTEGRAÇÃO GMAIL x AUTOBILLS (NEOENERGIA COELBA) - V2.1 (LOGS DETALHADOS)
 */
const LOCASH_CONFIG = {
  WEBHOOK_URL: 'https://locash-delta.vercel.app/api/energy-inbox',
  SECRET: 'locash_energy_2026',
  PROCESSED_LABEL: 'LOCASH-Processado',
  // Busca ampla: de neoenergia/coelba, com anexo PDF, sem a etiqueta de processado
  GMAIL_QUERY: 'from:(neoenergia OR coelba) has:attachment filename:pdf -label:LOCASH-Processado'
};

function processarFaturasNeoenergia() {
  Logger.log('🔍 Executando busca com a query: ' + LOCASH_CONFIG.GMAIL_QUERY);
  
  let label = GmailApp.getUserLabelByName(LOCASH_CONFIG.PROCESSED_LABEL);
  if (!label) {
    label = GmailApp.createLabel(LOCASH_CONFIG.PROCESSED_LABEL);
    Logger.log('Criada nova etiqueta: ' + LOCASH_CONFIG.PROCESSED_LABEL);
  }

  const threads = GmailApp.search(LOCASH_CONFIG.GMAIL_QUERY, 0, 10);
  Logger.log('📊 Quantidade de conversas encontradas: ' + threads.length);

  if (threads.length === 0) {
    Logger.log('ℹ️ Nenhuma conversa pendente encontrada sem a etiqueta.');
    return;
  }

  for (let i = 0; i < threads.length; i++) {
    const thread = threads[i];
    const subject = thread.getFirstMessageSubject();
    Logger.log(`\n📌 [Conversa ${i + 1}/${threads.length}] Assunto: "${subject}"`);

    const messages = thread.getMessages();
    Logger.log(`Mensagens nesta conversa: ${messages.length}`);
    
    let sentCount = 0;

    // Processar apenas a última mensagem recebida da conversa
    for (let j = messages.length - 1; j >= 0; j--) {
      const msg = messages[j];
      const attachments = msg.getAttachments();

      for (let k = 0; k < attachments.length; k++) {
        const att = attachments[k];
        const filename = att.getName();

        if (att.getContentType() === 'application/pdf' || filename.toLowerCase().endsWith('.pdf')) {
          Logger.log(`📄 Enviando anexo: ${filename} (Remetente: ${msg.getFrom()})...`);

          const payload = {
            secret: LOCASH_CONFIG.SECRET,
            fileBase64: Utilities.base64Encode(att.getBytes()),
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
            const resp = UrlFetchApp.fetch(LOCASH_CONFIG.WEBHOOK_URL, options);
            Logger.log(`✅ Status: ${resp.getResponseCode()} | Resposta: ${resp.getContentText()}`);
            sentCount++;
          } catch (err) {
            Logger.log(`❌ Erro no envio: ${err}`);
          }
          break; // Envia apenas a fatura mais recente da conversa
        }
      }
      if (sentCount > 0) break;
    }

    // Marca a conversa com a etiqueta para não repetir
    thread.addLabel(label);
    thread.markRead();
    Logger.log('🏷️ Etiqueta LOCASH-Processado aplicada à conversa.');
  }

  Logger.log('\n🏁 Processamento concluído com sucesso!');
}

/**
 * Função para Limpar Todas as Etiquetas do Gmail se quiser reprocessar tudo do zero
 */
function resetarEtiquetasParaTeste() {
  const label = GmailApp.getUserLabelByName(LOCASH_CONFIG.PROCESSED_LABEL);
  if (label) {
    const threads = label.getThreads();
    Logger.log(`Removendo etiqueta de ${threads.length} conversas para permitir novo teste...`);
    for (let i = 0; i < threads.length; i++) {
      threads[i].removeLabel(label);
    }
    Logger.log('✅ Todas as etiquetas foram removidas! Agora você pode rodar a função processarFaturasNeoenergia.');
  } else {
    Logger.log('Nenhuma etiqueta encontrada.');
  }
}
