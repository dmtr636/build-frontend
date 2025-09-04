import { Skeleton } from "src/ui/components/info/Skeleton/Skeleton.tsx";

export const SkeletonList = (props: { margin?: string; gap?: string }) => {
    return (
        <div style={{ display: "grid", gap: props.gap ?? "16px" }}>
            <Skeleton height={36} margin={props.margin} />
            <Skeleton height={36} margin={props.margin} />
            <Skeleton height={36} margin={props.margin} />
            <Skeleton height={36} margin={props.margin} />
            <Skeleton height={36} margin={props.margin} />
            <Skeleton height={36} margin={props.margin} />
            <Skeleton height={36} margin={props.margin} />
            <Skeleton height={36} margin={props.margin} />
            <Skeleton height={36} margin={props.margin} />
            <Skeleton height={36} margin={props.margin} />
        </div>
    );
};
