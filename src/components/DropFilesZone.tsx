import { useDropzone } from "react-dropzone";

interface DropFilesZoneProps {
  onDrop: (files: File[]) => void;
}

export const DropFilesZone = ({ onDrop }: DropFilesZoneProps) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
      "application/pdf": [],
    },
  });
  return (
    <div className="flex flex-col items-center justify-center gap-4 w-7/12">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed p-20 text-center cursor-pointer hover:border-blue-500 ${
          isDragActive ? "border-blue-500" : "border-gray-300"
        }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>Drag & drop some files here, or click to select files</p>
        )}
      </div>
    </div>
  );
};
