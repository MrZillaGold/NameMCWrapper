import { Element } from 'cheerio';

export function escapeHtml(elements: Element[]): string {
    return elements.map((element: Element) => {
        if (element.type !== 'text') {
            return escapeHtml(element.children as Element[]);
        }

        // @ts-ignore
        return element.data;
    })
        .join('');
}