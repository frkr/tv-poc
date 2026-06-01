import { createSignal } from "solid-js";

const TOKEN_KEY = "tv_token";

function readToken(): string {
  try {
    return localStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

const [token, setTokenSignal] = createSignal<string>(readToken());

export { token };

export function setToken(value: string) {
  try {
    if (value) localStorage.setItem(TOKEN_KEY, value);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
  setTokenSignal(value);
}

export function clearToken() {
  setToken("");
}
