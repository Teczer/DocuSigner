import React, { useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "./ui/button";
import ReactSignatureCanvas from "react-signature-canvas";

interface SignaturePadProps {
  signatureCanvasRef: React.RefObject<ReactSignatureCanvas>;
  savedSignature: string | null;
  clearSignature: () => void;
  saveSignatureData: () => void;
}

const SignaturePad: React.FC<SignaturePadProps> = ({
  savedSignature,
  signatureCanvasRef,
  clearSignature,
  saveSignatureData,
}) => {
  useEffect(() => {
    if (savedSignature && signatureCanvasRef.current) {
      const canvas = signatureCanvasRef.current.getCanvas();
      const context = canvas.getContext("2d");

      if (context) {
        // Clear the canvas before drawing the saved signature
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Create an image element to load the saved signature
        const img = new Image();
        img.src = savedSignature;
        img.onload = () => {
          // Calculate the scaling factor to fit the image within the canvas
          const scale = Math.min(
            canvas.width / img.width,
            canvas.height / img.height
          );
          const x = canvas.width / 2 - (img.width / 2) * scale;
          const y = canvas.height / 2 - (img.height / 2) * scale;

          // Draw the image centered on the canvas
          context.drawImage(img, x, y, img.width * scale, img.height * scale);
        };
      }
    }
  }, [savedSignature, signatureCanvasRef]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4">
      <h3 className="text-2xl font-bold">Signature Pad</h3>
      <SignatureCanvas
        ref={signatureCanvasRef}
        penColor="black"
        canvasProps={{
          width: 300,
          height: 150,
          className: "border-2 border rounded-sm",
        }}
      />
      <div className="flex justify-center gap-2">
        <Button variant={"destructive"} onClick={clearSignature}>
          Clear Signature
        </Button>
        <Button variant={"default"} onClick={saveSignatureData}>
          Save Signature
        </Button>
      </div>
    </div>
  );
};

export default SignaturePad;
