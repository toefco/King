export default function HeroText() {
  return (
    <div className="relative z-10 text-center pointer-events-none">
      <div className="mb-4">
        <span className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-400/30 text-indigo-300 text-sm font-medium tracking-wider">
          WELCOME TO
        </span>
      </div>
      
      <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-4">
        <span className="bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent">
          Mingyue
        </span>
        <br />
        <span className="bg-gradient-to-r from-purple-300 via-indigo-300 to-white bg-clip-text text-transparent">
          Ma
        </span>
      </h1>
      
      <div className="mt-6">
        <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent"></div>
        <p className="mt-4 text-indigo-200/70 text-lg tracking-widest uppercase">
          Digital Artist & Creative Developer
        </p>
      </div>
      
      <div className="mt-12 flex justify-center gap-4">
        <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></div>
        <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
      </div>
    </div>
  );
}
