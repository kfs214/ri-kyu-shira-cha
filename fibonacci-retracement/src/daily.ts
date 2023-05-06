// 通知対象となる銘柄を抽出
function filterSheetsByAddress(
  address: string
): GoogleAppsScript.Spreadsheet.Sheet[] {
  // getValue()の戻り値はbooleanであると保証されないため、trueとの厳密比較を行う
  return getAllMemberSheets().filter(
    (sheet) => sheet.getRange(address).getValue() === true
  );
}

// メール送信時の件名
// 注目銘柄の有無で分岐
function buildSubject(tickers: GoogleAppsScript.Spreadsheet.Sheet[]) {
  const hasTickerToBeNotified = tickers.length > 0;

  return `${
    hasTickerToBeNotified ? "【注目銘柄あり】 " : ""
  }RI-kyu-shira-cha (#E6E3C5) / fibonacci-retracement${
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
      const refDate = sheet
        .getRange(refDateNotation)
        .getDisplayValue() as string;
      const shouldNotify = sheet
        .getRange(shouldNotifyNotation)
        .getDisplayValue() as string;
      const shouldSell = sheet
        .getRange(shouldSellNotation)
        .getDisplayValue() as string;
      const shouldBuy = sheet
        .getRange(shouldBuyNotation)
        .getDisplayValue() as string;

      return `======
=${sheetName}
======
${refDate}
Should Notify: ${shouldNotify}
Should Sell: ${shouldSell}
Should Buy: ${shouldBuy}
${buildSheetUrl(sheet)}
${buildFinanceUrl(sheetName)}`;
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

  //
  // 通知内容を生成
  //

  // 通知対象・売る銘柄・買う銘柄、それぞれシート抽出
  const sheetsToBeNotified = filterSheetsByAddress(shouldNotifyNotation);
  const sheetsToSell = filterSheetsByAddress(shouldSellNotation);
  const sheetsToBuy = filterSheetsByAddress(shouldBuyNotation);

  // 全件取得
  const allSheets = getAllMemberSheets();

  // 件名生成
  const subject = buildSubject(sheetsToBeNotified);

  // 通知対象・売る銘柄・買う銘柄、それぞれ文字列生成
  const composedSheetsToSell = composeText(sheetsToSell);
  const composedSheetsToBuy = composeText(sheetsToBuy);
  const composedAllSheets = composeText(allSheets);

  const composedText = `=========================
to sell
=========================
${composedSheetsToSell}


=========================
to buy
=========================
${composedSheetsToBuy}


=========================
all sheets
=========================
${composedAllSheets}`;

  Logger.log(
    `mail to be sent... notifiedEmail:${notifiedEmail} subject:${subject} composedText:${composedText}`
  );
  GmailApp.sendEmail(notifiedEmail, subject, composedText);
}
