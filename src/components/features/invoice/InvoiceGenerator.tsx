"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";

const inputClass = "w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-sky-500/30";
const labelClass = "text-xs font-semibold text-foreground-muted uppercase tracking-wide block mb-1.5";

type LineItem = { id: number; description: string; qty: string; rate: string };

function genId() { return Date.now() + Math.random(); }

export function InvoiceGenerator() {
  const [fromName, setFromName] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [fromAddress, setFromAddress] = useState("");
  const [fromPhone, setFromPhone] = useState("");

  const [toName, setToName] = useState("");
  const [toEmail, setToEmail] = useState("");
  const [toAddress, setToAddress] = useState("");

  const [invoiceNo, setInvoiceNo] = useState("INV-001");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [taxRate, setTaxRate] = useState("18");
  const [notes, setNotes] = useState("");

  const [items, setItems] = useState<LineItem[]>([{ id: genId(), description: "", qty: "1", rate: "" }]);

  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const now = new Date();
    setInvoiceNo(`INV-${now.getFullYear()}-001`);
    setInvoiceDate(now.toISOString().slice(0, 10));
  }, []);

  function addItem() { setItems(prev => [...prev, { id: genId(), description: "", qty: "1", rate: "" }]); }
  function removeItem(id: number) { setItems(prev => prev.filter(i => i.id !== id)); }
  function updateItem(id: number, field: keyof LineItem, value: string) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  }

  const subtotal = items.reduce((s, i) => s + (parseFloat(i.qty) || 0) * (parseFloat(i.rate) || 0), 0);
  const tax = subtotal * (parseFloat(taxRate) || 0) / 100;
  const total = subtotal + tax;

  const SYMBOLS: Record<string, string> = { INR: "₹", USD: "$", EUR: "€", GBP: "£", AED: "د.إ" };
  const sym = SYMBOLS[currency] ?? currency + " ";

  function fmt(n: number) { return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

  async function printInvoice() {
    const el = previewRef.current;
    if (!el) return;
    const { default: html2canvas } = await import("html2canvas");
    const { default: jsPDF } = await import("jspdf");
    const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
    const imgData = canvas.toDataURL("image/png");
    const A4_W = 210, A4_H = 297;
    const imgW = A4_W, imgH = (canvas.height / canvas.width) * A4_W;
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    let yOff = 0;
    while (yOff < imgH) {
      if (yOff > 0) pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, -yOff, imgW, imgH);
      yOff += A4_H;
    }
    pdf.save(`${invoiceNo}.pdf`);
  }

  function printDirect() {
    const el = previewRef.current;
    if (!el) return;
    const win = window.open("", "_blank", "width=800,height=900");
    if (!win) return;
    win.document.write(`<html><head><title>${invoiceNo}</title><style>body{margin:0;font-family:sans-serif}@media print{body{margin:0}}</style></head><body>${el.innerHTML}</body></html>`);
    win.document.close();
    setTimeout(() => { win.focus(); win.print(); }, 400);
  }

  const currencies = ["INR", "USD", "EUR", "GBP", "AED", "SGD", "CAD", "AUD"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Invoice Generator</h1>
          <p className="text-sm text-foreground-muted mt-0.5">Create professional invoices — download PDF or print instantly</p>
        </div>
        <div className="flex gap-2">
          <button onClick={printInvoice} className="h-10 px-5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity">
            Download PDF
          </button>
          <button onClick={printDirect} className="h-10 px-5 rounded-xl border border-border bg-background text-foreground text-sm font-semibold hover:bg-background-subtle transition-colors">
            Print
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Form ───────────────────────────── */}
        <div className="space-y-5">
          {/* Invoice details */}
          <div className="rounded-2xl border border-card-border bg-card p-5 space-y-4">
            <h2 className="text-sm font-bold text-foreground">Invoice Details</h2>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelClass}>Invoice #</label><input className={inputClass} value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} /></div>
              <div><label className={labelClass}>Currency</label>
                <select className={inputClass} value={currency} onChange={e => setCurrency(e.target.value)}>
                  {currencies.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div><label className={labelClass}>Invoice Date</label><input type="date" className={inputClass} value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} /></div>
              <div><label className={labelClass}>Due Date</label><input type="date" className={inputClass} value={dueDate} onChange={e => setDueDate(e.target.value)} /></div>
            </div>
          </div>

          {/* From / To */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-card-border bg-card p-5 space-y-3">
              <h2 className="text-sm font-bold text-foreground">From (Your Details)</h2>
              {[
                { label: "Name / Company", value: fromName, set: setFromName, placeholder: "Your Business" },
                { label: "Email", value: fromEmail, set: setFromEmail, placeholder: "you@example.com" },
                { label: "Phone", value: fromPhone, set: setFromPhone, placeholder: "+91 9876543210" },
                { label: "Address", value: fromAddress, set: setFromAddress, placeholder: "City, State" },
              ].map(({ label, value, set, placeholder }) => (
                <div key={label}><label className={labelClass}>{label}</label><input className={inputClass} value={value} onChange={e => set(e.target.value)} placeholder={placeholder} /></div>
              ))}
            </div>
            <div className="rounded-2xl border border-card-border bg-card p-5 space-y-3">
              <h2 className="text-sm font-bold text-foreground">Bill To (Client)</h2>
              {[
                { label: "Name / Company", value: toName, set: setToName, placeholder: "Client Name" },
                { label: "Email", value: toEmail, set: setToEmail, placeholder: "client@example.com" },
                { label: "Address", value: toAddress, set: setToAddress, placeholder: "Client Address" },
              ].map(({ label, value, set, placeholder }) => (
                <div key={label}><label className={labelClass}>{label}</label><input className={inputClass} value={value} onChange={e => set(e.target.value)} placeholder={placeholder} /></div>
              ))}
            </div>
          </div>

          {/* Line items */}
          <div className="rounded-2xl border border-card-border bg-card p-5 space-y-3">
            <h2 className="text-sm font-bold text-foreground">Line Items</h2>
            <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-foreground-muted uppercase tracking-wide">
              <span className="col-span-6">Description</span>
              <span className="col-span-2 text-center">Qty</span>
              <span className="col-span-3 text-right">Rate ({sym})</span>
              <span className="col-span-1"></span>
            </div>
            {items.map(item => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                <input className={clsx(inputClass, "col-span-6")} value={item.description} onChange={e => updateItem(item.id, "description", e.target.value)} placeholder="Service or product" />
                <input type="number" className={clsx(inputClass, "col-span-2 text-center")} value={item.qty} onChange={e => updateItem(item.id, "qty", e.target.value)} min="0" />
                <input type="number" className={clsx(inputClass, "col-span-3 text-right")} value={item.rate} onChange={e => updateItem(item.id, "rate", e.target.value)} placeholder="0.00" min="0" />
                <button onClick={() => removeItem(item.id)} className="col-span-1 text-foreground-muted hover:text-rose-500 transition-colors text-lg font-bold flex justify-center">×</button>
              </div>
            ))}
            <button onClick={addItem} className="text-xs font-semibold text-sky-600 hover:text-sky-700 transition-colors">+ Add item</button>
          </div>

          {/* Tax & Notes */}
          <div className="rounded-2xl border border-card-border bg-card p-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelClass}>Tax Rate (%)</label><input type="number" className={inputClass} value={taxRate} onChange={e => setTaxRate(e.target.value)} placeholder="18" min="0" max="100" /></div>
              <div className="flex flex-col justify-end space-y-1">
                <p className="text-xs text-foreground-muted">Subtotal: <span className="font-semibold text-foreground">{sym}{fmt(subtotal)}</span></p>
                <p className="text-xs text-foreground-muted">Tax ({taxRate}%): <span className="font-semibold text-foreground">{sym}{fmt(tax)}</span></p>
                <p className="text-sm font-bold text-sky-600">Total: {sym}{fmt(total)}</p>
              </div>
            </div>
            <div><label className={labelClass}>Notes / Payment Terms</label><textarea className={clsx(inputClass, "resize-none h-20")} value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Payment due within 30 days. Bank: HDFC A/C 1234567890. IFSC: HDFC0001234" /></div>
          </div>
        </div>

        {/* ── Live Preview ───────────────────────── */}
        <div className="lg:sticky lg:top-4">
          <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wide mb-3">Preview</p>
          <motion.div
            ref={previewRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-lg border border-card-border p-8 text-gray-800 text-sm overflow-hidden"
            style={{ fontFamily: "sans-serif", minHeight: 600 }}
          >
            {/* Invoice header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-black text-sky-600 tracking-tight">INVOICE</h1>
                <p className="text-gray-500 text-sm mt-1">#{invoiceNo}</p>
              </div>
              <div className="text-right text-xs text-gray-500 space-y-0.5">
                <p>Date: <span className="font-semibold text-gray-700">{invoiceDate}</span></p>
                {dueDate && <p>Due: <span className="font-semibold text-gray-700">{dueDate}</span></p>}
              </div>
            </div>

            {/* From / To */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">From</p>
                <p className="font-bold text-gray-800">{fromName || "Your Business"}</p>
                {fromEmail && <p className="text-gray-500">{fromEmail}</p>}
                {fromPhone && <p className="text-gray-500">{fromPhone}</p>}
                {fromAddress && <p className="text-gray-500 whitespace-pre-line">{fromAddress}</p>}
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Bill To</p>
                <p className="font-bold text-gray-800">{toName || "Client Name"}</p>
                {toEmail && <p className="text-gray-500">{toEmail}</p>}
                {toAddress && <p className="text-gray-500 whitespace-pre-line">{toAddress}</p>}
              </div>
            </div>

            {/* Items table */}
            <table className="w-full text-xs mb-6" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f0f9ff", color: "#0284c7" }}>
                  <th className="text-left py-2 px-3 font-bold rounded-tl-lg">Description</th>
                  <th className="text-center py-2 px-3 font-bold">Qty</th>
                  <th className="text-right py-2 px-3 font-bold">Rate</th>
                  <th className="text-right py-2 px-3 font-bold rounded-tr-lg">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={item.id} style={{ backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f8fafc" }}>
                    <td className="py-2 px-3 text-gray-700">{item.description || "—"}</td>
                    <td className="py-2 px-3 text-center text-gray-600">{item.qty}</td>
                    <td className="py-2 px-3 text-right text-gray-600">{sym}{fmt(parseFloat(item.rate) || 0)}</td>
                    <td className="py-2 px-3 text-right font-semibold text-gray-800">{sym}{fmt((parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="ml-auto w-48 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{sym}{fmt(subtotal)}</span></div>
              {parseFloat(taxRate) > 0 && <div className="flex justify-between text-gray-600"><span>Tax ({taxRate}%)</span><span>{sym}{fmt(tax)}</span></div>}
              <div className="flex justify-between font-black text-base text-sky-600 border-t border-gray-200 pt-2 mt-2">
                <span>Total</span><span>{sym}{fmt(total)}</span>
              </div>
            </div>

            {/* Notes */}
            {notes && (
              <div className="mt-8 pt-4 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Notes</p>
                <p className="text-xs text-gray-500 whitespace-pre-line">{notes}</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
