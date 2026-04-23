import type { Metadata } from "next";
import { QRBarcodeGenerator } from "@/components/features/qr-barcode/QRBarcodeGenerator";

export const metadata: Metadata = {
  title: "QR Code & Barcode Generator — Free with Print | ToolHive",
  description: "Generate QR codes for URLs, text, UPI, WiFi, WhatsApp and barcodes (Code128, EAN-13) instantly. Download PNG or print directly.",
};

export default function QRBarcodePage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <QRBarcodeGenerator />
      </div>
    </main>
  );
}
