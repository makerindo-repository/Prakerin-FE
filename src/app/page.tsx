"use client";
import Navigation from "@/components/Navigation";
import LandingPage from "./Landingpage";
import { useState, useEffect } from "react";
import ContactPage from "@/components/Contact";
import FooterPage from "@/components/Footer";
import ServiceButton from "@/components/Service";
import { API, ENDPOINTS } from "../../utils/config";
import Loader from "@/components/loader";

interface Partner {
  id: string;
  name: string;
  address: string;
  logo: string;
}

interface CommentPrakerin {
  id: string;
  photo_profile: string;
  name: string;
  position: string;
  comment: string;
}

export default function HomePage() {
  const [activeSection, setActiveSection] = useState("home");

  const [homepages, setHomepages] = useState<any>();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [commentPrakerins, setCommentPrakerins] = useState<CommentPrakerin[]>(
    []
  );

  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = async () => {
    try {
      const response = await API.get(ENDPOINTS.HOMEPAGES);
      setHomepages(response.data.data.homepages);
      setPartners(response.data.data.partners);
      setCommentPrakerins(response.data.data.comment_prakerins);
    } catch (error) {
      console.error("Error fetching homepage data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await API.get("/sanctum/csrf-cookie", {})
        .then((response) => {
          console.log("Cookies set successfully:", response);
        })
        .catch((error) => {
          console.error("Error setting cookies:", error);
        });
    };
    fetchData();
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <Navigation section={activeSection} setSection={setActiveSection} />
      {loading && (
        <div className="fixed w-full inset-0 flex justify-center items-center h-screen z-10 bg-white">
          <Loader width={64} height={64} />
        </div>
      )}
      <LandingPage
        homepages={homepages}
        partners={partners}
        comments={commentPrakerins}
      />
      <ContactPage homepages={homepages} />
      <ServiceButton />
      <FooterPage />
    </>
  );
}
