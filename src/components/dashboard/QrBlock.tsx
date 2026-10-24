import { Download, QrCode, Smartphone } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { isValidUrl } from "@/lib/dashboard-store";

export function QrBlock({ url }: { url: string }) {
  const [src, setSrc] = useState("");
  const valid = isValidUrl(url);
  useEffect(() => {
    if (!valid) return setSrc("");
    QRCode.toDataURL(url, {
      width: 480,
      margin: 1,
      color: { dark: "#14234f", light: "#ffffff" },
    })
      .then(setSrc)
      .catch(() => setSrc(""));
  }, [url, valid]);

  return (
    <div className="flex items-stretch overflow-hidden rounded-xl border border-border bg-card shadow-card">
      <div className="grid w-28 shrink-0 place-items-center border-r border-border bg-card p-2">
        {src ? (
          <img src={src} alt="QR Code ผลงาน" className="h-24 w-24" />
        ) : (
          <div className="grid h-24 w-24 place-items-center rounded-md bg-muted text-center text-[10px] text-muted-foreground">
            <QrCode className="mx-auto h-6 w-6" />
            ยังไม่ได้ตั้งค่าลิงก์
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 items-center gap-3 p-3">
        <Smartphone className="h-6 w-6 shrink-0 text-primary" />
        <div className="min-w-0">
          <p className="font-display font-semibold text-primary">
            สแกนดูผลงาน (Portfolio)
          </p>
          <p className="text-sm text-muted-foreground">
            สแกน QR เพื่อดูรายละเอียดเพิ่มเติม
          </p>
          {src && (
            <a
              href={src}
              download="portfolio-qr.png"
              className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-emerald hover:underline"
            >
              <Download className="h-3.5 w-3.5" /> ดาวน์โหลด QR (PNG)
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
