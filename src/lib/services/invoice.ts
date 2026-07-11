import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { SupabaseClient } from "@supabase/supabase-js";

async function loadLogoDataUrl(): Promise<string | null> {
  try {
    const response = await fetch("/logo-of-OS.png");
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn("[PDF] Failed to load logo for PDF header:", error);
    return null;
  }
}

function drawBackgroundPattern(doc: jsPDF, width: number, height: number) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(42);
  doc.setTextColor(230);

  for (let x = -40; x < width + 40; x += 50) {
    for (let y = 30; y < height + 40; y += 50) {
      doc.text("FJ", x, y, { angle: -35 });
    }
  }

  doc.setFont("helvetica", "normal");
  doc.setTextColor(40);
}

export interface InvoiceData {
  orderId: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  deliveryAddress?: string;
  items: {
    name: string;
    quantity: number;
    price: number;
    total: number;
  }[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  grandTotal: number;
  status: string;
}

const uploadAndDownloadPdf = async (
  doc: jsPDF,
  userId: string,
  filePath: string,
  downloadFileName: string,
  supabase: SupabaseClient
) => {
  console.log("[DOCUMENT] Converting to ArrayBuffer...");
  const pdfBuffer = doc.output("arraybuffer");

  console.log(`[DOCUMENT] Uploading to Supabase Storage: documents/${filePath}`);
  const { error: uploadError } = await supabase.storage.from("documents").upload(filePath, pdfBuffer, {
    contentType: "application/pdf",
    upsert: true,
  });

  if (uploadError) {
    console.error("[DOCUMENT] Upload Failed:", uploadError);
    console.log("[DOCUMENT] Falling back to local save...");
    doc.save(downloadFileName);
    return;
  }

  console.log("[DOCUMENT] Creating signed URL...");
  const { data: signedData, error: signedError } = await supabase
    .storage
    .from("documents")
    .createSignedUrl(filePath, 60);

  if (signedError || !signedData?.signedUrl) {
    console.error("[DOCUMENT] Signed URL Generation Failed:", signedError);
    doc.save(downloadFileName);
    return;
  }

  console.log("[DOCUMENT] Triggering HTTPS download via Signed URL");
  const link = document.createElement("a");
  link.href = signedData.signedUrl;
  link.download = downloadFileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  console.log("[DOCUMENT] Download complete.");
};

export const generateAndDownloadInvoice = async (
  data: InvoiceData,
  userId: string,
  supabase: SupabaseClient
) => {
  console.log("[INVOICE] Generating invoice PDF for Order", data.orderId);
  const doc = new jsPDF();
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const margin = 14;
  const accentColor = [212, 175, 55] as [number, number, number];
  const darkColor = [40, 40, 40] as [number, number, number];
  const mutedColor = [95, 95, 95] as [number, number, number];

  doc.setFillColor(250, 248, 242);
  doc.rect(0, 0, width, height, "F");
  drawBackgroundPattern(doc, width, height);

  doc.setFillColor(252, 250, 244);
  doc.roundedRect(10, 10, width - 20, 34, 2, 2, "F");
  doc.setDrawColor(...accentColor);
  doc.setLineWidth(0.5);
  doc.roundedRect(10, 10, width - 20, 34, 2, 2, "S");

  const logoDataUrl = await loadLogoDataUrl();
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, "PNG", 14, 12, 24, 24);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...darkColor);
  doc.text("FJ Store", 42, 20);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...mutedColor);
  doc.text("Premium Fashion & Accessories", 42, 27);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...accentColor);
  doc.text("INVOICE", width - margin, 22, { align: "right" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...mutedColor);
  doc.text(`Invoice No: INV-${data.orderId.substring(0, 8).toUpperCase()}`, width - margin, 31, { align: "right" });
  doc.text(`Order Date: ${new Date(data.orderDate).toLocaleDateString()}`, width - margin, 37, { align: "right" });

  doc.setDrawColor(225, 225, 225);
  doc.setLineWidth(0.3);
  doc.line(margin, 50, width - margin, 50);

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, 56, 82, 28, 2, 2, "F");
  doc.setDrawColor(230, 230, 230);
  doc.roundedRect(margin, 56, 82, 28, 2, 2, "S");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...darkColor);
  doc.text("Billed To", margin + 5, 64);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...mutedColor);
  doc.text(data.customerName, margin + 5, 71);
  doc.text(data.customerEmail, margin + 5, 76);
  const splitAddress = doc.splitTextToSize(data.shippingAddress, 70);
  doc.text(splitAddress, margin + 5, 81);

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(width - 95, 56, 81, 28, 2, 2, "F");
  doc.setDrawColor(230, 230, 230);
  doc.roundedRect(width - 95, 56, 81, 28, 2, 2, "S");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...darkColor);
  doc.text("Order Details", width - 90, 64);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...mutedColor);
  doc.text(`Status: ${data.status}`, width - 90, 71);
  doc.text(`Order ID: ${data.orderId.substring(0, 8).toUpperCase()}`, width - 90, 76);
  doc.text(`Payment: Card / COD`, width - 90, 81);

  const tableData = data.items.map((item) => [
    item.name,
    item.quantity.toString(),
    `PKR ${item.price.toFixed(2)}`,
    `PKR ${item.total.toFixed(2)}`,
  ]);

  autoTable(doc, {
    startY: 95,
    head: [["Description", "Qty", "Unit Price", "Total"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [40, 40, 40], textColor: [255, 255, 255] },
    styles: { fontSize: 9, cellPadding: 4, lineColor: [225, 225, 225], lineWidth: 0.2 },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { cellWidth: 18, halign: "center" },
      2: { cellWidth: 28, halign: "right" },
      3: { cellWidth: 28, halign: "right" },
    },
  });

  interface InvoiceJsPDF extends jsPDF {
    lastAutoTable?: {
      finalY: number;
    };
  }

  const finalY = ((doc as InvoiceJsPDF).lastAutoTable?.finalY ?? 0) + 8;

  doc.setFillColor(252, 250, 244);
  doc.roundedRect(112, finalY, width - 126, 34, 2, 2, "F");
  doc.setDrawColor(225, 225, 225);
  doc.roundedRect(112, finalY, width - 126, 34, 2, 2, "S");
  doc.setFontSize(9);
  doc.setTextColor(...mutedColor);
  doc.text("Subtotal:", 120, finalY + 8);
  doc.text(`PKR ${data.subtotal.toFixed(2)}`, width - 18, finalY + 8, { align: "right" });
  doc.text("Shipping:", 120, finalY + 15);
  doc.text(`PKR ${data.shipping.toFixed(2)}`, width - 18, finalY + 15, { align: "right" });
  doc.text("Tax:", 120, finalY + 22);
  doc.text(`PKR ${data.tax.toFixed(2)}`, width - 18, finalY + 22, { align: "right" });

  if (data.discount > 0) {
    doc.text("Discount:", 120, finalY + 29);
    doc.text(`-PKR ${data.discount.toFixed(2)}`, width - 18, finalY + 29, { align: "right" });
  }

  const totalY = data.discount > 0 ? finalY + 37 : finalY + 29;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...darkColor);
  doc.text("Grand Total:", 120, totalY);
  doc.text(`PKR ${data.grandTotal.toFixed(2)}`, width - 18, totalY, { align: "right" });

  doc.setDrawColor(...accentColor);
  doc.setLineWidth(0.4);
  doc.line(margin, 270, width - margin, 270);

  drawPremiumQrStyle(doc, margin, 276, 16);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...darkColor);
  doc.text("Verified Order", margin + 20, 280);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(130);
  doc.text("Scan-ready proof of purchase for your records.", margin + 20, 285);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(140);
  doc.text("Thank you for shopping with FJ Store!", width / 2, 290, { align: "center" });

  await uploadAndDownloadPdf(
    doc,
    userId,
    `invoices/${userId}/${data.orderId}.pdf`,
    `Invoice-INV-${data.orderId.substring(0, 8).toUpperCase()}.pdf`,
    supabase
  );
};

