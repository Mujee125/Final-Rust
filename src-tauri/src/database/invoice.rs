// database/invoice.rs
use rusqlite::{params, Connection, Result};

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
     conn.execute("DELETE FROM cart WHERE invoice_id = ?1", params![id])?;
    conn.execute("DELETE FROM invoices WHERE id = ?1", params![id])
}

// pub fn get_all_invoices(conn: &Connection) -> Result<Vec<Invoice>> {
//     let mut stmt = conn.prepare(
//         "SELECT 
//         invoices.id,
//         invoices.invoice_no,
//         invoices.type,
//         invoices.date,
//         invoices.discount,
//         invoices.received,
//         invoices.tax,
//         invoices.remarks,
//         persons.name AS person,
//         users.username AS user,
//         COUNT(cart.id) AS items,
//         SUM(cart.qty * cart.price - cart.discount) AS subtotal,
//         (SUM(cart.qty * cart.price - cart.discount) * (invoices.discount / 100)) AS discount_amount,
//         ((SUM(cart.qty * cart.price - cart.discount) - 
//           (SUM(cart.qty * cart.price - cart.discount) * (invoices.discount / 100))) * 
//          (invoices.tax / 100)) AS tax_amount,
//         (((SUM(cart.qty * cart.price - cart.discount) - 
//           (SUM(cart.qty * cart.price - cart.discount) * (invoices.discount / 100))) + 
//           ((SUM(cart.qty * cart.price - cart.discount) - 
//             (SUM(cart.qty * cart.price - cart.discount) * (invoices.discount / 100))) * 
//            (invoices.tax / 100)))) AS total
//     FROM invoices
//     INNER JOIN persons ON persons.id = invoices.person_id
//     JOIN cart ON cart.invoice_id = invoices.id
//     JOIN users ON invoices.user_id = users.id
//     JOIN stock ON cart.stock_id = stock.id
//     GROUP BY
//         invoices.id,
//         invoices.invoice_no,
//         invoices.type,
//         invoices.date,
//         invoices.discount,
//         invoices.received,
//         invoices.tax,
//         invoices.remarks,
//         persons.name,
//         users.username
//     ORDER BY invoices.id DESC",
//     )?;

//     let invoices = stmt.query_map([], |row| {
//         let date: String = row.get(3)?;
//         let date = NaiveDate::parse_from_str(&date, "%Y-%m-%d").unwrap();
        
//         Ok(Invoice {
//             id: row.get(0)?,
//             invoice_no: row.get(1)?,
//             r#type: row.get(2)?,
//             date,
//             person_id: 0, // Will be set from join
//             discount_amount: row.get(12)?,
//             tax_amount: row.get(13)?,
//             received: row.get(5)?,
//             user_id: 0, // Will be set from join
//             discount: row.get(4)?,
//             tax: row.get(6)?,
//             remarks: row.get(7)?,
//             subtotal: row.get(11)?,
//             total: row.get(14)?,
//             items: row.get(10)?,
//         })
//     })?;

//     Ok(invoices.filter_map(Result::ok).collect())
// }

