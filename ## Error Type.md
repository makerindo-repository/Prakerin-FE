## Error Type
Runtime ReferenceError

## Error Message
npm is not defined


    at <unknown> (src/app/panduan/PdfViewer.tsx:6:1)
    at <unknown> (src/app/panduan/PdfViewer.tsx:14:25)
    at <unknown> (.next/static/chunks/Codes_Prakerin-FE_src_app_panduan_PdfViewer_tsx_fd4922cf._.js:23:16)
    at GuidePage (src/app/panduan/page.tsx:219:29)

## Code Frame
  4 | import "@react-pdf-viewer/default-layout/lib/styles/index.css";
  5 |
> 6 | import { Viewer, Worker, SpecialZoomLevel } from "@react-pdf-viewer/core";
    | ^
  7 | import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
  8 |
  9 | interface PdfViewerProps {

Next.js version: 15.5.15 (Turbopack)
