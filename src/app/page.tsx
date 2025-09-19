"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../components/carousel";

interface BannerData {
  id_banner: string;
  judul_banner: string; // update: judul_banner
  attachment: string;
  alamat_web_tujuan: string; // update: alamat_web_tujuan
}

interface APIResponse {
  data: BannerData[];
}

interface CarouselData {
  id: string;
  title: string;
  image: string;
  destination_url: string;
}

export default function Home() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [carouselData, setCarouselData] = useState<CarouselData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Token is required in the URL params.");
      setLoading(false);
      return;
    }

    const fetchCarouselData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `https://apiv2-bpjs.jojonomic.com/27414/ess/v1/budaya/get/banner?token=${encodeURIComponent(
            token
          )}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: APIResponse = await response.json();

        if (!Array.isArray(result.data)) {
          throw new Error("Invalid data format received from API");
        }

        const transformedData: CarouselData[] = result.data.map((item) => ({
          id: item.id_banner,
          title: item.judul_banner, // update: judul_banner
          image: item.attachment,
          destination_url: item.alamat_web_tujuan, // update: alamat_web_tujuan
        }));

        setCarouselData(transformedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load images");
      } finally {
        setLoading(false);
      }
    };

    fetchCarouselData();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-2 border-white border-t-transparent mx-auto"></div>
          <p className="mt-4 text-white text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (carouselData.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-white text-lg">No images available</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden group">
      <Carousel
        opts={{
          align: "center",
          loop: true,
        }}
        className="w-full h-auto md:h-screen"
      >
        <CarouselContent className="h-auto md:h-screen">
          {carouselData.map((item) => (
            <CarouselItem key={item.id} className="relative w-full h-auto">
              <a
                href={item.destination_url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded flex transition-transform duration-500 ease-in-out group"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 md:p-8">
                  <h2 className="text-white text-base md:text-xl font-medium">
                    {item.title}
                  </h2>
                </div>
              </a>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-black/20 hover:bg-black/40 border-0 text-white backdrop-blur-sm transition-all duration-200 opacity-60 hover:opacity-100" />
        <CarouselNext className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-black/20 hover:bg-black/40 border-0 text-white backdrop-blur-sm transition-all duration-200 opacity-60 hover:opacity-100" />

        <div className="md:hidden absolute bottom-4 left-0 right-0 flex justify-center gap-4 z-10">
          <CarouselPrevious className="w-10 h-10 bg-white text-black rounded-full shadow hover:bg-gray-100" />
          <CarouselNext className="w-10 h-10 bg-white text-black rounded-full shadow hover:bg-gray-100" />
        </div>
      </Carousel>
    </div>
  );
}
