export function parseDuration(duration: string): number {
    const minute = 60;
    const hour = 60 * minute;
    const day = 24 * hour;

    const offset = [minute, hour, day];

    return duration.split(' ')
        .reverse()
        .reduce((duration, rawValue, index) => {
            const value = Number(rawValue.replace(/[^\d]+/g, ''));

            duration += value * offset[index];

            return duration;
        }, 0);
}