use rusqlite::{params, Connection, Result};
use crate::models::*;

pub fn get_dropdown_items(conn: &Connection, table_name: &str) -> Result<Vec<DropdownItem>> {
    let query = format!("SELECT id, name FROM {} ORDER BY name ASC", table_name);
    let mut stmt = conn.prepare(&query)?;
    
    let items = stmt.query_map([], |row| {
        Ok(DropdownItem {
            id: row.get(0)?,
            name: row.get(1)?,
        })
    })?;
    
    Ok(items.filter_map(Result::ok).collect())
}

pub fn add_dropdown_item(conn: &Connection, table_name: &str, name: &str) -> Result<QueryResult> {
    let query = format!("INSERT INTO {} (name) VALUES (?)", table_name);
    let result = conn.execute(&query, params![name])?;
    
    Ok(QueryResult {
        rows_affected: result,
        last_insert_id: Some(conn.last_insert_rowid() as i32),
    })
}

pub fn update_dropdown_item(
    conn: &Connection, 
    table_name: &str, 
    id: i32, 
    name: &str
) -> Result<QueryResult> {
    let query = format!("UPDATE {} SET name = ? WHERE id = ?", table_name);
    let result = conn.execute(&query, params![name, id])?;
    
    Ok(QueryResult {
        rows_affected: result,
        last_insert_id: None,
    })
}

pub fn delete_dropdown_item(
    conn: &Connection, 
    table_name: &str, 
    id: i32
) -> Result<QueryResult> {
    let query = format!("DELETE FROM {} WHERE id = ?", table_name);
    let result = conn.execute(&query, params![id])?;
    
    Ok(QueryResult {
        rows_affected: result,
        last_insert_id: None,
    })
}