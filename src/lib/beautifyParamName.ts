import { paramName } from "@/global";

export const beautifyParamName = (name: paramName): string  => {
    return name.split('_').map((word, i) => (i === 0 ? word.charAt(0).toUpperCase() : word.charAt(0)) + word.slice(1)).join(' ');
}