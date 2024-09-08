import { PDFDocument } from "pdf-lib";

async function handlePdfFile(
  currentFile: File,
  signatureData: string | null,
  rnd: rndStates,
  embedRef: React.RefObject<HTMLEmbedElement>
) {
  const pdfBytes = await currentFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  if (signatureData && embedRef.current) {
    const signatureImg = await fetch(signatureData).then((res) =>
      res.arrayBuffer()
    );
    const signatureImage = await pdfDoc.embedPng(signatureImg);

    const { width, height } = firstPage.getSize();
    const scaleX = width / embedRef.current.getBoundingClientRect().width;
    const scaleY = height / embedRef.current.getBoundingClientRect().height;

    const signatureX = rnd.x * scaleX;
    const signatureY =
      height - (rnd.y * scaleY + parseInt(rnd.height) * scaleY);
    const signatureWidth = parseInt(rnd.width) * scaleX;
    const signatureHeight = parseInt(rnd.height) * scaleY;

    firstPage.drawImage(signatureImage, {
      x: signatureX,
      y: signatureY,
      width: signatureWidth,
      height: signatureHeight,
    });

    const pdfBytesWithSignature = await pdfDoc.save();
    const blob = new Blob([pdfBytesWithSignature], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `signed_${currentFile.name}`;
    link.click();
  }
}

async function handleImageFile(
  currentFile: File,
  signatureData: string | null,
  rnd: rndStates,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  imageRef: React.RefObject<HTMLImageElement>
) {
  if (!canvasRef.current || !imageRef.current) return;

  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");

  if (!ctx) return;

  const img = new Image();
  img.src = URL.createObjectURL(currentFile);

  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    if (signatureData) {
      const signatureImg = new Image();
      signatureImg.src = signatureData;
      signatureImg.onload = () => {
        const rect = imageRef.current!.getBoundingClientRect();
        const scaleX = img.width / rect.width;
        const scaleY = img.height / rect.height;

        const signatureX = rnd.x * scaleX;
        const signatureY = rnd.y * scaleY;
        const signatureWidth = parseInt(rnd.width) * scaleX;
        const signatureHeight = parseInt(rnd.height) * scaleY;

        ctx.drawImage(
          signatureImg,
          signatureX,
          signatureY,
          signatureWidth,
          signatureHeight
        );

        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = `signed_${currentFile.name}`;
        link.click();
      };
    }
  };
}

export async function downloadFileWithSignature(
  currentFile: File,
  signatureData: string | null,
  rnd: rndStates,
  embedRef: React.RefObject<HTMLEmbedElement>,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  imageRef: React.RefObject<HTMLImageElement>
) {
  if (!currentFile) return;

  if (currentFile.type === "application/pdf") {
    await handlePdfFile(currentFile, signatureData, rnd, embedRef);
  } else {
    await handleImageFile(currentFile, signatureData, rnd, canvasRef, imageRef);
  }
}