pub fn get_all_invoices(conn: &Connection) -> Result<Vec<Invoice>> {
    // let mut stmt = conn.prepare(
    //     r#"
    //     SELECT 
    //         i.id,
    //         i.invoice_no,
    //         i.type,
    //         i.date,
    //         p.name AS person,
    //         i.discount,
    //         i.received,
    //         i.tax,
    //         i.remarks,
    //         u.username AS user,
    //         COUNT(c.id) AS items,
    //         SUM(c.qty * c.price - c.discount) AS subtotal,
    //         (SUM(c.qty * c.price - c.discount) * (i.discount / 100)) AS discount_amount,
    //         (
    //             (SUM(c.qty * c.price - c.discount) - 
    //             (SUM(c.qty * c.price - c.discount) * (i.discount / 100)))
    //         ) * (i.tax / 100) AS tax_amount,
    //         (
    //             (SUM(c.qty * c.price - c.discount) - 
    //             (SUM(c.qty * c.price - c.discount) * (i.discount / 100)) + 
    //             (
    //                 (SUM(c.qty * c.price - c.discount) - 
    //                 (SUM(c.qty * c.price - c.discount) * (i.discount / 100)) * 
    //                 (i.tax / 100)
    //         ) AS total
    //     FROM invoices i
    //     INNER JOIN persons p ON p.id = i.person_id
    //     JOIN cart c ON c.invoice_id = i.id
    //     JOIN users u ON i.user_id = u.id
    //     JOIN stock s ON c.stock_id = s.id
    //     GROUP BY
    //         i.id,
    //         i.invoice_no,
    //         i.type,
    //         i.date,
    //         i.discount,
    //         i.received,
    //         i.tax,
    //         i.remarks,
    //         p.name,
    //         u.username
    //     ORDER BY i.id DESC
    //     "#,
    // )?;
    let mut stmt = conn.prepare(
        r#"
        SELECT 
            i.id,
            i.invoice_no,
            i.type,
            i.date,
            p.name AS person,
            i.discount,
            i.received,
            i.tax,
            i.remarks,
            u.username AS user,
            COUNT(c.id) AS items,
            SUM(c.qty * c.price - c.discount) AS subtotal,
            (SUM(c.qty * c.price - c.discount) * (i.discount / 100.0)) AS discount_amount,
            (
                (SUM(c.qty * c.price - c.discount) - 
                (SUM(c.qty * c.price - c.discount) * (i.discount / 100.0)))
            ) * (i.tax / 100.0) AS tax_amount,
            (
                (
                    SUM(c.qty * c.price - c.discount) - 
                    (SUM(c.qty * c.price - c.discount) * (i.discount / 100.0))
                ) + 
                (
                    (
                        SUM(c.qty * c.price - c.discount) - 
                        (SUM(c.qty * c.price - c.discount) * (i.discount / 100.0))
                    ) * (i.tax / 100.0)
                )
            ) AS total
        FROM invoices i
        INNER JOIN persons p ON p.id = i.person_id
        JOIN cart c ON c.invoice_id = i.id
        JOIN users u ON i.user_id = u.id
        JOIN stock s ON c.stock_id = s.id
        GROUP BY
            i.id,
            i.invoice_no,
            i.type,
            i.date,
            i.discount,
            i.received,
            i.tax,
            i.remarks,
            p.name,
            u.username
        ORDER BY i.id DESC
        "#
    )?;
    
    let invoices = stmt.query_map([], |row| {
        Ok(Invoice {
            id: row.get(0)?,
            invoice_no: row.get(1)?,
            invoice_type: row.get(2)?,
            date: row.get::<_, String>(3)?,  // Directly get as String
            person: row.get(4)?,
            discount_amount: row.get(12)?,
            tax_amount: row.get(13)?,
            received: row.get::<_, f64>(6)?.to_string(),  // Convert to String
            user: row.get(9)?,
            discount: row.get(5)?,
            tax: row.get(7)?,
            remarks: row.get(8)?,
            subtotal: row.get(11)?,
            total: row.get(14)?,
            items: row.get(10)?,
        })
    })?;

    Ok(invoices.filter_map(Result::ok).collect())
}

// pub fn get_invoice_by_id(conn: &Connection, invoice_id: i32) -> Result<FullInvoice, rusqlite::Error> {
//     let mut stmt = conn.prepare(
//         r#"
//         SELECT 
//             id, invoice_no, reference, type, date, discount, received, tax,
//             remarks, person_id, user_id, created_at, updated_at
//         FROM invoices
//         WHERE id = ?
//         "#
//     )?;

//     let invoice = stmt.query_row(params![invoice_id], |row| {
//         Ok((
//             row.get::<_, i32>(0)?,
//             row.get::<_, String>(1)?,
//             row.get::<_, String>(2)?,
//             row.get::<_, String>(3)?,
//             row.get::<_, String>(4)?,
//             row.get::<_, f64>(5)?,
//             row.get::<_, f64>(6)?,
//             row.get::<_, f64>(7)?,
//             row.get::<_, Option<String>>(8)?,
//             row.get::<_, i32>(9)?,
//             row.get::<_, i32>(10)?,
//             row.get::<_, String>(11)?,
//             row.get::<_, String>(12)?,
//         ))
//     })?;

