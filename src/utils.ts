// =============
// 正規表現・定数
// =============
const settingSheetNameRegex = /^__[A-Z]+__$/;
const TEMPLATE = "__TEMPLATE__";
const TICKERS = "__TICKERS__";

// ================
// SpreadsheetApp
// ================
const activeSpreadSheet = SpreadsheetApp.getActiveSpreadsheet();

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

// テンプレートシート・設定シート以外を全て削除
// テンプレートシート・設定シート： `__TEMPLATE__` 等
function deleteMemberSheets() {
  activeSpreadSheet.getSheets().forEach((sheet) => {
    if (settingSheetNameRegex.test(sheet.getSheetName())) return;

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
