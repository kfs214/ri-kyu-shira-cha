// ================
// formulas
// ================

// シート名を取得
function sheetName() {
  return activeSpreadSheet.getActiveSheet().getName();
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

// シートのtickerからシート作成
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
  const tickersRange = tickersSheet.getRange(1, 1, lastRowIndex);
  const tickers = tickersRange.getValues().flat() as string[];
  Logger.log({ tickers });

  // tickersの名前のsheetを追加
  tickers.forEach((ticker) => {
    Logger.log(`${ticker} to be added...`);
    const copiedSheet = templateSheet.copyTo(activeSpreadSheet).setName(ticker);
    copiedSheet.insertRows(1, 1);
    copiedSheet.deleteRows(1, 1);
  });
}
