// 通知対象となる銘柄を抽出
// 各シートのH2セルに計算式が存在している
function findSheetsToBeNotified(): GoogleAppsScript.Spreadsheet.Sheet[] {
  // getValue()の戻り値はbooleanであると保証されないため、trueとの厳密比較を行う
  return activeSpreadSheet
    .getSheets()
    .filter((sheet) => sheet.getRange("H2").getValue() === true);
}

// ひとまず全件返却してみる
// ASK against AVGの低い順に並べ替えて返却
function selectAllSheetsOrderByAskRate(): GoogleAppsScript.Spreadsheet.Sheet[] {
  return [
    ...activeSpreadSheet
      .getSheets()
      .filter((sheet) => !settingSheetNameRegex.test(sheet.getSheetName())),
  ].sort((a, b) => a.getRange(2, 6).getValue() - b.getRange(2, 6).getValue());
}

// メール送信時の件名
// 注目銘柄の有無で分岐
function buildSubject(tickers: GoogleAppsScript.Spreadsheet.Sheet[]) {
  const hasTickerToBeNotified = tickers.length > 0;

  return `${
    hasTickerToBeNotified ? "【注目銘柄あり】 " : ""
  }RI-kyu-shira-cha (#E6E3C5) / 50days-averages${
    hasTickerToBeNotified ? "" : " (注目銘柄なし)"
  }`;
}

function buildSheetUrl(sheet: GoogleAppsScript.Spreadsheet.Sheet) {
  return `${activeSpreadSheetUrl}#gid=${sheet.getSheetId()}`;
}

function buildFinanceUrl(ticker: string) {
  return `https://finance.yahoo.com/quote/${ticker}/chart`;
}

function composeText(sheets: GoogleAppsScript.Spreadsheet.Sheet[]) {
  return sheets
    .map((sheet) => {
      const sheetName = sheet.getSheetName();
      const refDate = sheet.getRange(2, 1).getDisplayValue() as string;
      const askAgainstAvg = sheet.getRange(2, 6).getDisplayValue() as string;
      const shouldNotify = sheet.getRange(2, 8).getDisplayValue() as string;

      return `======\n=${sheetName}\n======\n${refDate}\nASK against AVG: ${askAgainstAvg}\nShould Notify: ${shouldNotify}\n${buildSheetUrl(
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

  // TODO ここでGOOGLEFINANCE最新化が必要かもしれない
  const sheetsToBeNotified = findSheetsToBeNotified();
  const allSheets = selectAllSheetsOrderByAskRate();
  const subject = buildSubject(sheetsToBeNotified);
  const composedText = composeText(allSheets);

  Logger.log(
    `mail to be sent... notifiedEmail:${notifiedEmail} subject:${subject} composedText:${composedText}`
  );
  GmailApp.sendEmail(notifiedEmail, subject, composedText);
}
