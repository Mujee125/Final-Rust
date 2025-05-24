// src/commands/register.rs
use tauri::{AppHandle, async_runtime::spawn_blocking, Manager};
use rusqlite::Connection;
use crate::{
    database::register::RegisterDatabase,
    models::{RegisterData, RegisterResponse},
};
use std::sync::Mutex;

#[tauri::command]
pub async fn register_user(
    app: AppHandle,
    data: RegisterData,
) -> Result<RegisterResponse, String> {
    spawn_blocking(move || {
        // Basic validation
        if data.username.is_empty() || data.email.is_empty() || data.password.is_empty() || data.adminpassword.is_empty() {
            return Ok(RegisterResponse {
                success: false,
                message: "All fields are required".to_string(),
                user_id: None,
            });
        }

        let conn = app.try_state::<Mutex<Connection>>()
            .ok_or("Database connection not available".to_string())?;
        let conn = conn.lock().unwrap();
        let register_db = RegisterDatabase::new(&conn);

        // Check if user exists
        if register_db.user_exists(&data.username, &data.email).map_err(|e| e.to_string())? {
            return Ok(RegisterResponse {
                success: false,
                message: "Username or email already exists".to_string(),
                user_id: None,
            });
        }

        // Create user
        let user_id = register_db.create_user(&data).map_err(|e| e.to_string())?;

        Ok(RegisterResponse {
            success: true,
            message: "Registration successful".to_string(),
            user_id: Some(user_id),
        })
    }).await.map_err(|e| format!("Task join error: {}", e))?
}

#[tauri::command]
pub async fn reset_register() -> RegisterData {
    RegisterData {
        username: String::new(),
        email: String::new(),
        password: String::new(),
        adminpassword: String::new(),
    }
}