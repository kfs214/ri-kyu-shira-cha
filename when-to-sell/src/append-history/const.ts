const TradeType = {
  BUY: "BUY",
  SELL: "SELL",
} as const;
type TradeType = (typeof TradeType)[keyof typeof TradeType];
