use rusqlite::{Connection, Result};
use crate::schema::*;

pub fn establish_connection() -> Result<Connection> {
    let conn = Connection::open("zostikposdb.db")?;
    conn.execute("PRAGMA foreign_keys = ON;", [])?;
    Ok(conn)
}

pub fn initialize_database() -> Result<()> {
    let conn = establish_connection()?;
    for table_sql in CREATE_TABLES.iter() {
        conn.execute(table_sql, [])?;
    }
    Ok(())
}