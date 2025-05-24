// use rusqlite::{params, Connection, Result};
// use chrono::{Local, NaiveDate};
// use crate::models::{StockItem, StockStats};

// pub fn insert_stock(conn: &Connection, item: &StockItem) -> Result<usize> {
//     let now = Local::now().naive_local();
//     conn.execute(
//         "INSERT INTO stock (
//             name, code, type, category, unit, qty, min_qty, target_qty,
//             sale_price, purchase_price, discount, expiry, location, remarks,
//             created_at, updated_at
//         ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16)",
//         params![
//             item.name,
//             item.code,
//             item.r#type,
//             item.category,
//             item.unit,
//             item.qty,
//             item.min_qty,
//             item.target_qty,
//             item.sale_price,
//             item.purchase_price,
//             item.discount,
//             item.expiry,
//             item.location,
//             item.remarks,
//             now,
//             now,
//         ],
//     )
// }

// pub fn update_stock(conn: &Connection, item: &StockItem) -> Result<usize> {
//     let now = Local::now().naive_local();
//     conn.execute(
//         "UPDATE stock SET 
//             name = ?1, code = ?2, type = ?3, category = ?4, unit = ?5,
//             qty = ?6, min_qty = ?7, target_qty = ?8, sale_price = ?9,
//             purchase_price = ?10, discount = ?11, expiry = ?12, 
//             location = ?13, remarks = ?14, updated_at = ?15
//         WHERE id = ?16",
//         params![
//             item.name,
//             item.code,
//             item.r#type,
//             item.category,
//             item.unit,
//             item.qty,
//             item.min_qty,
//             item.target_qty,
//             item.sale_price,
//             item.purchase_price,
//             item.discount,
//             item.expiry,
//             item.location,
//             item.remarks,
//             now,
//             item.id.unwrap(),
//         ],
//     )
// }

// pub fn delete_stock(conn: &Connection, id: i32) -> Result<usize> {
//     conn.execute("DELETE FROM stock WHERE id = ?1", params![id])
// }

// pub fn get_all_stock(conn: &Connection) -> Result<Vec<StockItem>> {
//     let mut stmt = conn.prepare(
//         "SELECT 
//             id, name, code, type, category, unit, qty, min_qty, target_qty,
//             sale_price, purchase_price, discount, expiry, location, remarks,
//             created_at, updated_at
//         FROM stock ORDER BY id DESC",
//     )?;

//     let items = stmt.query_map([], |row| {
//         Ok(StockItem {
//             id: row.get(0)?,
//             name: row.get(1)?,
//             code: row.get(2)?,
//             r#type: row.get(3)?,
//             category: row.get(4)?,
//             unit: row.get(5)?,
//             qty: row.get(6)?,
//             min_qty: row.get(7)?,
//             target_qty: row.get(8)?,
//             sale_price: row.get(9)?,
//             purchase_price: row.get(10)?,
//             discount: row.get(11)?,
//             expiry: row.get(12)?,
//             location: row.get(13)?,
//             remarks: row.get(14)?,
//             created_at: row.get(15)?,
//             updated_at: row.get(16)?,
//         })
//     })?;

//     Ok(items.filter_map(Result::ok).collect())
// }

// pub fn get_stock_stats(conn: &Connection) -> Result<StockStats> {
//     // Total items
//     let total = conn.query_row(
//         "SELECT COUNT(*) FROM stock",
//         [],
//         |row| row.get::<_, i32>(0),
//     )?;

//     // Low stock items
//     let low_stock = conn.query_row(
//         "SELECT COUNT(*) FROM stock WHERE qty < min_qty",
//         [],
//         |row| row.get::<_, i32>(0),
//     )?;

//     // Expired items
//     let expired = conn.query_row(
//         "SELECT COUNT(*) FROM stock WHERE expiry < date('now')",
//         [],
//         |row| row.get::<_, i32>(0),
//     )?;

//     Ok(StockStats {
//         total_items_registered: total,
//         low_stock_items: low_stock,
//         expired_items: expired,
//     })
// }

// pub fn upsert_stock(conn: &Connection, item: &StockItem) -> Result<usize> {
//     let now = Local::now().naive_local();
//     conn.execute(
//         "INSERT INTO stock (
//             name, code, type, category, unit, qty, min_qty, target_qty,
//             sale_price, purchase_price, discount, expiry, location, remarks,
//             created_at, updated_at
//         ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16)
//         ON CONFLICT(code) DO UPDATE SET 
//             name = excluded.name,
//             qty = excluded.qty,
//             updated_at = excluded.updated_at",
//         params![
//             item.name,
//             item.code,
//             item.r#type,
//             item.category,
//             item.unit,
//             item.qty,
//             item.min_qty,
//             item.target_qty,
//             item.sale_price,
//             item.purchase_price,
//             item.discount,
//             item.expiry,
//             item.location,
//             item.remarks,
//             now,
//             now,
//         ],
//     )
// }


use rusqlite::{params, Connection, Result};
use chrono::{Local, NaiveDate, NaiveDateTime};
use crate::models::{StockItem, StockStats};

// Helper function to convert NaiveDate to SQLite date string
fn date_to_sql(date: Option<NaiveDate>) -> Option<String> {
    date.map(|d| d.format("%Y-%m-%d").to_string())
}

