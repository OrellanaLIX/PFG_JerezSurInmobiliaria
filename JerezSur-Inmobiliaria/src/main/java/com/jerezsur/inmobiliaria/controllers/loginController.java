package com.jerezsur.inmobiliaria.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@Controller
public class loginController {
    
    @GetMapping("/completarperfil")
    public String getMethodName(@RequestParam String param) {
        return "completarPerfil";
    }
    





}
