import styles from "../../../styles/layouts/MobileApp.module.css"
import { Icon } from "@iconify/react"
import appScreenshot from "../../../assets/connecta-app.png"

const MobileApp = () => {
    return (
        <div className={styles.MobileApp} id="download">
            <div className={styles.container}>
                <div className={styles.content}>
                    <div className={styles.textContent}>
                        <span className={styles.badge}>
                            <Icon icon="mdi:cellphone" className={styles.badgeIcon} />
                            Mobile App
                        </span>
                        <h2 className={styles.title}>
                            Take Connecta Everywhere You Go
                        </h2>
                        <p className={styles.description}>
                            Download our mobile app and manage your freelance business on the go. Find jobs, submit proposals, communicate with clients, and track your projects from anywhere.
                        </p>

                        <div className={styles.features}>
                            <div className={styles.feature}>
                                <Icon icon="mdi:check-circle" className={styles.checkIcon} />
                                <span>Real-time notifications</span>
                            </div>
                            <div className={styles.feature}>
                                <Icon icon="mdi:check-circle" className={styles.checkIcon} />
                                <span>Instant messaging</span>
                            </div>
                            <div className={styles.feature}>
                                <Icon icon="mdi:check-circle" className={styles.checkIcon} />
                                <span>Quick job applications</span>
                            </div>
                            <div className={styles.feature}>
                                <Icon icon="mdi:check-circle" className={styles.checkIcon} />
                                <span>Track earnings & payments</span>
                            </div>
                        </div>

                        <div className={styles.downloadButtons}>
                            <a
                                href="https://play.google.com/store"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.storeButton}
                            >
                                <Icon icon="mdi:google-play" className={styles.storeIcon} />
                                <div className={styles.storeText}>
                                    <span className={styles.getItOn}>GET IT ON</span>
                                    <span className={styles.storeName}>Google Play</span>
                                </div>
                            </a>

                            <a
                                href="https://apps.apple.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.storeButton}
                            >
                                <Icon icon="mdi:apple" className={styles.storeIcon} />
                                <div className={styles.storeText}>
                                    <span className={styles.getItOn}>Download on the</span>
                                    <span className={styles.storeName}>App Store</span>
                                </div>
                            </a>
                        </div>
                    </div>

                    <div className={styles.phonePreview}>
                        <div className={styles.phoneFrame}>
                            <div className={styles.phoneScreen}>
                                <img
                                    src={appScreenshot}
                                    alt="Connecta Mobile App"
                                    className={styles.appImage}
                                />
                            </div>
                        </div>
                        <div className={styles.floatingElement1}></div>
                        <div className={styles.floatingElement2}></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MobileApp
