import type React from "react";
import { useEffect, useRef, useState } from "react";
type AddProp = {
  setAddMenu: React.Dispatch<React.SetStateAction<boolean>>;
  loadImages: () => void;
};

export default function Add({ setAddMenu, loadImages }: AddProp) {
  const [perview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  function handlePreview(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target?.files[0];
    if (!file) return;
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      if (img.width > 1080 || img.height > 1920) {
        alert("File Too Big");
        URL.revokeObjectURL(url);
        return;
      }
      setFile(file);
      setPreview((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
        }
        return url;
      });
    };
    img.src = url;
  }

  function uploadImages() {
    if (!file) return;
    const reader = new FileReader();

    reader.onload = () => {
      const imgString = reader.result as string;

      const existingImages = JSON.parse(localStorage.getItem("images") || "[]");
      existingImages.push({ image: imgString, createdAt: Date.now() });

      localStorage.setItem("images", JSON.stringify(existingImages));
      setAddMenu(false);
      loadImages();
    };

    reader.readAsDataURL(file);
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setAddMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="inset-0 fixed bg-black/30 border flex justify-center items-center">
      <div
        className="h-108 w-lg bg-white flex flex-col items-center p-2 rounded-xl gap-2"
        ref={menuRef}
      >
        <h1 className="text-2xl">Add Photo</h1>
        <input
          type="file"
          accept="image/*"
          className=" w-full"
          onChange={(e) => handlePreview(e)}
        ></input>
        {perview && (
          <img src={perview} alt="Preview" className="w-full h-full"></img>
        )}
        <div className="mt-auto flex items-center gap-4  w-full *:hover:cursor-pointer *:rounded-md ">
          <button
            className="py-2 flex-1 bg-gray-300"
            onClick={() => setAddMenu(false)}
          >
            Cancel
          </button>
          <button
            className="py-2 flex-1 bg-blue-400"
            onClick={() => uploadImages()}
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}
