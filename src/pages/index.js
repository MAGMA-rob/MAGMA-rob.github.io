import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';
import styles from './index.module.css';

export default function Home() {
  return (
    <Layout
      title="MAGMA — Robot agents for natural-language tasks"
      description="Develop robot agents you can adapt to your tasks and run locally. Generate data with MAGMA-GEN and prepare to evaluate progress with MAGMA-BENCH.">
      <header className={`hero ${styles.heroBanner}`}>
        <div className="container text--center">
          <p className={styles.heroBadge}>MAGMA · A robotics research framework</p>
          <Heading as="h1" className={styles.heroTitle}>
            Build your own robot agent for natural-language tasks.
          </Heading>
          <p className={styles.heroDescription}>
            Adapt an agent to your tasks, generate data for supervised training,
            and work toward robot deployment with models you run locally.
            MAGMA brings together task design, data generation, and evaluation
            research to support that workflow.
          </p>
          <div className={styles.heroButtons}>
            <Link className={`button button--lg ${styles.heroPrimaryButton}`} to="/docs/intro">
              Get started
            </Link>
            <Link className={`button button--lg ${styles.heroSecondaryButton}`} to="/magma-gen">
              Explore MAGMA-GEN
            </Link>
          </div>
          <p className={styles.betaNote}>
            <strong>v2 beta.</strong> Generation and customization guides are available.
            MAGMA model checkpoints and MAGMA-BENCH have not been released yet.
            November 2026 is a tentative release target.{' '}
            <Link to="/docs/intro">Read the current status</Link>.
          </p>
        </div>
      </header>

      <main>
        <section className={styles.contentSection}>
          <div className="container">
            <Heading as="h2">From your tasks to an agent you can improve</Heading>
            <p className={styles.sectionIntro}>
              Start with the provided simulation tasks and connect your model.
              Create your own tasks to expand the training corpus and specialize
              the agent for your application. Collect experience with MAGMA-GEN,
              train with your own pipeline, and use the upcoming MAGMA-BENCH to
              compare progress between model versions.
            </p>
            <figure className={styles.workflowFigure}>
              <a href="/img/magma_project_schema.png">
                <img
                  className={styles.workflowImage}
                  src="/img/magma_project_schema.png"
                  alt="MAGMA workflow: define tasks, generate experience with MAGMA-GEN, train your model with your own pipeline, and evaluate progress with MAGMA-BENCH. Use the results to refine your tasks."
                  width={2172}
                  height={724}
                  loading="lazy"
                />
              </a>
              <figcaption>
                MAGMA-GEN collects the data. Training happens separately.
                MAGMA-BENCH is under development.
              </figcaption>
            </figure>
          </div>
        </section>

        <HomepageFeatures />

        <section className={styles.contentSection}>
          <div className="container">
            <Heading as="h2">Learn from mistakes through validated corrections</Heading>
            <p className={styles.sectionIntro}>
              MAGMA-GEN collects an agent’s own trajectories, including the
              situations reached through its mistakes. Coaching follows three
              steps: diagnose a possible cause, propose a correction, and
              validate the resulting continuation by executing it in simulation.
              A proposed correction becomes useful supervision only when its
              recorded outcomes support it.
            </p>
            <p className={styles.sectionIntro}>
              The collected examples can then be used for supervised training.
              The agent’s weights stay fixed during collection; GEN does not run
              an online reinforcement-learning update.{' '}
              <Link to="/magma-gen">Read about the method and research</Link>.
            </p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <div className="container">
            <Heading as="h2">Start with the workflow you need</Heading>
            <div className="row">
              <div className="col col--4">
                <Heading as="h3">Generate your first dataset</Heading>
                <p>Run a provided task, inspect the agent’s decisions, and export selected training examples.</p>
                <Link to="/docs/use-magma-gen/overview">Follow the generation guide →</Link>
              </div>
              <div className="col col--4">
                <Heading as="h3">Create your own task</Heading>
                <p>Define instructions, available actions, and success conditions. Start with a manual test, without an LLM.</p>
                <Link to="/docs/create-scenarios/overview">Build a scenario →</Link>
              </div>
              <div className="col col--4">
                <Heading as="h3">Connect your model</Heading>
                <p>Use a compatible local checkpoint or implement your own agent with custom prompts and memory.</p>
                <Link to="/docs/custom-agent/overview">Integrate your agent →</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
