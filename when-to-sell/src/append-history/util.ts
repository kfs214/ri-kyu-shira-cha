export function extractTicker(mailBody: string): string {
  const rowRegex = /銘柄名（銘柄コード）：.+/;

  const [tickerRow] = mailBody.match(rowRegex) ?? [];
  if (!tickerRow) throw new Error("failed to extract ticker");

  const tickerStr = tickerRow.split("：")[1];
  return tickerStr;
}
