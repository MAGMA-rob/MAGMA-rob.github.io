import {useState} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import styles from './magma-bench.module.css';

export default function MagmaBenchPage() {
  const [isReleaseNoteOpen, setIsReleaseNoteOpen] = useState(false);

  return (
    <Layout
      title="MAGMA-BENCH — Evaluate high-level robot reasoning"
      description="Evaluate high-level robot agents on 1,254 interactive episodes in simulation. Connect your architecture through a shared skill interface and measure success, progress, and robustness.">
      <main className={styles.page}>
        <header className={styles.hero}>
          <div className="container">
            <div className={styles.heroMeta}>
              <p className={styles.eyebrow}>MAGMA-BENCH · Benchmark v1.0.0</p>
              <div
                className={styles.releaseNote}
                onMouseEnter={() => setIsReleaseNoteOpen(true)}
                onMouseLeave={() => setIsReleaseNoteOpen(false)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    setIsReleaseNoteOpen(false);
                  }
                }}>
                <button
                  type="button"
                  className={styles.releaseBadge}
                  aria-describedby="release-details"
                  onFocus={() => setIsReleaseNoteOpen(true)}
                  onBlur={() => setIsReleaseNoteOpen(false)}
                  onClick={() => setIsReleaseNoteOpen(true)}>
                  Official release · late December
                  <span aria-hidden="true">ⓘ</span>
                </button>
                <span
                  id="release-details"
                  role="tooltip"
                  className={styles.releaseDetails}
                  hidden={!isReleaseNoteOpen}>
                  <span className={styles.releaseDetailsBody}>
                    The official v3 release is planned after the December 2026
                    review, with new scenarios and a public leaderboard.
                  </span>
                </span>
              </div>
            </div>
            <Heading as="h1" className={styles.title}>
              Can your agent keep up when the task changes?
            </Heading>
            <p className={styles.heroLead}>
              A benchmark for <strong>high-level robot reasoning</strong> across
              long interactions, execution failures, and evolving instructions.
              Connect your agent, run simulated tasks, and see where it succeeds.
            </p>
            <div className={styles.actions}>
              <Link className={`button button--lg ${styles.primaryButton}`} to="/docs/use-magma-bench/installation">
                Evaluate your agent
              </Link>
              <Link className={`button button--lg ${styles.secondaryButton}`} to="#demos-title">
                Watch the demos <span aria-hidden="true">↗</span>
              </Link>
            </div>
            <div className={styles.resourceLinks}>
              <Link to="https://arxiv.org/abs/2610.13534">Read the paper</Link>
              <Link to="https://github.com/MAGMA-rob/magma-bench">Code</Link>
              <Link to="https://huggingface.co/datasets/lbernat/MAGMA-BENCH">Benchmark files</Link>
            </div>
            <dl className={styles.facts}>
              <div>
                <dt>1,254</dt>
                <dd>evaluation episodes</dd>
              </div>
              <div>
                <dt>13</dt>
                <dd>released scenarios</dd>
              </div>
              <div>
                <dt>Skill-level</dt>
                <dd>decision interface</dd>
              </div>
              <div>
                <dt>Your architecture</dt>
                <dd>single or multi-agent</dd>
              </div>
            </dl>
          </div>
        </header>

        <div className={`container ${styles.content}`}>
          <section id="demos" className={styles.section} aria-labelledby="demos-title">
            <p className={styles.eyebrow}>See the interaction</p>
            <Heading as="h2" id="demos-title">Instructions become robot actions.</Heading>
            <p className={styles.intro}>
              Follow the instruction, the agent’s response, and the physical
              execution in these scenario demonstrations. Pause to read the
              on-screen exchanges.
            </p>
            <div className={styles.demos}>
              <figure className={styles.demo}>
                <div className={styles.videoFrame}>
                  <video
                    controls
                    playsInline
                    preload="none"
                    poster="/magma-bench/make-coffee.webp"
                    width="512"
                    height="752"
                    aria-label="Coffee preparation demonstration, played at twice the original speed">
                    <source src="/magma-bench/make-coffee.mp4" type="video/mp4" />
                    <a href="/magma-bench/make-coffee.mp4">Download the coffee demonstration.</a>
                  </video>
                </div>
                <figcaption className={styles.demoCaption}>
                  <div className={styles.captionHeading}>
                    <Heading as="h3">Make coffee</Heading>
                    <span className={styles.tag}>Scenario demo · 2× speed</span>
                  </div>
                  <p>
                    A user gives a constraint "No black coffee anymore". Later, another user asks for a black coffee. The agent must refuses, the user ask for a milky instead. The agent can start the preparation.
                  </p>
                </figcaption>
              </figure>
              <figure className={styles.demo}>
                <div className={styles.videoFrame}>
                  <video
                    controls
                    playsInline
                    preload="none"
                    poster="/magma-bench/fleet-assembly.webp"
                    width="1024"
                    height="1024"
                    aria-label="Multi-robot fleet assembly preview, played at four times the original speed">
                    <source src="/magma-bench/fleet-assembly.mp4" type="video/mp4" />
                    <a href="/magma-bench/fleet-assembly.mp4">Download the fleet assembly demonstration.</a>
                  </video>
                </div>
                <figcaption className={styles.demoCaption}>
                  <div className={styles.captionHeading}>
                    <Heading as="h3">Fleet assembly</Heading>
                    <span className={styles.tag}>Extension preview · 4× speed</span>
                  </div>
                  <p>
                    Multiple robots share an assembly workspace and follow product
                    recipes. A preview of an additional scenario beyond the
                    released v2.0.0 suite.
                  </p>
                </figcaption>
              </figure>
            </div>
          </section>

          <section className={styles.section} aria-labelledby="interface-title">
            <p className={styles.eyebrow}>What is being evaluated?</p>
            <Heading as="h2" id="interface-title">Your decision system. A shared skill interface.</Heading>
            <p className={styles.intro}>
              Bring a single model or a multi-agent system, centralized or
              decentralized, with or without a task planner. MAGMA-BENCH evaluates
              the system’s high-level decisions through the same interface.
            </p>
            <figure className={styles.diagram}>
              <a href="/img/agent-schema.png" aria-label="Open the full-size agent architecture diagram">
                <img
                  className={styles.diagramImage}
                  src="/img/agent-schema.png"
                  alt="A flexible agent architecture, using a single model, a planner with an LLM, or multiple agents, calls robot skills through a common interface. User instructions, structured observations, and execution feedback return to the agent. Evaluation focuses on high-level reasoning and orchestration, with perception abstracted through tools."
                  width="1743"
                  height="706"
                  loading="lazy"
                />
              </a>
              <figcaption className={styles.diagramCaption}>
                MAGMA-BENCH evaluates high-level skill selection and orchestration
                in simulation. Your agent may include its own task planner;
                the motion planner used to execute robot skills is provided by
                the benchmark setup.
              </figcaption>
            </figure>
            <Link className={styles.textLink} to="/docs/custom-agent/overview">Explore the agent interface <span aria-hidden="true">→</span></Link>
          </section>

          <section className={styles.section} aria-labelledby="scenarios-title">
            <p className={styles.eyebrow}>Inside the benchmark</p>
            <Heading as="h2" id="scenarios-title">Keep track. Adapt. Coordinate.</Heading>
            <div className={styles.challengeGrid}>
              <div>
                <span className={styles.challengeNumber}>01</span>
                <Heading as="h3">Maintain task state</Heading>
                <p>Carry instructions, rules, and unfinished work across a long interaction.</p>
              </div>
              <div>
                <span className={styles.challengeNumber}>02</span>
                <Heading as="h3">Handle changes and failures</Heading>
                <p>Revise decisions when execution fails, instructions change, or work is interrupted.</p>
              </div>
              <div>
                <span className={styles.challengeNumber}>03</span>
                <Heading as="h3">Coordinate robots</Heading>
                <p>Assign skills to robots with different capabilities while keeping their shared task coherent.</p>
              </div>
            </div>
            <figure className={styles.scenarioFigure}>
              <img
                src="/magma-bench/scenarios.webp"
                alt="Twelve scenario families grouped by execution robustness, partial information, and multi-robot coordination: warehouse sorting, laundry, button pressing, coffee preparation, table cleaning, packaging, delivery, color sorting, bi-robot sorting, advanced table cleaning, hall sorting, and advanced delivery."
                width="3200"
                height="830"
                loading="lazy"
              />
              <figcaption>
                Representative environments from 12 scenario families. The
                downloadable v1.0.0 release contains 19 scenario IDs, including
                variants.
              </figcaption>
            </figure>
          </section>

          <section className={styles.section} aria-labelledby="results-title">
            <p className={styles.eyebrow}>Evaluation analysis</p>
            <Heading as="h2" id="results-title">What happens as tasks get longer?</Heading>
            <p className={styles.intro}>
              These evaluations show success and partial progress across task
              horizons. They are research results; the public leaderboard is
              planned for v3.
            </p>
            <Tabs>
              <TabItem value="full" label="Full benchmark · 1,254 episodes">
                <figure className={styles.resultsFigure}>
                  <img
                    src="/magma-bench/horizon-full.webp"
                    alt="Full benchmark: success rates generally fall as horizons increase from short to extreme. The adjacent table reports goal completion for each model and horizon."
                    width="1600"
                    height="706"
                    loading="lazy"
                  />
                  <figcaption>Zero-shot models and state-tracking baselines on the full benchmark.</figcaption>
                </figure>
              </TabItem>
              <TabItem value="mini" label="Frontier and Finetuned Models · 215 episodes">
                <figure className={styles.resultsFigure}>
                  <img
                    src="/magma-bench/horizon-mini.webp"
                    alt="Shared 215-episode subset: success rates by horizon for GPT-OSS, fine-tuned Qwen3, Gemini Robotics ER, and GPT. The adjacent table reports goal completion."
                    width="1600"
                    height="706"
                    loading="lazy"
                  />
                  <figcaption>Selected models evaluated on the same 215-episode subset. Compare models within the same evaluation set.</figcaption>
                </figure>
              </TabItem>
            </Tabs>
            <dl className={styles.metrics}>
              <div>
                <dt>Success rate (SR)</dt>
                <dd>How often the complete task is solved.</dd>
              </div>
              <div>
                <dt>Goal completion (GC)</dt>
                <dd>How much of the task is completed, including partial progress.</dd>
              </div>
              <div>
                <dt>Robustness</dt>
                <dd>How well success is retained when execution or instructions are perturbed.</dd>
              </div>
            </dl>
            <div className={styles.resourceLinks}>
              <Link to="https://arxiv.org/abs/2610.13534">Experimental protocol and discussion</Link>
            </div>
          </section>

          <aside className={styles.roadmap} aria-labelledby="roadmap-title">
            <div>
              <p className={styles.eyebrow}>Upcoming work · v3</p>
              <Heading as="h2" id="roadmap-title">More scenarios. A public leaderboard.</Heading>
              <p>
                New scenarios and a public leaderboard are planned for the v3
                release after review, targeting late December 2026.
              </p>
            </div>
            <span className={styles.roadmapDate}>Planned<br /><strong>December 2026</strong></span>
          </aside>

          <section className={`${styles.section} ${styles.getStarted}`} aria-labelledby="start-title">
            <p className={styles.eyebrow}>Try it with your agent</p>
            <Heading as="h2" id="start-title">From your model to an evaluation.</Heading>
            <ol className={styles.steps}>
              <li>
                <Heading as="h3">Install &amp; download</Heading>
                <p>Set up the simulator and fetch the versioned benchmark.</p>
                <Link to="/docs/use-magma-bench/installation">Installation guide →</Link>
              </li>
              <li>
                <Heading as="h3">Connect an agent</Heading>
                <p>Use a provided agent or connect your own decision system.</p>
                <Link to="/docs/custom-agent/overview">Agent integration →</Link>
              </li>
              <li>
                <Heading as="h3">Run &amp; inspect</Heading>
                <p>Evaluate the suite, inspect episode results, and export a summary.</p>
                <Link to="/docs/use-magma-bench/run">Evaluation guide →</Link>
              </li>
            </ol>
            <p className={styles.requirements}>
              Linux x86_64 · Python 3.12 · Docker · Compatible graphics drivers
              and Vulkan for simulation rendering. Agent and answer-verifier
              backends are configured separately.
            </p>
            <Link className={`button button--lg ${styles.primaryButton}`} to="/docs/use-magma-bench/installation">Start your first evaluation</Link>
          </section>
        </div>
      </main>
    </Layout>
  );
}
