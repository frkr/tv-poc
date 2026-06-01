import { createResource, For, Show } from "solid-js";
import { Column, Row } from "@solidtv/solid/primitives";
import Card from "../components/Card";
import { api } from "../lib/api";
import type { Canal } from "../lib/types";
import theme from "theme";

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export default function Canais() {
  const [data] = createResource(() => api.canais());

  return (
    <view width={1540} height={960} color={theme.transparent}>
      <text fontFamily="Roboto700" fontSize={32} color={theme.textPrimary}>
        Canais
      </text>

      <view y={70} width={1540} height={880} color={theme.transparent}>
        <Show
          when={!data.error}
          fallback={<text fontSize={24} color={theme.textSecondary}>Não foi possível carregar os canais.</text>}
        >
          <Show when={data()} fallback={<text fontSize={24} color={theme.textSecondary}>Carregando...</text>}>
          <Show
            when={data()!.canais?.length}
            fallback={
              <text fontSize={24} color={theme.textSecondary}>
                Você ainda não tem canais disponíveis.
              </text>
            }
          >
            <Column gap={26} plinko scroll="always" height={880}>
              <For each={chunk<Canal>(data()!.canais, 4)}>
                {(rowItems, rowIndex) => (
                  <Row gap={26} height={250}>
                    <For each={rowItems}>
                      {(canal, colIndex) => (
                        <Card
                          width={300}
                          height={240}
                          title={canal.nome}
                          subtitle={canal.descricao}
                          image={canal.thumbnail}
                          autofocus={rowIndex() === 0 && colIndex() === 0}
                        />
                      )}
                    </For>
                  </Row>
                )}
              </For>
            </Column>
          </Show>
          </Show>
        </Show>
      </view>
    </view>
  );
}
