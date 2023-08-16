import { extractTicker } from "../util";
import { expect, it, describe } from "vitest";

const mailBody = `苗字　名前 様

ほにゃららの注文が約定しました。

注文番号：0123
銘柄名（銘柄コード）：某社（WWWW）
口座・売買：特定・買付
決済方法：円貨
約定単価：888米ドル
約定数量：1株（口）
約定日時：2023/8/15 22:30

約定は一部約定の場合があります。
詳細は約定照会画面でご確認ください。

■ほにゃらら取引の約定照会
＜ウェブ＞
xxx

＜xxx＞
ログイン後、xxx

＜xxx＞
ログイン後、xxx

＜xxx＞
ログイン後、xxx

■本メールの設定の確認・変更（配信・停止）
PCサイトにログイン後、xxx
http://www.xxx

────────────────────────
このメールについてのご質問等は、xxxまでお気軽にお問い合わせください。
xxx
フリーダイヤル：0120-xxx-xxx
携帯電話から：03-xxxx-xxxx(通話料有料)
受付時間　平日8:30-17:00 (土日祝・年末年始を除く)
https://www.xxx.xxx/web/support/
────────────────────────
xxx株式会社
`;

describe("extractTicker", () => {
  describe("正常系", () => {
    it("銘柄が抽出できる ", () => {
      const actual = extractTicker(mailBody);
      expect(actual).toBe("某社（WWWW）");
    });
  });

  describe("異常系", () => {
    it("銘柄名の行が見つからない場合、例外送出して終了", () => {
      const mailBodyWoTickerRow = `注文番号：0123
口座・売買：特定・買付
決済方法：円貨
      `;

      expect(() => {
        extractTicker(mailBodyWoTickerRow);
      }).toThrow();
    });

    it("銘柄名のパースに失敗した場合、例外送出して終了", () => {
      const mailBodyWoTickerRow = `注文番号：0123
銘柄名（銘柄コード）某社（WWWW）
口座・売買：特定・買付
決済方法：円貨
      `;

      expect(() => {
        extractTicker(mailBodyWoTickerRow);
      }).toThrow();
    });
  });
});