export const generateAndDownloadDeliverySlip = async (
  data: InvoiceData,
  userId: string,
  supabase: SupabaseClient
) => {
  console.log("[DELIVERY SLIP] Generating delivery slip PDF for Order", data.orderId);
  const doc = new jsPDF({ unit: "mm", format: "a5" });
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const margin = 10;
  const accentColor = [212, 175, 55] as [number, number, number];
  const darkColor = [40, 40, 40] as [number, number, number];
  const mutedColor = [95, 95, 95] as [number, number, number];

  doc.setFillColor(248, 247, 245);
  doc.rect(0, 0, width, height, "F");
  drawBackgroundPattern(doc, width, height);

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(6, 6, width - 12, 18, 2, 2, "F");
  doc.setFillColor(...accentColor);
  doc.roundedRect(6, 6, width - 12, 18, 2, 2, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("DELIVERY SLIP", margin + 2, 15);
  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  doc.text("Attach this slip securely to the package before dispatch.", margin + 2, 20);

  const logoDataUrl = await loadLogoDataUrl();
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, "PNG", width - 20, 8, 12, 12);
  }

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, 28, width - 20, 22, 2, 2, "F");
  doc.setDrawColor(225, 225, 225);
  doc.roundedRect(margin, 28, width - 20, 22, 2, 2, "S");
  doc.setFontSize(7);
  doc.setTextColor(...mutedColor);
  doc.text(`Order: INV-${data.orderId.substring(0, 8).toUpperCase()}`, margin + 3, 34);
  doc.text(`Status: ${data.status}`, margin + 3, 39);
  doc.text(`Date: ${new Date(data.orderDate).toLocaleDateString()}`, margin + 3, 44);

  doc.setFillColor(252, 250, 244);
  doc.roundedRect(margin, 54, width - 20, 36, 2, 2, "F");
  doc.setDrawColor(225, 225, 225);
  doc.roundedRect(margin, 54, width - 20, 36, 2, 2, "S");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...darkColor);
  doc.text("SHIP TO", margin + 3, 60);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...mutedColor);
  const deliveryAddress = data.deliveryAddress || data.shippingAddress;
  const deliveryLines = doc.splitTextToSize(deliveryAddress, 110);
  doc.text(deliveryLines, margin + 3, 66);

  doc.setFillColor(252, 250, 244);
  doc.roundedRect(margin, 94, width - 20, 34, 2, 2, "F");
  doc.setDrawColor(225, 225, 225);
  doc.roundedRect(margin, 94, width - 20, 34, 2, 2, "S");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...darkColor);
  doc.text("RECIPIENT", margin + 3, 100);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...mutedColor);
  doc.text(data.customerName, margin + 3, 106);
  doc.text(data.customerEmail, margin + 3, 111);

  doc.setFillColor(252, 250, 244);
  doc.roundedRect(margin, 132, width - 20, 40, 2, 2, "F");
  doc.setDrawColor(225, 225, 225);
  doc.roundedRect(margin, 132, width - 20, 40, 2, 2, "S");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...darkColor);
  doc.text("CONTENTS", margin + 3, 138);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...mutedColor);
  const itemLines = data.items.map((item, index) => `${index + 1}. ${item.name} x${item.quantity}`);
  const contentLines = doc.splitTextToSize(itemLines.join("\n"), 110);
  doc.text(contentLines, margin + 3, 144);

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, 176, width - 20, 20, 2, 2, "F");
  doc.setDrawColor(225, 225, 225);
  doc.roundedRect(margin, 176, width - 20, 20, 2, 2, "S");
  doc.setFontSize(6.2);
  doc.setTextColor(120);
  doc.text("Courier: verify address and customer details before handover.", margin + 3, 184);
  doc.text("If information is missing, contact FJ Store support immediately.", margin + 3, 189);

  doc.setDrawColor(...accentColor);
  doc.setLineWidth(0.4);
  doc.line(margin, 199, width - margin, 199);
  drawPremiumQrStyle(doc, margin + 2, 202, 10);
  doc.setFontSize(6.2);
  doc.setTextColor(...darkColor);
  doc.text("Secure handover verified", margin + 14, 206);
  doc.setTextColor(120);
  doc.text("Keep this slip with the parcel until delivery is complete.", margin + 14, 210);

  await uploadAndDownloadPdf(
    doc,
    userId,
    `delivery-slips/${userId}/${data.orderId}-delivery-slip.pdf`,
    `DeliverySlip-INV-${data.orderId.substring(0, 8).toUpperCase()}.pdf`,
    supabase
  );
};
