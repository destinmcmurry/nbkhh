import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>NBKHH</title>
        <meta name="description" content="North Brooklyn Happy Hours" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Coming soon!
        </h1>

        <div className={styles.grid}>
          <Link href={`/bars/${Math.floor(Math.random() * (17 - 2 + 1) + 2)}`}>
            <div className={styles.card}>
              Bar Roulette &rarr;
            </div>
          </Link>
        </div>
      </main>

      <footer className={styles.footer}>
          A passion project.
      </footer>
    </div>
  )
}
