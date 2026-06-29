import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { config } from "../config.js";

function assertHeroDocumentUrl(url: string) {
  const parsedUrl = new URL(url);

  if (
    parsedUrl.hostname !== "login.hero-software.de" ||
    !parsedUrl.pathname.startsWith("/files/document/")
  ) {
    throw new Error("Nur HERO-Dokument-URLs sind erlaubt.");
  }
}

export async function readHeroPdfDocumentText(url: string) {
  assertHeroDocumentUrl(url);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${config.heroApiKey}`,
      Accept: "application/pdf",
    },
  });

  if (!response.ok) {
    throw new Error(`PDF konnte nicht geladen werden. Status: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  const maxBytes = 20 * 1024 * 1024;

  if (uint8Array.byteLength > maxBytes) {
    throw new Error("PDF ist größer als 20 MB.");
  }

  const pdf = await getDocument({
    data: uint8Array,
    useWorkerFetch: false,
    disableFontFace: true,
  }).promise;

  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();

    const text = content.items
      .map((item: any) => item.str)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    pages.push(`--- Seite ${pageNumber} ---\n${text}`);
  }

  return {
    pages: pdf.numPages,
    text: pages.join("\n\n"),
  };
}