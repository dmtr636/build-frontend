import exifr from "exifr";

export interface SimpleImageMetadata {
    dateTimeOriginal?: string;
    dateCreation?: string;
    gps?: { lat: number; lon: number; altitude?: number };
    raw: any;
}

function dmsToDecimal(val: any, ref?: string): number | undefined {
    if (val == null) return undefined;

    if (typeof val === "number") return val;

    if (Array.isArray(val)) {
        const [deg, min, sec] = val.map(Number);
        if (isNaN(deg) || isNaN(min)) return undefined;

        const decimal = deg + min / 60 + (isNaN(sec) ? 0 : sec / 3600);
        const sign = ref === "S" || ref === "W" ? -1 : 1;
        return sign * decimal;
    }

    return undefined;
}

function parseDate(dateValue: any): string | undefined {
    if (!dateValue) return undefined;

    try {
        // Если дата уже в формате ISO строки
        if (typeof dateValue === "string" && dateValue.includes("T")) {
            const date = new Date(dateValue);
            return !isNaN(date.getTime()) ? date.toISOString() : undefined;
        }

        // Для EXIF дат в формате "YYYY:MM:DD HH:MM:SS"
        if (typeof dateValue === "string" && dateValue.includes(":")) {
            const dateStr = dateValue.replace(/(\d{4}):(\d{2}):(\d{2})/, "$1-$2-$3");
            const date = new Date(dateStr);
            return !isNaN(date.getTime()) ? date.toISOString() : undefined;
        }

        // Для объектов Date и timestamp
        const date = new Date(dateValue);
        return !isNaN(date.getTime()) ? date.toISOString() : undefined;
    } catch {
        return undefined;
    }
}

export async function extractImageMetadata(file: File): Promise<SimpleImageMetadata> {
    if (!file.type || !file.type.startsWith("image/")) {
        console.log(file);
        return { raw: {} };
    }

    try {
        const arrayBuffer = await file.arrayBuffer();
        console.log(arrayBuffer);
        const raw = await exifr.parse(arrayBuffer);
        console.log(raw);

        if (!raw || Object.keys(raw).length === 0) {
            return { raw: {} };
        }

        const dateTimeOriginal = parseDate(
            raw?.DateTimeOriginal || raw?.CreateDate || raw?.ModifyDate,
        );

        const dateCreation = parseDate(
            raw?.FileCreateDate || raw?.CreateDate || raw?.FileModifyDate,
        );

        let gps: { lat: number; lon: number; altitude?: number } | undefined;

        const lat = dmsToDecimal(raw?.latitude ?? raw?.GPSLatitude, raw?.GPSLatitudeRef);
        const lon = dmsToDecimal(raw?.longitude ?? raw?.GPSLongitude, raw?.GPSLongitudeRef);

        if (lat != null && lon != null) {
            gps = {
                lat,
                lon,
                altitude: typeof raw?.GPSAltitude === "number" ? raw.GPSAltitude : undefined,
            };
        }

        return {
            dateTimeOriginal,
            dateCreation,
            gps,
            raw,
        };
    } catch (error) {
        console.error("Error extracting image metadata:", error);
        return { raw: {} };
    }
}
