import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './project-page.module.css';

const citation = `@misc{bernat:hal-05514580,
  TITLE = {{MAGMA-GEN: Validated Recovery Supervision from Ambiguous Failures via Counterfactual Re-Execution}},
  AUTHOR = {Bernat, Loan and Grard, Matthieu and Herbulot, Ariane and Lamiraux, Florent},
  URL = {https://hal.science/hal-05514580},
  NOTE = {under-review},
  YEAR = {2026},
  MONTH = Feb,
  KEYWORDS = {Robot Learning ; Found Models ; Planning ; Human-Robot Interaction},
  PDF = {https://hal.science/hal-05514580v1/file/magma-gen-submitted-version.pdf},
  HAL_ID = {hal-05514580},
  HAL_VERSION = {v1},
}`;

const authors = [
  'Loan Bernat',
  'Matthieu Grard',
  'Ariane Herbulot',
  'Florent Lamiraux',
];

export default function MagmaGenPage() {
  return (
    <Layout
      title="MAGMA-GEN: Validated Recovery Supervision from Ambiguous Failures via Counterfactual Re-Execution"
      description="Project landing page for MAGMA-Gen.">
      <main className={styles.genPage}>
        <header className={`hero hero--primary ${styles.genHeader}`}>
          <div className="container text--center">
            <p className={styles.genVenue}>Under Review at CoRL 2026</p>
            <Heading as="h1" className={styles.genTitle}>
              MAGMA-GEN: Validated Recovery Supervision from Ambiguous Failures via Counterfactual Re-Execution
            </Heading>
            <p className={styles.genAuthors}>{authors.join(' · ')}</p>
            <p className={styles.genSubtitle}>
              A generation framework to build interaction-grounded data in highly interactive and long-horizon tasks for language agents.
            </p>
            <div className={styles.genActions}>
              <Link
                className={`button button--lg ${styles.paperButton}`}
                to="https://hal.science/hal-05514580v1">
                Paper
              </Link>
              <Link
                className={`button button--lg ${styles.repoButton}`}
                to="https://github.com/MAGMA-rob/magma-gen">
                GitHub
              </Link>
            </div>
          </div>
        </header>

        <div className={`container ${styles.genContent}`}>
          <section className={styles.genSection}>
            <Heading as="h2" className={styles.genSectionTitle}>
              Overview Video
            </Heading>
            <iframe
              className={styles.overviewVideo}
              src="https://www.youtube.com/embed/7Lj5-pO2FFQ"
              title="MAGMA-GEN overview video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </section>

          <section className={styles.genSection}>
            <Heading as="h2" className={styles.genSectionTitle}>
              Abstract
            </Heading>
            <p>
              Hierarchical robotic systems executing long-horizon manipulation tasks must make high-level semantic decisions that orchestrate stochastic low-level skills. In this setting, failed rollouts are <strong>ambiguous</strong>: a poor downstream state may reflect an invalid high-level decision, partial observation, or a valid decision whose physical execution failed. Traditional supervised learning lacks data for such recovery states, while reinforcement learning struggles with sparse rewards and non-local credit assignment. We propose MAGMA-GEN, an on-policy data-generation pipeline that converts ambiguous failed rollouts into validated recovery supervision. MAGMA-GEN first uses a privileged coach to hypothesize an early decision-level error and propose localized correction or recovery actions. Because this diagnosis is fallible, candidates are retained only if re-execution from the same state under matched conditions improves downstream progress. This produces supervised examples from the agent's own failure distribution without per-step human demonstrations. Evaluated on interactive long-horizon manipulation tasks, MAGMA-GEN improves task success and recovery capabilities, against distillation and trajectory-repair baselines under evolving task constraints in both simulation and real-robot execution.  
            </p>
          </section>

          <section className={styles.genSection}>
            <Heading as="h2" className={styles.genSectionTitle}>
              Method
            </Heading>
            <p className={styles.methodIntro}>
              MAGMA-GEN generates recovery supervision by re-executing ambiguous failure states under counterfactual choices, validating
              which interventions recover task progress before using them as training signal.
            </p>
            <figure className={styles.pipelineFigure}>
              <img
                className={styles.figureImage}
                src="/magma-gen/pipeline.jpg"
                alt="MAGMA-Gen pipeline overview"
                loading="lazy"
              />
              <figcaption className={styles.figureCaption}>
                Overview of MAGMA-GEN in a simple sorting task.
              </figcaption>
            </figure>
          </section>

          <section className={styles.genSection}>
            <Heading as="h2" className={styles.genSectionTitle}>
              Citation
            </Heading>
            <pre className={styles.genCitation}>
              <code>{citation}</code>
            </pre>
          </section>
        </div>
      </main>
    </Layout>
  );
}
