export class TextMeasurer {
    private static canvas: HTMLCanvasElement | null = null;

    static getTextWidth(text: string, element: HTMLElement) {
        if (!this.canvas) {
            this.canvas = document.createElement("canvas");
        }
        const context = this.canvas.getContext("2d");
        if (!context) {
            throw new Error("Could not get text width");
        }
        context.font = this.getCanvasFont(element);
        const metrics = context.measureText(text);
        const letterSpacingStyle = this.getCssStyle(element, "letter-spacing");
        const letterSpacing = Number(letterSpacingStyle.replace("px", "")) || 0;
        return metrics.width + letterSpacing * (text.length - 1);
    }

    private static getCanvasFont(element: HTMLElement) {
        const fontWeight = this.getCssStyle(element, "font-weight") || "normal";
        const fontSize = this.getCssStyle(element, "font-size") || "16px";
        const fontFamily = this.getCssStyle(element, "font-family") || "Manrope";

        return `${fontWeight} ${fontSize} ${fontFamily}`;
    }

    private static getCssStyle(element: Element, property: string) {
        return window.getComputedStyle(element, null).getPropertyValue(property);
    }
}
