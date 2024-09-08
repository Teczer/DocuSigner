import React, { useRef } from "react";
import { Button } from "./ui/button";
import { IoMdAdd } from "react-icons/io";
import { FileWithRnd } from "../App";
import { FaRegTrashAlt } from "react-icons/fa";

interface SelectedFilesProps {
  files: FileWithRnd[];
  setCurrentIndexFile: (index: number) => void;
  setFiles: (files: FileWithRnd[]) => void;
}

export const SelectedFiles: React.FC<SelectedFilesProps> = ({
  files,
  setCurrentIndexFile,
  setFiles,
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
            onClick={() => setCurrentIndexFile(index)}
            className="flex relative w-full"
          >
            <div className="flex w-full items-center gap-4 shadow-xl cursor-pointer px-8 py-2 rounded-md transition-all hover:scale-105">
              {file.file.type.startsWith("image/") && (
                <img
                  src={URL.createObjectURL(file.file)}
                  alt={file.file.name}
                  className="size-16 rounded-sm object-cover"
                />
              )}
              <div>
                <p className="max-w-56 font-bold truncate">{file.file.name}</p>
                <p className="text-gray-500">
                  {(file.file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <FaRegTrashAlt
              className="text-2xl absolute -right-10 top-10 cursor-pointer hover:text-red-900 transition-all hover:scale-125"
              onClick={(e) => {
                e.stopPropagation();
                setFiles(files.filter((_, i) => i !== index));
              }}
            />
          </li>
        ))}
        <li
          className="border shadow-2xl cursor-pointer px-4 py-2 rounded-md transition-all hover:scale-105"
          onClick={handleAddFile}
        >
          <IoMdAdd />
          <input
            ref={inputRef}
            type="file"
            onChange={(e) => {
              if (!e.target.files) return;

              const newFiles = Array.from(e.target.files);
              const newFilesWithRnd = newFiles.map((file) => ({
                file,
                rnd: null,
              }));

              if (newFiles.length > 0) {
                setFiles([...files, ...newFilesWithRnd]);
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
        }}
      >
        Clear Files
      </Button>
    </div>
  );
};
