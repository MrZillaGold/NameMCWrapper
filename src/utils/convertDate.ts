export function convertDate(fullDate: string): number {
    const [date, time] = fullDate.split(', ');

    const ISODate = date
        .split('.')
        .reverse()
        .join('-');

    return new Date(`${ISODate}T${time}`)
        .getTime();
}