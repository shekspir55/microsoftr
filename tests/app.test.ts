import {
  getNumberOfCachedResponses,
  proxyCache,
} from "../helpers/proxy-cache.helper";
import {
  getArrayDataFromSheet,
  getObjectFromSheet,
  getSheet,
} from "../helpers/spreadsheet.helper";
import { sheetContent } from "./sheet-content";
import { jest } from "@jest/globals";

describe("Test app.ts", () => {
  beforeEach(() => {
    // mock the getSheet function
    jest.spyOn(getSheet).mockImplementation(() => {
      return Promise.resolve(sheetContent);
    });
  });

  it("should return the formatted data object array from csv", async () => {
    const format = [
      { name: "name" },
      { whereToFind: "where to find" },
      { labels: "labels" },
      { labelsAm: "labels arm, translated" },
      { labelsRu: "labels ru, translated" },
    ];

    const spreadsheetUrl = "https://docs.google.com/spreadsheets/d/";
    const sheet = "sheet1";

    const result = await getArrayDataFromSheet(spreadsheetUrl, sheet, format);

    result.forEach((row) => {
      expect(row).toHaveProperty("name");
      expect(row).toHaveProperty("whereToFind");
      expect(row).toHaveProperty("labels");
      expect(row).toHaveProperty("labelsAm");
      expect(row).toHaveProperty("labelsRu");
    });
  });

  it("should return the formatted data object", async () => {
    const format = [
      { zgst: "ZGST" },
      { dufflebag: "Dufflebag" },
      { lernetsee: "Lernetsee" },
    ];
    const spreadsheetUrl = "https://docs.google.com/spreadsheets/d/";
    const sheet = "sheet1";

    const result = await getObjectFromSheet(spreadsheetUrl, sheet, format);

    expect(result).toHaveProperty("zgst");
    expect(result).toHaveProperty("dufflebag");
    expect(result).toHaveProperty("lernetsee");

    expect(result.zgst).toEqual("https://zgst.am/");
    expect(result.dufflebag).toEqual("https://dufflebag.am/");
    expect(result.lernetsee).toEqual("https://it-it.facebook.com/lernetsee/");

    // keys that are not in the spreadsheet should be undefined
    const format2 = [
      { zgst: "ZGST1" },
      { dufflebag: "Dufflebag1" },
      { lernetsee: "Lernetsee1" },
    ];

    const result2 = await getObjectFromSheet(spreadsheetUrl, sheet, format2);

    expect(result2).not.toHaveProperty("zgst");
    expect(result2.zgst1).toBeUndefined();
  });

  // a proxy function that caches the data for 1 minute
  it("should return the cached data", async () => {
    const format = [
      { zgst: "ZGST" },
      { dufflebag: "Dufflebag" },
      { lernetsee: "Lernetsee" },
    ];
    const spreadsheetUrl = "https://docs.google.com/spreadsheets/d/";
    const sheet = "sheet1";

    const result = await getObjectFromSheet(spreadsheetUrl, sheet, format);

    expect(result).toHaveProperty("zgst");
    expect(result).toHaveProperty("dufflebag");
    expect(result).toHaveProperty("lernetsee");

    expect(result.zgst).toEqual("https://zgst.am/");
    expect(result.dufflebag).toEqual("https://dufflebag.am/");
    expect(result.lernetsee).toEqual("https://it-it.facebook.com/lernetsee/");

    const result2 = await proxyCache(getObjectFromSheet, [
      spreadsheetUrl,
      sheet,
      format,
    ]);

    expect(result2).toEqual(result);

    // wait for 1 minute
    await new Promise((resolve) => setTimeout(resolve, 1000 * 60));

    // Change the value of the sheet response
    const result3 = await proxyCache(getObjectFromSheet, [
      spreadsheetUrl,
      sheet,
      format,
    ]);

    const result4 = await getObjectFromSheet(spreadsheetUrl, sheet, format);

    expect(result3).not.toEqual(result4);
  });

  it("should clean up the cache after 1 minute", async () => {
    const format = [
      { zgst: "ZGST" },
      { dufflebag: "Dufflebag" },
      { lernetsee: "Lernetsee" },
    ];
    const spreadsheetUrl = "https://docs.google.com/spreadsheets/d/";
    const sheet = "sheet1";

    const result = proxyCache(getObjectFromSheet, [
      spreadsheetUrl,
      sheet,
      format,
    ]);

    const result2 = proxyCache(getArrayDataFromSheet, [
      spreadsheetUrl,
      sheet,
      format,
    ]);
  });

  expect(getNumberOfCachedResponses()).toEqual(2);

  // wait for 1 minute
  await new Promise((resolve) => setTimeout(resolve, 1000 * 61));

  expect(getNumberOfCachedResponses()).toEqual(0);
});
