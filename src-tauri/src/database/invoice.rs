// database/invoice.rs
use rusqlite::{params, Connection, Result};
use chrono::{NaiveDate};
use crate::models::{Invoice, FullInvoice, FullInvoiceItem};

// Helper functions for date conversion
// fn date_to_sql(date: NaiveDate) -> String {
//     date.format("%Y-%m-%d").to_string()
// }

// fn datetime_to_sql(dt: NaiveDateTime) -> String {
//     dt.format("%Y-%m-%d %H:%M:%S").to_string()
// }

// pub fn insert_invoice(conn: &Connection, invoice: &Invoice) -> Result<i32> {
//     let now = Local::now().naive_local();
//     conn.execute(
//         "INSERT INTO invoices (
//             invoice_no, type, date, person_id, discount_amount, 
//             tax_amount, received, user_id, discount, tax, remarks
//         ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
//         params![
//             &invoice.invoice_no,
//             &invoice.r#type,
//             date_to_sql(invoice.date),
//             invoice.person_id,
//             invoice.discount_amount,
//             invoice.tax_amount,
//             invoice.received,
//             invoice.user_id,
//             invoice.discount,
//             invoice.tax,
//             &invoice.remarks,
//         ],
//     )?;
    
//     Ok(conn.last_insert_rowid() as i32)
// }

// pub fn update_invoice(conn: &Connection, invoice: &Invoice) -> Result<usize> {
//     conn.execute(
//         "UPDATE invoices SET 
//             invoice_no = ?1, type = ?2, date = ?3, person_id = ?4, 
//             discount_amount = ?5, tax_amount = ?6, received = ?7, 
//             user_id = ?8, discount = ?9, tax = ?10, remarks = ?11
//         WHERE id = ?12",
//         params![
//             &invoice.invoice_no,
//             &invoice.r#type,
//             date_to_sql(invoice.date),
//             invoice.person_id,
//             invoice.discount_amount,
//             invoice.tax_amount,
//             invoice.received,
//             invoice.user_id,
//             invoice.discount,
//             invoice.tax,
//             &invoice.remarks,
//             invoice.id.unwrap(),
//         ],
//     )
// }

pub fn delete_invoice(conn: &Connection, id: i32) -> Result<usize> {
    conn.execute("DELETE FROM invoices WHERE id = ?1", params![id])
}

pub fn get_all_invoices(conn: &Connection) -> Result<Vec<Invoice>> {
    let mut stmt = conn.prepare(
        "SELECT 
        invoices.id,
        invoices.invoice_no,
        invoices.type,
        invoices.date,
        invoices.discount,
        invoices.received,
        invoices.tax,
        invoices.remarks,
        persons.name AS person,
        users.username AS user,
        COUNT(cart.id) AS items,
        SUM(cart.qty * cart.price - cart.discount) AS subtotal,
        (SUM(cart.qty * cart.price - cart.discount) * (invoices.discount / 100)) AS discount_amount,
        ((SUM(cart.qty * cart.price - cart.discount) - 
          (SUM(cart.qty * cart.price - cart.discount) * (invoices.discount / 100))) * 
         (invoices.tax / 100)) AS tax_amount,
        (((SUM(cart.qty * cart.price - cart.discount) - 
          (SUM(cart.qty * cart.price - cart.discount) * (invoices.discount / 100))) + 
          ((SUM(cart.qty * cart.price - cart.discount) - 
            (SUM(cart.qty * cart.price - cart.discount) * (invoices.discount / 100))) * 
           (invoices.tax / 100)))) AS total
    FROM invoices
    INNER JOIN persons ON persons.id = invoices.person_id
    JOIN cart ON cart.invoice_id = invoices.id
    JOIN users ON invoices.user_id = users.id
    JOIN stock ON cart.stock_id = stock.id
    GROUP BY
        invoices.id,
        invoices.invoice_no,
        invoices.type,
        invoices.date,
        invoices.discount,
        invoices.received,
        invoices.tax,
        invoices.remarks,
        persons.name,
        users.username
    ORDER BY invoices.id DESC",
    )?;

    let invoices = stmt.query_map([], |row| {
        let date: String = row.get(3)?;
        let date = NaiveDate::parse_from_str(&date, "%Y-%m-%d").unwrap();
        
        Ok(Invoice {
            id: row.get(0)?,
            invoice_no: row.get(1)?,
            r#type: row.get(2)?,
            date,
            person_id: 0, // Will be set from join
            discount_amount: row.get(12)?,
            tax_amount: row.get(13)?,
            received: row.get(5)?,
            user_id: 0, // Will be set from join
            discount: row.get(4)?,
            tax: row.get(6)?,
            remarks: row.get(7)?,
            subtotal: row.get(11)?,
            total: row.get(14)?,
            items: row.get(10)?,
        })
    })?;

    Ok(invoices.filter_map(Result::ok).collect())
}

