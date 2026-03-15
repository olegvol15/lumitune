import type { ImgHTMLAttributes } from "react";

export interface SongCoverImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src?: string;
  fallbackLabel?: string;
}
