import styles from "./Skeleton.module.scss";

interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    margin?: string;
}

export const Skeleton = (props: SkeletonProps) => {
    return (
        <div
            className={styles.skeleton}
            style={{
                width: props.width,
                height: props.height,
                margin: props.margin,
            }}
        ></div>
    );
};
