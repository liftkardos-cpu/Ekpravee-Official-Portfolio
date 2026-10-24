import { doc, onSnapshot, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export type DashboardData = {
  orgName: string;
  orgSub: string;
  systemName: string;
  systemDesc: string;
  userName: string;
  userSub: string;
  logo: string;
  student: {
    name: string;
    studentId: string;
    program: string;
    workplace: string;
    photo: string;
  };
  projectTitle: string;
  projectTypes: { label: string; checked: boolean }[];
  org: { name: string; location: string; mission: string };
  problem: string;
  benefitsOrg: string[];
  benefitsStudent: string[];
  links: {
    appUrl: string;
    sheetsUrl: string;
    portfolioUrl: string;
    pdfUrl: string;
    videoUrl: string;
    githubUrl: string;
  };
  footer: string;
  updatedAt?: string;
};

export const DEFAULT_DATA: DashboardData = {
  orgName: "ที่ทำการปกครองจังหวัดสงขลา",
  orgSub: "กลุ่มงานความมั่นคง",
  systemName: "Songkhla SecureTrack",
  systemDesc: "ระบบฐานข้อมูลและติดตามผลการตรวจสอบกิจการควบคุมและสถานบริการ",
  userName: "นายเอกประวีร์ แสงคง",
  userSub: "วิทยาลัยการจัดการเพื่อการพัฒนา",
  logo: "",
  student: {
    name: "นายเอกประวีร์ แสงคง",
    studentId: "6711010186",
    program: "บริหารงานตำรวจและกระบวนการยุติธรรม",
    workplace: "ที่ทำการปกครองจังหวัดสงขลา (กลุ่มงานความมั่นคง)",
    photo: "",
  },
  projectTitle:
    "การพัฒนาระบบฐานข้อมูลดิจิทัลและปรับปรุงกระบวนการติดตามผลการตรวจสอบกิจการควบคุมและสถานบริการ ของกลุ่มงานความมั่นคง ที่ทำการปกครองจังหวัดสงขลา",
  projectTypes: [
    { label: "การปรับปรุงกระบวนการทำงาน", checked: true },
    { label: "การพัฒนาซอฟต์แวร์/ระบบ", checked: true },
  ],
  org: {
    name: "ที่ทำการปกครองจังหวัดสงขลา (กลุ่มงานความมั่นคง)",
    location: "อำเภอเมืองสงขลา จังหวัดสงขลา",
    mission: "รักษาความสงบเรียบร้อย จัดระเบียบสังคม และควบคุมกิจการ",
  },
  problem:
    "ระบบฐานข้อมูลและติดตามผลการตรวจสอบยังคงพึ่งพาเอกสารกระดาษและไฟล์ Excel แยกส่วน ทำให้การสืบค้นข้อมูลล่าช้า และขาดการติดตามผลอย่างต่อเนื่อง",
  benefitsOrg: [
    "ลดระยะเวลาในการสืบค้นข้อมูล",
    "เพิ่มประสิทธิภาพในการติดตามผลการตรวจสอบ",
    "ลดการใช้เอกสารและค่าใช้จ่ายที่ไม่จำเป็น",
  ],
  benefitsStudent: [
    "ได้รับประสบการณ์จริงจากการปฏิบัติงาน",
    "พัฒนาทักษะด้านเทคโนโลยีและการทำงานเป็นทีม",
    "สามารถนำความรู้ไปต่อยอดในการประกอบอาชีพได้",
  ],
  links: {
    appUrl: "https://songkhla-securetrack.dopa.go.th",
    sheetsUrl: "https://docs.google.com/spreadsheets/d/1SongkhlaSecureTrack",
    portfolioUrl: "https://portfolio.ekpraveer.dev/songkhla-securetrack",
    pdfUrl: "https://drive.google.com/file/d/sample-proposal.pdf",
    videoUrl: "https://www.youtube.com/watch?v=sample-songkhla-presentation",
    githubUrl: "",
  },
  footer:
    "ระบบฐานข้อมูลและติดตามผลการตรวจสอบกิจการควบคุมและสถานบริการ จังหวัดสงขลา | ที่ทำการปกครองจังหวัดสงขลา (กลุ่มงานความมั่นคง) ร่วมกับ วิทยาลัยการจัดการเพื่อการพัฒนา มหาวิทยาลัยทักษิณ",
};

const KEY = "songkhla-securetrack:v2";
const SETTINGS_DOC = "global";

export function normalizeUrl(url: string): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export function isValidUrl(url: string): boolean {
  if (!url) return false;
  try {
    const normalized = normalizeUrl(url);
    const u = new URL(normalized);
    return (u.protocol === "http:" || u.protocol === "https:") && u.hostname.includes(".");
  } catch {
    return false;
  }
}

export function loadDashboard(): DashboardData {
  if (typeof window === "undefined") return structuredClone(DEFAULT_DATA);
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return structuredClone(DEFAULT_DATA);
    const parsed = JSON.parse(raw) as Partial<DashboardData>;
    return {
      ...structuredClone(DEFAULT_DATA),
      ...parsed,
      student: { ...DEFAULT_DATA.student, ...(parsed.student || {}) },
      org: { ...DEFAULT_DATA.org, ...(parsed.org || {}) },
      links: { ...DEFAULT_DATA.links, ...(parsed.links || {}) },
    };
  } catch {
    return structuredClone(DEFAULT_DATA);
  }
}

