import { onRequestPost as __api_tts_ts_onRequestPost } from "E:\\vscode\\workspace\\shorts-lab\\functions\\api\\tts.ts"

export const routes = [
    {
      routePath: "/api/tts",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_tts_ts_onRequestPost],
    },
  ]