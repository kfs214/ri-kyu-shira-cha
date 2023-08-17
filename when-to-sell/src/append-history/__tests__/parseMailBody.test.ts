import {
  extractByRegex,
  extractTicker,
  extractDate,
  extractPrice,
  // parseMailBody,
} from "../parseMailBody";
import { expect, it, describe } from "vitest";

const mailBody = `苗字　名前 様

ほにゃららの注文が約定しました。

注文番号：0123
銘柄名（銘柄コード）：某社（WWWW）
口座・売買：特定・買付
決済方法：円貨
約定単価：888.12米ドル
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

describe("extractByRegex", () => {
  describe("正常系", () => {
    it("銘柄が抽出できる ", () => {
      const actual = extractByRegex(mailBody, /銘柄名（銘柄コード）：.+/);
      expect(actual).toBe("某社（WWWW）");
    });
  });

  describe("異常系", () => {
    it("銘柄名の行が見つからない場合、例外送出して終了", () => {
      const mailBodyWoExpectedRow = `注文番号：0123
口座・売買：特定・買付
決済方法：円貨
      `;

      expect(() => {
        extractByRegex(mailBodyWoExpectedRow, /銘柄名（銘柄コード）：.+/);
      }).toThrow();
    });

    it("銘柄名のパースに失敗した場合、例外送出して終了", () => {
      const mailBodyWithWrongFormat = `注文番号：0123
銘柄名（銘柄コード）某社（WWWW）
口座・売買：特定・買付
決済方法：円貨
      `;

      expect(() => {
        extractByRegex(mailBodyWithWrongFormat, /銘柄名（銘柄コード）：.+/);
      }).toThrow();
    });
  });
});

describe("extractTicker", () => {
  describe("正常系", () => {
    it("銘柄が抽出できる", () => {
      const actual = extractTicker(mailBody);
      expect(actual).toBe("WWWW");
    });
  });

  describe("異常系", () => {
    it("銘柄名の行が見つからない場合、例外送出して終了", () => {
      const mailBodyWoExpectedRow = `注文番号：0123`;

      expect(() => {
        extractTicker(mailBodyWoExpectedRow);
      }).toThrow("failed to extract ticker");
    });

    it("銘柄コードが見つからない場合、例外送出して終了", () => {
      const mailBodyWoExpectedRow = `銘柄名（銘柄コード）：某社（）`;

      expect(() => {
        extractTicker(mailBodyWoExpectedRow);
      }).toThrow("failed to extract ticker");
    });
  });
});

describe("extractDate", () => {
  describe("正常系", () => {
    it("約定日時が抽出できる", () => {
      const actual = extractDate(mailBody);
      expect(actual).toBe("2023/8/15 22:30");
    });
  });

  describe("異常系", () => {
    it("約定日時の行が見つからない場合、例外送出して終了", () => {
      const mailBodyWoExpectedRow = `注文番号：0123`;

      expect(() => {
        extractDate(mailBodyWoExpectedRow);
      }).toThrow("failed to extract date");
    });
  });
});

describe("extractPrice", () => {
  describe("正常系", () => {
    describe("約定単価・通貨が抽出できる", () => {
      it("USD、小数点あり", () => {
        const { unit, price } = extractPrice(mailBody);
        expect(unit).toBe("USD");
        expect(price).toBe("888.12");
      });

      it("USD、小数点なし", () => {
        const mailBodyWithJpy = `決済方法：円貨
約定単価：888米ドル
約定数量：1株（口）`;

        const { unit, price } = extractPrice(mailBodyWithJpy);
        expect(unit).toBe("USD");
        expect(price).toBe("888");
      });

      it("JPY、小数点なし", () => {
        const mailBodyWithJpy = `決済方法：円貨
約定単価：512円
約定数量：1株（口）`;

        const { unit, price } = extractPrice(mailBodyWithJpy);
        expect(unit).toBe("JPY");
        expect(price).toBe("512");
      });
    });
  });

  describe("異常系", () => {
    it("約定単価の行が見つからない場合、例外送出して終了", () => {
      const mailBodyWoExpectedRow = `注文番号：0123`;

      expect(() => {
        extractPrice(mailBodyWoExpectedRow);
      }).toThrow("failed to extract price");
    });

    it("USD, JPY以外の場合、例外送出して終了", () => {
      const mailBodyWithWrongFormat = `決済方法：円貨
約定単価：100万石
約定数量：1株（口）`;

      expect(() => {
        extractPrice(mailBodyWithWrongFormat);
      }).toThrow("failed to extract price");
    });

    it("数値のパースに失敗した場合、例外送出して終了", () => {
      const mailBodyWithWrongFormat = `決済方法：円貨
約定単価：ひゃく米ドル
約定数量：1株（口）`;

      expect(() => {
        extractPrice(mailBodyWithWrongFormat);
      }).toThrow("failed to extract price");
    });
  });
});

// describe("parseMailBody", () => {
//   describe("正常系", () => {
//     it("必要事項が抽出できる", () => {
//       const actual = parseMailBody(mailBody);
//       expect(actual.ticker).toBe("某社（WWWW）");
//       expect(actual.date).toBe("2023/8/15 22:30");
//       expect(actual.unit).toBe("USD");
//       expect(actual.price).toBe("888.12");
//     });
//   });

//   describe("異常系", () => {
//     it("必要な行が見つからない場合、例外送出して終了", () => {
//       const mailBodyWoExpectedRow = `注文番号：0123`;

//       expect(() => {
//         parseMailBody(mailBodyWoExpectedRow);
//       }).toThrow("failed to extract ticker");
//     });
//   });
// });
