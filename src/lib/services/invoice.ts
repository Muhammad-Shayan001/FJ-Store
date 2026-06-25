import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { SupabaseClient } from "@supabase/supabase-js";

export interface InvoiceData {
  orderId: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
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

export const generateAndDownloadInvoice = async (
  data: InvoiceData, 
  userId: string, 
  supabase: SupabaseClient
) => {
  console.log("[INVOICE] Generating PDF for Order", data.orderId);
  const doc = new jsPDF();

  // Header
  doc.setFontSize(22);
  doc.setTextColor(40);
  doc.text("FJ Store", 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("Premium Fashion & Accessories", 14, 26);

  // Invoice Title
  doc.setFontSize(20);
  doc.setTextColor(40);
  doc.text("INVOICE", 150, 20);

  // Invoice Details
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Invoice No: INV-${data.orderId.substring(0, 8).toUpperCase()}`, 150, 28);
  doc.text(`Order Date: ${new Date(data.orderDate).toLocaleDateString()}`, 150, 34);
  doc.text(`Status: ${data.status}`, 150, 40);

  // Customer Info
  doc.setFontSize(12);
  doc.setTextColor(40);
  doc.text("Billed To:", 14, 45);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(data.customerName, 14, 52);
  doc.text(data.customerEmail, 14, 58);
  
  // Shipping Address
  const splitAddress = doc.splitTextToSize(data.shippingAddress, 80);
  doc.text(splitAddress, 14, 64);

  // Table
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

  // Totals
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

  // Footer
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150);
  doc.text("Thank you for shopping with FJ Store!", 105, 280, { align: "center" });

  // 1. Generate ArrayBuffer instead of local download
  console.log("[INVOICE] Converting to ArrayBuffer...");
  const pdfBuffer = doc.output('arraybuffer');

  // 2. Upload to Supabase Storage
  const filePath = `invoices/${userId}/${data.orderId}.pdf`;
  console.log(`[INVOICE] Uploading to Supabase Storage: documents/${filePath}`);
  
  const { error: uploadError } = await supabase
    .storage
    .from("documents")
    .upload(filePath, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: true
    });

  if (uploadError) {
    console.error("[INVOICE] Upload Failed:", uploadError);
    // Fallback to local save if upload fails to ensure user gets it anyway
    console.log("[INVOICE] Falling back to local blob download...");
    doc.save(`Invoice-INV-${data.orderId.substring(0, 8).toUpperCase()}.pdf`);
    return;
  }

  // 3. Create signed URL for HTTPS download (valid 60s)
  console.log("[INVOICE] Creating signed URL...");
  const { data: signedData, error: signedError } = await supabase
    .storage
    .from("documents")
    .createSignedUrl(filePath, 60);

  if (signedError || !signedData?.signedUrl) {
    console.error("[INVOICE] Signed URL Generation Failed:", signedError);
    doc.save(`Invoice-INV-${data.orderId.substring(0, 8).toUpperCase()}.pdf`);
    return;
  }

  console.log("[INVOICE] Triggering HTTPS download via Signed URL");
  // 4. Force download via HTTPS
  const link = document.createElement("a");
  link.href = signedData.signedUrl;
  link.download = `Invoice-INV-${data.orderId.substring(0, 8).toUpperCase()}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  console.log("[INVOICE] Download complete.");
};
