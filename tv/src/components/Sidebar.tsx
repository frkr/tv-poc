import { createSignal, For } from "solid-js";
import { Column } from "@solidtv/solid/primitives";
import { useNavigate, useLocation } from "@solidjs/router";
import theme from "theme";

const MENU = [
  { label: "Cursos", path: "/" },
  { label: "Categorias", path: "/categorias" },
  { label: "Canais", path: "/canais" },
];

interface SidebarProps {
  ref?: any;
  focusContent?: () => void;
}

function MenuItem(props: { label: string; active: boolean; autofocus?: boolean; onEnter: () => void }) {
  const [focused, setFocused] = createSignal(false);
  return (
    <view
      width={236}
      height={64}
      borderRadius={10}
      display="flex"
      alignItems="center"
      padding={20}
      autofocus={props.autofocus}
      onFocusChanged={setFocused}
      onEnter={() => {
        props.onEnter();
        return true;
      }}
      color={focused() ? theme.primaryLight : props.active ? theme.card : theme.transparent}
    >
      <text
        fontFamily={focused() || props.active ? "Roboto700" : "Roboto"}
        fontSize={26}
        color={focused() ? theme.backgroundDark : theme.textPrimary}
      >
        {props.label}
      </text>
    </view>
  );
}

export default function Sidebar(props: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const go = (path: string) => {
    navigate(path);
    props.focusContent?.();
  };

  return (
    <view width={theme.layout.sidebarW} height={1080} color={theme.surface}>
      <text x={28} y={44} fontFamily="Roboto700" fontSize={34} color={theme.accent}>
        Cursos TV
      </text>
      <Column
        ref={props.ref}
        x={28}
        y={140}
        width={244}
        gap={14}
        plinko
        onRight={() => {
          props.focusContent?.();
          return true;
        }}
      >
        <For each={MENU}>
          {(item, index) => (
            <MenuItem
              label={item.label}
              active={location.pathname === item.path}
              autofocus={index() === 0}
              onEnter={() => go(item.path)}
            />
          )}
        </For>
      </Column>
    </view>
  );
}
