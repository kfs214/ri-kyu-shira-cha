// =============
// 定数
// =============

// ヘッダ行・空白行の行数
const headerRowLength = 2;

// 抽出範囲の列数
const pluckedColumnLength = 6;

// 通知要否変数の位置
// 抽出範囲内で何列目か
// 「0」始まり
const shouldNotifyColumnIndex = 5;

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
// 明示的な最新化要否の判定のため、全件をbidと共に返却
function findTickersToBeNotified(): string[] {
  const lastRowIndex = activeSheet.getLastRow();

  return (
    activeSheet
      .getRange(3, 3, lastRowIndex - headerRowLength, pluckedColumnLength)
      .getDisplayValues()
      // .filter((rowValues) => rowValues[shouldNotifyColumnIndex])
      // .map(([ticker]) => ticker);
      .map((rowValues) => {
        const ticker = rowValues[0];
        const bid = rowValues[3];

        return `${ticker}: ${bid}`;
      })
  );
}

// 通知すべき銘柄があるか判定
// 暫定的に全件返却にしているため、件名の出し分けで使用
function hasTickersToBeNotified() {
  const lastRowIndex = activeSheet.getLastRow();

  return activeSheet
    .getRange(3, 3, lastRowIndex - headerRowLength, pluckedColumnLength)
    .getValues()
    .filter((rowValues) => rowValues[shouldNotifyColumnIndex])
    .flat() as string[];
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
  const subject = buildSubject(hasTickersToBeNotified());
  const composedText = tickersToBeNotified.join("\n");

  Logger.log(
    `mail to be sent... notifiedEmail:${notifiedEmail} subject:${subject} composedText:${composedText}`
  );
  GmailApp.sendEmail(notifiedEmail, subject, composedText);
}
