import { useRef, useState } from "react";
import SignaturePad from "./components/SignaturePad";
import ReactSignatureCanvas from "react-signature-canvas";
import { Button } from "./components/ui/button";
import { Rnd } from "react-rnd";
import { IoMdCloseCircle } from "react-icons/io";

function App() {
  const [files, setFiles] = useState<File[]>([]);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [rnd, setRnd] = useState({
    width: "250px",
    height: "150px",
    x: 0,
    y: 0,
  });

  const signatureCanvasRef = useRef<ReactSignatureCanvas | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const currentFiles = event.target.files;
    if (currentFiles) {
      setFiles(Array.from(currentFiles));
      setCurrentFile(currentFiles[0]);
    }
  };

  const clearSignature = () => {
    signatureCanvasRef.current?.clear();
    localStorage.removeItem("signature");
  };

  const saveSignatureData = () => {
    const data = signatureCanvasRef.current?.toDataURL();
    if (data) {
      localStorage.setItem("signature", data);
    }
  };

  const onUseSignature = () => {
    const savedSignature = localStorage.getItem("signature");
    if (savedSignature) {
      setSignatureData(savedSignature);
    }
  };

  const downloadFileWithSignature = async () => {
    if (!currentFile || !canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Load the image
    const img = new Image();
    img.src = URL.createObjectURL(currentFile);

    img.onload = () => {
      // Set canvas dimensions to match the image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the image on the canvas
      ctx.drawImage(img, 0, 0);

      // Draw the signature if it exists
      if (signatureData) {
        const signatureImg = new Image();
        signatureImg.src = signatureData;
        signatureImg.onload = () => {
          // Calculate the position of the signature relative to the image
          const rect = imageRef.current!.getBoundingClientRect();
          const scaleX = img.width / rect.width;
          const scaleY = img.height / rect.height;

          const signatureX = rnd.x * scaleX;
          const signatureY = rnd.y * scaleY;
          const signatureWidth = parseInt(rnd.width) * scaleX;
          const signatureHeight = parseInt(rnd.height) * scaleY;

          // Draw the signature on the canvas
          ctx.drawImage(
            signatureImg,
            signatureX,
            signatureY,
            signatureWidth,
            signatureHeight
          );

          // Convert canvas to data URL and trigger download
          const link = document.createElement("a");
          link.href = canvas.toDataURL("image/png");
          link.download = `signed_${currentFile.name}`;
          link.click();
        };
      }
    };
  };

  return (
    <div className="p-10 flex w-screen h-screen bg-background">
      <div className="flex flex-col items-center justify-center gap-4 w-4/12">
        <SignaturePad
          clearSignature={clearSignature}
          saveSignatureData={saveSignatureData}
          signatureCanvasRef={signatureCanvasRef}
          savedSignature={localStorage.getItem("signature")}
        />
        <Button variant={"outline"} onClick={onUseSignature}>
          Use Signature
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center gap-4 w-6/12">
        {files.length === 0 && (
          <div>
            <h3 className="text-2xl font-bold">Upload Signature</h3>
            <input
              type="file"
              multiple
              accept="image/*,.pdf" // Accept images and PDFs
              onChange={handleFileChange}
            />
          </div>
        )}

        {currentFile && (
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative">
              {currentFile.type === "application/pdf" ? (
                <embed
                  src={URL.createObjectURL(currentFile)}
                  width="500"
                  height="375"
                  type="application/pdf"
                />
              ) : (
                <img
                  ref={imageRef}
                  className="w-full h-full object-cover user-select-none"
                  draggable={false}
                  src={URL.createObjectURL(currentFile)}
                  alt={currentFile.name}
                />
              )}
              {signatureData && (
                <Rnd
                  className="absolute"
                  size={{ width: rnd.width, height: rnd.height }}
                  position={{ x: rnd.x, y: rnd.y }}
                  onDragStop={(e, d) => {
                    const newX = Math.max(0, d.x);
                    const newY = Math.max(0, d.y);
                    setRnd({ ...rnd, x: newX, y: newY });
                  }}
                  onResizeStop={(e, direction, ref, delta, position) => {
                    const newWidth = parseInt(ref.style.width);
                    const newHeight = parseInt(ref.style.height);
                    setRnd({
                      width: `${newWidth}px`,
                      height: `${newHeight}px`,
                      x: position.x,
                      y: position.y,
                    });
                  }}
                  bounds="parent"
                >
                  <IoMdCloseCircle
                    className="text-2xl cursor-pointer absolute -top-7 -right-2"
                    onClick={() => setSignatureData(null)}
                  />
                  <img
                    draggable={false}
                    src={signatureData}
                    alt="Signature"
                    className="border-2 border-dashed border-gray-500 user-select-none"
                    style={{ width: "100%", height: "100%" }}
                  />
                </Rnd>
              )}
            </div>
            <Button variant={"outline"} onClick={downloadFileWithSignature}>
              Download File with Signature
            </Button>
          </div>
        )}
      </div>

      {files.length > 0 && (
        <div className="flex flex-col items-center justify-center gap-4 w-4/12">
          <h3>Selected files</h3>
          <ul className="flex flex-col gap-4">
            {files.map((file, index) => (
              <li
                key={index}
                onClick={() => setCurrentFile(file)}
                className="shadow-lg cursor-pointer px-2 py-1 rounded-md transition-all hover:scale-105"
              >
                <div className="flex items-center gap-2">
                  {file.type.startsWith("image/") && (
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-16 h-16 object-cover"
                    />
                  )}
                  <div>
                    <p>{file.name}</p>
                    <p>{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Hidden Canvas for generating the image with signature */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}

export default App;