export async function fetchDashboardFromCloud(): Promise<DashboardData | null> {
  try {
    const docRef = doc(db, "system_settings", SETTINGS_DOC);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const remote = snap.data() as Partial<DashboardData>;
      const merged: DashboardData = {
        ...structuredClone(DEFAULT_DATA),
        ...remote,
        student: { ...DEFAULT_DATA.student, ...(remote.student || {}) },
        org: { ...DEFAULT_DATA.org, ...(remote.org || {}) },
        links: { ...DEFAULT_DATA.links, ...(remote.links || {}) },
      };
      if (typeof window !== "undefined") {
        window.localStorage.setItem(KEY, JSON.stringify(merged));
      }
      return merged;
    }
  } catch (err) {
    console.warn("Could not fetch dashboard from Cloud Firestore:", err);
  }
  return null;
}

export function subscribeDashboard(onUpdate: (data: DashboardData) => void): () => void {
  try {
    const docRef = doc(db, "system_settings", SETTINGS_DOC);
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const remote = snapshot.data() as Partial<DashboardData>;
          const merged: DashboardData = {
            ...structuredClone(DEFAULT_DATA),
            ...remote,
            student: { ...DEFAULT_DATA.student, ...(remote.student || {}) },
            org: { ...DEFAULT_DATA.org, ...(remote.org || {}) },
            links: { ...DEFAULT_DATA.links, ...(remote.links || {}) },
          };
          if (typeof window !== "undefined") {
            window.localStorage.setItem(KEY, JSON.stringify(merged));
          }
          onUpdate(merged);
        }
      },
      (error) => {
        console.warn("Firestore real-time subscription error:", error);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn("Failed to subscribe to Firestore:", err);
    return () => {};
  }
}

export async function saveDashboard(data: DashboardData): Promise<void> {
  const normalizedData: DashboardData = {
    ...data,
    links: {
      appUrl: normalizeUrl(data.links.appUrl),
      sheetsUrl: normalizeUrl(data.links.sheetsUrl),
      portfolioUrl: normalizeUrl(data.links.portfolioUrl),
      pdfUrl: normalizeUrl(data.links.pdfUrl),
      videoUrl: normalizeUrl(data.links.videoUrl),
      githubUrl: normalizeUrl(data.links.githubUrl),
    },
    updatedAt: new Date().toISOString(),
  };

  // 1. Save to local storage for immediate persistence
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(normalizedData));
  }

  // 2. Persist to Cloud Firestore for cross-device real-time sync (Mobile <-> PC)
  const docRef = doc(db, "system_settings", SETTINGS_DOC);
  await setDoc(docRef, normalizedData, { merge: true });
}

export function clearDashboard() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(KEY);
  }
}

export function toCsv(d: DashboardData): string {
  const rows: string[][] = [
    ["หมวด", "หัวข้อ", "ค่า"],
    ["นิสิต", "ชื่อ-สกุล", d.student.name],
    ["นิสิต", "รหัสนิสิต", d.student.studentId],
    ["นิสิต", "หลักสูตร", d.student.program],
    ["นิสิต", "สถานประกอบการ", d.student.workplace],
    ["โครงงาน", "ชื่อหัวข้อ", d.projectTitle],
    ...d.projectTypes
      .filter((t) => t.checked)
      .map((t) => ["โครงงาน", "ลักษณะ", t.label]),
    ["หน่วยงาน", "ชื่อหน่วยงาน", d.org.name],
    ["หน่วยงาน", "ที่ตั้ง", d.org.location],
    ["หน่วยงาน", "ลักษณะงานหลัก", d.org.mission],
    ["ปัญหา", "ปัญหาที่ต้องการพัฒนา", d.problem],
    ...d.benefitsOrg.map((b, i) => ["ประโยชน์ต่อหน่วยงาน", String(i + 1), b]),
    ...d.benefitsStudent.map((b, i) => [
      "ประโยชน์ต่อนักศึกษา",
      String(i + 1),
      b,
    ]),
  ];
  return (
    "\uFEFF" +
    rows
      .map((r) => r.map((c) => `"${c.replaceAll('"', '""')}"`).join(","))
      .join("\n")
  );
}
