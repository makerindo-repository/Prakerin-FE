"use client";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

import { Viewer, Worker, SpecialZoomLevel } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";

interface PdfViewerProps {
    file: string;
    title: string;
}

export default function PdfViewer({
    file,
    title,
}: PdfViewerProps) {

    const defaultLayoutPluginInstance =
        defaultLayoutPlugin({
            sidebarTabs: (defaultTabs) => defaultTabs,
        });

    return (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

            {/* ================= HEADER ================= */}

            <div className="border-b border-slate-200 px-8 py-6">

                <h2 className="text-2xl font-bold text-slate-900">
                    {title}
                </h2>

                <p className="mt-2 text-slate-500">
                    Dokumen panduan resmi Prakerin.id
                </p>

            </div>
                        <div
                className="h-[900px] bg-slate-100"
            >
                <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">

                    <Viewer
                        fileUrl={file}
                        plugins={[
                            defaultLayoutPluginInstance,
                        ]}
                        defaultScale={
                            SpecialZoomLevel.PageFit
                        }
                    />

                </Worker>

            </div>
                    </div>
    );
}