import { createSignal, Show } from "solid-js";
import { Image } from "@solidtv/solid/primitives";
import theme from "theme";

interface CardProps {
  title: string;
  subtitle?: string;
  image?: string;
  width?: number;
  height?: number;
  progress?: number; // 0..1
  autofocus?: boolean;
  onEnter?: () => void;
}

export default function Card(props: CardProps) {
  const [focused, setFocused] = createSignal(false);
  const w = () => props.width ?? 300;
  const h = () => props.height ?? 230;
  const imgH = () => Math.round(h() * 0.62);

  return (
    <view
      width={w()}
      height={h()}
      autofocus={props.autofocus}
      onFocusChanged={setFocused}
      onEnter={() => {
        props.onEnter?.();
        return true;
      }}
      scale={focused() ? 1.06 : 1}
      borderRadius={12}
      color={focused() ? theme.cardFocus : theme.card}
      border={focused() ? { width: 3, color: theme.accent } : { width: 0, color: theme.transparent }}
    >
      <Show when={props.image}>
        <Image src={props.image!} width={w()} height={imgH()} borderRadius={[12, 12, 0, 0]} />
      </Show>
      <view
        width={w()}
        height={h() - imgH()}
        y={imgH()}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        padding={12}
        color={theme.transparent}
      >
        <text fontFamily="Roboto700" fontSize={22} color={theme.textPrimary} maxLines={1} width={w() - 24}>
          {props.title}
        </text>
        <Show when={props.subtitle}>
          <text fontSize={18} color={theme.textSecondary} maxLines={1} width={w() - 24} marginTop={4}>
            {props.subtitle}
          </text>
        </Show>
      </view>
      <Show when={props.progress !== undefined && props.progress! > 0}>
        <view width={w()} height={6} y={imgH() - 6} color={theme.surface}>
          <view width={Math.round(w() * Math.min(1, props.progress!))} height={6} color={theme.accent} />
        </view>
      </Show>
    </view>
  );
}
