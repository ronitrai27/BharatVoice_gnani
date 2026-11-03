export function AuthShowcase() {
  return (
    <div className="relative hidden h-[calc(100vh-1.5rem)] overflow-hidden rounded-3xl lg:block">
      {/* biome-ignore lint/performance/noImgElement: remote Unsplash photo */}
      <img
        src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1400&q=80"
        alt=""
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/30" />

      <figure className="absolute inset-x-0 top-1/2 mx-auto max-w-sm -translate-y-1/2 px-8 text-center text-white">
        <blockquote className="font-serif text-2xl leading-snug">
          &ldquo;Customers message us at midnight and still get a reply in
          Hindi. I stopped worrying about missed orders.&rdquo;
        </blockquote>
        <figcaption className="mt-6 flex flex-col items-center gap-2">
          {/* biome-ignore lint/performance/noImgElement: remote avatar */}
          <img
            src="https://i.pravatar.cc/120?img=15"
            alt="Ramesh Gupta"
            className="size-12 rounded-full border-2 border-white/70 object-cover"
          />
          <span className="text-sm font-medium">Ramesh Gupta</span>
          <span className="text-xs text-white/70">
            Owner, Gupta General Store, Jaipur
          </span>
        </figcaption>
      </figure>
    </div>
  );
}
