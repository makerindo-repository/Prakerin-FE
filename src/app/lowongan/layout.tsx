"use client";
import ContactPage from "@/components/Contact";
import FooterPage from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { useEffect, useState } from "react";
import { API, ENDPOINTS } from "@/utils/config";

export default function LowonganLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [homepages, setHomepages] = useState<any>();

  const fetchData = async () => {
    try {
      const response = await API.get(ENDPOINTS.HOMEPAGES);
      setHomepages(response.data.data.homepages);
    } catch (error) {
      console.error("Error fetching homepage data:", error);
    } finally {
      // setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <Navigation section="internship" setSection={() => null} />
      {children}
      <ContactPage homepages={homepages} />
      <FooterPage />
    </>
  );
}
