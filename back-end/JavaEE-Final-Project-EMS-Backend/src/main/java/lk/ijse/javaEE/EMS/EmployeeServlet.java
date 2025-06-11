package lk.ijse.javaEE.EMS;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.Resource;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Part;

import javax.sql.DataSource;
import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Types;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@WebServlet("/api/v1/employees/*")
@MultipartConfig(maxFileSize = 5 * 1024 * 1024)
public class EmployeeServlet extends HttpServlet {

    @Resource(name = "java:comp/env/jdbc/pool")
    private DataSource ds;

    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String pathInfo = req.getPathInfo();

        if (pathInfo == null || pathInfo.equals("/")) {
            // Get all employees
            getAllEmployees(resp, req);
        } else {
            // Get single employee by ID
            String[] pathParts = pathInfo.split("/");
            if (pathParts.length == 2) {
                try {
                    int id = Integer.parseInt(pathParts[1]);
                    getEmployeeById(id, resp, req);
                } catch (NumberFormatException e) {
                    sendErrorResponse(resp, 400, "Invalid employee ID");
                }
            } else {
                sendErrorResponse(resp, 400, "Invalid URL format");
            }
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        createEmployee(req, resp);
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String pathInfo = req.getPathInfo();
        if (pathInfo == null || pathInfo.equals("/")) {
            sendErrorResponse(resp, 400, "Employee ID is required for update");
            return;
        }

        String[] pathParts = pathInfo.split("/");
        if (pathParts.length == 2) {
            try {
                int id = Integer.parseInt(pathParts[1]);
                updateEmployee(id, req, resp);
            } catch (NumberFormatException e) {
                sendErrorResponse(resp, 400, "Invalid employee ID");
            }
        } else {
            sendErrorResponse(resp, 400, "Invalid URL format");
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String pathInfo = req.getPathInfo();
        if (pathInfo == null || pathInfo.equals("/")) {
            sendErrorResponse(resp, 400, "Employee ID is required for deletion");
            return;
        }

        String[] pathParts = pathInfo.split("/");
        if (pathParts.length == 2) {
            try {
                int id = Integer.parseInt(pathParts[1]);
                deleteEmployee(id, resp);
            } catch (NumberFormatException e) {
                sendErrorResponse(resp, 400, "Invalid employee ID");
            }
        } else {
            sendErrorResponse(resp, 400, "Invalid URL format");
        }
    }

    private void getAllEmployees(HttpServletResponse resp, HttpServletRequest req) throws IOException {
        try (Connection conn = ds.getConnection()) {
            PreparedStatement stmt = conn.prepareStatement("SELECT * FROM employees ORDER BY id");
            ResultSet rs = stmt.executeQuery();

            List<Map<String, Object>> employees = new ArrayList<>();
            while (rs.next()) {
                Map<String, Object> emp = new HashMap<>();
                emp.put("id", rs.getInt("id"));
                emp.put("name", rs.getString("full_name"));
                emp.put("mobile", rs.getString("mobile"));
                emp.put("address", rs.getString("address"));
                emp.put("department", rs.getString("department"));
                emp.put("status", rs.getString("status"));

                // Check if photo exists
                if (rs.getBlob("photo") != null) {
                    emp.put("photoUrl", req.getContextPath() + "/api/v1/employees/image?id=" + rs.getInt("id"));
                    System.out.println("Generated photoUrl: " + req.getContextPath() + "/api/v1/employees/image?id=" + rs.getInt("id"));
                } else {
                    emp.put("photoUrl", null);
                }
                employees.add(emp);
            }

            resp.setContentType("application/json");
            resp.setCharacterEncoding("UTF-8");
            mapper.writeValue(resp.getWriter(), employees);
        } catch (Exception e) {
            sendErrorResponse(resp, 500, "Error retrieving employees: " + e.getMessage());
        }
    }

    private void getEmployeeById(int id, HttpServletResponse resp, HttpServletRequest req) throws IOException {
        try (Connection conn = ds.getConnection()) {
            PreparedStatement stmt = conn.prepareStatement("SELECT * FROM employees WHERE id = ?");
            stmt.setInt(1, id);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                Map<String, Object> emp = new HashMap<>();
                emp.put("id", rs.getInt("id"));
                emp.put("name", rs.getString("full_name"));
                emp.put("mobile", rs.getString("mobile"));
                emp.put("address", rs.getString("address"));
                emp.put("department", rs.getString("department"));
                emp.put("status", rs.getString("status"));

                if (rs.getBlob("photo") != null) {
                    emp.put("photoUrl", req.getContextPath() + "/api/v1/employees/image?id=" + rs.getInt("id"));
                } else {
                    emp.put("photoUrl", null);
                }

                resp.setContentType("application/json");
                resp.setCharacterEncoding("UTF-8");
                mapper.writeValue(resp.getWriter(), emp);
            } else {
                sendErrorResponse(resp, 404, "Employee not found");
            }
        } catch (Exception e) {
            sendErrorResponse(resp, 500, "Error retrieving employee: " + e.getMessage());
        }
    }