pub fn get_invoice_by_id(conn: &Connection, invoice_id: i32) -> Result<FullInvoice, rusqlite::Error> {
    let mut stmt = conn.prepare(
        r#"
        SELECT 
            id, invoice_no, reference, type, date, discount, received, tax,
            remarks, person_id, user_id, created_at, updated_at
        FROM invoices
        WHERE id = ?
        "#
    )?;

    let invoice = stmt.query_row(params![invoice_id], |row| {
        Ok((
            row.get::<_, i32>(0)?,
            row.get::<_, String>(1)?,
            row.get::<_, String>(2)?,
            row.get::<_, String>(3)?,
            row.get::<_, String>(4)?,
            row.get::<_, f64>(5)?,
            row.get::<_, f64>(6)?,
            row.get::<_, f64>(7)?,
            row.get::<_, Option<String>>(8)?,
            row.get::<_, i32>(9)?,
            row.get::<_, i32>(10)?,
            row.get::<_, String>(11)?,
            row.get::<_, String>(12)?,
        ))
    })?;

    let mut item_stmt = conn.prepare(
        r#"
        SELECT s.name, s.code, c.qty, c.price, c.discount,
               (c.qty * c.price) - c.discount AS subtotal
        FROM cart c
        JOIN stock s ON s.id = c.stock_id
        WHERE c.invoice_id = ?
        "#
    )?;

    let items: Vec<FullInvoiceItem> = item_stmt
        .query_map(params![invoice_id], |row| {
            Ok(FullInvoiceItem {
                name: row.get(0)?,
                code: row.get(1)?,
                qty: row.get(2)?,
                price: row.get(3)?,
                discount: row.get(4)?,
                subtotal: row.get(5)?,
            })
        })?
        .collect::<Result<_, _>>()?;

    let total: f64 = items.iter().map(|item| item.subtotal).sum();
    let net = total - invoice.5 + invoice.7;

    Ok(FullInvoice {
        id: invoice.0,
        invoice_no: invoice.1,
        reference: invoice.2,
        type_: invoice.3,
        date: invoice.4,
        discount: invoice.5,
        received: invoice.6,
        tax: invoice.7,
        remarks: invoice.8,
        person_id: invoice.9,
        user_id: invoice.10,
        created_at: invoice.11,
        updated_at: invoice.12,
        total,
        net,
        items,
    })
}





// pub fn get_invoice_with_items(conn: &Connection, id: i32) -> Result<InvoiceWithItems> {
//     // Get invoice
//     let mut stmt = conn.prepare(
//         "SELECT 
//             id, invoice_no, type, date, person_id,
//             received, user_id, 
//             discount, tax, remarks
//         FROM invoices WHERE id = ?1",
//     )?;
    
//     let invoice = stmt.query_row(params![id], |row| {
//         let date: String = row.get(3)?;
//         let date = NaiveDate::parse_from_str(&date, "%Y-%m-%d").unwrap();
        
