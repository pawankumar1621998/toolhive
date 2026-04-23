"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Download, Printer, RefreshCw, QrCode, BarChart2, Copy, Check } from "lucide-react";

// ─── QR Types ─────────────────────────────────────────────────────────────────

const QR_TYPES = [
  { id: "url",       label: "URL / Link",   emoji: "🔗", hint: "https://example.com" },
  { id: "text",      label: "Text",         emoji: "📝", hint: "Enter any text..." },
  { id: "phone",     label: "Phone",        emoji: "📞", hint: "+91 98765 43210" },
  { id: "email",     label: "Email",        emoji: "📧", hint: "user@example.com" },
  { id: "whatsapp",  label: "WhatsApp",     emoji: "💬", hint: "+91 98765 43210" },
  { id: "upi",       label: "UPI",          emoji: "💳", hint: "name@upi" },
  { id: "wifi",      label: "WiFi",         emoji: "📶", hint: "Network name" },
];

const BARCODE_FORMATS = [
  { id: "CODE128", label: "Code 128",  hint: "Universal — text + numbers" },
  { id: "CODE39",  label: "Code 39",   hint: "Alphanumeric — inventory" },
  { id: "EAN13",   label: "EAN-13",    hint: "13-digit product barcode" },
  { id: "UPC",     label: "UPC-A",     hint: "12-digit retail barcode" },
];