    private void createEmployee(HttpServletRequest req, HttpServletResponse resp) throws IOException, ServletException {
        String fullName = req.getParameter("employeeName");
        String mobile = req.getParameter("employeeMobile");
        String address = req.getParameter("employeeAddress");
        String department = req.getParameter("employeeDepartment");
        String status = req.getParameter("employeeStatus");
        Part photoPart = req.getPart("employeePhoto");

        // Validate required fields
        if (fullName == null || fullName.trim().isEmpty() ||
                mobile == null || mobile.trim().isEmpty() ||
                address == null || address.trim().isEmpty() ||
                department == null || department.trim().isEmpty() ||
                status == null || status.trim().isEmpty()) {
            sendErrorResponse(resp, 400, "All fields are required");
            return;
        }

        try (Connection conn = ds.getConnection()) {
            PreparedStatement stmt = conn.prepareStatement(
                    "INSERT INTO employees (full_name, mobile, address, department, status, photo, photo_type) VALUES (?, ?, ?, ?, ?, ?, ?)"
            );
            stmt.setString(1, fullName.trim());
            stmt.setString(2, mobile.trim());
            stmt.setString(3, address.trim());
            stmt.setString(4, department.trim());
            stmt.setString(5, status.trim());

            if (photoPart != null && photoPart.getSize() > 0) {
                stmt.setBlob(6, photoPart.getInputStream());
                stmt.setString(7, photoPart.getContentType());
            } else {
                stmt.setNull(6, Types.BLOB);
                stmt.setNull(7, Types.VARCHAR);
            }

            int rows = stmt.executeUpdate();
            if (rows > 0) {
                sendSuccessResponse(resp, 201, "Employee created successfully");
            } else {
                sendErrorResponse(resp, 400, "Failed to create employee");
            }
        } catch (Exception e) {
            sendErrorResponse(resp, 500, "Error creating employee: " + e.getMessage());
        }
    }

    private void updateEmployee(int id, HttpServletRequest req, HttpServletResponse resp) throws IOException, ServletException {
        String fullName = req.getParameter("employeeName");
        String mobile = req.getParameter("employeeMobile");
        String address = req.getParameter("employeeAddress");
        String department = req.getParameter("employeeDepartment");
        String status = req.getParameter("employeeStatus");
        Part photoPart = req.getPart("employeePhoto");

        // Validate required fields
        if (fullName == null || fullName.trim().isEmpty() ||
                mobile == null || mobile.trim().isEmpty() ||
                address == null || address.trim().isEmpty() ||
                department == null || department.trim().isEmpty() ||
                status == null || status.trim().isEmpty()) {
            sendErrorResponse(resp, 400, "All fields are required");
            return;
        }

        try (Connection conn = ds.getConnection()) {
            // Check if employee exists
            PreparedStatement checkStmt = conn.prepareStatement("SELECT id FROM employees WHERE id = ?");
            checkStmt.setInt(1, id);
            ResultSet rs = checkStmt.executeQuery();

            if (!rs.next()) {
                sendErrorResponse(resp, 404, "Employee not found");
                return;
            }

            PreparedStatement stmt;
            if (photoPart != null && photoPart.getSize() > 0) {
                // Update with new photo
                stmt = conn.prepareStatement(
                        "UPDATE employees SET full_name = ?, mobile = ?, address = ?, department = ?, status = ?, photo = ?, photo_type = ? WHERE id = ?"
                );
                stmt.setString(1, fullName.trim());
                stmt.setString(2, mobile.trim());
                stmt.setString(3, address.trim());
                stmt.setString(4, department.trim());
                stmt.setString(5, status.trim());
                stmt.setBlob(6, photoPart.getInputStream());
                stmt.setString(7, photoPart.getContentType());
                stmt.setInt(8, id);
            } else {
                // Update without changing photo
                stmt = conn.prepareStatement(
                        "UPDATE employees SET full_name = ?, mobile = ?, address = ?, department = ?, status = ? WHERE id = ?"
                );
                stmt.setString(1, fullName.trim());
                stmt.setString(2, mobile.trim());
                stmt.setString(3, address.trim());
                stmt.setString(4, department.trim());
                stmt.setString(5, status.trim());
                stmt.setInt(6, id);
            }

            int rows = stmt.executeUpdate();
            if (rows > 0) {
                sendSuccessResponse(resp, 200, "Employee updated successfully");
            } else {
                sendErrorResponse(resp, 400, "Failed to update employee");
            }
        } catch (Exception e) {
            sendErrorResponse(resp, 500, "Error updating employee: " + e.getMessage());
        }
    }

    private void deleteEmployee(int id, HttpServletResponse resp) throws IOException {
        try (Connection conn = ds.getConnection()) {
            // Check if employee exists
            PreparedStatement checkStmt = conn.prepareStatement("SELECT id FROM employees WHERE id = ?");
            checkStmt.setInt(1, id);
            ResultSet rs = checkStmt.executeQuery();

            if (!rs.next()) {
                sendErrorResponse(resp, 404, "Employee not found");
                return;
            }

            PreparedStatement stmt = conn.prepareStatement("DELETE FROM employees WHERE id = ?");
            stmt.setInt(1, id);
            int rows = stmt.executeUpdate();

            if (rows > 0) {
                sendSuccessResponse(resp, 200, "Employee deleted successfully");
            } else {
                sendErrorResponse(resp, 400, "Failed to delete employee");
            }
        } catch (Exception e) {
            sendErrorResponse(resp, 500, "Error deleting employee: " + e.getMessage());
        }
    }

    private void sendSuccessResponse(HttpServletResponse resp, int statusCode, String message) throws IOException {
        resp.setStatus(statusCode);
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        mapper.writeValue(resp.getWriter(), Map.of(
                "code", String.valueOf(statusCode),
                "status", "success",
                "message", message
        ));
    }

    private void sendErrorResponse(HttpServletResponse resp, int statusCode, String message) throws IOException {
        resp.setStatus(statusCode);
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        mapper.writeValue(resp.getWriter(), Map.of(
                "code", String.valueOf(statusCode),
                "status", "error",
                "message", message
        ));
    }
}