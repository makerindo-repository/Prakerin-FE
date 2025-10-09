"use client";

import {
  ArrowRight,
  Building,
  FileText,
  Globe,
  Lock,
  MapPin,
  Send,
  UserCircle,
} from "lucide-react";
import { use, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { timeAgo } from "@/utils/timeAgo";
import Link from "next/link";
import Image from "next/image";
import RenderBlocks from "@/components/RenderBlocks";
import { API, ENDPOINTS } from "../../../../../../utils/config";
import UnderConstruction from "@/components/UnderConstruction";

interface Company {
  photo_profile?: string | null;
  company: {
    name: string;
    description: string | null;
  };
  city_regency: {
    name: string;
  };
  province: {
    name: string;
  };
  job_openings: {
    id: string;
    title: string;
    updated_at: string;
  }[];
}

const DetailPerusahaanPage = ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = use(params);
  const [company, setCompany] = useState<Company>({
    company: {
      name: "",
      description: null,
    },
    city_regency: {
      name: "",
    },
    province: {
      name: "",
    },
    job_openings: [],
  });

  const jobPositions = [
    { title: "Frontend Web Developer", duration: "1 hari yang lalu" },
    { title: "Backend Web Developer", duration: "1 hari yang lalu" },
    { title: "Mobile Developer", duration: "5 hari yang lalu" },
    { title: "Frontend Web Developer", duration: "1 hari yang lalu" },
    { title: "Backend Web Developer", duration: "1 hari yang lalu" },
    { title: "Mobile Developer", duration: "5 hari yang lalu" },
  ];

  const fetchCompanyDetail = async () => {
    try {
      const response = await API.get(`${ENDPOINTS.USERS}/${id}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      if (response.status === 200) {
        console.log("Company Detail:", response.data.data);
        setCompany(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching company details:", error);
    }
  };

  useEffect(() => {
    console.log("Id:", id);
    fetchCompanyDetail();
  }, []);

  return <UnderConstruction />;
  return (
    <main className="p-6">
      <h1 className="text-accent-dark text-sm mb-5">
        <Link
          className="hover:underline hover:text-accent"
          href={"/dashboard/perusahaan/"}
        >
          Perusahaan
        </Link>{" "}
        -&gt;{" "}
        <Link
          className="hover:underline hover:text-accent"
          href={`/dashboard/perusahaan/${id}`}
        >
          Detail Perusahaan
        </Link>{" "}
        -&gt; Chat Perusahaan
      </h1>
      <div className="mb-8">
        <div className="flex items-center space-x-2 font-extrabold text-accent">
          <Building className="w-5 h-5" />
          <h2 className="text-2xl mt-2">Chat Perusahaan</h2>
        </div>
      </div>

      <div
        className="bg-white rounded-2xl shadow-lg flex flex-col"
        style={{ height: "calc(100vh - 150px)" }}
      >
        {" "}
        {/* Membuat tinggi kartu dinamis */}
        <div className="bg-accent rounded-t-2xl flex p-4 items-center space-x-4">
          <div className="w-16 h-16 bg-gray-50 rounded-md flex-shrink-0"></div>
          <div className="text-white">
            {/* <h3 className="font-bold text-lg">{task.title}</h3> */}
            {/* <p className="text-sm opacity-90">{task.company}</p> */}
          </div>
        </div>
        {/* DIMODIFIKASI: Bagian chat sekarang flex-grow agar mengisi ruang */}
        <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-4">
          {/* DIMODIFIKASI: Map dari state 'messages' bukan konstanta 'chats' */}
          {/* {messages.map((chat, index) => (
            <ChatBubble
              key={index}
              variant={chat.status === "Send" ? "sent" : "received"}
              message={chat.message}
              timestamp={formatTime(chat.created_at)}
            />
          ))} */}
        </div>
        {/* Input Message tidak berubah, tapi sekarang fungsinya akan bekerja dengan benar */}
        <div className="border-t p-4">
          <div className="flex items-center space-x-3">
            <input
              type="text"
              //   value={newMessage}
              //   onChange={(e) => setNewMessage(e.target.value)}
              //   onKeyDown={handleKeyDown}
              placeholder="Ketik pesan..."
              className="w-full rounded-full text-gray-700 border-gray-300 bg-gray-100 px-4 py-2 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
            <button
              //   onClick={handleSendMessage}
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

export default DetailPerusahaanPage;
