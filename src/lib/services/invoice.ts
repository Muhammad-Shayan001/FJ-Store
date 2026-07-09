import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { SupabaseClient } from "@supabase/supabase-js";

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

  doc.setFontSize(22);
  doc.setTextColor(40);
  doc.text("FJ Store", 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("Premium Fashion & Accessories", 14, 26);

  doc.setFontSize(20);
  doc.setTextColor(40);
  doc.text("INVOICE", 150, 20);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Invoice No: INV-${data.orderId.substring(0, 8).toUpperCase()}`, 150, 28);
  doc.text(`Order Date: ${new Date(data.orderDate).toLocaleDateString()}`, 150, 34);
  doc.text(`Status: ${data.status}`, 150, 40);

  doc.setFontSize(12);
  doc.setTextColor(40);
  doc.text("Billed To:", 14, 45);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(data.customerName, 14, 52);
  doc.text(data.customerEmail, 14, 58);

  const splitAddress = doc.splitTextToSize(data.shippingAddress, 80);
  doc.text(splitAddress, 14, 64);

  const tableData = data.items.map((item) => [
    item.name,
    item.quantity.toString(),
    `PKR ${item.price.toFixed(2)}`,
    `PKR ${item.total.toFixed(2)}`,
  ]);

  autoTable(doc, {
    startY: 85,
    head: [["Description", "Qty", "Unit Price", "Total"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [40, 40, 40], textColor: [255, 255, 255] },
    styles: { fontSize: 10, cellPadding: 5 },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { cellWidth: 20, halign: "center" },
      2: { cellWidth: 30, halign: "right" },
      3: { cellWidth: 30, halign: "right" },
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;

  doc.setFontSize(10);
  doc.setTextColor(40);
  doc.text("Subtotal:", 130, finalY);
  doc.text(`PKR ${data.subtotal.toFixed(2)}`, 180, finalY, { align: "right" });
  doc.text("Shipping:", 130, finalY + 8);
  doc.text(`PKR ${data.shipping.toFixed(2)}`, 180, finalY + 8, { align: "right" });
  doc.text("Tax:", 130, finalY + 16);
  doc.text(`PKR ${data.tax.toFixed(2)}`, 180, finalY + 16, { align: "right" });

  if (data.discount > 0) {
    doc.text("Discount:", 130, finalY + 24);
    doc.text(`-PKR ${data.discount.toFixed(2)}`, 180, finalY + 24, { align: "right" });
  }

  const totalY = data.discount > 0 ? finalY + 32 : finalY + 24;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Grand Total:", 130, totalY);
  doc.text(`PKR ${data.grandTotal.toFixed(2)}`, 180, totalY, { align: "right" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150);
  doc.text("Thank you for shopping with FJ Store!", 105, 280, { align: "center" });

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

  doc.setDrawColor(180);
  doc.setLineWidth(0.3);
  doc.rect(10, 10, 95, 135);

  doc.setFontSize(16);
  doc.setTextColor(20);
  doc.text("DELIVERY SLIP", 14, 20);

  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text("Attach this slip to the package before dispatch.", 14, 25);
  doc.text("Keep it visible for delivery verification.", 14, 29);

  doc.setLineWidth(0.2);
  doc.setDrawColor(150);
  doc.line(14, 33, 98, 33);

  doc.setFontSize(10);
  doc.setTextColor(40);
  doc.text(`Order: INV-${data.orderId.substring(0, 8).toUpperCase()}`, 14, 40);
  doc.text(`Status: ${data.status}`, 14, 46);
  doc.text(`Date: ${new Date(data.orderDate).toLocaleDateString()}`, 14, 52);

  doc.setFontSize(10);
  doc.setTextColor(20);
  doc.text("SHIP TO", 14, 63);
  doc.setFontSize(9);
  doc.setTextColor(60);
  const deliveryAddress = data.deliveryAddress || data.shippingAddress;
  const deliveryLines = doc.splitTextToSize(deliveryAddress, 80);
  doc.text(deliveryLines, 14, 69);

  doc.setLineWidth(0.2);
  doc.setDrawColor(150);
  doc.line(14, 95, 98, 95);

  doc.setFontSize(10);
  doc.setTextColor(20);
  doc.text("RECIPIENT", 14, 103);
  doc.setFontSize(9);
  doc.setTextColor(60);
  doc.text(data.customerName, 14, 109);
  doc.text(data.customerEmail, 14, 114);

  doc.setFontSize(10);
  doc.setTextColor(20);
  doc.text("CONTENTS", 14, 125);
  doc.setFontSize(9);
  const itemLines = data.items.map((item, index) => `${index + 1}. ${item.name} x${item.quantity}`);
  const contentLines = doc.splitTextToSize(itemLines.join("\n"), 80);
  doc.text(contentLines, 14, 131);

  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text("Courier: verify address and customer details before handover.", 14, 170);
  doc.text("If information is missing, contact FJ Store support immediately.", 14, 175);

  await uploadAndDownloadPdf(
    doc,
    userId,
    `delivery-slips/${userId}/${data.orderId}-delivery-slip.pdf`,
    `DeliverySlip-INV-${data.orderId.substring(0, 8).toUpperCase()}.pdf`,
    supabase
  );
};
