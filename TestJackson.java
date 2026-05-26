import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class TestJackson {
    public static void main(String[] args) {
        try {
            // 1. Obtener Token
            URL loginUrl = new URL("http://localhost:8080/api/usuarios/login");
            HttpURLConnection loginConn = (HttpURLConnection) loginUrl.openConnection();
            loginConn.setRequestMethod("POST");
            loginConn.setRequestProperty("Content-Type", "application/json");
            loginConn.setDoOutput(true);
            
            String payload = "{\"username\":\"admin@jerezsur.com\",\"password\":\"admin123\"}";
            try (OutputStream os = loginConn.getOutputStream()) {
                os.write(payload.getBytes());
            }
            
            InputStream is = loginConn.getInputStream();
            String loginResponse = new String(is.readAllBytes());
            String token = loginResponse.split("\"token\":\"")[1].split("\"")[0];
            System.out.println("Token obtenido: " + token.substring(0, 15) + "...");
            
            // 2. Pedir Citas
            URL dashUrl = new URL("http://localhost:8080/api/citas/todas");
            HttpURLConnection dashConn = (HttpURLConnection) dashUrl.openConnection();
            dashConn.setRequestMethod("GET");
            dashConn.setRequestProperty("Authorization", "Bearer " + token);
            
            System.out.println("Status Dashboard: " + dashConn.getResponseCode());
            
            InputStream dashIs = dashConn.getInputStream();
            System.out.println("Leyendo respuesta...");
            byte[] buffer = new byte[1024];
            int read;
            while ((read = dashIs.read(buffer)) != -1) {
                System.out.print(new String(buffer, 0, read));
            }
            System.out.println("\n--- Fin de respuesta ---");
            
        } catch (Exception e) {
            System.out.println("\nException: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
