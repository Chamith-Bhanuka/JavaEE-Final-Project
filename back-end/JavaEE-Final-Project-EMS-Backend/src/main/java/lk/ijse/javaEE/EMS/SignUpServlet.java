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
import java.util.Map;
import java.util.UUID;

@WebServlet("/api/v1/signup")
public class SignUpServlet extends HttpServlet {

    @Resource(name = "java:comp/env/jdbc/pool")
    private DataSource ds;

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        ObjectMapper mapper = new ObjectMapper();
        Map<String, String> user = mapper.readValue(req.getInputStream(), Map.class);

        try {
            Connection connection = ds.getConnection();

            // Fixed SQL query with correct column names
            PreparedStatement stmt = connection.prepareStatement(
                    "INSERT INTO systemusers (id, first_name, last_name, email, mobile_number, password) VALUES (?, ?, ?, ?, ?, ?)"
            );
            stmt.setString(1, UUID.randomUUID().toString());
            stmt.setString(2, user.get("uFname"));
            stmt.setString(3, user.get("uLName"));
            stmt.setString(4, user.get("uEmail"));
            stmt.setString(5, user.get("uPhone"));
            stmt.setString(6, user.get("uPassword"));

            int executed = stmt.executeUpdate();
            PrintWriter out = resp.getWriter();
            resp.setContentType("application/json");

            if (executed > 0) {
                resp.setStatus(HttpServletResponse.SC_OK);
                mapper.writeValue(out, Map.of(
                        "code","200",
                        "status","success",
                        "message","User successfully registered"
                ));
            } else {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                mapper.writeValue(out, Map.of(
                        "code", "400",
                        "status", "error",
                        "message", "User not registered"
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
