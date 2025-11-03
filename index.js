// 1. Import แพ็คเกจที่จำเป็น
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

// 2. ตั้งค่า Express และ Middleware
const app = express();
const port = 3000; // API ของเราจะรันที่พอร์ต 3000

app.use(cors()); // อนุญาตให้ทุกโดเมนเรียกใช้ API นี้ (เพื่อการทดสอบ)
app.use(express.json()); // ให้ Express อ่าน JSON จาก request body ได้

// 3. ตั้งค่าการเชื่อมต่อฐานข้อมูล
// !!! **สำคัญ: แก้ไขข้อมูลตรงนี้ให้เป็นของคุณ** !!!
const db = mysql.createPool({
  host: 'localhost',      // หรือ 127.0.0.1
  user: 'root',           // user ของ MySQL (ถ้าใช้ XAMPP มักจะเป็น root)
  password: '',          // รหัสผ่าน (ถ้าใช้ XAMPP มักจะว่าง)
  database: 'class_db'    // ชื่อฐานข้อมูลที่เราสร้าง
}).promise(); // ใช้ .promise() เพื่อให้เราเขียนโค้ดแบบ async/await ได้ง่ายขึ้น

// 4. สร้าง API Endpoints (เส้นทาง)

// GET: ดึงข้อมูลเพื่อนทั้งหมด
app.get("/classmates", async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM classmates");
    res.json(results); // ส่งข้อมูลกลับไปเป็น JSON
  } catch (err) {
    console.error("Error fetching classmates:", err);
    res.status(500).json({ message: "Error fetching data" });
  }
});

// POST: เพิ่มเพื่อนใหม่
app.post("/classmates", async (req, res) => {
  try {
    // ดึงข้อมูลจาก body ของ request ที่ Flutter ส่งมา
    const { first_name, last_name, phone, latitude, longitude } = req.body;

    // ตรวจสอบข้อมูลเบื้องต้น
    if (!first_name || !last_name) {
      return res.status(400).json({ message: "First name and last name are required" });
    }

    const sql = "INSERT INTO classmates (first_name, last_name, phone, latitude, longitude) VALUES (?, ?, ?, ?, ?)";
    
    // ใช้ [ ] เพื่อป้องกัน SQL Injection
    const [result] = await db.query(sql, [first_name, last_name, phone, latitude, longitude]);
    
    // ส่งข้อมูลที่เพิ่งสร้างกลับไป (รวมถึง ID ใหม่)
    res.status(201).json({
      id: result.insertId,
      first_name,
      last_name,
      phone,
      latitude,
      longitude
    });

  } catch (err) {
    console.error("Error creating classmate:", err);
    res.status(500).json({ message: "Error creating data" });
  }
});


// 5. สั่งให้เซิร์ฟเวอร์เริ่มทำงาน
app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});