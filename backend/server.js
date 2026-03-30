const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const jwt = require("jsonwebtoken");
const { Parser } = require("json2csv");
const bcrypt = require("bcrypt");
const ExcelJS = require("exceljs");

const saltRounds = 10;
const app = express();
const PORT = 5000;

/* ======== JWT Config ======== */
const JWT_SECRET = "My-jwt-key";
const JWT_EXPIRES_IN = "10h";

const generateToken = (user) => {
  let payload = {};

  switch (user.role.toLowerCase()) {
    case "admin":
      payload = { id: user.id, email: user.email, role: "admin", name: user.name };
      break;
    case "secretary":
      payload = { id: user.id, email: user.email, role: "secretary", name: user.name, building_name: user.building_name };
      break;
    case "user":
      payload = { id: user.id, email: user.email, role: "user", name: user.name, building_name: user.building_name, secretary_id: user.secretary_id };
      break;
    default:
      throw new Error("Unknown role");
  }

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ message: "Authorization header missing or malformed" });

  const token = authHeader.split(" ")[1];

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("JWT verification error:", err);
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    console.log("Decoded JWT payload:", decoded);

    req.user = decoded;
    req.currentUser = decoded;
    next();
  });
}

function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!roles.includes(req.user.role))
      return res.status(403).json({ message: "Forbidden: Insufficient role" });
    next();
  };
}

async function generateExcel(issues) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Issues Report");

  worksheet.columns = [
    { header: "Issue ID", key: "issue_id", width: 10 },
    { header: "Title", key: "title", width: 25 },
    { header: "Description", key: "description", width: 40 },
    { header: "Status", key: "status", width: 15 },
    { header: "Building", key: "building_name", width: 20 },
    { header: "Created At", key: "created_at", width: 20 },
  ];

  issues.forEach((issue) => worksheet.addRow(issue));
  worksheet.getRow(1).font = { bold: true };

  return await workbook.xlsx.writeBuffer();
}

/* ========= Utility function for CSV ========= */
function generateCSV(issues) {
  const parser = new Parser({
    fields: [
      "issue_id",
      "title",
      "description",
      "status",
      "building_name",
      "created_at",
    ],
  });
  return parser.parse(issues);
}

/* ======== Common handler ======== */
async function exportIssues(res, issues, role) {
  const format = res.req.query.format || "excel";

  if (!issues.length) {
    return res.status(404).json({ message: "No issues found" });
  }

  if (format === "csv") {
    const csv = generateCSV(issues);
    res.setHeader("Content-Disposition", `attachment; filename=${role}_issues_report.csv`);
    res.setHeader("Content-Type", "text/csv");
    res.send(csv);
  } else {
    const buffer = await generateExcel(issues);
    res.setHeader("Content-Disposition", `attachment; filename=${role}_issues_report.xlsx`);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buffer);
  }
}

/* ======== Middleware ======== */
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ======== DB Connection ======== */
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "issue_tracking",
});
db.connect((err) => {
  if (err) console.error("DB connection error:", err);
  else console.log("Connected to MySQL");
});
const dbp = db.promise();

/* ======== File Upload ======== */
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

const resizeImage = async (filePath) => {
  const smallDir = path.join(__dirname, "uploads-small");
  if (!fs.existsSync(smallDir)) fs.mkdirSync(smallDir);

  const fileName = path.basename(filePath);
  const outputFile = path.join(smallDir, fileName);

  await sharp(filePath).resize(800, 600, { fit: "inside" }).toFile(outputFile);
  fs.unlinkSync(filePath);

  return `uploads-small/${fileName}`;
};

// ======== Notification Helpers ========

/**
 * Batch insert notifications into the database
 */
async function createNotificationsBatch(notifications) {
  if (!notifications.length) return;

  const placeholders = notifications.map(() => "(?, ?, ?, ?, NOW())").join(", ");
  const values = notifications.flatMap(n => [
    n.receiver_type,
    n.receiver_id,
    n.message,
    n.building_name || null
  ]);

  await dbp.query(
    `INSERT INTO notifications 
     (receiver_type, receiver_id, message, building_name, created_at)
     VALUES ${placeholders}`,
    values
  );
}

/**
 * Notify all admins about an event
 */
async function notifyAdmins({ issue, user_id = null, feedback_id = null, secretary_id = null, notification_type, building_name, customMessage }) {
  const [admins] = await dbp.query("SELECT admin_id FROM admin WHERE role='admin'");
  if (!admins.length) return;

  const notifications = admins.map(admin => ({
    receiver_type: "admin",
    receiver_id: admin.admin_id,
    user_id,
    secretary_id,
    issue_id: issue?.issue_id || null,
    feedback_id,
    message: customMessage,
    notification_type,
    building_name
  }));

  await createNotificationsBatch(notifications);
}

/**
 * Notify one or more secretaries of a building (creates only one notification per secretary)
 */
async function notifySecretaries({ building_name, issue = null, feedback_id = null, notification_type, customMessage }) {
  const [secretaries] = await dbp.query(
    "SELECT DISTINCT secretary_id FROM secretary WHERE role='secretary' AND building_name=?",
    [building_name]
  );

  if (!secretaries.length) return null;

  const notifications = secretaries.map(sec => ({
    receiver_type: "secretary",
    receiver_id: sec.secretary_id,
    user_id: null,
    secretary_id: sec.secretary_id,
    issue_id: issue?.issue_id || null,
    feedback_id,
    message: customMessage,
    notification_type,
    building_name
  }));

  await createNotificationsBatch(notifications);

  // Return the first secretary_id for linking with admin notifications
  return secretaries[0].secretary_id;
}

/**
 * Notify a specific user
 */
async function notifyUser({ user_id, secretary_id = null, issue = null, feedback_id = null, notification_type, building_name, customMessage }) {
  if (!user_id) return;

  await createNotificationsBatch([{
    receiver_type: "user",
    receiver_id: user_id,
    user_id,
    secretary_id,
    issue_id: issue?.issue_id || null,
    feedback_id,
    message: customMessage,
    notification_type,
    building_name
  }]);
}

