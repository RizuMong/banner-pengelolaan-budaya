"use client";

import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../components/carousel";

interface BannerData {
  id_banner: string;
  title: string;
  attachment: string;
}

interface APIResponse {
  data: BannerData[];
}

interface CarouselData {
  id: string;
  title: string;
  image: string;
}

export default function Home() {
  const [carouselData, setCarouselData] = useState<CarouselData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCarouselData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          "https://apiv2-bpjs.jojonomic.com/27414/v1/index/banner",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: APIResponse = await response.json();

        if (!result.data || !Array.isArray(result.data)) {
          throw new Error("Invalid data format received from API");
        }

        const transformedData: CarouselData[] = result.data.map(
          (item: BannerData) => ({
            id: item.id_banner,
            title: item.title,
            image: item.attachment,
          })
        );

        setCarouselData(transformedData);
      } catch (err) {
        console.error("Error fetching carousel data:", err);
        setError(err instanceof Error ? err.message : "Failed to load images");
      } finally {
        setLoading(false);
      }
    };

    fetchCarouselData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-2 border-white border-t-transparent mx-auto"></div>
          <p className="mt-4 text-white text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white text-lg">No images available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center">
      <Carousel
        opts={{
          align: "center",
          loop: true,
        }}
        className="w-full md:h-screen"
      >
        <CarouselContent className="md:h-screen">
          {carouselData.map((item) => (
            <CarouselItem key={item.id} className="md:h-screen">
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-auto object-contain md:h-full md:object-cover"
                  loading="lazy"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-8">
                  <h2 className="text-white text-xl font-medium">
                    {item.title}
                  </h2>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-black/20 hover:bg-black/40 border-0 text-white backdrop-blur-sm transition-all duration-200 opacity-60 hover:opacity-100" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-black/20 hover:bg-black/40 border-0 text-white backdrop-blur-sm transition-all duration-200 opacity-60 hover:opacity-100" />
      </Carousel>
    </div>
  );
}
