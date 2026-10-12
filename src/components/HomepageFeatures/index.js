import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const projects = [
  {
    title: 'MAGMA-GEN',
    status: 'Stable v2 release',
    image: require('@site/static/img/magma-gen-logo.png').default,
    link: '/magma-gen',
    description: 'Generate training data from your agent’s own experience. Explore decisions, test coached corrections, and export examples for supervised learning.',
    action: 'Explore data generation →',
  },
  {
    title: 'MAGMA-BENCH',
    status: 'Benchmark v1.0.0',
    image: require('@site/static/img/magma-bench-logo.png').default,
    link: '/magma-bench',
    description: 'Evaluate agents on interactive manipulation tasks and track progress between model versions. Install the required packages, download the benchmark, and run your agent.',
    action: 'Explore the benchmark →',
  },
];

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <Heading as="h2">Two projects supporting the learning workflow</Heading>
        <div className="row">
          {projects.map(({title, status, image, link, description, action}) => (
            <div className="col col--6" key={title}>
              <Link to={link} className={styles.featureCard}>
                <img src={image} className={styles.featureImg} alt="" loading="lazy" />
                <p className={styles.projectStatus}>{status}</p>
                <Heading as="h3">{title}</Heading>
                <p>{description}</p>
                <span className={styles.projectAction}>{action}</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
