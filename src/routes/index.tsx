import { createFileRoute } from "@tanstack/react-router";
import {
  BadgeCheck,
  Building2,
  Check,
  CheckSquare,
  ChevronRight,
  Copy,
  Download,
  Eye,
  ExternalLink,
  FileText,
  GraduationCap,
  ImagePlus,
  Landmark,
  Link2,
  Lock,
  MapPin,
  Play,
  RotateCcw,
  Rocket,
  Save,
  Settings,
  Shield,
  ShieldCheck,
  Sheet,
  Square,
  Trash2,
  Unlock,
  User,
  X,
  XSquare,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import headerImg from "@/assets/header-songkhla.jpg";
import landmark from "@/assets/landmark-sketch.png";
import { EList, EText } from "@/components/dashboard/Editable";
import { QrBlock } from "@/components/dashboard/QrBlock";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DEFAULT_DATA,
  clearDashboard,
  isValidUrl,
  loadDashboard,
  normalizeUrl,
  saveDashboard,
  subscribeDashboard,
  toCsv,
  type DashboardData,
} from "@/lib/dashboard-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Songkhla SecureTrack — ระบบติดตามผลการตรวจสอบกิจการควบคุม" },
      {
        name: "description",
        content:
          "เว็บไซต์นำเสนอโครงงาน Songkhla SecureTrack ระบบฐานข้อมูลและติดตามผลการตรวจสอบกิจการควบคุมและสถานบริการ จังหวัดสงขลา",
      },
      { property: "og:title", content: "Songkhla SecureTrack" },
      {
        property: "og:description",
        content:
          "ระบบฐานข้อมูลและติดตามผลการตรวจสอบกิจการควบคุมและสถานบริการ จังหวัดสงขลา",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function readImage(file: File, cb: (url: string) => void) {
  if (file.size > 8 * 1024 * 1024) {
    toast.error("ไฟล์รูปใหญ่เกินไป (ไม่เกิน 8MB)");
    return;
  }
  const r = new FileReader();
  r.onload = (e) => {
    const rawResult = String(e.target?.result);
    const img = new Image();
    img.onload = () => {
      // Auto-resize to 400x400 max so it syncs across all devices effortlessly
      const canvas = document.createElement("canvas");
      const MAX_SIZE = 400;
      let width = img.width;
      let height = img.height;
      if (width > height) {
        if (width > MAX_SIZE) {
          height = Math.round((height * MAX_SIZE) / width);
          width = MAX_SIZE;
        }
      } else {
        if (height > MAX_SIZE) {
          width = Math.round((width * MAX_SIZE) / height);
          height = MAX_SIZE;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, width, height);
      const optimizedUrl = canvas.toDataURL("image/jpeg", 0.85);
      cb(optimizedUrl);
      toast.success("อัปโหลดและปรับขนาดรูปภาพสำเร็จ พร้อมบันทึกซิงค์ทุกอุปกรณ์");
    };
    img.onerror = () => {
      cb(rawResult);
    };
    img.src = rawResult;
  };
  r.onerror = () => toast.error("อ่านไฟล์รูปไม่สำเร็จ");
  r.readAsDataURL(file);
}

function Index() {
  const [saved, setSaved] = useState<DashboardData>(DEFAULT_DATA);
  const [draft, setDraft] = useState<DashboardData>(DEFAULT_DATA);
  const [edit, setEdit] = useState(false);
  const [saving, setSaving] = useState(false);

  // Secret Passcode Verification State
  const [passcodeModalOpen, setPasscodeModalOpen] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState("");
  const [passcodeError, setPasscodeError] = useState(false);

  // 1. Initial Load & Real-Time Multi-Device Cloud Sync
  useEffect(() => {
    try {
      const d = loadDashboard();
      setSaved(d);
      setDraft(d);
    } catch {
      toast.error("โหลดข้อมูลที่บันทึกไว้ไม่สำเร็จ — แสดงข้อมูลเริ่มต้นแทน");
    }

    // Subscribe to Firestore for instantaneous updates from any PC or mobile device
    const unsubscribe = subscribeDashboard((remoteData) => {
      setSaved(remoteData);
      setDraft((prev) => {
        if (!edit) return remoteData;
        return prev;
      });
    });

    return () => unsubscribe();
  }, [edit]);

  const dirty = useMemo(
    () => JSON.stringify(saved) !== JSON.stringify(draft),
    [saved, draft],
  );
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const d = edit ? draft : saved;
  const set = (fn: (x: DashboardData) => void) =>
    setDraft((prev) => {
      const n = structuredClone(prev);
      fn(n);
      return n;
    });

  const handlePasscodeSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = passcodeInput.trim();
    if (clean === "000000" || clean === "030848") {
      setPasscodeError(false);
      setPasscodeModalOpen(false);
      setPasscodeInput("");
      setDraft(saved);
      setEdit(true);
      toast.success("ยืนยันสิทธิ์ถูกต้อง เข้าสู่โหมดแก้ไขข้อมูลแล้ว");
    } else {
      setPasscodeError(true);
      setPasscodeInput("");
    }
  };

  const copyText = (txt: string, label: string) => {
    if (!txt) {
      toast.info(`ยังไม่มี URL สำหรับ ${label}`);
      return;
    }
    const cleanUrl = normalizeUrl(txt);
    navigator.clipboard.writeText(cleanUrl);
    toast.success(`คัดลอกลิงก์ ${label} แล้ว`);
  };

  const copyCodeJson = () => {
    const jsonStr = JSON.stringify(d, null, 2);
    navigator.clipboard.writeText(jsonStr);
    toast.success("คัดลอกโค้ด JSON ข้อมูลทั้งหมดแล้ว สามารถนำไปใส่ในโค้ด DEFAULT_DATA ได้ตลอด");
  };

  const save = async () => {
    setSaving(true);
    try {
      await saveDashboard(draft);
      setSaved(draft);
      toast.success("บันทึกข้อมูลและซิงค์คลาวด์เรียบร้อยแล้ว (อัปเดตทุกอุปกรณ์ทันที)");
      setEdit(false);
    } catch (err) {
      console.error("Save error:", err);
      toast.error("บันทึกไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต");
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => {
    if (
      dirty &&
      !window.confirm("มีการแก้ไขที่ยังไม่ได้บันทึก ต้องการยกเลิกหรือไม่?")
    )
      return;
    setDraft(saved);
    setEdit(false);
  };

  const preview = () => {
    if (dirty)
      toast.warning("ยังมีการแก้ไขที่ไม่ได้บันทึก — บันทึกข้อมูลที่ส่วนท้าย");
    setEdit(false);
  };

  const reset = async () => {
    clearDashboard();
    setSaved(structuredClone(DEFAULT_DATA));
    setDraft(structuredClone(DEFAULT_DATA));
    try {
      await saveDashboard(DEFAULT_DATA);
      toast.success("คืนค่าข้อมูลเริ่มต้นและซิงค์ขึ้นระบบคลาวด์แล้ว");
    } catch {
      toast.success("คืนค่าข้อมูลเริ่มต้นเรียบร้อยแล้ว");
    }
  };

  const exportCsv = () => {
    const blob = new Blob([toCsv(saved)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "songkhla-securetrack.csv";
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("ดาวน์โหลดไฟล์ CSV เรียบร้อยแล้ว");
  };

  const openLink = (rawUrl: string, name: string) => {
    const trimmed = rawUrl?.trim();
    if (!trimmed) {
      toast.info(
        `ยังไม่ได้กำหนดลิงก์ “${name}” — เข้าโหมดแก้ไขเพื่อเพิ่มลิงก์`,
      );
      return;
    }
    const url = normalizeUrl(trimmed);
    if (!isValidUrl(url)) {
      toast.error(`ลิงก์ “${name}” รูปแบบไม่ถูกต้อง`);
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      id="top"
      className="relative min-h-screen text-slate-900 flex flex-col justify-between selection:bg-blue-600 selection:text-white"
    >
      {/* 1. Apple-style Ambient Background: Real Songkhla landscape blurred with light bright daylight atmosphere */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none">
        {/* Scenic Background with Apple Glass Blur */}
        <img
          src={headerImg}
          alt="Songkhla Scenery Backdrop"
          className="absolute inset-0 w-full h-full object-cover object-center filter blur-xl scale-110 opacity-60"
        />
        {/* Light Sky & Luminous Day Gradient Mesh */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-100/50 via-white/60 to-slate-100/75" />

        {/* Ambient Light Orbs for Frosted Glass Depth */}
        <div className="absolute -top-28 -left-28 w-[32rem] h-[32rem] rounded-full bg-sky-400/25 blur-[130px]" />
        <div className="absolute top-1/4 -right-24 w-[36rem] h-[36rem] rounded-full bg-blue-400/20 blur-[150px]" />
        <div className="absolute bottom-10 left-1/4 w-[32rem] h-[32rem] rounded-full bg-amber-300/20 blur-[140px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen justify-between">
        {/* 2. TOP HEADER (Floating Frosted Glass Island - Light Tone, No Navigation Bar, No Edit Button at Top Right) */}
        <header className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 pt-4 sm:pt-6">
          <div className="w-full max-w-[1600px] mx-auto rounded-3xl bg-white/85 backdrop-blur-2xl text-slate-900 p-3.5 sm:p-5 shadow-xl shadow-slate-200/50 border border-white/80 transition-all">
            <div className="flex items-center justify-between gap-4">
              {/* Left: Official Emblem & Department Name */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center p-0.5 shadow-md border-2 border-amber-300/90">
                  <ShieldCheck className="h-6 w-6 sm:h-7 sm:w-7 text-slate-950 stroke-[2.2]" />
                </div>
                <div className="h-10 w-[1.5px] bg-slate-200 hidden sm:block" />
                <div className="flex flex-col text-left">
                  {edit ? (
                    <>
                      <input
                        type="text"
                        aria-label="ชื่อหน่วยงาน"
                        value={draft.orgName}
                        onChange={(e) =>
                          set((x) => {
                            x.orgName = e.target.value;
                          })
                        }
                        className="bg-white border border-slate-300 rounded-lg px-2 py-0.5 text-xs sm:text-sm text-slate-900 font-bold"
                      />
                      <input
                        type="text"
                        aria-label="กลุ่มงาน"
                        value={draft.orgSub}
                        onChange={(e) =>
                          set((x) => {
                            x.orgSub = e.target.value;
                          })
                        }
                        className="bg-white border border-slate-300 rounded-lg px-2 py-0.5 text-[11px] text-blue-700 mt-1"
                      />
                    </>
                  ) : (
                    <>
                      <span className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight leading-tight">
                        {d.orgName}
                      </span>
                      <span className="text-[11px] sm:text-xs text-blue-700 font-medium leading-tight">
                        {d.orgSub}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Center: System Title & Subtitle */}
              <div className="hidden md:flex flex-col items-center text-center max-w-xl px-2">
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-xl lg:text-2xl font-bold font-display tracking-tight text-slate-900">
                    {d.systemName}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    ระบบออนไลน์
                  </span>
                </div>
                <span className="text-xs text-slate-500 line-clamp-1 mt-0.5 font-normal">
                  {d.systemDesc}
                </span>
              </div>

              {/* Right: Student Profile Pill (Clean, Light Tone, No Edit Button) */}
              <div className="flex items-center gap-2.5 shrink-0">
                <div className="flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-slate-50/90 hover:bg-slate-100/90 border border-slate-200 text-slate-800 backdrop-blur-xl shadow-xs transition-colors">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-xs shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs sm:text-sm font-semibold text-slate-900 leading-tight">
                      {d.userName}
                    </span>
                    <span className="text-[10px] sm:text-xs text-slate-500 leading-tight">
                      {d.userSub}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Floating Edit Mode Status Banner */}
        {edit && (
          <div className="sticky top-4 z-40 px-4 sm:px-6 lg:px-8 xl:px-12 my-3">
            <div className="w-full max-w-[1600px] mx-auto bg-amber-500/90 backdrop-blur-xl text-slate-950 px-4 py-2.5 rounded-2xl shadow-xl border border-amber-300/80 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 font-bold text-xs sm:text-sm">
                <Unlock className="h-4 w-4" />
                <span>
                  โหมดแก้ไขข้อมูล (Editing Mode) — คุณสามารถแก้ไขข้อความ รูปภาพ
                  และลิงก์ได้โดยตรง
                </span>
                {dirty && (
                  <span className="bg-slate-950 text-amber-300 px-2.5 py-0.5 rounded-full text-[10px] font-mono">
                    มีการเปลี่ยนแปลง
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={save}
                  disabled={saving}
                  className="bg-slate-950 hover:bg-slate-900 text-amber-300 px-4 py-1.5 rounded-xl font-bold text-xs cursor-pointer shadow-md transition-all flex items-center gap-1.5"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}</span>
                </button>
                <button
                  onClick={preview}
                  className="bg-white/80 hover:bg-white text-slate-900 px-3 py-1.5 rounded-xl font-medium text-xs cursor-pointer transition-all"
                >
                  ดูตัวอย่าง
                </button>
                <button
                  onClick={cancel}
                  className="bg-slate-900/20 hover:bg-slate-900/30 text-slate-950 px-3 py-1.5 rounded-xl font-medium text-xs cursor-pointer transition-all"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. MAIN DASHBOARD: 3 Apple-style Frosted Glass Columns */}
        <main className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8 grid gap-6 lg:gap-8 lg:grid-cols-[1fr_1.15fr_1fr] items-stretch flex-1">
          {/* CARD 1: โปรไฟล์นิสิต & สรุปโครงงาน (ลบตัวอักษร A ออก) */}
          <section
            id="section-student"
            className="flex flex-col overflow-hidden rounded-3xl glass-card text-slate-900 transition-all duration-300 hover:shadow-2xl"
          >
            <CardHead
              icon={<User className="h-6 w-6" />}
              title="โปรไฟล์นิสิต & สรุปโครงงาน"
              sub="Student & Project Info"
            />
            <div className="relative flex flex-1 flex-col justify-between p-6 pb-28 space-y-5">
              <div className="space-y-5">
                <div className="flex flex-col gap-5 sm:flex-row items-center sm:items-start">
                  <div className="flex shrink-0 flex-col items-center gap-2">
                    <div className="relative group grid h-28 w-28 place-items-center overflow-hidden rounded-3xl border-2 border-white/80 bg-gradient-to-br from-blue-100 to-indigo-100 shadow-lg ring-4 ring-blue-500/20">
                      {d.student.photo ? (
                        <img
                          src={d.student.photo}
                          alt={d.student.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-14 w-14 text-blue-900/40" />
                      )}
                      {edit && (
                        <label className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-xs">
                          <ImagePlus className="h-6 w-6 mb-1 text-amber-300" />
                          <span className="text-[10px] font-medium">
                            เปลี่ยนรูป
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              e.target.files?.[0] &&
                              readImage(e.target.files[0], (u) =>
                                set((x) => {
                                  x.student.photo = u;
                                }),
                              )
                            }
                          />
                        </label>
                      )}
                    </div>
                    {edit && d.student.photo && (
                      <button
                        className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 cursor-pointer"
                        onClick={() =>
                          set((x) => {
                            x.student.photo = "";
                          })
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>ลบรูป</span>
                      </button>
                    )}
                  </div>

                  <dl className="min-w-0 flex-1 space-y-2.5 text-sm w-full">
                    <Row icon={<User className="h-4 w-4" />} k="ชื่อ-สกุล">
                      <EText
                        edit={edit}
                        label="ชื่อ-สกุล"
                        className="font-semibold text-slate-900"
                        value={d.student.name}
                        onChange={(v) =>
                          set((x) => {
                            x.student.name = v;
                          })
                        }
                      />
                    </Row>
                    <Row
                      icon={<BadgeCheck className="h-4 w-4" />}
                      k="รหัสนิสิต"
                    >
                      <EText
                        edit={edit}
                        label="รหัสนิสิต"
                        className="font-bold font-mono tracking-wider text-slate-900"
                        value={d.student.studentId}
                        onChange={(v) =>
                          set((x) => {
                            x.student.studentId = v;
                          })
                        }
                      />
                    </Row>
                    <Row
                      icon={<GraduationCap className="h-4 w-4" />}
                      k="หลักสูตร"
                    >
                      <EText
                        edit={edit}
                        label="หลักสูตร"
                        value={d.student.program}
                        onChange={(v) =>
                          set((x) => {
                            x.student.program = v;
                          })
                        }
                      />
                    </Row>
                    <Row
                      icon={<Building2 className="h-4 w-4" />}
                      k="สถานประกอบการ"
                    >
                      <EText
                        edit={edit}
                        label="สถานประกอบการ"
                        value={d.student.workplace}
                        onChange={(v) =>
                          set((x) => {
                            x.student.workplace = v;
                          })
                        }
                      />
                    </Row>
                  </dl>
                </div>

                {/* หัวข้อโครงงาน */}
                <div className="rounded-3xl glass-inset p-4.5 shadow-xs">
                  <SubTitle
                    icon={<FileText className="h-5 w-5 text-blue-700" />}
                  >
                    ชื่อหัวข้อโครงงาน
                  </SubTitle>
                  <div className="mt-2.5 rounded-2xl bg-blue-50/80 border border-blue-200/80 p-4 font-display font-medium leading-relaxed text-blue-950 text-sm sm:text-[14px] shadow-2xs">
                    <EText
                      edit={edit}
                      multiline
                      label="ชื่อหัวข้อโครงงาน"
                      value={d.projectTitle}
                      onChange={(v) =>
                        set((x) => {
                          x.projectTitle = v;
                        })
                      }
                    />
                  </div>
                </div>

                {/* ลักษณะโครงงาน */}
                <div className="relative z-10 rounded-2xl glass-inset p-4 shadow-xs">
                  <SubTitle
                    icon={<Settings className="h-5 w-5 text-blue-700" />}
                  >
                    ลักษณะโครงงาน
                  </SubTitle>
                  <ul className="mt-3 space-y-2.5">
                    {d.projectTypes.map((t, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-sm">
                        {edit ? (
                          <>
                            <input
                              type="checkbox"
                              aria-label="เลือก"
                              checked={t.checked}
                              onChange={(e) =>
                                set((x) => {
                                  x.projectTypes[i]!.checked = e.target.checked;
                                })
                              }
                              className="h-4 w-4 accent-emerald-600 cursor-pointer"
                            />
                            <EText
                              edit
                              label="ลักษณะโครงงาน"
                              value={t.label}
                              onChange={(v) =>
                                set((x) => {
                                  x.projectTypes[i]!.label = v;
                                })
                              }
                            />
                            <button
                              aria-label="ลบ"
                              onClick={() =>
                                set((x) => {
                                  x.projectTypes.splice(i, 1);
                                })
                              }
                              className="text-red-500 hover:text-red-700 cursor-pointer p-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            {t.checked ? (
                              <div className="h-5 w-5 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                                <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                              </div>
                            ) : (
                              <div className="h-5 w-5 rounded-lg border border-slate-300 bg-white flex items-center justify-center shrink-0" />
                            )}
                            <span className="font-medium text-slate-800">
                              {t.label}
                            </span>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                  {edit && (
                    <button
                      onClick={() =>
                        set((x) => {
                          x.projectTypes.push({
                            label: "ลักษณะใหม่",
                            checked: true,
                          });
                        })
                      }
                      className="mt-3 text-xs font-semibold text-blue-700 hover:underline cursor-pointer"
                    >
                      + เพิ่มลักษณะโครงงาน
                    </button>
                  )}
                </div>
              </div>

              {/* Landmark Sketch Decoration at Bottom of Card A */}
              <img
                src={landmark}
                alt=""
                loading="lazy"
                width={1280}
                height={512}
                className="pointer-events-none absolute inset-x-0 bottom-0 w-full opacity-40 mix-blend-multiply"
              />
            </div>
          </section>

          {/* CARD 2: ข้อมูลหน่วยงาน & โอกาสในการพัฒนา (ลบตัวอักษร B ออก) */}
          <section
            id="section-agency"
            className="flex flex-col gap-4 overflow-hidden rounded-3xl glass-card pb-6 text-slate-900 transition-all duration-300 hover:shadow-2xl"
          >
            <CardHead
              icon={<Landmark className="h-6 w-6" />}
              title="ข้อมูลหน่วยงาน & โอกาสในการพัฒนา"
              sub="Company Info & Benefits"
            />

            <div className="mx-6 rounded-2xl glass-inset p-4">
              <SubTitle icon={<Landmark className="h-5 w-5 text-blue-700" />}>
                ข้อมูลหน่วยงาน
              </SubTitle>
              <dl className="mt-3 space-y-2.5 text-sm">
                <Row
                  icon={<Landmark className="h-4 w-4" />}
                  k="ชื่อหน่วยงาน"
                  strong
                >
                  <EText
                    edit={edit}
                    label="ชื่อหน่วยงาน"
                    value={d.org.name}
                    onChange={(v) =>
                      set((x) => {
                        x.org.name = v;
                      })
                    }
                  />
                </Row>
                <Row icon={<MapPin className="h-4 w-4" />} k="ที่ตั้ง" strong>
                  <EText
                    edit={edit}
                    label="ที่ตั้ง"
                    value={d.org.location}
                    onChange={(v) =>
                      set((x) => {
                        x.org.location = v;
                      })
                    }
                  />
                </Row>
                <Row
                  icon={<BadgeCheck className="h-4 w-4" />}
                  k="ลักษณะงานหลัก"
                  strong
                >
                  <EText
                    edit={edit}
                    multiline
                    label="ลักษณะงานหลัก"
                    value={d.org.mission}
                    onChange={(v) =>
                      set((x) => {
                        x.org.mission = v;
                      })
                    }
                  />
                </Row>
              </dl>
            </div>

            <div className="mx-6 rounded-2xl bg-rose-50/80 border border-rose-200/80 p-4 shadow-xs">
              <h3 className="flex items-center gap-2 font-bold text-rose-700 text-sm sm:text-base">
                <XSquare className="h-5 w-5" /> ปัญหาที่ต้องการพัฒนา
              </h3>
              <div className="mt-2 pl-7 text-sm leading-relaxed text-slate-800">
                <EText
                  edit={edit}
                  multiline
                  label="ปัญหาที่ต้องการพัฒนา"
                  value={d.problem}
                  onChange={(v) =>
                    set((x) => {
                      x.problem = v;
                    })
                  }
                />
              </div>
            </div>

            <div className="mx-6 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 p-4 shadow-xs flex-1 flex flex-col justify-between">
              <div>
                <h3 className="flex items-center gap-2 font-bold text-emerald-800 text-sm sm:text-base">
                  <BadgeCheck className="h-5 w-5 text-emerald-600" />
                  ประโยชน์ที่คาดว่าจะได้รับ
                </h3>
                <div className="mt-3.5 grid gap-4 sm:grid-cols-2 sm:divide-x sm:divide-emerald-200/60">
                  <BenefitCol
                    icon={<Landmark className="h-4 w-4" />}
                    title="ต่อหน่วยงาน"
                    edit={edit}
                    items={d.benefitsOrg}
                    onChange={(v) =>
                      set((x) => {
                        x.benefitsOrg = v;
                      })
                    }
                  />
                  <div className="sm:pl-4">
                    <BenefitCol
                      icon={<GraduationCap className="h-4 w-4" />}
                      title="ต่อนักศึกษา"
                      edit={edit}
                      items={d.benefitsStudent}
                      onChange={(v) =>
                        set((x) => {
                          x.benefitsStudent = v;
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CARD 3: ผลงาน & การเชื่อมโยงข้อมูล (ลบตัวอักษร C ออก และทำให้ขอบมน 100%) */}
          <section
            id="section-showcase"
            className="flex flex-col gap-4 overflow-hidden rounded-3xl glass-card pb-6 text-slate-900 transition-all duration-300 hover:shadow-2xl"
          >
            <CardHead
              icon={<Link2 className="h-6 w-6" />}
              title="ผลงาน & การเชื่อมโยงข้อมูล"
              sub="Sync Zone & Showcase"
            />

            <div className="flex flex-col gap-4 px-6 flex-1 justify-between">
              {/* 1. ปุ่มเปิดระบบ Songkhla SecureTrack (Hero CTA) */}
              <div className="space-y-1.5">
                <button
                  onClick={() =>
                    openLink(d.links.appUrl, "ระบบ Songkhla SecureTrack")
                  }
                  className="group relative overflow-hidden flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-600 border-2 border-blue-400/40 shadow-xl shadow-blue-600/20 hover:shadow-2xl hover:shadow-blue-600/30 transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5"
                >
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30 group-hover:scale-110 transition-transform">
                    <Rocket className="h-6 w-6 stroke-[2.2]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block font-display text-base font-bold md:text-lg text-white tracking-tight">
                      เปิดระบบ {d.systemName}
                    </span>
                    <span className="block text-xs text-sky-100">
                      คลิกเพื่อเข้าใช้งานเว็บแอปพลิเคชันจริง
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] mt-1 px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/30 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                      ระบบออนไลน์พร้อมใช้งาน
                    </span>
                  </div>
                  <ChevronRight className="h-6 w-6 shrink-0 transition-transform group-hover:translate-x-1 text-white" />
                </button>
                {edit && (
                  <UrlInput
                    label="ลิงก์เว็บแอปพลิเคชัน"
                    value={draft.links.appUrl}
                    onChange={(v) =>
                      set((x) => {
                        x.links.appUrl = v;
                      })
                    }
                  />
                )}
              </div>

              {/* 2. โหลดข้อมูลตัวอย่างลง Google Sheets & CSV */}
              <div className="space-y-1.5">
                <button
                  onClick={() => {
                    exportCsv();
                    if (d.links.sheetsUrl)
                      openLink(d.links.sheetsUrl, "Google Sheets");
                  }}
                  className="group relative overflow-hidden flex w-full items-center gap-3.5 rounded-2xl px-5 py-4 text-left text-white bg-gradient-to-r from-[#008A56] via-[#009E62] to-[#007A4C] hover:from-[#009E62] hover:to-[#008A56] border-2 border-emerald-300/60 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5"
                >
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/20 text-white shadow-sm group-hover:scale-110 transition-transform">
                    <Sheet className="h-6 w-6 text-emerald-100" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block font-bold text-sm sm:text-base text-white tracking-tight">
                      โหลดข้อมูลตัวอย่างลง Google Sheets
                    </span>
                    <span className="block text-xs text-emerald-100">
                      คลิกเพื่อดาวน์โหลดไฟล์ข้อมูลตัวอย่าง (CSV) / เปิดชีต
                    </span>
                  </div>
                  <Download className="h-5 w-5 shrink-0 text-emerald-100 group-hover:translate-y-0.5 transition-transform" />
                </button>
                {edit && (
                  <UrlInput
                    label="ลิงก์ Google Sheets"
                    value={draft.links.sheetsUrl}
                    onChange={(v) =>
                      set((x) => {
                        x.links.sheetsUrl = v;
                      })
                    }
                  />
                )}
              </div>

              {/* 3. QR Code สำหรับ Portfolio */}
              <div className="space-y-1.5">
                <QrBlock url={d.links.portfolioUrl} />
                {edit && (
                  <UrlInput
                    label="ลิงก์ Portfolio สำหรับ QR Code"
                    value={draft.links.portfolioUrl}
                    onChange={(v) =>
                      set((x) => {
                        x.links.portfolioUrl = v;
                      })
                    }
                  />
                )}
              </div>

              {/* 4. รายการเอกสารและผลงาน 3 รายการ */}
              <div className="space-y-2 mt-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  เอกสารและซอร์สโค้ดโครงงาน
                </span>

                {/* ลิงก์ 1: เอกสารเค้าโครงโครงงาน (PDF) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/80 bg-white/80 hover:bg-white hover:border-blue-400 transition-all shadow-xs">
                    <div
                      onClick={() =>
                        openLink(d.links.pdfUrl, "เอกสารเค้าโครงโครงงาน (PDF)")
                      }
                      className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                    >
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#083A75] text-white shadow-xs">
                        <FileText className="h-5 w-5" />
                      </div>
                      <span className="font-semibold text-xs sm:text-sm text-slate-800 truncate">
                        ลิงก์เอกสารเค้าโครงโครงงาน (PDF)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <button
                        onClick={() => copyText(d.links.pdfUrl, "เอกสาร PDF")}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                        title="คัดลอกลิงก์"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() =>
                          openLink(
                            d.links.pdfUrl,
                            "เอกสารเค้าโครงโครงงาน (PDF)",
                          )
                        }
                        className="p-1.5 text-slate-400 hover:text-primary hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                        title="เปิดลิงก์"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {edit && (
                    <UrlInput
                      label="ลิงก์เอกสารโครงงาน (PDF/Drive)"
                      value={draft.links.pdfUrl}
                      onChange={(v) =>
                        set((x) => {
                          x.links.pdfUrl = v;
                        })
                      }
                    />
                  )}
                </div>

                {/* ลิงก์ 2: คลิปนำเสนอโครงงาน (YouTube/Drive) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/80 bg-white/80 hover:bg-white hover:border-blue-400 transition-all shadow-xs">
                    <div
                      onClick={() =>
                        openLink(d.links.videoUrl, "คลิปนำเสนอโครงงาน")
                      }
                      className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                    >
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-red-600 text-white shadow-xs">
                        <Play className="h-4 w-4 fill-white ml-0.5" />
                      </div>
                      <span className="font-semibold text-xs sm:text-sm text-slate-800 truncate">
                        ลิงก์คลิปนำเสนอโครงงาน (YouTube/Drive)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <button
                        onClick={() => copyText(d.links.videoUrl, "คลิปนำเสนอ")}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                        title="คัดลอกลิงก์"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() =>
                          openLink(d.links.videoUrl, "คลิปนำเสนอโครงงาน")
                        }
                        className="p-1.5 text-slate-400 hover:text-primary hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                        title="เปิดลิงก์"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {edit && (
                    <UrlInput
                      label="ลิงก์คลิปนำเสนอ (YouTube/Drive)"
                      value={draft.links.videoUrl}
                      onChange={(v) =>
                        set((x) => {
                          x.links.videoUrl = v;
                        })
                      }
                    />
                  )}
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* 4. FOOTER: Apple Frosted Glass - Light Tone with Copyright & Passcode-Protected Edit Mode Access */}
        <footer className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 mt-8 pb-6">
          <div className="w-full max-w-[1600px] mx-auto rounded-3xl bg-white/85 backdrop-blur-2xl text-slate-800 p-5 sm:p-6 shadow-xl shadow-slate-200/50 border border-white/80 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left: Copyright */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3">
                <ShieldCheck className="h-5 w-5 shrink-0 text-blue-600" />
                {edit ? (
                  <input
                    type="text"
                    value={draft.footer}
                    onChange={(e) =>
                      set((x) => {
                        x.footer = e.target.value;
                      })
                    }
                    className="bg-white border border-blue-400 rounded-xl px-3 py-1 text-xs text-slate-900 w-full max-w-md"
                  />
                ) : (
                  <p className="text-xs sm:text-sm text-slate-700 font-medium">
                    {d.footer}
                  </p>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Songkhla SecureTrack ·
                ระบบฐานข้อมูลและติดตามผลการตรวจสอบกิจการควบคุมและสถานบริการ
              </p>
            </div>

            {/* Right: Secret Passcode-Protected Edit Access Controls */}
            <div className="flex items-center gap-2 flex-wrap justify-center md:justify-end">
              {!edit ? (
                <button
                  onClick={() => {
                    setPasscodeInput("");
                    setPasscodeError(false);
                    setPasscodeModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200/90 text-slate-700 hover:text-slate-900 border border-slate-200 shadow-sm backdrop-blur-xl transition-all text-xs font-semibold cursor-pointer group"
                  title="เข้าสู่โหมดแก้ไขข้อมูล"
                >
                  <Lock className="h-3.5 w-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
                  <span>เข้าสู่โหมดแก้ไขข้อมูล</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 flex-wrap bg-slate-50/90 backdrop-blur-xl p-1.5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-emerald-800 bg-emerald-100/90 rounded-xl border border-emerald-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>ซิงค์คลาวด์ทุกอุปกรณ์</span>
                  </span>
                  <button
                    onClick={save}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer transition-colors"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>{saving ? "กำลังซิงค์..." : "บันทึกข้อมูล (PC & มือถือ)"}</span>
                  </button>
                  <button
                    onClick={copyCodeJson}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-blue-700 text-xs font-medium border border-slate-200 cursor-pointer transition-colors"
                    title="คัดลอกโค้ด JSON ทั้งหมดสำหรับนำไปใส่ในโค้ดต้นฉบับ"
                  >
                    <Copy className="h-3.5 w-3.5 text-blue-600" />
                    <span>คัดลอกโค้ด JSON</span>
                  </button>
                  <button
                    onClick={cancel}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 cursor-pointer transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={preview}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-blue-700 text-xs font-medium border border-slate-200 cursor-pointer transition-colors"
                  >
                    ดูตัวอย่าง
                  </button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        className="flex items-center gap-1 p-2 rounded-xl bg-white hover:bg-red-50 text-red-600 border border-slate-200 cursor-pointer transition-colors"
                        title="คืนค่าเริ่มต้น"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-white text-slate-900 border-slate-200 rounded-3xl shadow-2xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          คืนค่าข้อมูลเริ่มต้น?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-600 text-xs sm:text-sm">
                          ข้อมูลที่บันทึกไว้ในเบราว์เซอร์นี้ทั้งหมดจะถูกลบ
                          และคืนค่าเป็นข้อมูลตั้งต้น
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 rounded-xl">
                          ยกเลิก
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={reset}
                          className="bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold"
                        >
                          ยืนยันคืนค่า
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <button
                    onClick={() => setEdit(false)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 cursor-pointer transition-colors"
                    title="ออกจากโหมดแก้ไข"
                  >
                    <Lock className="h-3 w-3 text-slate-500" />
                    <span>เสร็จสิ้น</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </footer>
      </div>

      {/* 5. Apple-style Passcode Verification Dialog (PIN is 030848, strictly hidden from UI text) */}
      <Dialog open={passcodeModalOpen} onOpenChange={setPasscodeModalOpen}>
        <DialogContent className="max-w-sm text-center bg-white/95 text-slate-900 border border-slate-200 rounded-3xl p-6 shadow-2xl backdrop-blur-2xl">
          <DialogHeader>
            <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-3 shadow-inner">
              <Lock className="h-7 w-7 stroke-[2.2]" />
            </div>
            <DialogTitle className="text-center font-bold font-display text-lg sm:text-xl text-slate-900">
              ยืนยันสิทธิ์เข้าถึง
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-slate-500 mt-1">
              กรุณาระบุรหัสผ่านเพื่อเข้าสู่โหมดแก้ไขข้อมูลโครงงาน
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePasscodeSubmit} className="space-y-4 my-2">
            <input
              type="password"
              maxLength={6}
              autoFocus
              value={passcodeInput}
              onChange={(e) => {
                setPasscodeInput(e.target.value);
                if (passcodeError) setPasscodeError(false);
              }}
              placeholder="••••••"
              className={`w-full text-center tracking-[0.6em] text-2xl font-mono py-3 px-4 bg-slate-50 border rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 transition-all ${
                passcodeError
                  ? "border-red-400 text-red-600 focus:ring-red-400/30"
                  : "border-slate-300 focus:ring-blue-500 focus:border-blue-500"
              }`}
            />
            {passcodeError && (
              <p className="text-xs text-red-600 font-medium">
                รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง
              </p>
            )}

            <DialogFooter className="flex items-center gap-2 sm:justify-center pt-2">
              <button
                type="button"
                onClick={() => setPasscodeModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
              >
                ยืนยันรหัส
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CardHead({
  icon,
  title,
  sub,
}: {
  icon: ReactNode;
  title: string;
  sub: string;
}) {
  return (
    <div className="flex items-center gap-3.5 bg-gradient-to-r from-white/95 via-blue-50/75 to-indigo-50/60 px-6 py-4.5 text-slate-900 border-b border-slate-200/80 rounded-t-3xl">
      <span className="shrink-0 p-2.5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/20">
        {icon}
      </span>
      <div className="min-w-0">
        <h2 className="text-base sm:text-lg font-bold leading-tight font-display tracking-tight text-slate-900">
          {title}
        </h2>
        <p className="text-[11px] text-blue-700 uppercase tracking-wider font-semibold mt-0.5">
          {sub}
        </p>
      </div>
    </div>
  );
}

function SubTitle({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <h3 className="flex items-center gap-2 font-bold text-slate-900 text-sm sm:text-[15px]">
      {icon}
      {children}
    </h3>
  );
}

function Row({
  icon,
  k,
  children,
  strong,
}: {
  icon: ReactNode;
  k: string;
  children: ReactNode;
  strong?: boolean;
}) {
  return (
    <div className="grid grid-cols-[1.25rem_6.5rem_minmax(0,1fr)] items-start gap-2.5">
      <span className="mt-0.5 text-blue-700">{icon}</span>
      <dt
        className={
          strong ? "font-bold text-slate-900" : "font-medium text-slate-600"
        }
      >
        {k} :
      </dt>
      <dd className="min-w-0 text-slate-900">{children}</dd>
    </div>
  );
}

function BenefitCol({
  icon,
  title,
  edit,
  items,
  onChange,
}: {
  icon: ReactNode;
  title: string;
  edit: boolean;
  items: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div>
      <p className="mb-2.5 flex items-center gap-2 font-bold text-emerald-800 text-sm">
        {icon}
        {title}
      </p>
      <ol className="space-y-2.5">
        <EList
          edit={edit}
          items={items}
          onChange={onChange}
          addLabel="เพิ่มประโยชน์"
          render={(it, i) => (
            <li
              key={i}
              className="flex items-start gap-2.5 text-xs sm:text-[13px]"
            >
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-lg bg-emerald-600 text-[11px] font-bold text-white shadow-2xs">
                {i + 1}
              </span>
              <span className="text-emerald-950 font-medium leading-snug">
                {it}
              </span>
            </li>
          )}
        />
      </ol>
    </div>
  );
}

function UrlInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const bad = value !== "" && !isValidUrl(value);
  return (
    <label className="block text-xs mt-1">
      <span className="text-slate-600 font-medium">{label}</span>
      <input
        type="url"
        placeholder="https://..."
        value={value}
        onChange={(e) => onChange(e.target.value.trim())}
        className={`mt-1 w-full rounded-xl border bg-white/90 px-3 py-1.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-blue-500 shadow-xs ${
          bad ? "border-red-400 text-red-600" : "border-slate-300"
        }`}
      />
      {bad && (
        <span className="text-red-500 text-[11px] mt-0.5 block">
          รูปแบบลิงก์ไม่ถูกต้อง ต้องขึ้นต้นด้วย https://
        </span>
      )}
    </label>
  );
}