/* ======== Login ======== */
app.post("/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password required" });

  db.query(
    "SELECT admin_id AS id, admin_email AS email, admin_password AS password FROM admin WHERE admin_email=? LIMIT 1",
    [email],
    async (err, adminRows) => {
      if (err) return res.status(500).json(err);
      if (adminRows.length && await bcrypt.compare(password, adminRows[0].password)) {
        const user = { id: adminRows[0].id, email: adminRows[0].email, role: "admin", name: adminRows[0].email.split("@")[0] };
        const token = generateToken(user);
        return res.json({ message: "Logged in as Admin", token, user });
      }

      db.query(
        "SELECT secretary_id AS id, semail AS email, spassword AS password, sname AS name, building_name FROM secretary WHERE semail=? LIMIT 1",
        [email],
        async (err, secRows) => {
          if (err) return res.status(500).json(err);
          if (secRows.length && await bcrypt.compare(password, secRows[0].password)) {
            const user = { id: secRows[0].id, email: secRows[0].email, role: "secretary", name: secRows[0].name, building_name: secRows[0].building_name };
            const token = generateToken(user);
            return res.json({ message: "Logged in as Secretary", token, user });
          }

          db.query(
            "SELECT user_id AS id, uemail AS email, upassword AS password, uname AS name, building_name, secretary_id FROM users WHERE uemail=? LIMIT 1",
            [email],
            async (err, userRows) => {
              if (err) return res.status(500).json(err);
              if (userRows.length && await bcrypt.compare(password, userRows[0].password)) {
                const user = { id: userRows[0].id, email: userRows[0].email, role: "user", name: userRows[0].name, building_name: userRows[0].building_name, secretary_id: userRows[0].secretary_id };
                const token = generateToken(user);
                return res.json({ message: "Logged in as User", token, user });
              }

              return res.status(401).json({ message: "Invalid email or password" });
            }
          );
        }
      );
    }
  );
});

