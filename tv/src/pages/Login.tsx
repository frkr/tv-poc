import { createSignal, For, Show } from "solid-js";
import { Column, Row } from "@solidtv/solid/primitives";
import { useNavigate } from "@solidjs/router";
import { api } from "../lib/api";
import { setToken } from "../lib/store";
import theme from "theme";

const KEY_ROWS = [
  ["A", "B", "C", "D", "E", "F", "G"],
  ["H", "I", "J", "K", "L", "M", "N"],
  ["O", "P", "Q", "R", "S", "T", "U"],
  ["V", "W", "X", "Y", "Z", "0", "1"],
  ["2", "3", "4", "5", "6", "7", "8"],
  ["9", "DEL", "OK"],
];

function Key(props: { label: string; wide?: boolean; autofocus?: boolean; onEnter: () => void }) {
  const [focused, setFocused] = createSignal(false);
  return (
    <view
      width={props.wide ? 120 : 74}
      height={74}
      borderRadius={10}
      display="flex"
      justifyContent="center"
      alignItems="center"
      autofocus={props.autofocus}
      onFocusChanged={setFocused}
      onEnter={() => {
        props.onEnter();
        return true;
      }}
      color={focused() ? theme.accent : theme.card}
    >
      <text fontFamily="Roboto700" fontSize={30} color={focused() ? theme.backgroundDark : theme.textPrimary}>
        {props.label === "DEL" ? "Apagar" : props.label === "OK" ? "Entrar" : props.label}
      </text>
    </view>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [code, setCode] = createSignal<string>("");
  const [error, setError] = createSignal<string>("");
  const [loading, setLoading] = createSignal(false);

  const formatted = () => {
    const c = code().padEnd(6, "·");
    return `${c.slice(0, 3)} - ${c.slice(3, 6)}`;
  };

  const press = (key: string) => {
    setError("");
    if (key === "DEL") {
      setCode((c) => c.slice(0, -1));
    } else if (key === "OK") {
      void submit();
    } else if (code().length < 6) {
      setCode((c) => c + key);
    }
  };

  const submit = async () => {
    if (code().length < 6) {
      setError("Digite o código completo (6 caracteres).");
      return;
    }
    setLoading(true);
    const token = `${code().slice(0, 3)}-${code().slice(3, 6)}`;
    setToken(token);
    try {
      await api.home();
      navigate("/", { replace: true });
    } catch {
      setToken("");
      setError("Código inválido ou expirado. Gere outro em curso.ideias.casa/tv");
    } finally {
      setLoading(false);
    }
  };

  return (
    <view width={theme.layout.screenW} height={theme.layout.screenH} color={theme.backgroundDark}>
      <view width={900} height={1080} x={510} display="flex" flexDirection="column" alignItems="center" color={theme.transparent}>
        <text y={120} fontFamily="Roboto700" fontSize={48} color={theme.accent}>
          Cursos TV
        </text>
        <text y={196} fontSize={24} color={theme.textSecondary} width={760} textAlign="center" contain="width">
          Acesse curso.ideias.casa/tv no seu celular ou computador, faça login e digite o código abaixo.
        </text>

        <view y={270} width={420} height={84} borderRadius={12} color={theme.surface} display="flex" justifyContent="center" alignItems="center">
          <text fontFamily="Roboto700" fontSize={44} color={theme.textPrimary} letterSpacing={6}>
            {formatted()}
          </text>
        </view>

        <Show when={error()}>
          <text y={370} fontSize={20} color={theme.error} width={760} textAlign="center" contain="width">
            {error()}
          </text>
        </Show>
        <Show when={loading()}>
          <text y={370} fontSize={20} color={theme.textSecondary}>
            Verificando...
          </text>
        </Show>

        <Column y={420} gap={12} plinko>
          <For each={KEY_ROWS}>
            {(row, rowIndex) => (
              <Row gap={12} height={74}>
                <For each={row}>
                  {(key, keyIndex) => (
                    <Key
                      label={key}
                      wide={key === "DEL" || key === "OK"}
                      autofocus={rowIndex() === 0 && keyIndex() === 0}
                      onEnter={() => press(key)}
                    />
                  )}
                </For>
              </Row>
            )}
          </For>
        </Column>
      </view>
    </view>
  );
}
