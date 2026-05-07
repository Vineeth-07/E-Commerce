package com.ecommerce.sportscenter.controller;

import com.ecommerce.sportscenter.model.JwtRequest;
import com.ecommerce.sportscenter.model.JwtResponse;
import com.ecommerce.sportscenter.model.RegisterRequest;
import com.ecommerce.sportscenter.security.JwtHelper;
import com.ecommerce.sportscenter.service.UserAccountService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserAccountService userAccountService;
    private final AuthenticationManager manager;
    private final JwtHelper jwtHelper;

    public AuthController(UserAccountService userAccountService, AuthenticationManager manager, JwtHelper jwtHelper) {
        this.userAccountService = userAccountService;
        this.manager = manager;
        this.jwtHelper = jwtHelper;
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@RequestBody JwtRequest request){
        this.authenticate(request.getUsername(), request.getPassword());
        UserDetails userDetails = userAccountService.loadUserByUsername(request.getUsername());
        String token = this.jwtHelper.generateToken(userDetails);
        JwtResponse response = JwtResponse.builder()
                .username(userDetails.getUsername())
                .token(token)
                .build();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/register")
    public ResponseEntity<JwtResponse> register(@RequestBody RegisterRequest request) {
        UserDetails userDetails = userAccountService.register(request);
        String token = jwtHelper.generateToken(userDetails);
        JwtResponse response = JwtResponse.builder()
                .username(userDetails.getUsername())
                .token(token)
                .build();
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/user")
    public ResponseEntity<UserDetails> getUserDetails(@RequestHeader("Authorization") String tokenHeader){
        String token = extractTokenFromHeader(tokenHeader);
        if(token!=null){
            String username = jwtHelper.getUserNameFromToken(token);
            UserDetails userDetails = userAccountService.loadUserByUsername(username);
            return new ResponseEntity<>(userDetails, HttpStatus.OK);
        }else{
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    private String extractTokenFromHeader(String tokenHeader) {
        if(tokenHeader!=null && tokenHeader.startsWith("Bearer ")){
            return tokenHeader.substring(7); // Removing Bearer
        }
        return null;
    }

    private void authenticate(String username, String password) {
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(username, password);
        try{
            manager.authenticate(authenticationToken);
        }
        catch(BadCredentialsException ex){
            throw new BadCredentialsException("Invalid UserName or Password");
        }
    }
}
