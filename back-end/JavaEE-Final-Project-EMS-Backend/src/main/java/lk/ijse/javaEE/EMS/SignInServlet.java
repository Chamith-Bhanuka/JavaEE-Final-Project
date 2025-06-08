package lk.ijse.javaEE.EMS;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.Resource;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import javax.sql.DataSource;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.Map;

@WebServlet("/api/v1/signin")
public class SignInServlet extends HttpServlet {

    @Resource(name = "java:comp/env/jdbc/pool")
    private DataSource ds;

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        ObjectMapper mapper = new ObjectMapper();
        Map<String, String> user = mapper.readValue(req.getInputStream(), Map.class);

        //User Sign In Logic
        String email = user.get("uemail");
        String password = user.get("upassword");
        System.out.println("email: " + email + ", password: " + password);

        try {
            Connection connection = ds.getConnection();

            // Fixed SQL query with correct column names
            PreparedStatement stmt = connection.prepareStatement(
                    "SELECT * FROM systemusers WHERE email=? AND password=?"
            );

            stmt.setString(1, email);
            stmt.setString(2, password);

            ResultSet rs = stmt.executeQuery();
            resp.setContentType("application/json");
            PrintWriter out = resp.getWriter();


            if (rs.next()) {
                resp.setStatus(HttpServletResponse.SC_OK);
                mapper.writeValue(out, Map.of(
                        "code","200",
                        "status","success",
                        "message","You have been logged in successfully"
                ));
            } else {
                resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                mapper.writeValue(out, Map.of(
                        "code", "401",
                        "status", "Unauthorized",
                        "message", "Unauthorized Behaviour"
                ));
            }
            connection.close();
        } catch (Exception e) {
            PrintWriter out = resp.getWriter();
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            mapper.writeValue(out, Map.of(
                    "code","500",
                    "status", "error",
                    "message", "Internal Server Error!"
            ));
            throw new RuntimeException(e);
        }
    }
}
