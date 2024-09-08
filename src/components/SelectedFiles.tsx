import React from "react";
import { Button } from "./ui/button";

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
  return (
    <div className="flex flex-col items-center justify-center gap-4 w-4/12">
      <h3>Selected files</h3>
      <ul className="flex flex-col gap-4">
        {files.map((file, index) => (
          <li
            key={index}
            onClick={() => setCurrentFile(file)}
            className="shadow-xl cursor-pointer px-8 py-2 rounded-md transition-all hover:scale-105"
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
