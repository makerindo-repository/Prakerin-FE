"use client";
import {
  Building,
  Circle,
  CircleArrowRight,
  MapPin,
  MessageSquareText,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import StudentFeedback from "@/components/roleComponents/StudentFeedback";
import NonStudentFeedback from "@/components/roleComponents/NonStudentFeedback";
import UnderConstruction from "@/components/UnderConstruction";

const FeedbackPage: React.FC = () => {
  const [authorization, setAuthorization] = useState<string>();

  useEffect(() => {
    setAuthorization(Cookies.get("authorization"));
  }, []);

  return <UnderConstruction />;

  return (
    <main className="p-6 min-h-screen relative">
      <h1 className="text-accent-dark text-sm mb-5">Ulasan</h1>
      <div className="mb-8">
        <div className="flex items-center space-x-2 font-extrabold text-accent">
          <MessageSquareText className="w-5 h-5" />
          <h2 className="text-2xl mt-2">Ulasan</h2>
        </div>
      </div>

      {authorization === "student" ? (
        <StudentFeedback />
      ) : (
        <NonStudentFeedback authorization={authorization as string} />
      )}
    </main>
  );
};

export default FeedbackPage;
