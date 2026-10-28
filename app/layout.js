import "./globals.css";

export const metadata = {
  title: "Idea Generator",
  description: "Generate creative ideas with AI.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <footer>Co-Created with ❤️ with a special friends.</footer>
      </body>
    </html>
  );
}