//         Ok(Invoice {
//             id: row.get(0)?,
//             invoice_no: row.get(1)?,
//             r#type: row.get(2)?,
//             date,
//             person_id: row.get(4)?,
//             discount_amount: 0.0,
//             tax_amount: 0.0,
//             received: row.get(5)?,
//             user_id: row.get(6)?,
//             discount: row.get(7)?,
//             tax: row.get(8)?,
//             remarks: row.get(9)?,
//             subtotal: None,
//             total: None,
//             items: None,
//         })
//     })?;

//     // Get items
//     let mut stmt = conn.prepare(
//         "SELECT 
//             cart.id,
//             stock.name,
//             stock.category,
//             stock.unit,
//             cart.qty,
//             cart.price,
//             cart.discount
//         FROM cart
//         JOIN stock ON stock.id = cart.stock_id
//         WHERE cart.invoice_id = ?1",
//     )?;

//     let items = stmt.query_map(params![id], |row| {
//         Ok(InvoiceItem {
//             id: row.get(0)?,
//             invoice_id: Some(id),
//             stock_id: None,
//             name: row.get(1)?,
//             category: row.get(2)?,
//             unit: row.get(3)?,
//             qty: row.get(4)?,
//             price: row.get(5)?,
//             discount: row.get(6)?,
//         })
//     })?.filter_map(Result::ok).collect();

//     Ok(InvoiceWithItems { invoice, items })
// }

// pub fn get_invoice_stats(conn: &Connection) -> Result<InvoiceStats> {
//     // Total invoices
//     let total_invoices = conn.query_row(
//         "SELECT COUNT(*) FROM invoices",
//         [],
//         |row| row.get::<_, i32>(0),
//     )?;

//     // Total sales
//     let total_sales = conn.query_row(
//         "SELECT COALESCE(SUM(total), 0) FROM (
//             SELECT ((SUM(cart.qty * cart.price - cart.discount) - 
//                    (SUM(cart.qty * cart.price - cart.discount) * (invoices.discount / 100))) + 
//                    (((SUM(cart.qty * cart.price - cart.discount) - 
//                    (SUM(cart.qty * cart.price - cart.discount) * (invoices.discount / 100))) * 
//                    (invoices.tax / 100)))) AS total
//             FROM invoices
//             JOIN cart ON cart.invoice_id = invoices.id
//             WHERE invoices.type = 'sale'
//             GROUP BY invoices.id
//         )",
//         [],
//         |row| row.get::<_, f64>(0),
//     )?;

//     // Total purchases
//     let total_purchases = conn.query_row(
//         "SELECT COALESCE(SUM(total), 0) FROM (
//             SELECT ((SUM(cart.qty * cart.price - cart.discount) - 
//                    (SUM(cart.qty * cart.price - cart.discount) * (invoices.discount / 100))) + 
//                    (((SUM(cart.qty * cart.price - cart.discount) - 
//                    (SUM(cart.qty * cart.price - cart.discount) * (invoices.discount / 100))) * 
//                    (invoices.tax / 100)))) AS total
//             FROM invoices
//             JOIN cart ON cart.invoice_id = invoices.id
//             WHERE invoices.type = 'purchase'
//             GROUP BY invoices.id
//         )",
//         [],
//         |row| row.get::<_, f64>(0),
//     )?;

//     Ok(InvoiceStats {
//         total_invoices,
//         total_sales,
//         total_purchases,
//     })
// }

// pub fn delete_invoice_with_items(conn: &Connection, id: i32) -> Result<usize> {
//     // Start transaction
//     conn.execute("BEGIN TRANSACTION", [])?;

//     // Delete cart items first
//     conn.execute("DELETE FROM cart WHERE invoice_id = ?1", params![id])?;

//     // Then delete the invoice
//     let result = conn.execute("DELETE FROM invoices WHERE id = ?1", params![id])?;

//     // Commit transaction
//     conn.execute("COMMIT", [])?;

//     Ok(result)
// }