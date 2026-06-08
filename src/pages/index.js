import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();

  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container text--center">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>

        <p className={styles.heroBadge}>
          Multi-Agent for Manipulation
        </p>

        <p className={styles.heroDescription}>
          MAGMA is a modular research framework for long-horizon robotic manipulation, 
          integrating formal task specification, interactive self-play data generation, 
          training pipelines, architectural analysis, and standardized benchmarking.
        </p>

        <div className={styles.heroButtons}>
          <Link
            className={`button button--lg ${styles.heroPrimaryButton}`}
            to="/docs/intro">
            Documentation
          </Link>
        </div>
      </div>
    </header>
  );
}

function WhySection() {
  return (
    <section className="padding-vert--xl">
      <div className="container">
        <Heading as="h2" className="text--center margin-bottom--lg">
          Motivation
        </Heading>

        <div className="row">
          <div className="col col--4">
            <h3>Beyond Monolithic VLAs</h3>
            <p>
              Vision-Language-Action models trained end-to-end struggle under
              distribution shift and dynamic task constraints. Real deployment
              requires structured and adaptive control beyond fixed training distributions.
            </p>
          </div>

          <div className="col col--4">
            <h3>Long-Horizon Interactive Tasks</h3>
            <p>
              Robotic systems must handle evolving object states, changing constraints,
              and multi-step interactions. Yet no benchmark rigorously evaluates
              long-horizon interactive manipulation or multi-robot coordination.
            </p>
          </div>

          <div className="col col--4">
            <h3>Efficient & Deployable Agents</h3>
            <p>
              MAGMA promotes structured training and analysis for compact models
              (&lt;2B parameters), enabling fast inference and deployment on edge
              robotic platforms without sacrificing adaptability.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();

  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Official website of the MAGMA research framework.">

      <HomepageHeader />

      <main>
        <WhySection />
        <HomepageFeatures />
      </main>

    </Layout>
  );
}