const QR_SIZES = [150, 200, 256, 300, 400];
const QR_COLORS = ["#000000", "#1e40af", "#15803d", "#b91c1c", "#7c3aed", "#c2410c"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildQRText(type: string, inputs: Record<string, string>) {
  switch (type) {
    case "url":       return inputs.url || "";
    case "text":      return inputs.text || "";
    case "phone":     return `tel:${inputs.phone || ""}`;
    case "email":     return `mailto:${inputs.email || ""}`;
    case "whatsapp":  return `https://wa.me/${(inputs.whatsapp || "").replace(/\D/g, "")}`;
    case "upi":       return `upi://pay?pa=${inputs.upi || ""}&pn=${inputs.upiName || ""}&am=${inputs.amount || ""}`;
    case "wifi":      return `WIFI:T:${inputs.wifiSec || "WPA"};S:${inputs.ssid || ""};P:${inputs.wifiPass || ""};;`;
    default:          return "";
  }
}

function printImage(src: string, title: string) {
  const w = window.open("", "_blank", "width=500,height=500");
  if (!w) return;
  w.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
  <style>body{margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif}
  h4{margin:0 0 16px;color:#333;font-size:14px}img,svg{max-width:90vw}@page{margin:1cm}</style>
  </head><body><h4>${title}</h4><img src="${src}" /></body></html>`);
  w.document.close();
  setTimeout(() => { w.focus(); w.print(); }, 400);
}

function printSVG(svgHTML: string, title: string) {
  const w = window.open("", "_blank", "width=600,height=400");
  if (!w) return;
  w.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
  <style>body{margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif}
  h4{margin:0 0 16px;color:#333;font-size:14px}svg{max-width:90vw}@page{margin:1cm}</style>
  </head><body><h4>${title}</h4>${svgHTML}</body></html>`);
  w.document.close();
  setTimeout(() => { w.focus(); w.print(); }, 400);
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function QRBarcodeGenerator() {
  const [tab, setTab] = useState<"qr" | "barcode">("qr");

  // QR state
  const [qrType, setQrType] = useState("url");
  const [qrInputs, setQrInputs] = useState<Record<string, string>>({});
  const [qrSize, setQrSize] = useState(256);
  const [qrColor, setQrColor] = useState("#000000");
  const [qrImage, setQrImage] = useState<string>("");
  const [qrLoading, setQrLoading] = useState(false);

  // Barcode state
  const [barcodeText, setBarcodeText] = useState("");
  const [barcodeFormat, setBarcodeFormat] = useState("CODE128");
  const [showLabel, setShowLabel] = useState(true);
  const [barcodeImage, setBarcodeImage] = useState<string>("");
  const [barcodeLoading, setBarcodeLoading] = useState(false);
  const [barcodeError, setBarcodeError] = useState("");

  const [copied, setCopied] = useState(false);

  const setQrInput = (k: string, v: string) => setQrInputs(p => ({ ...p, [k]: v }));

  // ── Generate QR ──────────────────────────────────────────────────────────────

  const generateQR = useCallback(async () => {
    const text = buildQRText(qrType, qrInputs);
    if (!text || text.length < 2) return;
    setQrLoading(true);
    try {
      const QRCode = (await import("qrcode")).default;
      const dataUrl = await QRCode.toDataURL(text, {
        width: qrSize,
        margin: 2,
        color: { dark: qrColor, light: "#ffffff" },
        errorCorrectionLevel: "M",
      });
      setQrImage(dataUrl);
    } catch { /* silent */ }
    finally { setQrLoading(false); }
  }, [qrType, qrInputs, qrSize, qrColor]);

  // ── Generate Barcode ─────────────────────────────────────────────────────────

  const generateBarcode = useCallback(async () => {
    if (!barcodeText.trim()) return;
    setBarcodeLoading(true);
    setBarcodeError("");
    setBarcodeImage("");
    try {
      const JsBarcode = (await import("jsbarcode")).default;
      const canvas = document.createElement("canvas");
      JsBarcode(canvas, barcodeText, {
        format: barcodeFormat,
        displayValue: showLabel,
        fontSize: 14,
        margin: 16,
        background: "#ffffff",
        lineColor: "#000000",
        width: 2,
        height: 80,
      });
      setBarcodeImage(canvas.toDataURL("image/png"));
    } catch (e) {
      setBarcodeError(`Invalid input for ${barcodeFormat}. ${barcodeFormat === "EAN13" ? "Must be 12–13 digits." : barcodeFormat === "UPC" ? "Must be 11–12 digits." : "Check your input."}`);
    } finally { setBarcodeLoading(false); }
  }, [barcodeText, barcodeFormat, showLabel]);

  function downloadImage(src: string, name: string) {
    const a = document.createElement("a");
    a.href = src;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function copyQRText() {
    navigator.clipboard.writeText(buildQRText(qrType, qrInputs));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const inputCls = "w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition-colors";

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-7 flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center shrink-0 shadow-lg shadow-violet-500/20">
          <QrCode className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">QR Code & Barcode Generator</h1>
          <p className="text-sm text-foreground-muted">Generate, download, and print QR codes and barcodes instantly — free</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-800/50 rounded-2xl w-fit mb-7 border border-slate-700/50">
        {[
          { id: "qr" as const, label: "QR Code", icon: QrCode },
          { id: "barcode" as const, label: "Barcode", icon: BarChart2 },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === id ? "bg-violet-600 text-white shadow-md" : "text-slate-400 hover:text-white"}`}>
            <Icon className="h-4 w-4" />{label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
        {/* ── Left: Controls ── */}
        <div className="space-y-5">

          {tab === "qr" && (
            <>
              {/* QR Type selector */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2.5">QR Code Type</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {QR_TYPES.map(qt => (
                    <button key={qt.id} onClick={() => { setQrType(qt.id); setQrImage(""); }}
                      className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border text-center transition-all ${qrType === qt.id ? "border-violet-500 bg-violet-500/10" : "border-border bg-card hover:border-violet-500/40"}`}>
                      <span className="text-base">{qt.emoji}</span>
                      <span className={`text-[10px] font-semibold leading-tight ${qrType === qt.id ? "text-violet-400" : "text-foreground-muted"}`}>{qt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic inputs per type */}
              <div className="space-y-3">
                {qrType === "url" && <div><label className="block text-xs font-medium text-foreground-muted mb-1.5 uppercase tracking-wide">Website URL</label><input className={inputCls} value={qrInputs.url || ""} onChange={e => setQrInput("url", e.target.value)} placeholder="https://example.com" /></div>}
                {qrType === "text" && <div><label className="block text-xs font-medium text-foreground-muted mb-1.5 uppercase tracking-wide">Your Text</label><textarea className={`${inputCls} resize-none`} rows={3} value={qrInputs.text || ""} onChange={e => setQrInput("text", e.target.value)} placeholder="Enter any text, message, address..." /></div>}
                {qrType === "phone" && <div><label className="block text-xs font-medium text-foreground-muted mb-1.5 uppercase tracking-wide">Phone Number</label><input className={inputCls} value={qrInputs.phone || ""} onChange={e => setQrInput("phone", e.target.value)} placeholder="+91 98765 43210" /></div>}
                {qrType === "email" && <div><label className="block text-xs font-medium text-foreground-muted mb-1.5 uppercase tracking-wide">Email Address</label><input className={inputCls} value={qrInputs.email || ""} onChange={e => setQrInput("email", e.target.value)} placeholder="user@example.com" /></div>}
                {qrType === "whatsapp" && <div><label className="block text-xs font-medium text-foreground-muted mb-1.5 uppercase tracking-wide">WhatsApp Number (with country code)</label><input className={inputCls} value={qrInputs.whatsapp || ""} onChange={e => setQrInput("whatsapp", e.target.value)} placeholder="+91 98765 43210" /></div>}
                {qrType === "upi" && (
                  <div className="space-y-3">
                    <div><label className="block text-xs font-medium text-foreground-muted mb-1.5 uppercase tracking-wide">UPI ID</label><input className={inputCls} value={qrInputs.upi || ""} onChange={e => setQrInput("upi", e.target.value)} placeholder="yourname@upi" /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="block text-xs font-medium text-foreground-muted mb-1.5 uppercase tracking-wide">Name (optional)</label><input className={inputCls} value={qrInputs.upiName || ""} onChange={e => setQrInput("upiName", e.target.value)} placeholder="John Doe" /></div>
                      <div><label className="block text-xs font-medium text-foreground-muted mb-1.5 uppercase tracking-wide">Amount (optional)</label><input className={inputCls} value={qrInputs.amount || ""} onChange={e => setQrInput("amount", e.target.value)} placeholder="100" type="number" /></div>
                    </div>
                  </div>
                )}
                {qrType === "wifi" && (
                  <div className="space-y-3">
                    <div><label className="block text-xs font-medium text-foreground-muted mb-1.5 uppercase tracking-wide">WiFi Name (SSID)</label><input className={inputCls} value={qrInputs.ssid || ""} onChange={e => setQrInput("ssid", e.target.value)} placeholder="MyHomeWiFi" /></div>
                    <div><label className="block text-xs font-medium text-foreground-muted mb-1.5 uppercase tracking-wide">Password</label><input className={inputCls} value={qrInputs.wifiPass || ""} onChange={e => setQrInput("wifiPass", e.target.value)} placeholder="WiFi password" type="password" /></div>
                    <div>
                      <label className="block text-xs font-medium text-foreground-muted mb-1.5 uppercase tracking-wide">Security</label>
                      <select className={inputCls} value={qrInputs.wifiSec || "WPA"} onChange={e => setQrInput("wifiSec", e.target.value)}>
                        <option value="WPA">WPA/WPA2</option>
                        <option value="WEP">WEP</option>
                        <option value="nopass">None (Open)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Customization */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-foreground-muted mb-2 uppercase tracking-wide">Size (px)</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {QR_SIZES.map(s => (
                      <button key={s} onClick={() => setQrSize(s)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${qrSize === s ? "bg-violet-600 text-white border-violet-600" : "border-border text-foreground-muted hover:border-violet-500/50"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground-muted mb-2 uppercase tracking-wide">Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {QR_COLORS.map(c => (
                      <button key={c} onClick={() => setQrColor(c)}
                        className={`h-7 w-7 rounded-lg border-2 transition-all ${qrColor === c ? "border-white scale-110 shadow-md" : "border-transparent"}`}
                        style={{ backgroundColor: c }} />
                    ))}
                    <input type="color" value={qrColor} onChange={e => setQrColor(e.target.value)}
                      className="h-7 w-7 rounded-lg border-2 border-slate-600 cursor-pointer bg-transparent" title="Custom color" />
                  </div>
                </div>
              </div>

              <button onClick={generateQR} disabled={qrLoading}
                className="w-full py-3 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}>
                {qrLoading ? <><span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating…</> : <><QrCode className="h-4 w-4" />Generate QR Code</>}
              </button>
            </>
          )}

          {tab === "barcode" && (
            <>
              {/* Format selector */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2.5">Barcode Format</label>
                <div className="grid grid-cols-2 gap-2">
                  {BARCODE_FORMATS.map(f => (
                    <button key={f.id} onClick={() => { setBarcodeFormat(f.id); setBarcodeImage(""); setBarcodeError(""); }}
                      className={`p-3 rounded-xl border text-left transition-all ${barcodeFormat === f.id ? "border-violet-500 bg-violet-500/10" : "border-border bg-card hover:border-violet-500/40"}`}>
                      <p className={`text-sm font-bold ${barcodeFormat === f.id ? "text-violet-400" : "text-foreground"}`}>{f.label}</p>
                      <p className="text-[11px] text-foreground-muted mt-0.5">{f.hint}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground-muted mb-1.5 uppercase tracking-wide">
                  {barcodeFormat === "EAN13" ? "13-Digit Number" : barcodeFormat === "UPC" ? "12-Digit Number" : "Text / Number to Encode"}
                </label>
                <input className={inputCls} value={barcodeText} onChange={e => { setBarcodeText(e.target.value); setBarcodeImage(""); setBarcodeError(""); }}
                  placeholder={barcodeFormat === "EAN13" ? "1234567890128" : barcodeFormat === "UPC" ? "012345678905" : "Enter text or number..."}
                  type={barcodeFormat === "EAN13" || barcodeFormat === "UPC" ? "number" : "text"} />
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={showLabel} onChange={e => setShowLabel(e.target.checked)} className="accent-violet-500 h-4 w-4" />
                <span className="text-sm text-foreground">Show text label below barcode</span>
              </label>

              {barcodeError && <p className="text-red-400 text-sm p-3 bg-red-500/5 border border-red-500/20 rounded-xl">{barcodeError}</p>}

              <button onClick={generateBarcode} disabled={barcodeLoading || !barcodeText.trim()}
                className="w-full py-3 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}>
                {barcodeLoading ? <><span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating…</> : <><BarChart2 className="h-4 w-4" />Generate Barcode</>}
              </button>
            </>
          )}
        </div>

        {/* ── Right: Preview ── */}
        <div>
          <div className="border border-card-border rounded-2xl bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-card-border flex items-center gap-2">
              {tab === "qr" ? <QrCode className="h-4 w-4 text-violet-400" /> : <BarChart2 className="h-4 w-4 text-violet-400" />}
              <span className="text-sm font-semibold text-foreground">{tab === "qr" ? "QR Code Preview" : "Barcode Preview"}</span>
            </div>

            <div className="p-6 flex flex-col items-center min-h-[280px] justify-center">
              {tab === "qr" && (
                <>
                  {qrImage ? (
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-4">
                      <div className="p-3 bg-white rounded-2xl shadow-xl">
                        <img src={qrImage} alt="QR Code" className="block" style={{ width: qrSize, height: qrSize, maxWidth: "100%" }} />
                      </div>
                      <div className="flex flex-wrap gap-2 justify-center">
                        <button onClick={() => downloadImage(qrImage, "qrcode.png")}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 transition-colors">
                          <Download className="h-3.5 w-3.5" /> Download PNG
                        </button>
                        <button onClick={() => printImage(qrImage, "QR Code")}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-700 text-white text-xs font-semibold hover:bg-slate-600 transition-colors">
                          <Printer className="h-3.5 w-3.5" /> Print
                        </button>
                        <button onClick={copyQRText}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-600 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors">
                          {copied ? <><Check className="h-3.5 w-3.5 text-emerald-400" />Copied</> : <><Copy className="h-3.5 w-3.5" />Copy Link</>}
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="text-center">
                      <div className="h-16 w-16 rounded-2xl bg-violet-500/10 border-2 border-dashed border-violet-500/30 flex items-center justify-center mx-auto mb-3">
                        <QrCode className="h-8 w-8 text-violet-400/50" />
                      </div>
                      <p className="text-sm text-foreground-muted">Fill in the details and click</p>
                      <p className="text-sm font-semibold text-violet-400">Generate QR Code</p>
                    </div>
                  )}
                </>
              )}

              {tab === "barcode" && (
                <>
                  {barcodeImage ? (
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-4 w-full">
                      <div className="p-4 bg-white rounded-2xl shadow-xl w-full flex justify-center">
                        <img src={barcodeImage} alt="Barcode" className="max-w-full" />
                      </div>
                      <div className="flex flex-wrap gap-2 justify-center">
                        <button onClick={() => downloadImage(barcodeImage, `barcode_${barcodeFormat}.png`)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 transition-colors">
                          <Download className="h-3.5 w-3.5" /> Download PNG
                        </button>
                        <button onClick={() => printImage(barcodeImage, `${barcodeFormat} Barcode`)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-700 text-white text-xs font-semibold hover:bg-slate-600 transition-colors">
                          <Printer className="h-3.5 w-3.5" /> Print
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="text-center">
                      <div className="h-16 w-24 rounded-2xl bg-violet-500/10 border-2 border-dashed border-violet-500/30 flex items-center justify-center mx-auto mb-3">
                        <BarChart2 className="h-8 w-8 text-violet-400/50" />
                      </div>
                      <p className="text-sm text-foreground-muted">Enter text and click</p>
                      <p className="text-sm font-semibold text-violet-400">Generate Barcode</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Info box */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              { title: tab === "qr" ? "QR Use Cases" : "Barcode Use Cases", items: tab === "qr" ? ["Share URLs & contact info", "UPI payment QR codes", "WiFi password sharing", "WhatsApp quick links"] : ["Product labeling & inventory", "Retail price tags", "Shipping & logistics", "Library book tracking"] },
              { title: "Tips", items: tab === "qr" ? ["Larger size = easier scan", "Dark colors scan better", "Error correction built-in", "Test before printing"] : ["Code128 works for any text", "EAN-13 needs exactly 13 digits", "Higher contrast = better scan", "Print at 300 DPI for best results"] },
            ].map(({ title, items }) => (
              <div key={title} className="border border-card-border bg-card rounded-xl p-3">
                <p className="text-xs font-bold text-foreground-muted uppercase tracking-wide mb-2">{title}</p>
                <ul className="space-y-1">
                  {items.map(item => <li key={item} className="text-xs text-foreground-muted flex items-start gap-1.5"><span className="text-violet-400 shrink-0 mt-0.5">•</span>{item}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
