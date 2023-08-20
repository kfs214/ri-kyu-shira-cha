// ================
// formulas
// ================

// シート名を取得
function sheetName() {
  return activeSpreadSheet.getActiveSheet().getName();
}

// タイムゾーンを指定し日付を取得
function todayByTimeZone(timeZone: string) {
  return Utilities.formatDate(new Date(), timeZone, "yyyy-MM-dd");
}

// ================
// utils
// ================

// テンプレートシート・設定シート以外を全て取得
// テンプレートシート・設定シート： `__TEMPLATE__` 等
function getAllMemberSheets() {
  return activeSpreadSheet
    .getSheets()
    .filter((sheet) => !settingSheetNameRegex.test(sheet.getSheetName()));
}

// テンプレートシート・設定シート以外を全て削除
// テンプレートシート・設定シート： `__TEMPLATE__` 等
function deleteMemberSheets() {
  getAllMemberSheets().forEach((sheet) => {
    Logger.log(`${sheet.getSheetName()} to be deleted...`);
    activeSpreadSheet.deleteSheet(sheet);
  });
}

// テンプレートシート・設定シート以外を全て最新化
// テンプレートシート・設定シート： `__TEMPLATE__` 等
// 最新のシート名を反映する場合・データを再取得する場合
function refreshAllMemberSheets(): void {
  Logger.log("refreshing all member sheets...");
  getAllMemberSheets().forEach((sheet) => {
    sheet.insertRows(1, 1);
    sheet.deleteRows(1, 1);
  });
  Logger.log("refreshing completed.");
}

// should be refreshed: TRUEのものを更新
// 実行時間制限を回避するための分割に使用
function refreshSheets(): void {
  const tickersSheet = activeSpreadSheet.getSheetByName(TICKERS);
  if (!tickersSheet) {
    Logger.log(`sheet not found: ${TICKERS}`);
    return;
  }

  // tickers取得
  const lastRowIndex = tickersSheet.getLastRow();
  const tickersRange = tickersSheet.getRange(2, 1, lastRowIndex, 4);
  const tickers = tickersRange
    .getValues()
    .map(([ticker, _, _1, shouldBeNotified]) => {
      if (!ticker || !shouldBeNotified) return;
      return ticker;
    })
    .filter((e) => e) as string[];

  Logger.log({ tickers });

  tickers.forEach((ticker) => {
    const sheet = activeSpreadSheet.getSheetByName(ticker);
    if (!sheet) return;
    sheet.insertRows(1, 1);
    sheet.deleteRows(1, 1);
  });
  Logger.log("refreshing completed.");
}

// 設定シートのtickerからシート作成
function copyTemplateByTickers() {
  // テンプレートシート・設定シートを取得
  const tickersSheet = activeSpreadSheet.getSheetByName(TICKERS);
  const templateSheet = activeSpreadSheet.getSheetByName(TEMPLATE);
  if (!tickersSheet || !templateSheet) {
    Logger.log(
      `sheet not found: ${tickersSheet ? "" : TICKERS} ${
        templateSheet ? "" : TEMPLATE
      }`
    );
    return;
  }

  // tickers取得
  const lastRowIndex = tickersSheet.getLastRow();

  // When the "numRows" argument is used, only a single column of data is returned.
  const tickersRange = tickersSheet.getRange(2, 1, lastRowIndex);
  const tickers = tickersRange.getValues().flat() as string[];
  Logger.log({ tickers });

  // tickersの名前のsheetを追加
  tickers.forEach((ticker) => {
    if (!ticker) return;
    Logger.log(`${ticker} to be added...`);
    templateSheet.copyTo(activeSpreadSheet).setName(ticker);
  });

  // シート名の変更を関数呼び出しに反映
  // 実行時間上限を回避するため、処理できる件数にフラグを立てておく
  refreshSheets();
}
