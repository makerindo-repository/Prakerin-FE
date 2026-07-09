"use client";
import * as React from "react";

type Block = {
  id: string;
  type: string;
  data: any;
};

function renderBlock(block: Block, index: number) {
  switch (block.type) {
    case "header": {
      const level = block.data?.level;
      const safeLevel = [1, 2, 3, 4, 5, 6].includes(level) ? level : 2;
      const tag = `h${safeLevel}` as keyof React.JSX.IntrinsicElements;
      const text: string = block.data?.text || "";

      // Split teks menjadi bagian link <a> dan teks biasa
      const parts = text.split(/(<a .*?<\/a>)/gi);

      const renderParts = parts.map((part, i) => {
        const match = part.match(/<a href="(.*?)">(.*?)<\/a>/i);
        if (match) {
          const href = match[1];
          const innerText = match[2];
          return (
            <a
              key={i}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              {innerText}
            </a>
          );
        }
        return <span key={i}>{part}</span>; // bagian teks biasa
      });

      return React.createElement(
        tag,
        { key: index, className: "font-bold text-xl mb-2" },
        renderParts
      );
    }

    case "paragraph": {
      const text: string = block.data?.text || "";

      // Regex untuk mendeteksi <a href="...">...</a>
      const parts = text.split(/(<a .*?<\/a>)/gi);

      const renderParts = parts.map((part, i) => {
        const match = part.match(/<a href="(.*?)">(.*?)<\/a>/i);
        if (match) {
          const href = match[1];
          const innerText = match[2];
          return (
            <a
              key={i}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              {innerText}
            </a>
          );
        }
        return <span key={i}>{part}</span>; // bagian teks biasa
      });

      return (
        <p key={index} className="mb-2 text-gray-800">
          {renderParts}
        </p>
      );
    }

    case "list": {
      const Tag = block.data.style === "unordered" ? "ul" : "ol";

      return (
        <ul
          key={index}
          className={`pl-6 mb-2 ${Tag === "ul" ? "list-disc" : "list-decimal"}`}
        >
          {block.data.items.map((item: any, i: number) => (
            <li key={i}>{item.content}</li>
          ))}
        </ul>
      );
    }

    default:
      return (
        <div key={index} className="text-red-500">
          Block <strong>{block.type}</strong> belum didukung.
        </div>
      );
  }
}

export default function RenderBlocks({ data }: { data: any }) {
  if (!data) return <p className="text-gray-500">Tidak ada deskripsi.</p>;

  // If data is already an object and has blocks
  if (data.blocks && Array.isArray(data.blocks)) {
    if (data.blocks.length === 0) {
      return <p className="text-gray-500">Tidak ada deskripsi.</p>;
    }
    return (
      <div className="prose max-w-none">
        {data.blocks.map((block: Block, index: number) =>
          renderBlock(block, index)
        )}
      </div>
    );
  }

  // If data is a string, or if it can be parsed as JSON containing blocks
  let parsed = data;
  if (typeof data === "string") {
    try {
      parsed = JSON.parse(data);
      if (parsed && parsed.blocks && Array.isArray(parsed.blocks)) {
        return (
          <div className="prose max-w-none">
            {parsed.blocks.map((block: Block, index: number) =>
              renderBlock(block, index)
            )}
          </div>
        );
      }
    } catch (e) {
      // It's just a plain string description
    }
  }

  if (typeof parsed === "string" && parsed.trim() !== "") {
    return <p className="text-gray-800 whitespace-pre-wrap">{parsed}</p>;
  }

  return <p className="text-gray-500">Tidak ada deskripsi.</p>;
}
