import { Layout } from "@/components/layout/Layout";
import { useListGalleryPhotos, getListGalleryPhotosQueryKey, useGetGalleryCategories, getGetGalleryCategoriesQueryKey } from "@workspace/api-client-react";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { data: categories = [] } = useGetGalleryCategories({
    query: { queryKey: getGetGalleryCategoriesQueryKey() }
  });

  const { data: photosResponse, isLoading } = useListGalleryPhotos(
    { category: selectedCategory === "All" ? undefined : selectedCategory, limit: 100 }, 
    { query: { queryKey: getListGalleryPhotosQueryKey({ category: selectedCategory === "All" ? undefined : selectedCategory, limit: 100 }) } }
  );

  const photos = photosResponse?.data || [];
  const allCategories = ["All", ...categories];

  return (
    <Layout>
      <div className="bg-primary/5 pt-32 pb-16">
        <div className="container px-4 md:px-6 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-6">Our Gallery</h1>
          <p className="text-lg text-muted-foreground mb-10">
            A collection of smiles, masterpieces, and memories from our studio.
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            {allCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "bg-background border border-border hover:border-primary/50 text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container px-4 md:px-6 py-16 max-w-7xl mx-auto">
        {isLoading ? (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className={`w-full rounded-2xl ${i % 3 === 0 ? 'h-64' : i % 2 === 0 ? 'h-80' : 'h-48'}`} />
            ))}
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-muted-foreground text-lg">No photos found in this category.</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
            <AnimatePresence>
              {photos.map((photo, index) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  key={photo.id}
                  className="break-inside-avoid group cursor-pointer"
                  onClick={() => setSelectedImage(photo.imageUrl)}
                >
                  <div className="relative rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-border/50 bg-background">
                    <img 
                      src={photo.imageUrl} 
                      alt={photo.caption || "Gallery image"} 
                      className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    {photo.caption && (
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-white text-sm font-medium">{photo.caption}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-4"
            onClick={() => setSelectedImage(null)}
          >
            <Button 
              variant="outline" 
              size="icon" 
              className="absolute top-6 right-6 rounded-full bg-background/50 hover:bg-background border-border/50"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-6 h-6" />
            </Button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={selectedImage}
              alt="Expanded view"
              className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
