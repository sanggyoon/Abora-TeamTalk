import styles from './Header.module.css';

export default function Header() {
    return (
        <div className={styles.header}>
            <h1 className={styles.logo}></h1>
        </div>
    );
}