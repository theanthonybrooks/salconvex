import styles from "./loader-dinosaur.module.css";

export const DinoLoader = () => {
  return (
    <div
      className={styles.loader}
      style={{ "--wh-number": 24 } as React.CSSProperties}
    >
      <div className={styles.pixel} />
    </div>
  );
};
