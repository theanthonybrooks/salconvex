import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://thestreetartlist.com";

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date().toISOString(),

      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/thelist`,
      lastModified: new Date().toISOString(),

      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date().toISOString(),

      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date().toISOString(),

      changeFrequency: "never",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/map`,
      lastModified: new Date().toISOString(),

      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/calendar`,
      lastModified: new Date().toISOString(),

      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}
