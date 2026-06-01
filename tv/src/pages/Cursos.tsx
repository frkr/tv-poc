import { createResource, createSignal, For, Show } from "solid-js";
import { Column, Row } from "@solidtv/solid/primitives";
import { useNavigate } from "@solidjs/router";
import Card from "../components/Card";
import CardRow from "../components/CardRow";
import { api } from "../lib/api";
import theme from "theme";

function Chip(props: { label: string; autofocus?: boolean; onEnter: () => void }) {
  const [focused, setFocused] = createSignal(false);
  return (
    <view
      height={56}
      minWidth={140}
      borderRadius={28}
      display="flex"
      justifyContent="center"
      alignItems="center"
      padding={24}
      autofocus={props.autofocus}
      onFocusChanged={setFocused}
      onEnter={() => {
        props.onEnter();
        return true;
      }}
      color={focused() ? theme.primaryLight : theme.card}
    >
      <text fontSize={22} color={focused() ? theme.backgroundDark : theme.textPrimary}>
        {props.label}
      </text>
    </view>
  );
}

export default function Cursos() {
  const navigate = useNavigate();
  const [home] = createResource(() => api.home());

  return (
    <Show
      when={!home.error}
      fallback={
        <text fontSize={28} color={theme.textSecondary} width={1500} contain="width">
          Não foi possível carregar. Verifique sua conexão ou gere um novo código em curso.ideias.casa/tv
        </text>
      }
    >
      <Show when={home()} fallback={<text fontSize={28} color={theme.textSecondary}>Carregando...</text>}>
      {(data) => {
        const hasContinue = () => data().continue_watching?.length > 0;
        return (
          <Column gap={44} width={1540}>
            <Show when={hasContinue()}>
              <CardRow
                title="Continue assistindo"
                items={data().continue_watching}
                autofocus
              >
                {(item, index) => (
                  <Card
                    title={item.curso_nome}
                    subtitle={item.episodio_nome}
                    image={item.curso_thumbnail || item.episodio_thumbnail}
                    progress={item.progresso ? Math.min(1, item.progresso / 3600) : 0}
                    autofocus={index() === 0}
                    onEnter={() => navigate(`/player/${item.id_curso}/${item.episodio_id}`)}
                  />
                )}
              </CardRow>
            </Show>

            <CardRow
              title="Adicionados recentemente"
              items={data().recent_courses || []}
              autofocus={!hasContinue()}
            >
              {(curso, index) => (
                <Card
                  title={curso.nome}
                  subtitle={curso.descricao}
                  image={curso.thumbnail}
                  autofocus={!hasContinue() && index() === 0}
                  onEnter={() => navigate(`/curso/${curso.id}?nome=${encodeURIComponent(curso.nome)}`)}
                />
              )}
            </CardRow>

            <Show when={data().categorias?.length}>
              <view width={1540} display="flex" flexDirection="column" color={theme.transparent}>
                <text fontFamily="Roboto700" fontSize={28} color={theme.textPrimary} marginBottom={14}>
                  Categorias
                </text>
                <Row gap={18} height={56} scroll="always" width={1540}>
                  <For each={data().categorias}>
                    {(cat) => <Chip label={cat.categoria} onEnter={() => navigate("/categorias")} />}
                  </For>
                </Row>
              </view>
            </Show>
          </Column>
        );
      }}
      </Show>
    </Show>
  );
}
