import request from "supertest";

import {
  getNumberOfCachedResponses,
  proxyCache,
  proxyCacheCleanupScheduler,
  stopProxyCacheCleanupScheduler,
} from "../helpers/proxy-cache.helper";
import {
  getArrayDataFromSheet,
  getObjectFromSheet,
  getSheet,
} from "../helpers/spreadsheet.helper";
import app from "../app";

import { sheetContent } from "./sheet-content";

const SECONDS = 1000;
jest.setTimeout(70 * SECONDS);

describe("Test app.ts", () => {
  beforeAll(() => {
    // mock the fetch function to return the sheet content if the URL is correct
    jest.spyOn(global, "fetch").mockImplementation(async (url) => {
      if (
        (url as string).includes(
          "https://sheets.googleapis.com/v4/spreadsheets/"
        )
      ) {
        return {
          status: 200,
          json: async () => JSON.parse(JSON.stringify(sheetContent)),
        } as Response;
      }

      return {
        status: 404,
        json: async () => {},
      } as Response;
    });
  });

  it("should return error if the url doesn't match spreedsheet url", async () => {
    const spreadsheetUrl = "https://google.com";
    const sheet = "sheet1";

    await expect(getSheet(spreadsheetUrl, sheet)).rejects.toThrow(
      "Invalid Google spreadsheet URL"
    );
    const spreadsheetUrlWithoutId = "https://docs.google.com/spreadsheets/d/";
    await expect(getSheet(spreadsheetUrlWithoutId, sheet)).rejects.toThrow(
      "Invalid spreadsheet URL"
    );
  });

  it("should resolve without error if the url matches the spreadsheet url", async () => {
    const spreadsheetUrl = "https://docs.google.com/spreadsheets/d/1";
    const sheet = "sheet1";

    const result = await getSheet(spreadsheetUrl, sheet);

    expect(result).toEqual(sheetContent.values);
  });

  it("should return the formatted data object array from csv", async () => {
    const format = [
      { name: "name" },
      { whereToFind: "where to find" },
      { labels: "labels" },
      { labelsAm: "labels arm, translated" },
      { labelsRu: "labels ru, translated" },
    ];

    const spreadsheetUrl = "https://docs.google.com/spreadsheets/d/1";
    const sheet = "sheet1";

    const result = await getArrayDataFromSheet(spreadsheetUrl, sheet, format);

    result.forEach((row) => {
      expect(row).toHaveProperty("name");
      expect(row).toHaveProperty("whereToFind");
      expect(row).toHaveProperty("labels");
      expect(row).toHaveProperty("labelsAm");
      expect(row).toHaveProperty("labelsRu");
    });

    expect(result).toHaveLength(sheetContent.values.length - 1);
  });

  it("should return the formatted data object", async () => {
    const format = [
      { zgst: "ZGST" },
      { dufflebag: "Dufflebag" },
      { lernetsee: "Lernetsee" },
    ];
    const spreadsheetUrl = "https://docs.google.com/spreadsheets/d/1";
    const sheet = "sheet1";

    const result = await getObjectFromSheet(spreadsheetUrl, sheet, format);

    expect(result).toHaveProperty("zgst");
    expect(result).toHaveProperty("dufflebag");
    expect(result).toHaveProperty("lernetsee");

    expect(result.zgst).toEqual("https://zgst.am/");
    expect(result.dufflebag).toEqual("https://dufflebag.am/");
    expect(result.lernetsee).toEqual("https://it-it.facebook.com/lernetsee/");
    expect(Object.keys(result)).toHaveLength(3);

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
    const spreadsheetUrl = "https://docs.google.com/spreadsheets/d/1";
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

    expect(result2.body).toEqual(result.body);
  });

  it("should clean up the cache after 1 minute", async () => {
    const format = [
      { zgst: "ZGST" },
      { dufflebag: "Dufflebag" },
      { lernetsee: "Lernetsee" },
    ];
    const spreadsheetUrl = "https://docs.google.com/spreadsheets/d/1";
    const sheet = "sheet1";

    const result = await proxyCache(getObjectFromSheet, [
      spreadsheetUrl,
      sheet,
      format,
    ]);

    const result2 = await proxyCache(getArrayDataFromSheet, [
      spreadsheetUrl,
      sheet,
      format,
    ]);

    proxyCacheCleanupScheduler();
    expect(getNumberOfCachedResponses()).toEqual(2);

    // wait for 1 minute and 1 second
    await new Promise((resolve) => setTimeout(resolve, SECONDS * 61));

    expect(getNumberOfCachedResponses()).toEqual(0);
    stopProxyCacheCleanupScheduler();
  });

  test("GET / should return Hello world", async () => {
    const response = await request(app).get("/");

    expect(response.body).toEqual({ message: "Hello world" });
  });

  test("GET /api/array-data-from-sheet should return the formatted data object array from csv", async () => {
    const format = [
      { name: "name" },
      { whereToFind: "where to find" },
      { labels: "labels" },
      { labelsAm: "labels arm, translated" },
      { labelsRu: "labels ru, translated" },
    ];
    const sheet = "sheet1";
    const spreadsheetUrl = "https://docs.google.com/spreadsheets/d/1";

    const escapedUrl = encodeURIComponent(spreadsheetUrl);

    const formatString = JSON.stringify(format);
    const response = await request(app).get(
      `/api/array-data-from-sheet?spreadsheetUrl=${escapedUrl}&format=${formatString}&sheet=${sheet}`
    );

    expect(response.status).toEqual(200);
    expect(response.body).toHaveLength(sheetContent.values.length - 1);

    response.body.forEach((row: any) => {
      expect(row).toHaveProperty("name");
      expect(row).toHaveProperty("whereToFind");
      expect(row).toHaveProperty("labels");
      expect(row).toHaveProperty("labelsAm");
      expect(row).toHaveProperty("labelsRu");
    });
  });

  test("GET /api/object-from-sheet should return the formatted data object", async () => {
    const format = [
      { zgst: "ZGST" },
      { dufflebag: "Dufflebag" },
      { lernetsee: "Lernetsee" },
    ];
    const sheet = "sheet1";
    const spreadsheetUrl = "https://docs.google.com/spreadsheets/d/1";
    const response = await request(app).get(
      `/api/object-from-sheet?spreadsheetUrl=${spreadsheetUrl}&format=${JSON.stringify(
        format
      )}&sheet=${sheet}`
    );

    expect(response.status).toEqual(200);
    expect(response.body).toHaveProperty("zgst");
    expect(response.body).toHaveProperty("dufflebag");
    expect(response.body).toHaveProperty("lernetsee");

    expect(response.body.zgst).toEqual("https://zgst.am/");
    expect(response.body.dufflebag).toEqual("https://dufflebag.am/");
    expect(response.body.lernetsee).toEqual(
      "https://it-it.facebook.com/lernetsee/"
    );
  });
});
