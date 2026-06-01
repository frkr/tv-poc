import { createEffect, onMount, ErrorBoundary } from "solid-js";
import { useNavigate } from "@solidjs/router";
import Sidebar from "../components/Sidebar";
import { token } from "../lib/store";
import theme from "theme";

export default function Shell(props: any) {
  const navigate = useNavigate();
  let sidebarRef: any;
  let contentRef: any;

  createEffect(() => {
    if (!token()) navigate("/login", { replace: true });
  });

  const focusSidebar = () => {
    sidebarRef?.setFocus?.();
    return true;
  };

  const focusContent = () => {
    contentRef?.setFocus?.();
  };

  onMount(() => {
    if (!token()) navigate("/login", { replace: true });
  });

  return (
    <view
      width={theme.layout.screenW}
      height={theme.layout.screenH}
      color={theme.backgroundDark}
      onLeft={focusSidebar}
    >
      <Sidebar ref={sidebarRef} focusContent={focusContent} />
      <view
        ref={contentRef}
        x={theme.layout.sidebarW + theme.layout.marginX}
        y={theme.layout.marginY}
        width={theme.layout.screenW - theme.layout.sidebarW - theme.layout.marginX * 2}
        height={theme.layout.screenH - theme.layout.marginY * 2}
        color={theme.transparent}
      >
        <ErrorBoundary
          fallback={(err) => (
            <text fontSize={26} color={theme.error} width={1500} contain="width">
              Não foi possível carregar este conteúdo: {String(err?.message || err)}
            </text>
          )}
        >
          {props.children}
        </ErrorBoundary>
      </view>
    </view>
  );
}
