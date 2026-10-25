// Data layer for the dashboard. Currently backed by localStorage (per-browser only).
// Swap `loadDashboard` / `saveDashboard` for a database service later without touching the UI.

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
};

export const DEFAULT_DATA: DashboardData = {
  orgName: "Ekpravee Official Portfolio",
  orgSub: "พอร์ตโฟลิโออย่างเป็นทางการของเอกประวีร์",
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
    photo: "/assets/profile.png",
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
    githubUrl: "https://github.com/Ekkaprawee-sk/Songkhla-SecureTrack",
  },
  footer:
    "ระบบฐานข้อมูลและติดตามผลการตรวจสอบกิจการควบคุมและสถานบริการ จังหวัดสงขลา | ที่ทำการปกครองจังหวัดสงขลา (กลุ่มงานความมั่นคง) ร่วมกับ วิทยาลัยการจัดการเพื่อการพัฒนา มหาวิทยาลัยทักษิณ",
};

const KEY = "songkhla-securetrack:v2";

export function loadDashboard(): DashboardData {
  let raw = window.localStorage.getItem(KEY);
  if (!raw) {
    // Check if there was an earlier v1 key
    const oldRaw = window.localStorage.getItem("songkhla-securetrack:v1");
    if (!oldRaw) return structuredClone(DEFAULT_DATA);
    raw = oldRaw;
  }
  const parsed = JSON.parse(raw) as Partial<DashboardData>;
  const merged: DashboardData = {
    ...structuredClone(DEFAULT_DATA),
    ...parsed,
    student: {
      ...DEFAULT_DATA.student,
      ...(parsed.student || {}),
      photo: parsed.student?.photo || DEFAULT_DATA.student.photo,
    },
    orgName:
      !parsed.orgName || parsed.orgName === "ที่ทำการปกครองจังหวัดสงขลา"
        ? DEFAULT_DATA.orgName
        : parsed.orgName,
    orgSub:
      !parsed.orgSub || parsed.orgSub === "กลุ่มงานความมั่นคง"
        ? DEFAULT_DATA.orgSub
        : parsed.orgSub,
    links: { ...DEFAULT_DATA.links, ...parsed.links },
  };
  return merged;
}

export async function saveDashboard(data: DashboardData): Promise<void> {
  window.localStorage.setItem(KEY, JSON.stringify(data));
}

export function clearDashboard() {
  window.localStorage.removeItem(KEY);
}

export function isValidUrl(url: string) {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
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
