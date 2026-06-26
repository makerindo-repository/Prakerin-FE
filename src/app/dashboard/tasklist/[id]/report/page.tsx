"use client";

import { ClipboardCheck, Send } from "lucide-react";
import React, { use, useState } from "react"; // 'useState' sudah benar diimpor
import ChatBubble from "@/components/ChatBubble";
import Link from "next/link";
import { alertConfirm } from "@/libs/alert";
import { API, ENDPOINTS } from "@/utils/config";
import Cookies from "js-cookie";
import UnderConstruction from "@/components/UnderConstruction";

// --- Hapus Interface & Data dari sini ---
// Pindahkan ke dalam komponen atau ke file terpisah jika diperlukan

interface Task {
  title: string;
  company: string;
  image?: File | null;
}

interface Message {
  status: "Recive" | "Send";
  message: string;
  created_at: number | string | Date;
}

const ReportPage = ({ params }: { params: Promise<{ id: string }> }) => {
  return <UnderConstruction />;
  const { id } = use(params);

  const task: Task = {
    title: "Analisis Sistem Informasi di Konoha",
    company: "PT Makerindo Prima Solusi",
  };

  // Data awal untuk chat, sekarang menjadi konstanta lokal
  const initialChats: Message[] = [
    {
      status: "Send",
      message:
        "Assalamualaikum Pak, abdi tos rengsekeun laporan tugas minggu ieu.",
      created_at: new Date("2025-08-11T08:15:00"),
    },
    {
      status: "Recive",
      message: "Waalaikumsalam. Alhamdulillah, tos di-upload kana sistem?",
      created_at: new Date("2025-08-11T08:17:00"),
    },
    // ... sisa data chat Anda ...
    {
      status: "Send",
      message:
        "Sae, hatur nuhun. Mangga diteruskeun tugasna kanggo minggu payun.",
      created_at: new Date("2025-08-11T08:22:00"),
    },
    {
      status: "Send",
      message:
        "Assalamualaikum Pak, abdi tos rengsekeun laporan tugas minggu ieu.",
      created_at: new Date("2025-08-11T08:15:00"),
    },
    {
      status: "Recive",
      message: "Waalaikumsalam. Alhamdulillah, tos di-upload kana sistem?",
      created_at: new Date("2025-08-11T08:17:00"),
    },
    // ... sisa data chat Anda ...
    {
      status: "Send",
      message:
        "Sae, hatur nuhun. Mangga diteruskeun tugasna kanggo minggu payun.",
      created_at: new Date("2025-08-11T08:22:00"),
    },
    {
      status: "Send",
      message:
        "Assalamualaikum Pak, abdi tos rengsekeun laporan tugas minggu ieu.",
      created_at: new Date("2025-08-11T08:15:00"),
    },
    {
      status: "Recive",
      message: "Waalaikumsalam. Alhamdulillah, tos di-upload kana sistem?",
      created_at: new Date("2025-08-11T08:17:00"),
    },
    // ... sisa data chat Anda ...
    {
      status: "Send",
      message:
        "Sae, hatur nuhun. Mangga diteruskeun tugasna kanggo minggu payun.",
      created_at: new Date("2025-08-11T08:22:00"),
    },
    {
      status: "Send",
      message:
        "Assalamualaikum Pak, abdi tos rengsekeun laporan tugas minggu ieu.",
      created_at: new Date("2025-08-11T08:15:00"),
    },
    {
      status: "Recive",
      message: "Waalaikumsalam. Alhamdulillah, tos di-upload kana sistem?",
      created_at: new Date("2025-08-11T08:17:00"),
    },
    // ... sisa data chat Anda ...
    {
      status: "Send",
      message:
        "Sae, hatur nuhun. Mangga diteruskeun tugasna kanggo minggu payun.",
      created_at: new Date("2025-08-11T08:22:00"),
    },
  ];
  // --- Akhir dari pemindahan data ---

  // DIMODIFIKASI: Gunakan useState untuk mengelola daftar pesan
  const [messages, setMessages] = useState<Message[]>(initialChats);
  const [newMessage, setNewMessage] = useState("");

  const formatTime = (date: Date | string | number) => {
    return new Date(date).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // DIMODIFIKASI: Update fungsi untuk menambahkan pesan baru ke state
  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    const messageToSend: Message = {
      status: "Send", // Asumsi pesan baru selalu dikirim oleh pengguna
      message: newMessage,
      created_at: new Date(),
    };

    // Tambahkan pesan baru ke daftar pesan yang ada
    setMessages((prevMessages) => [...prevMessages, messageToSend]);

    // Kosongkan input field
    setNewMessage("");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleClickCompleted = async () => {
    const confirm = await alertConfirm(
      "Apakah Anda yakin ingin menandai tugas ini sebagai selesai?"
    );
    if (!confirm) return;

    try {
      await API.patch(
        `${ENDPOINTS.TASKS}/${id}/complete`,
        {
          status: "completed",
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      );
    } catch (error) {
      console.error("Error marking task as completed:", error);
    }
  };

  return (
    <main className="p-6 min-h-screen">
      <h1 className="text-accent-dark text-sm mb-5">
        <Link
          className="hover:underline hover:text-accent"
          href={"/dashboard/tasklist/"}
        >
          Task List
        </Link>{" "}
        -&gt;{" "}
        <Link
          className="hover:underline hover:text-accent"
          href={`/dashboard/tasklist/${id}`}
        >
          Detail Task
        </Link>{" "}
        -&gt; Laporan
      </h1>
      <div className="mb-8">
        <div className="flex items-center space-x-2 font-extrabold text-accent">
          <ClipboardCheck className="w-5 h-5" />
          <h2 className="text-2xl mt-2">Laporan</h2>
        </div>
      </div>

      <div
        className="bg-white rounded-2xl shadow-lg flex flex-col"
        style={{ height: "calc(100vh - 150px)" }}
      >
        {" "}
        {/* Membuat tinggi kartu dinamis */}
        <div className="bg-accent rounded-t-2xl flex p-4 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-50 rounded-md flex-shrink-0"></div>
            <div className="text-white">
              <h3 className="font-bold text-lg">{task.title}</h3>
              <p className="text-sm opacity-90">{task.company}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button className="bg-red-500 px-4 py-2 rounded-lg text-white cursor-pointer hover:bg-red-600 transition-colors shadow-sm">
              Dibatalkan
            </button>
            <button
              onClick={handleClickCompleted}
              className="bg-green-500 px-4 py-2 rounded-lg text-white cursor-pointer hover:bg-green-600 transition-colors shadow-sm"
            >
              Selesai
            </button>
          </div>
        </div>
        {/* DIMODIFIKASI: Bagian chat sekarang flex-grow agar mengisi ruang */}
        <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-4">
          {/* DIMODIFIKASI: Map dari state 'messages' bukan konstanta 'chats' */}
          {messages.map((chat, index) => (
            <ChatBubble
              key={index}
              variant={chat.status === "Send" ? "sent" : "received"}
              message={chat.message}
              timestamp={formatTime(chat.created_at)}
            />
          ))}
        </div>
        {/* Input Message tidak berubah, tapi sekarang fungsinya akan bekerja dengan benar */}
        <div className="border-t p-4">
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ketik pesan..."
              className="w-full rounded-full text-gray-700 border-gray-300 bg-gray-100 px-4 py-2 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
            <button
              onClick={handleSendMessage}
              className="flex-shrink-0 rounded-full bg-accent p-2 text-white transition-colors hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ReportPage;
