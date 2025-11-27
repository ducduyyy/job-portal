package com.example.JobPortal.security;

import jakarta.servlet.ServletException;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtility;

    @Qualifier("customUserDetailsService")
    private final UserDetailsService userDetailsService;

    @Autowired
    public JwtAuthenticationFilter(JwtUtil jwtUtility, UserDetailsService userDetailsService) {
        this.jwtUtility = jwtUtility;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(jakarta.servlet.http.HttpServletRequest request, jakarta.servlet.http.HttpServletResponse response, jakarta.servlet.FilterChain filterChain) throws IOException, ServletException {
        // Retrieve the Authorization header from the request
        String authorizationHeader = request.getHeader("Authorization");
        String username = null;
        String jwt = null;

        // Check if the Authorization header is present and starts with 'Bearer'
        if(authorizationHeader != null && authorizationHeader.startsWith("Bearer "))
        {
            // Extract the JWT token from the header (remove the 'Bearer' prefix)
            jwt  =authorizationHeader.substring(7);
            try{
                assert jwtUtility != null;
                username = jwtUtility.extractUsername(jwt);
            }catch (Exception e){
                e.printStackTrace();
            }
        }

        // If a valid username is found and the user is not already authenticated
        if(username != null && SecurityContextHolder.getContext().getAuthentication() == null){
            assert this.userDetailsService != null;
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
            // Validate the JWT token against the user details
            if(jwtUtility.validateToken(jwt, userDetails.getUsername())) {
                // Create a new authentication token with the user details and their authorities
                UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                usernamePasswordAuthenticationToken.setDetails(new
                        WebAuthenticationDetailsSource().buildDetails(request));

                // Set the authentication context with the new token
                SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
            }
        }

        // Continue with the filter chain if authentication failed or succeeded
        filterChain.doFilter(request, response);
    }
}
