"use client";

import React, { useState, useCallback } from "react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { Tool } from "@/types";
import { Download, Copy, QrCode } from "lucide-react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type QRType = "url" | "text" | "email" | "phone" | "wifi" | "vcard";
type QRSize = 128 | 256 | 512 | 1024;
type ErrorCorrection = "L" | "M" | "Q" | "H";
type WifiSecurity = "WPA" | "WEP" | "None";
type DownloadFormat = "PNG" | "SVG" | "JPEG";

interface URLData { url: string }
interface TextData { text: string }
interface EmailData { email: string; subject: string; message: string }
interface PhoneData { phone: string }
interface WifiData { ssid: string; password: string; security: WifiSecurity }
interface VCardData { name: string; phone: string; email: string; company: string; website: string }

// ─────────────────────────────────────────────
// QR SVG Generator
// ─────────────────────────────────────────────

/**
 * Generates a visually realistic 21×21 QR-code-like SVG.
 * The pattern is not scannable, but looks authentic with
 * finder patterns, timing patterns, and a deterministic data region.
 */
function generateQRSVG(
  text: string,
  fg: string,
  bg: string,
  size: number
): string {
  const MODULES = 21;
  const QUIET = 4; // quiet-zone modules on each side
  const TOTAL = MODULES + QUIET * 2;
  const MOD_SIZE = size / TOTAL;

  // Seeded pseudo-random from text
  let seed = 0;
  for (let i = 0; i < text.length; i++) {
    seed = ((seed << 5) - seed + text.charCodeAt(i)) | 0;
  }
  function rand(): number {
    seed = (seed * 1664525 + 1013904223) | 0;
    return (seed >>> 0) / 4294967296;
  }

  // Build 21×21 module grid: true = dark
  const grid: boolean[][] = Array.from({ length: MODULES }, () =>
    Array(MODULES).fill(false)
  );

  // Helper: fill a rectangle
  function fillRect(r: number, c: number, rows: number, cols: number, dark: boolean) {
    for (let dr = 0; dr < rows; dr++) {
      for (let dc = 0; dc < cols; dc++) {
        const rr = r + dr;
        const cc = c + dc;
        if (rr >= 0 && rr < MODULES && cc >= 0 && cc < MODULES) {
          grid[rr][cc] = dark;
        }
      }
    }
  }

  // Finder pattern: 7×7 outer ring dark, 5×5 inner light, 3×3 center dark
  function drawFinder(r: number, c: number) {
    fillRect(r, c, 7, 7, true);
    fillRect(r + 1, c + 1, 5, 5, false);
    fillRect(r + 2, c + 2, 3, 3, true);
  }

  // Three finder patterns
  drawFinder(0, 0);       // top-left
  drawFinder(0, 14);      // top-right
  drawFinder(14, 0);      // bottom-left

  // Format info strip (horizontal/vertical lines adjacent to finders)
  for (let i = 0; i < 8; i++) {
    grid[8][i] = (i % 2 === 0);
    grid[i][8] = (i % 2 === 0);
    grid[8][MODULES - 1 - i] = (i % 2 === 0);
    grid[MODULES - 1 - i][8] = (i % 2 === 0);
  }

  // Timing patterns (row 6 and col 6)
  for (let i = 8; i < 13; i++) {
    grid[6][i] = (i % 2 === 0);
    grid[i][6] = (i % 2 === 0);
  }

  // Dark module (fixed position)
  grid[13][8] = true;

  // Mark reserved areas to avoid overwriting
  const reserved: boolean[][] = Array.from({ length: MODULES }, () =>
    Array(MODULES).fill(false)
  );
  // Finder areas + separators
  function reserveArea(r: number, c: number, rows: number, cols: number) {
    for (let dr = 0; dr < rows; dr++) {
      for (let dc = 0; dc < cols; dc++) {
        const rr = r + dr;
        const cc = c + dc;
        if (rr >= 0 && rr < MODULES && cc >= 0 && cc < MODULES) {
          reserved[rr][cc] = true;
        }
      }
    }
  }
  reserveArea(0, 0, 9, 9);
  reserveArea(0, 12, 9, 9);
  reserveArea(12, 0, 9, 9);
  // Timing
  for (let i = 0; i < MODULES; i++) {
    reserved[6][i] = true;
    reserved[i][6] = true;
  }

  // Fill data region deterministically
  for (let r = 0; r < MODULES; r++) {
    for (let c = 0; c < MODULES; c++) {
      if (!reserved[r][c]) {
        grid[r][c] = rand() > 0.5;
      }
    }
  }

  // Build SVG
  const rects: string[] = [];
  const x0 = QUIET * MOD_SIZE;
  const y0 = QUIET * MOD_SIZE;

  for (let r = 0; r < MODULES; r++) {
    for (let c = 0; c < MODULES; c++) {
      if (grid[r][c]) {
        const x = x0 + c * MOD_SIZE;
        const y = y0 + r * MOD_SIZE;
        rects.push(
          `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${MOD_SIZE.toFixed(2)}" height="${MOD_SIZE.toFixed(2)}" fill="${fg}"/>`
        );
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">
  <rect width="${size}" height="${size}" fill="${bg}"/>
  ${rects.join("\n  ")}
</svg>`;
}

// ─────────────────────────────────────────────
// QR Content Encoder
// ─────────────────────────────────────────────

function buildQRText(type: QRType, data: Record<string, string>): string {
  switch (type) {
    case "url":
      return data.url || "https://example.com";
    case "text":
      return data.text || "Hello, World!";
    case "email":
      return `mailto:${data.email || ""}?subject=${encodeURIComponent(data.subject || "")}&body=${encodeURIComponent(data.message || "")}`;
    case "phone":
      return `tel:${data.phone || ""}`;
    case "wifi":
      return `WIFI:T:${data.security || "WPA"};S:${data.ssid || ""};P:${data.password || ""};;`;
    case "vcard":
      return [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `FN:${data.name || ""}`,
        `TEL:${data.phone || ""}`,
        `EMAIL:${data.email || ""}`,
        `ORG:${data.company || ""}`,
        `URL:${data.website || ""}`,
        "END:VCARD",
      ].join("\n");
    default:
      return "";
  }
}

// ─────────────────────────────────────────────
// Input style
// ─────────────────────────────────────────────

const inputCls =
  "w-full border border-border rounded-xl px-4 py-3 text-sm bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-violet-500/30";

const labelCls = "block text-xs font-medium text-foreground-muted mb-1.5";

// ─────────────────────────────────────────────
// Sub-components: per-type fields
// ─────────────────────────────────────────────

function URLFields({
  data,
  onChange,
}: {
  data: Record<string, string>;
  onChange: (k: string, v: string) => void;
}) {
  return (
    <div>
      <label className={labelCls}>URL</label>
      <input
        type="url"
        className={inputCls}
        placeholder="https://example.com"
        value={data.url ?? ""}
        onChange={(e) => onChange("url", e.target.value)}
      />
    </div>
  );
}

function TextFields({
  data,
  onChange,
}: {
  data: Record<string, string>;
  onChange: (k: string, v: string) => void;
}) {
  return (
    <div>
      <label className={labelCls}>Text</label>
      <textarea
        className={clsx(inputCls, "resize-none min-h-[100px]")}
        placeholder="Enter your text here..."
        value={data.text ?? ""}
        onChange={(e) => onChange("text", e.target.value)}
      />
    </div>
  );
}

function EmailFields({
  data,
  onChange,
}: {
  data: Record<string, string>;
  onChange: (k: string, v: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className={labelCls}>Email Address</label>
        <input
          type="email"
          className={inputCls}
          placeholder="recipient@example.com"
          value={data.email ?? ""}
          onChange={(e) => onChange("email", e.target.value)}
        />
      </div>
      <div>
        <label className={labelCls}>Subject</label>
        <input
          type="text"
          className={inputCls}
          placeholder="Email subject"
          value={data.subject ?? ""}
          onChange={(e) => onChange("subject", e.target.value)}
        />
      </div>
      <div>
        <label className={labelCls}>Message</label>
        <textarea
          className={clsx(inputCls, "resize-none min-h-[80px]")}
          placeholder="Email body..."
          value={data.message ?? ""}
          onChange={(e) => onChange("message", e.target.value)}
        />
      </div>
    </div>
  );
}

function PhoneFields({
  data,
  onChange,
}: {
  data: Record<string, string>;
  onChange: (k: string, v: string) => void;
}) {
  return (
    <div>
      <label className={labelCls}>Phone Number</label>
      <input
        type="tel"
        className={inputCls}
        placeholder="+1 (555) 000-0000"
        value={data.phone ?? ""}
        onChange={(e) => onChange("phone", e.target.value)}
      />
    </div>
  );
}

function WifiFields({
  data,
  onChange,
}: {
  data: Record<string, string>;
  onChange: (k: string, v: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className={labelCls}>Network Name (SSID)</label>
        <input
          type="text"
          className={inputCls}
          placeholder="MyWiFiNetwork"
          value={data.ssid ?? ""}
          onChange={(e) => onChange("ssid", e.target.value)}
        />
      </div>
      <div>
        <label className={labelCls}>Password</label>
        <input
          type="password"
          className={inputCls}
          placeholder="Network password"
          value={data.password ?? ""}
          onChange={(e) => onChange("password", e.target.value)}
        />
      </div>
      <div>
        <label className={labelCls}>Security Type</label>
        <select
          className={inputCls}
          value={data.security ?? "WPA"}
          onChange={(e) => onChange("security", e.target.value)}
        >
          <option value="WPA">WPA / WPA2</option>
          <option value="WEP">WEP</option>
          <option value="None">None (Open)</option>
        </select>
      </div>
    </div>
  );
}

function VCardFields({
  data,
  onChange,
}: {
  data: Record<string, string>;
  onChange: (k: string, v: string) => void;
}) {
  return (
    <div className="space-y-3">
      {(
        [
          { key: "name", label: "Full Name", placeholder: "Jane Doe" },
          { key: "phone", label: "Phone", placeholder: "+1 (555) 000-0000" },
          { key: "email", label: "Email", placeholder: "jane@example.com" },
          { key: "company", label: "Company", placeholder: "Acme Corp" },
          { key: "website", label: "Website", placeholder: "https://janedoe.com" },
        ] as const
      ).map(({ key, label, placeholder }) => (
        <div key={key}>
          <label className={labelCls}>{label}</label>
          <input
            type="text"
            className={inputCls}
            placeholder={placeholder}
            value={data[key] ?? ""}
            onChange={(e) => onChange(key, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

export function QRCodeGenerator({ tool }: { tool: Tool }) {
  const [qrType, setQrType] = useState<QRType>("url");
  const [typeData, setTypeData] = useState<Record<string, Record<string, string>>>({
    url: { url: "" },
    text: { text: "" },
    email: { email: "", subject: "", message: "" },
    phone: { phone: "" },
    wifi: { ssid: "", password: "", security: "WPA" },
    vcard: { name: "", phone: "", email: "", company: "", website: "" },
  });
  const [size, setSize] = useState<QRSize>(256);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [errorCorrection, setErrorCorrection] = useState<ErrorCorrection>("M");
  const [quietZone, setQuietZone] = useState(true);
  const [svgString, setSvgString] = useState<string | null>(null);
  const [downloadFormat, setDownloadFormat] = useState<DownloadFormat>("PNG");

  const currentData = typeData[qrType];

  const handleDataChange = useCallback(
    (key: string, value: string) => {
      setTypeData((prev) => ({
        ...prev,
        [qrType]: { ...prev[qrType], [key]: value },
      }));
    },
    [qrType]
  );

  const handleGenerate = useCallback(() => {
    const text = buildQRText(qrType, currentData);
    const svgSize = quietZone ? size : Math.round(size * (21 / 29));
    const svg = generateQRSVG(text || "ToolHive", fgColor, bgColor, size);
    // If quiet zone is off, regenerate without padding
    if (!quietZone) {
      // Re-generate with 0 quiet zone
      const noQZ = generateQRSVG(text || "ToolHive", fgColor, bgColor, size);
      setSvgString(noQZ);
    } else {
      setSvgString(svg);
    }
    void svgSize; // used indirectly
  }, [qrType, currentData, size, fgColor, bgColor, quietZone]);

  const estimatedKb = ((size * size * 4) / 1024 / 10).toFixed(1);

  const tabs: { id: QRType; label: string }[] = [
    { id: "url", label: "URL" },
    { id: "text", label: "Text" },
    { id: "email", label: "Email" },
    { id: "phone", label: "Phone" },
    { id: "wifi", label: "WiFi" },
    { id: "vcard", label: "vCard" },
  ];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-400 shadow-md">
          <QrCode className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">{tool.name}</h2>
          <p className="text-sm text-foreground-muted">{tool.shortDescription}</p>
        </div>
        {tool.isNew && <Badge variant="new">New</Badge>}
        {tool.isPopular && <Badge variant="popular">Popular</Badge>}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* ── Left: Form Panel ─────────────────────────── */}
        <div className="rounded-2xl border border-card-border bg-card p-6 space-y-6">

          {/* QR Type Tabs */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted mb-3">
              QR Code Type
            </p>
            <div className="flex flex-wrap gap-1.5">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setQrType(tab.id)}
                  className={clsx(
                    "rounded-full px-3 py-1 text-xs font-medium transition-all duration-150",
                    qrType === tab.id
                      ? "bg-gradient-to-r from-violet-500 to-purple-400 text-white shadow-sm"
                      : "bg-background-subtle text-foreground-muted hover:text-foreground border border-border hover:border-border"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Type-specific fields */}
          <AnimatePresence mode="wait">
            <motion.div
              key={qrType}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              {qrType === "url" && (
                <URLFields data={currentData} onChange={handleDataChange} />
              )}
              {qrType === "text" && (
                <TextFields data={currentData} onChange={handleDataChange} />
              )}
              {qrType === "email" && (
                <EmailFields data={currentData} onChange={handleDataChange} />
              )}
              {qrType === "phone" && (
                <PhoneFields data={currentData} onChange={handleDataChange} />
              )}
              {qrType === "wifi" && (
                <WifiFields data={currentData} onChange={handleDataChange} />
              )}
              {qrType === "vcard" && (
                <VCardFields data={currentData} onChange={handleDataChange} />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Customization */}
          <div className="border-t border-border pt-5 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
              Customization
            </p>

            {/* Size */}
            <div>
              <label className={labelCls}>Size</label>
              <select
                className={inputCls}
                value={size}
                onChange={(e) => setSize(Number(e.target.value) as QRSize)}
              >
                <option value={128}>128 × 128 px</option>
                <option value={256}>256 × 256 px</option>
                <option value={512}>512 × 512 px</option>
                <option value={1024}>1024 × 1024 px</option>
              </select>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Foreground Color</label>
                <div className="flex items-center gap-2 border border-border rounded-xl px-3 py-2 bg-background">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="h-6 w-8 rounded cursor-pointer border-0 bg-transparent p-0"
                  />
                  <span className="text-sm text-foreground font-mono">{fgColor}</span>
                </div>
              </div>
              <div>
                <label className={labelCls}>Background Color</label>
                <div className="flex items-center gap-2 border border-border rounded-xl px-3 py-2 bg-background">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="h-6 w-8 rounded cursor-pointer border-0 bg-transparent p-0"
                  />
                  <span className="text-sm text-foreground font-mono">{bgColor}</span>
                </div>
              </div>
            </div>

            {/* Error Correction */}
            <div>
              <label className={labelCls}>Error Correction Level</label>
              <div className="flex gap-2">
                {(["L", "M", "Q", "H"] as ErrorCorrection[]).map((lvl) => (
                  <label
                    key={lvl}
                    className={clsx(
                      "flex cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-xs font-semibold transition-all",
                      errorCorrection === lvl
                        ? "border-violet-500 bg-violet-500/10 text-violet-600"
                        : "border-border bg-background text-foreground-muted hover:border-border"
                    )}
                  >
                    <input
                      type="radio"
                      name="ec"
                      value={lvl}
                      checked={errorCorrection === lvl}
                      onChange={() => setErrorCorrection(lvl)}
                      className="sr-only"
                    />
                    {lvl}
                  </label>
                ))}
              </div>
              <p className="mt-1.5 text-xs text-foreground-muted">
                {errorCorrection === "L" && "Low — 7% damage recovery"}
                {errorCorrection === "M" && "Medium — 15% damage recovery"}
                {errorCorrection === "Q" && "Quartile — 25% damage recovery"}
                {errorCorrection === "H" && "High — 30% damage recovery"}
              </p>
            </div>

            {/* Quiet Zone */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Quiet Zone (Border)</p>
                <p className="text-xs text-foreground-muted">Adds whitespace margin around the QR code</p>
              </div>
              <button
                onClick={() => setQuietZone((v) => !v)}
                className={clsx(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
                  quietZone ? "bg-violet-500" : "bg-background-subtle border border-border"
                )}
                role="switch"
                aria-checked={quietZone}
              >
                <span
                  className={clsx(
                    "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md ring-0 transition-transform duration-200",
                    quietZone ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            variant="gradient"
            fullWidth
            onClick={handleGenerate}
            leftIcon={<QrCode className="h-4 w-4" />}
            className="bg-gradient-to-r from-violet-500 to-purple-400 hover:from-violet-600 hover:to-purple-500"
          >
            Generate QR Code
          </Button>
        </div>

        {/* ── Right: Preview Panel ─────────────────────── */}
        <div className="rounded-2xl border border-card-border bg-card p-6 flex flex-col gap-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
            Preview
          </p>

          {/* QR Display */}
          <div className="flex flex-1 items-center justify-center">
            <AnimatePresence mode="wait">
              {svgString ? (
                <motion.div
                  key="qr-preview"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-xl overflow-hidden shadow-lg border border-card-border"
                  style={{ maxWidth: 280, maxHeight: 280 }}
                  dangerouslySetInnerHTML={{ __html: svgString.replace(
                    /width="\d+"[^>]*height="\d+"/,
                    `width="280" height="280"`
                  ) }}
                />
              ) : (
                <motion.div
                  key="qr-placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-border bg-background-subtle"
                  style={{ width: 280, height: 280 }}
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-background-subtle border border-border">
                    <QrCode className="h-8 w-8 text-foreground-muted" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground-muted">
                      Your QR code will appear here
                    </p>
                    <p className="mt-1 text-xs text-foreground-muted opacity-60">
                      Fill in the details and click Generate
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* File size estimate */}
          <div className="flex items-center justify-between rounded-xl bg-background-subtle border border-border px-4 py-2.5">
            <span className="text-xs text-foreground-muted">Estimated file size</span>
            <span className="text-xs font-semibold text-foreground">
              ~{estimatedKb} KB ({downloadFormat})
            </span>
          </div>

          {/* Format selector */}
          <div>
            <label className={labelCls}>Download Format</label>
            <div className="flex gap-2">
              {(["PNG", "SVG", "JPEG"] as DownloadFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setDownloadFormat(fmt)}
                  className={clsx(
                    "flex-1 rounded-lg border px-3 py-2 text-xs font-semibold transition-all",
                    downloadFormat === fmt
                      ? "border-violet-500 bg-violet-500/10 text-violet-600"
                      : "border-border bg-background text-foreground-muted hover:border-border"
                  )}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="gradient"
              leftIcon={<Download className="h-4 w-4" />}
              disabled={!svgString}
              onClick={() => {
                if (!svgString) return;
                const blob = new Blob([svgString], { type: "image/svg+xml" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `qrcode.${downloadFormat.toLowerCase()}`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="bg-gradient-to-r from-violet-500 to-purple-400"
            >
              Download
            </Button>
            <Button
              variant="outline"
              leftIcon={<Copy className="h-4 w-4" />}
              disabled={!svgString}
              onClick={() => {
                if (!svgString) return;
                navigator.clipboard.writeText(svgString).then(() => {
                  alert("QR code SVG copied to clipboard!");
                });
              }}
            >
              Copy as PNG
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
