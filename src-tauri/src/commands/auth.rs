// src/commands/auth.rs
use tauri::{AppHandle, async_runtime::spawn_blocking, Manager};
use rusqlite::{Connection, params};
use crate::{
    models::{LoginRequest, LoginResponse, User},
    database::auth::AuthDatabase,
};
use std::sync::Mutex;

#[tauri::command]
pub async fn login(
    app: AppHandle,
    credentials: LoginRequest,
) -> Result<LoginResponse, String> {
    spawn_blocking(move || {
        let conn = app.state::<Mutex<Connection>>();
        let conn = conn.lock().unwrap();
        let auth_db = AuthDatabase::new(&conn);

        let user = auth_db.get_user_by_email(&credentials.email)
            .map_err(|e| e.to_string())?;

        if let Some(user) = user {
            // In production, use bcrypt or Argon2 for password hashing
            let password_matches = user.password.as_ref()
                .map(|p| p == &credentials.password)
                .unwrap_or(false);

            if password_matches {
                auth_db.update_first_login(user.id.unwrap())
                    .map_err(|e| e.to_string())?;

                auth_db.create_session(user.id.unwrap())
                    .map_err(|e| e.to_string())?;

                Ok(LoginResponse {
                    success: true,
                    is_first_login: user.first_login,
                    user: Some(user),
                })
            } else {
                Ok(LoginResponse {
                    success: false,
                    is_first_login: false,
                    user: None,
                })
            }
        } else {
            Ok(LoginResponse {
                success: false,
                is_first_login: false,
                user: None,
            })
        }
    }).await.map_err(|e| format!("Task join error: {}", e))?
}

#[tauri::command]
pub async fn logout(app: AppHandle, user_id: i32) -> Result<(), String> {
    spawn_blocking(move || {
        let conn = app.state::<Mutex<Connection>>();
        let conn = conn.lock().unwrap();
        let auth_db = AuthDatabase::new(&conn);

        auth_db.deactivate_sessions(user_id)
            .map(|_| ())
            .map_err(|e| e.to_string())
    }).await.map_err(|e| format!("Task join error: {}", e))?
}

#[tauri::command]
pub async fn load_session(app: AppHandle) -> Result<Option<User>, String> {
    spawn_blocking(move || {
        let conn = app.state::<Mutex<Connection>>();
        let conn = conn.lock().unwrap();
        let auth_db = AuthDatabase::new(&conn);

        if let Some(session) = auth_db.get_active_session().map_err(|e| e.to_string())? {
            let mut stmt = conn.prepare(
                "SELECT id, username, email, image, first_login FROM users WHERE id = ?1"
            ).map_err(|e| e.to_string())?;
            
            let mut rows = stmt.query_map(params![session.user_id], |row| {
                Ok(User {
                    id: row.get(0)?,
                    username: row.get(1)?,
                    email: row.get(2)?,
                    password: None,
                    image: row.get(3)?,
                    first_login: row.get(4)?,
                })
            }).map_err(|e| e.to_string())?;

            Ok(rows.next().transpose().map_err(|e| e.to_string())?)
        } else {
            Ok(None)
        }
    }).await.map_err(|e| format!("Task join error: {}", e))?
}