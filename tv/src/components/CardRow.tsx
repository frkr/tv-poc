import { For, Show, JSX } from "solid-js";
import { Row } from "@solidtv/solid/primitives";
import theme from "theme";

interface CardRowProps<T> {
  title: string;
  items: T[];
  autofocus?: boolean;
  gap?: number;
  y?: number;
  children: (item: T, index: () => number) => JSX.Element;
}

export default function CardRow<T>(props: CardRowProps<T>) {
  return (
    <view width={1540} display="flex" flexDirection="column" color={theme.transparent}>
      <text fontFamily="Roboto700" fontSize={28} color={theme.textPrimary} marginBottom={14}>
        {props.title}
      </text>
      <Show
        when={props.items.length}
        fallback={
          <text fontSize={20} color={theme.textSecondary}>
            Nada por aqui ainda.
          </text>
        }
      >
        <Row gap={props.gap ?? 28} height={250} width={1540} scroll="always" autofocus={props.autofocus}>
          <For each={props.items}>{(item, index) => props.children(item, index)}</For>
        </Row>
      </Show>
    </view>
  );
}
