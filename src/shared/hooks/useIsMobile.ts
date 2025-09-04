import useWindowDimensions from "src/shared/utils/useWindowDimensions.ts";

export const useIsMobile = () => {
    const dimensions = useWindowDimensions();
    return dimensions.width < 768;
};
