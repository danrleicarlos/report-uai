export async function exportDashboardToPDF(
  elementId: string,
  filename: string = "relatorio-uai.pdf"
): Promise<void> {
  const { default: html2canvas } = await import("html2canvas");
  const { jsPDF } = await import("jspdf");

  const element = document.getElementById(elementId);
  if (!element) throw new Error("Export element not found");

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#080d1a",
    logging: false,
  });

  const imgWidth = 210; // A4 width in mm
  const pageHeight = 297; // A4 height in mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  let position = 0;
  let remainingHeight = imgHeight;

  while (remainingHeight > 0) {
    const sliceHeight = Math.min(pageHeight, remainingHeight);
    const canvasSliceHeight = (sliceHeight * canvas.width) / imgWidth;
    const canvasPositionY = ((imgHeight - remainingHeight) * canvas.width) / imgWidth;

    const sliceCanvas = document.createElement("canvas");
    sliceCanvas.width = canvas.width;
    sliceCanvas.height = canvasSliceHeight;

    const ctx = sliceCanvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(
        canvas,
        0,
        canvasPositionY,
        canvas.width,
        canvasSliceHeight,
        0,
        0,
        canvas.width,
        canvasSliceHeight
      );
    }

    if (position > 0) pdf.addPage();
    pdf.addImage(sliceCanvas.toDataURL("image/png"), "PNG", 0, 0, imgWidth, sliceHeight);

    remainingHeight -= sliceHeight;
    position += sliceHeight;
  }

  pdf.save(filename);
}
