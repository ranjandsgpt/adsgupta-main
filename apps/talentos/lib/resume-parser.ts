import pdfParse from "pdf-parse";
import mammoth from "mammoth";

export async function parseResumeBuffer(fileBuffer: Buffer, mimeType?: string, fileName?: string): Promise<string> {
  const lowerName = (fileName ?? "").toLowerCase();
  const isPdf = mimeType === "application/pdf" || lowerName.endsWith(".pdf");
  const isDocx =
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    lowerName.endsWith(".docx");

  if (isPdf) {
    const result = await pdfParse(fileBuffer);
    return result.text?.trim() ?? "";
  }

  if (isDocx) {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    return result.value?.trim() ?? "";
  }

  throw new Error("Unsupported file type. Please upload a PDF or DOCX file.");
}
