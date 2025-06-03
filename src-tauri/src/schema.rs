pub const CREATE_TABLES: &[&str] = &[
    r#"
      CREATE TABLE IF NOT EXISTS cart (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        stock_id INTEGER NOT NULL,
        invoice_id INTEGER NOT NULL,
        qty REAL NOT NULL,
        price REAL NOT NULL,
        discount REAL DEFAULT 0,
        FOREIGN KEY (stock_id) REFERENCES stock(id),
        FOREIGN KEY (invoice_id) REFERENCES invoices(id)
    );
    "#,
    r#"
    CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
    );
    "#,
    r#"
    CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_no TEXT NOT NULL,
        reference TEXT NOT NULL,
        type TEXT NOT NULL,
        date DATE NOT NULL,
        discount REAL DEFAULT 0,
        received REAL NOT NULL,
        tax REAL DEFAULT 0,
        remarks TEXT,
        person_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    "#,
    r#"
    CREATE TABLE IF NOT EXISTS locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
    );
    "#,
    r#"
    CREATE TABLE IF NOT EXISTS persons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        contact TEXT NOT NULL UNIQUE,
        account TEXT,
        address TEXT NOT NULL,
        remarks TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    "#,
    r#"
    CREATE TABLE IF NOT EXISTS roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
    );
    "#,
    r#"
    CREATE TABLE IF NOT EXISTS shop (
        id INTEGER PRIMARY KEY,
        name TEXT,
        description TEXT,
        contact TEXT,
        email TEXT,
        website TEXT,
        address TEXT,
        image BLOB
    );
    "#,
    r#"
    CREATE TABLE IF NOT EXISTS stock (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        code TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL,
        category TEXT NOT NULL,
        unit TEXT NOT NULL,
        qty INTEGER NOT NULL,
        min_qty INTEGER NOT NULL,
        target_qty INTEGER NOT NULL,
        sale_price REAL NOT NULL,
        purchase_price REAL NOT NULL,
        discount REAL DEFAULT 0,
        expiry DATE NOT NULL,
        location TEXT NOT NULL,
        remarks TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    "#,
    r#"
    CREATE TABLE IF NOT EXISTS types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
    );
    "#,
    r#"
    CREATE TABLE IF NOT EXISTS units (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
    );
    "#,
    r#"
     CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  token TEXT NOT NULL,
  is_active BOOLEAN DEFAULT 1
);
    "#,
    r#"
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        email TEXT NOT NULL,
        password TEXT NOT NULL,
        image BLOB,
        status INTEGER,
        person_id INTEGER,
         first_login BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    "#,
];
