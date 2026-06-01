export default function generateTvToken(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const array = new Uint8Array(6);
    crypto.getRandomValues(array);
    let part1 = "";
    let part2 = "";
    for (let i = 0; i < 3; i++) {
        part1 += chars[array[i] % chars.length];
        part2 += chars[array[i + 3] % chars.length];
    }
    return `${part1}-${part2}`;
}
