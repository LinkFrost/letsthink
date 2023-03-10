const Spinner = ({ shade = 50, size = 9 }: { shade?: number; size?: number }) => {
  return (
    <svg className={`h-${size} w-${size} shrink-0 animate-spin text-neutral-${shade}`} viewBox="0 0 24 24">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
};

export default Spinner;
