import {Roboto_Flex} from "next/font/google";
import "./globals.css";
import Nav from "./components/Nav";

const roboto = Roboto_Flex({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700"],
})

export const metadata = {
  title: "Pylot",
  description: "Made by Christian James Santos",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${roboto.class}`}
      >
        {children}
        <Nav />
      </body>
    </html>
  );
}
