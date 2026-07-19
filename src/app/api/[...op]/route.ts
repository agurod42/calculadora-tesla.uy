/**
 * Proxy de OpenPanel: rutea los eventos y el script (op1.js) por nuestro propio
 * dominio (/api/op/...) para que los bloqueadores de anuncios no los corten.
 * La UI apunta acá vía apiUrl/scriptUrl en el OpenPanelComponent (layout.tsx).
 */
import { createRouteHandler } from "@openpanel/nextjs/server";

// OpenPanel es SELF-HOSTED: la API de ingesta vive en la instancia propia, no en
// openpanel.dev (cloud). Sin esto, los eventos vuelven 401 "Invalid client id".
export const { GET, POST } = createRouteHandler({
  apiUrl: "https://openpanel-api.thewisemonkey.co.uk",
});
