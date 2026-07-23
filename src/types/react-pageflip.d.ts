// src/types/react-pageflip.d.ts
declare module "react-pageflip" {
  import { Component, ReactNode } from "react";
  interface FlipBookProps {
    width: number;
    height: number;
    size?: "fixed" | "stretch";
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    className?: string;
    style?: React.CSSProperties;
    showCover?: boolean;
    children?: ReactNode;
    [key: string]: any;
  }
  export default class HTMLFlipBook extends Component<FlipBookProps> {
    pageFlip(): any;
  }
}