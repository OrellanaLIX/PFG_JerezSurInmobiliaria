package com.jerezsur.inmobiliaria.dto;

public class LoginRequest {
    private String username; // Este es el 'identifier' de React
    private String password;

    // Getters y Setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}