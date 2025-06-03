use rusqlite::{params, Connection, Result};
use crate::models::*;


pub fn insert_person(conn: &Connection, person: &NewPerson) -> Result<usize> {
    conn.execute(
        "INSERT INTO persons (name, role, contact, account, address, remarks, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
        params![
            person.name,
            person.role,
            person.contact,
            person.account,
            person.address,
            person.remarks,
        ],
    )
}

// pub fn get_all_persons(conn: &Connection) -> Result<Vec<Person>> {
//     let mut stmt = conn.prepare(
//         "SELECT 
//             p.id,
//             p.name,
//             p.role,
//             p.contact,
//             p.account,
//             p.address,
//             p.remarks,
//             p.created_at,
//             p.updated_at,
//             COUNT(i.id) AS invoices_no
//          FROM persons p
//          LEFT JOIN invoices i ON p.id = i.person_id
//          GROUP BY p.id
//          ORDER BY p.id DESC",
//     )?;

//     let persons = stmt.query_map([], |row| {
//         Ok(Person {
//             id: row.get(0)?,
//             name: row.get(1)?,
//             role: row.get(2)?,
//             contact: row.get(3)?,
//             account: row.get(4)?,
//             address: row.get(5)?,
//             remarks: row.get(6)?,
//             created_at: row.get(7)?,
//             updated_at: row.get(8)?,
//             invoices_no: row.get(9)?,
//         })
//     })?;

//     Ok(persons.filter_map(Result::ok).collect())
// }

pub fn get_all_persons(conn: &Connection) -> Result<Vec<Person>> {
    let mut stmt = conn.prepare(
        "SELECT 
            p.id,
            p.name,
            p.role,
            p.contact,
            p.account,
            p.address,
            p.remarks,
            p.created_at,
            p.updated_at,
            COUNT(i.id) AS invoices_no
         FROM persons p
         LEFT JOIN invoices i ON p.id = i.person_id
         GROUP BY p.id
         ORDER BY p.id DESC",
    )?;

    let persons = stmt.query_map([], |row| {
        Ok(Person {
            id: row.get(0)?,
            name: row.get(1)?,
            role: row.get(2)?,
            contact: row.get(3)?,
            account: row.get(4)?,
            address: row.get(5)?,
            remarks: row.get(6)?,
            created_at: row.get(7)?,
            updated_at: row.get(8)?,
            invoices_no: row.get(9)?,
        })
    })?;

    Ok(persons.filter_map(Result::ok).collect())
}

// pub fn get_invoices_by_person_id(conn: &Connection, person_id: i32) -> Result<Vec<PersonInvoice>> {
//     let mut stmt = conn.prepare(
//         "SELECT 
//             invoices.*, 
//             SUM((cart.qty * cart.price - cart.discount) - invoices.discount + invoices.tax) AS total
//          FROM invoices
//          INNER JOIN persons ON invoices.person_id = persons.id
//          LEFT JOIN cart ON invoices.id = cart.invoice_id
//          WHERE invoices.person_id = ?1
//          GROUP BY invoices.id, invoices.discount, invoices.tax 
//          ORDER BY invoices.id DESC",
//     )?;

//     let invoices = stmt.query_map(params![person_id], |row| {
//         Ok(PersonInvoice {
//             id: row.get(0)?,
//             invoice_no: row.get(1)?,
//             r#type: row.get(2)?,
//             date: row.get(3)?,
//             total: row.get(4)?,
//         })
//     })?;

//     Ok(invoices.filter_map(Result::ok).collect())
// }

pub fn get_invoices_by_person_id(conn: &Connection, person_id: i32) -> Result<Vec<PersonInvoice>> {
    let mut stmt = conn.prepare(
        "SELECT 
            invoices.id,
            invoices.invoice_no,
            invoices.type,
            invoices.date,
            SUM((cart.qty * cart.price - cart.discount) - invoices.discount + invoices.tax) AS total
         FROM invoices
         INNER JOIN persons ON invoices.person_id = persons.id
         LEFT JOIN cart ON invoices.id = cart.invoice_id
         WHERE invoices.person_id = ?1
         GROUP BY invoices.id, invoices.invoice_no, invoices.type, invoices.date, invoices.discount, invoices.tax
         ORDER BY invoices.id DESC",
    )?;

    let invoices = stmt.query_map(params![person_id], |row| {
        Ok(PersonInvoice {
            id: row.get(0)?,
            invoice_no: row.get(1)?,
            invoice_type: row.get(2)?,
            date: row.get(3)?,
            total: row.get(4)?,
        })
    })?;

    Ok(invoices.filter_map(Result::ok).collect())
}

pub fn update_person(conn: &Connection, person: &Person) -> Result<usize> {
    conn.execute(
        "UPDATE persons SET 
            name = ?1, 
            role = ?2, 
            contact = ?3, 
            account = ?4, 
            address = ?5, 
            remarks = ?6,
            updated_at = CURRENT_TIMESTAMP
         WHERE id = ?7",
        params![
            person.name,
            person.role,
            person.contact,
            person.account,
            person.address,
            person.remarks,
            person.id,
        ],
    )
}

pub fn delete_person(conn: &Connection, id: i32) -> Result<usize> {
    conn.execute("DELETE FROM persons WHERE id = ?1", params![id])
}

pub fn upsert_person(conn: &Connection, person: &NewPerson) -> Result<usize> {
    conn.execute(
        "INSERT INTO persons 
            (name, role, contact, account, address, remarks, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, datetime('now'), datetime('now'))
         ON CONFLICT(contact) DO UPDATE SET 
            name = excluded.name,
            role = excluded.role,
            account = excluded.account,
            address = excluded.address,
            remarks = excluded.remarks,
            updated_at = datetime('now')",
        params![
            person.name,
            person.role,
            person.contact,
            person.account,
            person.address,
            person.remarks,
        ],
    )
}