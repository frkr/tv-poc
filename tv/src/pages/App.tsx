import { useFocusManager } from "@solidtv/solid/primitives";

declare module "@solidtv/solid" {
  interface KeyMap {
    Back: (string | number)[];
  }
  interface ElementNode {
    item?: any;
  }
}

const App = (props: any) => {
  useFocusManager({
    Back: ["Backspace", 8, 10009, "b"],
    Escape: ["Escape", 27],
    Left: ["ArrowLeft", 37],
    Right: ["ArrowRight", 39],
    Up: ["ArrowUp", 38],
    Down: ["ArrowDown", 40],
    Enter: ["Enter", 13],
    Play: ["Play", 415],
    Pause: ["Pause", 19],
    PlayPause: ["PlayPause", 10252],
  });

  return props.children;
};

export default App;
