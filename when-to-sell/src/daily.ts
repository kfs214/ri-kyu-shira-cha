// =============
// 定数
// =============

// ヘッダ行・空白行の行数
const headerRowLength = 2;

// 抽出範囲の列数
const pluckedColumnLength = 5;

// 通知要否変数の位置
// 抽出範囲内で何列目か
// 「0」始まり
const shouldNotifyColumnIndex = 4;

// ================
// SpreadsheetApp
// ================
const activeSpreadSheet = SpreadsheetApp.getActiveSpreadsheet();
const activeSheet = activeSpreadSheet.getActiveSheet();

// ============
// functions
// ============

// 通知対象となる銘柄を抽出
// G列に通知要否を格納
function findTickersToBeNotified(): string[] {
  const lastRowIndex = activeSheet.getLastRow();

  return activeSheet
    .getRange(3, 3, lastRowIndex - headerRowLength, pluckedColumnLength)
    .getValues()
    .filter((rowValues) => rowValues[shouldNotifyColumnIndex])
    .map(([ticker]) => ticker);
}

// メール送信時の件名
// 注目銘柄の有無で分岐
function buildSubject(tickers: string[]) {
  const hasTickerToBeNotified = tickers.length > 0;

  return `${
    hasTickerToBeNotified ? "【注目銘柄あり】 " : ""
  }RI-kyu-shira-cha (#E6E3C5) / when-to-sell${
    hasTickerToBeNotified ? "" : " (注目銘柄なし)"
  }`;
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
  const tickersToBeNotified = findTickersToBeNotified();
  const subject = buildSubject(tickersToBeNotified);
  const composedText = tickersToBeNotified.join("\n");

  Logger.log(
    `mail to be sent... notifiedEmail:${notifiedEmail} subject:${subject} composedText:${composedText}`
  );
  GmailApp.sendEmail(notifiedEmail, subject, composedText);
}
