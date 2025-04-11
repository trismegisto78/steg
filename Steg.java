import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.*;

public class Steg {

    
    public static void hide(String percorsoImmagineInput, String txt, String imgout) throws Exception {
        BufferedImage image = ImageIO.read(new File(percorsoImmagineInput));
        byte[] fileBytes = leggiFile(percorsoTesto);
        byte[] lunghezza = intToBytes(fileBytes.length);
        byte[] datiFinali = new byte[lunghezza.length + fileBytes.length];

        System.arraycopy(lunghezza, 0, datiFinali, 0, lunghezza.length);
        System.arraycopy(fileBytes, 0, datiFinali, lunghezza.length, fileBytes.length);

        if (datiFinali.length * 8 > image.getWidth() * image.getHeight()) {
            throw new IllegalArgumentException("piccola");
        }

        int bitIndex = 0;
        for (int y = 0; y < image.getHeight(); y++) {
            for (int x = 0; x < image.getWidth(); x++) {
                if (bitIndex >= datiFinali.length * 8) break;
                int rgb = image.getRGB(x, y);
                int bit = (datiFinali[bitIndex / 8] >> (7 - (bitIndex % 8))) & 1;
                int newRgb = (rgb & 0xFFFFFFFE) | bit; // set LSB
                image.setRGB(x, y, newRgb);
                bitIndex++;
            }
        }

        ImageIO.write(image, "png", new File(percorsoImmagineOutput));
    }

   
    public static void estraiTesto(String imgin, String outx) throws Exception {
        BufferedImage image = ImageIO.read(new File(patimg));

        int bitIndex = 0;
        byte[] lunghezzaBytes = new byte[4];

        for (int i = 0; i < 32; i++) {
            int x = (bitIndex % image.getWidth());
            int y = (bitIndex / image.getWidth());
            int rgb = image.getRGB(x, y);
            int bit = rgb & 1;
            lunghezzaBytes[i / 8] = (byte)((lunghezzaBytes[i / 8] << 1) | bit);
            bitIndex++;
        }

        int lunghezza = bytesToInt(lunghezzaBytes);
        byte[] fileBytes = new byte[lunghezza];

        for (int i = 0; i < lunghezza * 8; i++) {
            int x = (bitIndex % image.getWidth());
            int y = (bitIndex / image.getWidth());
            int rgb = image.getRGB(x, y);
            int bit = rgb & 1;
            fileBytes[i / 8] = (byte)((fileBytes[i / 8] << 1) | bit);
            bitIndex++;
        }

        try (FileOutputStream fos = new FileOutputStream(percorsoOutputTesto)) {
            fos.write(fileBytes);
        }
    }

    // Metodi di utilità
    private static byte[] leggiFile(String path) throws IOException {
        return java.nio.file.Files.readAllBytes(new File(path).toPath());
    }

    private static byte[] intToBytes(int value) {
        return new byte[] {
            (byte)(value >>> 24),
            (byte)(value >>> 16),
            (byte)(value >>> 8),
            (byte)value
        };
    }

    private static int bytesToInt(byte[] bytes) {
        return ((bytes[0] & 0xFF) << 24) |
               ((bytes[1] & 0xFF) << 16) |
               ((bytes[2] & 0xFF) << 8)  |
               (bytes[3] & 0xFF);
    }

    // Esempio di utilizzo
    public static void main(String[] args) throws Exception {

    }
}
