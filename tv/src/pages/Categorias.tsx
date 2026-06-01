import { createResource, createSignal, createEffect, For, Show } from "solid-js";
import { Column, Row } from "@solidtv/solid/primitives";
import { useNavigate } from "@solidjs/router";
import Card from "../components/Card";
import { api } from "../lib/api";
import type { Curso } from "../lib/types";
import theme from "theme";

const PAGE_LIMIT = 10;

function CategoryButton(props: { label: string; active: boolean; autofocus?: boolean; onEnter: () => void; onFocus: () => void }) {
  const [focused, setFocused] = createSignal(false);
  return (
    <view
      width={300}
      height={58}
      borderRadius={10}
      display="flex"
      alignItems="center"
      padding={18}
      autofocus={props.autofocus}
      onFocusChanged={(f: boolean) => {
        setFocused(f);
        if (f) props.onFocus();
      }}
      onEnter={() => {
        props.onEnter();
        return true;
      }}
      color={focused() ? theme.primaryLight : props.active ? theme.card : theme.transparent}
    >
      <text fontSize={24} color={focused() ? theme.backgroundDark : theme.textPrimary} maxLines={1} width={264}>
        {props.label}
      </text>
    </view>
  );
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export default function Categorias() {
  const navigate = useNavigate();
  const [cats] = createResource(() => api.categorias());
  const [selected, setSelected] = createSignal<string>("");
  const [cursos, setCursos] = createSignal<Curso[]>([]);
  const [page, setPage] = createSignal(1);
  const [hasMore, setHasMore] = createSignal(false);
  const [loading, setLoading] = createSignal(false);
  let gridRef: any;
  let catsRef: any;

  const loadCategory = async (id: string) => {
    if (selected() === id) return;
    setSelected(id);
    setPage(1);
    setLoading(true);
    try {
      const r = await api.cursos(id, 1);
      setCursos(r.cursos || []);
      setHasMore((r.cursos || []).length >= PAGE_LIMIT);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    const next = page() + 1;
    const r = await api.cursos(selected(), next);
    setCursos((c) => [...c, ...(r.cursos || [])]);
    setPage(next);
    setHasMore((r.cursos || []).length >= PAGE_LIMIT);
  };

  createEffect(() => {
    if (cats.loading || cats.error) return;
    const list = cats()?.categorias;
    if (list && list.length && !selected()) {
      void loadCategory(list[0].id);
    }
  });

  return (
    <view width={1540} height={960} color={theme.transparent}>
      <text fontFamily="Roboto700" fontSize={32} color={theme.textPrimary}>
        Categorias
      </text>

      <view y={64} width={1540} height={890} color={theme.transparent}>
        <Column
          ref={catsRef}
          width={300}
          gap={10}
          onRight={() => {
            gridRef?.setFocus?.();
            return true;
          }}
        >
          <Show when={cats.error} fallback={null}>
            <text fontSize={22} color={theme.error} width={280} contain="width">Erro ao carregar categorias.</text>
          </Show>
          <Show
            when={!cats.error && cats()}
            fallback={
              <Show when={!cats.error} fallback={null}>
                <text fontSize={22} color={theme.textSecondary}>Carregando...</text>
              </Show>
            }
          >
            <For each={cats()!.categorias}>
              {(cat, index) => (
                <CategoryButton
                  label={cat.categoria}
                  active={selected() === cat.id}
                  autofocus={index() === 0}
                  onFocus={() => void loadCategory(cat.id)}
                  onEnter={() => void loadCategory(cat.id)}
                />
              )}
            </For>
          </Show>
        </Column>

        <view x={344} width={1196} height={890} color={theme.transparent}>
          <Show
            when={!loading() && cursos().length}
            fallback={
              <text fontSize={24} color={theme.textSecondary}>
                {loading() ? "Carregando cursos..." : "Nenhum curso nesta categoria."}
              </text>
            }
          >
            <Column
              ref={gridRef}
              gap={26}
              plinko
              scroll="always"
              height={890}
              onLeft={() => {
                catsRef?.setFocus?.();
                return true;
              }}
            >
              <For each={chunk(cursos(), 4)}>
                {(rowItems, rowIndex) => (
                  <Row gap={26} height={210}>
                    <For each={rowItems}>
                      {(curso, colIndex) => (
                        <Card
                          width={278}
                          height={210}
                          title={curso.nome}
                          subtitle={curso.descricao}
                          image={curso.thumbnail}
                          autofocus={rowIndex() === 0 && colIndex() === 0}
                          onEnter={() => navigate(`/curso/${curso.id}?nome=${encodeURIComponent(curso.nome)}`)}
                        />
                      )}
                    </For>
                  </Row>
                )}
              </For>
              <Show when={hasMore()}>
                <Row height={70}>
                  <CategoryButton label="Carregar mais" active={false} onEnter={() => void loadMore()} onFocus={() => {}} />
                </Row>
              </Show>
            </Column>
          </Show>
        </view>
      </view>
    </view>
  );
}
