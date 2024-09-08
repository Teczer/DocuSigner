import { useCallback, useRef, useState } from "react";
import SignaturePad from "./components/SignaturePad";
import ReactSignatureCanvas from "react-signature-canvas";
import { Button } from "./components/ui/button";
import { Rnd } from "react-rnd";
import { IoMdCloseCircle } from "react-icons/io";
import { DropFilesZone } from "./components/DropFilesZone";
import { SelectedFiles } from "./components/SelectedFiles";
import { downloadFileWithSignature } from "./lib/downloadFile";

export interface FileWithRnd {
  file: File;
  rnd: rndStates | null;
}

function App() {
  const savedSignature = localStorage.getItem("signature");

  const [files, setFiles] = useState<FileWithRnd[]>([]);
  const [currentIndexFile, setCurrentIndexFile] = useState<number>(0);
  const currentFile = files[currentIndexFile];

  const [signatureData, setSignatureData] = useState<string | null>(
    savedSignature
  );

  const signatureCanvasRef = useRef<ReactSignatureCanvas | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const embedRef = useRef<HTMLEmbedElement | null>(null);

  function clearSignature() {
    signatureCanvasRef.current?.clear();
    setSignatureData(null);
    localStorage.removeItem("signature");
  }

  function saveSignatureData() {
    const data = signatureCanvasRef.current?.toDataURL();
    if (data) {
      localStorage.setItem("signature", data);
      setSignatureData(data);
    }
  }

  function onUseSignature() {
    setFiles((prev) =>
      prev.map((fileWithRnd) => ({
        file: fileWithRnd.file,
        rnd: {
          width: "250px",
          height: "150px",
          x: 0,
          y: 0,
        },
      }))
    );
  }

  function updateFileRnd(newX: number, newY: number) {
    setFiles((prev) =>
      prev.map((file) =>
        file.file === currentFile.file
          ? {
              ...file,
              rnd: {
                ...file.rnd,
                x: newX,
                y: newY,
                width: file.rnd?.width || "0px",
                height: file.rnd?.height || "0px",
              },
            }
          : file
      )
    );
  }

  function updateFileRndSize(
    newWidth: number,
    newHeight: number,
    position: { x: number; y: number }
  ) {
    setFiles((prev) =>
      prev.map((file) =>
        file.file === currentFile.file
          ? {
              ...file,
              rnd: {
                ...file.rnd,
                width: `${newWidth}px`,
                height: `${newHeight}px`,
                x: position.x,
                y: position.y,
              },
            }
          : file
      )
    );
  }

  function clearCurrentFileRnd() {
    setFiles((prev) =>
      prev.map((file) =>
        file.file === currentFile.file
          ? {
              ...file,
              rnd: null,
            }
          : file
      )
    );
  }

  function onUniqueFileDownload() {
    if (!currentFile) return;

    downloadFileWithSignature(
      currentFile.file,
      signatureData,
      currentFile.rnd,
      embedRef,
      canvasRef,
      imageRef
    );
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const filesWithRnd = acceptedFiles.map((file) => ({
      file,
      rnd: null,
    }));
    setFiles(filesWithRnd);
  }, []);

  return (
    <div className="flex w-screen h-screen bg-background gap-10">
      {/* PAD SIGNATURE */}
      <div className="flex flex-col items-center justify-center gap-4 w-3/12 shadow-xl">
        <SignaturePad
          clearSignature={clearSignature}
          saveSignatureData={saveSignatureData}
          signatureCanvasRef={signatureCanvasRef}
          savedSignature={localStorage.getItem("signature")}
        />
        {signatureData && (
          <Button variant={"outline"} onClick={onUseSignature}>
            Use Signature
          </Button>
        )}
      </div>

      {/* ZONE D'ENVOI DE FICHIERS */}
      {files.length === 0 && <DropFilesZone onDrop={onDrop} />}

      {/* FICHIER ACTUEL */}
      {currentFile && (
        <div className="flex flex-col items-center justify-center gap-4 w-6/12">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative">
              {currentFile.file.type === "application/pdf" ? (
                <embed
                  width={600}
                  height={600}
                  ref={embedRef}
                  src={URL.createObjectURL(currentFile.file)}
                  type="application/pdf"
                />
              ) : (
                <img
                  ref={imageRef}
                  className="w-full h-full object-cover user-select-none"
                  draggable={false}
                  src={URL.createObjectURL(currentFile.file)}
                  alt={currentFile.file.name}
                />
              )}
              {currentFile.rnd && signatureData && (
                <Rnd
                  className="absolute"
                  size={{
                    width: currentFile.rnd.width,
                    height: currentFile.rnd.height,
                  }}
                  position={{ x: currentFile.rnd.x, y: currentFile.rnd.y }}
                  onDragStop={(e, d) => {
                    const newX = Math.max(0, d.x);
                    const newY = Math.max(0, d.y);
                    updateFileRnd(newX, newY);
                  }}
                  onResizeStop={(e, direction, ref, delta, position) => {
                    const newWidth = parseInt(ref.style.width);
                    const newHeight = parseInt(ref.style.height);
                    updateFileRndSize(newWidth, newHeight, position);
                  }}
                  bounds="parent"
                >
                  <IoMdCloseCircle
                    className="text-xl cursor-pointer absolute -top-7 -right-2 bg-white rounded-full"
                    onClick={clearCurrentFileRnd}
                  />
                  <img
                    draggable={false}
                    src={signatureData}
                    alt="Signature"
                    className="border-2 border-dashed border-gray-500 user-select-none animate-blink"
                    style={{ width: "100%", height: "100%" }}
                  />
                </Rnd>
              )}
            </div>
            <Button variant={"outline"} onClick={onUniqueFileDownload}>
              Download File
            </Button>
          </div>
        </div>
      )}

      {/* LISTES DES FICHIERS SELECTIONNES */}
      {files.length > 0 && (
        <SelectedFiles
          files={files}
          setCurrentIndexFile={setCurrentIndexFile}
          setFiles={setFiles}
        />
      )}

      {/* Hidden Canvas for generating the image with signature */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}

export default App;
