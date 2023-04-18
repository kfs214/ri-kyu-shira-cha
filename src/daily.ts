// 通知対象となる銘柄を抽出
// 各シートのH2セルに計算式が存在している
function findTickersToBeNotified(): string[] {
  // getValue()の戻り値はbooleanであると保証されないため、trueとの厳密比較を行う
  return activeSpreadSheet
    .getSheets()
    .filter((sheet) => sheet.getRange("H2").getValue() === true)
    .map((sheet) => sheet.getSheetName());
}

// メール送信時の件名
// 注目銘柄がある場合のみ、文言を付加
function buildSubject(hasTickerToBeNotified: boolean) {
  return `${
    hasTickerToBeNotified ? "【注目銘柄あり】 " : ""
  }RI-kyu-shira-cha (#E6E3C5)`;
}

// メールで通知
// 通知先はScript Propertiesとして設定
function notifyByEmail() {
  const notifiedEmail =
    PropertiesService.getScriptProperties().getProperty("NOTIFIED_EMAIL");
  if (!notifiedEmail) {
    Logger.log("failed to get notified email address...");
    return;
  }

  const tickersToBeNotified = findTickersToBeNotified();
  const subject = buildSubject(tickersToBeNotified.length > 0);
  const composedText = tickersToBeNotified.join("\n");

  Logger.log(
    `mail to be sent... notifiedEmail:${notifiedEmail} subject:${subject} composedText:${composedText}`
  );
  GmailApp.sendEmail(notifiedEmail, subject, composedText);
}
