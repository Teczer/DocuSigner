import React, { useRef } from "react";
import { Button } from "./ui/button";
import { IoMdAdd } from "react-icons/io";

interface SelectedFilesProps {
  files: File[];
  setCurrentFile: (file: File | null) => void;
  setFiles: (files: File[]) => void;
  setShowSignature: (show: boolean) => void;
}

export const SelectedFiles: React.FC<SelectedFilesProps> = ({
  files,
  setCurrentFile,
  setFiles,
  setShowSignature,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddFile = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };
  return (
    <div className="flex flex-col items-center justify-center gap-4 w-4/12">
      <ul className="flex items-center flex-col gap-4 mb-10">
        {files.map((file, index) => (
          <li
            key={index}
            onClick={() => setCurrentFile(file)}
            className="w-full shadow-xl cursor-pointer px-8 py-2 rounded-md transition-all hover:scale-105"
          >
            <div className="flex items-center gap-4">
              {file.type.startsWith("image/") && (
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="size-16 rounded-sm object-cover"
                />
              )}
              <div>
                <p className="font-bold">{file.name}</p>
                <p className="text-gray-500">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
          </li>
        ))}
        <li className="border shadow-2xl cursor-pointer px-4 py-2 rounded-md transition-all hover:scale-105">
          <IoMdAdd onClick={handleAddFile} />
          <input
            ref={inputRef}
            type="file"
            onChange={(e) => {
              if (!e.target.files) return;

              const newFiles = Array.from(e.target.files);
              if (newFiles.length > 0) {
                setFiles([...files, ...newFiles]);
                setCurrentFile(newFiles[0]);
              }
            }}
            multiple
            hidden
            accept="image/jpeg, image/png, application/pdf"
          />
        </li>
      </ul>
      <Button
        variant={"destructive"}
        onClick={() => {
          setFiles([]);
          setCurrentFile(null);
          setShowSignature(false);
        }}
      >
        Clear Files
      </Button>
    </div>
  );
};