// Helper function to convert NaiveDateTime to SQLite datetime string
fn datetime_to_sql(dt: NaiveDateTime) -> String {
    dt.format("%Y-%m-%d %H:%M:%S").to_string()
}

pub fn insert_stock(conn: &Connection, item: &StockItem) -> Result<usize> {
    let now = Local::now().naive_local();
    conn.execute(
        "INSERT INTO stock (
            name, code, type, category, unit, qty, min_qty, target_qty,
            sale_price, purchase_price, discount, expiry, location, remarks,
            created_at, updated_at
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16)",
        params![
            &item.name,
            &item.code,
            &item.r#type,
            &item.category,
            &item.unit,
            item.qty,
            item.min_qty,
            item.target_qty,
            item.sale_price,
            item.purchase_price,
            item.discount,
            date_to_sql(item.expiry),
            &item.location,
            &item.remarks,
            datetime_to_sql(now),
            datetime_to_sql(now),
        ],
    )
}

pub fn update_stock(conn: &Connection, item: &StockItem) -> Result<usize> {
    let now = Local::now().naive_local();
    conn.execute(
        "UPDATE stock SET 
            name = ?1, code = ?2, type = ?3, category = ?4, unit = ?5,
            qty = ?6, min_qty = ?7, target_qty = ?8, sale_price = ?9,
            purchase_price = ?10, discount = ?11, expiry = ?12, 
            location = ?13, remarks = ?14, updated_at = ?15
        WHERE id = ?16",
        params![
            &item.name,
            &item.code,
            &item.r#type,
            &item.category,
            &item.unit,
            item.qty,
            item.min_qty,
            item.target_qty,
            item.sale_price,
            item.purchase_price,
            item.discount,
            date_to_sql(item.expiry),
            &item.location,
            &item.remarks,
            datetime_to_sql(now),
            item.id.unwrap(),
        ],
    )
}

pub fn delete_stock(conn: &Connection, id: i32) -> Result<usize> {
    conn.execute("DELETE FROM stock WHERE id = ?1", params![id])
}

pub fn get_all_stock(conn: &Connection) -> Result<Vec<StockItem>> {
    let mut stmt = conn.prepare(
        "SELECT 
            id, name, code, type, category, unit, qty, min_qty, target_qty,
            sale_price, purchase_price, discount, expiry, location, remarks,
            created_at, updated_at
        FROM stock ORDER BY id DESC",
    )?;

    let items = stmt.query_map([], |row| {
        let expiry: Option<String> = row.get(12)?;
        let expiry_date = expiry.and_then(|s| NaiveDate::parse_from_str(&s, "%Y-%m-%d").ok());
        
        let created_at: String = row.get(15)?;
        let updated_at: String = row.get(16)?;
        
        Ok(StockItem {
            id: row.get(0)?,
            name: row.get(1)?,
            code: row.get(2)?,
            r#type: row.get(3)?,
            category: row.get(4)?,
            unit: row.get(5)?,
            qty: row.get(6)?,
            min_qty: row.get(7)?,
            target_qty: row.get(8)?,
            sale_price: row.get(9)?,
            purchase_price: row.get(10)?,
            discount: row.get(11)?,
            expiry: expiry_date,
            location: row.get(13)?,
            remarks: row.get(14)?,
            created_at: NaiveDateTime::parse_from_str(&created_at, "%Y-%m-%d %H:%M:%S").ok(),
            updated_at: NaiveDateTime::parse_from_str(&updated_at, "%Y-%m-%d %H:%M:%S").ok(),
        })
    })?;

    Ok(items.filter_map(Result::ok).collect())
}

pub fn get_stock_stats(conn: &Connection) -> Result<StockStats> {
    // Total items
    let total = conn.query_row(
        "SELECT COUNT(*) FROM stock",
        [],
        |row| row.get::<_, i32>(0),
    )?;

    // Low stock items
    let low_stock = conn.query_row(
        "SELECT COUNT(*) FROM stock WHERE qty < min_qty",
        [],
        |row| row.get::<_, i32>(0),
    )?;

    // Expired items
    let expired = conn.query_row(
        "SELECT COUNT(*) FROM stock WHERE expiry < date('now')",
        [],
        |row| row.get::<_, i32>(0),
    )?;

    Ok(StockStats {
        total_items_registered: total,
        low_stock_items: low_stock,
        expired_items: expired,
    })
}

pub fn upsert_stock(conn: &Connection, item: &StockItem) -> Result<usize> {
    let now = Local::now().naive_local();
    conn.execute(
        "INSERT INTO stock (
            name, code, type, category, unit, qty, min_qty, target_qty,
            sale_price, purchase_price, discount, expiry, location, remarks,
            created_at, updated_at
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16)
        ON CONFLICT(code) DO UPDATE SET 
            name = excluded.name,
            qty = excluded.qty,
            updated_at = excluded.updated_at",
        params![
            &item.name,
            &item.code,
            &item.r#type,
            &item.category,
            &item.unit,
            item.qty,
            item.min_qty,
            item.target_qty,
            item.sale_price,
            item.purchase_price,
            item.discount,
            date_to_sql(item.expiry),
            &item.location,
            &item.remarks,
            datetime_to_sql(now),
            datetime_to_sql(now),
        ],
    )
}