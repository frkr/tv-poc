import { createResource, createSignal, createEffect, onMount, onCleanup } from "solid-js";
import { useNavigate, useParams } from "@solidjs/router";
import { api } from "../lib/api";
import type { Episodio } from "../lib/types";
import theme from "theme";

export default function Player() {
  const params = useParams();
  const navigate = useNavigate();

  const [eps] = createResource(
    () => params.id_curso,
    (id) => api.episodios(id)
  );
  const [ready, setReady] = createSignal(false);
  const [status, setStatus] = createSignal("Carregando...");

  let video: HTMLVideoElement | undefined;
  let overlay: HTMLDivElement | undefined;
  let player: any;
  let saveTimer: ReturnType<typeof setInterval> | undefined;
  let overlayTimer: ReturnType<typeof setTimeout> | undefined;
  let loadedId = "";

  const currentEp = (): Episodio | undefined => eps()?.episodios.find((e) => e.id === params.id_episodio);
  const nextEp = (): Episodio | undefined => {
    const list = eps()?.episodios || [];
    const i = list.findIndex((e) => e.id === params.id_episodio);
    return i >= 0 ? list[i + 1] : undefined;
  };

  const showOverlay = (text: string, persist = false) => {
    if (!overlay) return;
    overlay.textContent = text;
    overlay.style.opacity = "1";
    if (overlayTimer) clearTimeout(overlayTimer);
    if (!persist) overlayTimer = setTimeout(() => overlay && (overlay.style.opacity = "0"), 3500);
  };

  const saveProgress = async (concluido = 0) => {
    const ep = currentEp();
    if (!ep || !video) return;
    const t = Math.floor(video.currentTime || 0);
    if (t <= 0 && !concluido) return;
    try {
      await api.saveProgresso(ep.id, t, concluido);
    } catch {
      /* ignore network hiccups */
    }
  };

  const onEnded = async () => {
    await saveProgress(1);
    const nx = nextEp();
    if (nx) navigate(`/player/${params.id_curso}/${nx.id}`, { replace: true });
    else navigate(`/curso/${params.id_curso}`);
  };

  const loadEpisode = async (ep: Episodio) => {
    if (!player || loadedId === ep.id) return;
    loadedId = ep.id;
    setStatus(`Carregando: ${ep.nome}`);
    try {
      await player.load(ep.url, ep.progresso > 0 ? ep.progresso : undefined);
      await video?.play().catch(() => undefined);
      showOverlay(ep.nome);
    } catch (e) {
      setStatus("Não foi possível reproduzir este vídeo.");
      showOverlay("Erro ao carregar o vídeo", true);
    }
  };

  const togglePlay = () => {
    if (!video) return true;
    if (video.paused) {
      void video.play();
      showOverlay(currentEp()?.nome || "");
    } else {
      video.pause();
      showOverlay("Pausado", true);
    }
    return true;
  };

  onMount(async () => {
    video = document.createElement("video");
    video.id = "tv-player";
    video.autoplay = true;
    (video as any).playsInline = true;
    document.body.appendChild(video);

    overlay = document.createElement("div");
    overlay.style.cssText =
      "position:absolute;left:80px;bottom:60px;z-index:3;color:#E6E8EB;font-family:Roboto,Arial,sans-serif;" +
      "font-size:34px;font-weight:700;text-shadow:0 2px 8px rgba(0,0,0,0.8);transition:opacity .4s;opacity:1;max-width:1600px;";
    overlay.textContent = "Carregando...";
    document.body.appendChild(overlay);

    video.addEventListener("ended", onEnded);
    saveTimer = setInterval(() => void saveProgress(), 10000);

    try {
      const mod: any = await import("shaka-player/dist/shaka-player.compiled.js");
      const shaka = mod.default || mod;
      shaka.polyfill.installAll();
      player = new shaka.Player();
      await player.attach(video);
      setReady(true);
    } catch {
      setStatus("Player indisponível neste dispositivo.");
    }
  });

  createEffect(() => {
    if (eps.loading || eps.error) {
      if (eps.error) setStatus("Não foi possível carregar os episódios.");
      return;
    }
    const ep = currentEp();
    if (ready() && ep) {
      loadedId = "";
      void loadEpisode(ep);
    }
  });

  onCleanup(() => {
    if (saveTimer) clearInterval(saveTimer);
    if (overlayTimer) clearTimeout(overlayTimer);
    void saveProgress();
    video?.removeEventListener("ended", onEnded);
    try {
      player?.destroy();
    } catch {
      /* ignore */
    }
    video?.remove();
    overlay?.remove();
  });

  return (
    <view
      autofocus
      width={theme.layout.screenW}
      height={theme.layout.screenH}
      color={theme.transparent}
      onBack={() => {
        void saveProgress();
        navigate(`/curso/${params.id_curso}`);
        return true;
      }}
      onEnter={togglePlay}
      onPlayPause={togglePlay}
      onPlay={() => {
        void video?.play();
        return true;
      }}
      onPause={() => {
        video?.pause();
        return true;
      }}
    >
      <text x={80} y={60} fontSize={26} color={theme.textSecondary} alpha={ready() ? 0 : 1}>
        {status()}
      </text>
    </view>
  );
}
