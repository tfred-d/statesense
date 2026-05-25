// Type declaration for the `?url` query suffix Next.js / Webpack / Turbopack
// use to resolve an asset's URL at build time. Used in lib/pdf.ts to point
// pdfjs at its worker file without needing a separate route.

declare module "*?url" {
  const url: string;
  export default url;
}
