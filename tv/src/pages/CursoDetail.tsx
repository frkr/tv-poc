import { createResource, createSignal, For, Show } from "solid-js";
import { Column } from "@solidtv/solid/primitives";
import { useNavigate, useParams, useSearchParams } from "@solidjs/router";
import type { Episodio } from "../lib/types";
import { api } from "../lib/api";
import theme from "theme";

function EpisodeItem(props: { index: number; ep: Episodio; autofocus?: boolean; onEnter: () => void }) {
  const [focused, setFocused] = createSignal(false);
  const statusLabel = () => {
    if (props.ep.concluido) return "Concluído";
    if (props.ep.progresso > 0) return "Continuar";
    return "Assistir";
  };
  return (
    <view
      width={1500}
      height={84}
      borderRadius={10}
      display="flex"
      flexDirection="row"
      alignItems="center"
      padding={20}
      gap={20}
      autofocus={props.autofocus}
      onFocusChanged={setFocused}
      onEnter={() => {
        props.onEnter();
        return true;
      }}
      color={focused() ? theme.cardFocus : theme.card}
      border={focused() ? { width: 2, color: theme.accent } : { width: 0, color: theme.transparent }}
    >
      <text fontFamily="Roboto700" fontSize={26} color={theme.accent} width={48}>
        {String(props.index + 1).padStart(2, "0")}
      </text>
      <text fontSize={26} color={theme.textPrimary} maxLines={1} width={1100}>
        {props.ep.nome}
      </text>
      <text fontFamily="Roboto700" fontSize={20} color={props.ep.concluido ? theme.success : theme.textSecondary} width={180} textAlign="right">
        {statusLabel()}
      </text>
    </view>
  );
}

export default function CursoDetail() {
  const params = useParams();
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const [data] = createResource(
    () => params.id_curso,
    (id) => api.episodios(id)
  );

  const nome = () => (search.nome ? decodeURIComponent(String(search.nome)) : "Episódios");

  return (
    <view width={1540} height={960} color={theme.transparent}>
      <text fontFamily="Roboto700" fontSize={34} color={theme.textPrimary} maxLines={1} width={1500}>
        {nome()}
      </text>

      <view y={70} width={1540} height={880} color={theme.transparent}>
        <Show
          when={!data.error}
          fallback={<text fontSize={24} color={theme.textSecondary}>Não foi possível carregar os episódios.</text>}
        >
          <Show when={data()} fallback={<text fontSize={24} color={theme.textSecondary}>Carregando...</text>}>
          <Show
            when={data()!.episodios?.length}
            fallback={
              <text fontSize={24} color={theme.textSecondary}>
                Este curso ainda não tem episódios publicados.
              </text>
            }
          >
            <Column gap={14} plinko scroll="always" height={880}>
              <For each={data()!.episodios}>
                {(ep, index) => (
                  <EpisodeItem
                    index={index()}
                    ep={ep}
                    autofocus={index() === 0}
                    onEnter={() => navigate(`/player/${params.id_curso}/${ep.id}`)}
                  />
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
