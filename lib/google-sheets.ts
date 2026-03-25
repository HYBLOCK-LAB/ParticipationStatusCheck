import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const SPREADSHEET_ID = '13fK8gpFdktyOEPuc5gP3gsLQFrdrCMw80WEYBm6-ENU';

const getDoc = async () => {
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
  return doc;
};

export async function getActiveEvent() {
  try {
    const doc = await getDoc();
    const configSheet = doc.sheetsByTitle['Config'];
    if (!configSheet) return null;
    
    const rows = await configSheet.getRows();
    const activeRow = rows.find(r => r.get('Key') === 'ActiveEvent');
    return activeRow ? activeRow.get('Value') : null;
  } catch (error) {
    console.error('getActiveEvent error:', error);
    return null;
  }
}

export async function setActiveEvent(eventName: string) {
  const doc = await getDoc();
  let configSheet = doc.sheetsByTitle['Config'];
  
  if (!configSheet) {
    configSheet = await doc.addSheet({ title: 'Config', headerValues: ['Key', 'Value'] });
  }
  
  const rows = await configSheet.getRows();
  const activeRow = rows.find(r => r.get('Key') === 'ActiveEvent');
  
  if (activeRow) {
    activeRow.set('Value', eventName);
    await activeRow.save();
  } else {
    await configSheet.addRow({ Key: 'ActiveEvent', Value: eventName });
  }
}

export async function getEvents() {
  try {
    const doc = await getDoc();
    const sheet = doc.sheetsByIndex[0];
    await sheet.loadHeaderRow();
    const headers = sheet.headerValues;
    return headers.slice(1);
  } catch (error: any) {
    console.error('getEvents error:', error.message);
    throw new Error(`Failed to fetch events: ${error.message}`);
  }
}

export async function addEvent(eventName: string) {
  try {
    const doc = await getDoc();
    const sheet = doc.sheetsByIndex[0];
    await sheet.loadHeaderRow();
    const headers = [...sheet.headerValues, eventName];
    await sheet.setHeaderRow(headers);
  } catch (error: any) {
    console.error('addEvent error:', error.message);
    throw new Error(`Failed to add event: ${error.message}`);
  }
}

export async function checkIn(name: string, event: string, status: string = 'Attendence') {
  try {
    const doc = await getDoc();
    const sheet = doc.sheetsByIndex[0];
    await sheet.loadHeaderRow();
    const headers = sheet.headerValues;
    
    if (!headers.includes(event)) {
      throw new Error(`Invalid event: ${event}`);
    }

    const rows = await sheet.getRows();
    const nameHeader = headers[0]; 

    const row = rows.find(r => r.get(nameHeader) === name);

    if (row) {
      row.set(event, status);
      await row.save();
      return true;
    }
    return false;
  } catch (error: any) {
    console.error('checkIn error:', error.message);
    throw error;
  }
}

export async function getAttendanceData() {
  try {
    const doc = await getDoc();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();
    const headers = sheet.headerValues;
    
    return rows.map(row => {
      const data: Record<string, string> = {};
      headers.forEach(h => {
        data[h] = row.get(h) || '';
      });
      return data;
    });
  } catch (error) {
    console.error('getAttendanceData error:', error);
    return [];
  }
}
