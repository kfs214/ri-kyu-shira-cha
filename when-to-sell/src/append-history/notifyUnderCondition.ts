function notifyUnderCondition(history: History) {
  const { ticker, date, unit, price, tradeType } = history;

  const notifiedEmail =
    PropertiesService.getScriptProperties().getProperty("NOTIFIED_EMAIL");
  if (!notifiedEmail) {
    Logger.log("failed to get notified email address...");
    return;
  }

  if (tradeType === TradeType.BUY) {
    const subject =
      "約定した銘柄があります（購入）：RI-kyu-shira-cha (#E6E3C5) / when-to-sell";
    const composedText = [ticker, date, unit, price].join(", ");
    GmailApp.sendEmail(notifiedEmail, subject, composedText);
  }
}
