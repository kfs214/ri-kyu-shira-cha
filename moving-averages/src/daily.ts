// 通知対象となる銘柄を抽出
function findSheetsToBeNotified(): GoogleAppsScript.Spreadsheet.Sheet[] {
  // getValue()の戻り値はbooleanであると保証されないため、trueとの厳密比較を行う
  return getAllMemberSheets().filter(
    (sheet) => sheet.getRange(shouldNotifyNotation).getValue() === true
  );
}

// ひとまず全件返却してみる
// GC trueを最初に
function selectAllSheetsOrderByGC(): GoogleAppsScript.Spreadsheet.Sheet[] {
  return [...getAllMemberSheets()].sort((a) =>
    a.getRange(shouldNotifyNotation).getValue() ? -1 : 0
  );
}

// メール送信時の件名
// 注目銘柄の有無で分岐
function buildSubject(tickers: GoogleAppsScript.Spreadsheet.Sheet[]) {
  const hasTickerToBeNotified = tickers.length > 0;

  return `${
    hasTickerToBeNotified ? "【注目銘柄あり】 " : ""
  }RI-kyu-shira-cha (#E6E3C5) / moving-averages${
    hasTickerToBeNotified ? "" : " (注目銘柄なし)"
  }`;
}

function buildSheetUrl(sheet: GoogleAppsScript.Spreadsheet.Sheet) {
  return `${activeSpreadSheetUrl}#gid=${sheet.getSheetId()}`;
}

function buildFinanceUrl(ticker: string) {
  const tickerSplit = ticker.split(":");
  const symbol = tickerSplit[1] ?? tickerSplit[0];
  return `https://finance.yahoo.com/quote/${symbol}/chart`;
}

function composeText(sheets: GoogleAppsScript.Spreadsheet.Sheet[]) {
  return sheets
    .map((sheet) => {
      const sheetName = sheet.getSheetName();
      const refDate = sheet
        .getRange(refDateNotation)
        .getDisplayValue() as string;
      const shortAgainstLong = sheet
        .getRange(shortAgainstLongNotation)
        .getDisplayValue() as string;
      const shouldNotify = sheet
        .getRange(shouldNotifyNotation)
        .getDisplayValue() as string;

      return `======\n=${sheetName}\n======\n${refDate}\n10 against 50: ${shortAgainstLong}\nShould Notify: ${shouldNotify}\n${buildSheetUrl(
        sheet
      )}\n${buildFinanceUrl(sheetName)}`;
    })
    .join("\n\n\n");
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

  // データを最新化
  // refreshAllMemberSheets();

  // 通知内容を生成
  const sheetsToBeNotified = findSheetsToBeNotified();
  const allSheets = selectAllSheetsOrderByGC();
  const subject = buildSubject(sheetsToBeNotified);

  const composedSheetsToBeNotified = composeText(sheetsToBeNotified);
  const composedAllSheets = composeText(allSheets);
  const composedText = `${composedSheetsToBeNotified}


=========================
all sheets
=========================
${composedAllSheets}`;

  Logger.log(
    `mail to be sent... notifiedEmail:${notifiedEmail} subject:${subject} composedText:${composedText}`
  );
  GmailApp.sendEmail(notifiedEmail, subject, composedText);
}
