export function convertDate(fullDate: string): number {
    return new Date(
        fullDate.replace(/[^\d\w\s/:]/g, '')
    )
        .getTime() || 0;
}
