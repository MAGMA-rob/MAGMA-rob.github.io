import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './project-page.module.css';

export default function MagmaBenchPage() {
  return (
    <Layout
      title="MAGMA-BENCH"
      description="MAGMA-BENCH — Coming soon. Tentatively planned for November 2026.">
      <main className={styles.benchComingPage}>
        <div className="container">
          <div className={styles.benchCenterBlock}>
            <p className={styles.benchKicker}>MAGMA Project</p>
            <Heading as="h1" className={styles.benchTitle}>
              MAGMA-BENCH
            </Heading>
            <div className={styles.benchLaunchBox}>
              <span className={styles.benchLaunchText}>Coming soon</span>
            </div>
            <p className={styles.benchTimeline}>
              Targeting November 2026. This timeline is tentative.
            </p>
          </div>
        </div>
      </main>
    </Layout>
  );
}
