export default function generateTvToken(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const array = new Uint8Array(6);
    crypto.getRandomValues(array);
    const l = chars.length;
    return `${chars[array[0] % l]}${chars[array[1] % l]}${chars[array[2] % l]}-${chars[array[3] % l]}${chars[array[4] % l]}${chars[array[5] % l]}`;
}
