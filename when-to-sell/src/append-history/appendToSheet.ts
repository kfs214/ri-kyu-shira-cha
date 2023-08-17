function appendToSheet(history: History) {
  const { ticker, date, price } = history;

  const usdHistorySheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(
    USD_HISTORY_SHEET_NAME
  );
  if (!usdHistorySheet) throw new Error("sheet not found!");

  // 元々の最終行。
  const filledLastRow = usdHistorySheet.getLastRow();
  usdHistorySheet.appendRow(["", ticker, date, price]);
  // 行追加後の最終行。
  const addedLastRow = usdHistorySheet.getLastRow();

  // オートフィル元の範囲。元の最終行1行。
  const autofillReferenceRange = usdHistorySheet.getRange(
    filledLastRow,
    colAutofillFrom,
    1,
    colAutofillNum
  );

  // オートフィル対象の範囲。増えた分の行数。
  const autofillWrittenRange = usdHistorySheet.getRange(
    filledLastRow,
    colAutofillFrom,
    addedLastRow - filledLastRow + 1,
    colAutofillNum
  );

  // 増えた行にオートフィル適用
  autofillReferenceRange.autoFill(
    autofillWrittenRange,
    SpreadsheetApp.AutoFillSeries.DEFAULT_SERIES
  );

  // TODO 書式を上からコピー
}
