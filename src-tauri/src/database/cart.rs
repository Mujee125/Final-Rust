use rusqlite::{params, Connection, Result};

use crate::models::*;

pub fn insert_cart_item(conn: &Connection, item: &CartItem) -> Result<usize> {
    conn.execute(
        "INSERT INTO cart (stock_id, invoice_id, qty, price, discount) 
         VALUES (?1, ?2, ?3, ?4, ?5)",
        params![
            item.stock_id,
            item.invoice_id,
            item.qty,
            item.price,
            item.discount
        ],
    )
}

// pub fn update_cart_item(conn: &Connection, item: &CartItem) -> Result<usize> {
//     conn.execute(
//         "UPDATE cart SET qty = ?1, price = ?2, discount = ?3 
//          WHERE id = ?4",
//         params![item.qty, item.price, item.discount, item.id],
//     )
// }



pub fn get_cart_items(conn: &Connection, invoice_id: i32) -> Result<Vec<Product>> {
    let mut stmt = conn.prepare(
        "SELECT 
            c.id, s.id as stock_id, c.qty, c.price, s.code, s.name, 
            s.category, s.unit, s.location, s.sale_price, s.purchase_price,
            (c.qty * c.price) as total
         FROM cart c
         JOIN stock s ON c.stock_id = s.id
         WHERE c.invoice_id = ?1",
    )?;

    let items = stmt.query_map(params![invoice_id], |row| {
        Ok(Product {
            id: row.get(0)?,
            code: row.get(4)?,
            name: row.get(5)?,
            category: row.get(6)?,
            unit: row.get(7)?,
            qty: row.get(2)?,
            price: row.get(3)?,
            sale_price: row.get(9)?,
            purchase_price: row.get(10)?,
            location: row.get(8)?,
            min_qty: None,
            expiry: None,
            is_dangerous: None,
            discount: None,
            total: row.get(11)?,
        })
    })?;

    Ok(items.filter_map(Result::ok).collect())
}





pub fn create_invoice(conn: &Connection, invoice: &CartInvoice) -> Result<i32> {
    conn.execute(
        "INSERT INTO invoices (
            invoice_no, reference, type, date, discount, tax, 
            received, remarks, person_id, user_id
         ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
        params![
            invoice.invoice_no,
            invoice.reference,
            invoice.invoice_type,
            invoice.date,
            invoice.discount,
            invoice.tax,
            invoice.received,
            invoice.remarks,
            invoice.person_id,
            invoice.user_id,
        ],
    )?;
    Ok(conn.last_insert_rowid() as i32)
}

pub fn update_invoice(conn: &Connection, invoice: &CartInvoice) -> Result<usize> {
    conn.execute(
        "UPDATE invoices SET \
            reference = ?1, discount = ?2, tax = ?3, received = ?4, remarks = ?5, person_id = ?6\
         WHERE id = ?7",
        params![
            invoice.reference,
            invoice.discount,
            invoice.tax,
            invoice.received,
            invoice.remarks,
            invoice.person_id,
            invoice.id.unwrap(),
        ],
    )
}

pub fn get_recent_invoices(conn: &Connection) -> Result<Vec<RecentInvoice>> {
    let mut stmt = conn.prepare(
        "SELECT
            i.id, i.invoice_no, i.type, i.date, p.name as person,
            SUM(c.qty * c.price) as total
         FROM invoices i
         LEFT JOIN persons p ON i.person_id = p.id
         LEFT JOIN cart c ON i.id = c.invoice_id
         GROUP BY i.id
         ORDER BY i.date DESC",
    )?;

    let invoices = stmt.query_map([], |row| {
        Ok(RecentInvoice {
            id: row.get(0)?,
            invoice_no: row.get(1)?,
            invoice_type: row.get(2)?,
            date: row.get(3)?,
            person: row.get(4)?,
            total: row.get(5)?,
        })
    })?;

    Ok(invoices.filter_map(Result::ok).collect())
}

pub fn calculate_cart_summary(conn: &Connection, invoice_id: i32) -> Result<CartSummary> {
    // Calculate total
    // let total: f64 = conn.query_row(
    //     "SELECT SUM(qty * price) FROM cart WHERE invoice_id = ?1",
    //     params![invoice_id],
    //     |row| row.get(0),
    // )?;
let total: f64 = conn.query_row(
    "SELECT SUM(qty * price) FROM cart WHERE invoice_id = ?1",
    params![invoice_id],
    |row| {
        let val: Option<f64> = row.get(0)?;
        Ok(val.unwrap_or(0.0))
    },
)?;
    // Get invoice details
    let invoice: CartInvoice = conn.query_row(
        "SELECT discount, tax, received FROM invoices WHERE id = ?1",
        params![invoice_id],
        |row| {
            Ok(CartInvoice {
                id: Some(invoice_id),
                invoice_no: String::new(),
                reference: String::new(),
                invoice_type: String::new(),
                date: String::new(),
                discount: row.get(0)?,
                tax: row.get(1)?,
                received: row.get(2)?,
                remarks: String::new(),
                person_id: 0,
                user_id: 0,
            })
        },
    )?;

    // Calculate values
    let discount = (total * invoice.discount) / 100.0;
    let tax = ((total - discount) * invoice.tax) / 100.0;
    let net = total - discount + tax;
    let balance = net - invoice.received;

    Ok(CartSummary {
        total,
        discount,
        tax,
        net,
        balance,
    })
}




pub fn get_invoices_by_initialize(conn: &rusqlite::Connection, id: i32) -> rusqlite::Result<Vec<InvoiceInitialize>> {
    let mut stmt = conn.prepare(
        "SELECT id, invoice_no, reference, type, date, discount, tax, 
                received, remarks, person_id, user_id 
         FROM invoices 
         WHERE id = ?1"
    )?;

    let invoices_iter = stmt.query_map(params![id], |row| {
        Ok(InvoiceInitialize {
            id: row.get(0)?,
            invoice_no: row.get(1)?,
            reference: row.get(2)?,
            invoice_type: row.get(3)?,
            date: row.get(4)?,
            discount: row.get(5)?,
            tax: row.get(6)?,
            received: row.get(7)?,
            remarks: row.get(8)?,
            person_id: row.get(9)?,
            user_id: row.get(10)?,
        })
    })?;

    let invoices = invoices_iter.filter_map(Result::ok).collect();

    Ok(invoices)
}

