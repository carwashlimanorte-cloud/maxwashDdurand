import "./globals.css";

export const metadata = {
  title: "MaxWash D'Durand",
  description: "Control de lavados, tienda y cambio de aceite",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
