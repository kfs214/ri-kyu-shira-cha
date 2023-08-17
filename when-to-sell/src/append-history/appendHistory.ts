function findThreads(): GoogleAppsScript.Gmail.GmailThread[] {
  const threads = GmailApp.search(
    "from:(tradesys@rakuten-sec.co.jp) subject:(の注文が約定しました) newer_than:28h label:automation/処理待"
  );

  Logger.log(`found ${threads.length} threads`);

  return threads;
}

function handleThread(thread: GoogleAppsScript.Gmail.GmailThread) {
  const histories: History[] = thread
    .getMessages()
    .map((message) => message.getPlainBody())
    // TODO グローバルに展開されているはずだが？
    // TODO テストしたいので、exportしていてもGASでは参照できるやり方を探す
    .map((body) => parseMailBody(body));

  histories.forEach(appendToSheet);

  Logger.log(`histories added - threadId: ${thread.getId()}`);

  try {
    const completedLabel = GmailApp.getUserLabelByName("automation/処理済");
    thread.addLabel(completedLabel);

    const queueLabel = GmailApp.getUserLabelByName("automation/処理待");
    thread.removeLabel(queueLabel);

    thread.markRead();
  } catch (error) {
    Logger.log("failed to update label.");
  }
}

function appendHistory() {
  const threads = findThreads();

  if (threads.length === 0) {
    Logger.log(`thread not found. ending process...`);
    return;
  }

  threads.forEach(handleThread);
}
