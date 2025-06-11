package lk.ijse.javaEE.EMS;

import jakarta.annotation.Resource;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import javax.sql.DataSource;
import java.io.IOException;
import java.sql.Blob;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

@WebServlet("/api/v1/employees/image")
public class ImageServlet extends HttpServlet {

    @Resource(name = "java:comp/env/jdbc/pool")
    private DataSource ds;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String id = req.getParameter("id");
        if (id == null) {
            resp.sendError(HttpServletResponse.SC_BAD_REQUEST, "Missing image ID");
            return;
        }

        try (Connection conn = ds.getConnection()) {
            PreparedStatement stmt = conn.prepareStatement("SELECT photo, photo_type FROM employees WHERE id = ?");
            stmt.setInt(1, Integer.parseInt(id));
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                Blob photoBlob = rs.getBlob("photo");
                String type = rs.getString("photo_type");
                if (photoBlob != null) {
                    byte[] imageData = photoBlob.getBytes(1, (int) photoBlob.length());
                    resp.setContentType(type != null ? type : "image/jpeg");
                    resp.getOutputStream().write(imageData);
                } else {
                    resp.sendError(HttpServletResponse.SC_NOT_FOUND, "No image for this employee");
                }
            } else {
                resp.sendError(HttpServletResponse.SC_NOT_FOUND, "Employee not found");
            }
        } catch (Exception e) {
            resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Server error");
        }
    }
}
