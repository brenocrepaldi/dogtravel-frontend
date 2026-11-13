/**
 * Classes for a `side="center"` SheetContent that is a centered dialog on md+ and a bottom
 * sheet on phones (the app's pattern for focused tasks on a phone).
 */
export const BOTTOM_SHEET_ON_MOBILE = [
  "max-md:data-[side=center]:top-auto max-md:data-[side=center]:bottom-0 max-md:data-[side=center]:left-0",
  "max-md:data-[side=center]:w-full max-md:data-[side=center]:max-w-none max-md:data-[side=center]:max-h-[92dvh]",
  "max-md:data-[side=center]:translate-x-0 max-md:data-[side=center]:translate-y-0",
  "max-md:data-[side=center]:rounded-b-none max-md:data-[side=center]:border-x-0 max-md:data-[side=center]:border-b-0",
  "max-md:data-[side=center]:data-starting-style:scale-100 max-md:data-[side=center]:data-ending-style:scale-100",
  "max-md:data-[side=center]:data-starting-style:translate-y-10 max-md:data-[side=center]:data-ending-style:translate-y-10",
].join(" ");
