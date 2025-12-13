// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { X, Users } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { z } from "zod";

// const groupSchema = z.object({
//   name: z.string().trim().min(1, "Name is required").max(100),
//   description: z.string().trim().max(500).optional(),
// });

// interface CreateGroupModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSubmit: (name: string, description?: string) => Promise<unknown>;
// }

// export function CreateGroupModal({ isOpen, onClose, onSubmit }: CreateGroupModalProps) {
//   const [name, setName] = useState("");
//   const [description, setDescription] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError("");

//     const result = groupSchema.safeParse({ name, description: description || undefined });
//     if (!result.success) {
//       setError(result.error.errors[0]?.message || "Invalid input");
//       return;
//     }

//     setLoading(true);
//     try {
//       await onSubmit(result.data.name, result.data.description);
//       setName("");
//       setDescription("");
//       onClose();
//     } catch {
//       // Error handled in hook
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <>
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
//             onClick={onClose}
//           />
//           <motion.div
//             initial={{ opacity: 0, scale: 0.95, y: 20 }}
//             animate={{ opacity: 1, scale: 1, y: 0 }}
//             exit={{ opacity: 0, scale: 0.95, y: 20 }}
//             className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 z-50 w-auto sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 flex items-center justify-center"
//           >
//             <div className="bg-card rounded-2xl border border-border shadow-elevated p-6 w-full max-h-[calc(100vh-2rem)] overflow-y-auto">
//               <div className="flex items-center justify-between mb-6">
//                 <div className="flex items-center gap-3">
//                   <div className="p-2 rounded-xl bg-primary/10">
//                     <Users className="h-5 w-5 text-primary" />
//                   </div>
//                   <h2 className="text-xl font-semibold text-foreground">Create Group</h2>
//                 </div>
//                 <button
//                   onClick={onClose}
//                   className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors"
//                 >
//                   <X className="h-5 w-5" />
//                 </button>
//               </div>

//               <form onSubmit={handleSubmit} className="space-y-4">
//                 <div>
//                   <label className="text-sm font-medium text-foreground mb-2 block">
//                     Group Name *
//                   </label>
//                   <Input
//                     placeholder="e.g., Roommates, Trip to Goa"
//                     value={name}
//                     onChange={(e) => setName(e.target.value)}
//                     maxLength={100}
//                   />
//                 </div>

//                 <div>
//                   <label className="text-sm font-medium text-foreground mb-2 block">
//                     Description
//                   </label>
//                   <textarea
//                     className="flex w-full rounded-xl border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 resize-none"
//                     placeholder="What's this group for?"
//                     rows={3}
//                     value={description}
//                     onChange={(e) => setDescription(e.target.value)}
//                     maxLength={500}
//                   />
//                 </div>

//                 {error && (
//                   <p className="text-sm text-destructive">{error}</p>
//                 )}

//                 <div className="flex gap-3 pt-2">
//                   <Button
//                     type="button"
//                     variant="outline"
//                     className="flex-1"
//                     onClick={onClose}
//                   >
//                     Cancel
//                   </Button>
//                   <Button type="submit" className="flex-1" disabled={loading}>
//                     {loading ? "Creating..." : "Create Group"}
//                   </Button>
//                 </div>
//               </form>
//             </div>
//           </motion.div>
//         </>
//       )}
//     </AnimatePresence>
//   );
// }



// +++++++++++++++++++++++++++++
// ============================


import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, Upload, Image as ImageIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
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
      // Clean filename - remove special characters and spaces
      const fileExt = file.name.split('.').pop();
      const cleanFileName = `${Date.now()}.${fileExt}`;
      
      console.log("Uploading file:", cleanFileName, "Type:", file.type, "Size:", file.size);
      
      // Try upload with minimal options first
      const { data, error } = await supabase.storage
        .from("group_images")
        .upload(cleanFileName, file);

      if (error) {
        console.error("Upload error details:", {
          message: error.message,
          error: error
        });
        setError(`Upload failed: ${error.message || 'Unknown error'}`);
        return null;
      }

      console.log("Upload successful:", data);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("group_images")
        .getPublicUrl(data.path);
      
      console.log("Public URL:", urlData.publicUrl);
      
      return urlData.publicUrl;
    } catch (err: any) {
      console.error("Upload exception:", err);
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

      // Reset form
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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="shadow-2xl border-border/50 overflow-hidden">
                {/* Header with Gradient */}
                <div className="relative bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 p-6 sm:p-8">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
                  
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
                  
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm shadow-lg">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-white">Create Group</h2>
                    </div>
                    <button
                      onClick={handleClose}
                      disabled={loading}
                      className="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Form Content */}
                <CardContent className="p-4 sm:p-6">
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                    {/* Group Name */}
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-2 block">
                        Group Name <span className="text-destructive">*</span>
                      </label>
                      <Input
                        placeholder="e.g., Roommates, Trip to Goa"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        maxLength={100}
                        className="h-11 rounded-xl border-border/50 focus:border-primary/50 shadow-sm"
                        disabled={loading}
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1.5">
                        {name.length}/100 characters
                      </p>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-2 block">
                        Description
                      </label>
                      <textarea
                        className="flex w-full rounded-xl border border-border/50 bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 resize-none shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="What's this group for?"
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        maxLength={500}
                        disabled={loading}
                      />
                      <p className="text-xs text-muted-foreground mt-1.5">
                        {description.length}/500 characters
                      </p>
                    </div>

                    {/* Group Image Upload */}
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-2 block">
                        Group Image
                      </label>
                      
                      {previewUrl ? (
                        <div className="relative">
                          <div className="relative rounded-xl overflow-hidden border-2 border-border/50 shadow-md group">
                            <img
                              src={previewUrl}
                              alt="Group preview"
                              className="w-full h-48 object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={removeImage}
                                disabled={loading}
                                className="rounded-xl shadow-lg"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-32 sm:h-40 border-2 border-dashed border-border/50 rounded-xl cursor-pointer bg-muted/30 hover:bg-muted/50 transition-all group disabled:cursor-not-allowed disabled:opacity-50">
                          <div className="flex flex-col items-center justify-center p-4 text-center">
                            <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors mb-3">
                              <Upload className="h-6 w-6 text-primary" />
                            </div>
                            <p className="text-sm font-medium text-foreground mb-1">
                              Upload group image
                            </p>
                            <p className="text-xs text-muted-foreground">
                              PNG, JPG up to 5MB
                            </p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                            disabled={loading}
                          />
                        </label>
                      )}
                    </div>

                    {/* Error Message */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-xl bg-destructive/10 border border-destructive/20"
                      >
                        <p className="text-sm text-destructive font-medium">{error}</p>
                      </motion.div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 h-11 rounded-xl shadow-sm hover:shadow-md transition-all"
                        onClick={handleClose}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        className="flex-1 h-11 rounded-xl shadow-md hover:shadow-lg transition-all" 
                        disabled={loading || !name.trim()}
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Users className="h-4 w-4 mr-2" />
                            Create Group
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
