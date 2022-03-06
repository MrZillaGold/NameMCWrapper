import { Element } from 'cheerio';

/**
 * Minecraft HEX colors
 */
export enum Color {
    BLACK = '000000',
    DARK_BLUE = '0000AA',
    DARK_GREEN = '00AA00',
    DARK_AQUA = '00AAAA',
    DARK_RED = 'AA0000',
    DARK_PURPLE = 'AA00AA',
    GOLD = 'FFAA00',
    GRAY = 'AAAAAA',
    DARK_GRAY = 'AAAAAA',
    BLUE = '5555FF',
    GREEN = '55FF55',
    AQUA = '55FFFF',
    RED = 'FF5555',
    LIGHT_PURPLE = 'FF55FF',
    YELLOW = 'FFFF55',
    WHITE = 'FFFFFF',
    RESET = 'AAAAAA'
}

/**
 * Minecraft formatting css styles
 */
export enum Style {
    BOLD = 'font-weight: bold;',
    UNDERLINED = 'text-decoration: underline;',
    STRIKETHROUGH = 'text-decoration: line-through;',
    ITALIC = 'font-style: italic;'
}

export function escapeColorsClasses(elements: Element[]): Element[] {
    return elements.map((element) => {
        if (element.children && element.children.length !== 1) {
            return escapeColorsClasses(element.children as Element[]);
        }

        if (element.attribs?.class) {
            element.attribs.style = element.attribs.class.split(' ')
                .map((style: string) => {
                    style = style.replace('mc-', '')
                        .replace('-', '_');

                    if (Object.keys(Style).includes(style.toUpperCase())) {
                        return Style[style as keyof typeof Style];
                    }

                    return `color: #${Color[style.toUpperCase() as keyof typeof Color]};`;
                })
                .join('');

            delete element.attribs.class;
        }

        return element;
    })
        .flat(Infinity) as Element[];
}
