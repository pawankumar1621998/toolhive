"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import {
  Upload, Download, Type, Square, Circle, PenTool, Eraser,
  Trash2, X, Plus, Minus, Undo2, Redo2, ZoomIn, ZoomOut,
  Bold, Italic, Palette, Crop, RotateCw, FlipHorizontal, FlipVertical,
  Image, MousePointer, Highlighter, ArrowRight, DownloadCloud, UploadCloud
} from "lucide-react";
import type { Tool } from "@/types";

const cardClass = "rounded-xl border border-card-border bg-background-subtle p-4";
const primaryBtn = "h-11 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed";
const inputClass = "w-full border border-border rounded-xl px-4 py-3 text-sm bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-orange-500/30";
const toolbarBtn = "p-2.5 rounded-lg hover:bg-background-subtle transition-colors text-foreground-muted hover:text-foreground disabled:opacity-50";
const activeToolBtn = "p-2.5 rounded-lg bg-orange-500 text-white transition-colors";

interface TextAnnotation {
  id: string;
  x: number;
  y: number;
  content: string;
  color: string;
  fontSize: number;
  fontWeight: string;
  fontStyle: string;
}

interface ShapeAnnotation {
  id: string;
  type: "rect" | "circle" | "arrow" | "line";
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  strokeWidth: number;
}

interface BlurArea {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  blur: number;
}

