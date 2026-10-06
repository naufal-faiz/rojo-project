declare module "*.svg" {
  import type { FunctionComponent, SVGProps } from "react";

  const SvgIcon: FunctionComponent<SVGProps<SVGSVGElement>>;

  export default SvgIcon;
}
