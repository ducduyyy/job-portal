package com.example.JobPortal.controller;

import com.example.JobPortal.dto.*;
import com.example.JobPortal.enums.AccountStatus;
import com.example.JobPortal.enums.Role;
import com.example.JobPortal.model.User;
import com.example.JobPortal.repository.UserRepository;
import com.example.JobPortal.security.JwtUtil;
import com.example.JobPortal.service.UserService;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "auth-controller", description = "Quản lý thông tin tài khoản đăng nhập")
public class AuthController {

    private final AuthenticationManager authenticationManager;

    private final UserService userService;

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    private static final String CLIENT_ID = "808589128245-5ioh3b2fdgptms21m3c78n8b8r17dbjd.apps.googleusercontent.com";


    @Autowired
    public AuthController(AuthenticationManager authenticationManager, UserService userService, UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.authenticationManager = authenticationManager;
        this.userService = userService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }


    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody @Valid UserDto userDto) {
        if (userDto.getRole() == null) {
            return ResponseEntity.badRequest().body("Role is required");
        }

        // check duplicate username
        if (userRepository.existsByUsername(userDto.getUsername())) {
            return ResponseEntity.badRequest().body("Username already taken");
        }

        // check duplicate email
        if (userRepository.existsByEmail(userDto.getEmail())) {
            return ResponseEntity.badRequest().body("Email already registered");
        }

        // lưu user và lấy lại entity
        User savedUser = userService.saveUser(userDto, userDto.getRole());

        // trả JSON về frontend
        return ResponseEntity.ok(Map.of(
                "id", savedUser.getId(),
                "username", savedUser.getUsername(),
                "email", savedUser.getEmail(),
                "password", savedUser.getPassword(),
                "role", savedUser.getRole()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        if (loginRequest.getUsername() == null || loginRequest.getPassword() == null) {
            return ResponseEntity.badRequest().body("Username/Email and password are required");
        }

        User foundUser = userRepository.findByUsername(loginRequest.getUsername())
                .orElseGet(() -> userRepository.findByEmail(loginRequest.getUsername()).orElse(null));

        if (foundUser != null && passwordEncoder.matches(loginRequest.getPassword(), foundUser.getPassword())) {

            if (foundUser.getStatus() == AccountStatus.BLOCKED) {
                return ResponseEntity.status(403).body("Your account has been blocked by admin.");
            }

            // ✅ Cập nhật lastLogin tại đây
            foundUser.setLastLogin(java.time.LocalDateTime.now());
            userRepository.save(foundUser);

            // Tạo token
            String accessToken = jwtUtil.generateAccessToken(foundUser.getUsername());
            String refreshToken = jwtUtil.generateRefreshToken(foundUser.getUsername());

            return ResponseEntity.ok(
                    new LoginResponse(accessToken, refreshToken, foundUser.getRole(), foundUser.getId())
            );
        }


        return ResponseEntity.status(401).body("Invalid credentials");
    }



    @GetMapping("/check-token")
    public ResponseEntity<?> checkToken(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("success", false));
        }

        String token = authHeader.substring(7);
        String username = jwtUtil.extractUsername(token);

        if (username == null || jwtUtil.isTokenExpired(token)) {
            return ResponseEntity.status(401).body(Map.of("success", false));
        }

        User user = userRepository.findByUsername(username)
                .orElseGet(() -> userRepository.findByEmail(username)
                        .orElseThrow(() -> new RuntimeException("User not found")));


        return ResponseEntity.ok(Map.of(
                "success", true,
                "user", Map.of(
                        "id", user.getId(),
                        "username", user.getUsername(),
                        "email", user.getEmail()
                ),
                "role", user.getRole()
        ));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");
        if (refreshToken == null) {
            return ResponseEntity.badRequest().body("Missing refresh token");
        }

        String username = jwtUtil.extractUsername(refreshToken);
        if (jwtUtil.isTokenExpired(refreshToken)) {
            return ResponseEntity.status(401).body("Refresh token expired");
        }

        String newAccessToken = jwtUtil.generateAccessToken(username);
        return ResponseEntity.ok(Map.of("accessToken", newAccessToken));
    }



    @PostMapping("/google")
    public ResponseEntity<?> loginWithGoogle(@RequestBody GoogleLoginRequest request) {
        try {
            String idTokenString = request.getCredential();

            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    JacksonFactory.getDefaultInstance()
            ).setAudience(Collections.singletonList(CLIENT_ID))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);

            if (idToken == null) {
                return ResponseEntity.status(401).body("Invalid Google token");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");


            // Tìm user theo email
            User user = userRepository.findByEmail(email).orElseGet(() -> {
                // Nếu chưa có thì tạo user mới
                User newUser = new User();
                newUser.setEmail(email);
                newUser.setStatus(AccountStatus.ACTIVE);
                newUser.setRole(null); // chưa chọn role

                // Xử lý username trùng
                String baseUsername = name != null && !name.isEmpty() ? name.trim() : email.split("@")[0];
                String username = baseUsername;
                int counter = 1;

                while (userRepository.existsByUsername(username)) {
                    username = baseUsername + "_" + counter++;
                }
                newUser.setUsername(username);
                System.out.println("✅ Created new Google user: " + username + " (" + email + ")");


                return userRepository.save(newUser);
            });

            // Kiểm tra trạng thái tài khoản
            if (user.getStatus() == AccountStatus.BLOCKED) {
                return ResponseEntity.status(403).body("Your account has been blocked by admin.");
            }

            // Tạo token
            String accessToken = jwtUtil.generateAccessToken(user.getUsername());
            String refreshToken = jwtUtil.generateRefreshToken(user.getUsername());

            boolean needRoleSelection = (user.getRole() == null);


            Map<String, Object> response = new HashMap<>();
            response.put("accessToken", accessToken);
            response.put("refreshToken", refreshToken);
            response.put("userId", user.getId());
            response.put("email", user.getEmail());
            response.put("username", user.getUsername());
            response.put("role", user.getRole());
            response.put("needRoleSelection", needRoleSelection);



            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Google login failed: " + e.getMessage());
        }
    }



    @PostMapping("/set-role")
    public ResponseEntity<?> setRole(@RequestBody Map<String, String> request) {
        Long userId = Long.parseLong(request.get("userId"));
        String roleName = request.get("role");

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setRole(Role.valueOf(roleName.toUpperCase()));
        userRepository.save(user);

        // Tạo lại token sau khi đã có role
        String accessToken = jwtUtil.generateAccessToken(user.getEmail());
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());

        return ResponseEntity.ok(
                new LoginResponse(accessToken, refreshToken, user.getRole(), user.getId())
        );
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String email) {
        try {
            userService.sendResetPasswordLink(email);
            return ResponseEntity.ok(Map.of("message", "Reset link sent to your email"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        try {
            userService.resetPassword(body.get("token"), body.get("newPassword"));
            return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }


    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> request) {

        String currentPassword = request.get("currentPassword");
        String newPassword = request.get("newPassword");

        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(Map.of("error", "Missing or invalid token"));
            }

            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);

            User user = userRepository.findByUsername(username)
                    .orElseGet(() -> userRepository.findByEmail(username)
                            .orElseThrow(() -> new RuntimeException("User not found")));

            userService.changePassword(user.getId(), currentPassword, newPassword);

            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }




}