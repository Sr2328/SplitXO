import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, Upload, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const groupSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  description: z.string().trim().max(500).optional(),
});

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, description?: string, image_url?: string) => Promise<unknown>;
}

export function CreateGroupModal({ isOpen, onClose, onSubmit }: CreateGroupModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError("");
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const cleanFileName = `${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from("group_images")
        .upload(cleanFileName, file);

      if (error) {
        setError(`Upload failed: ${error.message || 'Unknown error'}`);
        return null;
      }

      const { data: urlData } = supabase.storage
        .from("group_images")
        .getPublicUrl(data.path);
      
      return urlData.publicUrl;
    } catch (err: any) {
      setError(`Failed to upload: ${err?.message || 'Please check bucket permissions'}`);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = groupSchema.safeParse({ name, description: description || undefined });
    if (!result.success) {
      setError(result.error.errors[0]?.message || "Invalid input");
      return;
    }

    setLoading(true);
    try {
      let imageUrl: string | undefined;
      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile) || undefined;
      }

      await onSubmit(result.data.name, result.data.description, imageUrl);

      setName("");
      setDescription("");
      setSelectedFile(null);
      setPreviewUrl(null);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to create group. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setName("");
      setDescription("");
      setSelectedFile(null);
      setPreviewUrl(null);
      setError("");
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 350, damping: 35 }}
              className="w-full max-w-sm sm:max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-600 px-5 sm:px-6 py-6 sm:py-7 flex-shrink-0 overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -mr-20 -mt-20 blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full -ml-16 -mb-16 blur-3xl opacity-10" />
                </div>
                
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div 
                      whileHover={{ rotate: 5, scale: 1.05 }}
                      className="p-2.5 rounded-2xl bg-white/25 backdrop-blur-xl border border-white/30 shadow-lg"
                    >
                      <Users className="h-6 w-6 text-white" />
                    </motion.div>
                    <h2 className="text-lg sm:text-xl font-bold text-white">Create Group</h2>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleClose}
                    disabled={loading}
                    className="p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-xl transition-all disabled:opacity-50 backdrop-blur-xl border border-white/20 flex-shrink-0"
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto flex-1 scrollbar-hide">
                <div className="px-5 sm:px-6 py-5 sm:py-6 space-y-4 sm:space-y-5">
                  {/* Group Name */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                  >
                    <label className="text-sm font-semibold text-gray-900 mb-2 block">
                      Group Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="e.g., Roommates, Trip to Goa"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={100}
                      className="h-11 rounded-xl text-sm bg-gray-50 border-2 border-gray-200 hover:border-gray-300 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 transition-all"
                      disabled={loading}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1.5">
                      {name.length}<span className="text-gray-400">/100</span>
                    </p>
                  </motion.div>

                  {/* Description */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <label className="text-sm font-semibold text-gray-900 mb-2 block">
                      Description
                    </label>
                    <textarea
                      className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 hover:border-gray-300 px-4 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white transition-all resize-none disabled:opacity-50"
                      placeholder="What's this group for?"
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      maxLength={500}
                      disabled={loading}
                    />
                    <p className="text-xs text-gray-500 mt-1.5">
                      {description.length}<span className="text-gray-400">/500</span>
                    </p>
                  </motion.div>

                  {/* Group Image */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <label className="text-sm font-semibold text-gray-900 mb-2 block">
                      Group Image
                    </label>
                    
                    {previewUrl ? (
                      <div className="relative rounded-xl overflow-hidden border-2 border-teal-200 group/image">
                        <img
                          src={previewUrl}
                          alt="Group preview"
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={removeImage}
                            disabled={loading}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-all shadow-lg disabled:opacity-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Remove
                          </motion.button>
                        </div>
                      </div>
                    ) : (
                      <motion.label
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                          dragActive 
                            ? "border-teal-500 bg-teal-50" 
                            : "border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400"
                        }`}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          disabled={loading}
                        />
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          <div className={`p-2.5 rounded-xl transition-all ${
                            dragActive 
                              ? "bg-teal-500/20" 
                              : "bg-teal-100"
                          }`}>
                            <Upload className="h-5 w-5 text-teal-600" />
                          </div>
                          <div className="text-center">
                            <p className="text-xs sm:text-sm font-semibold text-gray-900">
                              Upload group image
                            </p>
                            <p className="text-xs text-gray-500">
                              PNG, JPG up to 5MB
                            </p>
                          </div>
                        </div>
                      </motion.label>
                    )}
                  </motion.div>

                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-xl bg-red-50 border-2 border-red-200"
                    >
                      <p className="text-xs text-red-700 font-semibold">{error}</p>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex gap-2.5 sm:gap-3 px-5 sm:px-6 py-4 sm:py-5 bg-gray-100 border-t border-gray-200 flex-shrink-0">
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 bg-white hover:bg-gray-100 border-2 border-gray-300 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={loading || !name.trim()}
                  className="flex-1 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full" />
                      </motion.div>
                      <span className="hidden sm:inline">Creating...</span>
                    </>
                  ) : (
                    <>
                      <Users className="h-4 w-4" />
                      <span className="hidden sm:inline">Create Group</span>
                      <span className="sm:hidden">Create</span>
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}