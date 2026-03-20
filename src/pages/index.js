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

          <Link
            className={`button button--lg ${styles.heroSecondaryButton}`}
            to="/magma-gen">
            Explore Tasks
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

function InteractiveDemoSection() {
  return (
    <section className="padding-vert--xl background--light">
      <div className="container">
        <Heading as="h2" className="text--center margin-bottom--lg">
          Interactive Long-Horizon Execution
        </Heading>

        <div className="row">
          {/* LEFT: VIDEO / SIM */}
          <div className="col col--6">
            <div style={{
              width: "100%",
              height: "320px",
              background: "#111",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#888"
            }}>
              {/* Replace with real video */}
              Simulation / Real-world demo
            </div>
          </div>

          {/* RIGHT: LIVE LOG */}
          <div className="col col--6">
            <div style={{
              background: "#0d1117",
              color: "#c9d1d9",
              padding: "20px",
              borderRadius: "12px",
              fontFamily: "monospace",
              fontSize: "14px",
              lineHeight: "1.6",
              height: "320px",
              overflow: "auto"
            }}>
{`User: Start sorting objects based on rules

Agent: Loaded rules
- X → Zone A
- Z → Zone B

Agent: Picking object X...

---

User: Update rule — X goes to Zone C

Agent: Rule updated
Agent: Redirecting current task
Agent: Placing object X in Zone C

---

User: Stop. Go to Hall 4

Agent: Suspending task
Agent: Saving state

---

User: Resume

Agent: Restoring context
Agent: Continuing sorting
Next object: Z → Zone B`}
            </div>
          </div>
        </div>

        <p className="text--center margin-top--md">
          MAGMA agents maintain memory, adapt to new instructions, and resume execution
          without restarting tasks.
        </p>
      </div>
    </section>
  );
}


function Sim2RealSection() {
  return (
    <section className="padding-vert--xl">
      <div className="container">
        <Heading as="h2" className="text--center margin-bottom--lg">
          From Simulation to Real-World Execution
        </Heading>

        {/* Intro centered */}
        <div className="row">
          <div className="col col--8 col--offset-2 text--center">
            <p>
              MAGMA enables agents developed in simulation to execute the same tasks in the real world
              without retraining. By transferring seamlessly <strong>reasoning and memory</strong>,
              not low-level control.
            </p>
          </div>
        </div>

        {/* FIX: center the 2 columns */}
        <div className="row margin-top--lg">
          <div className="col col--7 col--offset-3">
            <div className="row">
              <div className="col col--6">
                <h3>What Transfers</h3>
                <ul>
                  <li>Task decomposition and multi-step planning</li>
                  <li>Memory and state tracking</li>
                  <li>Rule updates and interaction handling</li>
                  <li>Interrupt / resume behavior</li>
                  <li>Action sequencing</li>
                </ul>
              </div>

              <div className="col col--6">
                <h3>What Does Not Transfer</h3>
                <ul>
                  <li>Low-level motion policies</li>
                  <li>Robot-specific control</li>
                  <li>Physics and contact dynamics</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom text centered */}
        <div className="row margin-top--lg">
          <div className="col col--8 col--offset-2 text--center">
            <p>
              MAGMA operates at an abstraction level independent of embodiment:
              agents learn <strong>what to do</strong>, while execution is handled by
              robot-specific controllers.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ConceptSection() {
  return (
    <section className="padding-vert--xl background--light">
      <div className="container text--center">
        <Heading as="h2" className="margin-bottom--lg">
          Unified Research Pipeline
        </Heading>

        <p>
          Task Generation → Agent Training → Evaluation → Diagnostic Metrics
        </p>

        <p className="margin-top--md">
          MAGMA connects data generation and benchmarking into a
          coherent and extensible research ecosystem.
        </p>
      </div>
    </section>
  );
}

function TasksSection() {
  return (
    <section className="padding-vert--xl">
      <div className="container">
        <Heading as="h2" className="text--center margin-bottom--lg">
          What Tasks are we targetting?
        </Heading>

        <div className="row">
          <div className="col col--4 text--center">
            <img src="/img/task1.png" className={styles.taskImg} />
            <p>Multi-step object rearrangement</p>
          </div>

          <div className="col col--4 text--center">
            <img src="/img/task2.png" className={styles.taskImg} />
            <p>Constrained manipulation</p>
          </div>

          <div className="col col--4 text--center">
            <img src="/img/task3.png" className={styles.taskImg} />
            <p>Long-horizon interactive planning</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function AudienceSection() {
  return (
    <section className="padding-vert--xl background--light">
      <div className="container text--center">
        <Heading as="h2" className="margin-bottom--lg">
          Who Is MAGMA For?
        </Heading>

        <p>
          Robotics researchers, foundation model developers, benchmark designers,
          and industrial teams seeking structured evaluation frameworks.
        </p>
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
        <InteractiveDemoSection />
        <TasksSection />
        <Sim2RealSection />
        <HomepageFeatures />
        <ConceptSection />
        <AudienceSection />
      </main>

    </Layout>
  );
}
