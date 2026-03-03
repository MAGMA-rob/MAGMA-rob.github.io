import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'MAGMA-GEN',
    image: require('@site/static/img/magma-gen-logo.png').default,
    link: '/magma-gen',
    description: (
      <>
        A data generation pipeline to create interaction-grounded data 
        for training agents without humans demonstrations.
      </>
    ),
  },
  {
    title: 'MAGMA-BENCH [SEPTEMBER 2026]',
    image: require('@site/static/img/magma-bench-logo.png').default,
    link: '/magma-bench',
    description: (
      <>
        A benchmark for long-horizon, multi-robot tasks in highly-interactive environments.
      </>
    ),
  },
];

function Feature({image, title, description, link}) {
  return (
    <div className="col col--6">
      <Link to={link} className={styles.featureCard}>
        <div className="text--center">
          <img src={image} className={styles.featureImg} alt={title} />
        </div>
        <div className="text--center padding-horiz--md">
          <Heading as="h3">{title}</Heading>
          <p>{description}</p>
        </div>
      </Link>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