//     let mut item_stmt = conn.prepare(
//         r#"
//         SELECT s.name, s.code, c.qty, c.price, c.discount,
//                (c.qty * c.price) - c.discount AS subtotal
//         FROM cart c
//         JOIN stock s ON s.id = c.stock_id
//         WHERE c.invoice_id = ?
//         "#
//     )?;

//     let items: Vec<FullInvoiceItem> = item_stmt
//         .query_map(params![invoice_id], |row| {
//             Ok(FullInvoiceItem {
//                 name: row.get(0)?,
//                 code: row.get(1)?,
//                 qty: row.get(2)?,
//                 price: row.get(3)?,
//                 discount: row.get(4)?,
//                 subtotal: row.get(5)?,
//             })
//         })?
//         .collect::<Result<_, _>>()?;

//     let total: f64 = items.iter().map(|item| item.subtotal).sum();
//     let net = total - invoice.5 + invoice.7;

//     Ok(FullInvoice {
//         id: invoice.0,
//         invoice_no: invoice.1,
//         reference: invoice.2,
//         type_: invoice.3,
//         date: invoice.4,
//         discount: invoice.5,
//         received: invoice.6,
//         tax: invoice.7,
//         remarks: invoice.8,
//         person_id: invoice.9,
//         user_id: invoice.10,
//         created_at: invoice.11,
//         updated_at: invoice.12,
//         total,
//         net,
//         items,
//     })
// }



// pub fn get_invoice_by_id(conn: &Connection, invoice_id: i32) -> Result<FullInvoice, rusqlite::Error> {
//     // Get invoice with person and user names
//     let mut stmt = conn.prepare(
//         r#"
//         SELECT 
//             i.id, 
//             i.invoice_no, 
//             i.type, 
//             i.date, 
//             p.name as person_name,
//             i.discount as discount_amount,
//             i.tax as tax_amount,
//             i.received,
//             u.username as user_name,
//             i.remarks
//         FROM invoices i
//         JOIN persons p ON i.person_id = p.id
//         JOIN users u ON i.user_id = u.id
//         WHERE i.id = ?
//         "#
//     )?;

//     let invoice = stmt.query_row(params![invoice_id], |row| {
//         Ok((
//             row.get::<_, i32>(0)?,
//             row.get::<_, String>(1)?,
//             row.get::<_, String>(2)?,
//             row.get::<_, String>(3)?,
//             row.get::<_, String>(4)?,
//             row.get::<_, f64>(5)?,
//             row.get::<_, f64>(6)?,
//             row.get::<_, f64>(7)?,
//             row.get::<_, String>(8)?,
//             row.get::<_, Option<String>>(9)?,
//         ))
//     })?;

//     // Get invoice items
//     let mut item_stmt = conn.prepare(
//         r#"
//         SELECT 
//             s.name, 
//             s.category,
//             s.unit,
//             c.qty, 
//             c.price, 
//             c.discount
//         FROM cart c
//         JOIN stock s ON s.id = c.stock_id
//         WHERE c.invoice_id = ?
//         "#
//     )?;

//     let items: Vec<FullInvoiceItem> = item_stmt
//         .query_map(params![invoice_id], |row| {
//             Ok(FullInvoiceItem {
//                 name: row.get(0)?,
//                 category: row.get(1)?,
//                 unit: row.get(2)?,
//                 qty: row.get(3)?,
//                 price: row.get(4)?,
//                 discount: row.get(5)?,
//             })
//         })?
//         .collect::<Result<_, _>>()?;

//     // Calculate total
//     let total: f64 = items.iter()
//         .map(|item| (item.qty * item.price) - item.discount)
//         .sum();

//     Ok(FullInvoice {
//         id: invoice.0,
//         invoice_no: invoice.1,
//         invoice_type: invoice.2,
//         date: invoice.3,
//         person: invoice.4,
//         discount_amount: invoice.5,
//         tax_amount: invoice.6,
//         received: invoice.7,
//         user: invoice.8,
//         remarks: invoice.9,
//         items,
//         total,
//     })
// }




