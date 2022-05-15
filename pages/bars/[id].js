import { google } from 'googleapis';
import Link from 'next/link'
import styles from '../../styles/Home.module.css'

const SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets.readonly';

export async function getServerSideProps({ query }) {
  const auth = await google.auth.getClient({ scopes: [SHEETS_SCOPE ]});
  const sheets = google.sheets({ version: 'v4', auth });

  const { id } = query;
  const range = `bars!A${id}:J${id}`;

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SHEET_ID,
    range
  });

  const [barData] = res.data.values;
  const [name, street_address, zip, happy_hour_ids, image_url, beer, wine, cocktails, food, outdoor] = barData;

  const hhIds = happy_hour_ids.split(',');

  const hhReqests = hhIds.map((id) => {
    const range = `happy_hours!A${id}:C${id}`;
    return sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SHEET_ID,
      range
    })
  })

  const hhResults = await Promise.all(hhReqests);

  const happy_hours = hhResults.map((res) => {
    const vals = res.data.values[0];
    const [hours, description] = vals;
    return {
      hours, 
      description
    }
  });

  return {
    props: {
      data: {
        name, 
        street_address, 
        zip, 
        image_url, 
        beer, 
        wine, 
        cocktails, 
        food, 
        outdoor,
        happy_hours
      }
    }
  }
}

const DAYS_OF_THE_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const humanReadableHours = (hours) => {
  const hoursArr = JSON.parse(hours);
  const translatedHours = hoursArr.map((hours) => {
    if (!hours) { return hours; }
    const start = hours[0] - 1200;
    const end = hours[1] - 1200;
    return `${start} til ${end}`;
  })
  const hoursWithDays = translatedHours.map((hours, idx) => {
    if (!hours) return;
    const day = DAYS_OF_THE_WEEK[idx];
    return `${day} ${hours}`;
  });
  return hoursWithDays;
}

export default function Bar({ data }) {
  const { name, street_address, zip, happy_hours } = data;
  return (
    <main className={styles.main}>
      <Link href={'/bars'} passHref>
        <div className={styles.card}>
          <div className={styles.flex}>
          <div className={styles.backArrow}>&rarr; </div>
            Back
          </div>
        </div>
      </Link>
      <h1 className={styles.title}>
        {name}
      </h1>
      <div>{`📍 ${street_address} ${zip}`}</div>
      <br />
        {happy_hours.map((happyHour, i) => (
          <div key={`hh-${i}`}>
            {humanReadableHours(happyHour.hours).map((hours, ii) => (
              <div style={{textAlign: 'center'}} key={`hh-${i}-${ii}`}>{hours}</div>
            ))}
            <br />
            <div>{happyHour.description}</div>
          </div>
        ))}
    </main>
    )
}