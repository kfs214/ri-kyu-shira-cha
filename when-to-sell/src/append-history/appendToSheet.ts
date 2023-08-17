function appendToSheet(history: History) {
  const { ticker, date, price, tradeType } = history;

  // TODO 売れました通知の場合は行削除
  if (tradeType !== TradeType.BUY) return;

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

  // 書式を上からコピー
  const formatCopiedFromRange = usdHistorySheet.getRange(
    filledLastRow,
    colFormatCopiedFrom,
    1,
    colFormatCopiedNum
  );

  const formatCopiedToRange = usdHistorySheet.getRange(
    addedLastRow,
    colFormatCopiedFrom,
    1,
    colFormatCopiedNum
  );

  formatCopiedFromRange.copyTo(formatCopiedToRange, { formatOnly: true });

  // 買い通知があったことをメール通知
  notifyUnderCondition(history);
}