export default function ScreenshotEditorWorkspace({ tool }: { tool: Tool }) {
  const [image, setImage] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);
  const [selectedTool, setSelectedTool] = useState("select");
  const [color, setColor] = useState("#FF0000");
  const [fontSize, setFontSize] = useState(16);
  const [fontWeight, setFontWeight] = useState("bold");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [blurAmount, setBlurAmount] = useState(10);

  const [texts, setTexts] = useState<TextAnnotation[]>([]);
  const [shapes, setShapes] = useState<ShapeAnnotation[]>([]);
  const [blurAreas, setBlurAreas] = useState<BlurArea[]>([]);
  const [history, setHistory] = useState<{ texts: TextAnnotation[], shapes: ShapeAnnotation[], blurAreas: BlurArea[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [tempShape, setTempShape] = useState<ShapeAnnotation | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const colors = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF", "#000000", "#FFFFFF", "#FF6600", "#9900FF"];
  const tools = [
    { id: "select", icon: MousePointer, label: "Select" },
    { id: "text", icon: Type, label: "Text" },
    { id: "rect", icon: Square, label: "Rectangle" },
    { id: "circle", icon: Circle, label: "Circle" },
    { id: "arrow", icon: ArrowRight, label: "Arrow" },
    { id: "line", icon: Minus, label: "Line" },
    { id: "blur", icon: Eraser, label: "Blur Area" },
    { id: "draw", icon: PenTool, label: "Draw" },
  ];

  // Save to history
  const saveToHistory = () => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ texts: [...texts], shapes: [...shapes], blurAreas: [...blurAreas] });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Undo
  const undo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setTexts(prev.texts);
      setShapes(prev.shapes);
      setBlurAreas(prev.blurAreas);
      setHistoryIndex(historyIndex - 1);
    }
  };

  // Redo
  const redo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setTexts(next.texts);
      setShapes(next.shapes);
      setBlurAreas(next.blurAreas);
      setHistoryIndex(historyIndex + 1);
    }
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          setImage(event.target?.result as string);
          setImageSize({ width: img.width, height: img.height });
          setScale(Math.min(800 / img.width, 600 / img.height, 1));
          setTexts([]);
          setShapes([]);
          setBlurAreas([]);
          setHistory([{ texts: [], shapes: [], blurAreas: [] }]);
          setHistoryIndex(0);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          setImage(event.target?.result as string);
          setImageSize({ width: img.width, height: img.height });
          setScale(Math.min(800 / img.width, 600 / img.height, 1));
          setTexts([]);
          setShapes([]);
          setBlurAreas([]);
          setHistory([{ texts: [], shapes: [], blurAreas: [] }]);
          setHistoryIndex(0);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  // Get position relative to image
  const getPos = (e: React.MouseEvent) => {
    if (!overlayRef.current) return { x: 0, y: 0 };
    const rect = overlayRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / scale,
      y: (e.clientY - rect.top) / scale,
    };
  };

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getPos(e);
    setStartPos(pos);
    setIsDrawing(true);

    if (selectedTool === "text") {
      const text = prompt("Enter text:");
      if (text) {
        const newText: TextAnnotation = {
          id: Date.now().toString(),
          x: pos.x,
          y: pos.y,
          content: text,
          color,
          fontSize,
          fontWeight,
          fontStyle: "normal",
        };
        setTexts([...texts, newText]);
        saveToHistory();
      }
      setIsDrawing(false);
    } else if (selectedTool === "blur") {
      setTempShape({
        id: Date.now().toString(),
        type: "rect",
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        color: "#000",
        strokeWidth: 0,
      });
    } else if (["rect", "circle", "arrow", "line"].includes(selectedTool)) {
      setTempShape({
        id: Date.now().toString(),
        type: selectedTool as any,
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        color,
        strokeWidth,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !tempShape) return;
    const pos = getPos(e);

    if (tempShape.type === "line") {
      setTempShape({
        ...tempShape,
        width: pos.x - startPos.x,
        height: pos.y - startPos.y,
      });
    } else {
      setTempShape({
        ...tempShape,
        x: Math.min(startPos.x, pos.x),
        y: Math.min(startPos.y, pos.y),
        width: Math.abs(pos.x - startPos.x),
        height: Math.abs(pos.y - startPos.y),
      });
    }
  };

  const handleMouseUp = () => {
    if (tempShape && tempShape.width > 5 && tempShape.height > 5) {
      if (selectedTool === "blur") {
        setBlurAreas([...blurAreas, { id: tempShape.id, x: tempShape.x, y: tempShape.y, width: tempShape.width, height: tempShape.height, blur: blurAmount }]);
      } else {
        setShapes([...shapes, tempShape]);
      }
      saveToHistory();
    }
    setIsDrawing(false);
    setTempShape(null);
  };

  // Delete selected item
  const deleteSelected = () => {
    if (selectedItem) {
      if (selectedItem.startsWith("text-")) {
        setTexts(texts.filter(t => t.id !== selectedItem));
      } else if (selectedItem.startsWith("blur-")) {
        setBlurAreas(blurAreas.filter(b => b.id !== selectedItem.replace("blur-", "")));
      } else {
        setShapes(shapes.filter(s => s.id !== selectedItem));
      }
      saveToHistory();
      setSelectedItem(null);
    }
  };

  // Download edited image
  const downloadImage = () => {
    if (!canvasRef.current || !image) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = imageSize.width;
    canvas.height = imageSize.height;

    // Draw original image
    const img = new window.Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);

      // Draw blur areas
      blurAreas.forEach(area => {
        ctx.filter = `blur(${area.blur}px)`;
        ctx.drawImage(canvas, area.x, area.y, area.width, area.height, area.x, area.y, area.width, area.height);
        ctx.filter = "none";
      });

      // Draw shapes
      shapes.forEach(shape => {
        ctx.strokeStyle = shape.color;
        ctx.lineWidth = shape.strokeWidth;
        ctx.fillStyle = shape.color;

        if (shape.type === "rect") {
          ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        } else if (shape.type === "circle") {
          ctx.beginPath();
          ctx.ellipse(shape.x + shape.width / 2, shape.y + shape.height / 2, shape.width / 2, shape.height / 2, 0, 0, 2 * Math.PI);
          ctx.stroke();
        } else if (shape.type === "arrow") {
          const headLen = 15;
          const angle = Math.atan2(shape.height, shape.width);
          ctx.beginPath();
          ctx.moveTo(shape.x, shape.y);
          ctx.lineTo(shape.x + shape.width, shape.y + shape.height);
          ctx.lineTo(shape.x + shape.width - headLen * Math.cos(angle - Math.PI / 6), shape.y + shape.height - headLen * Math.sin(angle - Math.PI / 6));
          ctx.moveTo(shape.x + shape.width, shape.y + shape.height);
          ctx.lineTo(shape.x + shape.width - headLen * Math.cos(angle + Math.PI / 6), shape.y + shape.height - headLen * Math.sin(angle + Math.PI / 6));
          ctx.stroke();
        } else if (shape.type === "line") {
          ctx.beginPath();
          ctx.moveTo(shape.x, shape.y);
          ctx.lineTo(shape.x + shape.width, shape.y + shape.height);
          ctx.stroke();
        }
      });

      // Draw texts
      texts.forEach(text => {
        ctx.font = `${text.fontWeight} ${text.fontSize}px Arial`;
        ctx.fillStyle = text.color;
        ctx.fillText(text.content, text.x, text.y);
      });

      // Download
      const link = document.createElement("a");
      link.download = "edited-screenshot.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = image;
  };

  return (
    <div className="space-y-5">
      {!image ? (
        // Upload Screen
        <div
          className="border-2 border-dashed border-border rounded-2xl p-12 text-center cursor-pointer hover:border-orange-400 transition-colors"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <UploadCloud className="h-10 w-10 text-orange-500" />
          </div>
          <h3 className="text-xl font-bold mb-2">Upload Screenshot to Edit</h3>
          <p className="text-sm text-foreground-muted mb-4">Drag & drop or click to browse</p>
          <p className="text-xs text-foreground-subtle">Supports PNG, JPG, WEBP</p>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </div>
      ) : (
        <>
          {/* Toolbar */}
          <div className={clsx(cardClass, "flex items-center gap-3 flex-wrap")}>
            {/* Tools */}
            <div className="flex items-center gap-1">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => { setSelectedTool(tool.id); setSelectedItem(null); }}
                  className={selectedTool === tool.id ? activeToolBtn : toolbarBtn}
                  title={tool.label}
                >
                  <tool.icon className="h-4 w-4" />
                </button>
              ))}
            </div>

            <div className="w-px h-6 bg-border" />

            {/* Colors */}
            <div className="flex items-center gap-1">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={clsx(
                    "w-6 h-6 rounded-full border-2 transition-all",
                    color === c ? "border-foreground scale-110" : "border-transparent"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>

            <div className="w-px h-6 bg-border" />

            {/* Font Size */}
            <div className="flex items-center gap-1">
              <button onClick={() => setFontSize(Math.max(10, fontSize - 2))} className={toolbarBtn}>
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-xs font-medium w-8 text-center">{fontSize}</span>
              <button onClick={() => setFontSize(Math.min(72, fontSize + 2))} className={toolbarBtn}>
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Font Weight */}
            <button
              onClick={() => setFontWeight(fontWeight === "bold" ? "normal" : "bold")}
              className={fontWeight === "bold" ? activeToolBtn : toolbarBtn}
            >
              <Bold className="h-4 w-4" />
            </button>

            <div className="w-px h-6 bg-border" />

            {/* Stroke Width */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-foreground-muted">Width:</span>
              <input
                type="range"
                min="1"
                max="10"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
                className="w-16"
              />
            </div>

            {/* Blur Amount */}
            {selectedTool === "blur" && (
              <>
                <div className="w-px h-6 bg-border" />
                <div className="flex items-center gap-1">
                  <span className="text-xs text-foreground-muted">Blur:</span>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    value={blurAmount}
                    onChange={(e) => setBlurAmount(Number(e.target.value))}
                    className="w-16"
                  />
                </div>
              </>
            )}

            <div className="ml-auto flex items-center gap-2">
              {/* Undo/Redo */}
              <button onClick={undo} disabled={historyIndex <= 0} className={toolbarBtn} title="Undo">
                <Undo2 className="h-4 w-4" />
              </button>
              <button onClick={redo} disabled={historyIndex >= history.length - 1} className={toolbarBtn} title="Redo">
                <Redo2 className="h-4 w-4" />
              </button>

              <div className="w-px h-6 bg-border" />

              {/* Zoom */}
              <button onClick={() => setScale(Math.max(0.25, scale - 0.25))} className={toolbarBtn}>
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="text-xs font-medium w-12 text-center">{Math.round(scale * 100)}%</span>
              <button onClick={() => setScale(Math.min(3, scale + 0.25))} className={toolbarBtn}>
                <ZoomIn className="h-4 w-4" />
              </button>

              {/* Download */}
              <button onClick={downloadImage} className={primaryBtn + " flex items-center gap-2"}>
                <Download className="h-4 w-4" /> Download
              </button>

              {/* New Image */}
              <button onClick={() => {
                setImage(null);
                setTexts([]);
                setShapes([]);
                setBlurAreas([]);
              }} className={toolbarBtn} title="Upload New">
                <Upload className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="relative border border-border rounded-xl overflow-auto bg-background-muted p-4">
            <div
              className="relative inline-block shadow-lg"
              style={{ width: imageSize.width * scale, height: imageSize.height * scale }}
            >
              <img
                src={image}
                alt="Screenshot"
                className="w-full h-full"
                style={{ width: imageSize.width * scale, height: imageSize.height * scale }}
                draggable={false}
              />

              {/* Overlay for drawing */}
              <div
                ref={overlayRef}
                className="absolute top-0 left-0 w-full h-full cursor-crosshair"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* Blur areas */}
                {blurAreas.map((area) => (
                  <div
                    key={area.id}
                    className="absolute border-2 border-dashed border-blue-500"
                    style={{
                      left: area.x * scale,
                      top: area.y * scale,
                      width: area.width * scale,
                      height: area.height * scale,
                      backdropFilter: `blur(${area.blur}px)`,
                    }}
                  />
                ))}

                {/* Shapes */}
                {shapes.map((shape) => (
                  <svg
                    key={shape.id}
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    style={{ overflow: "visible" }}
                  >
                    {shape.type === "rect" && (
                      <rect
                        x={shape.x * scale}
                        y={shape.y * scale}
                        width={shape.width * scale}
                        height={shape.height * scale}
                        fill="none"
                        stroke={shape.color}
                        strokeWidth={shape.strokeWidth}
                      />
                    )}
                    {shape.type === "circle" && (
                      <ellipse
                        cx={(shape.x + shape.width / 2) * scale}
                        cy={(shape.y + shape.height / 2) * scale}
                        rx={(shape.width / 2) * scale}
                        ry={(shape.height / 2) * scale}
                        fill="none"
                        stroke={shape.color}
                        strokeWidth={shape.strokeWidth}
                      />
                    )}
                    {shape.type === "line" && (
                      <line
                        x1={shape.x * scale}
                        y1={shape.y * scale}
                        x2={(shape.x + shape.width) * scale}
                        y2={(shape.y + shape.height) * scale}
                        stroke={shape.color}
                        strokeWidth={shape.strokeWidth}
                      />
                    )}
                    {shape.type === "arrow" && (
                      <>
                        <defs>
                          <marker
                            id={`arrowhead-${shape.id}`}
                            markerWidth="10"
                            markerHeight="7"
                            refX="9"
                            refY="3.5"
                            orient="auto"
                          >
                            <polygon points="0 0, 10 3.5, 0 7" fill={shape.color} />
                          </marker>
                        </defs>
                        <line
                          x1={shape.x * scale}
                          y1={shape.y * scale}
                          x2={(shape.x + shape.width) * scale}
                          y2={(shape.y + shape.height) * scale}
                          stroke={shape.color}
                          strokeWidth={shape.strokeWidth}
                          markerEnd={`url(#arrowhead-${shape.id})`}
                        />
                      </>
                    )}
                  </svg>
                ))}

                {/* Temp shape preview */}
                {tempShape && (
                  <svg
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    style={{ overflow: "visible" }}
                  >
                    <rect
                      x={tempShape.x * scale}
                      y={tempShape.y * scale}
                      width={tempShape.width * scale}
                      height={tempShape.height * scale}
                      fill="none"
                      stroke={tempShape.color}
                      strokeWidth={tempShape.strokeWidth}
                      strokeDasharray="5,5"
                    />
                  </svg>
                )}

                {/* Texts */}
                {texts.map((text) => (
                  <div
                    key={text.id}
                    className="absolute cursor-move"
                    style={{
                      left: text.x * scale,
                      top: text.y * scale,
                      fontSize: text.fontSize * scale,
                      fontWeight: text.fontWeight,
                      color: text.color,
                      textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
                    }}
                  >
                    {text.content}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Hidden canvas for export */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Stats */}
          <div className="text-center text-sm text-foreground-muted">
            {texts.length} text, {shapes.length} shapes, {blurAreas.length} blur areas
          </div>
        </>
      )}
    </div>
  );
}