/* ======== Role-Specific Login ======== */
app.post("/auth/admin/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password required" });
  try {
    const [rows] = await dbp.query(
      "SELECT admin_id AS id, admin_email AS email, admin_password AS password FROM admin WHERE admin_email=? LIMIT 1",
      [email]
    );
    if (!rows.length || !(await bcrypt.compare(password, rows[0].password))) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }
    const user = { id: rows[0].id, email: rows[0].email, role: "admin", name: rows[0].email.split("@")[0] };
    const token = generateToken(user);
    return res.json({ message: "Logged in as Admin", token, user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/auth/secretary/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password required" });
  try {
    const [rows] = await dbp.query(
      "SELECT secretary_id AS id, semail AS email, spassword AS password, sname AS name, building_name FROM secretary WHERE semail=? LIMIT 1",
      [email]
    );
    if (!rows.length || !(await bcrypt.compare(password, rows[0].password))) {
      return res.status(401).json({ message: "Invalid secretary credentials" });
    }
    const user = { id: rows[0].id, email: rows[0].email, role: "secretary", name: rows[0].name, building_name: rows[0].building_name };
    const token = generateToken(user);
    return res.json({ message: "Logged in as Secretary", token, user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/auth/user/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password required" });
  try {
    const [rows] = await dbp.query(
      "SELECT user_id AS id, uemail AS email, upassword AS password, uname AS name, building_name, secretary_id FROM users WHERE uemail=? LIMIT 1",
      [email]
    );
    if (!rows.length || !(await bcrypt.compare(password, rows[0].password))) {
      return res.status(401).json({ message: "Invalid user credentials" });
    }
    const user = { id: rows[0].id, email: rows[0].email, role: "user", name: rows[0].name, building_name: rows[0].building_name, secretary_id: rows[0].secretary_id };
    const token = generateToken(user);
    return res.json({ message: "Logged in as User", token, user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ======== Public User Self-Registration ======== */
app.post("/public/users", async (req, res) => {
  const { uname, uemail, upassword, wing, house_no, building_name } = req.body;
  if (!uname || !uemail || !upassword || !wing || !house_no || !building_name) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const [existing] = await dbp.query("SELECT * FROM users WHERE uemail = ?", [uemail]);
    if (existing.length > 0) return res.status(400).json({ message: "Email already registered" });

    const [secRows] = await dbp.query(
      "SELECT secretary_id FROM secretary WHERE building_name = ? LIMIT 1",
      [building_name]
    );
    const secretary_id = secRows.length ? secRows[0].secretary_id : null;
    const hashedPassword = await bcrypt.hash(upassword, saltRounds);

    const [result] = await dbp.query(
      "INSERT INTO users (uname, uemail, upassword, role, wing, house_no, building_name, secretary_id) VALUES (?, ?, ?, 'user', ?, ?, ?, ?)",
      [uname, uemail, hashedPassword, wing, house_no, building_name, secretary_id]
    );

    const token = jwt.sign(
      { id: result.insertId, email: uemail, role: "user", name: uname, building_name, secretary_id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    const user = { id: result.insertId, email: uemail, role: "user", name: uname, building_name, secretary_id };
    res.json({ message: "User registered successfully", token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/auth/me", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Invalid token" });
    res.json({ id: decoded.id, name: decoded.name, role: decoded.role });
  });
});

/* ======== Admin profile ======== */
app.get("/admin/profile", authenticateJWT, requireRole(["admin"]), async (req, res) => {
    try {
      const [rows] = await dbp.query(
        "SELECT admin_id, admin_email,admin_password FROM admin WHERE admin_id = ?",
        [req.user.id]
      );
      if (!rows.length) return res.status(404).json({ message: "Admin not found" });
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

app.put("/admin/profile", authenticateJWT, requireRole(["admin"]), async (req, res) => {
    try {
      const { aemail, apassword } = req.body;
      const params = [];
      let query = "UPDATE admin SET ";

      if (aemail) { query += "admin_email = ?, "; params.push(aemail); }
      if (apassword) { 
        const hashed = await bcrypt.hash(apassword, saltRounds);
        query += "admin_password = ?, "; 
        params.push(hashed);
      }

      query = query.slice(0, -2);
      query += " WHERE admin_id = ?";
      params.push(req.user.id);
      await dbp.query(query, params);
      res.json({ message: "Admin profile updated successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* ======== Secretary profile ======== */
app.get("/secretary/profile", authenticateJWT, requireRole(["secretary"]), async (req, res) => {
    try {
      const [rows] = await dbp.query(
        `SELECT secretary_id, sname, semail, building_name, wing, house_no 
         FROM secretary WHERE secretary_id = ?`,
        [req.user.id]
      );
      if (!rows.length) return res.status(404).json({ message: "Secretary not found" });
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

app.put("/secretary/profile", authenticateJWT, requireRole(["secretary"]), async (req, res) => {
    try {
      const { sname, semail, spassword, building_name, wing, house_no } = req.body;
      const params = [];
      let query = "UPDATE secretary SET ";

      if (sname) { query += "sname = ?, "; params.push(sname); }
      if (semail) { query += "semail = ?, "; params.push(semail); }
      if (spassword) { 
        const hashed = await bcrypt.hash(spassword, saltRounds);
        query += "spassword = ?, "; 
        params.push(hashed);
      }
      if (building_name) { query += "building_name = ?, "; params.push(building_name); }
      if (wing) { query += "wing = ?, "; params.push(wing); }
      if (house_no) { query += "house_no = ?, "; params.push(house_no); }

      query = query.slice(0, -2);
      query += " WHERE secretary_id = ?";
      params.push(req.user.id);

      await dbp.query(query, params);
      res.json({ message: "Secretary profile updated successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* ======== User profile ======== */
app.get("/user/profile", authenticateJWT, requireRole(["user"]), async (req, res) => {
    try {
      const [rows] = await dbp.query(
        `SELECT 
    u.user_id, 
    u.uname, 
    u.uemail, 
    u.building_name, 
    u.wing, 
    u.house_no,
    u.secretary_id, 
    s.sname AS secretary_name
FROM users u
LEFT JOIN secretary s
    ON u.secretary_id = s.secretary_id
WHERE u.user_id = ?;
`,
        [req.user.id]
      );
      if (!rows.length) return res.status(404).json({ message: "User not found" });
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

app.put("/user/profile", authenticateJWT, requireRole(["user"]), async (req, res) => {
  try {
    const {
      uname,
      uemail,
      upassword,
      name,
      email,
      password,
      building_name,
      building,
      wing,
      house_no,
      houseNo,
    } = req.body;

    let query = "UPDATE users SET ";
    const params = [];

    // Update username
    if (uname || name) {
      query += "uname = ?, ";
      params.push(uname || name);
    }

    // Update email
    if (uemail || email) {
      query += "uemail = ?, ";
      params.push(uemail || email);
    }

    // Update password (hash it)
    if (upassword || password) {
      const hashed = await bcrypt.hash(upassword || password, saltRounds);
      query += "upassword = ?, ";
      params.push(hashed);
    }

    // Update wing
    if (wing) {
      query += "wing = ?, ";
      params.push(wing);
    }

    // Update house number
    if (house_no || houseNo) {
      query += "house_no = ?, ";
      params.push(house_no || houseNo);
    }

    // Update building_name and auto-link secretary
    if (building_name || building) {
      const buildingValue = building_name || building;

      const [secRows] = await dbp.query(
        "SELECT secretary_id FROM secretary WHERE building_name = ? LIMIT 1",
        [buildingValue]
      );

      const secretary_id = secRows.length ? secRows[0].secretary_id : null;

      query += "building_name = ?, secretary_id = ?, ";
      params.push(buildingValue, secretary_id);
    }

    // Remove trailing comma and space
    query = query.replace(/, $/, "");

    // Add WHERE clause
    query += " WHERE user_id = ?";
    params.push(req.currentUser.id);

    // Execute update
    await dbp.query(query, params);

    // Fetch updated user info
    const [updatedRows] = await dbp.query(
      "SELECT user_id, uname, uemail, building_name, wing, house_no, secretary_id FROM users WHERE user_id = ?",
      [req.currentUser.id]
    );

    res.json({
      message: "User profile updated successfully",
      user: updatedRows[0] || null,
    });
  } catch (err) {
    console.error("Error updating user profile:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ======== Register for Secretary ======== */

app.post("/public/secretaries", async (req, res) => {
  const { sname, semail, spassword, wing, house_no, building_name } = req.body;

  if (!sname || !semail || !spassword || !wing || !house_no || !building_name) {
    return res.status(400).json({ message: "All fields are required" });
  }

  db.query("SELECT * FROM secretary WHERE semail = ?", [semail], async (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (results.length > 0) return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(spassword, saltRounds);

    db.query(
      "INSERT INTO secretary (sname, semail, spassword, wing, house_no, building_name, role) VALUES (?, ?, ?, ?, ?, ?, 'secretary')",
      [sname, semail, hashedPassword, wing, house_no, building_name],
      (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });

        const token = jwt.sign(
          { id: result.insertId, email: semail, role: "secretary", name: sname },
          JWT_SECRET,
          { expiresIn: JWT_EXPIRES_IN }
        );

        res.json({
          message: "Secretary registered successfully",
          token,
          redirectTo: "/secretary/dashboard"
        });
      }
    );
  });
});

/* ======== Secretary CRUD ======== */

app.post("/secretaries", authenticateJWT, requireRole(["admin"]), async (req, res) => {
  const { sname, semail, spassword, wing, house_no, building_name } = req.body;

  const hashedPassword = await bcrypt.hash(spassword, saltRounds);

  db.query(
    "INSERT INTO secretary (sname, semail, spassword, role, wing, house_no, building_name) VALUES (?, ?, ?, 'secretary', ?, ?, ?)",
    [sname, semail, hashedPassword, wing, house_no, building_name],
    (err, result) =>
      err ? res.status(500).json(err) : res.json({ message: "Secretary created", secretary_id: result.insertId })
  );
});

app.get("/secretaries", authenticateJWT, requireRole(["admin", "secretary"]), (req, res) => {
  db.query("SELECT * FROM secretary", (err, rows) => (err ? res.status(500).json(err) : res.json(rows)));
});

app.get("/secretaries/:id", authenticateJWT, requireRole(["admin","secretary","user"]),(req, res) => {
  const secretaryId = req.params.id;
  const query = "SELECT secretary_id, sname, semail, wing, house_no, building_name FROM secretary WHERE secretary_id = ?";
  db.query(query, [secretaryId], (err, result) => {
    if (err) return res.status(500).json({ error: "Internal server error" });
    if (result.length === 0) return res.status(404).json({ error: "Secretary not found" });
    res.json(result[0]);
  });
});

app.get("/buildings", async (req, res) => {
  try {
    const [rows] = await dbp.query("SELECT DISTINCT building_name FROM secretary");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

app.put("/secretaries/:id", authenticateJWT, requireRole(["admin", "secretary"]), async (req, res) => {
  const { role, id: currentId } = req.currentUser;
  const { sname, semail, spassword, wing, house_no, building_name } = req.body;

  if (role !== "admin" && currentId != req.params.id) {
    return res.status(403).json({ message: "Forbidden" });
  }
  const hashedPassword = spassword ? await bcrypt.hash(spassword, saltRounds) : null;
  db.query(
    "UPDATE secretary SET sname=?, semail=?, spassword=?, wing=?, house_no=?, building_name=? WHERE secretary_id=?",
    [sname, semail, hashedPassword, wing, house_no, building_name, req.params.id],
    (err) => (err ? res.status(500).json(err) : res.json({ message: "Secretary updated" }))
  );
});

app.delete("/secretaries/:id", authenticateJWT, requireRole(["admin"]), (req, res) => {
  db.query("DELETE FROM secretary WHERE secretary_id=?", [req.params.id], (err) =>
    err ? res.status(500).json(err) : res.json({ message: "Secretary deleted" })
  );
});

app.get("/secretary/dashboard-data", authenticateJWT, requireRole(["secretary"]), async (req, res) => {
    try {
      const secretaryId = req.currentUser?.id;
      if (!secretaryId) return res.status(401).json({ message: "Unauthorized" });

      const [secRows] = await dbp.query(
        "SELECT building_name FROM secretary WHERE secretary_id=?",
        [secretaryId]
      );
      if (!secRows.length) return res.status(404).json({ message: "Secretary not found" });
      const buildingName = secRows[0].building_name;

      const [statsRows, issuesRows] = await Promise.all([
        dbp.query(
          `SELECT 
             COUNT(*) AS total,
             SUM(i.status='Pending') AS pending,
             SUM(i.status='In Progress') AS inProgress,
             SUM(i.status='Resolved') AS resolved
           FROM issues i
           JOIN users u ON i.reporter_id = u.user_id
           WHERE u.secretary_id=? AND i.reporter_type='user'`,
          [secretaryId]
        ),
        dbp.query(
          `SELECT i.*, u.uname AS reporter_name
           FROM issues i
           JOIN users u ON i.reporter_id=u.user_id
           WHERE u.secretary_id=? AND i.reporter_type='user'
           ORDER BY i.issue_id DESC`,
          [secretaryId]
        ),
        dbp.query(
          `SELECT i.category, COUNT(*) AS count
           FROM issues i
           JOIN users u ON i.reporter_id = u.user_id
           WHERE u.secretary_id=? AND i.reporter_type='user'
           GROUP BY i.category`,
          [secretaryId]
        )
      ]);

      const stats = statsRows[0][0] || { total: 0, pending: 0, inProgress: 0, resolved: 0 };
      const issues = issuesRows[0] || [];

      res.json({ buildingName, stats, issues });
    } catch (err) {
      console.error("Secretary dashboard error:", err);
      res.status(500).json({ message: "Server error", error: err });
    }
  }
);

app.get("/secretaries/:id", authenticateJWT, requireRole(["admin", "secretary"]),(req, res) => {
    const { id } = req.params;
    db.query("SELECT * FROM secretary WHERE secretary_id = ?", [id], (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (results.length === 0) return res.status(404).json({ error: "Secretary not found" });
      res.json(results[0]);
    });
  }
);

/* ======== User CRUD ======== */
app.post("/users/add", authenticateJWT, requireRole(["admin", "secretary"]), async (req, res) => {
  const { uname, uemail, upassword, wing, house_no, building_name } = req.body;

  try {
    if (!upassword || !upassword.trim()) {
      return res.status(400).json({ error: "Password is required" });
    }

    const hashedPassword = await bcrypt.hash(upassword, saltRounds);

    if (req.currentUser.role === "secretary") {
      const secretaryId = req.currentUser.id;

      db.query(
        "SELECT building_name FROM secretary WHERE secretary_id = ?",
        [secretaryId],
        (err, rows) => {
          if (err) return res.status(500).json({ error: "Database error" });
          if (!rows.length) return res.status(404).json({ error: "Secretary not found" });

          const secBuilding = rows[0].building_name;

          db.query(
            "INSERT INTO users (uname, uemail, upassword, role, wing, house_no, building_name, secretary_id) VALUES (?,?,?, 'user', ?,?,?,?)",
            [uname, uemail, hashedPassword, wing, house_no, secBuilding, secretaryId],
            (iErr, result) =>
              iErr
                ? res.status(500).json(iErr)
                : res.json({ message: "User created", user_id: result.insertId, secretary_id: secretaryId })
          );
        }
      );
    }
    else if (req.currentUser.role === "admin") {
      if (!building_name) {
        return res.status(400).json({ error: "Building name is required for admin" });
      }
      db.query(
        "SELECT secretary_id FROM secretary WHERE building_name=? LIMIT 1",
        [building_name],
        (err, rows) => {
          if (err) return res.status(500).json(err);
          const secretary_id = rows.length ? rows[0].secretary_id : null;
          db.query(
            "INSERT INTO users (uname, uemail, upassword, role, wing, house_no, building_name, secretary_id) VALUES (?,?,?, 'user', ?,?,?,?)",
            [uname, uemail, hashedPassword, wing, house_no, building_name, secretary_id],
            (iErr, result) =>
              iErr
                ? res.status(500).json(iErr)
                : res.json({ message: "User created", user_id: result.insertId, secretary_id })
          );
        }
      );
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/secretary/users", authenticateJWT, requireRole(["secretary"]), (req, res) => {
  const secretaryId = req.currentUser.id;
  db.query(
    "SELECT user_id, uname, uemail, wing, house_no FROM users WHERE secretary_id = ?",
    [secretaryId],
    (err, users) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json({ users });
    }
  );
});

app.get("/users/:id", authenticateJWT, requireRole(["admin", "secretary", "user"]), (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM users WHERE user_id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!results.length) return res.status(404).json({ error: "User not found" });
    res.json(results[0]);
  });
});

app.get("/users", authenticateJWT, requireRole(["admin", "secretary", "user"]), async (req, res) => {
  const { role, id } = req.currentUser;

  try {
    if (role === "admin") {
      const [rows] = await dbp.query("SELECT * FROM users");
      return res.json(rows);
    }
    if (role === "secretary") {
      const [userRows] = await dbp.query("SELECT * FROM users WHERE secretary_id=?", [id]);
      return res.json(userRows);
    }
    res.status(403).json({ message: "Forbidden" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err });
  }
});

app.put("/users/:id", authenticateJWT, requireRole(["admin", "secretary"]), async (req, res) => {
  const { uname, uemail, upassword, wing, house_no, building_name } = req.body;
  const userId = req.params.id;

  try {
    let hashedPassword = null;
    if (upassword && upassword.trim() !== "") {
      hashedPassword = await bcrypt.hash(upassword, saltRounds);
    }

    if (req.currentUser.role === "admin") {
      const updateQuery = `
        UPDATE users 
        SET uname=?, uemail=?, ${hashedPassword ? "upassword=?," : ""} wing=?, house_no=?, building_name=? 
        WHERE user_id=?`;

      const params = hashedPassword
        ? [uname, uemail, hashedPassword, wing, house_no, building_name, userId]
        : [uname, uemail, wing, house_no, building_name, userId];

      db.query(updateQuery, params, (err) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });
        res.json({ message: "User updated successfully" });
      });

    } else if (req.currentUser.role === "secretary") {
      const secBuilding = req.currentUser.building_name;

      const updateQuery = `
        UPDATE users 
        SET uname=?, uemail=?, ${hashedPassword ? "upassword=?," : ""} wing=?, house_no=? 
        WHERE user_id=? AND building_name=?`;

      const params = hashedPassword
        ? [uname, uemail, hashedPassword, wing, house_no, userId, secBuilding]
        : [uname, uemail, wing, house_no, userId, secBuilding];

      db.query(updateQuery, params, (err, result) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });
        if (result.affectedRows === 0) {
          return res.status(403).json({ message: "Not allowed to update this user" });
        }
        res.json({ message: "User updated successfully" });
      });
    }
  } catch (err) {
    res.status(500).json({ message: "Error updating user", error: err });
  }
});

app.delete("/users/:id", authenticateJWT, requireRole(["admin", "secretary", "user"]), (req, res) => {
  const { role, id: currentId } = req.currentUser;
  if (role === "user" && currentId != req.params.id) return res.status(403).json({ message: "Forbidden" });
  db.query("DELETE FROM users WHERE user_id=?", [req.params.id], (err) =>
    err ? res.status(500).json(err) : res.json({ message: "User deleted" })
  );
});

/* ======================== Issues CRUD ======================== */
const insertIssueLog = (issue_id, updated_by_type, updated_by_id, action, old_value, new_value, cb = () => {}) => {
  db.query(
    "INSERT INTO issue_logs (issue_id, updated_by_type, updated_by_id, action, old_value, new_value) VALUES (?,?,?,?,?,?)",
    [issue_id, updated_by_type, updated_by_id, action, old_value, new_value],
    cb
  );
};

/* ========= Issues API ========= */
const uploadMultiple = upload.array("images", 5);

app.post("/issues", authenticateJWT, uploadMultiple, async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const { id: reporter_id, role, building_name } = req.currentUser;

    if (role !== "user") return res.status(403).json({ message: "Only users can report issues" });
    if (!title || !description || !category)
      return res.status(400).json({ message: "Title, description, and category are required" });

    let imagePaths = [];
    if (req.files?.length) {
      for (const file of req.files) imagePaths.push(await resizeImage(file.path));
    }
    const imageValue = imagePaths.length > 0 ? imagePaths[0] : null;

    const [result] = await dbp.query(
      `INSERT INTO issues 
       (reporter_type, reporter_id, category, title, description, building_name, image, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      ["User", reporter_id, category, title, description, building_name, imageValue, "Pending"]
    );

    const issue = { issue_id: result.insertId, title, building_name };

    // Notify secretary
    const secretary_id = await notifySecretaries({
      building_name,
      issue,
      notification_type: "new_issue_reported",
      customMessage: `New issue reported: "${title}" in building ${building_name}.`
    });

    // Notify admins
    await notifyAdmins({
      issue,
      secretary_id,
      notification_type: "new_issue_reported",
      building_name,
      customMessage: `New issue reported: "${title}" in building ${building_name}.`
    });

    res.status(201).json({ message: "Issue created and notifications sent", issue_id: issue.issue_id, images: imagePaths });
  } catch (err) {
    console.error("POST /issues error:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
});


app.delete("/issues/:id", authenticateJWT, requireRole(["admin"]), async (req, res) => {
  try {
    const [rows] = await dbp.query("SELECT * FROM issues WHERE issue_id=?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: "Issue not found" });

    const issue = rows[0];
    await dbp.query("DELETE FROM issues WHERE issue_id=?", [req.params.id]);

    // Notifications
    await notifySecretaryForBuilding(issue.building_name, `Issue "${issue.title}" in your building (${issue.building_name}) was deleted by admin.`, issue.issue_id);
    await createNotification("user", issue.reporter_id, `Your reported issue "${issue.title}" has been deleted by admin.`, issue.issue_id);
    await notifyAllAdmins(`Issue "${issue.title}" in building ${issue.building_name} was deleted by an admin.`, issue.issue_id);

    res.json({ message: "Issue deleted successfully and notifications sent" });

  } catch (e) {
    console.error("DELETE /issues/:id error:", e);
    res.status(500).json({ message: "Server error", error: e.message });
  }
});

app.get("/issues", authenticateJWT, requireRole(["admin", "secretary", "user"]), (req, res) => {
  const { role, id } = req.currentUser;

  let issuesSql = "";
  let statsSql = "";
  let params = [];

  if (role === "admin") {
    issuesSql = `
      SELECT i.*, u.uname AS reporter_name
      FROM issues i
      LEFT JOIN users u ON i.reporter_id = u.user_id
      ORDER BY i.issue_id DESC
    `;

    statsSql = `
      SELECT
        COUNT(*) AS total,
        COUNT(CASE WHEN status='Pending' THEN 1 END) AS pending,
        COUNT(CASE WHEN status='In Progress' THEN 1 END) AS inProgress,
        COUNT(CASE WHEN status='Resolved' THEN 1 END) AS resolved
      FROM issues
    `;
  } else if (role === "secretary") {
    issuesSql = `
      SELECT i.*, u.uname AS reporter_name
      FROM issues i
      JOIN users u ON i.reporter_id = u.user_id
      WHERE u.secretary_id = ?
      ORDER BY i.issue_id DESC
    `;
    statsSql = `
      SELECT
        COUNT(*) AS total,
        COUNT(CASE WHEN i.status='Pending' THEN 1 END) AS pending,
        COUNT(CASE WHEN i.status='In Progress' THEN 1 END) AS inProgress,
        COUNT(CASE WHEN i.status='Resolved' THEN 1 END) AS resolved
      FROM issues i
      JOIN users u ON i.reporter_id = u.user_id
      WHERE u.secretary_id = ?
    `;
    params = [id];
  } else if (role === "user") {
    issuesSql = `
      SELECT i.*, u.uname AS reporter_name
      FROM issues i
      JOIN users u ON i.reporter_id = u.user_id
      WHERE i.reporter_id = ?
      ORDER BY i.issue_id DESC
    `;
    statsSql = `
      SELECT
        COUNT(*) AS total,
        COUNT(CASE WHEN status='Pending' THEN 1 END) AS pending,
        COUNT(CASE WHEN status='In Progress' THEN 1 END) AS inProgress,
        COUNT(CASE WHEN status='Resolved' THEN 1 END) AS resolved
      FROM issues
      WHERE reporter_type='User' AND reporter_id = ?
    `;
    params = [id];
  }

  // Execute both queries
  db.query(issuesSql, params, (err, issues) => {
    if (err) return res.status(500).json(err);

    // Category counts
    const categoryStats = { personal: 0, general: 0 };
    issues.forEach((i) => {
      if (i.category?.toLowerCase() === "personal") categoryStats.personal++;
      else if (i.category?.toLowerCase() === "general") categoryStats.general++;
    });

    // Status counts
    db.query(statsSql, params, (err2, rows) => {
      if (err2) return res.status(500).json(err2);
      const data = rows[0] || {};
      const statusStats = {
        total: Number(data.total) || 0,
        pending: Number(data.pending) || 0,
        inProgress: Number(data.inProgress) || 0,
        resolved: Number(data.resolved) || 0,
      };

      res.json({
        issues,
        categoryStats,
        statusStats,
      });
    });
  });
});

app.get("/issues/:id", authenticateJWT, requireRole(["secretary"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { id: secretaryId } = req.currentUser;

    const [rows] = await dbp.query(
      "SELECT i.*, u.secretary_id FROM issues i JOIN users u ON i.reporter_id = u.user_id WHERE i.issue_id=?", 
      [id]
    );
    if (!rows.length) return res.status(404).json({ message: "Issue not found" });

    const issue = rows[0];

    if (issue.secretary_id !== secretaryId) {
      return res.status(403).json({ message: "Forbidden: Issue does not belong to your users" });
    }

    res.json(issue);
  } catch (e) {
    console.error("Error fetching issue:", e);
    res.status(500).json({ message: "Server error", error: e.message });
  }
});

app.put("/issues/:id/status", authenticateJWT, requireRole(["secretary"]), async (req, res) => {
  try {
    const { id: secretaryId } = req.currentUser;
    const { status } = req.body;
    const ALLOWED_STATUSES = ["Pending", "In Progress", "Resolved"];

    if (!status || !ALLOWED_STATUSES.includes(status))
      return res.status(400).json({ message: `Invalid status. Allowed: ${ALLOWED_STATUSES.join(", ")}` });

    const [issueRows] = await dbp.query(
      "SELECT i.*, u.secretary_id FROM issues i JOIN users u ON i.reporter_id = u.user_id WHERE i.issue_id=?", 
      [req.params.id]
    );
    if (!issueRows.length) return res.status(404).json({ message: "Issue not found" });

    const issue = issueRows[0];
    if (issue.secretary_id !== secretaryId)
      return res.status(403).json({ message: "Forbidden: Issue does not belong to your users" });

    await dbp.query("UPDATE issues SET status=?, updated_at=NOW() WHERE issue_id=?", [status, req.params.id]);
    insertIssueLog(req.params.id, "secretary", secretaryId, "UPDATE:status", issue.status, status);

    // Notify reporter (user)
    await notifyUser({
      user_id: issue.reporter_id,
      secretary_id: secretaryId,
      issue,
      notification_type: "issue_status_updated",
      building_name: issue.building_name,
      customMessage: `Your reported issue "${issue.title}" status updated to "${status}" by secretary.`
    });

    // Notify admins
    await notifyAdmins({
      issue,
      user_id: issue.reporter_id,
      secretary_id: secretaryId,
      notification_type: "issue_status_updated",
      building_name: issue.building_name,
      customMessage: `Issue "${issue.title}" in building ${issue.building_name} status updated to "${status}" by secretary.`
    });

    res.json({ message: `Issue status updated to "${status}" and notifications sent successfully` });
  } catch (err) {
    console.error("PUT /issues/:id/status error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ========= Feedback ========= */
app.post("/feedback", authenticateJWT, requireRole(["user"]), async (req, res) => {
  try {
    const { issue_id, feedback_text } = req.body;
    const { id: user_id, building_name } = req.currentUser;

    if (!issue_id || !feedback_text?.trim())
      return res.status(400).json({ message: "Issue and feedback text are required" });

    const [issueRows] = await dbp.query(
      "SELECT issue_id, reporter_id, title, building_name FROM issues WHERE issue_id=?",
      [issue_id]
    );

    if (!issueRows.length) return res.status(404).json({ message: "Issue not found" });

    const issue = issueRows[0];

    const [result] = await dbp.query(
      "INSERT INTO feedback (issue_id, giver_role, giver_id, feedback_text, created_at) VALUES (?, ?, ?, ?, NOW())",
      [issue_id, "User", user_id, feedback_text]
    );

    const feedback_id = result.insertId;

    // Notify secretary
    const secretary_id = await notifySecretaries({
      building_name: issue.building_name,
      issue,
      feedback_id,
      notification_type: "feedback_submitted",
      customMessage: `New feedback submitted on issue "${issue.title}" by user.`
    });

    // Notify admins
    await notifyAdmins({
      issue,
      user_id,
      feedback_id,
      secretary_id,
      notification_type: "feedback_submitted",
      building_name: issue.building_name,
      customMessage: `New feedback submitted on issue "${issue.title}" in building ${issue.building_name}.`
    });

    // Notify user themselves
    await notifyUser({
      user_id,
      secretary_id,
      issue,
      feedback_id,
      notification_type: "feedback_submitted",
      building_name: issue.building_name,
      customMessage: `Your feedback on issue "${issue.title}" has been recorded.`
    });

    res.json({ message: "Feedback added successfully and notifications sent", feedback_id });
  } catch (err) {
    console.error("POST /feedback error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ========= ADMIN FEEDBACK ========= */
app.get("/admin/feedback", authenticateJWT, requireRole(["admin"]), async (req, res) => {
  try {
    const [rows] = await dbp.query(
      `SELECT 
    f.feedback_id,
    f.feedback_text,
    f.created_at,
    u.uname AS giver_name,
    u.uemail AS giver_email,
    i.title AS issue_title,
    i.building_name
FROM feedback f
LEFT JOIN users u ON f.giver_id = u.user_id
LEFT JOIN issues i ON f.issue_id = i.issue_id
ORDER BY f.created_at DESC;`
    );
    res.json(rows);
  } catch (err) {
    console.error("Admin feedback fetch error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ========= SECRETARY FEEDBACK ========= */
app.get("/secretary/feedback", authenticateJWT, requireRole(["secretary"]), async (req, res) => {
  try {
    const { id } = req.currentUser;

    const [rows] = await dbp.query(
      `SELECT f.feedback_id, f.feedback_text, f.created_at,
              u.uname AS giver_name, u.uemail AS giver_email,
              i.title AS issue_title, i.building_name
       FROM feedback f
       JOIN users u ON f.giver_id = u.user_id
       LEFT JOIN issues i ON f.issue_id = i.issue_id
       WHERE u.secretary_id=?
       ORDER BY f.created_at DESC`,
      [id]
    );

    res.json(rows);
  } catch (e) {
    console.error("Secretary feedback error:", e);
    res.status(500).json({ message: "Server error", error: e.message });
  }
});


/* ========= User Feedback ========= */
app.get("/user/feedback", authenticateJWT, requireRole(["user"]), async (req, res) => {
  try {
    const { id } = req.currentUser;

    const [rows] = await dbp.query(
      `SELECT f.feedback_id, f.feedback_text, f.created_at,
              i.title AS issue_title, i.building_name
       FROM feedback f
       LEFT JOIN issues i ON f.issue_id = i.issue_id
       WHERE f.giver_role='User' AND f.giver_id=?
       ORDER BY f.created_at DESC`,
      [id]
    );

    res.json(rows);
  } catch (e) {
    console.error("User feedback error:", e);
    res.status(500).json({ message: "Server error", error: e.message });
  }
});

app.get("/issue-logs", authenticateJWT, requireRole(["admin"]), (req, res) => {
  db.query("SELECT * FROM issue_logs ORDER BY created_at DESC", (err, rows) =>
    err ? res.status(500).json(err) : res.json(rows)
  );
});

/* ========= Get Notifications (Role-based) ========= */
app.get("/notifications", authenticateJWT, async (req, res) => {
  try {
    const { role, id } = req.currentUser; // role = admin/user/secretary

    let query = "";
    let params = [];

    if (role === "admin") {
      // Admin sees only notifications targeted to them
      query = `
        SELECT *
        FROM notifications
        WHERE receiver_type='admin' AND receiver_id=?
        ORDER BY created_at DESC
      `;
      params = [id];
    } 
    else if (role === "secretary") {
      // Secretary sees only notifications targeted to them
      query = `
        SELECT *
        FROM notifications
        WHERE receiver_type='secretary' AND receiver_id=?
        ORDER BY created_at DESC
      `;
      params = [id];
    } 
    else if (role === "user") {
      // User notifications
      query = `
        SELECT *
        FROM notifications
        WHERE receiver_type='user' AND receiver_id=?
        ORDER BY created_at DESC
      `;
      params = [id];
    } 
    else {
      return res.status(403).json({ message: "Unauthorized role" });
    }

    const [rows] = await dbp.query(query, params);
    res.json(rows);

  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Unread Notifications Count
app.get("/notifications/unread/count", authenticateJWT, async (req, res) => {
  try {
    const { role, id } = req.currentUser;
    console.log("Fetching unread count for:", role, id);

    let query = "";
    let params = [];

    if (role === "admin") {
      query = "SELECT COUNT(*) AS unreadCount FROM notifications WHERE receiver_type='admin' AND is_read=0";
    } 
    else if (role === "secretary") {
      const [secRows] = await dbp.query("SELECT building_name FROM secretary WHERE secretary_id=?", [id]);
      if (!secRows.length) return res.status(404).json({ message: "Secretary not found" });
      const building = secRows[0].building_name;

      query = `
        SELECT COUNT(*) AS unreadCount
        FROM notifications 
        WHERE receiver_type='secretary' AND receiver_id=?
          AND is_read=0
      `;
      params = [id];
    } 
    else if (role === "user") {
      query = "SELECT COUNT(*) AS unreadCount FROM notifications WHERE receiver_type='user' AND receiver_id=? AND is_read=0";
      params = [id];
    } 
    else {
      return res.status(403).json({ message: "Unauthorized role" });
    }

    const [rows] = await dbp.query(query, params);
    console.log("Unread notifications:", rows);
    res.json({ unreadCount: rows[0].unreadCount });

  } catch (err) {
    console.error("Error fetching unread count:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ==========================
// Mark Notification as Read
// ==========================
app.patch("/notifications/:id/read", authenticateJWT, async (req, res) => {
  try {
    const { role, id } = req.currentUser; // role: admin/secretary/user
    const notifId = req.params.id;

    let query = "";
    let params = [];

    // Mark notification as read
    if (role === "admin") {
      // Only notifications meant for this admin
      query = "UPDATE notifications SET is_read=1 WHERE notification_id=? AND receiver_id=?";
      params = [notifId, id];
    } 
    else if (role === "secretary") {
      query = "UPDATE notifications SET is_read=1 WHERE notification_id=? AND receiver_type='secretary' AND secretary_id=?";
      params = [notifId, id];
    } 
    else if (role === "user") {
      query = "UPDATE notifications SET is_read=1 WHERE notification_id=? AND receiver_type='user' AND user_id=?";
      params = [notifId, id];
    } 
    else {
      return res.status(403).json({ message: "Unauthorized role" });
    }

    await dbp.query(query, params);

    // Return updated unread count
    let countQuery = "";
    let countParams = [];

    if (role === "admin") {
      countQuery = "SELECT COUNT(*) AS unreadCount FROM notifications WHERE receiver_type='admin' AND receiver_id=? AND is_read=0";
      countParams = [id];
    } 
    else if (role === "secretary") {
      countQuery = "SELECT COUNT(*) AS unreadCount FROM notifications WHERE receiver_type='secretary' AND secretary_id=? AND is_read=0";
      countParams = [id];
    } 
    else {
      countQuery = "SELECT COUNT(*) AS unreadCount FROM notifications WHERE receiver_type='user' AND user_id=? AND is_read=0";
      countParams = [id];
    }

    const [countRows] = await dbp.query(countQuery, countParams);

    res.json({ message: "Marked as read", unreadCount: countRows[0].unreadCount });

  } catch (err) {
    console.error("Error marking notification read:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ========= Admin export api ========= */
app.get("/admin/export-issues", authenticateJWT, requireRole(["admin"]), async (req, res) => {
    try {
      const { building_name, status } = req.query;

      let query =
        "SELECT issue_id, title, description, status, building_name, created_at FROM issues WHERE 1=1";
      const params = [];

      if (building_name) {
        query += " AND building_name = ?";
        params.push(building_name);
      }
      if (status) {
        query += " AND status = ?";
        params.push(status);
      }

      const [issues] = await dbp.query(query, params);
      await exportIssues(res, issues, "admin");
    } catch (err) {
      console.error("Admin export error:", err);
      res.status(500).json({ message: "Failed to export issues" });
    }
  }
);

/* ========= Secretary export api ========= */
app.get("/secretary/export-issues", authenticateJWT, requireRole(["secretary"]), async (req, res) => {
    try {
      const { status } = req.query;
      const secretaryId = req.currentUser.id;

      let query = `
        SELECT i.issue_id, i.title, i.description, i.status, i.building_name, i.created_at
        FROM issues i
        JOIN users u ON i.reporter_id = u.user_id
        WHERE u.secretary_id = ?
      `;
      const params = [secretaryId];

      if (status) {
        query += " AND i.status = ?";
        params.push(status);
      }

      const [issues] = await dbp.query(query, params);
      await exportIssues(res, issues, "secretary");
    } catch (err) {
      console.error("Secretary export error:", err);
      res.status(500).json({ message: "Failed to export issues" });
    }
  }
);

/* ========= User export api ========= */
app.get("/user/export-issues", authenticateJWT, requireRole(["user"]), async (req, res) => {
  try {
    const { status } = req.query;
    const userId = req.currentUser.id;

    let query = `
      SELECT issue_id, title, description, status, building_name, created_at
      FROM issues
      WHERE reporter_id = ?
    `;
    const params = [userId];

    if (status) {
      query += " AND status = ?";
      params.push(status);
    }

    const [issues] = await dbp.query(query, params);

    await exportIssues(res, issues, "user");
  } catch (err) {
    console.error("User export error:", err);
    res.status(500).json({ message: "Failed to export issues" });
  }
});

/* ========= Sever Start ========= */
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));