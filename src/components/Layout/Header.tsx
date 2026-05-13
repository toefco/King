import { DataManager } from './DataManager';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex justify-end items-center px-4 py-2 pointer-events-none">
      <div className="pointer-events-auto">
        <DataManager />
      </div>
    </header>
  );
}
