import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './project-page.module.css';

export default function MagmaBenchPage() {
  return (
    <Layout
      title="MAGMA-Bench"
      description="MAGMA-Bench — Launching September 2026">
      <main className={styles.benchComingPage}>
        <div className="container">
          <div className={styles.benchCenterBlock}>
            <p className={styles.benchKicker}>MAGMA Project</p>

            <Heading as="h1" className={styles.benchTitle}>
              MAGMA-Bench
            </Heading>

            <p className={styles.benchSubtitle}>
              A structured benchmark for manipulation-focused agents.
            </p>

            <div className={styles.benchLaunchBox}>
              <span className={styles.benchLaunchText}>
                Coming September 2026
              </span>
            </div>

          </div>
        </div>
      </main>
    </Layout>
  );
}
