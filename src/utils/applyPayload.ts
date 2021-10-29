export function applyPayload<T, P>(context: T, payload: P): void {
    Object.entries(payload)
        .forEach(([key, value]) => {
            (context as any)[key as unknown as keyof P] = value;
        });
}