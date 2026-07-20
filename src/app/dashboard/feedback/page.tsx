"use client";
import {
  MessageSquareText,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import StudentFeedback from "@/components/roleComponents/StudentFeedback";
import NonStudentFeedback from "@/components/roleComponents/NonStudentFeedback";

// Roles that actually participate in the feedback/rating system
const FEEDBACK_ROLES = ["student", "company", "school"];

const FeedbackPage: React.FC = () => {
  const router = useRouter();
  const [authorization, setAuthorization] = useState<string>();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const role = Cookies.get("authorization");
    setAuthorization(role);
    setIsReady(true);

    // Super admin and other non-feedback roles don't belong here
    if (role && !FEEDBACK_ROLES.includes(role)) {
      router.replace("/dashboard");
    }
  }, [router]);

  if (!isReady) return null;

  // Still loading / redirecting
  if (!authorization || !FEEDBACK_ROLES.includes(authorization)) return null;

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
