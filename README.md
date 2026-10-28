# Songkhla SecureTrack (ระบบฐานข้อมูลและติดตามผลการตรวจสอบกิจการควบคุมและสถานบริการ)

ระบบฐานข้อมูลและติดตามผลการตรวจสอบกิจการควบคุมและสถานบริการ จังหวัดสงขลา
- **หน่วยงาน:** ที่ทำการปกครองจังหวัดสงขลา (กลุ่มงานความมั่นคง)
- **ผู้พัฒนา:** นายเอกประวีร์ แสงคง (รหัสนิสิต: 6711010186)
- **หลักสูตร:** รัฐประศาสนศาสตรมหาบัณฑิต สาขาวิชาการบริหารงานตำรวจและกระบวนการยุติธรรม
- **คณะ:** วิทยาลัยการจัดการเพื่อการพัฒนา มหาวิทยาลัยทักษิณ

---

## 🚀 การรันระบบในเครื่อง (Local Development)

### ข้อกำหนดเบื้องต้น
- [Node.js](https://nodejs.org/) (เวอร์ชัน 20 หรือสูงกว่า)
- npm หรือ bun

### ขั้นตอนการรัน
1. ติดตั้ง Dependencies:
   ```bash
   npm install
   ```

2. เริ่มต้นรัน Dev Server:
   ```bash
   npm run dev
   ```
   เปิดเบราว์เซอร์ไปที่: `http://localhost:3000`

3. ทดสอบการ Build:
   ```bash
   npm run build
   ```

---

## 📦 การนำขึ้น GitHub (Push to GitHub)

1. สร้าง Repository ใหม่บน [GitHub](https://github.com/new)
2. รันคำสั่งในเทอร์มินัลของโฟลเดอร์โครงงาน:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit Songkhla SecureTrack"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
   git push -u origin main
   ```

---

## 🌐 การ Deploy บน Vercel

ระบบได้รับการกำหนดค่ารองรับการ Deploy บน Vercel โดยอัตโนมัติ:

### วิธีที่ 1: Deploy ผ่าน Vercel Dashboard (แนะนำ)
1. เข้าสู่ระบบ [Vercel](https://vercel.com/)
2. คลิก **Add New...** > **Project**
3. เลือก Repository บน GitHub ของโครงงานนี้
4. การตั้งค่าระบบ (Build & Output Settings):
   - **Framework Preset:** Vite (หรือ Other)
   - **Build Command:** `npm run build`
   - **Output Directory:** `.output/public`
5. คลิก **Deploy**

### วิธีที่ 2: Deploy ผ่าน Vercel CLI
```bash
npm i -g vercel
vercel
```

---

## 🔒 ข้อมูลความปลอดภัยและการแก้ไข
- ระบบมีการป้องกันการแก้ไขข้อมูลด้วยรหัสผ่าน 6 หลัก
- ข้อมูลที่แก้ไขสามารถบันทึกลง LocalStorage ของเบราว์เซอร์ได้ทันที
- รองรับการ Export ข้อมูลออกเป็นไฟล์ CSV สำหรับเปิดบน Excel / Google Sheets
