import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

const choices = [
  {
    color: 'blue',
    image: 'blue_capsule.png',
    label: 'Generate training data',
    product: 'MAGMA-GEN',
    description: 'Explore your agent’s decisions, test corrections, and export training examples.',
    action: 'Start generating',
    destination: '/docs/use-magma-gen/overview',
  },
  {
    color: 'red',
    image: 'red_capsule.png',
    label: 'Evaluate your model',
    product: 'MAGMA-BENCH',
    description: 'Install the required packages, download the benchmark, and evaluate your agent on interactive robot tasks.',
    action: 'Explore the benchmark',
    destination: '/docs/use-magma-bench/overview',
  },
];

export default function MatrixChoice() {
  const imageBaseUrl = useBaseUrl('/img/');

  return (
    <section className={styles.matrixChoice} aria-label="Choose your MAGMA workflow">
      <p className={styles.prompt}>The choice is yours.</p>
      <div className={styles.scene}>
        <img
          className={styles.robot}
          src={`${imageBaseUrl}matrix_magma.png`}
          alt="MAGMA robot wearing sunglasses and offering two open hands."
          width={1536}
          height={1024}
          loading="lazy"
          decoding="async"
        />
        <div className={styles.choices}>
          {choices.map(({color, image, label, product, description, action, destination}) => (
            <Link
              key={color}
              to={destination}
              className={`${styles.choice} ${styles[color]}`}
              aria-label={`${label} with ${product}`}>
              <span className={styles.capsule} aria-hidden="true">
                <span className={styles.capsuleMotion}>
                  <img className={styles.capsuleImage} src={`${imageBaseUrl}${image}`} alt="" />
                </span>
              </span>
              <span className={styles.copy}>
                <span className={styles.pillName}>{color} pill</span>
                <span className={styles.label}>{label}<span aria-hidden="true"> ↗</span></span>
                <span className={styles.overlay}>
                  <strong className={styles.product}>{product}</strong>
                  <span className={styles.description}>{description}</span>
                  <span className={styles.action}>{action}<span aria-hidden="true"> →</span></span>
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
      <p className={styles.hint}>Pick your next move.</p>
    </section>
  );
}
