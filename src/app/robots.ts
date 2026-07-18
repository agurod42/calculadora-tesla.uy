import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: "https://calculadoratesla.uy/sitemap.xml",
    host: "https://calculadoratesla.uy",
  };
}
