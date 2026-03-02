import NavBar from './components/NavBar';
import "./globals.css";

export const metadata = {
  title: "ToDoリスト",
  description: "Next.jsで作ったToDoアプリ",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>
        <NavBar />
        {children}
      </body>
    </html>
  );
}