use crate::models::InvoiceItem;

pub fn get_invoice_items_by_invoice_id(conn: &Connection, invoice_id: i32) -> Result<Vec<InvoiceItem>, rusqlite::Error> {
    let mut stmt = conn.prepare(
        r#"
        SELECT 
            c.id,
            s.name,
            s.category,
            s.unit,
            c.qty,
            c.price,
            c.discount
        FROM cart c
        JOIN stock s ON s.id = c.stock_id
        WHERE c.invoice_id = ?
        "#
    )?;

    let items: Vec<InvoiceItem> = stmt
        .query_map(params![invoice_id], |row| {
            Ok(InvoiceItem {
                id: Some(row.get(0)?),
                invoice_id: Some(invoice_id),
                stock_id: None,
                name: row.get(1)?,
                category: row.get(2)?,
                unit: row.get(3)?,
                qty: row.get(4)?,
                price: row.get(5)?,
                discount: row.get(6)?,
            })
        })?
        .collect::<Result<_, _>>()?;

    Ok(items)
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



pub fn get_invoice_by_id(conn: &Connection, invoice_id: i32) -> Result<FullInvoice, rusqlite::Error> {
    // Fetch the invoice with person and user names
    let mut stmt = conn.prepare(
        r#"
        SELECT 
            i.id, 
            i.invoice_no, 
            i.reference,
            i.type, 
            i.date, 
            i.discount, 
            i.received, 
            i.tax, 
            i.remarks, 
            i.person_id, 
            p.name as person_name,
            i.user_id, 
            u.username as user_name
        FROM invoices i
        JOIN persons p ON i.person_id = p.id
        JOIN users u ON i.user_id = u.id
        WHERE i.id = ?
        "#
    )?;

    let invoice = stmt.query_row(params![invoice_id], |row| {
        Ok((
            row.get::<_, i32>(0)?,           // id
            row.get::<_, String>(1)?,        // invoice_no
            row.get::<_, String>(2)?,        // reference
            row.get::<_, String>(3)?,        // type
            row.get::<_, String>(4)?,        // date
            row.get::<_, f64>(5)?,           // discount
            row.get::<_, f64>(6)?,           // received
            row.get::<_, f64>(7)?,           // tax
            row.get::<_, String>(8)?,        // remarks
            row.get::<_, i32>(9)?,           // person_id
            row.get::<_, String>(10)?,       // person_name
            row.get::<_, i32>(11)?,          // user_id
            row.get::<_, String>(12)?,       // user_name
        ))
    })?;

    // Fetch the items for this invoice
    let mut item_stmt = conn.prepare(
        r#"
        SELECT 
            s.name, 
            s.category,
            s.unit,
            c.qty, 
            c.price, 
            c.discount
        FROM cart c
        JOIN stock s ON s.id = c.stock_id
        WHERE c.invoice_id = ?
        "#
    )?;

    let items: Vec<FullInvoiceItem> = item_stmt
        .query_map(params![invoice_id], |row| {
            Ok(FullInvoiceItem {
                name: row.get(0)?,
                category: row.get(1)?,
                unit: row.get(2)?,
                qty: row.get(3)?,
                price: row.get(4)?,
                discount: row.get(5)?,
            })
        })?
        .collect::<Result<_, _>>()?;

    // Calculate total, discount_amount, tax_amount, net
    let total: f64 = items.iter()
        .map(|item| (item.qty * item.price) - item.discount)
        .sum();
    let discount_amount = (total * invoice.5) / 100.0;
    let tax_amount = ((total - discount_amount) * invoice.7) / 100.0;
    let net = total - discount_amount + tax_amount;

    Ok(FullInvoice {
        id: Some(invoice.0),
        invoice_no: invoice.1,
        reference: invoice.2,
        invoice_type: invoice.3,
        date: invoice.4,
        discount: invoice.5,
        received: invoice.6,
        tax: invoice.7,
        remarks: invoice.8,
        person_id: invoice.9,
        person: invoice.10,
        user_id: invoice.11,
        user: invoice.12,
        total,
        discount_amount,
        tax_amount,
        net,
        items,
        // Add any other fields as needed
    })
}