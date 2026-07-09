'use client';
import * as React from 'react';

type Block = {
  id: string;
  type: string;
  data: any;
};

function renderBlock(block: Block, index: number) {
  if (block.type === 'paragraph') {
      const text = block.data?.text;
      const displayText =
        typeof text === 'string' ? (
          <span dangerouslySetInnerHTML={{ __html: text }} />
        ) : (
          JSON.stringify(text)
        );

      return (
        <p key={index} className="mb-2 text-gray-800">
          {displayText}
        </p>
      );
    }


}

export default function DescriptionRendererLite({ data }: { data: any }) {
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
    return <p className="text-gray-800 line-clamp-3 whitespace-pre-wrap">{parsed}</p>;
  }

  return <p className="text-gray-500">Tidak ada deskripsi.</p>;
}
