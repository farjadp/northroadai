import { buildPublicRuntimeConfig, serializeRuntimeConfig } from "@/lib/runtime-config";

export default function Head() {
  const runtimeConfig = buildPublicRuntimeConfig();

  return (
    <>
      <script
        id="nra-runtime-config"
        dangerouslySetInnerHTML={{
          __html: `window.__NRA_RUNTIME_CONFIG__=${serializeRuntimeConfig(runtimeConfig)};`,
        }}
      />
    </>
  );
}
