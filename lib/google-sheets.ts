import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const SPREADSHEET_ID = '12qNVw-KNq_UPXtS7gX_Vo9tNYFKtGmb_X6_1AnHo3Hs';

const getSheet = async () => {
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!serviceAccountEmail || !privateKey) {
    throw new Error('Google service account credentials not configured.');
  }

  const auth = new JWT({
    email: serviceAccountEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const doc = new GoogleSpreadsheet(SPREADSHEET_ID, auth);
  await doc.loadInfo();
  return doc.sheetsByIndex[0];
};

export async function getEvents() {
  const sheet = await getSheet();
  await sheet.loadHeaderRow();
  const headers = sheet.headerValues;
  // Assume the first column is Name, others are events
  return headers.slice(1);
}

export async function addEvent(eventName: string) {
  const sheet = await getSheet();
  await sheet.loadHeaderRow();
  const headers = [...sheet.headerValues, eventName];
  await sheet.setHeaderRow(headers);
}

export async function checkIn(name: string, event: string, status: string = 'Attendence') {
  const sheet = await getSheet();
  const rows = await sheet.getRows();
  const headers = sheet.headerValues;
  const nameHeader = headers[0]; // Usually the first column

  const row = rows.find(r => r.get(nameHeader) === name);

  if (row) {
    row.set(event, status);
    await row.save();
    return true;
  }
  return false;
}

export async function getAttendanceData() {
  const sheet = await getSheet();
  const rows = await sheet.getRows();
  const headers = sheet.headerValues;
  
  return rows.map(row => {
    const data: Record<string, string> = {};
    headers.forEach(h => {
      data[h] = row.get(h) || '';
    });
    return data;
  });
}
