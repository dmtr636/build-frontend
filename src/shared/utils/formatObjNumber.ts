export function formatObjNumber(num: number | string): string {
    const str = String(num);
    return str.replace(/(\d{3})(\d{3})/, "$1-$2");
}
