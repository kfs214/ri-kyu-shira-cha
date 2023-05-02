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
const activeSpreadSheetUrl = activeSpreadSheet.getUrl();

// ================
// セル番地
// ================
const refDateNotation = "A2";
const shouldNotifyNotation = "J2";
const askAgainstAvgNotation = "H2";
