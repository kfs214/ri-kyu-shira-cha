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
      const shouldBuy = sheet
        .getRange(shouldBuyNotation)
        .getDisplayValue() as string;

      return `======
=${sheetName}
======
${refDate}
Should Buy: ${shouldBuy}`;
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

  //
  // 通知内容を生成
  //

  // 買う銘柄の通知対象シート抽出
  const sheetsToBuy = filterSheetsByAddress(shouldBuyNotation);

  // 件名生成
  const subject = buildSubject(sheetsToBuy);

  // それぞれ文字列生成
  const composedSheetsToBuy = composeText(sheetsToBuy);
  const composedText = `
=========================
to buy
=========================
${composedSheetsToBuy}

`;

  Logger.log(
    `mail to be sent... notifiedEmail:${notifiedEmail} subject:${subject} composedText:${composedText}`
  );
  GmailApp.sendEmail(notifiedEmail, subject, composedText);
}
