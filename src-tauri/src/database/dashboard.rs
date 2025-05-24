// src/database/dashboard.rs
use rusqlite::{ Connection, Result};
use crate::models::{DashboardStats, DailyStat};

pub struct DashboardDatabase<'a> {
    pub conn: &'a Connection,
}

impl<'a> DashboardDatabase<'a> {
    pub fn new(conn: &'a Connection) -> Self {
        Self { conn }
    }

    pub fn get_dashboard_stats(&self) -> Result<DashboardStats> {
        let query = "
            SELECT
                (SELECT COALESCE(SUM(((c.qty * c.price) - c.discount) - i.discount + i.tax), 0)
                 FROM invoices i
                 JOIN cart c ON i.id = c.invoice_id
                 WHERE i.type = 'Sale' AND DATE(i.date) = DATE('now')) AS today_total_sale,
                
                (SELECT COALESCE(SUM(((c.qty * c.price) - c.discount) - i.discount + i.tax), 0)
                 FROM invoices i
                 JOIN cart c ON i.id = c.invoice_id
                 WHERE i.type = 'Purchase' AND DATE(i.date) = DATE('now')) AS today_total_purchase,
                
                (SELECT COALESCE(SUM(((c.qty * c.price) - c.discount) - i.discount + i.tax), 0)
                 FROM invoices i
                 JOIN cart c ON i.id = c.invoice_id
                 WHERE i.type = 'Sale' AND strftime('%m', i.date) = strftime('%m', 'now') 
                 AND strftime('%Y', i.date) = strftime('%Y', 'now')) AS this_month_total_sale,
                
                (SELECT COALESCE(SUM(((c.qty * c.price) - c.discount) - i.discount + i.tax), 0)
                 FROM invoices i
                 JOIN cart c ON i.id = c.invoice_id
                 WHERE i.type = 'Purchase' AND strftime('%m', i.date) = strftime('%m', 'now') 
                 AND strftime('%Y', i.date) = strftime('%Y', 'now')) AS this_month_total_purchase,
                
                (SELECT COUNT(*) FROM stock) AS total_items_registered,
                
                (SELECT COUNT(*) FROM stock WHERE qty < min_qty) AS low_stock_items,
                
                (SELECT COUNT(*) FROM stock WHERE expiry < DATE('now')) AS expired_items;
        ";

        self.conn.query_row(query, [], |row| {
            Ok(DashboardStats {
                today_total_sale: row.get(0)?,
                today_total_purchase: row.get(1)?,
                this_month_total_sale: row.get(2)?,
                this_month_total_purchase: row.get(3)?,
                total_items_registered: row.get(4)?,
                low_stock_items: row.get(5)?,
                expired_items: row.get(6)?,
            })
        })
    }

    pub fn get_daily_stats(&self) -> Result<Vec<DailyStat>> {
        let query = "
            WITH RECURSIVE last_31_days AS (
                SELECT DATE('now') AS date
                UNION ALL
                SELECT DATE(date, '-1 day')
                FROM last_31_days
                WHERE date > DATE('now', '-30 day')
            )
            SELECT
                d.date,
                COALESCE(SUM(CASE WHEN i.type = 'Sale' THEN c.qty * c.price - c.discount ELSE 0 END), 0) AS sale,
                COALESCE(SUM(CASE WHEN i.type = 'Purchase' THEN c.qty * c.price - c.discount ELSE 0 END), 0) AS purchase
            FROM last_31_days d
            LEFT JOIN invoices i ON d.date = DATE(i.date)
            LEFT JOIN cart c ON i.id = c.invoice_id
            GROUP BY d.date
            ORDER BY d.date;
        ";

        let mut stmt = self.conn.prepare(query)?;
        let rows = stmt.query_map([], |row| {
            Ok(DailyStat {
                date: row.get(0)?,
                sale: row.get(1)?,
                purchase: row.get(2)?,
            })
        })?;

        rows.collect()
    }
}