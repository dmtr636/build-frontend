import styles from "./LoadingScreen.module.scss";
import Lottie from "lottie-react";
import { clsx } from "clsx";
import { animationLoading32 } from "src/ui/assets/animations";

export const LoadingScreen = () => {
    return (
        <div className={styles.container}>
            <Lottie
                className={clsx(styles.loadingAnimation)}
                loop={true}
                animationData={animationLoading32}
            />
        </div>
    );
};
