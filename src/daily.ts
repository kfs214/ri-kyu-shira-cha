// 通知対象となる銘柄を抽出
// 各シートのH2セルに計算式が存在している
function findSheetsToBeNotified(): GoogleAppsScript.Spreadsheet.Sheet[] {
  // getValue()の戻り値はbooleanであると保証されないため、trueとの厳密比較を行う
  return activeSpreadSheet
    .getSheets()
    .filter((sheet) => sheet.getRange("H2").getValue() === true);
}

// メール送信時の件名
// 注目銘柄がある場合のみ、文言を付加
function buildSubject(hasTickerToBeNotified: boolean) {
  return `${
    hasTickerToBeNotified ? "【注目銘柄あり】 " : ""
  }RI-kyu-shira-cha (#E6E3C5)`;
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

      return `======\n=${sheetName}\n======\n${buildSheetUrl(
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
  const subject = buildSubject(findSheetsToBeNotified.length > 0);
  const composedText = composeText(sheetsToBeNotified);

  Logger.log(
    `mail to be sent... notifiedEmail:${notifiedEmail} subject:${subject} composedText:${composedText}`
  );
  GmailApp.sendEmail(notifiedEmail, subject, composedText);
}
