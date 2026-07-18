/**
 * Proxy de OpenPanel: rutea los eventos y el script (op1.js) por nuestro propio
 * dominio (/api/op/...) para que los bloqueadores de anuncios no los corten.
 * La UI apunta acá vía apiUrl/scriptUrl en el OpenPanelComponent (layout.tsx).
 */
import { createRouteHandler } from "@openpanel/nextjs/server";

export const { GET, POST } = createRouteHandler();
