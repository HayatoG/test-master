import type { DetailedHTMLProps, HTMLAttributes } from "react";

type CustomElement = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "qa-shadow-form": CustomElement;
      "qa-shadow-outer": CustomElement;
    }
  }
}
