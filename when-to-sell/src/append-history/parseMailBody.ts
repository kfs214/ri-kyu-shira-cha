export function extractByRegex(mailBody: string, rowRegex: RegExp) {
  const [row] = mailBody.match(rowRegex);
  const str = row.split("：")[1];

  return str;
}

export function extractUnit(str: string) {
  const yenRegex = /\d円/;
  const usdRegex = /\d米ドル/;

  if (yenRegex.test(str)) return "JPY";
  if (usdRegex.test(str)) return "USD";

  throw new Error("");
}

export function extractTicker(mailBody: string): string {
  const rowRegex = /銘柄名（銘柄コード）：.+/;
  const tickerRegex = /(?<=（).+?(?=）)/;

  try {
    const descriptionRow = extractByRegex(mailBody, rowRegex);
    const [ticker] = descriptionRow.match(tickerRegex);

    if (!ticker) throw new Error("");

    return ticker;
  } catch (e) {
    throw new Error("failed to extract ticker");
  }
}

export function extractDate(mailBody: string): string {
  const rowRegex = /約定日時：.+/;

  try {
    return extractByRegex(mailBody, rowRegex);
  } catch (e) {
    throw new Error("failed to extract date");
  }
}

export function extractPrice(mailBody: string): {
  unit: string;
  price: string;
} {
  const rowRegex = /約定単価：.+/;

  try {
    const priceStr = extractByRegex(mailBody, rowRegex);
    const unit = extractUnit(priceStr);
    const [price] = priceStr.match(/\d+\.?\d*/);

    if (!price) throw new Error("");

    return { unit, price };
  } catch (e) {
    throw new Error("failed to extract price");
  }
}

export function extractTradeType(mailBody: string): TradeType {
  const rowRegex = /口座・売買：.+/;

  try {
    const row = extractByRegex(mailBody, rowRegex);
    const tradeTypeStr = row.split("・")[1];
    if (!tradeTypeStr) throw new Error("");

    switch (tradeTypeStr) {
      case "売付":
        return TradeType.SELL;

      case "買付":
        return TradeType.BUY;

      default:
        throw new Error("");
    }
  } catch (e) {
    throw new Error("failed to extract trade type");
  }
}

function parseMailBody(mailBody: string): History {
  const ticker = extractTicker(mailBody);
  const date = extractDate(mailBody);
  const { unit, price } = extractPrice(mailBody);
  const tradeType = extractTradeType(mailBody);

  return { ticker, date, unit, price, tradeType };
}
