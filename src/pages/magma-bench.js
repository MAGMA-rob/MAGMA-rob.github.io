import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './project-page.module.css';

export default function MagmaBenchPage() {
  return (
    <Layout
      title="MAGMA-BENCH"
      description="Evaluate your agent on interactive robot tasks with MAGMA-BENCH. Install the required packages, download the benchmark, and run an evaluation.">
      <main className={styles.benchPage}>
        <div className="container">
          <div className={styles.benchCenterBlock}>
            <p className={styles.benchKicker}>MAGMA Project</p>
            <Heading as="h1" className={styles.benchTitle}>
              MAGMA-BENCH
            </Heading>
            <p className={styles.benchSubtitle}>
              Evaluate your agent on interactive robot tasks in simulation.
              Download the benchmark, connect your agent, and inspect its results.
            </p>
            <div className={styles.benchLaunchBox}>
              <span className={styles.benchLaunchText}>Benchmark v1.0.0</span>
            </div>
            <p className={styles.benchTimeline}>
              1,254 episodes across 19 scenarios.
            </p>
            <div className={styles.genActions}>
              <Link
                className={`button button--lg ${styles.paperButton}`}
                to="/docs/use-magma-bench/installation">
                Install and download
              </Link>
              <Link
                className={`button button--lg ${styles.repoButton}`}
                to="/docs/use-magma-bench/run">
                Run an evaluation
              </Link>
            </div>
            <p>
              <Link to="/docs/custom-agent/overview">
                Connect your own agent
              </Link>
            </p>
          </div>
        </div>
      </main>
    </Layout>
  );
}
