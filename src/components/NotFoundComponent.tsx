"use client";
import { XCircle } from "lucide-react";
import React from "react";

const NotFoundComponent = ({ text }: { text: string }) => {
  return (
    <>
      <XCircle className="w-12 h-12 text-red-500/50 mx-auto mb-4" />
      <p className="text-gray-500">{text}</p>
    </>
  );
};

export default NotFoundComponent;
