import { google } from 'googleapis';
import { flatMap } from 'lodash';
import Link from 'next/link'
import styles from '../../styles/Home.module.css'

const SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets.readonly';
const VALID_ROW_IDS = [2, 17];
const HAPPY_HOUR_ID_IDX = 3;

export async function getStaticProps() {
  const auth = await google.auth.getClient({ scopes: [SHEETS_SCOPE ]});
  const sheets = google.sheets({ version: 'v4', auth });

  const range = `bars!A${VALID_ROW_IDS[0]}:J${VALID_ROW_IDS[1]}`;

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SHEET_ID,
    range
  });

  const bars = res.data.values;

  const hhIds = bars.map((bar) => bar[HAPPY_HOUR_ID_IDX]).map((ids) => ids.split(','));

  const hhReqests = flatMap(hhIds.map((barIds) => {
    return barIds.map((id) => {
      const range = `happy_hours!A${id}:C${id}`;
      return sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SHEET_ID,
        range
      })
    })
  }));

  const hhResults = await Promise.all(hhReqests);

  const happyHours = hhResults.map((res) => {
    const vals = res.data.values[0];
    const [hours, description, notes] = vals;
    return {
      hours, 
      description,
      notes
    }
  });

  const barsWithHappyHours = bars.map((bar, idx) => {
      const [name, street_address, zip, happy_hour_ids, image_url, beer, wine, cocktails, food, outdoor] = bar;
      return ({ 
        // TODO: so hacky, fix this
        id: idx+2,
        name, 
        street_address, 
        zip, 
        // again so hacky, fix 
        happy_hours: happy_hour_ids.split(',').map((id) => happyHours[id-2]),
        image_url, 
        beer, 
        wine, 
        cocktails, 
        food, 
        outdoor
      });
  })

  return {
    props: {
      data: barsWithHappyHours
    }
  }
}

// TODO: repeated code

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

export default function Bars({ data }) {
  return (
    <div>
    <h1 className={styles.title}>All Bars</h1>
    <br />
    <hr />
    <br/>
    <div className={styles.barsContainer} >
    {
      data.map(({ id, name, street_address, zip, happy_hours }) =>(
        <Link key={name} href={`/bars/${id}`} passHref>
        <div>
            <div className={styles.center}>{name}</div>
            <div className={styles.center}>{`📍 ${street_address} ${zip}`}</div>
            <br />
            {happy_hours.map((happyHour, i) => (
              <div key={`hh-${i}`}>
                {humanReadableHours(happyHour.hours).map((hours, ii) => (
                  <div className={styles.center} key={`hh-${i}-${ii}`}>{hours}</div>
                ))}
                <br />
                <div className={styles.center}>{happyHour.description}</div>
              </div>
            ))}
            <br />
            <hr />
            </div>
        </Link>
      ))
    }
    </div>
    </div>
  )
}