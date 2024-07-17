// https://sheets.googleapis.com/v4/spreadsheets/xxxxxxxxxxxxx/values/A:Z?key=AIzaSyCCkcpr4vPU2ucC1KzGAAneOWGIn_y-ZsQ

export const getSheet = async (
  spreadsheetUrl: string,
  sheetName: string
): Promise<any[]> => {
  const apiKey = process.env.GOOGLE_API_KEY;
  const spreadsheetId = spreadsheetUrl.split("/d/")[1].split("/")[0];
  const range = sheetName ? `${sheetName}!A:Z` : "A:Z";
  if (!apiKey) {
    throw new Error("Invalid API key");
  }

  if (!spreadsheetId) {
    throw new Error("Invalid spreadsheet URL");
  }

  const sheetResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}values/${range}?key=${apiKey}`
  );

  if (sheetResponse.status !== 200) {
    throw new Error("Invalid spreadsheet URL, or sheet name");
  }

  const sheet = await sheetResponse.json();

  const values: any[] = sheet.values;

  return values;
};

export const getArrayDataFromSheet = async (
  spreadsheetUrl: string,
  sheetName: string,
  formatMapping: any[] = []
): Promise<any[]> => {
  const sheetValues = await getSheet(spreadsheetUrl, sheetName);

  const newFormat = sheetValues[0].map((key: string) => {
    const mapping = formatMapping.find((map) => map[key]);
    return mapping ? mapping[key] : key;
  });

  sheetValues.shift();

  return sheetValues.map((row) => {
    const obj: any = {};
    newFormat.forEach((key: string, index: number) => {
      obj[key] = row[index];
    });
    return obj;
  });
};

export const getObjectFromSheet = async (
  spreadsheetUrl: string,
  sheetName: string,
  format: any[] = []
): Promise<any> => {
  const sheetValues = await getSheet(spreadsheetUrl, sheetName);

  const csvObject: any = {};

  sheetValues.forEach((row) => {
    const row0 = row[0] as string;

    format.forEach((map: any) => {
      const value: string = Object.values(map)?.[0] as string;
      const key = map[value];
      if (row0 === value) {
        csvObject[key] = row[1];
      }
    });
  });

  return csvObject;
};
