package com.investup.api.service;

import com.investup.api.dto.request.LoginRequest;
import com.investup.api.dto.request.RegisterRequest;
import com.investup.api.dto.response.AuthResponse;
import com.investup.api.entity.User;
import com.investup.api.exception.EmailAlreadyExistsException;
import com.investup.api.repository.UserRepository;
import com.investup.api.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    // ── Cadastro de novo usuário
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("E-mail já cadastrado: " + request.getEmail());
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .lastLoginAt(LocalDateTime.now())
                .build();

        userRepository.save(user);
        log.info("Novo usuário cadastrado: {}", user.getEmail());

        String token = jwtService.generateToken(user);
        return AuthResponse.of(token, user);
    }

    // ── Login
    @Transactional
    public AuthResponse login(LoginRequest request) {
        // AuthenticationManager valida email + senha (lança exceção se inválido)
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().toLowerCase(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        // Atualiza último login
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        log.info("Login realizado: {}", user.getEmail());

        String token = jwtService.generateToken(user);
        return AuthResponse.of(token, user);
    }
}
