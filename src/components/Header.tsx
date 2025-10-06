// src/components/Header.tsx
import { Navbar } from "./ui/organisms/navbar";
type HeaderProps = {
  setShowSearch?: (val: boolean) => void; // optional
};
export default function Header({ setShowSearch }: HeaderProps) {
  return (

    <header className="sticky top-0 left-0 w-full z-50">
      <Navbar setShowSearch={setShowSearch} />

    </header>
  );
}
