import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './project-page.module.css';

const citation = `@misc{bernat:hal-05514580,
  TITLE = {{Addressing Long-Horizon Failure in Language-Grounded Robotics via Structured Interaction}},
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
      title="MAGMA-Gen"
      description="Project landing page for MAGMA-Gen.">
      <main className={styles.genPage}>
        <header className={`hero hero--primary ${styles.genHeader}`}>
          <div className="container text--center">
            <p className={styles.genVenue}>Under Review at Robotics: Science and Systems (RSS) 2026</p>
            <Heading as="h1" className={styles.genTitle}>
              Addressing Long-Horizon Failure in Language-Grounded Robotics via Structured Interaction
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
              Video Demonstrations
            </Heading>
            <div className={styles.mediaGrid}>
              <article>
                <h3 className={styles.mediaTitle}>Real Robot Demo</h3>
                <div className={styles.mediaPlaceholder}>
                  Add an embedded video (YouTube/Vimeo/HTML5).
                </div>
              </article>
              <article>
                <h3 className={styles.mediaTitle}>Simulation Demo</h3>
                <div className={styles.mediaPlaceholder}>
                  Add a second demo for simulation results.
                </div>
              </article>
            </div>
          </section>

          <section className={styles.genSection}>
            <Heading as="h2" className={styles.genSectionTitle}>
              Abstract
            </Heading>
            <p>
              Deploying autonomous robots in human-centric environments requires consistent reasoning, memory, and failure recovery 
              across many sequential actions. Although vision-language action systems have shown impressive low-level generalization, 
              their performance degrades rapidly as action sequences grow longer and constraints evolve. Our insight is that these 
              failures arise from a structural mismatch between training supervision and the states that agents encounter during 
              execution, leading to compounding errors and inconsistent behavior over time. To address this, we introduce <strong>MAGMA-GEN</strong>,
              a structured interaction-based data generation framework, where a language model-based agent generates supervision signals 
              directly from its own long-horizon executions. <strong>MAGMA-GEN provides structured preference and scoring signals for partial 
              completion, failure, and recovery, enabling continued training without expert demonstrations</strong> or trajectory-level human 
              labeling once task components are defined. <strong>We further analyze a dual-agent instantiation that separates high-level tool 
              selection from persistent task and safety memories, improving stability over extended action sequences</strong>. We evaluate our 
              approach on long-horizon manipulation tasks with evolving constraints, designed to expose long-horizon failure modes. 
              Under a fixed training budget, models trained with our method outperform human-labeled and synthetic-augmentation baselines, 
              while continuing to improve with additional self-generated experience, demonstrating more stable scaling behavior. 
            </p>
          </section>

          <section className={styles.genSection}>
            <Heading as="h2" className={styles.genSectionTitle}>
              Task Formulation
            </Heading>
            <p>
              See here for a detailled description of what tasks we are targetting.
            </p>
          </section>

          <section className={styles.genSection}>
            <Heading as="h2" className={styles.genSectionTitle}>
              Method and Results
            </Heading>
            <div className={styles.contentStack}>
              <article className={styles.contentBlock}>
                <h3>Method Overview</h3>
                <p>
                  MAGMA-GEN is a data generation framework for long-horizon, language-conditioned
                  manipulation that learns from an agent’s own executions without relying on expert demonstrations.
                  Tasks are decomposed into stages and executed in simulation, producing branching trajectories.
                  Two core components structure data generation: Coaching, which provides explicit recovery behavior, corrective feedback
                  following failures or sub-optimal executions, and User Simulation, which generates and evaluates linguistic interactions.
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
              </article>

              <article className={styles.contentBlock}>
                <h3>Main Results</h3>
              </article>

              <article className={`${styles.resultCard} ${styles.resultFigureLeft}`}>
                <div className={styles.resultFigureWrap}>
                  <img
                    className={styles.figureImage}
                    src="/magma-gen/result.jpg"
                    alt="MAGMA-Gen result figure"
                    loading="lazy"
                  />
                </div>
                <div>
                  <h3 className={styles.resultTitle}>Results</h3>
                  <p className={styles.resultCaption}>
                    <strong>MAGMA-GEN enables a 1.7B parameter model to outperform human-labeled training by +15–25% absolute improvement</strong>, using the exact same amount of data.<br></br>
                    Evaluation is conducted on 100 long-horizon sorting tasks with evolving constraints.<br></br>
                    For reference, even larger zero-shot models struggle on these tasks, highlighting their intrinsic difficulty.
                  </p>
                </div>
              </article>
              <article className={`${styles.resultCard} ${styles.resultFigureRight}`}>
                <div>
                  <h3 className={styles.resultTitle}>Failure Analysis</h3>
                  <p className={styles.resultCaption}>
                    <strong>Failure analysis reveals long-term memorization (LM) as the primary bottleneck of the 1.7B monolithic model.</strong><br></br>
                    While using MAGMA-GEN results in a significant improvement in multi-step coordination and constrained reasonning, adding an external Memorizer
                    improves long-horizon completion but introduces a coordination penalty on shorter tasks, exposing a semantic bottleneck between specialized agents.
                    This highlights the need for communication-aware training in modular robotic systems.
                  </p>
                </div>
                <div className={styles.resultFigureWrap}>
                  <img
                    className={styles.figureImage}
                    src="/magma-gen/tab_result.png"
                    alt="MAGMA-Gen result tab"
                    loading="lazy"
                  />
                </div>
              </article>
            </div>
          </section>

          <section className={styles.genSection}>
            <Heading as="h2" className={styles.genSectionTitle}>
              Additional Details
            </Heading>
            <p>
              Add any extra section you need here: setup details, ablations,
              supplementary insights, or qualitative analyses.
            </p>
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
