"use client";

import { useState, useRef, useCallback } from "react";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; bio: string; tags: string[]; image: string }) => void;
  currentName: string;
  currentBio: string;
  currentTags: string[];
  currentImage: string;
  allowedTags: string[];
}

export default function ProfileEditModal({
  isOpen,
  onClose,
  onSave,
  currentName,
  currentBio,
  currentTags,
  currentImage,
  allowedTags,
}: ProfileEditModalProps) {
  const [name, setName] = useState(currentName);
  const [bio, setBio] = useState(currentBio);
  const [tags, setTags] = useState<string[]>(currentTags);
  const [image, setImage] = useState(currentImage);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTagToggle = useCallback((tag: string) => {
    setTags((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((t) => t !== tag);
      }
      if (prev.length >= 5) return prev;
      return [...prev, tag];
    });
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Only JPEG, PNG, and WebP images are accepted.");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB.");
      return;
    }

    setError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET || "");
      formData.append("folder", "wemu/avatars");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setImage(data.secure_url);
    } catch {
      setError("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters long.");
      return;
    }
    if (bio.trim().length > 160) {
      setError("Bio must be 160 characters or less.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave({ name: name.trim(), bio: bio.trim(), tags, image });
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#12101a] border border-white/10 rounded-3xl shadow-2xl animate-fade-in no-scrollbar">
        {/* Header */}
        <div className="sticky top-0 bg-[#12101a]/95 backdrop-blur-md border-b border-white/10 px-6 py-5 rounded-t-3xl z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-gradient">Edit Profile</h2>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors border border-white/10"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 py-6 space-y-8">
          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          {/* Photo Section */}
          <div>
            <label className="block text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">
              Profile Photo
            </label>
            <div className="flex items-center gap-6">
              <div className="relative group">
                {image ? (
                  <img
                    src={image}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-purple-500/30 shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-purple-500/20 border-4 border-purple-500/30 flex items-center justify-center shadow-lg">
                    <svg className="w-10 h-10 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                >
                  {uploading ? (
                    <svg className="w-6 h-6 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
              <div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="text-sm font-bold text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : "Change Photo"}
                </button>
                <p className="text-xs text-gray-500 mt-1">JPEG, PNG or WebP. Max 5MB.</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
          </div>

          {/* Name Section */}
          <div>
            <label className="block text-sm font-bold text-gray-300 uppercase tracking-wider mb-3">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={50}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all text-sm font-medium"
            />
          </div>

          {/* Bio Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-bold text-gray-300 uppercase tracking-wider">
                Bio
              </label>
              <span className={`text-xs font-mono ${bio.length > 160 ? "text-red-400" : bio.length > 140 ? "text-yellow-400" : "text-gray-500"}`}>
                {bio.length}/160
              </span>
            </div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={160}
              rows={3}
              placeholder="Tell the world about your music taste..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all resize-none text-sm"
            />
          </div>

          {/* Tags Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-bold text-gray-300 uppercase tracking-wider">
                Music Tags
              </label>
              <span className={`text-xs font-mono ${tags.length >= 5 ? "text-yellow-400" : "text-gray-500"}`}>
                {tags.length}/5
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Select up to 5 tags that describe your music taste.
            </p>
            <div className="flex flex-wrap gap-2">
              {allowedTags.map((tag) => {
                const isSelected = tags.includes(tag);
                const isDisabled = !isSelected && tags.length >= 5;
                return (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    disabled={isDisabled}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                      isSelected
                        ? "bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm shadow-purple-500/10"
                        : isDisabled
                        ? "bg-white/3 text-gray-600 border-white/5 cursor-not-allowed"
                        : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:border-white/20"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#12101a]/95 backdrop-blur-md border-t border-white/10 px-6 py-4 rounded-b-3xl flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-sm font-semibold text-gray-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || uploading}
            className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
