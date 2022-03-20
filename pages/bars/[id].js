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

  return {
    props: {
      barData
    }
  }
}

export default function Bar({ barData }) {
  const [name, street_address, zip, happy_hour_ids, image_url, beer, wine, cocktails, food, outdoor] = barData;
  const happyHourIds = happy_hour_ids.split(',');

  return (
    <main className={styles.main}>
      <Link href={'/'}>
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
      {
        // happyHourIds.map((happyHourId) => {
        //   <HappyHour id={Number(happyHourId)} />
        // })
      }
    </main>
    )
}